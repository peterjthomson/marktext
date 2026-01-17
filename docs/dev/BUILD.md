# Build Instructions

This document provides legacy build context. For current build instructions, see [Developer Documentation](README.md).

## Quick Start

```bash
git clone https://github.com/peterjthomson/marktext.git
cd marktext
npm install
npm run dev        # Development
npm run build:mac  # or build:win / build:linux
```

## Prerequisites

- **Node.js 22.x** (same as Electron's bundled version)
- **Python 3.12+** (for native module compilation)

### Platform-Specific

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install build-essential libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev

# Fedora
sudo dnf install gcc-c++ libX11-devel libxkbfile-devel libsecret-devel fontconfig-devel

# Arch
sudo pacman -S base-devel libx11 libxkbfile libsecret fontconfig
```

**Windows:**

- [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)
- Install "Desktop development with C++"
- Add "MSVC Spectre-mitigated libs" from Individual Components

**macOS:**

```bash
xcode-select --install
```

## Scripts

| Script        | Description                    |
| ------------- | ------------------------------ |
| `dev`         | Run in development mode        |
| `build`       | Build application bundles      |
| `build:win`   | Build Windows packages         |
| `build:mac`   | Build macOS packages           |
| `build:linux` | Build Linux packages           |
| `lint`        | Run ESLint                     |
| `test:unit`   | Run unit tests                 |
| `test:e2e`    | Run end-to-end tests           |

See `package.json` for all available scripts.
