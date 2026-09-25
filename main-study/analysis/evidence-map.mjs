// Navigation for writing; values come from the audited reporting snapshot.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function writeEvidenceMap(data, schedule, reviews, root, dir) {
  const catalog = JSON.parse(readFileSync(resolve(root, 'tasks/main-catalog.json'), 'utf8'))
  const records = new Map(data.data.map(row => [row.id, row]))
  const lines = [
    '# Kazalo dokazov po nalogah', '',
    `Posnetek ${data.generatedAt}: ${data.archived}/${data.planned} arhivov.`, '',
    'Kazalo povezuje vnaprej določene naloge z vsemi tremi ponovitvami. Vrstni red spodaj je po postopku in ponovitvi; dejanski vrstni red meritev je v [zamrznjenem razporedu](../schedule.json). Nearhivirana vrstica lahko pravkar teče; to kaže [aktivno stanje](../active.json).', '',
    'Zahteve pomenijo neodvisno dokazane R01–R12, strogi uspeh pa dodatno zahteva zaključen postopek in vsa preverjanja. Neznani čas ni nič. Vsebinska presoja je AI-podprta in neslepa ter zajema samo vnaprej izbrano ponovitev 001. [Merila in omejitve](writing-guide.md).', ''
  ]
  for (const task of catalog) {
    lines.push(`## ${task.id} — ${task.title}`, '',
      `[Izvirne zahteve](../../tasks/${task.id}/instructions.md) · [Razvojni scenariji](../../tasks/${task.id}/development.spec.ts)`, '',
      '| Izvedba | Status | Zahteve | Strogi uspeh | Čas (s) | Dokazi |',
      '| --- | --- | --- | --- | --- | --- |')
    const planned = schedule.runs.filter(row => row.task === task.id)
      .sort((a, b) => a.procedure.localeCompare(b.procedure) || a.repetition - b.repetition)
    for (const plan of planned) {
      const row = records.get(plan.id)
      if (!row) { lines.push(`| ${plan.id} | še ni arhiva | — | — | — | — |`); continue }
      const base = `runs/${row.id}`
      const files = [['ocena', 'evaluation-summary.json'], ['proces', 'execution.json'],
        ['poraba', 'usage-observation.json'], ['koda', 'submission/src/App.tsx'],
        ['predaja', 'submission/docs/agent/verification.md']]
      const links = files.filter(([, file]) => existsSync(resolve(root, base, file)))
        .map(([label, file]) => `[${label}](../../${base}/${file})`).join(' · ')
      lines.push(`| ${row.id} | ${row.executionStatus} | ${row.score.passed}/12 | ${row.strictSuccess ? 'da' : 'ne'} | ${Number.isFinite(row.elapsedSeconds) ? row.elapsedSeconds.toFixed(3).replace('.', ',') : '—'} | ${links} |`)
    }
    lines.push('', 'Vsebinske presoje izbranih oddaj:', '')
    for (const procedure of ['A', 'B', 'C']) {
      const id = `${task.id}-${procedure}-001`, review = reviews.find(row => row.id === id)
      lines.push(review
        ? `- [${id}](reviews/${id}.json): ${review.reviewStatus === 'unavailable' ? 'možnost ocene je preverjena; ocene manjkajo z navedenim razlogom' : 'pet ločenih ocen z utemeljitvami in konkretnimi dokazi'}.`
        : `- ${id}: presoja še ni opravljena.`)
    }
    lines.push('')
  }
  lines.push('Naknadno izbrani primeri drugih ponovitev so v [razvojnih primerih](development-cases.md); ločeni pregledi po oddaji so v [diagnostičnih dokazih](diagnostics/README.md). Niso dodatne formalne ocene ali nova primarna merila.', '')
  writeFileSync(resolve(dir, 'evidence-map.md'), lines.join('\n'))
}
