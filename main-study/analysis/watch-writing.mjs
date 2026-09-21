// A bounded companion of the currently running study, not a scheduled job.
import { existsSync, readFileSync, readdirSync, statSync, appendFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const node = '/Users/zan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
const python = resolve(root, 'main-study/analysis/artifacts/plotenv/bin/python')
const log = resolve(root, 'main-study/analysis/artifacts/qa/refresh.log')
const lock = resolve(root, 'main-study/runner.lock')
const resultFile = resolve(root, 'main-study/analysis/results.json')
let previous = ''
const run = (binary, args, env = process.env) => execFileSync(binary, args, { cwd: root, env, encoding: 'utf8', timeout: 120000, maxBuffer: 2*1024*1024 })
while (true) {
  try {
    const data = JSON.parse(readFileSync(resultFile, 'utf8'))
    const reviews = resolve(root, 'main-study/analysis/reviews')
    const signature = data.generatedAt + readdirSync(reviews).sort().map(f => `${f}:${statSync(resolve(reviews, f)).mtimeMs}`).join('|')
    if (signature !== previous) {
      run(process.execPath, ['main-study/analysis/prepare-writing-data.mjs'])
      run(node, ['main-study/analysis/artifacts/workbook.mjs'])
      run(python, ['main-study/analysis/artifacts/plots.py'], { ...process.env, MPLCONFIGDIR: resolve(root, 'main-study/analysis/artifacts/qa/matplotlib') })
      appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), archived: data.archived, sourceGeneratedAt: data.generatedAt, status: 'refreshed' }) + '\n')
      console.log(JSON.stringify({ archived: data.archived, status: 'writing-data-refreshed' }))
      previous = signature
    }
  } catch (error) {
    appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), status: 'error', message: error.message }) + '\n')
    console.error(error.message)
    process.exitCode = 1
    break
  }
  if (!existsSync(lock)) { console.log('Study queue ended; writing-data companion finished.'); break }
  await new Promise(resolve => setTimeout(resolve, 30000))
}
