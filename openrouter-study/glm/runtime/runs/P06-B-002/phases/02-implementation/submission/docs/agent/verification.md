# Zapis o implementaciji in preverjanju

## Stanje

- Vloga: izvajalec. Začetni zapis je bil ustvarjen pred spremembami, nato dopolnjen po preverjanjih.
- Izvor zahtev: `docs/agent/specification.md` in izvirne zahteve `R01`–`R12` iz `task/instructions.md`.
- Zaključno stanje: implementacija je končana; vsa izvedena preverjanja so uspešna.

## Spremembe in sledljivost

| Zahteva | Izid | Dokaz |
| --- | --- | --- |
| R01 | Izvedeno. Izvoz zajema trenutni `tasks`, ohranja izvorni vrstni red, privzeti filter `all`, vse kolone in ločilo `;`. | `src/csvExport.ts:1`; `src/App.tsx:21`. |
| R02 | Izvedeno. Kolone so shranjene kot podmnožica nespremenljivega `EXPORT_COLUMNS`; klik na novo kolono spremeni le izbor, vrstni red izvoza pa ostane fiksen. | `src/csvExport.ts:3`; `src/App.tsx:32`. |
| R03 | Izvedeno. Gumb je onemogočen brez izbranih kolon ali brez filtriranih vrstic; klik onemogočenega gumba ne ustvari prenosa. | `src/App.tsx:29`; `tests/agent/csvExport.spec.ts:87`. |
| R04 | Izvedeno. Filter izvoza omeji samo izvožene vrstice; prikaz projekta ostane nespremenjen. | `src/csvExport.ts:28`; `src/App.tsx:29`. |
| R05 | Izvedeno. Prenos se ustvari lokalno kot `folio-<projectId>.csv`, vsebina se ne pošlje na strežnik in URL se ne spremeni. | `src/App.tsx:40`; `tests/agent/csvExport.spec.ts:51`. |
| R06 | Izvedeno. Podpira `;` in `,`; vsaka glava in vrednost je v narekovajih, notranji narekovaji so podvojeni. | `src/csvExport.ts:14`. |
| R07 | Izvedeno. Vrstice so ločene s CRLF in zadnja vrstica se zaključi s CRLF; vsebina v vrednostih ostane nespremenjena. | `src/csvExport.ts:33`. |
| R08 | Izvedeno. Vrednost s formulo po poljubnih uvodnih ` `, `\\t`, `\\r` ali `\\n` dobi apostrof pred izvirnim nizom; glava se ne nevtralizira. | `src/csvExport.ts:12`; `tests/agent/csvExport.spec.ts:13`. |
| R09 | Izvedeno. Vsi izvozni podatki ostanejo izvirni, status je interna vrednost, datum pa izvirni `YYYY-MM-DD`. | `src/csvExport.ts:38`. |
| R10 | Izvedeno. Stanje izvoza je v `ProjectView`, zato preklop Preglednica/Tabla ohrani nastavitve in daje enake bajte. | `src/App.tsx:21`; `tests/agent/csvExport.spec.ts:108`. |
| R11 | Izvedeno. Menjava projekta ponastavi stanje prek `key={project.id}`; osvežitev ponastavi lokalni React state. | `src/App.tsx:86`; `tests/agent/csvExport.spec.ts:126`. |
| R12 | Izvedeno. Ni sprememb `Task`, bralnih funkcij ali zapisovalnih API-jev; izvoz uporablja samo lokalni `Blob` in prenos. | `src/App.tsx:40`; `tests/agent/csvExport.spec.ts:83`. |

## Izvedena preverjanja

| Preverjanje | Izid |
| --- | --- |
| `npm run typecheck` | Uspešno. |
| `npx playwright test tests/agent/csvExport.spec.ts --project=agent` | Uspešno: 3 lastni testi. |
| `npx playwright test --project=development-desktop --project=development-mobile` | Uspešno: 8 razvojnih testov. |
| `npm run check` | Uspešno: ESLint, tipi, produkcijska gradnja in Playwright; 49/49 testov. |

## Omejitve in opombe

- Javni internet ni uporabljen; testni strežnik in Chromium delujeta lokalno po projektni konfiguraciji.
- Spremembe so omejene na `src/`, `tests/agent/` in `docs/agent/verification.md`. Strežnik, skupni tipi, skupni testi, infrastruktura in odvisnosti niso spremenjeni.
- `git diff` v tem peskovniku ni zagnan do konca, ker globalna Git konfiguracija ni dostopna; spremembe so preverjene z lintom, tipi, gradnjo in testi.
- Napaka v predani specifikaciji ni ugotovljena.
