# Omarchy Support Spec

> **Status**: Proposed  
> **Created**: 2026-01-15  
> **Target**: v1.2.0

## Overview

[Omarchy](https://world.hey.com/dhh/omarchy-is-out-4666dd31) is an opinionated Arch Linux distribution created by DHH (David Heinemeier Hansson). It uses **Hyprland** as its tiling window manager, which runs on **Wayland** (not X11).

This spec outlines the changes needed to make MarkText a first-class citizen on Omarchy.

## Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| AppImage runs | ✅ Works | Runs under XWayland compatibility |
| Native Wayland | ❌ Missing | Causes blurry text on HiDPI |
| AUR package | 🟡 Partial | PKGBUILD exists but needs updates |
| Hyprland integration | ❌ Missing | No window rules or optimizations |

## Target Audience

- Omarchy users (growing community of 6,000+ on Discord)
- Arch Linux users with Hyprland/Sway
- Any Wayland-based Linux distribution

## Requirements

### P0: Native Wayland Support

Electron apps need specific flags to run natively on Wayland instead of through XWayland.

**Current behavior**: App runs under XWayland, causing:
- Blurry/fuzzy text on HiDPI displays
- Potential input lag
- Non-native window decorations
- Poor scaling behavior

**Required changes**:

#### 1. Add Ozone Platform Detection (`src/main/index.js`)

```javascript
// Add before any app.ready or window creation
if (process.platform === 'linux') {
  // Auto-detect Wayland vs X11
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto')
  
  // Enable Wayland features
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform,WaylandWindowDecorations')
  
  // Improve font rendering on Wayland
  app.commandLine.appendSwitch('enable-wayland-ime', 'true')
}
```

#### 2. Update Desktop File (`build/linux/marktext.desktop`)

```desktop
[Desktop Entry]
Name=MarkText
Comment=Next generation markdown editor
Exec=marktext --ozone-platform-hint=auto %F
Terminal=false
Type=Application
Icon=marktext
Categories=Office;TextEditor;Utility;
MimeType=text/markdown;
Keywords=marktext;
StartupWMClass=marktext
Actions=NewWindow;

[Desktop Action NewWindow]
Name=New Window
Exec=marktext --ozone-platform-hint=auto --new-window %F
Icon=marktext
```

#### 3. Add CLI Flag (`src/main/cli/index.js`)

Add `--wayland` and `--x11` flags to force a specific backend:

```javascript
// In help text
--wayland               Force native Wayland mode
--x11                   Force X11/XWayland mode
```

### P1: Update PKGBUILD for AUR

The existing `build/linux/PKGBUILD` needs updates:

```bash
# Required changes:
pkgver=1.1.0  # Update version

# Add Wayland dependencies
depends=('electron' 'libsecret' 'libxkbfile' 'qt6-wayland')

# Update desktop file in package() to include Wayland flags
```

**AUR Submission Process**:
1. Create account on https://aur.archlinux.org
2. Generate SSH key and add to AUR account
3. Clone: `git clone ssh://aur@aur.archlinux.org/marktext.git`
4. Add PKGBUILD and .SRCINFO
5. Push to AUR

### P2: Hyprland Window Rules (Documentation)

Provide recommended Hyprland config for optimal experience:

```conf
# ~/.config/hypr/hyprland.conf

# MarkText window rules
windowrulev2 = opacity 1.0 override, class:^(marktext)$
windowrulev2 = noblur, class:^(marktext)$

# Optional: Float dialogs
windowrulev2 = float, class:^(marktext)$, title:^(Open|Save|Preferences)
```

### P3: Known Issues & Workarounds

Document these known Electron + Hyprland issues:

| Issue | Workaround | Electron Fix ETA |
|-------|------------|------------------|
| Slow startup (100s) | Clear `~/.config/marktext/GPUCache` | Unknown |
| Screen flicker on resize | Use `--disable-gpu-compositing` | Electron 40+ |
| Crash on screen share | N/A - avoid screen share | Unknown |
| IME not working | Set `--enable-wayland-ime` | Electron 39 ✅ |

### P4: Environment Variables (Documentation)

Users can set these in `~/.zshrc` or Hyprland's `exec-once`:

```bash
# Force Wayland mode for all Electron apps
export ELECTRON_OZONE_PLATFORM_HINT=wayland

# For HiDPI displays (if scaling is wrong)
export ELECTRON_FORCE_DEVICE_SCALE_FACTOR=1.5

# Debug GPU issues
export ELECTRON_ENABLE_LOGGING=1
```

## Implementation Plan

### Phase 1: Quick Wins (v1.2.0)

- [ ] Add Wayland auto-detection to `src/main/index.js`
- [ ] Update `build/linux/marktext.desktop` with Wayland flags
- [ ] Update `build/linux/PKGBUILD` version and dependencies
- [ ] Add Omarchy/Wayland section to README

### Phase 2: Full Support (v1.3.0)

- [ ] Add `--wayland` and `--x11` CLI flags
- [ ] Submit package to AUR
- [ ] Create Omarchy-specific documentation in `docs/`
- [ ] Test on actual Omarchy installation

### Phase 3: Polish (v1.4.0)

- [ ] Add Hyprland window rules to documentation
- [ ] Investigate and fix any remaining issues
- [ ] Consider Flatpak with Wayland support

## Testing

### Manual Testing Checklist

- [ ] Fresh Omarchy install (VM or bare metal)
- [ ] Install via AppImage
- [ ] Verify native Wayland with: `xlsclients` (should NOT list marktext)
- [ ] Check HiDPI rendering (no blur)
- [ ] Test window resize (no crashes)
- [ ] Test keyboard shortcuts
- [ ] Test file dialogs
- [ ] Test drag and drop

### Automated Testing

Consider adding a CI job for Arch Linux:

```yaml
# .github/workflows/test-arch.yml
test-arch:
  runs-on: ubuntu-latest
  container: archlinux:latest
  steps:
    - run: pacman -Syu --noconfirm
    - run: pacman -S --noconfirm nodejs npm
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm test
```

## References

- [Omarchy Manual](https://manuals.omamix.org/)
- [Electron Wayland Support](https://www.electronjs.org/docs/latest/api/command-line-switches#--ozone-platform-hint)
- [Hyprland Wiki - Electron](https://wiki.hyprland.org/Useful-Utilities/App-Clients/#electron)
- [Arch Wiki - Wayland](https://wiki.archlinux.org/title/Wayland)

## Open Questions

1. Should we ship a separate Wayland-optimized AppImage?
2. Should we maintain official AUR package or let community do it?
3. Do we need to support Sway (another popular Wayland compositor)?
