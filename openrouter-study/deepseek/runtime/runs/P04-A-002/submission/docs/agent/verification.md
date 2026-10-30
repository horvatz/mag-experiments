# Poročilo o preverjanju P04

Datum: 2026-10-30. Postopek A (en agent). Okolje: lokalni strežnik naloge
(`WEB_PORT=5174`, `API_PORT=3102`, `MOCK_CONTROL=1` prek `playwright.config.ts`),
Chromium prek `chromium.connect(wsEndpoint)` iz `task/browser.json`. Javni
internet ni bil uporabljen; zunanjih storitev ni bilo.

## Izvedena preverjanja

| # | Ukaz | Obseg | Rezultat |
| --- | --- | --- | --- |
| 1 | `npm run typecheck` (`tsc --noEmit`) | `src/`, `tests/`, `shared/`, `server/` | uspeh, brez napak |
| 2 | `npm run lint` (`eslint .`) | celoten repozitorij | uspeh, brez opozoril |
| 3 | `npx playwright test --project=development-desktop --project=development-mobile` | razvojni testi P04 (D01–D04 × 2 pogleda) | 8/8 uspeh |
| 4 | `npx playwright test --project=agent` | lastni testi A01–A17 (`tests/agent/P04-agent.spec.ts`) | 18/18 uspeh |
| 5 | `npm run check` (lint + build + vsi projekti: api, desktop, mobile, development-desktop, development-mobile, agent) | celotno preverjanje izhodišča in naloge | **64/64 uspeh** (38 izhodišče + 8 razvojni P04 + 18 lastnih), `vite build` uspeh |

Dokaz: dnevnik zagona ukaza 5 navaja `64 passed (22.2s)`; razčlenitev po
projektih: 38 preverjanj izhodišča (api/desktop/mobile), 8 razvojnih P04 in
18 lastnih agentnih. Posnetki neuspehov niso nastali (vsi testi uspešni).

## Sledljivost zahtev R01–R12

Legenda: D… = `tests/development/P04.spec.ts`, A… = `tests/agent/P04-agent.spec.ts`.

| Zahteva | Pogoj | Izvedeni testi | Koda | Izid in dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto `original/asc/none/asc`, izvorni vrstni red | D01, A01 | `src/sortTasks.ts` (`defaultSortSettings`, `sortTasks`), `src/App.tsx` | uspeh; A01 preveri vrednosti vseh štirih kontrol in enakost z `webIds()` |
| R02 | NFD + odstranitev U+0300–U+036F + male črke, primerjava UTF-16 | D01, A03, A04 | `src/sortTasks.ts` (`normalizeText`, `compareText`) | uspeh; A03: `Čas/cas/C◌̌as` se združijo stabilno, A04: `=SUM(A1) < Alfa 10 < alfa 2 < Zebra` |
| R03 | status todo<in_progress<done, datumi kronološko | D02, A05 | `src/sortTasks.ts` (`statusRank`, `compareKey`) | uspeh; A05 preveri oba ključa, tudi meje 09-09/09-10/10-01 |
| R04 | smer obrne le primerjavo ključa, izenačeni se ne obrnejo | A06, A07 | `src/sortTasks.ts` (`sortTasks`) | uspeh; A06 vsi enaki statusi pri `desc` ostanejo v izvornem vrstnem redu, A07 obrne le različne vrednosti |
| R05 | sekundarni ključ le ob enakosti, svoja smer | D02, A08 | `src/sortTasks.ts` (`sortTasks`) | uspeh; A08 preveri `asc`/`desc` sekundarja in nato še obrat primarnega |
| R06 | ob enakosti obeh ključev izvorni vrstni red; `original` vedno izvorni | A02, A06, A09 | `src/sortTasks.ts` (tie-break po indeksu, `original` vrnitev) | uspeh; A02 tudi ob `S=title desc` in `Dp=desc`; A09 `S=P` ne doda obrata |
| R07 | stolpci `todo/in_progress/done`, relativni vrstni red | D03, A10 | `src/TaskBoard.tsx`, `src/App.tsx` (`orderedTasks`) | uspeh; A10 primerja ID-je stolpcev z filtriranim razvrščenim poljem in vrstni red glav stolpcev |
| R08 | preklop pogleda in podrobnosti ohranita nastavitve | A11 | `src/App.tsx` (stanje v `ProjectView`) | uspeh; A11 preveri vrednosti kontrol in vrstni red po tabla→preglednica in po odprtju/zaprtju dialoga |
| R09 | menjava projekta in osvežitev ponastavita; brez trajne shrambe/URL | A12 | `src/App.tsx` (`key={project.id}`, lokalno stanje) | uspeh; A12 preveri privzete vrednosti po menjavi na `launch` in po `page.reload()` ter odsotnost parametrov v `location.hash` |
| R10 | gumb ponastavi vse štiri; prazno/eno opravilo | D04, A13, A14, A14b | `src/App.tsx` (gumb `Izvorni vrstni red`), `src/sortTasks.ts` | uspeh; A13 ponastavi iz vseh neprivzetih vrednosti, A14 prazno polje (0 vrstic, kontrole delujejo), A14b vse štiri ključe × obe smeri |
| R11 | projekcija; brez zapisov; nespremenjena polja | D04 (`readonly`), A15 | `src/sortTasks.ts` (čista funkcija), `src/App.tsx` (samo GET) | uspeh; A15: `writes = []`, `saveRequests = 0`, polji `Ana Novak` in `datetime=2026-09-18` ostaneta nespremenjeni |
| R12 | ID-ji natanko enkrat, prave podrobnosti ob enakih naslovih, 390 px | A01, A16, A17 + izhodiščni baseline testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | uspeh; A01 unikatnost ID-jev, A16 enaka naslova odpirata različni opravili, A17 brez vodoravnega prelivanja strani pri 390 px v obeh pogledih |

## Omejitve in nepreverjeni deli

- Končni ocenjevalni testi naloge (z drugačnimi podatki) niso dostopni, zato
  niso bili izvedeni; pokritost domene (prazno/eno/več opravil, enaki
  naslovi, Unicode, enaki in različni datumi) je preverjena z lastnimi testi.
- Ročni vizualni pregled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil
  izveden; videz je preverjen posredno prek skupnih izhodiščnih testov
  (desktop in mobilni projekt) in preverjanja prelivanja pri 390 px.
- Nezaključeno nalaganje, sočasne spremembe podatkov brez osvežitve in
  manjkajoči/neveljavni datumi niso v obsegu (dogovor iz navodil).
- Repozitorij je svež izvoz brez zgodovine Git, zato veje in objava nista
  bili izvedeni; spremembe so le datoteke v `src/`, `tests/agent/` in
  `docs/agent/`.

## Spremenjene datoteke

| Datoteka | Vsebina |
| --- | --- |
| `src/sortTasks.ts` | nov modul: tipi nastavitev, `normalizeText`, `compareText`, `sortTasks` |
| `src/App.tsx` | stanje razvrščanja v `ProjectView`, orodna vrstica s štirimi `select` in gumbom, razvrščeno polje za preglednico in tablo |
| `src/styles.css` | slog orodne vrstice in odzivne prilagoditve (≤760 px) |
| `tests/agent/P04-agent.spec.ts` | lastni testi A01–A17 |
| `docs/agent/specification.md`, `docs/agent/verification.md` | specifikacija in to poročilo |
