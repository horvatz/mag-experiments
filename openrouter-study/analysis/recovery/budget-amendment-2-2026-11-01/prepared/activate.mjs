// Budget-only activation after real user approval and actual manual credit.
// No model calls, payment calls, measurements, Git commits, or pushes.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { credits } from '../../../../credentials.mjs'
import { verify } from '../../../../verify.mjs'
const prepared = dirname(fileURLToPath(import.meta.url))
const recovery = resolve(prepared, '..'), study = resolve(prepared, '../../../..')
const json = path => JSON.parse(fs.readFileSync(path))
const sha = path => createHash('sha256').update(fs.readFileSync(path)).digest('hex')
const approval = json(resolve(study, 'analysis/recovery/user-approved-budget-extension-2026-11-01.json'))
assert.equal(approval.authorizedTotalUsageUSD, 50)
assert.equal(approval.maximumAdditionalAuthorizedFundingUSD, 10)
assert.equal(approval.budgetApprovalConfirmed, true)
assert.equal(approval.automaticTopUp, false)
const balance = await credits()
if (balance.totalCreditsUSD < 50 || balance.remainingUSD < 3.29357586) {
  console.log(JSON.stringify({ status: 'waiting-for-actual-manual-credit', approvalConfirmed: true, activeFilesChanged: false, modelCallsSent: 0, balance }))
  process.exit(2)
}
assert.ok(!fs.existsSync(resolve(study, 'runner.lock')), 'No active queue at version boundary')
assert.ok(!fs.existsSync(resolve(study, 'analysis/recovery/known-service-resumer.lock')))
assert.equal(json(resolve(study, 'status.json')).archived, 189)
for (const file of ['glm/runtime/.work/pilots/P09-B-002/execution.json', 'glm/api/P09-B-002/model/api-ledger.jsonl', 'glm/runtime/runs/P09-B-002/archive-complete.json']) assert.ok(!fs.existsSync(resolve(study, file)), '190 must remain unmeasured')
const preparation = json(resolve(recovery, 'preparation.json'))
for (const [name, hash] of Object.entries(preparation.originalSourceSHA256)) assert.equal(sha(resolve(study, name)), hash, 'Pre-activation source changed: ' + name)
const verification = json(resolve(recovery, 'prepared-verification.json'))
assert.ok(verification.passed)
for (const [name, hash] of Object.entries(verification.preparedSHA256)) assert.equal(sha(resolve(prepared, name)), hash, 'Prepared source changed since checks: ' + name)
if (process.argv.includes('--check-only')) {
  console.log(JSON.stringify({ status: 'ready-for-budget-only-activation', balance, modelCallsSent: 0, activeFilesChanged: false }))
  process.exit(0)
}
verify()
const lock = resolve(recovery, 'activation.lock')
const statePath = resolve(recovery, 'activation.json')
assert.ok(!fs.existsSync(statePath), 'Do not repeat an existing activation')
fs.writeFileSync(lock, String(process.pid), { flag: 'wx' })
const state = { at: new Date().toISOString(), status: 'activating-before-any-model-call', approvalEvidence: 'analysis/recovery/user-approved-budget-extension-2026-11-01.json', balance, modelCallsSent: 0, measuredRequestsReplayed: false }
const save = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n')
const atomic = (file, bytes) => { fs.writeFileSync(file + '.budget2-tmp', bytes); fs.renameSync(file + '.budget2-tmp', file) }
function check(args) {
  const result = spawnSync('node', args, { cwd: resolve(study, '..'), stdio: 'inherit' })
  assert.equal(result.status, 0, 'Validation failed before any model call: ' + args.join(' '))
}
try {
  save()
  const funding = { at: new Date().toISOString(), researcherOnly: true, source: 'Same OpenRouter account GET credits, no payment or model call', balance }
  fs.writeFileSync(resolve(recovery, 'actual-funding-observation.json'), JSON.stringify(funding, null, 2) + '\n', { flag: 'wx' })
  const amendment = json(resolve(prepared, 'budget-amendment-2.json'))
  amendment.fundingObserved = true; amendment.fundingObservation = funding
  amendment.fundingEvidence = 'analysis/recovery/budget-amendment-2-2026-11-01/actual-funding-observation.json'
  amendment.fundingEvidenceSHA256 = sha(resolve(recovery, 'actual-funding-observation.json'))
  amendment.activatedAt = new Date().toISOString()
  assert.ok(!fs.existsSync(resolve(study, 'budget-amendment-2.json')))
  atomic(resolve(study, 'budget-amendment-2.json'), JSON.stringify(amendment, null, 2) + '\n')
  for (const name of ['relay.mjs', 'prepaid-budget.mjs']) atomic(resolve(study, name), fs.readFileSync(resolve(prepared, name)))
  const freeze = json(resolve(recovery, 'original/frozen-inputs.json'))
  freeze.version = 'O/1.0+budget-amendment-2'; freeze.amendment = 'budget-amendment-2.json'
  freeze.amendedAt = amendment.activatedAt
  freeze.previousFreeze = amendment.previousFreeze; freeze.previousFreezeSHA256 = amendment.previousFreezeSHA256
  for (const name of ['relay.mjs', 'prepaid-budget.mjs', 'budget-amendment-2.json']) freeze.sources[name] = sha(resolve(study, name))
  atomic(resolve(study, 'frozen-inputs.json'), JSON.stringify(freeze, null, 2) + '\n')
  for (const name of ['audit-budget-amendment.mjs', 'report.py', 'workbook.mjs', 'prepare-checkpoint.py', 'inspect-final-workbook.mjs', 'audit-final-xlsx.py']) atomic(resolve(study, 'analysis/artifacts', name), fs.readFileSync(resolve(prepared, name)))
  verify()
  check([resolve(prepared, 'prepaid-budget.test.mjs')])
  check(['--test', resolve(study, 'analysis/artifacts/prepaid-budget.test.mjs')])
  check([resolve(study, 'analysis/artifacts/audit-budget-amendment.mjs')])
  check([resolve(study, 'analysis/artifacts/audit-evidence.mjs'), '--partial'])
  const cohort = spawnSync('python3', [resolve(study, 'analysis/artifacts/verify-selected-review-cohort.py')], { cwd: resolve(study, '..'), stdio: 'inherit' })
  assert.equal(cohort.status, 0)
  for (const name of ['budget.json', 'budget-amendment-1.json', 'analysis/artifacts/continue-known-service-error.mjs']) assert.equal(sha(resolve(study, name)), preparation.originalSourceSHA256[name])
  state.status = 'active-validated-no-model-calls-yet'
  state.effectiveAfterArchivedPosition = 189; state.firstAffectedMeasuredPosition = 190
  state.protocol = freeze.version; state.unknownCostAccountingChanged = false
  state.originalBudgetAndVersion1ApprovalUnchanged = true
  state.activeSourceSHA256 = Object.fromEntries(['relay.mjs', 'prepaid-budget.mjs', 'frozen-inputs.json', 'budget-amendment-2.json'].map(name => [name, sha(resolve(study, name))]))
  save(); console.log(JSON.stringify(state))
} catch (error) {
  state.status = 'validation-failed-before-any-model-call'; state.error = String(error.message)
  save(); throw error
} finally { fs.rmSync(lock) }
