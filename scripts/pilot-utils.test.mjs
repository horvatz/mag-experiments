import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { changes, configArguments, inventory } from './pilot-utils.mjs'
import { parseReview, phaseBudget, roleCanEdit, runBWorkflow, workerArguments } from './procedure-b.mjs'

const completedReview = (findings = []) => ({ complete: true, checkedRequirements: Array.from({ length: 10 }, (_, i) => 'R' + String(i + 1).padStart(2, '0')), unverified: [], specificationChangesRequired: findings.some(x => x.target === 'specification'), codeChangesRequired: findings.some(x => x.target === 'implementation'), summary: 'Reviewed all requirements', findings })

test('B reserves review and correction time within one shared deadline', () => {
  assert.equal(phaseBudget('specification', 1200), 360)
  assert.equal(phaseBudget('implementation', 1100), 740)
  assert.equal(phaseBudget('implementation', 250), 0)
  assert.equal(phaseBudget('review', 600), 480)
  assert.equal(phaseBudget('review', 300), 180)
  assert.equal(phaseBudget('review', 80), 0)
  assert.equal(phaseBudget('specification-repair', 75), 45)
  assert.equal(phaseBudget('implementation-repair', 29), 29)
  assert.equal(phaseBudget('implementation-repair', -2), 0)
})

test('B keeps specification, code and review ownership separate', () => {
  assert.equal(roleCanEdit('specification', 'src/App.tsx'), false)
  assert.equal(roleCanEdit('specification', 'docs/agent/specification.md'), true)
  assert.equal(roleCanEdit('implementation', 'docs/agent/specification.md'), false)
  assert.equal(roleCanEdit('implementation', 'docs/agent/review.json'), false)
  assert.equal(roleCanEdit('implementation', 'src/App.tsx'), true)
  assert.equal(roleCanEdit('review', 'tests/agent/example.spec.ts'), false)
  assert.equal(roleCanEdit('review', 'docs/agent/review.json'), true)
  assert.equal(roleCanEdit('review', 'server/http.ts'), false)
})

test('B does not interpret missing or inconsistent review feedback as approval', () => {
  assert.throws(() => parseReview({ summary: 'OK', findings: [] }))
  assert.throws(() => parseReview({ ...completedReview(), complete: false }))
  assert.throws(() => parseReview({ ...completedReview(), checkedRequirements: ['R01'] }))
  assert.throws(() => parseReview({ ...completedReview(), checkedRequirements: Array(10).fill('R01') }))
  assert.throws(() => parseReview({ specificationChangesRequired: false, codeChangesRequired: false, summary: 'issue', findings: [{ target: 'implementation', requirement: 'R06', problem: 'Cancel saves', requestedChange: 'Preserve data' }] }))
  const valid = completedReview([{ target: 'implementation', requirement: 'R06', problem: 'Cancel saves', requestedChange: 'Preserve data' }])
  assert.deepEqual(parseReview(valid), valid)
})

test('B resumes both original authors in order when the review requests specification and code fixes', async () => {
  const calls = []
  const review = completedReview([{ target: 'specification', requirement: 'R06', problem: 'Missing cancel condition', requestedChange: 'Clarify' }, { target: 'implementation', requirement: 'R06', problem: 'Cancel saves', requestedChange: 'Fix' }])
  const result = await runBWorkflow({ phase: async (...args) => { calls.push(args); return true }, hasSpecification: () => true, getReview: () => review })
  assert.equal(result.status, 'completed')
  assert.deepEqual(calls, [['specification', 'specification'], ['implementation', 'implementation'], ['review', 'review'], ['specification-repair', 'specification', true], ['implementation-repair', 'implementation', true]])
})

