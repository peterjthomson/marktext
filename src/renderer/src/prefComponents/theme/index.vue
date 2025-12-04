<template>
  <div class="pref-theme">
    <h4>{{ t('preferences.theme.title') }}</h4>
    <section class="offcial-themes">
      <div
        v-for="t of themes"
        :key="t.name"
        class="theme"
        :class="[
          t.name,
          {
            active: t.name === theme,
            disabled: followSystemTheme
          }
        ]"
        @click="!followSystemTheme && onSelectChange('theme', t.name)"
      >
        <div v-html="t.html"></div>
      </div>
    </section>
    <separator></separator>

    <Bool
      :description="t('preferences.theme.followSystemTheme')"
      :bool="followSystemTheme"
      :on-change="(value) => onSelectChange('followSystemTheme', value)"
    />

    <compound v-if="followSystemTheme">
      <template #head>
        <h6 class="title">{{ t('preferences.theme.modeThemes') }}</h6>
      </template>
      <template #children>
        <cur-select
          :description="t('preferences.theme.lightModeTheme')"
          :value="lightModeTheme"
          :options="themeOptions"
          :on-change="(value) => onSelectChange('lightModeTheme', value)"
        ></cur-select>

        <cur-select
          :description="t('preferences.theme.darkModeTheme')"
          :value="darkModeTheme"
          :options="themeOptions"
          :on-change="(value) => onSelectChange('darkModeTheme', value)"
        ></cur-select>
      </template>
    </compound>

    <div>
      <div style="font-size: smaller; color: var(--editorColor)">{{ t('preferences.theme.customCss') }}</div>
      <textarea
        style="
          width: 100%;
          background: transparent;
          color: var(--editorColor);
          border: 1px solid var(--editorColor10);
        "
        rows="10"
        :value="customCss"
        @change="(event) => onSelectChange('customCss', event.target.value)"
      ></textarea>
    </div>
    <separator v-show="false"></separator>
    <section v-show="false" class="import-themes ag-underdevelop">
      <div>
        <span>{{ t('preferences.theme.openThemesFolder') }}</span>
        <el-button size="small">{{ t('preferences.theme.openFolder') }}</el-button>
      </div>

      <div>
        <span>{{ t('preferences.theme.importCustomThemes') }}</span>
        <el-button size="small">{{ t('preferences.theme.importTheme') }}</el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePreferencesStore } from '@/store/preferences'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import themeMd from './theme.md?raw'
import { themes as configThemes } from './config'
import markdownToHtml from '@/util/markdownToHtml'
import Bool from '../common/bool'
import CurSelect from '../common/select'
import Separator from '../common/separator'
import Compound from '../common/compound'

const themes = ref([])

const { t } = useI18n()
const preferenceStore = usePreferencesStore()

const { followSystemTheme, lightModeTheme, darkModeTheme, theme, customCss } = storeToRefs(preferenceStore)

// Generate dropdown options from configThemes
const themeOptions = configThemes.map(theme => ({
  label: theme.name.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' '),
  value: theme.name
}))

onMounted(async () => {
  const newThemes = []
  for (const theme of configThemes) {
    const html = await markdownToHtml(themeMd.replace(/{theme}/, theme.name))
    newThemes.push({
      name: theme.name,
      html
    })
  }
  themes.value = newThemes
})

const onSelectChange = (type, value) => {
  preferenceStore.SET_SINGLE_PREFERENCE({ type, value })
}
</script>

<style>
.offcial-themes {
  margin-top: 12px;
  & .theme {
    cursor: pointer;
    width: 248px;
    height: 100px;
    margin: 0px 20px 10px 20px;
    padding-left: 30px;
    padding-top: 20px;
    overflow: hidden;
    display: inline-block;
    background: var(--editorBgColor);
    color: var(--editorColor);
    box-sizing: border-box;
    box-shadow: 0 9px 28px -9px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    transition: opacity 0.2s ease;

    &.dark {
      color: rgba(255, 255, 255, 0.7);
      background: #282828;
      & a {
        color: #409eff;
      }
    }
    &.light {
      color: rgba(0, 0, 0, 0.7);
      background: rgba(255, 255, 255, 1);
      & a {
        color: rgba(33, 181, 111, 1);
      }
    }
    &.graphite {
      color: rgba(43, 48, 50, 0.7);
      background: #f7f7f7;
      & a {
        color: rgb(104, 134, 170);
      }
    }
    &.material-dark {
      color: rgba(171, 178, 191, 0.8);
      background: #34393f;
      & a {
        color: #f48237;
      }
    }
    &.one-dark {
      color: #9da5b4;
      background: #282c34;
      & a {
        color: rgba(226, 192, 141, 1);
      }
    }
    &.ulysses {
      color: rgba(101, 101, 101, 0.7);
      background: #f3f3f3;
      & a {
        color: rgb(12, 139, 186);
      }
    }

    /* Disabled state when followSystemTheme is on */
    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Active theme - use outline instead of border to avoid layout shift? */
    &.active {
      box-shadow: var(--floatShadow);
      outline: 2px solid var(--themeColor);
      outline-offset: -2px;
    }

    /* Active + disabled: slightly more visible */
    &.disabled.active {
      opacity: 0.7;
    }
  }
  & h3 {
    margin: 0;
    font-size: 16px;
    color: currentColor;
    cursor: pointer;
    &::before {
      content: 'h3';
      position: absolute;
      top: 4px;
      left: -20px;
      display: block;
      width: 10px;
      height: 10px;
      font-size: 12px;
      opacity: 0.5;
    }
  }
  & p {
    font-size: 12px;
  }
}

.import-themes {
  padding: 10px 0;
  display: flex;
  justify-content: space-around;
  color: var(--editorColor);
  & > div {
    display: flex;
    flex-direction: column;
    & > span {
      display: inline-block;
      margin-bottom: 20px;
    }
  }
}
</style>
