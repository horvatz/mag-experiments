import { pilotTask, protectedTaskFiles, assertTaskBaseline } from './pilot-tasks.mjs'
import { execFileSync } from 'node:child_process'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientEnvironment, configArguments } from './pilot-utils.mjs'
import { roleCanEdit } from './procedure-b.mjs'
import { stageCanEdit, assertLocalSkillCatalog } from './procedure-c.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = resolve(root, '.work/pilots', process.argv[2] || 'P01-A-001')
const app = resolve(run, 'app')
const config = JSON.parse(readFileSync(resolve(run, 'config.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(run, 'manifest.json'), 'utf8'))
const task = pilotTask(manifest.id)
assertTaskBaseline(root, manifest, task)
const cli = manifest.cli || realpathSync(resolve(process.env.HOME, '.local/bin/codex'))
const env = clientEnvironment(config)
// Open attempts never print file contents, including when a boundary is wrong.
const code = [
  "const fs = require('node:fs'); const assert = require('node:assert/strict');",
  "const checks = [];",
  "function denied(path) { let blocked = false; try { const fd = fs.openSync(path, 'r'); fs.closeSync(fd) } catch (e) { blocked = e.code === 'EPERM' || e.code === 'EACCES' }; checks.push({path, blocked}); assert.ok(blocked, 'Unexpected read access: '+path) }",
  "fs.readFileSync('task/instructions.md');",
  "fs.writeFileSync('docs/agent/preflight.txt', 'temporary boundary probe');",
  "fs.unlinkSync('docs/agent/preflight.txt');",
  ...[...protectedTaskFiles(root, pilotTask('P01')), ...protectedTaskFiles(root, pilotTask('P02')), resolve(root, '../naloga/zapiski/stanje-projekta.md'), resolve(process.env.HOME, '.codex/auth.json')].map((path) => 'denied(' + JSON.stringify(path) + ');'),
  "try { fs.writeFileSync('server/preflight.txt', 'no'); throw new Error('Unexpected infrastructure write access') } catch(e) { assert.ok(['EPERM','EACCES'].includes(e.code)) }",
  "console.log(JSON.stringify({filesystem: checks, allowedReadWrite: true, protectedInfrastructure: true}));",
].join('\n')
const args = ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, process.execPath, '-e', code]
const output = execFileSync(cli, args, { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
writeFileSync(resolve(run, 'preflight-filesystem.json'), output)
console.log(output.trim())
const snapshot = execFileSync(cli, ['debug', 'prompt-input', ...configArguments(config)], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
if (manifest.procedure === 'C') assertLocalSkillCatalog(snapshot, app)
else if (snapshot.includes('### Available skills')) throw new Error('Host skill catalog was not disabled')
writeFileSync(resolve(run, 'preflight-prompt.json'), snapshot)
if (manifest.procedure === 'B') {
  const protocol = JSON.parse(readFileSync(resolve(run, 'procedure-b.json'), 'utf8'))
  const roles = []
  for (const [role, roleConfig] of Object.entries(protocol.configs)) {
    const probes = ['src/preflight.tmp', 'tests/agent/preflight.tmp', 'docs/agent/preflight.tmp', 'docs/agent/specification.md', 'docs/agent/specification-history.md', 'docs/agent/review.md', 'docs/agent/review.json']
      .map((path) => ({ path, allowed: roleCanEdit(role, path) }))
    const probe = `const fs=require('node:fs'),assert=require('node:assert/strict');for(const p of ${JSON.stringify(probes)}){assert.ok(!fs.existsSync(p.path),'Probe must not overwrite existing file');let allowed=false;try{fs.writeFileSync(p.path,'probe');allowed=true;fs.unlinkSync(p.path)}catch(e){if(!['EPERM','EACCES'].includes(e.code))throw e}assert.equal(allowed,p.allowed,p.path)}console.log('Role boundary passed')`
    execFileSync(cli, ['sandbox', ...configArguments(roleConfig), '-P', 'pilot', '-C', app, process.execPath, '-e', probe], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
    const rolePrompt = execFileSync(cli, ['debug', 'prompt-input', ...configArguments(roleConfig)], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
    if (rolePrompt.includes('### Available skills')) throw new Error('Host skills exposed to ' + role)
    writeFileSync(resolve(run, 'preflight-prompt-' + role + '.json'), rolePrompt)
    roles.push({ role, passed: true, probes })
  }
  writeFileSync(resolve(run, 'preflight-roles.json'), JSON.stringify(roles, null, 2) + '\n')
  console.log('All three role boundaries passed.')
}
if (manifest.procedure === 'C') {
  const protocol = JSON.parse(readFileSync(resolve(run, 'procedure-c.json'), 'utf8'))
  const stages = []
  for (const [stage, stageConfig] of Object.entries(protocol.configs)) {
    const probes = ['src/preflight.tmp', 'tests/agent/preflight.tmp', 'docs/agent/preflight.tmp', task.feature + '/tasks.md', 'docs/agent/convergence.json', '.specify/memory/constitution.md', '.specify/feature.json', '.specify/templates/preflight.tmp', '.agents/skills/preflight.tmp']
      .map(path => ({ path, allowed: stageCanEdit(stage, path, task.feature) }))
    const probe = `const fs=require('node:fs'),assert=require('node:assert/strict');for(const p of ${JSON.stringify(probes)}){const original=fs.existsSync(p.path)?fs.readFileSync(p.path):null;let allowed=false;try{fs.writeFileSync(p.path,original??'probe');allowed=true;if(original===null)fs.unlinkSync(p.path)}catch(e){if(!['EPERM','EACCES'].includes(e.code))throw e}assert.equal(allowed,p.allowed,p.path)}console.log('Stage boundary passed')`
    execFileSync(cli, ['sandbox', ...configArguments(stageConfig), '-P', 'pilot', '-C', app, process.execPath, '-e', probe], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
    const stagePrompt = execFileSync(cli, ['debug', 'prompt-input', ...configArguments(stageConfig)], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
    assertLocalSkillCatalog(stagePrompt, app)
    writeFileSync(resolve(run, 'preflight-prompt-' + stage + '.json'), stagePrompt)
    stages.push({ stage, passed: true, probes })
  }
  const resolveTemplate = execFileSync(cli, ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, '/bin/bash', '.specify/scripts/bash/resolve-template.sh', 'spec-template', '--json'], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
  if (!JSON.parse(resolveTemplate).TEMPLATE_CONTENT.includes('Feature Specification')) throw new Error('Spec Kit template resolver failed')
  writeFileSync(resolve(run, 'preflight-c.json'), JSON.stringify(stages, null, 2) + '\n')
  console.log('All six C stage boundaries and the official template resolver passed.')
  const runtime = JSON.parse(readFileSync(resolve(run, 'spec-kit-runtime.json'), 'utf8'))
  const pythonProbe = "import os,sys,yaml,json; assert os.path.samefile(sys.executable, " + JSON.stringify(runtime.python) + " ); assert yaml.__version__ == '6.0.3'; print(json.dumps({'python':sys.executable,'version':sys.version.split()[0],'yaml':yaml.__version__}))"
  const probeCode = "const {execFileSync}=require('node:child_process');process.stdout.write(execFileSync('python3',['-c'," + JSON.stringify(pythonProbe) + "],{encoding:'utf8'}))"
  const quote = value => "'" + value.replaceAll("'", "'\"'\"'") + "'"
  const pythonCheck = execFileSync(cli, ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, '/bin/zsh', '-lc', 'node -e ' + quote(probeCode)], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
  writeFileSync(resolve(run, 'preflight-python.json'), JSON.stringify({ loginShell: '/bin/zsh -lc', ...JSON.parse(pythonCheck) }, null, 2) + '\n')
  console.log('Pinned Python and PyYAML work in the agent login shell.')
}
const runtimeArgs = ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app,
  '/bin/sh', '-c', 'npm run lint && npm run build && npx playwright test --project=api --project=desktop --project=mobile']
try {
  const runtime = execFileSync(cli, runtimeArgs, { cwd: app, env, encoding: 'utf8', timeout: 60_000 })
  const development = execFileSync(cli, ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, '/bin/sh', '-c', 'npx playwright test --list --project=development-desktop --project=development-mobile'], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
  if (!development.includes('Total: 8 tests')) throw new Error('Expected eight exported development checks')
  writeFileSync(resolve(run, 'preflight-runtime.log'), runtime + '\n' + development)
  if (!runtime.includes('38 passed')) throw new Error('Expected all 38 baseline tests')
  console.log('Build and all 38 baseline checks passed inside the agent profile.')
} catch (error) {
  writeFileSync(resolve(run, 'preflight-runtime.log'), (error.stdout || '') + '\n' + (error.stderr || ''))
  throw error
}
