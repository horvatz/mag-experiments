# Dokazi glm P09-C-001

Raziskovalčev prepis nespremenjenega arhiva, ne nov zagon testov ali modelova oddaja. Izpis ni nadomestilo za branje dejanskih avtorskih datotek. Native in poznejši API vhodi se lahko podvajajo.

## 01-constitution-item_3

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "set -e
printf '%s\\n' '--- PROJECT_RULES.md ---'
cat PROJECT_RULES.md
printf '%s\\n' '--- task/instructions.md ---'
cat task/instructions.md
printf '%s\\n' '--- task/specification-template.md ---'
cat task/specification-template.md
printf '%s\\n' '--- .agents/skills/speckit-constitution/SKILL.md ---'
cat .agents/skills/speckit-constitution/SKILL.md
printf '%s\\n' '--- time budget ---'
node task/time-budget.mjs"
--- PROJECT_RULES.md ---
# Skupna pravila dela v aplikaciji

To je začetna aplikacija za pilot P09. Konkretne zahteve prejme agent skupaj
z nalogo; ta dokument določa izhodišče in mejo dovoljenih sprememb.

## Dovoljene spremembe

- Koda uporabniškega vmesnika v `src/`, vključno s slogi in uporabo javnega API-ja.
- Lastni dodatni testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`.

Začetni podatki, strežnik v `server/`, skupni tipi v `shared/`, skupni testi
`tests/baseline.spec.ts` in `tests/api.spec.ts`, odvisnosti ter nastavitve
zagona in preverjanja ostanejo enaki. Sprememba skupne infrastrukture zahteva
enako, vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

## Pričakovano delo

1. Preberi zahteve naloge in uporabi priloženo predlogo specifikacije.
2. Dopolni obstoječi vmesnik; ohrani slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`.
3. Podatke beri in shranjuj prek javnega vmesnika `/api/`. Izbiraj po `id`.
4. Preveri rešitev s skupnimi testi in smiselno dodaj lastna preverjanja.
5. Ob koncu opiši spremembe, izvedena preverjanja, njihove rezultate in
   morebitne neizpolnjene zahteve. Ne navajaj neizvedenih testov kot uspešnih.

Testne kontrole `/__test/` uporablja samo testni program. Uporabniški vmesnik
ne sme z njimi nastavljati odzivov, brati testnega stanja ali ponastavljati
podatkov. Ne nadomeščaj strežnika z lokalno kopijo podatkov ali `localStorage`.

Testi izhodišča preverjajo začetno delovanje in infrastrukturo. Konkretne
zahteve P09 je treba preveriti tudi z ločeno pripravljenimi testi te naloge.
Pred agentno izvedbo izvajalec izvozi samo dovoljene datoteke. Prisotnost teh
pravil sama po sebi ne preprečuje dostopa do drugih map ali sprememb datotek.
--- task/instructions.md ---
# P09: Stanje pogleda v povezavi in zgodovini

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Stanje pregleda je določeno s parametri q, status in order v query delu URL fragmenta za obstoječo pot projekta ali opravila. Privzeto je q prazen, status all, order original. Ob neposrednem odprtju povezave se stanje uporabi brez dodatnega klika. |
| R02 | q je ena dobesedna fraza: trim zunanjih belin, NFD, odstranitev U+0300–U+036F in male črke za iskanje po title, description, assignee ali id. Fraza mora biti podniz vsaj enega polja; ni regularni izraz in se ne razdeli v besede. |
| R03 | status podpira all/todo/in_progress/done in deluje skupaj z q po IN. order je original/title-asc/title-desc; naslov se primerja po isti normalizaciji in UTF-16, ob izenačenju ostane izvorni vrstni red. |
| R04 | Neznana vrednost status/order pomeni privzeto vrednost. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri ne vplivajo na prikaz. Razčlenjevanje ne povzroči samodejnega prepisovanja URL-ja. |
| R05 | Spreminjanje treh kontrol ureja osnutek in še ne spremeni prikaza ali URL-ja. Gumb Uporabi pogled potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje, če se potrjeno stanje spremeni. |
| R06 | Pri potrditvi se q obreže, privzeti parametri izpustijo, preostali pravilno URL-kodirajo. Obstoječi view=board se ohrani, neznani parametri se odstranijo. Ponovitev enake potrditve ne doda novega zgodovinskega stanja. |
| R07 | Nazaj in Naprej v brskalniku obnovita potrjene filtre, prikaz in osnutek kontrol. Osvežitev ohrani potrjeno stanje iz URL-ja. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je. Nepotrjen osnutek se ob vsaki navigaciji zavrže. |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava do pravilnega ID-ja deluje tudi pri enakih naslovih. |
| R10 | Klik na drugi projekt začne njegov privzeti pregled (q prazen, status all, order original) in ohrani table/board. Neposredna povezava do drugega projekta s parametri pa jih upošteva. |
| R11 | Gumb Ponastavi pogled počisti tri filtre in osnutek ter posodobi zgodovino po istem pravilu kot potrditev; obdrži trenutni način pogleda. Prazen rezultat pokaže Ni zadetkov.; števec kaže Prikazano: N od M.. |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API. Stanje ni v localStorage. Delujejo obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv videz Folio. |

## Dogovor o vmesniku

- input type=search z oznako Iskanje v povezavi; select Stanje v povezavi: all/todo/in_progress/done; select Vrstni red v povezavi: original/title-asc/title-desc.
- Gumba Uporabi pogled in Ponastavi pogled; role=status, aria-label=Rezultati povezave, besedilo Prikazano: N od M..
- Primer: #/projects/web?view=board&q=Pregled&status=todo&order=title-desc. Vrstni red samih URL-parametrov ni predpisan.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
--- task/specification-template.md ---
# Predloga razvojne specifikacije

Predloga je enaka za vse postopke. Izpolnjena vsebina je izdelek postopka,
ne vnaprej dana referenčna rešitev. Če postopek ustvari več dokumentov,
lahko navede povezave na ustrezne dele namesto podvajanja vsebine.

## Problem in kontekst

Opiši uporabnikov namen, začetno delovanje aplikacije in predvideno spremembo.

## Vhodi, dejanja in izidi

Določi relevantna podatkovna polja, dovoljena dejanja, pogoje uporabe in
pričakovano stanje po uspehu, preklicu ter napaki.

## Zahteve in pravila

Za vsako zahtevo iz navodil navedi, kako bo zajeta. Izbrane zahteve izrazi
s predikati ali pravili spremembe stanja. Pojasni simbole in predpostavke.
Loči splošno pravilo od posameznega testnega primera.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R… | … | … |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R… | … | … | … | … |

Izida ne označi kot uspešnega brez dejanskega preverjanja. Navedi, če test
ni izveden. Izvor rezultata naj bo določljiv, npr. ime testa in dnevnik zagona.
Po popravkih posodobi povezave in ohrani zgodovino sprememb specifikacije.

## Odprta vprašanja in omejitve

Zapiši nejasnosti, uporabljena pojasnila, nepreverjene scenarije ter odstopanja.
--- .agents/skills/speckit-constitution/SKILL.md ---
---
name: speckit-constitution
description: Create or update the project constitution.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:lean
---

# Speckit Constitution Skill

## User Input

```text
$ARGUMENTS
```

## Scope Guard

This command's own work is limited to creating or updating the project constitution and
propagating constitution-driven changes to dependent Spec Kit artifacts.

- Classify every part of the user input as constitution content or a separate non-governance
  intent. Feature implementation, code generation, refactoring, build, and deployment requests
  are examples of non-governance intents.
