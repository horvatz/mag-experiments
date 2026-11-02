"""Publish a previously prepared, secret-checked checkpoint; no model calls."""
import base64
import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

checkpoint = int(sys.argv[1])
same_agent_openssh = '--same-agent-openssh' in sys.argv[2:]
base = Path('/Users/zan/Documents/mag')
study = base/'experiments/openrouter-study'
recovery = study/'analysis/recovery'
meta_path = recovery/f'github-checkpoint{checkpoint}.json'
meta = json.loads(meta_path.read_text())
assert meta['newArchived'] == checkpoint and meta['newReviews'] == 72 and meta['archiveAuditPassed']
if same_agent_openssh:
    agent = '/Users/zan/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock'
    assert Path(agent).exists()
    os.environ['SSH_AUTH_SOCK'] = agent
    configured = subprocess.check_output(['git','config','--get','user.signingkey'],cwd=base/'experiments',text=True).strip()
    listed = subprocess.check_output(['/usr/bin/ssh-add','-L'],text=True,timeout=15)
    assert any(line.split()[:2] == configured.split()[:2] for line in listed.splitlines())
repos = [('experiments','zan/openrouter-experiments','https://github.com/horvatz/mag-experiments.git'),('naloga','zan/openrouter-progress-2026-10-14','https://github.com/horvatz/mag-report.git')]
def git(repo,*args):
    return subprocess.check_output(['git',*args],cwd=repo,text=True).strip()
def staged(repo):
    return set(filter(None,git(repo,'diff','--cached','--name-only').splitlines()))
def signature(repo):
    assert git(repo,'config','--get','gpg.ssh.program') == '/Applications/1Password.app/Contents/MacOS/op-ssh-sign'
    key=git(repo,'config','--get','user.signingkey');assert key.startswith('ssh-ed25519 ')
    with tempfile.TemporaryDirectory(prefix='mag-public-signers-') as temp:
        path=Path(temp)/'allowed_signers';path.write_text('checkpoint '+key+'\n')
        subprocess.run(['git','-c','gpg.ssh.allowedSignersFile='+str(path),'verify-commit','HEAD'],cwd=repo,check=True)
def commit(repo,message):
    if staged(repo):
        signing_program = ['-c','gpg.ssh.program=/usr/bin/ssh-keygen'] if same_agent_openssh else []
        subprocess.run(['git',*signing_program,'commit','-q','-S','-m',message],cwd=repo,check=True)
    signature(repo)
def push(repo,branch):
    assert not staged(repo)
    assert git(repo,'branch','--show-current') == branch and branch.count('zan/') == 1
    if repo.name == 'experiments':
        assert json.loads(git(repo,'show',f'HEAD:openrouter-study/analysis/recovery/github-checkpoint{checkpoint}.json')) == meta
    command=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential']
    subprocess.run(command+['push','origin','HEAD:refs/heads/'+branch],cwd=repo,check=True)
    head=git(repo,'rev-parse','HEAD')
    actual=subprocess.check_output(command+['ls-remote','--heads','origin','refs/heads/'+branch],cwd=repo,text=True).split()
    assert actual == [head,'refs/heads/'+branch]
    return {'repository':repo.name,'branch':branch,'commit':head,'signatureCryptographicallyVerified':True,'remoteVerified':True,'signingTransport':'Same1Password agent and key via command-localOpenSSH' if same_agent_openssh else 'Configured1Password signer'}

handoffParts=(base/'naloga/notes/experiment-handoff.md').read_text().split('\n\n')
assert sum(p.startswith(('GitHub kopija zaključenih','GitHub ima podpisano,')) for p in handoffParts)==1

for name,branch,url in repos:
    repo=base/name
    assert git(repo,'branch','--show-current') == branch and branch.count('zan/') == 1
    assert git(repo,'remote','get-url','origin') == url
    names=staged(repo)
    if name == 'experiments':
        assert all(n.startswith('openrouter-study/') or (checkpoint==216 and n in ['outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.pdf','outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.xlsx']) for n in names)
        assert 'openrouter-study/active.json' not in names and not any(n.endswith('.lock') for n in names)
        assert json.loads(git(repo,'show',f':openrouter-study/analysis/recovery/github-checkpoint{checkpoint}.json')) == meta
        assert json.loads(git(repo,'show',':openrouter-study/status.json'))['archived'] == checkpoint
        assert json.loads(git(repo,'show',':openrouter-study/analysis/comparison.json'))['newArchived'] == checkpoint
    else:
        assert names <= {'notes/experiment-handoff.md'}
    commit(repo,f'Save verified OpenRouter checkpoint {checkpoint}')
first=[push(base/name,branch) for name,branch,url in repos]
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checkpoint':checkpoint,'newReviews':72,'repositories':first,'scope':'Exact remote heads containing measured data at this observation; subsequent metadata commits retain this immutable verification snapshot.'}
proof_path=recovery/f'github-checkpoint{checkpoint}-verification.json'
assert not proof_path.exists(),'Do not overwrite an existing successful verification; inspect first'
proof_path.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
handoff=base/'naloga/notes/experiment-handoff.md';paragraphs=handoff.read_text().split('\n\n')
indices=[i for i,p in enumerate(paragraphs) if p.startswith(('GitHub kopija zaključenih', 'GitHub ima podpisano,'))]
assert len(indices)==1
index=indices[0]
paragraphs[index]=f"GitHub kopija zaključenih meritev skozi **{checkpoint} je podpisana, kriptografsko preverjena in oddaljeno potrjena** ob {proof['at']}: experiments `{first[0]['commit']}`, naloga `{first[1]['commit']}`. Dokaz je `analysis/recovery/github-checkpoint{checkpoint}-verification.json`. Kopija vsebuje{meta['allArchives']} arhivov/120 presoj. QA{meta['latestFullyReviewedArtifactCheckpoint']} je zadnji popolnoma pregledani vmesni predogled; za koncne izvoze216 preveri tudi final-quality-verification.json. Aktivna financirana razlicica je O/1.0+budget-amendment-2 z mejo50USD. Ta novi zapis nadomesti stare trditve o prejsnjih oddaljenih kopijah; spodnja zgodovina ostane ohranjena. Dokaz in predaja se objavita se z locenim podpisanim metapodatkovnim zapisom."
handoff.write_text('\n\n'.join(paragraphs))
key=(base/'experiments/.work/secrets/openrouter.key').read_bytes().strip();assert key
forms=[key,base64.b64encode(key)]
pattern=re.compile(rb'sk-or-v1-[a-zA-Z0-9]{20,}|-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----|gh[pousr]_[a-zA-Z0-9]{20,}')
for path in [proof_path,handoff]:
    data=path.read_bytes();assert not any(x in data for x in forms) and not pattern.search(data)
for name,branch,url in repos:
    repo=base/name;assert not staged(repo)
    file=proof_path if name=='experiments' else handoff
    subprocess.run(['git','add','--',str(file.relative_to(repo))],cwd=repo,check=True)
    assert staged(repo)=={str(file.relative_to(repo))}
    commit(repo,f'Record verified GitHub backup through measurement {checkpoint}')
final=[push(base/name,branch) for name,branch,url in repos]
print(json.dumps({'checkpoint':checkpoint,'measurementCommits':first,'latestVerifiedHeads':final,'noModelCalls':True}))
