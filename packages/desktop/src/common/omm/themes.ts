/**
 * Themes this fork adds on top of upstream's set.
 *
 * A theme has to be declared in five upstream places (window background colour,
 * menu, preferences list, CSS loader, locale). Keeping the metadata here means
 * each of those is a one-line spread rather than a hardcoded entry, so adding
 * the next theme touches no upstream file except the CSS loader — which needs a
 * real `import` and cannot be driven from data.
 */

export interface OmmTheme {
  /** Stored preference value, menu item id, and CSS file basename. */
  id: string
  /** Locale key under `menu.theme.`, and the label in the preferences grid. */
  labelKey: string
  /**
   * Editor background, kept identical to the theme CSS's `--editorBgColor`.
   * The main process paints new windows with this before the renderer loads so
   * the theme does not flash white on launch.
   */
  background: string
  isDark: boolean
}

export const OMM_THEMES: readonly OmmTheme[] = Object.freeze([
  {
    id: 'tufte',
    labelKey: 'tufte',
    background: '#f8f6f1',
    isDark: false
  }
])

/** `[id, background]` pairs for upstream's window-background map. */
export const ommThemeBackgrounds: ReadonlyArray<readonly [string, string]> = OMM_THEMES.map(
  (theme) => [theme.id, theme.background] as const
)

/** `[labelKey, id]` pairs for upstream's light/dark theme menu tables. */
export const ommLightThemeMenuEntries: ReadonlyArray<readonly [string, string]> = OMM_THEMES.filter(
  (theme) => !theme.isDark
).map((theme) => [theme.labelKey, theme.id] as const)

export const ommDarkThemeMenuEntries: ReadonlyArray<readonly [string, string]> = OMM_THEMES.filter(
  (theme) => theme.isDark
).map((theme) => [theme.labelKey, theme.id] as const)

export const ommDarkThemeIds: readonly string[] = OMM_THEMES.filter((theme) => theme.isDark).map(
  (theme) => theme.id
)
