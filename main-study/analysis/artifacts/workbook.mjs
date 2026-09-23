import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const out = resolve(root, 'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd')
const qa = resolve(root, 'main-study/analysis/artifacts/qa')
await fs.mkdir(out, { recursive: true }); await fs.mkdir(qa, { recursive: true })
const result = JSON.parse(await fs.readFile(resolve(root, 'main-study/analysis/reporting-results.json'), 'utf8'))
const schedule = JSON.parse(await fs.readFile(resolve(root, 'main-study/schedule.json'), 'utf8'))
assert.equal(schedule.runs.length, 72)
const byId = new Map(result.data.map(row => [row.id, row]))
const wb = Workbook.create(), overview = wb.worksheets.add('Pregled'), runs = wb.worksheets.add('Izvedbe')
const ink = '#172033', accent = '#334B75', light = '#EDF1F7', muted = '#546278'
function base(sheet, range) {
  sheet.showGridLines = false
  sheet.getRange(range).format.font = { name: 'Arial', size: 10, color: ink }
  sheet.getRange(range).format.rowHeight = 21
  sheet.getRange(range).format.verticalAlignment = 'center'
}
function heading(sheet, range) {
  sheet.getRange(range).format = { fill: accent, font: { name: 'Arial', size: 10, color: '#FFFFFF', bold: true }, wrapText: true }
  sheet.getRange(range).format.rowHeight = 42
}
base(overview, 'A1:H47'); base(runs, 'A1:W73')
overview.getRange('A1:H47').format.columnWidth = 17
overview.getRange('A1:A47').format.columnWidth = 22
overview.getRange('A2').values = [['Rezultati glavnih eksperimentov P03–P10']]
overview.getRange('A2:H2').format.font = { name: 'Arial', size: 16, bold: true, color: ink }
overview.getRange('A2:H2').format.rowHeight = 32
overview.getRange('A2:H2').format.borders = { bottom: { style: 'thin', color: accent } }
overview.getRange('A3').values = [[`${result.archived}/72 arhiviranih • stanje ${result.generatedAt.replace('T', ' ').slice(0, 19)} UTC`]]
overview.getRange('A4').values = [[result.complete ? 'Vse izvedbe so arhivirane; primerjave z manjkajočimi zahtevanimi meritvami so zadržane.' : 'Nepopolna zbirka. Spodnji podatki so sprotni opis; postopki še niso uravnoteženo primerljivi.']]
overview.getRange('A3:H4').format.font = { name: 'Arial', size: 10, color: muted }
overview.getRange('A6:H6').values = [['Postopek', 'Arhivirano / 24', 'Strogi uspehi', 'Dokazane zahteve', 'Povpr. čas (min)', 'Popolna poraba, n', 'Vhodni tokeni¹', 'Izhodni tokeni¹']]
heading(overview, 'A6:H6')

