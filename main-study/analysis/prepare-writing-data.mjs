import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, lstatSync, readlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { digest, inventory } from '../../scripts/pilot-utils.mjs'
import { reportingResults } from './reporting-results.mjs'

const dir = dirname(fileURLToPath(import.meta.url)), root = resolve(dir, '../..'), thesis = resolve(root, '../naloga/latex')
const read = file => JSON.parse(readFileSync(file, 'utf8'))
const data = reportingResults(), schedule = read(resolve(root, 'main-study/schedule.json'))
const frozen = read(resolve(root, 'main-study/frozen-inputs.json')), hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
const records = new Map(data.data.map(r => [r.id, r])), reviews = [], anomalies = [], audited = [], statuses = {}, phaseRows = [], testRows = []
const dimensions = ['specificationCoverage', 'predicatesInvariants', 'traceability', 'codeOrganization', 'ownChecks']
const labels = ['Pokritost specifikacije', 'Predikati/invariante', 'Sledljivost', 'Organizacija kode', 'Lastna preverjanja']
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)])
for (const [name, expected] of Object.entries(frozen.sources)) assert.equal(hash(resolve(root, name)), expected, `Changed frozen source: ${name}`)
assert.equal(schedule.runs.length, 72); assert.equal(records.size, data.archived)
for (const row of data.data) {
  const folder = resolve(root, 'runs', row.id), marker = read(resolve(folder, 'archive-complete.json'))
  const summary = read(resolve(folder, 'evaluation-summary.json')), execution = read(resolve(folder, 'execution.json'))
  assert.equal(marker.id, row.id); assert.equal(summary.id, row.id)
  assert.equal(digest(JSON.stringify(inventory(resolve(folder, 'submission')))), summary.submissionSha256, `Archived submission differs from evaluated candidate: ${row.id}`)
  for (const [name, expected] of Object.entries(summary.evaluatorSourceHashes)) assert.equal(expected, frozen.sources[name], `Different evaluator: ${row.id}/${name}`)
  for (const [name, item] of Object.entries(marker.files)) {
    const file = resolve(folder, name)
    if (item.kind === 'file') { assert.ok(lstatSync(file).isFile()); assert.equal(hash(file), item.sha256, `${row.id}/${name}`) }
    else if (item.kind === 'symlink') assert.equal(readlinkSync(file), item.target)
    else throw new Error(`Unknown archive inventory kind: ${item.kind}`)
  }
  assert.equal(walk(folder).length, Object.keys(marker.files).length + 1, `Archive extra/missing file: ${row.id}`)
  assert.ok(schedule.runs.some(r => r.id === row.id))
  assert.equal(row.score.total, 12); assert.equal(row.score.requirements.length, 12)
  assert.equal(row.score.passed, row.score.requirements.filter(r => r.demonstrated).length)
  if (!row.usageComplete) assert.equal(row.usage, null)
  if (row.usage) { assert.ok(row.usage.cached_input_tokens <= row.usage.input_tokens); assert.ok(row.usage.reasoning_output_tokens <= row.usage.output_tokens) }
  statuses[row.executionStatus] = (statuses[row.executionStatus] ?? 0) + 1
  const phases = execution.phases?.length ? execution.phases : [{ name: 'combined-agent-work', status: execution.status, startedAt: execution.startedAt, finishedAt: execution.finishedAt, elapsedSeconds: execution.elapsedSeconds }]
  for (const [index, phase] of phases.entries()) phaseRows.push([row.id, row.task, row.procedure, row.repetition, index + 1, phase.name, phase.status, phase.startedAt, phase.finishedAt, phase.elapsedSeconds])
  const elapsedPhases = phases.reduce((sum, p) => sum + (p.elapsedSeconds ?? 0), 0)
  if (execution.phases?.length) phaseRows.push([row.id, row.task, row.procedure, row.repetition, null, 'handoffs-and-orchestration', execution.status, null, null, Number.isFinite(execution.elapsedSeconds) && phases.every(p => Number.isFinite(p.elapsedSeconds)) ? Math.max(0, execution.elapsedSeconds - elapsedPhases) : null])
  const failedTests = summary.tests.filter(t => t.status !== 'expected').map(({ title, project, status, errors }) => ({ title, project, status, errors }))
  for (const test of summary.tests) testRows.push([row.id, row.task, row.procedure, row.repetition, test.project, test.title, test.status, JSON.stringify(test.errors ?? []), row.evidence])
  if (!row.strictSuccess || failedTests.length) anomalies.push({ id: row.id, executionStatus: row.executionStatus, allowedChanges: row.allowedChanges, completeTestRun: row.completeTestRun, checks: row.checks, failedTests, evidence: row.evidence })
  audited.push({ id: row.id, files: Object.keys(marker.files).length, startedAt: execution.startedAt, finishedAt: execution.finishedAt, ...(execution.finishedAtMeaning ? { finishedAtMeaning: execution.finishedAtMeaning } : {}), archiveCompletedAt: marker.completedAt, markerSha256: hash(resolve(folder, 'archive-complete.json')) })
  const reviewFile = resolve(dir, 'reviews', `${row.id}.json`)
  if (row.repetition === 1 && existsSync(reviewFile)) {
    const review = read(reviewFile)
    assert.equal(review.id, row.id); assert.equal(review.method, 'AI-podprta, neslepa vsebinska presoja')
    assert.deepEqual(review.dimensions.map(d => d.dimension), dimensions)
    for (const dimension of review.dimensions) {
      assert.ok([0, 1, 2].includes(dimension.score)); assert.ok(dimension.rationale.length > 40); assert.ok(dimension.evidence.length)
      for (const evidence of dimension.evidence) assert.ok(existsSync(resolve(root, evidence.split('#')[0].replace(/:\d+$/, ''))), `Missing review evidence: ${evidence}`)
    }
    reviews.push(review)
  }
}
const snapshot = { generatedAt: new Date().toISOString(), sourceGeneratedAt: data.generatedAt, archived: data.archived, planned: 72, complete: data.complete,
  frozenInputsUnchanged: true, archiveIntegrity: true, audited, executionStatuses: statuses, reviewed: reviews.length, reviewPlanned: 24 }
