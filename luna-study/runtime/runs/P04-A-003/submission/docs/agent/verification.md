# Preverjanje P04

## Izvedeni ukaz in rezultat

Zagnan je bil zahtevani ukaz `npm run check` po končni spremembi aplikacije in lastnih testov. Rezultat zaključnega zagona:

- ESLint: uspešno.
- `tsc --noEmit`: uspešno.
- Vite produkcijska gradnja: uspešno.
- Playwright: **54 uspešnih, 0 neuspešnih** (14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih P04 namiznih/mobilnih, 8 lastnih agentnih preverjanj).

Pri prvem zagonu preverjanja je TypeScript zaznal izgubo zožitve tipa `primaryKey` v primerjalni povratni funkciji. Primerjalnik je bil popravljen tako, da ključ zajame pred klicem povratne funkcije; ponovljeni zaključni zagon zgoraj je uspešen. npm je izpisal opozorilo za obstoječo nastavitev `http-proxy`; ukaz se je kljub temu zaključil uspešno.

## Pokritost zahtev

| Zahteve | Izvedeno preverjanje | Rezultat |
| --- | --- | --- |
| R01 | Razvojni D01 (privzeti ID-ji); agentni reset preveri vse štiri privzete vrednosti. | Uspešno v zaključnem `npm run check`. |
| R02 | Agentni scenarij normalizira sestavljeni in razstavljeni `é`, male/velike črke in leksikografski vrstni red `Task 10`/`Task 2`, za `title` in `assignee`. | Uspešno. |
| R03 | Agentni scenarij primerja status in kronološke roke; D02 preverja statusno razvrščanje. | Uspešno. |
| R04 | Agentni scenarij spremeni primarno in sekundarno smer ter preveri stabilne statuse znotraj skupin. | Uspešno. |
| R05 | D02 in agentni scenarij preverita sekundarne datume v obeh smereh, `none` ter isti statusni sekundarni ključ. | Uspešno. |
| R06 | Agentni scenariji preverijo enake normalizirane vrednosti, izenačene oba ključa ter `original` ob drugih aktivnih nastavitvah. | Uspešno. |
| R07 | D03 preveri sortirane ID-je v stolpcu table; agentni scenarij preveri tri stolpce in relativni vrstni red. | Uspešno. |
| R08 | Agentni scenarij preveri štiri nastavitve po preklopu pogleda in odprtju/zaprtju podrobnosti. | Uspešno. |
| R09 | Agentni scenarij zamenja projekt, preveri privzete vrednosti, nato osveži in jih preveri znova. | Uspešno. |
| R10 | Agentna preverjanja praznega in enoopravilnega projekta uporabijo vse ključe in smeri; reset preveri privzeto četverico. | Uspešno. |
| R11 | D04 in agentna `readonly` preverjanja potrdijo, da razvrščanje ne odda zapisovalnih zahtev ter da je `saveRequests` nič. Čisti primerjalnik razvrsti kopijo in ne spreminja objektov opravil. | Uspešno. |
| R12 | Izhodiščni testi preverijo podrobnosti in navigacijo po ID-ju; agentni scenarij preveri enake naslove v obeh pogledih, število ID-jev in širino 390 px. | Uspešno. |

Natančni agentni primeri so v [P04-sort.spec.ts](../../tests/agent/P04-sort.spec.ts); skupni razvojni primeri so v `tests/development/P04.spec.ts`. Povezave od vsake zahteve do implementacije in dokazov so v [specification.md](specification.md).

## Omejitve

Nedostopni končni oziroma skriti testi niso bili izvedeni. Preverjeni so bili vključeni izhodiščni in razvojni testi ter lastni primeri; dodatni primeri poljubnega števila opravil in vseh možnih kombinacij podatkov ostajajo odvisni od končne evalvacije. Zahteve za manjkajoče/neveljavne datume niso bile preverjene, ker so izrecno zunaj dogovorjene domene.

Poskus `git status --short` ni uspel: lokalni `xcrun` javlja neveljavno pot do Command Line Tools (`/Library/Developer/CommandLineTools`). Delovna mapa je bila podana kot svež izvoz brez zgodovine Git; zato Git stanje ni vključeno v dokaz preverjanja. Pri tem delu niso bili namenoma spreminjani skupni testi, infrastruktura ali odvisnosti.
