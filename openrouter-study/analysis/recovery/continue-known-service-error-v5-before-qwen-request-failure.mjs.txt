// Researcher-only continuation after observed service failures. Retains each
// failed run. Qwen stream failures require a fresh connectivity check; their
// underlying cause and reliability of long responses remain unknown.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { verify } from '../../verify.mjs'

export function diagnosedImageError(row, body) {
  if (row.model !== 'deepseek/deepseek-v4.1-flash' || row.provider !== 'deepinfra/fp8' || row.httpStatus !== 422 || row.status !== 'http_error') return false
  let error
  try { error = JSON.parse(JSON.parse(row.providerError).error.metadata.raw).error } catch { return false }
  if (error.message !== 'Input should be a valid string' || !/^messages\.\d+\.tool\.content\.str$/.test(error.param || '')) return false
  if (body.model !== row.model || body.provider?.only?.length !== 1 || body.provider.only[0] !== row.provider || body.provider.allow_fallbacks !== false) return false
  const images = (body.input || []).filter(x => x.type === 'function_call_output' && Array.isArray(x.output) && x.output.some(c => c.type === 'input_image'))
  return images.length > 0 && images.every(x => body.input.some(c => c.type === 'function_call' && c.call_id === x.call_id && c.name === 'view_image'))
}

export function knownFailure(row, body, nativeFailures = []) {
  if (diagnosedImageError(row, body)) return 'deepinfra-image-tool'
  if (row.model === 'z-ai/glm-5.3' && row.provider === 'wafer/us' && row.httpStatus === 429 && row.status === 'http_error') {
    let error
    try { error = JSON.parse(row.providerError).error } catch { return null }
    const meta = error?.metadata
    if (error?.code !== 429 || error.message !== 'Provider returned error' || meta?.provider_name !== 'Wafer' || meta?.is_byok !== false || meta?.provider_error_code !== 'server_overloaded' || meta?.limit_source !== 'upstream_provider_shared_pool') return null
    if (row.sentUpstream !== true || row.retryAfter !== '2' || meta.retry_after_seconds !== 2 || meta.headers?.['Retry-After'] !== '2') return null
    if (body.model !== row.model || body.provider?.only?.length !== 1 || body.provider.only[0] !== row.provider || body.provider.allow_fallbacks !== false) return null
    if (!nativeFailures.includes('exceeded retry limit, last status: 429 Too Many Requests')) return null
    return 'glm-wafer-shared-pool-overload'
  }
  if (row.model === 'deepseek/deepseek-v4.1-flash' && row.provider === 'deepinfra/fp8' && row.httpStatus === 520 && row.status === 'http_error') {
    let error
    try { error = JSON.parse(row.providerError).error } catch { return null }
    if (error.code !== 520 || error.message !== 'Provider returned error' || error.metadata?.raw !== 'error code: 520\n' || error.metadata?.provider_name !== 'DeepInfra' || error.metadata?.is_byok !== false) return null
    if (row.sentUpstream !== true || row.retryAfter != null) return null
    if (body.model !== row.model || body.provider?.only?.length !== 1 || body.provider.only[0] !== row.provider || body.provider.allow_fallbacks !== false) return null
    if (!nativeFailures.includes('unexpected status 520 <unknown status code>: Provider returned error, url: http://127.0.0.1:9238/v1/responses')) return null
    return 'deepinfra-http520-cause-unknown'
  }
  if (row.model === 'z-ai/glm-5.3' && row.provider === 'wafer/us' && row.httpStatus === 404 && row.status === 'http_error') {
    let error
    try { error = JSON.parse(row.providerError).error } catch { return null }
    if (error.code !== 404 || error.message !== 'No endpoints found that support image input' || error.metadata?.failed_routing_step !== 'Filter by Image Support') return null
    if (body.model !== row.model || body.provider?.only?.length !== 1 || body.provider.only[0] !== row.provider || body.provider.allow_fallbacks !== false) return null
    const images = (body.input || []).filter(x => x.type === 'function_call_output' && Array.isArray(x.output) && x.output.some(c => c.type === 'input_image'))
    if (images.length > 0 && images.every(x => body.input.some(c => c.type === 'function_call' && c.call_id === x.call_id && c.name === 'view_image'))) return 'glm-image-input-unsupported'
    return null
  }
  if (row.model !== 'qwen/qwen3.5-9b' || row.provider !== 'siliconflow/fp8' || row.httpStatus !== 200 || row.status !== 'finished' || row.responseStatus !== 'failed') return null
  if (body.model !== row.model || body.provider?.only?.length !== 1 || body.provider.only[0] !== row.provider || body.provider.allow_fallbacks !== false) return null
  if (nativeFailures.includes('stream disconnected before completion: stream closed with reason: error')) return 'qwen-stream-failed-cause-unknown'
  if (nativeFailures.includes('stream disconnected before completion: Provider returned an empty response')) return 'qwen-empty-response-cause-unknown'
  return null
}

