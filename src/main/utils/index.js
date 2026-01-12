import { app } from 'electron'

const ID_PREFIX = 'mt-'
let id = 0

export const getUniqueId = () => {
  return `${ID_PREFIX}${id++}`
}

/**
 * Sanitizes a string to be used as a filename by removing or replacing
 * characters that are invalid on common file systems.
 *
 * @param {string} name The string to sanitize
 * @param {number} maxLength Maximum length of the result (default: 100)
 * @returns {string} A sanitized filename-safe string
 */
const sanitizeFilename = (name, maxLength = 100) => {
  if (!name) return ''

  // Remove or replace invalid filename characters: / \ : * ? " < > |
  // Also remove leading/trailing dots and spaces
  let sanitized = name
    .replace(/[/\\:*?"<>|]/g, ' ') // Replace invalid chars with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots

  // Truncate to maxLength while trying to preserve word boundaries
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
    // Try to break at last space to avoid cutting words
    const lastSpace = sanitized.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.5) {
      sanitized = sanitized.substring(0, lastSpace)
    }
  }

  return sanitized
}

/**
 * Extracts the first non-empty, non-code line of text from markdown content.
 *
 * @param {string} markdown The markdown content
 * @returns {string} The first line of text, or empty string if none found
 */
const getFirstLineOfText = (markdown) => {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  let inCodeBlock = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Track fenced code blocks
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Skip if inside code block
    if (inCodeBlock) continue

    // Skip empty lines, horizontal rules, and common markdown-only lines
    if (
      !trimmed ||
      /^(-{3,}|_{3,}|\*{3,})$/.test(trimmed) || // Horizontal rules
      /^(\[.*\]:\s*\S+)$/.test(trimmed) || // Link references
      /^<!--.*-->$/.test(trimmed)
    ) {
      // HTML comments
      continue
    }

    // Remove markdown formatting to get plain text
    let text = trimmed
      .replace(/^#{1,6}\s+/, '') // Remove header markers
      .replace(/^\s*[-*+]\s+/, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/, '') // Remove numbered list markers
      .replace(/^\s*>\s*/, '') // Remove blockquote markers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/__(.+?)__/g, '$1') // Remove bold (underscore)
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/_(.+?)_/g, '$1') // Remove italic (underscore)
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images, keep alt text
      .trim()

    if (text) {
      return text
    }
  }

  return ''
}

// TODO: Remove this function and load the recommend title from the editor (renderer) when
// requesting the document to save/export.
export const getRecommendTitleFromMarkdownString = (markdown) => {
  if (!markdown) return ''

  // First, try to find a header (excluding code blocks)
  const lines = markdown.split('\n')
  let inCodeBlock = false
  const headers = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Track fenced code blocks
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Skip if inside code block
    if (inCodeBlock) continue

    // Match headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headerMatch) {
      headers.push({
        level: headerMatch[1].length,
        content: headerMatch[2].trim()
      })
    }
  }

  // If we found headers, use the one with lowest level (h1 > h2 > etc.)
  if (headers.length > 0) {
    headers.sort((a, b) => a.level - b.level)
    return sanitizeFilename(headers[0].content)
  }

  // Fall back to the first line of text
  const firstLine = getFirstLineOfText(markdown)
  return sanitizeFilename(firstLine)
}

/**
 * Returns a special directory path for the requested name.
 *
 * NOTE: Do not use "userData" to get the user data path, instead use AppPaths!
 *
 * @param {string} name The special directory name.
 * @returns {string} The resolved special directory path.
 */
export const getPath = (name) => {
  if (name === 'userData') {
    throw new Error('Do not use "getPath" for user data path!')
  }
  return app.getPath(name)
}

export const hasSameKeys = (a, b) => {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  return JSON.stringify(aKeys) === JSON.stringify(bKeys)
}

export const getLogLevel = () => {
  if (
    !global.MARKTEXT_DEBUG_VERBOSE ||
    typeof global.MARKTEXT_DEBUG_VERBOSE !== 'number' ||
    global.MARKTEXT_DEBUG_VERBOSE <= 0
  ) {
    return process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  } else if (global.MARKTEXT_DEBUG_VERBOSE === 1) {
    return 'verbose'
  } else if (global.MARKTEXT_DEBUG_VERBOSE === 2) {
    return 'debug'
  }
  return 'silly' // >= 3
}
