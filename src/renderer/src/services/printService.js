import { getImageInfo } from 'muya/lib/utils'

class MarkdownPrint {
  /**
   * Prepare document export and append a hidden print container to the window.
   * Everything outside of this hidden print container will be hidden with display: none.
   *
   * @param {string} html HTML string
   * @param {boolean} [renderStatic] Render for static files like PDF documents
   */
  renderMarkdown(html) {
    this.clearup()
    const printContainer = document.createElement('article')
    printContainer.classList.add('print-container')
    this.container = printContainer
    printContainer.innerHTML = html

    document.body.appendChild(printContainer)
  }

  /**
   * Remove the print container from the window.
   */
  clearup() {
    if (this.container) {
      this.container.remove()
    }
  }
}

export default MarkdownPrint
