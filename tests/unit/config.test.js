import { describe, it, expect } from 'vitest'
import {
  PANDOC_EXTENSIONS,
  LINE_ENDING_REG,
  LF_LINE_ENDING_REG,
  CRLF_LINE_ENDING_REG,
  URL_REG
} from 'main_renderer/config'

describe('config constants', () => {
  describe('PANDOC_EXTENSIONS', () => {
    it('should be a frozen array', () => {
      expect(Object.isFrozen(PANDOC_EXTENSIONS)).toBe(true)
    })

    it('should contain common export formats', () => {
      expect(PANDOC_EXTENSIONS).toContain('html')
      expect(PANDOC_EXTENSIONS).toContain('docx')
      expect(PANDOC_EXTENSIONS).toContain('latex')
      expect(PANDOC_EXTENSIONS).toContain('epub')
    })
  })

  describe('LINE_ENDING_REG', () => {
    it('should match LF line endings', () => {
      expect('line1\nline2'.match(LINE_ENDING_REG)).toHaveLength(1)
    })

    it('should match CRLF line endings', () => {
      expect('line1\r\nline2'.match(LINE_ENDING_REG)).toHaveLength(1)
    })

    it('should match all line endings in a string', () => {
      expect('a\nb\nc\nd'.match(LINE_ENDING_REG)).toHaveLength(3)
    })

    it('should not match text without line endings', () => {
      expect('no newlines here'.match(LINE_ENDING_REG)).toBeNull()
    })
  })

  describe('LF_LINE_ENDING_REG', () => {
    it('should match LF (Unix) line endings', () => {
      expect(LF_LINE_ENDING_REG.test('hello\nworld')).toBe(true)
    })

    it('should not match standalone CRLF', () => {
      // This regex specifically looks for LF not preceded by CR
      expect(LF_LINE_ENDING_REG.test('\r\n')).toBe(false)
    })
  })

  describe('CRLF_LINE_ENDING_REG', () => {
    it('should match CRLF (Windows) line endings', () => {
      expect(CRLF_LINE_ENDING_REG.test('hello\r\nworld')).toBe(true)
    })

    it('should not match LF only', () => {
      expect(CRLF_LINE_ENDING_REG.test('hello\nworld')).toBe(false)
    })
  })

  describe('URL_REG', () => {
    it('should match http URLs', () => {
      expect(URL_REG.test('http://example.com')).toBe(true)
      expect(URL_REG.test('http://example.com/path')).toBe(true)
    })

    it('should match https URLs', () => {
      expect(URL_REG.test('https://example.com')).toBe(true)
      expect(URL_REG.test('https://example.com/path?query=1')).toBe(true)
    })

    it('should match localhost', () => {
      expect(URL_REG.test('http://localhost')).toBe(true)
      expect(URL_REG.test('http://localhost:3000')).toBe(true)
    })

    it('should match IP addresses', () => {
      expect(URL_REG.test('http://192.168.1.1')).toBe(true)
      expect(URL_REG.test('http://127.0.0.1:8080/api')).toBe(true)
    })

    it('should not match invalid URLs', () => {
      expect(URL_REG.test('not-a-url')).toBe(false)
      expect(URL_REG.test('ftp://example.com')).toBe(false)
    })
  })
})