writeFileSync(resolve(dir, 'integrity-audit.json'), JSON.stringify(snapshot, null, 2) + '\n')
writeFileSync(resolve(dir, 'anomalies.json'), JSON.stringify({ ...snapshot, audited: undefined, anomalies }, null, 2) + '\n')
const csv = rows => rows.map(row => row.map(value => value === null || value === undefined ? '' : `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n'
writeFileSync(resolve(dir, 'review-data.csv'), csv([
  ['id', 'task', 'procedure', 'repetition', 'archived', 'reviewed', ...dimensions, 'method', 'reviewer', 'reviewed_at', 'human_review', 'inter_rater_agreement', 'evidence'],
  ...schedule.runs.filter(r => r.repetition === 1).map(r => {
    const review = reviews.find(v => v.id === r.id)
    return [r.id, r.task, r.procedure, r.repetition, records.has(r.id), Boolean(review), ...dimensions.map(d => review?.dimensions.find(x => x.dimension === d)?.score),
      review?.method, review?.reviewer, review?.reviewedAt, review?.humanReview, review?.interRaterAgreement, review ? `main-study/analysis/reviews/${r.id}.json` : null]
  })
]))
writeFileSync(resolve(dir, 'test-data.csv'), csv([['id', 'task', 'procedure', 'repetition', 'project', 'title', 'status', 'errors_json', 'evidence'], ...testRows]))
writeFileSync(resolve(dir, 'phase-data.csv'), csv([['id', 'task', 'procedure', 'repetition', 'phase_order', 'phase', 'status', 'started_at_utc', 'finished_at_utc', 'elapsed_seconds'], ...phaseRows]))
const headers = ['id', 'task', 'procedure', 'repetition', 'block', 'position', 'archived', 'execution_status', 'elapsed_seconds', 'requirements_demonstrated', 'requirements_observed', 'requirement_total', 'demonstrated_fraction', 'strict_success', 'allowed_changes', 'complete_test_run', 'usage_complete', 'input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'observed_input_lower_bound', 'observed_output_lower_bound', 'own_test_files', 'changed_files', 'evidence']
writeFileSync(resolve(dir, 'run-data.csv'), csv([headers, ...schedule.runs.map(r => {
  const a = records.get(r.id)
  return [r.id, r.task, r.procedure, r.repetition, r.block, r.position, Boolean(a), a?.executionStatus, a?.elapsedSeconds, a?.score.passed, a?.score.observed, 12,
    a?.score.fraction, a?.strictSuccess, a?.allowedChanges, a?.completeTestRun, a?.usageComplete, a?.usage?.input_tokens, a?.usage?.cached_input_tokens,
    a?.usage?.output_tokens, a?.usage?.reasoning_output_tokens, a?.observedUsageBeforeInterruption?.input_tokens, a?.observedUsageBeforeInterruption?.output_tokens,
    a?.ownTestFiles, a?.changedFiles, a?.evidence]
})]))
writeFileSync(resolve(dir, 'requirement-data.csv'), csv([['id', 'task', 'procedure', 'repetition', 'requirement', 'archived', 'demonstrated', 'observed'],
  ...schedule.runs.flatMap(r => Array.from({ length: 12 }, (_, i) => {
    const a = records.get(r.id), score = a?.score.requirements[i]
    return [r.id, r.task, r.procedure, r.repetition, 'R' + String(i + 1).padStart(2, '0'), Boolean(a), score?.demonstrated, score?.observed]
  }))]))
const missingReviews = schedule.runs.filter(r => r.repetition === 1 && !reviews.some(v => v.id === r.id)).map(r => r.id)
const md = ['# Vsebinska presoja glavnih oddaj', '', '**AI-podprta, neslepa vsebinska presoja.** Ocenjevalec: Codex, raziskovalčev pomočnik, zunaj merjene seje. To niso človeške ocene in soglasje med ocenjevalci ni izmerjeno.', '',
  `Pregledanih je ${reviews.length}/24 vnaprej določenih oddaj (ponovitev 001 za P03–P10 in A/B/C). Ocene po dimenzijah se ne seštevajo v skupno kakovost.`, '',
  '| Oddaja | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |', '| --- | --- | --- | --- | --- | --- |',
  ...reviews.map(r => `| [${r.id}](reviews/${r.id}.json) | ${r.dimensions.map(d => d.score).join(' | ')} |`), '',
  `Brez zaključene presoje: ${missingReviews.length ? missingReviews.join(', ') : 'ni manjkajočih'}.`, '']
for (const review of reviews) {
  md.push(`## ${review.id}`, '')
  review.dimensions.forEach((d, i) => md.push(`**${labels[i]}: ${d.score}/2.** ${d.rationale}`, '', `Dokazi: ${d.evidence.map(e => `[${e.split('/').at(-1)}](../../${e.replace(/:(\d+)$/, '#L$1')})`).join(', ')}.`, ''))
  md.push(`Končna napaka: ${review.finalFailureNote ?? review.finalFailureExample?.description ?? 'glej izvirno presojo'}`, '')
  if (review.developmentFailureExample) md.push(`Razvojni popravek: ${review.developmentFailureExample.description}`, '')
}
writeFileSync(resolve(dir, 'content-review.md'), md.join('\n'))

// These inputs update the manuscript snapshot; the frozen experiment never imports them.
const generated = resolve(thesis, 'generirano'); mkdirSync(generated, { recursive: true })
const tex = value => String(value).replace(/[\\{}%&#_$]/g, ch => ({ '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '%': '\\%', '&': '\\&', '#': '\\#', '_': '\\_', '$': '\\$' }[ch]))
const num = (value, digits = 2) => value === null || value === undefined ? '--' : value.toFixed(digits).replace('.', '{,}')
const when = data.generatedAt.replace('T', ' ').slice(0, 19) + ' UTC'
const countText = `Število arhiviranih glavnih izvedb ob ${tex(when)}: ${data.archived} od 72 vnaprej določenih.`
writeFileSync(resolve(generated, 'stanje-meritev.tex'), `% Generated from main-study/analysis/results.json; do not edit numbers manually.\n${countText}\n${data.complete ? 'Vse načrtovane izvedbe so arhivirane; posamezne neznane meritve ostanejo označene kot manjkajoče.' : 'Zbirka je nepopolna. Naslednje vrednosti so sprotni opis, ne uravnotežena končna primerjava postopkov.'}\nStatusi postopkov: ${Object.entries(statuses).map(([status, n]) => `\\texttt{${tex(status)}}: ${n}`).join(', ') || 'še ni arhiviranih izvedb'}.\nPiloti P01/P02 in kvalifikacija niso vključeni.\n`)
const table = (caption, label, columns, header, rows, note) => ['\\begin{table}[htbp]', '\\centering', '\\small', `\\caption{${caption}}`, `\\label{${label}}`, `\\begin{tabular}{${columns}}`, '\\toprule', header + ' \\\\', '\\midrule', ...rows.map(r => r + ' \\\\'), '\\bottomrule', '\\end{tabular}', note ? `\\par\\smallskip\\parbox{0.95\\textwidth}{\\footnotesize ${note}}` : '', '\\end{table}', ''].join('\n')
writeFileSync(resolve(generated, 'povzetek-meritev.tex'), table('Opisni povzetek arhiviranih glavnih izvedb.', 'tab:dejanske-meritve', '@{}lrrrrr@{}', 'Postopek & $n$/24 & Strogi uspehi & Delež zahtev & Čas (s) & Poraba znana',
  data.groups.map(g => `${g.procedure} & ${g.archived} & ${g.strictSuccesses} & ${num(g.meanDemonstratedFraction)} & ${num(g.meanElapsedSeconds)} & ${g.completeUsageCount}`),
  'Časovno povprečje manjka, če vsaj en točni čas ni znan; manjkajoča vrednost ni nič. Pri nepopolni zbirki se sestava nalog in ponovitev med postopki razlikuje.'))
writeFileSync(resolve(generated, 'poraba-meritev.tex'), table('Tokeni samo izvedb s popolno izmerjeno porabo.', 'tab:dejanska-poraba', '@{}lrrr@{}', 'Postopek & Popolno izmerjenih & Vhodni tokeni & Izhodni tokeni',
  data.groups.map(g => `${g.procedure} & ${g.completeUsageCount}/${g.archived} & ${num(g.meanInputTokensCompleteOnly, 0)} & ${num(g.meanOutputTokensCompleteOnly, 0)}`),
  'Povprečja imajo naveden imenovalec in so lahko selektivna. Predpomnjeni tokeni so že vključeni v vhodne. Manjkajoča celotna poraba ni nič; opažene spodnje meje so v spremljajoči zbirki.'))
writeFileSync(resolve(generated, 'primerjave-meritev.tex'), data.complete ? table('Parne razlike med postopki po osmih nalogah.', 'tab:parne-razlike', '@{}llrrr@{}', 'Par & Mera & Razlika & Spodnja meja & Zgornja meja',
  data.comparisons.map(c => `${c.first}--${c.second} & ${c.metric === 'meanElapsedSeconds' ? 'Čas (s)' : 'Delež zahtev'} & ${num(c.meanDifference, 3)} & ${num(c.lower, 3)} & ${num(c.upper, 3)}`),
  'Opisni 95-odstotni percentilni intervali iz 20.000 ponovnih vzorcev osmih nalog. Najprej so povprečene tri ponovitve vsakega postopka pri isti nalogi. Časovne primerjave z manjkajočo ponovitveno meritvijo so zadržane.') : 'Parne razlike in intervali še niso izračunani, ker vseh 72 izvedb še ni arhiviranih.\n')
writeFileSync(resolve(generated, 'presoja-meritev.tex'), `Opravljena je AI-podprta, neslepa vsebinska presoja ${reviews.length} od 24 vnaprej izbranih oddaj. Posamezne utemeljitve in povezave do dokazov so v spremljajoči zbirki \\texttt{main-study/analysis/content-review.md}. Neodvisna človeška presoja in soglasje med ocenjevalci nista izmerjena.\n`)
console.log(JSON.stringify({ archived: data.archived, integrity: true, reviewed: reviews.length, anomalies: anomalies.length, snapshot: when }))
