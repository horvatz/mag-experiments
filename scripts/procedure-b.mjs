import assert from 'node:assert/strict'

export const roles = ['specification', 'implementation', 'review']
export const specificationFiles = ['docs/agent/specification.md', 'docs/agent/specification-history.md']
export const reviewFiles = ['docs/agent/review.md', 'docs/agent/review.json']

export function roleCanEdit(role, path) {
  if (role === 'specification') return specificationFiles.includes(path)
  if (role === 'review') return reviewFiles.includes(path)
  if (role === 'implementation') return /^(src|tests\/agent|docs\/agent)\//.test(path) && ![...specificationFiles, ...reviewFiles].includes(path)
  return false
}

export function roleConfiguration(base, app, role) {
  assert.ok(roles.includes(role))
  const config = structuredClone(base)
  const paths = config['permissions.pilot'].filesystem[app]
  paths.src = role === 'implementation' ? 'write' : 'read'
  paths['tests/agent'] = role === 'implementation' ? 'write' : 'read'
  paths['docs/agent'] = role === 'implementation' ? 'write' : 'read'
  for (const path of specificationFiles) paths[path] = role === 'specification' ? 'write' : 'read'
  for (const path of reviewFiles) paths[path] = role === 'review' ? 'write' : 'read'
  return config
}

export const workflow = {
  version: 'B/0.3',
  totalSeconds: 1200,
  implementationMinimumSeconds: 480,
  reviewReserveSeconds: 240,
  repairReserveSeconds: 120,
  specificationRepairSeconds: 90,
  maxReviewCycles: 1,
}

// Budgets use one monotonic clock. Early finishes return time to later phases.
export function phaseBudget(phase, remaining, policy = workflow) {
  const time = Math.max(0, remaining)
  if (phase === 'specification') return Math.max(0, time - policy.implementationMinimumSeconds - policy.reviewReserveSeconds - policy.repairReserveSeconds)
  if (phase === 'implementation') return Math.max(0, time - policy.reviewReserveSeconds - policy.repairReserveSeconds)
  if (phase === 'review') return Math.max(0, time - policy.repairReserveSeconds)
  if (phase === 'specification-repair') return Math.min(policy.specificationRepairSeconds, Math.max(0, time - 30))
  if (phase === 'implementation-repair') return time
  throw new Error('Unknown phase: ' + phase)
}

export function parseReview(value, requirements = Array.from({ length: 10 }, (_, i) => 'R' + String(i + 1).padStart(2, '0'))) {
  assert.ok(value && typeof value === 'object')
  assert.equal(value.complete, true, 'A draft is not a completed review')
  assert.deepEqual([...value.checkedRequirements].sort(), requirements, 'The reviewer must assess every task requirement exactly once')
  assert.ok(Array.isArray(value.unverified) && value.unverified.every((item) => typeof item === 'string'))
  for (const key of ['specificationChangesRequired', 'codeChangesRequired']) assert.equal(typeof value[key], 'boolean', 'Missing boolean ' + key)
  assert.equal(typeof value.summary, 'string')
  assert.ok(Array.isArray(value.findings))
  for (const finding of value.findings) {
    assert.ok(['specification', 'implementation'].includes(finding.target))
    for (const key of ['requirement', 'problem', 'requestedChange']) assert.equal(typeof finding[key], 'string')
  }
  for (const [target, key] of [['specification', 'specificationChangesRequired'], ['implementation', 'codeChangesRequired']]) {
    assert.equal(value[key], value.findings.some((item) => item.target === target), 'Findings and flags disagree for ' + target)
  }
  return value
}

