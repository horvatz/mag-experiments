import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { schedule, requirementScore, pairedInterval } from './main-design.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), output = resolve(root, 'main-study/analysis')
mkdirSync(output, { recursive: true })
const design = schedule(), data = []
for (const run of design.runs) {
  const folder = resolve(root, 'runs', run.id), file = resolve(folder, 'evaluation-summary.json')
  if (!existsSync(file)) continue
  const summary = JSON.parse(readFileSync(file)), execution = JSON.parse(readFileSync(resolve(folder, 'execution.json')))
  const testDir = resolve(folder, 'submission/tests/agent')
  const files = path => existsSync(path) ? readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(resolve(path, entry.name)) : [resolve(path, entry.name)]) : []
  data.push({ ...run, executionStatus: summary.executionStatus, elapsedSeconds: summary.elapsedSeconds, strictSuccess: summary.allChecksPassed,
    allowedChanges: summary.allowedChanges, completeTestRun: summary.completeTestRun, score: requirementScore(summary), groups: summary.groups,
    checks: summary.checks.map(({ name, passed }) => ({ name, passed })), usage: summary.usage, usageComplete: summary.usageComplete,
    observedUsageBeforeInterruption: summary.observedUsageBeforeInterruption, phases: execution.phases?.map(({ name, elapsedSeconds, status }) => ({ name, elapsedSeconds, status })) ?? [],
    changedFiles: execution.fileChanges?.length ?? null, ownTestFiles: files(testDir).filter(f => /\.(spec|test)\.[jt]sx?$/.test(f)).length,
    contentReviewSample: run.repetition === 1, evidence: `runs/${run.id}/evaluation-summary.json` })
}
const average = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
const groups = ['A', 'B', 'C'].map(procedure => {
  const rows = data.filter(row => row.procedure === procedure), known = rows.filter(row => row.usageComplete && row.usage)
  return { procedure, archived: rows.length, planned: 24, strictSuccesses: rows.filter(row => row.strictSuccess).length,
    meanDemonstratedFraction: average(rows.map(row => row.score.fraction)), meanElapsedSeconds: average(rows.map(row => row.elapsedSeconds)),
    completeUsageCount: known.length, meanInputTokensCompleteOnly: average(known.map(row => row.usage.input_tokens)), meanOutputTokensCompleteOnly: average(known.map(row => row.usage.output_tokens)) }
})
const complete = data.length === 72, byTask = []
for (let n = 3; n <= 10; n++) for (const procedure of ['A', 'B', 'C']) {
  const task = 'P' + String(n).padStart(2, '0'), rows = data.filter(row => row.task === task && row.procedure === procedure)
  byTask.push({ task, procedure, count: rows.length, meanDemonstratedFraction: average(rows.map(row => row.score.fraction)), meanElapsedSeconds: average(rows.map(row => row.elapsedSeconds)) })
}
const comparisons = []
if (complete) for (const [first, second] of [['A', 'B'], ['A', 'C'], ['B', 'C']]) for (const metric of ['meanDemonstratedFraction', 'meanElapsedSeconds']) {
  const differences = byTask.filter(row => row.procedure === first).map(row => row[metric] - byTask.find(other => other.task === row.task && other.procedure === second)[metric])
  comparisons.push({ first, second, metric, ...pairedInterval(differences) })
}
const result = { generatedAt: new Date().toISOString(), complete, archived: data.length, planned: 72, missing: design.runs.filter(run => !data.some(row => row.id === run.id)).map(run => run.id), groups, byTask, comparisons, data }
writeFileSync(resolve(output, 'results.json'), JSON.stringify(result, null, 2) + '\n')
const fmt = value => value === null ? '—' : value.toFixed(2)
const lines = ['# Glavna zbirka P03–P10', '', `Arhiviranih je ${data.length} od 72 vnaprej določenih izvedb. ${complete ? 'Zbirka je popolna.' : 'Zbirka je nepopolna; skupinski podatki so le sprotni opis in še niso uravnotežena primerjava.'}`, '',
  '| Postopek | Arhivirano | Strogi uspehi | Dokazane zahteve, povprečni delež | Čas, povprečje s | Popolna poraba |', '| --- | --- | --- | --- | --- | --- |',
  ...groups.map(g => `| ${g.procedure} | ${g.archived}/24 | ${g.strictSuccesses} | ${fmt(g.meanDemonstratedFraction)} | ${fmt(g.meanElapsedSeconds)} | ${g.completeUsageCount}/${g.archived} |`), '',
  'Vsaka zahteva potrebuje uspeh na obeh velikostih zaslona. Neopaženo preverjanje pomeni nedokazano zahtevo, ne potrjene funkcionalne napake. Strogi uspeh zahteva še zaključek postopka, dovoljene spremembe, lint, tipe, gradnjo in vseh 70 preverjanj.', '',
  'Vhodni tokeni vključujejo predpomnjene, izhodni vključujejo reasoning. Nepopolna poraba je null in ima ločeno opaženo spodnjo mejo. Povprečja popolne porabe ne vključujejo manjkajočih vrednosti in so lahko selektivna. Tokenov ne pretvarjamo v evre.', '',
  '| Izvedba | Status postopka | Zahteve | Opažene zahteve | Sekunde | Strogi uspeh |', '| --- | --- | --- | --- | --- | --- |',
  ...data.map(r => `| [${r.id}](../../runs/${r.id}/report.md) | ${r.executionStatus} | ${r.score.passed}/12 | ${r.score.observed}/12 | ${r.elapsedSeconds} | ${r.strictSuccess ? 'da' : 'ne'} |`), '',
  ...(complete ? ['## Parne razlike po nalogah', '', '| Primerjava | Mera | Razlika | 95 % percentilni interval |', '| --- | --- | --- | --- |', ...comparisons.map(c => `| ${c.first} − ${c.second} | ${c.metric} | ${fmt(c.meanDifference)} | ${fmt(c.lower)} do ${fmt(c.upper)} |`), '', 'Opisni intervali ponovno vzorčijo osem nalog; ne posameznih zahtev ali testov. Seme in 20.000 ponovitev sta določena pred meritvami.', ''] : []),
  'Vsebinska rubrika, človeška presoja in pisanje interpretacije so ločeni koraki; prisotnost testov ali dokumentov ni samodejna ocena njihove kakovosti.', '']
writeFileSync(resolve(output, 'results.md'), lines.join('\n'))
console.log(JSON.stringify({ archived: data.length, planned: 72, complete }))
