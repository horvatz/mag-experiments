// Independent connectivity diagnostic, never a measured task or retry.
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startRelay } from '../../relay.mjs'
import { reconcileCosts } from '../../costs.mjs'
const study = resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const selected = JSON.parse(fs.readFileSync(resolve(study,'models.json'))).models.find(m=>m.slug===process.argv[2])
if (!selected) throw Error('Specify an approved model slug')
const destination = resolve(study,selected.slug,'qualification','service-' + new Date().toISOString().replace(/[:.]/g,'-'))
fs.mkdirSync(destination,{recursive:true})
const relay = await startRelay({selected,destination,label:selected.slug+'/unmeasured-service-diagnostic',port:9239})
let result
try {
  const body = {model:selected.id,input:[{role:'user',content:[{type:'input_text',text:'Connectivity diagnostic only. Do not use tools, read files, or perform a task. Reply exactly CONNECTION_OK.'}]}],stream:true}
  const response = await fetch('http://127.0.0.1:9239/v1/responses',{method:'POST',headers:{authorization:'Bearer '+relay.env.MAG_RELAY_TOKEN,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)})
  const stream = await response.text()
  fs.writeFileSync(resolve(destination,'response.txt'),stream.replace(/sk-or-v1-[A-Za-z0-9_-]+/g,'[REDACTED]'))
  const events = stream.split('\n').flatMap(line=>{if(!line.startsWith('data: '))return [];try{return [JSON.parse(line.slice(6))]}catch{return []}})
  const final = events.findLast(e=>e.response?.status)
  const text = (final?.response?.output||[]).filter(o=>o.type==='message').flatMap(o=>(o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text||'')).join('').trim()
  result = {at:new Date().toISOString(),model:selected.id,provider:selected.provider,httpStatus:response.status,responseStatus:final?.response?.status,text,error:final?.response?.error||null,passed:response.ok&&final?.response?.status==='completed'&&text==='CONNECTION_OK',excludedFromMeasurements:true}
} catch(error) {
  result = {at:new Date().toISOString(),model:selected.id,provider:selected.provider,passed:false,errorType:error.name,excludedFromMeasurements:true}
} finally {
  await relay.close()
  const cost = await reconcileCosts(destination)
  result.costComplete = cost.complete; result.costUSD = cost.costUSD
}
fs.writeFileSync(resolve(destination,'result.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({...result,evidence:destination}))
if(!result.passed)process.exitCode=1
