/**
 * Product identity for Oh My Marktext.
 *
 * Upstream hard-codes `marktext` naming and `marktext/marktext` URLs at each
 * use site. Every one of those that this fork changes reads from here instead,
 * so re-pointing the fork (or renaming it) is a one-file edit and upstream
 * merges touch a single import line per file.
 *
 * These values are duplicated — unavoidably — in build config that cannot
 * import TypeScript: `packages/desktop/package.json` and
 * `packages/desktop/electron-builder.yml`. `test/unit/specs/omm/brand.spec.ts`
 * asserts the two stay in sync.
 */

/** Shown in window chrome, the About dialog and installer artifacts. */
export const OMM_PRODUCT_NAME = 'Oh My Marktext'

/**
 * This fork's repository. Bug reports, releases and the auto-update feed all
 * belong here rather than on upstream's tracker.
 */
export const OMM_REPO_URL = 'https://github.com/peterjthomson/marktext'

/** The project this fork is built on, for credit and "based on" links. */
export const UPSTREAM_REPO_URL = 'https://github.com/marktext/marktext'

/** Default branch of {@link OMM_REPO_URL}, used to build blob links. */
export const OMM_DEFAULT_BRANCH = 'master'

/**
 * Bundle identifier. Must match the Developer ID signing profile, and must
 * never change after users install: macOS keys app data and file associations
 * off it. Distinct from upstream's so both apps can be installed side by side.
 */
export const OMM_APP_ID = 'com.peterjthomson.ohmy-marktext'

/**
 * Slug used for fork-owned assets and OS-level identifiers: the
 * `static/<slug>/` icon directory, executable name, artifact filenames and
 * the Linux `StartupWMClass`.
 */
export const OMM_SLUG = 'oh-my-marktext'
