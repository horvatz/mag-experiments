import assert from 'node:assert/strict'

export const feature = 'docs/agent/P01'
export const stages = ['constitution', 'specify', 'plan', 'tasks', 'implement', 'converge']
export const vendorName = 'spec-kit-1.0.8-lean'
export const workflow = { version: 'C/0.2', totalSeconds: 1200, convergenceReserveSeconds: 120, maxConvergencePasses: 2, preset: 'lean/1.0.0' }
export function assertLocalSkillCatalog(snapshot, app) {
  const texts = JSON.parse(snapshot).flatMap(item => (item.content || []).map(part => part.text || ''))
  const catalogs = texts.filter(text => text.includes('### Available skills'))
  assert.equal(catalogs.length, 1, 'Expected only the local Spec Kit catalog')
  const catalog = catalogs[0]
  const roots = [...catalog.matchAll(/^- `(r\d+)` = `([^`]+)`$/gm)]
  assert.equal(roots.length, 1, 'Unexpected skill roots')
  assert.equal(roots[0][2], app + '/.agents/skills', 'Host skill root exposed')
  const section = catalog.split('### Available skills\n')[1].split('</skills_instructions>')[0]
  const lines = section.trim().split('\n')
  const expected = ['analyze', 'checklist', 'clarify', 'constitution', 'converge', 'implement', 'plan', 'specify', 'tasks', 'taskstoissues'].map(name => 'speckit-' + name).sort()
  const names = lines.map(line => {
    const match = /^- (speckit-[a-z]+):.*\(file: (r\d+)\/(speckit-[a-z]+)\/SKILL\.md\)$/.exec(line)
    assert.ok(match, 'Unexpected skill catalog entry')
    assert.equal(match[2], roots[0][1]); assert.equal(match[1], match[3])
    return match[1]
  }).sort()
  assert.deepEqual(names, expected, 'Unexpected skill set')
}
export function phaseBudget(stage, remaining, policy = workflow) {
  assert.ok(stages.includes(stage))
  return Math.max(0, remaining - (stage === 'implement' ? policy.convergenceReserveSeconds : 0))
}
export function stageCanEdit(stage, path) {
  if (stage === 'constitution') return path === '.specify/memory/constitution.md'
  if (stage === 'converge') return [feature + '/tasks.md', 'docs/agent/convergence.json'].includes(path)
  if (path === '.specify/feature.json') return ['specify', 'plan', 'tasks', 'implement'].includes(stage)
  if (path.startsWith('docs/agent/')) return ['specify', 'plan', 'tasks', 'implement'].includes(stage)
  return stage === 'implement' && /^(src|tests\/agent)\//.test(path)
}
export function stageConfiguration(base, app, stage) {
  assert.ok(stages.includes(stage))
  const config = structuredClone(base)
  const paths = config['permissions.pilot'].filesystem[app]
  for (const path of ['src', 'tests/agent', 'docs/agent']) paths[path] = stageCanEdit(stage, path + '/probe') ? 'write' : 'read'
  for (const path of ['.specify/memory/constitution.md', '.specify/feature.json', feature + '/tasks.md', 'docs/agent/convergence.json']) paths[path] = stageCanEdit(stage, path) ? 'write' : 'read'
  return config
}
export const convergenceSchema = {
  type: 'object', additionalProperties: false, required: ['outcome', 'summary', 'unverified'],
  properties: { outcome: { type: 'string', enum: ['converged', 'tasks_appended', 'blocked'] }, summary: { type: 'string' }, unverified: { type: 'array', items: { type: 'string' } } },
}
export function parseConvergence(value, beforeTasks, afterTasks) {
  assert.ok(value && ['converged', 'tasks_appended', 'blocked'].includes(value.outcome))
  assert.equal(typeof value.summary, 'string')
  assert.ok(Array.isArray(value.unverified) && value.unverified.every(item => typeof item === 'string'))
  if (value.outcome === 'converged') {
    assert.equal(afterTasks, beforeTasks, 'A clean convergence must not alter tasks')
    assert.ok(!/^\s*[-*] \[ \]/m.test(afterTasks), 'Convergence cannot approve unfinished tasks')
  } else if (value.outcome === 'tasks_appended') {
    assert.ok(afterTasks.startsWith(beforeTasks), 'Convergence may only append tasks')
    assert.match(afterTasks.slice(beforeTasks.length), /^\s*- \[ \] \[?T\d+/m, 'Missing appended task')
  } else assert.equal(afterTasks, beforeTasks, 'Blocked convergence must preserve existing tasks')
  return value
}
export const requiredArtifacts = {
  constitution: ['.specify/memory/constitution.md'], specify: [feature + '/spec.md'],
  plan: [feature + '/plan.md'], tasks: [feature + '/tasks.md'], implement: ['docs/agent/verification.md'], converge: ['docs/agent/convergence.json'],
}
export async function runCWorkflow({ phase, getConvergence }, policy = workflow) {
  for (const stage of stages.slice(0, 4)) if (!await phase(stage)) return 'phase_stopped'
  for (let pass = 0; pass < policy.maxConvergencePasses; pass++) {
    if (!await phase('implement') || !await phase('converge')) return 'phase_stopped'
    const result = getConvergence()
    if (result.outcome === 'converged') return 'completed'
    if (result.outcome === 'blocked') return 'convergence_blocked'
    if (result.outcome !== 'tasks_appended') return 'invalid_convergence_handoff'
  }
  return 'convergence_incomplete'
}

const common = `Pilot P01, postopek C, Spec Kit 1.0.8 z uradnim presetom Lean 1.0.0. Vse korake opravljaš kot isti agent z ohranjeno zgodovino. Ne zaganjaj drugih agentov. Izvajalnik samodejno sproži naslednji korak po tvojem končnem odgovoru. V tem turnu opravi samo navedeni korak. Za celoten potek, vključno s pripravo specifikacije in načrta ter predajami, je na voljo največ 20 minut. Sproti shrani delo; preostanek preveri z node task/time-budget.mjs. Zadnjo minuto svojega roka nameni predaji. Končaj prej, ko korak opraviš.

Preberi PROJECT_RULES.md, task/instructions.md in task/specification-template.md. Izvirne zahteve so merilo, tudi če jih tvoja specifikacija izpusti. Skupno predlogo lahko izpolniš s povezavami na dokumente Spec Kit. Ohraniti moraš potrjeni dizajn Folio. Spreminjaš samo src/, tests/agent/, docs/agent/ in dve procesni datoteki Spec Kit: .specify/memory/constitution.md ter .specify/feature.json. Ta izrecna dopolnitev dovoljuje dokumente postopka C; osnovna koda, testi in infrastruktura imajo iste meje kot drugi postopki. Nastavitve, odvisnosti, strežnik, skupni testi, uradne predloge in datoteke veščin so samo berljivi. Predloge ne dovoljujejo širjenja obsega naloge ali spreminjanja infrastrukture.

Uporabi priloženo uradno veščino iz .agents/skills/speckit-<korak>/SKILL.md: preberi jo in izvedi njena navodila z argumenti spodaj. Gostiteljeve veščine so izključene; to so lokalne datoteke Spec Kit za to nalogo. Pot funkcionalnosti je že izrecno določena: docs/agent/P01 (SPECIFY_FEATURE_DIRECTORY); dodatno vprašanje za izbiro te poti ni potrebno. SPECIFY_INIT_DIR kaže na izvoz. Git razširitev in druge razširitve niso nameščene. Lean uporablja neposredna navodila brez obveznega izpolnjevanja ločenih splošnih predlog; skupna predloga P01 in vseh deset zahtev ostajata obvezni. Dokazila piši sproti in jedrnato; dokumentov ne podvajaj. Ne ustvarjaj vej ali commitov. Raziskovanje pomeni pregled lokalne kode in priloženih navodil; javni internet in druga gradiva niso dostopni. Odprta vprašanja rešuj iz obstoječih zahtev; če bistvenega podatka ni, jasno navedi omejitev in se ustavi, ne izmisli si uporabnikovega odgovora.
`
const testing = `Odvisnosti in Chromium so nameščeni. npm run check preveri slog, tipe, gradnjo, 38 osnovnih in 8 razvojnih preverjanj P01 ter lastne teste iz tests/agent/. Testi uporabljajo 5174/3102. Za ročni ogled uporabi WEB_PORT=5193 API_PORT=3123 npm run dev. Lastne skripte naj preberejo wsEndpoint iz task/browser.json ter uporabijo chromium.connect(wsEndpoint); chromium.launch() ne deluje. Rezultate in sledljivost zahtev zapiši v docs/agent/verification.md. Nedostopnih končnih testov ne navajaj kot izvedenih.
`
const argumentsByStage = {
  constitution: 'Iz PROJECT_RULES.md in skupne predloge oblikuj kratka projektna načela. Ne dodajaj novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev. Datum sprejetja je datum tega pilota. Ciljaj na približno minuto; samo projektna pravila, brez implementacije.',
  specify: 'Celotna zahtevana funkcionalnost P01 je v task/instructions.md. Izdelaj specifikacijo za vse R01–R10 v docs/agent/P01/spec.md. Vključi pravila sprememb stanja iz skupne predloge; po potrebi poveži dodatni dokument. Ciljaj na približno tri minute. Ne ustvarjaj dodatnih funkcionalnih zahtev ali zunanjih meritev.',
  plan: 'Načrtuj P01 v obstoječi React/TypeScript/Vite aplikaciji z nameščenimi odvisnostmi in danim javnim API-jem. Ohraniti moraš infrastrukturo in dizajn. Izdelaj jedrnat plan.md po Lean veščini, z relevantnimi odločitvami in datotekami. Ciljaj na približno dve minuti.',
  tasks: 'Iz specifikacije in načrta pripravi kratek zaporedni seznam izvedljivih nalog, vključno s preverjanji iz skupne predloge in smiselno izbranimi lastnimi testi. Uporabi oznake T001, T002 itd. Naloga je majhna sprememba obstoječega vmesnika. Ciljaj na približno minuto. Ne implementiraj še kode.',
  implement: testing + 'Izvedi naloge iz tasks.md in preveri rešitev. Označi le dejansko opravljene naloge. Na začetku ustvari verification.md, nato vanj sproti zapisuj rezultate in omejitve. Če je to ponovljeni korak, obravnavaj tudi naloge, ki jih je dodal zaključni pregled. Ne spreminjaj označb kontrolnega seznama kakovosti zahtev v tem koraku. Ob neizpolnjeni obvezni zahtevi se ustavi in pojasni razlog. Končaj s kratkim poročilom; naslednji korak converge vodi izvajalnik.',
  converge: 'Preveri skladnost kode s specifikacijo, načrtom in nalogami. Uporabi uradni postopek converge: kode ne spreminjaj; morebitne nove naloge le pripni na konec tasks.md. Že izvedenih testov ni treba ponavljati brez razloga; loči pregled dokazil od lastnega zagona. Končni odgovor naj bo objekt JSON po podani shemi: outcome je converged, tasks_appended ali blocked; summary vsebuje ugotovitve, unverified pa nepreverjeno. Izvajalnik shrani ta odgovor brez sprememb. Če je izid tasks_appended, bo po preostalem času sam nadaljeval implementacijo v isti seji.',
}
export const prompts = Object.fromEntries(stages.map(stage => [stage, common + `\nKorak: $speckit-${stage}. Preberi .agents/skills/speckit-${stage}/SKILL.md in ga izvedi.\nArgumenti: ${argumentsByStage[stage]}\n`]))
