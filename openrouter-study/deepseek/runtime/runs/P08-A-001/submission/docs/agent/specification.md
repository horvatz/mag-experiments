# P08 — Koledarski pregled rokov: razvojna specifikacija

Postopek A (en agent), različica 1.0. Podlaga: `task/instructions.md`,
`task/specification-template.md`, `PROJECT_RULES.md`, `docs/dizajn.md`.

## Problem in kontekst

Uporabnik v projektu Folio želi opravila pregledati po rokih glede na vnaprej
določen referenčni datum, ne glede na uro naprave. Izhodišče ponuja preglednico
in tablo z vsemi opravili projekta, brez pogleda po rokih in brez števcev skupin.
Dodamo izbirnik referenčnega datuma in skupine (all/overdue/today/week/later/done)
ter pet števcev; obstoječi videz Folio, pogleda, navigacija in podrobnosti se
ohranijo.

## Vhodi, dejanja in izidi

- Podatki: `Task` iz obstoječega javnega API-ja (`/api/projects/:id/tasks`);
  uporabljena polja `id`, `projectId`, `status`, `dueDate`; `dueDate` je
  koledarski `YYYY-MM-DD`.
- Referenčni datum: `input type=date` z oznako `Referenčni datum`; začetna
  vrednost je vedno `2026-09-21` (R01). Prazno/neveljavno besedilo polja pusti
  zadnji veljavni izračun in prikaže `role=alert` z besedilom
  `Vnesi veljaven referenčni datum.`; nov veljaven datum opozorilo odstrani (R08).
- Skupina: `select` z oznako `Pogled rokov`, vrednosti `all`, `overdue`,
  `today`, `week`, `later`, `done`; začetna vrednost `all` (R01, R07).
- Uspeh: izbrana skupina se prikaže v izvornem vrstnem redu opravil iz API-ja;
  števci ostanejo vezani na celoten projekt (R06, R07).
- Napaka: neveljaven datum → opozorilo, brez spremembe izračuna; napake
  nalaganja ostanejo v obstoječem `LoadError`.
- Preklic: ni posebnega preklica; menjava projekta ali osvežitev ponastavi
  datum in skupino na začetne vrednosti (R10).

## Zahteve in pravila

Simboli: `ref` = zadnji veljavni referenčni datum; `d` = `dueDate` opravila;
`+n` = prištevanje koledarskih dni; `group(t)` = skupina opravila `t`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta: `dateText = ref = 2026-09-21`, `filter = all`; nobena koda ne bere trenutne ure naprave. | lastni test R01 (začetne vrednosti, neodvisnost od ure) |
| R02 | `t.status = done ⇒ group(t) = done`; `done` ni v nobeni od štirih skupin odprtih opravil. | lastni test R02 (done z rokom v preteklosti in prihodnosti) |
| R03 | `t.status ≠ done ∧ d < ref ⇒ overdue`; `t.status ≠ done ∧ d = ref ⇒ today`. | lastni test R03 |
| R04 | `t.status ≠ done ∧ ref+1 ≤ d ≤ ref+7 ⇒ week`; `t.status ≠ done ∧ d > ref+7 ⇒ later`. Skupine so disjunktne, vsako odprto opravilo je v natanko eni. | lastni test R04 (meje +1/+7/+8, disjunktnost) |
| R05 | Primerjava in seštevanje potekata na koledarskih nizih `YYYY-MM-DD` prek `Date.UTC`; `+n` deluje čez meje meseca, leta in prestopni februar. | lastni test R05 (`2024-02-28 +1 = 2024-02-29`, `2025-12-31 +1 = 2026-01-01`) |
| R06 | Števci `overdue/today/week/later/done` štejejo vsa opravila projekta; aktivni filter jih ne spremeni. Vsak ima `aria-label="Število rokov <ključ>"` in samo številsko vrednost. | lastni test R06 (števci pred/po filtru), D02 |
| R07 | `select` ponuja all/overdue/today/week/later/done; izbrana skupina se prikaže v vrstnem redu iz API-ja; izbira ne spreminja podatkov. | D01, D02, D04; lastni test R07 (vrstni red, brez sprememb) |
| R08 | Veljaven nov `ref` takoj preračuna skupine in vrstice ter ohrani filter; prazen/neveljaven vnos → `role=alert` in nespremenjen zadnji izračun; veljaven vnos opozorilo odstrani. | D03; lastni test R08 |
| R09 | Preglednica in tabla prikažeta iste filtrirane ID-je; preklop pogleda ohrani `ref`, besedilo polja in skupino. | lastni test R09 (primerjava ID-jev tabela/tabla, ohranitev stanja) |
| R10 | Menjava projekta in osvežitev ponastavita datum in skupino na `2026-09-21`/`all`; filter se ne shranjuje v `localStorage` ali URL. | lastni test R10 |
| R11 | Prazen projekt → pet ničel; prazna skupina v nepraznem projektu → `Ni opravil v izbrani skupini.` ob ohranjenem izbirniku. | lastni test R11 |
| R12 | Bere se samo `/api/`; nobenih zapisovalnih zahtevkov; `data-task-id` ostane na vrsticah in karticah; obstoječi `aria-label="Pregled stanj opravil"`, imena pogledov/stolpcev in Folio videz ostanejo; pri 390 px se stran ne preliva. | D04 (readonly), obstoječi baseline testi, lastni test R12 (mobilna širina) |

