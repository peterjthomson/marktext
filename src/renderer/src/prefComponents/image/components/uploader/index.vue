<template>
  <div class="pref-image-uploader">
    <h5>{{ t('preferences.image.uploader.title') }}</h5>
    <section class="current-uploader">
      <div v-if="isValidUploaderService(currentUploader)">
        {{ t('preferences.image.uploader.currentUploader', { name: getServiceNameById(currentUploader) }) }}
      </div>
      <span v-else
        >{{ t('preferences.image.uploader.noUploaderSelected') }}</span
      >
    </section>
    <section class="configration">
      <cur-select
        :value="currentUploader"
        :options="uploaderOptions"
        :on-change="(value) => setCurrentUploader(value)"
      ></cur-select>
      <div v-if="currentUploader === 'picgo'" class="picgo">
        <div class="detection-status">
          <div class="detection-header">
            <h6>{{ t('preferences.image.uploader.picgoDetection') }}</h6>
            <div class="detection-controls">
              <!-- 独立的刷新按钮 -->
              <button v-if="showStandaloneRefreshButton" class="standalone-refresh-button" @click="manualDetection" :disabled="isDetecting" :title="t('preferences.image.uploader.retestPicgo')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
              <div class="detection-status-indicator">
                <!-- 加载动画和状态指示器 -->
                <div class="detection-animation-container">
                  <!-- 初始按钮（0.5秒后变为动画） -->
                  <button v-if="showInitialButton" class="initial-button">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </button>
                  <!-- 加载动画 -->
                  <div v-if="showLoadingAnimation" class="loading-dot" :class="{ 'animate': animationActive }"></div>
                  <!-- 状态指示器按钮（移除图标） -->
                  <button v-if="showStatusIndicator" class="status-indicator" :class="getStatusIndicatorClass()" @click="manualDetection">
                    <!-- 移除所有SVG图标 -->
                  </button>
                  <!-- 刷新按钮 -->
                  <button v-if="showRefreshButton" class="refresh-button" @click="manualDetection" :disabled="isDetecting">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div :class="['status-info', picgoExists ? 'success' : 'warning']">
            <div class="status-text">
              {{ picgoDetectionStatus || t('preferences.image.uploader.picgoNotInstalled') }}
            </div>
            <div v-if="lastDetectionTime" class="detection-time">
              {{ t('preferences.image.uploader.lastDetectionTime') }}: {{ formatDetectionTime(lastDetectionTime) }}
            </div>
            <div v-if="lastSuccessTime" class="success-time">
              {{ t('preferences.image.uploader.lastSuccessTime') }}: {{ getLastSuccessTime() }}
            </div>
          </div>
          <div v-if="!picgoExists" class="install-commands">
            <div class="install-title">{{ t('preferences.image.uploader.chooseInstallMethod') }}</div>
            <div class="install-options">
              <div class="install-option">
                <strong>npm:</strong>
                <code class="install-command">{{ t('preferences.image.uploader.npmInstallCommand') }}</code>
              </div>
              <div class="install-option">
                <strong>yarn:</strong>
                <code class="install-command">{{ t('preferences.image.uploader.yarnInstallCommand') }}</code>
              </div>
              <div class="install-option">
                <strong>pnpm:</strong>
                <code class="install-command">{{ t('preferences.image.uploader.pnpmInstallCommand') }}</code>
              </div>
            </div>
            <div class="install-link">
              <span class="link" @click="open('https://github.com/PicGo/PicGo-Core')">picgo</span>
              {{ t('preferences.image.uploader.pleaseInstall') }}
            </div>
          </div>
          
          <!-- PicGo 基本使用说明 -->
          <div class="usage-guide">
            <div class="usage-title">{{ t('preferences.image.uploader.usageGuide.title') }}</div>
            <div class="usage-content">
              <div class="usage-step">
                <strong>1. {{ t('preferences.image.uploader.usageGuide.step1') }}</strong>
                <div class="usage-description">{{ t('preferences.image.uploader.usageGuide.step1Description') }}</div>
                <code class="usage-command">picgo set uploader</code>
              </div>
              <div class="usage-step">
                <strong>2. {{ t('preferences.image.uploader.usageGuide.step2') }}</strong>
                <div class="usage-description">{{ t('preferences.image.uploader.usageGuide.step2Description') }}</div>
                <code class="usage-command">picgo upload /path/to/image.png</code>
              </div>
              <div class="usage-step">
                <strong>3. {{ t('preferences.image.uploader.usageGuide.step3') }}</strong>
                <div class="usage-description">{{ t('preferences.image.uploader.usageGuide.step3Description') }}</div>
                <code class="usage-command">picgo config</code>
              </div>
            </div>
            <div class="usage-link">
              <span class="link" @click="open('https://picgo.github.io/PicGo-Core-Doc/')">{{ t('preferences.image.uploader.usageGuide.documentation') }}</span>
            </div>
          </div>
          
          <details v-if="picgoDetectionFailed && picgoDebugInfo" class="debug-info">
            <summary>{{ t('preferences.image.uploader.debugInfo') }}</summary>
            <pre>{{ picgoDebugInfo || '暂无调试信息' }}</pre>
          </details>
        </div>
      </div>
      <div v-if="currentUploader === 'github'" class="github">
        <div class="warning">{{ t('preferences.image.uploader.githubDeprecated') }}</div>
        <div class="form-group">
          <div class="label">
            {{ t('preferences.image.uploader.githubToken') }}:
            <el-tooltip
              class="item"
              effect="dark"
              :content="t('preferences.image.uploader.tokenTooltip')"
              placement="top-start"
            >
              <InfoFilled width="16" height="16" />
            </el-tooltip>
          </div>
          <el-input v-model="githubToken" :placeholder="t('preferences.image.uploader.inputToken')" size="mini"></el-input>
        </div>
        <div class="form-group">
          <div class="label">{{ t('preferences.image.uploader.ownerName') }}:</div>
          <el-input v-model="github.owner" :placeholder="t('preferences.image.uploader.owner')" size="mini"></el-input>
        </div>
        <div class="form-group">
          <div class="label">{{ t('preferences.image.uploader.repoName') }}:</div>
          <el-input v-model="github.repo" :placeholder="t('preferences.image.uploader.repo')" size="mini"></el-input>
        </div>
        <div class="form-group">
          <div class="label">{{ t('preferences.image.uploader.branchName') }}:</div>
          <el-input v-model="github.branch" :placeholder="t('preferences.image.uploader.branch')" size="mini"></el-input>
        </div>
        <legal-notices-checkbox
          class="github"
          :class="[{ error: legalNoticesErrorStates.github }]"
          :uploader-service="uploadServices.github"
        ></legal-notices-checkbox>
        <div class="form-group">
          <el-button size="mini" :disabled="githubDisable" @click="save('github')">{{ t('preferences.image.uploader.save') }}</el-button>
        </div>
      </div>
      <div v-else-if="currentUploader === 'cliScript'" class="script">
        <div class="description">
          {{ t('preferences.image.uploader.scriptDescription') }}
        </div>
        <div class="form-group">
          <div class="label">{{ t('preferences.image.uploader.scriptLocation') }}:</div>
          <el-input v-model="cliScript" :placeholder="t('preferences.image.uploader.scriptPath')" size="mini"></el-input>
        </div>
        <div class="form-group">
          <el-button size="mini" :disabled="cliScriptDisable" @click="save('cliScript')"
            >{{ t('preferences.image.uploader.save') }}
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/store/preferences'
import getServices, { isValidService } from './services.js'
import legalNoticesCheckbox from './legalNoticesCheckbox.vue'
import { isFileExecutableSync } from '@/util/fileSystem'
import CurSelect from '@/prefComponents/common/select'
import notice from '@/services/notification'
import { storeToRefs } from 'pinia'
import { InfoFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

// store
const preferenceStore = usePreferencesStore()

// data
const uploaderOptions = Object.keys(getServices()).map((name) => {
    const { name: label } = getServices()[name]
  return {
    label,
    value: name
  }
})
const githubToken = ref('')
const github = reactive({
  owner: '',
  repo: '',
  branch: ''
})
const cliScript = ref('')
const picgoExists = ref(false)
const picgoDetectionFailed = ref(false) // 检测是否失败
const picgoDetectionStatus = ref('') // 检测状态文本
const picgoDebugInfo = ref('') // 调试信息
const isDetecting = ref(false) // 是否正在检测
const lastDetectionTime = ref(null) // 最后检测时间
const lastSuccessTime = ref(null) // 最后成功检测时间
const detectionTimer = ref(null) // 检测间隔常量已移至 scheduleNextDetection 函数内部
const consecutiveFailures = ref(0) // 连续失败次数
const isPageVisible = ref(true) // 页面是否可见
// 动画和按钮控制状态
const showLoadingAnimation = ref(false) // 是否显示加载动画
const showRefreshButton = ref(false) // 是否显示刷新按钮
const showInitialButton = ref(false) // 是否显示初始按钮（0.5秒后变为动画）
const showStatusIndicator = ref(false) // 是否显示状态指示器
const animationActive = ref(false) // 动画是否激活
const animationTimer = ref(null) // 动画定时器
const buttonTimer = ref(null) // 按钮显示定时器
const initialButtonTimer = ref(null) // 初始按钮定时器
const showStandaloneRefreshButton = ref(true) // 是否显示独立刷新按钮
const uploadServices = getServices()
const legalNoticesErrorStates = reactive({
  github: false
})

// computed
const { currentUploader, imageBed, prefGithubToken, prefCliScript } = storeToRefs(preferenceStore)

const githubDisable = computed(() => !githubToken.value || !github.owner || !github.repo)
const cliScriptDisable = computed(() => {
  if (!cliScript.value) {
    return true
  }
  return !isFileExecutableSync(cliScript.value)
})

// watch
watch(imageBed, (value, oldValue) => {
  if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
    Object.assign(github, value.github)
  }
})

