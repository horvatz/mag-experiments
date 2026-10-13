import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pairedInterval } from '../scripts/main-design.mjs'
import { buildReportingResults } from '../main-study/analysis/reporting-results.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const plan = JSON.parse(readFileSync(resolve(study, 'models.json')))
const json = file => JSON.parse(readFileSync(file))
const average = values => values.length && values.every(Number.isFinite) ? values.reduce((sum, value) => sum + value, 0) / values.length : null
const historical = [
  { slug: 'astra', collection: 'M/1.0', model: 'gpt-6-astra', file: resolve(study, '../main-study/analysis/reporting-results.json') },
  { slug: 'luna', collection: 'L/1.0', model: 'gpt-6-luna', file: resolve(study, '../luna-study/analysis/reporting-results.json') },
]
const collections = historical.map(item => ({ ...item, result: json(item.file), historical: true }))
for (const selected of plan.models) {
  const collection = resolve(study, selected.slug), file = resolve(collection, 'runtime/main-study/analysis/results.json')
  const result = existsSync(file) ? buildReportingResults(json(file)) : { complete: false, archived: 0, planned: 72, data: [], groups: [], byTask: [], comparisons: [] }
  for (const row of result.data) {
    const reconciledCostFile = resolve(collection, 'api', row.id, 'model/api-cost.json')
    const costFile = existsSync(reconciledCostFile) ? reconciledCostFile : resolve(collection, 'runtime/runs', row.id, 'api-cost.json')
    const cost = existsSync(costFile) ? json(costFile) : null
    row.costUSD = cost?.complete ? cost.costUSD : null; row.knownCostUSD = cost?.knownCostUSD ?? null; row.costComplete = cost?.complete ?? false
    row.costEvidence = existsSync(costFile) ? costFile : null
  }
  mkdirSync(resolve(collection, 'analysis'), { recursive: true })
  writeFileSync(resolve(collection, 'analysis/reporting-results.json'), JSON.stringify({ collection: selected.collection, model: selected.id, ...result }, null, 2) + '\n')
  collections.push({ ...selected, model: selected.id, result, historical: false })
}
const tasks = Array.from({ length: 8 }, (_, index) => `P${String(index + 3).padStart(2, '0')}`)
const procedures = ['A', 'B', 'C']
const metrics = { demonstratedFraction: row => row.score.fraction, strictSuccessFraction: row => Number(row.strictSuccess), elapsedSeconds: row => row.elapsedSeconds, costUSD: row => row.costUSD }
const summaries = [], byTask = [], comparisons = [], withheld = []
for (const collection of collections) {
  assert.equal(new Set(collection.result.data.map(row => row.id)).size, collection.result.data.length)
  for (const procedure of procedures) {
    const rows = collection.result.data.filter(row => row.procedure === procedure)
    summaries.push({ slug: collection.slug, collection: collection.collection, model: collection.model, historical: collection.historical, procedure, archived: rows.length, planned: 24,
      strictSuccesses: rows.filter(row => row.strictSuccess).length, perfectRequirementSubmissions: rows.filter(row => row.score.passed === 12).length,
      meanDemonstratedFraction: average(rows.map(metrics.demonstratedFraction)), meanElapsedSeconds: average(rows.map(metrics.elapsedSeconds)),
      completeUsageCount: rows.filter(row => row.usageComplete).length, meanCostUSD: average(rows.map(metrics.costUSD)),
      knownCostUSD: rows.reduce((sum, row) => sum + (row.knownCostUSD || 0), 0), completeCostCount: rows.filter(row => row.costComplete).length })
  }
  for (const task of tasks) for (const procedure of procedures) {
    const rows = collection.result.data.filter(row => row.task === task && row.procedure === procedure)
    byTask.push({ slug: collection.slug, task, procedure, count: rows.length,
      ...Object.fromEntries(Object.entries(metrics).map(([metric, get]) => [metric, rows.length === 3 ? average(rows.map(get)) : null])) })
  }
}
const value = (slug, task, procedure, metric) => byTask.find(row => row.slug === slug && row.task === task && row.procedure === procedure)[metric]
const subtract = (a, b) => Number.isFinite(a) && Number.isFinite(b) ? a - b : null
function contrast(label, metric, get) {
  const differences = tasks.map(get)
  if (differences.every(Number.isFinite)) comparisons.push({ label, metric, taskDifferences: tasks.map((task, index) => ({ task, difference: differences[index] })), ...pairedInterval(differences) })
  else withheld.push({ label, metric, reason: 'A required full task/procedure triplicate or exact value is missing; no zero imputation or selected replacement.' })
}
for (const collection of collections) if (collection.result.complete) for (const [first, second] of [['B', 'A'], ['C', 'A'], ['C', 'B']]) for (const metric of Object.keys(metrics)) {
  if (metric === 'costUSD' && collection.historical) continue
  contrast(`${collection.slug}: ${first} − ${second}`, metric, task => subtract(value(collection.slug, task, first, metric), value(collection.slug, task, second, metric)))
}
for (let first = 0; first < collections.length; first++) for (let second = first + 1; second < collections.length; second++) {
  const a = collections[first], b = collections[second]
  if (!a.result.complete || !b.result.complete) continue
  for (const procedure of procedures) for (const metric of Object.keys(metrics)) {
    if (metric === 'costUSD' && (a.historical || b.historical)) continue
    contrast(`${b.slug} − ${a.slug}, ${procedure}`, metric, task => subtract(value(b.slug, task, procedure, metric), value(a.slug, task, procedure, metric)))
  }
}
const newArchived = collections.filter(c => !c.historical).reduce((sum, c) => sum + c.result.archived, 0)
const result = { generatedAt: new Date().toISOString(), complete: newArchived === 216, newArchived, newPlanned: 216,
  historicalArchived: 144, summaries, byTask, comparisons, withheld,
  method: 'Same automatic scoring; three repetitions averaged by task/procedure; eight-task paired descriptive percentile intervals using the existing seeded 20000 resamples.',
  limitation: 'Astra/Luna are historical ChatGPT collections. New runs use OpenRouter and pinned providers with different quantization, caching, latency, modalities and reasoning controls. Differences are descriptive and do not isolate a causal model effect.',
  qualitative: 'Automatic metrics do not substitute for the separate five-dimensional repetition-1 content review.' }
mkdirSync(resolve(study, 'analysis'), { recursive: true })
writeFileSync(resolve(study, 'analysis/comparison.json'), JSON.stringify(result, null, 2) + '\n')
saveStatus()
function saveStatus() {
  writeFileSync(resolve(study, 'status.json'), JSON.stringify({ at: result.generatedAt, frozen: existsSync(resolve(study, 'frozen-inputs.json')), archived: newArchived, planned: 216,
    models: collections.filter(c => !c.historical).map(c => ({ slug: c.slug, model: c.model, archived: c.result.archived, planned: 72, complete: c.result.complete })) }, null, 2) + '\n')
}
console.log(JSON.stringify({ newArchived, newPlanned: 216, complete: result.complete }))
