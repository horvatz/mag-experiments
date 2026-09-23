# Rezultati za pisanje

Podatkovni posnetek: 2026-09-23T21:14:41.973Z. Arhiviranih 21/72. Nepopolna zbirka; skupinski podatki so sprotni opis, brez končnega sklepanja.

| Postopek | Arhivi | Strogi uspehi | Delež zahtev | Čas s | Znani časi |
| --- | --- | --- | --- | --- | --- |
| A | 7/24 | 7 | 1.000 | 655.66 | 7/7 |
| B | 7/24 | 7 | 1.000 | 909.72 | 7/7 |
| C | 7/24 | 6 | 1.000 | — | 6/7 |

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
| [P03-B-002](../../runs/P03-B-002/evaluation-summary.json) | completed | 12/12 | 12/12 | 816.33 | da |
| [P03-C-002](../../runs/P03-C-002/evaluation-summary.json) | completed | 12/12 | 12/12 | 1002.22 | da |
| [P03-A-002](../../runs/P03-A-002/evaluation-summary.json) | completed | 12/12 | 12/12 | 640.42 | da |
| [P06-B-003](../../runs/P06-B-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 851.59 | da |
| [P06-A-003](../../runs/P06-A-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 792.32 | da |
| [P06-C-003](../../runs/P06-C-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 977.99 | da |
| [P04-B-003](../../runs/P04-B-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 854.38 | da |
| [P04-A-003](../../runs/P04-A-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 622.89 | da |
| [P04-C-003](../../runs/P04-C-003/evaluation-summary.json) | completed | 12/12 | 12/12 | 944.94 | da |

## Popolno zabeležena poraba

| Postopek | Popolni zapisi / arhivi | Povprečni vhodni tokeni | Povprečni izhodni tokeni |
| --- | --- | --- | --- |
| A | 7/7 | 770756.29 | 20143.86 |
| B | 7/7 | 1073902.57 | 26930.57 |
| C | 6/7 | 2785984.17 | 29037.83 |

Ta povprečja vključujejo samo popolno zabeleženo porabo in so ob manjkajočih zapisih lahko selektivna. Predpomnjeni tokeni so že vključeni v vhodne, reasoning tokeni v izhodne. Zadnja opažena poraba prekinjenih izvedb je ločena spodnja meja v JSON/CSV, ne nadomestilo celotne porabe. Tokeni niso denarni strošek.

## Parne razlike po nalogah

Primerjave se izračunajo šele ob vseh 72 arhivih. Neuravnotežen sprotni vzorec ne določa končne razlike med postopki.


## Manjkajoče meritve in viri

Manjkajoči točni časi: P06-C-001. Neznan čas ni nič. Prizadeta povprečja in parne časovne primerjave niso prikazane; funkcionalni izidi in imenovalci ostajajo nespremenjeni.

Zamrznjeni analizator v results.json pri seštevanju obravnava null kot nič; njegovih prizadetih časovnih agregatov ne uporabljaj. Ta ločen prikaz napako obravnave manjkajočih vrednosti izrecno popravi brez sprememb zamrznjene kode ali meritev. Pri obnovljeni P06-C-001 finishedAt pomeni raziskovalčevo finalizacijo, ne potrjenega konca modela.

Podrobni podatki so v [reporting-results.json](reporting-results.json) in [run-data.csv](run-data.csv). [Vsebinska presoja](content-review.md) poroča pet dimenzij ločeno; AI-podprta neslepa presoja nima človeških ocen ali izmerjenega soglasja. [Vodnik za pisanje](writing-guide.md) povezuje gradivo z magistrsko.
