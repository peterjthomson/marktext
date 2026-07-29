import { describe, expect, it } from 'vitest'
import { getMarkdownForSave, mergeWithOriginal, normalizeBlock } from 'common/omm/lightTouch'

// Light Touch exists so that opening a file and saving it produces no git diff,
// and editing one paragraph produces a one-paragraph diff. Muya regenerates
// markdown from its block model on save, which otherwise rewrites list markers,
// blank lines and trailing whitespace across the whole document.

describe('normalizeBlock', () => {
  it('returns an empty string for empty input', () => {
    expect(normalizeBlock('')).toBe('')
  })

  it('treats CRLF and LF as equivalent', () => {
    expect(normalizeBlock('a\r\nb')).toBe(normalizeBlock('a\nb'))
  })

  it('ignores trailing whitespace on lines', () => {
    expect(normalizeBlock('a   \nb\t\n')).toBe(normalizeBlock('a\nb\n'))
  })

  it('treats any run of blank lines as equivalent', () => {
    expect(normalizeBlock('a\n\n\n\nb')).toBe(normalizeBlock('a\nb'))
  })

  it('collapses runs of spaces', () => {
    expect(normalizeBlock('a      b')).toBe('a b')
  })

  it('still distinguishes genuinely different text', () => {
    expect(normalizeBlock('hello world')).not.toBe(normalizeBlock('hello worlds'))
  })
})

describe('getMarkdownForSave — disabled or no original', () => {
  it('returns the current markdown unchanged when Light Touch is off', () => {
    const original = '# Title\n\n\nSpaced out.\n'
    const regenerated = '# Title\n\nSpaced out.\n'
    expect(getMarkdownForSave(regenerated, original, false)).toBe(regenerated)
  })

  it('returns the current markdown for a new file with no on-disk original', () => {
    const regenerated = '# Brand new\n'
    expect(getMarkdownForSave(regenerated, null, true)).toBe(regenerated)
    expect(getMarkdownForSave(regenerated, undefined, true)).toBe(regenerated)
    expect(getMarkdownForSave(regenerated, '', true)).toBe(regenerated)
  })
})

describe('getMarkdownForSave — unchanged documents stay byte-identical', () => {
  it('preserves double blank lines that Muya would collapse', () => {
    const original = '# Title\n\n\nParagraph one.\n\n\nParagraph two.\n'
    const regenerated = '# Title\n\nParagraph one.\n\nParagraph two.\n'
    expect(getMarkdownForSave(regenerated, original, true)).toBe(original)
  })

  it('preserves trailing whitespace on lines', () => {
    const original = 'Line with trailing spaces.   \nNext line.\n'
    const regenerated = 'Line with trailing spaces.\nNext line.\n'
    expect(getMarkdownForSave(regenerated, original, true)).toBe(original)
  })

  it('preserves CRLF line endings', () => {
    const original = '# Title\r\n\r\nParagraph.\r\n'
    const regenerated = '# Title\n\nParagraph.\n'
    expect(getMarkdownForSave(regenerated, original, true)).toBe(original)
  })

  it('preserves a missing trailing newline', () => {
    const original = '# Title\n\nNo newline at end.'
    const regenerated = '# Title\n\nNo newline at end.\n'
    expect(getMarkdownForSave(regenerated, original, true)).toBe(original)
  })

  // Known limitation: Light Touch does NOT rescue ordered-list markers.
  //
  // Muya renumbers `1.` / `1.` / `1.` to `1.` / `2.` / `3.` on save. Those are
  // different characters, not different whitespace, so they are a real content
  // change to both the whole-document comparison and line-level LCS matching.
  // Light Touch is a whitespace-preserving merge; it cannot tell an unwanted
  // renumbering from a deliberate edit.
  //
  // The actual fix is upstream #4776 (preserve ordered list source markers),
  // still open at v0.20.0-rc.1. Until it lands, documents written with repeated
  // `1.` markers will show a diff on save even with Light Touch enabled.
  it('does not preserve repeated ordered-list markers (needs upstream #4776)', () => {
    const original = '1. first\n1. second\n1. third\n'
    const regenerated = '1. first\n2. second\n3. third\n'

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toBe(regenerated)
    expect(result).not.toBe(original)
  })

  it('preserves sequentially numbered lists, which Muya round-trips unchanged', () => {
    const original = '1. first\n2. second\n3. third\n'
    const regenerated = '1. first\n2. second\n3. third\n'
    expect(getMarkdownForSave(regenerated, original, true)).toBe(original)
  })

  it('preserves setext headings that Muya would rewrite to ATX', () => {
    const original = 'Title\n=====\n\nBody.\n'
    const regenerated = '# Title\n\nBody.\n'
    // These are not semantically identical as text, so a merge happens; the
    // body line must survive untouched either way.
    expect(getMarkdownForSave(regenerated, original, true)).toContain('Body.')
  })
})

