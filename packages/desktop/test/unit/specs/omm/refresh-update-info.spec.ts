import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createRequire } from 'module'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import crypto from 'crypto'

// Notarizing staples a ticket into the DMG *after* electron-builder has hashed
// it, so the update feed describes bytes that no longer exist. This shipped
// broken once already: the refresh used to run from `afterAllArtifactBuild`,
// which fires before the yml is written, so it silently found nothing to fix.

const require_ = createRequire(import.meta.url)
const refreshUpdateInfo = require_(
  resolve(__dirname, '../../../../build/refresh-update-info.cjs')
) as (dir: string) => boolean

const sha512 = (buf: Buffer): string => crypto.createHash('sha512').update(buf).digest('base64')

let dir: string

const writeFeed = (files: Array<{ url: string; sha512: string; size: number }>): void => {
  const body = files
    .map((f) => `  - url: ${f.url}\n    sha512: ${f.sha512}\n    size: ${f.size}`)
    .join('\n')
  writeFileSync(join(dir, 'latest-mac.yml'), `version: 1.0.0\nfiles:\n${body}\npath: ${files[0].url}\n`)
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'omm-feed-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('refresh-update-info', () => {
  it('rewrites a DMG entry whose checksum and size went stale', () => {
    const stapled = Buffer.from('dmg bytes after stapling')
    writeFileSync(join(dir, 'app.dmg'), stapled)
    writeFeed([{ url: 'app.dmg', sha512: 'stale==', size: 1 }])

    expect(refreshUpdateInfo(dir)).toBe(true)

    const feed = readFileSync(join(dir, 'latest-mac.yml'), 'utf8')
    expect(feed).toContain(`size: ${stapled.length}`)
    expect(feed).toContain(sha512(stapled))
    expect(feed).not.toContain('stale==')
  })

  it('leaves a feed alone when the DMG entry already matches', () => {
    const buf = Buffer.from('unchanged')
    writeFileSync(join(dir, 'app.dmg'), buf)
    writeFeed([{ url: 'app.dmg', sha512: sha512(buf), size: buf.length }])

    expect(refreshUpdateInfo(dir)).toBe(false)
  })

  it('does not touch the zip entry, which is not stapled', () => {
    const dmg = Buffer.from('dmg')
    writeFileSync(join(dir, 'app.dmg'), dmg)
    writeFileSync(join(dir, 'app.zip'), Buffer.from('zip'))
    writeFeed([
      { url: 'app.zip', sha512: 'zip-hash-left-as-is==', size: 999 },
      { url: 'app.dmg', sha512: 'stale==', size: 1 }
    ])

    refreshUpdateInfo(dir)

    const feed = readFileSync(join(dir, 'latest-mac.yml'), 'utf8')
    expect(feed).toContain('zip-hash-left-as-is==')
    expect(feed).toContain('size: 999')
  })

  it('reports failure rather than throwing when there is no feed to refresh', () => {
    expect(refreshUpdateInfo(dir)).toBe(false)
    expect(refreshUpdateInfo(join(dir, 'does-not-exist'))).toBe(false)
  })
})
