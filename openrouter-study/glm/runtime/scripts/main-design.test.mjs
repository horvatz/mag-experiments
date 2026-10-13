import assert from 'node:assert/strict'
import { test } from 'node:test'
import { schedule, requirementScore, pairedInterval, serviceLimitInEvents } from './main-design.mjs'
test('72 unique runs preserve Latin balance and all six permutations', () => {
  const design = schedule(); assert.deepEqual(design, schedule()); assert.equal(design.runs.length, 72); assert.equal(new Set(design.runs.map(r => r.id)).size, 72)
  for (let task = 3; task <= 10; task++) for (const procedure of ['A', 'B', 'C']) {
    const selected = design.runs.filter(r => r.task === 'P' + String(task).padStart(2, '0') && r.procedure === procedure)
    assert.deepEqual(selected.map(r => r.position).sort(), [1, 2, 3]); assert.deepEqual(selected.map(r => r.repetition).sort(), [1, 2, 3])
  }
  const orders = {}; for (const b of design.blocks) orders[b.order.join('')] = (orders[b.order.join('')] || 0) + 1
  assert.equal(Object.keys(orders).length, 6); assert.deepEqual(Object.values(orders), [4, 4, 4, 4, 4, 4])
})
test('requirement success needs both independent size projects and valid submission', () => {
  const testCase = (project, status = 'expected') => ({ title: 'E01: R01 test', project, status })
  assert.equal(requirementScore({ allowedChanges: true, tests: [testCase('evaluation-desktop')] }).passed, 0)
  assert.equal(requirementScore({ allowedChanges: true, tests: [testCase('evaluation-desktop'), testCase('evaluation-desktop')] }).passed, 0)
  const tests = [testCase('evaluation-desktop'), testCase('evaluation-mobile')]
  assert.equal(requirementScore({ allowedChanges: true, tests }).passed, 1)
  assert.equal(requirementScore({ allowedChanges: false, tests }).passed, 0)
  assert.equal(requirementScore({ allowedChanges: true, tests: [tests[0], testCase('evaluation-mobile', 'unexpected')] }).passed, 0)
  assert.equal(requirementScore({}).observed, 0)
})
test('cluster intervals require eight task values, not repeated test cases', () => {
  assert.equal(pairedInterval([1, 2, 3]), null)
  const interval = pairedInterval(Array(8).fill(0.25)); assert.equal(interval.lower, 0.25); assert.equal(interval.upper, 0.25); assert.equal(interval.meanDifference, 0.25)
})
test('service limits come from actual failures rather than agent prose', () => {
  assert.equal(serviceLimitInEvents(JSON.stringify({ type: 'turn.failed', error: { message: 'Usage limit reached' } })), true)
  assert.equal(serviceLimitInEvents(JSON.stringify({ type: 'error', message: 'rate_limit_exceeded' })), true)
  assert.equal(serviceLimitInEvents(JSON.stringify({ type: 'item.completed', item: { text: 'I tested rate limits' } })), false)
  assert.equal(serviceLimitInEvents(JSON.stringify({ type: 'error', message: 'Command failed' })), false)
})
