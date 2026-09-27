import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study, 'runtime')
export function verify() {
  const freeze = JSON.parse(readFileSync(resolve(study, 'frozen-inputs.json')))
  for (const [file, hash] of Object.entries(freeze.sources)) assert.equal(digest(readFileSync(resolve(study, file))), hash, 'Supplemental source changed: ' + file)
  const setup = JSON.parse(readFileSync(resolve(study, 'setup.json')))
  assert.equal(digest(readFileSync(setup.cli.path)), setup.cli.sha256, 'Pinned Luna CLI changed')
  for (const [file, hash] of Object.entries(setup.cli.packageFiles)) assert.equal(digest(readFileSync(resolve(setup.cli.packageRoot, file))), hash, 'Pinned CLI package resource changed: ' + file)
  execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'verify-freeze'], { cwd: root })
  execFileSync(process.execPath, [resolve(study, '../scripts/main-study.mjs'), 'verify-freeze'], { cwd: resolve(study, '..') })
  assert.equal(digest(readFileSync(resolve(study, '../main-study/frozen-inputs.json'))), setup.originalFreezeSha256)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { verify(); console.log('Luna and Astra frozen inputs unchanged.') }