// 监听上传器切换，当切换到picgo时立即启动检测
watch(currentUploader, (newValue, oldValue) => {
  console.log('=== watch currentUploader 触发 ===', oldValue, '->', newValue)
  
  if (newValue === 'picgo') {
    // 切换到picgo时，立即启动检测流程
    console.log('切换到picgo，启动检测流程')
    startRealtimeDetection()
  } else if (oldValue === 'picgo') {
    // 从picgo切换到其他上传器时，停止检测
    console.log('从picgo切换到其他上传器，停止检测')
    stopRealtimeDetection()
    // 重置UI状态
    showInitialButton.value = false
    showLoadingAnimation.value = false
    showRefreshButton.value = false
    showStatusIndicator.value = false
    animationActive.value = false
  }
})

// 获取动态检测间隔
// getDetectionInterval 函数已移除，逻辑合并到 scheduleNextDetection 中

// 启动实时检测
const startRealtimeDetection = () => {
  console.log('=== startRealtimeDetection 被调用 ===', '当前上传器:', currentUploader.value)
  
  // 确保只有picgo上传器才启动检测
  if (currentUploader.value !== 'picgo') {
    console.log('当前不是picgo上传器，跳过检测')
    return
  }
  
  // 清除现有定时器
  if (detectionTimer.value) {
    clearTimeout(detectionTimer.value) // 使用clearTimeout
    detectionTimer.value = null
  }
  
  console.log('开始启动PicGo检测流程...')
  
  // 检查是否有之前的检测结果，如果有则先显示状态指示器
  if (picgoDetectionStatus.value && (picgoExists.value || picgoDetectionFailed.value)) {
    console.log('发现之前的检测结果，立即显示状态指示器')
    showStatusIndicator.value = true
    showInitialButton.value = false
    showLoadingAnimation.value = false
    showRefreshButton.value = false
    animationActive.value = false
    
    // 1秒后启动新的检测流程
    detectionTimer.value = setTimeout(() => {
      console.log('开始新的检测流程...')
      startLoadingAnimation()
      
      // 3秒后执行检测
      detectionTimer.value = setTimeout(() => {
        console.log('执行PicGo检测...')
        testPicgo().then(() => {
          scheduleNextDetection() // 第一次检测完成后开始正常调度
        }).catch((error) => {
          console.error('初始PicGo检测失败:', error)
          scheduleNextDetection()
        })
      }, 3000)
    }, 1000)
  } else {
    // 没有之前的检测结果，立即启动加载动画和计时器
    startLoadingAnimation()
    
    // 3秒后执行第一次检测
    detectionTimer.value = setTimeout(() => {
      console.log('执行PicGo检测...')
      testPicgo().then(() => {
        scheduleNextDetection() // 第一次检测完成后开始正常调度
      }).catch((error) => {
        console.error('初始PicGo检测失败:', error)
        scheduleNextDetection()
      })
    }, 3000)
  }
  
  // 设置动态间隔检测
  const scheduleNextDetection = () => {
    if (detectionTimer.value) {
      clearTimeout(detectionTimer.value)
    }
    
    // 根据连续失败次数和页面可见性调整检测间隔
    const baseInterval = 30000 // 30秒基础间隔
    const maxInterval = 300000 // 最大5分钟间隔
    let interval = Math.min(baseInterval * Math.pow(2, consecutiveFailures.value), maxInterval)
    
    // 如果页面不可见，使用更长的检测间隔
    if (!isPageVisible.value) {
      interval = Math.max(interval * 2, 60000) // 页面不可见时至少1分钟检测一次
    }
    
    console.log(`下次检测将在 ${interval / 1000} 秒后进行，连续失败次数: ${consecutiveFailures.value}`)
    
    detectionTimer.value = setTimeout(() => {
      if (!isDetecting.value && isPageVisible.value) {
        testPicgo().then(() => {
          scheduleNextDetection() // 递归调度下次检测
        }).catch((error) => {
          console.error('PicGo检测异常:', error)
          scheduleNextDetection()
        })
      } else {
        scheduleNextDetection() // 如果正在检测或页面不可见，直接调度下次
      }
    }, interval)
  }
}

