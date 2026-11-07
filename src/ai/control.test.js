import { describe, expect, it } from 'vitest'
import { splitControl, visibleText } from './control.js'

const reply = 'Great job! What does the nucleus hold?'
const control = '<<<CONTROL>>>{"advance": true, "understood": "yes", "passageIds": ["p2"]}'

describe('splitControl', () => {
  it('separates the visible text from the control signal', () => {
    expect(splitControl(`${reply}\n${control}`)).toEqual({
      text: reply,
      control: { advance: true, understood: 'yes', passageIds: ['p2'] },
    })
  })

  it('gives control = null when the control line is missing', () => {
    expect(splitControl(reply)).toEqual({ text: reply, control: null })
  })

  it('gives control = null when the JSON is broken', () => {
    expect(splitControl(`${reply}\n<<<CONTROL>>>{"advance": tru`).control).toBeNull()
  })

  it('accepts JSON wrapped in a code fence', () => {
    const fenced = `${reply}\n<<<CONTROL>>>\n\`\`\`json\n{"advance": false, "understood": "partial", "passageIds": []}\n\`\`\``
    expect(splitControl(fenced).control).toEqual({ advance: false, understood: 'partial', passageIds: [] })
  })

  it('only treats a literal true as advancing and drops unknown values', () => {
    const odd = `${reply}\n<<<CONTROL>>>{"advance": "yes", "understood": "maybe", "passageIds": ["p1", 3]}`
    expect(splitControl(odd).control).toEqual({ advance: false, understood: null, passageIds: ['p1'] })
  })
})

describe('visibleText', () => {
  it('hides the control line once it starts arriving', () => {
    expect(visibleText(`${reply}\n${control}`)).toBe(reply)
    expect(visibleText(`${reply}\n<<<CONTR`)).toBe(reply)
    expect(visibleText(`${reply}\n<`)).toBe(reply)
  })

  it('leaves normal text alone', () => {
    expect(visibleText('Is 3 < 5?')).toBe('Is 3 < 5?')
  })
})
