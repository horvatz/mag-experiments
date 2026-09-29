import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..'), root = resolve(study, '..')
const out = resolve(root, 'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd')
const qa = resolve(study, 'analysis/artifacts/qa')
await fs.mkdir(out, { recursive: true }); await fs.mkdir(qa, { recursive: true })
const read = async path => JSON.parse(await fs.readFile(path, 'utf8'))
const comparison = await read(resolve(study, 'analysis/comparison.json'))
const astra = await read(resolve(root, 'main-study/analysis/reporting-results.json'))
let luna; try { luna = await read(resolve(study, 'analysis/reporting-results.json')) } catch (e) { if (e.code !== 'ENOENT') throw e; luna = { data: [], generatedAt: null } }
assert.equal(comparison.snapshots.astra, astra.generatedAt); assert.equal(comparison.snapshots.luna, luna.generatedAt)
const schedule = await read(resolve(root, 'main-study/schedule.json'))
const wb = Workbook.create(), overview = wb.worksheets.add('Primerjava'), intervals = wb.worksheets.add('Intervali'), runs = wb.worksheets.add('Izvedbe')
const ink = '#172033', accent = '#334B75', muted = '#546278'
function base(sheet, range) { sheet.showGridLines = false; sheet.getRange(range).format.font = { name: 'Arial', size: 10, color: ink }; sheet.getRange(range).format.rowHeight = 22; sheet.getRange(range).format.verticalAlignment = 'center'; sheet.getRange(range).format.columnWidth = 16 }
function head(sheet, range) { sheet.getRange(range).format = { fill: accent, font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, wrapText: true, horizontalAlignment: 'center', verticalAlignment: 'center' }; sheet.getRange(range).format.rowHeight = 44 }
base(overview, 'A1:J39'); base(intervals, 'A1:F48'); base(runs, 'A1:W145')
overview.tabColor = accent
overview.getRange('A2').values = [['Primerjava Astre in Lune']]
overview.getRange('A2:J2').format.font = { name: 'Arial', size: 16, bold: true, color: ink }
overview.getRange('A2:J2').format.rowHeight = 32
overview.getRange('A2:J2').format.borders = { bottom: { style: 'thin', color: accent } }
overview.getRange('A3').values = [[`${comparison.archived}/144 arhiviranih izvedb. ${comparison.complete ? 'Obe zbirki sta zaključeni.' : 'Vmesni posnetek; Luna še ni zaključena.'}`]]
overview.getRange('A4').values = [['Različna CLI in obdobji: razlike med zbirkama ne izolirajo učinka modela.']]
overview.getRange('A3:J4').format.font = { name: 'Arial', size: 10, color: muted }
overview.getRange('A6:J6').values = [['Model', 'Postopek', 'Arhivi / 24', 'Strogi uspehi', 'Dokazane zahteve', 'Čas (min)', 'Znani časi', 'Popolna poraba', 'Vhodni tokeni¹', 'Izhodni tokeni¹']]
head(overview, 'A6:J6')
const planned = [['Astra', astra], ['Luna', luna]].flatMap(([model, data]) => {
  const ids = new Map(data.data.map(row => [row.id, row]))
  return schedule.runs.map(plan => ({ model, plan, row: ids.get(plan.id) }))
})
const headers = ['Model', 'Izvedba', 'Naloga', 'Postopek', 'Ponovitev', 'Status', 'Arhiv (1/0)', 'Čas (s)', 'Dokazane / 12', 'Opažene / 12', 'Delež zahtev', 'Strogi uspeh (1/0)', 'Popolna poraba (1/0)', 'Vhodni tokeni', 'Predpomnjeni del vhoda', 'Izhodni tokeni', 'Reasoning del izhoda', 'Opaženi vhod ≥', 'Opaženi izhod ≥', 'Blok', 'Mesto v bloku', null, 'Dokaz: neodvisna ocena']
runs.getRange('A1:W1').values = [headers]; head(runs, 'A1:U1'); head(runs, 'W1:W1')
runs.getRange('A2:W145').values = planned.map(({ model, plan, row: r }) => [model, plan.id, plan.task, plan.procedure, plan.repetition, r?.executionStatus ?? 'še ni arhivirano', r ? 1 : 0,
  r?.elapsedSeconds ?? null, r?.score.passed ?? null, r?.score.observed ?? null, null, r ? Number(r.strictSuccess) : null, r ? Number(r.usageComplete) : null,
  r?.usage?.input_tokens ?? null, r?.usage?.cached_input_tokens ?? null, r?.usage?.output_tokens ?? null, r?.usage?.reasoning_output_tokens ?? null,
  r?.observedUsageBeforeInterruption?.input_tokens ?? null, r?.observedUsageBeforeInterruption?.output_tokens ?? null, plan.block, plan.position, null,
  r ? resolve(model === 'Astra' ? root : resolve(study, 'runtime'), r.evidence) : null])
