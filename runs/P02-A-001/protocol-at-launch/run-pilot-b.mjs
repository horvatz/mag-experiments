import { pilotTask, hiddenPorts, assertTaskBaseline } from './pilot-tasks.mjs'
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { clientEnvironment, configArguments, digest, inventory, changes } from './pilot-utils.mjs'
import { phaseBudget, parseReview, roleCanEdit, workerArguments, runBWorkflow } from './procedure-b.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2]
assert.match(id, /^P0[12]-B-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const app = resolve(run, 'app')
const task = pilotTask(id)
const readJSON = (name) => JSON.parse(readFileSync(resolve(run, name), 'utf8'))
const writeJSON = (name, value) => writeFileSync(resolve(run, name), JSON.stringify(value, null, 2) + '\n')
const manifest = readJSON('manifest.json')
assertTaskBaseline(root, manifest, task)
const base = readJSON('config.json')
const protocol = readJSON('procedure-b.json')
assert.equal(digest(JSON.stringify(protocol)), manifest.procedureBSha256)
assert.equal(digest(JSON.stringify(base)), manifest.configSha256)
assert.equal(digest(readFileSync(resolve(run, 'prompt.md'))), manifest.promptSha256)
assert.equal(digest(readFileSync(resolve(run, 'browser.sb'))), manifest.browserProfileSha256)
assert.equal(manifest.procedure, 'B')
assert.equal(protocol.workflow.version, 'B/0.3', 'Run the frozen runner for older protocol versions')
for (const [path, hash] of Object.entries(manifest.protocolSourceHashes || {})) assert.equal(digest(readFileSync(resolve(root, path))), hash, 'Runner changed after preparation: ' + path)
assert.deepEqual(inventory(app), manifest.files, 'Export changed after preparation')
assert.ok(readFileSync(resolve(run, 'preflight-runtime.log'), 'utf8').includes('38 passed'))
assert.ok(readJSON('preflight-filesystem.json').filesystem.every((item) => item.blocked))
assert.ok(readJSON('preflight-roles.json').every((item) => item.passed))
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
const metadata = { id, procedure: 'B', startedAt: new Date().toISOString(), model: base.model,
  reasoningEffort: base.model_reasoning_effort, limitSeconds: manifest.limitSeconds,
  status: 'running', cli: binary, cliVersion: manifest.cliVersion, phases: [], sessions: {},
  intervention: 'No operator hints, code edits or hidden-test feedback during execution; deterministic handoffs only.',
  usage: null, monetaryCost: null, costNote: 'Existing ChatGPT login; token usage is not an API invoice.' }
writeJSON('execution.json', metadata)
const started = performance.now()
const runDeadline = Date.now() + manifest.limitSeconds * 1000
const remaining = () => Math.max(0, manifest.limitSeconds - (performance.now() - started) / 1000)
let stopped
let active
function stop(why) { stopped ??= why; active?.(why) }
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => stop('operator_interruption'))
const deadline = setTimeout(() => stop('time_limit'), manifest.limitSeconds * 1000)

