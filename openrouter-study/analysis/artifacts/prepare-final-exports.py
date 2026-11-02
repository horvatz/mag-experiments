"""Stage only the final, actually verified exports; never commit or push.

Run prepare-checkpoint.py for the completed 216-run cutoff first. This separate
step adds two exact output paths, then scans the entire staged experiment tree,
including compressed requests, workbook XML and extracted PDF text.
"""
import base64
import gzip
import hashlib
import io
import json
import re
import subprocess
import zipfile
from pathlib import Path

from pypdf import PdfReader

STUDY = Path(__file__).resolve().parents[2]
ROOT = STUDY.parent
OUTPUT = Path('outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b')
EXPORTS = [OUTPUT / ('primerjava-modelov.' + ext) for ext in ('pdf', 'xlsx')]


def read(path):
    return json.loads(path.read_text())


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    assert not (STUDY / 'runner.lock').exists()
    assert read(STUDY / 'status.json')['archived'] == 216
    assert read(STUDY / 'analysis/comparison.json')['complete']
    audit = read(STUDY / 'analysis/evidence-audit.json')
    assert audit['passed'] and audit['archives'] == 360 and audit['reviews'] == 120
    assert not audit['missingSelectedReviews']
    budget = read(STUDY / 'analysis/budget-amendment-audit.json')
    assert budget['passed'] and budget['originalRuns'] + budget['amendedRuns'] == 216
    quality = read(STUDY / 'analysis/final-quality-verification.json')
    assert quality['passed'] and quality['pdfPagesViewed'] == quality['pdfPages']
    assert quality['pdfPages'] > 0 and quality['workbookSheetsVerified'] == 5
    assert quality['pdfLinks'] == 6 and quality['formulaErrors'] == 0
    assert quality['humanReview'] is None and quality['interRaterAgreement'] is None
    sources = {p['path']: p['sha256'] for p in quality['exports']}
    for path in EXPORTS:
        assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == sources[str(path)]
    for name in ('report.py', 'workbook.mjs'):
        assert hashlib.sha256((STUDY / 'analysis/artifacts' / name).read_bytes()).hexdigest() == quality['generatorSHA256'][name]
    xml = read(STUDY / 'analysis/final-xlsx-xml-audit.json')
    assert xml['passed'] and xml['sourceUnchanged'] and xml['sourceSHA256'] == sources[str(EXPORTS[1])]
    assert git('branch', '--show-current').decode().strip() == 'zan/openrouter-experiments'
    assert read(STUDY / 'analysis/recovery/github-checkpoint216.json')['newReviews'] == 72
    subprocess.run(['git', 'add', '-f', '--', *map(str, EXPORTS)], cwd=ROOT, check=True)
    key = (ROOT / '.work/secrets/openrouter.key').read_bytes().strip()
    assert key
    forms = (key, base64.b64encode(key))
    pattern = re.compile(rb'sk-or-v1-[A-Za-z0-9]{20,}|-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{20,}')
    staged = list(filter(None, git('diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z').decode().split('\0')))
    for name in staged:
        assert name.startswith('openrouter-study/') or name in set(map(str, EXPORTS)), 'Unrelated staged file: ' + name
        assert name != 'openrouter-study/active.json' and not name.endswith('.lock')
        data = git('show', ':' + name)
        payloads = [data]
        if name.endswith('.gz'):
            payloads.append(gzip.decompress(data))
        if name.endswith('.xlsx') or zipfile.is_zipfile(io.BytesIO(data)):
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                payloads.extend(z.read(entry) for entry in z.namelist())
        if name.endswith('.pdf'):
            pdf = PdfReader(io.BytesIO(data))
            payloads.extend(page.extract_text().encode() for page in pdf.pages)
        assert not any(pattern.search(payload) or any(secret in payload for secret in forms) for payload in payloads), 'Secret scan failed: ' + name
    print(json.dumps({'stagedFiles': len(staged), 'finalExports': list(map(str, EXPORTS)),
                      'secretScanPassed': True, 'compressedAndExportContentScanned': True,
                      'commitOrPushPerformed': False}))


if __name__ == '__main__':
    main()
