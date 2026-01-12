import { describe, it, expect } from 'vitest'
import { ENCODING_NAME_MAP, getEncodingName } from 'common/encoding'

describe('encoding utilities', () => {
  describe('ENCODING_NAME_MAP', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(ENCODING_NAME_MAP)).toBe(true)
    })

    it('should contain common encodings', () => {
      expect(ENCODING_NAME_MAP.utf8).toBe('UTF-8')
      expect(ENCODING_NAME_MAP.utf16be).toBe('UTF-16 BE')
      expect(ENCODING_NAME_MAP.utf16le).toBe('UTF-16 LE')
      expect(ENCODING_NAME_MAP.ascii).toBe('Western (ISO 8859-1)')
    })

    it('should contain CJK encodings', () => {
      expect(ENCODING_NAME_MAP.gb2312).toBe('Simplified Chinese (GB2312)')
      expect(ENCODING_NAME_MAP.big5).toBe('Traditional Chinese (Big5)')
      expect(ENCODING_NAME_MAP.shiftjis).toBe('Japanese (Shift JIS)')
      expect(ENCODING_NAME_MAP.euckr).toBe('Korean (EUC-KR)')
    })
  })

  describe('getEncodingName', () => {
    it('should return mapped encoding name for known encodings', () => {
      expect(getEncodingName({ encoding: 'utf8', isBom: false })).toBe('UTF-8')
      expect(getEncodingName({ encoding: 'utf16le', isBom: false })).toBe('UTF-16 LE')
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