- You **MUST NOT** execute any non-governance intent. Defer each one to `Next Actions`.
- You **MUST NOT** create, modify, or delete application source files or other artifacts
  unrelated to the constitution workflow.
- If an instruction could be either constitution content or a non-governance intent, ask for
  clarification before making changes.
- After updating the constitution, list each deferred intent in a `Next Actions` section with an
  appropriate follow-up Spec Kit command, such as `$speckit-specify`, but do not
  invoke it.
- Omit `Next Actions` when there are no non-governance intents.

## Outline

1. Create or update the project constitution and store it in `.specify/memory/constitution.md`.
   - Project name, guiding principles, non-negotiable rules
   - Derive from user input and existing repo context (README, docs)
--- time budget ---
{"phaseSecondsRemaining":1191,"totalSecondsRemaining":1191,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## 01-constitution-item_5

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc 'set -e
for file in .specify/memory/constitution.md .specify/feature.json docs/dizajn.md README.md; do
  if [ -f "$file" ]; then
    printf '"'\\n--- %s ---\\n' \""'$file"
    cat "$file"
  fi
done'

--- .specify/memory/constitution.md ---
# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->

--- .specify/feature.json ---
{}

--- docs/dizajn.md ---
# Folio — potrjeni dizajn

Potrjeno 15. septembra 2026. Ta videz je skupno izhodišče za naloge;
posamezna dopolnitev naj uporablja obstoječe gradnike in slogovne spremenljivke.

- Ime je **Folio**, z modrim znakom F. Repozitorij ostaja `mag-app`.
- Lev meni je širok 224 pik, odmaknjen 16 pik od robov, z zaobljenostjo
  16 pik. Ima svetel rob `#e6e9ef` in nežno dvojno senco
  `0 8px 24px #20355609, 0 1px 3px #20355604`.
- Pri širini do 760 pik se navigacija prestavi nad vsebino; projekta
  ostaneta neposredno dostopna pod logotipom.
- Pisava je sistemska. Ozadje je `#fbfbfd`, kartice so bele, glavno besedilo
  `#1d1d1f`, poudarek pa `#2f6dcc`. Modra označuje izbor, stanje V delu in
  glavna dejanja; večina površin ostane nevtralna.
- Ikone so majhne, s tankimi potezami. Spremljajo besedilne oznake projektov,
  stanj, pogledov in rokov. Dekorativne ikone imajo `aria-hidden="true"`.
- Kartice imajo notranji odmik 16 pik, naslov, eno vrstico opisa ter osebo
  in rok. Celoten opis je v podrobnostih. Višina se po potrebi prilagodi
  dolgemu naslovu ali prelomljenim podatkom.
- Preglednica in tabla se na ozkem zaslonu pomikata znotraj svojega prikaza.
  Fokus pri uporabi tipkovnice mora ostati viden.

Aktualni posnetki so v `predogled/`. Vir postavitve in barv je
`src/styles.css`; ta dokument pojasnjuje potrjeno usmeritev. Raziskovalno
izhodišče je pripeto na natančen commit v `mag-experiments/baseline.json`.

--- README.md ---
# Folio — začetna aplikacija

React aplikacija za organizacijo dela na projektih. To je izhodišče za pilot
magistrske naloge: uporabnik izbira med dvema projektoma, pregleduje šest
opravil in odpira njihove podrobnosti. Urejanje opravil je predmet naloge P01
in še ni vključeno. Strežniški vmesnik za posodobitev je že pripravljen.

Končni videz je potrjen 15. septembra 2026: Folio z lebdečim stranskim
menijem, nežnimi modrimi poudarki in manjšimi karticami. Smernice so v
[docs/dizajn.md](docs/dizajn.md), aktualni prikaz pa spodaj.

![Folio — tabla opravil](docs/predogled/tabla.png)

## Zagon

Potreben je Node.js 24.11.1; različica je zapisana tudi v `.nvmrc`.
V tej mapi zaženi:

```sh
npm ci
npm run dev
```

Aplikacija je na <http://127.0.0.1:5173>. Isti ukaz zažene tudi simulirani
strežnik na vratih 3101. Zunanjih računov, ključev ali podatkovne zbirke ne
potrebuješ. Postopek ustaviš s Ctrl+C.

Podatki so shranjeni v pomnilniku strežnika. Osvežitev strani jih ohrani;
ponovni zagon strežnika povrne začetno zbirko. To velja tudi za posodobitve,
ki jih pozneje doda P01. Različni zavihki istega strežnika uporabljajo isto
zbirko, zato mora imeti vsaka eksperimentalna izvedba svoj strežnik.

## Kaj je pripravljeno

- Ozek, lebdeč stranski meni z logotipom in projektoma. Bela in svetlo siva
  podlaga z nežnimi modrimi poudarki, sistemska pisava ter tanke ikone pri
  projektih, stanjih in rokih. Na telefonu se navigacija prestavi nad vsebino;
  projekta sta pod logotipom.
- Seznam projektov ter preklop med preglednico in tablo opravil.
- Tabla s stolpci Pripravljeno, V delu in Končano; manjše kartice vsebujejo naslov,
  eno vrstico opisa, odgovorno osebo in rok. Klik na kartico odpre celoten opis
  in druge podrobnosti.
- Izbrani pogled se ohrani v povezavi tudi ob osvežitvi, odpiranju podrobnosti
  in menjavi projekta. Tabla omogoča pregled; ne spreminja stanj opravil.
- Podrobnosti z naslovom, opisom, stanjem, odgovorno osebo, rokom in oznako.
- Neposredne povezave do projektov in opravil; delujeta osvežitev in gumb Nazaj.
- Zapiranje podrobnosti z gumbom ali tipko Escape; uporaba s tipkovnico.
- Prikaz na manjšem zaslonu z vodoravno pomično preglednico oziroma tablo.
- Prikaz nalaganja, napake s ponovnim poskusom, praznega projekta in neveljavne povezave.
- Strežniški vmesnik za branje in posodobitev, ponovljivi podatki ter testi izhodišča.

Začetni podatki so v `server/fixtures.ts`. Dve opravili prvega projekta imata
enak naslov; enak naslov se pojavi tudi v drugem projektu. Razlikujemo jih po
`id`. Vidne oznake stanj so Pripravljeno, V delu in Končano, njihove vrednosti
pa `todo`, `in_progress` in `done`.

## Preverjanje

Ob prvem preverjanju namesti testni brskalnik:

```sh
npx playwright install chromium
npm run check
```

`check` preveri slog in tipe, pripravi aplikacijo za predogled ter izvede
teste. Posamezne korake lahko zaženeš z `npm run lint`, `npm run build` in
`npm test`. Poročilo testov je v `playwright-report/`, posnetki in sledi
neuspešnih preverjanj pa v `test-results/`.

Trenutno je pripravljenih 14 preverjanj strežniškega vmesnika in 12 scenarijev
v brskalniku, izvedenih pri širini računalniškega in telefonskega zaslona
(skupaj 38 preverjanj). Telefonski prikaz je preverjen v Chromiumu z emulacijo
telefona, ne na fizičnem iPhonu. To so testi začetnega stanja aplikacije in
infrastrukture. Štirje razvojni in enajst končnih scenarijev P01 ter ločena
referenčna rešitev so pripravljeni v zasebnem repozitoriju
`horvatz/mag-experiments`. Niso del začetne aplikacije za agente.

Testi zaženejo lasten strežnik na vratih 3102 in aplikacijo na 5174. Pred
vsakim testom obnovijo podatke. Ne spreminjajo podatkov predogleda na 5173.
Izvajajo se zaporedno, ker uporabljajo isto testno zbirko. Če so testna vrata
že zasedena, se zagon ustavi; obstoječega strežnika ne prevzame.

Za predogled zgrajene aplikacije uporabi `npm run build` in `npm run preview`
ter odpri <http://127.0.0.1:4173>. Pred tem ustavi razvojni strežnik, ker oba
privzeto uporabljata vrata 3101. Vrata strežnika je mogoče določiti z
`API_PORT`, vrata razvojnega vmesnika pa z `WEB_PORT`.

## Podatkovni vmesnik

Odjemalec dostopa prek istega izvora kot aplikacija. Vite zahteve `/api/`
posreduje simuliranemu strežniku. Skupni tipi so v `shared/types.ts`,
funkcija za posodobitev pa v `src/api.ts`.

| Zahteva | Odgovor |
| --- | --- |
| `GET /api/projects` | Seznam projektov. |
| `GET /api/projects/:id/tasks` | Opravila izbranega projekta. |
| `GET /api/tasks/:id` | Eno opravilo po identifikatorju. |
| `PATCH /api/tasks/:id` | Posodobljeno opravilo; telo vsebuje `title` in `status`. |
| `GET /api/health` | Razpoložljivost strežnika. |

Posodobitev uporablja `Content-Type: application/json`. Obe polji sta
obvezni; drugih polj ni mogoče spreminjati. Strežnik na začetku in koncu
naslova odstrani presledek, tabulator ter znaka CR in LF. Notranjih presledkov
in šumnikov ne spreminja. Prazen naslov ali neveljavno stanje zavrne z 400.
Neznan projekt ali opravilo vrne 404. Napake imajo telo `{ "message": "…" }`.

Ob uspehu se obe polji spremenita skupaj, druga opravila in preostala polja
pa ostanejo enaka. Odgovor vsebuje celotno opravilo. Strežniško preverjanje
ne nadomesti preverjanja uporabniškega vnosa, ki ga zahteva P01.

## Nadzorovani odzivi za teste

Naslednje poti so na strežniku vključene samo ob `MOCK_CONTROL=1`.
Pri običajnem zagonu in predogledu niso vključene. Te kontrole so pripomoček
izvajalca testov in ne zagotavljajo izolacije pred agentom, ki ima dostop do
celotnega računalnika; to uredimo posebej pred pilotom.

| Zahteva | Pomen |
| --- | --- |
| `POST /__test/reset` | Obnovi začetne podatke in števce; zadržane zahteve zaključi z 409. Brez telesa. |
| `POST /__test/next-save` z `{ "mode": "success" }` | Naslednjo veljavno posodobitev uspešno shrani. To je privzeto stanje. |
| Ista pot z `{ "mode": "reject" }` | Naslednjo veljavno posodobitev zavrne z 503, brez zapisa. |
| Ista pot z `{ "mode": "hold" }` | Naslednjo veljavno posodobitev zadrži do sprostitve, brez vmesnega zapisa. |
| `POST /__test/release` z `{ "outcome": "success" }` ali `{ "outcome": "reject" }` | Sprosti najstarejšo zadržano zahtevo z izbranim izidom. |
| `GET /__test/state` | Kopija vseh opravil, število poskusov posodobitve (`saveRequests`), čakajočih zahtev (`pending`) in način naslednjega odziva (`nextMode`). |

Način se porabi pri naslednji veljavni posodobitvi in nato vrne na `success`.
Števec zajema zahteve PATCH z uspešno prebranim telesom JSON, tudi če je
vsebina neveljavna. Napačno oblikovan JSON se zavrne pred klicem shrambe.

## Nadaljevanje pilota

Pravila sprememb so v `PROJECT_RULES.md`. Pred izvedbami moramo pripraviti
ločeno referenčno rešitev P01, izvršljive razvojne in končne teste ter
preveriti, ali odkrijejo načrtovane napake. Nato zamrznemo izhodiščno različico
in uredimo izvoz dovoljenega gradiva ter ločitev ocenjevanja.

Referenčne rešitve, skritih testov in meritev v tej aplikaciji ni. Ta delovna
mapa še ni izolirano okolje za primerjavo postopkov A, B in C.

Različice vseh knjižnic so zaklenjene v `package-lock.json`; neposredne
odvisnosti imajo v `package.json` natančne različice. Za ponovitev uporabljamo
`npm ci`, brez samodejnega posodabljanja odvisnosti.

```

## 01-constitution-item_7

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "apply_patch <<'PATCH'
*** Begin Patch
*** Delete File: .specify/memory/constitution.md
*** Add File: .specify/memory/constitution.md
+# Folio Constitution
+
+## Core Principles
+
+### I. Preserve the Approved Baseline
+Folio is the approved product identity. Keep Slovenian interface naming, the
+confirmed Folio visual language, existing public API contracts, and baseline
+behavior unless an explicit task requires a change.
+
+### II. Respect Scope Boundaries
+Application work stays within the permitted source, agent-test, and agent-documentation areas. Do not modify server code, shared types, baseline tests, dependencies, run settings, templates, skills, or test infrastructure for a feature task.
+
+### III. Use Only the Public API
+The user interface communicates through "'`/api/`. It must not use `/__test/` controls, substitute local data copies, or persist feature state in `localStorage`.
+
+### IV. Keep Requirements Traceable
+Original task requirements are authoritative. Use the common specification template, connect each requirement to its condition and verification method, and clearly mark unverified work or limitations.
+
+### V. Make Minimal, Testable Changes
+Prefer focused changes that solve the stated requirement without unrelated refactoring, new dependencies, optional architecture redesigns, branches, or commits. Verify work with the available shared tests and sensible agent tests.
+
+## Governance
+
+The constitution records project-level rules only. Task-specific acceptance
+criteria belong to the current feature specification. If a future task conflicts
+with this constitution, the conflict must be recorded before work proceeds.
+
+**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31
*** End Patch
PATCH
node task/time-budget.mjs'
zsh:1: can't create temp file for here document: operation not permitted
{"phaseSecondsRemaining":1176,"totalSecondsRemaining":1176,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## 01-constitution-item_9

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "printf '%s\\n' '*** Begin Patch' '*** Delete File: .specify/memory/constitution.md' '*** Add File: .specify/memory/constitution.md' '+# Folio Constitution' '+' '+## Core Principles' '+' '+### I. Preserve the Approved Baseline' '+Folio is the approved product identity. Keep Slovenian interface naming, the' '+confirmed Folio visual language, existing public API contracts, and baseline' '+behavior unless an explicit task requires a change.' '+' '+### II. Respect Scope Boundaries' '+Application work stays within the permitted source, agent-test, and agent-documentation areas. Do not modify server code, shared types, baseline tests, dependencies, run settings, templates, skills, or test infrastructure for a feature task.' '+' '+### III. Use Only the Public API' '+The user interface communicates through "'`/api/`. It must not use `/__test/` controls, substitute local data copies, or persist feature state in `localStorage`.'"' '+' '+### IV. Keep Requirements Traceable' '+Original task requirements are authoritative. Use the common specification template, connect each requirement to its condition and verification method, and clearly mark unverified work or limitations.' '+' '+### V. Make Minimal, Testable Changes' '+Prefer focused changes that solve the stated requirement without unrelated refactoring, new dependencies, optional architecture redesigns, branches, or commits. Verify work with the available shared tests and sensible agent tests.' '+' '+## Governance' '+' '+The constitution records project-level rules only. Task-specific acceptance criteria belong to the current feature specification. If a future task conflicts with this constitution, the conflict must be recorded before work proceeds.' '+' '+**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31' '*** End Patch' | apply_patch
node task/time-budget.mjs"
zsh:1: command not found: apply_patch
{"phaseSecondsRemaining":1170,"totalSecondsRemaining":1170,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## 01-constitution-item_11

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "command -v codex || true
codex --help | sed -n '1,160p'"
/Users/zan/.nvm/versions/node/v24.11.1/bin/codex
Error: spawn /Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex ENOENT
    at ChildProcess._handle.onexit (node:internal/child_process:286:19)
    at onErrorNT (node:internal/child_process:484:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'spawn /Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex',
  path: '/Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex',
  spawnargs: [ '--help' ]
}

```

## 01-constitution-item_12

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "file /Users/zan/.local/bin/codex
/Users/zan/.local/bin/codex --help 2>&1 | sed -n '1,120p'"
/Users/zan/.local/bin/codex: cannot open `/Users/zan/.local/bin/codex' (Operation not permitted)
zsh:2: operation not permitted: /Users/zan/.local/bin/codex

```

## 01-constitution-item_13

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc 'ls -la /Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS'
total 464984
drwxr-xr-x@ 3 zan  staff         96 Sep 27 10:31 .
drwxr-xr-x@ 7 zan  staff        224 Sep 27 10:31 ..
-rwxr-xr-x@ 1 zan  staff  238069168 Sep 26 10:52 codex

```

## 01-constitution-item_14

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS/codex --help | sed -n '1,220p'"
WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)
Codex CLI

If no subcommand is specified, options will be forwarded to the interactive CLI.

Usage: codex [OPTIONS] [PROMPT]
       codex [OPTIONS] <COMMAND> [ARGS]

Commands:
  agents            Browse all agent sessions on the shared local app-server daemon
  exec              Run Codex non-interactively [aliases: e]
  review            Run a code review non-interactively
  login             Manage login
  logout            Remove stored authentication credentials
  mcp               Manage external MCP servers for Codex
  plugin            Manage Codex plugins
  app-server        [experimental] Run the app server or related tooling
  remote-control    [experimental] Manage the app-server daemon with remote control enabled
  app               Launch the Desktop app (opens the app installer if missing)
  completion        Generate shell completion scripts
  update            Update Codex to the latest version
  doctor            Diagnose local Codex installation, config, auth, and runtime health
  sandbox           Run commands within a Codex-provided sandbox
  debug             Debugging tools
  apply             Apply the latest diff produced by Codex agent as a `git apply` to your local
                    working tree [aliases: a]
  resume            Resume a previous interactive session (picker by default; use --last to continue
                    the most recent)
  queue             Queue a message for an existing session
  archive           Archive a saved session by id or session name
  delete            Permanently delete a saved session by id or session name
  migrate-rollouts  Inspect or migrate legacy local sessions to paginated thread history
  unarchive         Unarchive a saved session by id or session name
  fork              Fork a previous interactive session (picker by default; use --last to fork the
                    most recent)
  cloud             [EXPERIMENTAL] Browse tasks from Codex Cloud and apply changes locally
  exec-server       [EXPERIMENTAL] Run the standalone exec-server service
  features          Inspect feature flags
  help              Print this message or the help of the given subcommand(s)

Arguments:
  [PROMPT]
          Optional user prompt to start the session

Options:
  -c, --config <key=value>
          Override a configuration value that would otherwise be loaded from `~/.codex/config.toml`.
          Use a dotted path (`foo.bar.baz`) to override nested values. The `value` portion is parsed
          as TOML. If it fails to parse as TOML, the raw string is used as a literal.
          
          Examples: - `-c model="o3"` - `-c 'sandbox_permissions=["disk-full-read-access"]'` - `-c
          shell_environment_policy.inherit=all`

      --enable <FEATURE>
          Enable a feature (repeatable). Equivalent to `-c features.<name>=true`

      --disable <FEATURE>
          Disable a feature (repeatable). Equivalent to `-c features.<name>=false`

      --remote <ADDR>
          Connect the TUI to a remote app server endpoint.
          
          Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`.

      --remote-auth-token-env <ENV_VAR>
          Name of the environment variable containing the bearer token to send to a remote app
          server websocket

      --strict-config
          Error out when config.toml contains fields that are not recognized by this version of
          Codex

  -i, --image <FILE>...
          Optional image(s) to attach to the initial prompt

  -m, --model <MODEL>
          Model the agent should use

      --oss
          Use open-source provider

      --local-provider <OSS_PROVIDER>
          Specify which local provider to use (lmstudio or ollama). If not specified with --oss,
          will use config default or show selection

  -p, --profile <CONFIG_PROFILE_V2>
          Layer $CODEX_HOME/<name>.config.toml on top of the base user config

  -s, --sandbox <SANDBOX_MODE>
          Select the sandbox policy to use when executing model-generated shell commands
          
          [possible values: read-only, workspace-write, danger-full-access]

      --approve-for-me
          Route approval requests through automatic review using the workspace-write sandbox

      --dangerously-bypass-approvals-and-sandbox
          Skip all confirmation prompts and execute commands without sandboxing. EXTREMELY
          DANGEROUS. Intended solely for running in environments that are externally sandboxed

      --dangerously-bypass-hook-trust
          Run enabled hooks without requiring persisted hook trust for this invocation. DANGEROUS.
          Intended only for automation that already vets hook sources

  -C, --cd <DIR>
          Tell the agent to use the specified directory as its working root

      --worktree
          Run the session in a new managed Git worktree

      --add-dir <DIR>
          Additional directories that should be writable alongside the primary workspace

  -a, --ask-for-approval <APPROVAL_POLICY>
          Configure when the model requires human approval before executing a command

          Possible values:
          - on-request: The model decides when to ask the user for approval
          - never:      Never ask for user approval Execution failures are immediately returned to
            the model

      --search
          Enable live web search. When enabled, the native Responses `web_search` tool is available
          to the model (no per‑call approval)

      --no-alt-screen
          Disable alternate screen mode
          
          Runs the TUI in inline mode, preserving terminal scrollback history.

      --no-daemon
          Run without the shared background server, even if it is already running

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version

```

## 01-constitution-item_15

Vir: `runtime/runs/P09-C-001/phases/01-constitution/events.jsonl.gz`, exit 0.

```text
/bin/zsh -lc "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS/codex debug --help | sed -n '1,220p'"
WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)
Debugging tools

