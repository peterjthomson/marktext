# Plan: Rebase onto MarkText 0.20 as **Oh My Marktext**

## Implementation status (branch `feature/oh-my-marktext`)

Phases 0, A–E are implemented on `feature/oh-my-marktext`, branched from `v0.20.0-rc.1`. Phase F (tag + release) is **not** done: it needs the Apple secrets provisioned and is an outward-facing action.

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — archive + remotes | done | `archive/v1.3.0-flat` branch, `archive/v1.3.0` tag, `upstream` remote. Nothing pushed. |
| A — bootstrap | done | pnpm install + rebuild OK. Baseline: 728 unit tests pass, 2 pre-existing flakes in `pdf.spec.ts` (cross-file pollution; pass in isolation), 79 pre-existing e2e typecheck errors. `@muyajs/core` confirmed as the renderer's engine. |
| B — branding | done | Verified in a packaged build: appId, `CFBundleName`, `productName`, version. |
| C — notarization | done | Smaller than planned: upstream's `release.yml` is **already** a pnpm matrix for win/linux/mac, so only the mac signing env needed adding. Upstream entitlements already superset the 1.x fork's. Added a fail-fast secrets check. |
| D — Light Touch | done | Pure module + 27 tests. Found and fixed a data-loss bug (see below). Dirty state left history-based as designed. |
| E — UI affordances | done | Two of four items were already handled upstream (see below). |
| F — first release | done | `v0.20.0-omm.1` (2026-07-27) and `v0.20.0-omm.2` (2026-07-29) published. mac is built, signed and notarized **locally** and uploaded to the CI-published release; CI ships win/linux. This split is a decision, not a gap — see `docs/omm/signing-and-release.md`. |
| G — extension layer | done | Fork code refactored into `omm/` modules with marked hooks, a delta ledger and `pnpm omm:deltas`. See `docs/omm/EXTENSIONS.md` — that document, not this plan, is the standing reference for how deltas are carried. |

### Corrections to this plan found during implementation

- **Deletions were silently reverted.** The 1.x merge treated "regenerated gap has no new content" as "keep the original lines", so deleting a paragraph and saving restored it — mid-document, at end-of-file, and wholesale. Fixed in the port; three regression tests cover it. This is a live bug in shipping 1.3.0.
- **Light Touch does not fix ordered-list renumbering.** Repeated `1.` markers differ in characters, not whitespace, so neither the whole-document comparison nor line-level LCS can treat them as unchanged. Success metric #2 ("open → save → `git status` clean") therefore fails for such documents until upstream #4776 lands. Padded tables are reformatted for the same reason (delimiter rows differ in dash count).
- **Upstream already ships a pnpm release matrix** for all three platforms, so the planned workflow rewrite was unnecessary.
- **Upstream already renders the paragraph menu style-grid first**, so "Style-first front menu" needed only an item reorder — which exposed a latent `splice(0, 1)` that assumed a fixed index.
- **The dirty dot already exists** upstream (`save-dot`, tab `unsaved` class); only the in-flight spinner was missing.
- **The empty-anchor bug survives into `@muyajs/core`** and was ported.
- **`repository` in `packages/desktop/package.json` is load-bearing** for the update feed — confirmed present in the packaged asar alongside the explicit `publish` block.

### Watch item

A local `electron-builder --dir` run overwrote the repo-root `package.json` with a flattened desktop manifest once; it did not reproduce on a second run. Check `git status` after local packaging runs before committing.

## Intent

Turn `peterjthomson/marktext` from a parallel modernization fork into a **long-running sister fork** that:

1. **Tracks upstream** MarkText (`marktext/marktext`) at the 0.20 line
2. **Persists packages, affordances, and distribution** upstream has not adopted
3. **Heroes the original authors** (Jocs, fxha, Tkaixiang, contributors) while giving you a clear personal-brand / community-member story

