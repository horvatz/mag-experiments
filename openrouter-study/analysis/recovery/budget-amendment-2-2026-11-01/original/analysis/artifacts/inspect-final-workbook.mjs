// Researcher-only inspection of the exported file. Never edits or re-exports it.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool'

const here = dirname(fileURLToPath(import.meta.url)), study = resolve(here, '../..')
const comparison = JSON.parse(await fs.readFile(resolve(study, 'analysis/comparison.json'), 'utf8'))
assert.equal(comparison.complete, true, 'Inspect final exports only after all measurements')
assert.equal(comparison.newArchived, 216)
const file = resolve(study, '../outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.xlsx')
const hash = async () => createHash('sha256').update(await fs.readFile(file)).digest('hex')
const before = await hash()
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file))
const runs = wb.worksheets.getItem('Izvedbe').getRange('A2:T361').values
const reviews = wb.worksheets.getItem('Vsebinska presoja').getRange('A2:L121').values
assert.equal(runs.filter(r => r[1]).length, 360)
assert.equal(reviews.filter(r => r[1]).length, 120)
const views = [
  ['Proračunska dopolnitev', 'A1:B12', 'budget-disclosure'],
  ['Vsebinska presoja', 'A108:J121', 'reviews-tail'],
  ['Vsebinska presoja', 'J110:L121', 'reviews-sources-tail'],
  ['Izvedbe', 'S1:T8', 'runs-sources-head'],
  ['Izvedbe', 'O350:T361', 'runs-costs-sources-tail'],
]
const contrasts = [...comparison.comparisons, ...comparison.withheld]
assert.ok(contrasts.length)
const lastRow = contrasts.length + 4
views.push(['Parjene razlike', `A${Math.max(5, lastRow - 9)}:I${lastRow}`, 'paired-tail'])
const crossIndex = comparison.comparisons.findIndex(r => !r.label.includes(':') && /glm|deepseek|qwen/.test(r.label))
assert.ok(crossIndex >= 0, 'Final comparison must contain computed new-model contrasts')
views.push(['Parjene razlike', `A${crossIndex + 5}:I${Math.min(lastRow, crossIndex + 13)}`, 'paired-new-models'])
if (comparison.withheld.length) {
  const start = comparison.comparisons.length + 5
  views.push(['Parjene razlike', `A${start}:I${Math.min(lastRow, start + 8)}`, 'paired-withheld'])
}
for (const [name, predicate] of [
  ['reviews-missing-new', r => r[0] === 'Qwen3.5-9B' && r.slice(4, 9).every(v => v == null || v === '')],
  ['reviews-missing-glm', r => r[0] === 'GLM-5.3' && r.slice(4, 9).every(v => v == null || v === '')],
  ['reviews-real-zero', r => /Qwen|GLM|DeepSeek/.test(r[0]) && r.slice(4, 9).some(v => v === 0)],
]) {
  const index = reviews.findIndex(predicate)
  assert.ok(index >= 0, 'Required final missing/zero example: ' + name)
  const row = index + 2
  views.push(['Vsebinska presoja', `A${Math.max(2, row - 1)}:J${Math.min(121, row + 2)}`, name])
}
const qa = resolve(here, 'qa/final-export-inspection')
await fs.mkdir(qa, { recursive: true })
const rendered = []
for (const [sheetName, range, name] of views) {
  const result = await wb.render({ sheetName, range, scale: 1, format: 'png' })
  const bytes = new Uint8Array(await result.arrayBuffer()), path = resolve(qa, name + '.png')
  await fs.writeFile(path, bytes)
  rendered.push({ sheetName, range, path, sha256: createHash('sha256').update(bytes).digest('hex') })
}
assert.equal(await hash(), before, 'Inspection must preserve exported XLSX bytes')
const result = { at: new Date().toISOString(), researcherOnly: true, sourceFile: file,
  sourceSHA256: before, sourceUnchanged: true, measurements: 360, contentRecords: 120,
  rendered, visualReview: 'pending: researcher must actually view every new image',
  numericalAudit: 'Use the independent export XML/source audit and builder recalculation evidence as well.' }
await fs.writeFile(resolve(qa, 'inspection.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ sourceSHA256: before, rendered: rendered.length, visualReview: 'pending' }))
