"""Final audit: require both completed collections, traceable reviews and matching artifacts.
Run only after the queue ends and explicit visual inspection is recorded.
"""
import csv, hashlib, json, math, statistics, subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
s=Path(__file__).resolve().parent; a=s/'analysis'; root=s.parent
subprocess.run(['node', str(s/'verify.mjs')], cwd=root, check=True)
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rows=lambda p:list(csv.DictReader(p.open(newline='')))
presentation=read(a/'recovery/report-presentation-migration.json')
for entry in presentation['files']:
 assert sha(root/entry['path'])==entry['afterSha256'], 'Unreviewed reporting change: '+entry['path']
 before=subprocess.check_output(['git','show',presentation['baselineCommit']+':'+entry['path']],cwd=root)
 assert hashlib.sha256(before).hexdigest()==entry['beforeSha256']
original = subprocess.run(['git', 'diff', '--exit-code', presentation['baselineCommit'], '--', 'runs', 'main-study', 'scripts', 'tasks', 'evaluation', 'references', 'support', 'vendor', 'docs', 'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/rezultati-eksperimentov.xlsx', *[':(exclude)'+entry['path'] for entry in presentation['files']]], cwd=root, capture_output=True, text=True)
assert original.returncode == 0, 'Original Astra data or unreviewed bundle files changed'
l=read(a/'reporting-results.json'); raw=read(s/'runtime/main-study/analysis/results.json'); c=read(a/'comparison.json')
ast=read(root/'main-study/analysis/reporting-results.json')
schedule=read(s/'runtime/main-study/schedule.json')['runs']
assert l['complete'] and l['archived']==72 and c['complete'] and c['archived']==144
assert not(s/'runtime/main-study/runner.lock').exists()
assert read(s/'runtime/main-study/active.json')['stage']=='all_runs_archived'
assert l['data']==raw['data'], 'Reporting modified measured rows'
assert c['snapshots']=={'astra':ast['generatedAt'],'luna':l['generatedAt']}
assert {r['id'] for r in l['data']}=={r['id'] for r in schedule}
recovery=read(a/'recovery/path-migration-2026-09-27.json')
resumed=s/'runtime/runs'/recovery['nextUnstartedId']
assert recovery['recovery']['modelRetries']==0 and recovery['recovery']['frozenInputsVerified']
assert sha(resumed/'preflight-filesystem.json')==recovery['recovery']['preflightFilesystemSha256']
boundary=read(resumed/'preflight-filesystem.json')
assert len(boundary['filesystem'])==recovery['recovery']['filesystemChecksDenied']
assert all(entry['blocked'] for entry in boundary['filesystem'])
assert boundary['allowedReadWrite'] and boundary['protectedInfrastructure']
assert read(resumed/'execution.json')['startedAt']>=recovery['recovery']['modelStartedAt']
usage_recovery=read(a/'recovery/usage-resume-2026-09-28.json')
assert usage_recovery['repeatedMeasuredRuns']==0 and usage_recovery['frozenInputsVerified']
assert sha(s/'runtime/runs'/usage_recovery['lastId']/'archive-complete.json')==usage_recovery['archiveReceiptSha256']
assert sha(root/usage_recovery['serviceProbe'])==usage_recovery['serviceProbeSha256']
probe=read(root/usage_recovery['serviceProbe'])
assert probe['passed'] and probe['excludedFromMeasurements']
assert probe['model']=='gpt-6-luna' and probe['reasoningEffort']=='xhigh'
assert read(s/'runtime/runs'/usage_recovery['nextUnusedId']/'execution.json')['startedAt']>=usage_recovery['modelStartedAt']
pause=read(a/'recovery/pause-2026-09-29.json')
resume=read(a/'recovery/resume-2026-09-29.json')
assert pause['state']=='paused' and not pause['measuredModelInterrupted']
assert pause['repeatedMeasuredRuns']==0 and not pause['nextMeasuredRunStarted']
assert pause['archivedAfterPause']==resume['startingArchived']==62
paused_archive=s/'runtime/runs'/pause['currentId']
assert sha(paused_archive/'execution.json')==pause['executionSha256']
assert sha(paused_archive/'archive-complete.json')==pause['archiveReceiptSha256']
assert read(paused_archive/'execution.json')['status']=='completed'
assert resume['frozenInputsVerified'] and resume['preStartMeasuredExecutionAbsent']
assert not resume['inputsOrBudgetsChanged'] and not resume['startedIdsRepeated']
assert pause['nextUnusedId']==resume['nextUnusedId']==schedule[62]['id']
assert sha(root/resume['serviceProbe'])==resume['serviceProbeSha256']
resume_probe=read(root/resume['serviceProbe'])
assert resume_probe['passed'] and resume_probe['excludedFromMeasurements']
assert resume_probe['model']=='gpt-6-luna' and resume_probe['reasoningEffort']=='xhigh'
assert sha(s/'runtime/runs'/resume['nextUnusedId']/'preflight-filesystem.json')==resume['preflightFilesystemSha256']
assert pause['measuredFinishedAt']<resume['modelStartedAt']
for entry in schedule[62:]:
 assert read(s/'runtime/runs'/entry['id']/'execution.json')['startedAt']>=resume['modelStartedAt']