runs.getRange('K2:K145').formulas = planned.map((_, i) => [`=IF(G${i + 2}=0,"",I${i + 2}/12)`])
runs.getRange('B1:B145').format.columnWidth = 19
runs.getRange('C1:E145').format.columnWidth = 12
runs.getRange('F1:F145').format.columnWidth = 35
runs.getRange('V1:V145').format.columnWidth = 3
runs.getRange('W1:W145').format.columnWidth = 118
runs.getRange('H2:H145').setNumberFormat('0.000')
runs.getRange('K2:K145').setNumberFormat('0.0%')
runs.getRange('N2:S145').setNumberFormat('#,##0')
runs.freezePanes.freezeRows(1); runs.freezePanes.freezeColumns(2)
runs.tables.add('A1:U145', true, 'VseMeritve')
for (const [i, g] of comparison.summaries.entries()) {
  const n = i + 7, model = g.model === 'astra' ? 'Astra' : 'Luna'
  overview.getRange(`A${n}:B${n}`).values = [[model, g.procedure]]
  const match = `'Izvedbe'!$A$2:$A$145,A${n},'Izvedbe'!$D$2:$D$145,B${n}`
  overview.getRange(`C${n}:J${n}`).formulas = [[
    `=COUNTIFS(${match},'Izvedbe'!$G$2:$G$145,1)`,
    `=SUMIFS('Izvedbe'!$L$2:$L$145,${match})`,
    `=IF(C${n}=0,"",SUMIFS('Izvedbe'!$K$2:$K$145,${match},'Izvedbe'!$G$2:$G$145,1)/C${n})`,
    `=IF(OR(C${n}=0,G${n}<>C${n}),"",SUMIFS('Izvedbe'!$H$2:$H$145,${match},'Izvedbe'!$G$2:$G$145,1)/C${n}/60)`,
    `=COUNTIFS(${match},'Izvedbe'!$G$2:$G$145,1,'Izvedbe'!$H$2:$H$145,"<>")`,
    `=COUNTIFS(${match},'Izvedbe'!$M$2:$M$145,1)`,
    `=IF(H${n}=0,"",SUMIFS('Izvedbe'!$N$2:$N$145,${match},'Izvedbe'!$M$2:$M$145,1)/H${n})`,
    `=IF(H${n}=0,"",SUMIFS('Izvedbe'!$P$2:$P$145,${match},'Izvedbe'!$M$2:$M$145,1)/H${n})`,
  ]]
}
overview.getRange('E7:E12').setNumberFormat('0.0%'); overview.getRange('F7:F12').setNumberFormat('0.00'); overview.getRange('I7:J12').setNumberFormat('#,##0')
overview.getRange('A14').values = [['¹ Povprečje samo popolnih zapisov. Manjkajoča poraba in neznani časi niso nič.']]
overview.getRange('A15').values = [['Tokeni vključujejo predpomnjeni oziroma reasoning del. Ne predstavljajo denarnega stroška.']]
overview.getRange('A17:G17').values = [['Naloga', 'Astra A', 'Astra B', 'Astra C', 'Luna A', 'Luna B', 'Luna C']]
head(overview, 'A17:G17')
for (let i = 0; i < 8; i++) {
  const n = 18 + i, task = `P${String(i + 3).padStart(2, '0')}`
  overview.getRange(`A${n}`).values = [[task]]
  for (const [j, [model, proc]] of [['Astra', 'A'], ['Astra', 'B'], ['Astra', 'C'], ['Luna', 'A'], ['Luna', 'B'], ['Luna', 'C']].entries()) {
    const col = String.fromCharCode(66 + j), match = `'Izvedbe'!$A$2:$A$145,"${model}",'Izvedbe'!$C$2:$C$145,$A${n},'Izvedbe'!$D$2:$D$145,"${proc}",'Izvedbe'!$G$2:$G$145,1`
    overview.getRange(`${col}${n}`).formulas = [[`=IF(COUNTIFS(${match})<>3,"",SUMIFS('Izvedbe'!$K$2:$K$145,${match})/3)`]]
  }
}
overview.getRange('B18:G25').setNumberFormat('0.0%')
const notes = [
  'Deleži po nalogah se prikažejo šele, ko so arhivirane vse tri ponovitve.',
  'Zahteva potrebuje uspeh pri obeh zaslonih in dovoljen obseg sprememb.',
  'Strogi uspeh dodatno zahteva zaključen postopek, gradnjo, tipe, lint in vseh 70 preverjanj.',
  'Čas vključuje tudi kratke neuspešne poskuse dostopa. To niso časi uspešnih rešitev.',
  'Astra: CLI 0.154.0. Luna: CLI 0.158.0-alpha.2.1. Isti xhigh, naloge in meja 20 minut.',
  'Intervali so opisni; ponovno vzorčijo osem nalog, 20.000-krat, po povprečenju ponovitev.',
  'Zbirki M/1.0 in L/1.0 sta ločeni. Vsi začeti izidi ostanejo v primarnem imenovalcu.',
  `Posnetek Astre: ${astra.generatedAt}.`,
  `Posnetek Lune: ${luna.generatedAt ?? 'glavne meritve še niso začete'}.`,
]
notes.forEach((text, i) => { overview.getRange(`A${28 + i}`).values = [[text]] })
overview.getRange('A28:J36').format.font = { name: 'Arial', size: 10, color: muted }
intervals.getRange('A2').values = [['Parne primerjave po osmih nalogah']]
intervals.getRange('A2:F2').format.font = { name: 'Arial', size: 14, bold: true, color: ink }
intervals.getRange('A3').values = [[comparison.complete ? 'Izračunani opisni percentilni intervali. Vrednosti so iz preverjene analize.' : 'Intervali se izračunajo šele po vseh 144 arhivih.']]
intervals.getRange('A5:F5').values = [['Primerjava', 'Mera', 'Razlika', 'Spodnja meja', 'Zgornja meja', 'Obravnava']]; head(intervals, 'A5:F5')
const contrastRows = [...comparison.contrasts.map(c => [c.label, c.metric === 'elapsedSeconds' ? 'Čas (s)' : c.metric === 'strictSuccessFraction' ? 'Strogi uspeh (0–1)' : 'Delež zahtev (0–1)', c.meanDifference, c.lower, c.upper, 'izračunano']),
  ...comparison.withheld.map(c => [c.label, 'Čas (s)', null, null, null, 'manjka točen čas'])]
