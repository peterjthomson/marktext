# MarkText Architecture Overview

This document provides a comprehensive overview of MarkText's architecture, technology stack, and how the different parts of the application work together.

## Technology Stack

### Core Frameworks

| Technology   | Version | Purpose                        |
| ------------ | ------- | ------------------------------ |
| Electron     | 39.x    | Desktop application framework  |
| Vue 3        | 3.5.x   | UI framework (Composition API) |
| Pinia        | 3.0.x   | State management               |
| Vue Router   | 4.6.x   | Client-side routing            |
| Vue i18n     | 11.x    | Internationalization           |
| Element Plus | 2.13.x  | UI component library           |

### Build Tools

| Tool              | Purpose                         |
| ----------------- | ------------------------------- |
| electron-vite     | Vite-based bundler for Electron |
| electron-builder  | Application packaging           |
| ESLint + Prettier | Code quality                    |

### Key Libraries

| Library         | Purpose                        |
| --------------- | ------------------------------ |
| Muya (internal) | WYSIWYG markdown editor engine |
| marked.js       | Markdown parsing               |
| Prism.js        | Syntax highlighting            |
| KaTeX           | Math rendering                 |
| Mermaid         | Diagram rendering              |
| CodeMirror 5    | Source code mode editing       |
| snabbdom        | Virtual DOM for Muya           |
| Turndown        | HTML to Markdown conversion    |
| electron-store  | Persistent settings storage    |
| chokidar        | File system watching           |
| @vscode/ripgrep | Fast text search               |

## Process Architecture

MarkText follows the standard Electron process model:

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIN PROCESS                           │
│                     (src/main/)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    App      │  │  Windows    │  │   Menu      │         │
│  │ Controller  │  │  Manager    │  │  System     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Preferences │  │  Keyboard   │  │ Filesystem  │         │
│  │   Store     │  │  Shortcuts  │  │  Watcher    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │ IPC (mt::*)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRELOAD SCRIPT                           │
│                    (src/preload/)                           │
│         Exposes safe APIs via contextBridge                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   RENDERER PROCESS                          │
│                  (src/renderer/)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Vue 3 App                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Pages   │  │Components│  │  Stores  │          │   │
│  │  │(app.vue) │  │(sidebar, │  │ (Pinia)  │          │   │
│  │  │          │  │ tabs...) │  │          │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  MUYA EDITOR                         │   │
│  │              (WYSIWYG Markdown)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Main Process (`src/main/`)

The main process runs in Node.js and handles:

- **App Lifecycle**: Startup, shutdown, single-instance handling
- **Window Management**: Creating/managing editor and settings windows
- **File I/O**: Reading, writing, watching files
- **Native Dialogs**: Open/save dialogs, message boxes
- **System Integration**: Menus, keyboard shortcuts, tray
- **Preferences**: Loading, saving, validating user settings
- **IPC Communication**: Receiving commands from renderer

Key files:

- `index.js` - Entry point
- `app/index.js` - Main App class with Accessor pattern
- `windows/editor.js` - Editor window class
- `preferences/index.js` - Preferences management

### Renderer Process (`src/renderer/`)

The renderer process runs in Chromium and handles:

- **Vue 3 UI**: All visual components
- **User Interaction**: Editor, sidebar, tabs, dialogs
- **State Management**: Pinia stores for reactive data
- **Muya Integration**: Hosting the markdown editor

Key files:

- `main.js` - Vue app initialization
- `pages/app.vue` - Main editor page
- `pages/preference.vue` - Settings page
- `store/editor.js` - Core editor state

### Preload Script (`src/preload/`)

Bridges main and renderer with safe API exposure:

```javascript
// Exposed APIs
window.electron = {
  ipcRenderer,
  shell,
  clipboard,
  webUtils
}
window.nodePath // Node.js path module
window.nodeFs // fs-extra wrapper
window.rgPath // ripgrep binary path
```

## Data Flow

### Opening a File

