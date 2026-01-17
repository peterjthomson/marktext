import { describe, it, expect } from 'vitest'
import {
  hasMarkdownExtension,
  isChildOfDirectory,
  checkPathExcludePattern
} from 'common/filesystem/paths'

describe('filesystem path utilities', () => {
  describe('hasMarkdownExtension', () => {
    it('should return true for markdown files', () => {
      expect(hasMarkdownExtension('README.md')).toBe(true)
      expect(hasMarkdownExtension('doc.markdown')).toBe(true)
      expect(hasMarkdownExtension('notes.txt')).toBe(true)
      expect(hasMarkdownExtension('component.mdx')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(hasMarkdownExtension('README.MD')).toBe(true)
      expect(hasMarkdownExtension('doc.MARKDOWN')).toBe(true)
      expect(hasMarkdownExtension('notes.Txt')).toBe(true)
    })

    it('should return false for non-markdown files', () => {
      expect(hasMarkdownExtension('script.js')).toBe(false)
      expect(hasMarkdownExtension('style.css')).toBe(false)
      expect(hasMarkdownExtension('image.png')).toBe(false)
    })

    it('should handle full paths', () => {
      expect(hasMarkdownExtension('/path/to/README.md')).toBe(true)
      expect(hasMarkdownExtension('/path/to/script.js')).toBe(false)
    })

    it('should return false for empty or invalid input', () => {
      expect(hasMarkdownExtension('')).toBe(false)
      expect(hasMarkdownExtension(null)).toBe(false)
      expect(hasMarkdownExtension(undefined)).toBe(false)
      expect(hasMarkdownExtension(123)).toBe(false)
    })
  })

  describe('isChildOfDirectory', () => {
    it('should return true for direct children', () => {
      expect(isChildOfDirectory('/parent', '/parent/child')).toBe(true)
      expect(isChildOfDirectory('/parent', '/parent/child.txt')).toBe(true)
    })

    it('should return true for nested children', () => {
      expect(isChildOfDirectory('/parent', '/parent/sub/child')).toBe(true)
      expect(isChildOfDirectory('/parent', '/parent/a/b/c/file.md')).toBe(true)
    })

    it('should return false for parent directories', () => {
      expect(isChildOfDirectory('/parent/child', '/parent')).toBe(false)
    })

    it('should return false for sibling directories', () => {
      expect(isChildOfDirectory('/parent/a', '/parent/b')).toBe(false)
    })

    it('should return falsy for same path', () => {
      // Returns empty string which is falsy
      expect(isChildOfDirectory('/parent', '/parent')).toBeFalsy()
    })

    it('should return false for null or empty inputs', () => {
      expect(isChildOfDirectory(null, '/child')).toBe(false)
      expect(isChildOfDirectory('/parent', null)).toBe(false)
      expect(isChildOfDirectory('', '/child')).toBe(false)
      expect(isChildOfDirectory('/parent', '')).toBe(false)
    })
  })

  describe('checkPathExcludePattern', () => {
    it('should return true when path matches pattern', () => {
      expect(checkPathExcludePattern('node_modules', ['node_modules'])).toBe(true)
      expect(checkPathExcludePattern('.git', ['.*'])).toBe(true)
      expect(checkPathExcludePattern('file.log', ['*.log'])).toBe(true)
    })

    it('should return true when path matches any of multiple patterns', () => {
      const patterns = ['node_modules', '*.log', '.git']
      expect(checkPathExcludePattern('node_modules', patterns)).toBe(true)
      expect(checkPathExcludePattern('debug.log', patterns)).toBe(true)
      expect(checkPathExcludePattern('.git', patterns)).toBe(true)
    })

    it('should return false when path matches no patterns', () => {
      expect(checkPathExcludePattern('src/index.js', ['node_modules', '*.log'])).toBe(false)
    })

    it('should return false for empty or invalid input', () => {
      expect(checkPathExcludePattern('', ['*'])).toBe(false)
      expect(checkPathExcludePattern(null, ['*'])).toBe(false)
      expect(checkPathExcludePattern(undefined, ['*'])).toBe(false)
    })
  })
})
