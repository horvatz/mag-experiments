# Preverjanje P03 - Iskanje in sestavljeni filtri

Datum: 2026-10-11. Postopek A (en agent). Vse spodnje je bilo dejansko izvedeno v tem okolju; Chromium je bil povezan prek `task/browser.json` (`wsEndpoint`), javni internet ni bil uporabljen.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` | uspesno, brez napak |
| `npm run lint` | ESLint po celem repozitoriju | uspesno, brez opozoril |
| `npx playwright test --project=development-desktop --project=development-mobile --project=agent` | razvojni D01-D04 (2 projekta) + lastni A01-A17 | 25/25 uspesno |
| `npm run check` | lint + build + vsi projekti (api, desktop, mobile, development-desktop, development-mobile, agent) | **63/63 uspesno** (38 izhodisce + 8 razvojnih P03 + 17 lastnih) |

Dokaz: dnevnik zagona `npm run check` z izpisom `63 passed (24.0s)`; porocilo je v `playwright-report/html/`. Prvi zagon lastnih testov je odkril napacne predpostavke testov (napacna oseba pri opravilih, podniz `=SUM(A1`), ki so bile popravljene v `tests/agent/P03-agent.spec.ts`; koncni zagon je vseh 17 lastnih testov opravil.

## Sledljivost zahtev

| Zahteva | Preverjanje | Rezultat in dokaz |
| --- | --- | --- |
| R01 | D01, A01 | Uspesno: privzeto prazno iskanje, `all` filtra, vsa opravila v izvornem vrstnem redu (A01 z obrnjenim vrstnim redom vhodnih zapisov). |
| R02 | D01 (`CAS` -> `web-01`), A03 (`cas`, `crt`, `DRUGA VRSTICA`, `maja`) | Uspesno: NFD + odstranjeni U+0300-U+036F + male crke; iskanje po vseh stirih poljih. |
| R03 | A04 (vrstni red besed, `"citat"`, `=SUM(A1)`, neobstojeca beseda), A05 (samo beline) | Uspesno: vse besede kot dobesedni podnizi, prazen/blank vnos ne omejuje. |
| R04 | D02, A06 | Uspesno: IN med iskanjem, stanjem in natancno primerjano osebo; stanja `all/todo/in_progress/done`. |
| R05 | A07, A08 | Uspesno: moznosti `all` + vsako razlicno neprazno ime projekta enkrat, tudi ko so opravila skrita z drugimi filtri; ob menjavi projekta se moznosti zamenjajo. |
| R06 | D02, A09 | Uspesno: preklop pogleda ohrani vse filtre, ista mnozica ID-jev, stolpci table vsebujejo le prikazana opravila svojega stanja. |
| R07 | A08, A10 | Uspesno: menjava projekta ponastavi iskanje in oba filtra; filtri se ne prenesejo na drugi projekt. |
| R08 | A11 | Uspesno: po osvezitvi so kontrole privzete, `localStorage` prazen, URL ne vsebuje iskanja. |
| R09 | D04, A02, A12 | Uspesno: `Prikazano: N od M.` (N prikazani, M vsa opravila projekta); pregled stanj in stevci stolpcev stejejo prikazane rezultate. |
| R10 | D03, A13, A14 | Uspesno: »Ni zadetkov.« v preglednici in na tabli, oba pogleda uporabna; prazen projekt obdrzi prazno stanje in `0 od 0`. |
| R11 | D03, A02, A15 | Uspesno: »Pocisti filtre« v enem dejanju vrne privzete vrednosti; vrstni red in vrednosti polj se ne spremenijo. |
| R12 | D04, A16, A17, skupni baseline (D01-D38) | Uspesno: filtriranje ne posilja pisanja na `/api/` (`/__test/state.saveRequests = 0`), navigacija in podrobnosti delujeta, pri 390 px ni prelivanja strani, notranje drsenje tabele/table deluje, Folio je ohranjen. |

## Spremembe specifikacije

- Specifikacija `docs/agent/specification.md` je bila napisana pred implementacijo in med izvedbo ni bila spremenjena; popravki so bili le v lastnih testih (napacne predpostavke o odgovornih osebah in o podnizu `=SUM(A1`), zato vrstica popravka specifikacije ni potrebna.

## Spremenjene datoteke

- `src/search.ts` (novo): `normalizeText`, `queryWords`, `matchesQuery`.
- `src/App.tsx`: stanje filtrov, vrstica filtrov, filtriranje, sporocila in stevci; `ProjectView` se ob menjavi projekta remounta (`key={project.id}`).
- `src/styles.css`: slog vrstice filtrov, sporocila »Ni zadetkov.« in prelom pri ozki sirini.
- `tests/agent/P03-agent.spec.ts` (novo): A01-A17.
- `docs/agent/specification.md`, `docs/agent/verification.md` (novo).

## Omejitve in nepreverjeno

- Koncnih (skritih) testov naloge ni mogoce zagnati; pokritost temelji na zahtevah R01-R12, razvojnih testih P03 in lastnih testih.
- Rocni vizualni pregled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden; videz je ohranjen z obstojecimi gradniki in slogovnimi spremenljivkami, preverjen pa je odzivni test A17 pri 390 px.
- Med nalaganjem (pred prvim odgovorom API-ja) vrstica filtrov se ni vidna; to je obstojece stanje nalaganja in ni del zahtev R01-R12.
