// Stapling rewrites the DMG after electron-builder has already hashed it, so
// the sha512/size in latest-mac.yml describe the pre-staple bytes and no longer
// match the file that ships. electron-updater uses the zip for macOS updates so
// a stale DMG entry is not fatal, but publishing a feed whose checksums are
// wrong is a trap for whoever debugs it later.
//
// This has to run as a post-build step, NOT from `afterAllArtifactBuild`:
// electron-builder writes the update-info yml after that hook returns, so a
// refresh from inside the hook finds no yml and silently does nothing.
//
//   node build/refresh-update-info.cjs [distDir]   # defaults to ../../dist

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const refreshUpdateInfo = (dir) => {
  let yaml
  try {
    yaml = require('js-yaml')
  } catch {
    console.warn('refresh-update-info: js-yaml unavailable, cannot refresh update metadata')
    return false
  }

  if (!fs.existsSync(dir)) {
    console.warn(`refresh-update-info: ${dir} does not exist`)
    return false
  }

  const ymls = fs.readdirSync(dir).filter((f) => /^latest.*\.yml$/.test(f))
  if (ymls.length === 0) {
    console.warn(`refresh-update-info: no latest*.yml in ${dir}`)
    return false
  }

  let refreshedAny = false
  for (const name of ymls) {
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
        console.log(
          `refresh-update-info: ${entry.url} in ${name} was stale ` +
            `(size ${entry.size} -> ${buf.length})`
        )
        entry.sha512 = sha512
        entry.size = buf.length
        changed = true
      }
    }

    if (changed) {
      fs.writeFileSync(ymlPath, yaml.dump(doc, { lineWidth: -1 }))
      console.log(`refresh-update-info: rewrote ${name}`)
      refreshedAny = true
    }
  }

  if (!refreshedAny) console.log('refresh-update-info: all DMG checksums already current')
  return refreshedAny
}

module.exports = refreshUpdateInfo

if (require.main === module) {
  const dir = process.argv[2] || path.resolve(__dirname, '../../../dist')
  refreshUpdateInfo(dir)
}
