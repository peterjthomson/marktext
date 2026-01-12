import log from 'electron-log'
import fs from 'fs'
import path from 'path'

/**
 * i18n 错误处理和调试模块
 * 专门用于定位和调试国际化资源文件相关的错误
 */

// 支持的语言列表
const SUPPORTED_LANGUAGES = ['en', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'ja', 'ko', 'pt']

/**
 * 验证单个翻译文件的格式
 * @param {string} filePath - 文件路径
 * @param {string} language - 语言代码
 * @returns {object} 验证结果
 */
function validateTranslationFile(filePath, language) {
  const result = {
    language,
    filePath,
    exists: false,
    readable: false,
    validJson: false,
    parseError: null,
    content: null,
    keyCount: 0
  }

  try {
    // 检查文件是否存在
    result.exists = fs.existsSync(filePath)
    if (!result.exists) {
      log.warn(`[i18n] Translation file not found: ${filePath}`)
      return result
    }

    // 检查文件是否可读
    try {
      fs.accessSync(filePath, fs.constants.R_OK)
      result.readable = true
    } catch (error) {
      log.error(`[i18n] Translation file not readable: ${filePath}`, error)
      return result
    }

    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8')
    
    // 尝试解析 JSON
    try {
      const parsedContent = JSON.parse(content)
      result.validJson = true
      result.content = parsedContent
      result.keyCount = Object.keys(parsedContent).length
      
      log.info(`[i18n] Successfully validated ${language}: ${result.keyCount} keys`)
    } catch (parseError) {
      result.parseError = {
        message: parseError.message,
        line: parseError.lineNumber || 'unknown',
        column: parseError.columnNumber || 'unknown'
      }
      log.error(`[i18n] JSON parse error in ${language}:`, parseError)
    }

  } catch (error) {
    log.error(`[i18n] Unexpected error validating ${language}:`, error)
    result.parseError = {
      message: error.message,
      type: 'unexpected'
    }
  }

  return result
}

/**
 * 获取所有可能的翻译文件路径
 * @param {string} language - 语言代码
 * @returns {string[]} 可能的文件路径列表
 */
function getPossibleTranslationPaths(language) {
  return [
    // 构建后的路径（主进程）
    path.join(process.cwd(), 'out', 'main', 'locales', `${language}.json`),
    // 开发环境路径
    path.join(__dirname, 'locales', `${language}.json`),
    path.join(__dirname, '..', '..', 'shared', 'i18n', 'locales', `${language}.json`),
    path.join(process.cwd(), 'src', 'shared', 'i18n', 'locales', `${language}.json`)
  ]
}

/**
 * 验证所有翻译文件
 * @returns {object} 完整的验证报告
 */
function validateAllTranslationFiles() {
  const report = {
    timestamp: new Date().toISOString(),
    totalLanguages: SUPPORTED_LANGUAGES.length,
    validFiles: 0,
    invalidFiles: 0,
    missingFiles: 0,
    details: {},
    summary: []
  }

  log.info('[i18n] Starting comprehensive translation file validation...')

  for (const language of SUPPORTED_LANGUAGES) {
    const possiblePaths = getPossibleTranslationPaths(language)
    let validationResult = null
    
    // 尝试每个可能的路径
    for (const filePath of possiblePaths) {
      const result = validateTranslationFile(filePath, language)
      if (result.exists) {
        validationResult = result
        break
      }
    }
    
    // 如果没有找到任何文件
    if (!validationResult) {
      validationResult = {
        language,
        filePath: 'not found',
        exists: false,
        readable: false,
        validJson: false,
        parseError: { message: 'File not found in any expected location', type: 'missing' },
        content: null,
        keyCount: 0
      }
      report.missingFiles++
    } else if (validationResult.validJson) {
      report.validFiles++
    } else {
      report.invalidFiles++
    }
    
    report.details[language] = validationResult
    
    // 添加到摘要
    const status = validationResult.validJson ? '✅ VALID' : 
                  validationResult.exists ? '❌ INVALID' : '❓ MISSING'
    report.summary.push(`${language}: ${status} (${validationResult.keyCount} keys)`)
  }

  // 输出详细报告
  log.info('[i18n] Translation file validation completed:')
  log.info(`[i18n] Valid files: ${report.validFiles}/${report.totalLanguages}`)
  log.info(`[i18n] Invalid files: ${report.invalidFiles}`)
  log.info(`[i18n] Missing files: ${report.missingFiles}`)
  
  report.summary.forEach(line => log.info(`[i18n] ${line}`))
  
  // 如果有错误，输出详细错误信息
  if (report.invalidFiles > 0 || report.missingFiles > 0) {
    log.error('[i18n] Found issues with translation files:')
    Object.entries(report.details).forEach(([lang, details]) => {
      if (!details.validJson) {
        log.error(`[i18n] ${lang}: ${details.parseError?.message || 'Unknown error'}`)
        if (details.parseError?.line) {
          log.error(`[i18n] ${lang}: Error at line ${details.parseError.line}, column ${details.parseError.column}`)
        }
      }
    })
  }

  return report
}

