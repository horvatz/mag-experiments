"""Researcher-only continuation state; never launches models or grades evidence."""
import datetime
import hashlib
import json
import re
from pathlib import Path

study = Path(__file__).resolve().parents[2]
handoff = study.parent.parent / 'naloga/notes/experiment-handoff.md'
read = lambda p: json.loads(p.read_text())
status = read(study / 'status.json')
models = read(study / 'models.json')['models']
schedule = read(study / models[0]['slug'] / 'runtime/main-study/schedule.json')['runs']
jobs = [(models[(i + o) % len(models)]['slug'], row['id'])
        for i, row in enumerate(schedule) for o in range(len(models))]
assert len(jobs) == status['planned'] == 216
counts = {m['slug']: len(list((study / m['slug'] / 'runtime/runs').glob('*/archive-complete.json'))) for m in models}
assert sum(counts.values()) == status['archived']
assert all(counts[m['slug']] == m['archived'] for m in status['models'])
reviews = []
reviewed_keys = set()
for m in models:
    for p in (study / m['slug'] / 'analysis/reviews').glob('P??-?-001.json'):
        r = read(p)
        assert r['id'] == p.stem and re.fullmatch(r'P(?:0[3-9]|10)-[ABC]-001', r['id']) and len(r['dimensions']) == 5
        reviews.append(r)
        reviewed_keys.add((m['slug'], r['id']))
active = read(study / 'active.json')
lock = study / 'runner.lock'
owner = lock.read_text().strip() if lock.exists() else None
at = datetime.datetime.now(datetime.timezone.utc).isoformat()
parts = handoff.read_text().split('\n\n')
assert parts[1].startswith('Aktivno nadaljevanje, stanje ob ') and 'Nov premor ni zahtevan.' in parts[1], 'Preserve explicit user pause instructions'
parts[1] = re.sub(r'stanje ob .*?\. Uporabnik', 'stanje ob ' + at + '. Uporabnik', parts[1], count=1)
assert parts[3].startswith('Arhiviranih je **')
parts[3] = (f"Arhiviranih je **{status['archived']}/216 novih meritev**, opravljenih pa **{len(reviews)}/72 novih presoj**. "
            f"Skupaj z zgodovinskima Astro in Luno je to {144 + status['archived']}/360 arhivov in {48 + len(reviews)}/120 presoj. "
            + ', '.join(f"{m['slug']} {counts[m['slug']]}" for m in models)
            + ' arhivov. Nobena začeta meritev se ne ponavlja ali zamenjuje zaradi izida. M/1.0, L/1.0, zamrznjeni raziskovalni vhodi in arhivirane oddaje ostanejo nespremenjeni.')
assert parts[4].startswith(('Aktivna je ', 'Zadnja meritev ', 'Izvajalec pripravlja ', 'Merjena izvedba ', 'Vrsta '))
execution = None
if active.get('slug') and active.get('id'):
    base = study / active['slug'] / 'runtime'
    f = base / '.work/pilots' / active['id'] / 'execution.json'
    archived = (base / 'runs' / active['id'] / 'archive-complete.json').exists()
    if f.exists(): execution = read(f)
    ident = f"{active.get('position')} {active['slug']}/{active['id']}"
    if not archived and execution:
        parts[4] = (f"Merjena izvedba **{ident}**: status `{execution['status']}`, prvi merjeni začetek {execution['startedAt']}. "
                    f"Faza izvajalca je `{active['stage']}`. Ne ponavljaj je.")
    elif not archived:
        parts[4] = f"Izvajalec pripravlja **{ident}**, faza `{active['stage']}`. Execution metapodatkov še ni; ne razglasi priprave za že začeto meritev."
    else:
        parts[4] = f"Zadnja meritev **{ident}** je arhivirana. Faza izvajalca je `{active['stage']}`. "
        if status['archived'] < len(jobs):
            slug, id = jobs[status['archived']]
            nextfile = study / slug / 'runtime/.work/pilots' / id / 'execution.json'
            parts[4] += f"Naslednja je **{status['archived'] + 1} {slug}/{id}**; execution metapodatki {'so že prisotni' if nextfile.exists() else 'še niso prisotni'}. "
        parts[4] += 'Preveri poravnavo računov ali razlog ustavitve, preden ukrepaš.'
else:
    parts[4] = f"Vrsta ima fazo `{active['stage']}`; pred ukrepanjem preveri izvirno stanje."
if not owner: parts[4] += ' Runner lock trenutno ni prisoten; to samo po sebi ni uporabnikov premor.'
assert parts[6].startswith(('Polni delni pregled ', 'Zadnji polni delni pregled '))
audit = read(study / 'analysis/evidence-audit.json')
budget = read(study / 'analysis/budget-amendment-audit.json')
assert audit['passed'] and budget['passed']
parts[6] = (f"Zadnji polni delni pregled ob {audit['at']} je uspel za {audit['archives']} arhivov in {audit['reviews']} presoj. "
            f"Manjkajoče izbrane presoje med takrat arhiviranimi: {len(audit['missingSelectedReviews'])}. "
            f"Zadnji budget audit ob {budget['at']} je preveril {budget['originalRuns']} izvirnih in {budget['amendedRuns']} dopolnjenih meritev ter {budget['amendedSentRequests']} novih poslanih zahtev. "
            'Dokaza sta `analysis/evidence-audit.json` in `analysis/budget-amendment-audit.json`; številke so njuna posnetka, ne trditev o še nepreverjenih poznejših meritvah.')
pending = [(i + 1, slug, id) for i, (slug, id) in enumerate(jobs)
           if id.endswith('-001') and (slug, id) not in reviewed_keys]
groups = []
for position, slug, id in pending:
    task = id.split('-')[0]
    if groups and groups[-1][2] == task and groups[-1][1] + 1 == position:
        groups[-1][1] = position
    else:
        groups.append([position, position, task])
summary = ', '.join((str(a) if a == b else f'{a}–{b}') + ' ' + task for a, b, task in groups)
indices = [i for i, paragraph in enumerate(parts) if paragraph.startswith('Preostale vnaprej izbrane vsebinske presoje so ')]
assert len(indices) == 1
index = indices[0]
suffix = parts[index][parts[index].index(' Pred vsako presojo'):]
parts[index] = f'Preostale vnaprej izbrane vsebinske presoje so **{summary or "nobena"}**, skupaj {len(pending)}.' + suffix
text = '\n\n'.join(parts)
assert not re.search(r'\{\{[^}]+\}\}', text)
tmp = handoff.with_suffix('.md.tmp')
tmp.write_text(text)
tmp.replace(handoff)
observation = dict(at=at, researcherOnly=True, archived=status['archived'], newReviews=len(reviews), modelCounts=counts,
                   runnerLockOwner=owner, active=active, executionStatus=execution.get('status') if execution else None,
                   handoffSHA256=hashlib.sha256(handoff.read_bytes()).hexdigest(), measuredInputsChanged=False, newOrdinalGradesWritten=False, pendingSelectedReviews=[dict(position=i, slug=slug, id=id) for i, slug, id in pending])
(study / 'analysis/recovery/handoff-current-observation.json').write_text(json.dumps(observation, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(archived=status['archived'], newReviews=len(reviews), activePosition=active.get('position'), activeStage=active['stage'], runnerLockOwner=owner)))