test('B does not invent corrections for a clean review or continue an incomplete handoff', async () => {
  for (const review of [completedReview(), { ...completedReview(), complete: false }]) {
    const calls = []
    const result = await runBWorkflow({ phase: async (...args) => { calls.push(args); return true }, hasSpecification: () => true, getReview: () => review })
    assert.equal(calls.length, 3)
    assert.equal(result.status, review.complete ? 'completed' : 'invalid_review_handoff')
  }
  const calls = []
  const result = await runBWorkflow({ phase: async (...args) => { calls.push(args); return true }, hasSpecification: () => false, getReview: () => { throw Error('Must not read a review') } })
  assert.equal(result.status, 'missing_specification')
  assert.equal(calls.length, 1)
})

test('B stops before a correction when the shared deadline is exhausted', async () => {
  const calls = []
  const review = completedReview([{ target: 'specification', requirement: 'R06', problem: 'Missing condition', requestedChange: 'Clarify' }])
  const result = await runBWorkflow({ phase: async (...args) => { calls.push(args); return args[0] !== 'specification-repair' }, hasSpecification: () => true, getReview: () => review })
  assert.equal(result.status, 'phase_stopped')
  assert.equal(calls.at(-1)[0], 'specification-repair')
})

test('B CLI handoffs target the original session and persist structured reviewer output', () => {
  const args = workerArguments({ configArgs: ['-c', 'model="gpt-6-astra"'], app: '/export', session: 'original-session' })
  assert.deepEqual(args.slice(0, 2), ['exec', 'resume'])
  assert.deepEqual(args.slice(-2), ['original-session', '-'])
  assert.ok(!args.includes('--last'))
  const review = workerArguments({ configArgs: [], app: '/export', review: true, schema: '/export/task/review-schema.json', output: '/record/final.json' })
  assert.equal(review[review.indexOf('--output-last-message') + 1], '/record/final.json')
  assert.equal(review[review.indexOf('--output-schema') + 1], '/export/task/review-schema.json')
})

test('handoff detects forbidden edits, deletions and new files while allowing task code', () => {
  const root = mkdtempSync(join(tmpdir(), 'mag-handoff-'))
  try {
    for (const folder of ['src', 'server', 'tests/agent', 'test-results/run']) mkdirSync(join(root, folder), { recursive: true })
    writeFileSync(join(root, 'src/App.tsx'), 'baseline')
    writeFileSync(join(root, 'server/http.ts'), 'trusted')
    writeFileSync(join(root, 'package.json'), '{}')
    const before = inventory(root)
    writeFileSync(join(root, 'src/App.tsx'), 'candidate')
    writeFileSync(join(root, 'server/http.ts'), 'forbidden')
    rmSync(join(root, 'package.json'))
    writeFileSync(join(root, 'unexpected.txt'), 'forbidden')
    writeFileSync(join(root, 'tests/agent/extra.spec.ts'), 'allowed')
    writeFileSync(join(root, 'test-results/run/result.json'), 'generated')
    const result = changes(before, inventory(root))
    assert.deepEqual(result.filter((item) => !item.allowed).map((item) => item.path), ['package.json', 'server/http.ts', 'unexpected.txt'])
    assert.equal(result.filter((item) => item.allowed).length, 2)
    assert.ok(!result.some((item) => item.path.startsWith('test-results/')))
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('inventory records symlinks instead of following them outside the submission', () => {
  const root = mkdtempSync(join(tmpdir(), 'mag-links-'))
  try {
    mkdirSync(join(root, 'src'))
    symlinkSync('/a/nonexistent/private/target', join(root, 'src/escape'))
    assert.deepEqual(inventory(root), { 'src/escape': { kind: 'symlink', target: '/a/nonexistent/private/target' } })
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('Codex overrides remain separate arguments, including paths with spaces', () => {
  assert.deepEqual(configArguments({ 'permissions.pilot': { filesystem: { '/path with spaces': 'read' } }, 'features.apps': false }),
    ['-c', 'permissions.pilot={"filesystem"={"/path with spaces"="read"}}', '-c', 'features.apps=false'])
})
