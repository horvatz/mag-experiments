# Pilot P01, postopek C — prvi poskus

**Koda je opravila vseh 68 neodvisnih preverjanj, celoten postopek pa se ni
zaključil. Agent do časovne meje implementacije ni oddal končne predaje;
zaključni pregled Spec Kita ni bil zagnan.**

En agent GPT-6 Astra (`xhigh`, CLI 0.154.0) je v isti seji izvajal uradne
korake Spec Kit 1.0.8, brez dodatnih presetov. Izhodišče Folio, navodila
P01 v0.2, skupna meja 20 minut in testi so enaki kot pri A in B. Dostopa
do reference, prejšnjih rešitev ali skritih testov med delom ni imel.

| Podatek | Rezultat |
| --- | --- |
| Protokol | C/0.1, polne veščine Spec Kit |
| Skupni čas | 18 min 1 s (1080,501 s) |
| Stanje postopka | `phase_time_limit` pri implementaciji |
| Osnovna preverjanja | 38/38 |
| Razvojna preverjanja P01 | 8/8 |
| Skrita končna preverjanja P01 | 22/22 |
| Slog, tipi in gradnja | Uspešno |
| Meje dovoljenih sprememb | Upoštevane |
| Celotna poraba | Neznana zaradi prekinitve zadnje faze |

## Potek

| Korak | Čas | Zaključek |
| --- | --- | --- |
| constitution | 75,655 s | Projektna načela shranjena. |
| specify | 248,874 s | Specifikacija, pravila in seznam kakovosti shranjeni. |
| plan | 324,106 s | Načrt in spremljevalni dokumenti shranjeni. |
| tasks | 105,554 s | Shranjenih 11 nalog. |
| implement | 323,863 s | Časovna meja; koda in 50 uspešnih dostopnih preverjanj, predaja nedokončana. |
| converge | Ni izveden | Implementacija ni normalno zaključila. |

Prvi štirje koraki so skupaj s predajami porabili približno 12 minut in
36 sekund. Pri zapisovanju načrta je agent popravil napako v lastnem
ukazu; tega časa ne izključujemo iz meritve. Implementacija je dobila
preostanek do zadnjih dveh minut, rezerviranih za `converge`. Ob njeni
prekinitvi izvajalnik po vnaprej določenem pravilu ni nadaljeval pregleda.
Celotna omejitev 20 minut zato ni bila porabljena.

Agent je pred implementacijo izvedel pričakovano neuspešen test manjkajoče
funkcionalnosti. Končni `npm run check` je nato opravil slog, tipe,
gradnjo in 50 testov: 38 osnovnih, 8 razvojnih ter 4 lastne. V zadnji
komunikaciji je navedel, da del lastnega preverjanja preklica po napaki
ostaja neizveden, in pripadajoče naloge ni označil kot opravljene. Vsebine
predaje po ustavitvi nismo dopolnjevali.

Poznejša neodvisna ocena zamrznjene kode je opravila vseh 68 preverjanj.
`allChecksPassed:false` v povzetku pomeni nedokončan celoten postopek;
posamezna preverjanja kode so uspešna. Med merjenjem ni bilo ročnih
namigov ali popravkov.

## Poraba in dokazila

Pri prvih štirih fazah se končni števci ujemajo s kumulativnimi dogodki
iste seje. Implementacija nima končnega dogodka porabe. Do zadnjega
razpoložljivega dogodka je zabeleženih 2.094.861 vhodnih tokenov (od tega
1.966.464 predpomnjenih) in 29.934 izhodnih tokenov (vključno s 1.341
za sklepanje). To je delna opažena poraba, ne končna vsota ali denarni strošek.

`submission/` vsebuje nespremenjeno oddajo, `phases/` vse pozive, nastavitve,
dnevnike in predaje. `protocol-at-launch/`, `procedure-c.json` ter
`spec-kit-at-launch/` ohranjajo izvajalnik in uradni paket ob zagonu.
`usage-observation.json` pojasni porabo, `evaluation-summary.json` pa
neodvisno oceno. Osnovni mag-app je nespremenjen.

Za naslednji, ločeno označen poskus je izbran uradni Lean preset, ki
skrajša dokumente ob ohranitvi korakov, skupnih zahtev in testov. C-001
ostaja v evidenci. Iz enega poskusa ne sklepamo na splošno prednost ali
slabost Spec Kita. Mobilni scenariji so emulacija v Chromiumu.

[Pregled pilotov](../../docs/pilot-results.md) · [Protokol ob tem zagonu](protocol-at-launch/pilot-c-protocol.md)
