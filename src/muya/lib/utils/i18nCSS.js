/** editor.type
 * CSS国际化工具
 * 用于动态设置CSS content属性中的文本内容
 */

class I18nCSS {
  constructor(t) {
    this.t = t || ((key) => key) // 翻译函数，如果没有提供则返回原始键值
    // 初始化CSS变量
    this.updateCSSVariables()
  }

  /**
   * 更新CSS变量的值
   */
  updateCSSVariables() {
    const root = document.documentElement

    // 辅助函数：获取翻译文本，如果翻译失败则使用默认值
    const getTranslation = (key, defaultValue) => {
      const translation = this.t(key)
      // 如果翻译函数返回的是键名本身，说明翻译失败，使用默认值
      return translation === key ? defaultValue : translation
    }

    // 更新所有CSS变量
    root.style.setProperty(
      '--i18n-highlight-start',
      `"${getTranslation('editor.highlight-start', ' [highlight start] ')}"`
    )
    root.style.setProperty(
      '--i18n-highlight-end',
      `"${getTranslation('editor.highlight-end', ' [highlight end] ')}"`
    )
    root.style.setProperty(
      '--i18n-type-at-to-insert',
      `"${getTranslation('editor.type-at-to-insert', 'Type @ to insert')}"`
    )
    root.style.setProperty(
      '--i18n-input-footnote-definition',
      `"${getTranslation('editor.input-footnote-definition', 'Input footnote definition')}"`
    )
    root.style.setProperty(
      '--i18n-input-yaml-front-matter',
      `"${getTranslation('editor.input-yaml-front-matter', 'Input YAML front matter')}"`
    )
    root.style.setProperty(
      '--i18n-input-language-identifier',
      `"${getTranslation('editor.input-language-identifier', 'Input language identifier')}"`
    )
    root.style.setProperty(
      '--i18n-input-mathematical-formula',
      `"${getTranslation('editor.input-mathematical-formula', 'Input mathematical formula')}"`
    )
    root.style.setProperty('--i18n-fence', `"${getTranslation('editor.fence', 'fence')}"`)
    root.style.setProperty('--i18n-indent', `"${getTranslation('editor.indent', 'indent')}"`)
    root.style.setProperty(
      '--i18n-front-matter-delimiter',
      `"${getTranslation('editor.front-matter-delimiter', 'front matter delimiter')}"`
    )
    root.style.setProperty(
      '--i18n-math-delimiter',
      `"${getTranslation('editor.math-delimiter', 'math delimiter')}"`
    )
    root.style.setProperty(
      '--i18n-mermaid-start',
      `"${getTranslation('editor.mermaid-start', 'mermaid start')}"`
    )
    root.style.setProperty(
      '--i18n-flowchart-start',
      `"${getTranslation('editor.flowchart-start', 'flowchart start')}"`
    )
    root.style.setProperty(
      '--i18n-sequence-start',
      `"${getTranslation('editor.sequence-start', 'sequence start')}"`
    )
    root.style.setProperty(
      '--i18n-plantuml-start',
      `"${getTranslation('editor.plantuml-start', 'plantuml start')}"`
    )
    root.style.setProperty(
      '--i18n-vega-lite-start',
      `"${getTranslation('editor.vega-lite-start', 'vega-lite start')}"`
    )
    root.style.setProperty(
      '--i18n-click-to-add-image',
      `"${getTranslation('editor.click-to-add-image', 'Click to add image')}"`
    )
    root.style.setProperty(
      '--i18n-load-image-failed',
      `"${getTranslation('editor.load-image-failed', 'Load image failed')}"`
    )

    // 添加编辑相关的CSS变量
    const translations = {
      undo: this.t('edit.undo'),
      redo: this.t('edit.redo'),
      cut: this.t('edit.cut'),
      copy: this.t('edit.copy'),
      paste: this.t('edit.paste'),
      selectAll: this.t('edit.selectAll')
    }

    root.style.setProperty('--ag-undo', translations.undo || 'Undo')
    root.style.setProperty('--ag-redo', translations.redo || 'Redo')
    root.style.setProperty('--ag-cut', translations.cut || 'Cut')
    root.style.setProperty('--ag-copy', translations.copy || 'Copy')
    root.style.setProperty('--ag-paste', translations.paste || 'Paste')
    root.style.setProperty('--ag-selectAll', translations.selectAll || 'Select All')
  }

  /**
   * 设置翻译函数
   */
  setTranslationFunction(t) {
    this.t = t || ((key) => key)
    this.updateCSSVariables()
  }
}

export default I18nCSS
