// Researcher resource cleanup after immutable archival; never touches live runs.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const recovery = resolve(study, 'analysis/recovery')
fs.mkdirSync(recovery, { recursive: true })
const lock = resolve(recovery, 'server-cleanup.lock')
const fd = fs.openSync(lock, 'wx'); fs.writeFileSync(fd, String(process.pid)); fs.closeSync(fd)
const log = resolve(recovery, 'server-cleanup.jsonl')
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const shell = (binary, args) => { try { return execFileSync(binary, args, { encoding: 'utf8', timeout: 5000 }).trim() } catch { return '' } }
const cwd = pid => shell('/usr/sbin/lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn']).split('\n').find(s => s.startsWith('n'))?.slice(1)
const command = pid => shell('/bin/ps', ['-p', String(pid), '-o', 'args='])
const save = value => { const row = { at: new Date().toISOString(), ...value }; fs.appendFileSync(log, JSON.stringify(row) + '\n'); console.log(JSON.stringify(row)) }
const delay = ms => new Promise(done => setTimeout(done, ms))
let stopping = false
process.on('SIGTERM', () => { stopping = true })
process.on('SIGINT', () => { stopping = true })
async function cleanup() {
  const pids = new Set([5174, 3102].flatMap(port => shell('/usr/sbin/lsof', ['-nP', '-iTCP:' + port, '-sTCP:LISTEN', '-Fp']).split('\n').filter(s => /^p\d+$/.test(s)).map(s => Number(s.slice(1)))))
  for (const pid of pids) {
    const app = cwd(pid), args = command(pid)
    if (!app?.startsWith(study + '/') || args !== 'node server/dev.ts') continue
    const relative = app.slice(study.length + 1)
    const match = relative.match(/^(glm|deepseek|qwen)\/runtime\/\.work\/pilots\/(P\d{2}-[ABC]-\d{3})\/app$/)
    if (!match) continue
    const [, slug, id] = match, run = resolve(study, slug, 'runtime/runs', id)
    if (!fs.existsSync(resolve(run, 'archive-complete.json'))) continue
    assert.equal(json(resolve(run, 'archive-complete.json')).id, id)
    assert.notEqual(json(resolve(run, 'execution.json')).status, 'running')
    // Re-check identity immediately before signalling; no global process groups.
    if (cwd(pid) !== app || command(pid) !== args) continue
    save({ action: 'terminate_archived_test_server', pid, slug, id, app, command: args, signal: 'SIGTERM', measuredExecutionAlreadyArchived: true })
    try { process.kill(pid, 'SIGTERM') } catch (error) { save({ action: 'signal_failed', pid, error: error.code }); continue }
    await delay(1000)
    save({ action: 'termination_observation', pid, slug, id, stillSameProcess: cwd(pid) === app && command(pid) === args })
  }
}
try {
  let count = -1
  while (!stopping) {
    const archived = json(resolve(study, 'status.json')).archived
    if (archived !== count) { await cleanup(); count = archived }
    if (process.argv.includes('--once') || archived === 216) break
    await delay(500)
  }
} finally { fs.rmSync(lock) }