Usage: codex debug [OPTIONS] <COMMAND>

Commands:
  models        Render the raw model catalog as JSON
  app-server    Tooling: helps debug the app server
  prompt-input  Render the model-visible prompt input list as JSON
  help          Print this message or the help of the given subcommand(s)

Options:
  -c, --config <key=value>
          Override a configuration value that would otherwise be loaded from `~/.codex/config.toml`.
          Use a dotted path (`foo.bar.baz`) to override nested values. The `value` portion is parsed
          as TOML. If it fails to parse as TOML, the raw string is used as a literal.
          
          Examples: - `-c model="o3"` - `-c 'sandbox_permissions=["disk-full-read-access"]'` - `-c
          shell_environment_policy.inherit=all`

      --enable <FEATURE>
          Enable a feature (repeatable). Equivalent to `-c features.<name>=true`

      --disable <FEATURE>
          Disable a feature (repeatable). Equivalent to `-c features.<name>=false`

  -h, --help
          Print help (see a summary with '-h')

```

## preserved-0

Vir: `api/P09-C-001/model/request-00002.json.gz`, callId `call_7aae31b959ac4c0cb03fb977ce8c22a6`.

```text
{"cmd": "set -e\nprintf '%s\\n' '--- PROJECT_RULES.md ---'\ncat PROJECT_RULES.md\nprintf '%s\\n' '--- task/instructions.md ---'\ncat task/instructions.md\nprintf '%s\\n' '--- task/specification-template.md ---'\ncat task/specification-template.md\nprintf '%s\\n' '--- .agents/skills/speckit-constitution/SKILL.md ---'\ncat .agents/skills/speckit-constitution/SKILL.md\nprintf '%s\\n' '--- time budget ---'\nnode task/time-budget.mjs", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 30000}
Chunk ID: a407d1
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 2534
Output:
Warning: truncated output (original token count: 2534)
Total output lines: 156

