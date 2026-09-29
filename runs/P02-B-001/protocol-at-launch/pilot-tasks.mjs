import assert from 'node:assert/strict'
import { cpSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const hiddenPorts = [5183, 3111, 5184, 3112, 5185, 3113, 5186, 3114]

export function pilotTask(id) {
  assert.match(id, /^P0[12](?:-[ABC]-\d{3})?$/, 'Expected P01/P02 or a pilot run ID')
  const name = id.split('-')[0]
  const p02 = name === 'P02'
  return {
    name, feature: `docs/agent/${name}`,
    requirements: Array.from({ length: p02 ? 12 : 10 }, (_, i) => 'R' + String(i + 1).padStart(2, '0')),
    baselineFile: p02 ? 'tasks/P02/baseline.json' : 'baseline.json',
    baselineDirectory: p02 ? '.work/P02/baseline' : '.work/baseline',
    playwrightConfig: p02 ? 'playwright.p02.config.ts' : 'playwright.config.ts',
    prepareScript: p02 ? 'scripts/p02.mjs' : 'scripts/prepare-reference.mjs',
    prepareArgs: p02 ? ['prepare'] : [],
    totalChecks: p02 ? 72 : 68,
    counts: { 'regression-api': 14, 'regression-desktop': 12, 'regression-mobile': 12,
      'development-desktop': 4, 'development-mobile': 4, 'evaluation-desktop': p02 ? 13 : 11, 'evaluation-mobile': p02 ? 13 : 11 },
  }
}

export function taskPrompts(prompts, task) {
  return Object.fromEntries(Object.entries(prompts).map(([key, value]) => [key, task.name === 'P01' ? value : value
    .replaceAll('P01', task.name).replaceAll('R01–R10', 'R01–R12')
    .replaceAll('vseh deset zahtev', 'vseh dvanajst zahtev').replaceAll('vsemi desetimi zahtevami', 'vsemi dvanajstimi zahtevami')]))
}

export function exportPublicTask(root, app, task) {
  mkdirSync(resolve(app, 'task'), { recursive: true })
  mkdirSync(resolve(app, 'tests/development'), { recursive: true })
  for (const file of ['instructions.md', 'specification-template.md']) cpSync(resolve(root, 'tasks', task.name, file), resolve(app, 'task', file))
  cpSync(resolve(root, 'tasks', task.name, 'development.spec.ts'), resolve(app, 'tests/development', task.name + '.spec.ts'))
  if (task.name === 'P02') {
    cpSync(resolve(root, 'tasks/P02/helpers.ts'), resolve(app, 'tests/development/helpers.ts'))
    mkdirSync(resolve(app, 'support'), { recursive: true })
    cpSync(resolve(root, 'support/types.ts'), resolve(app, 'support/types.ts'))
  }
}

export function protectedTaskFiles(root, task) {
  return [resolve(root, 'evaluation', task.name, 'acceptance.spec.ts'),
    resolve(root, 'reference', task.name, 'overlay/src', task.name === 'P02' ? 'useBulkTasks.ts' : 'TaskEditor.tsx')]
}

export function assertTaskBaseline(root, manifest, task) {
  assert.equal(manifest.task, task.name)
  assert.deepEqual(manifest.baseline, JSON.parse(readFileSync(resolve(root, task.baselineFile), 'utf8')), 'Baseline changed since preparation')
}
