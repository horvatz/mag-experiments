# Rezultati za pisanje

Podatkovni posnetek: 2026-09-23T19:01:10.906Z. Arhiviranih 12/72. Nepopolna zbirka; skupinski podatki so sprotni opis, brez končnega sklepanja.

| Postopek | Arhivi | Strogi uspehi | Delež zahtev | Čas s | Znani časi |
| --- | --- | --- | --- | --- | --- |
| A | 4/24 | 4 | 1.00 | 633.50 | 4/4 |
| B | 4/24 | 4 | 1.00 | 961.44 | 4/4 |
| C | 4/24 | 3 | 1.00 | — | 3/4 |

Dokazana zahteva potrebuje uspeh obeh sprejemnih prikazov in dovoljen obseg sprememb. Neopaženo preverjanje ni potrjena funkcionalna napaka. Strogi uspeh dodatno zahteva zaključen postopek, lint, tipe, gradnjo in vseh 70 preverjanj.

## Posamezne izvedbe

| Izvedba | Status postopka | Dokazane zahteve | Opažene zahteve | Čas s | Strogi uspeh |
| --- | --- | --- | --- | --- | --- |
| [P05-A-001](../../runs/P05-A-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 625.66 | da |
| [P05-B-001](../../runs/P05-B-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 933.30 | da |
| [P05-C-001](../../runs/P05-C-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 1068.27 | da |
| [P10-A-001](../../runs/P10-A-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 659.14 | da |
| [P10-C-001](../../runs/P10-C-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 1071.48 | da |
| [P10-B-001](../../runs/P10-B-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 1027.89 | da |
| [P06-A-001](../../runs/P06-A-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 610.26 | da |
| [P06-C-001](../../runs/P06-C-001/evaluation-summary.json) | infrastructure_interrupted | 12/12 | 12/12 | — | ne |
| [P06-B-001](../../runs/P06-B-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 926.63 | da |
| [P08-A-001](../../runs/P08-A-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 638.94 | da |
| [P08-C-001](../../runs/P08-C-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 1012.85 | da |
| [P08-B-001](../../runs/P08-B-001/evaluation-summary.json) | completed | 12/12 | 12/12 | 957.92 | da |

## Popolno zabeležena poraba

| Postopek | Popolni zapisi / arhivi | Povprečni vhodni tokeni | Povprečni izhodni tokeni |
| --- | --- | --- | --- |
| A | 4/4 | 733176.75 | 19429.50 |
| B | 4/4 | 1166923.75 | 28481.25 |
| C | 3/4 | 3117895.33 | 30232.00 |

Ta povprečja vključujejo samo popolno zabeleženo porabo in so ob manjkajočih zapisih lahko selektivna. Predpomnjeni tokeni so že vključeni v vhodne, reasoning tokeni v izhodne. Zadnja opažena poraba prekinjenih izvedb je ločena spodnja meja v JSON/CSV, ne nadomestilo celotne porabe. Tokeni niso denarni strošek.

## Parne razlike po nalogah

Primerjave se izračunajo šele ob vseh 72 arhivih. Neuravnotežen sprotni vzorec ne določa končne razlike med postopki.


## Manjkajoče meritve in viri

Manjkajoči točni časi: P06-C-001. Neznan čas ni nič. Prizadeta povprečja in parne časovne primerjave niso prikazane; funkcionalni izidi in imenovalci ostajajo nespremenjeni.

Zamrznjeni analizator v results.json pri seštevanju obravnava null kot nič; njegovih prizadetih časovnih agregatov ne uporabljaj. Ta ločen prikaz napako obravnave manjkajočih vrednosti izrecno popravi brez sprememb zamrznjene kode ali meritev. Pri obnovljeni P06-C-001 finishedAt pomeni raziskovalčevo finalizacijo, ne potrjenega konca modela.

Podrobni podatki so v [reporting-results.json](reporting-results.json) in [run-data.csv](run-data.csv). [Vsebinska presoja](content-review.md) poroča pet dimenzij ločeno; AI-podprta neslepa presoja nima človeških ocen ali izmerjenega soglasja. [Vodnik za pisanje](writing-guide.md) povezuje gradivo z magistrsko.
