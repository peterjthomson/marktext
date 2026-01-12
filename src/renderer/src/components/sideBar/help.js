import FilesIcon from '@/assets/icons/files.svg'
import SearchIcon from '@/assets/icons/search.svg'
import TocIcon from '@/assets/icons/toc.svg'
import SettingIcon from '@/assets/icons/setting.svg'
import { t } from '@/i18n'

export const sideBarIcons = [
  {
    id: 'files',
    name: () => t('sideBar.icons.files'),
    icon: FilesIcon
  },
  {
    id: 'search',
    name: () => t('sideBar.icons.search'),
    icon: SearchIcon
  },
  {
    id: 'toc',
    name: () => t('sideBar.icons.toc'),
    icon: TocIcon
  }
]

export const sideBarBottomIcons = [
  {
    id: 'settings',
    name: () => t('sideBar.icons.settings'),
    icon: SettingIcon
  }
]
