# Preverjanje P05

## Izvedena preverjanja

Datum: 30. 10. 2026.

| Preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run lint` | Uspešno | Brez ESLint napak. |
| `npm run typecheck` | Uspešno | Brez TypeScript napak. |
| `npx playwright test --project=agent` | 9/9 uspešno | Lastni testi R01–R12 v `tests/agent/P05.spec.ts:6`. |
| `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno | Skupni testi D01–D04 na namizju in telefonu. |
| `npm run check` | 55/55 uspešno | 38 izhodiščnih (14 API + 24 UI), 8 razvojnih P05 in 9 lastnih preverjanj; vključno z uspešnim lintom, typecheckom in produkcijsko izgradnjo. |

## Sledljivost zahtev

| Zahteva | Implementacija | Preverjanje |
| --- | --- | --- |
| R01 | Privzeta stanja so `all/all`, izpeljava pa ohrani izvorni vrstni red: `src/App.tsx:28`, `src/App.tsx:39`. | `tests/agent/P05.spec.ts:6` |
| R02 | `filteredTasks.slice(...)` tvori zaporedne odseke brez podvajanja: `src/App.tsx:39`, `src/App.tsx:43`. | `tests/agent/P05.spec.ts:28` |
| R03 | Gumbi imajo HTML `disabled` glede na veljavno stran: `src/App.tsx:85`. | `tests/agent/P05.spec.ts:6` |
| R04 | Sprememba velikosti nastavi `currentPage` na 1: `src/App.tsx:74`. | `tests/agent/P05.spec.ts:28` |
| R05 | Filter se izvede pred strničenjem in njegova sprememba ponastavi stran: `src/App.tsx:39`, `src/App.tsx:79`. | `tests/agent/P05.spec.ts:48` |
| R06 | Preglednica in tabla prejemata isti nabor `pageTasks`; tabla ne strniči stolpcev ločeno: `src/App.tsx:94`, `src/App.tsx:98`, `src/TaskBoard.tsx:13`. | `tests/agent/P05.spec.ts:59` |
| R07 | Stanja so lokalna v `ProjectView`; preklop pogleda in podrobnosti ne spreminjata komponente projekta: `src/App.tsx:28`, `src/App.tsx:110`. | `tests/agent/P05.spec.ts:74` |
| R08 | Ključ `ProjectView` po projektu ponastavi stanje; podatki niso v URL, lokalni ali sejni shrambi: `src/App.tsx:138`, `tests/agent/P05.spec.ts:86`. | `tests/agent/P05.spec.ts:86` |
| R09 | Status ima natančno besedilo z indeksoma in pomišljajem: `src/App.tsx:91`. | `tests/agent/P05.spec.ts:6` |
| R10 | Prazen rezultat da stran 0, prikaz 0–0 in onemogoči vse štiri gumbe: `src/App.tsx:41`, `src/App.tsx:85`, `src/App.tsx:91`. | `tests/agent/P05.spec.ts:107`, `tests/agent/P05.spec.ts:119` |
| R11 | Pregled šteje nefiltrirane `tasks`, stolpci table pa prejete `pageTasks`: `src/App.tsx:34`, `src/App.tsx:94`, `src/TaskBoard.tsx:17`. | `tests/agent/P05.spec.ts:59` |
| R12 | UI uporablja samo obstoječi `GET /api/`; strničenje ne kliče zapisovalnih API-jev: `src/App.tsx:32`, `src/useResource.ts:9`. | `tests/agent/P05.spec.ts:59`, `tests/agent/P05.spec.ts:86`, `tests/agent/P05.spec.ts:125` |

## Omejitve

- Preverjanja so izvedena proti lokalnemu razvojnemu strežniku s kontroliranimi GET odgovori, kot predvideva naloga; javni internet ni bil na voljo ali uporabljen.
- Niso preverjana sočasna spreminjanja podatkov brez osvežitve ter navigacija med nezaključenim nalaganjem, ker ju naloga izrecno ne zahteva.
- Ni znanih neizpolnjenih zahtev. Opombe `npm warn Unknown env config "http-proxy"` in opozorila okolja niso ovirala preverjanj.
- Orodje `apply_patch` v tej izvedbi ni bilo na voljo (ukaz ni najden); spremembe so bile zapisane neposredno v dovoljene mape. To ne vpliva na preverjene izide.
