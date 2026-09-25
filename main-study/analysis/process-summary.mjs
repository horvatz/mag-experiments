// Descriptive reporting of recorded handoffs; no model calls or archive edits.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

export function writeProcessSummary(data, root, output) {
  const rows = data.data.map(run => {
    const folder = resolve(root, 'runs', run.id)
    const execution = JSON.parse(readFileSync(resolve(folder, 'execution.json')))
    const phases = execution.phases ?? []
    const handoffs = phases.flatMap((phase, index) => {
      if (!phase.handoffSource) return []
      assert.ok(['review', 'converge'].includes(phase.name))
      const path = `phases/${String(index + 1).padStart(2, '0')}-${phase.name}/final-response.json`
      const bytes = readFileSync(resolve(folder, path))
      assert.equal(createHash('sha256').update(bytes).digest('hex'), phase.handoffSha256)
      assert.equal(phase.status, 'completed')
      assert.ok(!phase.handoffError)
      return [{ phase: phase.name, evidence: `runs/${run.id}/${path}`, response: JSON.parse(bytes) }]
    })
    const review = handoffs.find(h => h.phase === 'review')?.response
    if (review) assert.deepEqual(review, execution.review)
    const convergences = handoffs.filter(h => h.phase === 'converge').map(h => h.response.outcome)
    const count = name => phases.filter(p => p.name === name).length
    const completed = name => phases.filter(p => p.name === name && p.status === 'completed').length
    return {
      id: run.id, procedure: run.procedure, executionStatus: execution.status,
      reviewStarted: run.procedure === 'B' ? count('review') : null,
      validatedReview: run.procedure === 'B' ? Boolean(review) : null,
      specificationRepairRequested: review?.specificationChangesRequired ?? null,
      codeRepairRequested: review?.codeChangesRequired ?? null,
      reviewFindings: review?.findings.length ?? null,
      specificationRepairStarted: run.procedure === 'B' ? count('specification-repair') : null,
      specificationRepairCompleted: run.procedure === 'B' ? completed('specification-repair') : null,
      implementationRepairStarted: run.procedure === 'B' ? count('implementation-repair') : null,
      implementationRepairCompleted: run.procedure === 'B' ? completed('implementation-repair') : null,
      convergenceStarted: run.procedure === 'C' ? count('converge') : null,
      validatedConvergenceOutcomes: run.procedure === 'C' ? convergences : null,
      additionalImplementationStarted: run.procedure === 'C' ? Math.max(0, count('implement') - 1) : null,
      additionalImplementationCompleted: run.procedure === 'C' ? phases.filter(p => p.name === 'implement').slice(1).filter(p => p.status === 'completed').length : null,
      evidence: `runs/${run.id}/execution.json`, handoffEvidence: handoffs.map(h => h.evidence)
    }
  })
  const b = rows.filter(r => r.procedure === 'B'), c = rows.filter(r => r.procedure === 'C')
  const sum = (records, key) => records.reduce((n, r) => n + r[key], 0)
  const summary = {
    sourceGeneratedAt: data.generatedAt, archived: data.archived, planned: data.planned, complete: data.complete,
    definitions: {
      scope: 'Recorded formal handoffs and return phases only; not the number of code changes, test retries, development defects, or independently confirmed failures.',
      validatedHandoff: 'Completed review/converge phase with runner-accepted structured response and matching archived SHA-256.',
      missing: 'No validated review means requested changes and findings are unknown, not zero. Procedure A has no separate review/converge handoff; corresponding fields are null.',
      comparison: 'B reviewer requests and C appended tasks have different meanings. No cross-procedure quality score or causal effect is inferred.',
      B: 'A specification correction also routes back through implementation. No second formal review is scheduled after repairs.',
      C: 'Additional implementation means the second implement phase. Convergence outcomes preserve every validated pass, not just the final result.'
    },
    B: { archived: b.length, reviewsStarted: sum(b, 'reviewStarted'), validatedReviews: b.filter(r => r.validatedReview).length,
      withoutValidatedReview: b.filter(r => !r.validatedReview).length,
      runsRequestingSpecificationRepair: b.filter(r => r.specificationRepairRequested === true).length,
      runsRequestingCodeRepair: b.filter(r => r.codeRepairRequested === true).length,
      specificationRepairsStarted: sum(b, 'specificationRepairStarted'), specificationRepairsCompleted: sum(b, 'specificationRepairCompleted'),
      implementationRepairsStarted: sum(b, 'implementationRepairStarted'), implementationRepairsCompleted: sum(b, 'implementationRepairCompleted') },
    C: { archived: c.length, convergencePassesStarted: sum(c, 'convergenceStarted'),
      validatedConvergencePasses: c.reduce((n, r) => n + r.validatedConvergenceOutcomes.length, 0),
      withoutValidatedConvergence: c.filter(r => !r.validatedConvergenceOutcomes.length).length,
      outcomes: Object.fromEntries(['converged', 'tasks_appended', 'blocked'].map(outcome => [outcome, c.reduce((n, r) => n + r.validatedConvergenceOutcomes.filter(o => o === outcome).length, 0)])),
      additionalImplementationStarted: sum(c, 'additionalImplementationStarted'), additionalImplementationCompleted: sum(c, 'additionalImplementationCompleted') },
    rows
  }
  writeFileSync(resolve(output, 'process-summary.json'), JSON.stringify(summary, null, 2) + '\n')
  writeFileSync(resolve(output, 'process-summary.md'), [
    '# Zabeležene predaje in povratni koraki', '',
    `Posnetek ${data.generatedAt}; ${data.archived}/${data.planned} arhivov. ${data.complete ? 'Vse načrtovane izvedbe so arhivirane.' : 'Nepopolna zbirka; opis trenutno arhiviranih izvedb.'}`, '',
    'Štejemo samo formalne faze in predaje izvajalnika. Popravki kode, testnih pričakovanj ali priprave podatkov znotraj ene faze niso povratni korak izvajalnika. Ti števci niso število razvojnih napak, potrjenih funkcionalnih napak ali ocena kakovosti. A nima ločenega pregledovalca oziroma konvergence; zanj ne navajamo navidezno primerljivih ničel.', '',
    '## Postopek B', '',
    '| Zapis | Število |', '| --- | --- |',
    `| Arhivirane izvedbe | ${summary.B.archived} |`,
    `| Začeti pregledi | ${summary.B.reviewsStarted} |`,
    `| Potrjene strukturirane predaje pregleda | ${summary.B.validatedReviews} |`,
    `| Izvedbe brez potrjene predaje pregleda | ${summary.B.withoutValidatedReview} |`,
    `| Predaje z zahtevano korekcijo specifikacije | ${summary.B.runsRequestingSpecificationRepair} |`,
    `| Predaje z zahtevano korekcijo kode | ${summary.B.runsRequestingCodeRepair} |`,
    `| Začete / zaključene korekcije specifikacije | ${summary.B.specificationRepairsStarted} / ${summary.B.specificationRepairsCompleted} |`,
    `| Začete / zaključene korekcije implementacije | ${summary.B.implementationRepairsStarted} / ${summary.B.implementationRepairsCompleted} |`, '',
    'Zahteve za korekcijo so znane le pri potrjeni predaji. Odsotna ali neveljavna predaja ni potrditev, da ni bilo napak. Popravek specifikacije sproži tudi ponovno predajo implementerju, četudi zastavica za popravek kode ni nastavljena. Protokol po povratnem popravku ne načrtuje drugega formalnega pregleda.', '',
    '## Postopek C', '',
    '| Zapis | Število |', '| --- | --- |',
    `| Arhivirane izvedbe | ${summary.C.archived} |`,
    `| Začeti koraki converge | ${summary.C.convergencePassesStarted} |`,
    `| Potrjene strukturirane predaje converge | ${summary.C.validatedConvergencePasses} |`,
    `| Izvedbe brez potrjene predaje converge | ${summary.C.withoutValidatedConvergence} |`,
    ...Object.entries(summary.C.outcomes).map(([outcome, n]) => `| Izid ${outcome} | ${n} |`),
    `| Začete / zaključene dodatne implementacije | ${summary.C.additionalImplementationStarted} / ${summary.C.additionalImplementationCompleted} |`, '',
    'Izidi veljajo za posamezne potrjene korake; ena izvedba lahko vsebuje dva. Dodatna implementacija pomeni drugi korak implement po pripetih nalogah. B-jev pregled in C-jeva konvergenca sta različna postopkovna dogodka in njunih števcev ne razlagamo kot vzročne razlike v kakovosti.', '',
    'Podrobnosti, statusi in povezave do vsake izvirne predaje so v [process-summary.json](process-summary.json). Časi faz in predaj so v [phase-data.csv](phase-data.csv). Vse arhivske datoteke ostajajo nespremenjene.', ''
  ].join('\n'))
  return summary
}
