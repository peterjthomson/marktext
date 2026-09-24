import type { IFileState } from '@shared/types/files'

// Source mode has no Muya history. Its clean editor text must stay separate
// from Light Touch's on-disk formatting. Weak keys release closed tabs.
const sourceCleanMarkdown = new WeakMap<IFileState, string>()
// Undoing text cannot undo an encoding change, restore a deleted file, or
// confirm a failed write. Those changes stay dirty until a successful save.
const requiresSave = new WeakSet<IFileState>()

export const confirmDocumentSaved = (tab: IFileState): void => {
  sourceCleanMarkdown.delete(tab)
  requiresSave.delete(tab)
  tab.isSaved = true
}

export const markDocumentUnsaved = (tab: IFileState): void => {
  sourceCleanMarkdown.delete(tab)
  requiresSave.add(tab)
  tab.isSaved = false
}

/** Undefined historyDirty means a source-mode event. Unknown leaves restored
 * dirty buffers alone when there is no trustworthy clean snapshot. */
export const getContentSaveState = (
  tab: IFileState,
  previousMarkdown: string,
  markdown: string,
  historyDirty: boolean | undefined
): 'dirty' | 'clean' | 'unknown' => {
  if (historyDirty !== undefined) {
    sourceCleanMarkdown.delete(tab)
    if (requiresSave.has(tab) || historyDirty) return 'dirty'
    return tab.lastSavedHistoryId !== -1 ? 'clean' : 'unknown'
  }

  if (tab.isSaved) sourceCleanMarkdown.set(tab, previousMarkdown)
  const baseline = sourceCleanMarkdown.get(tab)
  if (requiresSave.has(tab) || markdown !== (baseline ?? previousMarkdown)) return 'dirty'
  return baseline !== undefined ? 'clean' : 'unknown'
}