describe('getMarkdownForSave — real edits produce minimal diffs', () => {
  it('rewrites only the edited paragraph and leaves the rest byte-identical', () => {
    const original = [
      '# Title',
      '',
      '',
      'Paragraph one, untouched.   ',
      '',
      '',
      'Paragraph two, will change.',
      '',
      '',
      'Paragraph three, untouched.',
      ''
    ].join('\n')

    const regenerated = [
      '# Title',
      '',
      'Paragraph one, untouched.',
      '',
      'Paragraph two, HAS CHANGED.',
      '',
      'Paragraph three, untouched.',
      ''
    ].join('\n')

    const result = getMarkdownForSave(regenerated, original, true)

    // The edit landed.
    expect(result).toContain('Paragraph two, HAS CHANGED.')
    expect(result).not.toContain('Paragraph two, will change.')

    // The untouched lines kept their exact original bytes, trailing spaces and
    // double blank lines included.
    expect(result).toContain('Paragraph one, untouched.   ')
    expect(result).toContain('# Title\n\n\nParagraph one')
    expect(result).toContain('Paragraph three, untouched.')
  })

  it('keeps unrelated code fences untouched when prose changes', () => {
    const original = [
      'Intro prose.',
      '',
      '```js',
      'const x = 1',
      '',
      '',
      'const y = 2',
      '```',
      ''
    ].join('\n')

    const regenerated = [
      'Intro prose, edited.',
      '',
      '```js',
      'const x = 1',
      '',
      '',
      'const y = 2',
      '```',
      ''
    ].join('\n')

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('Intro prose, edited.')
    // The blank lines inside the fence are significant and must survive.
    expect(result).toContain('const x = 1\n\n\nconst y = 2')
  })

  // Known limitation, asserted so it is a deliberate choice rather than a
  // surprise: a padded table gets reformatted to Muya's minimal padding.
  //
  // The delimiter row differs in dash *count* (`| ----- |` vs `| --- |`), not
  // just spacing, so neither whole-document normalization nor line-level LCS
  // matching treats the rows as unchanged. Matching them would need
  // markdown-aware table comparison; loosening whitespace matching generally
  // would corrupt indentation-significant lines inside code blocks.
  //
  // What must hold is that no table content is lost.
  it('reformats padded tables but never loses their content', () => {
    const original = [
      'Before.',
      '',
      '| Col A | Col B |',
      '| ----- | ----- |',
      '| 1     | 2     |',
      ''
    ].join('\n')

    const regenerated = [
      'Before.',
      '',
      '| Col A | Col B |',
      '| --- | --- |',
      '| 1 | 2 |',
      ''
    ].join('\n')

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('| Col A | Col B |')
    expect(result).toContain('| 1 | 2 |')
    expect(result).toContain('Before.')
  })

  it('appends genuinely new content at the end', () => {
    const original = '# Title\n\nExisting paragraph.\n'
    const regenerated = '# Title\n\nExisting paragraph.\n\nBrand new paragraph.\n'

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('Existing paragraph.')
    expect(result).toContain('Brand new paragraph.')
  })

  // Regression: the 1.x implementation treated "the regenerated gap has no new
  // content" as "keep the original lines", which silently resurrected any
  // paragraph the user had just deleted. Deleting text and pressing save must
  // delete it.
  it('honours a deletion at the end of the document', () => {
    const original = '# Title\n\nKeep me.\n\nDelete me.\n'
    const regenerated = '# Title\n\nKeep me.\n'

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('Keep me.')
    expect(result).not.toContain('Delete me.')
  })

  it('honours a deletion in the middle of the document', () => {
    const original = 'A\n\nDelete me.\n\nB\n'
    const regenerated = 'A\n\nB\n'

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('A')
    expect(result).toContain('B')
    expect(result).not.toContain('Delete me.')
  })

  it('honours deleting the entire document body', () => {
    expect(getMarkdownForSave('\n', 'Everything goes.\n', true)).not.toContain('Everything goes.')
  })

  it('does not lose content when the document is replaced wholesale', () => {
    const original = 'Old line one.\nOld line two.\n'
    const regenerated = 'Completely different.\n'

    const result = getMarkdownForSave(regenerated, original, true)

    expect(result).toContain('Completely different.')
    expect(result).not.toContain('Old line one.')
  })
})

describe('mergeWithOriginal — edge cases', () => {
  it('handles an empty original', () => {
    expect(mergeWithOriginal('new content\n', '')).toContain('new content')
  })

  it('handles empty regenerated content', () => {
    // Everything was deleted in the editor; do not resurrect the original.
    expect(mergeWithOriginal('', 'old content\n')).not.toContain('old content')
  })

  it('preserves the original trailing newline pattern', () => {
    expect(mergeWithOriginal('a\nb\n', 'a\nb\n\n\n')).toMatch(/\n\n\n$/)
    expect(mergeWithOriginal('a\nb\n', 'a\nb')).not.toMatch(/\n$/)
  })

  it('is stable when applied twice', () => {
    const original = '# Title\n\n\nBody.   \n'
    const regenerated = '# Title\n\nBody, edited.\n'

    const once = mergeWithOriginal(regenerated, original)
    const twice = mergeWithOriginal(regenerated, once)

    expect(twice).toBe(once)
  })
})
