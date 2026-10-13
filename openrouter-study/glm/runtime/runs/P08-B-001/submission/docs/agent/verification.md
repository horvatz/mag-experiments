# Implementerjeva evidence preverjanja

## Začetni zapis

- Vloga: implementer. Predana specifikacija je prebrana; izvirne zahteve R01–R12 ostajajo obvezne.
- Načrtovana izvedba: datumski pripomoček v `src/dueDates.ts`, stanje in števci/filtriranje v `src/App.tsx`, prikaz ter prilagodljivost v obstoječih komponentah/slogih, lastni testi v `tests/agent/`.
- Načrtovana preverjanja: enotski testi koledarskih meja in klasifikacije; UI testi števcev, filtrov, referenčnega datuma, sinhronizacije pogledov, projekta/prazne skupine, osvežitve in omejitve širine; nato `npm run check`.
- Omejitve okolja: spremembe so omejene na `src/`, `tests/agent/` in `docs/agent/`; infrastruktura, odvisnosti in skupni testi so samo berljivi. Playwright uporablja `wsEndpoint` iz `task/browser.json`; `chromium.launch()` ni uporabljen. Javni internet je blokiran. Med fazo je bila navidezna pot do `apply_patch` onemogočena, zato so bili začetni dokumenti in nova datoteka ustvarjeni z `apply_patch`, preostale tri ciljane zamenjave pa izvedene z nadzorovanim urejanjem nizov v Node (brez strežnika, odvisnosti ali infrastrukture).

## Spremembe in povezave z zahtevami

- `src/dueDates.ts`

  - R01: dodana konstanta `DEFAULT_REFERENCE_DATE = "2026-09-21"`; brez branja sistemske ure.
  - R02–R04: `taskDueGroup` najprej obravnava `done`, nato `overdue`, `today`, `week` in `later`, z vključno sedmim dnem.
  - R05: `isCalendarDate`, `compareDates` in `addDays` delujejo čisto s številskimi koledarskimi dnevi, vključno z meseci, leti in prestopnim februarjem; brez `Date`, časovnega pasu ali DST.
- `src/App.tsx`

  - R01/R08/R10: referenčni datum in pogled rokov sta lokalni stanji projekta, začneta z `2026-09-21` in `all`; prazno polje prikaže opozorilo ter obdrži zadnji veljavni datum, veljavna sprememba takoj preračuna prikaz.
  - R06: pet števcev se računa iz celotnega nabora opravil in je neodvisno od aktivnega filtra.
  - R07/R09/R11: `filteredTasks` se uporablja v preglednici in tabli; prazna izbrana skupina v nepraznem projektu prikaže točno `Ni opravil v izbrani skupini.`.
  - R12: dodan bralni `input type=date`, bralni `select`, ohranjena povezava na javni `/api/` in brez zapisovalnih zahtev.
- `src/styles.css`

  - R09/R12: dodan prilagodljiv sklop kontrol, petih števcev in opozorila; obstoječi Folio razpored je ohranjen.
- `tests/agent/dueDates.spec.ts` in `tests/agent/P08.spec.ts`

  - Pokrivajo klasifikacijo, meje datumov, števce, vrstni red, ohranjanje filtra/datuma, reset, prazne skupine/projekte, bralnost in širino 390 px.

## Izvedena preverjanja in rezultati

- `npm run lint` – uspešno.
- `npm run build` – uspešno; Vite izgradi odjemalsko aplikacijo (1876 modulov).
- `npx playwright test --project=agent` – 5/5 uspešno (prvi zagon 2 napaki v lastnih pričakovanih vrednostih: napačen števec `overdue` in potreben reload za prehod na prazen odgovor; po popravku testov 5/5).
- `npx playwright test --project=development-desktop --project=development-mobile` – 8/8 uspešno.
- `npm run check` – uspešno: lint, tipi, gradnja in 51/51 testov (14 API, 24 osnovnih namiznih/mobilnih, 8 razvojnih P08, 5 lastnih).
- Samodejno preverjanje širine 390 px v lastnem UI testu je uspešno (`document.documentElement.scrollWidth <= clientWidth`).

## Sledljivost zahtev

- R01: pokrita z `src/dueDates.ts` začetno konstanto, `src/App.tsx` začetnim stanjem in UI testom.
- R02: pokrita s `taskDueGroup`, enotskim testom za `done` pred/na/po referenci.
- R03: pokrita s `taskDueGroup`, enotskima testoma za prejšnji dan in enak dan.
- R04: pokrita s `taskDueGroup`, enotskimi testi naslednjega dne, 7. in 8. dne ter UI filtri.
- R05: pokrita s čistimi funkcijami in testi čez mesec, leto ter 29. februar; brez sistemske ure ali časovnega pasu.
- R06: pokrita z izračunom števcev nad celotnim seznamom in UI testom pred/po vseh izbirah.
- R07: pokrita s filtri nad izvornim seznamom ter UI preverjanjem ID-jev po skupinah.
- R08: pokrita z UI testom veljavne spremembe, praznega osnutka, ohranjenega filtra in ponovne veljavnosti.
- R09: pokrita s skupnim `filteredTasks` in UI preklopoma med preglednico in tablo.
- R10: pokrita z remountom projekta (`key`), osvežitvijo v UI testu ter preverjanjem, da filter ni v `localStorage` ali URL-ju.
- R11: pokrita z UI testoma za prazno skupino in prazen projekt s petimi ničlami.
- R12: pokrita z bralnimi GET odgovori, nadzorom zapisovalnih zahtev, ohranjenimi bralnimi detalji/testi ter testom širine 390 px.

## Omejitve in opažanja

- Strežnik, skupni tipi, skupni testi, odvisnosti in infrastruktura niso spremenjeni.
- Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`; te uporabljajo samo testi.
- Ni dodane trajne shrambe, URL parameter za novi filter ali zapisovalnega API-ja.
- Specifikacija ni vsebovala zaznane napake. Njen predvideni obseg in izvirne zahteve se ujemajo.
- Vsi dostopni testi so uspešni; nedostopnih ali neizvedenih končnih testov ni navajanih kot uspešnih.

## Status

- [x] Implementacija
- [x] Lastni testi
- [x] `npm run check`
- [x] Končna evidence
