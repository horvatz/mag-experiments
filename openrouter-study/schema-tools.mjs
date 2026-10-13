// Diagnostic of provider tool calls with constrained final JSON, no study task.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startRelay } from './relay.mjs'
import { reconcileCosts } from './costs.mjs'
const study = dirname(fileURLToPath(import.meta.url))
const models = JSON.parse(readFileSync(resolve(study, 'models.json'))).models
const number = process.argv[2] || '013', toolChoice = process.argv[3] || 'required'
for (const selected of models) {
  const destination = resolve(study, selected.slug, 'qualification/schema-tools-' + number)
  mkdirSync(destination)
  const relay = await startRelay({ selected, destination, label: selected.slug + '/schema-tools-' + number, port: 9239 })
  const results = []
  try {
    for (const constrained of [false, true]) {
      const body = { model: selected.id, stream: true,
        instructions: 'Technical diagnostic only. Call read_value to retrieve the hidden value. Never guess it. Then answer with JSON containing value.',
        input: [{ role: 'user', content: [{ type: 'input_text', text: 'Retrieve the hidden value with the tool.' }] }],
        tools: [{ type: 'function', name: 'read_value', description: 'Retrieve the hidden value.', parameters: { type: 'object', properties: {}, required: [], additionalProperties: false } }],
        tool_choice: toolChoice,
        ...(constrained ? { text: { format: { type: 'json_schema', name: 'diagnostic', strict: true, schema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'], additionalProperties: false } } } } : {}) }
      const response = await fetch('http://127.0.0.1:9239/v1/responses', { method: 'POST', headers: { authorization: 'Bearer ' + relay.env.MAG_RELAY_TOKEN, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
      const raw = await response.text()
      writeFileSync(resolve(destination, (constrained ? 'constrained' : 'plain') + '-response.txt'), raw)
      const events = raw.split('\n').filter(line => line.startsWith('data: ')).flatMap(line => { try { return [JSON.parse(line.slice(6))] } catch { return [] } })
      const final = events.findLast(e => ['response.completed', 'response.failed'].includes(e.type))?.response
      results.push({ constrained, httpStatus: response.status, status: final?.status, output: final?.output, toolCalled: final?.output?.some(item => item.type === 'function_call') || false })
    }
  } finally { await relay.close(); await reconcileCosts(destination); writeFileSync(resolve(destination, 'result.json'), JSON.stringify({ excludedFromMeasurements: true, toolChoice, results }, null, 2) + '\n') }
  console.log(JSON.stringify({ slug: selected.slug, results }))
}
