// Characters that should wrap selected text when pressed
const WRAP_PAIRS = {
  '"': '"',
  "'": "'",
  '`': '`',
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
  '*': '*',
  _: '_',
  '~': '~',
  $: '$'
}

const wrapSelectionCtrl = (ContentState) => {
  /**
   * Check if we should wrap the selected text with the given character.
   * Returns true if text is selected and character is a wrap pair opener.
   *
   * @param {string} char The character pressed
   * @returns {boolean} Whether wrap selection should be applied
   */
  ContentState.prototype.shouldWrapSelection = function (char) {
    if (!WRAP_PAIRS[char]) {
      return false
    }

    const { start, end } = this.cursor
    if (!start || !end) {
      return false
    }

    // Check if there's actually a selection (not just a cursor position)
    const hasSelection = start.key !== end.key || start.offset !== end.offset

    if (!hasSelection) {
      return false
    }

    // Don't wrap in code blocks for markdown syntax characters
    const startBlock = this.getBlock(start.key)
    if (startBlock && startBlock.functionType === 'codeContent') {
      // Allow quotes and brackets in code, but not markdown syntax
      if (['*', '_', '~', '$'].includes(char)) {
        return false
      }
    }

    return true
  }

  /**
   * Wrap the currently selected text with the given character pair.
   * For example, selecting "hello" and pressing '"' will result in '"hello"'.
   *
   * @param {string} openChar The opening character
   * @returns {boolean} True if wrap was applied, false otherwise
   */
  ContentState.prototype.wrapSelection = function (openChar) {
    const closeChar = WRAP_PAIRS[openChar]
    if (!closeChar) {
      return false
    }

    const { start, end } = this.cursor
    if (!start || !end) {
      return false
    }

    // Normalize start and end (start should be before end)
    let startKey = start.key
    let startOffset = start.offset
    let endKey = end.key
    let endOffset = end.offset

    // If selection spans multiple blocks, we only wrap within the same block
    // for simplicity and to avoid complex markdown structure issues
    if (startKey !== endKey) {
      // For multi-block selection, only wrap within each block or skip
      // For simplicity, let's handle single-block selection only
      return false
    }

    // Ensure start comes before end
    if (startOffset > endOffset) {
      ;[startOffset, endOffset] = [endOffset, startOffset]
    }

    const block = this.getBlock(startKey)
    if (!block) {
      return false
    }

    const { text } = block
    const selectedText = text.substring(startOffset, endOffset)

    // Build the new text with wrapped selection
    const newText =
      text.substring(0, startOffset) +
      openChar +
      selectedText +
      closeChar +
      text.substring(endOffset)

    block.text = newText

    // Update cursor to be after the closing character
    // This places cursor right after the wrapped selection
    const newOffset = endOffset + openChar.length + closeChar.length
    this.cursor = {
      start: { key: startKey, offset: newOffset },
      end: { key: startKey, offset: newOffset }
    }

    // Render the changes
    this.partialRender()

    // Dispatch events
    this.muya.dispatchSelectionChange()
    this.muya.dispatchChange()

    return true
  }

  /**
   * Handle keydown event for wrap selection.
   * This is called from the keyboard event handler.
   *
   * @param {KeyboardEvent} event The keyboard event
   * @returns {boolean} True if the event was handled, false otherwise
   */
  ContentState.prototype.handleWrapSelectionKeydown = function (event) {
    // Don't handle if modifier keys are pressed (except shift for some chars)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false
    }

    // Check if surround selection is enabled (master toggle)
    const { surroundSelection } = this.muya.options
    if (surroundSelection === false) {
      return false
    }

    const char = event.key

    // Check if we should wrap selection
    if (!this.shouldWrapSelection(char)) {
      return false
    }

    // Check user preferences for specific character types
    const { autoPairBracket, autoPairMarkdownSyntax, autoPairQuote } = this.muya.options

    // Determine if this character type is enabled
    const isBracket = ['(', '[', '{', '<'].includes(char)
    const isQuote = ['"', "'", '`'].includes(char)
    const isMarkdownSyntax = ['*', '_', '~', '$'].includes(char)

    if (isBracket && !autoPairBracket) {
      return false
    }
    if (isQuote && !autoPairQuote) {
      return false
    }
    if (isMarkdownSyntax && !autoPairMarkdownSyntax) {
      return false
    }

    // Prevent the default character insertion
    event.preventDefault()

    // Wrap the selection
    return this.wrapSelection(char)
  }
}

export default wrapSelectionCtrl
