# Preverjanje P07

Izvedeno 2026-10-30 v tem okolju. Vsak rezultat izhaja iz dejansko izvedenega
zagona; dnevnik ukaza je naveden pri posameznem sklopu. Povezava z zahtevami:
`docs/agent/specification.md`.

## Izvedeni ukazi in rezultati

1. `npx playwright test --project=development-desktop --project=development-mobile --project=agent`
   - izid: **20 passed (10.6 s)** – 8 razvojnih preverjanj P07 (D01–D04 ×
     desktop/mobile) in 12 lastnih testov A01–A12.
2. `npm run check` (lint + `tsc` + `vite build` + vsi testi)
   - izid: **58 passed (23.4 s)**, brez napak lint in build; 38 preverjanj
     izhodišča/API, 8 razvojnih P07 in 12 lastnih.

Ročni ogled prek `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden;
vedenje je pokrito z avtomatiziranimi testi. Nedostopni končni ocenjevalni
testi niso bili izvedeni.

## Sledljivost zahtev

| Zahteva | Dokaz (test) | Rezultat |
| --- | --- | --- |
| R01 | D01 (oba projekta), A01 (gumb zunaj povezave, brez dialoga, tabla), A11 (enaki naslovi) | uspešno |
| R02 | D03, A02 (sortiran unikaten zapis, samo `version`/`ids`) | uspešno |
| R03 | A02 (podvojeni + neznani ID-ji, obnova po osvežitvi), A05 | uspešno |
| R04 | A03 (šest neveljavnih zapisov + manjkajoč ključ, brez prepisa, brez sesutja) | uspešno |
| R05 | D02, A04 (privzeto neoznačeno, izvorni vrstni red) | uspešno |
| R06 | D02, A04 (sporočilo `Ni priljubljenih opravil.`, izklop filtra), A12 | uspešno |
| R07 | D04, A06 (filter in množica preživita preklop pogleda; podrobnosti po ID-ju v D01/A06) | uspešno |
| R08 | A05, A06 (menjava projekta ohrani `F`, ponastavi filter; osvežitev) | uspešno |
| R09 | A05 (odstranitev samo ID-jev projekta; tuji in neznani ostanejo), A07 (onemogočen gumb) | uspešno |
| R10 | A04 (števec ob filtru, vidni števci stolpcev), A06, A12 (0 od 0) | uspešno |
| R11 | A08 (dogodek za pravi/ drugi ključ, `null`, brez povratnega zapisa), A09 (izjema shrambe) | uspešno |
| R12 | D04 in A10 (nobena zahteva ni GET, `saveRequests: 0`), A01, A10 (390 px brez prelivanja) | uspešno |

## Kaj je bilo preverjeno in kako

- Lastni testi so v `tests/agent/P07-agent.spec.ts` s pomožno datoteko
  `tests/agent/helpers.ts`; podatke podajajo nadzorovani GET odgovori prek
  `page.route`, brez uvažanja pripomočkov v aplikacijo.
- A01/A11: ločeni gumbi po ID-jih, zunaj povezav, brez odpiranja podrobnosti.
- A02/A03: natančna oblika zapisa v `localStorage`, dedupe, ohranitev neznanih
  ID-jev, neveljavni zapisi in odsotnost prepisa ob nalaganju.
- A04/A12: filter, prazno stanje, števec `Priljubljeno: X od M.`, vidni števci
  stolpcev table in prazen projekt.
- A05/A06/A07: globalna množica med projekti, ponastavitev filtra, odstranitev
  priljubljenih projekta, onemogočen gumb, osvežitev.
- A08/A09: `StorageEvent` (pravi ključ, drug ključ, `null`, brez povratnega
  zapisa) ter izjema `getItem`/`setItem` z opozorilom `role=alert`, ki vsebuje
  besedo »shramba«, in uporabnostjo v pomnilniku.
- A10: nobene zahteve, ki ne bi bila GET; `saveRequests: 0`; pri širini 390 px
  se stran ne razširi.

## Popravki med izvedbo

- Prva različica preglednice je v telesu tabele mapirala vsa opravila namesto
  filtriranih (`tasks.map` → `(visibleTasks ?? tasks).map`); odkrili so jo
  testi A04/A06, po popravku je `npm run check` v celoti uspešen.
- Specifikacija je bila po testih dopolnjena na različico 1.1 (dodana testa
  A11 in A12 v sledljivost); vsebina zahtev se ni spremenila.

## Omejitve in nepreverjeni deli

- Končni ocenjevalni testi niso dostopni in niso bili izvedeni; navedeni
  rezultati veljajo za izhodiščne, razvojne in lastne teste.
- Lastni testi tečejo v projektu `agent` (namizni Chromium); mobilno vedenje
  pokrivata razvojna projekta `development-mobile` in A10 s 390 px.
- Dogodek `storage` je preverjen s sintetičnim `StorageEvent`, ne z dvema
  resničnima zavihkoma; izjema shrambe je simulirana s prevzemom
  `Storage.prototype.getItem`/`setItem`.
- Pravilo R10 za skupni povzetek stanj (Pripravljeno/V delu/Končano) ostaja
  vezano na vsa opravila projekta; zahteva določa le števce stolpcev table.
