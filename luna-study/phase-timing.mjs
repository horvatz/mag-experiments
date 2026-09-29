// Post-hoc descriptive reporting only; never changes measured inputs or runs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study, '..')
const read = p => JSON.parse(readFileSync(p))
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex')
const comparison = read(resolve(study, 'analysis/comparison.json'))
const records = [], preparation = [], sources = []
const datasets = [
  ['astra', 'M/1.0', root, read(resolve(root, 'main-study/analysis/reporting-results.json'))],
  ['luna', 'L/1.0', resolve(study, 'runtime'), read(resolve(study, 'analysis/reporting-results.json'))],
]
function median(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
function observed(values) {
  const known = values.filter(Number.isFinite)
  return { count: values.length, known: known.length, missing: values.length - known.length, medianKnownSeconds: median(known) }
}
const prepNames = new Set(['constitution', 'specify', 'plan', 'tasks'])
for (const [model, collection, runtime, data] of datasets) {
  assert.equal(comparison.snapshots[model], data.generatedAt)
  for (const row of data.data) {
    const path = resolve(runtime, 'runs', row.id, 'execution.json'), execution = read(path)
    const source = relative(root, path)
    sources.push({ collection, id: row.id, source, sha256: hash(path) })
    const phases = execution.phases ?? [{ ...execution, name: 'single-session' }]
    phases.forEach((phase, index) => {
      const seconds = Number.isFinite(phase.elapsedSeconds) ? phase.elapsedSeconds : null
      assert(seconds === null || seconds >= 0)
      records.push({ model, collection, id: row.id, procedure: row.procedure, position: index + 1, phase: phase.name, status: phase.status ?? null, seconds, source })
    })
    if (row.procedure === 'C') {
      const docs = phases.filter(p => prepNames.has(p.name))
      const known = docs.length > 0 && docs.every(p => Number.isFinite(p.elapsedSeconds))
      const seconds = known ? docs.reduce((sum, p) => sum + p.elapsedSeconds, 0) : null
      preparation.push({
        model, collection, id: row.id, preparationPhasesRecorded: docs.length, preparationSeconds: seconds,
        implementationStarted: phases.some(p => p.name === 'implement'),
        initialImplementationCompleted: phases.some(p => p.name === 'implement' && p.status === 'completed'),
        convergenceStarted: phases.some(p => p.name === 'converge'),
      })
    }
  }
}
const keys = [...new Set(records.map(r => [r.model, r.procedure, r.phase].join('|')))].sort()
const groups = keys.map(key => {
  const [model, procedure, phase] = key.split('|'), selected = records.filter(r => r.model === model && r.procedure === procedure && r.phase === phase)
  const statuses = {}
  for (const r of selected) statuses[r.status ?? 'unknown'] = (statuses[r.status ?? 'unknown'] ?? 0) + 1
  return { model, procedure, phase, ...observed(selected.map(r => r.seconds)), statuses }
})
const preparationSummary = datasets.map(([model]) => {
  const selected = preparation.filter(r => r.model === model)
  return { model, ...observed(selected.map(r => r.preparationSeconds)), implementationStarted: selected.filter(r => r.implementationStarted).length, initialImplementationCompleted: selected.filter(r => r.initialImplementationCompleted).length, convergenceStarted: selected.filter(r => r.convergenceStarted).length }
})
assert.equal(sources.length, comparison.archived)
assert.equal(groups.reduce((sum, g) => sum + g.count, 0), records.length)
const result = {
  generatedAt: new Date().toISOString(), comparisonSnapshot: comparison.generatedAt, snapshots: comparison.snapshots,
  complete: comparison.complete, archived: sources.length,
  method: 'Naknadna opisna analiza arhivskih faz, dodana po 29 arhivih L/1.0; ni nov potrditveni kontrast ali vzročna analiza. Mediane uporabljajo samo znane čase in navajajo imenovalec. Vključeni so tudi časovno prekinjeni in neuspešni koraki.',
  groups, preparationSummary, records, preparation, sources,
}
const fmt = x => x === null ? '—' : x.toFixed(2).replace('.', ',')
const lines = ['# Čas arhiviranih faz', '', result.method, '',
  `Posnetek ${comparison.generatedAt}; ${comparison.archived}/144 skupnih arhivov. ${comparison.complete ? 'Obe zbirki zaključeni.' : 'Vmesni opis nepopolne zbirke.'}`, '',
  'Čas faze vključuje vse njene modelske korake. A je ena seja in je iz dnevnika ne razdeljujemo na navidezno primerljive vloge. Faze B/C imajo različne vsebine in omejitve. Mediana faz ni mediana celotnega postopka; vsota časov faz lahko zaradi prehodov odstopa od časa izvedbe. Kratka napaka dostopa ni hitro rešena naloga.', '',
  'Vključene so izvorno zabeležene faze iz execution.json. Izpeljane vrstice handoffs-and-orchestration iz starega izvoza M/1.0 niso dodatne modelske faze in tu niso vključene. Ena seja A je poimenovana single-session (v starem izvozu combined-agent-work).', '',
  '| Model | Pristop | Faza | Znani časi / zabeležene faze | Mediana znanih (s) | Statusi |',
  '| --- | --- | --- | --- | --- | --- |',
  ...groups.map(g => `| ${g.model} | ${g.procedure} | ${g.phase} | ${g.known}/${g.count} | ${fmt(g.medianKnownSeconds)} | ${Object.entries(g.statuses).map(([k, v]) => `${k}: ${v}`).join('; ')} |`), '',
  '## Priprava pri C', '',
  'Za vsako izvedbo C seštejemo zabeležene constitution, specify, plan in tasks. Vključimo tudi delno zaključeno pripravo, če se je postopek končal pred implementacijo. Če kateri od teh zabeleženih časov manjka, je vsota neznana. Nezačete faze se ne predstavljajo kot izmerjene ničle. Zato to ni primerjava samo uspešno pripravljenih izvedb niti ocena časa uspešne rešitve.', '',
  '| Model | Arhivi C | Znane vsote priprave | Mediana priprave (s) | Implement začet | Začetni implement completed | Converge začet |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...preparationSummary.map(g => `| ${g.model} | ${g.count} | ${g.known}/${g.count} | ${fmt(g.medianKnownSeconds)} | ${g.implementationStarted}/${g.count} | ${g.initialImplementationCompleted}/${g.count} | ${g.convergenceStarted}/${g.count} |`), '',
  'Vsi začetni implement koraki so šteti ne glede na funkcionalni rezultat oddaje. Iz časovne razčlenitve same ne sklepamo, kaj bi model dosegel z drugačnim razporedom časa. Medzbirčna primerjava vključuje razliko modela, CLI in obdobja.', '',
  'Posamezne vrstice, izvorne datoteke in njihovi SHA-256 so v [phase-timing.json](phase-timing.json). Formalne predaje in popravki so ločeno v [process-summary.md](process-summary.md).', '',
]
writeFileSync(resolve(study, 'analysis/phase-timing.json'), JSON.stringify(result, null, 2) + '\n')
writeFileSync(resolve(study, 'analysis/phase-timing.md'), lines.join('\n'))
console.log(JSON.stringify({ phaseTimingArchived: result.archived, phases: records.length, complete: result.complete }))