if (contrastRows.length) intervals.getRange(`A6:F${5 + contrastRows.length}`).values = contrastRows
intervals.getRange('A1:A48').format.columnWidth = 42; intervals.getRange('B1:B48').format.columnWidth = 25; intervals.getRange('F1:F48').format.columnWidth = 25
intervals.getRange('C6:E48').setNumberFormat('0.0000')
intervals.freezePanes.freezeRows(5)
wb.recalculate()
function verifySummary() {
  for (const [i, g] of comparison.summaries.entries()) {
    const v = overview.getRange(`C${7 + i}:J${7 + i}`).values[0]
    assert.equal(v[0], g.archived); assert.equal(v[1], g.strictSuccesses); assert.equal(v[4], g.knownDurationCount); assert.equal(v[5], g.completeUsageCount)
    for (const [value, expected] of [[v[2], g.meanDemonstratedFraction], [v[3], g.meanElapsedSeconds == null ? null : g.meanElapsedSeconds / 60], [v[6], g.meanInputTokensCompleteOnly], [v[7], g.meanOutputTokensCompleteOnly]]) {
      if (expected == null) assert.ok(value === '' || value === null)
      else assert.ok(Math.abs(value - expected) < 1e-7)
    }
  }
}
verifySummary()
const first = planned.findIndex(x => x.row), rowNumber = first + 2, originalValue = runs.getRange(`I${rowNumber}`).values[0][0]
runs.getRange(`I${rowNumber}`).values = [[originalValue === 0 ? 1 : originalValue - 1]]; wb.recalculate()
assert.equal(runs.getRange(`K${rowNumber}`).values[0][0], (originalValue === 0 ? 1 : originalValue - 1) / 12)
const p = planned[first], groupIndex = comparison.summaries.findIndex(g => (g.model === 'astra' ? 'Astra' : 'Luna') === p.model && g.procedure === p.plan.procedure)
assert.ok(Math.abs(overview.getRange(`E${groupIndex + 7}`).values[0][0] - comparison.summaries[groupIndex].meanDemonstratedFraction - (originalValue === 0 ? 1 : -1) / 12 / comparison.summaries[groupIndex].archived) < 1e-12)
runs.getRange(`I${rowNumber}`).values = [[originalValue]]; wb.recalculate(); verifySummary()
for (const sheet of [overview, intervals, runs]) for (const row of sheet.getUsedRange().values) for (const value of row) assert.ok(!(typeof value === 'string' && /#REF!|#DIV\/0!|#VALUE!|#NAME\?|#NUM!|#NULL!|#SPILL!|#CALC!/.test(value)))
const scan = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, maxChars: 3000 })
await fs.writeFile(resolve(qa, 'formula-errors.json'), JSON.stringify(scan, null, 2))
for (const [sheetName, range, name] of [['Primerjava', 'A1:J26', 'primerjava'], ['Primerjava', 'A28:J37', 'pojasnila'], ['Intervali', comparison.complete ? 'A1:F22' : 'A1:F18', 'intervali'], ...(comparison.complete ? [['Intervali', 'A23:F39', 'intervali-nadaljevanje']] : []), ['Izvedbe', 'A1:M12', 'izvedbe'], ['Izvedbe', 'N1:U12', 'poraba'], ['Izvedbe', 'A132:M145', 'zadnje']]) {
  const blob = await wb.render({ sheetName, range, scale: 1.4, format: 'png' })
  await fs.writeFile(resolve(qa, name + '.png'), new Uint8Array(await blob.arrayBuffer()))
}
const output = await SpreadsheetFile.exportXlsx(wb); await output.save(resolve(out, 'primerjava-astra-luna.xlsx'))
await fs.writeFile(resolve(qa, 'workbook-verification.json'), JSON.stringify({ at: new Date().toISOString(), archived: comparison.archived, snapshots: comparison.snapshots, formulasChecked: true, perturbationRestored: true, renderedSheets: ['Primerjava', 'Intervali', 'Izvedbe'], visuallyReviewed: false }, null, 2) + '\n')
await fs.copyFile(resolve(qa, 'workbook-verification.json'), resolve(study, 'analysis/workbook-verification.json'))
console.log(JSON.stringify({ workbook: resolve(out, 'primerjava-astra-luna.xlsx'), archived: comparison.archived }))