/**
 * 测试特定键的翻译
 * @param {string} key - 翻译键
 * @param {string} language - 语言代码
 * @returns {object} 测试结果
 */
function testTranslationKey(key, language = 'en') {
  const result = {
    key,
    language,
    found: false,
    value: null,
    error: null
  }

  try {
    const possiblePaths = getPossibleTranslationPaths(language)
    let translationData = null
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        translationData = JSON.parse(content)
        break
      }
    }
    
    if (!translationData) {
      result.error = `Translation file not found for language: ${language}`
      return result
    }
    
    // 支持嵌套键（如 'menu.file.open'）
    const keys = key.split('.')
    let value = translationData
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        value = null
        break
      }
    }
    
    if (value !== null) {
      result.found = true
      result.value = value
    }
    
  } catch (error) {
    result.error = error.message
  }

  return result
}

/**
 * 设置 i18n 相关的全局错误监听
 */
function setupI18nErrorHandling() {
  log.info('[i18n] Setting up i18n error handling...')
  
  // 在应用启动时验证所有翻译文件
  const validationReport = validateAllTranslationFiles()
  
  // 如果有严重错误，记录并可能需要降级处理
  if (validationReport.invalidFiles > 0) {
    log.error('[i18n] Critical: Some translation files have parsing errors!')
    log.error('[i18n] This may cause application crashes when accessing translations.')
  }
  
  if (validationReport.missingFiles > 0) {
    log.warn('[i18n] Warning: Some translation files are missing!')
    log.warn('[i18n] Affected languages may fall back to English.')
  }
  
  // 监听进程中的 i18n 相关错误
  const originalConsoleError = console.error
  console.error = function(...args) {
    const message = args.join(' ')
    
    // 检测 i18n 相关错误
    if (message.includes('SyntaxError: 11') || 
        message.includes('parsePlural') ||
        message.includes('i18n') ||
        message.includes('translation')) {
      log.error('[i18n] Detected i18n-related error:', ...args)
      
      // 尝试提供更多调试信息
      if (message.includes('SyntaxError: 11')) {
        log.error('[i18n] This appears to be a Vue i18n plural syntax error.')
        log.error('[i18n] Check for "|" characters in translation strings that may be interpreted as plural syntax.')
        
        // 重新验证翻译文件
        log.info('[i18n] Re-validating translation files due to syntax error...')
        validateAllTranslationFiles()
      }
    }
    
    // 调用原始的 console.error
    originalConsoleError.apply(console, args)
  }
  
  log.info('[i18n] i18n error handling setup completed.')
  return validationReport
}

/**
 * 导出调试工具函数
 */
export {
  setupI18nErrorHandling,
  validateAllTranslationFiles,
  validateTranslationFile,
  testTranslationKey,
  getPossibleTranslationPaths
}

/**
 * 默认导出设置函数
 */
export default setupI18nErrorHandling