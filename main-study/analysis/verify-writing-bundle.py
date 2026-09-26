"""Final cross-file audit after all runs, artifact generation and PDF rendering.

Does not run models, change archives, rerun evaluations or grade submissions.
Run prepare-writing-data and audit-review-links first; build the final PDF last.
"""
import csv
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ANALYSIS = ROOT / 'main-study/analysis'


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def csv_rows(name):
    with (ANALYSIS / name).open(newline='') as stream:
        return list(csv.DictReader(stream))


result = read(ANALYSIS / 'reporting-results.json')
schedule = read(ROOT / 'main-study/schedule.json')['runs']
audit = read(ANALYSIS / 'integrity-audit.json')
raw = read(ANALYSIS / 'results.json')
assert result['complete'] and result['archived'] == result['planned'] == 72
assert not (ROOT / 'main-study/runner.lock').exists(), 'Queue must finish first'
assert read(ROOT / 'main-study/active.json')['stage'] == 'all_runs_archived'
assert result['data'] == raw['data'], 'Reporting must preserve measured rows'
assert audit['sourceGeneratedAt'] == result['generatedAt'] == raw['generatedAt']
assert audit['archiveIntegrity'] and audit['frozenInputsUnchanged']
assert audit['archived'] == 72 and audit['reviewResolved'] == 24
assert {r['id'] for r in schedule} == {r['id'] for r in result['data']}
assert all(g['archived'] == 24 for g in result['groups'])
assert all(g['count'] == 3 for g in result['byTask'])
for name, expected in read(ROOT / 'main-study/frozen-inputs.json')['sources'].items():
    assert sha(ROOT / name) == expected, name

runs = csv_rows('run-data.csv')
requirements = csv_rows('requirement-data.csv')
tests = csv_rows('test-data.csv')
reviews = csv_rows('review-data.csv')
phases = csv_rows('phase-data.csv')
assert len(runs) == 72 and len(requirements) == 864 and len(reviews) == 24
assert len({r['id'] for r in runs}) == 72
assert len({(r['id'], r['requirement']) for r in requirements}) == 864
assert {r['id'] for r in reviews} == {r['id'] for r in schedule if r['repetition'] == 1}
expected_test_count = 0
for record in result['data']:
    run_id = record['id']
    row = next(r for r in runs if r['id'] == run_id)
    assert row['archived'] == 'true'
    assert row['execution_status'] == record['executionStatus']
    assert row['strict_success'] == str(record['strictSuccess']).lower()
    assert int(row['requirements_demonstrated']) == record['score']['passed']
    if record['elapsedSeconds'] is None:
        assert row['elapsed_seconds'] == ''
    else:
        assert math.isclose(float(row['elapsed_seconds']), record['elapsedSeconds'])
    subset = [r for r in requirements if r['id'] == run_id]
    assert len(subset) == 12
    assert sum(r['demonstrated'] == 'true' for r in subset) == record['score']['passed']
    assert sum(r['observed'] == 'true' for r in subset) == record['score']['observed']
    summary = read(ROOT / record['evidence'])
    original_tests = summary['tests']
    exported_tests = [r for r in tests if r['id'] == run_id]
    assert len(exported_tests) == len(original_tests)
    for exported, original in zip(exported_tests, original_tests):
        assert (exported['project'], exported['title'], exported['status']) == (
            original['project'], original['title'], original['status'])
        assert json.loads(exported['errors_json']) == (original.get('errors') or [])
    expected_test_count += len(original_tests)
    if not record['usageComplete']:
        assert row['input_tokens'] == row['output_tokens'] == ''
    assert any(r['id'] == run_id for r in phases)
assert len(tests) == expected_test_count

dimensions = ['specificationCoverage', 'predicatesInvariants', 'traceability',
              'codeOrganization', 'ownChecks']
for row in reviews:
    original = read(ANALYSIS / 'reviews' / (row['id'] + '.json'))
    assert row['review_status'] in ['rated', 'unavailable']
    assert row['human_review'] == row['inter_rater_agreement'] == ''
    for dimension in original['dimensions']:
        expected = '' if dimension['score'] is None else str(dimension['score'])
        assert row[dimension['dimension']] == expected
    if row['review_status'] == 'unavailable':
        assert all(row[d] == '' for d in dimensions)
