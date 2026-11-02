import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

root=Path('/Users/zan/Documents/mag/experiments')
publisher=Path('/Users/zan/Documents/mag/experiments/openrouter-study/analysis/artifacts/publish-checkpoint.py')
state_path=root/'.work/github-visible-publish216-state.json'
assert not state_path.exists(),'Inspect existing native terminal publisher before relaunch'
def heads():
    return {name:subprocess.check_output(['git','rev-parse','HEAD'],cwd=root if name=='experiments' else root.parent/'naloga',text=True).strip() for name in ['experiments','naloga']}
state={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checkpoint':216,'phase':'running','pid':os.getpid(),'nativeTerminalProgram':os.environ.get('TERM_PROGRAM'),'stdinIsTTY':sys.stdin.isatty(),'stdoutIsTTY':sys.stdout.isatty(),'publisherSHA256':hashlib.sha256(publisher.read_bytes()).hexdigest(),'initialHeads':heads(),'signatureApprovalRemainsWithUser':True}
state_path.write_text(json.dumps(state,indent=2)+'\n')
try:
    # Inherit all real Terminal file descriptors; do not pipe the signature prompt.
    code=subprocess.call(['/usr/bin/python3',str(publisher),'216'],cwd=root)
except BaseException as error:
    code=1
    state['launcherErrorType']=type(error).__name__
    raise
finally:
    state.update(phase='finished',exitCode=code,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),finalHeads=heads())
    state_path.write_text(json.dumps(state,indent=2)+'\n')
sys.exit(code)
