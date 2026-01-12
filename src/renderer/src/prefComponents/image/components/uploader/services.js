// TODO: Remove information from other vue source files into this file.
import { t } from '../../../../i18n'

export const isValidService = (name) => {
  return name !== 'none' && getServices().hasOwnProperty(name)
}

const getServices = () => ({
  // Dummy service used to opt-in real services.
  none: {
    name: t('preferences.image.uploader.services.none'),
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',

    // Set to true to always allow to change to this dummy service
    agreedToLegalNotices: true
  },

  // Real services
  picgo: {
    name: t('preferences.image.uploader.services.picgo'),
    isGdprCompliant: false,
    privacyUrl: '',
    tosUrl: 'https://github.com/PicGo/PicGo-Core',

    // Currently a non-persistent value
    agreedToLegalNotices: true
  },

  github: {
    name: t('preferences.image.uploader.services.github'),
    isGdprCompliant: true,
    privacyUrl: 'https://github.com/site/privacy',
    tosUrl: 'https://github.com/site/terms',

    // Currently a non-persistent value
    agreedToLegalNotices: false
  },

  cliScript: {
    name: t('preferences.image.uploader.services.cliScript'),
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',
    agreedToLegalNotices: true
  }
})

export { getServices }
export default getServices
