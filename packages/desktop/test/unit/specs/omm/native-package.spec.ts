// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const desktopRoot = resolve(__dirname, '../../../../')
const config = readFileSync(join(desktopRoot, 'electron-builder.yml'), 'utf8')
const hookPath = config.match(/^afterPack: (.+)$/m)?.[1]
// Exercise the hook wired into the actual packager; removing the hook must fail.
if (!hookPath) throw new Error('electron-builder.yml must register native-module validation')
const afterPack = require(join(desktopRoot, hookPath))

const pe = (machine: number): Buffer => {
  const bytes = Buffer.alloc(256)
  bytes.write('MZ')
  bytes.writeUInt32LE(128, 0x3c)
  bytes.write('PE\0\0', 128)
  bytes.writeUInt16LE(machine, 132)
  return bytes
}

describe('packaged native modules (#14)', () => {
  let appOutDir: string
  let binary: string
  beforeEach(() => {
    appOutDir = mkdtempSync(join(tmpdir(), 'marktext-native-test-'))
    const dir = join(appOutDir, 'resources/app.asar.unpacked/node_modules/keytar/build/Release')
    mkdirSync(dir, { recursive: true })
    binary = join(dir, 'keytar.node')
  })
  afterEach(() => rmSync(appOutDir, { recursive: true, force: true }))
  const context = (platform = 'win32', arch = 1) => ({
    appOutDir,
    electronPlatformName: platform,
    arch
  })

  it('rejects a Mach-O ARM64 module in a Windows x64 package', async() => {
    // Header from the wrong-platform keytar shipped in the v1.3.0 Windows ZIP.
    const bytes = Buffer.alloc(32)
    bytes.writeUInt32LE(0xfeedfacf, 0)
    bytes.writeUInt32LE(0x0100000c, 4)
    writeFileSync(binary, bytes)
    await expect(afterPack(context())).rejects.toThrow(/keytar.node.*win32.*x64/)
  })

  it('accepts a Windows x64 module', async() => {
    writeFileSync(binary, pe(0x8664))
    await expect(afterPack(context())).resolves.toBeUndefined()
  })

  it('rejects Windows ARM64 modules in an x64 package', async() => {
    writeFileSync(binary, pe(0xaa64))
    await expect(afterPack(context())).rejects.toThrow(/keytar.node/)
  })

  it('accepts Windows ARM64 modules in an ARM64 package', async() => {
    writeFileSync(binary, pe(0xaa64))
    await expect(afterPack(context('win32', 3))).resolves.toBeUndefined()
  })

  it('rejects truncated native binaries', async() => {
    writeFileSync(binary, 'MZ')
    await expect(afterPack(context())).rejects.toThrow(/keytar.node/)
  })

  it('rejects a corrupt PE header offset', async() => {
    const bytes = pe(0x8664)
    bytes.writeUInt32LE(0xffffffff, 0x3c)
    writeFileSync(binary, bytes)
    await expect(afterPack(context())).rejects.toThrow(/keytar.node/)
  })

  it('rejects a package missing native modules', async() => {
    await expect(afterPack(context())).rejects.toThrow(/No packaged Windows native modules/)
  })

  it('does not apply the Windows check to macOS builds', async() => {
    await expect(afterPack(context('darwin'))).resolves.toBeUndefined()
  })
})
