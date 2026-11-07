// The tutor ends each reply with a hidden control line:
//   <<<CONTROL>>>{"advance": true, "understood": "yes", "passageIds": ["p3"]}
// These pure functions separate it from the text the student sees.

export const CONTROL_SENTINEL = '<<<CONTROL>>>'

const UNDERSTOOD = ['yes', 'partial', 'no']

// While streaming: everything before the control line, also hiding a control line
// that has only partly arrived (e.g. the text so far ends in "<<<CON").
export function visibleText(raw) {
  const index = raw.indexOf(CONTROL_SENTINEL)
  if (index >= 0) return raw.slice(0, index).trimEnd()
  for (let length = CONTROL_SENTINEL.length - 1; length > 0; length--) {
    if (raw.endsWith(CONTROL_SENTINEL.slice(0, length))) return raw.slice(0, -length).trimEnd()
  }
  return raw
}

// When the reply is complete: the visible text plus the parsed control signal.
// A missing or malformed control line gives control = null ("don't advance").
export function splitControl(raw) {
  const index = raw.indexOf(CONTROL_SENTINEL)
  if (index < 0) return { text: raw.trim(), control: null }
  return {
    text: raw.slice(0, index).trim(),
    control: parseControl(raw.slice(index + CONTROL_SENTINEL.length)),
  }
}

function parseControl(rest) {
  const json = rest.match(/\{[\s\S]*\}/)?.[0]
  let data
  try {
    data = JSON.parse(json)
  } catch {
    return null
  }
  return {
    advance: data.advance === true,
    understood: UNDERSTOOD.includes(data.understood) ? data.understood : null,
    passageIds: Array.isArray(data.passageIds) ? data.passageIds.filter((id) => typeof id === 'string') : [],
  }
}