async function serviceCheck(study, slug) {
  const selected = JSON.parse(fs.readFileSync(resolve(study, 'models.json'))).models.find(value => value.slug === slug)
  assert.ok(selected)
  const started = Date.now()
  const child = spawn(process.execPath, [resolve(study, 'analysis/artifacts/check-service.mjs'), slug], { cwd: resolve(study, '..'), env: process.env, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = '', timedOut = false, outputOverflow = false
  child.stdout.on('data', part => { output += part; if (output.length > 50000) { outputOverflow = true; output = output.slice(-50000) } })
  child.stderr.on('data', () => {})
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM') }, 90000)
  let code
  try { code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) }) } finally { clearTimeout(timer) }
  assert.equal(timedOut, false, 'Service diagnostic timeout needs inspection')
  assert.equal(outputOverflow, false, 'Unexpected diagnostic output needs inspection')
  assert.equal(code, 0, 'Service diagnostic failed; no continuation')
  const result = JSON.parse(output.trim().split('\n').at(-1))
  assert.equal(result.model, selected.id); assert.equal(result.provider, selected.provider)
  assert.equal(result.httpStatus, 200); assert.equal(result.responseStatus, 'completed')
  assert.equal(result.text, 'CONNECTION_OK'); assert.equal(result.passed, true)
  assert.equal(result.excludedFromMeasurements, true)
  assert.ok(result.evidence.startsWith(resolve(study, slug, 'qualification/service-')))
  assert.ok(Date.parse(result.at) >= started)
  return result
}

