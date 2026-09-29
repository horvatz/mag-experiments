// Read-only audit of evidence references; writes only the derived QA report.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url)), root = resolve(dir, '../..')
const reviews = readdirSync(resolve(dir, 'reviews')).filter(f => f.endsWith('.json')).sort()
const report = { checkedAt: new Date().toISOString(), reviewFiles: reviews.length, evidenceReferences: 0,
  dimensionEvidenceFragments: 0, exampleEvidenceFragments: 0, missingOrInvalidFragments: [], reviewFileSha256: {},
  method: 'Read-only validation of all dimension/example evidence paths, numbered lines and Markdown heading fragments. No archive or score modified.' }
const slug = heading => heading.toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\-\s]/gu, '').replace(/\s/g, '-')
for (const name of reviews) {
  const bytes = readFileSync(resolve(dir, 'reviews', name)), review = JSON.parse(bytes)
  report.reviewFileSha256[name] = createHash('sha256').update(bytes).digest('hex')
  const sections = [...review.dimensions.map(d => ({ kind: 'dimension', evidence: d.evidence })),
    ...['finalFailureExample', 'developmentFailureExample'].filter(k => review[k]).map(k => ({ kind: 'example', evidence: review[k].evidence }))]
  for (const section of sections) for (const evidence of section.evidence) {
    report.evidenceReferences++
    const [reference, fragment] = evidence.split('#'), lineMatch = reference.match(/:(\d+)$/)
    const path = resolve(root, reference.replace(/:\d+$/, ''))
    try {
      assert.ok(existsSync(path), 'missing file')
      if (fragment !== undefined || lineMatch) {
        report[section.kind === 'dimension' ? 'dimensionEvidenceFragments' : 'exampleEvidenceFragments']++
        const content = readFileSync(path, 'utf8'), lines = content.replace(/\r\n/g, '\n').split('\n')
        if (lines.at(-1) === '') lines.pop()
        if (lineMatch) assert.ok(+lineMatch[1] >= 1 && +lineMatch[1] <= lines.length, 'line outside file')
        if (fragment !== undefined) {
          const headings = lines.filter(l => /^#{1,6}\s+/.test(l)).map(l => slug(l.replace(/^#{1,6}\s+/, '').replace(/\s+#+\s*$/, '')))
          assert.ok(headings.includes(decodeURIComponent(fragment)), 'missing heading fragment')
        }
      }
    } catch (error) { report.missingOrInvalidFragments.push({ review: name, evidence, error: error.message }) }
  }
}
writeFileSync(resolve(dir, 'artifacts/qa/review-evidence-fragments.json'), JSON.stringify(report, null, 2) + '\n')
assert.equal(report.missingOrInvalidFragments.length, 0, JSON.stringify(report.missingOrInvalidFragments))
console.log(JSON.stringify({ reviews: report.reviewFiles, references: report.evidenceReferences,
  fragments: report.dimensionEvidenceFragments + report.exampleEvidenceFragments, invalid: 0 }))
