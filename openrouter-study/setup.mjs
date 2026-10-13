// Prepare separate collections from frozen M/1.0; never edit M/L inputs.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { constants, cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
import { sourceHashes } from '../scripts/report-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url)), original = resolve(study, '..')
const plan = JSON.parse(readFileSync(resolve(study, 'models.json')))
const pinned = JSON.parse(readFileSync(resolve(original, 'luna-study/setup.json')))
const paths = pinned.paths
const selected = plan.models.find(m => m.slug === process.argv[2]); assert.ok(selected, 'Choose glm, deepseek or qwen')
const collection = resolve(study, selected.slug), root = resolve(collection, 'runtime')
assert.ok(!existsSync(root), 'Never overwrite an existing collection')
execFileSync(process.execPath, [resolve(original, 'scripts/main-study.mjs'), 'verify-freeze'], { cwd: original, stdio: 'inherit' })
assert.equal(digest(readFileSync(pinned.cli.path)), pinned.cli.sha256)
mkdirSync(root, { recursive: true })
for (const path of paths) cpSync(resolve(original, path), resolve(root, path), { recursive: true, mode: constants.COPYFILE_FICLONE })
assert.deepEqual(sourceHashes(root), sourceHashes(original))
cpSync(resolve(original, 'node_modules'), resolve(root, 'node_modules'), { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE })
symlinkSync(resolve(original, '../aplikacija'), resolve(collection, 'aplikacija'))
mkdirSync(resolve(root, 'reports'))
for (let n = 3; n <= 10; n++) for (const kind of ['reference', 'mutation']) {
  const file = `P${String(n).padStart(2, '0')}-${kind}-summary.json`
  cpSync(resolve(original, 'reports', file), resolve(root, 'reports', file))
}
const changes = []
function replace(path, from, to) {
  const file = resolve(root, path), before = readFileSync(file, 'utf8')
  assert.ok(before.includes(from), 'Missing adaptation: ' + path)
  const after = before.replaceAll(from, to); writeFileSync(file, after)
  changes.push({ path, from, to, beforeSha256: digest(before), afterSha256: digest(after) })
}
replace('scripts/prepare-pilot.mjs', "model: 'gpt-6-astra', model_reasoning_effort: 'xhigh'", `model: ${JSON.stringify(selected.id)}, model_reasoning_effort: 'xhigh',\n  model_provider: 'openrouter_study',\n  'model_providers.openrouter_study': { name: 'OpenRouter study relay', base_url: 'http://127.0.0.1:9238/v1', wire_api: 'responses', env_key: 'MAG_RELAY_TOKEN', request_max_retries: 0, stream_max_retries: 0 }`)
replace('scripts/prepare-pilot.mjs', "const cli = realpathSync(process.env.MAG_PILOT_CODEX || resolve(homedir(), task.main ? '.codex/packages/standalone/releases/0.154.0-aarch64-apple-darwin/bin/codex' : '.local/bin/codex'))", `const cli = realpathSync(${JSON.stringify(pinned.cli.path)})`)
replace('scripts/prepare-pilot.mjs', 'codex-cli 0.154.0', pinned.cli.version)
replace('scripts/prepare-pilot.mjs', 'Codex CLI 0.154.0', pinned.cli.version.replace('codex-cli', 'Codex CLI'))
replace('scripts/preflight-pilot.mjs', "resolve(root, '../naloga/zapiski/stanje-projekta.md')", `resolve(${JSON.stringify(resolve(original, '../naloga/notes/experiment-handoff.md'))}), resolve(${JSON.stringify(resolve(original, 'evaluation/P03/acceptance.spec.ts'))}), resolve(${JSON.stringify(resolve(original, 'runs/P03-B-001/submission/src/App.tsx'))}), resolve(${JSON.stringify(resolve(original, 'luna-study/runtime/runs/P03-B-001/submission/src/App.tsx'))})`)
replace('scripts/pilot-utils.mjs', "return { ...inherited, ...config['shell_environment_policy.set'] }", "return { ...inherited, ...config['shell_environment_policy.set'], ...(process.env.MAG_RELAY_TOKEN ? { MAG_RELAY_TOKEN: process.env.MAG_RELAY_TOKEN } : {}) }")
for (const file of ['run-pilot.mjs', 'run-pilot-b.mjs', 'run-pilot-c.mjs']) replace('scripts/' + file, 'Existing ChatGPT login; token usage is not an API invoice.', 'OpenRouter API; provider usage and invoiced cost are recorded separately by the researcher relay.')
replace('scripts/prepare-pilot.mjs', ".trim().split('\\n').filter(Boolean).map((path) => ({ path, enabled: false }))", ".trim().split('\\n').filter(Boolean).concat([resolve(homedir(), '.codex/skills/.system/plugin-creator/SKILL.md')]).map((path) => ({ path, enabled: false }))")
replace("scripts/prepare-pilot.mjs", "import { cpSync, existsSync", "import { constants, cpSync, existsSync")
replace("scripts/prepare-pilot.mjs", "cpSync(resolve(root, 'node_modules'), resolve(app, 'node_modules'), { recursive: true, verbatimSymlinks: true })", "cpSync(resolve(root, 'node_modules'), resolve(app, 'node_modules'), { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE })")
replace("scripts/archive-pilot.mjs", "'network-audit.json']", "'network-audit.json', 'api-cost.json']")
replace("scripts/archive-pilot.mjs", "Zagon uporablja obstoječo prijavo ChatGPT. Iz porabe nismo izračunali stroška API ali zneska v evrih.", "Zagon uporablja OpenRouter API. Dejansko zaračunani strošek in popolnost evidence sta ločena v api-cost.json; tokenov ne pretvarjamo v evre.")
replace('scripts/main-design.mjs', "version: 'M/1.0'", `version: ${JSON.stringify(selected.collection)}`)
replace('scripts/main-study.mjs', "version: 'M/1.0'", `version: ${JSON.stringify(selected.collection)}`)
for (const file of ['main-protocol.md', 'main-experiment-plan.md', 'pilot-protocol.md', 'pilot-b-protocol.md', 'pilot-c-protocol.md']) {
  const path = 'docs/' + file, text = readFileSync(resolve(root, path), 'utf8')
  if (text.includes('GPT-6 Astra')) replace(path, 'GPT-6 Astra', selected.id)
  if (text.includes('0.154.0')) replace(path, '0.154.0', pinned.cli.version.replace('codex-cli ', ''))
}
replace('docs/main-protocol.md', 'M/1.0', selected.collection)
const manifest = { preparedAt: new Date().toISOString(), collection: selected.collection, model: selected.id,
  originalCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: original, encoding: 'utf8' }).trim(),
  originalFreezeSha256: digest(readFileSync(resolve(original, 'main-study/frozen-inputs.json'))), cli: pinned.cli,
  specKitRuntime: pinned.specKitRuntime, node: process.version, paths, changes, frozen: false,
  comparisonLimitation: 'New collections share the pinned Luna CLI but use OpenRouter rather than ChatGPT. Historical comparisons do not isolate model effects.' }
writeFileSync(resolve(collection, 'setup.json'), JSON.stringify(manifest, null, 2) + '\n')
execFileSync(process.execPath, [resolve(root, 'scripts/main-study.mjs'), 'schedule'], { cwd: root })
console.log(JSON.stringify({ prepared: selected.collection, measuredRunsStarted: 0, changes: changes.length }))
