## MarkText Preferences

Preferences can be controlled and modified in the settings window or via the `preferences.json` file in the [application data directory](APPLICATION_DATA_DIRECTORY.md).

### General

| Key                    | Type    | Default   | Description                                                                                           |
| ---------------------- | ------- | --------- | ----------------------------------------------------------------------------------------------------- |
| autoSave               | Boolean | false     | Automatically save the content being edited                                                           |
| autoSaveDelay          | Number  | 5000      | The delay in milliseconds before a changed file is saved (1000-10000)                                 |
| titleBarStyle          | String  | custom    | The title bar style on Linux and Windows: `custom` or `native`                                        |
| openFilesInNewWindow   | Boolean | false     | Open files in a new window                                                                            |
| openFolderInNewWindow  | Boolean | false     | Open folder via menu in a new window                                                                  |
| zoom                   | Number  | 1.0       | The zoom level (0.5 - 2.0)                                                                            |
| hideScrollbar          | Boolean | false     | Whether to hide scrollbars                                                                            |
| wordWrapInToc          | Boolean | false     | Whether to enable word wrap in TOC                                                                    |
| fileSortBy             | String  | modified  | Sort files in opened folder: `created`, `modified`, or `title`                                        |
| startUpAction          | String  | blank     | The action after startup: `lastState`, `folder`, or `blank`                                           |
| defaultDirectoryToOpen | String  | ""        | The path that should be opened if `startUpAction=folder`                                              |
| language               | String  | en        | The UI language                                                                                       |

### Editor

| Key                                | Type    | Default          | Description                                                                                                    |
| ---------------------------------- | ------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| editorFontFamily                   | String  | Open Sans        | Editor font family                                                                                             |
| fontSize                           | Number  | 16               | Font size in pixels (12-32)                                                                                    |
| lineHeight                         | Number  | 1.6              | Line height (1.2-2.0)                                                                                          |
| editorLineWidth                    | String  | ""               | Maximum editor width. Empty string or suffixes: `ch`, `px`, `%`                                                |
| wrapCodeBlocks                     | Boolean | true             | Wrap text inside code blocks                                                                                   |
| codeFontSize                       | Number  | 14               | Font size in code blocks (12-28)                                                                               |
| codeFontFamily                     | String  | DejaVu Sans Mono | Code font family                                                                                               |
| codeBlockLineNumbers               | Boolean | true             | Show line numbers in code blocks                                                                               |
| trimUnnecessaryCodeBlockEmptyLines | Boolean | true             | Trim beginning and ending empty lines in code blocks                                                           |
| autoPairBracket                    | Boolean | true             | Automatically pair brackets when editing                                                                       |
| autoPairMarkdownSyntax             | Boolean | true             | Autocomplete markdown syntax                                                                                   |
| autoPairQuote                      | Boolean | true             | Automatic completion of quotes                                                                                 |
| surroundSelection                  | Boolean | true             | Wrap selected text with brackets, quotes, or markdown syntax when typing                                       |
| endOfLine                          | String  | default          | Newline character: `default`, `lf`, or `crlf`                                                                  |
| defaultEncoding                    | String  | utf8             | Default file encoding                                                                                          |
| autoGuessEncoding                  | Boolean | true             | Try to automatically guess file encoding                                                                       |
| trimTrailingNewline                | Number  | 2                | Trailing newline handling: `0` (trim all), `1` (ensure single), `2` (auto detect), `3` (disabled)              |
| lightTouch                         | Boolean | true             | Preserve original whitespace formatting on save when no semantic changes were made                             |
| textDirection                      | String  | ltr              | Writing text direction: `ltr` or `rtl`                                                                         |
| hideQuickInsertHint                | Boolean | false            | Hide hint for quickly creating paragraphs                                                                      |
| hideLinkPopup                      | Boolean | false            | Hide link popup when hovering                                                                                  |
| autoCheck                          | Boolean | false            | Automatically check related task checkboxes                                                                    |

