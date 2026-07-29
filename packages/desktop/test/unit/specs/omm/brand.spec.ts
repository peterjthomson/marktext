import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  OMM_APP_ID,
  OMM_PRODUCT_NAME,
  OMM_REPO_URL,
  OMM_SLUG,
  UPSTREAM_REPO_URL
} from 'common/omm/brand'

// Build config cannot import TypeScript, so the product identity is duplicated
// in package.json and electron-builder.yml. These assertions are the only thing
// keeping the duplicates honest: a drifted productName ships an app whose
// window chrome and installer disagree, and a drifted repo URL points the
// auto-updater at upstream's release feed.

const desktopRoot = resolve(__dirname, '../../../..')
const read = (relative: string): string => readFileSync(resolve(desktopRoot, relative), 'utf8')

describe('Oh My Marktext brand constants', () => {
  const pkg = JSON.parse(read('package.json'))
  const builderYml = read('electron-builder.yml')

  it('matches productName in package.json and electron-builder.yml', () => {
    expect(pkg.productName).toBe(OMM_PRODUCT_NAME)
    expect(builderYml).toContain(`productName: ${OMM_PRODUCT_NAME}`)
  })

  it('matches the appId in electron-builder.yml', () => {
    expect(builderYml).toContain(`appId: ${OMM_APP_ID}`)
  })

  it('points the update feed at the fork, not upstream', () => {
    const [owner, repo] = OMM_REPO_URL.replace('https://github.com/', '').split('/')
    // electron-updater falls back to `repository` when `publish` is absent, so
    // both have to point at the fork.
    expect(pkg.repository.url).toContain(`${owner}/${repo}`)
    expect(builderYml).toContain(`owner: ${owner}`)
    expect(builderYml).toContain(`repo: ${repo}`)
  })

  it('names fork-owned artifacts and icons with the fork slug', () => {
    expect(builderYml).toContain(`executableName: ${OMM_SLUG}`)
    expect(builderYml).toContain(`static/${OMM_SLUG}/icon.icns`)
  })

  it('keeps the upstream URL distinct from the fork URL', () => {
    expect(UPSTREAM_REPO_URL).not.toBe(OMM_REPO_URL)
  })
})
