# Benchmark: MarkText vs Bedrock

A comprehensive comparison of two Electron-based markdown editors.

## Executive Summary

| Aspect | MarkText | Bedrock |
|--------|----------|---------|
| **Philosophy** | Feature-rich, professional markdown editor | Minimal, focused text editor |
| **Maturity** | Mature (fork of established project) | Newer project (v1.3.3) |
| **Codebase Size** | Large (~150+ source files) | Small (~40 source files) |
| **UI Framework** | Vue 3 + Pinia | React 19 |
| **Editor Engine** | Custom (Muya) + CodeMirror 5 | CodeMirror 6 |
| **Build System** | electron-vite (Vite-based) | electron-forge (Webpack) |
| **Target User** | Power users, writers, developers | Users wanting simplicity |

---

## 1. Project Philosophy & Goals

### MarkText
- **"File-first design"** - No cloud services or vault systems
- **Live WYSIWYG preview** - In-situ editing, not split-pane
- **Feature-rich** - Comprehensive markdown tooling for professionals
- **Multi-window/multi-tab** - Full project/folder management
- **Extensibility** - Plugin system via Muya editor engine

### Bedrock
- **Minimalism** - "Do one thing well" philosophy
- **Single-window interface** - Focused editing experience
- **Hybrid markdown mode** - Renders structure while editing
- **Simplicity over features** - Essential operations only
- **Fast startup** - Lightweight footprint

**Winner: Depends on use case** - MarkText for power users, Bedrock for simplicity seekers.

---

## 2. Architecture Comparison

### MarkText Architecture
```
marktext/
├── src/main/           # Electron main process (CommonJS)
│   ├── app/            # Application controller
│   ├── menu/           # Native menus
│   ├── preferences/    # Settings schema
│   ├── commands/       # Command system
│   ├── keyboard/       # Keyboard management
│   ├── filesystem/     # File operations
│   ├── windows/        # Window management
│   └── spellchecker/   # Spell checking
├── src/renderer/src/   # Vue 3 SPA (ES Modules)
│   ├── pages/          # Top-level views
│   ├── components/     # 12+ component categories
│   ├── store/          # Pinia stores (12 stores)
│   ├── services/       # Business logic
│   └── codeMirror/     # Source code mode
├── src/muya/           # Custom markdown engine
│   ├── contentState/   # Document state
│   ├── parser/         # Markdown parsing
│   ├── ui/             # 20+ UI tools
│   └── eventHandler/   # Input handling
├── src/preload/        # IPC bridge
└── src/common/         # Shared utilities
```

### Bedrock Architecture
```
bedrock/
├── src/main/
│   ├── index.ts        # Main process
│   └── preload.ts      # IPC bridge
├── src/renderer/
│   ├── app.tsx         # Main React app
│   ├── components/     # UI components (5 main + 18 UI)
│   ├── editor/codemirror/  # Editor extensions
│   ├── commands/       # Command system
│   ├── hooks/          # React hooks
│   └── lib/            # Utilities
└── src/shared/         # Type definitions
```

### Analysis

| Metric | MarkText | Bedrock |
|--------|----------|---------|
| Source Files | ~150+ | ~40 |
| Directory Depth | 4-5 levels | 3-4 levels |
| Separation of Concerns | Excellent | Good |
| Custom Components | Extensive | Minimal |

**Winner: MarkText** for architecture sophistication; **Bedrock** for simplicity.

---

## 3. Technology Stack

### Core Framework Comparison

| Component | MarkText | Bedrock |
|-----------|----------|---------|
| Electron | 39.2.7 | 37.2.4 |
| UI Framework | Vue 3.5.26 | React 19.1.1 |
| State Management | Pinia 3.0.4 | React Hooks + Refs |
| Build Tool | electron-vite 5.0 (Vite 7.3) | electron-forge (Webpack) |
| Language | JavaScript (ES Modules) | TypeScript (~4.5.4) |
| CSS Framework | PostCSS + custom | Tailwind CSS |

### Editor Engine

| Feature | MarkText (Muya) | Bedrock (CodeMirror 6) |
|---------|-----------------|------------------------|
| Type | Custom engine | Standard library |
| Markdown Support | CommonMark + GFM + Pandoc | GFM |
| WYSIWYG | Full live preview | Hybrid mode |
| Code Editing | CodeMirror 5 (source mode) | CodeMirror 6 (native) |
| Extensibility | Plugin system | Compartments |