--- PROJECT_RULES.md ---
# Skupna pravila dela v aplikaciji

To je začetna aplikacija za pilot P09. Konkretne zahteve prejme agent skupaj
z nalogo; ta dokument določa izhodišče in mejo dovoljenih sprememb.

## Dovoljene spremembe

- Koda uporabniškega vmesnika v `src/`, vključno s slogi in uporabo javnega API-ja.
- Lastni dodatni testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`.

Začetni podatki, strežnik v `server/`, skupni tipi v `shared/`, skupni testi
`tests/baseline.spec.ts` in `tests/api.spec.ts`, odvisnosti ter nastavitve
zagona in preverjanja ostanejo enaki. Sprememba skupne infrastrukture zahteva
enako, vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

## Pričakovano delo

1. Preberi zahteve naloge in uporabi priloženo predlogo specifikacije.
2. Dopolni obstoječi vmesnik; ohrani slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`.
3. Podatke beri in shranjuj prek javnega vmesnika `/api/`. Izbiraj po `id`.
4. Preveri rešitev s skupnimi testi in smiselno dodaj lastna preverjanja.
5. Ob koncu opiši spremembe, izvedena preverjanja, njihove rezultate in
   morebitne neizpolnjene zahteve. Ne navajaj neizvedenih testov kot uspešnih.

