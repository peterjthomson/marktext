<h1 align="center">Oh My Marktext</h1>

<div align="center">
  <strong>:high_brightness: A sister fork of <a href="https://github.com/marktext/marktext">MarkText</a> :crescent_moon:</strong><br>
  Tracks upstream MarkText. Adds notarized macOS builds, git-friendly Light Touch save,<br>
  and a handful of affordances for people who write docs alongside developers.<br>
  <sub>Available for Linux, macOS and Windows.</sub>
</div>

<br>

<div align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/peterjthomson/marktext.svg" alt="LICENSE">
  </a>
  <a href="https://github.com/peterjthomson/marktext/releases/latest">
    <img src="https://img.shields.io/github/downloads/peterjthomson/marktext/latest/total.svg" alt="latest download">
  </a>
</div>

<div align="center">
  <sub>Built <strong>on</strong> MarkText by
    <a href="https://github.com/Jocs">Jocs</a>,
    <a href="https://github.com/fxha">fxha</a>,
    <a href="https://github.com/Tkaixiang">Tkaixiang</a> and
    <a href="https://github.com/marktext/marktext/graphs/contributors">contributors</a>.
    All the hard parts are theirs.
  </sub>
</div>

<br />

## What this is

Oh My Marktext (OMM) is a **long-running sister fork** of [MarkText](https://github.com/marktext/marktext) — same convention as Oh My Zsh to Zsh: track the parent, keep the deltas that matter.

It is **not** a replacement for MarkText and **not** a claim that upstream is unmaintained. Upstream does the engine work; this fork carries a small set of packaging and workflow changes that upstream has not adopted. Where a change is generally useful, the goal is to send it upstream as a community PR rather than hold it here.

**Current base:** [MarkText `v0.20.0-rc.1`](https://github.com/marktext/marktext/releases/tag/v0.20.0-rc.1)

### Why it exists

| Pillar | What you get | Upstream today |
|--------|--------------|----------------|
| **Signed & notarized macOS builds** | Non-technical colleagues open the DMG by double-clicking — no Terminal, no `xattr -cr` | Official builds ship unsigned (`notarize: false`) |
| **Light Touch save** | Open a file, save it, get **zero git diff**. Edit one paragraph, get a one-paragraph diff | [#2189](https://github.com/marktext/marktext/issues/2189) open; no `lightTouch` preference |
| **PM ↔ dev UI affordances** | Font zoom shortcuts, Style-first paragraph menu, save spinner and dirty indicator | Partial or absent |

### Coexistence with official MarkText

OMM uses a distinct `appId`, product name, and user-data directory, so you can install it **side by side** with official MarkText. Preferences and file associations stay separate. The auto-updater only ever points at this repo's releases — never at official MarkText's update feed.

## Screenshot

![](docs/assets/marktext.png?raw=true)

## Features

Everything MarkText does, plus the pillars above:

- Realtime preview (WYSIWYG) and a clean, distraction-free interface.
- Support for [CommonMark Spec](https://spec.commonmark.org), [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) and selective support for [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Markdown extensions such as math expressions (KaTeX), front matter and emojis.
- Paragraph and inline style shortcuts.
- Output **HTML** and **PDF** files.
- Various [themes](https://marktext.me/docs/themes): **Cadmium Light**, **Material Dark** etc.
- Various editing modes: **Source Code mode**, **Typewriter mode**, **Focus mode**.
- Paste images directly from the clipboard.

### Light Touch save

MarkText regenerates a document's Markdown from its internal block model on every save. That is correct, but it means opening a file and pressing save can rewrite list markers, blank lines, and trailing whitespace across the whole file — which turns into noisy `git diff`s in a shared repo.

With **Light Touch** enabled (Preferences → Editor → File representation), OMM compares the regenerated Markdown against the bytes originally read from disk:

- **No semantic change** → the original file is written back byte-for-byte.
- **Some change** → unchanged lines keep their exact original formatting; only edited regions take the regenerated output.

The result is that the diff matches the edit you actually made. Light Touch is **on by default** in OMM.

## Download and Installation

All binaries can be downloaded from the [release page](https://github.com/peterjthomson/marktext/releases/latest).

#### macOS

Requires macOS 11 (Big Sur) or later. Download `oh-my-marktext-mac-(arm64|x64)-%version%.dmg`, open it, and drag the app to Applications. Builds are signed and notarized with a Developer ID certificate, so Gatekeeper lets them run without any Terminal workaround.

#### Windows

Requires Windows 10 or 11. Download and run `oh-my-marktext-win-(x64|arm64)-%version%-setup.exe`, and choose per-user or machine-wide install.

#### Linux

Download the AppImage, deb, rpm, snap or tarball from the [release page](https://github.com/peterjthomson/marktext/releases/latest).

## Development

OMM tracks upstream's pnpm monorepo layout.

```bash
corepack enable
pnpm install
pnpm dev
```

Useful scripts: `pnpm test:unit`, `pnpm typecheck`, `pnpm lint`, `pnpm build:mac`.

Upstream's [developer documentation](https://marktext.me/docs/dev/overview) applies to the engine and editor internals.

### How this fork is organised

OMM keeps its changes as a thin, reviewable layer on top of an upstream tag so that merging the next upstream release stays cheap:

- Light Touch lives in `packages/desktop/src/common/lightTouch.ts` as a **pure module** with unit tests — Muya's serialization is not forked.
- Branding, notarization, and CI changes are confined to `packages/desktop/package.json`, `packages/desktop/electron-builder.yml`, and `.github/workflows/`.
- Upstream releases are merged in periodically; see `docs/todo/oh-my-marktext-rebase.md` for the tracking model.

## Contribution

Bug reports for **this build** belong on [this repo's issue tracker](https://github.com/peterjthomson/marktext/issues). Bugs in the editor engine itself are usually better reported [upstream](https://github.com/marktext/marktext/issues) so that everyone benefits.

## Credit

Oh My Marktext exists because MarkText is good software. All credit for the editor, the Muya engine, and the 0.20 modernization goes to [Jocs](https://github.com/Jocs), [fxha](https://github.com/fxha), [Tkaixiang](https://github.com/Tkaixiang), and the [MarkText contributors](https://github.com/marktext/marktext/graphs/contributors).

If MarkText improves your workflow, please consider [sponsoring the upstream project](https://github.com/sponsors/marktext).

<a href="https://github.com/marktext/marktext/graphs/contributors"><img src="https://opencollective.com/marktext/contributors.svg?width=890" /></a>

## License

[**MIT**](LICENSE), same as upstream MarkText.