### Dependency Count

| Category | MarkText | Bedrock |
|----------|----------|---------|
| Production Dependencies | 54 | 19 |
| Dev Dependencies | 28 | 28 |
| **Total** | **82** | **47** |

**Winner: MarkText** for newer Electron; **Bedrock** for TypeScript and lighter dependencies.

---

## 4. Feature Comparison

### Core Features

| Feature | MarkText | Bedrock |
|---------|----------|---------|
| WYSIWYG Preview | Full live preview | Hybrid mode |
| Source Code Mode | Yes (CodeMirror 5) | Raw mode toggle |
| Multi-tab Editing | Yes | No |
| Multi-window | Yes | No |
| Folder/Project Support | Yes | No |
| File Browser Sidebar | Yes | No |
| Recent Files | Yes | Via settings |
| Table of Contents | Yes | No |
| Command Palette | Yes | No |

### Markdown Support

| Feature | MarkText | Bedrock |
|---------|----------|---------|
| CommonMark | Yes | Via CodeMirror |
| GFM (GitHub Flavored) | Yes | Yes |
| Math (LaTeX/KaTeX) | Yes | No |
| Mermaid Diagrams | Yes | No |
| Flowcharts | Yes | No |
| Front Matter (YAML) | Yes | No |
| Footnotes | Yes | No |
| Superscript/Subscript | Yes | No |
| Emojis | Yes | No |

### Export/Import

| Feature | MarkText | Bedrock |
|---------|----------|---------|
| Export to HTML | Yes | Yes |
| Export to PDF | Yes (via Pandoc) | Yes (built-in) |
| Import from HTML | Yes (Turndown) | No |
| Import from Word | Yes | No |
| Pandoc Integration | Yes | No |

### Editor Features

| Feature | MarkText | Bedrock |
|---------|----------|---------|
| Spell Checker | Yes (multi-language) | No |
| Find & Replace | Yes (ripgrep) | Yes (basic) |
| Auto-pairing | Yes | Via CodeMirror |
| Typewriter Mode | Yes | No |
| Focus Mode | Yes | No |
| Line Numbers | Yes | Via CodeMirror |
| Syntax Highlighting | Yes (Prism.js) | Via CodeMirror |

### Customization

| Feature | MarkText | Bedrock |
|---------|----------|---------|
| Themes | 6+ built-in | System-aware |
| Custom Keybindings | Yes | Yes |
| UI Scaling | Yes | Yes |
| Font Customization | Yes | Text size only |
| Internationalization | 9 languages | No |

**Winner: MarkText** - Significantly more features across all categories.

---

## 5. Code Quality & Testing

### MarkText

**Testing Infrastructure:**
- **Unit Tests**: Vitest 4.0.16
- **E2E Tests**: Playwright 1.57.0
- **Test Files**: 4 unit test files + E2E suite
- **Coverage**: Core utilities, filesystem, config

**Code Quality Tools:**
- ESLint 9.39.2 with neostandard
- Prettier 3.7.4
- Vue-specific linting
- i18n JSON validation

**Test Example (vitest):**
```javascript
describe('encoding utilities', () => {
  it('should detect character encoding', () => {
    // Tests pure functions
  });
});
```

### Bedrock

**Testing Infrastructure:**
- **Test Framework**: Custom test runner (no standard framework)
- **Test Files**: 2 test files
- **Coverage**: Keyboard shortcuts only

**Code Quality Tools:**
- ESLint with TypeScript
- Type checking via TypeScript ~4.5.4

**Test Example (custom):**
```typescript
runTest('bold command inserts ****', () => {
  const view = new FakeView('');
  // Manual assertion
});
```

### Analysis

| Metric | MarkText | Bedrock |
|--------|----------|---------|
| Test Framework | Standard (Vitest) | Custom |
| E2E Testing | Playwright | None |
| Test Coverage | Broader | Narrow |
| Type Safety | None (JavaScript) | TypeScript |
| Linting Rules | Comprehensive | Basic |

**Winner: MarkText** for testing; **Bedrock** for type safety.

---

## 6. Build System & Development Experience

### MarkText (electron-vite)

