<template>
  <section class="image-folder">
    <h5>{{ t('preferences.image.folderSetting.title') }}</h5>
    <text-box
      :description="t('preferences.image.folderSetting.globalFolder')"
      :input="imageFolderPath"
      :regex-validator="/^(?:$|([a-zA-Z]:)?[\/\\].*$)/"
      :default-value="folderPathPlaceholder"
      :on-change="(value) => modifyImageFolderPath(value)"
    />
    <div>
      <el-button
        size="mini"
        @click="modifyImageFolderPath(undefined)"
      >
        {{ t('preferences.image.folderSetting.open') }}
      </el-button>
      <el-button
        size="mini"
        @click="openImageFolder"
      >
        {{ t('preferences.image.folderSetting.showInFolder') }}
      </el-button>
    </div>
    <compound>
      <template #head>
        <bool
          :description="t('preferences.image.folderSetting.preferRelative')"
          more="https://github.com/marktext/marktext/blob/develop/docs/IMAGES.md"
          :bool="imagePreferRelativeDirectory"
          :on-change="(value) => onSelectChange('imagePreferRelativeDirectory', value)"
        />
      </template>
      <template #children>
        <text-box
          :description="t('preferences.image.folderSetting.relativeFolderName')"
          :input="imageRelativeDirectoryName"
          :regex-validator="/^(?:$|(?![a-zA-Z]:)[^\/\\].*$)/"
          :default-value="relativeDirectoryNamePlaceholder"
          :on-change="(value) => onSelectChange('imageRelativeDirectoryName', value)"
        />
        <div class="footnote">
          {{ t('preferences.image.folderSetting.filenameNote') }}
        </div>
      </template>
    </compound>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/store/preferences'
import Bool from '@/prefComponents/common/bool/index.vue'
import Compound from '@/prefComponents/common/compound/index.vue'
import TextBox from '@/prefComponents/common/textBox'

const { t } = useI18n()

const preferenceStore = usePreferencesStore()

// computed
const { imageFolderPath, imagePreferRelativeDirectory, imageRelativeDirectoryName } =
  storeToRefs(preferenceStore)
const folderPathPlaceholder = computed(() => preferenceStore.imageFolderPath || '')
const relativeDirectoryNamePlaceholder = computed(
  () => preferenceStore.imageRelativeDirectoryName || 'assets'
)

// methods
const openImageFolder = () => {
  window.electron.shell.openPath(imageFolderPath.value)
}

const modifyImageFolderPath = (value) => {
  return preferenceStore.SET_IMAGE_FOLDER_PATH(value)
}

const onSelectChange = (type, value) => {
  preferenceStore.SET_SINGLE_PREFERENCE({ type, value })
}
</script>

<style scoped>
.image-folder .footnote {
  font-size: 13px;
  & code {
    font-size: 13px;
  }
}
</style>
