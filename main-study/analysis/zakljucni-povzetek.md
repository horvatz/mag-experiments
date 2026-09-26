# Zaključni povzetek eksperimentov in začetek pisanja

Podatkovni posnetek: 2026-09-26T10:41:26.311Z. **Vseh 72/72 načrtovanih glavnih izvedb je arhiviranih.** Začetek prve meritve: 2026-09-21T21:38:07.601Z; zaključek zadnjega arhiva: 2026-09-26T10:41:26.226Z. P01 in P02 sta ločena zaključena pilota.

## Kaj je zaključeno

- P03–P10: osem nalog, trije postopki, tri ponovitve; 57/72 strogih uspehov.
- 59/72 oddaj je dokazalo vseh 12 zahtev in prestalo 70/70 neodvisnih preverjanj.
- Obravnavanih je vseh 24 vnaprej izbranih oddaj 001: 17 ocenjenih in 7 z dokumentirano nezmožnostjo vsebinske ocene.
- Izdelani so podatkovni izvozi, parne primerjave, grafi, preglednica in številčni vložki za poglavje rezultatov. Končna preverba in vizualni pregled sta dokumentirana ločeno.

## Primarni rezultati

| Postopek | Arhivi | Strogi uspehi | 12/12 in 70/70 | Dokazane zahteve |
| --- | --- | --- | --- | --- |
| A | 24/24 | 19/24 | 19/24 | 79,2 % |
| B | 24/24 | 19/24 | 20/24 | 83,3 % |
| C | 24/24 | 19/24 | 20/24 | 83,3 % |

Vseh 59 oddaj s spremembami datotek je v tej zbirki prestalo vseh 70 neodvisnih preverjanj. To je opis opaženih oddaj in določenih scenarijev, ne dokaz pravilnosti za poljubne vhode. V primarnih imenovalcih ostanejo tudi poskusi brez avtorske rešitve.

## Kaj pomeni 15 poskusov brez strogega uspeha

- **12 zavrnitev prijave 401:** P09-001/002, P04-001 in P03-003 pri A/B/C. Pred prvim avtorskim sporočilom, ukazom ali spremembo datoteke. Vsak ima 38/70, 0/12 in neznano porabo. Nobeden ni ponovljen ali zamenjan.
- **P03-A-001:** omejitev uporabe storitve pred spremembami datotek, 38/70 in 0/12. To ni dokaz slabše implementacijske sposobnosti A.
- **P06-C-001:** infrastrukturna prekinitev; ohranjena koda ima 70/70 in 12/12, proces ni zaključen. Točen čas in celotna poraba ostaneta neznana.
- **P04-B-002:** dve fazni časovni omejitvi in dokumentacijski povratni popravek; 70/70 in 12/12, brez strogega uspeha. Celoten čas je znan, celotna poraba ne.

Napaka prijave je bila ob obnovi preverjena z ločenim uspešnim preizkusom istega modela in obstoječe prijave. Dodano zunanje varovalo preveri dostop pred novim poskusom in prepreči nadaljevanje vrste po napaki prijave oziroma omejitvi storitve. Natančen vzrok začasne zavrnitve ni potrjen. Operativni dodatek je dokumentiran; zamrznjeni merjeni vhodi, časovne meje in arhivi niso spremenjeni.

## Parne primerjave in njihova razlaga

Najprej so povprečene tri ponovitve naloge in postopka, nato se primerja osem parov nalog. Interval uporablja 20.000 ponovnih vzorcev s predpisanim semenom. Enota je naloga, ne posamezni test ali zahteva.

| Razlika prvega minus drugega | Mera | Povprečje | Opisni 95-% interval |
| --- | --- | --- | --- |
| A − B | Delež zahtev (odstotne točke) | −4,167 | −12,500 do 0,000 |
| A − B | Celoten čas (s) | −264,470 | −325,616 do −191,562 |
| A − C | Delež zahtev (odstotne točke) | −4,167 | −12,500 do 0,000 |
| B − C | Delež zahtev (odstotne točke) | 0,000 | 0,000 do 0,000 |