// 停止实时检测
const stopRealtimeDetection = () => {
  console.log('停止实时检测')
  if (detectionTimer.value) {
    clearTimeout(detectionTimer.value) // 使用clearTimeout而不是clearInterval，因为我们使用的是setTimeout
    detectionTimer.value = null
  }
}

// lifecycle
// 页面可见性变化处理
const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden
  
  if (isPageVisible.value) {
    // 页面变为可见时，只有当前选择picgo才重新启动检测
    if (currentUploader.value === 'picgo') {
      console.log('页面变为可见且当前选择picgo，重新启动检测')
      startRealtimeDetection()
    }
  } else {
    // 页面隐藏时，停止检测以节省资源
    stopRealtimeDetection()
  }
}

// 组件激活处理（用于处理应用内页面切换）
const handleComponentActivated = () => {
  console.log('=== handleComponentActivated 触发 ===', 'currentUploader:', currentUploader.value)
  isPageVisible.value = true
  
  // 只有当前选择的是picgo时才启动检测
  if (currentUploader.value === 'picgo') {
    console.log('当前选择picgo，重新启动检测')
    // 确保清理之前的状态，避免重复的检测流程
    stopRealtimeDetection()
    stopAnimationAndButton()
    // 强制启动新的检测流程，确保UI状态正确显示
    setTimeout(() => {
      if (currentUploader.value === 'picgo' && isPageVisible.value) {
        console.log('强制启动检测流程')
        startRealtimeDetection()
      }
    }, 50) // 很短的延迟确保状态清理完成
  }
}