**Advantages:**
- Hot Module Replacement for renderer
- Fast build times (Vite)
- Path aliases (`@`, `common`, `muya`)
- Modern ES Modules

**Scripts:**
```json
{
  "dev": "electron-vite dev",
  "build": "electron-vite build",
  "build:win": "electron-builder --win",
  "build:mac": "electron-builder --mac",
  "build:linux": "electron-builder --linux"
}
```

### Bedrock (electron-forge)

**Advantages:**
- TypeScript compilation
- Standard Webpack ecosystem
- Platform-specific makers

**Scripts:**
```json
{
  "start": "electron-forge start",
  "package": "electron-forge package",
  "build": "electron-forge make"
}
```

### Comparison

| Aspect | MarkText | Bedrock |
|--------|----------|---------|
| Build Speed | Fast (Vite) | Moderate (Webpack) |
| HMR Support | Yes (renderer only) | Limited |
| Configuration | Minimal | Standard Webpack |
| Platform Makers | electron-builder | electron-forge |
| Native Module Support | @electron/rebuild | Auto-handled |

**Winner: MarkText** - Modern Vite-based build is faster and simpler.

---

## 7. Security

### MarkText Security Measures
- Node integration disabled in renderer
- IPC communication with `mt::` prefix convention
- Preload script isolation
- DOMPurify for HTML sanitization
- electron-store for secure settings

### Bedrock Security Measures
- Node integration disabled in renderer
- contextBridge for API exposure
- File extension validation
- URL protocol filtering (HTTP/HTTPS only)
- Input validation in main process

### Comparison

| Security Feature | MarkText | Bedrock |
|------------------|----------|---------|
| Node Isolation | Yes | Yes |
| IPC Validation | Convention-based | Explicit |
| Content Sanitization | DOMPurify | Native |
| URL Validation | Not documented | Yes |
| File Validation | Yes | Yes |

**Winner: Tie** - Both follow Electron security best practices.

---

## 8. Documentation Quality

### MarkText Documentation
```
docs/
├── dev/
│   ├── ARCHITECTURE.md     # Architecture overview
│   ├── BUILD.md            # Build instructions
│   ├── DEBUGGING.md        # Debugging guide
│   └── ...                 # 8 dev docs total
├── OVERVIEW.md             # Feature overview
├── BASICS.md               # User guide
├── PREFERENCES.md          # Settings docs
├── KEYBINDINGS_*.md        # Platform-specific (3 files)
└── agents.md               # AI agent guidelines
```

**Total:** ~20 documentation files

### Bedrock Documentation
```
docs/
├── markdown-preview.md     # Preview feature
└── releasing.md            # Release process
README.md                   # Main docs
AGENTS.md                   # AI agent guidelines
```

**Total:** ~4 documentation files

### Analysis

| Aspect | MarkText | Bedrock |
|--------|----------|---------|
| User Documentation | Comprehensive | Minimal |
| Developer Documentation | Extensive | Basic |
| Architecture Docs | Detailed | In AGENTS.md |
| Localization Docs | Yes | No |
| API Documentation | Partial | No |

**Winner: MarkText** - Significantly more comprehensive documentation.

---

## 9. Performance Considerations

### MarkText
**Pros:**
- Vite-based build for fast startup
- Virtual DOM (Snabbdom) for efficient rendering
- Block-based document model in Muya

**Cons:**
- Large dependency tree (82 packages)
- Custom editor engine (Muya) complexity
- Memory footprint for multiple tabs/windows

### Bedrock
**Pros:**
- Minimal dependency count (47 packages)
- CodeMirror 6's efficient architecture
- Single-window design (lower memory)

**Cons:**
- Webpack build (slower than Vite)
- React 19 (newer, less battle-tested)

### Estimated Impact

| Metric | MarkText | Bedrock |
|--------|----------|---------|
| Startup Time | Moderate | Fast |
| Memory Usage | Higher (multi-tab) | Lower |
| Bundle Size | Larger | Smaller |
| Editor Performance | Custom optimized | CodeMirror 6 optimized |

**Winner: Bedrock** for performance; **MarkText** for feature density trade-off.

---

## 10. Maintainability

### MarkText
**Strengths:**
- Clear module boundaries
- Comprehensive documentation
- Established patterns from original project
- Active fork with modernization

