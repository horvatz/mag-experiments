// Cross-file evidence audit only: no models, network requests or archive edits.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const json = file => JSON.parse(fs.readFileSync(resolve(study, file)))
const sha = file => createHash('sha256').update(fs.readFileSync(resolve(study, file))).digest('hex')
const amendment = json('budget-amendment-1.json'), frozen = json('frozen-inputs.json')
assert.equal(amendment.status, 'approved'); assert.equal(amendment.automaticTopUp, false)
assert.equal(amendment.effectiveAfterArchivedPosition, 123)
assert.equal(amendment.authorizedTotalCreditsUSD, 40)
const original = json(amendment.originalFreeze)
assert.equal(sha(amendment.originalFreeze), amendment.originalFreezeSHA256)
assert.equal(original.version, 'O/1.0'); assert.equal(frozen.version, 'O/1.0+budget-amendment-1')
const originalFolder = dirname(amendment.originalFreeze)
for (const name of ['relay.mjs', 'budget.json']) assert.equal(sha(originalFolder + '/' + name), original.sources[name])
for (const [name, digest] of Object.entries(original.sources)) if (name !== 'relay.mjs') assert.equal(frozen.sources[name], digest)
for (const name of ['relay.mjs', 'prepaid-budget.mjs', 'budget-amendment-1.json']) assert.equal(sha(name), frozen.sources[name])
assert.equal(sha('budget.json'), original.sources['budget.json'])
const models = json('models.json').models
const schedule = json(models[0].slug + '/runtime/main-study/schedule.json').runs
const jobs = schedule.flatMap((row, i) => models.map((_, j) => ({ ...row, selected: models[(i + j) % models.length] })))
let originalRuns = 0, amendedRuns = 0, originalRequests = 0, amendedSentRequests = 0, amendedLocalRejections = 0
for (const [i, job] of jobs.entries()) {
  const prefix = job.selected.slug + '/'
  if (!fs.existsSync(resolve(study, prefix, 'runtime/runs', job.id, 'archive-complete.json'))) continue
  const ledger = resolve(study, prefix, 'api', job.id, 'model/api-ledger.jsonl')
  const rows = fs.readFileSync(ledger, 'utf8').split('\n').filter(Boolean).map(JSON.parse)
  if (i < 123) {
    originalRuns++
    for (const row of rows) { assert.equal(row.budgetRule, undefined); originalRequests++ }
    continue
  }
  amendedRuns++
  const endpoint = json('qualification/' + job.selected.slug + '-endpoints.json').data.endpoints.find(x => x.tag === job.selected.provider)
  const maximum = endpoint.context_length * Number(endpoint.pricing.prompt) + endpoint.max_completion_tokens * Number(endpoint.pricing.completion)
  for (const row of rows) {
    if (!row.sentUpstream) { assert.equal(row.status, 'rejected_before_upstream'); amendedLocalRejections++; continue }
    const rule = row.budgetRule, balance = row.balanceBefore
    assert.equal(rule.amendment, amendment.id)
    assert.equal(rule.authorizedCreditCeilingUSD, 40)
    assert.equal(rule.maximumRequestCost, maximum)
    assert.ok(rule.availableUSD >= maximum && rule.inFlightUSD >= 0)
    assert.ok(Math.abs(rule.availableUSD - (Math.min(balance.remainingUSD, 40 - balance.totalUsageUSD) - rule.inFlightUSD)) < 1e-7)
    assert.ok(Date.parse(balance.at) >= Date.parse(row.startedAt) && Date.parse(balance.at) <= Date.parse(row.finishedAt))
    assert.ok(Math.abs(balance.remainingUSD - (balance.totalCreditsUSD - balance.totalUsageUSD)) < 1e-7)
    assert.ok(balance.totalUsageUSD <= 40)
    assert.equal(row.budgetBefore.maximumRequestCost, maximum)
    amendedSentRequests++
  }
}
assert.equal(originalRuns, 123)
const result = { at: new Date().toISOString(), researcherOnly: true, passed: true, amendment: amendment.id,
  originalBudgetAndOperatorPreserved: true, originalRuns, amendedRuns, originalRequests, amendedSentRequests, amendedLocalRejections,
  scope: 'Archived measured runs only. Qualification ledgers retain their own budget-rule evidence; incomplete running measurements are excluded.',
  unknownCostAccountingChanged: false, measuredRequestsReplayed: false }
fs.writeFileSync(resolve(study, 'analysis/budget-amendment-audit.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
