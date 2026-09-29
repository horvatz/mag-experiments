import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study, 'runtime')
const setup = JSON.parse(readFileSync(resolve(study, 'setup.json')))
const env = { ...process.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime }
const logs = resolve(study, 'qualification/logs'); mkdirSync(logs, { recursive: true })
async function command(name, script, ...args) {
  const file = resolve(logs, name + '-' + Date.now() + '.log')
  const log = createWriteStream(file, { flags: 'wx' })
  const child = spawn(process.execPath, [resolve(root, 'scripts', script), ...args], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false })
  child.stdout.on('data', part => process.stdout.write(part))
  const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) })
  await new Promise(done => log.end(done))
  assert.equal(code, 0, `Qualification step failed: ${file}`)
}
assert.ok(!existsSync(resolve(root, 'main-study/frozen-inputs.json')), 'Qualification precedes the freeze')
await command('technical', 'main-study.mjs', 'technical', process.argv[2] || '903')
for (const kind of ['B', 'C', 'I']) {
  const id = `P02-${kind === 'I' ? 'A' : kind}-902`
  await command(id + '-prepare', 'prepare-pilot.mjs', id)
  await command('Q-' + kind, 'qualification.mjs', kind, '002')
}
writeFileSync(resolve(study, 'qualification/completed.json'), JSON.stringify({ passed: true, at: new Date().toISOString(), excludedFromMeasurements: true }, null, 2) + '\n')
console.log('Luna technical qualification passed; no main measurement has started.')