**Challenges:**
- Large codebase to maintain
- Custom Muya engine requires specialized knowledge
- JavaScript lacks type safety

### Bedrock
**Strengths:**
- Small codebase (~40 files)
- TypeScript for type safety
- Standard CodeMirror 6 (well-documented)
- Simpler mental model

**Challenges:**
- Custom test framework (non-standard)
- Limited documentation
- Fewer contributors

### Comparison

| Factor | MarkText | Bedrock |
|--------|----------|---------|
| Code Complexity | High | Low |
| Type Safety | None | TypeScript |
| Standard Libraries | Mixed | High (CodeMirror 6) |
| Documentation | Excellent | Basic |
| Bus Factor Risk | Moderate | Higher |

**Winner: Tie** - Different trade-offs (scale vs simplicity).

---

## 11. Community & Ecosystem

### MarkText
- **History:** Fork of original MarkText (widely known)
- **Stars:** Original project ~49k stars
- **Ecosystem:** Established user base, themes, plugins

### Bedrock
- **History:** New project (~201 commits)
- **Stars:** 4 stars
- **Ecosystem:** Early stage

**Winner: MarkText** - Established community and ecosystem.

---

## 12. Summary Scorecard

| Category | MarkText | Bedrock | Winner |
|----------|----------|---------|--------|
| Features | 10/10 | 4/10 | MarkText |
| Architecture | 9/10 | 7/10 | MarkText |
| Code Quality | 8/10 | 7/10 | MarkText |
| Testing | 8/10 | 4/10 | MarkText |
| Documentation | 9/10 | 4/10 | MarkText |
| Performance | 6/10 | 8/10 | Bedrock |
| Simplicity | 4/10 | 9/10 | Bedrock |
| Type Safety | 3/10 | 8/10 | Bedrock |
| Build System | 9/10 | 6/10 | MarkText |
| Security | 8/10 | 8/10 | Tie |
| **TOTAL** | **74/100** | **65/100** | **MarkText** |

---

## 13. Recommendations

### Choose MarkText if you need:
- Full-featured markdown editing
- Multi-tab/multi-window workflow
- Project/folder management
- Rich markdown extensions (math, diagrams)
- Spell checking and internationalization
- Export to multiple formats

### Choose Bedrock if you need:
- Simple, focused markdown editing
- Faster startup and lower memory
- TypeScript codebase
- Easier code contribution
- Modern CodeMirror 6 base
- Minimal learning curve

---

## 14. Detailed Technical Comparison

### IPC Communication

**MarkText:**
```javascript
// Prefix convention: mt::
window.electron.ipcRenderer.send('mt::open-file', path);
window.electron.ipcRenderer.on('mt::file-loaded', callback);
```

**Bedrock:**
```typescript
// Typed API surface
window.electronAPI.openFile();
window.electronAPI.saveFile(content);
```

### State Management

**MarkText (Pinia):**
```javascript
// 12 domain-specific stores
const editorStore = useEditorStore();
const preferencesStore = usePreferencesStore();
```

**Bedrock (React Hooks):**
```typescript
// Single component state
const [doc, setDoc] = useState('');
const [settings, setSettings] = useState({});
```

### Editor Integration

**MarkText (Muya):**
```javascript
// Custom plugin system
Muya.use(TablePicker);
Muya.use(EmojiPicker);
const muya = new Muya(container, options);
```

**Bedrock (CodeMirror 6):**
```typescript
// Compartment-based extensions
const themeCompartment = new Compartment();
const extensions = [
  markdown({ base: markdownLanguage }),
  themeCompartment.of(theme)
];
```

---

## 15. Conclusion

MarkText and Bedrock represent two different philosophies in markdown editor design:

**MarkText** is a mature, feature-rich application suitable for users who need comprehensive markdown editing capabilities, project management, and extensive customization. Its architecture is sophisticated but well-documented.

**Bedrock** is a minimal, focused editor ideal for users who prefer simplicity over features. Its TypeScript codebase and CodeMirror 6 foundation make it easier to understand and contribute to, though it lacks the depth of MarkText.

The choice between them depends entirely on user needs: power and features (MarkText) vs. simplicity and performance (Bedrock).

---

*Benchmark conducted: January 2026*
*MarkText version: 1.0.1*
*Bedrock version: 1.3.3*
