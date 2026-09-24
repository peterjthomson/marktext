import { expect, test } from '@playwright/test'
import { enterSourceMode, launchWithMarkdown, waitForMenuReady } from './helpers'

type SourceEditor = Element & {
  CodeMirror: {
    clearHistory(): void
    replaceRange(text: string, pos: { line: number; ch: number }): void
    undo(): void
  }
}
type PromptCounter = typeof globalThis & { __savePrompts: number }

test('source edit followed by undo closes without a save prompt (#4)', async() => {
  const { app, page } = await launchWithMarkdown('Title\n=====\n\n\nUntouched paragraph.  \n')
  try {
    await waitForMenuReady(app)
    await enterSourceMode(page, app)
    await page.evaluate(() => {
      const cm = (document.querySelector('.source-code .CodeMirror') as SourceEditor).CodeMirror
      cm.clearHistory()
      cm.replaceRange('EDIT ', { line: 0, ch: 0 })
    })
    await expect(page.locator('.editor-tabs li.active')).toHaveClass(/unsaved/)
    await page.evaluate(() => {
      const cm = (document.querySelector('.source-code .CodeMirror') as SourceEditor).CodeMirror
      cm.undo()
    })
    await expect(page.locator('.editor-tabs li.active')).not.toHaveClass(/unsaved/)
    await app.evaluate(({ dialog }) => {
      ;(globalThis as PromptCounter).__savePrompts = 0
      dialog.showMessageBox = async() => {
        ;(globalThis as PromptCounter).__savePrompts++
        return { response: 1, checkboxChecked: false }
      }
    })
    const tab = page.locator('.editor-tabs li.active')
    const id = await tab.getAttribute('data-id')
    await tab.locator('.close-icon').click()
    await expect(page.locator(`.editor-tabs li[data-id="${id}"]`)).toHaveCount(0)
    expect(await app.evaluate(() => (globalThis as PromptCounter).__savePrompts)).toBe(0)
  } finally {
    await app.close()
  }
})

test('a real source edit still prompts before closing (#4)', async() => {
  const { app, page } = await launchWithMarkdown('Unchanged on disk.\n')
  try {
    await waitForMenuReady(app)
    await enterSourceMode(page, app)
    await page.evaluate(() => {
      const cm = (document.querySelector('.source-code .CodeMirror') as SourceEditor).CodeMirror
      cm.replaceRange('EDIT ', { line: 0, ch: 0 })
    })
    await expect(page.locator('.editor-tabs li.active')).toHaveClass(/unsaved/)
    await app.evaluate(({ dialog }) => {
      ;(globalThis as PromptCounter).__savePrompts = 0
      dialog.showMessageBox = async() => {
        ;(globalThis as PromptCounter).__savePrompts++
        return { response: 1, checkboxChecked: false }
      }
    })
    await page.locator('.editor-tabs li.active .close-icon').click()
    await expect.poll(() => app.evaluate(() => (globalThis as PromptCounter).__savePrompts)).toBe(1)
  } finally {
    await app.close()
  }
})