archive=read(a/'archive-verification.json'); assert archive['passed'] and archive['complete'] and archive['archived']==72
for r in archive['archives']:
 assert sha(s/'runtime/runs'/r['id']/'archive-complete.json')==r['archiveSha256']
environment_examples=read(a/'evidence/shared-git-environment.json')['examples']
assert {example['collection'] for example in environment_examples}=={'M/1.0','L/1.0'}
for example in environment_examples:
 assert sha(root/example['archivePath'])==example['archiveFileSha256']
 assert example['exitCode']==1 and example['errorLines']
catalog=read(a/'failure-catalog.json')
assert catalog['complete'] and catalog['archived']==72 and catalog['reportingSnapshot']==l['generatedAt']
catalog_by_id={entry['id']:entry for entry in catalog['entries']}
assert len(catalog_by_id)==len(catalog['entries'])==catalog['nonStrictCount']
assert set(catalog_by_id)=={r['id'] for r in l['data'] if not r['strictSuccess']}
assert catalog['testsWithoutPass']==sum(entry['testsWithoutPass'] for entry in catalog['entries'])
requirements=rows(a/'requirement-data.csv'); tests=rows(a/'test-data.csv'); phases=rows(a/'phase-data.csv'); runs=rows(a/'comparison-runs.csv')
assert len(requirements)==864 and len({(r['id'],r['requirement']) for r in requirements})==864
assert len(runs)==144 and len({(r['collection'],r['id']) for r in runs})==144
for collection,data in [('M/1.0',ast),('L/1.0',l)]:
 for r in data['data']:
  out=next(x for x in runs if x['collection']==collection and x['id']==r['id'])
  assert out['status']==r['executionStatus']
  assert int(out['requirementsPassed'])==r['score']['passed'] and int(out['requirementsObserved'])==r['score']['observed']
  assert int(out['strictSuccess'])==int(r['strictSuccess'])
  assert out['seconds']=='' if r['elapsedSeconds'] is None else math.isclose(float(out['seconds']),r['elapsedSeconds'])
  assert int(out['usageComplete'])==int(r['usageComplete'])
  for column,key in [('inputTokens','input_tokens'),('cachedInputTokens','cached_input_tokens'),('outputTokens','output_tokens'),('reasoningOutputTokens','reasoning_output_tokens')]:
   expected=(r['usage'] or {}).get(key)
   assert out[column]=='' if expected is None else int(out[column])==expected
  for column,key in [('observedInputLowerBound','input_tokens'),('observedOutputLowerBound','output_tokens')]:
   expected=(r.get('observedUsageBeforeInterruption') or {}).get(key)
   assert out[column]=='' if expected is None else int(out[column])==expected
  if collection=='M/1.0': continue
  req=[x for x in requirements if x['id']==r['id']]
  assert sum(int(x['demonstrated']) for x in req)==r['score']['passed'] and sum(int(x['observed']) for x in req)==r['score']['observed']
  assert {x['requirement'] for x in req}=={x['id'] for x in r['score']['requirements']}
  for source in r['score']['requirements']:
   exported=next(x for x in req if x['requirement']==source['id'])
   assert int(exported['observed'])==int(source['observed']) and int(exported['demonstrated'])==int(source['demonstrated'])
  summary=read(s/'runtime'/r['evidence'])
  if not r['strictSuccess']:
   entry=catalog_by_id[r['id']]
   for key in ['executionStatus','allowedChanges','completeTestRun','strictSuccess']:
    assert entry[key]==r[key]
   assert entry['requirements']==r['score']
   assert entry['testsRecorded']==len(summary['tests'])
   assert entry['testsExpected']==sum(test['status']=='expected' for test in summary['tests'])
   without_pass=[test for test in summary['tests'] if test['status']!='expected']
   assert entry['testsWithoutPass']==len(without_pass)
   assert sorted((group['title'],group['status'],project) for group in entry['scenariosWithoutPass'] for project in group['projects'])==sorted((test['title'],test['status'],test['project']) for test in without_pass)
   assert [(check['name'],check.get('exitCode')) for check in entry['failedChecks']]==[(check['name'],check.get('exitCode')) for check in summary['checks'] if not check['passed']]
  ts=[x for x in tests if x['id']==r['id']]
  assert len(ts)==len(summary['tests'])
  for out,source in zip(ts,summary['tests']):
   assert (out['project'],out['title'],out['status'],out['errors'])==(source['project'],source['title'],source['status'],'\n'.join(source['errors']))
  execution=read(s/'runtime/runs'/r['id']/'execution.json')
  ps=[x for x in phases if x['id']==r['id']]
  source_phases=execution.get('phases')
  if source_phases is None:
   source_phases=[dict(execution,name='single-session',role='agent',resumed=False)]
  assert len(ps)==len(source_phases)
  for index,(out,source) in enumerate(zip(ps,source_phases),1):
   assert int(out['position'])==index
   for column,key in [('phase','name'),('role','role'),('status','status'),('threadId','threadId')]:
    assert out[column]==str(source.get(key) or '')
   assert out['seconds']=='' if source.get('elapsedSeconds') is None else math.isclose(float(out['seconds']),source['elapsedSeconds'])
   for key in ['resumed','allowedChanges']:
    assert out[key]==('' if source.get(key) is None else str(source[key]).lower())