const rawHeaders = ['Izvedba', 'Naloga', 'Postopek', 'Ponovitev', 'Status postopka', 'Arhivirano (1/0)', 'Čas (s)', 'Dokazane / 12', 'Opažene / 12', 'Delež zahtev', 'Strogi uspeh (1/0)', 'Popolna poraba (1/0)', 'Vhodni tokeni', 'Predpomnjeni (del vhoda)', 'Izhodni tokeni', 'Opaženi vhod ≥', 'Opaženi izhod ≥', 'Lastne testne datoteke', 'Spremenjene datoteke', 'Blok', 'Mesto v bloku', null, 'Vir neodvisne ocene']
runs.getRange('A1:W1').values = [rawHeaders]
heading(runs, 'A1:U1'); heading(runs, 'W1:W1')
runs.getRange('A2:W73').values = schedule.runs.map(planned => {
  const r = byId.get(planned.id), u = r?.usage, p = r?.observedUsageBeforeInterruption
  return [planned.id, planned.task, planned.procedure, planned.repetition, r?.executionStatus ?? 'še ni arhivirano', r ? 1 : 0,
    r?.elapsedSeconds ?? null, r?.score.passed ?? null, r?.score.observed ?? null, null, r ? Number(r.strictSuccess) : null,
    r ? Number(r.usageComplete) : null, u?.input_tokens ?? null, u?.cached_input_tokens ?? null, u?.output_tokens ?? null,
    p?.input_tokens ?? null, p?.output_tokens ?? null, r?.ownTestFiles ?? null, r?.changedFiles ?? null, planned.block, planned.position, null,
    r ? resolve(root, r.evidence) : null]
})
runs.getRange('J2:J73').formulas = schedule.runs.map((_, i) => [`=IF(F${i + 2}=0,"",H${i + 2}/12)`])
runs.getRange('A1:U73').format.columnWidth = 17
runs.getRange('A1:A73').format.columnWidth = 19
runs.getRange('B1:D73').format.columnWidth = 12
runs.getRange('E1:E73').format.columnWidth = 22
runs.getRange('V1:V73').format.columnWidth = 3
runs.getRange('W1:W73').format.columnWidth = 105
runs.getRange('G2:G73').setNumberFormat('0.000')
runs.getRange('J2:J73').setNumberFormat('0.0%')
runs.getRange('M2:Q73').setNumberFormat('#,##0')
runs.freezePanes.freezeRows(1); runs.freezePanes.freezeColumns(1)
runs.tables.add('A1:U73', true, 'Meritve')

