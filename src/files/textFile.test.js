import { describe, expect, it } from 'vitest'
import { decodeText } from './textFile.js'

describe('decodeText', () => {
  it('reads UTF-8 as is', () => {
    const bytes = new TextEncoder().encode('Hello שלום سلام')
    expect(decodeText(bytes)).toBe('Hello שלום سلام')
  })

  it('reads a Hebrew file saved as Windows-1255', () => {
    expect(decodeText(new Uint8Array([0xf9, 0xec, 0xe5, 0xed]))).toBe('שלום')
  })

  it('reads an Arabic file saved as Windows-1256', () => {
    expect(decodeText(new Uint8Array([0xd3, 0xe1, 0xc7, 0xe3]))).toBe('سلام')
  })

  it('leaves random bytes as broken UTF-8, so they are still caught as unreadable', () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x9f, 0x80, 0x81, 0x03, 0x04])
    expect(decodeText(bytes)).toContain('�')
  })
})
