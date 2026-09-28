// Operator-only checkpoint after an explicit user pause. Never launches a measured model.
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { createWriteStream, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { connect } from 'node:net'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const recovery=dirname(fileURLToPath(import.meta.url)), study=resolve(recovery,'../..'), root=resolve(study,'runtime')
const receiptPath=resolve(recovery,'pause-2026-09-29.json')
const read=p=>JSON.parse(readFileSync(p,'utf8')), save=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n')
const receipt=read(receiptPath), id=receipt.currentId, dir=resolve(root,'.work/pilots',id)
assert.equal(receipt.state,'waiting_for_started_measurement')
assert.equal(read(resolve(root,'main-study/active.json')).id,id)
const execution=read(resolve(dir,'execution.json'))
assert.notEqual(execution.status,'running','Wait for the started measurement to finish')
assert.ok(existsSync(resolve(dir,'final-inventory.json')) && existsSync(resolve(dir,'submission/src/App.tsx')))
function ps(pid,field) { try { return execFileSync('/bin/ps',['-o',field+'=','-p',String(pid)],{encoding:'utf8'}).trim() } catch(error) { if(error.status===1)return null;throw error } }
const runnerState=ps(receipt.modelRunnerPid,'stat')
assert.ok(runnerState===null || runnerState.startsWith('Z'),'Measured runner must have exited before cleanup')
assert.ok(ps(receipt.queuePid,'stat')?.includes('T'),'Parent queue must remain stopped')
assert.ok(ps(receipt.queuePid,'args')?.includes('luna-study/run.mjs'),'Unexpected parent process')
receipt.measuredFinishedAt=execution.finishedAt
receipt.measuredExecutionStatus=execution.status
receipt.measuredRunnerStateBeforeCleanup=runnerState
receipt.executionSha256=createHash('sha256').update(readFileSync(resolve(dir,'execution.json'))).digest('hex')
// SIGKILL targets the already-stopped operator only. Its model runner has exited.
process.kill(receipt.queuePid,'SIGKILL')
receipt.queueStoppedAt=new Date().toISOString()
const browserArgs=ps(receipt.browserWrapperPid,'args')
if(browserArgs!==null) { assert.ok(browserArgs.includes('pilot-browser.mjs') && browserArgs.includes(id));process.kill(receipt.browserWrapperPid,'SIGTERM') }
const listening=()=>new Promise(done=>{const socket=connect({host:'127.0.0.1',port:9223});const end=v=>{socket.destroy();done(v)};socket.once('connect',()=>end(true));socket.once('error',()=>end(false));socket.setTimeout(500,()=>end(true))})
for(let n=0;n<100 && await listening();n++)await new Promise(r=>setTimeout(r,100))
assert.equal(await listening(),false,'Experimental browser must close before evaluation')
receipt.browserClosedAt=new Date().toISOString();receipt.state='archiving_after_user_pause';receipt.commands=[];save(receiptPath,receipt)
save(resolve(root,'main-study/active.json'),{id,stage:'evaluating',at:new Date().toISOString(),operator:'finish-user-pause.mjs',note:'No new model may start; explicit user pause.'})
async function command(name,file,args=[],cwd=root) {
 const logPath=resolve(root,'main-study/logs',id+'-pause-'+name+'-'+Date.now()+'.log'),log=createWriteStream(logPath,{flags:'wx'})
 const startedAt=new Date().toISOString(),child=spawn(process.execPath,[file,...args],{cwd,env:process.env,stdio:['ignore','pipe','pipe']})
 child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false})
 const outcome=await new Promise(done=>{child.once('error',error=>done({code:null,error:error.message}));child.once('close',(code,signal)=>done({code,signal}))})
 await new Promise(done=>log.end(done))
 const record={name,startedAt,finishedAt:new Date().toISOString(),file,args,cwd,logPath,...outcome};receipt.commands.push(record);save(receiptPath,receipt);console.log(JSON.stringify(record))
 assert.equal(outcome.code,0,'Pause finalization failed: '+name)
}
await command('verify',resolve(study,'verify.mjs'),[],resolve(study,'..'))
if(!existsSync(resolve(dir,'usage-observation.json')))await command('usage',resolve(root,'scripts/reconcile-pilot-usage.mjs'),[id])
if(!existsSync(resolve(dir,'evaluation-summary.json')))await command('evaluate',resolve(root,'scripts/evaluate-pilot.mjs'),[id])
await command('archive',resolve(root,'scripts/archive-pilot.mjs'),[id])
await command('analysis',resolve(root,'scripts/analyze-main.mjs'))
await command('reporting',resolve(study,'analyze.mjs'))
await command('comparison',resolve(study,'compare.mjs'))
await command('status',resolve(root,'scripts/main-study.mjs'),['status'])
const archive=resolve(root,'runs',id,'archive-complete.json')
receipt.archiveReceiptSha256=createHash('sha256').update(readFileSync(archive)).digest('hex')
assert.equal(createHash('sha256').update(readFileSync(resolve(root,'runs',id,'execution.json'))).digest('hex'),receipt.executionSha256)
assert.ok(!existsSync(resolve(root,'.work/pilots',receipt.nextUnusedId,'execution.json')),'Next measured ID unexpectedly started')
receipt.state='paused';receipt.pausedAt=new Date().toISOString();receipt.archivedAfterPause=read(resolve(root,'main-study/status.json')).archived
receipt.frozenInputsVerified=true;receipt.nextMeasuredRunStarted=false;save(receiptPath,receipt)
save(resolve(root,'main-study/active.json'),{id,stage:'paused_by_user',at:receipt.pausedAt,nextId:receipt.nextUnusedId,archived:receipt.archivedAfterPause,note:receipt.request,recovery:'luna-study/analysis/recovery/pause-2026-09-29.json'})
const lock=resolve(root,'main-study/runner.lock');assert.equal(readFileSync(lock,'utf8'),String(receipt.queuePid));rmSync(lock)
console.log(JSON.stringify({paused:true,archived:receipt.archivedAfterPause,next:receipt.nextUnusedId,measuredModelInterrupted:false}))
