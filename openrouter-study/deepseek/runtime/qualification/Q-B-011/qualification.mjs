import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { inventory, changes, digest, clientEnvironment, configArguments } from './pilot-utils.mjs'
import { runBWorkflow, workerArguments, roleConfiguration, roleCanEdit, reviewSchema, parseReview } from './procedure-b.mjs'
import { runCWorkflow, stageConfiguration, stageCanEdit, convergenceSchema, parseConvergence } from './procedure-c.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kind = process.argv[2], number = process.argv[3] || '001'
assert.ok(['B', 'C', 'I'].includes(kind)); assert.match(number, /^\d{3}$/)
const id = `Q-${kind}-${number}`, exportId = `P02-${kind === 'I' ? 'A' : kind}-${900 + Number(number)}`
const exported = resolve(root, '.work/pilots', exportId), app = resolve(exported, 'app')
const run = resolve(root, 'qualification', id)
assert.ok(!existsSync(run), 'Never overwrite a qualification attempt')
assert.ok(existsSync(resolve(exported, 'manifest.json')), 'Prepare ' + exportId + ' first')
mkdirSync(run, { recursive: true })
const base = JSON.parse(readFileSync(resolve(exported, 'config.json')))
const manifest = JSON.parse(readFileSync(resolve(exported, 'manifest.json')))
const requirements = ['R01', 'R02'], feature = 'docs/agent/P02'
const schema = kind === 'C' ? convergenceSchema : structuredClone(reviewSchema)
if (kind !== 'C') schema.properties.checkedRequirements.items.enum = requirements
writeFileSync(resolve(app, 'task/qualification-schema.json'), JSON.stringify(schema, null, 2))
writeFileSync(resolve(app, 'task/instructions.md'), `# Tehnična naloga Q\nR01: export function shift(values: readonly number[]): number[] v src/qualification.ts vrne novo polje s povečavo vsake vrednosti za 1.\nR02: vhod ostane nespremenjen. Prazno polje vrne novo prazno polje.\nTo je tehničen preizkus predaje, ne implementacija vmesnika Folio. Ne izvajaj brskalniških testov ali gradnje. Uporabi samo node task/qualification-check.mjs. Dokumentacija naj bo kratka. V specifikaciji zapiši točno vrstico: Q01: result[i] = input[i] + 1\n`)
writeFileSync(resolve(app, 'task/qualification-check.mjs'), `import assert from 'node:assert/strict';\nimport { shift } from '../src/qualification.ts';\nfor (const values of [[0, 4, -2], [], [3, 3]]) { const before = [...values]; const out = shift(values); assert.deepEqual(out, before.map(v => v + 1)); assert.deepEqual(values, before); assert.notEqual(out, values); }\nconsole.log('QUALIFICATION_CHECK_PASSED');\n`)
writeFileSync(resolve(app, 'AGENTS.md'), '# Technical qualification\nFollow only the assigned role and task/instructions.md. Do not launch other agents. All pre-existing Folio UI files are outside this small task. Never change infrastructure, dependencies, task/ files, or another role’s artifacts.\n')
cpSync(resolve(root, 'docs/qualification-protocol.md'), resolve(run, 'protocol.md'))
for (const f of ['qualification.mjs', 'procedure-b.mjs', 'procedure-c.mjs', 'pilot-utils.mjs']) cpSync(resolve(root, 'scripts', f), resolve(run, f))
const baseline = inventory(app), keys = { specification: 'amber-pine-47', implementation: 'silver-fern-82', agent: 'copper-birch-63', interrupted: 'violet-elm-19' }
const metadata = { id, kind, protocol: 'Q/1', exportId, model: base.model, reasoningEffort: base.model_reasoning_effort, cliVersion: manifest.cliVersion, startedAt: new Date().toISOString(), status: 'running', phases: [], sessions: {}, injections: [], successful: false }
const persist = () => writeFileSync(resolve(run, 'execution.json'), JSON.stringify(metadata, null, 2) + '\n')
persist()
const started = performance.now(), deadline = Date.now() + 900_000
const common = `To je majhna tehnična kvalifikacija izvajalnika Q, ne polna naloga Folio. Preberi task/instructions.md. Dokumente ohrani zelo kratke. Uporabi samo src/qualification.ts, docs/agent/ in dovoljene procesne datoteke; spoštuj meje dodeljene vloge. Izvedba testa je node task/qualification-check.mjs. Ne uporabljaj brskalnika, javnega interneta ali drugih agentov. Končaj takoj, ko opraviš korak.\n`
const instructions = {
  specification: 'Pripravi docs/agent/specification.md z obema zahtevama in točno zahtevano vrstico Q01. Kode ne piši.',
  implementation: 'Preberi specifikacijo, implementiraj funkcijo shift v src/qualification.ts, zaženi javni test in zapiši kratek docs/agent/verification.md. Specifikacije ne spreminjaj.',
  review: 'Neodvisno primerjaj specifikacijo in kodo z izvirnima R01 in R02 v task/instructions.md. Izvedi javni test. Piši samo review.md/review.json. Napake specifikacije in kode navedi kot ločene findings z ustreznim target. Končni odgovor mora biti objekt po shemi, complete true, checkedRequirements R01 in R02; o dejanskih potrebnih popravkih odloči po pregledu.',
  'specification-repair': 'Nadaljuj kot prvotni avtor specifikacije. Preberi docs/agent/review.json, popravi utemeljene napake specifikacije in zapiši specification-history.md. Kode ne spreminjaj.',
  'implementation-repair': 'Nadaljuj kot prvotni implementer. Preberi docs/agent/review.json in trenutno specifikacijo z zgodovino. Popravi utemeljene napake v src/qualification.ts, zaženi javni test in dopolni verification.md. Specifikacije in pregleda ne spreminjaj.',
  constitution: 'Preberi .agents/skills/speckit-constitution/SKILL.md in zapiši kratka načela za obe zahtevi v .specify/memory/constitution.md. Brez kode.',
  specify: 'Preberi .agents/skills/speckit-specify/SKILL.md. Izdelaj kratek docs/agent/P02/spec.md za R01/R02 s točno vrstico Q01 iz navodil in nastavi .specify/feature.json. Brez kode.',
  plan: 'Preberi .agents/skills/speckit-plan/SKILL.md. Zapiši zelo kratek docs/agent/P02/plan.md: funkcija in javni test, brez nove infrastrukture.',
  tasks: 'Preberi .agents/skills/speckit-tasks/SKILL.md. Zapiši docs/agent/P02/tasks.md z dvema kratkima nalogama - [ ] T001 implementacija src/qualification.ts in - [ ] T002 javni test ter verification.md.',
  implement: 'Preberi .agents/skills/speckit-implement/SKILL.md, dokumente P02 in naloge. Izvedi tudi morebitne pripete nove naloge, implementiraj src/qualification.ts, preveri z javnim testom in zapiši verification.md. Označi samo dejansko izvedene naloge.',
  converge: 'Preberi .agents/skills/speckit-converge/SKILL.md in izvedi uradni pregled. Zaženi javni test. Kode ne spreminjaj. Ob napaki na konec tasks.md pripni novo neopravljeno nalogo z naslednjim T-ID in oddaj tasks_appended. Če je pravilno, ohrani tasks.md in oddaj converged. Končni odgovor mora biti po dani JSON shemi.',
  interrupted: 'V enem kratkem sporočilu povej, da začenjaš tehnično preverjanje prekinitve. Nato zaženi node -e "console.log(\'Q_WAIT_STARTED\'); setTimeout(() => {}, 600000)" in počakaj na ta ukaz. Ne izvajaj drugih dejanj.',
}
function usageEvents(session, before = Infinity) {
  let names
  try { names = execFileSync('rg', ['--files', '--hidden', resolve(homedir(), '.codex/sessions'), '-g', '*' + session + '*'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean) } catch { return [] }
  if (names.length !== 1) return []
  return readFileSync(names[0], 'utf8').split('\n').flatMap(line => { try { const e = JSON.parse(line); return e.type === 'event_msg' && e.payload?.type === 'token_count' && e.payload.info?.total_token_usage && Date.parse(e.timestamp) <= before ? [{ timestamp: e.timestamp, usage: e.payload.info.total_token_usage }] : [] } catch { return [] } })
}
function inject() {
  metadata.beforeInjectionCheck = execFileSync(process.execPath, [resolve(app, 'task/qualification-check.mjs')], { cwd: app, encoding: 'utf8' }).trim()
  assert.equal(metadata.beforeInjectionCheck, 'QUALIFICATION_CHECK_PASSED')
  const files = ['src/qualification.ts', ...(kind === 'B' ? ['docs/agent/specification.md'] : [])]
  const index = metadata.injections.length + 1, record = { index, at: new Date().toISOString(), reason: 'Predeclared Q/1 +2 fault after first completed implementation.', files: [] }
  for (const path of files) {
    const before = readFileSync(resolve(app, path), 'utf8')
    const after = path.startsWith('src/') ? 'export function shift(values: readonly number[]): number[] { return values.map(value => value + 2) }\n' : before.replace('Q01: result[i] = input[i] + 1', 'Q01: result[i] = input[i] + 2')
    assert.notEqual(before, after, 'Fault injection must modify its target')
    const out = resolve(run, 'injection-' + index, path); mkdirSync(dirname(out), { recursive: true }); writeFileSync(out + '.before', before); writeFileSync(out + '.after', after)
    writeFileSync(resolve(app, path), after)
    record.files.push({ path, beforeSha256: digest(before), afterSha256: digest(after) })
  }
  metadata.injections.push(record); persist()
}
let implementationPasses = 0, convergence
async function phase(name, suppliedRole, suppliedResume) {
  const role = kind === 'C' ? 'agent' : suppliedRole || 'interrupted'
  const resumed = kind === 'C' ? Boolean(metadata.sessions[role]) : Boolean(suppliedResume)
  if ((name === 'review' || name === 'converge') && metadata.injections.length === 0) inject()
  const folder = resolve(run, 'phases', String(metadata.phases.length + 1).padStart(2, '0') + '-' + name); mkdirSync(folder, { recursive: true })
  const config = kind === 'C' ? stageConfiguration(base, app, name, feature) : kind === 'B' ? roleConfiguration(base, app, role) : structuredClone(base)
  const prompt = common + instructions[name] + (resumed ? '\nV končnem odgovoru navedi kontrolno besedo iz svoje prvotne seje (pri JSON jo vključi v summary). Ne ugibaj, če je ne pomniš.\n' : `\nZapomni si neobčutljivo kontrolno besedo ${keys[role] || 'review-no-resume'}. Ne zapiši je v datoteke in je zdaj ne ponavljaj. Poznejše nadaljevanje te bo vprašalo po njej.\n`)
  writeFileSync(resolve(folder, 'prompt.md'), prompt); writeFileSync(resolve(folder, 'config.json'), JSON.stringify(config, null, 2))
  const before = inventory(app), beforeTasks = name === 'converge' ? readFileSync(resolve(app, feature, 'tasks.md'), 'utf8') : null
  const structured = name === 'review' || name === 'converge'
  const args = workerArguments({ configArgs: configArguments(config), app, session: resumed ? metadata.sessions[role] : undefined, review: structured, schema: resolve(app, 'task/qualification-schema.json'), output: resolve(folder, 'final-response.json') })
  const record = { name, role, resumed, startedAt: new Date().toISOString(), status: 'running', usage: null }
  metadata.phases.push(record); persist(); console.log(id + ': ' + name)
  const now = performance.now(), child = spawn(manifest.cli, args, { cwd: app, env: clientEnvironment(config), detached: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let output = '', errors = '', buffer = '', completed = false, failed = false, reason, commandWaiting = false, lastMessage = '', descendants = []
  function tree() { try { const rows = execFileSync('/bin/ps', ['-axo', 'pid=,ppid='], { encoding: 'utf8' }).trim().split('\n').map(l => l.trim().split(/\s+/).map(Number)); if (!rows.some(([pid]) => pid === child.pid)) return; const found = new Set([child.pid]); let more = true; while (more) { more = false; for (const [pid, parent] of rows) if (found.has(parent) && !found.has(pid)) { found.add(pid); more = true } } descendants = [...found].filter(p => p !== child.pid) } catch {} }
  function cleanup() { tree(); for (const pid of descendants.toReversed()) try { process.kill(pid, 'SIGSTOP') } catch {} ; try { process.kill(-child.pid, 'SIGKILL') } catch {} ; for (const pid of descendants) try { process.kill(pid, 'SIGKILL') } catch {} }
  function stop(why) { reason ||= why; cleanup() }
  function line(text) {
    let e; try { e = JSON.parse(text) } catch { return }
    if (e.type === 'thread.started') { if (resumed) assert.equal(e.thread_id, metadata.sessions[role]); metadata.sessions[role] = e.thread_id; record.threadId = e.thread_id; persist() }
    if (e.type === 'turn.completed') { completed = true; record.usage = e.usage }
    if (e.type === 'turn.failed' || e.type === 'error') failed = true
    if (e.type === 'item.started' && e.item?.type === 'command_execution' && e.item.command.includes('Q_WAIT_STARTED')) commandWaiting = true
    if (e.type === 'item.completed' && e.item?.type === 'agent_message') lastMessage = e.item.text
  }
  child.stdin.on('error', () => {}); child.stdin.end(prompt)
  child.stdout.on('data', part => { output += part; buffer += part; let end; while ((end = buffer.indexOf('\n')) >= 0) { line(buffer.slice(0, end)); buffer = buffer.slice(end + 1) } })
  child.stderr.on('data', part => { errors += part })
  const timer = setTimeout(() => stop('time_limit'), Math.max(1, Math.min(120_000, deadline - Date.now())))
  const watch = setInterval(() => { tree(); if (kind === 'I' && commandWaiting && record.threadId && usageEvents(record.threadId).length) stop('controlled_interruption') }, 1000)
  const ended = await new Promise(done => { child.once('error', error => done({ error: error.message })); child.once('close', (exitCode, signal) => done({ exitCode, signal })) })
  clearTimeout(timer); clearInterval(watch); cleanup(); if (buffer) line(buffer)
  record.finishedAt = new Date().toISOString(); record.elapsedSeconds = Number(((performance.now() - now) / 1000).toFixed(3)); Object.assign(record, ended)
  record.status = reason || (completed && ended.exitCode === 0 && !failed ? 'completed' : 'execution_failed')
  writeFileSync(resolve(folder, 'events.jsonl'), output); writeFileSync(resolve(folder, 'stderr.log'), errors); writeFileSync(resolve(folder, 'last-message.md'), lastMessage)
  if (structured && record.status === 'completed') {
    const raw = readFileSync(resolve(folder, 'final-response.json'), 'utf8'), result = JSON.parse(raw)
    if (name === 'review') { parseReview(result, requirements); writeFileSync(resolve(app, 'docs/agent/review.json'), raw) }
    else { convergence = parseConvergence(result, beforeTasks, readFileSync(resolve(app, feature, 'tasks.md'), 'utf8')); writeFileSync(resolve(app, 'docs/agent/convergence.json'), raw); record.convergence = convergence }
  }
  const after = inventory(app)
  record.changes = changes(before, after, kind).map(c => ({ ...c, roleAllowed: kind === 'B' ? roleCanEdit(role, c.path) : kind === 'C' ? stageCanEdit(name, c.path, feature) : c.allowed }))
  record.allowedChanges = record.changes.every(c => c.roleAllowed)
  record.contextRetained = !resumed || lastMessage.includes(keys[role])
  record.tokenObservations = record.threadId ? usageEvents(record.threadId, Date.parse(record.finishedAt)) : []
  writeFileSync(resolve(folder, 'result.json'), JSON.stringify(record, null, 2))
  for (const path of ['src/qualification.ts', 'docs/agent', ...(kind === 'C' ? ['.specify/memory/constitution.md', '.specify/feature.json'] : [])]) if (existsSync(resolve(app, path))) { mkdirSync(dirname(resolve(folder, 'submission', path)), { recursive: true }); cpSync(resolve(app, path), resolve(folder, 'submission', path), { recursive: true }) }
  persist(); console.log(id + ': ' + name + ' ' + record.status + ' ' + record.elapsedSeconds + 's')
  if (name === 'implementation' || name === 'implement') implementationPasses++
  return record.status === 'completed' && record.allowedChanges && record.contextRetained
}
try {
  if (kind === 'B') metadata.outcome = await runBWorkflow({ phase, requirements, hasSpecification: () => existsSync(resolve(app, 'docs/agent/specification.md')), getReview: () => JSON.parse(readFileSync(resolve(app, 'docs/agent/review.json'))) })
  else if (kind === 'C') metadata.outcome = await runCWorkflow({ phase, getConvergence: () => convergence })
  else await phase('interrupted')
  if (kind !== 'I') {
    try { metadata.check = execFileSync(process.execPath, [resolve(app, 'task/qualification-check.mjs')], { cwd: app, encoding: 'utf8' }).trim() } catch (e) { metadata.check = e.stderr?.toString() || e.message }
    const sequence = metadata.phases.map(p => p.name)
    metadata.successful = metadata.check === 'QUALIFICATION_CHECK_PASSED' && metadata.phases.every(p => p.status === 'completed' && p.allowedChanges && p.contextRetained) && (kind === 'B' ? sequence.join(',') === 'specification,implementation,review,specification-repair,implementation-repair' : sequence.join(',') === 'constitution,specify,plan,tasks,implement,converge,implement,converge' && convergence.outcome === 'converged')
  } else {
    const p = metadata.phases[0]; metadata.successful = p.status === 'controlled_interruption' && !p.usage && p.tokenObservations.length > 0
  }
  metadata.status = metadata.successful ? 'passed' : 'failed'
} catch (error) { metadata.status = 'failed'; metadata.error = error.stack }
metadata.finishedAt = new Date().toISOString(); metadata.elapsedSeconds = Number(((performance.now() - started) / 1000).toFixed(3))
metadata.usageComplete = metadata.phases.every(p => p.status === 'completed' && p.usage && p.tokenObservations.at(-1) && Object.entries(p.usage).every(([key, value]) => p.tokenObservations.at(-1).usage[key] === value))
metadata.observedUsage = Object.values(metadata.sessions).map(session => usageEvents(session, Date.parse(metadata.finishedAt)).at(-1)?.usage).reduce((sum, u) => { if (u) for (const [k,v] of Object.entries(u)) sum[k] = (sum[k] || 0) + v; return sum }, {})
metadata.usage = metadata.usageComplete ? metadata.observedUsage : null
metadata.totalFileChanges = changes(baseline, inventory(app), kind)
persist(); console.log(JSON.stringify({ id, status: metadata.status, successful: metadata.successful, usageComplete: metadata.usageComplete, elapsedSeconds: metadata.elapsedSeconds }))
if (!metadata.successful) process.exitCode = 1
