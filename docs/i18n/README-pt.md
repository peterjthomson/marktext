<p align="center"><img src="../../static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>🔆 Editor Markdown de próxima geração 🌙</strong><br>
  Um editor Markdown de código aberto, simples e elegante, focado na velocidade e na usabilidade.<br>
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

- [MarkText](https://github.com/marktext/marktext) é um editor Markdown gratuito e de código aberto, escrito originalmente por [Jocs](https://github.com/Jocs) e [contribuidores](https://github.com/marktext/marktext/graphs/contributors).

- Infelizmente, o repositório principal deixou de ser mantido há cerca de 3 anos, mas vários problemas de qualidade de vida permaneceram, que notei no meu uso diário.

- Este repositório é uma tentativa de modernizar o meu editor Markdown favorito e é um fork baseado no [fork do Jacob Whall](https://github.com/jacobwhall/marktext)
  - Veja [a minha motivação abaixo](#1-soo-is-this-fork-any-different-from-the-countless-others)

- Pode ler mais sobre a minha motivação abaixo

# 1. Instalação

> ⚠️ Estas versões ainda estão em **beta** (pois não sei quanto posso ter quebrado durante a migração). Por favor, relate quaisquer bugs no [issue tracker](https://github.com/Tkaixiang/marktext/issues)

## Windows

- Basta consultar a [página de lançamentos](https://github.com/Tkaixiang/marktext/releases)!

- Testado em:
  - `Windows 11`

## Linux

- Basta consultar a [página de lançamentos](https://github.com/Tkaixiang/marktext/releases)
- Testado em:
  - `Ubuntu 24.0.2` (pacotes `AppImage` e `.deb`)
  - _Gostaria muito de ajuda para testar os outros pacotes Linux!_

### Gestores de pacotes Linux

##### 1. Arch Linux ![AUR Version](<https://img.shields.io/aur/version/marktext-tkaixiang-bin?label=(AUR)%20marktext-tkaixiang-bin%3E>)

- Disponível no [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) graças a [@kromsam](https://github.com/kromsam)

## MacOS

> ⚠️ As versões para MacOS irão mostrar "`MarkText is damaged and can't be opened`" devido à **falta de notarização**.
> Consulte [esta correção aqui](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300) (também se aplica a qualquer outra app que não tenha assinatura de conta de programador)

- Disponível na [página de lançamentos](https://github.com/Tkaixiang/marktext/releases)

# 2. Capturas de ecrã

![](../marktext.png?raw=true)

# 3. ✨Funcionalidades ⭐

- Agora disponível em **9 idiomas** 🆕 (agradecimento especial a [@hubo1989](https://github.com/hubo1989))
  - `English` 🇺🇸
  - `简体中文` 🇨🇳
  - `繁體中文` 🇹🇼
  - `Deutsch` 🇩🇪
  - `Español` 🇪🇸
  - `Français` 🇫🇷
  - `日本語` 🇯🇵
  - `한국어` 🇰🇷
  - `Português` 🇵🇹

- Pré-visualização em tempo real (WYSIWYG) e uma interface limpa e simples para uma experiência de escrita sem distrações.
- Suporta a [especificação CommonMark](https://spec.commonmark.org/0.29/), a [especificação GitHub Flavored Markdown](https://github.github.com/gfm/) e suporte seletivo a [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Extensões de Markdown como expressões matemáticas (KaTeX), front matter e emojis.
- Atalhos de parágrafos e de estilos inline para melhorar a sua eficiência de escrita.
- Exporta ficheiros **HTML** e **PDF**.
- Vários temas: **Cadmium Light**, **Material Dark** etc.
- Vários modos de edição: **modo código-fonte**, **modo máquina de escrever**, **modo foco**.
- Colar imagens diretamente da área de transferência.

## 3.1 🌙 Temas🔆

| Cadmium Light                                   | Dark                                          |
| ----------------------------------------------- | --------------------------------------------- |
| ![](../themeImages/cadmium-light.png?raw=true)  | ![](../themeImages/dark.png?raw=true)         |
| Graphite Light                                  | Material Dark                                 |
| ![](../themeImages/graphite-light.png?raw=true) | ![](../themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                   | One Dark                                      |
| ![](../themeImages/ulysses-light.png?raw=true)  | ![](../themeImages/one-dark.png?raw=true)     |

## 3.2 😸Modos de edição🐶

|    Código-fonte    |  Máquina de escrever   |       Foco        |
| :----------------: | :--------------------: | :---------------: |
| ![](../source.gif) | ![](../typewriter.gif) | ![](../focus.gif) |

# 4. Motivação

## 1. Então este fork é diferente dos inúmeros outros?

- Uma das minhas principais queixas ao analisar o `marktext` foi que o framework e o ambiente de desenvolvimento estavam a envelhecer mal e demorava imenso a compilar
  - A maioria das bibliotecas estava desatualizada e algumas nem sequer podiam ser instaladas com versões modernas do Node.JS/Python

- Por isso, este fork é uma espécie de grande "reescrita" que utiliza [electron-vite](https://electron-vite.org/) em vez da antiga configuração `Babel + Webpack`
  - O objetivo aqui é dar ao `marktext` um **novo começo** usando **frameworks e bibliotecas modernas sempre que possível**
  - Tudo também foi migrado para `Vue3` e `Pinia`, com todas as bibliotecas atualizadas para as versões mais recentes possíveis

- Os processos `main` e `preload` ainda são compilados para `CommonJS`, mas o `renderer` agora é totalmente **apenas `ESModules`** (_o que trouxe alguns desafios interessantes durante a migração_)

## 2. Que fixe! Como posso ajudar?

- Qualquer forma de:
  1. Testes de bugs (relatórios de erros)
  2. Pull Requests

  é mais do que bem-vinda!

- Pode encontrar abaixo uma lista básica de comandos para se orientar neste repositório, mas de resto a estrutura de ficheiros deverá ser **muito semelhante à do marktext original**

## 3. Configuração do projeto

- Consulte a [Documentação do Programador](../dev/README.md)
