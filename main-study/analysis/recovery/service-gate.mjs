// Operator-side availability check; never part of a measured run or its inputs.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { clientEnvironment } from '../../../scripts/pilot-utils.mjs'

export function serviceFailure(text) {
  return text.split('\n').some(line => {
    let event; try { event = JSON.parse(line) } catch { return false }
    return ['error', 'turn.failed'].includes(event.type) && /401|403|unauthorized|authentication|incorrect api key|usage.?limit|rate.?limit|quota.{0,30}(exceed|exhaust)|insufficient.{0,20}(credit|quota)|try again at/i.test(JSON.stringify(event))
  })
}

export async function probeService(config, cli, destination) {
  const scratch = '/private/tmp/mag-auth-probe'
  mkdirSync(scratch, { recursive: true })
  const env = { ...clientEnvironment(config), TMPDIR: scratch }
  const args = ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check', '--json', '--color', 'never', '-C', scratch, '-s', 'read-only',
    '-c', `model=${JSON.stringify(config.model)}`, '-c', `model_reasoning_effort=${JSON.stringify(config.model_reasoning_effort)}`,
    '-c', 'features.apps=false', '-c', 'features.plugins=false', '-c', 'features.skip_host_skill_discovery=true', '-c', 'web_search="disabled"', '-']
  const startedAt = new Date().toISOString()
  const child = spawn(cli, args, { env, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = '', timedOut = false, spawnError = false
  child.stdout.on('data', x => out += x); child.stderr.on('data', x => err += x)
  child.stdin.on('error', () => {})
  child.stdin.end('Connectivity diagnostic only. Do not use tools, read files, or perform any task. Reply exactly CONNECTION_OK.')
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM') }, 60000)
  const killer = setTimeout(() => child.kill('SIGKILL'), 65000)
  const code = await new Promise(done => { child.once('error', () => { spawnError = true; done(null) }); child.once('close', done) })
  clearTimeout(timer); clearTimeout(killer)
  const events = out.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)] } catch { return [] } })
  const completed = events.some(e => e.type === 'turn.completed')
  const expectedReply = events.some(e => e.item?.type === 'agent_message' && e.item.text?.trim() === 'CONNECTION_OK')
  const failed = events.some(e => ['error', 'turn.failed'].includes(e.type))
  const usedTools = events.some(e => e.item && !['agent_message', 'reasoning', 'error'].includes(e.item.type))
  const result = { startedAt, finishedAt: new Date().toISOString(), cli, model: config.model, reasoningEffort: config.model_reasoning_effort,
    code, completed, expectedReply, failed, usedTools, timedOut, spawnError, unauthorized: /401|unauthorized|incorrect api key/i.test(out + err),
    passed: code === 0 && completed && expectedReply && !failed && !usedTools && !timedOut && !spawnError,
    excludedFromMeasurements: true, authentication: 'Existing ChatGPT login; same clientEnvironment allowlist; no credential overrides.' }
  writeFileSync(destination, JSON.stringify(result, null, 2) + '\n')
  return result
}