timing=read(a/'phase-timing.json')
assert timing['complete'] and timing['archived']==144 and timing['comparisonSnapshot']==c['generatedAt']
assert timing['snapshots']==c['snapshots']
assert len(timing['sources'])==144 and len({(r['collection'],r['id']) for r in timing['sources']})==144
for source in timing['sources']:
 assert sha(root/source['source'])==source['sha256']
 execution=read(root/source['source'])
 expected=execution.get('phases', [dict(execution,name='single-session')])
 recorded=[r for r in timing['records'] if r['collection']==source['collection'] and r['id']==source['id']]
 assert len(recorded)==len(expected)
 for index,(actual,phase) in enumerate(zip(recorded,expected),1):
  assert actual['position']==index and actual['source']==source['source']
  assert (actual['phase'],actual['status'],actual['seconds'])==(phase['name'],phase.get('status'),phase.get('elapsedSeconds'))
for group in timing['groups']:
 selected=[r for r in timing['records'] if (r['model'],r['procedure'],r['phase'])==(group['model'],group['procedure'],group['phase'])]
 values=[r['seconds'] for r in selected if r['seconds'] is not None]
 assert group['count']==len(selected) and group['known']==len(values) and group['missing']==len(selected)-len(values)
 assert group['medianKnownSeconds']==(statistics.median(values) if values else None)
 assert group['statuses']==dict(Counter(r['status'] or 'unknown' for r in selected))
assert sum(g['count'] for g in timing['groups'])==len(timing['records'])
assert len(timing['preparation'])==48
for prep in timing['preparation']:
 selected=[r for r in timing['records'] if r['collection']==prep['collection'] and r['id']==prep['id']]
 docs=[r for r in selected if r['phase'] in ['constitution','specify','plan','tasks']]
 expected=None
 if docs and all(r['seconds'] is not None for r in docs):
  # Match the reporting script's left-to-right JavaScript reduction exactly.
  # Python 3.12+ sum() compensates floats and can differ below 1e-12 seconds.
  expected=0
  for phase in docs: expected+=phase['seconds']
 assert prep['preparationSeconds']==expected and prep['preparationPhasesRecorded']==len(docs)
 for field,name in [('implementationStarted','implement'),('convergenceStarted','converge')]:
  assert prep[field]==any(r['phase']==name for r in selected)
 assert prep['initialImplementationCompleted']==any(r['phase']=='implement' and r['status']=='completed' for r in selected)
