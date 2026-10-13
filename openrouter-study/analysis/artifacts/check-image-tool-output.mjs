// Researcher-only synthetic transport diagnostic; never a measured task retry.
import fs from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startRelay } from '../../relay.mjs'
import { reconcileCosts } from '../../costs.mjs'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const selected = JSON.parse(fs.readFileSync(resolve(study, 'models.json'))).models.find(m => m.slug === process.argv[2])
if (!selected) throw Error('Specify approved model slug')
const destination = resolve(study, selected.slug, 'qualification', 'image-tool-' + new Date().toISOString().replace(/[:.]/g, '-'))
fs.mkdirSync(destination, { recursive: true })
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4o0AAAAASUVORK5CYII='
const relay = await startRelay({ selected, destination, label: selected.slug + '/unmeasured-image-tool-diagnostic', port: 9239 })
const results = []
try {
  for (const mode of ['text-tool-control', 'image-tool', 'image-user-control']) {
    const prompt = { role: 'user', content: [{ type: 'input_text', text: 'Synthetic transport diagnostic only. No actual tools or filesystem access. Reply exactly CONNECTION_OK after the provided result. Do not describe the image.' }] }
    const tool = { type: 'function', name: 'diagnostic_image', description: 'Synthetic already completed diagnostic.', parameters: { type: 'object', properties: {}, additionalProperties: false } }
    const input = mode === 'image-user-control' ? [{ ...prompt, content: [...prompt.content, { type: 'input_image', image_url: image, detail: 'high' }] }] : [prompt, { type: 'function_call', name: tool.name, call_id: 'call_diagnostic', arguments: '{}' }, { type: 'function_call_output', call_id: 'call_diagnostic', output: mode === 'image-tool' ? [{ type: 'input_image', image_url: image, detail: 'high' }] : 'Synthetic text result.' }]
    const body = { model: selected.id, input, tools: [tool], tool_choice: 'none', stream: true, max_output_tokens: 256 }
    let result = { mode, excludedFromMeasurements: true }
    try {
      const response = await fetch('http://127.0.0.1:9239/v1/responses', { method: 'POST', headers: { authorization: 'Bearer ' + relay.env.MAG_RELAY_TOKEN, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
      const stream = await response.text()
      fs.writeFileSync(resolve(destination, mode + '.txt'), stream.replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[REDACTED]'))
      const events = stream.split('\n').flatMap(line => { try { return line.startsWith('data: ') ? [JSON.parse(line.slice(6))] : [] } catch { return [] } })
      const final = events.findLast(e => e.response?.status)?.response
      const output = (final?.output || []).filter(o => o.type === 'message').flatMap(o => (o.content || []).filter(c => c.type === 'output_text').map(c => c.text || '')).join('').trim()
      result = { ...result, httpStatus: response.status, responseStatus: final?.status || null, output, passed: response.ok && final?.status === 'completed' && output === 'CONNECTION_OK' }
    } catch (error) { result.errorType = error.name; result.passed = false }
    results.push(result)
    console.log(JSON.stringify(result))
  }
} finally {
  await relay.close()
  const cost = await reconcileCosts(destination)
  fs.writeFileSync(resolve(destination, 'result.json'), JSON.stringify({ at: new Date().toISOString(), model: selected.id, provider: selected.provider, results, costComplete: cost.complete, costUSD: cost.costUSD, excludedFromMeasurements: true }, null, 2) + '\n')
  console.log(JSON.stringify({ evidence: destination, costComplete: cost.complete, costUSD: cost.costUSD }))
}
