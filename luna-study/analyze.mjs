// Correct missing-duration handling without editing either measured collection.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildReportingResults } from '../main-study/analysis/reporting-results.mjs'
import { writeProcessSummary } from '../main-study/analysis/process-summary.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(readFileSync(resolve(study, 'runtime/main-study/analysis/results.json')))
const result = { collection: 'L/1.0', model: 'gpt-6-luna', cliVersion: '0.158.0-alpha.2.1', ...buildReportingResults(raw) }
mkdirSync(resolve(study, 'analysis'), { recursive: true })
writeFileSync(resolve(study, 'analysis/reporting-results.json'), JSON.stringify(result, null, 2) + '\n')
const fmt = (n, digits = 2) => n == null ? '—' : n.toFixed(digits)
const lines = ['# GPT-6 Luna: sprotni rezultati', '', `Arhiviranih ${result.archived}/${result.planned}. ${result.complete ? 'Zbirka je zaključena.' : 'To je nepopoln opis, brez končne primerjave.'}`, '',
  '| Postopek | Arhivi | Strogi uspehi | Zahteve (%) | Čas (s) | Popolna poraba |', '| --- | --- | --- | --- | --- | --- |',
  ...result.groups.map(g => `| ${g.procedure} | ${g.archived}/24 | ${g.strictSuccesses} | ${g.meanDemonstratedFraction == null ? '—' : fmt(g.meanDemonstratedFraction * 100)} | ${fmt(g.meanElapsedSeconds)} | ${g.completeUsageCount}/${g.archived} |`), '',
  'Vse začete meritve ostanejo v imenovalcu. Neznan čas ni nič; povprečja, ki ga zahtevajo, so zadržana. Popolna poraba je lahko selektiven podvzorec. Tokeni niso cena API.', '',
  'Astra je zgodovinska zbirka z drugo različico CLI in iz drugega obdobja. Medzbirčne razlike ne izolirajo učinka modela. Glej [protokol](../protocol.md).', '']
writeFileSync(resolve(study, 'analysis/reporting-results.md'), lines.join('\n'))
writeProcessSummary(result, resolve(study, 'runtime'), resolve(study, 'analysis'))
console.log(JSON.stringify({ collection: result.collection, archived: result.archived, strictSuccesses: result.groups.reduce((n, g) => n + g.strictSuccesses, 0) }))
