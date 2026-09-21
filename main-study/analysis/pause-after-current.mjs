// One-use operator pause outside the frozen experimental inputs.
// Lets the already started measurement reach its immutable archive, then stops the queue.
import { existsSync, readFileSync, writeFileSync, rmSync, appendFileSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const [id, rawPid] = process.argv.slice(2), pid = Number(rawPid)
assert.match(id ?? '', /^P\d{2}-[ABC]-\d{3}$/); assert.ok(Number.isSafeInteger(pid) && pid > 1)
const read = file => JSON.parse(readFileSync(resolve(root, file), 'utf8'))
const save = (file, value) => writeFileSync(resolve(root, file), JSON.stringify(value, null, 2) + '\n')
const sleep = ms => new Promise(done => setTimeout(done, ms))
const alive = candidate => { try { process.kill(candidate, 0); return true } catch { return false } }
const request = read('main-study/pause-request.json')
assert.equal(request.id, id); assert.equal(request.pid, pid)
const queueCommand = execFileSync('/bin/ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' }).trim()
assert.match(queueCommand, /^node scripts\/main-study\.mjs run$/)
const marker = resolve(root, 'runs', id, 'archive-complete.json')
console.log(`Pause armed after ${id}; no subsequent measured run is authorized tonight.`)
while (!existsSync(marker)) {
  if (!alive(pid)) throw new Error('Queue ended before the current archive; preserve state and inspect before resuming.')
  await sleep(50)
}
const active = read('main-study/active.json')
assert.ok(active.id === id || active.stage === 'preparing', 'A subsequent model has already started; manual inspection required')
// At this boundary the measured process and its browser have already closed.
const children = spawnSync('/usr/bin/pgrep', ['-P', String(pid)], { encoding: 'utf8' }).stdout.trim().split(/\s+/).filter(Boolean).map(Number)
process.kill(pid, 'SIGTERM')
for (let n = 0; n < 300 && (alive(pid) || children.some(alive)); n++) await sleep(100)
assert.equal(alive(pid), false, 'Queue process did not exit')
assert.equal(children.some(alive), false, 'A queue child is still running; inspect before removing the lock')
const lock = resolve(root, 'main-study/runner.lock')
assert.equal(readFileSync(lock, 'utf8').trim(), String(pid))
execFileSync(process.execPath, ['scripts/main-study.mjs', 'verify-freeze'], { cwd: root })
execFileSync(process.execPath, ['scripts/analyze-main.mjs'], { cwd: root })
execFileSync(process.execPath, ['scripts/main-study.mjs', 'status'], { cwd: root })
const status = read('main-study/status.json')
const next = status.runs.find(row => row.status !== 'archived')
const receipt = { requestedAt: request.requestedAt, pausedAt: new Date().toISOString(), stage: 'paused_by_user',
  lastArchived: id, archived: status.archived, planned: 72, next: next?.id ?? null,
  reason: 'User requested saving progress and continuing tomorrow. Current run completed before queue pause; no new measured run started.',
  freezeUnchanged: true, queueExited: true }
save('main-study/paused.json', receipt)
save('main-study/active.json', receipt)
rmSync(lock)
appendFileSync(resolve(root, '../naloga/zapiski/nadaljevanje-eksperimentov.md'),
  `\n## Samodejno potrjen premor\n\n- Čas UTC: ${receipt.pausedAt}.\n- Arhivirano: ${receipt.archived}/72; zadnja izvedba ${id}.\n- Naslednja še nearhivirana izvedba: ${receipt.next}.\n- Čakalna vrsta je ustavljena; zamrznjeni vhodi so nespremenjeni.\n- Pred nadaljevanjem preglej neodvisni rezultat in vsebinsko oddajo ${id}; ta pregled še ni samodejno opravljen.\n`)
console.log(JSON.stringify(receipt))
