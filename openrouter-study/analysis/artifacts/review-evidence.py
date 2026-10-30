"""Render immutable archived tool evidence for manual review; never grades or runs models."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('slug', choices=['glm', 'deepseek', 'qwen'])
parser.add_argument('id')
args = parser.parse_args()
assert re.fullmatch(r'P(?:0[3-9]|10)-[ABC]-001', args.id)
study = Path(__file__).resolve().parents[2]
collection = study / args.slug
archive = collection / 'runtime/runs' / args.id
manifest = json.loads((archive / 'archive-complete.json').read_text())
assert manifest['id'] == args.id
for path, record in manifest['files'].items():
    if record['kind'] == 'file':
        assert hashlib.sha256((archive / path).read_bytes()).hexdigest() == record['sha256'], path
out = collection / 'analysis/evidence' / f'{args.id}-checks.md'
assert not out.exists(), 'Preserve existing research evidence and references; inspect before replacing.'
subprocess.run(['node', str(study / 'analysis/artifacts/review-packet.mjs'), args.slug, args.id], check=True)
packet = json.loads((collection / 'analysis/review-packets' / f'{args.id}.json').read_text())
lines = [f'# Dokazi {args.slug} {args.id}', '',
         'Raziskovalčev prepis nespremenjenega arhiva, ne nov zagon testov ali modelova oddaja. '
         'Izpis ni nadomestilo za branje dejanskih avtorskih datotek. Native in poznejši API vhodi se lahko podvajajo.', '']
for command in packet['nativeCommands']:
    lines += ['## ' + command['itemId'], '',
              f"Vir: `{command['source']}`, exit {command['exitCode']}.", '', '```text',
              command['command'], command.get('output') or '', '```', '']
for i, call in enumerate(packet['preservedToolCalls']):
    lines += [f'## preserved-{i}', '', f"Vir: `{call['source']}`, callId `{call['callId']}`.", '',
              '```text', str(call['arguments']), str(call.get('output', '')), '```', '']
text = '\n'.join(lines) + '\n'
assert not re.search(r'sk-or-v1-[a-zA-Z0-9]{20,}', text)
out.parent.mkdir(exist_ok=True)
with out.open('x') as stream:
    stream.write(text)
print(json.dumps(dict(slug=args.slug, id=args.id, archiveHashesVerified=True,
                      evidence=str(out.relative_to(collection)), evidenceSHA256=hashlib.sha256(out.read_bytes()).hexdigest(),
                      authoredFiles=[dict(path=f['path'], lines=f.get('lines'), missing=f.get('missingFromFinalSubmission', False)) for f in packet['authoredFiles']],
                      nativeCommands=len(packet['nativeCommands']), preservedCalls=len(packet['preservedToolCalls']),
                      newGradesWritten=False), ensure_ascii=False))