Predpostavke: API vedno vrne veljavne koledarske datume; neveljaven `dueDate`
(izven opisane domene) se obravnava kot `later`, da so skupine popolne.
Referenčni datum je lokalno stanje trenutnega projekta, ne trajna shramba.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetne vrednosti | `tests/agent/P08.spec.ts` › R01 | `src/App.tsx` (`useState(REFERENCE_DATE)`), `src/dueGroups.ts` | glej `docs/agent/verification.md` |
| R02 | done izločen | agent R02 | `src/dueGroups.ts` (`dueGroup`) | glej `docs/agent/verification.md` |
| R03 | meji overdue/today | agent R03, D01 | `src/dueGroups.ts` | glej `docs/agent/verification.md` |
| R04 | meje tedna | agent R04, D02 | `src/dueGroups.ts` | glej `docs/agent/verification.md` |
| R05 | koledarska aritmetika | agent R05 | `src/dueGroups.ts` (`addDays`) | glej `docs/agent/verification.md` |
| R06 | pet števcev | agent R06, D02 | `src/App.tsx` (`summary-grid`) | glej `docs/agent/verification.md` |
| R07 | izbirnik in vrstni red | agent R07, D01/D02/D04 | `src/App.tsx` (`due-toolbar`, `filterTasks`) | glej `docs/agent/verification.md` |
| R08 | opozorilo in preračun | agent R08, D03 | `src/App.tsx` (`changeDate`, `role=alert`) | glej `docs/agent/verification.md` |
| R09 | skladnost pogledov | agent R09 | `src/App.tsx`, `src/TaskBoard.tsx` | glej `docs/agent/verification.md` |
| R10 | ponastavitev | agent R10 | `src/App.tsx` (`key={project.id}`), brez URL/shrambe | glej `docs/agent/verification.md` |
| R11 | prazna stanja | agent R11 | `src/App.tsx` (`Ni opravil v izbrani skupini.`) | glej `docs/agent/verification.md` |
| R12 | brez zapisov, odzivnost | agent R12, D04, baseline | `src/styles.css` (`.due-toolbar`, `.summary-grid`) | glej `docs/agent/verification.md` |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; izbrana je vrstica pod povzetkom.
- Končni skriti testi niso dostopni; preverjanje temelji na razvojnih testih,
  lastnih testih in baseline sklopu.
- Vtičnik za vnos datuma v Chromiumu ne omogoča delnih neveljavnih nizov, zato
  se neveljavnost preverja predvsem prek praznega polja in neveljavnih vrednosti
  iz kode.

## Spremembe specifikacije

- 2026-10-09: prva različica; med izvedbo brez sprememb zahtev.
