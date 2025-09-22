<p align="center"><img src="../../static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 編輯器 🌙</strong><br>
  一款專注於速度與可用性的簡潔優雅開源 Markdown 編輯器。<br>
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

- [MarkText](https://github.com/marktext/marktext) 是一款免費開源的 Markdown 編輯器，最初由 [Jocs](https://github.com/Jocs) 和[貢獻者們](https://github.com/marktext/marktext/graphs/contributors)編寫。

- 遺憾的是，核心倉庫大約在 3 年前起無人維護，但在我的日常使用中仍存在許多影響體驗的細節問題。

- 本倉庫旨在讓我最喜歡的 Markdown 編輯器現代化，是基於 [Jacob Whall 的分叉](https://github.com/jacobwhall/marktext)再次派生的版本
  - 參見[下文我的動機](#1-soo-is-this-fork-any-different-from-the-countless-others)

- 你可以在下文閱讀更多關於我動機的說明

# 1. 安裝

> ⚠️ 這些發佈仍處於 **beta** 階段（因為我不確定遷移過程中破壞了多少功能）。請在 [問題追蹤器](https://github.com/Tkaixiang/marktext/issues)中回報任何錯誤

## Windows

- 只需查看[發佈頁](https://github.com/Tkaixiang/marktext/releases)!

- 已測試：
  - `Windows 11`

## Linux

- 只需查看[發佈頁](https://github.com/Tkaixiang/marktext/releases)
- 已測試：
  - `Ubuntu 24.0.2`（`AppImage` 與 `.deb` 套件）
  - _非常希望有人協助測試其他 Linux 打包形式！_

### Linux 套件管理器

##### 1. Arch Linux ![AUR Version](<https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin%3E>)

- 感謝 [@kromsam](https://github.com/kromsam)，可在 [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) 取得

## MacOS

> ⚠️ 由於**缺少公證**，MacOS 版本會顯示“`MarkText is damaged and can't be opened`”。
> 請參考[此處的修復方法](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300)（同樣適用於任何缺少開發者帳號簽名的應用）

- 可在[發佈頁](https://github.com/Tkaixiang/marktext/releases)取得

# 2. 截圖

![](../marktext.png?raw=true)

# 3. ✨功能 ⭐

- 現已支援 **9 種語言** 🆕（特別感謝 [@hubo1989](https://github.com/hubo1989)）
  - `English` 🇺🇸
  - `簡體中文` 🇨🇳
  - `繁體中文` 🇹🇼
  - `Deutsch` 🇩🇪
  - `Español` 🇪🇸
  - `Français` 🇫🇷
  - `日本語` 🇯🇵
  - `한국어` 🇰🇷
  - `Português` 🇵🇹

- 即時預覽（所見即所得），介面乾淨簡潔，帶來無干擾寫作體驗。
- 支援 [CommonMark 規範](https://spec.commonmark.org/0.29/)、[GitHub 擴充 Markdown 規範](https://github.github.com/gfm/)，並選擇性支援 [Pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。
- 提供 Markdown 擴充，例如數學公式（KaTeX）、Front Matter 與表情符號。
- 支援段落與行內樣式的快捷方式，提升你的寫作效率。
- 可匯出 **HTML** 與 **PDF** 檔案。
- 多種主題：**Cadmium Light**、**Material Dark** 等。
- 多種編輯模式：**原始碼模式**、**打字機模式**、**專注模式**。
- 可直接從剪貼簿貼上圖片。

## 3.1 🌙 主題🔆

| Cadmium Light                                   | Dark                                          |
| ----------------------------------------------- | --------------------------------------------- |
| ![](../themeImages/cadmium-light.png?raw=true)  | ![](../themeImages/dark.png?raw=true)         |
| Graphite Light                                  | Material Dark                                 |
| ![](../themeImages/graphite-light.png?raw=true) | ![](../themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                   | One Dark                                      |
| ![](../themeImages/ulysses-light.png?raw=true)  | ![](../themeImages/one-dark.png?raw=true)     |

## 3.2 😸編輯模式🐶

|       原始碼       |         打字機         |       專注        |
| :----------------: | :--------------------: | :---------------: |
| ![](../source.gif) | ![](../typewriter.gif) | ![](../focus.gif) |

# 4. 動機

## 1. 那麼這個分支與其他無數分支有何不同？

- 我對 `marktext` 的主要不滿在於其開發框架與環境老化嚴重，編譯耗時很長
  - 大多數函式庫已過時，有些在現代版本的 Node.JS/Python 上甚至無法安裝

- 因此，此分支算是一種重大「重寫」，使用了 [electron-vite](https://electron-vite.org/) 取代舊的 `Babel + Webpack` 設定
  - 目標是讓 `marktext` 借助**盡可能現代的框架與函式庫**實現**全新開始**
  - 同時已將所有內容遷移到 `Vue3` 與 `Pinia`，並把各函式庫升級到其可用的最新版本

- `main` 與 `preload` 行程仍編譯為 `CommonJS`，而 `renderer` 現已完全採用 **僅 `ESModules`**（遷移過程中也因此遇到了一些有趣的問題）

## 2. 太棒了！我能如何貢獻？

- 任何形式的：
  1. 缺陷測試（錯誤回報）
  2. Pull Request

  都非常歡迎！

- 你可以在下文找到在此倉庫中上手的基本指令清單，除此之外，檔案結構應當與**原始 marktext**非常相似

## 3. 專案設定

- 參見[開發者文件](../dev/README.md)
