// Researcher-only preservation after the user's explicit pause. No model calls.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { reconcileCosts, recordedSpend } from '../../costs.mjs'
import { command, listening } from '../../operator-utils.mjs'
import { verify } from '../../verify.mjs'
const study = resolve('openrouter-study')
const root = resolve(study, 'glm/runtime'), id = 'P03-C-002'
const dir = resolve(root, '.work/pilots', id)
const json = path => JSON.parse(fs.readFileSync(path))
const incident = resolve(study, 'analysis/recovery/user-pause-2026-10-09.json')
assert.equal(json(incident).reason, 'Explicit user request to pause and preserve progress')
assert.equal(json(resolve(dir, 'execution.json')).status, 'operator_interruption')
assert.equal(await listening(9238), false)
assert.equal(await listening(9223), false)
for (const [file, pid] of [[resolve(study, 'runner.lock'), 20466], [resolve(study, 'analysis/recovery/known-service-resumer.lock'), 84327]]) {
  try { process.kill(pid, 0); assert.fail('Expected exited process: ' + pid) } catch (error) { assert.equal(error.code, 'ESRCH') }
  if (fs.existsSync(file)) { assert.equal(fs.readFileSync(file, 'utf8').trim(), String(pid)); fs.rmSync(file) }
}
verify()
const api = resolve(study, 'glm/api', id, 'model')
const cost = await reconcileCosts(api)
fs.writeFileSync(resolve(dir, 'api-cost.json'), JSON.stringify(cost, null, 2) + '\n')
const requests = fs.readdirSync(api).filter(file => /^request-\d+\.json$/.test(file))
assert.equal(requests.length, cost.requests.length, 'Unfinished API request requires separate inspection')
for (const file of requests) {
  const path = resolve(api, file)
  fs.writeFileSync(path + '.gz', gzipSync(fs.readFileSync(path)), { flag: 'wx' }); fs.rmSync(path)
}
const logs = resolve(root, 'main-study/logs')
const env = { ...process.env, MAG_SPECKIT_RUNTIME: json(resolve(study, 'glm/setup.json')).specKitRuntime }
const script = (name, file, ...args) => command({ root, logs, name: 'pause-' + name, args: [resolve(root, 'scripts', file), ...args], env })
await script('usage', 'reconcile-pilot-usage.mjs', id)
await script('evaluate', 'evaluate-pilot.mjs', id)
await script('archive', 'archive-pilot.mjs', id)
await script('analysis', 'analyze-main.mjs')
await command({ root, logs, name: 'pause-comparison', args: [resolve(study, 'analyze.mjs')], env })
await script('status', 'main-study.mjs', 'status')
const evaluation = json(resolve(root, 'runs', id, 'evaluation-summary.json'))
const record = { ...json(incident), finishedAt: new Date().toISOString(), archivePending: false, archive: 'glm/runtime/runs/' + id, executionStatus: evaluation.executionStatus, elapsedSeconds: evaluation.elapsedSeconds, groups: evaluation.groups, allChecksPassed: evaluation.allChecksPassed, checks: evaluation.checks, cost: { complete: cost.complete, costUSD: cost.costUSD, knownCostUSD: cost.knownCostUSD, requests: cost.requests.length }, spend: recordedSpend(), nextUnused: 'qwen/P03-A-002', nextPosition: 43, noMeasuredRetry: true, note: 'User interruption is retained explicitly; do not attribute this shortened run to model ability or rerun it. Final report must disclose it.' }
fs.writeFileSync(incident, JSON.stringify(record, null, 2) + '\n')
fs.writeFileSync(resolve(study, 'active.json'), JSON.stringify({ at: new Date().toISOString(), stage: 'paused_by_user', archived: json(resolve(study, 'status.json')).archived, planned: 216, lastRun: 'glm/' + id, nextRun: record.nextUnused, nextPosition: 43, pauseEvidence: 'analysis/recovery/user-pause-2026-10-09.json', spend: record.spend }, null, 2) + '\n')
fs.writeFileSync(resolve(study, 'PAUSED.json'), JSON.stringify({ at: new Date().toISOString(), reason: 'Explicit user pause; resume only on a new user request', nextRun: record.nextUnused, nextPosition: 43, frozenRunNeverRepeated: 'glm/' + id }, null, 2) + '\n')
console.log(JSON.stringify({ archived: json(resolve(study, 'status.json')).archived, executionStatus: evaluation.executionStatus, groups: evaluation.groups, spend: record.spend, nextRun: record.nextUnused, paused: true }))
