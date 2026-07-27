// electron-builder's `mac.notarize` only notarizes and staples the .app. The
// DMG that wraps it is left unsigned (`dmg.sign` defaults to false) and
// un-notarized, so a DMG downloaded from the internet is rejected outright by
// Gatekeeper — "no usable signature" — even though the app inside is perfectly
// notarized. That defeats the whole point of shipping notarized builds, so
// sign the DMG (`dmg.sign: true`) and notarize + staple it here.
//
// Stapling matters specifically for offline installs: without a stapled ticket
// macOS has to reach Apple to verify, and a colleague on a bad connection sees
// a scary dialog instead of an app.

const { execFileSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const notarytoolAuthArgs = () => {
  // Local builds typically use a stored notarytool keychain profile; CI passes
  // the raw credentials as secrets.
  if (process.env.APPLE_KEYCHAIN_PROFILE) {
    return ['--keychain-profile', process.env.APPLE_KEYCHAIN_PROFILE]
  }

  const { APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID } = process.env
  if (APPLE_ID && APPLE_APP_SPECIFIC_PASSWORD && APPLE_TEAM_ID) {
    return [
      '--apple-id', APPLE_ID,
      '--password', APPLE_APP_SPECIFIC_PASSWORD,
      '--team-id', APPLE_TEAM_ID
    ]
  }

  return null
}

// Stapling rewrites the DMG, so the sha512/size electron-builder already wrote
// into latest-mac.yml no longer match the shipped file. electron-updater uses
// the zip for macOS updates so a stale DMG entry is not fatal, but publishing a
// feed whose checksums are wrong is a trap for whoever debugs it later.
const refreshUpdateInfo = (dir) => {
  let yaml
  try {
    yaml = require('js-yaml')
  } catch {
    console.warn('notarize-dmg: js-yaml unavailable, cannot refresh update metadata')
    return
  }

  for (const name of fs.readdirSync(dir).filter((f) => /^latest.*\.yml$/.test(f))) {
    const ymlPath = path.join(dir, name)
    let doc
    try {
      doc = yaml.load(fs.readFileSync(ymlPath, 'utf8'))
    } catch {
      continue
    }
    if (!doc || !Array.isArray(doc.files)) continue

    let changed = false
    for (const entry of doc.files) {
      const artifact = path.join(dir, entry.url)
      if (!entry.url.endsWith('.dmg') || !fs.existsSync(artifact)) continue

      const buf = fs.readFileSync(artifact)
      const sha512 = crypto.createHash('sha512').update(buf).digest('base64')
      if (entry.sha512 !== sha512 || entry.size !== buf.length) {
        entry.sha512 = sha512
        entry.size = buf.length
        changed = true
      }
    }

    if (changed) {
      fs.writeFileSync(ymlPath, yaml.dump(doc, { lineWidth: -1 }))
      console.log(`notarize-dmg: refreshed DMG checksums in ${name}`)
    }
  }
}

module.exports = async function notarizeDmg (buildResult) {
  if (process.platform !== 'darwin') return []

  const dmgs = (buildResult.artifactPaths || []).filter((p) => p.endsWith('.dmg'))
  if (dmgs.length === 0) return []

  // Unsigned smoke builds (CI's build.yml) set this; nothing to notarize.
  if (process.env.CSC_IDENTITY_AUTO_DISCOVERY === 'false') {
    console.log('notarize-dmg: signing disabled, skipping DMG notarization')
    return []
  }

  const authArgs = notarytoolAuthArgs()
  if (!authArgs) {
    console.log(
      'notarize-dmg: no notarization credentials (set APPLE_KEYCHAIN_PROFILE, or ' +
        'APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID); skipping'
    )
    return []
  }

  for (const dmg of dmgs) {
    const name = path.basename(dmg)
    console.log(`notarize-dmg: submitting ${name} (this can take several minutes)`)
    execFileSync('xcrun', ['notarytool', 'submit', dmg, ...authArgs, '--wait'], {
      stdio: 'inherit'
    })
    execFileSync('xcrun', ['stapler', 'staple', dmg], { stdio: 'inherit' })
    // Fail the build rather than publish a DMG Gatekeeper will reject.
    execFileSync('xcrun', ['stapler', 'validate', dmg], { stdio: 'inherit' })
    console.log(`notarize-dmg: ${name} notarized and stapled`)
  }

  refreshUpdateInfo(path.dirname(dmgs[0]))

  return []
}
