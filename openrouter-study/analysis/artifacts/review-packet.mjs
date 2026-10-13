// Researcher-only source index. Never launches models, edits archives or grades.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'

const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const [slug, id] = process.argv.slice(2)
assert.ok(['glm', 'deepseek', 'qwen'].includes(slug))
assert.match(id || '', /^P(?:0[3-9]|10)-[ABC]-001$/)
const collection = resolve(study, slug), archive = resolve(collection, 'runtime/runs', id)
const json = file => JSON.parse(fs.readFileSync(file))
const manifest = json(resolve(archive, 'archive-complete.json'))
assert.equal(manifest.id, id)
const execution = json(resolve(archive, 'execution.json'))
assert.notEqual(execution.status, 'running')
const evaluation = json(resolve(archive, 'evaluation-summary.json'))
const phaseResults = Object.keys(manifest.files).filter(f => /^phases\/[^/]+\/result\.json$/.test(f)).map(file => {
  const r = json(resolve(archive, file))
  return { source: 'runtime/runs/' + id + '/' + file, name: r.name, status: r.status,
    elapsedSeconds: r.elapsedSeconds, handoffError: r.handoffError, signal: r.signal }
})
const nativeCommands = []
for (const file of Object.keys(manifest.files).filter(f => /(?:^|\/)events\.jsonl\.gz$/.test(f))) {
  const events = gunzipSync(fs.readFileSync(resolve(archive, file))).toString().trim().split('\n').filter(Boolean).map(JSON.parse)
  for (const event of events) {
    if (event.type !== 'item.completed' || event.item?.type !== 'command_execution') continue
    const item = event.item
    nativeCommands.push({ source: 'runtime/runs/' + id + '/' + file, itemId: item.id,
      command: item.command, status: item.status, exitCode: item.exit_code,
      output: item.aggregated_output })
  }
}
const api = resolve(collection, 'api', id, 'model'), calls = new Map()
for (const file of fs.readdirSync(api).filter(f => /^request-\d+\.json\.gz$/.test(f)).sort()) {
  const input = JSON.parse(gunzipSync(fs.readFileSync(resolve(api, file)))).input || []
  const replies = new Map(input.filter(i => i.type === 'function_call_output').map(i => [i.call_id, i.output]))
  for (const item of input.filter(i => i.type === 'function_call')) {
    if (calls.has(item.call_id) || !replies.has(item.call_id)) continue
    calls.set(item.call_id, { source: 'api/' + id + '/model/' + file, callId: item.call_id,
      name: item.name, arguments: item.arguments, output: replies.get(item.call_id) })
  }
}
const changes = new Map()
for (const c of [...(execution.fileChanges || []), ...(execution.phases || []).flatMap(p => p.fileChanges || [])]) changes.set(c.path, c)
const authoredFiles = [...changes.values()].map(change => {
  const relative = 'submission/' + change.path
  const entry = manifest.files[relative]
  if (!entry || entry.kind !== 'file') return { ...change, missingFromFinalSubmission: true }
  const contents = fs.readFileSync(resolve(archive, relative))
  assert.equal(createHash('sha256').update(contents).digest('hex'), entry.sha256)
  return { ...change, source: 'runtime/runs/' + id + '/' + relative,
    bytes: contents.length, lines: contents.toString().split('\n').length, sha256: entry.sha256 }
})
const result = {
  at: new Date().toISOString(), slug, id, researcherOnly: true,
  limitations: [
    'This is a source index, not a qualitative grade or a substitute for reading authored files.',
    'Later API inputs can preserve failed tool calls omitted from native events. A final call without a subsequent input may be absent.',
    'Attempted writes do not constitute delivered documents. The final immutable submission is authoritative.',
    'Do not feed researcher evaluations or this packet to measured model sessions.',
  ],
  execution: { status: execution.status, elapsedSeconds: execution.elapsedSeconds, phases: execution.phases?.map(p => ({ name: p.name, status: p.status, elapsedSeconds: p.elapsedSeconds })), fileChanges: execution.fileChanges },
  evaluation: { executionStatus: evaluation.executionStatus, groups: evaluation.groups, checks: evaluation.checks },
  phaseResults, authoredFiles, nativeCommands, preservedToolCalls: [...calls.values()],
}
const text = JSON.stringify(result, null, 2) + '\n'
assert.ok(!/sk-or-v1-[a-zA-Z0-9]{20,}/.test(text), 'Credential-like text must never be copied into a packet')
const destination = resolve(collection, 'analysis/review-packets')
fs.mkdirSync(destination, { recursive: true })
fs.writeFileSync(resolve(destination, id + '.json'), text)
console.log(JSON.stringify({ slug, id, authoredFiles: authoredFiles.length, nativeCommands: nativeCommands.length, preservedToolCalls: calls.size }))
