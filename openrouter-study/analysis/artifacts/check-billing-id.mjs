// Tiny unmeasured request to inspect documented billing identifiers.
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openrouter, credits } from '../../credentials.mjs'
import { recordedSpend } from '../../costs.mjs'
const study = resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const selected = JSON.parse(fs.readFileSync(resolve(study,'models.json'))).models.find(m=>m.slug==='qwen')
const directory = resolve(study,'qwen/qualification','billing-id-'+new Date().toISOString().replace(/[:.]/g,'-'))
fs.mkdirSync(directory,{recursive:true})
const balance = await credits(), budget = recordedSpend()
if (balance.remainingUSD < .1 || budget.knownUSD+budget.unknownReservedUSD+.1>=40) throw Error('Insufficient budget for diagnostic')
const body = {model:selected.id,input:'Reply exactly OK.',reasoning:{enabled:false},max_output_tokens:32,store:false,stream:true,provider:{only:[selected.provider],allow_fallbacks:false,require_parameters:true}}
fs.writeFileSync(resolve(directory,'request.json'),JSON.stringify(body,null,2)+'\n')
const record = {number:1,label:'qwen/unmeasured-billing-identifier-diagnostic',model:selected.id,provider:selected.provider,startedAt:new Date().toISOString(),balanceBefore:balance,budgetBefore:budget,sentUpstream:true}
try {
  const response = await openrouter('/responses',{method:'POST',body:JSON.stringify(body),signal:AbortSignal.timeout(60000)})
  record.httpStatus=response.status; record.generationHeaderId=response.headers.get('x-generation-id')
  const stream = await response.text()
  fs.writeFileSync(resolve(directory,'response.txt'),stream.replace(/sk-or-v1-[A-Za-z0-9_-]+/g,'[REDACTED]'))
  const events = stream.split('\n').flatMap(line=>{if(!line.startsWith('data: '))return [];try{return [JSON.parse(line.slice(6))]}catch{return []}})
  const final = events.findLast(e=>e.response?.status)?.response
  record.responseId=final?.id; record.usage=final?.usage; record.responseStatus=final?.status; record.status=response.ok?'finished':'http_error'
  record.error=final?.error||null
} catch(error) {record.status='transport_error';record.errorType=error.name}
record.finishedAt=new Date().toISOString()
fs.writeFileSync(resolve(directory,'api-ledger.jsonl'),JSON.stringify(record)+'\n')
const lookups = []
for(const id of [...new Set([record.generationHeaderId,record.responseId].filter(Boolean))]) {
  const response = await openrouter('/generation?id='+encodeURIComponent(id))
  const data = await response.json()
  lookups.push({id,status:response.status,data})
}
fs.writeFileSync(resolve(directory,'generation-lookups.json'),JSON.stringify(lookups,null,2)+'\n')
console.log(JSON.stringify({evidence:directory,httpStatus:record.httpStatus,responseStatus:record.responseStatus,generationHeaderId:record.generationHeaderId,responseId:record.responseId,lookups:lookups.map(l=>({id:l.id,status:l.status,costUSD:l.data.data?.total_cost})),costUSD:record.usage?.cost}))
