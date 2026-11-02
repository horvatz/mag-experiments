"""Fill missing native chart caches after Artifact Tool export.

The supported setData/recalculate path still exports empty caches for these
formula-backed ranges. This fallback changes only existing chart caches, using
the worksheet's already recalculated values. Live references remain intact.
"""
import copy
import datetime
import hashlib
import io
import json
import math
import os
import posixpath
import re
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDY = HERE.parent.parent
ROOT = STUDY.parent
FILE = ROOT / 'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b/primerjava-modelov.xlsx'
NS = dict(s='http://schemas.openxmlformats.org/spreadsheetml/2006/main',
          r='http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          c='http://schemas.openxmlformats.org/drawingml/2006/chart')
ET.register_namespace('c', NS['c'])
ET.register_namespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
ET.register_namespace('r', NS['r'])


def main():
    assert Path(sys.argv[1]).resolve() == FILE
    assert not (STUDY / 'runner.lock').exists()
    comparison = json.loads((STUDY / 'analysis/comparison.json').read_text())
    assert comparison['complete'] and comparison['newArchived'] == 216
    before = FILE.read_bytes()
    with zipfile.ZipFile(io.BytesIO(before)) as z:
        infos = z.infolist()
        original = {info.filename: z.read(info.filename) for info in infos}
    modified = dict(original)

    def relations(part):
        path = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels')
        return ({n.attrib['Id']: n.attrib for n in ET.fromstring(original[path])}
                if path in original else {})

    def related(part, relation):
        assert relation.get('TargetMode') != 'External'
        target = relation['Target']
        path = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(part), target))
        assert path in original
        return path

    shared = ([] if 'xl/sharedStrings.xml' not in original else
              [''.join(n.itertext()) for n in ET.fromstring(original['xl/sharedStrings.xml'])])
    sheets, chart_parts = {}, []
    workbook_rels = relations('xl/workbook.xml')
    for sheet in ET.fromstring(original['xl/workbook.xml']).find('s:sheets', NS):
        part = related('xl/workbook.xml', workbook_rels[sheet.attrib['{' + NS['r'] + '}id']])
        root = ET.fromstring(original[part])
        cells = {}
        for cell in root.findall('.//s:sheetData/s:row/s:c', NS):
            kind = cell.attrib.get('t')
            node = cell.find('s:v', NS)
            value = node.text if node is not None else None
            if kind == 's':
                value = shared[int(value)]
            elif kind == 'inlineStr':
                value = ''.join(cell.find('s:is', NS).itertext())
            cells[cell.attrib['r']] = (kind, value)
        sheets[sheet.attrib['name']] = cells
        sheet_rels = relations(part)
        for drawing_ref in root.findall('s:drawing', NS):
            drawing = related(part, sheet_rels[drawing_ref.attrib['{' + NS['r'] + '}id']])
            drawing_rels = relations(drawing)
            for chart_ref in ET.fromstring(original[drawing]).findall('.//c:chart', NS):
                relation = drawing_rels[chart_ref.attrib['{' + NS['r'] + '}id']]
                assert relation['Type'].endswith('/chart') and sheet.attrib['name'] == 'Primerjava'
                chart_parts.append(related(drawing, relation))
    assert len(chart_parts) == len(set(chart_parts)) == 2

    def values(formula):
        match = re.fullmatch(r"('(?:[^']|'')+'|[^!]+)!\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?", formula)
        assert match, formula
        name, column, first, last_column, last = match.groups()
        name = name[1:-1].replace("''", "'") if name.startswith("'") else name
        assert name == 'Primerjava' and (last_column is None or column == last_column)
        return [sheets[name][column + str(row)] for row in range(int(first), int(last or first) + 1)]

    def without_caches(root):
        root = copy.deepcopy(root)
        for parent in root.iter():
            for child in list(parent):
                if child.tag in (ET.QName(NS['c'], 'numCache'), ET.QName(NS['c'], 'strCache')):
                    parent.remove(child)
        return ET.tostring(root)

    caches = []
    for part in chart_parts:
        root = ET.fromstring(original[part])
        invariant = without_caches(root)
        assert not any('Ignorable' in k for n in root.iter() for k in n.attrib)
        for reference_kind, cache_kind in [('numRef', 'numCache'), ('strRef', 'strCache')]:
            for reference in root.findall('.//c:' + reference_kind, NS):
                formula = reference.find('c:f', NS).text
                source = values(formula)
                assert len(source) == 5
                old_cache = reference.find('c:' + cache_kind, NS)
                format_code = old_cache.find('c:formatCode', NS) if old_cache is not None else None
                cache = ET.Element(ET.QName(NS['c'], cache_kind))
                if reference_kind == 'numRef':
                    ET.SubElement(cache, ET.QName(NS['c'], 'formatCode')).text = format_code.text if format_code is not None else 'General'
                ET.SubElement(cache, ET.QName(NS['c'], 'ptCount'), val=str(len(source)))
                for index, (kind, value) in enumerate(source):
                    assert kind != 'e' and value is not None
                    if reference_kind == 'numRef':
                        assert kind not in ('s', 'inlineStr', 'str', 'b') and math.isfinite(float(value))
                    point = ET.SubElement(cache, ET.QName(NS['c'], 'pt'), idx=str(index))
                    ET.SubElement(point, ET.QName(NS['c'], 'v')).text = value
                if old_cache is not None:
                    reference.remove(old_cache)
                reference.append(cache)
                caches.append(dict(part=part, formula=formula, kind=cache_kind, points=len(source)))
        assert without_caches(root) == invariant, 'Chart live references or formatting changed'
        modified[part] = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    assert len([x for x in caches if x['kind'] == 'numCache']) == 6
    assert len([x for x in caches if x['kind'] == 'strCache']) == 6
    assert all(modified[name] == data for name, data in original.items() if name not in chart_parts)
    fd, temp = tempfile.mkstemp(prefix='chart-caches-', suffix='.tmp', dir=FILE.parent)
    os.close(fd)
    try:
        with zipfile.ZipFile(temp, 'w') as z:
            for info in infos:
                z.writestr(info, modified[info.filename])
        with zipfile.ZipFile(temp) as z:
            assert z.testzip() is None
            assert all(z.read(name) == data for name, data in modified.items())
        os.replace(temp, FILE)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    proof = dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(), researcherOnly=True,
                 method='Missing-capability fallback after documented Artifact Tool rebind failed; populate only existing native chart caches from cached source cells.',
                 beforeSHA256=hashlib.sha256(before).hexdigest(), afterSHA256=hashlib.sha256(FILE.read_bytes()).hexdigest(),
                 modifiedParts=chart_parts, caches=caches, worksheetAndOtherPartsByteIdentical=True,
                 chartLiveReferencesAndFormattingUnchanged=True, formulasAndSourceValuesUnchanged=True)
    (STUDY / 'analysis/final-chart-cache-population.json').write_text(json.dumps(proof, indent=2) + '\n')
    print(json.dumps(dict(charts=2, numericCaches=6, categoryCaches=6, sourceValuesAndFormulasUnchanged=True)))


if __name__ == '__main__':
    main()
