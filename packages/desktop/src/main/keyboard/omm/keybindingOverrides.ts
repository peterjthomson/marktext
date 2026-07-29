/**
 * Oh My Marktext keybinding overrides.
 *
 * The platform keymaps are upstream files that change often, so this fork does
 * not edit their entries in place — each one applies this override table on
 * export instead, leaving a two-line diff to carry across upstream merges.
 *
 * Only accelerators are overridden; commands themselves are upstream's.
 */

export type KeybindingPlatform = 'darwin' | 'linux' | 'windows'

/**
 * Zoom is the reason most of these exist. `registerEditorKeyHandlers()`
 * registers every entry on the window and electron-localshortcut fires the
 * *first* match in registration order, so upstream's `paragraph.upgrade-heading`
 * on Command+= swallowed the zoom key before `window.zoomIn` (declared later)
 * could see it. Heading promote/demote moves to a modifier variant and zoom
 * takes the conventional keys.
 */
const OVERRIDES: Record<KeybindingPlatform, ReadonlyArray<readonly [string, string]>> = {
  darwin: [
    ['paragraph.upgrade-heading', 'Ctrl+Command+='],
    ['paragraph.degrade-heading', 'Ctrl+Command+-'],
    ['window.zoomIn', 'Command+='],
    ['window.zoomOut', 'Command+-']
  ],
  linux: [
    // Alt variant matches the Ctrl+Alt+1..6 heading bindings alongside it.
    ['paragraph.upgrade-heading', 'Ctrl+Alt+='],
    ['paragraph.degrade-heading', 'Ctrl+Alt+-'],
    ['window.zoomIn', 'Ctrl+='],
    ['window.zoomOut', 'Ctrl+-']
  ],
  windows: [
    // Upstream puts print on Ctrl+P, which is also file.quick-open on every
    // platform including this one — print won the race and quick-open never
    // fired. Print keeps its menu entry, just not the shortcut.
    ['file.print', ''],
    ['paragraph.upgrade-heading', 'Ctrl+Alt+='],
    ['paragraph.degrade-heading', 'Ctrl+Alt+-'],
    ['window.zoomIn', 'Ctrl+='],
    ['window.zoomOut', 'Ctrl+-']
  ]
}

/**
 * Applies this fork's accelerators to an upstream keymap, in place.
 *
 * Throws on an override whose command upstream no longer defines: a silently
 * ignored override would look like the feature regressed after a merge.
 */
export const withOmmKeybindings = (
  platform: KeybindingPlatform,
  keybindings: Map<string, string>
): Map<string, string> => {
  for (const [command, accelerator] of OVERRIDES[platform]) {
    if (!keybindings.has(command)) {
      throw new Error(
        `Oh My Marktext keybinding override targets unknown command "${command}" on ${platform}.`
      )
    }
    keybindings.set(command, accelerator)
  }
  return keybindings
}

/** Exposed for tests that assert the overrides land and stay conflict-free. */
export const ommKeybindingOverrides = OVERRIDES
