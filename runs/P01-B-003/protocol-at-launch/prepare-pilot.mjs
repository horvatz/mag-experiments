import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { digest, inventory } from './pilot-utils.mjs'
import { configureBrowser } from './pilot-browser.mjs'
import { roles, roleConfiguration, prompts, workflow, reviewSchema } from './procedure-b.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2] || 'P01-A-001'
if (!/^P01-[AB]-\d{3}$/.test(id)) throw new Error('Expected an unused ID such as P01-A-001 or P01-B-001.')
const procedure = id.split('-')[1]
const cli = realpathSync(process.env.MAG_PILOT_CODEX || resolve(homedir(), '.local/bin/codex'))
const run = resolve(root, '.work/pilots', id)
if (existsSync(run)) throw new Error(`Refusing to overwrite ${run}`)
const app = resolve(run, 'app')
const baseline = JSON.parse(readFileSync(resolve(root, 'baseline.json'), 'utf8'))
const source = resolve(process.env.MAG_APP_REPOSITORY || resolve(root, '../aplikacija'))
mkdirSync(app, { recursive: true })
const archive = resolve(run, 'baseline.tar')
execFileSync('git', ['archive', '--format=tar', '--output', archive, baseline.commit], { cwd: source })
execFileSync('tar', ['-xf', archive, '-C', app])
rmSync(archive)
cpSync(resolve(root, 'node_modules'), resolve(app, 'node_modules'), { recursive: true, verbatimSymlinks: true })
for (const folder of ['task', 'tests/development', 'tests/agent', 'docs/agent', '.tmp', 'dist', 'test-results', 'playwright-report', '.vite', 'node_modules/.vite', 'node_modules/.vite-temp']) mkdirSync(resolve(app, folder), { recursive: true })
for (const name of ['instructions.md', 'specification-template.md']) cpSync(resolve(root, 'tasks/P01', name), resolve(app, 'task', name))
cpSync(resolve(root, 'tasks/P01/development.spec.ts'), resolve(app, 'tests/development/P01.spec.ts'))
// Researcher-owned, identical setup for every future exported P01 run. The
// baseline config is extended only to expose the four shared development tests.
const configFile = resolve(app, 'playwright.config.ts')
const originalConfig = readFileSync(configFile, 'utf8').replace(
  "reporter: [['list'], ['html', { open: 'never' }]],",
  "outputDir: 'test-results/run',\n  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/html' }]],")
const anchor = "    { name: 'agent',"
if (!originalConfig.includes(anchor)) throw new Error('Unexpected baseline Playwright config.')
writeFileSync(configFile, originalConfig.replace(anchor,
  "    { name: 'development-desktop', testMatch: '**/development/**/*.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } } },\n" +
  "    { name: 'development-mobile', testMatch: '**/development/**/*.spec.ts', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },\n" + anchor))
