// Researcher-only finalization of an orphaned, already-started run. Never resumes its model.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import { inventory, changes, editable, submissionPaths, digest } from '../../../scripts/pilot-utils.mjs'
import { stageCanEdit } from '../../../scripts/procedure-c.mjs'
const root=process.cwd(), id='P06-C-001', run=resolve(root,'.work/pilots',id), app=resolve(run,'app'), evidence=resolve(root,'main-study/analysis/recovery',id)
const read=p=>JSON.parse(readFileSync(p,'utf8')), save=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const processes=execFileSync('/bin/ps',['-axo','pid=,ppid=,command='],{encoding:'utf8'})
assert.ok(!processes.split('\n').some(l=>/^\s*\d+\s+\d+\s+(?:\S*\/)?node\s+.*(?:scripts\/(?:main-study|run-pilot|pilot-browser)\.mjs|pause-after-current\.mjs)/.test(l)), 'A study process remains alive')
execFileSync(process.execPath,['scripts/main-study.mjs','verify-freeze'],{stdio:'inherit'})
assert.ok(!existsSync(resolve(root,'runs',id)))
assert.ok(!existsSync(resolve(run,'submission')))
const executionFile=resolve(run,'execution.json'), original=readFileSync(executionFile), execution=JSON.parse(original), manifest=read(resolve(run,'manifest.json'))
assert.equal(execution.status,'running'); assert.equal(execution.phases.at(-1).name,'implement')
writeFileSync(resolve(evidence,'execution-before-recovery.json'),original,{flag:'wx'})
writeFileSync(resolve(evidence,'processes-at-recovery.txt'),processes.split('\n').filter(l=>/main-study|run-pilot|pause-after-current|watch-writing|9223/.test(l)).join('\n')+'\n',{flag:'wx'})
const session='/Users/zan/.codex/sessions/2026/09/22/rollout-2026-09-22T01-24-52-01a0c649-6118-7593-b9d3-32afc3278f71.jsonl'
const events=readFileSync(session,'utf8').trim().split('\n').map(JSON.parse)
const counters=events.filter(e=>e.type==='event_msg'&&e.payload?.type==='token_count'&&e.payload.info?.total_token_usage).map(e=>({timestamp:e.timestamp,total_token_usage:e.payload.info.total_token_usage}))
save(resolve(evidence,'usage-events.json'),counters)
const now=new Date().toISOString(), files=inventory(app), phase=execution.phases.at(-1), phaseDir=resolve(run,'phases/05-implement')
assert.ok(!existsSync(resolve(phaseDir,'result.json')))
const before=JSON.parse(gunzipSync(readFileSync(resolve(run,'phases/04-tasks/inventory.json.gz'))))
phase.status='infrastructure_interrupted'; phase.finishedAt=null; phase.elapsedSeconds=null
phase.threadId=execution.sessions.agent; phase.usage=null
phase.fileChanges=changes(before,files,'C').map(x=>({...x,roleAllowed:stageCanEdit('implement',x.path,'docs/agent/P06')}))
phase.allowedChanges=phase.fileChanges.every(x=>x.roleAllowed)
phase.rejectedSymlinks=Object.entries(files).filter(([p,x])=>editable(p,'C')&&x.kind!=='file').map(([p])=>p)
phase.recoveryNote='No terminal event or phase result survived. Original process absent at recovery. End timestamp and elapsed time unknown; model was not resumed.'
for(const base of [resolve(phaseDir,'submission'),resolve(run,'submission')]) for(const p of submissionPaths('C')) {mkdirSync(dirname(resolve(base,p)),{recursive:true});cpSync(resolve(app,p),resolve(base,p),{recursive:true,verbatimSymlinks:true})}
writeFileSync(resolve(phaseDir,'inventory.json.gz'),gzipSync(JSON.stringify(files)),{flag:'wx'}); save(resolve(phaseDir,'result.json'),phase)
execution.status='infrastructure_interrupted'; execution.finishedAt=now; execution.elapsedSeconds=null
execution.finishedAtMeaning='Researcher finalization after confirming no live process, NOT observed model end. Exact duration is unknown.'
execution.usage=null; execution.usageNote='Interrupted persistent session. Total usage unknown; latest observed cumulative counters are a lower bound only.'
execution.fileChanges=changes(manifest.files,files,'C'); execution.rejectedSymlinks=phase.rejectedSymlinks
execution.allowedChanges=execution.fileChanges.every(x=>x.allowed)&&!execution.rejectedSymlinks.length&&execution.phases.every(x=>x.allowedChanges)
execution.recovery={at:now,cause:'Orphaned runner after absence; exact cause unknown. Requested after-archive pause was never reached.',originalExecutionSha256:digest(original),evidence:'main-study/analysis/recovery/P06-C-001/',originalSessionSha256:digest(readFileSync(session)),lastRecordedSessionEventAt:events.at(-1).timestamp,lastObservedTokenCount:counters.at(-1),modelResumed:false,submissionEdited:false,exactDurationKnown:false,pendingStages:['finish implement','converge']}
writeFileSync(executionFile,JSON.stringify(execution,null,2)+'\n'); save(resolve(run,'final-inventory.json'),files)
assert.deepEqual(files,inventory(app)); assert.deepEqual(inventory(resolve(run,'submission')),Object.fromEntries(Object.entries(files).filter(([p])=>editable(p,'C'))))
save(resolve(evidence,'recovery.json'),execution.recovery)
const lock=resolve(root,'main-study/runner.lock'); assert.equal(readFileSync(lock,'utf8').trim(),'94064'); rmSync(lock)
save(resolve(root,'main-study/resume-2026-09-23.json'),{at:now,userInstruction:'okej nadaljuj naprej...ne ustavljaj se',supersedes:'pause-request.json',originalGuardAbsent:true,next:'P06-B-001',priorRunRequiresEvaluation:id})
console.log(JSON.stringify({id,status:execution.status,elapsedSeconds:null,allowedChanges:execution.allowedChanges,submissionFrozen:true}))
