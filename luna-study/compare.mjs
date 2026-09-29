import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pairedInterval } from '../scripts/main-design.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const tasks = Array.from({ length: 8 }, (_, i) => `P${String(i + 3).padStart(2, '0')}`)
const procedures = ['A', 'B', 'C']
const average = values => values.length && values.every(Number.isFinite) ? values.reduce((a, b) => a + b, 0) / values.length : null
const metrics = {
  demonstratedFraction: row => row.score.fraction,
  strictSuccessFraction: row => Number(row.strictSuccess),
  elapsedSeconds: row => row.elapsedSeconds,
}
export function comparison(astra, luna) {
  const collections = { astra, luna }, byTask = [], summaries = []
  for (const [model, data] of Object.entries(collections)) {
    assert.equal(new Set(data.data.map(r => r.id)).size, data.data.length)
    for (const procedure of procedures) {
      const rows = data.data.filter(r => r.procedure === procedure)
      const usage = rows.filter(r => r.usageComplete && r.usage)
      summaries.push({ model, procedure, archived: rows.length, planned: 24,
        strictSuccesses: rows.filter(r => r.strictSuccess).length,
        perfectRequirementSubmissions: rows.filter(r => r.score.passed === 12).length,
        completedCount: rows.filter(r => r.executionStatus === 'completed').length,
        meanDemonstratedFraction: average(rows.map(metrics.demonstratedFraction)),
        meanElapsedSeconds: average(rows.map(metrics.elapsedSeconds)),
        knownDurationCount: rows.filter(r => Number.isFinite(r.elapsedSeconds)).length,
        completeUsageCount: usage.length,
        meanInputTokensCompleteOnly: average(usage.map(r => r.usage.input_tokens)),
        meanOutputTokensCompleteOnly: average(usage.map(r => r.usage.output_tokens)),
        // Secondary sensitivity description, never a replacement denominator.
        completedOnlyMeanDemonstratedFraction: average(rows.filter(r => r.executionStatus === 'completed').map(metrics.demonstratedFraction)),
      })
    }
    for (const task of tasks) for (const procedure of procedures) {
      const rows = data.data.filter(r => r.task === task && r.procedure === procedure)
      byTask.push({ model, task, procedure, count: rows.length,
        ...Object.fromEntries(Object.entries(metrics).map(([metric, get]) => [metric, rows.length === 3 ? average(rows.map(get)) : null])) })
    }
  }
  const complete = astra.complete && luna.complete && astra.data.length === 72 && luna.data.length === 72
  const contrasts = [], withheld = []
  const get = (model, task, procedure, metric) => byTask.find(r => r.model === model && r.task === task && r.procedure === procedure)[metric]
  function contrast(label, metric, compute) {
    const differences = tasks.map(task => compute(task))
    if (differences.every(Number.isFinite)) contrasts.push({ label, metric, taskDifferences: tasks.map((task, i) => ({ task, difference: differences[i] })), ...pairedInterval(differences) })
    else withheld.push({ label, metric, reason: 'At least one required exact value is missing; no zero imputation or selective block replacement.' })
  }
  const subtract = (a, b) => Number.isFinite(a) && Number.isFinite(b) ? a - b : null
  if (complete) for (const metric of Object.keys(metrics)) {
    for (const procedure of procedures) contrast(`Luna − Astra, ${procedure}`, metric, task => subtract(get('luna', task, procedure, metric), get('astra', task, procedure, metric)))
    for (const model of ['astra', 'luna']) for (const [first, second] of [['B', 'A'], ['C', 'A'], ['C', 'B']]) {
      contrast(`${model}, ${first} − ${second}`, metric, task => subtract(get(model, task, first, metric), get(model, task, second, metric)))
    }
    for (const procedure of ['B', 'C']) contrast(`(Luna ${procedure}−A) − (Astra ${procedure}−A)`, metric, task => subtract(
      subtract(get('luna', task, procedure, metric), get('luna', task, 'A', metric)),
      subtract(get('astra', task, procedure, metric), get('astra', task, 'A', metric))))
  }
  return { complete, archived: astra.data.length + luna.data.length, planned: 144, summaries, byTask, contrasts, withheld,
    method: 'Three repetitions averaged per task and procedure; descriptive paired percentile intervals resample eight tasks 20,000 times. No test-level or repetition-level pseudoreplication.',
    limitation: 'Astra M/1.0: CLI 0.154.0, earlier period. Luna L/1.0: CLI 0.158.0-alpha.2.1, later period. Between-collection contrasts do not identify a model-only causal effect.',
    sensitivityPolicy: 'Completed-only functionality is a secondary selected-sample description. All started runs remain in the primary denominator; unknown usage and times are not zero.' }
}
function write() {
  const astraPath = resolve(study, '../main-study/analysis/reporting-results.json')
  const lunaPath = resolve(study, 'analysis/reporting-results.json')
  const astra = JSON.parse(readFileSync(astraPath)), luna = existsSync(lunaPath) ? JSON.parse(readFileSync(lunaPath)) : { complete: false, data: [], generatedAt: null }
  const result = { generatedAt: new Date().toISOString(), snapshots: { astra: astra.generatedAt, luna: luna.generatedAt }, ...comparison(astra, luna) }
  const out = resolve(study, 'analysis'); mkdirSync(out, { recursive: true })
  writeFileSync(resolve(out, 'comparison.json'), JSON.stringify(result, null, 2) + '\n')
  const fmt = (n, d = 2) => n == null ? '—' : n.toFixed(d)
  const lines = ['# Primerjava Astre in Lune', '', `${result.archived}/144 arhiviranih. ${result.complete ? 'Obe zbirki sta zaključeni.' : 'Lunina zbirka še ni zaključena; spodnja tabela je vmesni opis.'}`, '',
    '| Model | Postopek | Arhivi | Strogi uspehi | Zahteve (%) | Čas (min) | Popolna poraba | Vhodni tokeni¹ | Izhodni tokeni¹ |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...result.summaries.map(r => `| ${r.model === 'astra' ? 'Astra' : 'Luna'} | ${r.procedure} | ${r.archived}/24 | ${r.strictSuccesses} | ${r.meanDemonstratedFraction == null ? '—' : fmt(100 * r.meanDemonstratedFraction)} | ${r.meanElapsedSeconds == null ? '—' : fmt(r.meanElapsedSeconds / 60)} | ${r.completeUsageCount}/${r.archived} | ${fmt(r.meanInputTokensCompleteOnly, 0)} | ${fmt(r.meanOutputTokensCompleteOnly, 0)} |`), '',
    '¹ Povprečje samo popolnih zapisov porabe; imenovalci so navedeni in so lahko selektivni. Vhod vključuje predpomnjene tokene, izhod vključuje reasoning. Tokeni niso denarni strošek.', '',
    'Čas vključuje tudi začete neuspešne poskuse dostopa; njihovi kratki časi niso časi uspešnih rešitev. Če manjka vsaj en točen čas, je skupinsko povprečje zadržano.', '',
    '**Omejitev:** Astra je bila merjena s CLI 0.154.0, Luna z 0.158.0-alpha.2.1 in v poznejšem obdobju. Medzbirčne razlike ne izolirajo učinka samega modela.', '',
    ...(result.complete ? ['| Primerjava | Mera | Razlika | Opisni 95 % interval |', '| --- | --- | --- | --- |', ...result.contrasts.map(c => `| ${c.label} | ${c.metric} | ${fmt(c.meanDifference, 4)} | ${fmt(c.lower, 4)} do ${fmt(c.upper, 4)} |`), '',
      ...result.withheld.map(c => `Zadržano: ${c.label}, ${c.metric}; manjka potreben točen podatek.`), ''] : []),
    'Analiza najprej povpreči tri ponovitve iste naloge/postopka. Intervali ponovno vzorčijo osem nalog; so opisni in ne pomenijo potrditve enakovrednosti pri ničelni razliki.', '']
  writeFileSync(resolve(out, 'comparison.md'), lines.join('\n'))
  const columns = ['collection', 'model', 'id', 'task', 'procedure', 'repetition', 'status', 'seconds', 'requirementsPassed', 'requirementsObserved', 'strictSuccess', 'usageComplete', 'inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'observedInputLowerBound', 'observedOutputLowerBound', 'evidence']
  const rows = [['M/1.0', 'astra', astra], ['L/1.0', 'luna', luna]].flatMap(([collection, model, data]) => data.data.map(r => [collection, model, r.id, r.task, r.procedure, r.repetition, r.executionStatus, r.elapsedSeconds, r.score.passed, r.score.observed, Number(r.strictSuccess), Number(r.usageComplete), r.usage?.input_tokens, r.usage?.cached_input_tokens, r.usage?.output_tokens, r.usage?.reasoning_output_tokens, r.observedUsageBeforeInterruption?.input_tokens, r.observedUsageBeforeInterruption?.output_tokens, resolve(model === 'astra' ? resolve(study, '..') : resolve(study, 'runtime'), r.evidence)]))
  const csv = value => value == null ? '' : '"' + String(value).replaceAll('"', '""') + '"'
  writeFileSync(resolve(out, 'comparison-runs.csv'), [columns, ...rows].map(row => row.map(csv).join(',')).join('\n') + '\n')
  console.log(JSON.stringify({ archived: result.archived, complete: result.complete, contrasts: result.contrasts.length, withheld: result.withheld.length }))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) write()
