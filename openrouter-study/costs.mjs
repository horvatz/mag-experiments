import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openrouter } from './credentials.mjs'
const study = dirname(fileURLToPath(import.meta.url))
function ledgers(folder) {
  if (!existsSync(folder)) return []
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? ledgers(resolve(folder, entry.name)) : entry.name === 'api-ledger.jsonl' ? [resolve(folder, entry.name)] : [])
}
export function recordedSpend() {
  const files = ['glm', 'deepseek', 'qwen'].flatMap(slug => ['qualification', 'api'].flatMap(name => ledgers(resolve(study, slug, name))))
  let knownUSD = 0, unknownRequests = 0, unknownReservedUSD = 0
  for (const file of files) {
    const resolved = existsSync(resolve(dirname(file), 'api-cost.json')) ? JSON.parse(readFileSync(resolve(dirname(file), 'api-cost.json'))).requests : []
    for (const row of readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse)) {
      const cost = Number.isFinite(row.usage?.cost) ? row.usage.cost : resolved.find(r => r.number === row.number)?.costUSD
      if (Number.isFinite(cost)) knownUSD += cost
      else if (row.status === 'rejected_before_upstream' || !row.responseId && [400, 401, 403, 404].includes(row.httpStatus)) continue
      else {
        unknownRequests++
        const plan = JSON.parse(readFileSync(resolve(study, 'models.json')))
        const selected = plan.models.find(m => m.id === row.model)
        const endpoints = JSON.parse(readFileSync(resolve(study, 'qualification/' + selected.slug + '-endpoints.json'))).data.endpoints
        const endpoint = endpoints.find(e => e.tag === row.provider)
        unknownReservedUSD += endpoint.context_length * Number(endpoint.pricing.prompt) + endpoint.max_completion_tokens * Number(endpoint.pricing.completion)
      }
    }
  }
  return { knownUSD, unknownRequests, unknownReservedUSD }
}
export async function reconcileCosts(destination) {
  const file = resolve(destination, 'api-ledger.jsonl'), requests = []
  const rows = existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : []
  for (const row of rows) {
    let costUSD = Number.isFinite(row.usage?.cost) ? row.usage.cost : null, generation = null, billingLookupStatus = null
    if (row.responseId) {
      const response = await openrouter('/generation?id=' + encodeURIComponent(row.responseId))
      billingLookupStatus = response.status
      if (response.ok) {
        const data = (await response.json()).data
        generation = { id: data.id, model: data.model, provider: data.provider_name, totalCostUSD: data.total_cost,
          promptTokens: data.native_tokens_prompt, completionTokens: data.native_tokens_completion, finishReason: data.finish_reason }
        if (Number.isFinite(data.total_cost)) costUSD = data.total_cost
      }
    } else if (row.status === 'rejected_before_upstream' || [400, 401, 403, 404].includes(row.httpStatus)) costUSD = 0
    requests.push({ number: row.number, responseId: row.responseId || null, costUSD, generation, billingLookupStatus, usage: row.usage, transportStatus: row.status })
  }
  const result = { at: new Date().toISOString(), complete: requests.every(r => Number.isFinite(r.costUSD)),
    costUSD: requests.every(r => Number.isFinite(r.costUSD)) ? requests.reduce((sum, r) => sum + r.costUSD, 0) : null,
    knownCostUSD: requests.reduce((sum, r) => sum + (r.costUSD || 0), 0), requests,
    method: 'OpenRouter generation total_cost, falling back to the returned response usage.cost. Unknown cost remains null. Credit snapshots are account-level observations, not a per-run invoice.' }
  writeFileSync(resolve(destination, 'api-cost.json'), JSON.stringify(result, null, 2) + '\n')
  return result
}
export async function reconcileMissingCosts() {
  for (const slug of ['glm', 'deepseek', 'qwen']) for (const name of ['qualification', 'api']) {
    for (const file of ledgers(resolve(study, slug, name))) {
      const cost = resolve(dirname(file), 'api-cost.json')
      if (existsSync(cost) && !JSON.parse(readFileSync(cost)).complete) await reconcileCosts(dirname(file))
    }
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const slug of ['glm', 'deepseek', 'qwen']) for (const file of ledgers(resolve(study, slug, 'qualification'))) await reconcileCosts(dirname(file))
  console.log(JSON.stringify(recordedSpend()))
}
