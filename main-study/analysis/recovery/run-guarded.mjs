// Operational recovery wrapper, introduced after the 2026-09-25 authentication incident.
// Stages and browser lifecycle copied from frozen main-study.mjs; measured scripts unmodified.
// Only additions: connectivity gate before each new model and auth-aware stop after archive.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { closeSync, createWriteStream, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { probeService, serviceFailure } from './service-gate.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..'), study = resolve(root, 'main-study')
const scheduleFile = resolve(study, 'schedule.json')
const json = file => JSON.parse(readFileSync(file, 'utf8'))
const save = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
const verifyFreeze = () => execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'verify-freeze'], { cwd: root })
const status = () => execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'status'], { cwd: root, stdio: 'inherit' })
async function listening(port) {
  return new Promise(done => { const socket = connect({ host: '127.0.0.1', port }); const finish = result => { socket.destroy(); done(result) }; socket.once('connect', () => finish(true)); socket.once('error', () => finish(false)); socket.setTimeout(500, () => finish(false)) })
}
async function command(name, executable, args, options = {}) {
  const file = resolve(study, 'logs', name + '-' + Date.now() + '.log'), log = createWriteStream(file, { flags: 'wx' })
  // The researcher owns this destination. A sandboxed child receives pipes,
  // never a file descriptor that points outside its allowed filesystem.
  const started = Date.now(), child = spawn(executable, args, { cwd: root, ...options, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false })
  const result = await new Promise(accept => { child.once('error', error => accept({ code: null, error: error.message })); child.once('close', (code, signal) => accept({ code, signal })) })
  await new Promise(done => log.end(done))
  const record = { name, file, startedAt: new Date(started).toISOString(), elapsedSeconds: (Date.now() - started) / 1000, ...result }
  console.log(JSON.stringify(record))
  if (result.code !== 0) throw Error(`${name} failed; inspect ${file}`)
  return record
}
const script = (name, file, ...args) => command(name, process.execPath, [resolve(root, 'scripts', file), ...args])
async function withBrowser(id, callback) {
  assert.equal(await listening(9223), false, 'Another experimental browser is already running')
  const fd = openSync(resolve(study, 'logs', id + '-browser-' + Date.now() + '.log'), 'wx')
  const child = spawn(process.execPath, [resolve(root, 'scripts/pilot-browser.mjs'), id], { cwd: root, stdio: ['ignore', fd, fd] })
  const ended = new Promise(resolve => child.once('close', code => resolve(code)))
  try {
    let ready = false
    for (let i = 0; i < 100 && child.exitCode === null; i++) { if (await listening(9223)) { ready = true; break }; await new Promise(r => setTimeout(r, 100)) }
    assert.ok(ready, 'Experimental browser did not start')
    return await callback()
  } finally {
    child.kill('SIGTERM')
    const timer = setTimeout(() => child.kill('SIGKILL'), 10_000)
    await ended; clearTimeout(timer); closeSync(fd)
    assert.equal(await listening(9223), false, 'Browser did not release its port')
  }
}
async function run() {
  verifyFreeze()
  const lock = resolve(study, 'runner.lock'), fd = openSync(lock, 'wx'); writeFileSync(fd, String(process.pid)); closeSync(fd)
  try {
    for (const entry of json(scheduleFile).runs) {
      verifyFreeze()
      const id = entry.id, dir = resolve(root, '.work/pilots', id), archive = resolve(root, 'runs', id)
      if (existsSync(resolve(archive, 'evaluation-summary.json'))) { assert.equal(json(resolve(archive, 'evaluation-summary.json')).id, id); continue }
      save(resolve(study, 'active.json'), { id, stage: 'preparing', at: new Date().toISOString(), pid: process.pid })
      if (!existsSync(resolve(dir, 'manifest.json'))) { assert.ok(!existsSync(dir), 'Incomplete export needs inspection'); await script(id + '-prepare', 'prepare-pilot.mjs', id) }
      if (!existsSync(resolve(dir, 'execution.json'))) await withBrowser(id, async () => {
        await script(id + '-preflight', 'preflight-pilot.mjs', id)
        const probe = await probeService(json(resolve(dir, 'config.json')), json(resolve(dir, 'manifest.json')).cli, resolve(study, 'logs', id + '-service-probe-' + Date.now() + '.json'))
        assert.ok(probe.passed, 'Service probe failed; measured model was NOT started. Inspect sanitized probe result.')
        save(resolve(study, 'active.json'), { id, stage: 'model', at: new Date().toISOString(), pid: process.pid })
        await script(id + '-model', 'run-pilot.mjs', id)
      })
      const execution = json(resolve(dir, 'execution.json')); assert.notEqual(execution.status, 'running', 'Interrupted runner needs inspection before resuming')
      save(resolve(study, 'active.json'), { id, stage: 'evaluating', at: new Date().toISOString(), pid: process.pid })
      if (!existsSync(resolve(dir, 'usage-observation.json'))) await script(id + '-usage', 'reconcile-pilot-usage.mjs', id)
      if (!existsSync(resolve(dir, 'evaluation-summary.json'))) await script(id + '-evaluate', 'evaluate-pilot.mjs', id)
      await script(id + '-archive', 'archive-pilot.mjs', id)
      await script(id + '-analysis', 'analyze-main.mjs')
      status()
      const text = existsSync(resolve(dir, 'events.jsonl')) ? readFileSync(resolve(dir, 'events.jsonl'), 'utf8') : ''
      const phaseErrors = existsSync(resolve(dir, 'phases')) ? readdirSync(resolve(dir, 'phases')).map(name => resolve(dir, 'phases', name, 'events.jsonl')).filter(existsSync).map(file => readFileSync(file, 'utf8')).join('\n') : ''
      if (serviceFailure(text + '\n' + phaseErrors)) {
        save(resolve(study, 'active.json'), { id, stage: 'service_unavailable', at: new Date().toISOString(), note: 'All started evidence preserved. Resume at next unused ID after service availability returns.' }); return
      }
    }
    save(resolve(study, 'active.json'), { stage: 'all_runs_archived', at: new Date().toISOString() }); status()
  } finally { rmSync(lock) }
}
await run()
