# MarkText Features

A comprehensive guide to all features available in MarkText.

## Core Editing Features

### WYSIWYG Markdown Editing

MarkText provides real-time preview as you type. Unlike split-pane editors, the preview is **inline** - you see formatted output directly in the editor.

- Instant rendering of markdown syntax
- Seamless switching between formatted and source views
- No compile/refresh needed

### Markdown Support

#### CommonMark

Full [CommonMark 0.29](https://spec.commonmark.org/0.29/) specification support:

- Headings (ATX and Setext)
- Paragraphs and line breaks
- Emphasis and strong emphasis
- Links and images
- Code spans and fenced code blocks
- Block quotes
- Lists (ordered and unordered)
- Thematic breaks
- HTML blocks

#### GitHub Flavored Markdown (GFM)

[GFM](https://github.github.com/gfm/) extensions:

- Tables
- Task lists (checkboxes)
- Strikethrough
- Autolinks
- Disallowed raw HTML (sanitized)

#### Extended Markdown

Additional features:

- **KaTeX Math**: Inline `$...$` and block `$$...$$` math expressions
- **Front Matter**: YAML/TOML/JSON metadata blocks
- **Emojis**: `:emoji_name:` syntax with picker
- **Footnotes**: Reference-style footnotes
- **Superscript/Subscript**: `^super^` and `~sub~` (configurable)
- **Mermaid Diagrams**: Flowcharts, sequence diagrams, etc.
- **PlantUML**: UML diagrams (requires external server)
- **Vega-Lite**: Data visualizations

### Edit Modes

#### Source Code Mode

- Plain text editing with syntax highlighting
- Powered by CodeMirror
- Full access to raw markdown

#### Typewriter Mode

- Current line stays centered
- Reduces eye movement
- Ideal for long-form writing

#### Focus Mode

- Dims non-active paragraphs
- Highlights current block
- Minimizes distractions

## User Interface

### Tabbed Interface

- Multiple documents in tabs
- Tab context menu (close, close others, close saved)
- Drag to reorder tabs
- Unsaved indicator

### Sidebar

#### File Tree

- Open folders as projects
- Create, rename, delete files/folders
- Sort by name, created, or modified date
- Search within project (ripgrep-powered)

#### Table of Contents

- Auto-generated from headings
- Click to navigate
- Word wrap option

#### Search Panel

- Global search with ripgrep
- Search and replace
- Regex support
- Case sensitivity toggle

### Command Palette

Quick access to all commands via `Ctrl/Cmd + Shift + P`:

- File operations
- Edit commands
- View toggles
- Format actions

### Themes

Six built-in themes:

| Light Themes   | Dark Themes   |
| -------------- | ------------- |
| Cadmium Light  | Dark          |
| Graphite Light | Material Dark |
| Ulysses Light  | One Dark      |

Theme affects:

- Editor background and text
- Syntax highlighting
- UI components
- Code block styling

## Editor Capabilities

### Smart Editing

- **Auto-pair**: Automatically close brackets, quotes, markdown syntax
- **Surround Selection**: Wrap selected text with formatting
- **Smart Lists**: Continue list markers on Enter
- **Table Editing**: Tab/Shift+Tab navigation in tables

### Code Blocks

- Syntax highlighting (100+ languages via Prism.js)
- Line numbers (optional)
- Word wrap (optional)
- Language selector
- Trim empty lines (optional)

### Images

- Paste from clipboard
- Drag and drop
- Local file insertion
- URL insertion
- Image toolbar (resize, align, caption)

#### Image Upload

Supported uploaders:

- GitHub repository
- SM.MS
- PicGo CLI
- Custom CLI script

### Tables

- Visual table picker for insertion
- Add/remove rows and columns
- Drag to resize columns
- Alignment controls

### Links

- Auto-detect URLs
- Link editing toolbar
- Reference-style links
- Internal document links

## File Operations

### Supported Formats

**Input:**

- `.md`, `.markdown`
- `.mmd`, `.mdown`
- `.mdtxt`, `.mdtext`

**Output:**

- Markdown (`.md`)
- HTML (`.html`)
- PDF (via print dialog)
- Pandoc formats (docx, odt, latex, etc.) - requires Pandoc

### File Handling

- Auto-save (configurable delay)
- External change detection
- Encoding detection (UTF-8, etc.)
- Line ending normalization (LF/CRLF)
- Trailing newline option
- Light Touch mode (preserve original whitespace to minimize diffs)

### Recent Files

- Quick access to recently opened files
- Maximum 12 entries
- Clear history option

## Preferences

### General Settings

| Setting         | Description                           |
| --------------- | ------------------------------------- |
| Auto Save       | Save automatically after changes      |
| Auto Save Delay | Time before auto-save (default 5s)    |
| Title Bar Style | Custom or native (Win/Linux)          |
| Language        | UI language (9 options)               |
| Zoom            | 50% - 200%                            |
| Startup Action  | Blank, last state, or specific folder |
| File Sort       | By name, created, or modified         |

### Editor Settings

| Setting        | Description             |
| -------------- | ----------------------- |
| Font Family    | Editor typeface         |
| Font Size      | 12px - 32px             |
| Line Height    | 1.2 - 2.0               |
| Line Width     | Maximum line width      |
| Code Font      | Monospace font for code |
| Code Font Size | Separate size for code  |

### Markdown Settings

| Setting               | Description              |
| --------------------- | ------------------------ |
| Prefer Loose List     | Use loose list items     |
| Bullet List Marker    | `-`, `*`, or `+`         |
| Order List Delimiter  | `.` or `)`               |
| Front Matter Type     | YAML, TOML, or JSON      |
| Superscript/Subscript | Enable `^super^` `~sub~` |
| Footnotes             | Enable footnote syntax   |
| HTML                  | Allow raw HTML           |

### Keybindings

Fully customizable keyboard shortcuts:

- Platform-specific defaults (macOS vs Windows/Linux)
- Conflict detection
- Reset to defaults
- Export/import (via preferences file)

## Platform Features

### macOS

- Native title bar integration
- Menu bar with all commands
- Dock menu with recent files
- Touch Bar support (if available)
- Dark mode following system

### Windows

- Custom title bar (optional native)
- Windows 10/11 integration
- File association for markdown
- NSIS installer

### Linux

- Multiple package formats (AppImage, deb, rpm, snap, tar.gz)
- Desktop file with MIME associations
- XDG compliance
- Native and custom title bar options

## Accessibility

- Keyboard navigation
- Screen reader compatibility
- Customizable font sizes
- High contrast theme support
- Focus indicators

## Performance

- Fast startup via electron-vite
- Lazy loading of non-critical features
- Efficient file watching with chokidar
- Fast search with ripgrep
- Virtualized lists for large file trees

## Extensibility

### Pandoc Integration

When [Pandoc](https://pandoc.org/) is installed, export to:

- Microsoft Word (.docx)
- OpenDocument (.odt)
- LaTeX (.tex)
- EPUB (.epub)
- And many more formats

### CLI Usage

```bash
# Open file
marktext file.md

# Open folder
marktext /path/to/folder

# Create new file
marktext --new
```

See [CLI documentation](CLI.md) for all options.

## Spellchecking

- Multi-language support
- Custom dictionary
- Add words to dictionary
- Language auto-detection
- Per-document language setting

See [Spelling documentation](SPELLING.md) for setup.

## Related Documentation

- [Keyboard Shortcuts (macOS)](KEYBINDINGS_OSX.md)
- [Keyboard Shortcuts (Windows)](KEYBINDINGS_WINDOWS.md)
- [Keyboard Shortcuts (Linux)](KEYBINDINGS_LINUX.md)
- [Markdown Syntax Guide](MARKDOWN_SYNTAX.md)
- [Image Configuration](IMAGES.md)
- [Preferences Reference](PREFERENCES.md)
