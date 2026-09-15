import { randomUUID } from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientEnvironment } from './pilot-utils.mjs'

export function configureBrowser(app, run) {
  const port = 9223
  const token = randomUUID()
  const tmp = resolve(app, '.tmp/browser')
  mkdirSync(tmp, { recursive: true })
  writeFileSync(resolve(app, 'task/browser.json'), JSON.stringify({ wsEndpoint: 'ws://127.0.0.1:' + port + '/' + token, port, token }) + '\n')
  const server = [
    "import { chromium } from 'playwright';",
    "import { readFileSync } from 'node:fs';",
    "const {port,token} = JSON.parse(readFileSync(new URL('./browser.json',import.meta.url),'utf8'));",
    "const server = await chromium.launchServer({headless:true,host:'127.0.0.1',port,wsPath:'/'+token});",
    "console.log('Pilot browser ready');",
    "process.once('SIGTERM', async () => { await server.close(); process.exit(0) });",
    "process.once('SIGINT', async () => { await server.close(); process.exit(0) });",
  ].join('\n') + '\n'
  writeFileSync(resolve(app, 'task/browser-server.mjs'), server)
  const configPath = resolve(app, 'playwright.config.ts')
  const config = readFileSync(configPath, 'utf8')
  writeFileSync(configPath, "import { readFileSync } from 'node:fs'\n" +
    config.replace("use: { baseURL:", "use: { connectOptions: { wsEndpoint: JSON.parse(readFileSync(new URL('./task/browser.json', import.meta.url), 'utf8')).wsEndpoint }, baseURL:"))
  // A separate browser process needs Chromium's Mach IPC. It has a single
  // native sandbox, with read access only to runtime files and the export.
  // It cannot browse file:// copies of the hidden reference or evaluator.
  const readable = ['/System', '/usr', '/bin', '/sbin', '/dev', '/private/etc', '/private/var/db/timezone', '/Library/Fonts',
    dirname(dirname(realpathSync(process.execPath))), resolve(homedir(), 'Library/Caches/ms-playwright'), app]
  const profile = ['(version 1)', '(allow default)',
    '(deny file-read-data (require-not (require-any (literal "/") ' + readable.map((path) => '(subpath ' + JSON.stringify(path) + ')').join(' ') + ')))',
    '(deny file-write* (require-not (require-any (subpath ' + JSON.stringify(tmp) + ') (subpath "/dev"))))',
    "(deny network*)",
    "(allow network-bind (local ip \"*:9223\"))",
    "(allow network-inbound (local ip \"localhost:9223\"))",
    "(allow network-outbound (remote tcp \"localhost:5174\") (remote tcp \"localhost:3102\") (remote tcp \"localhost:5193\") (remote tcp \"localhost:3123\"))",
  ].join('\n') + '\n'
  writeFileSync(resolve(run, 'browser.sb'), profile)
  return profile
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const run = resolve(root, '.work/pilots', process.argv[2] || 'P01-A-001')
  const app = resolve(run, 'app')
  const config = JSON.parse(readFileSync(resolve(run, 'config.json'), 'utf8'))
  const env = { ...clientEnvironment(config), TMPDIR: resolve(app, '.tmp/browser') }
  const denied = [resolve(root, 'evaluation/P01/acceptance.spec.ts'), resolve(root, 'reference/P01/overlay/src/TaskEditor.tsx'), resolve(homedir(), '.codex/auth.json')]
  const code = "const fs=require('node:fs'); for(const p of " + JSON.stringify(denied) +
    ") { let denied=false;try{const f=fs.openSync(p,'r');fs.closeSync(f)}catch(e){denied=['EPERM','EACCES'].includes(e.code)}if(!denied)throw Error('Browser boundary failed: '+p) } console.log('Browser filesystem boundary passed')"
  const prefix = ['-f', resolve(run, 'browser.sb'), process.execPath]
  execFileSync('/usr/bin/sandbox-exec', [...prefix, '-e', code], { cwd: app, env, stdio: 'inherit' })
  const child = spawn('/usr/bin/sandbox-exec', [...prefix, 'task/browser-server.mjs'], { cwd: app, env, stdio: 'inherit' })
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => child.kill(signal))
  child.once('exit', (code) => { process.exitCode = code ?? 1 })
}
