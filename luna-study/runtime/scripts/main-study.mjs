import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { closeSync, cpSync, createWriteStream, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceHashes } from './report-utils.mjs'
import { digest, clientEnvironment, configArguments } from './pilot-utils.mjs'
import { schedule, serviceLimitInEvents } from './main-design.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), study = resolve(root, 'main-study')
const action = process.argv[2], scheduleFile = resolve(study, 'schedule.json'), freezeFile = resolve(study, 'frozen-inputs.json')
mkdirSync(study, { recursive: true }); mkdirSync(resolve(study, 'logs'), { recursive: true })
const json = file => JSON.parse(readFileSync(file, 'utf8'))
const save = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
function freezeHashes() {
  const hashes = sourceHashes(root)
  for (const file of ['docs/main-protocol.md', 'docs/main-rubric.md', 'docs/main-experiment-plan.md', 'main-study/schedule.json', 'package.json', 'tsconfig.json']) hashes[file] = digest(readFileSync(resolve(root, file)))
  return Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)))
}
function verifyFreeze() { assert.ok(existsSync(freezeFile), 'Freeze the study first'); assert.deepEqual(freezeHashes(), json(freezeFile).sources, 'Frozen study inputs changed') }
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
async function technical() {
  assert.ok(!existsSync(freezeFile), 'Technical qualification is before study freeze')
  const records = []
  const suffix = process.argv[3] || '901'; assert.match(suffix, /^9\d{2}$/)
  for (const procedure of ['A', 'B', 'C']) {
    const id = `P06-${procedure}-${suffix}`, run = resolve(root, '.work/pilots', id), app = resolve(run, 'app')
    assert.ok(!existsSync(run), 'Technical export must have an unused ID')
    const preparation = await script(id + '-prepare', 'prepare-pilot.mjs', id)
    const record = await withBrowser(id, async () => {
      const preflight = await script(id + '-preflight', 'preflight-pilot.mjs', id)
      if (procedure === 'A') {
        cpSync(resolve(root, 'reference/P06/overlay/src'), resolve(app, 'src'), { recursive: true })
        const config = json(resolve(run, 'config.json')), manifest = json(resolve(run, 'manifest.json'))
        const check = await command(id + '-reference-public-isolated', manifest.cli, ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, '/bin/sh', '-c', 'npm run lint && npm run build && npx playwright test --project=api --project=desktop --project=mobile --project=development-desktop --project=development-mobile'], { cwd: app, env: clientEnvironment(config) })
        assert.ok(readFileSync(check.file, 'utf8').includes('46 passed'), 'Expected isolated baseline plus public CSV tests')
        return { id, preparation, preflight, publicReferenceCheck: check, modelStarted: false }
      }
      return { id, preparation, preflight, modelStarted: false }
    })
    records.push(record)
  }
  const common = ['task/instructions.md', 'task/specification-template.md', 'tests/development/P06.spec.ts', 'tests/development/helpers.ts', 'PROJECT_RULES.md']
  const commonHashes = Object.fromEntries(common.map(file => {
    const hashes = ['A', 'B', 'C'].map(p => digest(readFileSync(resolve(root, '.work/pilots', `P06-${p}-${suffix}`, 'app', file))))
    assert.equal(new Set(hashes).size, 1, 'Unequal task input: ' + file); return [file, hashes[0]]
  }))
  save(resolve(study, 'technical-verification.json'), { completedAt: new Date().toISOString(), passed: true, records, commonHashes, sources: freezeHashes() })
}
function freeze() {
  assert.ok(!existsSync(freezeFile), 'Never replace the frozen protocol')
  assert.deepEqual(json(scheduleFile), schedule(), 'Schedule differs from the predeclared generator')
  const sources = freezeHashes(), evidence = {}
  for (let i = 3; i <= 10; i++) {
    const task = 'P' + String(i).padStart(2, '0')
    for (const kind of ['reference', 'mutation']) {
      const file = `reports/${task}-${kind}-summary.json`, report = json(resolve(root, file))
      assert.ok(kind === 'reference' ? report.success && report.total === 70 : report.sourceUnchanged && report.detected === 6 && report.total === 6, file + ' failed')
      for (const [path, hash] of Object.entries(report.sourceHashes)) assert.equal(sources[path], hash, 'Stale verification: ' + path)
      evidence[file] = digest(readFileSync(resolve(root, file)))
    }
  }
  const technical = json(resolve(study, 'technical-verification.json')); assert.ok(technical.passed)
  assert.deepEqual(technical.sources, sources, 'Repeat technical verification on exact frozen sources')
  evidence['main-study/technical-verification.json'] = digest(readFileSync(resolve(study, 'technical-verification.json')))
  for (const id of ['Q-B-002', 'Q-C-002', 'Q-I-002']) {
    const file = `qualification/${id}/execution.json`; const result = json(resolve(root, file))
    assert.ok(result.successful, 'Qualification failed: ' + id); evidence[file] = digest(readFileSync(resolve(root, file)))
  }
  save(freezeFile, { version: 'L/1.0', frozenAt: new Date().toISOString(), sources, evidence, plannedRuns: 72, scheduleSeed: schedule().seed })
  console.log('Frozen all main-study inputs for 72 runs.')
}
function status() {
  const runs = schedule().runs.map(run => {
    const archive = resolve(root, 'runs', run.id, 'evaluation-summary.json'), execution = resolve(root, '.work/pilots', run.id, 'execution.json')
    return { ...run, status: existsSync(archive) ? 'archived' : existsSync(execution) ? json(execution).status : 'not_started', ...(existsSync(archive) ? { allChecksPassed: json(archive).allChecksPassed } : {}) }
  })
  const result = { at: new Date().toISOString(), frozen: existsSync(freezeFile), archived: runs.filter(r => r.status === 'archived').length, planned: 72, runs }
  save(resolve(study, 'status.json'), result); console.log(JSON.stringify({ archived: result.archived, planned: 72, next: runs.find(r => r.status !== 'archived') }))
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
      if (serviceLimitInEvents(text + '\n' + phaseErrors)) {
        save(resolve(study, 'active.json'), { id, stage: 'service_limit', at: new Date().toISOString(), note: 'All started evidence preserved. Resume at next unused ID after service availability returns.' }); return
      }
    }
    save(resolve(study, 'active.json'), { stage: 'all_runs_archived', at: new Date().toISOString() }); status()
  } finally { rmSync(lock) }
}
switch (action) {
  case 'schedule': assert.ok(!existsSync(scheduleFile), 'Do not overwrite schedule'); save(scheduleFile, schedule()); break
  case 'technical': await technical(); break
  case 'freeze': freeze(); break
  case 'verify-freeze': verifyFreeze(); console.log('Frozen inputs unchanged.'); break
  case 'status': status(); break
  case 'run': await run(); break
  default: throw Error('Choose schedule, technical, freeze, verify-freeze, status or run')
}
