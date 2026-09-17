import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2] || 'P01-A-001'
assert.match(id, /^P01-[AB]-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const target = resolve(root, 'runs', id)
assert.ok(!existsSync(target), 'Do not overwrite a recorded run')
const summary = JSON.parse(readFileSync(resolve(run, 'evaluation-summary.json'), 'utf8'))
assert.notEqual(summary.executionStatus, 'running')
mkdirSync(target, { recursive: true })
for (const file of ['execution.json', 'evaluation-summary.json', 'prompt.md', 'config.json', 'procedure-b.json', 'browser.sb', 'last-message.md', 'preflight-filesystem.json', 'preflight-roles.json', 'preflight-runtime.log', 'network-audit.json']) {
  if (existsSync(resolve(run, file))) cpSync(resolve(run, file), resolve(target, file))
}
for (const file of ['manifest.json', 'final-inventory.json', 'events.jsonl', 'stderr.log', 'preflight-prompt.json', 'evaluation-results.json']) {
  if (existsSync(resolve(run, file))) writeFileSync(resolve(target, file + '.gz'), gzipSync(readFileSync(resolve(run, file))))
}
for (const name of ['lint', 'types', 'build', 'tests']) {
  const path = resolve(run, 'evaluation-' + name + '.log')
  if (existsSync(path)) cpSync(path, resolve(target, 'evaluation-' + name + '.log'))
}
cpSync(resolve(run, 'submission'), resolve(target, 'submission'), { recursive: true })
if (existsSync(resolve(run, 'protocol'))) cpSync(resolve(run, 'protocol'), resolve(target, 'protocol-at-launch'), { recursive: true })
if (existsSync(resolve(run, 'phases'))) {
  cpSync(resolve(run, 'phases'), resolve(target, 'phases'), { recursive: true })
  for (const folder of readdirSync(resolve(target, 'phases'))) for (const file of ['events.jsonl', 'stderr.log']) {
    const path = resolve(target, 'phases', folder, file)
    if (existsSync(path)) { writeFileSync(path + '.gz', gzipSync(readFileSync(path))); rmSync(path) }
  }
  for (const role of ['specification', 'implementation', 'review']) {
    const name = 'preflight-prompt-' + role + '.json'
    if (existsSync(resolve(run, name))) writeFileSync(resolve(target, name + '.gz'), gzipSync(readFileSync(resolve(run, name))))
  }
}
mkdirSync(resolve(target, 'input-overrides'))
for (const file of ['AGENTS.md', 'playwright.config.ts', 'task']) cpSync(resolve(run, 'app', file), resolve(target, 'input-overrides', file), { recursive: true })
const minutes = Math.floor(summary.elapsedSeconds / 60)
const seconds = Math.round(summary.elapsedSeconds % 60)
const group = (name) => summary.groups[name] ? summary.groups[name].passed + '/' + summary.groups[name].total : 'ni podatka'
const text = [
  '# Pilot P01, postopek ' + summary.procedure,
  '',
  summary.procedure === 'B' ? 'Trije agenti so si zaporedno predali pripravo specifikacije, implementacijo in pregled. Morebitne popravke opravita prvotna avtorja.' : 'En agent je iz navodil pripravil specifikacijo, implementacijo urejanja opravila in lastna preverjanja.',
  'Referenčne rešitve in končnih testov med delom ni imel na voljo.',
  '',
  '| Podatek | Rezultat |', '| --- | --- |',
  '| Model | ' + summary.model + ' (' + summary.reasoningEffort + ') |',
  '| Zaključek | ' + summary.executionStatus + ' |',
  '| Čas agenta | ' + minutes + ' min ' + seconds + ' s; omejitev 20 min |',
  '| Osnovna preverjanja | ' + group('regression') + ' |',
  '| Razvojna preverjanja P01 | ' + group('development') + ' |',
  '| Končna preverjanja P01 | ' + group('holdout') + ' |',
  '| Dovoljene spremembe | ' + (summary.allowedChanges ? 'Da' : 'Ne; glej execution.json') + ' |',
  '| Slog, tipi in gradnja | ' + (summary.checks.filter((item) => item.name !== 'tests').every((item) => item.passed) ? 'Uspešno' : 'Glej evaluation-summary.json') + ' |',
  '',
  'Čas vključuje specifikacijo, kodo in preverjanje agenta. Priprava okolja in končna ocena nista vključeni.',
  'Osnovna aplikacija mag-app ostaja pri pripetem commitu; izdelek pilota je shranjen ločeno v submission/.',
  '',
  'Poraba, kot jo je vrnil CLI: ' + (summary.usage ? JSON.stringify(summary.usage) : 'podatek ni na voljo') + '.',
  ...(summary.usageNote ? [summary.usageNote] : []),
  'Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.',
  '',
  ...(summary.phases ? ['## Faze', '', '| Faza | Čas | Zaključek |', '| --- | --- | --- |',
    ...summary.phases.map((phase) => '| ' + phase.name + ' | ' + phase.elapsedSeconds + ' s | ' + phase.status + ' |'), '',
    'Vsaka mapa v phases/ vsebuje točen poziv, nastavitve, rezultate, stisnjen dnevnik in predajo ob koncu faze.',
    'Skupni čas vključuje tudi samodejne predaje med fazami.', '',
    '[Vnaprej določen protokol B](../../docs/pilot-b-protocol.md) opisuje vloge, omejitve in obravnavo popravkov.', '',] : []),
  'Rezultat velja za eno izvedbo pilotne naloge. Ne dokazuje prednosti postopka ' + summary.procedure + ', popolnosti testov ali pravilnosti za vsa mogoča stanja.',
  'Mobilna preverjanja so emulacija v Chromiumu.',
  '',
  'Navodila in nastavitve so ob poročilu. Stisnjena izpisa dogodkov in datotek ohranjata sled izvedbe.',
  'Vhodne datoteke aplikacije določa baseline v evaluation-summary.json; posebnosti izvoza so v input-overrides/.',
  'Natančen opis okolja je v ../../docs/pilot-protocol.md. Shranjena konfiguracija in dnevnik te izvedbe imata prednost pred poznejšimi izboljšavami izvajalnika.',
  '',
].join('\n')
writeFileSync(resolve(target, 'report.md'), text)
console.log('Archived ' + id + ' in runs/' + id)
