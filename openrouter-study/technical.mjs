// Unpaid technical checks: isolation, browser, baseline and workflow fixtures.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url))
const slug = process.argv[2], suffix = process.argv[3] || '904'
const collection = resolve(study, slug), root = resolve(collection, 'runtime')
const setup = JSON.parse(readFileSync(resolve(collection, 'setup.json')))
assert.ok(!existsSync(resolve(collection, 'frozen-inputs.json')), 'Technical qualification must precede the freeze')
const logs = resolve(collection, 'qualification'); mkdirSync(logs, { recursive: true })
const file = resolve(logs, 'technical-' + suffix + '.log'), log = createWriteStream(file, { flags: 'wx' })
const child = spawn(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'technical', suffix], { cwd: root,
  env: { ...process.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime, MAG_RELAY_TOKEN: 'technical-only-no-provider-access' }, stdio: ['ignore', 'pipe', 'pipe'] })
child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false }); child.stdout.on('data', part => process.stdout.write(part))
const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) }); await new Promise(done => log.end(done))
writeFileSync(resolve(logs, 'technical-' + suffix + '.json'), JSON.stringify({ at: new Date().toISOString(), code, passed: code === 0, excludedFromMeasurements: true, modelCalls: 0, file }, null, 2) + '\n')
assert.equal(code, 0, 'Technical qualification failed; retain evidence and inspect ' + file)
