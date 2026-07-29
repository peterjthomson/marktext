/**
 * Oh My Marktext delta audit.
 *
 * Compares the working tree against the upstream MarkText base and checks every
 * modified upstream file against the ledger in `docs/omm/EXTENSIONS.md`. An
 * undocumented delta is how a fork quietly becomes a rewrite, so `--check`
 * fails CI on one; a ledger row with no matching change is equally interesting,
 * because it usually means upstream adopted the fix.
 *
 * Usage:
 *   pnpm omm:deltas            report
 *   pnpm omm:deltas --check    report and exit 1 on drift
 *   OMM_UPSTREAM_REF=v0.20.0 pnpm omm:deltas
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(__filename), '..')
const LEDGER = 'docs/omm/EXTENSIONS.md'
const UPSTREAM_REF = process.env.OMM_UPSTREAM_REF ?? 'upstream/develop'

// Only source files carry inline markers; JSON and locale files have no comment
// syntax to put one in.
const MARKER = 'OMM'
const MARKABLE = ['.ts', '.js', '.cjs', '.mjs', '.vue']

const git = (...args: string[]): string =>
  execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()

const fail = (message: string): never => {
  console.error(`\n✗ ${message}`)
  process.exit(2)
}

const resolveBase = (): string => {
  try {
    return git('merge-base', 'HEAD', UPSTREAM_REF)
  } catch {
    return fail(
      `Cannot resolve "${UPSTREAM_REF}". Add the upstream remote and fetch it:\n` +
        '  git remote add upstream https://github.com/marktext/marktext.git\n' +
        '  git fetch upstream --tags'
    )
  }
}

interface Ledger {
  /** Upstream files with a ledger row. */
  tracked: Set<string>
  /** Path prefixes the fork owns outright, so they are never deltas. */
  ownedPrefixes: string[]
}

/**
 * Reads the ledger out of the markdown rather than a parallel config file: one
 * source of truth, and the thing a human reads is the thing CI enforces.
 *
 * Table rows contribute tracked paths; the "fork-owned by definition" paragraph
 * contributes ownership prefixes (a trailing `*` is a prefix match).
 */
const readLedger = (): Ledger => {
  const text = fs.readFileSync(path.join(repoRoot, LEDGER), 'utf8')
  const tracked = new Set<string>()
  const ownedPrefixes: string[] = []

  let inOwnedSection = false
  for (const line of text.split('\n')) {
    if (line.startsWith('#')) {
      inOwnedSection = /Build, CI and docs/i.test(line)
      continue
    }
    const paths = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((p) => !p.includes(' '))

    if (inOwnedSection) {
      ownedPrefixes.push(...paths.map((p) => p.replace(/\*$/, '')))
    } else if (line.startsWith('|')) {
      paths.filter((p) => p.startsWith('packages/')).forEach((p) => tracked.add(p))
    }
  }

  if (!tracked.size) fail(`No ledger rows found in ${LEDGER} — has the table format changed?`)
  return { tracked, ownedPrefixes }
}

interface Change {
  status: string
  file: string
}

/**
 * Everything that differs from the upstream base *including uncommitted work* —
 * the audit is most useful while a merge or a new feature is still in progress.
 */
const changesSince = (base: string): Change[] => {
  const diffed = git('diff', '--name-status', '-M', base)
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('\t')
      // Renames carry both paths; the destination is what matters here.
      return { status: parts[0], file: parts[parts.length - 1] }
    })

  const untracked = git('ls-files', '--others', '--exclude-standard')
    .split('\n')
    .filter(Boolean)
    .map((file) => ({ status: 'A', file }))

  return [...diffed, ...untracked]
}

const isOwned = (file: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => file === prefix || file.startsWith(prefix))

const hasMarker = (file: string): boolean => {
  if (!MARKABLE.includes(path.extname(file))) return true
  const abs = path.join(repoRoot, file)
  if (!fs.existsSync(abs)) return true
  return fs.readFileSync(abs, 'utf8').includes(MARKER)
}

const list = (title: string, files: string[]): void => {
  if (!files.length) return
  console.log(`\n${title}`)
  files.forEach((f) => console.log(`  ${f}`))
}

const main = (): void => {
  const check = process.argv.includes('--check')
  const base = resolveBase()
  const { tracked, ownedPrefixes } = readLedger()

  const modified: string[] = []
  const added: string[] = []
  for (const { status, file } of changesSince(base)) {
    if (isOwned(file, ownedPrefixes)) continue
    // `A` and `R` both mean the path did not exist upstream, so it is fork-owned
    // code rather than a delta against an upstream file.
    const isNew = status.startsWith('A') || status.startsWith('R')
    if (isNew) {
      added.push(file)
    } else {
      modified.push(file)
    }
  }

  const undocumented = modified.filter((f) => !tracked.has(f))
  const unmarked = modified.filter((f) => tracked.has(f) && !hasMarker(f))
  const stale = [...tracked].filter((f) => !modified.includes(f)).sort()
  const ommModules = added.filter((f) => f.includes('/omm/')).sort()
  const otherAdded = added.filter((f) => !f.includes('/omm/')).sort()

  console.log(`Upstream base: ${base.slice(0, 8)} (${UPSTREAM_REF})`)
  console.log(
    `\n${ommModules.length} module files · ${modified.length} modified upstream files · ` +
      `${otherAdded.length} other fork-owned files`
  )

  list('Modules (zero merge cost)', ommModules)
  list('Deltas in upstream files (ledger-tracked)', modified.filter((f) => tracked.has(f)).sort())
  list('Other fork-owned additions', otherAdded)
  list(`✗ Undocumented — add a row to ${LEDGER}`, undocumented.sort())
  list(`✗ Missing an inline "${MARKER}" marker`, unmarked.sort())
  list('✗ Ledger rows with no matching change — upstream may have adopted these', stale)

  const drift = undocumented.length + unmarked.length + stale.length
  if (drift && check) {
    console.error(`\n✗ ${drift} ledger problem(s). See ${LEDGER}.`)
    process.exit(1)
  }
  if (!drift) console.log('\n✓ Ledger matches the working tree.')
}

main()
