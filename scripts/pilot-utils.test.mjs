import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { changes, configArguments, inventory, editable } from './pilot-utils.mjs'
import { parseReview, phaseBudget, roleCanEdit, runBWorkflow, workerArguments, prompts as bPrompts } from './procedure-b.mjs'
import { stageCanEdit, stageConfiguration, parseConvergence, runCWorkflow, phaseBudget as cBudget, assertLocalSkillCatalog, prompts as cPrompts } from './procedure-c.mjs'
import { pilotTask, taskPrompts, exportPublicTask } from './pilot-tasks.mjs'

test('task selection validates IDs and keeps P01 and P02 evaluation counts distinct', () => {
  assert.equal(pilotTask('P01-A-001').totalChecks, 68)
  const p02 = pilotTask('P02-C-001')
  assert.equal(p02.totalChecks, 72)
  assert.equal(Object.values(p02.counts).reduce((sum, count) => sum + count, 0), 72)
  assert.equal(p02.requirements.at(-1), 'R12')
  for (const id of ['../P02', 'P11-A-001', 'P00', 'P02-D-001', 'P02-A-1', 'P02-A-001/extra']) assert.throws(() => pilotTask(id))
})

test('all eight main tasks have independent 70-check configurations and complete public exports', () => {
  const root = new URL('../', import.meta.url).pathname
  for (let number = 3; number <= 10; number++) {
    const name = 'P' + String(number).padStart(2, '0'), task = pilotTask(name + '-C-003')
    assert.equal(task.main, true)
    assert.equal(task.totalChecks, 70)
    assert.equal(Object.values(task.counts).reduce((a, b) => a + b, 0), 70)
    assert.equal(task.requirements.length, 12)
    assert.deepEqual(task.prepareArgs, ['prepare', name])
    assert.equal(task.baselineDirectory, `.work/${name}/baseline`)
    const app = mkdtempSync(join(tmpdir(), 'mag-main-export-'))
    try {
      exportPublicTask(root, app, task)
      assert.deepEqual(readFileSync(join(app, 'tests/development/helpers.ts')), readFileSync(join(root, 'tasks', name, 'helpers.ts')))
      for (const path of ['reference', 'evaluation', 'reports', 'runs']) assert.equal(existsSync(join(app, path)), false)
      for (const source of [bPrompts, cPrompts]) for (const text of Object.values(taskPrompts(source, task))) assert.ok(!text.includes('P01') && !text.includes('R01–R10'))
    } finally { rmSync(app, { recursive: true, force: true }) }
  }
})

test('P02 public export preserves helper imports without leaking private research files', () => {
  const app = mkdtempSync(join(tmpdir(), 'mag-p02-export-'))
  const root = new URL('../', import.meta.url).pathname
  try {
    exportPublicTask(root, app, pilotTask('P02'))
    for (const [source, exported] of [['tasks/P02/instructions.md', 'task/instructions.md'], ['tasks/P02/development.spec.ts', 'tests/development/P02.spec.ts'], ['tasks/P02/helpers.ts', 'tests/development/helpers.ts'], ['support/types.ts', 'support/types.ts']]) {
      assert.deepEqual(readFileSync(join(app, exported)), readFileSync(join(root, source)))
    }
    for (const path of ['reference', 'evaluation', 'reports', 'runs', 'scripts', 'tasks/P01']) assert.equal(existsSync(join(app, path)), false)
  } finally { rmSync(app, { recursive: true, force: true }) }
})

test('P02 role prompts and review validation include R11 and R12', () => {
  const task = pilotTask('P02')
  for (const source of [bPrompts, cPrompts]) {
    const prompts = taskPrompts(source, task)
    for (const text of Object.values(prompts)) { assert.ok(!text.includes('P01')); assert.ok(!text.includes('R01–R10')) }
    assert.ok(Object.values(prompts).some(text => text.includes('R01–R12')))
  }
  const review = { complete: true, checkedRequirements: task.requirements, unverified: [], specificationChangesRequired: false, codeChangesRequired: false, summary: 'All requirements checked', findings: [] }
  assert.equal(parseReview(review, task.requirements), review)
  assert.throws(() => parseReview({ ...review, checkedRequirements: task.requirements.slice(0, 10) }, task.requirements))
  assert.throws(() => parseReview({ ...review, checkedRequirements: [...task.requirements, 'R12'] }, task.requirements))
})

