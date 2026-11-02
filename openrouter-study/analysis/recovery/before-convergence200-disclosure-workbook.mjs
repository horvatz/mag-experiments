import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool'

const here = dirname(fileURLToPath(import.meta.url)), study = resolve(here, '../..'), original = resolve(study, '..')
const qa = resolve(here, 'qa'), out = resolve(original, 'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b')
const draft = process.argv.includes('--preview')
const load = async p => JSON.parse(await fs.readFile(p, 'utf8'))
const comparison = await load(resolve(study, 'analysis/comparison.json'))
const modelPlan = await load(resolve(study,'models.json'))
if (!draft) assert.ok(comparison.complete, 'Final workbook requires all 216 archived runs')
const labels = { astra: 'GPT Astra', luna: 'GPT Luna', glm: 'GLM-5.3', deepseek: 'DeepSeek V4.1 Flash', qwen: 'Qwen3.5-9B' }
const items = [
  { slug: 'astra', file: resolve(original, 'main-study/analysis/reporting-results.json'), reviews: resolve(original, 'main-study/analysis/reviews'), archives:resolve(original,'runs'), collection: 'M/1.0' },
  { slug: 'luna', file: resolve(original, 'luna-study/analysis/reporting-results.json'), reviews: resolve(original, 'luna-study/analysis/reviews'), archives:resolve(original,'luna-study/runtime/runs'), collection: 'L/1.0' },
  ...['glm', 'deepseek', 'qwen'].map(slug => ({ slug, file: resolve(study, slug, 'analysis/reporting-results.json'), reviews: resolve(study, slug, 'analysis/reviews'), archives:resolve(study,slug,'runtime/runs'), collection: modelPlan.models.find(m=>m.slug===slug).collection })),
]
const data = [], reviews = []
const dimensions = ['specificationCoverage', 'predicatesInvariants', 'traceability', 'codeOrganization', 'ownChecks']
for (const item of items) {
  const result = await load(item.file)
  for (const row of result.data) {
    const usage = row.usageComplete ? row.usage : null
    data.push([labels[item.slug], row.id, row.task, row.procedure, row.repetition, row.executionStatus, row.score.passed, row.score.observed,
      Number(row.strictSuccess), row.elapsedSeconds, Number(row.usageComplete), usage?.input_tokens ?? null, usage?.cached_input_tokens ?? null,
      usage?.output_tokens ?? null, row.costComplete ? row.costUSD : null, Number(row.costComplete || false), row.ownTestFiles,
      null, item.collection + ' / ' + relative(original,resolve(item.archives,row.id,'evaluation-summary.json')), row.costEvidence ? relative(original,row.costEvidence) : null])
    if (row.repetition !== 1) continue
    const path = resolve(item.reviews, row.id + '.json')
    let review
    try { review = await load(path) } catch (error) { if (error.code !== 'ENOENT') throw error }
    if (!draft) assert.ok(review, 'Content-review record required for selected sample: ' + path)
    reviews.push([labels[item.slug], row.id, row.task, row.procedure, ...dimensions.map(d => review?.dimensions?.find(v => v.dimension === d)?.score ?? null),
      review?.method || 'presoja še ni opravljena', null, review ? item.collection + ' / ' + relative(original,path) : null])
  }
}
if (!draft) { assert.equal(data.length, 360); assert.equal(reviews.length, 120) }
await fs.mkdir(qa, { recursive: true }); await fs.mkdir(out, { recursive: true })
const wb = Workbook.create(), summary = wb.worksheets.add('Primerjava'), raw = wb.worksheets.add('Izvedbe'), rubric = wb.worksheets.add('Vsebinska presoja'), paired = wb.worksheets.add('Parjene razlike')
const ink = '#172033', accent = '#334B75', muted = '#536279', colors = ['#334B75', '#7D9BBD', '#B8814E']
function base(sheet, range) { sheet.showGridLines = false; sheet.getRange(range).format = { font: { name: 'Arial', size: 10, color: ink }, rowHeight: 22, verticalAlignment: 'center', columnWidth: 17 } }
function heading(sheet, range) { sheet.getRange(range).format = { fill: accent, font: { name: 'Arial', size: 10, color: '#FFFFFF', bold: true }, wrapText: true, rowHeight: 44, horizontalAlignment: 'center', verticalAlignment: 'center', borders: { insideVertical: { style: 'thin', color: '#FFFFFF' } } } }
base(summary, 'A1:J82'); base(raw, `A1:T${data.length + 1}`); base(rubric, `A1:L${reviews.length + 1}`)
summary.getRange('A1:A82').format.columnWidth = 27
summary.getRange('B1:B82').format.columnWidth = 10
summary.getRange('A2').values = [['Primerjava petih modelov pri postopkih A, B in C']]
summary.getRange('A2:J2').format.font = { name: 'Arial', size: 16, bold: true, color: ink }
summary.getRange('A2:J2').format.rowHeight = 34
summary.getRange('A2:J2').format.borders = { bottom: { style: 'thin', color: accent } }
summary.getRange('A3').values = [[draft ? `Nepopolna zbirka. Arhiviranih ${comparison.newArchived}/216 novih izvedb.` : '216 novih izvedb in 144 zgodovinskih. P03-P10, tri ponovitve, 24 izvedb na postopek in model.']]
summary.getRange('A4').values = [['Astra in Luna sta zgodovinski zbirki. CLI, ponudnik, kvantizacija in način JSON omejujejo neposredno razlago razlik.']]
summary.getRange('A5').values = [[comparison.newArchived >= 194 ? 'Premora: GLM P03-C-002, DeepSeek P03-B-001. Qwen P09-C-002: spanje gostitelja. Prekinitve ter napake API in varovala ostanejo v rezultatih.' : 'Uporabniška premora: GLM P03-C-002 in DeepSeek P03-B-001. Prekinitve ter napake prijave, API in varovala ostanejo v rezultatih.']]
summary.getRange('A3:J5').format.font = { name: 'Arial', size: 10, color: muted }
summary.getRange('A6:J6').values = [['Model', 'Postopek', 'Izvedbe', 'Strogi uspehi', 'Dokazane zahteve', 'Čas (min)', 'Popolna poraba, n', 'Stroški, n', 'Povpr. strošek (USD)', 'Znani časi, n']]
heading(summary, 'A6:J6')
raw.getRange('A1:T1').values = [['Model', 'Izvedba', 'Naloga', 'Postopek', 'Ponovitev', 'Zaključek postopka', 'Dokazane / 12', 'Opažene / 12', 'Strogi uspeh (1/0)', 'Čas (s)', 'Popolna poraba (1/0)', 'Vhodni tokeni', 'Predpomnjeni, del vhoda', 'Izhodni tokeni', 'Strošek (USD)', 'Popoln strošek (1/0)', 'Lastne testne datoteke', null, 'Vir ocene', 'Vir stroška']]
raw.getRange(`A2:T${data.length + 1}`).values = data
heading(raw, 'A1:Q1'); heading(raw, 'S1:T1')
raw.getRange(`A1:A${data.length + 1}`).format.columnWidth = 27
raw.getRange(`B1:B${data.length + 1}`).format.columnWidth = 19
raw.getRange(`F1:F${data.length + 1}`).format.columnWidth = 34
raw.getRange(`R1:R${data.length + 1}`).format.columnWidth = 3
raw.getRange(`S1:S${data.length + 1}`).format.columnWidth = 65
raw.getRange(`T1:T${data.length + 1}`).format.columnWidth = 65
raw.getRange(`J2:J${data.length + 1}`).setNumberFormat('0.000')
raw.getRange(`L2:N${data.length + 1}`).setNumberFormat('#,##0')
raw.getRange(`O2:O${data.length + 1}`).setNumberFormat('0.0000')
raw.tables.add(`A1:Q${data.length + 1}`, true, 'Meritve')
raw.freezePanes.freezeRows(1); raw.freezePanes.freezeColumns(2)
const end = data.length + 1
const range = col => `'Izvedbe'!$${col}$2:$${col}$${end}`
for (const [i, group] of comparison.summaries.entries()) {
  const r = i + 7
  summary.getRange(`A${r}:B${r}`).values = [[labels[group.slug], group.procedure]]
  const criteria = `${range('A')},$A${r},${range('D')},$B${r}`
  summary.getRange(`C${r}:J${r}`).formulas = [[
    `=COUNTIFS(${criteria})`, `=SUMIFS(${range('I')},${criteria})`,
    `=IF(C${r}=0,"",SUMIFS(${range('G')},${criteria})/C${r}/12)`,
    `=IF(OR(C${r}=0,J${r}<>C${r}),"",SUMIFS(${range('J')},${criteria})/C${r}/60)`,
    `=COUNTIFS(${criteria},${range('K')},1)`, `=COUNTIFS(${criteria},${range('P')},1)`,
    `=IF(OR(C${r}=0,H${r}<>C${r}),"",SUMIFS(${range('O')},${criteria})/C${r})`,
    `=COUNTIFS(${criteria},${range('J')},"<>")`,
  ]]
}
summary.getRange('E7:E21').setNumberFormat('0.0%'); summary.getRange('F7:F21').setNumberFormat('0.00'); summary.getRange('I7:I21').setNumberFormat('0.0000')
summary.getRange('A23').values = [['Manjkajoč čas, poraba ali račun niso nič. Povprečni strošek je prikazan samo, če so znani vsi računi skupine.']]
if (comparison.newArchived >= 108) summary.getRange('A23').values = [['Manjkajoč čas, poraba ali račun niso nič. Povprečni strošek zahteva vse račune skupine. P08/P07: preverjanji prazne table zahtevata območje Tabla opravil.']]
summary.getRange('A22').values = [['GLM P03-C-001: 22 testov ustavi pika v imenu iskalnika. Navodilo je dvoumno; izid ostane izviren (48/70, 1/12).']]
if (comparison.newArchived >= 197) summary.getRange('A22').values = [['GLM: P03-C-001 pika v imenu iskalnika (48/70, 1/12); P09-A-002 manjka pika za Ni zadetkov (68/70, 11/12). Izida ohranimo.']]
summary.getRange('A22:J22').format.font = { name: 'Arial', size: 10, color: muted }
summary.getRange('A23:J23').format.font = { name: 'Arial', size: 10, color: muted }
if (comparison.newArchived >= 102) {
  summary.getRange('A24').values = [['Qwen P08-C-002: 14 nalog z oznakami **T001** preverjevalnik zavrne zaradi formata pred implementacijo. Izid ostane 38/70, 0/12.']]
  summary.getRange('A24:J24').format.font = { name: 'Arial', size: 10, color: muted }
}
for (const [metric, start] of [['strict', 6], ['requirements', 15]]) {
  summary.getRange(`M${start}:P${start}`).values = [['Model', 'A', 'B', 'C']]
  for (const [i, item] of items.entries()) {
    const row = start + 1 + i, baseRow = 7 + i * 3
    summary.getRange(`M${row}`).values = [[labels[item.slug]]]
    summary.getRange(`N${row}:P${row}`).formulas = [['A', 'B', 'C'].map((_, j) => metric === 'strict' ? `=IF(C${baseRow + j}=0,"",D${baseRow + j}/C${baseRow + j})` : `=E${baseRow + j}`)]
  }
  const chart = summary.charts.add('bar', summary.getRange(`M${start}:P${start + 5}`))
  chart.title = metric === 'strict' ? 'Delež strogih uspehov' : 'Delež dokazanih zahtev'
  chart.titleTextStyle.typeface = 'Arial'; chart.titleTextStyle.fontSize = 12
  chart.legend = { position: 'top', textStyle: { typeface: 'Arial', fontSize: 10 } }
  chart.xAxis = { axisType: 'textAxis', textStyle: { typeface: 'Arial', fontSize: 10 } }
  chart.yAxis = { numberFormatCode: '0%', numberFormatSourceLinked: false, textStyle: { typeface: 'Arial', fontSize: 10 } }
  chart.series.items.forEach((series, i) => series.fill = colors[i])
  chart.setPosition(metric === 'strict' ? 'A25' : 'F25', metric === 'strict' ? 'E40' : 'J40')
}
rubric.getRange('A1:L1').values = [['Model', 'Izvedba', 'Naloga', 'Postopek', 'Pokritost specifikacije', 'Predikati in invariante', 'Sledljivost', 'Organizacija kode', 'Lastna preverjanja', 'Način presoje', null, 'Vir']]
rubric.getRange(`A2:L${reviews.length + 1}`).values = reviews
heading(rubric, 'A1:J1'); heading(rubric, 'L1:L1')
rubric.getRange(`A1:A${reviews.length + 1}`).format.columnWidth = 27
rubric.getRange(`B1:B${reviews.length + 1}`).format.columnWidth = 19
rubric.getRange(`J1:J${reviews.length + 1}`).format.columnWidth = 44
rubric.getRange(`K1:K${reviews.length + 1}`).format.columnWidth = 3
rubric.getRange(`L1:L${reviews.length + 1}`).format.columnWidth = 55
rubric.tables.add(`A1:J${reviews.length + 1}`, true, 'VsebinskeOcene')
rubric.freezePanes.freezeRows(1); rubric.freezePanes.freezeColumns(2)
summary.getRange('A42').values = [['Vsebinska presoja 0-2. AI-podprta in neslepa, 24 vnaprej izbranih oddaj na model. Človeških ocen ni.']]
summary.getRange('A44:H44').values = [['Model', 'Postopek', 'Pokritost', 'Predikati', 'Sledljivost', 'Koda', 'Preverjanja', 'Vzorec, n']]
heading(summary, 'A44:H44')
const lastReview = reviews.length + 1
for (const [i, group] of comparison.summaries.entries()) {
  const r = i + 45
  summary.getRange(`A${r}:B${r}`).values = [[labels[group.slug], group.procedure]]
  const criteria = `'Vsebinska presoja'!$A$2:$A$${lastReview},$A${r},'Vsebinska presoja'!$D$2:$D$${lastReview},$B${r}`
  summary.getRange(`C${r}:G${r}`).formulas = [['E', 'F', 'G', 'H', 'I'].map(col => {
    const scores = `'Vsebinska presoja'!$${col}$2:$${col}$${lastReview}`
    const count = `COUNTIFS(${criteria},${scores},"<>")`
    return `=IF(${count}=0,"",SUMIFS(${scores},${criteria})/${count})`
  })]
  summary.getRange(`H${r}`).formulas = [[`=COUNTIFS(${criteria})`]]
}
summary.getRange('C45:G59').setNumberFormat('0.00')
summary.getRange('A61').values = [['A: en agent. B: specifikacija, implementacija, pregled in popravki. C: isti agent vodi zaporedje Spec Kit.']]
summary.getRange('A62').values = [['Zahteva je dokazana na obeh velikostih zaslona. Strogi uspeh zahteva postopek, dovoljen obseg, lint, tipe, gradnjo in vseh 70 preverjanj.']]
summary.getRange('A64').values = [['Vsebinska povprečja vključujejo samo dejanske ocene; spodaj so imenovalci po posameznih dimenzijah.']]
summary.getRange('A66:H66').values = [['Model', 'Postopek', 'Pokritost, n', 'Predikati, n', 'Sledljivost, n', 'Koda, n', 'Preverjanja, n', 'Izbrani zapisi, n']]
heading(summary, 'A66:H66')
for (const [i, group] of comparison.summaries.entries()) {
  const row = i + 67
  summary.getRange(`A${row}:B${row}`).values = [[labels[group.slug], group.procedure]]
  const criteria = `'Vsebinska presoja'!$A$2:$A$${lastReview},$A${row},'Vsebinska presoja'!$D$2:$D$${lastReview},$B${row}`
  summary.getRange(`C${row}:G${row}`).formulas = [['E','F','G','H','I'].map(col=>`=COUNTIFS(${criteria},'Vsebinska presoja'!$${col}$2:$${col}$${lastReview},"<>")`)]
  summary.getRange(`H${row}`).formulas = [[`=COUNTIFS(${criteria})`]]
}
wb.recalculate()
for (const [i, group] of comparison.summaries.entries()) {
  const actual = summary.getRange(`C${i + 7}:F${i + 7}`).values[0]
  assert.equal(actual[0], group.archived); assert.equal(actual[1], group.strictSuccesses)
  if (group.archived) assert.ok(Math.abs(actual[2] - group.meanDemonstratedFraction) < 1e-10)
  if (Number.isFinite(group.meanElapsedSeconds)) assert.ok(Math.abs(actual[3] - group.meanElapsedSeconds / 60) < 1e-8)
  if (Number.isFinite(group.meanCostUSD)) assert.ok(Math.abs(summary.getRange(`I${i + 7}`).values[0][0] - group.meanCostUSD) < 1e-10)
  const selectedReviews = reviews.filter(r => r[0] === labels[group.slug] && r[3] === group.procedure)
  const qualitative = summary.getRange(`C${i + 45}:G${i + 45}`).values[0]
  for (let d = 0; d < 5; d++) {
    const known = selectedReviews.map(r => r[d + 4]).filter(Number.isFinite)
    assert.equal(summary.getRange(`C${i + 67}:G${i + 67}`).values[0][d],known.length)
    if (known.length) assert.ok(Number.isFinite(qualitative[d]) && Math.abs(qualitative[d] - known.reduce((a,b)=>a+b,0)/known.length) < 1e-10)
  }
}
// Verify recalculation distinguishes genuine zero from a missing measurement.
const sampleIndex = data.findIndex(r => Number.isFinite(r[9]))
assert.ok(sampleIndex >= 0)
const sample = data[sampleIndex], groupIndex = comparison.summaries.findIndex(g => labels[g.slug] === sample[0] && g.procedure === sample[3])
const cell = raw.getRange(`J${sampleIndex + 2}`), originalTime = sample[9], summaryRow = groupIndex + 7
const groupData = data.filter(r => r[0] === sample[0] && r[3] === sample[3])
cell.values = [[null]]; wb.recalculate()
assert.ok(['', null].includes(summary.getRange(`F${summaryRow}`).values[0][0]))
cell.values = [[0]]; wb.recalculate()
if (groupData.every(r => Number.isFinite(r[9]))) {
  const expected = (groupData.reduce((sum, r) => sum + r[9], 0) - originalTime) / groupData.length / 60
  assert.ok(Math.abs(summary.getRange(`F${summaryRow}`).values[0][0] - expected) < 1e-8)
}
cell.values = [[originalTime]]; wb.recalculate()
const metricLabels = { demonstratedFraction: ['Dokazane zahteve', 'odstotne točke', 100], strictSuccessFraction: ['Strogi uspeh', 'odstotne točke', 100], elapsedSeconds: ['Čas', 'minute', 1/60], costUSD: ['Obračunani strošek', 'USD', 1] }
const contrastLabel = text => text.replace(/astra|luna|glm|deepseek|qwen/g, slug => labels[slug])
const contrastRows = comparison.comparisons.map(c => {
  const [metric, unit, scale] = metricLabels[c.metric]
  return [contrastLabel(c.label), metric, unit, c.meanDifference * scale, c.lower * scale, c.upper * scale, c.taskDifferences.length, c.resamples, 'izračunano', 'primerjalni podatki / ' + c.label + ' / ' + c.metric]
}).concat(comparison.withheld.map(c => {
  const [metric, unit] = metricLabels[c.metric]
  return [contrastLabel(c.label), metric, unit, null, null, null, null, null, 'manjka točen podatek ali popolna trojna ponovitev', 'primerjalni podatki / ' + c.label + ' / ' + c.metric]
}))
base(paired, `A1:J${contrastRows.length + 5}`)
paired.getRange('A1').values = [['Parjene razlike po osmih nalogah; opisni 95-odstotni intervali. Zgodovinske razlike ostajajo omejitev.']]
paired.getRange('A2').values = [['Tri ponovitve povprečimo po nalogi. 20.000 vzorčenj; seme mag-main-M1-2026-09-21-bootstrap.']]
paired.getRange('A4:J4').values = [['Kontrast', 'Merilo', 'Enota', 'Razlika', 'Spodnja meja', 'Zgornja meja', 'Naloge, n', 'Vzorčenja, n', 'Stanje', 'Vir']]
paired.getRange(`A5:J${contrastRows.length + 4}`).values = contrastRows
heading(paired, 'A4:J4')
paired.getRange(`A1:A${contrastRows.length + 4}`).format.columnWidth = 45
paired.getRange(`B1:B${contrastRows.length + 4}`).format.columnWidth = 24
paired.getRange(`C1:C${contrastRows.length + 4}`).format.columnWidth = 20
paired.getRange(`I1:I${contrastRows.length + 4}`).format.columnWidth = 57
paired.getRange(`J1:J${contrastRows.length + 4}`).format.columnWidth = 77
paired.getRange(`D5:F${contrastRows.length + 4}`).setNumberFormat('0.000')
paired.tables.add(`A4:I${contrastRows.length + 4}`, true, 'ParjeniKontrasti')
paired.freezePanes.freezeRows(4); paired.freezePanes.freezeColumns(1)
const amendment = await load(resolve(study, 'budget-amendment-1.json'))
assert.equal(amendment.status, 'approved')
let extension = null
try { extension = await load(resolve(study, 'budget-amendment-2.json')) } catch (error) { if (error.code !== 'ENOENT') throw error }
if (extension) { assert.equal(extension.status, 'approved'); assert.equal(extension.fundingObserved, true); assert.equal(extension.authorizedTotalCreditsUSD, 50) }
const budgetSheet = wb.worksheets.add('Proračunska dopolnitev')
const budgetLastRow = extension ? 18 : comparison.newArchived >= 188 ? 12 : 10
base(budgetSheet, `A1:B${budgetLastRow}`)
budgetSheet.getRange('A1:B1').values = [['Proračunska dopolnitev', 'O/1.0-budget-amendment-1']]
heading(budgetSheet, 'A1:B1')
budgetSheet.getRange('A2:B10').values = [
  ['Odobritev', '30. oktober 2026: uporaba preostalega obstoječega dobroimetja brez doplačil.'],
  ['Veljavnost', 'Diagnostike po meritvi 123; nove meritve od 124 (Qwen/P07-B-003).'],
  ['Varovalo', 'Sveže stanje računa mora kriti največji strošek zahteve in hkratne rezerve.'],
  ['Omejitev', extension ? 'Prva odobritev: 40 USD; druga ločena odobritev spodaj zviša skupno mejo na 50 USD.' : 'Prvotnih 40 USD skupne porabe računa; poznejša doplačila je ne zvišajo.'],
  ['Nepotrjeni računi', 'Ostanejo neznani; prvotne konzervativne rezerve ostanejo v revizijski evidenci.'],
  ['Ohranjeno', 'Isti modeli, ponudniki, pozivi, naloge, roki in ocenjevalci. Prvih 123 meritev se ne ponovi.'],
  ['Različica operatorja', 'O/1.0+budget-amendment-1; izvirni proračun in izvorna koda sta ohranjena.'],
  ['Vir', 'openrouter-study/budget-amendment-1.json'],
  ['Dokaz izvedbe', 'analysis/recovery/budget-amendment-2026-10-30/implementation.json'],
]
if (comparison.newArchived >= 188) {
  const stop = await load(resolve(study, 'analysis/recovery/glm-P03-B-003-budget-refusal.json'))
  assert.equal(stop.classification, 'local-prepaid-credit-coverage-refusal-not-provider-transport')
  assert.equal(stop.sentUpstream, false)
  assert.ok(stop.balance.remainingUSD < stop.requiredPinnedMaximumUSD)
  const usd = value => value.toFixed(4).replace('.', ',')
  budgetSheet.getRange('A11:B12').values = [
    ['Poznejša zavrnitev kritja', `GLM/P03-B-003, zahteva ${stop.request}: ${usd(stop.balance.remainingUSD)} USD < ${usd(stop.requiredPinnedMaximumUSD)} USD. Lokalno varovalo; zahteva ni poslana ponudniku. Izvedba ostane brez ponovitve.`],
    ['Vir zavrnitve', 'analysis/recovery/glm-P03-B-003-budget-refusal.json'],
  ]
}
if (extension) {
  budgetSheet.getRange('A13:B18').values = [
    ['Druga odobritev', extension.id],
    ['Odobrena skupna meja', '50 USD; uporabnik ročno doda 10 USD. Brez raziskovalčevih plačil ali samodejnega doplačevanja.'],
    ['Veljavnost druge dopolnitve', 'Po arhivirani 189; od prve še nezačete 190 GLM/P09-B-002. Prejšnji nemerjeni preizkus 190 ostane ohranjen; 188/189 se ne ponovita.'],
    ['Nespremenjeno', 'Isti modeli, ponudniki, pozivi, roki, ocenjevalci in zamrznjeni največji stroški. Neznani računi ostanejo NULL.'],
    ['Dejansko novo dobroimetje', `Skupni krediti ${extension.fundingObservation.balance.totalCreditsUSD} USD; preverjeno ${extension.fundingObservation.balance.at}. Posnetek računa, ne posamezna faktura.`],
    ['Vir druge dopolnitve', 'openrouter-study/budget-amendment-2.json'],
  ]
  heading(budgetSheet, 'A13:B13')
}
budgetSheet.getRange(`A1:A${budgetLastRow}`).format.columnWidth = 26
budgetSheet.getRange(`B1:B${budgetLastRow}`).format.columnWidth = 105
budgetSheet.getRange(`A2:B${budgetLastRow}`).format.wrapText = true
budgetSheet.getRange(`A2:B${budgetLastRow}`).format.rowHeight = 44
if (budgetLastRow >= 12) budgetSheet.getRange('A11:B11').format.rowHeight = 58
if (extension) budgetSheet.getRange('A15:B15').format.rowHeight = 58
budgetSheet.freezePanes.freezeRows(1)
// Budget disclosures are the final edits; refresh before the final error scan and export.
wb.recalculate()
const errors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 30 }, maxChars: 3000 })
await fs.writeFile(resolve(qa, 'formula-errors.ndjson'), errors.ndjson)
for (const [name, range, file] of [['Primerjava', 'A1:J41', 'comparison'], ['Primerjava', 'A42:H62', 'rubric-summary'], ['Primerjava','A64:H81','known-counts'], ['Izvedbe', 'A1:Q13', 'runs'], ['Izvedbe', `A${Math.max(2, data.length - 8)}:Q${data.length + 1}`, 'runs-tail'], ['Vsebinska presoja', 'A1:J13', 'reviews'], ['Parjene razlike', 'A1:I14', 'paired']]) {
  const image = await wb.render({ sheetName: name, range, scale: 1, format: 'png' })
  await fs.writeFile(resolve(qa, file + '.png'), new Uint8Array(await image.arrayBuffer()))
}
if (!draft) { const file = await SpreadsheetFile.exportXlsx(wb); await file.save(resolve(out, 'primerjava-modelov.xlsx')) }
const budgetImage = await wb.render({ sheetName: 'Proračunska dopolnitev', range: `A1:B${budgetLastRow}`, scale: 1, format: 'png' })
await fs.writeFile(resolve(qa, 'budget-amendment.png'), new Uint8Array(await budgetImage.arrayBuffer()))
console.log(JSON.stringify({ previewOnly: draft, measurements: data.length, contentRecords: reviews.length, out }))
