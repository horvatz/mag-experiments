"""Prepare a secret-checked Git checkpoint. Does not commit, push, run models or grade."""
import argparse
import base64
import datetime
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('checkpoint', type=int)
parser.add_argument('--qa', type=int, required=True)
args = parser.parse_args()
study = Path(__file__).resolve().parents[2]
experiments = study.parent
naloga = experiments.parent / 'naloga'
read = lambda p: json.loads(p.read_text())
def git(repo, *arguments):
    return subprocess.check_output(['git', *arguments], cwd=repo)
for repo, branch in [(experiments, 'zan/openrouter-experiments'), (naloga, 'zan/openrouter-progress-2026-10-14')]:
    assert git(repo, 'branch', '--show-current').decode().strip() == branch and branch.count('zan/') == 1
models = read(study / 'models.json')['models']
schedule = read(study / models[0]['slug'] / 'runtime/main-study/schedule.json')['runs']
jobs = [(models[(i + offset) % len(models)]['slug'], row['id']) for i, row in enumerate(schedule) for offset in range(len(models))]
assert 0 < args.checkpoint <= len(jobs) == 216
completed = set(jobs[:args.checkpoint])
for slug, id in completed:
    assert (study / slug / 'runtime/runs' / id / 'archive-complete.json').exists(), (slug, id)
status = read(study / 'status.json')
paused = read(study / 'active.json').get('stage') == 'paused_by_user'
if paused:
    pause = read(study / 'paused.json')
    assert pause['stage'] == 'paused_by_user' and pause['archived'] == args.checkpoint
    assert not (study / 'runner.lock').exists()
audit = read(study / 'analysis/evidence-audit.json')
budget = read(study / 'analysis/budget-amendment-audit.json')
assert status['archived'] == args.checkpoint
assert audit['passed'] and audit['archives'] == args.checkpoint + 144 and not audit['missingSelectedReviews']
assert budget['passed'] and budget['originalRuns'] + budget['amendedRuns'] == args.checkpoint
qa_dir = study / 'analysis/artifacts/qa'
qa_file = qa_dir / f'checkpoint{args.qa}-qa.json'
qa = read(qa_file)
assert qa['newArchived'] == args.qa <= args.checkpoint and qa['previewOnly']
bundle = [qa_file]
for record in qa['files']:
    path = qa_dir / record['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == record['sha256']
    bundle.append(path)
assert len(bundle) == 22
next_job = jobs[args.checkpoint] if args.checkpoint < len(jobs) else None
record = dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(), newArchived=args.checkpoint,
              newReviews=audit['reviews'] - 48, allArchives=audit['archives'], allReviews=audit['reviews'],
              archiveAuditPassed=True, budgetAuditAmendedRuns=budget['amendedRuns'],
              budgetAuditAmendedRequests=budget['amendedSentRequests'], latestFullyReviewedArtifactCheckpoint=args.qa,
              paused=paused, nextScheduled=dict(position=args.checkpoint + 1, slug=next_job[0], id=next_job[1]) if next_job else None,
              backupScope='Completed measurements through checkpoint and researcher analyses. Later IDs, live active.json and locks excluded. QA is preserved preview, not final export.')
(study / f'analysis/recovery/github-checkpoint{args.checkpoint}.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
files = git(experiments, 'ls-files', '--modified', '--others', '--exclude-standard', '-z', '--', 'openrouter-study').decode().split('\0')
keep = []
for path in filter(None, files):
    if path == 'openrouter-study/active.json' or path.endswith('.lock'):
        continue
    model = re.match(r'openrouter-study/(glm|deepseek|qwen)/', path)
    ids = re.findall(r'P(?:0[3-9]|10)-[ABC]-\d{3}', path)
    if model and ids and not all((model[1], id) in completed for id in ids):
        continue
    keep.append(path)
for i in range(0, len(keep), 100):
    subprocess.run(['git', 'add', '-A', '--', *keep[i:i+100]], cwd=experiments, check=True)
subprocess.run(['git', 'add', '-f', '--', *[str(p.relative_to(experiments)) for p in bundle]], cwd=experiments, check=True)
subprocess.run(['git', 'add', '--', 'notes/experiment-handoff.md'], cwd=naloga, check=True)
key = (experiments / '.work/secrets/openrouter.key').read_bytes().strip()
assert key
secret_forms = [key, base64.b64encode(key)]
pattern = re.compile(rb'sk-or-v1-[a-zA-Z0-9]{20,}|-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----|gh[pousr]_[a-zA-Z0-9]{20,}')
for repo in [experiments, naloga]:
    staged = list(filter(None, git(repo, 'diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z').decode().split('\0')))
    if repo == experiments:
        assert all(path.startswith('openrouter-study/') for path in staged), 'Unrelated staged researcher work needs separate handling'
        for path in staged:
            assert path != 'openrouter-study/active.json' and not path.endswith('.lock'), 'Live state must not be staged'
            model = re.match(r'openrouter-study/(glm|deepseek|qwen)/', path)
            ids = re.findall(r'P(?:0[3-9]|10)-[ABC]-\d{3}', path)
            assert not (model and ids) or all((model[1], id) in completed for id in ids), 'Unfinished or later measurement staged'
    else:
        assert all(path == 'notes/experiment-handoff.md' for path in staged), 'Unrelated staged thesis work needs separate handling'
    for path in staged:
        data = git(repo, 'show', ':' + path)
        if path.endswith('.gz'):
            data = gzip.decompress(data)
        assert not any(value in data for value in secret_forms) and not pattern.search(data), 'Secret scan failed: ' + path
    print(json.dumps(dict(repository=repo.name, stagedFiles=len(staged), secretScanPassed=True)))
print(json.dumps(dict(checkpoint=args.checkpoint, newReviews=record['newReviews'], qa=args.qa, verifiedQAFiles=len(bundle), nextExcluded=record['nextScheduled'])))
