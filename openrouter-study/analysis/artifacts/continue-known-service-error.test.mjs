// Uses archived fixtures only; never sends a request or repeats a measurement.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { knownFailure } from './continue-known-service-error.mjs'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const fixture = (slug, number, id = 'P06-A-001') => {
  const api = resolve(study, slug, 'api', id, 'model')
  return { row: fs.readFileSync(resolve(api, 'api-ledger.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).at(-1), body: JSON.parse(gunzipSync(fs.readFileSync(resolve(api, `request-${String(number).padStart(5, '0')}.json.gz`)))) }
}
const ds = fixture('deepseek', 24), q = fixture('qwen', 6), empty = fixture('qwen', 2, 'P06-B-001'), glm = fixture('glm', 50, 'P06-B-001')
const unavailable = fixture('deepseek', 36, 'P08-C-001')
const unavailableNative = gunzipSync(fs.readFileSync(resolve(study, 'deepseek/runtime/runs/P08-C-001/phases/05-implement/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const changed520 = patch => ({ ...unavailable.row, providerError: JSON.stringify({error:{...JSON.parse(unavailable.row.providerError).error, ...patch}}) })
const native = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P06-A-001/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const emptyNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P06-B-001/phases/01-specification/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const checks = [
  ['observed exact DeepInfra 520', knownFailure(unavailable.row, unavailable.body, unavailableNative), 'deepinfra-http520-cause-unknown'],
  ['520 without native evidence', knownFailure(unavailable.row, unavailable.body), null],
  ['520 changed message', knownFailure(changed520({message:'Different error'}), unavailable.body, unavailableNative), null],
  ['520 changed raw', knownFailure(changed520({metadata:{...JSON.parse(unavailable.row.providerError).error.metadata,raw:'different'}}), unavailable.body, unavailableNative), null],
  ['520 changed provider name', knownFailure(changed520({metadata:{...JSON.parse(unavailable.row.providerError).error.metadata,provider_name:'Other'}}), unavailable.body, unavailableNative), null],
  ['520 changed provider', knownFailure({...unavailable.row,provider:'other'}, unavailable.body, unavailableNative), null],
  ['520 changed request model', knownFailure(unavailable.row, {...unavailable.body,model:'other'}, unavailableNative), null],
  ['520 fallback enabled', knownFailure(unavailable.row, {...unavailable.body,provider:{...unavailable.body.provider,allow_fallbacks:true}}, unavailableNative), null],
  ['520 not sent upstream', knownFailure({...unavailable.row,sentUpstream:false}, unavailable.body, unavailableNative), null],
  ['520 retry-after requires inspection', knownFailure({...unavailable.row,retryAfter:'60'}, unavailable.body, unavailableNative), null],
  ['520 changed HTTP status', knownFailure({...unavailable.row,httpStatus:500}, unavailable.body, unavailableNative), null],
  ['520 malformed error', knownFailure({...unavailable.row,providerError:'bad json'}, unavailable.body, unavailableNative), null],
  ['520 changed code', knownFailure(changed520({code:503}), unavailable.body, unavailableNative), null],
  ['diagnosed image rejection', knownFailure(ds.row, ds.body), 'deepinfra-image-tool'],
  ['observed GLM unsupported image', knownFailure(glm.row, glm.body), 'glm-image-input-unsupported'],
  ['GLM other 404', knownFailure({ ...glm.row, providerError: JSON.stringify({error:{code:404,message:'Other error'}}) }, glm.body), null],
  ['GLM image without tool output', knownFailure(glm.row, { ...glm.body, input: glm.body.input.filter(x => x.type !== 'function_call_output') }), null],
  ['GLM image wrong tool', knownFailure(glm.row, { ...glm.body, input: glm.body.input.map(x => x.type === 'function_call' ? { ...x, name: 'other_tool' } : x) }), null],
  ['GLM image changed provider', knownFailure({ ...glm.row, provider: 'other' }, glm.body), null],
  ['GLM image fallback enabled', knownFailure(glm.row, { ...glm.body, provider: { ...glm.body.provider, allow_fallbacks: true } }), null],
  ['GLM image malformed error', knownFailure({ ...glm.row, providerError: 'bad json' }, glm.body), null],
  ['observed Qwen stream failure', knownFailure(q.row, q.body, native), 'qwen-stream-failed-cause-unknown'],
  ['observed Qwen empty response', knownFailure(empty.row, empty.body, emptyNative), 'qwen-empty-response-cause-unknown'],
  ['empty response without native evidence', knownFailure(empty.row, empty.body), null],
  ['unrecognized native failure', knownFailure(empty.row, empty.body, ['stream disconnected before completion: different error']), null],
  ['empty response changed provider', knownFailure({ ...empty.row, provider: 'other' }, empty.body, emptyNative), null],
  ['empty response completed', knownFailure({ ...empty.row, responseStatus: 'completed' }, empty.body, emptyNative), null],
  ['empty response fallback enabled', knownFailure(empty.row, { ...empty.body, provider: { ...empty.body.provider, allow_fallbacks: true } }, emptyNative), null],
  ['missing native evidence', knownFailure(q.row, q.body), null],
  ['HTTP429', knownFailure({ ...q.row, httpStatus: 429 }, q.body, native), null],
  ['incomplete response', knownFailure({ ...q.row, responseStatus: 'incomplete' }, q.body, native), null],
  ['different provider', knownFailure({ ...q.row, provider: 'other' }, q.body, native), null],
  ['changed request model', knownFailure(q.row, { ...q.body, model: 'other' }, native), null],
  ['fallback enabled', knownFailure(q.row, { ...q.body, provider: { ...q.body.provider, allow_fallbacks: true } }, native), null],
  ['malformed image error', knownFailure({ ...ds.row, providerError: 'bad json' }, ds.body), null],
  ['no image output', knownFailure(ds.row, { ...ds.body, input: ds.body.input.filter(x => x.type !== 'function_call_output') }), null],
  ['wrong image tool', knownFailure(ds.row, { ...ds.body, input: ds.body.input.map(x => x.type === 'function_call' ? { ...x, name: 'other_tool' } : x) }), null],
  ['image rejection status changed', knownFailure({ ...ds.row, httpStatus: 500 }, ds.body), null],
]
for (const [, actual, expected] of checks) assert.equal(actual, expected)
const source = 'analysis/artifacts/continue-known-service-error.mjs'
fs.writeFileSync(resolve(study, 'analysis/recovery/known-service-classifier-checks.json'), JSON.stringify({ at: new Date().toISOString(), source, sourceSHA256: createHash('sha256').update(fs.readFileSync(resolve(study, source))).digest('hex'), researcherOnly: true, measuredRequestsReplayed: false, passed: true, checks: checks.map(([caseName, actual, expected]) => ({ caseName, actual, expected, passed: actual === expected })) }, null, 2) + '\n')
console.log(checks.length + ' fixture checks passed; no API requests sent.')
