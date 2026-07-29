/**
 * Light Touch save.
 *
 * MarkText regenerates a document's markdown from its block model on every
 * save. That is correct output, but it means opening a file and pressing save
 * can rewrite list markers, blank lines and trailing whitespace across the
 * whole document — which shows up as a large, meaningless `git diff`.
 *
 * Light Touch compares the regenerated markdown against the bytes originally
 * read from disk and writes back the smallest faithful result:
 *
 *   - no semantic change  -> the original file, byte for byte
 *   - some change         -> unchanged lines keep their original formatting,
 *                            edited regions take the regenerated output
 *
 * Everything here is pure so it can be unit tested without Electron, and so
 * that tracking upstream Muya changes stays cheap — we never fork Muya's
 * serializer, we only post-process its output.
 */

/**
 * Normalizes a whole document for semantic comparison: line endings, trailing
 * whitespace, blank-line runs and repeated spaces are all flattened, so two
 * documents that differ only in insignificant whitespace compare equal.
 */
export const normalizeBlock = (text: string): string => {
  if (!text) return ''
  return (
    text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Remove trailing spaces from lines
      .replace(/[ \t]+$/gm, '')
      // Treat "no blank line" and "one or more blank lines" as equivalent
      .replace(/\n+/g, '\n')
      // Collapse runs of spaces/tabs (but not newlines)
      .replace(/[ \t]+/g, ' ')
      .trim()
  )
}

/** Normalizes a single line for comparison (trims trailing whitespace). */
const normalizeLine = (line: string): string => line.replace(/[ \t]+$/, '')

interface LineMatch {
  orig: number
  regen: number
}

/**
 * Computes the Longest Common Subsequence between two arrays of lines, using
 * normalized lines for comparison, and returns the matching index pairs.
 */
const computeLcs = (origLines: string[], regenLines: string[]): LineMatch[] => {
  const n = origLines.length
  const m = regenLines.length

  // dp[i][j] = length of LCS of orig[0..i) and regen[0..j)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (normalizeLine(origLines[i - 1]) === normalizeLine(regenLines[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to recover the matching indices.
  const matches: LineMatch[] = []
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    if (normalizeLine(origLines[i - 1]) === normalizeLine(regenLines[j - 1])) {
      matches.push({ orig: i - 1, regen: j - 1 })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return matches.reverse()
}

/**
 * Merges regenerated markdown with the original file by aligning unchanged
 * lines via LCS and preserving their exact original formatting. Changed or new
 * lines come from the regenerated content. This keeps unrelated lines untouched
 * even when nearby lines were edited, and avoids inserting blank lines where
 * the original had none.
 */
export const mergeWithOriginal = (regenerated: string, original: string): string => {
  const regenLines = regenerated.replace(/\r\n/g, '\n').split('\n')
  const origLines = original.replace(/\r\n/g, '\n').split('\n')

  const matches = computeLcs(origLines, regenLines)

  const resultLines: string[] = []
  let prevOrig = -1
  let prevRegen = -1

  for (const { orig: oi, regen: rj } of matches) {
    // Lines from the original in the gap (blank lines we want to preserve).
    const origGapLines = origLines.slice(prevOrig + 1, oi)
    // Lines from the regenerated content in the gap (may include new content).
    const regenGapLines = regenLines.slice(prevRegen + 1, rj)

    if (origGapLines.length > 0) {
      const regenHasContent = regenGapLines.some((l) => normalizeLine(l) !== '')
      const origHasContent = origGapLines.some((l) => normalizeLine(l) !== '')

      if (!regenHasContent && !origHasContent) {
        // Both sides are blank lines only: keep the original gap exactly, which
        // is what preserves double blank lines the serializer would collapse.
        resultLines.push(...origGapLines)
      } else {
        // Content was inserted, changed or *deleted* here, so the editor's
        // output wins. Checking origHasContent matters: if the original had a
        // paragraph and the regenerated content does not, the user deleted it
        // and we must not write it back.
        resultLines.push(...regenGapLines)
      }
    } else if (regenGapLines.length > 0) {
      // Original had no gap but the regenerated content does: purely new
      // content. Strip blank-only insertions to avoid adding spacing.
      const onlyBlank = regenGapLines.every((l) => normalizeLine(l) === '')
      if (!onlyBlank) {
        resultLines.push(...regenGapLines.filter((l) => normalizeLine(l) !== ''))
      }
    }

    // Take the matched line from the original to preserve its formatting.
    resultLines.push(origLines[oi])
    prevOrig = oi
    prevRegen = rj
  }

  // Tail after the last match.
  const origTail = origLines.slice(prevOrig + 1)
  const regenTail = regenLines.slice(prevRegen + 1)

  if (origTail.length > 0) {
    const regenHasContent = regenTail.some((l) => normalizeLine(l) !== '')
    const origHasContent = origTail.some((l) => normalizeLine(l) !== '')

    if (!regenHasContent && !origHasContent) {
      // Trailing blank lines only: preserve the original ones.
      resultLines.push(...origTail)
    } else {
      // Same reasoning as the gap case above — content deleted from the end of
      // the document must stay deleted.
      resultLines.push(...regenTail)
    }
  } else if (regenTail.length > 0) {
    const onlyBlank = regenTail.every((l) => normalizeLine(l) === '')
    if (!onlyBlank) {
      resultLines.push(...regenTail.filter((l) => normalizeLine(l) !== ''))
    }
    // If only blank, fall through to trailing-newline preservation below.
  }

  // Preserve the original trailing newline pattern.
  const originalTrailing = original.match(/\n*$/)
  const trailingNewlines = originalTrailing ? originalTrailing[0] : '\n'

  return resultLines.join('\n').replace(/\n*$/, trailingNewlines)
}

/**
 * Determines the markdown to write to disk.
 *
 * @param currentMarkdown The regenerated markdown from the editor.
 * @param originalMarkdown The markdown as it was read from disk, or null for
 *   documents that have no on-disk original yet (new/untitled files).
 * @param lightTouch Whether the Light Touch preference is enabled.
 */
export const getMarkdownForSave = (
  currentMarkdown: string,
  originalMarkdown: string | null | undefined,
  lightTouch: boolean
): string => {
  // Disabled, or nothing to compare against (new file): save as-is.
  if (!lightTouch || !originalMarkdown) {
    return currentMarkdown
  }

  // Semantically identical: write the original back untouched, preserving all
  // of its whitespace exactly.
  if (normalizeBlock(currentMarkdown) === normalizeBlock(originalMarkdown)) {
    return originalMarkdown
  }

  // Something really changed: merge so unchanged lines stay byte-identical.
  return mergeWithOriginal(currentMarkdown, originalMarkdown)
}
