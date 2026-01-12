# Command Line Interface

```
Usage: marktext [options] [path ...]

Options:
        --debug               Enable debug mode
        --safe                Disable plugins and other user configuration
    -n, --new-window          Open a new window on second-instance
        --user-data-dir       Change the user data directory
        --disable-gpu         Disable GPU hardware acceleration
        --disable-spellcheck  Disable spell checking
    -v, --verbose             Be verbose (can be repeated for more output)
        --version             Print version information
    -h, --help                Print this help message
```

## Examples

```sh
# Open a file
marktext file.md

# Open multiple files
marktext file1.md file2.md

# Open a folder as a project
marktext /path/to/folder

# Open in a new window
marktext -n file.md

# Run with custom data directory
marktext --user-data-dir /custom/path file.md
```

## Platform Setup

### macOS

Create a convenient shell alias:

```sh
alias marktext="/Applications/MarkText.app/Contents/MacOS/MarkText"
```

Or add MarkText to your PATH by creating a symlink:

```sh
sudo ln -s /Applications/MarkText.app/Contents/MacOS/MarkText /usr/local/bin/marktext
```

### Linux

If installed via AppImage, the executable location varies. For snap or deb packages, `marktext` should already be in your PATH.

### Windows

Add the MarkText installation directory to your system PATH, or use the full path to `marktext.exe`.
