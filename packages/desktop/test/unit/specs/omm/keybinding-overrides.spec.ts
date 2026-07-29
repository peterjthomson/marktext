import { describe, expect, it } from 'vitest'
import {
  ommKeybindingOverrides,
  withOmmKeybindings,
  type KeybindingPlatform
} from 'main_renderer/keyboard/omm/keybindingOverrides'
import keybindingsDarwin from 'main_renderer/keyboard/keybindingsDarwin'
import keybindingsLinux from 'main_renderer/keyboard/keybindingsLinux'
import keybindingsWindows from 'main_renderer/keyboard/keybindingsWindows'

// The platform keymaps are upstream files carried unmodified except for the
// export line, so these tests are what proves this fork's accelerators survive
// an upstream merge — the keymaps themselves no longer show the intent.

const maps: Array<[KeybindingPlatform, Map<string, string>]> = [
  ['darwin', keybindingsDarwin],
  ['linux', keybindingsLinux],
  ['windows', keybindingsWindows]
]

describe('Oh My Marktext keybinding overrides', () => {
  it.each(maps)('are applied to the %s keymap', (platform, keybindings) => {
    for (const [command, accelerator] of ommKeybindingOverrides[platform]) {
      expect(keybindings.get(command)).toBe(accelerator)
    }
  })

  it.each(maps)('bind zoom on %s', (_platform, keybindings) => {
    expect(keybindings.get('window.zoomIn')).not.toBe('')
    expect(keybindings.get('window.zoomOut')).not.toBe('')
  })

  it.each(maps)('keep heading promote/demote off the zoom keys on %s', (_p, keybindings) => {
    expect(keybindings.get('paragraph.upgrade-heading')).not.toBe(keybindings.get('window.zoomIn'))
    expect(keybindings.get('paragraph.degrade-heading')).not.toBe(keybindings.get('window.zoomOut'))
  })

  it('fails loudly when an override targets a command upstream dropped', () => {
    expect(() => withOmmKeybindings('darwin', new Map([['file.save', 'Command+S']]))).toThrow(
      /unknown command/
    )
  })
})
