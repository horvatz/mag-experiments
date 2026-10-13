import json,hashlib,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'analysis/recovery/nonselected-runs-after-checkpoint81.json'
proof=json.loads(p.read_text());known={(x['slug'],x['id']) for x in proof['runs']}
models=json.loads((root/'models.json').read_text())['models']
schedule=json.loads((root/models[0]['slug']/'runtime/main-study/schedule.json').read_text())['runs']
for i,entry in enumerate(schedule):
 for o in range(len(models)):
  slug=models[(i+o)%len(models)]['slug'];id=entry['id'];position=i*len(models)+o+1
  if position<=81 or id.endswith('001') or (slug,id) in known:continue
  archive=root/slug/'runtime/runs'/id;marker=archive/'archive-complete.json'
  if not marker.exists():continue
  analysis=json.loads((root/slug/'runtime/main-study/analysis/results.json').read_text())
  rows=[x for x in analysis['data'] if x['id']==id]
  if not rows:continue
  row=rows[0];cost=json.loads((archive/'api-cost.json').read_text())
  record={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'position':position,'slug':slug,'id':id,'executionStatus':row['executionStatus'],'elapsedSeconds':row.get('elapsedSeconds'),'strictSuccess':row['strictSuccess'],'demonstrated':row['score']['passed'],'requirementsPassed':row['score']['passed'],'functionalTestsPassed':sum(g['passed'] for g in row['groups'].values()),'functionalTestsTotal':sum(g['total'] for g in row['groups'].values()),'groups':row['groups'],'checks':row['checks'],'allowedChanges':row['allowedChanges'],'completeTestRun':row['completeTestRun'],'phases':row.get('phases',[]),'costComplete':cost['complete'],'costUSD':cost.get('costUSD'),'knownCostUSD':cost.get('knownCostUSD'),'apiRequests':len(cost['requests']),'archiveSha256':hashlib.sha256(marker.read_bytes()).hexdigest()}
  proof['runs'].append(record);print(json.dumps(record))
proof['runs'].sort(key=lambda x:x['position'])
p.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
