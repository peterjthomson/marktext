# Themes

MarkText includes six built-in themes:

| Light Themes   | Dark Themes   |
| -------------- | ------------- |
| Cadmium Light  | Dark          |
| Graphite Light | Material Dark |
| Ulysses Light  | One Dark      |

## Changing Themes

You can change the theme via:
- **Menu**: View → Theme
- **Settings**: Preferences → Theme
- **Keyboard**: Use the command palette (`Cmd/Ctrl+Shift+P`) and search for "theme"

## System Theme Following

MarkText can automatically switch themes based on your system's light/dark mode setting:

1. Go to Preferences → Theme
2. Enable "Follow System Theme"
3. Select your preferred light mode theme
4. Select your preferred dark mode theme

## Custom CSS

You can apply custom CSS to modify any theme. Set `customCss` in your `preferences.json`:

```json
{
  "customCss": "body { background-color: #f0f0f0; }"
}
```

For the preferences file location, see [Application Data Directory](APPLICATION_DATA_DIRECTORY.md).
