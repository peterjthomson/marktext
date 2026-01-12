<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>
<div align="center">
  Translations also available in:
  <a href="docs/i18n/README-zh_cn.md">CN</a>
  <a href="docs/i18n/README-zh_tw.md">TW</a>
  <a href="docs/i18n/README-de.md">DE</a>
  <a href="docs/i18n/README-es.md">ES</a>
  <a href="docs/i18n/README-fr.md">FR</a>
  <a href="docs/i18n/README-jp.md">JP</a>
  <a href="docs/i18n/README-kr.md">KR</a>
  <a href="docs/i18n/README-pt.md">PT</a>
</div>

---

<div align="center">
  <strong>🔆 Next generation markdown editor 🌙</strong><br>
  A simple and elegant open-source markdown editor that focused on speed and usability.<br>
</div>

<div align="center">
  <!-- Latest Release Version -->
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/tkaixiang/marktext">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/Tkaixiang/marktext/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/total">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/latest/total">
  </a>
</div>

- [MarkText](https://github.com/marktext/marktext) is a free and open source markdown editor originally written by [Jocs](https://github.com/Jocs) and [contributors](https://github.com/marktext/marktext/graphs/contributors).

- Sadly, the core repository became unmaintained since about 3 years ago, but various Quality of Life issues remained that I noticed in my daily usage.

- This repository serves as an attempt at modernising my favourite Markdown Editor, and is a fork based off [Jacob Whall's Fork](https://github.com/jacobwhall/marktext)
  
  - See [my motivation below](#1-soo-is-this-fork-any-different-from-the-countless-others)

- You can read more about my motivation below

# 1. Installing

> ⚠️ These releases are still in **beta** (since I do not know how much stuff I might have broken during the migration). Please report any bugs in the [issue tracker](https://github.com/Tkaixiang/marktext/issues)

## Windows

- Simply check out the [Releases Page](https://github.com/Tkaixiang/marktext/releases)!

- Tested on:
  
  - `Windows 11`

## Linux

- Simply check out the [Releases Page](https://github.com/Tkaixiang/marktext/releases)
- Tested on:
  - `Ubuntu 24.0.2` (`AppImage` and `.deb` packages)
  - _Would love some help in testing the other Linux packages!_

### Linux Package Managers

##### 1. Arch Linux [![AUR version](https://img.shields.io/aur/version/marktext-tkaixiang-bin)](https://aur.archlinux.org/packages/marktext-tkaixiang-bin)

- Available on [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) thanks to [@kromsam](https://github.com/kromsam)

## MacOS

> ⚠️ MacOS releases will show a "`MarkText is damaged and can't be opened`" due to a **lack of notorisation**.
> Please see [this fix here](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300) (which also applies to any other app that lacks a Developer Account signing)

- Available on the [Releases Page](https://github.com/Tkaixiang/marktext/releases)

# 2. Screenshots

![](docs/marktext.png?raw=true)

# 3. ✨Features ⭐

- 🆕 Now available in **9 languages** from the `Preferences` editor (Special thanks to [@hubo1989](https://github.com/hubo1989))
  
  - `English` 🇺🇸
  - `简体中文` 🇨🇳
  - `繁體中文` 🇹🇼
  - `Deutsch` 🇩🇪
  - `Español` 🇪🇸
  - `Français` 🇫🇷
  - `日本語` 🇯🇵
  - `한국어` 🇰🇷
  - `Português` 🇵🇹

- Realtime preview (WYSIWYG) and a clean and simple interface to get a distraction-free writing experience.

- Support [CommonMark Spec](https://spec.commonmark.org/0.29/), [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) and selective support [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).

- Markdown extensions such as math expressions (KaTeX), front matter and emojis.

- Support paragraphs and inline style shortcuts to improve your writing efficiency.

- Output **HTML** and **PDF** files.

- Various themes: **Cadmium Light**, **Material Dark** etc.

- Various editing modes: **Source Code mode**, **Typewriter mode**, **Focus mode**.

- Paste images directly from clipboard.

## 3.1 🌙 Themes🔆

| Cadmium Light                                     | Dark                                            |
| ------------------------------------------------- | ----------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                    | Material Dark                                   |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                     | One Dark                                        |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

## 3.2 😸Edit Modes🐶

| Source Code          | Typewriter               | Focus               |
|:--------------------:|:------------------------:|:-------------------:|
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. Motivation

## 1. Soo is this fork any different from the countless others?

- A main gripe I had when looking into `marktext` was that the development framework + environment was aging badly and took forever to compile
  
  - Most libaries were outdated and some couldn't even be installed with modern versions of Node.JS/Python

- Hence, this fork is kind of a major "re-write" that makes use of [electron-vite](https://electron-vite.org/) instead of the old `Babel + Webpack` setup
  
  - The goal here is to give `marktext` a **fresh start** using **modern frameworks and libraries as much as possible**
  - Everything has also been migrated to `Vue3` and `Pinia` with all libraries updated to their latest possible versions

- The `main` and `preload` processes are still compiled to `CommonJS`, but the `renderer` is now fully **`ESModules` only** (_which posed some interesting issues during migration_)

## 2. That's cool! How can I help?

- Any form of:
  
  1. Testing for bugs (Bug-Reports)
  
  2. Pull Requests
  
  Are more than welcome!

- You can find a basic list of commands for getting around this repo below, but otherwise - the file structure should be **very similar to the original marktext**

## 3. Project Setup

- See [Developer Documentation](docs/dev/README.md)
