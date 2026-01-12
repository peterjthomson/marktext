import { t } from '../i18n'

/**
 * 获取命令描述映射表
 * 该函数返回一个对象，包含所有命令ID到国际化翻译键的映射
 * 用于将命令ID转换为用户可读的描述文本
 * 注意：不再使用Object.freeze，以便支持动态语言切换
 */
const getCommandDescriptions = () => {
  return {
    // ============================================
    // # 应用程序级别命令 (Application Level Commands)
    // ============================================
    'mt.hide': t('commands.mt.hide'),
    'mt.hide-others': t('commands.mt.hideOthers'),

    // ============================================
    // # 文件操作命令 (File Operations)
    // ============================================
    // 文件创建和打开
    'file.new-window': t('commands.file.newWindow'),
    'file.new-tab': t('commands.file.newTab'),
    'file.open-file': t('commands.file.openFile'),
    'file.open-folder': t('commands.file.openFolder'),
    'file.quick-open': t('commands.file.quickOpen'),
    'file.import-file': t('commands.file.importFile'),

    // 文件保存和导出
    'file.save': t('commands.file.save'),
    'file.save-as': t('commands.file.saveAs'),
    'file.export-file': t('commands.file.exportFile'),
    'file.export-file.pdf': t('commands.file.exportFilePdf'),

    // 文件管理
    'file.move-file': t('commands.file.moveFile'),
    'file.rename-file': t('commands.file.renameFile'),
    'file.toggle-auto-save': t('commands.file.toggleAutoSave'),

    // 文件设置
    'file.change-encoding': t('commands.file.changeEncoding'),
    'file.line-ending': t('commands.file.changeLineEnding'),
    'file.trailing-newline': t('commands.file.trailingNewline'),
    'file.preferences': t('commands.file.preferences'),

    // 文件操作
    'file.print': t('commands.file.print'),
    'file.zoom': t('commands.file.zoom'),
    'file.check-update': t('commands.file.checkUpdate'),

    // 文件关闭
    'file.close': t('commands.file.closeTab'),
    'file.close-tab': t('commands.file.closeTab'),
    'file.close-window': t('commands.file.closeWindow'),
    'file.quit': t('commands.file.quit'),

    // ============================================
    // # 编辑操作命令 (Edit Operations)
    // ============================================
    // 撤销重做
    'edit.undo': t('commands.edit.undo'),
    'edit.redo': t('commands.edit.redo'),

    // 剪贴板操作
    'edit.cut': t('commands.edit.cut'),
    'edit.copy': t('commands.edit.copy'),
    'edit.paste': t('commands.edit.paste'),
    'edit.copy-as-markdown': t('commands.edit.copyAsMarkdown'),
    'edit.copy-as-html': t('commands.edit.copyAsHtml'),
    'edit.paste-as-plaintext': t('commands.edit.pasteAsPlaintext'),

    // 选择和复制
    'edit.select-all': t('commands.edit.selectAll'),
    'edit.duplicate': t('commands.edit.duplicate'),

    // 段落操作
    'edit.create-paragraph': t('commands.edit.createParagraph'),
    'edit.delete-paragraph': t('commands.edit.deleteParagraph'),

    // 查找替换
    'edit.find': t('commands.edit.find'),
    'edit.find-next': t('commands.edit.findNext'),
    'edit.find-previous': t('commands.edit.findPrevious'),
    'edit.replace': t('commands.edit.replace'),
    'edit.find-in-folder': t('commands.edit.findInFolder'),

    // 其他编辑功能
    'edit.screenshot': t('commands.edit.screenshot'),

    // ============================================
    // # 段落格式命令 (Paragraph Formatting)
    // ============================================
    // 标题级别
    'paragraph.heading-1': t('commands.paragraph.heading1'),
    'paragraph.heading-2': t('commands.paragraph.heading2'),
    'paragraph.heading-3': t('commands.paragraph.heading3'),
    'paragraph.heading-4': t('commands.paragraph.heading4'),
    'paragraph.heading-5': t('commands.paragraph.heading5'),
    'paragraph.heading-6': t('commands.paragraph.heading6'),
    'paragraph.upgrade-heading': t('commands.paragraph.upgradeHeading'),
    'paragraph.degrade-heading': t('commands.paragraph.degradeHeading'),

    // 块级元素
    'paragraph.table': t('commands.paragraph.table'),
    'paragraph.code-fence': t('commands.paragraph.codeFence'),
    'paragraph.quote-block': t('commands.paragraph.quoteBlock'),
    'paragraph.math-block': t('commands.paragraph.mathBlock'),
    'paragraph.html-block': t('commands.paragraph.htmlBlock'),

    // 列表类型
    'paragraph.order-list': t('commands.paragraph.orderList'),
    'paragraph.bullet-list': t('commands.paragraph.bulletList'),
    'paragraph.task-list': t('commands.paragraph.taskList'),
    'paragraph.loose-list-item': t('commands.paragraph.looseListItem'),

    // 段落类型
    'paragraph.paragraph': t('commands.paragraph.paragraph'),
    'paragraph.reset-paragraph': t('commands.paragraph.resetParagraph'),

    // 分隔符和特殊元素
    'paragraph.horizontal-rule': t('commands.paragraph.horizontalRule'),
    'paragraph.horizontal-line': t('commands.paragraph.horizontalLine'),
    'paragraph.math-formula': t('commands.paragraph.mathFormula'),
    'paragraph.front-matter': t('commands.paragraph.frontMatter'),

    // ============================================
    // # 文本格式命令 (Text Formatting)
    // ============================================
    // 基础格式
    'format.strong': t('commands.format.strong'),
    'format.emphasis': t('commands.format.emphasis'),
    'format.underline': t('commands.format.underline'),
    'format.strike': t('commands.format.strike'),

    // 高级格式
    'format.highlight': t('commands.format.highlight'),
    'format.superscript': t('commands.format.superscript'),
    'format.subscript': t('commands.format.subscript'),

    // 内联元素
    'format.inline-code': t('commands.format.inlineCode'),
    'format.inline-math': t('commands.format.inlineMath'),

    // 链接和媒体
    'format.hyperlink': t('commands.format.hyperlink'),
    'format.image': t('commands.format.image'),

    // 格式清除
    'format.clear-format': t('commands.format.clearFormat'),

    // ============================================
    // # 窗口管理命令 (Window Management)
    // ============================================
    // 窗口控制
    'window.minimize': t('commands.window.minimize'),
    'window.close': t('commands.window.close'),
    'window.toggle-always-on-top': t('commands.window.toggleAlwaysOnTop'),
    'window.toggle-full-screen': t('commands.window.toggleFullScreen'),

    // 窗口缩放 (修复：移除重复的commands前缀)
    'window.zoomIn': t('commands.window.zoomIn'),
    'window.zoomOut': t('commands.window.zoomOut'),

    // 主题设置
    'window.change-theme': t('commands.window.changeTheme'),

    // ============================================
    // # 视图控制命令 (View Controls)
    // ============================================
    // 界面切换
    'view.toggle-sidebar': t('commands.view.toggleSidebar'),
    'view.toggle-tabbar': t('commands.view.toggleTabbar'),
    'view.toggle-toc': t('commands.view.toggleToc'),

    // 编辑模式
    'view.toggle-source-code-mode': t('commands.view.toggleSourceCodeMode'),
    'view.source-code-mode': t('commands.view.sourceCodeMode'),
    'view.toggle-typewriter-mode': t('commands.view.toggleTypewriterMode'),
    'view.typewriter-mode': t('commands.view.typewriterMode'),
    'view.toggle-focus-mode': t('commands.view.toggleFocusMode'),
    'view.focus-mode': t('commands.view.focusMode'),

    // 视图功能
    'view.command-palette': t('commands.view.commandPalette'),
    'view.actual-size': t('commands.view.actualSize'),
    'view.text-direction': t('commands.view.textDirection'),

    // 开发者工具
    'view.dev-reload': t('commands.view.devReload'),
    'view.dev-toggle-developer-tools': t('commands.view.devToggleDeveloperTools'),
    'view.toggle-dev-tools': t('commands.view.toggleDevTools'),

    // 菜单项（非命令）
    'view.reload-images': t('commands.view.reloadImages'),

    // ============================================
    // # 标签页管理命令 (Tab Management)
    // ============================================
    // 标签页切换
    'tabs.cycleBackward': t('commands.tabs.cycleBackward'),
    'tabs.cycleForward': t('commands.tabs.cycleForward'),
    'tabs.switchToLeft': t('commands.tabs.switchToLeft'),
    'tabs.switchToRight': t('commands.tabs.switchToRight'),

    // 按序号切换标签页
    'tabs.switchToFirst': t('commands.tabs.switchToFirst'),
    'tabs.switchToSecond': t('commands.tabs.switchToSecond'),
    'tabs.switchToThird': t('commands.tabs.switchToThird'),
    'tabs.switchToFourth': t('commands.tabs.switchToFourth'),
    'tabs.switchToFifth': t('commands.tabs.switchToFifth'),
    'tabs.switchToSixth': t('commands.tabs.switchToSixth'),
    'tabs.switchToSeventh': t('commands.tabs.switchToSeventh'),
    'tabs.switchToEighth': t('commands.tabs.switchToEighth'),
    'tabs.switchToNinth': t('commands.tabs.switchToNinth'),
    'tabs.switchToTenth': t('commands.tabs.switchToTenth'),

    // ============================================
    // # 文档和帮助命令 (Documentation & Help)
    // ============================================
    'docs.user-guide': t('commands.docs.userGuide'),
    'docs.markdown-syntax': t('commands.docs.markdownSyntax'),

    // ============================================
    // # 拼写检查命令 (Spell Checker)
    // ============================================
    'spellchecker.switch-language': t('commands.spellchecker.switchLanguage')
  }
}

/**
 * 根据命令ID获取对应的国际化描述文本
 * @param {string} id - 命令ID，格式如 'file.save', 'edit.copy' 等
 * @returns {string} 返回国际化后的命令描述文本，如果找不到对应描述则返回原ID用于调试
 */
export default id => {
  // 每次调用都重新获取命令描述，以支持动态语言切换
  const commandDescriptions = getCommandDescriptions()
  const description = commandDescriptions[id]

  // 如果找不到对应的描述，返回原始ID用于调试
  return description || id
}