### Markdown

| Key                 | Type    | Default | Description                                                             |
| ------------------- | ------- | ------- | ----------------------------------------------------------------------- |
| preferLooseListItem | Boolean | true    | Prefer loose list items                                                 |
| bulletListMarker    | String  | -       | Bullet list marker: `-`, `*`, or `+`                                    |
| orderListDelimiter  | String  | .       | Ordered list delimiter: `.` or `)`                                      |
| preferHeadingStyle  | String  | atx     | Heading style: `atx` or `setext`                                        |
| tabSize             | Number  | 4       | Number of spaces a tab equals                                           |
| listIndentation     | Mixed   | 1       | List indentation: `dfm`, `tab`, or number 1-4                           |
| frontmatterType     | String  | -       | Frontmatter type: `-` (YAML), `+` (TOML), `;` (JSON), `{` (JSON object) |
| superSubScript      | Boolean | false   | Enable superscript (`^text^`) and subscript (`~text~`)                  |
| footnote            | Boolean | false   | Enable footnote syntax                                                  |
| isHtmlEnabled       | Boolean | true    | Enable HTML rendering in markdown                                       |
| isGitlabCompatibilityEnabled | Boolean | false | Enable GitLab compatibility mode                               |
| sequenceTheme       | String  | hand    | Sequence diagram theme: `hand` or `simple`                              |

### Theme

| Key               | Type    | Default | Description                                                                     |
| ----------------- | ------- | ------- | ------------------------------------------------------------------------------- |
| theme             | String  | light   | Theme: `dark`, `graphite`, `material-dark`, `one-dark`, `light`, or `ulysses`   |
| followSystemTheme | Boolean | false   | Use separate themes for light/dark system modes                                 |
| lightModeTheme    | String  | light   | Theme to use when system is in light mode                                       |
| darkModeTheme     | String  | dark    | Theme to use when system is in dark mode                                        |
| customCss         | String  | ""      | Custom CSS to apply to the current theme                                        |

### Spelling

| Key                    | Type    | Default | Description                           |
| ---------------------- | ------- | ------- | ------------------------------------- |
| spellcheckerEnabled    | Boolean | false   | Enable spell checking                 |
| spellcheckerNoUnderline| Boolean | false   | Don't underline spelling mistakes     |
| spellcheckerLanguage   | String  | en-US   | Spell checker language                |

### Image

| Key                        | Type    | Default | Description                                              |
| -------------------------- | ------- | ------- | -------------------------------------------------------- |
| imageInsertAction          | String  | path    | Default image action: `upload`, `folder`, or `path`      |
| imagePreferRelativeDirectory | Boolean | false | Prefer relative image directory                          |
| imageRelativeDirectoryName | String  | assets  | Relative image folder name                               |

### View (editable via file only)

These settings don't have a UI option and need to be changed manually in `preferences.json`.

| Key                   | Type    | Default | Description                                |
| --------------------- | ------- | ------- | ------------------------------------------ |
| sideBarVisibility     | Boolean | false   | Default sidebar visibility                 |
| tabBarVisibility      | Boolean | false   | Default tab bar visibility                 |
| sourceCodeModeEnabled | Boolean | false   | Default source code mode state             |

### File System (editable via file only)

| Key                  | Type             | Default | Description                                                        |
| -------------------- | ---------------- | ------- | ------------------------------------------------------------------ |
| searchExclusions     | Array of Strings | []      | Glob patterns to exclude from search                               |
| searchMaxFileSize    | String           | ""      | Maximum file size to search (e.g., `50K`, `10M`). Empty = unlimited |
| searchIncludeHidden  | Boolean          | false   | Search hidden files and directories                                |
| searchNoIgnore       | Boolean          | false   | Don't respect ignore files like `.gitignore`                       |
| searchFollowSymlinks | Boolean          | true    | Follow symbolic links                                              |
| watcherUsePolling    | Boolean          | false   | Use polling for file watching (needed for network drives)          |
