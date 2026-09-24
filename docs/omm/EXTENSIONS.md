# Oh My Marktext extension layer

Oh My Marktext is a sister fork: it tracks upstream MarkText and carries a
small set of deltas. Everything in this document exists to keep the next
upstream merge cheap — the fork's value is the deltas, not the divergence.

## The three kinds of delta

| Kind       | Where it lives                                                          | Merge cost                                     |
| ---------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| **Module** | a new file under an `omm/` directory                                    | zero — upstream never touches it               |
| **Hook**   | one or two marked lines inside an upstream file that call into a module | near-zero — conflicts are trivially resolvable |
| **Patch**  | an in-place change to upstream logic that cannot be factored out        | real — every merge has to re-check it          |

Rules, in priority order:

1. **Prefer a module.** Fork logic goes in `omm/`, never inline in an upstream file.
2. **A hook is a call, not an implementation.** If a hook site grows past a couple of lines, it belongs in a module.
3. **Mark every hook and patch with `OMM`** in a comment on or immediately above the changed line. `pnpm omm:deltas` uses these markers, and so does the person resolving a merge conflict at 5pm.
4. **Every patch is a bug**, in the sense that it should have a plan: upstream it, or record why it can't be.
5. **New tests for fork behaviour go under `test/unit/specs/omm/`.**

## Where the module layer lives

```
packages/desktop/src/common/omm/
  brand.ts                     product identity (names, URLs, slug, appId)
  lightTouch.ts                pure merge: normalize + LCS + getMarkdownForSave
  themes.ts                    fork theme metadata (id, label, background, isDark)
packages/desktop/src/main/keyboard/omm/
  keybindingOverrides.ts       accelerator overrides applied to upstream keymaps
packages/desktop/src/renderer/src/omm/
  lightTouchSave.ts            save-path wiring and merge-baseline bookkeeping
  saveState.ts                 clean source snapshots and non-text dirty state
  savingSpinner.ts             title-bar in-flight save indicator timing
  trashedTabs.ts               tabs affected by a sidebar "move to trash"
packages/desktop/test/unit/specs/omm/
  *.spec.ts                    fork behaviour + guards against silent drift
packages/desktop/src/renderer/src/assets/themes/
  tufte.theme.css              fork theme (+ prismjs/tufte.theme.css)
packages/desktop/build/
  validate-native-modules.cjs  rejects wrong-platform Windows native modules
  make-mac-icns.sh             regenerates the mac icon on Apple's 824/1024 grid
```

Build config cannot import TypeScript, so `packages/desktop/package.json` and
`packages/desktop/electron-builder.yml` duplicate values from `brand.ts`.
`test/unit/specs/omm/brand.spec.ts` fails if they drift apart.

## Delta ledger

Every upstream file this fork modifies is listed here. `pnpm omm:deltas`
compares this table against the real diff and fails on anything undocumented.

### Desktop — hooks

