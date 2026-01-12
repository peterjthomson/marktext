/**
 * Controller for moving lines/paragraphs up and down in the document.
 * Triggered by Option+ArrowUp / Option+ArrowDown (Alt+ArrowUp / Alt+ArrowDown on Windows/Linux)
 */

const moveLineCtrl = (ContentState) => {
  /**
   * Get the movable block for the current cursor position.
   * This finds the appropriate block to move - either a list item, paragraph, heading, etc.
   *
   * @returns {Object|null} The block to move, or null if not movable
   */
  ContentState.prototype.getMovableBlock = function () {
    const { start } = this.cursor
    if (!start) return null

    const block = this.getBlock(start.key)
    if (!block) return null

    // Find the appropriate ancestor to move
    // For list items, we want to move the 'li' block
    // For paragraphs/headings, we want to move the 'p' or 'h1'-'h6' block
    // For code blocks, we want to move the 'pre' block
    // For blockquotes, we want to move the 'blockquote' block

    let movableBlock = block

    // Walk up to find the right block to move
    while (movableBlock) {
      const parent = this.getParent(movableBlock)

      // If we're in a list item, the li is what we want to move
      if (movableBlock.type === 'li') {
        return movableBlock
      }

      // If we're in a paragraph, heading, or other top-level content block
      if (
        ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'blockquote', 'pre', 'figure'].includes(
          movableBlock.type
        )
      ) {
        // But only if the parent is the root (blocks array) or another container
        if (
          !parent ||
          parent.type === 'ul' ||
          parent.type === 'ol' ||
          parent.type === 'blockquote'
        ) {
          // If parent is a list or blockquote, we need to go up one more level
          if (parent && (parent.type === 'ul' || parent.type === 'ol')) {
            // We're inside a list, find the li
            const li = this.closest(movableBlock, 'li')
            if (li) return li
          }
          return movableBlock
        }
        // Keep going up if we're inside another structure
      }

      // Move up to parent
      if (parent) {
        movableBlock = parent
      } else {
        // We've reached the top level
        break
      }
    }

    // If we got here, use the outmost block
    return this.findOutMostBlock(block)
  }

  /**
   * Swap two sibling blocks in the document.
   *
   * @param {Object} block1 First block
   * @param {Object} block2 Second block (should be adjacent sibling)
   */
  ContentState.prototype.swapBlocks = function (block1, block2) {
    if (!block1 || !block2) return false

    const parent = this.getParent(block1)
    const siblings = parent ? parent.children : this.blocks

    const index1 = this.findIndex(siblings, block1)
    const index2 = this.findIndex(siblings, block2)

    if (index1 === -1 || index2 === -1) return false

    // Swap in the array
    siblings[index1] = block2
    siblings[index2] = block1

    // Update sibling links
    const block1Prev = this.getBlock(block1.preSibling)
    const block1Next = this.getBlock(block1.nextSibling)
    const block2Prev = this.getBlock(block2.preSibling)
    const block2Next = this.getBlock(block2.nextSibling)

    // Swap the preSibling and nextSibling pointers
    if (block1.nextSibling === block2.key) {
      // block1 is before block2
      block1.preSibling = block2.key
      block1.nextSibling = block2.nextSibling
      block2.preSibling = block1Prev ? block1Prev.key : null
      block2.nextSibling = block1.key

      if (block1Prev) block1Prev.nextSibling = block2.key
      if (block2Next) block2Next.preSibling = block1.key
    } else if (block2.nextSibling === block1.key) {
      // block2 is before block1
      block2.preSibling = block1.key
      block2.nextSibling = block1.nextSibling
      block1.preSibling = block2Prev ? block2Prev.key : null
      block1.nextSibling = block2.key

      if (block2Prev) block2Prev.nextSibling = block1.key
      if (block1Next) block1Next.preSibling = block2.key
    }

    return true
  }

  /**
   * Move the current line/block up in the document.
   *
   * @returns {boolean} True if the move was successful
   */
  ContentState.prototype.moveLineUp = function () {
    const movableBlock = this.getMovableBlock()
    if (!movableBlock) return false

    const prevSibling = this.getBlock(movableBlock.preSibling)
    if (!prevSibling) return false // Already at the top

    // Don't move if previous sibling is not editable (e.g., front matter)
    if (prevSibling.editable === false) return false

    // Perform the swap
    if (!this.swapBlocks(prevSibling, movableBlock)) return false

    // Re-render
    this.partialRender()

    // Dispatch change event
    this.muya.dispatchChange()

    return true
  }

  /**
   * Move the current line/block down in the document.
   *
   * @returns {boolean} True if the move was successful
   */
  ContentState.prototype.moveLineDown = function () {
    const movableBlock = this.getMovableBlock()
    if (!movableBlock) return false

    const nextSibling = this.getBlock(movableBlock.nextSibling)
    if (!nextSibling) return false // Already at the bottom

    // Don't move if next sibling is not editable
    if (nextSibling.editable === false) return false

    // Perform the swap
    if (!this.swapBlocks(movableBlock, nextSibling)) return false

    // Re-render
    this.partialRender()

    // Dispatch change event
    this.muya.dispatchChange()

    return true
  }

  /**
   * Handle keydown event for moving lines.
   * This is called from the keyboard event handler.
   *
   * @param {KeyboardEvent} event The keyboard event
   * @returns {boolean} True if the event was handled
   */
  ContentState.prototype.handleMoveLineKeydown = function (event) {
    // Check for Alt/Option + Arrow Up/Down
    if (!event.altKey) return false
    if (event.ctrlKey || event.metaKey || event.shiftKey) return false

    const { key } = event

    if (key === 'ArrowUp') {
      event.preventDefault()
      return this.moveLineUp()
    }

    if (key === 'ArrowDown') {
      event.preventDefault()
      return this.moveLineDown()
    }

    return false
  }
}

export default moveLineCtrl
