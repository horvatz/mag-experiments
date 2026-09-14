import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mutations } from '../evaluation/P01/mutations.mjs'
import { collectSpecs, sourceHashes } from './report-utils.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const evidence = JSON.parse(readFileSync(resolve(root, 'reports/reference-summary.json'), 'utf8'))
if (!evidence.success || JSON.stringify(evidence.sourceHashes) !== JSON.stringify(sourceHashes(root))) {
  throw new Error('Run a successful npm run test:reference for these exact sources before mutation checks.')
}
execFileSync(process.execPath, [resolve(root, 'scripts/prepare-reference.mjs')], { cwd: root, stdio: 'inherit' })
const reference = resolve(root, '.work/reference')
const results = []
for (const mutation of mutations) {
  const candidate = resolve(root, '.work/mutations', mutation.id)
  rmSync(candidate, { recursive: true, force: true })
  cpSync(reference, candidate, { recursive: true, filter: (source) => !['node_modules', '.vite', 'dist'].some((name) => source.split('/').includes(name)) })
  for (const edit of mutation.edits) {
    const file = resolve(candidate, edit.file)
    const code = readFileSync(file, 'utf8')
    if (code.split(edit.from).length !== 2) throw new Error(`Mutation ${mutation.id} must replace exactly one occurrence in ${edit.file}.`)
    writeFileSync(file, code.replace(edit.from, edit.to))
  }
  const compilation = spawnSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], { cwd: candidate, encoding: 'utf8' })
  if (compilation.status !== 0) throw new Error(`Mutation ${mutation.id} does not compile: ${compilation.stdout}\n${compilation.stderr}`)
  const reportFile = resolve(root, '.work/mutation-reports', `${mutation.id}.json`)
  mkdirSync(dirname(reportFile), { recursive: true })
  const run = spawnSync(process.execPath, [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', '--project=evaluation-desktop', '--grep', `${mutation.scenario}:`], {
    cwd: root, encoding: 'utf8', timeout: 60_000,
    env: { ...process.env, APP_UNDER_TEST: candidate, P01_REPORT_FILE: reportFile, P01_OUTPUT_DIR: resolve(root, '.work/mutation-traces', mutation.id) },
  })
  const report = JSON.parse(readFileSync(reportFile, 'utf8'))
  const specs = collectSpecs(report.suites)
  const testResults = specs.flatMap((spec) => spec.tests.flatMap((test) => test.results))
  const failures = testResults.flatMap((result) => result.errors || [])
  const assertion = failures.some((error) => error.message?.includes(mutation.assertion))
  const detected = run.status === 1 && !run.signal && report.errors.length === 0 && specs.length === 1
    && specs[0].title.startsWith(`${mutation.scenario}:`) && testResults.length === 1
    && testResults[0].status === 'failed' && assertion
  const failure = failures[0]?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 12).join('\n')
  const record = { id: mutation.id, name: mutation.name, scenario: mutation.scenario, typecheck: 'passed', detected, assertion: mutation.assertion, failure }
  results.push(record)
  console.log(`${mutation.id}: ${detected ? 'detected' : 'UNCONFIRMED'} by ${mutation.scenario} — ${mutation.name}`)
  if (!detected) console.log(run.stdout, run.stderr)
}
const summary = { date: new Date().toISOString(), baseline: evidence.baseline, sourceHashes: evidence.sourceHashes, referenceChecks: evidence.total, mutations: results, detected: results.filter((item) => item.detected).length, total: results.length }
writeFileSync(resolve(root, 'reports/mutation-summary.json'), JSON.stringify(summary, null, 2) + '\n')
if (summary.detected !== summary.total) process.exitCode = 1
