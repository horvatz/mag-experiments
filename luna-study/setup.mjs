// Researcher-side preparation. Never edits the M/1.0 inputs or archives.
import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
import { sourceHashes } from '../scripts/report-utils.mjs'

const study = dirname(fileURLToPath(import.meta.url)), original = resolve(study, '..')
const root = resolve(study, 'runtime')
const resume = process.argv[2] === 'resume-preparation'
assert.ok(!existsSync(root) || (resume && !existsSync(resolve(study, 'setup.json')) && !existsSync(resolve(root, '.work/pilots'))), 'Never overwrite a prepared Luna collection')
execFileSync(process.execPath, [resolve(original, 'scripts/main-study.mjs'), 'verify-freeze'], { cwd: original, stdio: 'inherit' })
mkdirSync(root, { recursive: true })
const paths = ['baseline.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'playwright.config.ts', 'playwright.p02.config.ts', 'playwright.main.config.ts', 'tasks', 'evaluation', 'reference', 'support', 'scripts', 'vendor', 'docs']
if (!resume) {
  for (const path of paths) cpSync(resolve(original, path), resolve(root, path), { recursive: true })
  cpSync(resolve(original, 'node_modules'), resolve(root, 'node_modules'), { recursive: true, verbatimSymlinks: true })
}
assert.deepEqual(sourceHashes(root), sourceHashes(original), 'The unadapted copy must match M/1.0 byte for byte')
// Unchanged setup scripts resolve ../aplikacija. This link is outside every
// measured export and conveys no additional read permission to the model.
if (!existsSync(resolve(study, 'aplikacija'))) symlinkSync(resolve(original, '../aplikacija'), resolve(study, 'aplikacija'))
mkdirSync(resolve(root, 'reports'), { recursive: true })
for (let n = 3; n <= 10; n++) for (const kind of ['reference', 'mutation']) {
  const name = `P${String(n).padStart(2, '0')}-${kind}-summary.json`
  cpSync(resolve(original, 'reports', name), resolve(root, 'reports', name))
}
const cliSource = '/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex'
const bundle = resolve(root, '.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app')
const cli = resolve(bundle, 'Contents/MacOS/codex')
mkdirSync(dirname(bundle), { recursive: true })
execFileSync('/usr/bin/ditto', [resolve(cliSource, '../../../..'), dirname(bundle)])
assert.equal(execFileSync(cli, ['--version'], { encoding: 'utf8' }).trim(), 'codex-cli 0.158.0-alpha.2.1')
const changes = []
function replace(path, from, to) {
  const file = resolve(root, path), before = readFileSync(file, 'utf8')
  assert.ok(before.includes(from), `Missing adaptation anchor: ${path}`)
  const after = before.replaceAll(from, to)
  writeFileSync(file, after)
  changes.push({ path, from, to, beforeSha256: digest(before), afterSha256: digest(after) })
}
replace('scripts/prepare-pilot.mjs', "model: 'gpt-6-astra'", "model: 'gpt-6-luna'")
replace('scripts/prepare-pilot.mjs', "const cli = realpathSync(process.env.MAG_PILOT_CODEX || resolve(homedir(), task.main ? '.codex/packages/standalone/releases/0.154.0-aarch64-apple-darwin/bin/codex' : '.local/bin/codex'))", "const cli = realpathSync(resolve(root, '.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS/codex'))")
replace('scripts/prepare-pilot.mjs', 'codex-cli 0.154.0', 'codex-cli 0.158.0-alpha.2.1')
replace('scripts/prepare-pilot.mjs', 'Codex CLI 0.154.0', 'Codex CLI 0.158.0-alpha.2.1')
replace('scripts/preflight-pilot.mjs', "resolve(root, '../naloga/zapiski/stanje-projekta.md')", "resolve(root, '../../../naloga/zapiski/stanje-projekta.md'), resolve(root, '../../evaluation/P03/acceptance.spec.ts'), resolve(root, '../../runs/P03-B-001/submission/src/App.tsx')")
replace('scripts/main-design.mjs', "version: 'M/1.0'", "version: 'L/1.0'")
replace('scripts/main-study.mjs', "version: 'M/1.0'", "version: 'L/1.0'")
for (const name of ['main-protocol.md', 'main-experiment-plan.md', 'pilot-protocol.md', 'pilot-b-protocol.md', 'pilot-c-protocol.md']) {
  const path = 'docs/' + name
  const text = readFileSync(resolve(root, path), 'utf8')
  if (text.includes('GPT-6 Astra')) replace(path, 'GPT-6 Astra', 'GPT-6 Luna')
  if (text.includes('0.154.0')) replace(path, '0.154.0', '0.158.0-alpha.2.1')
}
replace('docs/main-protocol.md', 'M/1.0', 'L/1.0')
const protocol = resolve(root, 'docs/main-protocol.md')
writeFileSync(protocol, readFileSync(protocol, 'utf8') + '\n## Dopolnitev L/1.0\n\nTo je nova ločena zbirka z GPT-6 Luna. Njeni lokalni ID-ji P03–P10\nse razločujejo z zbirko L/1.0; niso ponovitve meritev M/1.0 z Astro.\nPodrobnosti primerjave in razlika v različici CLI so v ../../protocol.md.\nZunanje preverbe dostopa niso del časa ali porabe meritve.\n')
const manifest = {
  preparedAt: new Date().toISOString(), collection: 'L/1.0', model: 'gpt-6-luna', reasoningEffort: 'xhigh',
  originalCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: original, encoding: 'utf8' }).trim(),
  originalFreezeSha256: digest(readFileSync(resolve(original, 'main-study/frozen-inputs.json'))),
  cli: { source: cliSource, path: cli, version: 'codex-cli 0.158.0-alpha.2.1', sha256: digest(readFileSync(cli)) },
  node: process.version, paths, changes,
  specKitRuntime: resolve(original, '.work/tools/spec-kit-cli-1.0.8'),
  comparisonLimitation: 'Historical Astra used CLI 0.154.0 and an earlier time period. Between-collection differences cannot be attributed solely to the model.'
}
writeFileSync(resolve(study, 'setup.json'), JSON.stringify(manifest, null, 2) + '\n')
execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'schedule'], { cwd: root })
console.log(JSON.stringify({ prepared: true, root, cli: manifest.cli.version, changes: changes.length }))