Testne kontrole `/__test/` uporablja samo testni program. Uporabniški vmesnik
ne sme z njimi nastavljati odzivov, brati testnega stanja ali ponastavljati
podatkov. Ne nadomeščaj strežnika z lokalno kopijo podatkov ali `localStorage`.

Testi izhodišča preverjajo začetno delovanje in infrastrukturo. Konkretne
zahteve P09 je treba preveriti tudi z ločeno pripravljenimi testi te naloge.
Pred agentno izvedbo izvajalec izvozi samo dovoljene datoteke. Prisotnost teh
pravil sama po sebi ne preprečuje dostopa do drugih map ali sprememb datotek.
--- task/instructions.md ---
# P09: Stanje pogleda v povezavi in zgodovini

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Stanje pregleda je določeno s parametri q, status in order v query delu URL fragmenta za obstoječo pot projekta ali opravila. Privzeto je q prazen, status all, order original. Ob neposrednem odprtju povezave se stanje uporabi brez dodatnega klika. |
| R02 | q je ena dobesedna fraza: trim zunanjih belin, NFD, odstranitev U+0300–U+036F in male črke za iskanje po title, description, assignee ali id. Fraza mora biti podniz vsaj enega polja; ni regularni izraz in se ne razdeli v besede. |
| R03 | status podpira all/todo/in_progress/done in deluje skupaj z q po IN. order je original/title-asc/title-desc; naslov se primerja po isti normalizaciji in UTF-16, ob izenačenju ostane izvorni vrstni red. |
| R04 | Neznana vrednost status/order pomeni privzeto vrednost. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri ne vplivajo na prikaz. Razčlenjevanje ne povzroči samodejnega prepisovanja URL-ja. |
| R05 | Spreminjanje treh kontrol ureja osnutek in še ne spremeni prikaza ali URL-ja. Gumb Uporabi pogled potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje, če se potrjeno stanje spremeni. |
| R06 | Pri potrditvi se q obreže, privzeti parametri izpustijo, preostali pravilno URL-kodirajo. Obstoječi view=board se ohrani, neznani parametri se odstranijo. Ponovitev enake potrditve ne doda novega zgodovinskega stanja. |
| R07 | Nazaj in Naprej v brskalniku obnovita potrjene filtre, prikaz in osnutek kontrol. Osvežitev ohrani potrjeno stanje iz URL-ja. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je. Nepotrjen osnutek se ob vsaki navigaciji zavrže. |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava do pravilnega ID-ja deluje tudi pri enakih naslovih. |
| R10 | Klik na drugi projekt začne njegov privzeti pregled (q prazen, status all, order original) in ohrani table/board. Neposredna povezava do drugega projekta s parametri pa jih upošteva. |
| R11 | Gumb Ponastavi pogled počisti tri filtre in osnutek ter posodobi zgodovino po istem pravilu kot potrditev; obdrži trenutni način pogleda. Prazen rezultat pokaže Ni zadetkov.; števec kaže Prikazano: N od M.. |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API. Stanje ni v localStorage. Delujejo obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv videz Folio. |

## Dogovor o vmesniku

- input type=search z oznako Iskanje v povezavi; select Stanje v povezavi: all/todo/in_progress/done; select Vrstni red v povezavi: original/title-asc/title-desc.
- Gumba Uporabi pogled in Ponastavi pogled; role=status, aria-label=Rezultati povezave, besedilo Prikazano: N od M..
- Primer: #/projects/web?view=board&q=Pregled&status=todo&order=title-desc. Vrstni red samih URL-parametrov ni predpisan.

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in…134 chars truncated…cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
--- task/specification-template.md ---
# Predloga razvojne specifikacije

Predloga je enaka za vse postopke. Izpolnjena vsebina je izdelek postopka,
ne vnaprej dana referenčna rešitev. Če postopek ustvari več dokumentov,
lahko navede povezave na ustrezne dele namesto podvajanja vsebine.

## Problem in kontekst

Opiši uporabnikov namen, začetno delovanje aplikacije in predvideno spremembo.

## Vhodi, dejanja in izidi

Določi relevantna podatkovna polja, dovoljena dejanja, pogoje uporabe in
pričakovano stanje po uspehu, preklicu ter napaki.

## Zahteve in pravila

Za vsako zahtevo iz navodil navedi, kako bo zajeta. Izbrane zahteve izrazi
s predikati ali pravili spremembe stanja. Pojasni simbole in predpostavke.
Loči splošno pravilo od posameznega testnega primera.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R… | … | … |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R… | … | … | … | … |

Izida ne označi kot uspešnega brez dejanskega preverjanja. Navedi, če test
ni izveden. Izvor rezultata naj bo določljiv, npr. ime testa in dnevnik zagona.
Po popravkih posodobi povezave in ohrani zgodovino sprememb specifikacije.

## Odprta vprašanja in omejitve

Zapiši nejasnosti, uporabljena pojasnila, nepreverjene scenarije ter odstopanja.
--- .agents/skills/speckit-constitution/SKILL.md ---
---
name: speckit-constitution
description: Create or update the project constitution.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: preset:lean
---

# Speckit Constitution Skill

## User Input

```text
$ARGUMENTS
```

## Scope Guard

This command's own work is limited to creating or updating the project constitution and
propagating constitution-driven changes to dependent Spec Kit artifacts.

- Classify every part of the user input as constitution content or a separate non-governance
  intent. Feature implementation, code generation, refactoring, build, and deployment requests
  are examples of non-governance intents.
- You **MUST NOT** execute any non-governance intent. Defer each one to `Next Actions`.
- You **MUST NOT** create, modify, or delete application source files or other artifacts
  unrelated to the constitution workflow.
- If an instruction could be either constitution content or a non-governance intent, ask for
  clarification before making changes.
