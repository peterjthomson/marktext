# Light Touch Mode

Light Touch mode preserves the original whitespace formatting of your markdown files when no semantic changes have been made. This is especially useful for Git workflows where you don't want unnecessary diffs from whitespace normalization.

## The Problem

When you open a markdown file in MarkText, it parses the content into an internal block structure. When saving, it regenerates the markdown from these blocks. This process can introduce changes to:

- Trailing spaces on lines
- Consecutive blank lines (collapsed to single blank lines)
- Other whitespace formatting

This means that simply opening and saving a file—without making any edits—could show as modified in Git, causing confusion and polluting commit history.

**Related upstream issues:**
- [marktext/marktext#2148](https://github.com/marktext/marktext/issues/2148): "don't modify file when I don't modify it"
- [marktext/marktext#2189](https://github.com/marktext/marktext/issues/2189): "Document is modified when opened/Markdown formatting"
- [marktext/marktext#1354](https://github.com/marktext/marktext/issues/1354): "Automatic Removal of Empty Lines"

## The Solution

Light Touch mode solves this by:

1. **Storing the original content** - When a file is loaded from disk, the original markdown is preserved
2. **Semantic comparison** - On save, the regenerated markdown is compared with the original, ignoring whitespace differences
3. **Smart preservation** - If the content is semantically unchanged, the original file content is saved instead of the regenerated version

## How It Works

When you save a file with Light Touch enabled:

```
Original file content → Stored on load
                ↓
User makes edits → Content regenerated from blocks
                ↓
On save: Compare normalized versions
                ↓
If semantically identical → Save original (preserves whitespace)
If content changed → Save regenerated (applies formatting)
```

## Configuration

Light Touch mode is **enabled by default**.

To toggle it:

1. Go to **File → Preferences** (or use `Ctrl+,` / `Cmd+,`)
2. Navigate to **Editor → File Representation**
3. Toggle **Light Touch mode**

## When It Applies

Light Touch mode only applies when:

- The file was loaded from disk (not a new untitled file)
- No semantic changes were made to the content
- The setting is enabled in preferences

If you make actual content changes (add/remove text, change formatting, etc.), the regenerated markdown will be saved normally, applying MarkText's standard formatting rules.

## Benefits

- **Clean Git history** - No spurious whitespace changes in your commits
- **Preserve intentional formatting** - Keep trailing spaces used for line breaks
- **Seamless workflow** - Works automatically without changing how you use MarkText
