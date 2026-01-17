import { describe, it, expect } from 'vitest'
import { getEncodingName } from 'common/encoding'

describe('encoding utilities', () => {
  describe('getEncodingName', () => {
    it('should return mapped encoding name for known encodings', () => {
      expect(getEncodingName({ encoding: 'utf8', isBom: false })).toBe('UTF-8')
      expect(getEncodingName({ encoding: 'utf16le', isBom: false })).toBe('UTF-16 LE')
      expect(getEncodingName({ encoding: 'gb2312', isBom: false })).toBe('Simplified Chinese (GB2312)')
    })

    it('should append "with BOM" when isBom is true', () => {
      expect(getEncodingName({ encoding: 'utf8', isBom: true })).toBe('UTF-8 with BOM')
      expect(getEncodingName({ encoding: 'utf16le', isBom: true })).toBe('UTF-16 LE with BOM')
    })

    it('should return raw encoding string for unknown encodings', () => {
      expect(getEncodingName({ encoding: 'unknown-enc', isBom: false })).toBe('unknown-enc')
    })

    it('should append "with BOM" even for unknown encodings', () => {
      expect(getEncodingName({ encoding: 'custom', isBom: true })).toBe('custom with BOM')
    })
  })
})