async function phase(name, role, resume = false) {
  const seconds = phaseBudget(name, remaining(), protocol.workflow)
  if (stopped || seconds < 1) { stopped ??= 'time_limit'; return false }
  const before = inventory(app)
  const folder = resolve(run, 'phases', String(metadata.phases.length + 1).padStart(2, '0') + '-' + name)
  mkdirSync(folder)
  const config = structuredClone(protocol.configs[role])
  const phaseDeadline = Math.min(runDeadline, Date.now() + seconds * 1000)
  Object.assign(config['shell_environment_policy.set'], { MAG_PHASE_DEADLINE_MS: String(phaseDeadline), MAG_RUN_DEADLINE_MS: String(runDeadline) })
  const prompt = protocol.prompts[name] + `\nTa faza ima največ ${Math.floor(seconds)} sekund, do ${new Date(phaseDeadline).toISOString()}. Do skupne omejitve ostaja ${Math.floor(remaining())} sekund. Preostanek preveri z node task/time-budget.mjs. Zadnjo minuto nameni predaji in končnemu odgovoru.\n`
  writeFileSync(resolve(folder, 'prompt.md'), prompt)
  writeFileSync(resolve(folder, 'config.json'), JSON.stringify(config, null, 2) + '\n')
  assert.ok(!resume || metadata.sessions[role], 'Cannot resume a role without its own session')
  // Persist only these three sessions so a correction retains its author's
  // history. Tools still cannot read any host session or credential files.
  const args = workerArguments({ configArgs: configArguments(config), app, session: resume ? metadata.sessions[role] : undefined,
    review: role === 'review', schema: resolve(app, 'task/review-schema.json'), output: resolve(folder, 'final-response.json') })
  const record = { name, role, resumed: resume, startedAt: new Date().toISOString(), limitSeconds: Number(seconds.toFixed(3)), status: 'running', usage: null }
  metadata.phases.push(record)
  writeJSON('execution.json', metadata)
  console.log('Starting ' + name + ' (' + Math.floor(seconds) + ' seconds available)')
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
  // This is a byte-for-byte transport of the reviewer's structured final
  // answer, not a review authored or repaired by the experiment operator.
  if (role === 'review' && record.status === 'completed' && existsSync(resolve(folder, 'final-response.json'))) {
    try {
      const response = readFileSync(resolve(folder, 'final-response.json'))
      parseReview(JSON.parse(response), task.requirements)
      writeFileSync(resolve(app, 'docs/agent/review.json'), response)
      record.handoffSource = 'reviewer_structured_final_response'
      record.handoffSha256 = digest(response)
    } catch (error) { record.handoffError = error.message }
  }
  if (role === 'review' && record.status === 'completed' && !record.handoffSource) record.handoffError ??= 'Missing structured final review'
  const after = inventory(app)
  record.fileChanges = changes(before, after).map((item) => ({ ...item, roleAllowed: roleCanEdit(role, item.path) }))
  record.allowedChanges = record.fileChanges.every((item) => item.roleAllowed)
  record.rejectedSymlinks = Object.entries(after).filter(([path, item]) => /^(src|tests\/agent|docs\/agent)\//.test(path) && item.kind !== 'file').map(([path]) => path)
  for (const path of ['src', 'tests/agent', 'docs/agent']) cpSync(resolve(app, path), resolve(folder, 'submission', path), { recursive: true, verbatimSymlinks: true })
  writeFileSync(resolve(folder, 'inventory.json.gz'), gzipSync(JSON.stringify(after)))
  writeFileSync(resolve(folder, 'result.json'), JSON.stringify(record, null, 2) + '\n')
  writeJSON('execution.json', metadata)
  console.log(name + ': ' + record.status + ', ' + record.elapsedSeconds + 's')
  if (!record.allowedChanges || record.rejectedSymlinks.length) stopped ??= 'role_boundary_violation'
  else if (record.handoffError) stopped ??= 'invalid_review_handoff'
  else if (record.status === 'execution_failed' || record.status === 'wrong_session') stopped ??= record.status
  return !stopped
}

try {
  const outcome = await runBWorkflow({ phase, requirements: task.requirements,
    hasSpecification: () => existsSync(resolve(app, 'docs/agent/specification.md')) && readFileSync(resolve(app, 'docs/agent/specification.md'), 'utf8').trim().length > 0,
    getReview: () => JSON.parse(readFileSync(resolve(app, 'docs/agent/review.json'), 'utf8')) })
  if (outcome.review) metadata.review = outcome.review
  if (outcome.error) metadata.handoffError = outcome.error
  if (outcome.status !== 'completed') stopped ??= outcome.status
} catch (error) { stopped ??= 'runner_error'; metadata.error = error.stack }
finally { clearTimeout(deadline) }
metadata.finishedAt = new Date().toISOString()
metadata.elapsedSeconds = Number(((performance.now() - started) / 1000).toFixed(3))
metadata.status = stopped || (metadata.phases.every((item) => item.status === 'completed') ? 'completed' : 'completed_with_phase_time_limit')
metadata.usageNote = 'Raw CLI usage is recorded per phase. Aggregate is withheld if a resumed session requires reconciliation or any phase lacks a final usage event.'
if (metadata.phases.every((item) => item.usage && !item.resumed)) {
  metadata.usage = {}
  for (const phase of metadata.phases) for (const [key, value] of Object.entries(phase.usage)) metadata.usage[key] = (metadata.usage[key] || 0) + value
  metadata.usageNote = 'Sum of completed turns from three distinct sessions. Cached input is a subset of input; reasoning output is a subset of output.'
}
const finalFiles = inventory(app)
metadata.fileChanges = changes(manifest.files, finalFiles)
metadata.rejectedSymlinks = Object.entries(finalFiles).filter(([path, entry]) => /^(src|tests\/agent|docs\/agent)\//.test(path) && entry.kind !== 'file').map(([path]) => path)
metadata.allowedChanges = metadata.fileChanges.every((item) => item.allowed) && metadata.rejectedSymlinks.length === 0 && metadata.phases.every((item) => item.allowedChanges)
writeJSON('execution.json', metadata)
writeJSON('final-inventory.json', finalFiles)
const submission = resolve(run, 'submission')
mkdirSync(submission)
for (const path of ['src', 'tests/agent', 'docs/agent']) cpSync(resolve(app, path), resolve(submission, path), { recursive: true, verbatimSymlinks: true })
assert.deepEqual(finalFiles, inventory(app), 'Submission changed while being frozen')
console.log(JSON.stringify({ status: metadata.status, elapsedSeconds: metadata.elapsedSeconds, allowedChanges: metadata.allowedChanges, usage: metadata.usage }))