| File                                                               | Feature                          | What the delta is                                                                                                                                                                       | Upstreamable?                                                                                                   |
| ------------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `packages/desktop/src/renderer/src/store/editor.ts`                | Light Touch, save state, save spinner, trash | Import block plus save-state hooks for content, file settings, disk changes and save acknowledgements; one-line calls at each save path, save-confirm and save-failure handler; `isSaving` state field; `CLOSE_TABS_FOR_TRASHED_PATH` action delegating to `omm/trashedTabs` | Trash fix yes ([#4867 candidate](https://github.com/marktext/marktext/issues)); Light Touch after it proves out |
| `packages/desktop/src/renderer/src/store/help.ts`                  | Light Touch                      | Baseline fields on the default document state and `initialBaseline()` in `createDocumentState`                                                                                          | With Light Touch                                                                                                |
| `packages/desktop/src/renderer/src/store/project.ts`               | Trash                            | `.then()` on the trash IPC to close the doomed tabs                                                                                                                                     | Yes                                                                                                             |
| `packages/desktop/src/renderer/src/store/preferences.ts`           | Light Touch                      | `lightTouch` field, default true                                                                                                                                                        | With Light Touch                                                                                                |
| `packages/desktop/src/shared/types/files.ts`                       | Light Touch                      | `originalMarkdown` / `pendingSavedMarkdown` on `IFileState`                                                                                                                             | With Light Touch                                                                                                |
| `packages/desktop/src/shared/types/preferences.ts`                 | Light Touch                      | `lightTouch` on `IUserPreferences`                                                                                                                                                      | With Light Touch                                                                                                |
| `packages/desktop/src/main/preferences/schema.json`                | Light Touch                      | `lightTouch` boolean, default true                                                                                                                                                      | With Light Touch                                                                                                |
| `packages/desktop/src/main/config.ts`                              | Branding                         | `GITHUB_REPO_URL` reads from `brand.ts`                                                                                                                                                 | No — fork identity                                                                                              |
| `packages/desktop/src/main/windows/editor.ts`                      | Branding                         | Linux icon path uses `OMM_SLUG`                                                                                                                                                         | No — fork identity                                                                                              |
| `packages/desktop/src/main/windows/setting.ts`                     | Branding                         | Linux icon path uses `OMM_SLUG`                                                                                                                                                         | No — fork identity                                                                                              |
| `packages/desktop/src/common/theme.ts`                             | Tufte theme                      | Window-background map entry and dark-id predicate, both fed from `common/omm/themes.ts`                                                                                                 | No — fork theme                                                                                                 |
| `packages/desktop/src/main/menu/templates/theme.ts`                | Tufte theme                      | Spread of `ommLightThemeMenuEntries` / `ommDarkThemeMenuEntries` into upstream's two tables                                                                                             | No — fork theme                                                                                                 |
| `packages/desktop/src/renderer/src/prefComponents/theme/config.ts` | Tufte theme                      | Spread of `OMM_THEMES` into the preferences grid list                                                                                                                                   | No — fork theme                                                                                                 |
| `packages/desktop/src/renderer/src/util/themeColor.ts`             | Tufte theme                      | Two `?inline` CSS imports and a `tufte()` export; the bundler needs literal imports so this cannot be data-driven                                                                       | No — fork theme                                                                                                 |
| `packages/desktop/src/renderer/src/util/theme.ts`                  | Tufte theme                      | Import plus one `case 'tufte'` in the theme switch                                                                                                                                      | No — fork theme                                                                                                 |
| `packages/desktop/src/main/keyboard/keybindingsDarwin.ts`          | Keybindings                      | Import plus `withOmmKeybindings('darwin', …)` on export; map body untouched                                                                                                             | Zoom-vs-heading conflict is a real upstream bug — worth a PR                                                    |
| `packages/desktop/src/main/keyboard/keybindingsLinux.ts`           | Keybindings                      | As above, `linux`                                                                                                                                                                       | As above                                                                                                        |
| `packages/desktop/src/main/keyboard/keybindingsWindows.ts`         | Keybindings                      | As above, `windows`; also unbinds print from Ctrl+P, which shadowed quick-open                                                                                                          | As above                                                                                                        |

### Desktop — patches

| File                                                                | Feature      | Why it can't be a module                                                                   | Plan                                          |
| ------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `packages/desktop/src/main/menu/templates/help.ts`                  | Branding     | Upstream hard-codes each URL in a menu item; the fork also adds a "Based on MarkText" item | Stays a patch; conflicts are mechanical       |
| `packages/desktop/src/renderer/src/components/about/index.vue`      | Branding     | Product name and two credit rows are markup                                                | Stays a patch                                 |
| `packages/desktop/src/renderer/src/components/titleBar/index.vue`   | Save spinner | Spinner markup + CSS sit inside the upstream template                                      | Offer upstream — it is a plain UX improvement |
| `packages/desktop/src/renderer/src/prefComponents/editor/index.vue` | Light Touch  | Preference row is markup                                                                   | With Light Touch                              |
| `packages/desktop/src/renderer/src/prefComponents/theme/index.vue`  | Tufte theme  | The preview grid hardcodes a CSS block per theme, so a fork theme needs its own swatch     | Stays a patch; additive and low conflict risk |
| `packages/desktop/static/locales/en.json`                           | All          | Upstream owns the locale files; the fork adds keys                                         | Additive, low conflict risk                   |

| `packages/desktop/static/locales/de.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/es.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/fr.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/ja.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/ko.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/nl.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/pt.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/ru.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/tr.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/zh-CN.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |
| `packages/desktop/static/locales/zh-TW.json` | Fork strings | English fallbacks for the seven fork-specific labels; retain upstream locale parity | Fork-specific |

### Muya engine — patches

Highest-risk category: `packages/muya` is upstream's engine rewrite and moves
fast. Keep this list short, and prefer upstream PRs over carrying a patch.

| File                                                   | Feature          | What the delta is                                                                             | Plan                                                          |
| ------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `packages/muya/src/inlineRenderer/renderer/htmlTag.ts` | Empty-anchor fix | Childless HTML tags resolve visibility through `getClassName` instead of being forced visible | Upstream bug fix — send as a PR                               |
| `packages/muya/src/ui/paragraphFrontMenu/config.ts`    | Front-menu order | "New Paragraph" leads instead of "Duplicate"                                                  | Product preference; would need to be configurable to upstream |
| `packages/muya/src/ui/paragraphFrontMenu/index.ts`     | Front-menu order | Frontmatter filter keys off the item label rather than index 0                                | Robustness fix — send as a PR regardless of the reorder       |

### Tests and developer documentation

| File | Feature | What the delta is | Upstreamable? |
| --- | --- | --- | --- |
| `packages/desktop/test/e2e/all-blocks-roundtrip.spec.ts` | Light Touch save | Check both preserved disk formatting and the opt-out canonical serialization path | Fork-specific |
| `packages/desktop/test/unit/specs/source-mode-dirty.spec.ts` | Save state | Source undo, real save acknowledgement, settings changes and disk reload regressions | Yes, alongside the save-state fix |
| `packages/website/content/docs/dev/README.md` | Developer setup | Fork clone URL, platform build commands and packaged launch check | Build and test instructions yes; clone URL is fork-specific |
| `packages/website/content/docs/dev/BUILD.md` | Build instructions | Distinguish compilation from installers; document Windows native dependencies | Yes |

### Build, CI and docs

Fork-owned by definition, not tracked as deltas: `.github/workflows/*`,
`.env.example`, `.gitignore`, `eslint.config.js`, `README.md`, `CLAUDE.md`, `docs/*`, `scripts/omm-deltas.ts`, `scripts/omm-upstream.ts`,
`packages/desktop/build/notarize-dmg.cjs`, `packages/desktop/build/refresh-update-info.cjs`,
`packages/desktop/build/make-mac-icns.sh`, `scripts/release/*`,
`docs/omm/RELEASE-PROTOCOL.md`,
`packages/desktop/src/renderer/src/assets/themes/tufte.theme.css`,
`packages/desktop/src/renderer/src/assets/themes/prismjs/tufte.theme.css`,
`packages/desktop/electron-builder.yml`,
`packages/desktop/package.json`, `package.json`,
`packages/desktop/static/oh-my-marktext/*`, and anything under an `omm/`
directory or `test/unit/specs/omm/`.

## Merging an upstream release

Track published upstream releases, including explicitly chosen release candidates,
as complete baselines. Individual backports are reserved for urgent security or
data-loss fixes. The current baseline is pinned by tag **and commit** in
[`upstream.json`](upstream.json); `develop` is never the audit baseline.

```bash
git fetch upstream tag <upstream-tag>
git switch -c codex/upstream-<version> main
git merge --no-ff --no-commit <upstream-tag>
```

1. Resolve conflicts, preserving the fork modules and their hooks. Remove patches
   adopted upstream. Review clean merges too, especially save state and preferences.
2. Update `upstream.json`: the new upstream tag and peeled commit, the previous
   upstream commit, and the latest published fork release tag and commit. On this
   first recorded upgrade, `previousUpstreamCommit` is the actual inherited
   commit (`c907b29c`), which was newer than our old README's rc.1 label.
3. Run `pnpm omm:upstream` and `pnpm omm:deltas --check`. The ratchet accepts a
   pending merge locally; CI requires the committed branch to contain the pinned
   release and the previous fork release. It also compares against the PR base
   (or previous main commit), so changing the manifest cannot hide a regression.
4. Run desktop and Muya tests, lint, typecheck, and desktop E2E. Exercise unchanged
   and edited Light Touch saves, source undo, external reload, zoom, and trash.
5. Keep the fork version in both package manifests synchronized and increasing
   (`0.20.0-omm.4` for this integration). The exact upstream RC is provenance in
   `upstream.json`, separate from the fork's update-feed version.
6. Commit the merge and open/update the PR. **Merge the PR with a merge commit**:
   squash/rebase merging would discard the upstream ancestry the ratchet checks.
7. Build and verify signed installers from the approved integration. Tag the
   approved commit, publish immutable release assets, then update the Homebrew
   checksum to the published DMG.

Never rebase published fork history, move release tags, or reset onto upstream.
If an integration fails, fix it on the integration branch; keep the last working
release available. Ancestry checks preserve history, while the fork regression
suite preserves behavior. Both are release gates.

## Adding a new fork feature

1. Write the logic as a module under the nearest `omm/` directory. Keep it pure where you can — the Light Touch merge is pure so it can be tested without Electron.
2. Add the smallest possible hook in the upstream file, marked `OMM`.
3. Add a spec under `test/unit/specs/omm/`.
4. Add a ledger row above, with an honest answer in the "upstreamable" column.
5. Run `pnpm omm:deltas` and confirm your file lands in the right category.
