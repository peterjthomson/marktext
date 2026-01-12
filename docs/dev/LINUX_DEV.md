# Linux Specific Pre-requisites

- These are tested on Ubuntu 24.04.2 LTS and Ubuntu 22.04 LTS (thanks to "FP Coetzee")

## System Requirements

- Disk space ~1.2G for basic build.
- RAM: Minimum 4GB recommended (for Electron builds)

## Pre-requisites

- Node.js (`22.19.0`)
- Ubuntu Packages: `git`, `build-essential` and `xorg-dev`

### 1. Install System Packages

for ubuntu

```bash
sudo apt update && sudo apt install -y git build-essential xorg-dev
```

for fedora

```bash
sudo dnf install -y xorg-x11-server-devel libxkbfile-devel
```

### 2. Install Node

- I recommend using [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

## Common Issues & Solutions

### Issue: npm install fails with native-keymap error

**Error message:**

```bash
npm error code 1
npm error path ~/marktext/node_modules/native-keymap
npm error command failed
npm error command sh -c node-gyp rebuild
npm error gyp info it worked if it ends with ok
npm error gyp info using node-gyp@11.2.0
npm error gyp info using node@22.18.0 | linux | x64
```

**Solution:**
This occurs when `xorg-dev` is missing. Install it:

```bash
sudo apt install xorg-dev
```

Then retry:

```bash
npm install
```

### Issue: Electron fails to start with libglib error

**Error message:**

```bash
~/marktext/node_modules/electron/dist/electron: error while loading shared libraries:
libglib-2.0.so.0: cannot open shared object file: No such file or directory
```

**Solution:**
Install the X11/GUI development libraries:

```bash
sudo apt install xorg-dev
```

If the issue persists, you may need the full X11 environment:

```bash
sudo apt install xorg
```

### Issue: Permission errors during npm install

**Solution:**
Make sure you're not running `npm` commands with `sudo`. If you have permission issues:

```bash
# Fix npm permissions (if needed)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```