for group in timing['preparationSummary']:
 selected=[r for r in timing['preparation'] if r['model']==group['model']]
 values=[r['preparationSeconds'] for r in selected if r['preparationSeconds'] is not None]
 assert group['count']==24 and group['known']==len(values) and group['missing']==24-len(values)
 assert group['medianKnownSeconds']==(statistics.median(values) if values else None)
 for key in ['implementationStarted','initialImplementationCompleted','convergenceStarted']: assert group[key]==sum(r[key] for r in selected)
review=read(a/'review-verification.json')
assert review['reviewResolved']==24 and review['pending']==0 and not review['missingOrInvalid']
assert set(review['reviewFileSha256'])=={r['id']+'.json' for r in schedule if r['repetition']==1}
for name,digest in review['reviewFileSha256'].items(): assert sha(a/'reviews'/name)==digest
for contrast in c['contrasts']:
 ds=[d['difference'] for d in contrast['taskDifferences']]
 assert len(ds)==8 and contrast['resamples']==20000 and contrast['unit']=='task'
 assert math.isclose(contrast['meanDifference'],sum(ds)/8,abs_tol=1e-12)
 assert contrast['lower']<=contrast['upper']
assert len(c['contrasts'])+len(c['withheld'])==33
figures=read(a/'figures/provenance.json'); writing=read(a/'writing-snapshot.json')
assert figures['snapshots']==c['snapshots'] and figures['archived']==144 and figures['complete']
assert writing['comparisonSnapshot']==c['generatedAt'] and writing['complete']
assert writing['reviewVerificationSha256']==sha(a/'review-verification.json')
assert writing['phaseTimingSha256']==sha(a/'phase-timing.json')
navigation=read(a/'evidence-map-verification.json')
assert navigation['passed'] and navigation['archived']==72 and navigation['reportingSnapshot']==l['generatedAt']
qa=read(a/'workbook-verification.json')
assert qa['archived']==144 and qa['snapshots']==c['snapshots']
assert qa['formulasChecked'] and qa['perturbationRestored'] and qa['visuallyReviewed']
# Visual inspection is a separate researcher action, never inferred from successful rendering.
visual=read(a/'visual-verification.json')
assert visual['passed'] and visual['comparisonSnapshot']==c['generatedAt']
assert visual['pdfPagesInspected'] and visual['workbookPreviewsInspected'] and visual['figuresInspected']
pdf=root/'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/astra-luna-comparison.pdf'
xlsx=root/'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/primerjava-astra-luna.xlsx'
pdf_record=read(a/'pdf-verification.json')
assert pdf_record['comparisonSnapshot']==c['generatedAt'] and pdf_record['complete'] and pdf_record['archived']==144
assert pdf_record['sha256']==sha(pdf) and pdf_record['visuallyReviewed']
assert set(visual['pdfPagesInspected'])==set(range(1,pdf_record['pages']+1))
for source,digest in pdf_record['sources'].items(): assert sha(root/source)==digest
assert visual['pdfSha256']==sha(pdf) and visual['workbookSha256']==sha(xlsx)
assert set(visual['figureSha256'])=={'primerjava-zahtev.png','primerjava-casa.png','primerjava-porabe.png'}
for name,digest in visual['figureSha256'].items(): assert sha(a/'figures'/name)==digest
result={'verifiedAt':datetime.now(timezone.utc).isoformat(),'collection':'L/1.0','archived':72,'combinedArchived':144,'strictSuccesses':sum(r['strictSuccess'] for r in l['data']),'requirements':len(requirements),'tests':len(tests),'phases':len(phases),'reviewsResolved':24,'contrasts':len(c['contrasts']),'withheld':len(c['withheld']),'snapshots':c['snapshots'],'comparisonSnapshot':c['generatedAt'],'passed':True,'artifacts':{str(pdf):sha(pdf),str(xlsx):sha(xlsx)}}
(a/'final-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