export const reviewSchema = {
  type: 'object', additionalProperties: false,
  required: ['complete', 'checkedRequirements', 'unverified', 'specificationChangesRequired', 'codeChangesRequired', 'summary', 'findings'],
  properties: {
    complete: { type: 'boolean' },
    checkedRequirements: { type: 'array', items: { type: 'string', enum: Array.from({ length: 10 }, (_, i) => 'R' + String(i + 1).padStart(2, '0')) } },
    unverified: { type: 'array', items: { type: 'string' } },
    specificationChangesRequired: { type: 'boolean' }, codeChangesRequired: { type: 'boolean' }, summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['target', 'requirement', 'problem', 'requestedChange'], properties: {
      target: { type: 'string', enum: ['specification', 'implementation'] }, requirement: { type: 'string' }, problem: { type: 'string' }, requestedChange: { type: 'string' },
    } } },
  },
}

export function workerArguments({ configArgs, app, session, review = false, schema, output }) {
  const flags = ['--ignore-user-config', '--ignore-rules', '--skip-git-repo-check', '--json', ...configArgs]
  if (review) flags.push('--output-schema', schema, '--output-last-message', output)
  return session ? ['exec', 'resume', ...flags, session, '-'] : ['exec', ...flags, '--color', 'never', '-C', app, '-']
}

// Control flow is deterministic and testable without spending model tokens.
export async function runBWorkflow({ phase, hasSpecification, getReview, requirements }) {
  if (!await phase('specification', 'specification')) return { status: 'phase_stopped' }
  if (!hasSpecification()) return { status: 'missing_specification' }
  if (!await phase('implementation', 'implementation')) return { status: 'phase_stopped' }
  if (!await phase('review', 'review')) return { status: 'phase_stopped' }
  let review
  try { review = parseReview(getReview(), requirements) }
  catch (error) { return { status: 'invalid_review_handoff', error: error.message } }
  if (review.specificationChangesRequired && !await phase('specification-repair', 'specification', true)) return { status: 'phase_stopped', review }
  if ((review.codeChangesRequired || review.specificationChangesRequired) && !await phase('implementation-repair', 'implementation', true)) return { status: 'phase_stopped', review }
  return { status: 'completed', review }
}

const common = `Pilot P01, postopek B: trije ločeni agenti si zaporedno predajo specifikacijo, implementacijo in pregled. Vsak ima svojo zgodovino; popravke opravi prvotni avtor v nadaljevani seji. Skupaj je na voljo največ 20 minut, vključno s predajami. Ne zaganjaj drugih agentov.

Preberi PROJECT_RULES.md, task/instructions.md in task/specification-template.md. Izvirne zahteve ostajajo obvezne tudi, če jih predana specifikacija izpusti. Ohrani obstoječi dizajn. Dovoljeni so samo izvoz in lokalne storitve te naloge. Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi.

V svoji vlogi najprej shrani uporaben začetni zapis, nato ga dopolnjuj. Ko opraviš obveznosti vloge, zaključi z jedrnatim končnim odgovorom. Rok faze je naveden spodaj. Čas lahko preveriš z node task/time-budget.mjs; preveri ga pred daljšim preverjanjem in vsaj 60 sekund pred rokom zaključi zapis predaje.
`

const testing = `Odvisnosti in Chromium so že nameščeni. npm run check preveri slog, tipe, gradnjo in vse dostopne teste: 38 osnovnih, 8 razvojnih P01 in lastne teste. Lastne teste dodajaj v tests/agent/. Samo razvojne teste zaženeš z npx playwright test --project=development-desktop --project=development-mobile. Testni strežnik uporablja 5174/3102. Za ročni ogled uporabi WEB_PORT=5193 API_PORT=3123 npm run dev. V lastnih skriptah preberi wsEndpoint iz task/browser.json in uporabi chromium.connect(wsEndpoint); chromium.launch() v tem okolju ne deluje. Javni internet je blokiran. Omejitve okolja zabeleži.
`

