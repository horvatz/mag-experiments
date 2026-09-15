import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { closeSync, cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSpecs, sourceHashes } from './report-utils.mjs'
import { digest, editable, inventory } from './pilot-utils.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2] || 'P01-A-001'
assert.match(id, /^P01-A-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const execution = JSON.parse(readFileSync(resolve(run, 'execution.json'), 'utf8'))
assert.notEqual(execution.status, 'running', 'Never evaluate or expose hidden tests during agent execution')
assert.ok(existsSync(resolve(run, 'submission/src')), 'Missing frozen submission')
assert.ok(!existsSync(resolve(run, 'evaluation-summary.json')), 'Do not overwrite an evaluation')
const manifest = JSON.parse(readFileSync(resolve(run, 'manifest.json'), 'utf8'))
assert.deepEqual(manifest.baseline, JSON.parse(readFileSync(resolve(root, 'baseline.json'), 'utf8')), 'Baseline changed since preparation')
const finalInventory = JSON.parse(readFileSync(resolve(run, 'final-inventory.json'), 'utf8'))
const expectedSubmission = Object.fromEntries(Object.entries(finalInventory).filter(([path]) => editable(path)))
assert.deepEqual(inventory(resolve(run, 'submission')), expectedSubmission, 'Frozen submission changed')
for (const entry of Object.values(expectedSubmission)) {
  assert.equal(entry.kind, 'file', 'Symlinks are not accepted in submitted code')
}
execFileSync(process.execPath, [resolve(root, 'scripts/prepare-reference.mjs')], { cwd: root, stdio: 'inherit' })
const candidate = resolve(run, 'candidate')
assert.ok(!existsSync(candidate), 'Candidate directory already exists')
cpSync(resolve(root, '.work/baseline'), candidate, { recursive: true })
rmSync(resolve(candidate, 'src'), { recursive: true })
for (const path of ['src', 'tests/agent', 'docs/agent']) cpSync(resolve(run, 'submission', path), resolve(candidate, path), { recursive: true })
// Preserve the public task files for agent-authored imports. Server, fixtures,
// shared types, dependencies and the actual evaluator remain researcher-owned.
for (const path of ['task', 'tests/development']) cpSync(resolve(run, 'app', path), resolve(candidate, path), { recursive: true })
const before = inventory(resolve(run, 'submission'))
const results = []
function check(name, executable, args, cwd = root) {
  const log = resolve(run, 'evaluation-' + name + '.log')
  const fd = openSync(log, 'wx')
  const started = performance.now()
  const result = spawnSync(executable, args, {
    cwd, timeout: 180_000, stdio: ['ignore', fd, fd],
    env: { ...process.env, CI: '1', APP_UNDER_TEST: candidate, P01_REPORT_FILE: resolve(run, 'evaluation-results.json'), P01_OUTPUT_DIR: resolve(run, 'evaluation-artifacts') },
  })
  closeSync(fd)
  const item = { name, exitCode: result.status, signal: result.signal, error: result.error?.message, elapsedSeconds: Number(((performance.now() - started) / 1000).toFixed(3)), passed: result.status === 0 }
  results.push(item)
  console.log(name + ': ' + (item.passed ? 'passed' : 'failed'))
}
const module = (name) => resolve(root, 'node_modules', name)
check('lint', process.execPath, [module('eslint/bin/eslint.js'), '.', '--ignore-pattern', '.vite/**'], candidate)
check('types', process.execPath, [module('typescript/bin/tsc'), '--noEmit'], candidate)
check('build', process.execPath, [module('vite/bin/vite.js'), 'build'], candidate)
check('tests', process.execPath, [module('@playwright/test/cli.js'), 'test'])
const raw = existsSync(resolve(run, 'evaluation-results.json')) ? JSON.parse(readFileSync(resolve(run, 'evaluation-results.json'), 'utf8')) : null
const tests = raw ? collectSpecs(raw.suites).flatMap((spec) => spec.tests.map((test) => ({
  title: spec.title, project: test.projectName, status: test.status,
  errors: test.results.flatMap((result) => result.errors || []).map((error) => (error.message || '').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 2400)),
}))) : []
const groups = {}
for (const test of tests) {
  const group = test.project.startsWith('evaluation-') ? 'holdout' : test.project.startsWith('development-') ? 'development' : 'regression'
  groups[group] ??= { passed: 0, total: 0 }
  groups[group].total++
  if (test.status === 'expected') groups[group].passed++
}
assert.deepEqual(inventory(resolve(run, 'submission')), before, 'Evaluation modified the frozen submission')
const summary = {
  id, evaluatedAt: new Date().toISOString(), baseline: manifest.baseline, procedure: manifest.procedure,
  model: manifest.model, reasoningEffort: manifest.reasoningEffort,
  executionStatus: execution.status, elapsedSeconds: execution.elapsedSeconds, usage: execution.usage,
  allowedChanges: execution.allowedChanges, checks: results, groups, tests,
  completeTestRun: tests.length === 68 && (raw?.errors.length ?? 1) === 0,
  allChecksPassed: execution.status === 'completed' && execution.allowedChanges && results.every((item) => item.passed) && tests.length === 68 && tests.every((test) => test.status === 'expected') && raw.errors.length === 0,
  evaluatorSourceHashes: sourceHashes(root), submissionSha256: digest(JSON.stringify(before)),
  limitations: ['One pilot run, not a comparison of A/B/C.', 'Mobile tests emulate a phone in Chromium.', 'Recorded subscription token usage is not a monetary cost.'],
}
writeFileSync(resolve(run, 'evaluation-summary.json'), JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify({ id, allChecksPassed: summary.allChecksPassed, groups }))
