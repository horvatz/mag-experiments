import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectSpecs } from './report-utils.mjs'
import { mutations } from '../evaluation/P02/mutations.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const work = resolve(root, '.work/P02')
const reference = resolve(work, 'reference')
const baseline = JSON.parse(readFileSync(resolve(root, 'tasks/P02/baseline.json'), 'utf8'))
const summaryFile = resolve(root, 'reports/P02-reference-summary.json')

function hashes() {
  const result = {}
  function visit(file) {
    if (file.isDirectory) {
      for (const item of readdirSync(file.path, { withFileTypes: true })) visit({ path: resolve(file.path, item.name), isDirectory: item.isDirectory() })
    } else result[relative(root, file.path)] = createHash('sha256').update(readFileSync(file.path)).digest('hex')
  }
  for (const path of ['tasks/P02', 'evaluation/P02', 'reference/P02', 'support']) visit({ path: resolve(root, path), isDirectory: true })
  for (const path of ['package.json', 'package-lock.json', 'tsconfig.json', 'playwright.p02.config.ts', 'scripts/p02.mjs', 'scripts/start-p02.mjs', 'scripts/start-app.mjs', 'scripts/report-utils.mjs', 'docs/P02-reference-specification.md']) visit({ path: resolve(root, path) })
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)))
}

function prepare() {
  const source = resolve(process.env.MAG_APP_REPOSITORY || resolve(root, '../aplikacija'))
  execFileSync('git', ['cat-file', '-e', `${baseline.commit}^{commit}`], { cwd: source })
  mkdirSync(work, { recursive: true })
  const archive = resolve(work, 'baseline.tar')
  execFileSync('git', ['archive', '--format=tar', '--output', archive, baseline.commit], { cwd: source })
  for (const folder of ['baseline', 'reference']) {
    const destination = resolve(work, folder)
    rmSync(destination, { recursive: true, force: true })
    mkdirSync(destination, { recursive: true })
    execFileSync('tar', ['-xf', archive, '-C', destination])
  }
  cpSync(resolve(root, 'reference/P02/overlay'), reference, { recursive: true })
  rmSync(archive)
  console.log(`Prepared separate P02 baseline and reference from ${baseline.commit}.`)
}

function run(tool, args, cwd = root) {
  execFileSync(process.execPath, [resolve(root, 'node_modules', tool), ...args], {
    cwd, stdio: 'inherit', env: { ...process.env, APP_UNDER_TEST: reference },
  })
}

function verify() {
  mkdirSync(resolve(root, 'reports'), { recursive: true })
  rmSync(summaryFile, { force: true })
  rmSync(resolve(root, 'reports/P02-mutation-summary.json'), { force: true })
  prepare()
  const sourceHashes = hashes()
  run('typescript/bin/tsc', ['--noEmit'])
  run('eslint/bin/eslint.js', ['.', '--ignore-pattern', '.vite/**'], reference)
  run('typescript/bin/tsc', ['--noEmit'], reference)
  run('vite/bin/vite.js', ['build'], reference)
  run('@playwright/test/cli.js', ['test', '--config=playwright.p02.config.ts'])
  const report = JSON.parse(readFileSync(resolve(root, 'reports/P02-reference-results.json'), 'utf8'))
  const tests = collectSpecs(report.suites).flatMap((spec) => spec.tests.map((test) => ({ title: spec.title, project: test.projectName, status: test.status })))
  const expected = { 'regression-api': 14, 'regression-desktop': 12, 'regression-mobile': 12, 'development-desktop': 4, 'development-mobile': 4, 'evaluation-desktop': 13, 'evaluation-mobile': 13 }
  const counts = Object.fromEntries(Object.keys(expected).map((name) => [name, tests.filter((test) => test.project === name).length]))
  const success = report.errors.length === 0 && tests.length === 72 && tests.every((test) => test.status === 'expected')
    && JSON.stringify(expected) === JSON.stringify(counts) && JSON.stringify(sourceHashes) === JSON.stringify(hashes())
  writeFileSync(summaryFile, JSON.stringify({ date: new Date().toISOString(), baseline, sourceHashes, node: process.version, success, total: tests.length, counts, tests }, null, 2) + '\n')
  if (!success) throw new Error('P02 must pass all 72 checks in the expected projects on unchanged sources.')
}

