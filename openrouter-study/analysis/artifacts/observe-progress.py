import json,datetime,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
runner_pid=(root/'runner.lock').read_text().strip() if (root/'runner.lock').exists() else 'absent'
print('runnerlock',runner_pid)
a=json.loads((root/'active.json').read_text());s=json.loads((root/'status.json').read_text());print('archived',s['archived'],'active',a.get('position'),a.get('slug'),a.get('id'),a.get('stage'),a.get('at'))
if runner_pid!='absent' and str(a.get('pid'))!=runner_pid:print('active record belongs to previous runner',a.get('pid'),'; current runner is still verifying archived inputs or reconciling costs')
if a.get('id'):
 archived_current=(root/a['slug']/'runtime/runs'/a['id']/'archive-complete.json').exists()
 if archived_current:
  print('active ID is already archived; runner may be reconciling costs before the next ID' if runner_pid!='absent' else 'queue inactive with archived last ID; inspect stop stage and recovery before any continuation')
  models=json.loads((root/'models.json').read_text())['models'];schedule=json.loads((root/models[0]['slug']/'runtime/main-study/schedule.json').read_text())['runs']
  jobs=[(models[(i+o)%len(models)]['slug'],entry['id']) for i,entry in enumerate(schedule) for o in range(len(models))]
  n=s['archived']
  if n<len(jobs):
   slug,id=jobs[n];print('next scheduled',n+1,slug,id,'executionExists',(root/slug/'runtime/.work/pilots'/id/'execution.json').exists())
  sys.exit(0)
 p=root/a['slug']/'runtime/.work/pilots'/a['id']
 f=p/'execution.json'
 if f.exists():
  d=json.loads(f.read_text());print('execution',d.get('status'),d.get('elapsedSeconds'),'runningWallSeconds',round((datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(d['startedAt'].replace('Z','+00:00'))).total_seconds()) if d.get('status')=='running' else None,'phases',[(x['name'],x['status'],x.get('elapsedSeconds')) for x in d.get('phases',[])])
  events=sorted(p.glob('phases/*/events.jsonl'))
  if not events and (p/'events.jsonl').exists():events=[p/'events.jsonl']
  if events:
   lines=events[-1].read_text().splitlines();x=json.loads(lines[-1]) if lines else {};i=x.get('item',{});print('events',len(lines),'last',x.get('type'),i.get('id'),i.get('type'),'exit',i.get('exit_code'),str(i.get('command',i.get('text','')))[:180])
