import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { comparison } from './compare.mjs'
const original = JSON.parse(readFileSync(new URL('../main-study/analysis/reporting-results.json', import.meta.url)))
test('identical archived collections have zero functional contrasts, without inventing the missing C time', () => {
  const result = comparison(original, structuredClone(original))
  assert.equal(result.archived, 144)
  for (const c of result.contrasts.filter(c => c.metric !== 'elapsedSeconds' && !/^(astra|luna),/.test(c.label))) {
    assert.equal(c.meanDifference, 0); assert.equal(c.lower, 0); assert.equal(c.upper, 0)
    assert.equal(c.taskDifferences.length, 8); assert.equal(c.unit, 'task')
  }
  assert.ok(result.withheld.some(c => c.label === 'Luna − Astra, C' && c.metric === 'elapsedSeconds'))
  assert.equal(result.summaries.find(r => r.model === 'luna' && r.procedure === 'C').meanElapsedSeconds, null)
})
test('unknown duration withholds time contrasts while preserving all functional observations and exact zero durations', () => {
  const luna = structuredClone(original)
  for (const row of luna.data) row.elapsedSeconds = 0
  let result = comparison(original, luna)
  assert.equal(result.summaries.find(r => r.model === 'luna' && r.procedure === 'B').meanElapsedSeconds, 0)
  const before = result.contrasts.filter(c => c.metric !== 'elapsedSeconds')
  luna.data.find(r => r.procedure === 'B').elapsedSeconds = null
  result = comparison(original, luna)
  const group = result.summaries.find(r => r.model === 'luna' && r.procedure === 'B')
  assert.equal(group.archived, 24); assert.equal(group.knownDurationCount, 23); assert.equal(group.meanElapsedSeconds, null)
  assert.deepEqual(result.contrasts.filter(c => c.metric !== 'elapsedSeconds'), before)
  assert.ok(result.withheld.some(c => c.label === 'Luna − Astra, B' && c.metric === 'elapsedSeconds'))
})
test('an incomplete or duplicated collection cannot masquerade as a complete paired comparison', () => {
  const luna = structuredClone(original); luna.data.pop(); luna.complete = false
  const result = comparison(original, luna)
  assert.equal(result.complete, false); assert.equal(result.contrasts.length, 0)
  luna.data.push(luna.data[0])
  assert.throws(() => comparison(original, luna))
})
