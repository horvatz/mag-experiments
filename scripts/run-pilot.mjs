import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync, cpSync } from 'node:fs'
import { connect } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientEnvironment, configArguments, digest, inventory, changes } from './pilot-utils.mjs'

if (/^P01-B-\d{3}$/.test(process.argv[2] || '')) {
  await import('./run-pilot-b.mjs')
  process.exit(0)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2] || 'P01-A-001'
assert.match(id, /^P01-A-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const app = resolve(run, 'app')
const manifest = JSON.parse(readFileSync(resolve(run, 'manifest.json'), 'utf8'))
const config = JSON.parse(readFileSync(resolve(run, 'config.json'), 'utf8'))
const prompt = readFileSync(resolve(run, 'prompt.md'), 'utf8')
assert.equal(digest(prompt), manifest.promptSha256)
assert.equal(digest(JSON.stringify(config)), manifest.configSha256)
assert.equal(digest(readFileSync(resolve(run, 'browser.sb'))), manifest.browserProfileSha256)
assert.deepEqual(inventory(app), manifest.files, 'Export changed after preparation')
assert.ok(readFileSync(resolve(run, 'preflight-runtime.log'), 'utf8').includes('38 passed'))
assert.ok(JSON.parse(readFileSync(resolve(run, 'preflight-filesystem.json'), 'utf8')).filesystem.every((item) => item.blocked))
assert.ok(!existsSync(resolve(run, 'execution.json')), 'Never reuse a started run ID')
async function listening(port) {
  return new Promise((done) => {
    const socket = connect({ host: '127.0.0.1', port })
    const finish = (value) => { socket.destroy(); done(value) }
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(500, () => finish(true)) // uncertainty fails closed
  })
}
const hiddenPorts = [5183, 3111, 5184, 3112]
assert.ok(!(await Promise.all(hiddenPorts.map(listening))).some(Boolean), 'Close reference/evaluation servers first')
assert.ok(await listening(9223), 'Start the isolated pilot browser first')
const binary = manifest.cli || realpathSync(resolve(process.env.HOME, '.local/bin/codex'))
const args = ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check',
  '--json', '--color', 'never', '-C', app, ...configArguments(config), '-']
const metadata = { id, startedAt: new Date().toISOString(), model: config.model,
  reasoningEffort: config.model_reasoning_effort, limitSeconds: manifest.limitSeconds,
  status: 'running', cli: binary, cliVersion: execFileSync(binary, ['--version'], { encoding: 'utf8' }).trim(),
  intervention: 'None during model execution', usage: null, monetaryCost: null,
  costNote: 'Existing ChatGPT login; token usage is not an API invoice.' }
writeFileSync(resolve(run, 'execution.json'), JSON.stringify(metadata, null, 2) + '\n')
const started = performance.now()
const events = createWriteStream(resolve(run, 'events.jsonl'), { flags: 'wx' })
const stderr = createWriteStream(resolve(run, 'stderr.log'), { flags: 'wx' })
const child = spawn(binary, args, { cwd: app, env: clientEnvironment(config), detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
child.stdin.end(prompt)
let buffer = ''
let completed = false
let reason
let turnFailed = false
let descendants = []
function processTree() {
  try {
    const rows = execFileSync('/bin/ps', ['-axo', 'pid=,ppid='], { encoding: 'utf8' }).trim().split('\n')
      .map((line) => line.trim().split(/\s+/).map(Number))
    const result = new Set([child.pid])
    let changed = true
    while (changed) { changed = false; for (const [pid, parent] of rows) if (result.has(parent) && !result.has(pid)) { result.add(pid); changed = true } }
    descendants = [...result].filter((pid) => pid !== child.pid)
  } catch { /* the process group is still terminated below */ }
}
function terminate(why) {
  if (reason) return
  reason = why
  processTree()
  for (const pid of descendants.toReversed()) { try { process.kill(pid, 'SIGSTOP') } catch {} }
  try { process.kill(-child.pid, 'SIGKILL') } catch {}
  for (const pid of descendants) { try { process.kill(pid, 'SIGKILL') } catch {} }
}
child.stdout.on('data', (chunk) => {
  events.write(chunk)
  buffer += chunk.toString()
  let newline
  while ((newline = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1)
    let event; try { event = JSON.parse(line) } catch { continue }
    if (event.type === 'turn.completed') { completed = true; metadata.usage = event.usage ?? null }
    if (event.type === 'turn.failed' || event.type === 'error') turnFailed = true
    if (event.type === 'thread.started') metadata.threadId = event.thread_id
    if (event.type === 'item.completed' && event.item?.type === 'agent_message') {
      writeFileSync(resolve(run, 'last-message.md'), event.item.text + '\n')
      console.log(event.item.text.slice(0, 600))
    }
  }
})
child.stderr.pipe(stderr)
const limit = setTimeout(() => terminate('time_limit'), manifest.limitSeconds * 1000)
let guardBusy = false
const guard = setInterval(async () => {
  if (guardBusy) return
  guardBusy = true
  processTree()
  if ((await Promise.all(hiddenPorts.map(listening))).some(Boolean)) terminate('isolation_interrupted')
  guardBusy = false
}, 3000)
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => terminate('operator_interruption'))
const result = await new Promise((accept) => {
  child.once('error', (error) => accept({ error: error.message }))
  child.once('close', (exitCode, signal) => accept({ exitCode, signal }))
})
clearTimeout(limit); clearInterval(guard)
// Stop any development processes left running by the agent before collecting
// the submission. The separately sandboxed browser is owned by the researcher.
for (const pid of descendants.toReversed()) { try { process.kill(pid, 'SIGSTOP') } catch {} }
try { process.kill(-child.pid, 'SIGKILL') } catch {}
for (const pid of descendants) { try { process.kill(pid, 'SIGKILL') } catch {} }
events.end(); stderr.end()
metadata.finishedAt = new Date().toISOString()
metadata.elapsedSeconds = Number(((performance.now() - started) / 1000).toFixed(3))
metadata.status = reason || (completed && result.exitCode === 0 && !turnFailed ? 'completed' : 'execution_failed')
Object.assign(metadata, result)
const finalFiles = inventory(app)
const fileChanges = changes(manifest.files, finalFiles)
const symlinks = Object.entries(finalFiles).filter(([path, entry]) => /^(src|tests\/agent|docs\/agent)\//.test(path) && entry.kind !== 'file').map(([path]) => path)
metadata.allowedChanges = fileChanges.every((item) => item.allowed) && symlinks.length === 0
metadata.fileChanges = fileChanges
metadata.rejectedSymlinks = symlinks
writeFileSync(resolve(run, 'execution.json'), JSON.stringify(metadata, null, 2) + '\n')
writeFileSync(resolve(run, 'final-inventory.json'), JSON.stringify(finalFiles, null, 2) + '\n')
const submission = resolve(run, 'submission')
mkdirSync(submission)
for (const path of ['src', 'tests/agent', 'docs/agent']) cpSync(resolve(app, path), resolve(submission, path), { recursive: true, verbatimSymlinks: true })
assert.deepEqual(finalFiles, inventory(app), 'Submission changed while being frozen')
console.log(JSON.stringify({ status: metadata.status, elapsedSeconds: metadata.elapsedSeconds, allowedChanges: metadata.allowedChanges, usage: metadata.usage }))
