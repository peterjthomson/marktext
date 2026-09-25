import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const BASELINE_PATH = 'docs/omm/upstream.json'
export interface UpstreamBaseline {
  upstreamTag: string
  upstreamCommit: string
  previousUpstreamCommit: string
  previousForkRelease: { tag: string; commit: string }
}

/** Accept a release only when both upstream and fork history move forward.
 * A pending merge is allowed locally so the audit can run before committing.
 * CI also compares against the target branch, preventing edited manifest
 * anchors from hiding a backwards baseline change. */
export const verifyUpstream = (root: string, baseline: UpstreamBaseline, previousRef?: string): void => {
  const git = (...args: string[]): string =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const ancestor = (from: string, to: string): boolean => {
    try { git('merge-base', '--is-ancestor', from, to); return true } catch { return false }
  }
  const requireAncestor = (from: string, to: string, message: string): void => {
    if (!ancestor(from, to)) throw new Error(message)
  }
  for (const { tag, commit } of [
    { tag: baseline.upstreamTag, commit: baseline.upstreamCommit }, baseline.previousForkRelease
  ]) {
    if (!/^v[0-9][0-9A-Za-z.+-]*$/.test(tag) || !/^[a-f0-9]{40}$/.test(commit)) {
      throw new Error('Baseline must pin version tags and full commit hashes')
    }
    if (git('rev-parse', `refs/tags/${tag}^{commit}`) !== commit) {
      throw new Error(`Tag ${tag} does not match its pinned commit`)
    }
  }
  requireAncestor(baseline.previousUpstreamCommit, baseline.upstreamCommit, 'Upstream baseline would move backwards or diverge')
  requireAncestor(baseline.previousForkRelease.commit, 'HEAD', 'Previous fork release is missing from this branch')
  if (!ancestor(baseline.upstreamCommit, 'HEAD') && !ancestor(baseline.upstreamCommit, 'MERGE_HEAD')) {
    throw new Error('Pinned upstream release has not been merged')
  }
  if (previousRef && !/^0+$/.test(previousRef)) {
    requireAncestor(previousRef, 'HEAD', 'Previous fork branch history is missing')
    const previousFiles = git('ls-tree', '--name-only', previousRef, BASELINE_PATH)
    if (previousFiles) {
      const previous: UpstreamBaseline = JSON.parse(git('show', `${previousRef}:${BASELINE_PATH}`))
      requireAncestor(previous.upstreamCommit, baseline.upstreamCommit, 'Upstream baseline regressed relative to the previous fork branch')
      requireAncestor(previous.previousForkRelease.commit, baseline.previousForkRelease.commit, 'Fork release anchor regressed')
    }
  }
}

const filename = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const root = path.resolve(path.dirname(filename), '..')
  try {
    const baseline: UpstreamBaseline = JSON.parse(fs.readFileSync(path.join(root, BASELINE_PATH), 'utf8'))
    verifyUpstream(root, baseline, process.env.OMM_PREVIOUS_REF)
    console.log(`✓ Upstream ratchet: ${baseline.upstreamTag} (${baseline.upstreamCommit.slice(0, 8)}); preserves ${baseline.previousForkRelease.tag}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
