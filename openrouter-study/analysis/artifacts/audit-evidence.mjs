// Read-only audit of archives and qualitative source references.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = resolve(dirname(fileURLToPath(import.meta.url)), '../..'), original = resolve(study, '..')
const json = path => JSON.parse(fs.readFileSync(path))
const partial = process.argv.includes('--partial')
const dimensions = ['specificationCoverage', 'predicatesInvariants', 'traceability', 'codeOrganization', 'ownChecks']
const cohorts = [
  { slug: 'astra', root: resolve(original, 'main-study'), evidenceRoot: original, archiveBase: original },
  { slug: 'luna', root: resolve(original, 'luna-study') },
  ...['glm','deepseek','qwen'].map(slug => ({ slug, root: resolve(study, slug) })),
]
const archives = [], reviewed = [], missing = []
for (const cohort of cohorts) {
  const rows = json(resolve(cohort.root, 'analysis/reporting-results.json')).data
  if (!partial) assert.equal(rows.length, 72, `${cohort.slug} incomplete`)
  for (const row of rows) {
    const run = resolve(cohort.archiveBase || resolve(cohort.root, 'runtime'), 'runs', row.id)
    const manifest = json(resolve(run, 'archive-complete.json'))
    assert.equal(manifest.id, row.id)
    let hashed = 0
    for (const [file, entry] of Object.entries(manifest.files)) {
      assert.ok(!file.startsWith('/') && !file.split('/').includes('..'))
      const path = resolve(run, file)
      if (entry.kind === 'file') {
        assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'), entry.sha256, `${cohort.slug}/${row.id}/${file} changed`)
        hashed++
      } else if (entry.kind === 'symlink') {
        assert.ok(fs.lstatSync(path).isSymbolicLink())
        if (entry.target !== undefined) assert.equal(fs.readlinkSync(path), entry.target)
      }
    }
    const evaluation = json(resolve(run, 'evaluation-summary.json'))
    assert.equal(evaluation.id, row.id)
    archives.push({ slug: cohort.slug, id: row.id, hashedFiles: hashed })
    if (row.repetition !== 1) continue
    const path = resolve(cohort.root, 'analysis/reviews', row.id + '.json')
    if (!fs.existsSync(path)) {
      missing.push({ slug: cohort.slug, id: row.id }); assert.ok(partial, `Missing selected review: ${path}`); continue
    }
    const review = json(path)
    assert.equal(review.id, row.id)
    assert.deepEqual(review.dimensions.map(d=>d.dimension).sort(), [...dimensions].sort())
    assert.equal(review.humanReview, null); assert.equal(review.interRaterAgreement, null)
    let references = 0
    const dimensionsAndExamples = [...review.dimensions, review.finalFailureExample, review.developmentFailureExample].filter(Boolean)
    for (const item of dimensionsAndExamples) {
      if (item.dimension) { assert.ok(item.score === null || [0,1,2].includes(item.score)); assert.ok(item.rationale?.length > 20) }
      assert.ok(item.evidence?.length > 0)
      for (const ref of item.evidence) {
        let file = ref.split('#')[0].replace(/:\d+$/, '')
        assert.ok(!file.startsWith('/') && !file.split('/').includes('..'))
        assert.ok(fs.existsSync(resolve(cohort.evidenceRoot || cohort.root, file)), `Missing evidence: ${cohort.slug}/${row.id}/${ref}`)
        const line = ref.match(/:(\d+)$/)?.[1]
        if (line && !['astra','luna'].includes(cohort.slug)) assert.ok(Number(line) <= fs.readFileSync(resolve(cohort.root, file),'utf8').split('\n').length, `Invalid line reference: ${ref}`)
        const anchor = ref.split('#')[1]
        if (anchor && !['astra','luna'].includes(cohort.slug)) {
          const headings = fs.readFileSync(resolve(cohort.root, file),'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)
          const seen = new Map(), anchors = []
          for (const [, heading] of headings) {
            const base = heading.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s/g, '-')
            const count = seen.get(base) || 0
            anchors.push(base + (count ? '-' + count : '')); seen.set(base, count + 1)
          }
          assert.ok(anchors.includes(decodeURIComponent(anchor)), `Invalid heading reference: ${ref}`)
        }
        references++
      }
    }
    reviewed.push({ slug: cohort.slug, id: row.id, references, knownDimensions: review.dimensions.filter(d=>d.score !== null).length })
  }
}
if (!partial) { assert.equal(archives.length,360); assert.equal(reviewed.length,120); assert.equal(missing.length,0) }
const result = { at: new Date().toISOString(), partial, archives: archives.length, reviews: reviewed.length, missingSelectedReviews: missing, archiveChecks: archives, reviewChecks: reviewed, passed: true }
fs.writeFileSync(resolve(study, 'analysis/evidence-audit.json'), JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({ partial, passed:true, archives:archives.length, reviews:reviewed.length, missingSelectedReviews:missing.length }))
