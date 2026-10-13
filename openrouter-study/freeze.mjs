import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
import { sourceHashes } from '../scripts/report-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url)), original = resolve(study, '..')
assert.ok(!existsSync(resolve(study, 'frozen-inputs.json')), 'Never replace the OpenRouter freeze')
const plan = JSON.parse(readFileSync(resolve(study, 'models.json')))
const protocol = JSON.parse(readFileSync(resolve(study, 'protocol.json')))
assert.equal(protocol.status, 'ready to freeze', 'Audit qualification outcomes and operator before freezing')
const originalSources = sourceHashes(original)
const allowed = ['scripts/prepare-pilot.mjs', 'scripts/preflight-pilot.mjs', 'scripts/pilot-utils.mjs', 'scripts/run-pilot.mjs', 'scripts/run-pilot-b.mjs', 'scripts/run-pilot-c.mjs', 'scripts/archive-pilot.mjs', 'scripts/main-design.mjs', 'scripts/main-study.mjs'].sort()
const sources = {}
const pending = []
function stage(path, value, exclusive = false) {
  if (exclusive) assert.ok(!existsSync(path), 'Never replace a freeze: ' + path)
  const content = JSON.stringify(value, null, 2) + '\n'
  pending.push({ path, content, exclusive })
  return digest(Buffer.from(content))
}
for (const selected of plan.models) {
  const collection = resolve(study, selected.slug), root = resolve(collection, 'runtime')
  const setup = JSON.parse(readFileSync(resolve(collection, 'setup.json')))
  assert.deepEqual(JSON.parse(readFileSync(resolve(root, 'main-study/schedule.json'))).runs, JSON.parse(readFileSync(resolve(original, 'main-study/schedule.json'))).runs, 'Keep the original predeclared 72-run ordering')
  const copied = sourceHashes(root)
  assert.deepEqual(Object.keys(copied), Object.keys(originalSources))
  const differences = Object.keys(copied).filter(file => copied[file] !== originalSources[file]).sort()
  assert.deepEqual(differences, allowed, 'Unexpected task, evaluator, workflow or prompt change')
  const technical = JSON.parse(readFileSync(resolve(root, 'main-study/technical-verification.json'))); assert.ok(technical.passed)
  const hashes = { ...copied }
  for (const file of ['docs/main-protocol.md', 'docs/main-rubric.md', 'docs/main-experiment-plan.md', 'main-study/schedule.json', 'package.json', 'tsconfig.json']) hashes[file] = digest(readFileSync(resolve(root, file)))
  assert.deepEqual(technical.sources, Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))), 'Technical verification must cover the final inputs')
  const transportPath = 'qualification/' + selected.transportQualification + '/result.json'
  const transport = JSON.parse(readFileSync(resolve(collection, transportPath))); assert.ok(transport.passed)
  assert.equal(transport.model, selected.id); assert.equal(transport.provider, selected.provider)
  const workflowAudit = JSON.parse(readFileSync(resolve(collection, 'qualification/audit.json')))
  assert.ok(workflowAudit.transportQualified && workflowAudit.startedMeasurements === 0 && workflowAudit.unresolvedInfrastructureFaults.length === 0)
  const evidence = { 'main-study/technical-verification.json': digest(readFileSync(resolve(root, 'main-study/technical-verification.json'))) }
  for (let n = 3; n <= 10; n++) for (const kind of ['reference', 'mutation']) {
    const file = `reports/P${String(n).padStart(2, '0')}-${kind}-summary.json`, report = JSON.parse(readFileSync(resolve(root, file)))
    assert.ok(kind === 'reference' ? report.success && report.total === 70 : report.sourceUnchanged && report.detected === 6 && report.total === 6)
    for (const [path, hash] of Object.entries(report.sourceHashes)) assert.equal(hashes[path], hash, 'Stale reference/control: ' + path)
    evidence[file] = digest(readFileSync(resolve(root, file)))
  }
  const equivalence = { at: new Date().toISOString(), collection: selected.collection, passed: true,
    exactMatchFiles: Object.keys(copied).filter(file => copied[file] === originalSources[file]),
    adaptations: differences.map(path => ({ path, original: originalSources[path], adapted: copied[path] })),
    note: 'Task text, baseline, public and private tests, references, workflow prompts and phase/total time budgets match M/1.0 exactly.' }
  sources[selected.slug + '/source-equivalence.json'] = stage(resolve(collection, 'source-equivalence.json'), equivalence)
  sources[selected.slug + '/runtime/main-study/frozen-inputs.json'] = stage(resolve(root, 'main-study/frozen-inputs.json'), { version: selected.collection, frozenAt: new Date().toISOString(), sources: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))), evidence, plannedRuns: 72 }, true)
  for (const path of ['setup.json', 'qualification/audit.json', transportPath]) sources[selected.slug + '/' + path] = digest(readFileSync(resolve(collection, path)))
}
for (const file of ['models.json', 'protocol.json', 'budget.json', 'relay.mjs', 'credentials.mjs', 'costs.mjs', 'run.mjs', 'verify.mjs', 'analyze.mjs', 'operator-utils.mjs', 'qualification/secret-isolation.json', 'qualification/model-catalog.json', 'qualification/glm-endpoints.json', 'qualification/deepseek-endpoints.json', 'qualification/qwen-endpoints.json', '../main-study/analysis/reporting-results.mjs', '../main-study/analysis/process-summary.mjs']) sources[file] = digest(readFileSync(resolve(study, file)))
stage(resolve(study, 'frozen-inputs.json'), { version: 'O/1.0', frozenAt: new Date().toISOString(), plannedRuns: 216, sources }, true)
// Validate every collection and dependency before creating any freeze.
for (const { path, content, exclusive } of pending) writeFileSync(path, content, exclusive ? { flag: 'wx' } : undefined)
console.log('Frozen the approved 216-run OpenRouter study before the first measured model call.')
