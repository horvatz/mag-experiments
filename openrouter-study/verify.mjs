import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url))
export function verify() {
  const freeze = JSON.parse(readFileSync(resolve(study, 'frozen-inputs.json')))
  for (const [file, hash] of Object.entries(freeze.sources)) assert.equal(digest(readFileSync(resolve(study, file))), hash, 'Frozen OpenRouter source changed: ' + file)
  for (const slug of ['glm', 'deepseek', 'qwen']) {
    const setup = JSON.parse(readFileSync(resolve(study, slug, 'setup.json')))
    assert.equal(digest(readFileSync(setup.cli.path)), setup.cli.sha256)
    for (const [file, hash] of Object.entries(setup.cli.packageFiles)) assert.equal(digest(readFileSync(resolve(setup.cli.packageRoot, file))), hash, 'Pinned CLI package changed: ' + file)
    execFileSync(process.execPath, [resolve(study, slug, 'runtime/scripts/main-study.mjs'), 'verify-freeze'], { cwd: resolve(study, slug, 'runtime') })
  }
  execFileSync(process.execPath, [resolve(study, '../scripts/main-study.mjs'), 'verify-freeze'], { cwd: resolve(study, '..') })
  execFileSync(process.execPath, [resolve(study, '../luna-study/verify.mjs')], { cwd: resolve(study, '../luna-study') })
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { verify(); console.log('All frozen collections and the OpenRouter operator verified.') }
