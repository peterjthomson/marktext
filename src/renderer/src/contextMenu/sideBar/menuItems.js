/* eslint-disable camelcase */
import * as contextMenu from './actions'
import { t } from '../../i18n'

// NOTE: This are mutable fields that may change at runtime.

export const SEPARATOR = {
  type: 'separator'
}

// 使用函数形式避免模块加载时调用翻译函数
export const getNEW_FILE = () => ({
  label: t('contextMenu.sideBar.newFile'),
  id: 'newFileMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.newFile()
  }
})

export const getNEW_DIRECTORY = () => ({
  label: t('contextMenu.sideBar.newDirectory'),
  id: 'newDirectoryMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.newDirectory()
  }
})

export const getCOPY = () => ({
  label: t('contextMenu.sideBar.copy'),
  id: 'copyMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.copy()
  }
})

export const getCUT = () => ({
  label: t('contextMenu.sideBar.cut'),
  id: 'cutMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.cut()
  }
})

export const getPASTE = () => ({
  label: t('contextMenu.sideBar.paste'),
  id: 'pasteMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.paste()
  }
})

export const getRENAME = () => ({
  label: t('contextMenu.sideBar.rename'),
  id: 'renameMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.rename()
  }
})

export const getDELETE = () => ({
  label: t('contextMenu.sideBar.moveToTrash'),
  id: 'deleteMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.remove()
  }
})

export const getSHOW_IN_FOLDER = () => ({
  label: t('contextMenu.sideBar.showInFolder'),
  id: 'showInFolderMenuItem',
  click(menuItem, browserWindow) {
    contextMenu.showInFolder()
  }
})

// 为了向后兼容，保留原有的导出
export const NEW_FILE = getNEW_FILE()
export const NEW_DIRECTORY = getNEW_DIRECTORY()
export const COPY = getCOPY()
export const CUT = getCUT()
export const PASTE = getPASTE()
export const RENAME = getRENAME()
export const DELETE = getDELETE()
export const SHOW_IN_FOLDER = getSHOW_IN_FOLDER()
