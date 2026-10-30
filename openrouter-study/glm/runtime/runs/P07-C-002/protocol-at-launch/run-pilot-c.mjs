import { pilotTask, hiddenPorts, assertTaskBaseline } from './pilot-tasks.mjs'
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { clientEnvironment, configArguments, digest, inventory, changes, editable, submissionPaths } from './pilot-utils.mjs'
import { workerArguments } from './procedure-b.mjs'
import { phaseBudget, parseConvergence, stageCanEdit, requiredArtifacts as defaultArtifacts, runCWorkflow } from './procedure-c.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2]
assert.match(id, /^P(?:0[1-9]|10)-C-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const app = resolve(run, 'app')
const task = pilotTask(id)
const feature = task.feature
const requiredArtifacts = Object.fromEntries(Object.entries(defaultArtifacts).map(([stage, paths]) => [stage, paths.map(path => path.replace('docs/agent/P01', feature))]))
const readJSON = (name) => JSON.parse(readFileSync(resolve(run, name), 'utf8'))
const writeJSON = (name, value) => writeFileSync(resolve(run, name), JSON.stringify(value, null, 2) + '\n')
const manifest = readJSON('manifest.json')
assertTaskBaseline(root, manifest, task)
const base = readJSON('config.json')
const protocol = readJSON('procedure-c.json')
assert.equal(digest(JSON.stringify(protocol)), manifest.procedureCSha256)
assert.equal(digest(JSON.stringify(base)), manifest.configSha256)
assert.equal(digest(readFileSync(resolve(run, 'prompt.md'))), manifest.promptSha256)
assert.equal(digest(readFileSync(resolve(run, 'browser.sb'))), manifest.browserProfileSha256)
assert.equal(manifest.procedure, 'C')
assert.equal(protocol.workflow.version, 'C/0.2', 'Run the frozen runner for older protocol versions')
for (const [path, hash] of Object.entries(manifest.protocolSourceHashes || {})) assert.equal(digest(readFileSync(resolve(root, path))), hash, 'Runner changed after preparation: ' + path)
assert.deepEqual(inventory(app), manifest.files, 'Export changed after preparation')
const specKitRuntime = readJSON('spec-kit-runtime.json')
assert.equal(digest(readFileSync(resolve(run, 'spec-kit-runtime.json'))), manifest.specKitRuntimeSha256)
assert.deepEqual(inventory(specKitRuntime.runtime), specKitRuntime.files, 'Spec Kit runtime changed after preparation')
assert.ok(readFileSync(resolve(run, 'preflight-runtime.log'), 'utf8').includes('38 passed'))
assert.ok(readJSON('preflight-filesystem.json').filesystem.every((item) => item.blocked))
assert.ok(readJSON('preflight-c.json').every((item) => item.passed))
assert.ok(!existsSync(resolve(run, 'execution.json')), 'Never reuse a started run ID')
const binary = manifest.cli
assert.equal(execFileSync(binary, ['--version'], { encoding: 'utf8' }).trim(), manifest.cliVersion)
async function listening(port) {
  return new Promise((done) => {
    const socket = connect({ host: '127.0.0.1', port })
    const finish = (value) => { socket.destroy(); done(value) }
    socket.once('connect', () => finish(true)); socket.once('error', () => finish(false))
    socket.setTimeout(500, () => finish(true))
  })
}
assert.ok(!(await Promise.all(hiddenPorts.map(listening))).some(Boolean), 'Close reference and earlier candidate previews first')
assert.ok(await listening(9223), 'Start the isolated pilot browser first')
mkdirSync(resolve(run, 'phases'))
const metadata = { id, procedure: 'C', startedAt: new Date().toISOString(), model: base.model,
  reasoningEffort: base.model_reasoning_effort, limitSeconds: manifest.limitSeconds,
  status: 'running', cli: binary, cliVersion: manifest.cliVersion, phases: [], sessions: {},
  intervention: 'No operator hints, code edits or hidden-test feedback during execution; deterministic handoffs only.',
  usage: null, monetaryCost: null, costNote: 'OpenRouter API; provider usage and invoiced cost are recorded separately by the researcher relay.' }
writeJSON('execution.json', metadata)
const started = performance.now()
const runDeadline = Date.now() + manifest.limitSeconds * 1000
const remaining = () => Math.max(0, manifest.limitSeconds - (performance.now() - started) / 1000)
let stopped
let active
function stop(why) { stopped ??= why; active?.(why) }
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => stop('operator_interruption'))
const deadline = setTimeout(() => stop('time_limit'), manifest.limitSeconds * 1000)