configureBrowser(app, run)
writeFileSync(resolve(app, 'AGENTS.md'), '# Pilot P01\n\nRead `PROJECT_RULES.md` and `task/instructions.md`. Work independently as one agent.\nOnly change `src/`, `tests/agent/` and `docs/agent/`. Shared development tests are\nin `tests/development/`. All dependencies and Chromium are already installed.\nDo not use other agents, other projects, connectors, or remote repositories.\n')
if (procedure === 'B') writeFileSync(resolve(app, 'AGENTS.md'), '# Pilot P01, procedure B\n\nRead PROJECT_RULES.md and task/instructions.md. Follow the assigned role.\nThe runner coordinates three sequential agents; do not launch agents yourself.\nThe specification author owns docs/agent/specification.md and specification-history.md.\nThe implementer owns src/, tests/agent/ and other implementation notes in docs/agent/.\nThe reviewer owns docs/agent/review.md and review.json. Do not modify another role\'s files.\nShared development tests are in tests/development/. Dependencies and Chromium are installed.\nDo not use other projects, connectors or remote repositories.\n')
const nodeRoot = dirname(dirname(realpathSync(process.execPath)))
const browsers = resolve(homedir(), 'Library/Caches/ms-playwright')
const tmp = resolve(app, '.tmp')
const permissions = {
  description: 'Pilot: exported app and required runtimes only',
  filesystem: {
    ':root': 'deny', ':minimal': 'read', ':tmpdir': 'write', ':slash_tmp': 'deny',
    [app]: { '.': 'read', src: 'write', 'tests/agent': 'write', 'docs/agent': 'write', '.tmp': 'write', '.vite': 'write', dist: 'write', 'test-results': 'write', 'playwright-report': 'write', 'node_modules/.vite': 'write', 'node_modules/.vite-temp': 'write' },
    [resolve(homedir(), '.local/bin/codex')]: 'read', [dirname(cli)]: 'read', [nodeRoot]: 'read', [browsers]: 'read', '/System': 'read', '/Library/Fonts': 'read',
  },
  network: { enabled: true, allow_local_binding: true, domains: { '127.0.0.1': 'allow', localhost: 'allow' } },
}
const config = {
  model: 'gpt-6-astra', model_reasoning_effort: 'xhigh', approval_policy: 'never',
  default_permissions: 'pilot', 'permissions.pilot': permissions,
  web_search: 'disabled', 'features.network_proxy': true,
  'features.skip_host_skill_discovery': true,
  ...Object.fromEntries(['apps', 'plugins', 'browser_use', 'browser_use_external', 'computer_use', 'in_app_browser', 'image_generation', 'memories', 'multi_agent', 'multi_agent_v2', 'hooks', 'shell_snapshot', 'skill_search', 'workspace_dependencies', 'goals'].map((name) => [`features.${name}`, false])),
  'shell_environment_policy.inherit': 'none',
  'shell_environment_policy.set': { PATH: `${nodeRoot}/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin`, TMPDIR: tmp, PLAYWRIGHT_BROWSERS_PATH: browsers, npm_config_cache: resolve(tmp, 'npm'), CI: '1', LANG: 'en_US.UTF-8' },
  'shell_environment_policy.experimental_use_profile': false,
  'skills.config': execFileSync('rg', ['--files', '--hidden', '--follow', '-g', 'SKILL.md',
    resolve(homedir(), '.agents/skills'), resolve(homedir(), '.codex/skills/.system')],
  { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map((path) => ({ path, enabled: false })),
  project_doc_max_bytes: 32768,
}
writeFileSync(resolve(run, 'config.json'), JSON.stringify(config, null, 2) + '\n')
const prompt = `Izvedi pilotno nalogo P01 samostojno po postopku A (en agent).\n\nPreberi PROJECT_RULES.md, task/instructions.md in task/specification-template.md. Najprej pripravi specifikacijo v docs/agent/specification.md, nato implementiraj zahteve in preveri rešitev. Ob spremembi specifikacije ohrani kratek zapis popravka. Lastne teste dodajaj v tests/agent/. V docs/agent/verification.md zapiši dejansko izvedena preverjanja, rezultate, povezave z zahtevami ter omejitve.\n\nNa voljo imaš največ 20 minut od začetka tega zagona; čas vključuje specifikacijo, kodo in preverjanje. Končaj prej, ko opraviš nalogo. Končna predaja je stanje datotek ob koncu tvojega odgovora oziroma ob časovni omejitvi. Reši tudi zahteve, ki jih skupni razvojni testi morda ne zajamejo.\n\nOdvisnosti in Chromium so nameščeni. npm run check izvede preverjanje kode in vse dostopne teste (38 preverjanj izhodišča, 8 razvojnih preverjanj P01 in tvoje dodatne teste). Samo skupne razvojne teste lahko zaženeš z npx playwright test --project=development-desktop --project=development-mobile. Testi imajo lastni strežnik na vratih 5174/3102. Za ročni ogled uporabi WEB_PORT=5193 API_PORT=3123 npm run dev. Testi so že nastavljeni na ločen Chromium. Za lastne skripte preberi wsEndpoint iz task/browser.json in uporabi chromium.connect(wsEndpoint); chromium.launch() znotraj tega okolja ne deluje. Dostop do javnega interneta je blokiran. Uporabljaj samo lokalne storitve te naloge.\n\nSpreminjaj samo src/, tests/agent/ in docs/agent/. To je svež izvoz brez zgodovine Git. Ne dodajaj odvisnosti, ne spreminjaj infrastrukture ali skupnih testov in ne zaganjaj drugih agentov. Če kakšen korak zaradi omejitev okolja ne deluje, to jasno zabeleži in nadaljuj z drugim dovoljenim načinom. Na koncu kratko povzemaj rezultat in neizpolnjene zahteve.\n`
const runPrompt = procedure === 'A' ? prompt : 'Postopek B: specification → implementation → review → po potrebi specification-repair → implementation-repair. Pozivi in nastavitve posameznih vlog so v procedure-b.json.\n'
writeFileSync(resolve(run, 'prompt.md'), runPrompt)
let procedureB
let protocolSourceHashes
if (procedure === 'B') {
  writeFileSync(resolve(app, 'task/review-schema.json'), JSON.stringify(reviewSchema, null, 2) + '\n')
  writeFileSync(resolve(app, 'task/time-budget.mjs'), `const phase = Number(process.env.MAG_PHASE_DEADLINE_MS)\nconst run = Number(process.env.MAG_RUN_DEADLINE_MS)\nif (!Number.isFinite(phase) || !Number.isFinite(run)) throw new Error('No active phase clock')\nconst seconds = (end) => Math.max(0, Math.floor((end - Date.now()) / 1000))\nconsole.log(JSON.stringify({ phaseSecondsRemaining: seconds(phase), totalSecondsRemaining: seconds(run), phaseDeadlineUTC: new Date(phase).toISOString() }))\n`)
  procedureB = { workflow, prompts, reviewSchema, configs: Object.fromEntries(roles.map((role) => [role, roleConfiguration(config, app, role)])) }
  writeFileSync(resolve(run, 'procedure-b.json'), JSON.stringify(procedureB, null, 2) + '\n')
  mkdirSync(resolve(run, 'protocol'))
  protocolSourceHashes = {}
  for (const file of ['prepare-pilot.mjs', 'preflight-pilot.mjs', 'run-pilot.mjs', 'run-pilot-b.mjs', 'pilot-utils.mjs', 'procedure-b.mjs', 'pilot-browser.mjs', 'evaluate-pilot.mjs', 'archive-pilot.mjs', 'reconcile-pilot-usage.mjs']) {
    cpSync(resolve(root, 'scripts', file), resolve(run, 'protocol', file))
    protocolSourceHashes['scripts/' + file] = digest(readFileSync(resolve(root, 'scripts', file)))
  }
  cpSync(resolve(root, 'docs/pilot-b-protocol.md'), resolve(run, 'protocol/pilot-b-protocol.md'))
}
const manifest = { id, createdAt: new Date().toISOString(), baseline, procedure, task: 'P01', limitSeconds: 1200, model: config.model, reasoningEffort: config.model_reasoning_effort, node: process.version, platform: process.platform, architecture: process.arch, cli, cliVersion: execFileSync(cli, ['--version'], { encoding: 'utf8' }).trim(), setup: 'P01 shared development projects added to exported Playwright configuration', promptSha256: digest(runPrompt), configSha256: digest(JSON.stringify(config)), browserProfileSha256: digest(readFileSync(resolve(run, 'browser.sb'))), ...(procedureB ? { procedureBSha256: digest(JSON.stringify(procedureB)) } : {}), files: inventory(app) }
if (protocolSourceHashes) manifest.protocolSourceHashes = protocolSourceHashes
writeFileSync(resolve(run, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`Prepared ${id}: ${Object.keys(manifest.files).length} files, no reference or evaluation export. Model run has not started.`)