test('P02 convergence can append its own tasks but cannot edit P01 or application code', () => {
  const task = pilotTask('P02')
  assert.equal(stageCanEdit('converge', 'docs/agent/P02/tasks.md', task.feature), true)
  for (const path of ['docs/agent/P01/tasks.md', 'docs/agent/P02/spec.md', 'src/App.tsx']) assert.equal(stageCanEdit('converge', path, task.feature), false)
  const base = { 'permissions.pilot': { filesystem: { '/app': {} } } }
  const config = stageConfiguration(base, '/app', 'converge', task.feature)
  assert.equal(config['permissions.pilot'].filesystem['/app']['docs/agent/P02/tasks.md'], 'write')
  assert.equal(config['permissions.pilot'].filesystem['/app'].src, 'read')
  assert.deepEqual(base['permissions.pilot'].filesystem['/app'], {})
})

test('P02 review hands R12 corrections back to both original authors', async () => {
  const calls = [], task = pilotTask('P02')
  const review = { complete: true, checkedRequirements: task.requirements, unverified: [], specificationChangesRequired: true, codeChangesRequired: true, summary: 'R12 needs corrections', findings: ['specification', 'implementation'].map(target => ({ target, requirement: 'R12', problem: 'Other fields changed', requestedChange: 'Preserve other fields' })) }
  const outcome = await runBWorkflow({ requirements: task.requirements, phase: async (...args) => { calls.push(args); return true }, hasSpecification: () => true, getReview: () => review })
  assert.equal(outcome.status, 'completed')
  assert.deepEqual(calls.slice(-2), [['specification-repair', 'specification', true], ['implementation-repair', 'implementation', true]])
})

test('C accepts exactly its local Spec Kit skills and rejects host or extra catalogs', () => {
  const names = ['analyze', 'checklist', 'clarify', 'constitution', 'converge', 'implement', 'plan', 'specify', 'tasks', 'taskstoissues']
  const text = '### Skill roots\n- `r0` = `/export/.agents/skills`\n### Available skills\n' + names.map(name => '- speckit-' + name + ': Description (file: r0/speckit-' + name + '/SKILL.md)').join('\n') + '\n</skills_instructions>'
  const snapshot = value => JSON.stringify([{ content: [{ type: 'input_text', text: value }] }])
  assert.doesNotThrow(() => assertLocalSkillCatalog(snapshot(text), '/export'))
  assert.throws(() => assertLocalSkillCatalog(snapshot(text.replace('/export/.agents/skills', '/host/.agents/skills')), '/export'))
  assert.throws(() => assertLocalSkillCatalog(snapshot(text.replace('### Available skills', '- `r1` = `/host/skills`\n### Available skills')), '/export'))
})

test('C preserves shared code boundaries while allowing only its two process metadata files', () => {
  for (const path of ['.specify/feature.json', '.specify/memory/constitution.md']) {
    assert.equal(editable(path), false)
    assert.equal(editable(path, 'C'), true)
  }
  assert.equal(editable('.agents/skills/speckit-plan/SKILL.md', 'C'), false)
  assert.equal(editable('.specify/templates/spec-template.md', 'C'), false)
  assert.equal(stageCanEdit('plan', 'src/App.tsx'), false)
  assert.equal(stageCanEdit('implement', 'src/App.tsx'), true)
  assert.equal(stageCanEdit('implement', '.specify/memory/constitution.md'), false)
  assert.equal(stageCanEdit('converge', 'docs/agent/P01/spec.md'), false)
  assert.equal(stageCanEdit('converge', 'docs/agent/P01/tasks.md'), true)
  assert.equal(cBudget('implement', 300), 180)
  assert.equal(cBudget('implement', 90), 0)
})

