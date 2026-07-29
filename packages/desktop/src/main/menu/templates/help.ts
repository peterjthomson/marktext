import path from 'path'
import { shell, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { isFile } from 'common/filesystem'
import * as actions from '../actions/help'
import { checkUpdates } from '../actions/marktext'
import { GITHUB_REPO_URL } from '../../config'
import { OMM_DEFAULT_BRANCH, UPSTREAM_REPO_URL } from 'common/omm/brand' // OMM
import { t } from '../../i18n'

/// Check whether the package is updatable at runtime.
const isUpdatable = (): boolean => {
  // TODO: If not updatable, allow to check whether there is a new version available.

  const resFile = isFile(path.join(process.resourcesPath, 'app-update.yml'))
  if (!resFile) {
    // No update resource file available.
    return false
  } else if (process.env.APPIMAGE) {
    // We are running as AppImage.
    return true
  } else if (process.platform === 'win32' && isFile(path.join(process.resourcesPath, 'md.ico'))) {
    // Windows is a little but tricky. The update resource file is always available and
    // there is no way to check the target type at runtime (electron-builder#4119).
    // As workaround we check whether "md.ico" exists that is only included in the setup.
    return true
  }

  // Otherwise assume that we cannot perform an auto update (standalone binary, archives,
  // packed for package manager).
  return false
}

export default function(): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: t('menu.help.markdownReference'),
      click() {
        shell.openExternal(
          'https://marktext.me/docs/markdown-syntax'
        )
      }
    },
    {
      label: t('menu.help.changelog'),
      click() {
        shell.openExternal(`${GITHUB_REPO_URL}/releases`)
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.followUs'),
      click() {
        shell.openExternal('https://twitter.com/marktextapp')
      }
    },
    {
      label: t('menu.help.support'),
      click() {
        shell.openExternal('https://github.com/sponsors/marktext')
      }
    },
    {
      type: 'separator'
    },
    {
      label: t('menu.help.askQuestion'),
      click() {
        shell.openExternal(`${GITHUB_REPO_URL}/discussions`)
      }
    },
    {
      label: t('menu.help.reportBug'),
      click() {
        shell.openExternal(`${GITHUB_REPO_URL}/issues`)
      }
    },
    {
      label: t('menu.help.viewSource'),
      click() {
        shell.openExternal(GITHUB_REPO_URL)
      }
    },
    {
      type: 'separator'
    },
    {
      // OMM: a sister fork should send people to the project it is built on.
      label: t('menu.help.basedOnMarkText'),
      click() {
        shell.openExternal(UPSTREAM_REPO_URL)
      }
    },
    {
      label: t('menu.help.license'),
      click() {
        shell.openExternal(`${GITHUB_REPO_URL}/blob/${OMM_DEFAULT_BRANCH}/LICENSE`)
      }
    }
  ]

  const helpMenu: MenuItemConstructorOptions = {
    label: t('menu.help.help'),
    role: 'help',
    submenu
  }

  if (isUpdatable()) {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.help.checkUpdates'),
        click(_menuItem, browserWindow) {
          checkUpdates((browserWindow as BrowserWindow | undefined) ?? null)
        }
      }
    )
  }

  if (process.platform !== 'darwin') {
    submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.help.about'),
        click(_menuItem, browserWindow) {
          actions.showAboutDialog(browserWindow as BrowserWindow | undefined)
        }
      }
    )
  }
  return helpMenu
}
