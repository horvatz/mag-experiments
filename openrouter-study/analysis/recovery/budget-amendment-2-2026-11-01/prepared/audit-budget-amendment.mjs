// Read-only financial evidence audit. Never sends requests or edits archives.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const argument = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1] }
const study = resolve(argument('--study') || resolve(dirname(fileURLToPath(import.meta.url)), '../..'))
const json = file => JSON.parse(fs.readFileSync(resolve(study, file)))
const sha = file => createHash('sha256').update(fs.readFileSync(resolve(study, file))).digest('hex')
const base = json('budget-amendment-1.json'), frozen = json('frozen-inputs.json')
assert.equal(base.status, 'approved'); assert.equal(base.automaticTopUp, false)
assert.equal(base.effectiveAfterArchivedPosition, 123); assert.equal(base.authorizedTotalCreditsUSD, 40)
const extension = frozen.version === 'O/1.0+budget-amendment-2' ? json('budget-amendment-2.json') : null
const previous = extension ? json(extension.previousFreeze) : frozen
assert.equal(previous.version, 'O/1.0+budget-amendment-1')
if (extension) {
  assert.equal(extension.id, 'O/1.0-budget-amendment-2'); assert.equal(extension.status, 'approved')
  assert.equal(extension.baseAmendment, base.id); assert.equal(extension.manualFundingOnly, true)
  assert.equal(extension.automaticTopUp, false); assert.equal(extension.maximumAdditionalAuthorizedFundingUSD, 10)
  assert.equal(extension.authorizedTotalCreditsUSD, 50)
  assert.equal(extension.effectiveAfterArchivedPosition, 189); assert.equal(extension.firstAffectedMeasuredPosition, 190)
  assert.equal(extension.firstAffectedMeasuredRun, 'glm/P09-B-002')
  assert.equal(extension.fundingObserved, true)
  assert.ok(extension.fundingObservation.balance.totalCreditsUSD >= 50)
  assert.equal(sha(extension.previousFreeze), extension.previousFreezeSHA256)
  assert.equal(sha(extension.approvalEvidence), extension.approvalEvidenceSHA256)
  assert.equal(json(extension.approvalEvidence).userApproval, extension.userApproval)
  for (const [file, hash] of Object.entries(previous.sources)) {
    if (['relay.mjs', 'prepaid-budget.mjs'].includes(file)) {
      assert.equal(sha(resolve(study, dirname(extension.previousFreeze), file)), hash)
    } else assert.equal(frozen.sources[file], hash, 'Protected version1 source changed: ' + file)
  }
  assert.deepEqual(Object.keys(frozen.sources).sort(), [...Object.keys(previous.sources), 'budget-amendment-2.json'].sort())
  assert.equal(frozen.amendment, 'budget-amendment-2.json')
  assert.equal(sha('budget-amendment-2.json'), frozen.sources['budget-amendment-2.json'])
}
const original = json(base.originalFreeze)
assert.equal(sha(base.originalFreeze), base.originalFreezeSHA256); assert.equal(original.version, 'O/1.0')
const folder = dirname(base.originalFreeze)
for (const name of ['relay.mjs', 'budget.json']) assert.equal(sha(resolve(study, folder, name)), original.sources[name])
for (const [name, digest] of Object.entries(original.sources)) if (name !== 'relay.mjs') assert.equal(previous.sources[name], digest)
for (const name of ['relay.mjs', 'prepaid-budget.mjs', 'budget-amendment-1.json']) assert.equal(sha(name), frozen.sources[name])
assert.equal(sha('budget.json'), original.sources['budget.json'])
const models = json('models.json').models
const schedule = json(models[0].slug + '/runtime/main-study/schedule.json').runs
const jobs = schedule.flatMap((row, i) => models.map((_, j) => ({ ...row, selected: models[(i + j) % models.length] })))
let originalRuns = 0, amendedRuns = 0, originalRequests = 0, amendedSentRequests = 0, amendedLocalRejections = 0
const versions = { [base.id]: { runs: 0, sentRequests: 0, localRejections: 0 } }
if (extension) versions[extension.id] = { runs: 0, sentRequests: 0, localRejections: 0 }
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
  const authorization = extension && i >= extension.effectiveAfterArchivedPosition ? extension : base
  const ceiling = authorization.authorizedTotalCreditsUSD
  amendedRuns++; versions[authorization.id].runs++
  const endpoint = json('qualification/' + job.selected.slug + '-endpoints.json').data.endpoints.find(x => x.tag === job.selected.provider)
  const maximum = endpoint.context_length * Number(endpoint.pricing.prompt) + endpoint.max_completion_tokens * Number(endpoint.pricing.completion)
  for (const row of rows) {
    if (!row.sentUpstream) {
      assert.equal(row.status, 'rejected_before_upstream')
      amendedLocalRejections++; versions[authorization.id].localRejections++; continue
    }
    const rule = row.budgetRule, balance = row.balanceBefore
    assert.equal(rule.amendment, authorization.id)
    assert.equal(rule.authorizedCreditCeilingUSD, ceiling); assert.equal(rule.maximumRequestCost, maximum)
    assert.ok(rule.availableUSD >= maximum && rule.inFlightUSD >= 0)
    assert.ok(Math.abs(rule.availableUSD - (Math.min(balance.remainingUSD, ceiling - balance.totalUsageUSD) - rule.inFlightUSD)) < 1e-7)
    assert.ok(Date.parse(balance.at) >= Date.parse(row.startedAt) && Date.parse(balance.at) <= Date.parse(row.finishedAt))
    assert.ok(Math.abs(balance.remainingUSD - (balance.totalCreditsUSD - balance.totalUsageUSD)) < 1e-7)
    assert.ok(balance.totalUsageUSD <= ceiling)
    if (authorization === extension) assert.ok(balance.totalCreditsUSD >= 50)
    assert.equal(row.budgetBefore.maximumRequestCost, maximum)
    amendedSentRequests++; versions[authorization.id].sentRequests++
  }
}
assert.equal(originalRuns, 123)
const result = { at: new Date().toISOString(), researcherOnly: true, passed: true,
  amendment: extension?.id || base.id, activeProtocol: frozen.version,
  originalBudgetAndOperatorPreserved: true, originalRuns, amendedRuns, originalRequests,
  amendedSentRequests, amendedLocalRejections, versions,
  scope: 'Archived measured runs only; qualification ledgers retain their own budget evidence. Version1 rows remain capped40USD; version2 starts190 and is capped50USD.',
  unknownCostAccountingChanged: false, measuredRequestsReplayed: false }
const output = resolve(argument('--output') || resolve(study, 'analysis/budget-amendment-audit.json'))
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
