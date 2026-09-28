"""Export researcher-entered rubric reviews and validate every evidence target.
No grades are inferred from test outcomes, artifact presence, or other runs.
"""
import csv
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
STUDY = Path(__file__).resolve().parent
OUT = STUDY / 'analysis'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
schedule = read(STUDY / 'runtime/main-study/schedule.json')['runs']
selected = [r for r in schedule if r['repetition'] == 1]
keys = ['specificationCoverage', 'predicatesInvariants', 'traceability', 'codeOrganization', 'ownChecks']
labels = ['Pokritost specifikacije', 'Predikati in invariante', 'Sledljivost', 'Organizacija kode', 'Lastna preverjanja']
reviews, references, fragments, checksums = [], [], [], {}

def evidence(target):
    path, _, fragment = target.partition('#')
    match = re.search(r':(\d+)$', path)
    number = int(match[1]) if match else None
    if match: path = path[:match.start()]
    file = (STUDY / path).resolve()
    assert file.is_relative_to(STUDY), ('Evidence outside collection', target)
    assert file.is_file(), ('Missing evidence', target)
    if number:
        assert 1 <= number <= len(file.read_text().splitlines()), ('Invalid line', target)
    if fragment:
        headers = re.findall(r'^#{1,6}\s+(.+?)\s*#*$', file.read_text(), re.M)
        slugs = [re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in headers]
        assert fragment in slugs, ('Invalid heading', target, slugs)
        fragments.append(target)
    references.append(target)

for run in selected:
    p = OUT / 'reviews' / (run['id'] + '.json')
    if not p.exists(): continue
    r = read(p)
    assert r['collection'] == 'L/1.0' and r['id'] == run['id']
    assert r['method'] == 'AI-podprta, neslepa vsebinska presoja'
    assert r['humanReview'] is None and r['interRaterAgreement'] is None
    assert [d['dimension'] for d in r['dimensions']] == keys
    assert r['archiveReceiptSha256'] == sha(STUDY/'runtime/runs'/run['id']/'archive-complete.json')
    status = r.get('reviewStatus', 'rated')
    assert status in ['rated', 'partial', 'unavailable']
    if status == 'unavailable': assert len(r['unavailableReason']) > 40
    if status == 'partial':
        assert len(r['partialReason']) > 40
        assert any(d['score'] is None for d in r['dimensions']) and any(d['score'] is not None for d in r['dimensions'])
    for d in r['dimensions']:
        if status == 'unavailable': assert d['score'] is None
        elif status == 'partial' and d['score'] is None: assert len(d['missingReason']) > 40
        else: assert d['score'] in [0, 1, 2]
        assert len(d['rationale']) > 40 and d['evidence']
        for target in d['evidence']: evidence(target)
    for key in ['finalFailureExample', 'developmentFailureExample']:
        if r.get(key):
            assert r[key]['description'] and r[key]['evidence']
            for target in r[key]['evidence']: evidence(target)
    reviews.append(r)
    checksums[p.name] = sha(p)
assert set(p.stem for p in (OUT/'reviews').glob('*.json')) <= {r['id'] for r in selected}
rated = [r for r in reviews if r.get('reviewStatus', 'rated') == 'rated']
partial = [r for r in reviews if r.get('reviewStatus') == 'partial']
unavailable = [r for r in reviews if r.get('reviewStatus') == 'unavailable']
groups = []
for procedure in ['A', 'B', 'C']:
    rs = [r for r in rated if r['id'].split('-')[1] == procedure]
    ps = [r for r in partial if r['id'].split('-')[1] == procedure]
    us = [r for r in unavailable if r['id'].split('-')[1] == procedure]
    groups.append({'procedure': procedure, 'planned': 8, 'rated': len(rs), 'partial':len(ps), 'unavailable': len(us), 'pending': 8-len(rs)-len(ps)-len(us),
                   'dimensions': [{'dimension': key, 'counts': [sum(next(d for d in r['dimensions'] if d['dimension'] == key)['score'] == score for r in rs+ps) for score in [0,1,2]], 'missing':len(us)+sum(next(d for d in r['dimensions'] if d['dimension']==key)['score'] is None for r in ps)} for key in keys]})
