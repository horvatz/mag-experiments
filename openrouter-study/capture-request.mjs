// Researcher diagnostic: inspect the pinned CLI transport without a model call.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientEnvironment, configArguments } from '../scripts/pilot-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const cli = JSON.parse(readFileSync(resolve(study, '../luna-study/setup.json'))).cli.path
const scratch = resolve(study, '../.work/openrouter-transport'); mkdirSync(scratch, { recursive: true })
const requests = []
const server = createServer(async (request, response) => {
  let raw = ''; for await (const part of request) raw += part
  let body; try { body = JSON.parse(raw) } catch { body = raw }
  requests.push({ method: request.method, path: request.url, body })
  response.writeHead(400, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ error: { message: 'Intentional offline transport diagnostic', type: 'diagnostic' } }))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
let config = {
  model: 'qwen/qwen3.5-9b', model_provider: 'openrouter_study',
  'model_providers.openrouter_study': { name: 'OpenRouter study diagnostic', base_url: `http://127.0.0.1:${server.address().port}/v1`, wire_api: 'responses', request_max_retries: 0, stream_max_retries: 0 },
  model_reasoning_effort: 'xhigh', web_search: 'disabled',
  'features.apps': false, 'features.plugins': false, 'features.skip_host_skill_discovery': true,
  'shell_environment_policy.inherit': 'none',
}
const exported = process.argv[2]
if (exported) {
  config = JSON.parse(readFileSync(resolve(exported, 'config.json')))
  config['model_providers.openrouter_study'].base_url = `http://127.0.0.1:${server.address().port}/v1`
}
const app = exported ? resolve(exported, 'app') : scratch
const child = spawn(cli, ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check', '--json', '--color', 'never', '-C', app, ...configArguments(config), '-'], { cwd: app, env: { ...clientEnvironment(config), MAG_RELAY_TOKEN: 'offline-diagnostic' }, stdio: ['pipe', 'pipe', 'pipe'] })
let out = '', err = ''; child.stdout.on('data', p => out += p); child.stderr.on('data', p => err += p)
child.stdin.on('error', () => {}); child.stdin.end('Transport diagnostic only. Reply exactly CONNECTION_OK without tools.')
const timer = setTimeout(() => child.kill('SIGTERM'), 30000)
await new Promise(done => child.once('close', done)); clearTimeout(timer); server.close()
writeFileSync(resolve(study, exported ? 'qualification/cli-isolated-request.json' : 'qualification/cli-request.json'), JSON.stringify({ requests, out, err }, null, 2) + '\n')
console.log(JSON.stringify({ requests: requests.map(r => ({ method: r.method, path: r.path, keys: Object.keys(r.body), model: r.body.model, tools: r.body.tools?.map(t => ({ type: t.type, name: t.name, format: t.format })) })), errors: err.slice(-1500) }))
