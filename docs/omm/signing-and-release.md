# Signing and releasing Oh My Marktext

Follow [the shared release protocol](RELEASE-PROTOCOL.md) and
[the native walkthrough](../../scripts/release/LOCAL-COMPUTER-USE.md).

The production identity remains `com.peterjthomson.ohmy-marktext`; never change
it to work around packaging or permission failures. The Apple signing identity
and `AC_PASSWORD` notarytool profile stay on the local Mac. CI stages Windows
and Linux artifacts in a draft release. macOS signing does not require exporting
private keys or credentials to CI.

`pnpm release:prepare` builds and signs the app and submits its ZIP without
waiting. After acceptance, staple it, run `pnpm release:package`, and submit the
DMG. Staple the DMG only after acceptance; the shared helper refreshes its update
feed. Plain `pnpm build:mac*` creates local installers without notarization.
Neither command uploads release assets.

Before publishing, verify the DMG and ZIP with `verify-mac-artifact.sh`, run
`MARKTEXT_SMOKE_EXECUTABLE=<absolute path> pnpm --filter marktext test:packaged`,
and walk through unchanged saves, edit/undo, real edits and external reloads in
the extracted signed package with disposable files and an isolated profile.
Windows release ZIPs are exercised by the `test-windows-package` CI action.

Stage all platform assets and a complete `SHA256SUMS.txt` in the draft. Download
and verify them again before publication. Never replace published assets or
publish early and rely on adding Mac downloads later.

The `-omm.N` version records fork provenance; stable releases are not marked
prerelease, so electron-updater can discover them. Keep `publish` pinned to
`peterjthomson/marktext` and check the packaged `app-update.yml`.

After publishing, update `Casks/oh-my-marktext.rb` with the version and SHA-256
of the final published DMG. Validate with `brew style` and an isolated test tap;
avoid replacing the user's installation. Keep architecture and minimum macOS
requirements aligned with the actual app.
