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

Light Touch mode minimizes diffs by trying to preserve **unchanged lines** from the original file:

1. **Stores the original content** - When a file is loaded, the original markdown is preserved
2. **Semantic comparison** - On save, MarkText compares the original and current content after normalizing whitespace
3. **LCS-based line merge** - If changes were made, it aligns lines using Longest Common Subsequence (LCS) and keeps exact original formatting for lines that match

This means if you edit one paragraph, the unchanged lines elsewhere can stay exactly as they were.

## How It Works

```
Original file loaded → Stored as original markdown
                ↓
User edits paragraph 3 → Content regenerated from editor
                ↓
On save: Normalize + compare
                ↓
If semantically equal → Save original exactly
Else                 → Merge, preserving unchanged lines
                ↓
Result: Only paragraph 3 shows in git diff!
```

## Block Types

Light Touch does not do a full Markdown-AST block comparison. Instead, it preserves formatting by matching and reusing unchanged **lines**, which works well for common Markdown structures such as:

- Paragraphs
- Headings
- Code blocks (fenced with ```)
- Lists
- Block quotes
- Tables

In practice, this often means changes in one area don’t force unrelated formatting changes elsewhere.

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
