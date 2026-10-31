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
const overloaded = fixture('glm', 7, 'P07-A-003')
const requestFailed = fixture('qwen', 11, 'P07-B-002')
const networkLost = fixture('qwen', 12, 'P07-C-002')
const sseJson = fixture('qwen', 43, 'P07-B-001')
const sseJsonNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P07-B-001/phases/03-review/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const networkLostNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P07-C-002/phases/01-constitution/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const requestFailedNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P07-B-002/phases/01-specification/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const overloadedNative = gunzipSync(fs.readFileSync(resolve(study, 'glm/runtime/runs/P07-A-003/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const overloadPatch = patch => ({...overloaded.row,providerError:JSON.stringify({error:{...JSON.parse(overloaded.row.providerError).error,metadata:{...JSON.parse(overloaded.row.providerError).error.metadata,...patch}}})})
const unavailableNative = gunzipSync(fs.readFileSync(resolve(study, 'deepseek/runtime/runs/P08-C-001/phases/05-implement/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const changed520 = patch => ({ ...unavailable.row, providerError: JSON.stringify({error:{...JSON.parse(unavailable.row.providerError).error, ...patch}}) })
const native = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P06-A-001/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const emptyNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P06-B-001/phases/01-specification/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const truncated = fixture('qwen', 7, 'P09-C-001')
const truncatedNative = gunzipSync(fs.readFileSync(resolve(study, 'qwen/runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz'))).toString('utf8').trim().split('\n').map(JSON.parse).filter(e => ['error', 'turn.failed'].includes(e.type)).map(e => e.message || e.error?.message)
const checks = [
  ['observed Qwen truncated transport', knownFailure(truncated.row, truncated.body, truncatedNative), 'qwen-truncated-stream-cause-unknown'],
  ['truncated transport without native evidence', knownFailure(truncated.row, truncated.body), null],
  ['truncated transport different native text', knownFailure(truncated.row, truncated.body, ['stream disconnected before completion: different truncation']), null],
  ...[
    {model:'other'}, {provider:'other'}, {httpStatus:500}, {status:'client_aborted'}, {status:'finished'},
    {responseStatus:'completed'}, {responseStatus:'failed'}, {responseStatus:undefined},
    {sentUpstream:false}, {errorType:'OtherError'}, {retryAfter:'2'}, {bytes:0}, {bytes:undefined},
    {responseId:null}, {responseId:'other-id'},
  ].map((patch, index) => ['truncated transport rejected row mutation ' + index, knownFailure({...truncated.row,...patch}, truncated.body, truncatedNative), null]),
  ['truncated transport changed request model', knownFailure(truncated.row,{...truncated.body,model:'other'},truncatedNative), null],
  ['truncated transport fallback enabled', knownFailure(truncated.row,{...truncated.body,provider:{...truncated.body.provider,allow_fallbacks:true}},truncatedNative), null],
  ['truncated transport multiple providers', knownFailure(truncated.row,{...truncated.body,provider:{...truncated.body.provider,only:['siliconflow/fp8','other']}},truncatedNative), null],

  ['observed Qwen SSE JSON error',knownFailure(sseJson.row,sseJson.body,sseJsonNative),'qwen-sse-json-error-cause-unknown'],
  ['SSE JSON without native evidence',knownFailure(sseJson.row,sseJson.body),null],
  ['SSE JSON unobserved message',knownFailure(sseJson.row,sseJson.body,['stream disconnected before completion: JSON syntax error']),null],
  ['SSE JSON completed response',knownFailure({...sseJson.row,responseStatus:'completed'},sseJson.body,sseJsonNative),null],
  ['SSE JSON incomplete response',knownFailure({...sseJson.row,responseStatus:'incomplete'},sseJson.body,sseJsonNative),null],
  ['SSE JSON wrong provider',knownFailure({...sseJson.row,provider:'other'},sseJson.body,sseJsonNative),null],
  ['SSE JSON wrong row model',knownFailure({...sseJson.row,model:'other'},sseJson.body,sseJsonNative),null],
  ['SSE JSON wrong request model',knownFailure(sseJson.row,{...sseJson.body,model:'other'},sseJsonNative),null],
  ['SSE JSON fallback enabled',knownFailure(sseJson.row,{...sseJson.body,provider:{...sseJson.body.provider,allow_fallbacks:true}},sseJsonNative),null],
  ['SSE JSON multiple providers',knownFailure(sseJson.row,{...sseJson.body,provider:{...sseJson.body.provider,only:['siliconflow/fp8','other']}},sseJsonNative),null],
  ['SSE JSON changed HTTP status',knownFailure({...sseJson.row,httpStatus:500},sseJson.body,sseJsonNative),null],
  ['SSE JSON client-aborted request',knownFailure({...sseJson.row,status:'client_aborted'},sseJson.body,sseJsonNative),null],
  ['SSE JSON never sent upstream',knownFailure({...sseJson.row,sentUpstream:false},sseJson.body,sseJsonNative),null],

  ['observed Qwen Network connection lost',knownFailure(networkLost.row,networkLost.body,networkLostNative),'qwen-network-lost-cause-unknown'],
  ['Qwen network loss without native evidence',knownFailure(networkLost.row,networkLost.body),null],
  ['Qwen network loss unobserved message',knownFailure(networkLost.row,networkLost.body,['stream disconnected before completion: other network error']),null],
  ['Qwen network loss completed response',knownFailure({...networkLost.row,responseStatus:'completed'},networkLost.body,networkLostNative),null],
  ['Qwen network loss changed provider',knownFailure({...networkLost.row,provider:'other'},networkLost.body,networkLostNative),null],
  ['Qwen network loss changed request model',knownFailure(networkLost.row,{...networkLost.body,model:'other'},networkLostNative),null],
  ['Qwen network loss fallback enabled',knownFailure(networkLost.row,{...networkLost.body,provider:{...networkLost.body.provider,allow_fallbacks:true}},networkLostNative),null],
  ['Qwen network loss client aborted',knownFailure({...networkLost.row,status:'client_aborted'},networkLost.body,networkLostNative),null],
  ['observed Qwen Request failed Unknown error',knownFailure(requestFailed.row,requestFailed.body,requestFailedNative),'qwen-request-failed-cause-unknown'],
  ['Qwen request failure without native evidence',knownFailure(requestFailed.row,requestFailed.body),null],
  ['Qwen request failure unobserved message',knownFailure(requestFailed.row,requestFailed.body,['stream disconnected before completion: other unknown error']),null],
  ['Qwen request failure completed response',knownFailure({...requestFailed.row,responseStatus:'completed'},requestFailed.body,requestFailedNative),null],
  ['Qwen request failure changed provider',knownFailure({...requestFailed.row,provider:'other'},requestFailed.body,requestFailedNative),null],
  ['Qwen request failure changed request model',knownFailure(requestFailed.row,{...requestFailed.body,model:'other'},requestFailedNative),null],
  ['Qwen request failure fallback enabled',knownFailure(requestFailed.row,{...requestFailed.body,provider:{...requestFailed.body.provider,allow_fallbacks:true}},requestFailedNative),null],
  ['Qwen request failure client aborted',knownFailure({...requestFailed.row,status:'client_aborted'},requestFailed.body,requestFailedNative),null],
  ['observed exact Wafer shared-pool429',knownFailure(overloaded.row,overloaded.body,overloadedNative),'glm-wafer-shared-pool-overload'],
  ['Wafer429 without native evidence',knownFailure(overloaded.row,overloaded.body),null],
  ['Wafer429 account limit differs',knownFailure(overloadPatch({limit_source:'account'}),overloaded.body,overloadedNative),null],
  ['Wafer429 other error code',knownFailure(overloadPatch({provider_error_code:'quota_exhausted'}),overloaded.body,overloadedNative),null],
  ['Wafer429 changed provider name',knownFailure(overloadPatch({provider_name:'Other'}),overloaded.body,overloadedNative),null],
  ['Wafer429 unobserved retry interval',knownFailure({...overloaded.row,retryAfter:'60'},overloaded.body,overloadedNative),null],
  ['Wafer429 fallback enabled',knownFailure(overloaded.row,{...overloaded.body,provider:{...overloaded.body.provider,allow_fallbacks:true}},overloadedNative),null],
  ['Wafer429 changed model',knownFailure(overloaded.row,{...overloaded.body,model:'other'},overloadedNative),null],
  ['Wafer429 never sent upstream',knownFailure({...overloaded.row,sentUpstream:false},overloaded.body,overloadedNative),null],
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
