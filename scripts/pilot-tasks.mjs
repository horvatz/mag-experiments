import assert from 'node:assert/strict'
import { cpSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const hiddenPorts = [5183, 3111, 5184, 3112, 5185, 3113, 5186, 3114, 5187, 3115, 5188, 3116]

export function pilotTask(id) {
  assert.match(id, /^P(?:0[1-9]|10)(?:-[ABC]-\d{3})?$/, 'Expected P01..P10 or a run ID')
  const name = id.split('-')[0]
  const p02 = name === 'P02'
  const main = Number(name.slice(1)) >= 3
  return {
    name, main, feature: `docs/agent/${name}`,
    requirements: Array.from({ length: p02 || main ? 12 : 10 }, (_, i) => 'R' + String(i + 1).padStart(2, '0')),
    baselineFile: p02 || main ? `tasks/${name}/baseline.json` : 'baseline.json',
    baselineDirectory: p02 || main ? `.work/${name}/baseline` : '.work/baseline',
    playwrightConfig: main ? 'playwright.main.config.ts' : p02 ? 'playwright.p02.config.ts' : 'playwright.config.ts',
    prepareScript: main ? 'scripts/main.mjs' : p02 ? 'scripts/p02.mjs' : 'scripts/prepare-reference.mjs',
    prepareArgs: main ? ['prepare', name] : p02 ? ['prepare'] : [],
    totalChecks: main ? 70 : p02 ? 72 : 68,
    counts: { 'regression-api': 14, 'regression-desktop': 12, 'regression-mobile': 12,
      'development-desktop': 4, 'development-mobile': 4, 'evaluation-desktop': main ? 12 : p02 ? 13 : 11, 'evaluation-mobile': main ? 12 : p02 ? 13 : 11 },
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
  if (task.main) cpSync(resolve(root, 'tasks', task.name, 'helpers.ts'), resolve(app, 'tests/development/helpers.ts'))
}

export function protectedTaskFiles(root, task) {
  return [resolve(root, 'evaluation', task.name, 'acceptance.spec.ts'),
    resolve(root, 'reference', task.name, 'overlay/src', task.main ? 'TaskFeature.tsx' : task.name === 'P02' ? 'useBulkTasks.ts' : 'TaskEditor.tsx')]
}

export function assertTaskBaseline(root, manifest, task) {
  assert.equal(manifest.task, task.name)
  assert.deepEqual(manifest.baseline, JSON.parse(readFileSync(resolve(root, task.baselineFile), 'utf8')), 'Baseline changed since preparation')
}
