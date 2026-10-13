// Sequential 216-run operator; measured workflows remain frozen and isolated.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, statfsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { configArguments, clientEnvironment } from '../scripts/pilot-utils.mjs'
import { verify } from './verify.mjs'
import { startRelay } from './relay.mjs'
import { credits } from './credentials.mjs'
import { recordedSpend, reconcileCosts, reconcileMissingCosts } from './costs.mjs'
import { command, listening, withBrowser } from './operator-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const json = file => JSON.parse(readFileSync(file, 'utf8'))
const save = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
const plan = json(resolve(study, 'models.json'))
const entries = json(resolve(study, plan.models[0].slug, 'runtime/main-study/schedule.json')).runs
const jobs = entries.flatMap((entry, index) => plan.models.map((_, offset) => ({ ...entry, selected: plan.models[(index + offset) % plan.models.length] })))
assert.equal(jobs.length, 216)
async function probe(config, cli, app, env, destination) {
  mkdirSync(destination, { recursive: true })
  const child = spawn(cli, ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check', '--json', '--color', 'never', '-C', app, ...configArguments(config), '-'], { cwd: app, env: { ...clientEnvironment(config), ...env }, detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = '', timedOut = false
  child.stdout.on('data', part => out += part); child.stderr.on('data', part => err += part); child.stdin.on('error', () => {})
  child.stdin.end('Connectivity diagnostic only. Do not use tools, read files, or perform any task. Reply exactly CONNECTION_OK.')
  const timer = setTimeout(() => { timedOut = true; try { process.kill(-child.pid, 'SIGTERM') } catch {} }, 60000)
  const killer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL') } catch {} }, 70000)
  const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) }); clearTimeout(timer); clearTimeout(killer)
  const events = out.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)] } catch { return [] } })
  const completed = events.some(event => event.type === 'turn.completed')
  const expected = events.some(event => event.item?.type === 'agent_message' && event.item.text?.trim() === 'CONNECTION_OK')
  const toolUsed = events.some(event => event.item && !['agent_message', 'reasoning', 'error'].includes(event.item.type))
  const result = { at: new Date().toISOString(), code, timedOut, completed, expected, toolUsed, passed: code === 0 && !timedOut && completed && expected && !toolUsed, excludedFromMeasurements: true }
  save(resolve(destination, 'result.json'), result); writeFileSync(resolve(destination, 'events.jsonl'), out); writeFileSync(resolve(destination, 'stderr.log'), err)
  return result
}
verify()
assert.ok(!existsSync(resolve(study, '../main-study/runner.lock')) && !existsSync(resolve(study, '../luna-study/runtime/main-study/runner.lock')), 'Historical queues must be inactive')
assert.equal(await listening(9238), false, 'Another study relay is active')
const lock = resolve(study, 'runner.lock'), fd = openSync(lock, 'wx'); writeFileSync(fd, String(process.pid)); closeSync(fd)
const active = value => save(resolve(study, 'active.json'), { at: new Date().toISOString(), pid: process.pid, ...value })
try {
  for (const [position, job] of jobs.entries()) {
    verify()
    const selected = job.selected, collection = resolve(study, selected.slug), root = resolve(collection, 'runtime')
    const setup = json(resolve(collection, 'setup.json')), logs = resolve(root, 'main-study/logs')
    const env = { ...process.env, MAG_SPECKIT_RUNTIME: setup.specKitRuntime }
    const id = job.id, dir = resolve(root, '.work/pilots', id), archive = resolve(root, 'runs', id)
    if (existsSync(resolve(archive, 'archive-complete.json'))) { assert.equal(json(resolve(archive, 'evaluation-summary.json')).id, id); continue }
    const disk = statfsSync(study)
    assert.ok(disk.bavail * disk.bsize >= 2 * 1024 ** 3, 'Less than 2 GiB free before an unused run; preserve all evidence and inspect storage')
    await reconcileMissingCosts()
    assert.ok(!existsSync(archive), 'Incomplete archive needs inspection')
    const script = (name, file, ...args) => command({ root, logs, name: selected.slug + '-' + name, args: [resolve(root, 'scripts', file), ...args], env })
    active({ model: selected.id, slug: selected.slug, id, position: position + 1, stage: 'preparing', planned: 216 })
    if (!existsSync(resolve(dir, 'manifest.json'))) { assert.ok(!existsSync(dir), 'Incomplete export needs inspection'); await script(id + '-prepare', 'prepare-pilot.mjs', id) }
    if (!existsSync(resolve(dir, 'execution.json'))) await withBrowser({ root, logs, id, env }, async () => {
      await script(id + '-preflight', 'preflight-pilot.mjs', id)
      const config = json(resolve(dir, 'config.json')), api = resolve(collection, 'api', id)
      const probeDir = resolve(api, 'probe-' + Date.now())
      const checkRelay = await startRelay({ selected, destination: probeDir, label: `${selected.slug}/${id}/unmeasured-service-check` })
      let check
      try { check = await probe(config, setup.cli.path, resolve(dir, 'app'), checkRelay.env, probeDir) } finally { await checkRelay.close(); await reconcileCosts(probeDir) }
      if (!check.passed) { active({ slug: selected.slug, id, stage: 'service_unavailable_before_measurement', position: position + 1 }); throw Error('Service check failed before measured start; preserve diagnostic and investigate') }
      const modelDir = resolve(api, 'model')
      assert.ok(!existsSync(resolve(modelDir, 'api-ledger.jsonl')), 'API activity without execution metadata requires inspection')
      const relay = await startRelay({ selected, destination: modelDir, label: `${selected.slug}/${id}/measured` })
      try {
        active({ slug: selected.slug, model: selected.id, id, position: position + 1, stage: 'model', planned: 216 })
        await command({ root, logs, name: selected.slug + '-' + id + '-model', args: [resolve(root, 'scripts/run-pilot.mjs'), id], env: { ...env, ...relay.env } })
      } finally { await relay.close() }
      const cost = await reconcileCosts(modelDir); save(resolve(dir, 'api-cost.json'), cost)
      // Preserve each sent request compactly after the model has stopped.
      for (const row of cost.requests) {
        const file = resolve(modelDir, `request-${String(row.number).padStart(5, '0')}.json`)
        if (existsSync(file)) { writeFileSync(file + '.gz', gzipSync(readFileSync(file)), { flag: 'wx' }); rmSync(file) }
      }
    })
    const execution = json(resolve(dir, 'execution.json')); assert.notEqual(execution.status, 'running', 'Interrupted measured run needs researcher finalization, never repetition')
    active({ slug: selected.slug, id, position: position + 1, stage: 'evaluating', planned: 216 })
    if (!existsSync(resolve(dir, 'api-cost.json'))) save(resolve(dir, 'api-cost.json'), await reconcileCosts(resolve(collection, 'api', id, 'model')))
    if (!existsSync(resolve(dir, 'usage-observation.json'))) await script(id + '-usage', 'reconcile-pilot-usage.mjs', id)
    if (!existsSync(resolve(dir, 'evaluation-summary.json'))) await script(id + '-evaluate', 'evaluate-pilot.mjs', id)
    await script(id + '-archive', 'archive-pilot.mjs', id)
    await script(id + '-analysis', 'analyze-main.mjs')
    await command({ root, logs, name: selected.slug + '-' + id + '-comparison', args: [resolve(study, 'analyze.mjs')], env })
    await script(id + '-status', 'main-study.mjs', 'status')
    // Dependencies and disposable test caches are reconstructible researcher
    // inputs; all authored files, inventories, logs and archive hashes remain.
    for (const path of ['node_modules', 'dist', 'test-results', 'playwright-report', '.vite', '.tmp']) rmSync(resolve(dir, 'app', path), { recursive: true, force: true })
    const modelLedger = resolve(collection, 'api', id, 'model/api-ledger.jsonl')
    const apiRows = existsSync(modelLedger) ? readFileSync(modelLedger, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : []
    if (apiRows.some(row => (row.httpStatus !== undefined && row.httpStatus !== 200) || ['failed', 'incomplete'].includes(row.responseStatus) || ['transport_error', 'rejected_before_upstream'].includes(row.status))) {
      active({ slug: selected.slug, id, stage: 'service_failure_archived', position: position + 1, spend: recordedSpend() }); throw Error('Started evidence archived; investigate service before any unused ID')
    }
  }
  active({ stage: 'all_runs_archived', archived: 216, planned: 216, spend: recordedSpend(), balance: await credits() })
} finally { rmSync(lock) }
