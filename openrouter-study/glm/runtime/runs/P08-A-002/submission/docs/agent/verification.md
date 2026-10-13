# P08 — Zapis o preverjanju

## Izvedena preverjanja

Datum: 2026-10-13, časovni pas Europe/Ljubljana.

| Korak | Zahteve | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | Tipna usklajenost implementacije in testov. | Uspešno (po popravku sintakse). |
| `npm run lint` | Slogovna in statična preverjanja. | Uspešno. |
| `npx playwright test --project=development-desktop --project=development-mobile --project=agent` | Prvi zagon razvojnih P08 in lastnega testa. | 8 razvojnih uspešnih; lastni test neuspešen zaradi napačno izračunanih pričakovanih števcev robnih primerov. |
| Popravek pričakovanih števcev v `tests/agent/P08.spec.ts` | Testna napaka, ne produktna napaka. | Popravljeno. |
| `npx playwright test --project=agent` | Lastni scenarij po popravku. | Uspešno: 1/1. |
| `npm run check` | Lint, build, API/izhodiščni, razvojni in lastni testi. | Uspešno: 47/47. |

## Rezultati celotnega preverjanja

`npm run check` je uspešno izvedel:

- ESLint brez napak.
- TypeScript preverjanje brez napak.
- Vite produkcijski build.
- 14 API preverjanj.
- 24 izhodiščnih UI preverjanj (namizni in mobilni Chromium).
- 8 razvojnih P08 preverjanj (namizni in mobilni Chromium).
- 1 lastno agentno preverjanje.

Skupaj: **47/47 uspešnih**.

## Sledljivost zahtev

| Zahteva | Preverjanje |
| --- | --- |
| R01 | `tests/development/P08.spec.ts` D01 ter lastni test preverita fiksni datum `2026-09-21`; lastni test preveri tudi ponastavitev ob menavi projekta in osvežitvi. |
| R02 | Razvojni D01/D04 in lastni test preverjata, da sta opravili `done-early` in `done-late` vedno v skupini `done`. |
| R03 | Razvojni D01/D03 in lastni test preverjata meji pred in na referenčnem dnevu. |
| R04 | Razvojni D02 in lastni test preverita meji sedmega dne in poznejšega roka; števci zagotavljajo disjunktnost in pokritost. |
| R05 | Lastni test preveri meje meseca, prestopnega meseca in leta (`2026-01-25`, `2026-02-22`, `2026-12-25`) prek UTC `YYYY-MM-DD` računa. |
| R06 | Lastni test preveri vseh pet števcev pred in po aktivnem filtru. |
| R07 | Razvojni D01/D02/D04 in lastni test preverijo ID-je v izvornem vrstnem redu v preglednici in tabli. |
| R08 | Razvojni D03 in lastni test preverita prazni vnos, ohranjanje zadnjega veljavnega preračuna in odstranitev opozorila. |
| R09 | Lastni test preveri preklop med tabelo in tablo ter ohranjeni filter in datum. |
| R10 | Lastni test preveri ponastavitev ob menavi projekta in osvežitvi, odsotnost `due` v URL-ju in prazno trajno shrambo. |
| R11 | Izhodiščni test praznega projekta ter lastni test preverita pet ničel in sporočilo za prazno skupino v nepraznem projektu. |
| R12 | Celoten `npm run check` preverja bralnost, ohranjena dostopna imena in `data-task-id`; lastni test preveri širino 390 px in pomanjkanje API pisanja. |

## Omejitve

- Preverjanja so izvedena v ponujenem lokalnem Chromium okolju, ne v drugih brskalnikih ali fizičnih napravah.
- Javni internet ni uporabljen, ker naloga uporablja samo lokalni API.
- Ni ostalih nezapolnjenih zahtev ali znanih produktnih napak.
