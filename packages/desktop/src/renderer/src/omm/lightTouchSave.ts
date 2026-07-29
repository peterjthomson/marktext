/**
 * Light Touch wiring for the renderer's save paths.
 *
 * The merge itself is pure and lives in `common/omm/lightTouch`. This module
 * owns the small amount of tab bookkeeping around it — which bytes go to disk,
 * and which bytes become the baseline for the next merge — so the editor store
 * only ever calls a one-line hook.
 *
 * Deliberately does not touch `isSaved`. Dirty state is history-based in 0.20
 * (`lastSavedHistoryId`); comparing markdown strings here is what left tabs
 * permanently dirty in the 1.x fork whenever Light Touch wrote the original
 * bytes back.
 */

import { getMarkdownForSave } from 'common/omm/lightTouch'
import { usePreferencesStore } from '../store/preferences'
import type { IFileState } from '@shared/types/files'

/** The subset of a tab this module reads and writes. */
type LightTouchTab = Pick<IFileState, 'markdown' | 'originalMarkdown' | 'pendingSavedMarkdown'>

/**
 * Returns the markdown to write for `tab`, and records it as the pending
 * baseline so a confirmed save can promote it.
 *
 * Muya regenerates markdown from its block model, so saving an untouched file
 * can rewrite whitespace across the whole document. Light Touch merges that
 * output back against the bytes read from disk, leaving unchanged lines
 * byte-identical so `git diff` shows only the real edit.
 */
export const applyLightTouch = (
  tab: LightTouchTab | null | undefined,
  markdown: string
): string => {
  const { lightTouch } = usePreferencesStore()
  const payload = getMarkdownForSave(markdown, tab?.originalMarkdown, lightTouch)
  if (tab) {
    tab.pendingSavedMarkdown = payload
  }
  return payload
}

/**
 * Promotes the bytes the main process just confirmed writing to the merge
 * baseline for the next save.
 *
 * `hasPathname` covers save-as and the first save of an untitled buffer: the
 * document now has a file behind it, so even without a pending payload its
 * current markdown is what is on disk.
 */
export const promoteSaveBaseline = (
  tab: LightTouchTab | null | undefined,
  hasPathname = false
): void => {
  if (!tab) return
  if (tab.pendingSavedMarkdown != null) {
    tab.originalMarkdown = tab.pendingSavedMarkdown
    tab.pendingSavedMarkdown = null
  } else if (hasPathname && tab.originalMarkdown == null) {
    tab.originalMarkdown = tab.markdown
  }
}

/** Drops the pending payload after a failed save: nothing reached disk, so the
 * baseline must not advance. */
export const discardSaveBaseline = (tab: LightTouchTab | null | undefined): void => {
  if (tab) {
    tab.pendingSavedMarkdown = null
  }
}

/**
 * The merge baseline a freshly created document state starts with: the
 * markdown just read from disk. Untitled buffers have no on-disk original, so
 * they start with none. An explicit value in the source state (e.g. restored
 * buffered state) wins.
 */
export const initialBaseline = (
  docState: Pick<IFileState, 'markdown' | 'pathname' | 'originalMarkdown'>
): string | null => docState.originalMarkdown ?? (docState.pathname ? docState.markdown : null)
