import { expect, test } from '@playwright/test'
import { _electron } from 'playwright'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join } from 'node:path'

test('the packaged app launches and opens a Markdown file', async() => {
  const executablePath = process.env.MARKTEXT_SMOKE_EXECUTABLE
  if (!executablePath || !isAbsolute(executablePath)) {
    throw new Error('Set MARKTEXT_SMOKE_EXECUTABLE to the absolute path of the packaged executable')
  }
  const dir = mkdtempSync(join(tmpdir(), 'marktext-packaged-'))
  const document = join(dir, 'smoke.md')
  writeFileSync(document, '# Packaged launch check\n\nNative modules loaded successfully.\n')
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) env[key] = value
  }
  delete env.ELECTRON_RUN_AS_NODE
  delete env.NODE_ENV
  delete env.PERF_TESTING
  let app: Awaited<ReturnType<typeof _electron.launch>> | undefined
  try {
    // Run away from the checkout so repo dependencies cannot hide a broken
    // package. The app's normal startup imports keytar, ced and native-keymap.
    app = await _electron.launch({
      executablePath,
      args: ['--user-data-dir', join(dir, 'profile'), document],
      cwd: dir,
      env,
      timeout: 30000
    })
    expect(await app.evaluate(({ app }) => app.isPackaged)).toBe(true)
    const page = await app.firstWindow()
    await expect(page.locator('.editor-component')).toContainText('Packaged launch check')
    await expect(page.locator('.editor-component')).toContainText('Native modules loaded successfully.')
  } finally {
    try {
      await app?.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }
})
