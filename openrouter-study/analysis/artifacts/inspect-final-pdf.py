"""Inspect and render the completed PDF; never claim visual review automatically."""
import base64
import datetime
import hashlib
import json
import re
import subprocess
from pathlib import Path

from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
STUDY = HERE.parent.parent
ROOT = STUDY.parent
FILE = ROOT / 'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.pdf'
QA = HERE / 'qa/final-pdf-inspection'
DEPS = Path('/Users/zan/.cache/codex-runtimes/codex-primary-runtime/dependencies')


def main():
    comparison = json.loads((STUDY / 'analysis/comparison.json').read_text())
    assert comparison['complete'] and comparison['newArchived'] == 216
    before = hashlib.sha256(FILE.read_bytes()).hexdigest()
    pdf = PdfReader(FILE)
    assert len(pdf.pages) > 0
    secret = (ROOT / '.work/secrets/openrouter.key').read_bytes().strip()
    assert secret
    pattern = re.compile(rb'sk-or-v1-[A-Za-z0-9]{20,}|-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{20,}')
    text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
    for payload in (FILE.read_bytes(), text.encode()):
        assert not pattern.search(payload)
        assert secret not in payload and base64.b64encode(secret) not in payload
    links = []
    for number, page in enumerate(pdf.pages, 1):
        for ref in page.get('/Annots', []):
            action = ref.get_object().get('/A')
            if action and action.get('/S') == '/URI':
                uri = str(action['/URI'])
                assert uri.startswith('https://'), (number, uri)
                links.append(dict(page=number, uri=uri))
    assert len(links) == 6
    QA.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(DEPS / 'bin/override/pdftoppm'), '-r', '110', '-png',
                    str(FILE), str(QA / 'page')], check=True)
    pages = sorted(QA.glob('page-*.png'), key=lambda p: int(p.stem.split('-')[-1]))
    assert len(pages) == len(pdf.pages)
    assert hashlib.sha256(FILE.read_bytes()).hexdigest() == before
    record = dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  researcherOnly=True, sourceFile=str(FILE), sourceSHA256=before,
                  sourceUnchanged=True, pdfPages=len(pdf.pages), links=links,
                  secretScanPassed=True,
                  rendered=[dict(page=i, path=str(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest())
                            for i, p in enumerate(pages, 1)],
                  visualReview='pending: researcher must actually view every page')
    (QA / 'inspection.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(dict(pdfPages=len(pdf.pages), links=len(links), secretScanPassed=True,
                          sourceSHA256=before, visualReview='pending')))


if __name__ == '__main__':
    main()