- After updating the constitution, list each deferred intent in a `Next Actions` section with an
  appropriate follow-up Spec Kit command, such as `$speckit-specify`, but do not
  invoke it.
- Omit `Next Actions` when there are no non-governance intents.

## Outline

1. Create or update the project constitution and store it in `.specify/memory/constitution.md`.
   - Project name, guiding principles, non-negotiable rules
   - Derive from user input and existing repo context (README, docs)
--- time budget ---
{"phaseSecondsRemaining":1191,"totalSecondsRemaining":1191,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## preserved-1

Vir: `api/P09-C-001/model/request-00003.json.gz`, callId `call_44f0a52181f94cd98026c61aa4b73089`.

```text
{"cmd": "set -e\nfor file in .specify/memory/constitution.md .specify/feature.json docs/dizajn.md README.md; do\n  if [ -f \"$file\" ]; then\n    printf '\\n--- %s ---\\n' \"$file\"\n    cat \"$file\"\n  fi\ndone", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 20000}
Chunk ID: 4c96c8
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 2823
Output:
Warning: truncated output (original token count: 2823)
Total output lines: 229


--- .specify/memory/constitution.md ---
# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->

--- .specify/feature.json ---
{}

--- docs/dizajn.md ---
# Folio — potrjeni dizajn

Potrjeno 15. septembra 2026. Ta videz je skupno izhodišče za naloge;
posamezna dopolnitev naj uporablja obstoječe gradnike in slogovne spremenljivke.

- Ime je **Folio**, z modrim znakom F. Repozitorij ostaja `mag-app`.
- Lev meni je širok 224 pik, odmaknjen 16 pik od robov, z zaobljenostjo
  16 pik. Ima svetel rob `#e6e9ef` in nežno dvojno senco
  `0 8px 24px #20355609, 0 1px 3px #20355604`.
- Pri širini do 760 pik se navigacija prestavi nad vsebino; projekta
  ostaneta neposredno dostopna pod logotipom.
- Pisava je sistemska. Ozadje je `#fbfbfd`, kartice so bele, glavno besedilo
  `#1d1d1f`, poudarek pa `#2f6dcc`. Modra označuje izbor, stanje V delu in
  glavna dejanja; večina površin ostane nevtralna.
- Ikone so majhne, s tankimi potezami. Spremljajo besedilne oznake projektov,
  stanj, pogledov in rokov. Dekorativne ikone imajo `aria-hidden="true"`.
- Kartice imajo notranji odmik 16 pik, naslov, eno vrstico opisa ter osebo
  in rok. Celoten opis je v podrobnostih. Višina se po potrebi prilagodi
  dolgemu naslovu ali prelomljenim podatkom.
- Preglednica in tabla se na ozkem zaslonu pomikata znotraj svojega prikaza.
  Fokus pri uporabi tipkovnice mora ostati viden.

Aktualni posnetki so v `predogled/`. Vir postavitve in barv je
`src/styles.css`; ta dokument pojasnjuje potrjeno usmeritev. Raziskovalno
izhodišče je pripeto na natančen commit v `mag-experiments/baseline.json`.

--- README.md ---
# Folio — začetna aplikacija

React aplikacija za organizacijo dela na projektih. To je izhodišče za pilot
magistrske naloge: uporabnik izbira med dvema projektoma, pregleduje šest
opravil in odpira njihove podrobnosti. Urejanje opravil je predmet naloge P01
in še ni vključeno. Strežniški vmesnik za posodobitev je že pripravljen.

Končni videz je potrjen 15. septembra 2026: Folio z lebdečim stranskim
menijem, nežnimi modrimi poudarki in manjšimi karticami. Smernice so v
[docs/dizajn.md](docs/dizajn.md), aktualni prikaz pa spodaj.

![Folio — tabla opravil](docs/predogled/tabla.png)

## Zagon

Potreben je Node.js 24.11.1; različica je zapisana tudi v `.nvmrc`.
V tej mapi zaženi:

```sh
npm ci
npm run dev
```

Aplikacija je na <http://127.0.0.1:5173>. Isti ukaz zažene tudi simulirani
strežnik na vratih 3101. Zunanjih računov, ključev ali podatkovne zbirke ne
potrebuješ. Postopek ustaviš s Ctrl+C.

Podatki so shranjeni v pomnilniku strežnika. Osvežitev strani jih ohrani;
ponovni zagon strežnika povrne začetno zbirko. To velja tudi za posodobitve,
ki jih …1275 chars truncated…ovljivi podatki ter testi izhodišča.

Začetni podatki so v `server/fixtures.ts`. Dve opravili prvega projekta imata
enak naslov; enak naslov se pojavi tudi v drugem projektu. Razlikujemo jih po
`id`. Vidne oznake stanj so Pripravljeno, V delu in Končano, njihove vrednosti
pa `todo`, `in_progress` in `done`.

## Preverjanje

Ob prvem preverjanju namesti testni brskalnik:

```sh
npx playwright install chromium
npm run check
```

`check` preveri slog in tipe, pripravi aplikacijo za predogled ter izvede
teste. Posamezne korake lahko zaženeš z `npm run lint`, `npm run build` in
`npm test`. Poročilo testov je v `playwright-report/`, posnetki in sledi
neuspešnih preverjanj pa v `test-results/`.

Trenutno je pripravljenih 14 preverjanj strežniškega vmesnika in 12 scenarijev
v brskalniku, izvedenih pri širini računalniškega in telefonskega zaslona
(skupaj 38 preverjanj). Telefonski prikaz je preverjen v Chromiumu z emulacijo
telefona, ne na fizičnem iPhonu. To so testi začetnega stanja aplikacije in
infrastrukture. Štirje razvojni in enajst končnih scenarijev P01 ter ločena
referenčna rešitev so pripravljeni v zasebnem repozitoriju
`horvatz/mag-experiments`. Niso del začetne aplikacije za agente.

Testi zaženejo lasten strežnik na vratih 3102 in aplikacijo na 5174. Pred
vsakim testom obnovijo podatke. Ne spreminjajo podatkov predogleda na 5173.
Izvajajo se zaporedno, ker uporabljajo isto testno zbirko. Če so testna vrata
že zasedena, se zagon ustavi; obstoječega strežnika ne prevzame.

Za predogled zgrajene aplikacije uporabi `npm run build` in `npm run preview`
ter odpri <http://127.0.0.1:4173>. Pred tem ustavi razvojni strežnik, ker oba
privzeto uporabljata vrata 3101. Vrata strežnika je mogoče določiti z
`API_PORT`, vrata razvojnega vmesnika pa z `WEB_PORT`.

## Podatkovni vmesnik

Odjemalec dostopa prek istega izvora kot aplikacija. Vite zahteve `/api/`
posreduje simuliranemu strežniku. Skupni tipi so v `shared/types.ts`,
funkcija za posodobitev pa v `src/api.ts`.

| Zahteva | Odgovor |
| --- | --- |
| `GET /api/projects` | Seznam projektov. |
| `GET /api/projects/:id/tasks` | Opravila izbranega projekta. |
| `GET /api/tasks/:id` | Eno opravilo po identifikatorju. |
| `PATCH /api/tasks/:id` | Posodobljeno opravilo; telo vsebuje `title` in `status`. |
| `GET /api/health` | Razpoložljivost strežnika. |

Posodobitev uporablja `Content-Type: application/json`. Obe polji sta
obvezni; drugih polj ni mogoče spreminjati. Strežnik na začetku in koncu
naslova odstrani presledek, tabulator ter znaka CR in LF. Notranjih presledkov
in šumnikov ne spreminja. Prazen naslov ali neveljavno stanje zavrne z 400.
Neznan projekt ali opravilo vrne 404. Napake imajo telo `{ "message": "…" }`.

Ob uspehu se obe polji spremenita skupaj, druga opravila in preostala polja
pa ostanejo enaka. Odgovor vsebuje celotno opravilo. Strežniško preverjanje
ne nadomesti preverjanja uporabniškega vnosa, ki ga zahteva P01.

## Nadzorovani odzivi za teste

Naslednje poti so na strežniku vključene samo ob `MOCK_CONTROL=1`.
Pri običajnem zagonu in predogledu niso vključene. Te kontrole so pripomoček
izvajalca testov in ne zagotavljajo izolacije pred agentom, ki ima dostop do
celotnega računalnika; to uredimo posebej pred pilotom.

| Zahteva | Pomen |
| --- | --- |
| `POST /__test/reset` | Obnovi začetne podatke in števce; zadržane zahteve zaključi z 409. Brez telesa. |
| `POST /__test/next-save` z `{ "mode": "success" }` | Naslednjo veljavno posodobitev uspešno shrani. To je privzeto stanje. |
| Ista pot z `{ "mode": "reject" }` | Naslednjo veljavno posodobitev zavrne z 503, brez zapisa. |
| Ista pot z `{ "mode": "hold" }` | Naslednjo veljavno posodobitev zadrži do sprostitve, brez vmesnega zapisa. |
| `POST /__test/release` z `{ "outcome": "success" }` ali `{ "outcome": "reject" }` | Sprosti najstarejšo zadržano zahtevo z izbranim izidom. |
| `GET /__test/state` | Kopija vseh opravil, število poskusov posodobitve (`saveRequests`), čakajočih zahtev (`pending`) in način naslednjega odziva (`nextMode`). |

Način se porabi pri naslednji veljavni posodobitvi in nato vrne na `success`.
Števec zajema zahteve PATCH z uspešno prebranim telesom JSON, tudi če je
vsebina neveljavna. Napačno oblikovan JSON se zavrne pred klicem shrambe.

## Nadaljevanje pilota

Pravila sprememb so v `PROJECT_RULES.md`. Pred izvedbami moramo pripraviti
ločeno referenčno rešitev P01, izvršljive razvojne in končne teste ter
preveriti, ali odkrijejo načrtovane napake. Nato zamrznemo izhodiščno različico
in uredimo izvoz dovoljenega gradiva ter ločitev ocenjevanja.

Referenčne rešitve, skritih testov in meritev v tej aplikaciji ni. Ta delovna
mapa še ni izolirano okolje za primerjavo postopkov A, B in C.

Različice vseh knjižnic so zaklenjene v `package-lock.json`; neposredne
odvisnosti imajo v `package.json` natančne različice. Za ponovitev uporabljamo
`npm ci`, brez samodejnega posodabljanja odvisnosti.

```

## preserved-2

Vir: `api/P09-C-001/model/request-00004.json.gz`, callId `call_642653332eb34564b3a2fce5d35fe8e5`.

```text
{"cmd": "apply_patch <<'PATCH'\n*** Begin Patch\n*** Delete File: .specify/memory/constitution.md\n*** Add File: .specify/memory/constitution.md\n+# Folio Constitution\n+\n+## Core Principles\n+\n+### I. Preserve the Approved Baseline\n+Folio is the approved product identity. Keep Slovenian interface naming, the\n+confirmed Folio visual language, existing public API contracts, and baseline\n+behavior unless an explicit task requires a change.\n+\n+### II. Respect Scope Boundaries\n+Application work stays within the permitted source, agent-test, and agent-documentation areas. Do not modify server code, shared types, baseline tests, dependencies, run settings, templates, skills, or test infrastructure for a feature task.\n+\n+### III. Use Only the Public API\n+The user interface communicates through `/api/`. It must not use `/__test/` controls, substitute local data copies, or persist feature state in `localStorage`.\n+\n+### IV. Keep Requirements Traceable\n+Original task requirements are authoritative. Use the common specification template, connect each requirement to its condition and verification method, and clearly mark unverified work or limitations.\n+\n+### V. Make Minimal, Testable Changes\n+Prefer focused changes that solve the stated requirement without unrelated refactoring, new dependencies, optional architecture redesigns, branches, or commits. Verify work with the available shared tests and sensible agent tests.\n+\n+## Governance\n+\n+The constitution records project-level rules only. Task-specific acceptance\n+criteria belong to the current feature specification. If a future task conflicts\n+with this constitution, the conflict must be recorded before work proceeds.\n+\n+**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31\n*** End Patch\nPATCH\nnode task/time-budget.mjs", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 20000}
Chunk ID: 7e709c
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 45
Output:
zsh:1: can't create temp file for here document: operation not permitted
{"phaseSecondsRemaining":1176,"totalSecondsRemaining":1176,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## preserved-3

Vir: `api/P09-C-001/model/request-00005.json.gz`, callId `call_4fccffd46d34445fb914720f6a0d2183`.

```text
{"cmd": "printf '%s\\n' '*** Begin Patch' '*** Delete File: .specify/memory/constitution.md' '*** Add File: .specify/memory/constitution.md' '+# Folio Constitution' '+' '+## Core Principles' '+' '+### I. Preserve the Approved Baseline' '+Folio is the approved product identity. Keep Slovenian interface naming, the' '+confirmed Folio visual language, existing public API contracts, and baseline' '+behavior unless an explicit task requires a change.' '+' '+### II. Respect Scope Boundaries' '+Application work stays within the permitted source, agent-test, and agent-documentation areas. Do not modify server code, shared types, baseline tests, dependencies, run settings, templates, skills, or test infrastructure for a feature task.' '+' '+### III. Use Only the Public API' '+The user interface communicates through `/api/`. It must not use `/__test/` controls, substitute local data copies, or persist feature state in `localStorage`.' '+' '+### IV. Keep Requirements Traceable' '+Original task requirements are authoritative. Use the common specification template, connect each requirement to its condition and verification method, and clearly mark unverified work or limitations.' '+' '+### V. Make Minimal, Testable Changes' '+Prefer focused changes that solve the stated requirement without unrelated refactoring, new dependencies, optional architecture redesigns, branches, or commits. Verify work with the available shared tests and sensible agent tests.' '+' '+## Governance' '+' '+The constitution records project-level rules only. Task-specific acceptance criteria belong to the current feature specification. If a future task conflicts with this constitution, the conflict must be recorded before work proceeds.' '+' '+**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31' '*** End Patch' | apply_patch\nnode task/time-budget.mjs", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 20000}
Chunk ID: 42b9d4
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 36
Output:
zsh:1: command not found: apply_patch
{"phaseSecondsRemaining":1170,"totalSecondsRemaining":1170,"phaseDeadlineUTC":"2026-10-31T22:41:19.610Z"}

```

## preserved-4

Vir: `api/P09-C-001/model/request-00006.json.gz`, callId `call_dad102fe084e40eb9c4f690d7d614dae`.

```text
{"cmd": "command -v codex || true\ncodex --help | sed -n '1,160p'", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 10000}
Chunk ID: bbe7bc
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 205
Output:
/Users/zan/.nvm/versions/node/v24.11.1/bin/codex
Error: spawn /Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex ENOENT
    at ChildProcess._handle.onexit (node:internal/child_process:286:19)
    at onErrorNT (node:internal/child_process:484:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:89:21) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'spawn /Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex',
  path: '/Users/zan/.nvm/versions/node/v24.11.1/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/codex/codex',
  spawnargs: [ '--help' ]
}

```

## preserved-5

Vir: `api/P09-C-001/model/request-00007.json.gz`, callId `call_16a200b687f84953a46c95ef07bb4cd0`.

```text
{"cmd": "file /Users/zan/.local/bin/codex\n/Users/zan/.local/bin/codex --help 2>&1 | sed -n '1,120p'", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 10000}
Chunk ID: 067085
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 40
Output:
/Users/zan/.local/bin/codex: cannot open `/Users/zan/.local/bin/codex' (Operation not permitted)
zsh:2: operation not permitted: /Users/zan/.local/bin/codex

```

## preserved-6

Vir: `api/P09-C-001/model/request-00008.json.gz`, callId `call_beda7474841b4bb1b7fa45089e23fc60`.

```text
{"cmd": "ls -la /Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 10000}
Chunk ID: e72220
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 43
Output:
total 464984
drwxr-xr-x@ 3 zan  staff         96 Sep 27 10:31 .
drwxr-xr-x@ 7 zan  staff        224 Sep 27 10:31 ..
-rwxr-xr-x@ 1 zan  staff  238069168 Sep 26 10:52 codex

```

## preserved-7

Vir: `api/P09-C-001/model/request-00009.json.gz`, callId `call_c6e654e20f77437ea1f6a22368f485f4`.

```text
{"cmd": "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS/codex --help | sed -n '1,220p'", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 20000}
Chunk ID: 836892
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 1489
Output:
WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)
Codex CLI

If no subcommand is specified, options will be forwarded to the interactive CLI.

Usage: codex [OPTIONS] [PROMPT]
       codex [OPTIONS] <COMMAND> [ARGS]

Commands:
  agents            Browse all agent sessions on the shared local app-server daemon
  exec              Run Codex non-interactively [aliases: e]
  review            Run a code review non-interactively
  login             Manage login
  logout            Remove stored authentication credentials
  mcp               Manage external MCP servers for Codex
  plugin            Manage Codex plugins
  app-server        [experimental] Run the app server or related tooling
  remote-control    [experimental] Manage the app-server daemon with remote control enabled
  app               Launch the Desktop app (opens the app installer if missing)
  completion        Generate shell completion scripts
  update            Update Codex to the latest version
  doctor            Diagnose local Codex installation, config, auth, and runtime health
  sandbox           Run commands within a Codex-provided sandbox
  debug             Debugging tools
  apply             Apply the latest diff produced by Codex agent as a `git apply` to your local
                    working tree [aliases: a]
  resume            Resume a previous interactive session (picker by default; use --last to continue
                    the most recent)
  queue             Queue a message for an existing session
  archive           Archive a saved session by id or session name
  delete            Permanently delete a saved session by id or session name
  migrate-rollouts  Inspect or migrate legacy local sessions to paginated thread history
  unarchive         Unarchive a saved session by id or session name
  fork              Fork a previous interactive session (picker by default; use --last to fork the
                    most recent)
  cloud             [EXPERIMENTAL] Browse tasks from Codex Cloud and apply changes locally
  exec-server       [EXPERIMENTAL] Run the standalone exec-server service
  features          Inspect feature flags
  help              Print this message or the help of the given subcommand(s)

Arguments:
  [PROMPT]
          Optional user prompt to start the session

Options:
  -c, --config <key=value>
          Override a configuration value that would otherwise be loaded from `~/.codex/config.toml`.
          Use a dotted path (`foo.bar.baz`) to override nested values. The `value` portion is parsed
          as TOML. If it fails to parse as TOML, the raw string is used as a literal.
          
          Examples: - `-c model="o3"` - `-c 'sandbox_permissions=["disk-full-read-access"]'` - `-c
          shell_environment_policy.inherit=all`

      --enable <FEATURE>
          Enable a feature (repeatable). Equivalent to `-c features.<name>=true`

      --disable <FEATURE>
          Disable a feature (repeatable). Equivalent to `-c features.<name>=false`

      --remote <ADDR>
          Connect the TUI to a remote app server endpoint.
          
          Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`.

      --remote-auth-token-env <ENV_VAR>
          Name of the environment variable containing the bearer token to send to a remote app
          server websocket

      --strict-config
          Error out when config.toml contains fields that are not recognized by this version of
          Codex

  -i, --image <FILE>...
          Optional image(s) to attach to the initial prompt

  -m, --model <MODEL>
          Model the agent should use

      --oss
          Use open-source provider

      --local-provider <OSS_PROVIDER>
          Specify which local provider to use (lmstudio or ollama). If not specified with --oss,
          will use config default or show selection

  -p, --profile <CONFIG_PROFILE_V2>
          Layer $CODEX_HOME/<name>.config.toml on top of the base user config

  -s, --sandbox <SANDBOX_MODE>
          Select the sandbox policy to use when executing model-generated shell commands
          
          [possible values: read-only, workspace-write, danger-full-access]

      --approve-for-me
          Route approval requests through automatic review using the workspace-write sandbox

      --dangerously-bypass-approvals-and-sandbox
          Skip all confirmation prompts and execute commands without sandboxing. EXTREMELY
          DANGEROUS. Intended solely for running in environments that are externally sandboxed

      --dangerously-bypass-hook-trust
          Run enabled hooks without requiring persisted hook trust for this invocation. DANGEROUS.
          Intended only for automation that already vets hook sources

  -C, --cd <DIR>
          Tell the agent to use the specified directory as its working root

      --worktree
          Run the session in a new managed Git worktree

      --add-dir <DIR>
          Additional directories that should be writable alongside the primary workspace

  -a, --ask-for-approval <APPROVAL_POLICY>
          Configure when the model requires human approval before executing a command

          Possible values:
          - on-request: The model decides when to ask the user for approval
          - never:      Never ask for user approval Execution failures are immediately returned to
            the model

      --search
          Enable live web search. When enabled, the native Responses `web_search` tool is available
          to the model (no per‑call approval)

      --no-alt-screen
          Disable alternate screen mode
          
          Runs the TUI in inline mode, preserving terminal scrollback history.

      --no-daemon
          Run without the shared background server, even if it is already running

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version

```

## preserved-8

Vir: `api/P09-C-001/model/request-00010.json.gz`, callId `call_f6dd19792d3642b1be5f514ad3f6be75`.

```text
{"cmd": "/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/tools/codex-0.158.0-alpha.2.1/CodexCLI.app/Contents/MacOS/codex debug --help | sed -n '1,220p'", "workdir": "/Users/zan/Documents/mag/experiments/openrouter-study/glm/runtime/.work/pilots/P09-C-001/app", "yield_time_ms": 10000, "max_output_tokens": 10000}
Chunk ID: 66d41a
Wall time: 0.0000 seconds
Process exited with code 0
Original token count: 295
Output:
WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)
Debugging tools

Usage: codex debug [OPTIONS] <COMMAND>

Commands:
  models        Render the raw model catalog as JSON
  app-server    Tooling: helps debug the app server
  prompt-input  Render the model-visible prompt input list as JSON
  help          Print this message or the help of the given subcommand(s)

Options:
  -c, --config <key=value>
          Override a configuration value that would otherwise be loaded from `~/.codex/config.toml`.
          Use a dotted path (`foo.bar.baz`) to override nested values. The `value` portion is parsed
          as TOML. If it fails to parse as TOML, the raw string is used as a literal.
          
          Examples: - `-c model="o3"` - `-c 'sandbox_permissions=["disk-full-read-access"]'` - `-c
          shell_environment_policy.inherit=all`

      --enable <FEATURE>
          Enable a feature (repeatable). Equivalent to `-c features.<name>=true`

      --disable <FEATURE>
          Disable a feature (repeatable). Equivalent to `-c features.<name>=false`

  -h, --help
          Print help (see a summary with '-h')

```

