import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
import { sourceHashes } from '../scripts/report-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study, 'runtime')
assert.ok(!existsSync(resolve(study, 'frozen-inputs.json')), 'Never replace a frozen supplemental protocol')
assert.ok(JSON.parse(readFileSync(resolve(study, 'qualification/completed.json'))).passed)
const original = sourceHashes(resolve(study, '..')), copied = sourceHashes(root)
const adaptations = ['scripts/prepare-pilot.mjs', 'scripts/preflight-pilot.mjs', 'scripts/main-design.mjs', 'scripts/main-study.mjs']
assert.deepEqual(Object.keys(copied), Object.keys(original))
const differences = Object.keys(original).filter(p => original[p] !== copied[p])
assert.deepEqual(differences.sort(), adaptations.sort(), 'Unexpected differences in task, evaluator, prompt or workflow sources')
const equivalence = { at: new Date().toISOString(), passed: true, originalCollection: 'M/1.0', collection: 'L/1.0',
  exactMatchFiles: Object.keys(original).filter(p => original[p] === copied[p]),
  adaptations: differences.map(path => ({ path, original: original[path], luna: copied[path] })),
  note: 'Only preparation model/CLI, additional preflight paths, collection version labels and qualification evidence IDs differ. Tasks, tests, references, measured runners, workflow prompts and budgets are byte-identical.' }
writeFileSync(resolve(study, 'source-equivalence.json'), JSON.stringify(equivalence, null, 2) + '\n')
execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'freeze'], { cwd: root, stdio: 'inherit' })
const paths = ['protocol.md', 'setup.json', 'source-equivalence.json', 'run.mjs', 'verify.mjs', 'analyze.mjs', 'compare.mjs', 'runtime/main-study/frozen-inputs.json', '../main-study/analysis/recovery/service-gate.mjs', '../main-study/analysis/reporting-results.mjs', '../main-study/analysis/process-summary.mjs']
const sources = Object.fromEntries(paths.map(path => [path, digest(readFileSync(resolve(study, path)))]))
writeFileSync(resolve(study, 'frozen-inputs.json'), JSON.stringify({ collection: 'L/1.0', frozenAt: new Date().toISOString(), plannedRuns: 72, sources }, null, 2) + '\n')
console.log('Supplemental model, protocol, schedule and operator frozen before the first measurement.')
