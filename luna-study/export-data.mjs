import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { digest, inventory, editable } from '../scripts/pilot-utils.mjs'
import { sourceHashes } from '../scripts/report-utils.mjs'
import { requirementScore } from '../scripts/main-design.mjs'
const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study, 'runtime'), out = resolve(study, 'analysis')
mkdirSync(out, { recursive: true })
const planned = JSON.parse(readFileSync(resolve(root, 'main-study/schedule.json')))
const frozen = sourceHashes(root), tests = [], requirements = [], phases = [], verified = []
const json = file => JSON.parse(readFileSync(file))
for (const run of planned.runs) {
  const folder = resolve(root, 'runs', run.id), receipt = resolve(folder, 'archive-complete.json')
  if (!existsSync(receipt)) continue
  const manifest = json(receipt), actual = inventory(folder); delete actual['archive-complete.json']
  assert.deepEqual(actual, manifest.files, 'Archive changed: ' + run.id)
  const summary = json(resolve(folder, 'evaluation-summary.json'))
  const execution = json(resolve(folder, 'execution.json'))
  const before = JSON.parse(gunzipSync(readFileSync(resolve(folder, 'manifest.json.gz'))))
  const final = JSON.parse(gunzipSync(readFileSync(resolve(folder, 'final-inventory.json.gz'))))
  assert.equal(summary.id, run.id); assert.equal(summary.model, 'gpt-6-luna'); assert.equal(summary.reasoningEffort, 'xhigh')
  assert.equal(before.cliVersion, 'codex-cli 0.158.0-alpha.2.1'); assert.equal(before.limitSeconds, 1200)
  assert.deepEqual(before.evaluatorSourceHashes, frozen); assert.deepEqual(summary.evaluatorSourceHashes, frozen)
  const submission = inventory(resolve(folder, 'submission'))
  assert.deepEqual(submission, Object.fromEntries(Object.entries(final).filter(([path]) => editable(path, run.procedure))))
  assert.equal(digest(JSON.stringify(submission)), summary.submissionSha256)
  const score = requirementScore(summary)
  for (const test of summary.tests) tests.push([run.id, run.task, run.procedure, run.repetition, test.project, test.title, test.status, test.errors.join('\n')])
  for (const r of score.requirements) requirements.push([run.id, run.task, run.procedure, run.repetition, r.id, Number(r.observed), Number(r.demonstrated)])
  if (execution.phases) for (const [index, phase] of execution.phases.entries()) phases.push([run.id, run.procedure, index + 1, phase.name, phase.role, phase.status, phase.elapsedSeconds, phase.threadId, phase.resumed, phase.allowedChanges])
  else phases.push([run.id, run.procedure, 1, 'single-session', 'agent', execution.status, execution.elapsedSeconds, execution.threadId, false, execution.allowedChanges])
  verified.push({ id: run.id, archiveSha256: digest(readFileSync(receipt)), testRecords: summary.tests.length, requirementRecords: score.requirements.length, submissionVerified: true })
}
const csv = x => x == null ? '' : '"' + String(x).replaceAll('"', '""') + '"'
function save(name, headers, rows) { writeFileSync(resolve(out, name + '.csv'), [headers, ...rows].map(row => row.map(csv).join(',')).join('\n') + '\n') }
save('test-data', ['id', 'task', 'procedure', 'repetition', 'project', 'title', 'status', 'errors'], tests)
save('requirement-data', ['id', 'task', 'procedure', 'repetition', 'requirement', 'observed', 'demonstrated'], requirements)
save('phase-data', ['id', 'procedure', 'position', 'phase', 'role', 'status', 'seconds', 'threadId', 'resumed', 'allowedChanges'], phases)
const result = { verifiedAt: new Date().toISOString(), collection: 'L/1.0', archived: verified.length, planned: 72, complete: verified.length === 72, passed: true, testRecords: tests.length, requirementRecords: requirements.length, phaseRecords: phases.length, archives: verified }
assert.equal(requirements.length, verified.length * 12)
writeFileSync(resolve(out, 'archive-verification.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ archived: result.archived, passed: result.passed, tests: tests.length, requirements: requirements.length, phases: phases.length }))
await import('./evidence-map.mjs')
await import('./failure-catalog.mjs')
await import('./phase-timing.mjs')
