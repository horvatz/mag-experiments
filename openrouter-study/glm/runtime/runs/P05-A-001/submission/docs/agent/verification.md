# Verifikacija P05: Straničenje in filter stanja

Datum: 8. oktober 2026

## Izvedena preverjanja

| Preverjanje | Ukaz ali scenarij | Rezultat |
| --- | --- | --- |
| Tipi | `npx tsc --noEmit` | Uspešno; brez napak pri preverjanju tipov. |
| Lastni testi | `npx playwright test tests/agent/P05.spec.ts --project=agent` | Uspešno; 6 od 6 preizkusov. |
| Skupni razvojni testi | `npx playwright test --project=development-desktop --project=development-mobile` | Uspešno; 8 od 8 preizkusov. |
| Celotna preverjanja | `npm run check` | Uspešno; ESLint brez napak, production build uspešen, 52 od 52 Playwright preizkusov. |

## Povezava z zahtevami

| Zahteva | Dokaz preverjanja | Rezultat |
| --- | --- | --- |
| R01 | `tests/agent/P05.spec.ts:8` preveri privzeti `all/all`, izvorni vrstni red in status `Stran 1 od 1. Prikazano 1–8 od 8.` | Izpolnjena. |
| R02 | Isti test preveri velikosti 2, 5 in 10, vse premike, krajšo zadnjo stran in vrnitev na prvo stran. | Izpolnjena. |
| R03 | `tests/agent/P05.spec.ts:8` preveri omogočenost in onemogočenost vseh štirih gumbov na robovih; `all` ima vse onemogočene. | Izpolnjena. |
| R04 | Isti test preklopi iz zadnje strani na novo velikost in preveri prvo stran nove velikosti. | Izpolnjena. |
| R05 | `tests/agent/P05.spec.ts:44` preveri filtre `todo`, `in_progress`, `done` in `all`, njihovo zaporedje in reset na prvo stran. | Izpolnjena. |
| R06 | Isti test primerja ID-je trenutne strani v preglednici in tabli ter preveri števce stolpcev table. | Izpolnjena. |
| R07 | `tests/agent/P05.spec.ts:64` preveri preklop pogleda ter odpiranje in zapiranje podrobnosti brez spremembe stanja. | Izpolnjena. |
| R08 | Isti test preveri osvežitev, menjava projekta `launch` in vrnitev na projekt `web` ter odsotnost stanja v URL-ju. | Izpolnjena. |
| R09 | `tests/agent/P05.spec.ts:8` preveri natančna statusna besedila za velikosti 2 in 5. | Izpolnjena. |
| R10 | `tests/agent/P05.spec.ts:88` preveri prazen projekt; `tests/agent/P05.spec.ts:107` preveri prazen filter in povratek na prvo stran. | Izpolnjena. |
| R11 | `tests/agent/P05.spec.ts:44` preveri pregled stanj za celoten nefiltriran projekt in števce stolpcev za trenutno stran. | Izpolnjena. |
| R12 | `tests/agent/P05.spec.ts:97` preveri odsotnost zapisovalnih zahtev, delujočo podrobnost in širino 390 brez horizontalnega širjenja strani. | Izpolnjena. |
| Obstoječe funkcije | `npm run check` vključuje API, namizne in mobilne izhodiščne teste. | 38 izhodiščnih preverjanj uspešno. |

## Rezultati implementacije

- Filtriranje in izračun odseka sta odvodena iz podatkov iz API-ja v `src/App.tsx:27` in `src/App.tsx:34`.
- Kontrole, gumbi in status so v `src/App.tsx:68`, `src/App.tsx:81` in `src/App.tsx:87`.
- Preglednica in tabla prejmeta isti `visibleTasks`; tabla šteje samo trenutni odsek v `src/TaskBoard.tsx:13`.
- Prilagodljivi slogi kontrol so v `src/styles.css:181` in `src/styles.css:190`.

## Omejitve in opombe

- Vsa preverjanja so izvedena lokalno; zunanji javni internet ni bil uporabljan ali potreben.
- Niso izvedena dodatna ročna preverjanja zunaj Playwrighta, ker so pokrita z namiznimi, mobilnimi in lastnimi testi.
- V tem okolju ukaz `apply_patch` ni bil izvedljiv (napaka `operation not permitted`), zato so spremembe nastale z dovoljenimi lokalnimi ukazi. To ni vplivalo na izdelek ali rezultate preverjanj.
- Neizpolnjenih zahtev R01–R12 ni.
