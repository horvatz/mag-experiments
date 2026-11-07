# Implementerjevo preverjanje

## Načrtovana preverjanja (še neizvedena)

- Pregled obstoječe kode in razvojnih testov P04.
- Izvedba razvojnih testov P04 in baseline/API testov.
- Dodatna lastna preverjanja za normalizacijo, stabilno razvrščanje, stanja pogleda in ožji zaslon.
- Zagon `npm run check` pred oddajo.

## Dnevnik sprememb

- Prebrana specifikacija, osnovna zahteva in projektna pravila.
- Dodan čist razvrščalni modul z normalizacijo, primerjavami stanj in datumov, smermi, sekundarnim ključem in stabilnostjo po izvornem vrstnem redu.
- V `App` dodane štiri kontrola, gumb za ponastavitev in uporaba razvrščenega polja v preglednici in tabli; stanje je lokalno.
- Dodani lastni testi za normalizacijo, enak primarni/sekundarni ključ, ponastavitev pri menjavi projekta, podrobnosti z enakimi naslovi, ozko postavitev, prazen projekt in projekt z enim opravilom.
- Med preverjanjem je bila odkrita in odpravljena napaka v izrazu za odstranjevanje diakritičnih znakov; regex zdaj zajema cel obseg U+0300–U+036F.

## Izvedena preverjanja

- `npm run lint` – uspešno.
- `npm run build` – uspešno (TypeScript in Vite).
- `npx playwright test --project=development-desktop --project=development-mobile` – 8/8 uspešno.
- `npx playwright test tests/agent/P04.spec.ts --project=agent` – 4/4 uspešno.
- `npm run check` – uspešno: 50/50 testov (14 API, 26 baseline, 8 razvojnih P04, 4 lastni).

## Pokritje zahtev

| Zahteva | Izid |
| --- | --- |
| R01 | Pokrito z D01 in baseline; privzete vrednosti so `original`, `asc`, `none`, `asc`. |
| R02 | Pokrito z A01; normalizacija NFD, odstranitev U+0300–U+036F in male črke. |
| R03 | Pokrito z D02/D03 in A04; stanja in datumi delujejo v obeh pogledih. |
| R04 | Pokrito z D01–D04, A01 in A03; smer vpliva samo na izbrani ključ. |
| R05 | Pokrito z D02 in A01; sekundarna smer je neodvisna. |
| R06 | Pokrito z A01; enak ključ ne doda obrata, `original` ohrani prejeti red. |
| R07 | Pokrito z D03 in A04; tabla prejme razvrščeno projekcijo. |
| R08 | Pokrito z baseline, D03 in A02; preklop pogleda ohrani nastavitve. |
| R09 | Pokrito z A02 in baseline; menjava projekta ponastavi kontrole, osvežitev začne s privzetimi. |
| R10 | Pokrito z D04, A01 in A04; reset, prazen projekt in eno opravilo delujejo. |
| R11 | Pokrito z D04 in A03; brez ne-GET zahtev, brez spremembe zapisov. |
| R12 | Pokrito z baseline in A03; ID-ji so enkrat, podrobnosti odprejo pravi zapis pri 390 px. |

## Ugotovitve in specifikacijske napake

- Napaka v specifikaciji ni bila ugotovljena.

## Omejitve okolja

- Preverjanja se izvajajo samo v lokalni nalogi; javni internet ni na voljo.
