// Only finish the unchanged post-model steps for the already stopped run194.
// No model runner, service probe, prompt edit, or measured retry occurs here.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { gzipSync, gunzipSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { reconcileCosts, recordedSpend } from '../../costs.mjs'
import { verify } from '../../verify.mjs'
import { command } from '../../operator-utils.mjs'

const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const root = resolve(study, 'qwen/runtime'), id = 'P09-C-002'
const run = resolve(root, '.work/pilots', id), archive = resolve(root, 'runs', id)
const api = resolve(study, 'qwen/api', id, 'model')
const recovery = resolve(study, 'analysis/recovery/network-postprocessing-194')
const read = path => JSON.parse(fs.readFileSync(path))
const hash = path => createHash('sha256').update(fs.readFileSync(path)).digest('hex')
assert.ok(!fs.existsSync(resolve(study, 'runner.lock')))
assert.ok(!fs.existsSync(resolve(study, 'analysis/recovery/known-service-resumer.lock')))
assert.equal(read(resolve(run, 'execution.json')).status, 'time_limit')
assert.ok(!fs.existsSync(archive), 'Never overwrite an archived measurement')
const rows = fs.readFileSync(resolve(api, 'api-ledger.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
assert.equal(rows.length, 29)
assert.equal(rows.at(-1).status, 'client_aborted')
assert.equal(rows.at(-1).errorType, 'AbortError')
assert.equal(rows.at(-1).sentUpstream, true)
assert.equal(rows.at(-1).httpStatus, 200)
assert.equal(rows.at(-1).responseStatus, null)
assert.equal(rows.at(-1).responseId, 'gen-1793552300-jYo3mZTllS4AW5WWgJ86')
assert.equal(read(resolve(run, 'execution.json')).elapsedSeconds, 1340.288)
fs.mkdirSync(recovery, { recursive: true })
for (const [name, path] of [['active-before.json', resolve(study, 'active.json')], ['execution-before.json', resolve(run, 'execution.json')], ['ledger-before.jsonl', resolve(api, 'api-ledger.jsonl')]]) {
  const copy = resolve(recovery, name)
  if (!fs.existsSync(copy)) fs.copyFileSync(path, copy, fs.constants.COPYFILE_EXCL)
  assert.equal(hash(path), hash(copy))
}
verify()
const result = { at: new Date().toISOString(), researcherOnly: true, position: 194, id,
  reason: 'Network fetch failure during post-model invoice lookup after stopped model; finish unchanged post-model commands only.',
  executionSHA256: hash(resolve(run, 'execution.json')), ledgerSHA256: hash(resolve(api, 'api-ledger.jsonl')),
  measuredRetry: false, measuredInputsChanged: false, losslessRequests: [], commands: [], complete: false }
const save = () => fs.writeFileSync(resolve(recovery, 'completion.json'), JSON.stringify(result, null, 2) + '\n')
save()
if (!fs.existsSync(resolve(run, 'api-cost.json'))) {
  const cost = await reconcileCosts(api)
  fs.writeFileSync(resolve(run, 'api-cost.json'), JSON.stringify(cost, null, 2) + '\n', { flag: 'wx' })
}
for (const row of rows) {
  const raw = resolve(api, `request-${String(row.number).padStart(5, '0')}.json`), packed = raw + '.gz'
  if (fs.existsSync(raw)) {
    const bytes = fs.readFileSync(raw)
    if (!fs.existsSync(packed)) fs.writeFileSync(packed, gzipSync(bytes), { flag: 'wx' })
    assert.deepEqual(gunzipSync(fs.readFileSync(packed)), bytes)
    fs.rmSync(raw)
  }
  result.losslessRequests.push({ number: row.number, payloadSHA256: createHash('sha256').update(gunzipSync(fs.readFileSync(packed))).digest('hex') })
}
save()
const setup = read(resolve(study, 'qwen/setup.json')), env = { ...process.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime }
const logs = resolve(root, 'main-study/logs')
for (const [name, script, args, marker] of [
  ['usage', 'reconcile-pilot-usage.mjs', [id], 'usage-observation.json'],
  ['evaluate', 'evaluate-pilot.mjs', [id], 'evaluation-summary.json'],
  ['archive', 'archive-pilot.mjs', [id], null],
  ['analysis', 'analyze-main.mjs', [], null],
]) {
  if (marker && fs.existsSync(resolve(run, marker))) continue
  result.commands.push(await command({ root, logs, name: `qwen-${id}-network-recovery-${name}`, args: [resolve(root, 'scripts', script), ...args], env }))
  save()
}
result.commands.push(await command({ root: resolve(study, '..'), logs, name: `qwen-${id}-network-recovery-comparison`, args: [resolve(study, 'analyze.mjs')], env }))
result.commands.push(await command({ root, logs, name: `qwen-${id}-network-recovery-status`, args: [resolve(root, 'scripts/main-study.mjs'), 'status'], env }))
assert.equal(hash(resolve(run, 'execution.json')), result.executionSHA256)
assert.equal(hash(resolve(api, 'api-ledger.jsonl')), result.ledgerSHA256)
assert.ok(fs.existsSync(resolve(archive, 'archive-complete.json')))
result.archiveReceiptSHA256 = hash(resolve(archive, 'archive-complete.json'))
result.complete = true; result.completedAt = new Date().toISOString(); save()
const active = read(resolve(recovery, 'active-before.json'))
fs.writeFileSync(resolve(study, 'active.json'), JSON.stringify({ ...active, at: result.completedAt,
  stage: 'service_failure_archived', spend: recordedSpend(),
  researcherRecovery: 'analysis/recovery/network-postprocessing-194/completion.json' }, null, 2) + '\n')
console.log(JSON.stringify({ position: 194, postprocessingComplete: true, measuredRetry: false, archiveReceiptSHA256: result.archiveReceiptSHA256 }))