async function phase(name) {
  const role = 'agent'
  const resume = Boolean(metadata.sessions.agent)
  const seconds = phaseBudget(name, remaining(), protocol.workflow)
  if (stopped || seconds < 1) { stopped ??= 'time_limit'; return false }
  const before = inventory(app)
  const folder = resolve(run, 'phases', String(metadata.phases.length + 1).padStart(2, '0') + '-' + name)
  mkdirSync(folder)
  const config = structuredClone(protocol.configs[name])
  const phaseDeadline = Math.min(runDeadline, Date.now() + seconds * 1000)
  Object.assign(config['shell_environment_policy.set'], { MAG_PHASE_DEADLINE_MS: String(phaseDeadline), MAG_RUN_DEADLINE_MS: String(runDeadline) })
  const prompt = protocol.prompts[name] + `\nTa faza ima največ ${Math.floor(seconds)} sekund, do ${new Date(phaseDeadline).toISOString()}. Do skupne omejitve ostaja ${Math.floor(remaining())} sekund. Preostanek preveri z node task/time-budget.mjs. Zadnjo minuto nameni predaji in končnemu odgovoru.\n`
  writeFileSync(resolve(folder, 'prompt.md'), prompt)
  writeFileSync(resolve(folder, 'config.json'), JSON.stringify(config, null, 2) + '\n')
  assert.ok(!resume || metadata.sessions[role], 'Cannot resume a role without its own session')
  // Every stage resumes the same agent; host conversations remain inaccessible.
  const args = workerArguments({ configArgs: configArguments(config), app, session: resume ? metadata.sessions[role] : undefined,
    review: name === 'converge', schema: resolve(app, 'task/convergence-schema.json'), output: resolve(folder, 'final-response.json') })
  const record = { name, role, resumed: resume, startedAt: new Date().toISOString(), limitSeconds: Number(seconds.toFixed(3)), status: 'running', usage: null }
  metadata.phases.push(record)
  writeJSON('execution.json', metadata)
  console.log('Starting ' + name + ' (' + Math.floor(seconds) + ' seconds available)')
  const tasksBefore = name === 'converge' ? readFileSync(resolve(app, feature, 'tasks.md'), 'utf8') : null
  const phaseStarted = performance.now()
  const events = createWriteStream(resolve(folder, 'events.jsonl'), { flags: 'wx' })
  const stderr = createWriteStream(resolve(folder, 'stderr.log'), { flags: 'wx' })
  const child = spawn(binary, args, { cwd: app, env: clientEnvironment(config), detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let reason, completed = false, failed = false, buffer = '', descendants = []
  function tree() {
    try {
      const rows = execFileSync('/bin/ps', ['-axo', 'pid=,ppid='], { encoding: 'utf8' }).trim().split('\n').map((line) => line.trim().split(/\s+/).map(Number))
      const found = new Set([child.pid]); let more = true
      while (more) { more = false; for (const [pid, parent] of rows) if (found.has(parent) && !found.has(pid)) { found.add(pid); more = true } }
      descendants = [...found].filter((pid) => pid !== child.pid)
    } catch { /* Process-group cleanup remains available. */ }
  }
  function cleanup() {
    for (const pid of descendants.toReversed()) { try { process.kill(pid, 'SIGSTOP') } catch {} }
    try { process.kill(-child.pid, 'SIGKILL') } catch {}
    for (const pid of descendants) { try { process.kill(pid, 'SIGKILL') } catch {} }
  }
  function terminate(why) { if (!reason) { reason = why; tree(); cleanup() } }
  active = terminate
  child.stdin.on('error', () => {})
  child.stdin.end(prompt)
  function eventLine(line) {
    let event; try { event = JSON.parse(line) } catch { return }
    if (event.type === 'thread.started') {
      record.threadId = event.thread_id
      if (resume && metadata.sessions[role] !== event.thread_id) { failed = true; terminate('wrong_session') }
      else metadata.sessions[role] = event.thread_id
    }
    if (event.type === 'turn.completed') { completed = true; record.usage = event.usage ?? null }
    if (event.type === 'turn.failed' || event.type === 'error') failed = true
    if (event.type === 'item.completed' && event.item?.type === 'agent_message') {
      writeFileSync(resolve(folder, 'last-message.md'), event.item.text + '\n')
      writeFileSync(resolve(run, 'last-message.md'), event.item.text + '\n')
      console.log('[' + name + '] ' + event.item.text.slice(0, 600))
    }
  }
  child.stdout.on('data', (chunk) => {
    events.write(chunk); buffer += chunk.toString(); let newline
    while ((newline = buffer.indexOf('\n')) !== -1) { eventLine(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1) }
  })
  child.stderr.pipe(stderr, { end: false })
  const timer = setTimeout(() => terminate(remaining() < 1 ? 'time_limit' : 'phase_time_limit'), seconds * 1000)
  let busy = false
  const guard = setInterval(async () => {
    if (busy) return
    busy = true; tree()
    if ((await Promise.all(hiddenPorts.map(listening))).some(Boolean)) stop('isolation_interrupted')
    busy = false
  }, 3000)
  const result = await new Promise((done) => { child.once('error', (error) => done({ error: error.message })); child.once('close', (exitCode, signal) => done({ exitCode, signal })) })
  clearTimeout(timer); clearInterval(guard); active = undefined
  cleanup()
  if (buffer) eventLine(buffer)
  await Promise.all([new Promise((done) => events.end(done)), new Promise((done) => stderr.end(done))])
  record.finishedAt = new Date().toISOString()
  record.elapsedSeconds = Number(((performance.now() - phaseStarted) / 1000).toFixed(3))
  record.status = reason || (completed && result.exitCode === 0 && !failed ? 'completed' : 'execution_failed')
  Object.assign(record, result)
  // Transport only the agent's own final convergence report, without editing it.
  if (name === 'converge' && record.status === 'completed' && existsSync(resolve(folder, 'final-response.json'))) {
    try {
      const response = readFileSync(resolve(folder, 'final-response.json'))
      metadata.convergence = parseConvergence(JSON.parse(response), tasksBefore, readFileSync(resolve(app, feature, 'tasks.md'), 'utf8'))
      writeFileSync(resolve(app, 'docs/agent/convergence.json'), response)
      record.handoffSource = 'agent_structured_convergence_response'
      record.handoffSha256 = digest(response)
    } catch (error) { record.handoffError = error.message }
  }
  if (name === 'converge' && record.status === 'completed' && !record.handoffSource) record.handoffError ??= 'Missing structured convergence report'
  if (record.status === 'completed') {
    for (const path of requiredArtifacts[name]) {
      if (!existsSync(resolve(app, path)) || !readFileSync(resolve(app, path), 'utf8').trim()) record.handoffError ??= 'Missing artifact: ' + path
    }
    if (name === 'constitution' && before['.specify/memory/constitution.md'].sha256 === digest(readFileSync(resolve(app, '.specify/memory/constitution.md')))) record.handoffError ??= 'Constitution template was not completed'
    if (name === 'tasks' && !record.handoffError && !/^\s*- \[[ xX]\] \[?T\d+/m.test(readFileSync(resolve(app, feature, 'tasks.md'), 'utf8'))) record.handoffError ??= 'Missing actionable tasks'
  }
  const after = inventory(app)
  record.fileChanges = changes(before, after, 'C').map((item) => ({ ...item, roleAllowed: stageCanEdit(name, item.path, task.feature) }))
  record.allowedChanges = record.fileChanges.every((item) => item.roleAllowed)
  record.rejectedSymlinks = Object.entries(after).filter(([path, item]) => editable(path, 'C') && item.kind !== 'file').map(([path]) => path)
  for (const path of submissionPaths('C')) {
    const target = resolve(folder, 'submission', path)
    mkdirSync(dirname(target), { recursive: true })
    cpSync(resolve(app, path), target, { recursive: true, verbatimSymlinks: true })
  }
  writeFileSync(resolve(folder, 'inventory.json.gz'), gzipSync(JSON.stringify(after)))
  writeFileSync(resolve(folder, 'result.json'), JSON.stringify(record, null, 2) + '\n')
  writeJSON('execution.json', metadata)
  console.log(name + ': ' + record.status + ', ' + record.elapsedSeconds + 's')
  if (!record.allowedChanges || record.rejectedSymlinks.length) stopped ??= 'role_boundary_violation'
  else if (record.handoffError) stopped ??= 'invalid_stage_handoff'
  else if (record.status !== 'completed') stopped ??= record.status
  return !stopped
}

try {
  const outcome = await runCWorkflow({ phase, getConvergence: () => metadata.convergence }, protocol.workflow)
  if (outcome !== 'completed') stopped ??= outcome
} catch (error) { stopped ??= 'runner_error'; metadata.error = error.stack }
finally { clearTimeout(deadline) }
metadata.finishedAt = new Date().toISOString()
metadata.elapsedSeconds = Number(((performance.now() - started) / 1000).toFixed(3))
metadata.status = stopped || (metadata.phases.every((item) => item.status === 'completed') ? 'completed' : 'completed_with_phase_time_limit')
metadata.usageNote = 'One persistent session across stages; aggregate awaits researcher-side reconciliation of cumulative token counts. Missing counters remain unknown.'
const finalFiles = inventory(app)
metadata.fileChanges = changes(manifest.files, finalFiles, 'C')
metadata.rejectedSymlinks = Object.entries(finalFiles).filter(([path, entry]) => editable(path, 'C') && entry.kind !== 'file').map(([path]) => path)
metadata.allowedChanges = metadata.fileChanges.every((item) => item.allowed) && metadata.rejectedSymlinks.length === 0 && metadata.phases.every((item) => item.allowedChanges)
writeJSON('execution.json', metadata)
writeJSON('final-inventory.json', finalFiles)
const submission = resolve(run, 'submission')
mkdirSync(submission)
for (const path of submissionPaths('C')) {
  mkdirSync(dirname(resolve(submission, path)), { recursive: true })
  cpSync(resolve(app, path), resolve(submission, path), { recursive: true, verbatimSymlinks: true })
}
assert.deepEqual(finalFiles, inventory(app), 'Submission changed while being frozen')
console.log(JSON.stringify({ status: metadata.status, elapsedSeconds: metadata.elapsedSeconds, allowedChanges: metadata.allowedChanges, usage: metadata.usage }))
