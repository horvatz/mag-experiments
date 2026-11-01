"""Read-only, independent XML/source audit of the final exported workbook.

Uses only the Python standard library. Does not calculate, modify, or export a
workbook; cached results must already agree with the original research records.
"""
import datetime
import hashlib
import json
import math
import posixpath
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDY = HERE.parent.parent
ROOT = STUDY.parent
FILE = ROOT / 'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'p': 'http://schemas.openxmlformats.org/package/2006/relationships',
      'c': 'http://schemas.openxmlformats.org/drawingml/2006/chart'}
LABELS = {'astra': 'GPT Astra', 'luna': 'GPT Luna', 'glm': 'GLM-5.3',
          'deepseek': 'DeepSeek V4.1 Flash', 'qwen': 'Qwen3.5-9B'}
DIMS = ['specificationCoverage', 'predicatesInvariants', 'traceability',
        'codeOrganization', 'ownChecks']


def read(path):
    return json.loads(path.read_text())


def finite(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def equal(actual, expected, context):
    if expected is None or expected == '':
        assert actual in (None, ''), (context, actual, expected)
    elif finite(expected):
        assert finite(actual) and math.isclose(actual, expected, rel_tol=1e-10, abs_tol=1e-9), (context, actual, expected)
    else:
        assert actual == expected, (context, actual, expected)


def main():
    comparison = read(STUDY / 'analysis/comparison.json')
    assert comparison['complete'] and comparison['newArchived'] == 216
    before = hashlib.sha256(FILE.read_bytes()).hexdigest()
    plan = read(STUDY / 'models.json')
    items = [('astra', ROOT / 'main-study/analysis', ROOT / 'runs', 'M/1.0'),
             ('luna', ROOT / 'luna-study/analysis', ROOT / 'luna-study/runtime/runs', 'L/1.0')]
    items += [(slug, STUDY / slug / 'analysis', STUDY / slug / 'runtime/runs',
               next(m['collection'] for m in plan['models'] if m['slug'] == slug))
              for slug in ('glm', 'deepseek', 'qwen')]
    runs, reviews = [], []
    for slug, analysis, archives, collection in items:
        for row in read(analysis / 'reporting-results.json')['data']:
            usage = row.get('usage') if row['usageComplete'] else None
            rel = lambda p: posixpath.relpath(p, ROOT)
            runs.append([LABELS[slug], row['id'], row['task'], row['procedure'], row['repetition'],
                         row['executionStatus'], row['score']['passed'], row['score']['observed'],
                         int(row['strictSuccess']), row.get('elapsedSeconds'), int(row['usageComplete']),
                         *[(usage or {}).get(k) for k in ('input_tokens', 'cached_input_tokens', 'output_tokens')],
                         row.get('costUSD') if row.get('costComplete') else None,
                         int(bool(row.get('costComplete'))), row['ownTestFiles'], None,
                         collection + ' / ' + rel(archives / row['id'] / 'evaluation-summary.json'),
                         rel(ROOT / row['costEvidence']) if row.get('costEvidence') else None])
            if row['repetition'] == 1:
                path = analysis / 'reviews' / (row['id'] + '.json')
                record = read(path)
                reviews.append([LABELS[slug], row['id'], row['task'], row['procedure'],
                                *[next(d['score'] for d in record['dimensions'] if d['dimension'] == dim) for dim in DIMS],
                                record['method'], None, collection + ' / ' + rel(path)])
    assert len(runs) == 360 and len(reviews) == 120
    sheets, formula_count, chart_count = {}, 0, 0
    with zipfile.ZipFile(FILE) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            shared = [''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        rels = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        book = ET.fromstring(z.read('xl/workbook.xml'))
        for sheet in book.find('s:sheets', NS):
            target = rels[sheet.attrib['{' + NS['r'] + '}id']]
            path = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/' + target)
            values, formulas = {}, {}
            for cell in ET.fromstring(z.read(path)).findall('.//s:sheetData/s:row/s:c', NS):
                address, kind = cell.attrib['r'], cell.attrib.get('t')
                assert kind != 'e', (sheet.attrib['name'], address, 'cached formula error')
                node = cell.find('s:v', NS)
                value = node.text if node is not None else None
                if kind == 's':
                    value = shared[int(value)]
                elif kind == 'inlineStr':
                    value = ''.join(cell.find('s:is', NS).itertext())
                elif kind not in ('str', 'b') and value not in (None, ''):
                    value = float(value)
                elif kind == 'b' and value is not None:
                    value = int(value)
                values[address] = value
                f = cell.find('s:f', NS)
                if f is not None:
                    formulas[address] = f.text
                    formula_count += 1
            sheets[sheet.attrib['name']] = (values, formulas)
        assert list(sheets) == ['Primerjava', 'Izvedbe', 'Vsebinska presoja', 'Parjene razlike', 'Proračunska dopolnitev']
        for name, source in [('Izvedbe', runs), ('Vsebinska presoja', reviews)]:
            values, formulas = sheets[name]
            assert not formulas
            for row_number, expected in enumerate(source, 2):
                for column, value in enumerate(expected):
                    address = chr(65 + column) + str(row_number)
                    equal(values.get(address), value, (name, address))
            assert sum(bool(values.get('B' + str(i))) for i in range(2, len(source) + 3)) == len(source)
        summary, formulas = sheets['Primerjava']
        for index, group in enumerate(comparison['summaries']):
            label, procedure = LABELS[group['slug']], group['procedure']
            selected = [r for r in runs if r[0] == label and r[3] == procedure]
            graded = [r for r in reviews if r[0] == label and r[3] == procedure]
            n = len(selected)
            assert n == 24 and len(graded) == 8
            times = [r[9] for r in selected if finite(r[9])]
            costs = [r[14] for r in selected if finite(r[14])]
            expected = [n, sum(r[8] for r in selected), sum(r[6] for r in selected) / n / 12,
                        sum(times) / n / 60 if len(times) == n else None,
                        sum(r[10] for r in selected), sum(r[15] for r in selected),
                        sum(costs) / n if len(costs) == n else None, len(times)]
            for column, value in zip('CDEFGHIJ', expected):
                address = column + str(index + 7)
                assert address in formulas
                equal(summary.get(address), value, ('Primerjava', address))
            for d, col in enumerate('CDEFG'):
                known = [r[4 + d] for r in graded if finite(r[4 + d])]
                address = col + str(index + 45)
                assert address in formulas
                equal(summary.get(address), sum(known) / len(known) if known else None, address)
                address = col + str(index + 67)
                assert address in formulas
                equal(summary.get(address), len(known), address)
            for row in (index + 45, index + 67):
                equal(summary.get('H' + str(row)), 8, ('sample count', row))
        metric_labels = {'demonstratedFraction': ('Dokazane zahteve', 'odstotne točke', 100),
                         'strictSuccessFraction': ('Strogi uspeh', 'odstotne točke', 100),
                         'elapsedSeconds': ('Čas', 'minute', 1 / 60), 'costUSD': ('Obračunani strošek', 'USD', 1)}
        paired, _ = sheets['Parjene razlike']
        contrasts = comparison['comparisons'] + comparison['withheld']
        for index, record in enumerate(contrasts, 5):
            label = record['label']
            for slug, title in LABELS.items():
                label = label.replace(slug, title)
            metric, unit, scale = metric_labels[record['metric']]
            calculated = index - 5 < len(comparison['comparisons'])
            expected = [label, metric, unit]
            expected += ([record[k] * scale for k in ('meanDifference', 'lower', 'upper')] +
                         [len(record['taskDifferences']), record['resamples'], 'izračunano']) if calculated else [None] * 5 + ['manjka točen podatek ali popolna trojna ponovitev']
            expected += ['primerjalni podatki / ' + record['label'] + ' / ' + record['metric']]
            for col, value in zip('ABCDEFGHIJ', expected):
                equal(paired.get(col + str(index)), value, ('contrast', index, col))
        budget, _ = sheets['Proračunska dopolnitev']
        amendment = read(STUDY / 'budget-amendment-1.json')
        equal(budget.get('B1'), amendment['id'], 'budget amendment version')
        stop = read(STUDY / 'analysis/recovery/glm-P03-B-003-budget-refusal.json')
        assert stop['sentUpstream'] is False and stop['balance']['remainingUSD'] < stop['requiredPinnedMaximumUSD']
        usd = lambda value: f'{value:.4f}'.replace('.', ',')
        disclosure = (f"GLM/P03-B-003, zahteva {stop['request']}: {usd(stop['balance']['remainingUSD'])} USD < "
                      f"{usd(stop['requiredPinnedMaximumUSD'])} USD. Lokalno varovalo; zahteva ni poslana ponudniku. "
                      'Izvedba ostane brez ponovitve.')
        equal(budget.get('A11'), 'Poznejša zavrnitev kritja', 'budget refusal label')
        equal(budget.get('B11'), disclosure, 'budget refusal against original evidence')
        equal(budget.get('A12'), 'Vir zavrnitve', 'budget refusal source label')
        equal(budget.get('B12'), 'analysis/recovery/glm-P03-B-003-budget-refusal.json', 'budget refusal source')
        extension = read(STUDY / 'budget-amendment-2.json')
        assert extension['status'] == 'approved' and extension['fundingObserved']
        equal(budget.get('B13'), extension['id'], 'second budget approval version')
        equal(budget.get('B14'), '50 USD; uporabnik ročno doda 10 USD. Brez raziskovalčevih plačil ali samodejnega doplačevanja.', 'second budget ceiling')
        observed = extension['fundingObservation']['balance']
        funding_text = (f"Skupni krediti {observed['totalCreditsUSD']:g} USD; preverjeno {observed['at']}. "
                        'Posnetek računa, ne posamezna faktura.')
        equal(budget.get('B17'), funding_text, 'actual prepaid funding source')
        equal(budget.get('B18'), 'openrouter-study/budget-amendment-2.json', 'second approval source')
        for path in z.namelist():
            if path.startswith('xl/charts/chart') and path.endswith('.xml'):
                chart_count += 1
                chart = ET.fromstring(z.read(path))
                series = chart.findall('.//c:barChart/c:ser', NS)
                assert len(series) == 3, (path, 'three procedures')
                for series_index, series_node in enumerate(series):
                    ref = series_node.find('c:val/c:numRef/c:f', NS)
                    assert ref is not None and ref.text
                    address = ref.text.split('!')[-1].replace('$', '')
                    start, end = address.split(':')
                    assert start[0] == end[0] and int(end[1:]) - int(start[1:]) == 4
                    cache = series_node.find('c:val/c:numRef/c:numCache', NS)
                    assert cache is not None
                    points = {int(pt.attrib['idx']): float(pt.find('c:v', NS).text) for pt in cache.findall('c:pt', NS)}
                    assert set(points) == set(range(5))
                    for i in range(5):
                        equal(points[i], summary.get(start[0] + str(int(start[1:]) + i)), ('chart cache', path, series_index, i))
        assert chart_count == 2 and formula_count >= 300
    assert hashlib.sha256(FILE.read_bytes()).hexdigest() == before
    proof = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'researcherOnly': True,
             'passed': True, 'sourceFile': str(FILE), 'sourceSHA256': before, 'sourceUnchanged': True,
             'method': 'Independent standard-library ZIP/XML read; compare cached values against source records, not recalculated by this auditor.',
             'rawRows': len(runs), 'reviewRows': len(reviews), 'contrasts': len(contrasts),
             'formulaCells': formula_count, 'chartsWithVerifiedCachedValues': chart_count,
             'missingAndZeroComparedSeparately': True, 'allFiveSheetsParsed': True,
             'visualReview': 'separate; this audit does not claim to view images'}
    target = STUDY / 'analysis/final-xlsx-xml-audit.json'
    target.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(proof, ensure_ascii=False))


if __name__ == '__main__':
    main()
