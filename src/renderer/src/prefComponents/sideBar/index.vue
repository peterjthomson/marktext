<template>
  <div class="pref-sidebar">
    <h3 class="title">
      {{ t('preferences.title') }}
    </h3>
    <section class="search-wrapper">
      <el-autocomplete
        v-model="state"
        class="pref-autocomplete"
        :fetch-suggestions="querySearch"
        :placeholder="t('preferences.search.placeholder')"
        :trigger-on-focus="false"
        @select="handleSelect"
      >
        <template #suffix>
          <Search
            width="16"
            height="16"
          />
        </template>
        <template #default="{ item }">
          <div class="name">
            {{ item.category }}
          </div>
          <span class="addr">{{ item.preference }}</span>
        </template>
      </el-autocomplete>
    </section>
    <section class="category">
      <div
        v-for="c of getCategory()"
        :key="c.name"
        class="item"
        :class="{ active: c.label === currentCategory }"
        @click="handleCategoryItemClick(c)"
      >
        <component :is="c.icon" />
        <span>{{ c.name }}</span>
      </div>
    </section>
  </div>
</template>
<script setup>
import { getCategory, getTranslatedSearchContent } from './config'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const currentCategory = ref('general')
const restaurants = ref([])
const state = ref('')

watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) {
      currentCategory.value = newRouteName
    }
  }
)

const querySearch = (queryString, cb) => {
  const results = queryString
    ? restaurants.value.filter(createFilter(queryString))
    : restaurants.value
  cb(results)
}

const createFilter = (queryString) => {
  const q = queryString.toLowerCase()
  return (restaurant) => {
    // 同时支持当前语言和英文关键词
    const fields = [
      restaurant.preference,
      restaurant.category,
      restaurant.preferenceEn,
      restaurant.categoryEn
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
    return fields.some((f) => f.indexOf(q) >= 0)
  }
}

const loadAll = () => getTranslatedSearchContent()

const handleSelect = (item) => {
  // 使用安全的 routeCategory，避免不合法分类导致白屏
  const target =
    item && item.routeCategory ? item.routeCategory : (item?.category || 'general').toLowerCase()
  router.push({ path: `/preference/${target}` }).catch(() => {})
}

const handleCategoryItemClick = (item) => {
  if (item.name.toLowerCase() !== currentCategory.value) {
    router.push({
      path: item.path
    })
  }
}

const onIpcCategoryChange = (event, category) => {
  const validRoute =
    category && router.getRoutes().findIndex((route) => route.path.endsWith(`/${category}`)) !== -1
  if (validRoute) {
    router.push({
      path: `/preference/${category}`
    })
  }
}

onMounted(() => {
  restaurants.value = loadAll()
  if (route.name) {
    currentCategory.value = route.name
  }
  window.electron.ipcRenderer.on('settings::change-tab', onIpcCategoryChange)
  // 监听语言变化，刷新搜索索引
  const languageChanged = () => {
    restaurants.value = loadAll()
  }
  window.addEventListener('languageChanged', languageChanged)
  // 卸载时移除监听
  onUnmounted(() => window.removeEventListener('languageChanged', languageChanged))
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('settings::change-tab', onIpcCategoryChange)
})
</script>

<style>
.pref-sidebar {
  -webkit-app-region: drag;
  display: flex;
  flex-direction: column;
  background: var(--sideBarBgColor);
  width: var(--prefSideBarWidth);
  height: 100vh;
  padding-top: 30px;
  box-sizing: border-box;
  & h3 {
    margin: 0;
    font-weight: normal;
    text-align: center;
    color: var(--sideBarColor);
  }
}
.search-wrapper {
  -webkit-app-region: no-drag;
  padding: 0 20px;
  margin: 30px 0;
}
.el-autocomplete {
  width: 100%;

  & .el-input__wrapper {
    background: transparent;
  }

  & .el-input__inner {
    border: none;
    background: transparent;
    height: 35px;
    line-height: 35px;
  }
}
.pref-autocomplete.el-autocomplete-suggestion {
  background: var(--floatBgColor);
  border-color: var(--floatBorderColor);
  & .el-autocomplete-suggestion__wrap li:hover {
    background: var(--floatHoverColor);
  }
  & .popper__arrow {
    display: none;
  }
  & li {
    line-height: normal;
    padding: 7px;
    opacity: 0.8;

    & .name {
      text-overflow: ellipsis;
      overflow: hidden;
      color: var(--editorColor80);
    }
    & .addr {
      font-size: 12px;
      color: var(--editorColor);
    }

    & .highlighted .addr {
      color: var(--editorColor);
    }
  }
}
.category {
  -webkit-app-region: no-drag;
  overflow-y: auto;
  & .item {
    width: 100%;
    height: 50px;
    font-size: 18px;
    color: var(--sideBarColor);
    padding-left: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    position: relative;
    user-select: none;
    & > svg {
      width: 28px;
      height: 28px;
      fill: var(--iconColor);
      margin-right: 15px;
    }
    &:hover {
      background: var(--sideBarItemHoverBgColor);
    }
    &::before {
      content: '';
      width: 4px;
      height: 0;
      background: var(--highlightThemeColor);
      position: absolute;
      left: 0;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
      transition: height 0.25s ease-in-out;
      top: 50%;
      transform: translateY(-50%);
    }
    &.active {
      color: var(--sideBarTitleColor);
    }
    &.active::before {
      height: 100%;
    }
  }
}
</style>