```
User clicks "Open File"
        │
        ▼
Main Process: Show native dialog
        │
        ▼
Main Process: Read file, detect encoding
        │
        ▼
IPC: mt::open-new-tab (content, metadata)
        │
        ▼
Renderer: editor store creates tab state
        │
        ▼
Renderer: Muya loads markdown content
        │
        ▼
Renderer: File tree updates
```

### Saving a File

```
User triggers save (Ctrl+S)
        │
        ▼
Renderer: Get content from Muya
        │
        ▼
IPC: mt::save-file (content, path)
        │
        ▼
Main Process: Write to disk
        │
        ▼
Main Process: Update watcher
        │
        ▼
IPC: mt::file-saved (success)
        │
        ▼
Renderer: Update tab state (saved)
```

## Module System

| Context      | Module Type      | Reason                        |
| ------------ | ---------------- | ----------------------------- |
| Main Process | CommonJS         | Electron main requires CJS    |
| Preload      | CommonJS         | Electron preload requires CJS |
| Renderer     | ES Modules       | Modern Vue 3 + Vite           |
| Muya         | Mixed (CJS-like) | Legacy, uses bundled deps     |

## State Management

### Pinia Store Structure

```
src/renderer/src/store/
├── index.js          # Root store (platform, version)
├── editor.js         # Tabs, files, content (~46KB)
├── preferences.js    # User settings
├── layout.js         # UI layout state
├── project.js        # Open folder state
├── treeCtrl.js       # File tree control
├── commandCenter.js  # Command palette
├── notification.js   # Toast messages
├── autoUpdates.js    # Update checking
└── listenForMain.js  # IPC event handlers
```

### Key Store: Editor

The editor store (`editor.js`) is the largest and most critical:

```javascript
// Simplified state
{
  tabs: [],              // Open document tabs
  currentFile: null,     // Active tab
  treeData: [],          // File tree
  searchMatches: [],     // Search results
  wordCount: {},         // Document statistics
}
```

## The Muya Editor Engine

Muya is the custom WYSIWYG markdown editor. It's located in `src/muya/` and provides:

### Core Components

- **ContentState**: Document model (AST-like block structure)
- **Parser**: Markdown tokenization (extended marked.js)
- **Renderer**: DOM generation via snabbdom
- **EventHandlers**: Keyboard, mouse, clipboard, drag-drop
- **UI Components**: Emoji picker, table tools, format picker

### Data Structure

Documents are represented as blocks:

```javascript
{
  type: 'paragraph',
  text: 'Hello **world**',
  children: [],
  // ... metadata
}
```

### Integration Points

Muya is mounted in `app.vue` and communicates via events:

```javascript
// Muya → Vue
muya.on('change', ({ markdown, wordCount }) => {
  editorStore.updateContent(markdown)
})

// Vue → Muya
muya.setContent(markdown)
```

## Configuration

### User Preferences

Schema: `src/main/preferences/schema.json`

Categories:

- **General**: Auto-save, language, zoom, startup behavior
- **Editor**: Fonts, line height, code blocks
- **Markdown**: Extensions, parsing options
- **Theme**: Colors, appearance
- **Keybindings**: Keyboard shortcuts
- **Image**: Upload settings, paths

### Build Configuration

- `electron.vite.config.mjs` - Vite bundler config
- `electron-builder.yml` - Packaging config
- `package.json` - Scripts and dependencies

## Internationalization

9 languages supported:

- English (en)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Korean (ko)
- Portuguese (pt)

Translation files: `static/locales/*.json`

Usage:

```javascript
// Vue component
{
  {
    $t('menu.file.open')
  }
}

// Main process
import { t } from './i18n'
t('dialog.save.title')
```

## Security Model

- **Context Isolation**: Enabled where possible
- **Node Integration**: Enabled (required for file operations)
- **Web Security**: Disabled (local file access)
- **Credentials**: Stored via keytar (OS keychain)
- **HTML Sanitization**: DOMPurify for rendered content

## Further Reading

- [Developer Setup](dev/README.md)
- [Build Instructions](dev/BUILD.md)
- [IPC Documentation](dev/code/IPC.md)
- [Contributing Guide](../README.md)
