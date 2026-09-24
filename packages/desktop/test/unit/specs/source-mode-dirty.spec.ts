import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.hoisted(() => {
  const w = globalThis as unknown as {
    window?: {
      path?: { sep: string; dirname: (p: string) => string }
      fileUtils?: { isSamePathSync: (a: string, b: string) => boolean }
      electron?: {
        clipboard: { writeText: (s: string) => void }
        ipcRenderer: { send: (...a: unknown[]) => void; on: (...a: unknown[]) => void }
      }
    }
  }
  w.window ??= {}
  w.window.path ??= { sep: '/', dirname: (p: string) => p }
  w.window.fileUtils ??= { isSamePathSync: (a, b) => a === b }
  w.window.electron ??= {
    clipboard: { writeText: () => {} },
    ipcRenderer: { send: () => {}, on: () => {} }
  }
})

vi.mock('@/services/notification', () => ({
  default: { notify: vi.fn(), name: 'notify' }
}))

import { useEditorStore } from '@/store/editor'
import bus from '@/bus'

// OMM: source undo, save acknowledgements and non-text changes share dirty-state coverage.

const listenForSaveConfirmation = (store: ReturnType<typeof useEditorStore>) => {
  const on = vi.spyOn(window.electron.ipcRenderer, 'on')
  store.LISTEN_FOR_SET_PATHNAME()
  return () => {
    const listener = on.mock.calls.find(([channel]) => channel === 'mt::tab-saved')?.[1]
    if (!listener) throw new Error('Save confirmation listener was not registered')
    listener({} as never, 'tab-1')
  }
}

// #4455: editing in Source Code mode and closing without switching back to
// WYSIWYG silently dropped the save prompt. Source-mode content changes reach
// LISTEN_FOR_CONTENT_CHANGE WITHOUT an editor `history`, and the history-based
// dirty check never flips `isSaved` (it can even reset it to true), so the
// close path saw nothing unsaved. Decide dirty state from the content instead.
describe('useEditorStore LISTEN_FOR_CONTENT_CHANGE — source-mode dirty tracking (#4455)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    bus.all.clear()
  })

  const makeSavedTab = (store: ReturnType<typeof useEditorStore>) => {
    const tab = {
      id: 'tab-1',
      filename: 'a.md',
      pathname: '/x/a.md',
      markdown: 'hello',
      trimTrailingNewline: 0,
      lineEnding: 'lf',
      encoding: { encoding: 'utf8', isBom: false },
      notifications: [],
      isSaved: true,
      lastSavedHistoryId: 7,
      history: { stack: [{ id: 7 }], index: 0, lastEditIndex: 0, lastInitIndex: -1 }
    }
    store.tabs = [tab] as unknown as typeof store.tabs
    store.tabIdToIndex = { 'tab-1': 0 }
    store.currentFile = store.tabs[0] ?? null
    return tab
  }

  it('marks the tab unsaved when source-mode content changes (no history in payload)', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)

    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })

    expect(tab.isSaved).toBe(false)
  })

  it('keeps the tab saved when source-mode fires with unchanged content (caret move)', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)

    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })

    expect(tab.isSaved).toBe(true)
  })

  it('clears the save prompt after a source edit is undone back to saved content (#4)', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)

    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })
    expect(tab.isSaved).toBe(false)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    expect(tab.isSaved).toBe(true)
  })

  it('keeps a divergent source edit dirty after undo', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello again' })
    expect(tab.isSaved).toBe(false)
  })

  it('does not mark a restored dirty buffer clean without a known saved baseline', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    tab.isSaved = false
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    expect(tab.isSaved).toBe(false)
  })

  it('does not clear the dirty flag after the file is removed from disk', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })
    store.SET_SAVE_STATUS_WHEN_REMOVE({ pathname: '/x/a.md' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    expect(tab.isSaved).toBe(false)
  })

  it('starts a fresh source baseline after saving', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    const confirmSave = listenForSaveConfirmation(store)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello saved' })
    confirmSave()
    expect(tab.isSaved).toBe(true)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    expect(tab.isSaved).toBe(false)
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello saved' })
    expect(tab.isSaved).toBe(true)
  })

  it('clears external-file dirty state when disk content is explicitly reloaded', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    store.SET_SAVE_STATUS_WHEN_REMOVE({ pathname: tab.pathname })
    expect(tab.isSaved).toBe(false)
    store.loadChange({
      pathname: tab.pathname,
      data: {
        markdown: 'from disk',
        filename: tab.filename,
        encoding: tab.encoding,
        lineEnding: 'lf',
        adjustLineEndingOnSave: false,
        trimTrailingNewline: 0
      }
    })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'from disk' })
    expect(tab.isSaved).toBe(true)
  })

  it.each(['line ending', 'encoding', 'final newline'])(
    'keeps changes to %s unsaved through source and WYSIWYG undo until save confirmation',
    (option) => {
      const store = useEditorStore()
      const tab = makeSavedTab(store)
      const confirmSave = listenForSaveConfirmation(store)
      store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello edited' })

      if (option === 'line ending') {
        store.SET_LINE_ENDING('crlf')
      } else if (option === 'encoding') {
        store.LISTEN_FOR_SET_ENCODING()
        bus.emit('mt::set-file-encoding', 'utf16le')
      } else {
        store.LISTEN_FOR_SET_FINAL_NEWLINE()
        bus.emit('mt::set-final-newline', 1)
      }
      expect(tab.isSaved).toBe(false)
      store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
      expect(tab.isSaved).toBe(false)
      store.LISTEN_FOR_CONTENT_CHANGE({
        id: 'tab-1', markdown: 'hello', history: tab.history as never
      })
      expect(tab.isSaved).toBe(false)
      confirmSave()
      expect(tab.isSaved).toBe(true)
      store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
      expect(tab.isSaved).toBe(true)
    }
  )

  it('compares the clean editor text rather than Light Touch disk formatting', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)
    Object.assign(tab, { originalMarkdown: 'hello   \n\n' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello world' })
    store.LISTEN_FOR_CONTENT_CHANGE({ id: 'tab-1', markdown: 'hello' })
    expect(tab.isSaved).toBe(true)
    expect(store.tabs[0]?.originalMarkdown).toBe('hello   \n\n')
  })

  it('leaves the WYSIWYG history-based path unchanged (history present, edit matches saved id)', () => {
    const store = useEditorStore()
    const tab = makeSavedTab(store)

    store.LISTEN_FOR_CONTENT_CHANGE({
      id: 'tab-1',
      markdown: 'hello world',
      history: { stack: [{ id: 7 }], lastEditIndex: 0, lastInitIndex: -1 } as never
    })

    expect(tab.isSaved).toBe(true)
  })
})
