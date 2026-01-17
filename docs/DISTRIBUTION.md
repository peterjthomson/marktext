# MarkText Distribution Guide

This document covers building, packaging, and distributing MarkText for all supported platforms.

## Build System Overview

MarkText uses **electron-vite** for development and building, and **electron-builder** for packaging and distribution.

### Build Pipeline

```
Source Code
     │
     ▼
electron-vite build
     │
     ├── Main Process    → out/main/
     ├── Preload Script  → out/preload/
     └── Renderer        → out/renderer/
     │
     ▼
electron-builder
     │
     ├── Windows  → .exe installer, .zip
     ├── macOS    → .dmg, .zip
     └── Linux    → .AppImage, .deb, .rpm, .snap, .tar.gz
```

## Prerequisites

### All Platforms

- **Node.js 22.x** (same as Electron's bundled version)
- **npm** (comes with Node.js)
- **Python 3.12+** (for native module compilation)
- **Git**

### Windows

- [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)
  - Install "Desktop development with C++"
  - Add "MSVC Spectre-mitigated libs" from Individual Components
- Windows 10/11 SDK

### macOS

- Xcode Command Line Tools: `xcode-select --install`
- For code signing and notarization: Apple Developer account
- See `.env.example` for environment variable configuration

### Linux

See [Linux Development Prerequisites](dev/LINUX_DEV.md) for distribution-specific packages:

```bash
# Debian/Ubuntu
sudo apt install build-essential libx11-dev libxkbfile-dev libsecret-1-dev

# Fedora
sudo dnf install gcc-c++ libX11-devel libxkbfile-devel libsecret-devel

# Arch
sudo pacman -S base-devel libx11 libxkbfile libsecret
```

## Development Build

### Install Dependencies

```bash
git clone https://github.com/peterjthomson/marktext.git
cd marktext
npm install
```

If native modules fail to build, try:

```bash
npm run rebuild-native
```

### Run in Development

```bash
npm run dev
```

Features:

- Hot module replacement for renderer
- Fast rebuilds via Vite
- DevTools accessible via View menu
- Source maps enabled

**Note:** Main and preload changes require restart. Renderer changes hot-reload.

## Production Build

### Build Application

```bash
# Build for current platform
npm run build

# Build and package
npm run build:unpack  # Creates unpacked directory
```

### Platform-Specific Builds

```bash
# Windows (on Windows)
npm run build:win

# macOS (on macOS)
npm run build:mac

# Linux (on Linux)
npm run build:linux
```

Cross-compilation is **not recommended** due to native module dependencies.

### macOS Code Signing & Notarization

For local release builds with notarization:

1. **Set up credentials** (one-time):
   ```bash
   xcrun notarytool store-credentials "AC_PASSWORD" \
     --apple-id "YOUR_APPLE_ID" \
     --team-id "YOUR_TEAM_ID"
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your keychain profile name
   ```

3. **Build with notarization**:
   ```bash
   npm run build:mac
   ```

See `.env.example` for all available configuration options.

**Note:** GitHub Actions CI/CD uses a separate secrets-based configuration (see `.github/workflows/release.yml`). Local builds using keychain profiles are the primary development workflow.

## Package Outputs

All packages are output to `dist/`.

### Windows

| File                                   | Type           | Description                   |
| -------------------------------------- | -------------- | ----------------------------- |
| `marktext-win-x64-{version}-setup.exe` | NSIS Installer | Full installer with shortcuts |
| `marktext-win-x64-{version}.zip`       | Portable       | No installation required      |

Installer features:

- Per-user installation (no admin required)
- Desktop and Start Menu shortcuts
- Optional install directory selection
- Uninstaller included

### macOS

| File                               | Type       | Description              |
| ---------------------------------- | ---------- | ------------------------ |
| `marktext-mac-x64-{version}.dmg`   | Disk Image | Intel Macs               |
| `marktext-mac-arm64-{version}.dmg` | Disk Image | Apple Silicon            |
| `marktext-mac-x64-{version}.zip`   | Archive    | Intel Macs (portable)    |
| `marktext-mac-arm64-{version}.zip` | Archive    | Apple Silicon (portable) |

**Note:** Release builds are code signed and notarized. If you encounter security warnings with development builds, you can:

1. Right-click the app → Open, or
2. Run: `xattr -cr /Applications/MarkText.app`

### Linux

| File                                | Type           | Description            |
| ----------------------------------- | -------------- | ---------------------- |
| `marktext-linux-{version}.AppImage` | AppImage       | Universal, no install  |
| `marktext-linux-{version}.deb`      | Debian Package | Ubuntu, Debian, Mint   |
| `marktext-linux-{version}.rpm`      | RPM Package    | Fedora, RHEL, openSUSE |
| `marktext-linux-{version}.snap`     | Snap Package   | Ubuntu Snap Store      |
| `marktext-linux-{version}.tar.gz`   | Archive        | Manual installation    |

## Configuration Files

### electron-builder.yml

Main packaging configuration:

```yaml
appId: com.electron.app
productName: marktext

# Resources included in package
files:
  - '!**/.vscode/*'
  - '!src/*'
  # ... exclusions

extraResources:
  - from: build/icons
    to: icons
  - from: static
    to: static

# Platform-specific settings
win:
  target: [nsis, zip]

mac:
  target: [dmg, zip]
  notarize: true

linux:
  target: [AppImage, snap, deb, rpm, tar.gz]
  fileAssociations:
    - ext: md
      name: Markdown
```

### electron.vite.config.mjs

Build configuration:

```javascript
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['electron', ...dependencies]
      }
    }
  },
  preload: {
    build: {
      /* ... */
    }
  },
  renderer: {
    plugins: [vue(), svgLoader()],
    build: {
      /* ... */
    }
  }
})
```

## File Associations

MarkText registers for markdown file types:

| Extension   | MIME Type     |
| ----------- | ------------- |
| `.md`       | text/markdown |
| `.markdown` | text/markdown |
| `.mmd`      | text/markdown |
| `.mdown`    | text/markdown |
| `.mdtxt`    | text/markdown |
| `.mdtext`   | text/markdown |

## Localization

Before production builds, minify locale files:

```bash
npm run minify-locales
```

This creates `.min.json` versions in `static/locales/` that are:

- Smaller file size
- Stripped of comments
- Optimized for bundling

The build scripts run this automatically.

## Auto-Updates

MarkText includes `electron-updater` for auto-updates:

### Configuration

Updates are configured in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: peterjthomson
  repo: marktext
```

### Update Flow

1. App checks for updates on startup (configurable)
2. If update available, user is notified
3. Download happens in background
4. Install on next restart

### Disabling Updates

In preferences, users can:

- Disable auto-update checks
- Choose manual update checking

## Release Process

See [Release Documentation](dev/RELEASE.md) for:

- Version bumping
- Changelog generation
- GitHub Release creation
- Asset uploading

## Troubleshooting

### Native Module Build Failures

```bash
# Clear node_modules and rebuild
rm -rf node_modules
npm install

# Force rebuild native modules
npm run rebuild-native
```

### macOS Security Warnings

Users seeing "damaged app" message:

```bash
xattr -cr /Applications/MarkText.app
```

### Linux AppImage Issues

Make executable:

```bash
chmod +x marktext-linux-{version}.AppImage
```

FUSE required for AppImage. If missing:

```bash
# Ubuntu/Debian
sudo apt install fuse libfuse2
```

### Windows Installation Issues

- Ensure Visual Studio Build Tools are installed
- Run installer as administrator if needed
- Check Windows Defender isn't blocking

## CI/CD

GitHub Actions workflows can automate builds. Example workflow:

```yaml
name: Build
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
```

## Package Sizes

Approximate sizes:

| Platform       | Installer | Unpacked |
| -------------- | --------- | -------- |
| Windows        | ~80 MB    | ~250 MB  |
| macOS          | ~90 MB    | ~280 MB  |
| Linux AppImage | ~100 MB   | N/A      |
| Linux deb/rpm  | ~70 MB    | ~220 MB  |

## Related Documentation

- [Developer Setup](dev/README.md)
- [Build Details](dev/BUILD.md)
- [Linux Prerequisites](dev/LINUX_DEV.md)
- [Release Process](dev/RELEASE.md)
