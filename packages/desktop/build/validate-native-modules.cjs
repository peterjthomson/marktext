// A cross-build can otherwise ship the host's .node files when npmRebuild is
// disabled. v1.3.0 shipped a macOS ARM64 keytar in the Windows x64 ZIP (#14).
// Validate the files actually packed, before installers/ZIPs can be published.
const fs = require('node:fs/promises')
const path = require('node:path')

module.exports = async function validateNativeModules (context) {
  if (context.electronPlatformName !== 'win32') return

  // electron-builder's Arch enum: ia32=0, x64=1, armv7l=2, arm64=3.
  const targets = { 0: ['ia32', 0x14c], 1: ['x64', 0x8664], 3: ['arm64', 0xaa64] }
  const target = targets[context.arch]
  if (!target) throw new Error(`Unsupported Windows architecture: ${context.arch}`)
  const [arch, machine] = target
  const root = path.join(context.appOutDir, 'resources', 'app.asar.unpacked')
  let count = 0

  async function walk (dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(filename)
      } else if (entry.name.endsWith('.node')) {
        const data = await fs.readFile(filename)
        const offset = data.length >= 64 ? data.readUInt32LE(0x3c) : -1
        const valid = data.toString('ascii', 0, 2) === 'MZ' &&
          offset >= 64 && offset + 6 <= data.length &&
          data.toString('ascii', offset, offset + 4) === 'PE\0\0' &&
          data.readUInt16LE(offset + 4) === machine
        if (!valid) {
          throw new Error(
            `${path.relative(root, filename)} is not a win32 ${arch} native module. ` +
            `Reinstall dependencies and rebuild on Windows for ${arch}; do not reuse macOS/Linux node_modules.`
          )
        }
        count++
      }
    }
  }

  await walk(root)
  if (!count) throw new Error('No packaged Windows native modules found; refusing to publish.')
}
