import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSpecs, sourceHashes } from './report-utils.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const task = process.argv[3]
if (!task || !/^P(?:0[3-9]|10)$/.test(task)) throw Error('Usage: main.mjs prepare|static|verify|mutations P03..P10')
const work = resolve(root, '.work', task), reference = resolve(work, 'reference')
const baseline = JSON.parse(readFileSync(resolve(root, 'tasks', task, 'baseline.json'), 'utf8'))
const summaryFile = resolve(root, `reports/${task}-reference-summary.json`)
const env = { ...process.env, MAG_TASK: task, APP_UNDER_TEST: reference }
function referenceHashes() {
  const files = ['baseline.json', 'package-lock.json', 'playwright.main.config.ts', 'scripts/main.mjs', 'scripts/start-main.mjs', 'scripts/start-app.mjs', 'scripts/report-utils.mjs']
  return Object.fromEntries(Object.entries(sourceHashes(root)).filter(([path]) => files.includes(path) || [`tasks/${task}/`, `evaluation/${task}/`, `reference/${task}/`, 'support/'].some(prefix => path.startsWith(prefix))))
}
function prepare() {
  const source = resolve(root, '../aplikacija'), archive = resolve(work, 'baseline.tar')
  mkdirSync(work, { recursive: true })
  execFileSync('git', ['archive', '--format=tar', '--output', archive, baseline.commit], { cwd: source })
  for (const folder of ['baseline', 'reference']) {
    const destination = resolve(work, folder)
    rmSync(destination, { recursive: true, force: true }); mkdirSync(destination, { recursive: true })
    execFileSync('tar', ['-xf', archive, '-C', destination])
  }
  cpSync(resolve(root, 'reference', task, 'overlay'), reference, { recursive: true }); rmSync(archive)
}
function run(tool, args, cwd = root) { execFileSync(process.execPath, [resolve(root, 'node_modules', tool), ...args], { cwd, stdio: 'inherit', env }) }
function staticChecks() { run('eslint/bin/eslint.js', ['.', '--ignore-pattern', '.vite/**'], reference); run('typescript/bin/tsc', ['--noEmit'], reference); run('vite/bin/vite.js', ['build'], reference) }
function verify() {
  prepare(); const hashes = referenceHashes(); staticChecks()
  mkdirSync(resolve(root, 'reports'), { recursive: true }); rmSync(summaryFile, { force: true })
  const execution = spawnSync(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config=playwright.main.config.ts'], { cwd: root, stdio: 'inherit', env })
  const report = JSON.parse(readFileSync(resolve(root, `reports/${task}-reference-results.json`), 'utf8'))
  const tests = collectSpecs(report.suites).flatMap(spec => spec.tests.map(test => ({ title: spec.title, project: test.projectName, status: test.status })))
  const expected = { 'regression-api': 14, 'regression-desktop': 12, 'regression-mobile': 12, 'development-desktop': 4, 'development-mobile': 4, 'evaluation-desktop': 12, 'evaluation-mobile': 12 }
  const counts = Object.fromEntries(Object.keys(expected).map(name => [name, tests.filter(test => test.project === name).length]))
  const success = execution.status === 0 && report.errors.length === 0 && tests.length === 70 && tests.every(test => test.status === 'expected') && JSON.stringify(counts) === JSON.stringify(expected) && JSON.stringify(hashes) === JSON.stringify(referenceHashes())
  writeFileSync(summaryFile, JSON.stringify({ date: new Date().toISOString(), task, baseline, sourceHashes: hashes, node: process.version, success, total: tests.length, counts, tests }, null, 2) + '\n')
  if (!success) throw Error(`${task}: reference checks failed`)
}
async function mutations() {
  const evidence = JSON.parse(readFileSync(summaryFile, 'utf8'))
  if (!evidence.success || JSON.stringify(evidence.sourceHashes) !== JSON.stringify(referenceHashes())) throw Error('First verify these exact sources')
  const { mutations: cases } = await import(`../evaluation/${task}/mutations.mjs`)
  const results = []
  for (const mutation of cases) {
    const candidate = resolve(work, 'mutations', mutation.id); rmSync(candidate, { recursive: true, force: true }); cpSync(reference, candidate, { recursive: true })
    for (const edit of mutation.edits) { const path = resolve(candidate, edit.file), code = readFileSync(path, 'utf8'); if (code.split(edit.from).length !== 2) throw Error(`${mutation.id}: edit not unique`); writeFileSync(path, code.replace(edit.from, edit.to)) }
    const compile = spawnSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], { cwd: candidate, encoding: 'utf8' })
    if (compile.status !== 0) throw Error(`${mutation.id}: mutant must compile\n${compile.stdout}\n${compile.stderr}`)
    const reportFile = resolve(work, 'mutation-reports', `${mutation.id}.json`); mkdirSync(dirname(reportFile), { recursive: true }); rmSync(reportFile, { force: true })
    const execution = spawnSync(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config=playwright.main.config.ts', '--project=evaluation-desktop', '--grep', `${mutation.scenario}:`], { cwd: root, encoding: 'utf8', timeout: 60_000, env: { ...env, APP_UNDER_TEST: candidate, MAIN_REPORT_FILE: reportFile, MAIN_OUTPUT_DIR: resolve(work, 'mutation-traces', mutation.id) } })
    const report = JSON.parse(readFileSync(reportFile, 'utf8')), specs = collectSpecs(report.suites), attempts = specs.flatMap(spec => spec.tests.flatMap(test => test.results)), failures = attempts.flatMap(attempt => attempt.errors || [])
    const detected = execution.status === 1 && !execution.signal && report.errors.length === 0 && specs.length === 1 && specs[0].title.startsWith(`${mutation.scenario}:`) && attempts.length === 1 && attempts[0].status === 'failed' && failures.some(error => error.message?.includes(mutation.assertion))
    results.push({ id: mutation.id, name: mutation.name, scenario: mutation.scenario, typecheck: 'passed', detected, assertion: mutation.assertion, failure: failures[0]?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 14).join('\n') })
    console.log(`${task}/${mutation.id}: ${detected ? 'detected' : 'UNCONFIRMED'} by ${mutation.scenario}`)
    if (!detected) console.log(execution.stdout, execution.stderr)
  }
  const sourceUnchanged = JSON.stringify(evidence.sourceHashes) === JSON.stringify(referenceHashes())
  const summary = { date: new Date().toISOString(), task, baseline, sourceHashes: evidence.sourceHashes, referenceChecks: evidence.total, sourceUnchanged, mutations: results, detected: results.filter(result => result.detected).length, total: results.length }
  writeFileSync(resolve(root, `reports/${task}-mutation-summary.json`), JSON.stringify(summary, null, 2) + '\n')
  if (summary.detected !== summary.total || !sourceUnchanged) process.exitCode = 1
}
switch (process.argv[2]) { case 'prepare': prepare(); break; case 'static': prepare(); staticChecks(); break; case 'verify': verify(); break; case 'mutations': await mutations(); break; default: throw Error('Unknown command') }
