# Preverjanje P06

Datum preverjanja: 2026-10-10.

## Izvedena preverjanja

| Preverjanje | Zahteve | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | R01–R12 | Uspešno, brez tipovnih napak. |
| `npm run lint` | R01–R12 | Uspešno, brez ESLint napak. |
| `npx playwright test --project=agent` | R01–R12 | Uspešno: 8/8 lastnih testov. |
| `npx playwright test --project=development-desktop --project=development-mobile` | R01–R12 | Uspešno: 8/8 skupnih razvojnih testov. |
| `npm run check` | R01–R12 | Uspešno: ESLint, produkcijska izgradnja in 54/54 Playwright testov. |

## Povezave z zahtevami

| Zahteva | Dokaz |
| --- | --- |
| R01 | `tests/agent/ui.spec.ts:6` preveri privzeti izvoz, izvorni vrstni red in BOM; `src/csv.ts:27` izbere podatke trenutnega projekta. |
| R02 | `tests/agent/csv.spec.ts:22` preveri nespremenljivi vrstni red kolon ne glede na vrstni red izbire. |
| R03 | `tests/agent/ui.spec.ts:17` preveri onemogočen izvoz zaradi praznega filtriranega rezultata ali brez izbrane kolone ter odsotnost prenosa. |
| R04 | `tests/agent/ui.spec.ts:35` preveri, da filter omeji izvoz, prikaz vmesnika pa ostane celoten. |
| R05 | `tests/agent/ui.spec.ts:6` preveri ime `folio-web.csv`, UTF-8 BOM in odsotnost nove strani; testi nadzorujejo tudi odsotnost zapisovalnih API zahtev. |
| R06–R08 | `tests/agent/csv.spec.ts:15` preveri navedbo vrednosti, podvajanje narekovajev, CRLF, nevtralizacijo formul in ločilo `;`; `tests/agent/csv.spec.ts:22` preveri ločilo `,`. |
| R09 | `tests/agent/csv.spec.ts:15` preveri Unicode, notranje prelome, interno vrednost `status` in izvirni datum. |
| R10 | `tests/agent/ui.spec.ts:35` primerja izvoz po preklopu Preglednica/Tabla in preveri ohranitev nastavitev. |
| R11 | `tests/agent/ui.spec.ts:48` preveri ponastavitev po menjavi projekta in po osvežitvi. |
| R12 | `tests/agent/ui.spec.ts:35` preveri brez zapisovalnih zahtev in brez sprememb testnega stanja; celoten `npm run check` ohrani obstoječe izhodiščne funkcije. |

## Omejitve in opombe

- Aplikacija bere izključno javni API `/api/`; kontrola `/__test/reset` je uporabljena samo v testnem programu.
- Testni bralnik je ločen in določen prek obstoječe Playwright konfiguracije; zunanji dostop ni bil potreben.
- Trajna shramba izvoznih nastavitev ali URL-parametri niso zahtevani, zato niso dodani.
- `npm run check` je po spremembah znova zagnan; rezultat je zapisan v tabeli zgoraj.
- Urejevalno orodje `apply_patch` in here-doc v tej lupini zaradi omejitev okolja nista bila na voljo; datoteke so bile urejene z lokalnimi ukazi. To ni vplivalo na vsebino ali izide preverjanj.
