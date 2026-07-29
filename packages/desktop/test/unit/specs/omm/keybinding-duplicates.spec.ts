import { describe, expect, it } from 'vitest'
import { isEqualAccelerator } from 'common/keybinding'
import keybindingsDarwin from 'main_renderer/keyboard/keybindingsDarwin'
import keybindingsLinux from 'main_renderer/keyboard/keybindingsLinux'
import keybindingsWindows from 'main_renderer/keyboard/keybindingsWindows'

/**
 * Accelerators must be unique within a platform's default keymap.
 *
 * Two reasons this isn't just tidiness:
 *
 * 1. registerEditorKeyHandlers() registers every entry on the window and
 *    electron-localshortcut fires the *first* match in registration order, so a
 *    duplicate means the later command silently never runs. That is how
 *    window.zoomIn (declared after paragraph.upgrade-heading) lost Command+= .
 * 2. shortcutHandler's user-keybinding merge breaks the tie by `break`ing after
 *    the first conflicting default it finds — its comment states outright that
 *    "a accelerator should only exist once in the default map".
 */
const keymaps: Array<[string, Map<string, string>]> = [
  ['darwin', keybindingsDarwin],
  ['linux', keybindingsLinux],
  ['windows', keybindingsWindows]
]

const findDuplicates = (keymap: Map<string, string>): string[] => {
  const entries = [...keymap.entries()].filter(([, accelerator]) => accelerator.length > 0)
  const collisions: string[] = []

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [idA, accA] = entries[i]
      const [idB, accB] = entries[j]
      if (isEqualAccelerator(accA, accB)) {
        collisions.push(`"${accA}" is bound to both "${idA}" and "${idB}"`)
      }
    }
  }

  return collisions
}

describe('default keybindings', () => {
  for (const [platform, keymap] of keymaps) {
    it(`has no duplicate accelerators on ${platform}`, () => {
      expect(findDuplicates(keymap)).toEqual([])
    })
  }

  it('gives the plain zoom keys to zoom, not to heading promote/demote', () => {
    expect(keybindingsDarwin.get('window.zoomIn')).toBe('Command+=')
    expect(keybindingsDarwin.get('window.zoomOut')).toBe('Command+-')
    expect(keybindingsLinux.get('window.zoomIn')).toBe('Ctrl+=')
    expect(keybindingsLinux.get('window.zoomOut')).toBe('Ctrl+-')
    expect(keybindingsWindows.get('window.zoomIn')).toBe('Ctrl+=')
    expect(keybindingsWindows.get('window.zoomOut')).toBe('Ctrl+-')

    for (const [, keymap] of keymaps) {
      const zoomIn = keymap.get('window.zoomIn') ?? ''
      const zoomOut = keymap.get('window.zoomOut') ?? ''

      for (const id of ['paragraph.upgrade-heading', 'paragraph.degrade-heading']) {
        const accelerator = keymap.get(id) ?? ''
        expect(accelerator, `${id} must stay bound`).toBeTruthy()
        expect(
          isEqualAccelerator(accelerator, zoomIn) || isEqualAccelerator(accelerator, zoomOut),
          `${id} must not reuse a zoom accelerator`
        ).toBe(false)
      }
    }
  })
})
