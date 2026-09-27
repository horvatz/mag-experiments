"""Final audit: require both completed collections, traceable reviews and matching artifacts.
Run only after the queue ends and explicit visual inspection is recorded.
"""
import csv, hashlib, json, math, subprocess
from datetime import datetime, timezone
from pathlib import Path
s=Path(__file__).resolve().parent; a=s/'analysis'; root=s.parent
subprocess.run(['node', str(s/'verify.mjs')], cwd=root, check=True)
original = subprocess.run(['git', 'diff', '--exit-code', '677b4dd764a0db4aed3acae6d4f411f8ab35da6a', '--', 'runs', 'main-study', 'scripts', 'tasks', 'evaluation', 'references', 'support', 'vendor', 'docs', 'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/rezultati-eksperimentov.xlsx'], cwd=root, capture_output=True, text=True)
assert original.returncode == 0, 'Original Astra bundle changed since its verified checkpoint'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rows=lambda p:list(csv.DictReader(p.open(newline='')))
l=read(a/'reporting-results.json'); raw=read(s/'runtime/main-study/analysis/results.json'); c=read(a/'comparison.json')
ast=read(root/'main-study/analysis/reporting-results.json')
schedule=read(s/'runtime/main-study/schedule.json')['runs']
assert l['complete'] and l['archived']==72 and c['complete'] and c['archived']==144
assert not(s/'runtime/main-study/runner.lock').exists()
assert read(s/'runtime/main-study/active.json')['stage']=='all_runs_archived'
assert l['data']==raw['data'], 'Reporting modified measured rows'
assert c['snapshots']=={'astra':ast['generatedAt'],'luna':l['generatedAt']}
assert {r['id'] for r in l['data']}=={r['id'] for r in schedule}
archive=read(a/'archive-verification.json'); assert archive['passed'] and archive['complete'] and archive['archived']==72
for r in archive['archives']:
 assert sha(s/'runtime/runs'/r['id']/'archive-complete.json')==r['archiveSha256']
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
  if not r['usageComplete']: assert out['inputTokens']==out['outputTokens']==''
  if collection=='M/1.0': continue
  req=[x for x in requirements if x['id']==r['id']]
  assert sum(int(x['demonstrated']) for x in req)==r['score']['passed'] and sum(int(x['observed']) for x in req)==r['score']['observed']
  summary=read(s/'runtime'/r['evidence'])
  ts=[x for x in tests if x['id']==r['id']]
  assert len(ts)==len(summary['tests'])
  for out,source in zip(ts,summary['tests']):
   assert (out['project'],out['title'],out['status'],out['errors'])==(source['project'],source['title'],source['status'],'\n'.join(source['errors']))
  assert any(x['id']==r['id'] for x in phases)
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
qa=read(a/'workbook-verification.json')
assert qa['archived']==144 and qa['snapshots']==c['snapshots']
assert qa['formulasChecked'] and qa['perturbationRestored'] and qa['visuallyReviewed']
# Visual inspection is a separate researcher action, never inferred from successful rendering.
visual=read(a/'visual-verification.json')
assert visual['passed'] and visual['comparisonSnapshot']==c['generatedAt']
assert visual['pdfPagesInspected'] and visual['workbookPreviewsInspected'] and visual['figuresInspected']
pdf=root.parent/'naloga/latex/magistrska.pdf'
xlsx=root/'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/primerjava-astra-luna.xlsx'
assert visual['pdfSha256']==sha(pdf) and visual['workbookSha256']==sha(xlsx)
for name,digest in visual['figureSha256'].items(): assert sha(a/'figures'/name)==digest
result={'verifiedAt':datetime.now(timezone.utc).isoformat(),'collection':'L/1.0','archived':72,'combinedArchived':144,'strictSuccesses':sum(r['strictSuccess'] for r in l['data']),'requirements':len(requirements),'tests':len(tests),'phases':len(phases),'reviewsResolved':24,'contrasts':len(c['contrasts']),'withheld':len(c['withheld']),'snapshots':c['snapshots'],'comparisonSnapshot':c['generatedAt'],'passed':True,'artifacts':{str(pdf):sha(pdf),str(xlsx):sha(xlsx)}}
(a/'final-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
