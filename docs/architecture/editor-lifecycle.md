# Editor lifecycle & “minimal-diff” strategy

This document summarizes a design discussion about MarkText’s editor architecture, why Markdown “round-trips” create noisy diffs, and what architectural patterns can achieve a **Word-like experience** while still **respecting arbitrary existing Markdown** (developer-authored files, mixed flavours, hand formatting).

## Problem statement

We want to:

- **Support non-technical users** (e.g. lawyers) who should not need to understand Markdown syntax like `##` or `[label](url)`.
- **Open and edit developer-owned Markdown** without introducing unrelated whitespace/formatting changes on save.
- Avoid “weird circular round-trips” where editing content causes the whole file to be reformatted during hydrate/dehydrate cycles.

The core tension:

- A “Word-like” editor naturally wants a **rich document model** (paragraphs, headings, lists, marks).
- Markdown is a **text serialization** with many equivalent spellings. If you regenerate Markdown from a model, you must choose a spelling, which can change large parts of the file even when content changes are localized.

## What MarkText does today (Muya)

MarkText’s primary editor engine is **Muya**, which is a contenteditable-based WYSIWYG-ish editor with an internal block model.

The key behavior:

- **Open**: parse Markdown → internal block tree (`ContentState`).
- **Edit**: mutate block tree as the user types.
- **Save**: regenerate Markdown from blocks via `ExportMarkdown`.

This regeneration step is the fundamental source of “diff noise” when opening arbitrary Markdown that has intentional formatting, since `ExportMarkdown` enforces its own output choices.

## “Light Touch mode” (the branch mitigation)

We discussed (and the branch implements) a mitigation called **Light Touch mode**:

- Store the **original file contents** (as loaded from disk) as `originalMarkdown`.
- When saving, decide whether to:
  - save the original unchanged (when “no semantic changes” were made), or
  - merge regenerated content with the original to preserve unchanged sections.

### Implementation shape (renderer store)

The branch introduces:

- `lightTouch` preference (default `true`) exposed in Preferences.
- `originalMarkdown` stored on file state for disk-backed tabs.
- Save path uses a helper `getMarkdownForSave(currentMarkdown, originalMarkdown, lightTouch)` before writing to disk.

### Key caveats we identified

This mitigation helps but doesn’t fully solve “respect arbitrary prior code” because:

- The “semantic equality” check is **heuristic** and not Markdown-AST aware (whitespace can be meaningful in fenced code, tables, etc.).
- The merge approach is **line-based** (LCS alignment), not structure-aware. It can preserve lots of text, but it can also produce surprising outcomes in edge cases.
- Because Muya’s core is still “parse → regenerate”, the mitigation is downstream of the fundamental architecture.

Bottom line: **Light Touch reduces diff noise** and can plug a hole, but it can’t provide a hard guarantee across all Markdown constructs and styles unless it becomes Markdown-structure aware.

## The “metaphor” options we debated

We grouped solutions into a few real architectural families.

### Option 1: “Rich-text model is truth” (classic WYSIWYG editors)

Pattern (ProseMirror/Lexical/Slate-like):

- Rich document model + transactions
- Serializer exports Markdown

Pros:

- Strong “Word-like” editing semantics.

Cons:

- If Markdown is the storage format, exporting implies choosing a canonical formatting.
- To achieve minimal diffs, you need an additional layer: **source mapping + patch-based serialization** (reuse original source slices for unchanged nodes).

This is the “make Muya lossless” path.

### Option 2: “Text is truth, formatting is projection” (the “cheat”)

Pattern (Typora/Panda-like feel; code-editor foundations):

- The document is always **Markdown text**.
- The UI overlays styling and widgets to *look* formatted:
  - hide/fade syntax tokens away from the cursor
  - heading sizes, list bullets, checkbox widgets, link hover UI, etc.
- Toolbar operations perform **local text transforms** (insert/remove `**`, add/remove `# `, wrap in `[]()`, etc.).

Pros:

- **Minimal diffs by default** (no regeneration; saving is just writing the buffer).
- Tolerant of “various markdown flavours” because unknown text can remain untouched.

Cons:

- Not “true Word”; some constructs will remain somewhat “markup-y” when the cursor enters them.
- Advanced block UI (tables/images/etc.) must be implemented as editor decorations + controlled transforms.

This option strongly matches the “respect arbitrary prior code” requirement.

## MarkText already has a strong foothold: CodeMirror source mode

We noted that MarkText already ships a full “Source Code mode” based on **CodeMirror** (currently CodeMirror 5).

This matters because CodeMirror is designed for “text is truth” plus rich UI layers:

- token styling via modes/overlays
- decorations via marks/widgets
- commands for precise edits

This makes it feasible to **promote a “hybrid mode”** (formatted-looking Markdown) while keeping the underlying document as plain Markdown text—i.e., achieving the same illusion as Typora/Panda while preserving file fidelity.

## Why Typora/Panda can appear “formatting-preserving”

They appear to support many Markdown flavours without rewriting everything because they largely:

- keep the **text buffer** as the source of truth,
- maintain an incremental parse/index for styling and interactions,
- apply transformations locally only where the user explicitly edits/commands.

They avoid “format the whole file on save” except where necessary.

## Big-picture paths forward

We explicitly discussed larger refactor options:

### Path A: Keep Muya, fork it, and make it lossless

Doable, but heavy:

- add token/node range tracking to parsing
- preserve original line endings/tabs (currently normalizations happen early in parsing)
- mark dirty regions at the block level
- patch-save: reuse original slices for unchanged nodes

This is the only way to keep Muya’s rich editing semantics *and* guarantee minimal diffs, but it becomes an editor-engine maintenance commitment.

### Path B: Make CodeMirror hybrid mode the primary editor

This is the most direct way to achieve:

- lawyer-friendly “formatted feel” via projection
- minimal diffs and arbitrary style preservation

Muya can remain as a legacy mode, optional mode, or be retired over time.

### Path C: Replace with a modern text editor engine (CodeMirror 6 / Monaco)

- **CodeMirror 6** offers a modern, structured extension system.
- **Monaco** is powerful but heavier and more VS Code-shaped.

Either enables the same projection approach. This is likely a “step 2” after proving the hybrid model, since MarkText already has CodeMirror 5 integrated.

### Path D: Start over

Only rational if we’re willing to drastically rescope and rebuild many MarkText features (projects/tabs/preferences/export/etc.).

## Practical guidance from the discussion

- If “respect arbitrary prior code” is the hard requirement, the safest approach is **text-first** (projection UI), not AST regeneration.
- If we must keep “true WYSIWYG” semantics, we need **source mapping + patch-based save** in the editor engine (not downstream heuristics).
- “Minimal file changes” can be treated as a policy:
  - **No-op save**: if no semantic changes, write the original bytes.
  - **Locality**: if a user edits one region, only that region should change.
  - **Sensitive regions**: fenced code, tables, HTML blocks need stricter preservation rules.
  - **Fallback**: if patching is unsafe, fall back to canonical output (possibly with a warning / explicit opt-in).

## Current status

The branch introduced **Light Touch mode** to reduce diff noise and plug the biggest hole in the existing regenerate-on-save pipeline.

Long-term, the most consistent route to “Typora/Panda feel + minimal diffs” is to leverage the existing **CodeMirror source mode** foundation and evolve it into a **hybrid Markdown projection editor** where Markdown text remains the source of truth.

