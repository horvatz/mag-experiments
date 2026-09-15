import { execFileSync } from 'node:child_process'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientEnvironment, configArguments } from './pilot-utils.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = resolve(root, '.work/pilots', process.argv[2] || 'P01-A-001')
const app = resolve(run, 'app')
const config = JSON.parse(readFileSync(resolve(run, 'config.json'), 'utf8'))
const env = clientEnvironment(config)
// Open attempts never print file contents, including when a boundary is wrong.
const code = [
  "const fs = require('node:fs'); const assert = require('node:assert/strict');",
  "const checks = [];",
  "function denied(path) { let blocked = false; try { const fd = fs.openSync(path, 'r'); fs.closeSync(fd) } catch (e) { blocked = e.code === 'EPERM' || e.code === 'EACCES' }; checks.push({path, blocked}); assert.ok(blocked, 'Unexpected read access: '+path) }",
  "fs.readFileSync('task/instructions.md');",
  "fs.writeFileSync('docs/agent/preflight.txt', 'temporary boundary probe');",
  "fs.unlinkSync('docs/agent/preflight.txt');",
  ...[resolve(root, 'evaluation/P01/acceptance.spec.ts'), resolve(root, 'reference/P01/overlay/src/TaskEditor.tsx'), resolve(root, '../naloga/zapiski/stanje-projekta.md'), resolve(process.env.HOME, '.codex/auth.json')].map((path) => 'denied(' + JSON.stringify(path) + ');'),
  "try { fs.writeFileSync('server/preflight.txt', 'no'); throw new Error('Unexpected infrastructure write access') } catch(e) { assert.ok(['EPERM','EACCES'].includes(e.code)) }",
  "console.log(JSON.stringify({filesystem: checks, allowedReadWrite: true, protectedInfrastructure: true}));",
].join('\n')
const args = ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app, process.execPath, '-e', code]
const output = execFileSync(realpathSync(resolve(process.env.HOME, '.local/bin/codex')), args, { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
writeFileSync(resolve(run, 'preflight-filesystem.json'), output)
console.log(output.trim())
const cli = realpathSync(resolve(process.env.HOME, '.local/bin/codex'))
const snapshot = execFileSync(cli, ['debug', 'prompt-input', ...configArguments(config)], { cwd: app, env, encoding: 'utf8', timeout: 30_000 })
if (snapshot.includes('### Available skills')) throw new Error('Host skill catalog was not disabled')
writeFileSync(resolve(run, 'preflight-prompt.json'), snapshot)
const runtimeArgs = ['sandbox', ...configArguments(config), '-P', 'pilot', '-C', app,
  '/bin/sh', '-c', 'npm run lint && npm run build && npx playwright test --project=api --project=desktop --project=mobile']
try {
  const runtime = execFileSync(cli, runtimeArgs, { cwd: app, env, encoding: 'utf8', timeout: 60_000 })
  writeFileSync(resolve(run, 'preflight-runtime.log'), runtime)
  if (!runtime.includes('38 passed')) throw new Error('Expected all 38 baseline tests')
  console.log('Build and all 38 baseline checks passed inside the agent profile.')
} catch (error) {
  writeFileSync(resolve(run, 'preflight-runtime.log'), (error.stdout || '') + '\n' + (error.stderr || ''))
  throw error
}
