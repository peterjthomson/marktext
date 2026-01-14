# Light Touch Mode

Light Touch mode preserves the original whitespace formatting of your markdown files, minimizing unnecessary diffs when saving. This is especially useful for Git workflows where you want commits to show only actual content changes.

## The Problem

When you open a markdown file in MarkText, it parses the content into an internal block structure. When saving, it regenerates the markdown from these blocks. This process can introduce changes to:

- Trailing spaces on lines
- Consecutive blank lines (collapsed to single blank lines)
- Other whitespace formatting

This means that editing one paragraph could cause whitespace changes throughout the entire file, making git diffs noisy and hard to review.

**Related upstream issues:**
- [marktext/marktext#2148](https://github.com/marktext/marktext/issues/2148): "don't modify file when I don't modify it"
- [marktext/marktext#2189](https://github.com/marktext/marktext/issues/2189): "Document is modified when opened/Markdown formatting"
- [marktext/marktext#1354](https://github.com/marktext/marktext/issues/1354): "Automatic Removal of Empty Lines"

## The Solution

Light Touch mode solves this with **block-level preservation**:

1. **Stores the original content** - When a file is loaded, the original markdown is preserved
2. **Block-level comparison** - On save, the document is split into logical blocks (paragraphs, headings, code blocks, etc.)
3. **Smart merging** - Unchanged blocks keep their original formatting; only changed blocks use regenerated formatting

This means if you edit one paragraph, only that paragraph gets reformatted—the rest of the file stays exactly as it was.

## How It Works

```
Original file loaded → Split into blocks, stored
                ↓
User edits paragraph 3 → Content regenerated from editor
                ↓
On save: Compare blocks
                ↓
Paragraph 1: unchanged → Use original (preserves whitespace)
Paragraph 2: unchanged → Use original (preserves whitespace)
Paragraph 3: CHANGED   → Use regenerated (applies formatting)
Paragraph 4: unchanged → Use original (preserves whitespace)
                ↓
Result: Only paragraph 3 shows in git diff!
```

## Block Types

Light Touch recognizes these as separate blocks:
- Paragraphs (separated by blank lines)
- Headings
- Code blocks (fenced with ```)
- Lists
- Block quotes
- Tables

Each block is compared independently, so changes to one don't affect others.

## Configuration

Light Touch mode is **enabled by default**.

To toggle it:

1. Go to **File → Preferences** (or use `Ctrl+,` / `Cmd+,`)
2. Navigate to **Editor → File Representation**
3. Toggle **Light Touch mode**

## When It Applies

Light Touch mode:

| Scenario | Behavior |
|----------|----------|
| No changes made | Original file saved exactly |
| One block edited | Only that block reformatted |
| Multiple blocks edited | Only changed blocks reformatted |
| New block added | New block uses standard formatting |
| Block deleted | Removed from output |
| Setting disabled | Full file regenerated (standard behavior) |

## Benefits

- **Minimal git diffs** - Only actual changes appear in version control
- **Preserve intentional formatting** - Trailing spaces for line breaks stay intact in unchanged sections
- **Better code review** - Reviewers see only what you actually changed
- **Seamless workflow** - Works automatically without changing how you use MarkText

## Example

Given this original file with trailing spaces for line breaks:

```markdown
First paragraph with
trailing spaces for breaks.

Second paragraph stays
exactly the same.

Third paragraph here.
```

If you only edit the third paragraph, the git diff will show:

```diff
 First paragraph with
 trailing spaces for breaks.

 Second paragraph stays
 exactly the same.

-Third paragraph here.
+Third paragraph was edited.
```

The first two paragraphs keep their original trailing spaces—no spurious whitespace changes!
