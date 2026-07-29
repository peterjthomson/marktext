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
packages/desktop/src/main/keyboard/omm/
  keybindingOverrides.ts       accelerator overrides applied to upstream keymaps
packages/desktop/src/renderer/src/omm/
  lightTouchSave.ts            save-path wiring and merge-baseline bookkeeping
  savingSpinner.ts             title-bar in-flight save indicator timing
  trashedTabs.ts               tabs affected by a sidebar "move to trash"
packages/desktop/test/unit/specs/omm/
  *.spec.ts                    fork behaviour + guards against silent drift
```

Build config cannot import TypeScript, so `packages/desktop/package.json` and
`packages/desktop/electron-builder.yml` duplicate values from `brand.ts`.
`test/unit/specs/omm/brand.spec.ts` fails if they drift apart.

## Delta ledger

Every upstream file this fork modifies is listed here. `pnpm omm:deltas`
compares this table against the real diff and fails on anything undocumented.

### Desktop — hooks

| File                                                       | Feature                          | What the delta is                                                                                                                                                                       | Upstreamable?                                                                                                   |
| ---------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `packages/desktop/src/renderer/src/store/editor.ts`        | Light Touch, save spinner, trash | Import block plus one-line calls at each save path, save-confirm and save-failure handler; `isSaving` state field; `CLOSE_TABS_FOR_TRASHED_PATH` action delegating to `omm/trashedTabs` | Trash fix yes ([#4867 candidate](https://github.com/marktext/marktext/issues)); Light Touch after it proves out |
| `packages/desktop/src/renderer/src/store/help.ts`          | Light Touch                      | Baseline fields on the default document state and `initialBaseline()` in `createDocumentState`                                                                                          | With Light Touch                                                                                                |
| `packages/desktop/src/renderer/src/store/project.ts`       | Trash                            | `.then()` on the trash IPC to close the doomed tabs                                                                                                                                     | Yes                                                                                                             |
| `packages/desktop/src/renderer/src/store/preferences.ts`   | Light Touch                      | `lightTouch` field, default true                                                                                                                                                        | With Light Touch                                                                                                |
| `packages/desktop/src/shared/types/files.ts`               | Light Touch                      | `originalMarkdown` / `pendingSavedMarkdown` on `IFileState`                                                                                                                             | With Light Touch                                                                                                |
| `packages/desktop/src/shared/types/preferences.ts`         | Light Touch                      | `lightTouch` on `IUserPreferences`                                                                                                                                                      | With Light Touch                                                                                                |
| `packages/desktop/src/main/preferences/schema.json`        | Light Touch                      | `lightTouch` boolean, default true                                                                                                                                                      | With Light Touch                                                                                                |
| `packages/desktop/src/main/config.ts`                      | Branding                         | `GITHUB_REPO_URL` reads from `brand.ts`                                                                                                                                                 | No — fork identity                                                                                              |
| `packages/desktop/src/main/windows/editor.ts`              | Branding                         | Linux icon path uses `OMM_SLUG`                                                                                                                                                         | No — fork identity                                                                                              |
| `packages/desktop/src/main/windows/setting.ts`             | Branding                         | Linux icon path uses `OMM_SLUG`                                                                                                                                                         | No — fork identity                                                                                              |
| `packages/desktop/src/main/keyboard/keybindingsDarwin.ts`  | Keybindings                      | Import plus `withOmmKeybindings('darwin', …)` on export; map body untouched                                                                                                             | Zoom-vs-heading conflict is a real upstream bug — worth a PR                                                    |
| `packages/desktop/src/main/keyboard/keybindingsLinux.ts`   | Keybindings                      | As above, `linux`                                                                                                                                                                       | As above                                                                                                        |
| `packages/desktop/src/main/keyboard/keybindingsWindows.ts` | Keybindings                      | As above, `windows`; also unbinds print from Ctrl+P, which shadowed quick-open                                                                                                          | As above                                                                                                        |

### Desktop — patches

| File                                                                | Feature      | Why it can't be a module                                                                   | Plan                                          |
| ------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `packages/desktop/src/main/menu/templates/help.ts`                  | Branding     | Upstream hard-codes each URL in a menu item; the fork also adds a "Based on MarkText" item | Stays a patch; conflicts are mechanical       |
| `packages/desktop/src/renderer/src/components/about/index.vue`      | Branding     | Product name and two credit rows are markup                                                | Stays a patch                                 |
| `packages/desktop/src/renderer/src/components/titleBar/index.vue`   | Save spinner | Spinner markup + CSS sit inside the upstream template                                      | Offer upstream — it is a plain UX improvement |
| `packages/desktop/src/renderer/src/prefComponents/editor/index.vue` | Light Touch  | Preference row is markup                                                                   | With Light Touch                              |
| `packages/desktop/static/locales/en.json`                           | All          | Upstream owns the locale files; the fork adds keys                                         | Additive, low conflict risk                   |

### Muya engine — patches

Highest-risk category: `packages/muya` is upstream's engine rewrite and moves
fast. Keep this list short, and prefer upstream PRs over carrying a patch.

| File                                                   | Feature          | What the delta is                                                                             | Plan                                                          |
| ------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `packages/muya/src/inlineRenderer/renderer/htmlTag.ts` | Empty-anchor fix | Childless HTML tags resolve visibility through `getClassName` instead of being forced visible | Upstream bug fix — send as a PR                               |
| `packages/muya/src/ui/paragraphFrontMenu/config.ts`    | Front-menu order | "New Paragraph" leads instead of "Duplicate"                                                  | Product preference; would need to be configurable to upstream |
| `packages/muya/src/ui/paragraphFrontMenu/index.ts`     | Front-menu order | Frontmatter filter keys off the item label rather than index 0                                | Robustness fix — send as a PR regardless of the reorder       |

### Build, CI and docs

Fork-owned by definition, not tracked as deltas: `.github/workflows/*`,
`.env.example`, `.gitignore`, `README.md`, `CLAUDE.md`, `docs/*`, `scripts/omm-deltas.ts`,
`packages/desktop/build/notarize-dmg.cjs`, `packages/desktop/electron-builder.yml`,
`packages/desktop/package.json`, `package.json`,
`packages/desktop/static/oh-my-marktext/*`, and anything under an `omm/`
directory or `test/unit/specs/omm/`.

## Merging an upstream release

```bash
git fetch upstream --tags
git checkout -b merge/upstream-<tag> main
git merge <tag>
```

Then, in order:

1. **Resolve conflicts using the markers.** Every conflicting hunk in an upstream file should contain an `OMM` marker; if one doesn't, the fork's delta was undocumented — fix that before continuing.
2. `pnpm omm:deltas --check` — fails if a file is modified without a ledger entry, or a ledger entry no longer matches a real change (an upstream release that adopted one of our fixes shows up here).
3. `pnpm test:unit` — the `omm/` specs are the behavioural guard; `keybinding-overrides.spec.ts` throws outright if upstream renamed a command we override.
4. `pnpm lint && pnpm typecheck`.
5. Smoke: open a file, save with no edits (`git status` clean), edit one paragraph (one-hunk diff), Cmd/Ctrl +/- zoom, trash a file from the sidebar and confirm the tab closes.
6. Bump to `<upstream version>-omm.N` and update the ledger if the merge changed anything above.

## Adding a new fork feature

1. Write the logic as a module under the nearest `omm/` directory. Keep it pure where you can — the Light Touch merge is pure so it can be tested without Electron.
2. Add the smallest possible hook in the upstream file, marked `OMM`.
3. Add a spec under `test/unit/specs/omm/`.
4. Add a ledger row above, with an honest answer in the "upstreamable" column.
5. Run `pnpm omm:deltas` and confirm your file lands in the right category.
