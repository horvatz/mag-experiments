import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { collectSpecs, sourceHashes } from './report-utils.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function run(script, args, cwd = root) {
  execFileSync(process.execPath, [resolve(root, 'node_modules', script), ...args], {
    cwd, stdio: 'inherit',
    env: { ...process.env, APP_UNDER_TEST: resolve(root, '.work/reference'), P01_REPORT_FILE: resolve(root, 'reports/reference-results.json'), P01_OUTPUT_DIR: resolve(root, 'test-results') },
  })
}
rmSync(resolve(root, 'reports/reference-summary.json'), { force: true })
execFileSync(process.execPath, [resolve(root, 'scripts/prepare-reference.mjs')], { cwd: root, stdio: 'inherit' })
run('typescript/bin/tsc', ['--noEmit'])
run('eslint/bin/eslint.js', ['.', '--ignore-pattern', '.vite/**'], resolve(root, '.work/reference'))
run('typescript/bin/tsc', ['--noEmit'], resolve(root, '.work/reference'))
run('vite/bin/vite.js', ['build'], resolve(root, '.work/reference'))
run('@playwright/test/cli.js', ['test'])
const report = JSON.parse(readFileSync(resolve(root, 'reports/reference-results.json'), 'utf8'))
const tests = collectSpecs(report.suites).flatMap((spec) => spec.tests.map((test) => ({
  title: spec.title, project: test.projectName, status: test.status,
})))
const baseline = JSON.parse(readFileSync(resolve(root, 'baseline.json'), 'utf8'))
const success = report.errors.length === 0 && tests.length === 68 && tests.every((test) => test.status === 'expected')
const summary = { date: new Date().toISOString(), baseline, sourceHashes: sourceHashes(root), node: process.version, success, total: tests.length, tests }
writeFileSync(resolve(root, 'reports/reference-summary.json'), JSON.stringify(summary, null, 2) + '\n')
if (!success) throw new Error('The reference run did not pass all 68 expected checks.')
