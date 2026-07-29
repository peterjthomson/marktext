import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { OMM_THEMES } from 'common/omm/themes'
import { getThemeBackgroundColor, isDarkThemeId } from 'common/theme'
import { themes as prefThemes } from '@/prefComponents/theme/config'

// A theme has to be declared in five separate places to work. Miss one and the
// failure is quiet and partial — the theme shows in the menu but the window
// flashes white on launch, or it styles the chrome but not code blocks. An
// upstream merge that rewrites any of those tables would do exactly that, so
// assert the whole registration rather than trusting it.

const desktopRoot = resolve(__dirname, '../../../..')
const read = (relative: string): string => readFileSync(resolve(desktopRoot, relative), 'utf8')

const customProperties = (css: string): Set<string> =>
  new Set(Array.from(css.matchAll(/^\s*(--[\w-]+)\s*:/gm), (match) => match[1]))

describe.each(OMM_THEMES.map((theme) => [theme.id, theme] as const))(
  'Oh My Marktext theme: %s',
  (id, theme) => {
    const themeCss = `src/renderer/src/assets/themes/${id}.theme.css`
    const prismCss = `src/renderer/src/assets/themes/prismjs/${id}.theme.css`

    it('ships a theme stylesheet and a matching Prism stylesheet', () => {
      expect(existsSync(resolve(desktopRoot, themeCss))).toBe(true)
      expect(existsSync(resolve(desktopRoot, prismCss))).toBe(true)
    })

    it('is wired into the renderer theme switch', () => {
      const loader = read('src/renderer/src/util/theme.ts')
      expect(loader).toContain(`case '${id}':`)
    })

    it('appears in the preferences theme grid', () => {
      expect(prefThemes.some((entry) => entry.name === id)).toBe(true)
    })

    it('has a menu label in the English locale', () => {
      const locale = JSON.parse(read('static/locales/en.json'))
      expect(locale.menu.theme[theme.labelKey]).toBeTruthy()
    })

    it('declares a window background matching the stylesheet', () => {
      // The main process paints new windows with this before the renderer
      // loads; if it drifts from --editorBgColor the theme flashes on launch.
      const declared = /--editorBgColor:\s*([^;]+);/.exec(read(themeCss))?.[1]?.trim()
      expect(declared).toBe(theme.background)
      expect(getThemeBackgroundColor(id)).toBe(theme.background)
    })

    it('agrees with isDarkThemeId', () => {
      expect(isDarkThemeId(id)).toBe(theme.isDark)
    })

    it('defines every custom property an upstream theme of the same kind does', () => {
      // A missing variable silently falls back to the previous theme's value,
      // which reads as "the theme is subtly broken in one panel".
      const reference = customProperties(
        read(
          `src/renderer/src/assets/themes/${theme.isDark ? 'material-dark' : 'graphite'}.theme.css`
        )
      )
      const declared = customProperties(read(themeCss))
      const missing = [...reference].filter((property) => !declared.has(property))
      expect(missing).toEqual([])
    })
  }
)
