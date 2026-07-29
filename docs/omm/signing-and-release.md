# Signing and releasing Oh My Marktext

Notarized macOS builds are a product feature of this fork, not a build detail: the point is that a non-technical colleague can double-click the DMG and get a working app. This document covers what has to be in place for that.

## Release topology: mac is local by design

| Platform                                 | Built by                                             | Signed                           |
| ---------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| Windows (x64, arm64)                     | `release.yml` on a `v*` tag                          | no (unsigned; no Windows cert)   |
| Linux (AppImage, deb, rpm, snap, tar.gz) | `release.yml` on a `v*` tag                          | n/a                              |
| macOS arm64                              | **locally, on a Mac with the Developer ID identity** | yes — signed, notarized, stapled |

This split is deliberate, not a gap waiting to be filled. `release.yml`'s
`preflight` job resolves the build matrix at runtime and includes mac **only**
when the Apple signing secrets exist; when they don't it ships win/linux and
says so, because an unsigned mac build is worse than no mac build for this fork.

### Why macOS is not in CI

Wiring mac into CI needs an `APPLE_APP_SPECIFIC_PASSWORD` (or an App Store
Connect API key). Neither can be produced from a developer machine:

- App-specific passwords are minted only at appleid.apple.com. There is no CLI.
- `notarytool store-credentials` profiles (this repo uses `AC_PASSWORD`, see
  `.env`) live in the **data-protection keychain**, which the `security` CLI
  cannot read — `security find-generic-password` reports the item absent even
  while `notarytool` authenticates against it. So an existing profile cannot be
  reverse-engineered into CI secrets.
- Transporter and Xcode hold neither an app-specific password nor an exportable
  App Store Connect key.

The Developer ID certificate itself _can_ be exported (`security export`, with
one interactive keychain approval for the private key's ACL), so the blocker is
only ever the account credential.

**If you later want mac in CI**, the two paths are an App Store Connect API key
(`.p8`, no expiry, revocable per-key — preferred) or an app-specific password,
plus the five secrets below. Until then, no action is needed and nothing is
broken.

<details>
<summary>Secrets <code>release.yml</code> would consume if provisioned</summary>

| Secret                        | Value                                                            |
| ----------------------------- | ---------------------------------------------------------------- |
| `MAC_CERTS`                   | Base64-encoded Developer ID `.p12` (`base64 -i DeveloperID.p12`) |
| `MAC_CERTS_PASSWORD`          | Password for the `.p12`                                          |
| `APPLE_ID`                    | Apple Developer account email                                    |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com                     |
| `APPLE_TEAM_ID`               | Apple Developer Team ID (`R4RRG93J68`)                           |

`release.yml` maps `MAC_CERTS` → `CSC_LINK` and `MAC_CERTS_PASSWORD` →
`CSC_KEY_PASSWORD`, and fails the mac job if any are missing rather than
quietly publishing unsigned artifacts.

</details>

## Cutting a release

Local setup needed once: a **Developer ID Application** certificate in the
login keychain, and `.env` containing `APPLE_KEYCHAIN_PROFILE=<notarytool
profile name>` (create one with `xcrun notarytool store-credentials`).

```bash
# 1. Bump the version in package.json and packages/desktop/package.json
#    to <upstream version>-omm.N, commit, and push main.

# 2. Tag and push. This starts release.yml, which builds win/linux, creates a
#    draft release with those assets plus SHA256SUMS.txt, then publishes it.
git tag -a v0.20.0-omm.N -m "Oh My Marktext 0.20.0-omm.N"
git push origin v0.20.0-omm.N

# 3. Build, sign, notarize and staple mac from the *tagged* tree, so the
#    artifact matches the tag. Takes ~10 min including Apple's round trip.
#    The build script runs build/refresh-update-info.cjs afterwards, which
#    corrects the DMG checksums that stapling invalidates.
pnpm build:mac:arm64

# 4. Verify before uploading anything.
spctl -a -vv "dist/mac-arm64/Oh My Marktext.app"    # expect: accepted / Notarized Developer ID
xcrun stapler validate dist/oh-my-marktext-mac-arm64-*.dmg
#    And confirm latest-mac.yml matches the bytes on disk:
shasum -a 512 dist/oh-my-marktext-mac-arm64-*.dmg | ...   # vs sha512 in dist/latest-mac.yml

# 5. Upload the mac artifacts to the release the workflow published.
cd dist && gh release upload v0.20.0-omm.N \
  oh-my-marktext-mac-arm64-*.dmg oh-my-marktext-mac-arm64-*.dmg.blockmap \
  oh-my-marktext-mac-arm64-*.zip oh-my-marktext-mac-arm64-*.zip.blockmap \
  latest-mac.yml

# 6. SHA256SUMS.txt is generated in CI from win/linux only, so extend it.
gh release download v0.20.0-omm.N -p SHA256SUMS.txt -D /tmp
shasum -a 256 oh-my-marktext-mac-arm64-*.dmg oh-my-marktext-mac-arm64-*.dmg.blockmap \
  oh-my-marktext-mac-arm64-*.zip oh-my-marktext-mac-arm64-*.zip.blockmap latest-mac.yml \
  >> /tmp/SHA256SUMS.txt
sort -k2 /tmp/SHA256SUMS.txt -o /tmp/SHA256SUMS.txt
gh release upload v0.20.0-omm.N /tmp/SHA256SUMS.txt --clobber
```

Steps 5 and 6 are manual because the mac artifacts are produced off-CI. If a
release ever ships without them, `gh release view <tag>` showing no
`*-mac-arm64-*` assets is the tell.

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

To do a full signed build locally, copy `.env.example` to `.env` and fill in the Apple values. To force-skip signing on a machine that _does_ have a certificate:

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

Stapling rewrites the DMG _after_ electron-builder has hashed it, so the
`sha512`/`size` it wrote into `latest-mac.yml` no longer describe the shipped
file. `build/refresh-update-info.cjs` fixes this as a post-build step in the
`build:mac*` scripts. It cannot run from electron-builder's
`afterAllArtifactBuild` hook, which fires _before_ the feed is written — that
mistake silently published wrong DMG checksums for every release up to
0.20.0-omm.1.
