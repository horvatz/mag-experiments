// Reporting-only missing-duration handling. Frozen M/1.0 analyzer and raw output remain unchanged.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const dir=dirname(fileURLToPath(import.meta.url))
export function buildReportingResults(raw) {
  const data=structuredClone(raw)
  const missing=data.data.filter(r=>!Number.isFinite(r.elapsedSeconds)).map(r=>r.id)
  for(const g of data.groups) {
    const rows=data.data.filter(r=>r.procedure===g.procedure)
    g.knownDurationCount=rows.filter(r=>Number.isFinite(r.elapsedSeconds)).length
    g.meanElapsedSeconds=rows.length&&g.knownDurationCount===rows.length ? rows.reduce((s,r)=>s+r.elapsedSeconds,0)/rows.length : null
  }
  for(const g of data.byTask) {
    const rows=data.data.filter(r=>r.procedure===g.procedure&&r.task===g.task)
    g.knownDurationCount=rows.filter(r=>Number.isFinite(r.elapsedSeconds)).length
    g.meanElapsedSeconds=rows.length&&g.knownDurationCount===rows.length ? rows.reduce((s,r)=>s+r.elapsedSeconds,0)/rows.length : null
  }
  data.withheldComparisons=data.comparisons.filter(c=>c.metric==='meanElapsedSeconds'&&data.byTask.some(g=>[c.first,c.second].includes(g.procedure)&&g.meanElapsedSeconds===null))
    .map(c=>({first:c.first,second:c.second,metric:c.metric,reason:'Exact duration missing in at least one required repetition; no zero imputation or selective replacement.'}))
  data.comparisons=data.comparisons.filter(c=>!data.withheldComparisons.some(x=>x.first===c.first&&x.second===c.second&&x.metric===c.metric))
  data.durationReporting={missing,policy:'A missing exact duration remains null. Any group mean requiring it and any affected paired time comparison are withheld. All started runs remain in functional and strict-success denominators.',source:'results.json (unchanged frozen analyzer output)',correction:'The frozen analyzer sums null as zero. Those affected time aggregates are invalid and must not be cited. This reporting layer withholds them without changing measured values or frozen inputs.'}
  return data
}
export function reportingResults() {
  const data=buildReportingResults(JSON.parse(readFileSync(resolve(dir,'results.json'),'utf8')))
  const missing=data.durationReporting.missing
  writeFileSync(resolve(dir,'reporting-results.json'),JSON.stringify(data,null,2)+'\n')
  const fmt=x=>x==null?'—':x.toFixed(2)
  const metricLabel=metric=>metric==='meanDemonstratedFraction'?'Delež dokazanih zahtev (0–1)':'Čas (s)'
  const lines=[
    '# Rezultati za pisanje', '',
    `Podatkovni posnetek: ${data.generatedAt}. Arhiviranih ${data.archived}/${data.planned}. ${data.complete?'Vse načrtovane izvedbe so arhivirane; posamezne meritve so lahko manjkajoče.':'Nepopolna zbirka; skupinski podatki so sprotni opis, brez končnega sklepanja.'}`, '',
    '| Postopek | Arhivi | Strogi uspehi | Delež zahtev | Čas s | Znani časi |',
    '| --- | --- | --- | --- | --- | --- |',
    ...data.groups.map(g=>`| ${g.procedure} | ${g.archived}/${g.planned} | ${g.strictSuccesses} | ${fmt(g.meanDemonstratedFraction)} | ${fmt(g.meanElapsedSeconds)} | ${g.knownDurationCount}/${g.archived} |`), '',
    'Dokazana zahteva potrebuje uspeh obeh sprejemnih prikazov in dovoljen obseg sprememb. Neopaženo preverjanje ni potrjena funkcionalna napaka. Strogi uspeh dodatno zahteva zaključen postopek, lint, tipe, gradnjo in vseh 70 preverjanj.', '',
    '## Posamezne izvedbe', '',
    '| Izvedba | Status postopka | Dokazane zahteve | Opažene zahteve | Čas s | Strogi uspeh |',
    '| --- | --- | --- | --- | --- | --- |',
    ...data.data.map(r=>`| [${r.id}](../../runs/${r.id}/evaluation-summary.json) | ${r.executionStatus} | ${r.score.passed}/12 | ${r.score.observed}/12 | ${fmt(r.elapsedSeconds)} | ${r.strictSuccess?'da':'ne'} |`), '',
    '## Popolno zabeležena poraba', '',
    '| Postopek | Popolni zapisi / arhivi | Povprečni vhodni tokeni | Povprečni izhodni tokeni |',
    '| --- | --- | --- | --- |',
    ...data.groups.map(g=>`| ${g.procedure} | ${g.completeUsageCount}/${g.archived} | ${fmt(g.meanInputTokensCompleteOnly)} | ${fmt(g.meanOutputTokensCompleteOnly)} |`), '',
    'Ta povprečja vključujejo samo popolno zabeleženo porabo in so ob manjkajočih zapisih lahko selektivna. Predpomnjeni tokeni so že vključeni v vhodne, reasoning tokeni v izhodne. Zadnja opažena poraba prekinjenih izvedb je ločena spodnja meja v JSON/CSV, ne nadomestilo celotne porabe. Tokeni niso denarni strošek.', '',
    '## Parne razlike po nalogah', '',
    ...(data.complete?[
      '| Primerjava | Mera | Povprečna razlika | 95 % percentilni interval |',
      '| --- | --- | --- | --- |',
      ...data.comparisons.map(c=>`| ${c.first} − ${c.second} | ${metricLabel(c.metric)} | ${fmt(c.meanDifference)} | ${fmt(c.lower)} do ${fmt(c.upper)} |`), '',
      'Razlika pomeni prvi postopek minus drugi. Najprej se povprečijo tri ponovitve po nalogi/postopku, nato se ponovno vzorči osem parov nalog s predpisanim semenom in 20.000 ponovitvami. Intervali so opisni; testni izidi niso neodvisne naloge.'
    ]:['Primerjave se izračunajo šele ob vseh 72 arhivih. Neuravnotežen sprotni vzorec ne določa končne razlike med postopki.']), '',
    ...data.withheldComparisons.map(c=>`Zadržana primerjava: ${c.first}–${c.second}, ${metricLabel(c.metric)}; manjka točen čas vsaj ene zahtevane ponovitve.`), '',
    '## Manjkajoče meritve in viri', '',
    `Manjkajoči točni časi: ${missing.join(', ')||'ni'}. Neznan čas ni nič. Prizadeta povprečja in parne časovne primerjave niso prikazane; funkcionalni izidi in imenovalci ostajajo nespremenjeni.`, '',
    'Zamrznjeni analizator v results.json pri seštevanju obravnava null kot nič; njegovih prizadetih časovnih agregatov ne uporabljaj. Ta ločen prikaz napako obravnave manjkajočih vrednosti izrecno popravi brez sprememb zamrznjene kode ali meritev. Pri obnovljeni P06-C-001 finishedAt pomeni raziskovalčevo finalizacijo, ne potrjenega konca modela.', '',
    'Podrobni podatki so v [reporting-results.json](reporting-results.json) in [run-data.csv](run-data.csv). [Vsebinska presoja](content-review.md) poroča pet dimenzij ločeno; AI-podprta neslepa presoja nima človeških ocen ali izmerjenega soglasja. [Vodnik za pisanje](writing-guide.md) povezuje gradivo z magistrsko.', ''
  ]
  writeFileSync(resolve(dir,'reporting-results.md'),lines.join('\n'))
  return data
}