assert sum(r['review_status'] == 'rated' for r in reviews) == audit['reviewed']
assert sum(r['review_status'] == 'unavailable' for r in reviews) == audit['reviewUnavailable']

for comparison in result['comparisons']:
    metric = comparison['metric']
    left = [g for g in result['byTask'] if g['procedure'] == comparison['first']]
    differences = []
    for group in left:
        other = next(g for g in result['byTask'] if g['task'] == group['task']
                     and g['procedure'] == comparison['second'])
        assert group[metric] is not None and other[metric] is not None
        differences.append(group[metric] - other[metric])
    assert len(differences) == 8
    assert math.isclose(comparison['meanDifference'], sum(differences) / 8, abs_tol=1e-12)
    assert comparison['resamples'] == 20000 and comparison['unit'] == 'task'
    assert comparison['lower'] <= comparison['upper']
review_links = read(ANALYSIS / 'artifacts/qa/review-evidence-fragments.json')
assert review_links['reviewFiles'] == 24
assert review_links['missingOrInvalidFragments'] == []
for name, expected in review_links['reviewFileSha256'].items():
    assert sha(ANALYSIS / 'reviews' / name) == expected

workbook_qa = read(ANALYSIS / 'artifacts/qa/verification.json')
figures = read(ANALYSIS / 'figures/provenance.json')
for derived in [workbook_qa, figures]:
    assert derived['archived'] == 72
    assert derived['sourceGeneratedAt'] == result['generatedAt']
assert workbook_qa['formulasComparedWithAnalysis'] and workbook_qa['perturbationRestored']
assert workbook_qa['formulaValuesChecked']
assert set(figures['usageFigure']['excludedIncompleteIds']) == {
    r['id'] for r in result['data'] if not r['usageComplete'] or r['usage'] is None}

pdf = ROOT.parent / 'naloga/latex/magistrska.pdf'
xlsx = Path(workbook_qa['output'])
assert pdf.exists() and xlsx.exists()
assert pdf.stat().st_mtime >= (ANALYSIS / 'reporting-results.json').stat().st_mtime
visual = read(ANALYSIS / 'visual-verification.json')
assert visual['sourceGeneratedAt'] == result['generatedAt']
assert visual['archived'] == 72 and visual['passed']
assert visual['pdfSha256'] == sha(pdf)
assert visual['workbookSha256'] == sha(xlsx)
assert visual['pdfPagesInspected'] and visual['workbookPreviewsInspected']
for name, expected in visual['figureSha256'].items():
    assert sha(ANALYSIS / 'figures' / name) == expected
outputs = [pdf, xlsx] + [ANALYSIS / name for name in [
    'reporting-results.json', 'reporting-results.md', 'run-data.csv',
    'requirement-data.csv', 'test-data.csv', 'phase-data.csv', 'review-data.csv',
    'content-review.md', 'development-cases.md', 'writing-guide.md',
    'zakljucni-povzetek.md', 'visual-verification.json']]
outputs += sorted((ANALYSIS / 'figures').glob('*.png'))
outputs += sorted((ANALYSIS / 'figures').glob('*.svg'))
receipt = {
    'verifiedAt': datetime.now(timezone.utc).isoformat(),
    'sourceGeneratedAt': result['generatedAt'], 'archived': 72,
    'strictSuccesses': sum(r['strictSuccess'] for r in result['data']),
    'requirementRows': len(requirements), 'testRows': len(tests),
    'phaseRows': len(phases), 'reviewRated': audit['reviewed'],
    'reviewUnavailable': audit['reviewUnavailable'], 'reviewResolved': 24,
    'rawMeasurementsPreserved': True, 'frozenInputsUnchanged': True,
    'csvValuesMatchedArchives': True, 'missingValuesPreserved': True,
    'derivedArtifactsUseSameSnapshot': True,
    'visualQA': 'Separate researcher inspection recorded in visual-verification.json; artifact hashes match.',
    'sha256': {str(path): sha(path) for path in outputs},
}
(ANALYSIS / 'final-verification.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: v for k, v in receipt.items() if k != 'sha256'}))
