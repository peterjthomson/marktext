import { getCurrentWindow, Menu as RemoteMenu, MenuItem as RemoteMenuItem } from '@electron/remote'
/* eslint-disable camelcase */
import {
  SEPARATOR,
  getNEW_FILE,
  getNEW_DIRECTORY,
  getCOPY,
  getCUT,
  getPASTE,
  getRENAME,
  getDELETE,
  getSHOW_IN_FOLDER
} from './menuItems'
/* eslint-enable camelcase */

export const showContextMenu = (event, hasPathCache) => {
  const menu = new RemoteMenu()
  const win = getCurrentWindow()
  // 动态获取菜单项以确保翻译正确
  const contextItems = [
    getNEW_FILE(),
    getNEW_DIRECTORY(),
    SEPARATOR,
    getCOPY(),
    getCUT(),
    getPASTE(),
    SEPARATOR,
    getRENAME(),
    getDELETE(),
    SEPARATOR,
    getSHOW_IN_FOLDER()
  ]

  contextItems[5].enabled = hasPathCache // PASTE item

  contextItems.forEach((item) => {
    menu.append(new RemoteMenuItem(item))
  })
  menu.popup([{ window: win, x: event.clientX, y: event.clientY }])
}
