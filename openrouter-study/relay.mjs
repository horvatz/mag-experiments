// Transparent Responses transport. No task/prompt repair or model substitution.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { credits, openrouter } from './credentials.mjs'
import { recordedSpend } from './costs.mjs'
import { prepaidHeadroom } from './prepaid-budget.mjs'
const study = dirname(fileURLToPath(import.meta.url))
export async function startRelay({ selected, destination, label, port = 9238 }) {
  const token = randomBytes(32).toString('hex'); mkdirSync(destination, { recursive: true })
  const ledger = resolve(destination, 'api-ledger.jsonl')
  let sequence = existsSync(ledger) ? readFileSync(ledger, 'utf8').split('\n').filter(Boolean).length : 0
  const append = value => appendFileSync(ledger, JSON.stringify(value) + '\n')
  const active = new Set()
  const budgetReservations = new Map()
  const server = createServer(async (request, response) => {
    const sendError = (status, message) => { if (!response.headersSent) response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: { message } })) }
    if (request.headers.authorization !== 'Bearer ' + token) return sendError(401, 'Invalid study relay session')
    if (request.method === 'GET' && request.url.startsWith('/v1/models')) { response.writeHead(200, { 'content-type': 'application/json' }); return response.end(JSON.stringify({ models: [] })) }
    if (request.method !== 'POST' || request.url !== '/v1/responses') return sendError(400, 'Unsupported study relay route')
    const number = ++sequence, startedAt = new Date().toISOString()
    const record = { number, label, model: selected.id, provider: selected.provider, startedAt, status: 'running' }
    const controller = new AbortController(); active.add(controller)
    let finalResponse, responseId, bytes = 0, aborted = false
    response.on('close', () => { if (!response.writableFinished) { aborted = true; controller.abort() } })
    try {
      let raw = ''; for await (const part of request) { raw += part; assert.ok(raw.length < 30_000_000, 'Request exceeds diagnostic limit') }
      const body = JSON.parse(raw); assert.equal(body.model, selected.id, 'Model substitution is forbidden')
      assert.ok((body.tools || []).every(t => ['function', 'custom'].includes(t.type)), 'Unsupported tool type; qualify the adapter before measurement')
      const requestedReasoning = body.reasoning
      // These providers do not advertise this OpenAI-only request flag. Their
      // native tool-calling behavior remains unchanged; preserve the request
      // value in researcher evidence and omit it uniformly for all models.
      record.requestedParallelToolCalls = body.parallel_tool_calls
      delete body.parallel_tool_calls
      // Open-weight chat backends accept one leading system message. Preserve
      // every high-priority CLI instruction verbatim, in order, in the leading
      // instructions field instead of emitting consecutive system messages.
      const developer = (body.input || []).filter(item => ['developer', 'system'].includes(item.role))
      if (developer.length) {
        assert.ok(developer.every(item => item.content.every(part => part.type === 'input_text')), 'Non-text developer context needs explicit qualification')
        body.instructions = [body.instructions || '', ...developer.map(item => item.content.map(part => part.text).join('\n\n'))].join('\n\n')
        body.input = body.input.filter(item => !['developer', 'system'].includes(item.role))
      }
      record.mergedDeveloperMessages = developer.length
      // The qualified providers' constrained final-JSON decoder suppresses
      // auto tool selection even when reasoning requests a tool. Transport
      // this same final schema as text; keep the CLI/workflow validation.
      if (body.text?.format?.type === 'json_schema') {
        record.requestedTextFormat = body.text.format
        body.instructions = (body.instructions || '') + '\n\nFinal response JSON Schema (CLI output-format constraint):\n' + JSON.stringify(body.text.format.schema)
        delete body.text.format
        if (!Object.keys(body.text).length) delete body.text
        record.schemaTransport = 'verbatim JSON Schema in leading instructions; workflow validates final JSON without repair'
      }
      body.reasoning = selected.effort ? { effort: selected.effort, summary: 'auto' } : { enabled: true, summary: 'auto' }
      body.provider = { only: [selected.provider], allow_fallbacks: false, require_parameters: true }
      body.openrouter_metadata = { enabled: true }
      writeFileSync(resolve(destination, `request-${String(number).padStart(5, '0')}.json`), JSON.stringify(body) + '\n', { flag: 'wx' })
      record.requestedReasoning = requestedReasoning; record.sentReasoning = body.reasoning
      const balance = await credits(); record.balanceBefore = balance
      assert.ok(balance.remainingUSD > 0, 'OpenRouter balance exhausted')
      const authorization = JSON.parse(readFileSync(resolve(study, 'budget.json')))
      const spend = recordedSpend()
      const endpoint = JSON.parse(readFileSync(resolve(study, 'qualification/' + selected.slug + '-endpoints.json'))).data.endpoints.find(e => e.tag === selected.provider)
      const maximumRequestCost = endpoint.context_length * Number(endpoint.pricing.prompt) + endpoint.max_completion_tokens * Number(endpoint.pricing.completion)
      record.budgetBefore = { ...spend, maximumRequestCost }
      const amendment = JSON.parse(readFileSync(resolve(study, 'budget-amendment-2.json')))
      record.budgetRule = prepaidHeadroom({ balance, authorization, amendment, maximumRequestCost, inFlightUSD: [...budgetReservations.values()].reduce((a, b) => a + b, 0) })
      budgetReservations.set(number, maximumRequestCost)
      record.sentUpstream = true
      const upstream = await openrouter('/responses', { method: 'POST', body: JSON.stringify(body), signal: controller.signal })
      record.httpStatus = upstream.status
      record.retryAfter = upstream.headers.get('retry-after')
      if (!upstream.ok) {
        record.providerError = (await upstream.clone().text()).slice(0, 5000).replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[REDACTED]')
      }
      response.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'text/event-stream', 'cache-control': 'no-cache' })
      let buffer = ''
      const decoder = new TextDecoder()
      for await (const part of upstream.body) {
        bytes += part.length; buffer += decoder.decode(part, { stream: true })
        let boundary
        while ((boundary = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 1)
          if (!line.startsWith('data: ')) continue
          let event; try { event = JSON.parse(line.slice(6)) } catch { continue }
          if (event.response?.id) responseId = event.response.id
          if (['response.completed', 'response.incomplete', 'response.failed'].includes(event.type)) finalResponse = event.response
        }
        response.write(part)
      }
      response.end(); record.status = upstream.ok ? 'finished' : 'http_error'
    } catch (error) {
      record.status = aborted ? 'client_aborted' : !record.sentUpstream ? 'rejected_before_upstream' : 'transport_error'
      // Error strings may include request metadata: save a controlled category.
      record.errorType = error.name
      if (!aborted) sendError(502, 'Study transport failed; researcher evidence preserved')
    } finally {
      record.finishedAt = new Date().toISOString(); record.bytes = bytes; record.responseId = responseId
      record.usage = finalResponse?.usage || null; record.openrouterMetadata = finalResponse?.openrouter_metadata || null
      record.responseStatus = finalResponse?.status || null; append(record); active.delete(controller); budgetReservations.delete(number)
    }
  })
  await new Promise((done, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', done) })
  return { env: { MAG_RELAY_TOKEN: token }, async close() { for (const controller of active) controller.abort(); await new Promise(done => server.close(done)) } }
}