async function main() {
  const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const recovery = resolve(study, 'analysis/recovery')
  const json = path => JSON.parse(fs.readFileSync(path))
  const lock = resolve(recovery, 'known-service-resumer.lock')
  const fd = fs.openSync(lock, 'wx'); fs.writeFileSync(fd, String(process.pid)); fs.closeSync(fd)
  const save = value => { const row = { at: new Date().toISOString(), ...value }; fs.appendFileSync(resolve(recovery, 'known-service-resumes.jsonl'), JSON.stringify(row) + '\n'); console.log(JSON.stringify(row)) }
  const processCommand = pid => { try { return execFileSync('/bin/ps', ['-p', String(pid), '-o', 'args='], { encoding: 'utf8' }).trim() } catch { return '' } }
  const expectedCommand = 'node openrouter-study/run.mjs'
  let pid = Number(process.argv[2]), previousCount = -1
  try {
    assert.ok(Number.isInteger(pid) && pid > 1)
    if (process.argv.includes('--inspect-stopped')) {
      assert.equal(processCommand(pid), '', 'Stopped-run inspection requires an exited PID')
      assert.ok(!fs.existsSync(resolve(study, 'runner.lock')))
      const stopped = json(resolve(study, 'active.json'))
      assert.equal(stopped.pid, pid); assert.equal(stopped.stage, 'service_failure_archived')
    } else assert.equal(processCommand(pid), expectedCommand, 'Attach only to verified current runner')
    assert.ok(!fs.existsSync(resolve(recovery, 'known-image-resumer.lock')), 'Previous continuation controller must be stopped first')
    save({ action: 'attached', runnerPid: pid, sourceSHA256: createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex'), rationale: 'Diagnosed DeepInfra image-tool HTTP422, observed exact DeepInfra HTTP520, GLM image-support HTTP404, or observed Qwen response.failed may continue only with archive/input/unused-ID checks. HTTP520, Qwen and GLM additionally require a fresh successful text service check. Other failures stop.' })
    while (true) {
      while (processCommand(pid) === expectedCommand) await new Promise(done => setTimeout(done, 5000))
      const status = json(resolve(study, 'status.json'))
      if (status.archived === 216) { save({ action: 'all_measurements_archived', archived: 216 }); break }
      assert.ok(!fs.existsSync(resolve(study, 'runner.lock')), 'A different runner or incomplete exit needs inspection')
      const active = json(resolve(study, 'active.json'))
      assert.equal(active.pid, pid)
      assert.equal(active.stage, 'service_failure_archived')
      assert.ok(['deepseek', 'qwen', 'glm'].includes(active.slug))
      assert.ok(status.archived > previousCount, 'Continuation must make archival progress')
      const run = resolve(study, active.slug, 'runtime/runs', active.id)
      const manifest = json(resolve(run, 'archive-complete.json'))
      assert.equal(manifest.id, active.id)
      assert.equal(json(resolve(run, 'execution.json')).status, 'execution_failed')
      for (const [file, entry] of Object.entries(manifest.files)) {
        assert.ok(!file.startsWith('/') && !file.split('/').includes('..'))
        if (entry.kind === 'file') assert.equal(createHash('sha256').update(fs.readFileSync(resolve(run, file))).digest('hex'), entry.sha256)
      }
      const nativeFailures = Object.keys(manifest.files).filter(file => file.endsWith('events.jsonl.gz')).flatMap(file => gunzipSync(fs.readFileSync(resolve(run, file))).toString('utf8').split('\n').filter(Boolean).map(JSON.parse)).filter(event => ['error', 'turn.failed'].includes(event.type)).map(event => event.message || event.error?.message).filter(Boolean)
      const api = resolve(study, active.slug, 'api', active.id, 'model')
      const rows = fs.readFileSync(resolve(api, 'api-ledger.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
      const errors = rows.filter(r => r.httpStatus !== undefined && r.httpStatus !== 200 || ['failed', 'incomplete'].includes(r.responseStatus) || ['transport_error', 'rejected_before_upstream'].includes(r.status))
      assert.ok(errors.length > 0)
      const classifications = []
      for (const row of errors) {
        const body = JSON.parse(gunzipSync(fs.readFileSync(resolve(api, `request-${String(row.number).padStart(5, '0')}.json.gz`))))
        const classification = knownFailure(row, body, nativeFailures)
        assert.ok(classification, 'New failure type needs researcher inspection')
        classifications.push(classification)
      }
      let diagnostic = null
      if (classifications.some(value => value.startsWith('qwen-') || value === 'glm-image-input-unsupported' || value === 'glm-wafer-shared-pool-overload' || value === 'deepinfra-http520-cause-unknown')) {
        save({ action: 'checking_service', previousRun: active.slug + '/' + active.id, errorRequests: errors.map(r => r.number), classifications })
        diagnostic = await serviceCheck(study, active.slug)
        save({ action: 'service_check_passed', diagnostic, limitation: 'Short reply success does not establish reliability of long tool responses.' })
      }
      const plan = json(resolve(study, 'models.json'))
      const schedule = json(resolve(study, plan.models[0].slug, 'runtime/main-study/schedule.json')).runs
      const jobs = schedule.flatMap((entry, index) => plan.models.map((_, offset) => ({ ...entry, slug: plan.models[(index + offset) % plan.models.length].slug })))
      assert.equal(jobs[active.position - 1].slug, active.slug); assert.equal(jobs[active.position - 1].id, active.id)
      for (const job of jobs.slice(0, active.position)) assert.ok(fs.existsSync(resolve(study, job.slug, 'runtime/runs', job.id, 'archive-complete.json')))
      const next = jobs[active.position]
      assert.ok(next, 'Expected unused next ID')
      for (const path of [resolve(study, next.slug, 'runtime/.work/pilots', next.id, 'execution.json'), resolve(study, next.slug, 'api', next.id, 'model/api-ledger.jsonl'), resolve(study, next.slug, 'runtime/runs', next.id)]) assert.ok(!fs.existsSync(path), 'Next ID has already started; never repeat it')
      verify()
      const incident = { action: 'continue_unused_ids', archived: status.archived, previousRun: active.slug + '/' + active.id, errorRequests: errors.map(r => r.number), classifications, nextRun: next.slug + '/' + next.id, diagnosis: active.slug === 'deepseek' ? classifications.includes('deepinfra-http520-cause-unknown') ? 'analysis/recovery/deepseek-P08-C-001-service.json' : 'analysis/recovery/deepseek-P06-A-001-image-tool.json' : active.slug === 'glm' ? classifications.includes('glm-wafer-shared-pool-overload') ? 'analysis/recovery/glm-P07-A-003-service.json' : 'analysis/recovery/glm-P06-B-001-image-tool.json' : classifications.includes('qwen-empty-response-cause-unknown') ? 'analysis/recovery/qwen-P06-B-001-service.json' : 'analysis/recovery/qwen-P06-A-001-service.json', diagnostic: diagnostic?.evidence || null, frozenProtocolVersion: json(resolve(study, 'frozen-inputs.json')).version, taskPromptsDeadlinesEvaluatorsUnchanged: true, archivedHashesVerified: true, measuredRetry: false, serviceCheck: 'Unchanged runner also performs connectivity check before the next measured start.' }
      save(incident)
      previousCount = status.archived
      const child = spawn('/usr/bin/caffeinate', ['-i', process.execPath, 'openrouter-study/run.mjs'], { cwd: resolve(study, '..'), env: process.env, stdio: 'inherit' })
      const code = await new Promise((done, reject) => { child.once('error', reject); child.once('close', done) })
      const newest = json(resolve(study, 'active.json'))
      pid = newest.pid
      save({ action: 'runner_exited', runnerPid: pid, exitCode: code })
    }
  } catch (error) {
    save({ action: 'stopped_for_researcher', error: String(error.message).replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[REDACTED]') })
    process.exitCode = 1
  } finally { fs.rmSync(lock) }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
