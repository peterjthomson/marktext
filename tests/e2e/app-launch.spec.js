/**
 * E2E Smoke Tests for MarkText
 *
 * These tests verify basic application functionality.
 *
 * NOTE: Due to electron-vite's module bundling, E2E tests require running
 * the app via `electron-vite preview` rather than launching the bundle directly.
 *
 * For now, these tests verify the test infrastructure is set up correctly
 * and can be expanded once the app packaging workflow is finalized.
 */
import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

test.describe('Build Verification', () => {
  test('should have built output directory', async () => {
    const outDir = path.join(projectRoot, 'out')
    const exists = fs.existsSync(outDir)
    expect(exists).toBe(true)
  })

  test('should have main process bundle', async () => {
    const mainBundle = path.join(projectRoot, 'out/main/index.js')
    const exists = fs.existsSync(mainBundle)
    expect(exists).toBe(true)
  })

  test('should have preload script', async () => {
    const preloadBundle = path.join(projectRoot, 'out/preload/index.mjs')
    const exists = fs.existsSync(preloadBundle)
    expect(exists).toBe(true)
  })

  test('should have renderer output', async () => {
    const rendererDir = path.join(projectRoot, 'out/renderer')
    const exists = fs.existsSync(rendererDir)
    expect(exists).toBe(true)

    // Check for index.html
    const indexHtml = path.join(rendererDir, 'index.html')
    const htmlExists = fs.existsSync(indexHtml)
    expect(htmlExists).toBe(true)
  })
})

test.describe('Test Fixtures', () => {
  test('sample markdown file should exist', async () => {
    const sampleMd = path.join(projectRoot, 'tests/fixtures/sample.md')
    const exists = fs.existsSync(sampleMd)
    expect(exists).toBe(true)
  })

  test('sample markdown file should have content', async () => {
    const sampleMd = path.join(projectRoot, 'tests/fixtures/sample.md')
    const content = fs.readFileSync(sampleMd, 'utf-8')
    expect(content).toContain('# Sample Markdown File')
    expect(content).toContain('```javascript')
    expect(content).toContain('| Column 1 |')
  })

  test('CRLF fixture should use Windows line endings', async () => {
    const crlfFile = path.join(projectRoot, 'tests/fixtures/sample-crlf.md')
    const content = fs.readFileSync(crlfFile, 'utf-8')
    // Check for CRLF line endings
    expect(content).toContain('\r\n')
  })
})

// Conditional E2E tests - only run if MARKTEXT_E2E_FULL is set
// This allows the basic tests to pass while full E2E requires packaged app
const skipFullE2E = !process.env.MARKTEXT_E2E_FULL

test.describe('Application Launch (Full E2E)', () => {
  test.skip(skipFullE2E, 'Skipped: Set MARKTEXT_E2E_FULL=1 with packaged app to run')

  let electronApp

  test.beforeAll(async () => {
    // For full E2E tests, use the packaged app path
    const appPath = process.env.MARKTEXT_APP_PATH
    if (!appPath) {
      throw new Error('MARKTEXT_APP_PATH must be set to the packaged app executable')
    }

    electronApp = await electron.launch({
      executablePath: appPath,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      },
      timeout: 30000
    })
  })

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close()
    }
  })

  test('should launch successfully', async () => {
    expect(electronApp).toBeDefined()
    expect(electronApp.process()).not.toBeNull()
  })

  test('should open a window', async () => {
    const windows = electronApp.windows()
    expect(windows.length).toBeGreaterThanOrEqual(1)
  })

  test('should have Vue app mounted', async () => {
    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')

    const appExists = await window.evaluate(() => {
      return document.getElementById('app') !== null
    })
    expect(appExists).toBe(true)
  })

  test('should expose preload APIs', async () => {
    const window = await electronApp.firstWindow()

    const apis = await window.evaluate(() => ({
      hasElectron: typeof window.electron !== 'undefined',
      hasFileUtils: typeof window.fileUtils !== 'undefined',
      hasPath: typeof window.path !== 'undefined'
    }))

    expect(apis.hasElectron).toBe(true)
    expect(apis.hasFileUtils).toBe(true)
    expect(apis.hasPath).toBe(true)
  })
})
