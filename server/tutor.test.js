import { describe, expect, it, vi } from 'vitest'
import { buildChatRequest, buildControlRequest, chatContents, ensureControlLine, readChatInput } from './tutor.js'

// Runs text chunks through a TransformStream and returns everything that comes out.
async function pipe(chunks, transform) {
  const reader = ReadableStream.from(chunks).pipeThrough(transform).getReader()
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return out
    out += value
  }
}

describe('ensureControlLine', () => {
  const control = { advance: true, understood: 'yes', passageIds: ['p1'] }

  it('passes a reply with a control line through untouched', async () => {
    const requestControl = vi.fn()
    const reply = ['Great! ', '<<<CONTROL>>>{"advance": true}']
    expect(await pipe(reply, ensureControlLine(requestControl))).toBe(reply.join(''))
    expect(requestControl).not.toHaveBeenCalled()
  })

  it('asks for the control data when the model forgot it, and appends it', async () => {
    const requestControl = vi.fn().mockResolvedValue(control)
    const out = await pipe(['Great ', 'job!'], ensureControlLine(requestControl))
    expect(requestControl).toHaveBeenCalledWith('Great job!')
    expect(out).toBe(`Great job!\n<<<CONTROL>>>${JSON.stringify(control)}`)
  })

  it('leaves the reply as it is when that request fails too', async () => {
    const out = await pipe(['Great job!'], ensureControlLine(vi.fn().mockRejectedValue(new Error('busy'))))
    expect(out).toBe('Great job!')
  })

  it('does not ask for control data for an empty reply', async () => {
    const requestControl = vi.fn()
    await pipe([' '], ensureControlLine(requestControl))
    expect(requestControl).not.toHaveBeenCalled()
  })
})

const plan = {
  title: 'Cells',
  language: 'French',
  steps: [
    { title: 'What is a cell', objective: 'o1', passageIds: ['p1'], question: 'q1' },
    { title: 'Energy', objective: 'o2', passageIds: ['p2'], question: 'q2' },
  ],
}

const input = (overrides) =>
  readChatInput({
    teacherPrompt: 'Teach 7th graders in French',
    plan,
    stepIndex: 0,
    progress: { attempts: 0, understood: null },
    passages: [{ id: 'p1', page: 1, text: 'Cells are the unit of life.' }],
    messages: [],
    opening: true,
    lastAttempt: false,
    ...overrides,
  })

const roles = (contents) => contents.map((c) => c.role)

describe('chatContents', () => {
  it('adds an app note when the tutor opens with no history', () => {
    const contents = chatContents([], 'Start the lesson.')
    expect(roles(contents)).toEqual(['user'])
    expect(contents[0].parts[0].text).toContain('[Start the lesson.]')
  })

  it('starts and ends with the user and merges back-to-back tutor messages', () => {
    const contents = chatContents(
      [
        { role: 'tutor', text: 'Well done!' },
        { role: 'tutor', text: 'Now, energy.' },
      ],
      '',
    )
    expect(roles(contents)).toEqual(['user', 'model', 'user'])
    expect(contents[1].parts[0].text).toBe('Well done!\n\nNow, energy.')
    expect(contents[2].parts[0].text).toBe('[Continue the lesson.]')
  })

  it("keeps the student's answer last and adds the turn's note to it", () => {
    const contents = chatContents(
      [
        { role: 'tutor', text: 'What is a cell?' },
        { role: 'student', text: 'A tiny room?' },
      ],
      'Last try.',
    )
    expect(roles(contents)).toEqual(['user', 'model', 'user'])
    expect(contents[2].parts[0].text).toBe('A tiny room?\n\n[Last try.]')
  })

  it('skips empty (stopped) messages', () => {
    const contents = chatContents([{ role: 'tutor', text: '' }, { role: 'student', text: 'Hi' }], '')
    expect(roles(contents)).toEqual(['user'])
  })
})

describe('buildChatRequest', () => {
  it('puts the teacher prompt, current step and its passages in the system instruction', () => {
    const system = buildChatRequest(input()).systemInstruction.parts[0].text
    expect(system).toContain('Teach 7th graders in French')
    expect(system).toContain('Current step 1 of 2: What is a cell')
    expect(system).toContain('<passage id="p1" page="1">')
    expect(system).toContain('<<<CONTROL>>>')
  })

  it('reminds the tutor not to answer its own opening question', () => {
    const note = buildChatRequest(input()).contents.at(-1).parts[0].text
    expect(note).toContain("don't name or explain its answer")
  })

  it('reminds the tutor not to reveal the answer to a wrong attempt', () => {
    const request = buildChatRequest(input({ opening: false, messages: [{ role: 'student', text: 'a molecule?' }] }))
    expect(request.contents.at(-1).parts[0].text).toContain('do not say the right answer')
  })

  it('asks for a recap on the last step and a move-on after the last attempt', () => {
    const request = buildChatRequest(input({ stepIndex: 1, opening: false, lastAttempt: true, messages: [{ role: 'student', text: 'no idea' }] }))
    const note = request.contents.at(-1).parts[0].text
    expect(note).toContain('explain the answer clearly')
    expect(note).toContain('recap')
  })
})

describe('buildControlRequest', () => {
  it('adds the reply as the tutor turn and asks for JSON control data only', () => {
    const request = buildControlRequest(input({ opening: false, messages: [{ role: 'student', text: 'cells?' }] }), 'Yes, cells!')
    expect(request.contents.map((c) => c.role)).toEqual(['user', 'model', 'user'])
    expect(request.contents[1].parts[0].text).toBe('Yes, cells!')
    expect(request.contents[2].parts[0].text).toContain('give only the control data')
    expect(request.generationConfig.responseMimeType).toBe('application/json')
  })
})

describe('readChatInput', () => {
  it('rejects a step index outside the plan', () => {
    expect(() => input({ stepIndex: 5 })).toThrow()
  })

  it('rejects unknown message roles', () => {
    expect(() => input({ messages: [{ role: 'system', text: 'hi' }] })).toThrow()
  })
})
