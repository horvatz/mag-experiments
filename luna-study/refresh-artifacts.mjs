// Independent reporting companion. Does not launch models, change inputs, or access live submissions.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url)), root = resolve(study,'..')
const read = p => JSON.parse(readFileSync(p))
const bundledNode = '/Users/zan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
const plotPython = resolve(root,'main-study/analysis/artifacts/plotenv/bin/python')
let previous = null
function run(executable,args,cwd=root,env=process.env) {
 const result=spawnSync(executable,args,{cwd,env,encoding:'utf8',maxBuffer:8*1024*1024})
 if(result.status!==0) throw new Error(`${args.join(' ')} failed: ${result.stderr}\n${result.stdout}`)
 return result.stdout.trim()
}
for (;;) {
 const comparison=read(resolve(study,'analysis/comparison.json'))
 if(comparison.generatedAt!==previous) {
  try {
   run(process.execPath,[resolve(study,'export-data.mjs')])
   run('python3',[resolve(study,'review-data.py')])
   run(plotPython,[resolve(study,'analysis/artifacts/plots.py')],root,{...process.env,MPLCONFIGDIR:resolve(study,'analysis/artifacts/qa/matplotlib')})
   run(bundledNode,[resolve(study,'analysis/artifacts/workbook.mjs')])
   run(process.execPath,[resolve(study,'prepare-writing.mjs')])
   const pdf=spawnSync('bash',['scripts/build.sh','pdf'],{cwd:resolve(root,'../naloga/latex'),encoding:'utf8',maxBuffer:8*1024*1024})
   writeFileSync(resolve(root,'../naloga/latex/build/luna-working-build.log'),pdf.stdout+'\n'+pdf.stderr)
   if(pdf.status!==0) throw Error('PDF build failed; see luna-working-build.log')
   run('bash',['scripts/check.sh'],resolve(root,'../naloga/latex'))
   const latest=read(resolve(study,'analysis/comparison.json'))
   if(latest.generatedAt!==comparison.generatedAt) continue
   previous=comparison.generatedAt
   const receipt={refreshedAt:new Date().toISOString(),comparisonSnapshot:previous,archived:comparison.archived,complete:comparison.complete,visualReviewRequired:true}
   writeFileSync(resolve(study,'analysis/artifacts-refresh.json'),JSON.stringify(receipt,null,2)+'\n')
   console.log(JSON.stringify(receipt))
  } catch(error) {
   const failure={at:new Date().toISOString(),error:error.message,affects:'reporting only; measured queue untouched'}
   writeFileSync(resolve(study,'analysis/artifacts-refresh-error.json'),JSON.stringify(failure,null,2)+'\n')
   console.error(JSON.stringify(failure));process.exitCode=1;break
  }
 }
 const active=read(resolve(study,'runtime/main-study/active.json'))
 if(!existsSync(resolve(study,'runtime/main-study/runner.lock'))) {
  console.log(JSON.stringify({reportingCompanionStopped:true,active}));break
 }
 if(process.argv.includes('--once')) break
 await new Promise(resolve=>setTimeout(resolve,30000))
}
