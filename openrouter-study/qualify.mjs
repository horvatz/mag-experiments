// Preserve the original workflow qualification, including every failed attempt.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startRelay } from './relay.mjs'
const study = dirname(fileURLToPath(import.meta.url)), slug = process.argv[2], number = process.argv[3] || '011'
const selected = JSON.parse(readFileSync(resolve(study, 'models.json'))).models.find(m => m.slug === slug); assert.ok(selected)
const collection = resolve(study, slug), root = resolve(collection, 'runtime')
const setup = JSON.parse(readFileSync(resolve(collection, 'setup.json')))
assert.ok(!existsSync(resolve(collection, 'frozen-inputs.json')))
const results = []
const kinds = process.argv[4] ? process.argv[4].split(',') : ['B', 'C', 'I']
assert.ok(kinds.length && kinds.every(kind => ['B', 'C', 'I'].includes(kind)))
for (const kind of kinds) {
  const id = `Q-${kind}-${number}`, exportId = `P02-${kind === 'I' ? 'A' : kind}-${900 + Number(number)}`
  const destination = resolve(collection, 'qualification/' + id); assert.ok(!existsSync(destination)); mkdirSync(destination, { recursive: true })
  execFileSync(process.execPath, [resolve(root, 'scripts/prepare-pilot.mjs'), exportId], { cwd: root, env: { ...process.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime }, stdio: 'inherit' })
  const relay = await startRelay({ selected, destination, label: `${slug}/${id}` })
  const log = createWriteStream(resolve(destination, 'operator.log'), { flags: 'wx' })
  let code
  try {
    const child = spawn(process.execPath, [resolve(root, 'scripts/qualification.mjs'), kind, number], { cwd: root,
      env: { ...process.env, ...relay.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime }, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false })
    code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) })
  } finally { await relay.close(); await new Promise(done => log.end(done)) }
  const result = JSON.parse(readFileSync(resolve(root, 'qualification', id, 'execution.json')))
  results.push({ id, code, successful: result.successful, evidence: resolve(root, 'qualification', id, 'execution.json') })
  console.log(JSON.stringify(results.at(-1)))
}
writeFileSync(resolve(collection, 'qualification/workflows-' + number + '.json'), JSON.stringify({ at: new Date().toISOString(), excludedFromMeasurements: true, results }, null, 2) + '\n')
