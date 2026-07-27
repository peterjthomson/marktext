import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// `@/store/editor` transitively imports `@/config`, which reads `window.path.sep`
// at module load (normally injected by the preload bridge), and reaches
// `window.electron` / `window.fileUtils` at runtime. Stub before hoisted imports.
vi.hoisted(() => {
  const normalize = (p: string): string => p.replace(/\/+/g, '/').replace(/\/$/, '')
  const w = globalThis as unknown as {
    window?: Record<string, unknown>
  }
  w.window ??= {}
  w.window.path ??= {
    sep: '/',
    dirname: (p: string) => p.slice(0, p.lastIndexOf('/')) || '/',
    basename: (p: string) => p.slice(p.lastIndexOf('/') + 1),
    normalize
  }
  w.window.fileUtils ??= {
    isSamePathSync: (a: string, b: string) => normalize(a) === normalize(b)
  }
  w.window.electron ??= {
    clipboard: { writeText: () => {} },
    ipcRenderer: { send: () => {}, on: () => {}, invoke: () => Promise.resolve() }
  }
})

vi.mock('@/services/notification', () => ({
  default: { notify: vi.fn(), name: 'notify' }
}))

import { useEditorStore } from '@/store/editor'

interface StubTab {
  id: string
  pathname: string
  filename: string
  isSaved: boolean
  markdown: string
}

const tab = (id: string, pathname: string, isSaved = true): StubTab => ({
  id,
  pathname,
  filename: pathname.slice(pathname.lastIndexOf('/') + 1),
  isSaved,
  markdown: ''
})

describe('CLOSE_TABS_FOR_TRASHED_PATH', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('closes the tab backing a trashed file', () => {
    const store = useEditorStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.tabs = [tab('a', '/notes/keep.md'), tab('b', '/notes/gone.md')] as any
    store.currentFile = store.tabs[1]

    store.CLOSE_TABS_FOR_TRASHED_PATH('/notes/gone.md')

    expect(store.tabs.map((t) => t.pathname)).toEqual(['/notes/keep.md'])
  })

  /**
   * The whole point of the fix: a deleted file's tab is marked unsaved by the
   * watcher, and routing an unsaved tab through CLOSE_TAB offers to save it,
   * which writes the file back to disk. It must be force-closed instead.
   */
  it('force-closes an unsaved tab rather than offering to save it back', () => {
    const store = useEditorStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.tabs = [tab('a', '/notes/gone.md', false)] as any
    store.currentFile = store.tabs[0]

    const sendSpy = vi.spyOn(window.electron.ipcRenderer, 'send')
    store.CLOSE_TABS_FOR_TRASHED_PATH('/notes/gone.md')

    expect(store.tabs).toHaveLength(0)
    const channels = sendSpy.mock.calls.map((c) => c[0])
    expect(channels).not.toContain('mt::save-and-close-tabs')
    expect(channels).toContain('mt::window-tab-closed')
  })

  it('closes every tab beneath a trashed directory', () => {
    const store = useEditorStore()
    store.tabs = [
      tab('a', '/notes/project/one.md'),
      tab('b', '/notes/project/sub/two.md'),
      tab('c', '/notes/other.md')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any
    store.currentFile = store.tabs[0]

    store.CLOSE_TABS_FOR_TRASHED_PATH('/notes/project')

    expect(store.tabs.map((t) => t.pathname)).toEqual(['/notes/other.md'])
  })

  it('does not close a sibling whose name merely shares the prefix', () => {
    const store = useEditorStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.tabs = [tab('a', '/notes/project-notes/one.md'), tab('b', '/notes/project/two.md')] as any
    store.currentFile = store.tabs[0]

    store.CLOSE_TABS_FOR_TRASHED_PATH('/notes/project')

    expect(store.tabs.map((t) => t.pathname)).toEqual(['/notes/project-notes/one.md'])
  })

  it('leaves untitled tabs alone', () => {
    const store = useEditorStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.tabs = [tab('a', '')] as any
    store.currentFile = store.tabs[0]

    store.CLOSE_TABS_FOR_TRASHED_PATH('/notes/gone.md')

    expect(store.tabs).toHaveLength(1)
  })
})
