# P06 — preverjanje in sledljivost

2026-09-23. Dokazila za [specifikacijo](P06/spec.md), [načrt](P06/plan.md) in [naloge](P06/tasks.md).

## Sprotni zapis

- T001: prebrani lokalna veščina, izvirne zahteve, ustava, specifikacija, načrt in naloge. Integracija je v `src/App.tsx` → `ProjectView`, ključ projekta že zagotavlja ponastavitev. Tipi in konfiguracija testov so bili pregledani pri načrtu; infrastruktura ostaja nespremenjena.
- Dokazila so po izrecnem navodilu zbrana tukaj namesto načrtovanega `P06/validation.md`; podvajanja ni.
- Ob začetku implementacije testi še niso bili izvedeni; poznejši rezultati so spodaj. Končni testi niso dostopni.
- T002: dodana čista pretvorba `src/csv.ts`; brez mutacij, API-ja ali lokalne shrambe. Preverjanje sledi v T003.
- T003: `npx playwright test tests/agent/csv.spec.ts --project=agent` — izhod 0, **4/4 uspešno** (C01–C04); [dnevnik](P06/csv-tests.log).
- T004–T005: dodane kontrole, prenos in lokalni prilagodljivi slogi; ključ projekta in izvorni prikazi so ohranjeni. Preverjanje uporabniških poti sledi v T006.
- T006: `npx playwright test --project=agent` — izhod 0, **11/11 uspešno** (C01–C04, A01–A07), 6,4 s; [dnevnik](P06/agent-tests.log). Shranjeni [namizni](P06/desktop.png), [mobilni](P06/mobile.png) in [mobilni tabla](P06/mobile-board.png) posnetek. Test A06 potrdi vidni fokus, podrobnosti, odsotnost zapisov in prelivanja pri 390 pikah.
- T007: `npm run check` — izhod **0**; lint, TypeScript in produkcijska gradnja uspešni; **57/57 testov uspešno** v 23,1 s (38 osnovnih, 8 razvojnih P06, 11 lastnih). [Celotni dnevnik](P06/check.log). Zagon ni zahteval popravkov infrastrukture ali odvisnosti.
- Vizualni pregled vseh treh posnetkov: ohranjeni logotip, navigacija, barve, tipografija, povzetki, preglednica in tabla Folia. Kontrole se pri 390 pikah prelomijo znotraj vsebine; preglednica/tabla se pomikata znotraj prikaza. Mobilni posnetek table prikazuje notranji pomik do odprtega opravila. Vidni fokus je dodatno preverjen v A06.

## Sledljivost R01–R12