export const prompts = {
  specification: common + `
Tvoja vloga: pripravi kratko, preverljivo specifikacijo po skupni predlogi. Ciljaj na približno 2–3 minute. Najprej preberi navodila in predlogo ter zapiši osnutek docs/agent/specification.md, nato preveri relevantne podatkovne tipe in izvorno kodo ter dopolni pogoje R01–R10. Po potrebi vodi docs/agent/specification-history.md. To sta tvoji edini datoteki za pisanje. Predaj jasne pogoje, ki jih implementer lahko uporabi in preveri. V tej vlogi so naloge branje navodil/kode ter pisanje specifikacije; zagon aplikacije, testi in pregled videza pripadajo implementerju. Ko dokument zajame vse zahteve in predpostavke, ga shrani ter takoj zaključi.
`,
  implementation: common + testing + `
Tvoja vloga: preberi predano docs/agent/specification.md, implementiraj zahteve in preveri rešitev. Spreminjaš lahko src/, tests/agent/ in svoje zapise v docs/agent/. Specifikacije, njene zgodovine in review.md/review.json ne spreminjaj. Že na začetku ustvari docs/agent/verification.md z načrtovanimi in še neizvedenimi preverjanji. Sproti zapisuj spremembe, povezave z zahtevami, dejanske rezultate ter omejitve. Morebitno napako specifikacije opiši v svojem poročilu. Po končanem preverjanju shrani rezultate in zaključi, da čas prevzame pregledovalec. Zadnjih šest minut skupnega časa je rezerviranih za pregled in popravke.
`,
  review: common + testing + `
Tvoja vloga: neodvisno primerjaj specifikacijo, kodo, teste in verification.md z R01–R10. Pišeš samo docs/agent/review.json ter po želji review.md. Po branju navodil najprej zapiši osnutek review.json: {"complete":false,"checkedRequirements":[],"unverified":[],"specificationChangesRequired":false,"codeChangesRequired":false,"summary":"Pregled poteka.","findings":[]}. Nato ga sproti dopolnjuj ob vsaki pregledani zahtevi. Osredotoči se na konkretne napake glede zahtev. Ugotovitve imajo target (specification ali implementation), requirement (oznaka zahteve), problem in requestedChange (besedila). Zastavici sta true natanko takrat, ko obstaja ugotovitev za ustrezni target.

Najprej preglej in zapiši ugotovitve nad vsemi desetimi zahtevami, nato po potrebi ponovi ustrezne dostopne teste. Že izvedenih preverjanj ni treba ponavljati brez konkretnega razloga. Rezultate, ki jih nisi sam preveril, jasno označi. Pred dodatnim raziskovanjem shrani trenutno predajo in preveri preostali čas. Ko je pregled končan, nastavi complete:true, v checkedRequirements navedi R01–R10, v unverified pa omejitve preverjanja. Brez konkretnih ugotovitev ostaneta obe zastavici false in findings prazen. Končni odgovor mora biti isti končni objekt JSON po dani shemi. Izvajalnik ga shrani kot tvojo predajo; ne dopisuje ugotovitev. Ne popravljaj kode ali specifikacije. Po končni predaji takoj zaključi.
`,
  'specification-repair': common + `
Nadaljuj kot isti avtor specifikacije. Preberi review.json in obravnavaj ugotovitve o specifikaciji glede na izvirne zahteve. Utemeljene napake popravi v specification.md, spremembe oziroma obrazložene zavrnitve pa zapiši v specification-history.md. Kode in testov ne spreminjaj. Shrani predajo in zaključi čim prej.
`,
  'implementation-repair': common + testing + `
Nadaljuj kot isti avtor implementacije. Preberi review.json, trenutno specifikacijo in njeno zgodovino. Obravnavaj vsako ugotovitev: utemeljeno napako odpravi, neutemeljeno obrazloženo zavrni. Ne spreminjaj specifikacije ali pregleda. Izvedi ustrezna preverjanja ter v verification.md sproti zapisuj obravnavo ugotovitev in rezultate. Zaključi v preostalem skupnem času.
`,
}
