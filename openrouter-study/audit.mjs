// Researcher audit before any measured model call; never erase failed pilots.
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from '../scripts/pilot-utils.mjs'
const study = dirname(fileURLToPath(import.meta.url))
assert.ok(!existsSync(resolve(study, 'frozen-inputs.json')))
const json = p => JSON.parse(readFileSync(p))
const models = json(resolve(study, 'models.json')).models
for (const selected of models) {
  const root = resolve(study, selected.slug)
  const finalB = selected.slug === 'glm' ? 'Q-B-017' : 'Q-B-018'
  const transport = json(resolve(root, 'qualification', selected.transportQualification, 'result.json'))
  assert.ok(transport.passed && transport.provider === selected.provider)
  const technical = json(resolve(root, 'qualification/technical-916.json')); assert.ok(technical.passed)
  const testLog = readFileSync(resolve(root, 'qualification/operator-tests-configured.log'), 'utf8')
  assert.ok(testLog.includes('pass 26') && testLog.includes('fail 0'))
  const evidence = {}, workflows = []
  for (const id of ['Q-B-011', 'Q-C-011', 'Q-I-011', finalB]) {
    const path = `runtime/qualification/${id}/execution.json`, execution = json(resolve(root, path))
    evidence[path] = digest(readFileSync(resolve(root, path)))
    workflows.push({ id, status: execution.status, successful: execution.successful,
      phases: execution.phases.map(({ name, status, elapsedSeconds, allowedChanges, contextRetained }) => ({ name, status, elapsedSeconds, allowedChanges, contextRetained })),
      ...(selected.slug === 'glm' && id === 'Q-B-011' ? { researcherAudit: json(resolve(root, 'qualification/Q-B-011/recorder-audit.json')) } : {}) })
  }
  assert.notEqual(workflows.at(-1).status, 'running')
  const ledger = readFileSync(resolve(root, 'qualification', finalB, 'api-ledger.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse)
  const unresolvedInfrastructureFaults = ledger.filter(row => (row.httpStatus !== undefined && row.httpStatus !== 200) || ['failed', 'incomplete'].includes(row.responseStatus) || ['transport_error', 'rejected_before_upstream'].includes(row.status))
  assert.equal(unresolvedInfrastructureFaults.length, 0, 'Investigate final-configuration infrastructure before freezing')
  for (const path of [`qualification/${selected.transportQualification}/result.json`, 'qualification/technical-916.json', 'qualification/operator-tests-configured.log']) evidence[path] = digest(readFileSync(resolve(root, path)))
  if (existsSync(resolve(root, 'qualification/audit.json'))) {
    assert.deepEqual(json(resolve(root, 'qualification/audit.json')).evidence, evidence)
    continue
  }
  writeFileSync(resolve(root, 'qualification/audit.json'), JSON.stringify({ at: new Date().toISOString(), model: selected.id, provider: selected.provider,
    transportQualified: true, startedMeasurements: 0, unresolvedInfrastructureFaults, workflows, evidence,
    decision: 'Proceed with all three preselected models. Actual native tools, final schema and retained sessions pass. Model diagnostic timeouts and semantic failures are retained; they do not exclude a model or change task prompts, workflow, time limits or reasoning settings. Original Q/1 recording bug is isolated from measured B handling.' }, null, 2) + '\n', { flag: 'wx' })
}
const protocolPath = resolve(study, 'protocol.json'), protocol = json(protocolPath)
protocol.status = 'ready to freeze'
protocol.qualification.auditedAt = new Date().toISOString()
writeFileSync(protocolPath, JSON.stringify(protocol, null, 2) + '\n')
console.log('All three final-configuration qualification audits recorded; failures preserved.')
