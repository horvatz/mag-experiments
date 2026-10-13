// Keep the authorized secret in researcher memory; never print item values.
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url))
let cached
export async function credential() {
  if (cached) return cached
  const temporaryKey = resolve(study, '../.work/secrets/openrouter.key')
  if (existsSync(temporaryKey)) {
    const value = readFileSync(temporaryKey, 'utf8').trim()
    if (!/^sk-or-v1-[A-Za-z0-9_-]{32,}$/.test(value)) throw Error('Invalid temporary OpenRouter credential format')
    cached = value; return cached
  }
  const op = resolve(study, '../.work/tools/1password-cli/op')
  const child = spawn(op, ['item', 'get', 'Openrouter key', '--format', 'json'], { stdio: ['ignore', 'pipe', 'pipe'] })
  let out = '', err = ''; child.stdout.on('data', part => out += part); child.stderr.on('data', part => err += part)
  const timer = setTimeout(() => child.kill('SIGTERM'), 60000)
  const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) }); clearTimeout(timer)
  if (code !== 0) throw Error(/No accounts configured/.test(err) ? 'Enable Settings → Developer → Integrate with 1Password CLI, then unlock 1Password.' : '1Password credential retrieval failed. No secret was printed; inspect desktop authorization.')
  const item = JSON.parse(out)
  const keys = [...new Set((item.fields || []).flatMap(field => (field.value || '').match(/sk-or-v1-[A-Za-z0-9_-]{32,}/g) || []))]
  if (keys.length !== 1) throw Error('The authorized 1Password item must contain exactly one OpenRouter API key.')
  cached = keys[0]; return cached
}
export async function openrouter(path, options = {}) {
  return fetch('https://openrouter.ai/api/v1' + path, { ...options, headers: { authorization: 'Bearer ' + await credential(), 'content-type': 'application/json', ...options.headers } })
}
export async function credits() {
  const response = await openrouter('/credits'); if (!response.ok) throw Error('Credit check failed: HTTP ' + response.status)
  const data = (await response.json()).data
  return { at: new Date().toISOString(), totalCreditsUSD: data.total_credits, totalUsageUSD: data.total_usage, remainingUSD: data.total_credits - data.total_usage }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await credential()
  const balance = await credits()
  const plan = JSON.parse(readFileSync(resolve(study, 'models.json')))
  const result = { credentialAvailable: true, item: plan.credentialItem, balance, measuredRunsStarted: 0 }
  writeFileSync(resolve(study, 'qualification/credential-check.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result))
}
