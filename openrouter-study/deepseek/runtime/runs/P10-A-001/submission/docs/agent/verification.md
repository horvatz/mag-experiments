# P10 – Poročilo o preverjanju (postopek A)

Datum: 2026-10-09. Okolje: macOS, Node.js 24.11.1, Chromium prek
`task/browser.json` (`chromium.connect`), lokalni strežnik Playwright na
5174/3102. Omrežje javnega interneta ni bilo uporabljeno.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run check` | `eslint`, `tsc --noEmit`, `vite build`, vsi Playwright testi | **uspešno, 55/55 preverjanj** |
| `npx playwright test --project=agent` | lastni testi T01–T09 | uspešno, 9/9 (izvedeno pred celotnim pregledom in znotraj `check`) |
| `npx playwright test --project=development-desktop --project=development-mobile` | razvojni testi D01–D04 (posredno v `check`) | uspešno, 8/8 |

Razčlenitev `npm run check`: 14 podatkovni vmesnik/strežnik, 12 namizni
skupni testi, 12 mobilni skupni testi, 4 razvojni namizni, 4 razvojni mobilni,
9 lastnih. Skupaj 55. Slog kode, tipi in gradnja so bili uspešni brez napak.

## Povezava zahtev z dejanskimi preverjanji

| Zahteva | Dejansko preverjanje | Dokaz |
| --- | --- | --- |
| R01 | T01: 12 opravil, začetni `P = P0`, mesta 1–12 po ID-ju, enaki naslovi in Unicode; D01 | `agent` T01 uspešen; D01 uspešen |
| R02 | T02: premik dol zamenja globalna soseda, polja/status/števci nespremenjeni; D01 | T02, D01 uspešna |
| R03 | T02/T04: `Premakni web-01 gor` in `Premakni web-12 dol` onemogočena; D01 | uspešno |
| R04 | T03/T05: vsak premik doda prejšnjo permutacijo; razveljavitev obnovi in ponuja ponovitev; D02 | uspešno |
| R05 | T03/T05: zaporedne razveljavitve in ponovitve ohranijo permutacije brez izgube/podvajanja | uspešno |
| R06 | T04: veljaven premik po razveljavitvi onemogoči ponovitev; robni premik je onemogočen in ponovitev ostane; D03 | uspešno |
| R07 | T05: 21 premikov → `Razveljavitve: 20`, 20 razveljavitev → `Ponovitve: 20`, 20 ponovitev vrne končno stanje | uspešno |
| R08 | T06: reset ob `P ≠ P0` doda eno dejanje in počisti ponovitve; ob `P = P0` onemogočen; D04 | uspešno |
| R09 | T01/T02: tabla prikaže podzaporedja po statusu, globalno mesto 1–12, premik na tabli uporabi globalnega soseda; D04 | uspešno |
| R10 | T07: preklop pogleda in podrobnosti ohranijo `P`, `U`, `R`; menjava projekta in `page.reload()` ponastavita | uspešno |
| R11 | T05–T08: besedilo `Razveljavitve: U. Ponovitve: R.`, onemogočeni gumbi pri ničli, prazno in eno opravilo; D02, D03 | uspešno |
| R12 | T01/T02/T09 in D04: noben PATCH/POST na `/api/`, `saveRequests = 0`, števci stanj nespremenjeni, pri 390 px brez vodoravnega prelivanja | uspešno |

Lastni testi so v `tests/agent/p10.spec.ts` (T01–T09); specifikacija je v
`docs/agent/specification.md`. Vsi lastni testi uporabljajo nadzorovane GET
odgovore prek `page.route` in javni API; testnih kontrol `/__test/` za stanje
uporabniškega vmesnika ne uporabljajo (samo `POST /__test/reset` in branje
`saveRequests`, kot to počnejo tudi skupni testi).

## Zaznani popravki med izvedbo

- Prva različica lastnih testov je pričakovala napačne števce (npr. reset
  doda dejanje na obstoječi sklad, zato je bilo 3 namesto 1; števci stanj so
  6/3/3 in ne 4/3/3). Popravljena so bila pričakovanja testov, ne vedenje
  aplikacije; specifikacija se ni spremenila.
- `eslint` je zahteval `useMemo` za izpeljane permutacije v
  `src/useTaskOrder.ts`; popravek je vključen.

## Omejitve in nepreverjeno

- Končni (skriti) ocenjevalni testi in njihovi podatki niso dostopni; njihovih
  izidov tu ne navajam kot opravljenih.
- Ročni pregled v brskalniku z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil
  izveden v okviru časovne omejitve; odzivnost je preverjena avtomatsko pri
  390 px in v mobilnih projektih Playwright (iPhone 13, Chromium).
- Preverjeni so bili primeri z 0, 1, 2 in 12 opravili; meje z zelo velikim
  številom opravil (>1000) niso bile merjene.
- Sočasne spremembe podatkov brez osvežitve niso del obsega; ob novem ključu
  prejetih ID-jev se lokalno stanje ponastavi.
