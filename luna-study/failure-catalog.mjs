// Descriptive inventory of every archived non-strict result; no causal classification.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const study = dirname(fileURLToPath(import.meta.url))
const read = path => JSON.parse(readFileSync(path))
const results = read(resolve(study, 'analysis/reporting-results.json'))
const entries = []
for (const run of results.data) {
  if (run.strictSuccess) continue
  const evaluation = read(resolve(study, 'runtime/runs', run.id, 'evaluation-summary.json'))
  assert.equal(evaluation.id, run.id)
  const tests = evaluation.tests.filter(test => test.status !== 'expected')
  const grouped = new Map()
  for (const test of tests) {
    const key = JSON.stringify([test.title, test.status])
    if (!grouped.has(key)) grouped.set(key, { title: test.title, status: test.status, projects: [], firstErrorLines: [] })
    const group = grouped.get(key)
    group.projects.push(test.project)
    for (const error of test.errors ?? []) {
      const line = String(error).split('\n').find(line => line.trim())
      if (line && !group.firstErrorLines.includes(line)) group.firstErrorLines.push(line)
    }
  }
  const entry = {
    id: run.id, task: run.task, procedure: run.procedure, repetition: run.repetition,
    executionStatus: run.executionStatus, strictSuccess: run.strictSuccess,
    allowedChanges: run.allowedChanges, completeTestRun: run.completeTestRun,
    requirements: run.score, testsRecorded: evaluation.tests.length,
    testsExpected: evaluation.tests.filter(test => test.status === 'expected').length,
    testsWithoutPass: tests.length,
    failedChecks: evaluation.checks.filter(check => !check.passed).map(check => ({ name: check.name, exitCode: check.exitCode })),
    scenariosWithoutPass: [...grouped.values()],
    evidence: `runtime/runs/${run.id}/evaluation-summary.json`,
    executionEvidence: `runtime/runs/${run.id}/execution.json`,
  }
  assert.equal(entry.testsExpected + entry.testsWithoutPass, entry.testsRecorded)
  entries.push(entry)
}
const catalog = {
  collection: 'L/1.0', reportingSnapshot: results.generatedAt,
  archived: results.archived, planned: 72, complete: results.archived === 72,
  selection: 'All archived runs without strict success; no outcome-based subset within that population.',
  scope: 'Final archived evaluations only. Development failures and explanatory case reviews are separate. Missing or skipped tests are not inferred to be failures.',
  nonStrictCount: entries.length,
  testsWithoutPass: entries.reduce((total, entry) => total + entry.testsWithoutPass, 0),
  entries,
}
assert.equal(entries.length, results.data.filter(run => !run.strictSuccess).length)
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
const lines = [
  '# Odstopanja v končnih izidih L/1.0', '',
  `Posnetek: ${results.generatedAt}. Arhiviranih ${results.archived}/72, brez strogega uspeha ${entries.length}.`, '',
  'Popis zajame vse arhivirane oddaje brez strogega uspeha. Razlogov ne sklepa iz samega statusa; navaja dejanske končne izide in dokazne povezave. Razvojne odpovedi med delom modela so opisane ločeno v vsebinskih presojah in razvojnih primerih. Neizmerjena zahteva ali preskočen test nista samodejno neuspešna testa.', '',
  '| Oddaja | Status postopka | Dokazane zahteve | Uspešni / zabeleženi testi | Neuspešne končne kontrole |',
  '| --- | --- | --- | --- | --- |',
  ...entries.map(entry => `| [${entry.id}](../${entry.evidence}) | ${entry.executionStatus} | ${entry.requirements.passed}/${entry.requirements.total} | ${entry.testsExpected}/${entry.testsRecorded} | ${entry.failedChecks.map(check => esc(check.name)).join(', ') || '—'} |`),
]
for (const entry of entries) {
  const observedFailures = entry.requirements.requirements.filter(requirement => requirement.observed && !requirement.demonstrated)
  const unobserved = entry.requirements.requirements.filter(requirement => !requirement.observed)
  lines.push('', `## ${entry.id}`, '',
    `Status: ${entry.executionStatus}. Dovoljen obseg sprememb: ${entry.allowedChanges ? 'da' : 'ne'}. Celoten predvideni testni nabor: ${entry.completeTestRun ? 'da' : 'ne'}.`, '',
    `Opazovane, vendar nedokazane zahteve: ${observedFailures.map(requirement => requirement.id).join(', ') || '—'}. Neizmerjene zahteve: ${unobserved.map(requirement => requirement.id).join(', ') || '—'}.`, '',
    `Dokaza: [neodvisna ocena](../${entry.evidence}), [izvedba postopka](../${entry.executionEvidence}).`, '')
  if (entry.scenariosWithoutPass.length) {
    lines.push('| Končni scenarij | Zabeleženi status | Izvedbe | Prva vrstica napake |', '| --- | --- | --- | --- |')
    for (const scenario of entry.scenariosWithoutPass) lines.push(`| ${esc(scenario.title)} | ${esc(scenario.status)} | ${scenario.projects.map(esc).join(', ')} | ${scenario.firstErrorLines.map(esc).join('; ') || '—'} |`)
  } else {
    lines.push('V zabeleženih testih ni izida brez uspeha. Strogi uspeh lahko kljub temu manjka zaradi zaključka postopka, obsega sprememb, drugih kontrol ali nepopolnosti merjenja; glej zgornje podatke in dokaz izvedbe.')
  }
}
writeFileSync(resolve(study, 'analysis/failure-catalog.json'), JSON.stringify(catalog, null, 2) + '\n')
writeFileSync(resolve(study, 'analysis/failure-catalog.md'), lines.join('\n') + '\n')