Positioning name: **Oh My Marktext** (OMM) — same convention as Oh My Zsh / Omarchy-style sister projects: track parent, keep the deltas that matter.

### Decisions locked in

| Decision | Choice |
|----------|--------|
| Upstream base | **`v0.20.0-rc.1`** (pin tag; re-sync when 0.20.0 stable ships) |
| App identity | **Separate `productName` + `appId`** — side-by-side with official |
| Version scheme | **Track upstream + OMM suffix** (e.g. `0.20.0-omm.1`) |

### Sister-fork value pillars

| Pillar | Why it exists | Upstream gap |
|--------|---------------|--------------|
| **App signing / notarization** | Non-technical colleagues open DMG without Terminal/`xattr` | Official ships **unsigned** (`notarize: false`) |
| **Light Touch save** | Git-friendly diffs for PMs collaborating with devs | [#2189](https://github.com/marktext/marktext/issues/2189) still open; no `lightTouch` pref |
| **UI tweaks for PM↔dev** | Font zoom shortcuts, Style-first front menu, save spinner/dirty chrome, optional meta transparency | Partial / absent |

---

## Critical constraint: this is not a git rebase

Current history is **Tkaixiang flat tree → Peter 1.x**. Upstream is a **pnpm monorepo + TypeScript + dual Muya packages**.

```
Your master (flat JS)          Upstream 0.20 (pnpm monorepo TS)
src/main/                      packages/desktop/src/main/
src/renderer/                  packages/desktop/src/renderer/
src/muya/                      packages/muya (@muyajs/core) + packages/muyajs (legacy)
electron-builder.yml (root)    packages/desktop/electron-builder.yml
npm                            pnpm
```

**Strategy: replace the base, re-apply deltas.** Do not attempt `git rebase` of 1.3.0 commits onto `v0.20.0-rc.1` — paths, language, and engine all changed. Treat surviving features as a **port checklist**, not cherry-picks.

---

## Target product identity

| Field | Official MarkText | Oh My Marktext |
|-------|-------------------|----------------|
| `productName` | `marktext` | **`Oh My Marktext`** |
| `appId` | `com.github.marktext.marktext` | **`com.peterjthomson.ohmy-marktext`** (final reverse-DNS ok to tweak) |
| executable / artifacts | `marktext-*` | **`oh-my-marktext-*`** (or `omm-*` — decide in branding PR) |
| version | `0.20.0-rc.1` | **`0.20.0-omm.1`** then `0.20.0-omm.2`, later track `0.20.1-omm.1`. Semver caveat: `-omm.N` is a **prerelease**, so it sorts *before* the corresponding upstream stable (`0.20.0-omm.1 < 0.20.0`), and electron-updater applies `allowPrerelease` semantics when the installed version has a prerelease component. Ordering within OMM's own feed is consistent (`omm.2 > omm.1`, `omm > rc`), so the scheme works — but verify the updater upgrade path between omm tags in Phase F |
| homepage | marktext.me / marktext/marktext | `github.com/peterjthomson/marktext` (or rename later) |
| auto-update feed | official | **own** GH releases only — never point at official `latest*.yml` |
| data dir | MarkText defaults | **separate** (follows Electron app name / userData from productName) |

**Coexistence:** colleagues can install both apps; prefs and open-with associations stay distinct if `appId` and product name differ.

**Credit posture (README / About):**
- Lead with: built **on** MarkText by Jocs & contributors; modernization lineage via Tkaixiang; this fork adds distribution + Light Touch + PM affordances
- Link upstream issues you improve (#2189, Gatekeeper pain)
- Prefer upstreaming Light Touch later as a community PR when stable

---

## What we keep (port inventory)

### P0 — must land on day-one usable OMM

| Feature | Source (fork today) | Port target (0.20) | Effort |
|---------|---------------------|--------------------|--------|
| **Light Touch** pure merge | `editor.js` ~1513–1695 (`normalizeBlock`, LCS, `mergeWithOriginal`, `getMarkdownForSave`) | New module e.g. `packages/desktop/src/common/lightTouch.ts` + unit tests | L |
| **Light Touch** wire-up | `editor.js` save paths, `help.js` `originalMarkdown` (do **not** port `pendingSavedMarkdown` — see Phase D step 4) | `packages/desktop/src/renderer/src/store/editor.ts`, `help.ts` | L |
| Pref + i18n | `schema.json`, prefs UI, locales | `schema.json` + `IUserPreferences` + `PreferencesState` + editor pref UI + en locale first | M |
| **macOS notarize** | `electron-builder.yml` `notarize: true`, entitlements, `release.yml` secrets, `.env.example` | `packages/desktop/electron-builder.yml` + adapted GHA (pnpm) | M |
| Branding | README / package meta | productName, appId, artifacts, About/help URLs, README “Oh My” story | S |

### P1 — PM/dev UX chrome

| Feature | Source | Notes |
|---------|--------|-------|
| Font zoom Cmd+= / Cmd+- | `keybindingsDarwin.js`, window menu | Re-apply; consider all platforms |
| Style-first front menu | `muya/.../frontMenu/config.js` | Port to **`packages/muya`** (0.20 primary engine), not only muyajs |
| Save spinner + dirty-dot | titleBar + `isSaving` | Small renderer UI |
| Empty HTML anchor fix | `src/muya/lib/parser/render/renderInlines/htmlTag.js` (commit `23b22f0c`) | Re-check if 0.20 Muya still has bug; port if needed — find the renderInlines equivalent in `packages/muya` |
| Optional `ced` load | `encoding.js` | Upstream may still hard-require; keep soft-fail if Windows zip issues recur |

### P2 — optional / branch-only

| Feature | Status |
|---------|--------|
| Meta transparency slider | Branch only (`claude/add-meta-transparency-slider-znVoq`) — port after P0/P1 |
| Omarchy/Wayland spec | Spec PR only — defer |
| Independent 1.x features that upstream already fixed | Drop / verify against 0.20 |

### Explicitly **do not** carry as “platform”

- Flat webpack/vite tree as the product base — **replaced by upstream monorepo**
- Competing version `1.3.0` as if newer than 0.20
- Claiming “upstream is dead”

---

## Architecture notes for Light Touch on 0.20

Upstream save IPC **names are stable** (`mt::response-file-save`, `mt::tab-saved`, etc.). Dirty state in 0.20 is **history-based** (`lastSavedHistoryId`), which already reduces “dirty on open” false positives — but **save still regenerates markdown from the block model**. Light Touch still matters for **git diffs**.

Recommended design (cleaner than 1.3.0):

```
packages/desktop/src/common/lightTouch.ts   # pure: normalize + LCS merge + getMarkdownForSave
packages/desktop/test/unit/.../lightTouch.spec.ts

editor.ts FILE_SAVE / autosave / save-all:
  markdownToSave = getMarkdownForSave(tab.markdown, tab.originalMarkdown, prefs.lightTouch)
  send mt::response-file-save(..., markdownToSave, ...)
  track originalMarkdown baseline update for mt::tab-saved

On open (createDocumentState / NEW_TAB_WITH_CONTENT):
  originalMarkdown = disk markdown (pathname only)

On mt::tab-saved:
  Do NOT touch isSaved. Upstream 0.20 computes saved state from lastSavedHistoryId
  vs the current history entry — markdown string comparison plays no part. LT only
  changes which BYTES go to disk, not whether the doc is dirty, so upstream's
  saved-state logic stays untouched. All LT needs here: update tab.originalMarkdown
  to the payload that was written (baseline for the next save's merge).
  This deletes the 1.3.0 pendingSavedMarkdown map and its string-identity bug
  (editor.js:391/:423 — tab.markdown === savedMarkdown is false whenever LT
  returns original bytes, leaving the tab perpetually dirty) rather than fixing it.
```

**Engine complementarity:** 0.20 round-trip fixes reduce merge pressure; upstream #4776 (ordered-list source markers) would help further but is **still open — not in `rc.1`**, so Phase D fixtures must not assume it (expect ordered-list marker rewrites without LT). Light Touch remains the blunt instrument for “unchanged lines stay byte-identical.” Prefer keeping LT in **desktop**, not forking Muya serialize, so tracking upstream Muya is easy.

---

## Git / repo mechanics

### Phase 0 — archive and remote setup

```bash
# Preserve current product line
git branch archive/v1.3.0-flat master
git tag archive/v1.3.0

git remote add upstream https://github.com/marktext/marktext.git
git fetch upstream --tags
```

### Phase 1 — new base branch (recommended topology)

```bash
# Fresh history root for OMM tracking upstream
git checkout -b omm/base-0.20.0-rc.1 v0.20.0-rc.1
# or: git checkout -b develop-omm upstream/develop and reset hard to tag
```

Optional but clean for sister forks:

- Keep `master` as **OMM release line** once ready
- Or rename default branch later to `main` tracking OMM
- `archive/v1.3.0-flat` stays for archaeology / cherry-reading old patches

**Do not force-push archive history** without explicit confirmation. First public OMM release can be a new default branch tip based on upstream + OMM commits.

### Phase 2 — overlay commits (small PRs on `omm/*`)

Ordered stack (each independently testable):

1. `chore(omm): brand as Oh My Marktext (appId, productName, artifacts, version)`
2. `build(mac): enable notarization + CI secrets docs`
3. `feat(light-touch): pure merge module + unit tests`
4. `feat(light-touch): wire save/load + preference + i18n`
5. `feat(ui): font zoom, front-menu Style order, save chrome`
6. `docs: README sister-fork positioning + credit upstream`
7. `chore(release): first 0.20.0-omm.1 tag`

### Continuous tracking model

```
upstream v0.20.0-rc.1 ──► omm/base
                              │
                              ├─► branding
                              ├─► notarize
                              ├─► light-touch
                              └─► ui-tweaks  ──► master (OMM)
                                                    │
upstream v0.20.0 ──────── merge/rebase periodically ┘
upstream v0.20.1 ──────── same
```

Cadence suggestion: merge upstream tags within a week of release; only mid-cycle if critical security fix.

---

## Implementation phases (detail)

### Phase A — Bootstrap monorepo locally (1 session)

1. Checkout `v0.20.0-rc.1` into this workspace (or worktree)
2. `pnpm install`, `pnpm dev`, smoke open/save
3. Document Node/pnpm versions from upstream engines
4. Confirm which engine renders what: desktop at `rc.1` depends on **both** `@muyajs/core` and `@marktext/muyajs` (verified in `packages/desktop/package.json`) — this check is load-bearing, not a formality; the front-menu port (P1) may need to land in both packages depending on the answer
5. Snapshot: unit tests green baseline

**Exit criteria:** app runs from upstream tag unmodified.

### Phase B — Branding shell (0.5–1 day)

Files (upstream tree):

- `packages/desktop/package.json` — name/version/description/homepage **and `repository`**. Critical: upstream `electron-builder.yml` has **no `publish:` block**, and `electron-updater@^6.8.9` derives the GitHub update feed from `repository` when publish config is absent — currently `marktext/marktext`. Leaving it unchanged points OMM's auto-updater at the official feed. Also change `name` (currently `marktext`): Electron derives `userData` from `productName`/`name` in the built app, so side-by-side data-dir isolation depends on this.
- `packages/desktop/electron-builder.yml` — appId, productName, artifactName patterns, **explicit `publish:` block → `peterjthomson/marktext` releases**, `notarize` still false until Phase C
- About / help menu URLs → this repo + “Based on MarkText”
- Root README rewrite: Oh My Marktext charter, upstream credit, pillars, install links
- Optional: rename GH repo later; not blocking

**Exit criteria:** `productName` shows in window chrome; installers named distinctly; `repository` + `publish` both point at OMM repo — no update URL resolving to official (verify with a built app's `app-update.yml`).

### Phase C — Signing / notarization (1 day + secrets)

Port from current fork:

- `mac.notarize: true` under electron-builder (desktop package)
- Entitlements (compare fork `build/mac/entitlements.mac.plist` vs upstream — keep Electron-required set)
- GitHub Actions: adapt `release.yml` to **pnpm monorepo** (`pnpm --filter marktext build:mac`, correct working dirs, `dist` at repo root per upstream). Note: **all** current workflows assume the flat npm tree — win/linux jobs need the same pnpm adaptation, not just mac (see Phase F scoping)
- GitHub Secrets (**not provisioned — mac releases are built locally by choice**; an app-specific password cannot be minted from a CLI, so CI mac signing would need a deliberate trip to appleid.apple.com or an App Store Connect API key): `MAC_CERTS` / `MAC_CERTS_PASSWORD` / `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` — fork `release.yml:119-124` maps `MAC_CERTS → CSC_LINK` and `MAC_CERTS_PASSWORD → CSC_KEY_PASSWORD` at CI time; `.env.example` documents `APPLE_KEYCHAIN_PROFILE` for local builds
- **Critical:** `appId` must match signing profile capability for the Developer ID Application cert

**Exit criteria:** signed+notarized arm64 DMG opens on clean Mac without `xattr`.

### Phase D — Light Touch (2–4 days)

1. Extract pure functions from archive `editor.js` → TypeScript module with tests:
   - fixtures: unchanged file, single paragraph edit, blank-line preserve, table/code fence edge cases
2. Add `originalMarkdown` to document state on load
3. Hook all save entry points (manual, save-as?, autosave, save-all, close)
4. Leave upstream's history-based `isSaved` (`lastSavedHistoryId`) **untouched** — LT changes the bytes written, not dirtiness. On `mt::tab-saved` only update `tab.originalMarkdown` to the written payload. Do **not** port the 1.3.0 `pendingSavedMarkdown` map or any markdown comparison for saved state (that's where the string-identity bug lived)
5. Pref `lightTouch` default **true** (OMM product choice); schema + TS types + prefs UI + EN locale
6. Docs: port `docs/features/light-touch.md` into OMM docs tree (or website content if using upstream layout)

**Exit criteria:** open file, save without edits → **zero git diff**; edit one paragraph → only that region changes in `git diff`.

### Phase E — UI affordances (1–2 days)

1. Darwin zoom keybindings + menu
2. Front-menu Style-first in `packages/muya` UI config (verify API names)
3. Save spinner / dirty-dot if still missing
4. Empty-anchor fix if still repro on 0.20
5. (Optional later) meta transparency from unmerged branch

**Exit criteria:** PM-facing checklist pass (zoom, style menu, save feedback).

### Phase F — First OMM release

1. Version `0.20.0-omm.1`
2. Tag `v0.20.0-omm.1`
3. Build scope: **mac (signed) is the omm.1 commitment**; win/linux ship only if their workflows are adapted to the pnpm monorepo by then (today's flat-tree npm workflows will not run) — otherwise explicitly release mac-only and note win/linux as follow-up
4. ~~Verify updater upgrade path between omm tags~~ **Done 2026-07-29, and it was broken.** `release.yml` marked every hyphenated tag as a GitHub pre-release. electron-updater's GitHub provider resolves the latest *non*-prerelease release unless `allowPrerelease` is set, and it is not — so `releases/latest` returned `v0.20.0-omm.1` and omm.2 and omm.3 were invisible to the updater. Releases are no longer flagged as pre-releases; see `docs/omm/signing-and-release.md`.
5. Release notes template:

```markdown
## Oh My Marktext 0.20.0-omm.1
Based on [MarkText v0.20.0-rc.1](https://github.com/marktext/marktext/releases/tag/v0.20.0-rc.1).

### Sister-fork additions
- macOS notarized builds
- Light Touch save (git-friendly)
- UI: …

### Upstream
All credit to Jocs and MarkText contributors for the 0.20 engine work.
```

6. Update issue #13 (Homebrew) stance: either point to OMM cask *or* recommend official when signing becomes theirs — document clearly

---

## Risk register

| Risk | Mitigation |
|------|------------|
| 0.20 RC unstable / API churn before stable | Pin tag; only re-port deltas; wait for 0.20.0 for “stable OMM” marketing if needed |
| Light Touch fights new Muya serialization | Keep LT as post-export merge; add engine-aware tests; watch #4776 |
| Signing appId mismatch | Set final appId before first notarized ship; never flip appId after users install |
| Users confuse OMM with official | Distinct product name, README, About dialog, artifact names |
| Tracking debt | Small patch series; no broad refactors of desktop; prefer upstream PRs for non-pillars |
| Windows portable (#14) | After base lands, retest zip; optional ced soft-load |
| Force-push / rewrite public history | Archive branch first; announce if default branch resets |

---

## Out of scope (this rebase)

- Full upstream PR for Light Touch (follow-up once proven on OMM)
- Homebrew cask submission (after first OMM release)
- Complete i18n for Light Touch strings (EN first, then other locales)
- Replacing Muya with a third engine
- Competing website / marktext.me

---

## Success metrics

1. **Install:** non-technical Mac user opens notarized DMG without Terminal
2. **Git:** sample repo file open → save → `git status` clean
3. **Track:** can merge next upstream tag with &lt; 1 day conflict work on OMM layers only
4. **Community:** README and release notes clearly credit MarkText; fork described as sister, not replacement

---

## Suggested first commands (after plan approval)

```bash
git branch archive/v1.3.0-flat master
git tag archive/v1.3.0
git remote add upstream https://github.com/marktext/marktext.git
git fetch upstream --tags
git checkout -b omm/base-0.20.0-rc.1 v0.20.0-rc.1
# install & smoke
corepack enable && pnpm install
pnpm dev
```

Then open stacked branches off `omm/base-0.20.0-rc.1` for branding → notarize → light-touch → ui.

---

## PR / commit plan (Graphite-style stack)

| Order | Branch / PR | Depends on | Deliverable |
|------:|-------------|------------|-------------|
| 1 | `omm/base-0.20.0-rc.1` | — | Upstream tag as branch; CI green if possible |
| 2 | `omm/branding` | 1 | productName, appId, version `0.20.0-omm.0-dev`, README charter |
| 3 | `omm/notarize` | 2 | electron-builder + GHA pnpm release + docs |
| 4 | `omm/light-touch-core` | 1 or 2 | pure TS module + tests (no UI required) |
| 5 | `omm/light-touch-wire` | 4 | store/prefs/IPC integration |
| 6 | `omm/ui-tweaks` | 2 | zoom, front menu, spinner |
| 7 | `omm/release-0.20.0-omm.1` | 3,5,6 | tag, release notes, multi-arch |

---

## Key decisions summary

1. **Sister fork, not competitor** — track 0.20, credit upstream, ship deltas only.
2. **Base = `v0.20.0-rc.1`** — new Muya TS engine; re-sync on stable.
3. **No literal git rebase** of 1.3.0 — archive flat tree, re-apply features.
4. **Separate app identity** — side-by-side install + notarization under your Developer ID.
5. **Version `0.20.x-omm.N`** — lineage obvious to users and resume readers.
6. **Light Touch as pure desktop module** — easiest to track Muya changes and later upstream.
7. **Notarization is a first-class product feature**, not a build footnote.
