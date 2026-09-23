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
  writeFileSync(resolve(dir,'reporting-results.md'),['# Rezultati za pisanje', '', `Arhiviranih ${data.archived}/72. ${data.complete?'Zbirka izvedb je popolna.':'Nepopolna zbirka; brez končnega sklepanja.'}`, '', '| Postopek | Arhivi | Strogi uspehi | Delež zahtev | Čas s | Znani časi |','| --- | --- | --- | --- | --- | --- |', ...data.groups.map(g=>`| ${g.procedure} | ${g.archived}/24 | ${g.strictSuccesses} | ${fmt(g.meanDemonstratedFraction)} | ${fmt(g.meanElapsedSeconds)} | ${g.knownDurationCount}/${g.archived} |`),'',`Manjkajoči točni časi: ${missing.join(', ')||'ni'}. Neznan čas ni nič. Prizadeta povprečja in parne časovne primerjave niso prikazane; funkcionalni izidi in imenovalci ostajajo nespremenjeni.`, '', 'Zamrznjeni analizator v results.json pri seštevanju obravnava null kot nič; njegovih prizadetih časovnih agregatov ne uporabljaj. Ta ločen prikaz napako obravnave manjkajočih vrednosti izrecno popravi brez sprememb zamrznjene kode ali meritev.', '', ...data.withheldComparisons.map(c=>`Zadržana primerjava: ${c.first}–${c.second}, ${c.metric}.`),''].join('\n'))
  return data
}
