// Paid transport qualification, excluded from all main-study measurements.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { configArguments } from '../scripts/pilot-utils.mjs'
import { startRelay } from './relay.mjs'
import { credits } from './credentials.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const slug = process.argv[2], number = process.argv[3] || '907'
const structuredFirst = process.argv[4] === 'structured'
const port = Number(process.argv[5] || 9238)
const selected = JSON.parse(readFileSync(resolve(study, 'models.json'))).models.find(m => m.slug === slug); assert.ok(selected)
const collection = resolve(study, slug), root = resolve(collection, 'runtime')
const setup = JSON.parse(readFileSync(resolve(collection, 'setup.json')))
const id = `P02-A-${number}`, exported = resolve(root, '.work/pilots', id), app = resolve(exported, 'app')
const destination = resolve(collection, 'qualification/transport-' + number)
assert.ok(!existsSync(destination), 'Never overwrite a transport attempt'); mkdirSync(destination, { recursive: true })
assert.ok(!existsSync(exported), 'Use an unused diagnostic export')
execFileSync(process.execPath, [resolve(root, 'scripts/prepare-pilot.mjs'), id], { cwd: root, stdio: 'inherit' })
const config = JSON.parse(readFileSync(resolve(exported, 'config.json')))
if (port !== 9238) {
  config['model_providers.openrouter_study'].base_url = `http://127.0.0.1:${port}/v1`
  writeFileSync(resolve(destination, 'transport-config.json'), JSON.stringify(config, null, 2) + '\n')
}
const schemas = {
  first: { type: 'object', properties: { status: { type: 'string', enum: ['TRANSPORT_OK'] } }, required: ['status'], additionalProperties: false },
  resumed: { type: 'object', properties: { status: { type: 'string', enum: ['RESUME_OK'] }, memory: { type: 'string' } }, required: ['status', 'memory'], additionalProperties: false },
}
for (const [name, schema] of Object.entries(schemas)) writeFileSync(resolve(app, 'task/' + name + '-schema.json'), JSON.stringify(schema))
const balanceBefore = await credits()
const relay = await startRelay({ selected, destination, label: `${slug}/transport-${number}`, port })
const metadata = { model: selected.id, provider: selected.provider, excludedFromMeasurements: true, startedAt: new Date().toISOString(), phases: [], passed: false, balanceBefore }
async function phase(name, prompt, session) {
  const log = createWriteStream(resolve(destination, name + '-events.jsonl'), { flags: 'wx' })
  const errorLog = createWriteStream(resolve(destination, name + '-stderr.log'), { flags: 'wx' })
  const flags = ['--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '--json', ...configArguments(config), ...(name === 'first' && !structuredFirst ? [] : ['--output-schema', resolve(app, 'task/' + name + '-schema.json')]), '--output-last-message', resolve(destination, name + '-response.json')]
  const args = session ? ['exec', 'resume', ...flags, session, '-'] : ['exec', ...flags, '--color', 'never', '-C', app, '-']
  const child = spawn(setup.cli.path, args, { cwd: app, env: { ...process.env, ...relay.env }, detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = ''; child.stdout.on('data', part => { out += part; log.write(part) }); child.stderr.pipe(errorLog)
  child.stdin.on('error', () => {}); child.stdin.end(prompt)
  let timedOut = false
  const terminate = () => { try { process.kill(-child.pid, 'SIGTERM') } catch {} }
  const timer = setTimeout(() => { timedOut = true; terminate() }, 120000)
  const killer = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL') } catch {} }, 130000)
  const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) }); clearTimeout(timer); clearTimeout(killer)
  await new Promise(done => log.end(done))
  const events = out.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)] } catch { return [] } })
  const thread = events.find(e => e.type === 'thread.started')?.thread_id
  const completed = events.some(e => e.type === 'turn.completed')
  let final = null
  if (existsSync(resolve(destination, name + '-response.json'))) { const raw = readFileSync(resolve(destination, name + '-response.json'), 'utf8'); try { final = JSON.parse(raw) } catch { final = raw } }
  const result = { name, code, timedOut, thread, completed, response: final }
  metadata.phases.push(result); writeFileSync(resolve(destination, 'result.json'), JSON.stringify(metadata, null, 2) + '\n')
  assert.equal(code, 0, 'CLI transport failed; inspect ' + destination)
  assert.ok(completed && thread && !timedOut, 'Incomplete transport probe')
  return result
}
try {
  const first = await phase('first', 'To je tehnični preizkus povezave, ne naloga Folio. Zapomni si kontrolno besedo cedar-river-58, vendar je ne zapisuj v datoteke in je zdaj ne ponavljaj. Uporabi exec_command: z node preveri, da process.env.MAG_RELAY_TOKEN in process.env.OPENROUTER_API_KEY nista določena v okolju ukaza, nato z node zapiši točno TRANSPORT_OK v docs/agent/transport.txt. Preberi datoteko z orodjem. Šele ko opraviš ta dejanja, odgovori ' + (structuredFirst ? 'z objektom JSON, status TRANSPORT_OK.' : 'TRANSPORT_OK.') + ' Ne izvajaj drugih nalog ali testov.')
  assert.equal(readFileSync(resolve(app, 'docs/agent/transport.txt'), 'utf8').trim(), 'TRANSPORT_OK')
  const resumed = await phase('resumed', 'Nadaljuj isti tehnični preizkus. Z orodjem preberi docs/agent/transport.txt. V končnem JSON navedi status RESUME_OK in v polju memory kontrolno besedo iz prvotnega poziva; ne ugibaj in je ne išči po drugih datotekah.', first.thread)
  assert.equal(resumed.thread, first.thread); assert.equal(resumed.response.memory, 'cedar-river-58')
  if (structuredFirst) {
    assert.equal(first.response.status, 'TRANSPORT_OK')
    for (const name of ['first', 'resumed']) {
      const events = readFileSync(resolve(destination, name + '-events.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse)
      assert.ok(events.some(event => event.item?.type === 'command_execution'), 'Schema turn must actually use a tool')
    }
  }
  metadata.passed = true
} finally {
  await relay.close(); metadata.finishedAt = new Date().toISOString(); metadata.balanceAfter = await credits()
  writeFileSync(resolve(destination, 'result.json'), JSON.stringify(metadata, null, 2) + '\n')
  console.log(JSON.stringify({ slug, passed: metadata.passed, phases: metadata.phases, spentUSD: metadata.balanceBefore.remainingUSD - metadata.balanceAfter.remainingUSD }))
}
