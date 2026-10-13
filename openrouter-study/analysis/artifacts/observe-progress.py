import json,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[2]
a=json.loads((root/'active.json').read_text());s=json.loads((root/'status.json').read_text());print('archived',s['archived'],'active',a.get('position'),a.get('slug'),a.get('id'),a.get('stage'),a.get('at'))
if a.get('id'):
 p=root/a['slug']/'runtime/.work/pilots'/a['id']
 f=p/'execution.json'
 if f.exists():
  d=json.loads(f.read_text());print('execution',d.get('status'),d.get('elapsedSeconds'),'wallSeconds',round((datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(d['startedAt'].replace('Z','+00:00'))).total_seconds()),'phases',[(x['name'],x['status'],x.get('elapsedSeconds')) for x in d.get('phases',[])])
  events=sorted(p.glob('phases/*/events.jsonl'))
  if not events and (p/'events.jsonl').exists():events=[p/'events.jsonl']
  if events:
   lines=events[-1].read_text().splitlines();x=json.loads(lines[-1]);i=x.get('item',{});print('events',len(lines),'last',x.get('type'),i.get('id'),i.get('type'),'exit',i.get('exit_code'),str(i.get('command',i.get('text','')))[:180])
