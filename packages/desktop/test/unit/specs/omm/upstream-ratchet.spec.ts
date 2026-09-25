// @vitest-environment node
import { afterEach, beforeEach, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BASELINE_PATH, verifyUpstream, type UpstreamBaseline } from '../../../../../../scripts/omm-upstream'

let root: string
let baseline: UpstreamBaseline
let oldUpstream: string
const git = (...args: string[]): string => execFileSync('git', args, {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' }
}).trim()

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'omm-ratchet-'))
  git('init', '-b', 'upstream')
  git('commit', '--allow-empty', '-m', 'upstream 1')
  oldUpstream = git('rev-parse', 'HEAD')
  git('switch', '-c', 'fork')
  git('commit', '--allow-empty', '-m', 'fork 1')
  git('tag', 'v1.0.0-omm.1')
  const forkCommit = git('rev-parse', 'HEAD')
  git('switch', 'upstream')
  git('commit', '--allow-empty', '-m', 'upstream 2')
  git('tag', 'v1.1.0')
  baseline = {
    upstreamTag: 'v1.1.0',
    upstreamCommit: git('rev-parse', 'HEAD'),
    previousUpstreamCommit: oldUpstream,
    previousForkRelease: { tag: 'v1.0.0-omm.1', commit: forkCommit }
  }
  git('switch', 'fork')
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

it('accepts a release merge both before and after committing', () => {
  git('merge', '--no-ff', '--no-commit', baseline.upstreamTag)
  expect(() => verifyUpstream(root, baseline)).not.toThrow()
  git('commit', '-m', 'integrate upstream')
  expect(() => verifyUpstream(root, baseline, baseline.previousForkRelease.commit)).not.toThrow()
})

it('rejects an upstream release that has not been merged', () => {
  expect(() => verifyUpstream(root, baseline)).toThrow('has not been merged')
})

it('rejects a branch that dropped the previous fork release', () => {
  git('switch', 'upstream')
  expect(() => verifyUpstream(root, baseline)).toThrow('Previous fork release is missing')
})

it('rejects a moved release tag', () => {
  git('tag', '-f', baseline.upstreamTag, oldUpstream)
  expect(() => verifyUpstream(root, baseline)).toThrow('does not match its pinned commit')
})

it('rejects a backwards baseline even if its manifest anchors were edited', () => {
  git('merge', '--no-ff', '-m', 'integrate upstream', baseline.upstreamTag)
  mkdirSync(join(root, 'docs/omm'), { recursive: true })
  writeFileSync(join(root, BASELINE_PATH), JSON.stringify(baseline))
  git('add', BASELINE_PATH)
  git('commit', '-m', 'record baseline')
  const previous = git('rev-parse', 'HEAD')
  git('tag', 'v1.0.0', oldUpstream)
  const regressed = { ...baseline, upstreamTag: 'v1.0.0', upstreamCommit: oldUpstream }
  expect(() => verifyUpstream(root, regressed, previous)).toThrow('regressed relative')
})