test('C rejects approval of unfinished tasks and enforces append-only convergence', () => {
  const done = '- [x] T001 Implement feature\n'
  const report = { outcome: 'converged', summary: 'Checked', unverified: [] }
  assert.deepEqual(parseConvergence(report, done, done), report)
  assert.throws(() => parseConvergence(report, '- [ ] T001 Pending\n', '- [ ] T001 Pending\n'))
  assert.throws(() => parseConvergence(report, '- [ ] [T001] Pending\n', '- [ ] [T001] Pending\n'))
  assert.throws(() => parseConvergence(report, done, done + '\n'))
  const more = { ...report, outcome: 'tasks_appended' }
  assert.deepEqual(parseConvergence(more, done, done + '- [ ] T002 Address gap\n'), more)
  assert.deepEqual(parseConvergence(more, done, done + '- [ ] [T002] Address gap\n'), more)
  assert.throws(() => parseConvergence(more, done, '- [ ] T001 Replaced\n'))
  assert.throws(() => parseConvergence(more, done, done))
})

test('C runs the official steps in order and returns appended work to the same pipeline', async () => {
  const calls = [], reports = [{ outcome: 'tasks_appended' }, { outcome: 'converged' }]
  const status = await runCWorkflow({ phase: async stage => { calls.push(stage); return true }, getConvergence: () => reports.shift() })
  assert.equal(status, 'completed')
  assert.deepEqual(calls, ['constitution', 'specify', 'plan', 'tasks', 'implement', 'converge', 'implement', 'converge'])
})

test('C stops on failed handoffs and preserves unresolved convergence after the allowed repair pass', async () => {
  const calls = []
  assert.equal(await runCWorkflow({ phase: async stage => { calls.push(stage); return stage !== 'plan' }, getConvergence: () => { throw Error('Must not converge') } }), 'phase_stopped')
  assert.deepEqual(calls, ['constitution', 'specify', 'plan'])
  assert.equal(await runCWorkflow({ phase: async () => true, getConvergence: () => ({ outcome: 'tasks_appended' }) }), 'convergence_incomplete')
  assert.equal(await runCWorkflow({ phase: async () => true, getConvergence: () => ({ outcome: 'blocked' }) }), 'convergence_blocked')
})

test('pinned Spec Kit scripts resolve feature and task artifacts without Git or external services', () => {
  for (const variant of ['spec-kit-1.0.8', 'spec-kit-1.0.8-lean']) {
  const root = mkdtempSync(join(tmpdir(), 'mag-speckit-'))
  try {
    cpSync(new URL('../vendor/' + variant + '/.specify', import.meta.url), join(root, '.specify'), { recursive: true })
    mkdirSync(join(root, 'docs/agent/P01'), { recursive: true })
    writeFileSync(join(root, 'docs/agent/P01/spec.md'), '# Test specification\n')
    const runtime = process.env.MAG_SPECKIT_RUNTIME || new URL('../.work/tools/spec-kit-cli-1.0.8', import.meta.url).pathname
    const env = { ...process.env, PATH: runtime + '/bin:' + process.env.PATH, PYTHONDONTWRITEBYTECODE: '1', SPECIFY_INIT_DIR: root, SPECIFY_FEATURE_DIRECTORY: 'docs/agent/P01' }
    const run = (name, ...args) => JSON.parse(execFileSync('/bin/bash', [join(root, '.specify/scripts/bash', name), ...args], { cwd: root, env, encoding: 'utf8' }))
    assert.ok(run('resolve-template.sh', 'spec-template', '--json').TEMPLATE_CONTENT.includes('Feature Specification'))
    const plan = run('setup-plan.sh', '--json')
    assert.equal(plan.FEATURE_DIR, root + '/docs/agent/P01')
    assert.equal(JSON.parse(readFileSync(join(root, '.specify/feature.json'))).feature_directory, 'docs/agent/P01')
    assert.ok(run('setup-tasks.sh', '--json').TASKS_TEMPLATE_CONTENT.includes('Tasks'))
  } finally { rmSync(root, { recursive: true, force: true }) }
  }
})

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
