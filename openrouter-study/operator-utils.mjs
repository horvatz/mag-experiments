import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { closeSync, createWriteStream, mkdirSync, openSync } from 'node:fs'
import { connect } from 'node:net'
import { resolve } from 'node:path'
export async function listening(port) {
  return new Promise(done => { const socket = connect({ host: '127.0.0.1', port }); const finish = result => { socket.destroy(); done(result) }; socket.once('connect', () => finish(true)); socket.once('error', () => finish(false)); socket.setTimeout(500, () => finish(false)) })
}
export async function command({ root, logs, name, args, env, input, timeoutMs, allowFailure = false }) {
  mkdirSync(logs, { recursive: true })
  const file = resolve(logs, name + '-' + Date.now() + '.log'), log = createWriteStream(file, { flags: 'wx' })
  const started = Date.now(), child = spawn(process.execPath, args, { cwd: root, env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false }); child.stdin.on('error', () => {})
  child.stdin.end(input)
  let timedOut = false, timer, killer
  if (timeoutMs) {
    timer = setTimeout(() => { timedOut = true; try { process.kill(-child.pid, 'SIGTERM') } catch {} }, timeoutMs)
    killer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL') } catch {} }, timeoutMs + 10000)
  }
  const result = await new Promise(done => { child.once('error', error => done({ code: null, error: error.message })); child.once('close', (code, signal) => done({ code, signal })) })
  clearTimeout(timer); clearTimeout(killer); await new Promise(done => log.end(done))
  const record = { name, file, startedAt: new Date(started).toISOString(), elapsedSeconds: (Date.now() - started) / 1000, timedOut, ...result }
  console.log(JSON.stringify(record))
  if (!allowFailure && (result.code !== 0 || timedOut)) throw Error(`${name} failed; preserved evidence in ${file}`)
  return record
}
export async function withBrowser({ root, logs, id, env }, callback) {
  assert.equal(await listening(9223), false, 'Another experimental browser is already running')
  mkdirSync(logs, { recursive: true })
  const fd = openSync(resolve(logs, id + '-browser-' + Date.now() + '.log'), 'wx')
  const child = spawn(process.execPath, [resolve(root, 'scripts/pilot-browser.mjs'), id], { cwd: root, env, stdio: ['ignore', fd, fd] })
  const ended = new Promise(done => child.once('close', done))
  try {
    let ready = false
    for (let i = 0; i < 100 && child.exitCode === null; i++) { if (await listening(9223)) { ready = true; break }; await new Promise(done => setTimeout(done, 100)) }
    assert.ok(ready, 'Experimental browser did not start')
    return await callback()
  } finally {
    child.kill('SIGTERM'); const timer = setTimeout(() => child.kill('SIGKILL'), 10000)
    await ended; clearTimeout(timer); closeSync(fd)
    assert.equal(await listening(9223), false, 'Browser did not release its port')
  }
}
