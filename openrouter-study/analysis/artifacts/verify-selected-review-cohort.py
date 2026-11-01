"""Read-only check that remaining repetitions do not replace selected001 reviews."""
from pathlib import Path
import hashlib
import json
import re

study = Path(__file__).resolve().parents[2]
root = study.parent
manifest = json.loads((study/'analysis/recovery/selected-review-cohort-complete180.json').read_text())
assert manifest['totalSelectedReviews'] == 120
assert manifest['newSelectedReviews'] == 72
assert len(manifest['records']) == 120
keys = set()
for item in manifest['records']:
    assert re.fullmatch(r'P(?:0[3-9]|10)-[ABC]-001', item['id'])
    key = (item['slug'], item['id'])
    assert key not in keys
    keys.add(key)
    path = root/item['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], 'Selected review changed; preserve snapshot and document any actual factual erratum: ' + item['file']
    review = json.loads(path.read_text())
    assert review['humanReview'] is None and review['interRaterAgreement'] is None
    assert {x['dimension']:x['score'] for x in review['dimensions']} == item['scores']
for slug in ['astra','luna','glm','deepseek','qwen']:
    for procedure in 'ABC':
        assert sum(s == slug and i.split('-')[1] == procedure for s, i in keys) == 8
print(json.dumps(dict(researcherOnly=True,passed=True,selectedReviews=120,newReviews=72,historicalReviews=48,sourceFilesChanged=False,selectionSubstituted=False)))