Razlika A proti B/C v dokazanih zahtevah izvira iz dodatnega neuspeha dostopa P03-A-001. Dvanajst napak prijave je razporejenih enako po postopkih, vendar je pri P09 dejanska implementacija nastala samo v ponovitvi 003. Enako število napak zato ne odpravi izgube podatkov. Enaki opaženi izidi B/C in interval [0, 0] ne dokazujejo enakovrednosti ali enake uspešnosti zunaj tega majhnega vzorca.

## Čas in poraba

| Postopek | Povprečni čas vseh poskusov (s) | Znani časi | Popolna poraba | Povprečni vhodni tokeni¹ | Povprečni izhodni tokeni¹ |
| --- | --- | --- | --- | --- | --- |
| A | 530,11 | 24/24 | 19/24 | 752.234 | 20.177 |
| B | 794,58 | 24/24 | 19/24 | 1.140.360 | 27.873 |
| C | — | 23/24 | 19/24 | 2.794.804 | 29.236 |

Kratki časi zavrnjenega dostopa so vključeni skladno s protokolom; niso časi izdelave uspešne rešitve. Zato razlike A–B ne razlagamo kot čiste razlike v hitrosti implementacije. Povprečje C ter časovni primerjavi A–C in B–C so zadržani zaradi neznanega časa P06-C-001. Za pisanje uporabljaj `reporting-results.json/md`: surovi zamrznjeni analizator manjkajoči čas napačno prišteje kot nič.

¹ Povprečji porabe vključujeta le popolne zapise in sta lahko selektivni. Predpomnjeni tokeni so že del vhoda, reasoning tokeni del izhoda; ne prištevamo jih ponovno. Spodnje meje prekinjenih izvedb so ločene v podatkih. Tokeni niso denarni strošek.

## Vsebinska presoja in primeri za razpravo

Pet ordinalnih dimenzij ostane ločenih: pokritost specifikacije, predikati/invariante, sledljivost, organizacija kode in lastna preverjanja. Ocenjenih je 5 oddaj A, 6 B in 6 C. V ocenjenem vzorcu so ocene 2, razen sledljivosti P06-C-001, ki ima 1. Sedem neocenljivih oddaj nima ničelnih ocen. Presoja je AI-podprta in neslepa; človeških ocen ter izmerjenega soglasja ni.

Za razpravo je pripravljenih osem naknadno izbranih razvojnih primerov. Med njimi so popravki testnih pričakovanj, dokumentacijska povratna zanka P04-B-002 ter dodatna pregledovalčeva preverjanja. Ti primeri niso nove formalne ocene, ne merijo pogostosti napak in ne dokazujejo vzročnega učinka pregleda.

## Gradivo za pisanje

- [Zbirni rezultati z vsemi izvedbami](reporting-results.md) in [strojno berljiva zbirka](reporting-results.json).
- [Kazalo dokazov za vseh osem nalog](evidence-map.md).
- [Vsebinske presoje](content-review.md), [formalni procesni koraki](process-summary.md) in [razvojni primeri](development-cases.md).
- [Vodnik po poglavjih in dovoljenih trditvah](writing-guide.md).
- [Preglednica](../../outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/rezultati-eksperimentov.xlsx) in [delovni PDF magistrske](../../../naloga/latex/magistrska.pdf).
- [Končna revizija podatkov](final-verification.json) in [zapis vizualnega pregleda](visual-verification.json).

Naslednji korak je avtorsko pisanje: povezava rezultatov z raziskovalnimi vprašanji, razprava o omejitvah in konkretnih primerih, literatura, sklep ter jezikovna ureditev. PDF je delovna magistrska z označenimi avtorskimi mesti za dopolnitev. Eksperimentalna zbirka je zaključena; že začetih ID-jev zaradi izidov ne ponavljamo.
