# Light Touch – progress log (WIP)

Working notes for Light Touch behavior in `src/renderer/src/store/editor.js`.

## What it does today
- Stores `originalMarkdown` on load; on save, uses `getMarkdownForSave` to choose between the original or a merge of regenerated content.
- Semantic comparison uses `normalizeBlock`, which collapses consecutive blank lines and whitespace; this is a deliberate tradeoff for now.
- Merge is line-based LCS (not AST-aware); unchanged lines reuse original formatting, changed lines use regenerated content.
- Baseline advances to the last saved payload when tracked via `pendingSavedMarkdown` (manual/auto saves to existing paths).

## Known tradeoffs (accepted for now)
- ~~Aggressive normalization: intentional multiple blank lines can be collapsed when nearby edits occur.~~ (FIXED: merge now preserves original blank line counts)
- Line-oriented LCS can misalign within fenced code, tables, or reordered lists because block types are ignored.

## Test coverage to add
- Fenced code vs prose lines with similar text (match vs mismatch).
- Table edits (row/column tweaks) preserving alignment when untouched.
- List reorders (including nested) with minimal textual change.
- Multiple blank lines preserved when untouched but potentially collapsed when adjacent edits happen.

## Future explorations (not committed)
- Optional opt-out per block type (e.g., skip Light Touch inside fenced code or tables).
- Toggle or soften blank-line normalization to preserve intentional spacing.
- Carry saved payload/checksum/version in save completion events to remove local inference.
- End-to-end scenarios for edits-during-save (manual/auto/Save As) with a baseline refresh after disk write.