Sprejemni pogoji in predikati ostanejo v [specifikaciji](P06/spec.md#zahteve-in-pravila). C01–C04 so testi v [csv.spec.ts](../../tests/agent/csv.spec.ts), A01–A07 v [export.spec.ts](../../tests/agent/export.spec.ts), D01–D04 pa v nespremenjenih [razvojnih testih](../../tests/development/P06.spec.ts). Vsak spodaj navedeni test je izveden v uspešnem [celotnem zagonu](P06/check.log); razvojni testi so izvedeni na namizju in mobilni napravi.

| Zahteva | Pogoj | Izvedeni testi / scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Vse kolone, `;`, `all`, trenutni projekt in izvorni vrstni red | C01/C02, A01/A04 (13 vrstic, dva projekta), D01 | [CsvExport](../../src/CsvExport.tsx): začetno stanje; [csv](../../src/csv.ts): `serializeCsv`; [App](../../src/App.tsx): `ProjectView` | Uspešno, check.log |
| R02 | Kanonično zaporedje izbranih kolon in njihovih vrednosti | C01/C02, A02, D02 | [csv](../../src/csv.ts): `CSV_COLUMNS`, izbor `columns`; [CsvExport](../../src/CsvExport.tsx): checkboxi | Uspešno, check.log |
| R03 | Brez kolon ni prenosa; ponovni izbor upošteva vrstice | C02, A02/A05 | [CsvExport](../../src/CsvExport.tsx): `enabled`, `disabled`, `download`; [csv](../../src/csv.ts): varovalo `null` | Uspešno, check.log |
| R04 | Stabilno filtriranje samo CSV; prazno pomeni onemogočeno | C02, A03/A05, D02 | [csv](../../src/csv.ts): `rows`; [CsvExport](../../src/CsvExport.tsx): `hasRows`; [App](../../src/App.tsx): ohranjen `tasks` | Uspešno, check.log |
| R05 | Ime datoteke, UTF-8 BOM, lokalni prenos brez nove strani/zapisov | C01, A01/A04/A06, D01/D04 | [csv](../../src/csv.ts): začetni BOM; [CsvExport](../../src/CsvExport.tsx): `download`, Blob in začasna povezava | Uspešno, check.log |
| R06 | Obe ločili, navedene glave/vrednosti, podvojeni narekovaji | C01/C04, A02/A07, D02/D03 | [csv](../../src/csv.ts): `quote`, `csvValue`, `serializeCsv`; [CsvExport](../../src/CsvExport.tsx): select ločila | Uspešno, check.log |
| R07 | CRLF med in po vrsticah, ohranjeni notranji prelomi | C01, A01/A07, D01/D03 | [csv](../../src/csv.ts): `quote`, zaključni zapis; [CsvExport](../../src/CsvExport.tsx): Blob brez pretvorbe prelomov | Uspešno, check.log |
| R08 | Samo točni začetni znaki, apostrof pred izvirnim nizom, vse podatkovne kolone | C03/C04, A07, D03 | [csv](../../src/csv.ts): `csvValue`, uporaba pri vsaki podatkovni celici; glava uporablja samo `quote` | Uspešno, check.log |
| R09 | Unicode, presledki, celotni opisi, interni status, izvorni datum | C01/C03, A01/A07, D03 | [csv](../../src/csv.ts): neposredni `task[column]`, brez oblikovanja ali obrezovanja | Uspešno, check.log |
| R10 | Enake nastavitve in bajti med preglednico in tablo | A03/A04, D04 | [App](../../src/App.tsx): `CsvExport` izven pogoja pogleda; [CsvExport](../../src/CsvExport.tsx): lokalno stanje | Uspešno, check.log |
| R11 | Menjava/vrnitev projekta in osvežitev ponastavijo stanje; vsak prenos uporablja trenutne možnosti | A03/A04 (osvežitev v obeh pogledih) | [App](../../src/App.tsx): obstoječi `key={project.id}`; [CsvExport](../../src/CsvExport.tsx): začetno stanje in `download` | Uspešno, check.log |
| R12 | Brez mutacij/zapisov, ohranjen bralni prikaz in prilagodljivost | C02, A01/A03/A04/A06, D04 in 38 osnovnih testov; vizualni pregled | [csv](../../src/csv.ts): nemutirajoči filter/map; [App](../../src/App.tsx): integracija; [slogi](../../src/styles.css): `.csv-*` | Uspešno, check.log in zgornji posnetki |

## Obseg sprememb in omejitve

- Aplikacija: nova `src/csv.ts` in `src/CsvExport.tsx`, en uvoz in komponenta v `src/App.tsx`, lokalni slogi `.csv-*` v `src/styles.css`. Dodana sta dva lastna testna dokumenta; infrastruktura, strežnik, skupni tipi, skupni testi in odvisnosti niso bili urejani. V prejšnjih procesnih korakih sta bili zapisani dovoljena ustava in `.specify/feature.json`.
- Znane neizpolnjene zahteve R01–R12: **nobene** po lokalnem preverjanju. Končni testi niso dostopni in niso bili izvedeni. Uspeh lokalnih primerov ni trditev o izvedbi vseh možnih vhodov.
- Preverjanje uporablja nameščeni Chromium in nespremenjeno Playwright konfiguracijo. Posnetki izhajajo iz testa A06; ločen ročni strežnik ni bil potreben.
- C04 namenoma izolirano preverja nizovno pravilo za vsako kolono tudi z vrednostjo izven domene statusa/datuma; integracijski testi uporabljajo veljavne podatke.
- Zapisovalne zahteve skupnih API-testov so dejanja testnega programa, ne novega uporabniškega vmesnika. Lastni testi opazujejo aplikacijske zahteve in potrjujejo njihovo odsotnost pri izvozu.
- Dnevniki vsebujejo opozorili okolja npm `http-proxy` in `NO_COLOR/FORCE_COLOR`; ukazi so se zaključili uspešno. Ni neizvedenih načrtovanih lokalnih preverjanj ali sprememb obsega funkcionalnosti.

- T008: posodobljena sledljivost vseh R01–R12, zgodovina specifikacije in vseh osem dejansko izvedenih nalog; preverjene lokalne povezave in odsotnost testnih kontrol/shrambe/API-zapisov v novi izvozni kodi.
