// Reporting finalization only. Never launches or repeats measured runs.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verify } from '../../verify.mjs'
import { reconcileMissingCosts, recordedSpend } from '../../costs.mjs'
const here = dirname(fileURLToPath(import.meta.url)), study = resolve(here,'../..'), root = resolve(study,'..')
const json = file => JSON.parse(fs.readFileSync(file))
assert.ok(!fs.existsSync(resolve(study,'runner.lock')), 'Queue must finish before final reporting')
assert.equal(json(resolve(study,'status.json')).archived,216,'All 216 measurements must be archived')
verify()
await reconcileMissingCosts()
const deps = '/Users/zan/.cache/codex-runtimes/codex-primary-runtime/dependencies'
function run(binary,args,env=process.env) {
  const result = spawnSync(binary,args,{cwd:root,env,stdio:'inherit'})
  assert.equal(result.status,0,`Reporting failed: ${args.join(' ')}`)
}
run(process.execPath,[resolve(study,'analyze.mjs')])
const comparison = json(resolve(study,'analysis/comparison.json'))
assert.equal(comparison.complete,true)
run(process.execPath,[resolve(here,'audit-evidence.mjs')])
run(resolve(deps,'python/bin/python3'),[resolve(here,'report.py')],{...process.env,PYTHONPATH:'/private/tmp/mag-openrouter-report-deps',MPLCONFIGDIR:'/private/tmp/mag-openrouter-mpl'})
run(resolve(deps,'node/bin/node'),[resolve(here,'workbook.mjs')])
const out = resolve(root,'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b')
const files = ['primerjava-modelov.pdf','primerjava-modelov.xlsx'].map(name=>({path:resolve(out,name),bytes:fs.statSync(resolve(out,name)).size}))
const result = {at:new Date().toISOString(),archiveAuditPassed:true,archives:360,selectedContentReviews:120,spend:recordedSpend(),files,visualReview:'pending; inspect every rendered PDF page and workbook sheet before delivery'}
fs.writeFileSync(resolve(study,'analysis/finalization.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
