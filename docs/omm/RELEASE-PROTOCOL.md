# Oh My Marktext release checks

The build, signing, notarization and publishing procedure is documented in
[signing-and-release.md](signing-and-release.md). Keep the existing
`pnpm build:mac:arm64` path: electron-builder notarizes the app, the
`notarize-dmg.cjs` hook notarizes the DMG, and the post-build checksum step
refreshes the update feed. The release workflow can include macOS when its
required signing secrets are configured.

This repository owns its release tooling. Changes do not require corresponding
changes in other applications, and signing credentials must be configured for
the actual release environment.

Before uploading, run `scripts/release/verify-mac-artifact.sh` against the final
DMG, ZIP and `latest-mac.yml` using the bundle identifier from
`packages/desktop/electron-builder.yml`. That check supplements the build; it
does not replace a native walkthrough of the installed app.

Use a disposable Markdown document with the packaged candidate. Edit and save,
inspect the saved bytes, reopen the document, and exercise the changed behavior
(such as Light Touch save, source mode or window reopening). Record candidate
version, source commit, archive checksum and observed results. Preserve existing
documents and preferences, and report any paths that could not be tested.

For a DMG submitted separately with `scripts/release/notarize.sh`, the adjacent
`refresh-feed.py` helper updates both its `files[]` checksum/size and the legacy
checksum when `path` names that artifact. The normal build's
`build/refresh-update-info.cjs` remains in place. Recheck the final downloadable
artifacts after upload; notarization alone does not prove the editor works.
