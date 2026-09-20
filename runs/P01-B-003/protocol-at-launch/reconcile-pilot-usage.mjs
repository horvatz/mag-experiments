import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Researcher-side only, after the model has stopped. Read usage events from
// the three exact session IDs, never credentials or unrelated conversations.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2]
assert.match(id, /^P01-B-\d{3}$/)
const run = resolve(root, '.work/pilots', id)
const execution = JSON.parse(readFileSync(resolve(run, 'execution.json'), 'utf8'))
assert.notEqual(execution.status, 'running')
assert.ok(!existsSync(resolve(run, 'usage-observation.json')), 'Do not overwrite usage evidence')
const fields = ['input_tokens', 'cached_input_tokens', 'cache_write_input_tokens', 'output_tokens', 'reasoning_output_tokens']
const rows = []
for (const [role, session] of Object.entries(execution.sessions)) {
  assert.match(session, /^[a-f0-9-]{36}$/)
  const files = execFileSync('rg', ['--files', '--hidden', resolve(homedir(), '.codex/sessions'), '-g', '*' + session + '*'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
  assert.equal(files.length, 1, 'Expected exactly one rollout for ' + session)
  const events = readFileSync(files[0], 'utf8').trim().split('\n').flatMap((line) => {
    try { const event = JSON.parse(line); return event.type === 'event_msg' && event.payload?.type === 'token_count' && event.payload.info?.total_token_usage ? [event] : [] }
    catch { return [] }
  })
  const phases = execution.phases.filter((phase) => phase.role === role)
  const last = events.filter((event) => Date.parse(event.timestamp) <= Date.parse(execution.finishedAt)).at(-1)
  const totals = last ? Object.fromEntries(fields.map((field) => [field, last.payload.info.total_token_usage[field]])) : null
  const comparisons = phases.map((phase) => {
    const beforeEnd = events.filter((event) => Date.parse(event.timestamp) <= Date.parse(phase.finishedAt)).at(-1)
    const cumulativeMatchesCLI = Boolean(phase.usage && beforeEnd && fields.every((field) => beforeEnd.payload.info.total_token_usage[field] === phase.usage[field]))
    return { name: phase.name, status: phase.status, cliUsage: phase.usage, lastTokenEventAt: beforeEnd?.timestamp ?? null, cumulativeMatchesCLI }
  })
  rows.push({ role, session, lastTokenEventAt: last?.timestamp ?? null, observedCumulativeUsage: totals, phases: comparisons,
    complete: phases.every((phase) => phase.status === 'completed') && comparisons.every((item) => item.cumulativeMatchesCLI) })
}
const complete = rows.length > 0 && rows.every((row) => row.complete)
const observed = rows.every((row) => row.observedCumulativeUsage) ? Object.fromEntries(fields.map((field) => [field, rows.reduce((sum, row) => sum + row.observedCumulativeUsage[field], 0)])) : null
const observation = { id, observedAt: new Date().toISOString(), complete, roles: rows,
  usage: complete ? observed : null, observedUsageBeforeInterruption: complete ? null : observed,
  method: 'For each exact role session, compare CLI turn.completed with the last cumulative token_count before that phase ended. Sum the final cumulative total once per distinct session, never once per resumed phase.',
  note: complete ? 'Cached input is included in input; reasoning output is included in output.' : 'Incomplete events are a partial observation, not zero or a complete token total. No monetary cost is inferred.' }
writeFileSync(resolve(run, 'usage-observation.json'), JSON.stringify(observation, null, 2) + '\n')
console.log(JSON.stringify({ id, complete, usage: observation.usage, observedUsageBeforeInterruption: observation.observedUsageBeforeInterruption }))
