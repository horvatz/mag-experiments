# Zabeležene predaje in povratni koraki

Posnetek 2026-09-29T19:54:58.892Z; 72/72 arhivov. Vse načrtovane izvedbe so arhivirane.

Štejemo samo formalne faze in predaje izvajalnika. Popravki kode, testnih pričakovanj ali priprave podatkov znotraj ene faze niso povratni korak izvajalnika. Ti števci niso število razvojnih napak, potrjenih funkcionalnih napak ali ocena kakovosti. A nima ločenega pregledovalca oziroma konvergence; zanj ne navajamo navidezno primerljivih ničel.

## Postopek B

| Zapis | Število |
| --- | --- |
| Arhivirane izvedbe | 24 |
| Začeti pregledi | 24 |
| Potrjene strukturirane predaje pregleda | 23 |
| Izvedbe brez potrjene predaje pregleda | 1 |
| Predaje z zahtevano korekcijo specifikacije | 1 |
| Predaje z zahtevano korekcijo kode | 8 |
| Začete / zaključene korekcije specifikacije | 1 / 0 |
| Začete / zaključene korekcije implementacije | 9 / 8 |

Zahteve za korekcijo so znane le pri potrjeni predaji. Odsotna ali neveljavna predaja ni potrditev, da ni bilo napak. Popravek specifikacije sproži tudi ponovno predajo implementerju, četudi zastavica za popravek kode ni nastavljena. Protokol po povratnem popravku ne načrtuje drugega formalnega pregleda.

## Postopek C

| Zapis | Število |
| --- | --- |
| Arhivirane izvedbe | 24 |
| Začeti koraki converge | 2 |
| Potrjene strukturirane predaje converge | 2 |
| Izvedbe brez potrjene predaje converge | 22 |
| Izid converged | 2 |
| Izid tasks_appended | 0 |
| Izid blocked | 0 |
| Začete / zaključene dodatne implementacije | 0 / 0 |

Izidi veljajo za posamezne potrjene korake; ena izvedba lahko vsebuje dva. Dodatna implementacija pomeni drugi korak implement po pripetih nalogah. B-jev pregled in C-jeva konvergenca sta različna postopkovna dogodka in njunih števcev ne razlagamo kot vzročne razlike v kakovosti.

Podrobnosti, statusi in povezave do vsake izvirne predaje so v [process-summary.json](process-summary.json). Časi faz in predaj so v [phase-data.csv](phase-data.csv). Vse arhivske datoteke ostajajo nespremenjene.
