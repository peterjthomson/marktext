<p align="center"><img src="../../static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  一款专注于速度与可用性的简洁优雅开源 Markdown 编辑器。<br>
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

- [MarkText](https://github.com/marktext/marktext) 是一款免费开源的 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和[贡献者们](https://github.com/marktext/marktext/graphs/contributors)编写。

- 遗憾的是，核心仓库大约在 3 年前起无人维护，但在我的日常使用中仍存在许多影响体验的细节问题。

- 本仓库旨在让我最喜欢的 Markdown 编辑器实现现代化，是基于 [Jacob Whall 的分叉](https://github.com/jacobwhall/marktext)再次派生的版本
  - 我的动机[参见下文](#1-soo-is-this-fork-any-different-from-the-countless-others)

- 你可以在下文阅读更多关于我动机的说明

# 1. 安装

> ⚠️ 这些发布仍处于 **beta** 阶段（因为我不确定迁移过程中破坏了多少功能）。请在 [问题跟踪器](https://github.com/Tkaixiang/marktext/issues)中报告任何错误

## Windows

- 只需查看[发布页](https://github.com/Tkaixiang/marktext/releases)下载!

- 已测试：
  - `Windows 11`

## Linux

- 只需查看[发布页](https://github.com/Tkaixiang/marktext/releases)下载！
- 已测试：
  - `Ubuntu 24.0.2`（`AppImage` 与 `.deb` 包）
  - _非常希望有人协助测试其他 Linux 打包形式！_

### Linux 包管理器

##### 1. Arch Linux ![AUR Version](<https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin%3E>)

- 感谢 [@kromsam](https://github.com/kromsam)，可在 [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) 获取

## MacOS

> ⚠️ 由于**缺少证书**，MacOS 版本会显示“`MarkText is damaged and can't be opened`”。
> 请参考[此处的修复方法](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300)（同样适用于任何缺少开发者账号签名的应用）

- 可在[发布页](https://github.com/Tkaixiang/marktext/releases)获取

# 2. 截图

![](../marktext.png?raw=true)

# 3. ✨功能 ⭐

- 现已支持 **9 种语言** 🆕（特别感谢 [@hubo1989](https://github.com/hubo1989))
  - `English` 🇺🇸
  - `简体中文` 🇨🇳
  - `繁體中文` 🇹🇼
  - `Deutsch` 🇩🇪
  - `Español` 🇪🇸
  - `Français` 🇫🇷
  - `日本語` 🇯🇵
  - `한국어` 🇰🇷
  - `Português` 🇵🇹

- 实时预览（所见即所得），界面干净简洁，带来无干扰写作体验。
- 支持 [CommonMark 规范](https://spec.commonmark.org/0.29/)、[GitHub 扩展 Markdown 规范](https://github.github.com/gfm/)，并选择性支持 [Pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。
- 提供 Markdown 扩展，例如数学公式（KaTeX）、Front Matter 与表情符号。
- 支持段落与行内样式的快捷方式，提升你的写作效率。
- 可导出 **HTML** 与 **PDF** 文件。
- 多种主题：**Cadmium Light**、**Material Dark** 等。
- 多种编辑模式：**源代码模式**、**打字机模式**、**专注模式**。
- 可直接从剪贴板粘贴图片。

## 3.1 🌙 主题🔆

| Cadmium Light                                   | Dark                                          |
| ----------------------------------------------- | --------------------------------------------- |
| ![](../themeImages/cadmium-light.png?raw=true)  | ![](../themeImages/dark.png?raw=true)         |
| Graphite Light                                  | Material Dark                                 |
| ![](../themeImages/graphite-light.png?raw=true) | ![](../themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                   | One Dark                                      |
| ![](../themeImages/ulysses-light.png?raw=true)  | ![](../themeImages/one-dark.png?raw=true)     |

## 3.2 😸编辑模式🐶

|       源代码       |         打字机         |       专注        |
| :----------------: | :--------------------: | :---------------: |
| ![](../source.gif) | ![](../typewriter.gif) | ![](../focus.gif) |

# 4. 动机

## 1. 那么这个分支与其他无数分支有何不同？

- 我对 `marktext` 的主要不满在于其开发框架与环境老化严重，编译耗时很长
  - 大多数库已过时，有些在现代版本的 Node.JS/Python 上甚至无法安装

- 因此，此分支算是一种重大“重写”，使用了 [electron-vite](https://electron-vite.org/) 取代旧的 `Babel + Webpack` 搭配
  - 目标是让 `marktext` 借助**尽可能现代的框架与库**实现一个**全新的开始**
  - 同时已将所有内容迁移到 `Vue3` 与 `Pinia`，并将各库升级到其可用的最新版本

- `main` 与 `preload` 进程仍编译为 `CommonJS`，而 `renderer` 现已完全采用 **仅 `ESModules`**（迁移过程中也因此遇到了一些有趣的问题）

## 2. 太棒了！我能如何贡献？

- 任何形式的：
  1. 问题报告
  2. Pull Request

  都非常欢迎！

- 你可以在下文找到在该仓库中上手的基本命令列表，除此之外，文件结构应当与**原始 marktext**非常相似

## 3. 项目设置

- 参见[开发者文档](../dev/README.md)
