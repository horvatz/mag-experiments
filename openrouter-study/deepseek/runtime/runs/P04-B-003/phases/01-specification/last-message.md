Specifikacija je oddana.

**Izdelek**
- `docs/agent/specification.md` (v1.0): problem in kontekst, podatkovna polja iz `shared/types.ts`, dejanja/izidi, simboli in predikati (`norm`, `rang`, `cp`, `cs`, stabilnost, `razvrsceno`), pravila R01–R12 s sprejemnimi pogoji, dogovor o vmesniku (kontroli, gumb, privzete vrednosti), načrt sledljivosti in omejitve.
- `docs/agent/specification-history.md`: zapis osnutka 0.1 in oddaje 1.0 z obsegom preverjenega.

**Ključne odločitve za implementerja**
- Privzeto `original/asc` + `none/asc`; `original` na primarnem ključu vedno vrne izvorni vrstni red ne glede na ostale kontrole (R06).
- Stabilnost: izenačenja ohranijo indeks v prejetem polju; smer obrača le primerjavo svojega ključa, ne polja.
- Tabla: stolpci `todo, in_progress, done`; znotraj njih relativni vrstni red istega razvrščenega polja kot preglednica.
- Menjava projekta in osvežitev ponastavita vse štiri nastavitve; brez trajne shrambe/URL; razvrščanje ne pošilja zapisov (samo GET).
- Natančna dostopna imena: `Primarni ključ`, `Primarna smer`, `Sekundarni ključ`, `Sekundarna smer`, gumb `Izvorni vrstni red`.

**Omejitve**
- V tej vlogi nisem zagnal aplikacije ali testov; stolpec dokazov v sledljivosti je označen kot nepreverjen in ga izpolni implementer z dejanskimi rezultati.
- Končni testi niso dostopni; pogoji temeljijo na navodilih, tipih, kodi in razvojnih testih D01–D04.