// 组件失活处理
const handleComponentDeactivated = () => {
  console.log('组件被失活，停止检测')
  isPageVisible.value = false
  stopRealtimeDetection()
}

onMounted(() => {
  console.log('=== onMounted 触发 ===', 'currentUploader:', currentUploader.value)
  nextTick(() => {
    if (imageBed.value.github) {
      Object.assign(github, imageBed.value.github)
    }
    githubToken.value = prefGithubToken.value
    cliScript.value = prefCliScript.value
    
    // 核心检测启动逻辑 - 确保在onMounted时就能启动
    if (currentUploader.value === 'picgo') {
      console.log('onMounted: 检测到picgo，强制启动检测流程')
      // 确保UI状态干净
      stopRealtimeDetection()
      stopAnimationAndButton()
      // 立即启动检测
      setTimeout(() => {
        if (currentUploader.value === 'picgo') {
          console.log('onMounted: 执行检测启动')
          startRealtimeDetection()
        }
      }, 200) // 稍长一点的延迟确保状态完全初始化
    }

    if (Object.prototype.hasOwnProperty.call(getServices(), currentUploader.value)) {
      getServices()[currentUploader.value].agreedToLegalNotices = true
    }
    
    // 额外的保障机制：再次检查是否需要启动检测
    nextTick(() => {
      setTimeout(() => {
        if (currentUploader.value === 'picgo' && !showLoadingAnimation.value && !showStatusIndicator.value && !showRefreshButton.value) {
          console.log('onMounted: 保障机制 - 检测到picgo但没有显示任何状态，强制启动')
          startRealtimeDetection()
        }
      }, 500)
    })
  })
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 组件激活时（用于处理应用内页面切换）
onActivated(() => {
  console.log('=== onActivated 触发 ===')
  handleComponentActivated()
  
  // 额外的保障机制：确保检测状态正确显示
  setTimeout(() => {
    if (currentUploader.value === 'picgo' && !showLoadingAnimation.value && !showStatusIndicator.value && !showRefreshButton.value && !showInitialButton.value) {
      console.log('onActivated: 保障机制 - 检测到picgo但没有显示任何状态，强制启动')
      startRealtimeDetection()
    }
  }, 300)
})

// 组件失活时
onDeactivated(() => {
  handleComponentDeactivated()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopRealtimeDetection()
  
  // 停止动画并清理定时器
  stopAnimationAndButton()
  
  // 移除页面可见性监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// methods
const isValidUploaderService = (name) => {
  return isValidService(name)
}

const getServiceNameById = (id) => {
  const service = getServices()[id]
  return service ? service.name : id
}

const open = (link) => {
  window.electron.shell.openExternal(link)
}

const save = (type) => {
  if (!validate(type)) {
    return
  }

  const newImageBedConfig = { ...imageBed.value }
  if (type === 'github') {
    newImageBedConfig.github = { ...github }
  } else if (type === 'cliScript') {
    newImageBedConfig.cliScript = cliScript.value
  }

  preferenceStore.SET_USER_DATA({
    type: 'imageBed',
    value: newImageBedConfig
  })
  if (type === 'github') {
    preferenceStore.SET_USER_DATA({
      type: 'githubToken',
      value: githubToken.value
    })
  }
  if (type === 'cliScript') {
    preferenceStore.SET_USER_DATA({
      type: 'cliScript',
      value: cliScript.value
    })
  }
  notice.notify({
    title: t('preferences.image.uploader.saveConfig'),
    message:
      type === 'github'
        ? t('preferences.image.uploader.githubConfigSaved')
        : t('preferences.image.uploader.scriptConfigSaved'),
    type: 'primary'
  })
}

const setCurrentUploader = (value) => {
  const type = 'currentUploader'
  preferenceStore.SET_USER_DATA({ type, value })
}

// 手动触发检测（保留用于调试）
const manualDetection = async () => {
  if (isDetecting.value) return
  
  // 隐藏独立刷新按钮0.5秒
  showStandaloneRefreshButton.value = false
  
  // 0.5秒后重新显示按钮并开始检测
  setTimeout(() => {
    showStandaloneRefreshButton.value = true
    
    isDetecting.value = true
    // 启动加载动画
    startLoadingAnimation()
    
    testPicgo().finally(() => {
      isDetecting.value = false
    })
  }, 500)
}

const formatDetectionTime = (time) => {
  if (!time) return t('preferences.image.uploader.neverDetected')
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLastSuccessTime = () => {
  return lastSuccessTime.value ? formatDetectionTime(lastSuccessTime.value) : t('preferences.image.uploader.neverSuccessful')
}

// 获取状态指示器的CSS类
const getStatusIndicatorClass = () => {
  if (picgoDetectionFailed.value) {
    return 'status-error'
  } else if (picgoExists.value) {
    return 'status-success'
  } else {
    return 'status-not-found'
  }
}

// 启动加载动画
const startLoadingAnimation = () => {
  console.log('=== startLoadingAnimation 被调用 ===')
  
  // 清除之前的定时器
  if (animationTimer.value) {
    clearInterval(animationTimer.value)
  }
  if (buttonTimer.value) {
    clearTimeout(buttonTimer.value)
  }
  if (initialButtonTimer.value) {
    clearTimeout(initialButtonTimer.value)
  }
  
  // 重置所有状态，然后立即显示加载动画而不是初始按钮
  showStatusIndicator.value = false
  showInitialButton.value = false
  showRefreshButton.value = false
  animationActive.value = false
  showLoadingAnimation.value = true
  
  console.log('startLoadingAnimation: 初始状态设置完成:', {
    showInitialButton: showInitialButton.value,
    showLoadingAnimation: showLoadingAnimation.value,
    showRefreshButton: showRefreshButton.value,
    showStatusIndicator: showStatusIndicator.value,
    animationActive: animationActive.value
  })
  
  // 立即启动动画定时器，无需延迟
  animationTimer.value = setInterval(() => {
    animationActive.value = !animationActive.value
    console.log('startLoadingAnimation: 动画闪烁:', animationActive.value)
  }, 1000)
  
  // 6秒后显示刷新按钮（3秒检测时间 + 3秒额外等待）
  buttonTimer.value = setTimeout(() => {
    console.log('startLoadingAnimation: 显示刷新按钮')
    showLoadingAnimation.value = false
    showRefreshButton.value = true
    if (animationTimer.value) {
      clearInterval(animationTimer.value)
      animationTimer.value = null
    }
  }, 6000)
}

// 停止动画并隐藏按钮
const stopAnimationAndButton = () => {
  console.log('停止动画和按钮')
  showInitialButton.value = false
  showLoadingAnimation.value = false
  showRefreshButton.value = false
  showStatusIndicator.value = true
  animationActive.value = false
  
  console.log('停止后状态:', {
    showInitialButton: showInitialButton.value,
    showLoadingAnimation: showLoadingAnimation.value,
    showRefreshButton: showRefreshButton.value,
    showStatusIndicator: showStatusIndicator.value,
    animationActive: animationActive.value
  })
  
  // 清除所有定时器
  if (animationTimer.value) {
    clearInterval(animationTimer.value)
    animationTimer.value = null
  }
  if (buttonTimer.value) {
    clearTimeout(buttonTimer.value)
    buttonTimer.value = null
  }
  if (initialButtonTimer.value) {
    clearTimeout(initialButtonTimer.value)
    initialButtonTimer.value = null
  }
}

const testPicgo = () => {
  return new Promise((resolve) => {
    console.log('=== PicGo 检测开始 ===')
    
    console.log('window.commandExists:', window.commandExists)
    
    // 记录检测开始时间
    lastDetectionTime.value = new Date().toISOString()
    
    let debugMessages = []
    debugMessages.push(`检测时间: ${new Date().toLocaleString()}`)
    
    // 添加环境信息
    debugMessages.push(`平台: ${window.electron?.process?.platform || 'unknown'}`)
    debugMessages.push(`进程类型: renderer`)
    
    if (typeof window.commandExists === 'undefined') {
      const errorMsg = 'commandExists 未暴露到 window 对象'
      console.error('✗', errorMsg)
      debugMessages.push(`✗ ${errorMsg}`)
      debugMessages.push('检查 preload 脚本是否正确加载')
      picgoExists.value = false
      picgoDetectionFailed.value = true
      picgoDetectionStatus.value = t('preferences.image.uploader.picgoDetectionFailed')
      picgoDebugInfo.value = debugMessages.join('\n')
      resolve()
      return
    }
    
    debugMessages.push('✓ commandExists 已暴露到 window 对象')
    
    if (typeof window.commandExists.exists !== 'function') {
      const errorMsg = 'commandExists.exists 方法不可用'
      const availableKeys = Object.keys(window.commandExists).join(', ')
      console.error('✗', errorMsg)
      console.log('commandExists 对象内容:', availableKeys)
      debugMessages.push(`✗ ${errorMsg}`)
      debugMessages.push(`可用方法: ${availableKeys}`)
      picgoExists.value = false
      picgoDetectionFailed.value = true
      picgoDetectionStatus.value = t('preferences.image.uploader.picgoDetectionFailed')
      picgoDebugInfo.value = debugMessages.join('\n')
      resolve()
      return
    }
    
    debugMessages.push('✓ commandExists.exists 方法可用')
    
    try {
      console.log('正在检测 PicGo...')
      debugMessages.push('正在检测 PicGo 命令...')
      
      // 先测试一些基本命令
      const nodeExists = window.commandExists.exists('node')
      const npmExists = window.commandExists.exists('npm')
      debugMessages.push(`Node.js 检测: ${nodeExists ? '✓' : '✗'}`)
      debugMessages.push(`npm 检测: ${npmExists ? '✓' : '✗'}`)
      
      const result = window.commandExists.exists('picgo')
      console.log('PicGo 检测结果:', result)
      debugMessages.push(`PicGo 检测结果: ${result}`)
      
      picgoExists.value = result
      
      if (result) {
        debugMessages.push('✓ PicGo 命令检测成功')
        picgoDetectionFailed.value = false
        picgoDetectionStatus.value = t('preferences.image.uploader.picgoInstalled')
        // 记录成功检测时间
        lastSuccessTime.value = new Date().toISOString()
        consecutiveFailures.value = 0 // 重置失败计数
      } else {
        debugMessages.push('✗ PicGo 命令未找到')
        debugMessages.push('可能原因:')
        debugMessages.push('1. PicGo 未安装')
        debugMessages.push('2. PATH 环境变量问题')
        debugMessages.push('3. Electron 环境限制')
        picgoDetectionFailed.value = false  // 检测成功，只是PicGo未安装
        picgoDetectionStatus.value = t('preferences.image.uploader.picgoNotInstalled')
      }
    } catch (error) {
      console.error('PicGo 检测失败:', error)
      debugMessages.push(`✗ 检测异常: ${error.message}`)
      debugMessages.push(`错误堆栈: ${error.stack}`)
      picgoExists.value = false
      picgoDetectionFailed.value = true
      picgoDetectionStatus.value = t('preferences.image.uploader.picgoDetectionFailed')
      consecutiveFailures.value++ // 增加失败计数
    }
    
    picgoDebugInfo.value = debugMessages.join('\n')
    console.log('=== PicGo 检测结束 ===')
    console.log('调试信息:', debugMessages.join('\n'))
    
    // 检测完成后停止动画
    stopAnimationAndButton()
    
    resolve()
  })
}

const validate = (value) => {
  const service = getServices()[value]
  if (!service) return true
  const { agreedToLegalNotices } = service
  if (agreedToLegalNotices === false) {
    legalNoticesErrorStates[value] = true
    return false
  }
  if (legalNoticesErrorStates[value] !== undefined) {
    legalNoticesErrorStates[value] = false
  }

  return true
}
</script>

<style scoped>
.pref-image-uploader {
  color: var(--editorColor);
  font-size: 14px;
}

.pref-image-uploader .current-uploader {
  margin: 20px 0;
}

.pref-image-uploader .warning {
  color: var(--deleteColor);
}

.pref-image-uploader .link {
  color: var(--themeColor);
  cursor: pointer;
}

.pref-image-uploader .detection-status {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid var(--editorColor30);
  border-radius: 6px;
  background: var(--floatBgColor);
}

.pref-image-uploader .detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pref-image-uploader .detection-status h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--editorColor);
}

.pref-image-uploader .retest-button {
  font-size: 12px;
  padding: 4px 8px;
}

.pref-image-uploader .status-info {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-weight: 500;
}

.pref-image-uploader .status-info.success {
  background: var(--successBgColor, #f0f9ff);
  color: var(--successColor, #059669);
  border: 1px solid var(--successColor, #059669);
}

.pref-image-uploader .status-info.warning {
  background: var(--warningBgColor, #fffbeb);
  color: var(--warningColor, #d97706);
  border: 1px solid var(--warningColor, #d97706);
}

.pref-image-uploader .status-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.pref-image-uploader .detection-time {
  font-size: 12px;
  opacity: 0.7;
  font-weight: normal;
}

.pref-image-uploader .detection-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pref-image-uploader .standalone-refresh-button {
  background: none;
  border: 1px solid var(--editorColor30, #ddd);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--editorColor70, #666);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  min-width: 28px;
  height: 28px;
}

.pref-image-uploader .standalone-refresh-button:hover {
  background-color: var(--editorColor10, #f0f0f0);
  color: var(--themeColor, #007acc);
  border-color: var(--themeColor, #007acc);
}

.pref-image-uploader .standalone-refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pref-image-uploader .standalone-refresh-button:disabled:hover {
  background: none;
  color: var(--editorColor70, #666);
  border-color: var(--editorColor30, #ddd);
}

.pref-image-uploader .detection-status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pref-image-uploader .detection-animation-container {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.pref-image-uploader .loading-dot {
  width: 8px;
  height: 8px;
  background-color: var(--themeColor, #007acc);
  border-radius: 50%;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.pref-image-uploader .loading-dot.animate {
  opacity: 1;
}

.pref-image-uploader .refresh-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  color: var(--editorColor70, #666);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pref-image-uploader .refresh-button:hover {
  background-color: var(--editorColor10, #f0f0f0);
  color: var(--themeColor, #007acc);
}

.pref-image-uploader .refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pref-image-uploader .refresh-button:disabled:hover {
  background: none;
  color: var(--editorColor70, #666);
}

.pref-image-uploader .initial-button {
  background: none;
  border: none;
  cursor: default;
  padding: 4px;
  border-radius: 3px;
  color: var(--editorColor70, #666);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.pref-image-uploader .initial-button:hover {
  background-color: var(--editorColor10, #f0f0f0);
  color: var(--themeColor, #007acc);
}

.pref-image-uploader .status-indicator {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pref-image-uploader .status-indicator.status-success {
  color: var(--successColor, #059669);
}

.pref-image-uploader .status-indicator.status-error {
  color: var(--deleteColor, #dc3545);
}

.pref-image-uploader .status-indicator.status-not-found {
  color: var(--editorColor70, #666);
}

.pref-image-uploader .status-indicator:hover {
  background-color: var(--editorColor10, #f0f0f0);
}

.pref-image-uploader .success-time {
  font-size: 12px;
  opacity: 0.7;
  font-weight: normal;
  color: var(--successColor, #059669);
}

.pref-image-uploader .detection-status-indicator {
  font-size: 12px;
  font-weight: 500;
}

.pref-image-uploader .detecting-indicator {
  color: var(--themeColor);
  animation: pulse 1.5s ease-in-out infinite;
}

.pref-image-uploader .auto-detection-info {
  color: var(--editorColor70);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pref-image-uploader .install-commands {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.pref-image-uploader .install-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 13px;
}

.pref-image-uploader .install-options {
  margin-bottom: 12px;
}

.pref-image-uploader .install-option {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pref-image-uploader .install-option strong {
  min-width: 50px;
  font-size: 12px;
  color: #666;
}

.pref-image-uploader .install-command {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  color: #495057;
  border: 1px solid #dee2e6;
  user-select: all;
}

.pref-image-uploader .install-link {
  margin: 10px 0;
  font-size: 13px;
}

.pref-image-uploader .usage-guide {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #17a2b8;
}

.pref-image-uploader .usage-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
}

.pref-image-uploader .usage-content {
  margin-bottom: 12px;
}

.pref-image-uploader .usage-step {
  margin-bottom: 12px;
  padding: 8px 0;
}

.pref-image-uploader .usage-step strong {
  color: #495057;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}

.pref-image-uploader .usage-description {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 6px;
  line-height: 1.4;
}

.pref-image-uploader .usage-command {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  color: #495057;
  border: 1px solid #dee2e6;
  user-select: all;
  display: inline-block;
}

.pref-image-uploader .usage-link {
  margin-top: 8px;
  font-size: 13px;
}

.pref-image-uploader .debug-info {
  margin-top: 15px;
}

.pref-image-uploader .debug-info summary {
  cursor: pointer;
  font-size: 13px;
  color: var(--editorColor70);
  margin-bottom: 8px;
}

.pref-image-uploader .debug-info pre {
  background: var(--codeBgColor, #f8f9fa);
  border: 1px solid var(--editorColor20);
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--editorColor);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.pref-image-uploader .description {
  margin-top: 20px;
  margin-bottom: 20px;
}

.pref-image-uploader .form-group {
  margin: 20px 0 0 0;
}

.pref-image-uploader .label {
  margin-bottom: 10px;
}

.pref-image-uploader .el-input__inner {
  background: transparent;
}

.pref-image-uploader .el-button.btn-reset,
.pref-image-uploader .button-group {
  margin-top: 30px;
}

.pref-image-uploader .pref-cb-legal-notices.github {
  margin-top: 30px;
}

.pref-image-uploader .pref-cb-legal-notices.error {
  border: 1px solid var(--deleteColor);
}
</style>
