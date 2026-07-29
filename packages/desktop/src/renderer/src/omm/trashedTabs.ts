/**
 * Tabs affected by a "move to trash" from the sidebar.
 *
 * Upstream trashes the path and leaves any tab backing it open. The file
 * watcher then marks that tab unsaved, and the next save — manual or autosave —
 * writes the file straight back to disk, undoing the delete.
 */

import { PATH_SEPARATOR } from '../config'
import type { IFileState } from '@shared/types/files'

type PathTab = Pick<IFileState, 'pathname'>

/**
 * Returns the tabs backing `pathname`, which may be a file or a directory; for
 * a directory every tab beneath it is included.
 */
export const tabsUnderTrashedPath = <T extends PathTab>(tabs: T[], pathname: string): T[] => {
  if (!pathname) return []

  const trashed = window.path.normalize(pathname)
  const prefix = trashed.endsWith(PATH_SEPARATOR) ? trashed : trashed + PATH_SEPARATOR

  return tabs.filter((tab) => {
    if (!tab.pathname) return false
    if (window.fileUtils.isSamePathSync(tab.pathname, trashed)) return true
    return window.path.normalize(tab.pathname).startsWith(prefix)
  })
}