for (const [index, procedure] of ['A', 'B', 'C'].entries()) {
  const row = index + 7
  overview.getRange(`A${row}`).values = [[procedure]]
  overview.getRange(`B${row}:H${row}`).formulas = [[
    `=COUNTIFS('Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$F$2:$F$73,1)`,
    `=SUMIFS('Izvedbe'!$K$2:$K$73,'Izvedbe'!$C$2:$C$73,A${row})`,
    `=IF(B${row}=0,"",SUMIFS('Izvedbe'!$J$2:$J$73,'Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$F$2:$F$73,1)/B${row})`,
    `=IF(OR(B${row}=0,COUNTIFS('Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$F$2:$F$73,1,'Izvedbe'!$G$2:$G$73,"<>")<>B${row}),"",SUMIFS('Izvedbe'!$G$2:$G$73,'Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$F$2:$F$73,1)/B${row}/60)`,
    `=COUNTIFS('Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$L$2:$L$73,1)`,
    `=IF(F${row}=0,"",SUMIFS('Izvedbe'!$M$2:$M$73,'Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$L$2:$L$73,1)/F${row})`,
    `=IF(F${row}=0,"",SUMIFS('Izvedbe'!$O$2:$O$73,'Izvedbe'!$C$2:$C$73,A${row},'Izvedbe'!$L$2:$L$73,1)/F${row})`
  ]]
}
overview.getRange('D7:D9').setNumberFormat('0.0%')
overview.getRange('E7:E9').setNumberFormat('0.00')
overview.getRange('G7:H9').setNumberFormat('#,##0')
overview.getRange('A10').values = [['Časovno povprečje manjka, če vsaj en točni čas ni znan; neznan čas ni nič.']]
overview.getRange('A10:H10').format.font = { name: 'Arial', size: 10, color: muted }
overview.getRange('A11').values = [['¹ Povprečje le izvedb s popolno porabo; imenovalec je v stolpcu F. Manjkajoča poraba ni nič.']]
overview.getRange('A12').values = [['Vhod vključuje predpomnjene tokene. Opažene spodnje meje prekinjenih izvedb so ločene na listu Izvedbe.']]
overview.getRange('A14:H14').values = [['Naloga', 'A: n / 3', 'A: delež zahtev', 'B: n / 3', 'B: delež zahtev', 'C: n / 3', 'C: delež zahtev', 'Celoten blok?']]
heading(overview, 'A14:H14')
for (let i = 0; i < 8; i++) {
  const row = 15 + i, task = `P${String(i + 3).padStart(2, '0')}`
  overview.getRange(`A${row}`).values = [[task]]
  for (const [p, countCol, scoreCol] of [['A', 'B', 'C'], ['B', 'D', 'E'], ['C', 'F', 'G']]) {
    overview.getRange(`${countCol}${row}`).formulas = [[`=COUNTIFS('Izvedbe'!$B$2:$B$73,$A${row},'Izvedbe'!$C$2:$C$73,"${p}",'Izvedbe'!$F$2:$F$73,1)`]]
    overview.getRange(`${scoreCol}${row}`).formulas = [[`=IF(${countCol}${row}=0,"",SUMIFS('Izvedbe'!$J$2:$J$73,'Izvedbe'!$B$2:$B$73,$A${row},'Izvedbe'!$C$2:$C$73,"${p}",'Izvedbe'!$F$2:$F$73,1)/${countCol}${row})`]]
    overview.getRange(`${scoreCol}${row}`).setNumberFormat('0.0%')
  }
  overview.getRange(`H${row}`).formulas = [[`=IF(SUM(B${row},D${row},F${row})=9,"da","ne")`]]
}
overview.getRange('A24').values = [['Parne razlike po nalogah: 95-odstotni opisni intervali']]
overview.getRange('A24:H24').format.font = { name: 'Arial', size: 11, bold: true, color: accent }
if (result.complete) {
  overview.getRange('A25:E25').values = [['Primerjava', 'Mera', 'Razlika', 'Spodnja meja', 'Zgornja meja']]
  heading(overview, 'A25:E25')
  overview.getRange(`A26:E${25 + result.comparisons.length}`).values = result.comparisons.map(c => [`${c.first} − ${c.second}`, c.metric === 'meanElapsedSeconds' ? 'Čas (s)' : 'Delež zahtev', c.meanDifference, c.lower, c.upper])
  overview.getRange('C26:E31').setNumberFormat('0.000')
} else overview.getRange('A25').values = [['Še niso izračunani: zahtevajo vseh 72 arhiviranih izvedb.']]
const notes = [
  'Primarni izid: R01–R12; za dokaz zahteve morata uspeti namizni in mobilni scenarij.',
  'Neopažen test pomeni nedokazano zahtevo, ne potrjene funkcionalne napake.',
  'Strogi uspeh: zaključen postopek, dovoljene spremembe, lint, tipi, gradnja in vseh 70 preverjanj.',
  'P01, P02 in kvalifikacija so izločeni iz glavne primerjave. Vse začete glavne izvedbe se ohranijo.',
  'Analiza najprej povpreči tri ponovitve naloge. Intervali vzorčijo osem nalog, 20.000-krat.',
  'Poraba uporablja naročnino; tokeni niso denarni strošek. Preglednica ne vsebuje človeških ocen.',
  'Vir: main-study/analysis/reporting-results.json; razpored: main-study/schedule.json; dokazi ob vsaki izvedbi.',
  'Metodološka pravila: docs/main-protocol.md in docs/main-rubric.md (zamrznjeno pred meritvami).'
]
overview.getRange('A34').values = [['Branje podatkov']]
overview.getRange('A34:H34').format.font = { name: 'Arial', size: 11, bold: true, color: accent }
notes.forEach((note, i) => { overview.getRange(`A${35+i}`).values = [[note]] })
overview.getRange('A35:H42').format.font = { name: 'Arial', size: 10, color: muted }
overview.freezePanes.freezeRows(6)
wb.recalculate()
const values = overview.getRange('B7:H9').values
for (let i = 0; i < 3; i++) {
  const g = result.groups[i], v = values[i]
  assert.equal(v[0], g.archived); assert.equal(v[1], g.strictSuccesses); assert.equal(v[4], g.completeUsageCount)
  if (g.archived) { assert.ok(Math.abs(v[2] - g.meanDemonstratedFraction) < 1e-12); if (g.meanElapsedSeconds === null) assert.ok(v[3] === '' || v[3] === null); else assert.ok(Math.abs(v[3] - g.meanElapsedSeconds / 60) < 1e-9) }
  if (g.completeUsageCount) { assert.ok(Math.abs(v[5] - g.meanInputTokensCompleteOnly) < 1e-6); assert.ok(Math.abs(v[6] - g.meanOutputTokensCompleteOnly) < 1e-6) }
}
for (const r of result.byTask) {
  const row = 15 + Number(r.task.slice(1)) - 3, col = { A: 'B', B: 'D', C: 'F' }[r.procedure], score = { A: 'C', B: 'E', C: 'G' }[r.procedure]
  assert.equal(overview.getRange(`${col}${row}`).values[0][0], r.count)
  if (r.count) assert.ok(Math.abs(overview.getRange(`${score}${row}`).values[0][0] - r.meanDemonstratedFraction) < 1e-12)
}
// A reversible perturbation verifies the input → fraction → group-mean dependency.
if (result.data.length) {
  const first = result.data[0], rawRow = schedule.runs.findIndex(r => r.id === first.id) + 2
  const old = runs.getRange(`H${rawRow}`).values[0][0]
  runs.getRange(`H${rawRow}`).values = [[old === 0 ? 1 : old - 1]]
  wb.recalculate()
  assert.equal(runs.getRange(`J${rawRow}`).values[0][0], (old === 0 ? 1 : old - 1) / 12)
  const group = result.groups.find(g => g.procedure === first.procedure), groupRow = 7 + ['A', 'B', 'C'].indexOf(first.procedure)
  const expectedMean = group.meanDemonstratedFraction + (old === 0 ? 1 : -1) / 12 / group.archived
  assert.ok(Math.abs(overview.getRange(`D${groupRow}`).values[0][0] - expectedMean) < 1e-12)
  runs.getRange(`H${rawRow}`).values = [[old]]; wb.recalculate()
  assert.equal(runs.getRange(`J${rawRow}`).values[0][0], first.score.fraction)
}
for (const sheet of [overview, runs]) for (const row of sheet.getUsedRange().values) for (const value of row) {
  assert.ok(!(typeof value === 'string' && /#REF!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|e\.reduce is not a function/.test(value)), `Formula error: ${value}`)
}
const errors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!', options: { useRegex: true, maxResults: 100 }, maxChars: 4000 })
await fs.writeFile(resolve(qa, 'formula-errors.json'), JSON.stringify(errors, null, 2))
await fs.writeFile(resolve(qa, 'summary-inspection.json'), JSON.stringify(await wb.inspect({ kind: 'table', range: 'Pregled!A6:H9', include: 'values,formulas', tableMaxRows: 5, tableMaxCols: 8, maxChars: 6000 }), null, 2))
for (const [sheetName, range, name] of [['Pregled', 'A1:H27', 'pregled'], ['Pregled', 'A33:H43', 'pojasnila'], ['Izvedbe', 'A1:K9', 'izvedbe-izidi'], ['Izvedbe', 'L1:U9', 'izvedbe-poraba'], ['Izvedbe', 'V1:W9', 'izvedbe-viri']]) {
  const preview = await wb.render({ sheetName, range, scale: 1.2, format: 'png' })
  await fs.writeFile(resolve(qa, `${name}.png`), new Uint8Array(await preview.arrayBuffer()))
}
await (await SpreadsheetFile.exportXlsx(wb)).save(resolve(out, 'rezultati-eksperimentov.xlsx'))
await fs.writeFile(resolve(qa, 'verification.json'), JSON.stringify({ generatedAt: new Date().toISOString(), sourceGeneratedAt: result.generatedAt, archived: result.archived, formulasComparedWithAnalysis: true, perturbationRestored: true, output: resolve(out, 'rezultati-eksperimentov.xlsx') }, null, 2))
console.log(JSON.stringify({ output: resolve(out, 'rezultati-eksperimentov.xlsx'), archived: result.archived, errors }))
