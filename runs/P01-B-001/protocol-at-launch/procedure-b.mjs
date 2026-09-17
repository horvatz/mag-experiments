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
  totalSeconds: 1200,
  specificationSeconds: 180,
  implementationReserveSeconds: 300,
  reviewSeconds: 180,
  repairReserveSeconds: 120,
  specificationRepairSeconds: 60,
  maxReviewCycles: 1,
}

// Budgets use one monotonic clock. Early finishes return time to later phases.
export function phaseBudget(phase, remaining, policy = workflow) {
  const time = Math.max(0, remaining)
  if (phase === 'specification') return Math.min(policy.specificationSeconds, time)
  if (phase === 'implementation') return Math.max(0, time - policy.implementationReserveSeconds)
  if (phase === 'review') return Math.max(0, Math.min(policy.reviewSeconds, time - policy.repairReserveSeconds))
  if (phase === 'specification-repair') return Math.min(policy.specificationRepairSeconds, Math.max(0, time - 30))
  if (phase === 'implementation-repair') return time
  throw new Error('Unknown phase: ' + phase)
}

export function parseReview(value) {
  assert.ok(value && typeof value === 'object')
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

const common = `To je pilot P01 po postopku B: trije ločeni agenti zaporedno pripravijo specifikacijo, implementacijo in pregled. Vsak ima svojo zgodovino pogovora. Predaja med vlogami poteka samo prek datotek; pri popravkih se nadaljuje seja prvotnega avtorja. Skupni čas vseh faz, tudi predaj, je največ 20 minut. Ne zaganjaj drugih agentov.\n\nPreberi PROJECT_RULES.md, task/instructions.md in task/specification-template.md. Izvirne zahteve so obvezne tudi, če jih predana specifikacija izpusti. Referenčna rešitev in končni testi niso dostopni. Ohraniti moraš obstoječi dizajn. To je svež izvoz brez zgodovine Git. Ne spreminjaj odvisnosti, infrastrukture ali skupnih testov.\n\nOdvisnosti in Chromium so nameščeni. npm run check preveri kodo in vse dostopne teste (38 osnovnih preverjanj, 8 razvojnih preverjanj P01 in lastne teste v tests/agent/). Samo skupne razvojne teste zaženeš z npx playwright test --project=development-desktop --project=development-mobile. Testi uporabljajo vrata 5174/3102. Za ročni ogled uporabi WEB_PORT=5193 API_PORT=3123 npm run dev. Za lastne skripte preberi wsEndpoint iz task/browser.json in uporabi chromium.connect(wsEndpoint); chromium.launch() v tem okolju ne deluje. Dostop do javnega interneta je blokiran. Uporabljaj samo lokalne storitve te naloge. Omejitve okolja zabeleži in uporabi drug dovoljen način.\n`

export const prompts = {
  specification: common + `\nTvoja vloga je priprava specifikacije. Preglej začetno aplikacijo in razčleni zahteve po skupni predlogi. Zapiši docs/agent/specification.md. Po potrebi vodi docs/agent/specification-history.md. To sta edini datoteki, ki ju smeš spreminjati. Ne implementiraj rešitve. Specifikacija naj bo dovolj jasna za drugega agenta in naj vsebuje preverljive pogoje. Za to fazo imaš največ 3 minute; zaključi prej, ko je specifikacija pripravljena.\n`,
  implementation: common + `\nTvoja vloga je implementacija. Preberi docs/agent/specification.md in pripravi rešitev po zahtevah. Spreminjaj src/, tests/agent/ in svoje zapise v docs/agent/. Specifikacije, njene zgodovine in review.md/review.json ne spreminjaj; morebitne težave v specifikaciji navedi v verification.md. Lastne teste dodaj v tests/agent/. V docs/agent/verification.md zapiši dejansko izvedena preverjanja, rezultate, povezave z zahtevami in omejitve. Rešitev predaj pregledovalcu. Zadnjih 5 minut skupnega časa je rezerviranih za pregled in morebitne popravke. Končaj prej, ko opraviš svoje delo.\n`,
  review: common + `\nTvoja vloga je neodvisni pregled. Preberi specifikacijo, implementacijo, lastne teste in verification.md. Primerjaj jih z izvirnimi zahtevami in preveri konkretne napake; po potrebi zaženi dostopna preverjanja. Ne spreminjaj kode, testov ali specifikacije. Pišeš lahko samo docs/agent/review.md in docs/agent/review.json. Osredotoči se na napake glede zahtev, ne na osebne slogovne želje. Na voljo imaš največ 3 minute.\n\nV review.md zapiši ugotovitve in dejansko izvedena preverjanja. Obvezno napiši veljaven review.json v obliki {"specificationChangesRequired":false,"codeChangesRequired":false,"summary":"...","findings":[]}. Vsaka ugotovitev vsebuje target ("specification" ali "implementation"), requirement (oznaka zahteve), problem in requestedChange (besedila). Zastavica je true natanko takrat, ko obstaja ugotovitev za ustrezni target. Če ne ugotoviš konkretne napake, vrni prazne findings in false zastavici. Izvajalnik bo po teh zastavicah samodejno predal popravke prvotnima avtorjema; dodatne razlage izvajalca ne bo.\n`,
  'specification-repair': `Nadaljuj kot isti avtor specifikacije v pilotu B. Preberi docs/agent/review.json in review.md ter ugotovitve o specifikaciji obravnavaj glede na izvirne zahteve. Utemeljene napake popravi v docs/agent/specification.md, odločitve in spremembe zabeleži v docs/agent/specification-history.md. Če ugotovitev ni utemeljena, obrazloži zakaj. Kode in testov ne spreminjaj. Največ 60 sekund, znotraj preostalega skupnega časa.\n`,
  'implementation-repair': `Nadaljuj kot isti avtor implementacije v pilotu B. Preberi docs/agent/review.json, review.md in trenutno specifikacijo. Utemeljene napake odpravi, neutemeljene obrazloženo zavrni. Ne spreminjaj specifikacije ali zapisov pregledovalca. Po popravkih zaženi ustrezna preverjanja ter posodobi docs/agent/verification.md z rezultati in obravnavo vsake ugotovitve. Na voljo je preostanek skupne omejitve 20 minut. Končna predaja so datoteke ob zaključku oziroma ob izteku časa.\n`,
}