function checkMutations() {
  const evidence = JSON.parse(readFileSync(summaryFile, 'utf8'))
  if (!evidence.success || JSON.stringify(evidence.sourceHashes) !== JSON.stringify(hashes())) throw new Error('Run npm run test:p02 successfully on these exact sources first.')
  prepare()
  const results = []
  for (const mutation of mutations) {
    const candidate = resolve(work, 'mutations', mutation.id)
    rmSync(candidate, { recursive: true, force: true })
    cpSync(reference, candidate, { recursive: true })
    for (const edit of mutation.edits) {
      const path = resolve(candidate, edit.file)
      const code = readFileSync(path, 'utf8')
      if (code.split(edit.from).length !== 2) throw new Error(`${mutation.id}: expected exactly one match in ${edit.file}`)
      writeFileSync(path, code.replace(edit.from, edit.to))
    }
    const compilation = spawnSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], { cwd: candidate, encoding: 'utf8' })
    if (compilation.status !== 0) throw new Error(`${mutation.id}: mutant must compile\n${compilation.stdout}\n${compilation.stderr}`)
    const reportFile = resolve(work, 'mutation-reports', `${mutation.id}.json`)
    mkdirSync(dirname(reportFile), { recursive: true })
    rmSync(reportFile, { force: true })
    const execution = spawnSync(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config=playwright.p02.config.ts', '--project=evaluation-desktop', '--grep', `${mutation.scenario}:`], {
      cwd: root, encoding: 'utf8', timeout: 60_000,
      env: { ...process.env, APP_UNDER_TEST: candidate, P02_REPORT_FILE: reportFile, P02_OUTPUT_DIR: resolve(work, 'mutation-traces', mutation.id) },
    })
    const report = JSON.parse(readFileSync(reportFile, 'utf8'))
    const specs = collectSpecs(report.suites)
    const attempts = specs.flatMap((spec) => spec.tests.flatMap((test) => test.results))
    const failures = attempts.flatMap((attempt) => attempt.errors || [])
    const detected = execution.status === 1 && !execution.signal && report.errors.length === 0 && specs.length === 1
      && specs[0].title.startsWith(`${mutation.scenario}:`) && attempts.length === 1 && attempts[0].status === 'failed'
      && failures.some((error) => error.message?.includes(mutation.assertion))
    const failure = failures[0]?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 12).join('\n')
    results.push({ id: mutation.id, name: mutation.name, scenario: mutation.scenario, typecheck: 'passed', detected, assertion: mutation.assertion, failure })
    console.log(`${mutation.id}: ${detected ? 'detected' : 'UNCONFIRMED'} by ${mutation.scenario} — ${mutation.name}`)
    if (!detected) console.log(execution.stdout, execution.stderr)
  }
  const sourceUnchanged = JSON.stringify(evidence.sourceHashes) === JSON.stringify(hashes())
  const summary = { date: new Date().toISOString(), baseline, sourceHashes: evidence.sourceHashes, referenceChecks: evidence.total, sourceUnchanged, mutations: results, detected: results.filter((result) => result.detected).length, total: results.length }
  writeFileSync(resolve(root, 'reports/P02-mutation-summary.json'), JSON.stringify(summary, null, 2) + '\n')
  if (summary.detected !== summary.total || !sourceUnchanged) process.exitCode = 1
}

switch (process.argv[2]) {
  case 'prepare': prepare(); break
  case 'verify': verify(); break
  case 'mutations': checkMutations(); break
  default: throw new Error('Choose prepare, verify, or mutations.')
}
