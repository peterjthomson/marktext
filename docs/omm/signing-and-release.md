# Signing and releasing Oh My Marktext

Notarized macOS builds are a product feature of this fork, not a build detail: the point is that a non-technical colleague can double-click the DMG and get a working app. This document covers what has to be in place for that.

## One-time setup

### 1. Developer ID certificate

You need a **Developer ID Application** certificate (not "Apple Development", not "Mac App Distribution") from an Apple Developer Program membership.

Export it from Keychain Access as a `.p12` with a password, then base64-encode it for CI:

```bash
base64 -i DeveloperID.p12 | pbcopy
```

### 2. App-specific password

Generate one at [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords. This is **not** your Apple ID password.

### 3. Repository secrets

In GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `MAC_CERTS` | Base64-encoded Developer ID `.p12` |
| `MAC_CERTS_PASSWORD` | Password for the `.p12` |
| `APPLE_ID` | Apple Developer account email |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from step 2 |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

`release.yml` maps `MAC_CERTS` → `CSC_LINK` and `MAC_CERTS_PASSWORD` → `CSC_KEY_PASSWORD` at build time, and **fails the job** if any secret is missing rather than quietly publishing unsigned artifacts.

## How it is wired

- `packages/desktop/electron-builder.yml` sets `mac.notarize: true`. electron-builder reads `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` from the environment.
- Entitlements live at `packages/desktop/build/mac/entitlements.mac.plist` (inherited from upstream — JIT, unsigned executable memory, dyld environment variables, and library validation disabled; all required by Electron).
- `.github/workflows/release.yml` builds signed+notarized macOS artifacts on `v*` tags.
- `.github/workflows/build.yml` is the unsigned CI smoke build; it sets `CSC_IDENTITY_AUTO_DISCOVERY: false` so it does not attempt notarization without release secrets.

## appId is load-bearing

The signing identity must be authorised for the `appId` in `electron-builder.yml`:

```
com.peterjthomson.ohmy-marktext
```

**Never change the appId once users have installed.** It determines the macOS bundle identifier, the user-data directory, and the auto-update identity — changing it orphans preferences and silently breaks updates for existing installs.

## Local builds

Local development needs none of this:

```bash
pnpm dev            # no signing involved
pnpm build:mac      # skips signing if no Developer ID is in your keychain
```

To do a full signed build locally, copy `.env.example` to `.env` and fill in the Apple values. To force-skip signing on a machine that *does* have a certificate:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm build:mac
```

## Verifying a release

On a clean Mac (or after clearing quarantine state), the acceptance test is simply:

1. Download the `.dmg` from the release page.
2. Open it, drag the app to Applications, launch it.
3. No Gatekeeper warning, no `xattr -cr`, no right-click-Open dance.

To check signing and notarization directly:

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/Oh My Marktext.app"
spctl --assess --type execute --verbose "/Applications/Oh My Marktext.app"
# expect: accepted / source=Notarized Developer ID
```

## Update feed

`electron-builder.yml` pins an explicit `publish` block to `peterjthomson/marktext`. This matters: upstream MarkText ships **no** publish config, which makes electron-updater fall back to the `repository` field in `package.json`. Without the explicit block, an Oh My Marktext build could resolve its update feed to the official MarkText releases and offer users the wrong app.

After a build, confirm the generated `app-update.yml` inside the packaged app points at this repo.