with (OUT/'review-data.csv').open('w', newline='') as f:
    w=csv.writer(f,lineterminator='\n'); w.writerow(['collection','id','task','procedure','status',*keys,'humanReview','interRaterAgreement','evidence'])
    for run in selected:
        r=next((r for r in reviews if r['id']==run['id']),None)
        w.writerow(['L/1.0',run['id'],run['task'],run['procedure'],r.get('reviewStatus','rated') if r else 'pending',*([d['score'] for d in r['dimensions']] if r else ['']*5),None,None,'analysis/reviews/'+run['id']+'.json' if r else ''])
lines=['# Vsebinska presoja L/1.0','',f'Obravnavanih {len(reviews)}/24: {len(rated)} v celoti ocenjenih, {len(partial)} delno ocenjenih, {len(unavailable)} neocenljivih. Preostalih presoj: {24-len(reviews)}.','',
       'AI-podprta, neslepa vsebinska presoja. Vnaprej izbrane ponovitve 001; neodvisne človeške ocene in medocenjevalsko soglasje niso izmerjeni. Pet ordinalnih dimenzij ostane ločenih.','',
       '| Oddaja | Status | Specifikacija | Predikati | Sledljivost | Koda | Lastni testi |','| --- | --- | --- | --- | --- | --- | --- |']
for r in reviews: lines.append(f"| [{r['id']}](reviews/{r['id']}.json) | {r.get('reviewStatus','rated')} | " + ' | '.join(str(d['score']) if d['score'] is not None else '—' for d in r['dimensions'])+' |')
lines += ['', 'Trojice v nadaljevanju so števila ocen 0 / 1 / 2. Manjkajoče in še neobravnavane ocene niso ničle.','', '| Dimenzija | A | B | C |','| --- | --- | --- | --- |']
for i,label in enumerate(labels): lines.append('| '+label+' | '+' | '.join(' / '.join(map(str,g['dimensions'][i]['counts'])) for g in groups)+' |')
lines += ['', 'Manjkajoče ocene med že obravnavanimi oddajami (še čakajoče presoje so izključene):','', '| Dimenzija | A | B | C |','| --- | --- | --- | --- |']
for i,label in enumerate(labels): lines.append('| '+label+' | '+' | '.join(str(g['dimensions'][i]['missing']) for g in groups)+' |')
for r in reviews:
    lines += ['', '## '+r['id'], '']
    for label,d in zip(labels,r['dimensions']):
        lines += [f"**{label}: {d['score'] if d['score'] is not None else 'manjkajoče'}.** {d['rationale']}",'','Dokazi: '+', '.join('['+target.split('/')[-1]+'](../'+re.sub(r':(\d+)$',r'#L\1',target)+')' for target in d['evidence'])+'.','']
    lines += [r.get('finalFailureNote','')]
    if r.get('developmentFailureExample'): lines += ['',r['developmentFailureExample']['description']]
(OUT/'content-review.md').write_text('\n'.join(lines)+'\n')
result={'verifiedAt':datetime.now(timezone.utc).isoformat(),'collection':'L/1.0','reviewPlanned':24,'reviewResolved':len(reviews),'rated':len(rated),'partial':len(partial),'unavailable':len(unavailable),'pending':24-len(reviews),'groups':groups,'reviewFileSha256':checksums,'evidenceReferences':len(references),'headingFragments':len(fragments),'missingOrInvalid':[],'evidenceRoot':str(STUDY)}
(OUT/'review-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['reviewResolved','rated','partial','unavailable','pending','evidenceReferences','headingFragments']}))
