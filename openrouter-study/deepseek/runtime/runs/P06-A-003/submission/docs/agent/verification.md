# P06: Zapis preverjanja

Datum: 2026-10-10. Okolje: lokalni Node 24, Playwright z ločenim Chromium,
brez javnega interneta. Spremenjene datoteke: `src/csv.ts`,
`src/CsvExport.tsx`, `src/App.tsx`, `src/styles.css`, lastni testi
`tests/agent/csv-export.spec.ts`, dokumenti `docs/agent/`.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` | uspešno, brez napak |
| `npx playwright test --project=development-desktop --project=development-mobile` | skupni razvojni testi P06 | 8/8 uspešno |
| `npx playwright test --project=agent` | lastni testi | 12/12 uspešno |
| `npm run check` | lint + build + vsi testi | 58/58 uspešno (20,9 s) |

Skupni `npm run check` torej poleg izhodiščnih in razvojnih testov požene tudi
lastne agentne teste; vsi so bili dejansko izvedeni.

## Sledljivost zahtev

| Zahteva | Preverjeni pogoj | Testi (dejansko izvedeni) | Izid in dokaz |
| --- | --- | --- | --- |
| R01 | privzeto `all`, vsi stolpci, `;`, izvorni vrstni red | D01 (desktop+mobile), A01 | uspešno; glava in `web-01`…`web-08` v izvornem vrstnem redu |
| R02 | fiksni vrstni red stolpcev ne glede na klike | A02 | uspešno; izbor description→id→title da glavo `id;title;description` |
| R03 | onemogočen izvoz brez stolpcev, ponovni izbor omogoči, brez prenosa | A03 | uspešno; 0 dogodkov `download` ob vsiljenem kliku |
| R04 | filter omeji le izvoz; prazen rezultat onemogoči; prikaz cel | D02, A04 | uspešno; ob `done` 8 prikazanih, 2 izvožena; prazen rezultat → gumb onemogočen, tabela še prikazuje 2 vrstici |
| R05 | ime `folio-<projectId>.csv`, BOM U+FEFF, brez nove strani/strežnika | D01, A01, A05, A10 | uspešno; `folio-web.csv`/`folio-launch.csv`, prvi znak BOM, število strani 1 |
| R06 | `;`/`,` in podvajanje notranjih narekovajev | D02, A06 (čista + UI) | uspešno; `"Zapis, ""citat"""` |
| R07 | CRLF tudi na koncu; ločila/prelomi ostanejo v vrednosti | D01, A06 (čista + UI) | uspešno; opis `Prva vrstica\nDruga vrstica; čšž` ostane znotraj navedene vrednosti |
| R08 | nevtralizacija `= + - @` za začetnimi presledki/tab/CR/LF | D03, A07, A02 | uspešno; `"'=SUM(A1)"`, `"' =1"`, `"'\t+1"`, `"'\r@x"`, `"'\n-1"`, `"'-1"`, `"'+1"`, `"'@x"`; drugi nizi nespremenjeni |
| R09 | Unicode, presledki, opisi; `status` interno, datum izvorni | D03, A06 (UI) | uspešno; `in_progress`, `2026-09-18`, `Živa Kovač`, čšž ohranjeni |
| R10 | preklop pogleda ohrani nastavitve in da iste bajte | D04 (desktop+mobile), A08 | uspešno; enak `text` v Preglednici in Tabli |
| R11 | menjava projekta in osvežitev ponastavita privzetke | A09 | uspešno; po preklopu in po `reload()` vsi stolpci, `;`, `all` |
| R12 | brez zapisov API, brez sprememb opravil, brez prelivanja | D04, A10, `readonly` v A05/A10 | uspešno; `saveRequests = 0`, noben ne-GET klic; `scrollWidth <= innerWidth` pri 390 px v obeh pogledih |

Opombe k dokazom: D01–D04 so skupni razvojni testi iz
`tests/development/P06.spec.ts`; A01–A10 so lastni testi iz
`tests/agent/csv-export.spec.ts`. Izidi so razvidni iz zgoraj navedenih
dnevnikov zagonov (`8 passed`, `12 passed`, `58 passed`).

## Omejitve in nepreverjeni deli

- Končni (skriti) ocenjevalni testi niso dostopni, zato niso bili izvedeni in
  niso navedeni kot uspešni. Preverjanje pokriva zahteve R01–R12 prek skupnih
  razvojnih in lastnih testov.
- Ročni vizualni pregled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil
  izveden; prilagodljivost videza je preverjena avtomatsko (390 px, oba
  pogleda, brez vodoravnega prelivanja dokumenta), notranje drsenje
  preglednice/table ostaja dovoljeno.
- Čisti testi `src/csv.ts` se izvajajo v Node okolju prek Playwrightovega
  prevajalnika; vedenje v brskalniku pokrivajo UI testi in razvojni testi.
- Navigacija med nedokončanim nalaganjem in sočasne spremembe podatkov brez
  osvežitve ostajajo zunaj obsega, kot določa naloga.

## Zgodovina sprememb specifikacije

- 2026-10-10: specifikacija pripravljena pred implementacijo; med izvedbo ni
  bilo sprememb zahtev. Po potrebi bi popravek zapisali tukaj.
