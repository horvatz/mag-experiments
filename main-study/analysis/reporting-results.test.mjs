import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildReportingResults } from './reporting-results.mjs'
const raw=JSON.parse(readFileSync(new URL('./results.json',import.meta.url)))
test('missing duration stays unknown without changing functional evidence or source',()=>{
  const original=JSON.stringify(raw), r=buildReportingResults(raw)
  assert.equal(JSON.stringify(raw),original)
  assert.deepEqual(r.data,raw.data)
  assert.equal(r.data.find(x=>x.id==='P06-C-001').elapsedSeconds,null)
  assert.equal(r.groups.find(x=>x.procedure==='C').meanElapsedSeconds,null)
  assert.equal(r.groups.find(x=>x.procedure==='C').knownDurationCount,r.data.filter(x=>x.procedure==='C'&&Number.isFinite(x.elapsedSeconds)).length)
  for(const g of r.groups) {const source=raw.groups.find(x=>x.procedure===g.procedure); assert.equal(g.archived,source.archived);assert.equal(g.strictSuccesses,source.strictSuccesses);assert.equal(g.meanDemonstratedFraction,source.meanDemonstratedFraction)}
})
test('a known zero is different from missing, and a missing repetition withholds its time comparison',()=>{
  const source=structuredClone(raw)
  source.data=source.byTask.flatMap(g=>[1,2,3].map(repetition=>({id:`${g.task}-${g.procedure}-${String(repetition).padStart(3,'0')}`,task:g.task,procedure:g.procedure,repetition,elapsedSeconds:30})))
  source.groups.forEach(g=>{g.archived=24})
  source.data.find(x=>x.id==='P06-C-001').elapsedSeconds=null
  source.comparisons=[{first:'A',second:'B',metric:'meanElapsedSeconds'}, {first:'A',second:'C',metric:'meanElapsedSeconds'}, {first:'A',second:'C',metric:'meanDemonstratedFraction'}]
  const r=buildReportingResults(source)
  assert.deepEqual(r.comparisons.map(x=>x.metric+':'+x.first+x.second),['meanElapsedSeconds:AB','meanDemonstratedFraction:AC'])
  assert.equal(r.withheldComparisons.length,1)
  source.data.find(x=>x.id==='P06-C-001').elapsedSeconds=0
  const z=buildReportingResults(source),c=z.groups.find(x=>x.procedure==='C')
  assert.equal(c.knownDurationCount,c.archived)
  assert.equal(c.meanElapsedSeconds,source.data.filter(x=>x.procedure==='C').reduce((s,x)=>s+x.elapsedSeconds,0)/c.archived)
  assert.equal(z.durationReporting.missing.length,0)
})
