# AI Agent Guide for MarkText

This guide is designed for AI agents (Claude, GPT, Copilot, etc.) loading into this repository for the first time. It provides essential context to help you understand, navigate, and contribute to this codebase effectively.

## Quick Overview

**MarkText** is a cross-platform markdown editor built with:

- **Electron 39** - Desktop application framework
- **Vue 3** - Frontend UI framework (Composition API)
- **Pinia** - State management
- **electron-vite** - Build system (Vite-based)
- **Muya** - Custom WYSIWYG markdown editor engine (in `src/muya/`)

This a new fork by **Peter Thomson** of the fork recent by [Tkaixiang](https://github.com/Tkaixiang/marktext) that modernized the original MarkText with Vue 3, Pinia, and electron-vite.

## Project Structure

```
marktext/
├── src/
│   ├── main/              # Electron main process (Node.js)
│   │   ├── app/           # App controller, window management
│   │   ├── menu/          # Application menus
│   │   ├── preferences/   # User settings (schema.json)
│   │   ├── commands/      # Command system
│   │   ├── keyboard/      # Keyboard shortcuts
│   │   ├── filesystem/    # File operations, watchers
│   │   └── windows/       # Window classes
│   │
│   ├── renderer/src/      # Electron renderer (Vue 3 SPA)
│   │   ├── pages/         # Top-level pages (app.vue, preference.vue)
│   │   ├── components/    # Vue components
│   │   ├── store/         # Pinia stores
│   │   ├── prefComponents/# Preference UI components
│   │   └── assets/        # CSS, icons, themes
│   │
│   ├── preload/           # Preload scripts (IPC bridge)
│   │
│   ├── muya/              # Markdown editor engine (DO NOT MODIFY LIGHTLY)
│   │   └── lib/
│   │       ├── contentState/  # Document state management
│   │       ├── parser/        # Markdown parsing (marked.js)
│   │       ├── ui/            # Editor UI components
│   │       └── eventHandler/  # Input handling
│   │
│   └── common/            # Shared utilities (both processes)
│
├── static/                # Static assets
│   ├── locales/           # i18n JSON files (9 languages)
│   └── preference.json    # Default preferences
│
├── docs/                  # Documentation
│   └── dev/               # Developer docs
│
├── build/                 # Build resources (icons)
├── electron-builder.yml   # Packaging configuration
└── electron.vite.config.mjs  # Vite build config
```

## Key Concepts

### 1. Process Architecture

| Process  | Location        | Module Type | Purpose                                        |
| -------- | --------------- | ----------- | ---------------------------------------------- |
| Main     | `src/main/`     | CommonJS    | System operations, window management, file I/O |
| Renderer | `src/renderer/` | ES Modules  | Vue 3 UI, user interaction                     |
| Preload  | `src/preload/`  | CommonJS    | IPC bridge, exposes safe APIs to renderer      |

### 2. IPC Communication

Main and renderer communicate via IPC with `mt::` prefixed event names:

```javascript
// Renderer → Main
window.electron.ipcRenderer.send('mt::save-file', data)

// Main → Renderer
win.webContents.send('mt::file-saved', result)
```

### 3. State Management (Pinia)

Key stores in `src/renderer/src/store/`:

- `editor.js` - Document tabs, content, file tree (largest store)
- `preferences.js` - User settings
- `layout.js` - UI layout state
- `project.js` - Open folder/project
- `commandCenter.js` - Command palette

### 4. The Muya Editor Engine

**IMPORTANT**: `src/muya/` is the core markdown editor. It's complex and tightly coupled. Modifications require deep understanding of:

- Block-based document structure
- Virtual DOM rendering (snabbdom)
- Markdown parsing pipeline

**Generally avoid modifying Muya unless absolutely necessary.**

## Common Tasks

### Adding a New Preference

1. Add to schema: `src/main/preferences/schema.json`
2. Add default: `static/preference.json`
3. Add UI: `src/renderer/src/prefComponents/[category]/index.vue`
4. Access in code: `preferencesStore.[settingName]`

### Adding a Menu Item

1. Define in: `src/main/menu/templates/[menu].js`
2. Add action: `src/main/menu/actions/[category].js`
3. Add keybinding: `src/main/keyboard/keybindings[Platform].js`

### Adding a Command

1. Define constant: `src/common/commands/constants.js`
2. Register: `src/main/commands/index.js` (main) or `src/renderer/src/commands/index.js` (renderer)

### Adding Translations

1. Add keys to all files in `static/locales/`
2. Use in Vue: `{{ $t('key.path') }}`
3. Use in main process: `import { t } from './i18n'`

## Build Commands

```bash
npm run dev          # Development with hot reload
npm run build        # Build for current platform
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux packages
npm run lint         # ESLint check
npm run format       # Prettier format
```

## Important Files to Know

| File                               | Purpose              |
| ---------------------------------- | -------------------- |
| `src/main/index.js`                | Main process entry   |
| `src/main/app/index.js`            | App controller       |
| `src/renderer/src/main.js`         | Renderer entry       |
| `src/renderer/src/pages/app.vue`   | Main editor page     |
| `src/main/preferences/schema.json` | All user preferences |
| `electron.vite.config.mjs`         | Build configuration  |
| `electron-builder.yml`             | Packaging config     |

## Code Style

- **ES Modules** in renderer, **CommonJS** in main/preload
- **Vue 3 Composition API** with `<script setup>`
- **Pinia** for state (not Vuex)
- **Element Plus** for UI components
- **No semicolons** (ESLint enforced)
- **2-space indentation**
- **No trailing spaces**

## Testing Changes

1. Run `npm run dev` for live development
2. Main/preload changes require restart
3. Renderer changes hot-reload (but may need refresh for state issues)
4. Run `npm run lint` before committing

## Common Gotchas

1. **Muya is ESM-incompatible internally** - Don't try to modernize it without major refactoring
2. **Native modules** require rebuild: `npm run rebuild-native`
3. **macOS builds aren't notarized** - Users may see security warnings
4. **i18n files need minification** for production: `npm run minify-locales`
5. **electron-store** requires special bundling (see vite config)

## Where to Find Things

| Looking for...     | Location                          |
| ------------------ | --------------------------------- |
| User preferences   | `src/main/preferences/`           |
| Keyboard shortcuts | `src/main/keyboard/`              |
| Menu definitions   | `src/main/menu/templates/`        |
| Vue components     | `src/renderer/src/components/`    |
| Pinia stores       | `src/renderer/src/store/`         |
| CSS themes         | `src/renderer/src/assets/themes/` |
| Editor engine      | `src/muya/lib/`                   |
| Translations       | `static/locales/`                 |
| Build icons        | `build/`                          |

## Getting Help

- **Existing docs**: `docs/` folder has detailed documentation
- **Developer docs**: `docs/dev/` for architecture and build info
- **Original repo**: https://github.com/marktext/marktext (historical reference)
- **This fork**: https://github.com/Tkaixiang/marktext

## Summary for Quick Reference

```
Main Process (Node.js)     →  src/main/
Renderer Process (Vue 3)   →  src/renderer/src/
Preload (IPC Bridge)       →  src/preload/
Editor Engine (Muya)       →  src/muya/
Shared Code                →  src/common/
User Preferences           →  src/main/preferences/schema.json
Translations               →  static/locales/
Build Config               →  electron-builder.yml
Vite Config                →  electron.vite.config.mjs
```

When in doubt, check the existing patterns in the codebase and follow them.
