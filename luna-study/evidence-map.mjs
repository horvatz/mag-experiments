// Navigation for the reporting snapshot; reads only frozen inputs and archived outputs.
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url)), out = resolve(study, 'analysis')
const read = path => JSON.parse(readFileSync(path))
const data = read(resolve(out, 'reporting-results.json'))
const schedule = read(resolve(study, 'runtime/main-study/schedule.json')).runs
const rows = new Map(data.data.map(row => [row.id, row]))
const links = new Set()
function link(label, path) {
  assert(existsSync(resolve(out, path)), `Missing evidence: ${path}`)
  links.add(path)
  return `[${label}](${path})`
}
const lines = [
  '# Kazalo dokazov dodatnega eksperimenta Luna', '',
  `Posnetek ${data.generatedAt}: **${data.archived}/72 arhivov L/1.0**.`, '',
  'Identiteta meritve je par (zbirka, ID). Enaki ID-ji v zgodovinski zbirki M/1.0 so druge meritve. To kazalo povezuje samo Luna arhive; ' + link('kazalo Astre', '../../main-study/analysis/evidence-map.md') + ' ostaja ločeno.', '',
  'Vrstice so urejene po postopku in ponovitvi. Dejanski vrstni red je v ' + link('zamrznjenem razporedu', '../runtime/main-study/schedule.json') + '. Nearhivirana vrstica lahko že teče; glej ' + link('aktivno stanje', '../runtime/main-study/active.json') + '.', '',
  'Zahteve pomenijo neodvisno dokazane R01–R12. Strogi uspeh dodatno zahteva zaključen postopek in vsa preverjanja. Neznani čas in poraba ostaneta manjkajoča. Formalna AI-podprta neslepa presoja zajema vnaprej določene ponovitve 001. ' + link('Merila in omejitve', 'writing-guide.md') + '.', '',
  'Celovitost arhivov preverja ' + link('izvozna preverba', 'archive-verification.json') + '; ' + link('zahteve', 'requirement-data.csv') + ', ' + link('testni izidi', 'test-data.csv') + ' in ' + link('faze postopka', 'phase-data.csv') + ' so na voljo tudi v strojno berljivi obliki.', ''
]
for (const task of [...new Set(schedule.map(row => row.task))].sort()) {
  const input = `../runtime/tasks/${task}/instructions.md`
  const heading = readFileSync(resolve(out, input), 'utf8').split('\n').find(line => line.startsWith('# '))?.slice(2) ?? task
  lines.push(`## ${heading}`, '',
    link('Izvirne zahteve', input) + ' · ' + link('Razvojni scenariji', `../runtime/tasks/${task}/development.spec.ts`), '',
    '| Izvedba L/1.0 | Status | Zahteve | Strogi uspeh | Čas (s) | Dokazi |',
    '| --- | --- | --- | --- | --- | --- |')
  for (const planned of schedule.filter(row => row.task === task).sort((a, b) => a.id.localeCompare(b.id))) {
    const row = rows.get(planned.id)
    if (!row) { lines.push(`| ${planned.id} | še ni arhivirana | — | — | — | — |`); continue }
    const base = `../runtime/runs/${row.id}`
    const evidence = [link('ocena', `${base}/evaluation-summary.json`), link('proces', `${base}/execution.json`), link('arhiv', `${base}/archive-complete.json`), link('koda', `${base}/submission/src/App.tsx`)]
    for (const [label, suffix] of [['poraba', 'usage-observation.json'], ['predaja', 'submission/docs/agent/verification.md']]) {
      if (existsSync(resolve(out, base, suffix))) evidence.push(link(label, `${base}/${suffix}`))
    }
    lines.push(`| ${row.id} | ${row.executionStatus} | ${row.score.passed}/12 | ${row.strictSuccess ? 'da' : 'ne'} | ${row.elapsedSeconds == null ? '—' : row.elapsedSeconds.toFixed(3).replace('.', ',')} | ${evidence.join(' · ')} |`)
  }
  lines.push('', 'Vnaprej izbrane vsebinske presoje:', '')
  for (const procedure of ['A', 'B', 'C']) {
    const id = `${task}-${procedure}-001`, path = `reviews/${id}.json`
    if (!existsSync(resolve(out, path))) { lines.push(`- ${id}: presoja še ni opravljena.`); continue }
    const review = read(resolve(out, path))
    const unavailable = review.dimensions.every(item => item.score == null)
    lines.push(`- ${link(id, path)}: ${unavailable ? 'ocene manjkajo z navedenim razlogom' : review.reviewStatus === 'partial' ? 'delna presoja; odsotne dimenzije imajo naveden razlog' : 'pet ločenih ocen z utemeljitvami in dokazi'}.`)
  }
  lines.push('')
}
writeFileSync(resolve(out, 'evidence-map.md'), lines.join('\n'))
writeFileSync(resolve(out, 'evidence-map-verification.json'), JSON.stringify({ generatedAt: new Date().toISOString(), reportingSnapshot: data.generatedAt, archived: data.archived, linksChecked: links.size, passed: true }, null, 2) + '\n')
