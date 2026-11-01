// Complete evidence/billing for the already returned unmeasured Qwen reply.
// No model request, relay, or measured workflow is started here.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { reconcileCosts } from '../../costs.mjs'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const dir = resolve(study, 'qwen/qualification/service-2026-11-01T00-03-16-785Z')
const read = file => JSON.parse(fs.readFileSync(resolve(dir, file)))
const hash = file => createHash('sha256').update(fs.readFileSync(resolve(dir, file))).digest('hex')
assert.ok(!fs.existsSync(resolve(dir, 'result.json')), 'Do not overwrite diagnostic evidence')
const ledgerHash = hash('api-ledger.jsonl'), responseHash = hash('response.txt')
const row = read('api-ledger.jsonl'), body = read('request-00001.json')
assert.equal(row.number, 1); assert.equal(row.status, 'finished'); assert.equal(row.httpStatus, 200)
assert.equal(row.responseStatus, 'completed'); assert.equal(row.sentUpstream, true)
assert.equal(body.model, 'qwen/qwen3.5-9b'); assert.deepEqual(body.provider.only, ['siliconflow/fp8'])
assert.equal(body.provider.allow_fallbacks, false)
const events = fs.readFileSync(resolve(dir, 'response.txt'), 'utf8').split('\n').flatMap(line => {
  if (!line.startsWith('data: ')) return []
  try { return [JSON.parse(line.slice(6))] } catch { return [] }
})
const final = events.findLast(e => e.response?.status)?.response
assert.equal(final.status, 'completed'); assert.equal(final.model, body.model)
assert.ok(final.output.every(o => ['message', 'reasoning'].includes(o.type)))
const text = final.output.filter(o => o.type === 'message').flatMap(o => (o.content || []).filter(c => c.type === 'output_text').map(c => c.text || '')).join('').trim()
assert.equal(text, 'CONNECTION_OK')
const cost = await reconcileCosts(dir)
assert.equal(hash('api-ledger.jsonl'), ledgerHash); assert.equal(hash('response.txt'), responseHash)
const result = { at: row.finishedAt, model: row.model, provider: row.provider, httpStatus: 200,
  responseStatus: 'completed', text, error: null, passed: true, excludedFromMeasurements: true,
  costComplete: cost.complete, costUSD: cost.costUSD,
  researcherRecovery: { at: new Date().toISOString(), originalDiagnosticProcessExitedWithCode: 1,
    originalFinalResultAndCostFilesAbsent: true, originalPostprocessingFailureCause: 'not captured; supervisor discarded diagnostic stderr',
    responseAndLedgerUnchanged: true, responseSHA256: responseHash, ledgerSHA256: ledgerHash,
    atSource: 'original ledger.finishedAt', modelRequestRepeated: false } }
fs.writeFileSync(resolve(dir, 'result.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ ...result, evidence: dir }))
