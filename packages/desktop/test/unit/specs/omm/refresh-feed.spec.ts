// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'

const script = resolve(__dirname, '../../../../../../scripts/release/refresh-feed.py')
const python = process.platform === 'win32' ? 'python' : 'python3'
let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'omm-detached-feed-'))
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('detached notarization feed refresh', () => {
  it('refreshes the legacy checksum when path points at the stapled artifact', () => {
    const bytes = Buffer.from('DMG after stapling')
    const digest = createHash('sha512').update(bytes).digest('base64')
    const artifact = join(dir, 'app.dmg')
    const feed = join(dir, 'latest-mac.yml')
    writeFileSync(artifact, bytes)
    writeFileSync(
      feed,
      'files:\n  - url: app.dmg\n    sha512: old\n    size: 1\npath: app.dmg\nsha512: old\n'
    )
    execFileSync(python, [script, feed, 'app.dmg', artifact])
    const updated = readFileSync(feed, 'utf8')
    expect(updated).toContain(`    sha512: ${digest}\n    size: ${bytes.length}`)
    expect(updated).toContain(`\nsha512: ${digest}\n`)
    execFileSync(python, [script, feed, 'app.dmg', artifact])
    expect(readFileSync(feed, 'utf8')).toBe(updated)
  })

  it('preserves the legacy ZIP checksum while refreshing a DMG entry', () => {
    const artifact = join(dir, 'app.dmg')
    const feed = join(dir, 'latest-mac.yml')
    writeFileSync(artifact, 'stapled DMG')
    writeFileSync(
      feed,
      'files:\n  - url: app.dmg\n    sha512: old\n    size: 1\npath: app.zip\nsha512: zip-digest\n'
    )
    execFileSync(python, [script, feed, 'app.dmg', artifact])
    const updated = readFileSync(feed, 'utf8')
    expect(updated).not.toContain('sha512: old')
    expect(updated).toContain('\nsha512: zip-digest\n')
  })
})
