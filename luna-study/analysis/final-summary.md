# Končni zaključki primerjave Astre in Lune

Obe zbirki sta zaključeni: **72 meritev M/1.0 z Astro in 72 meritev L/1.0
z Luno**. V vsaki je osem nalog P03–P10, trije postopki in tri ponovitve.
Vseh 24 vnaprej izbranih presoj Lune je obravnavanih. Končni podatkovni
posnetek je `2026-09-29T19:54:58.948Z`; [revizija](final-verification.json)
je uspela 29. septembra 2026 ob 20:03 UTC. Začetih meritev nismo ponavljali,
spreminjali zaradi izida ali izločali iz primarnih imenovalcev.

## Kateri postopek je najboljši?

**Pri Luni je A najboljše praktično ravnotežje med časom, funkcionalnostjo
in dokončanjem postopka. B doseže največ dokazanih zahtev.** C je ob danem
časovnem proračunu bistveno manj zanesljivo dokončan. To je presoja za ta
nabor in protokol; enega zmagovalca po vseh merilih ni.

| Luna / postopek | Dokazane zahteve | Oddaje z 12/12 | Strogi uspehi | Povprečen čas |
| --- | ---: | ---: | ---: | ---: |
| A: en agent | 97,22 % | 18/24 | 17/24 | 12,09 min |
| B: tri vloge | 98,61 % | 20/24 | 15/24 | 16,82 min |
| C: Spec Kit | 72,22 % | 13/24 | 1/24 | 18,49 min |

Vir: [comparison.json](comparison.json), vseh 24 začetih meritev na vrstico.
Čas vključuje neuspešne izvedbe. Strogi uspeh poleg 12/12 zahtev zahteva
zaključen postopek, dovoljen obseg sprememb in uspeh vseh preverjanj.
Vsaka dokazana zahteva potrebuje uspeh na obeh velikostih zaslona.

B glede na A pridobi **1,39 odstotne točke** zahtev in porabi **4,73 minute
več**. Opisna 95-odstotna intervala sta 0,00–3,47 odstotne točke ter
2,98–6,30 minute. Razlika strogih uspehov B−A je −8,33 odstotne točke
z intervalom −29,17 do 8,33. B zato ni dokazano univerzalno boljši zaradi
dodatnega pregledovalca. C ima glede na A 25,00 odstotne točke manj zahtev
(interval −45,83 do −6,94) in porabi 6,40 minute več.

Intervali so opisni: 20.000 ponovnih vzorcev osmih parjenih nalog po
povprečenju treh ponovitev znotraj naloge in postopka. Enota ni posamezen
test ali vseh 24 izvedb kot neodvisnih nalog. Interval z ničlo ne potrjuje
enakovrednosti. Izračunanih je 29 kontrastov, štirje časovni so zadržani
zaradi manjkajočega podatka pri Astri.

## Dokončane meritve ne pomenijo vseh uspešnih testov

Luna je dokazala **772/864 zahtev (89,35 %)**. **51/72 oddaj ima 12/12**,
vendar je **strogih uspehov 33/72**. Osemnajst oddaj z 12/12 nima strogega
uspeha zaradi izida postopka. Neodvisna preverjanja so uspela v **4.798/5.040**
primerih: regresijska 2.728/2.736, razvojna 526/576 in sprejemna 1.544/1.728.
To so ponovljena preverjanja istih scenarijev, ne 5.040 neodvisnih problemov.

Izvedbeni statusi so: 41 `completed`, 17 `phase_time_limit`, osem
`time_limit`, pet `completed_with_phase_time_limit` in en `execution_failed`.
Status in funkcionalni rezultat sta ločena. Na primer P04-A-002 je po
prekinitvi dostopa ohranil oddajo z 70/70 in 12/12. Končni P09-B-003 ima
prav tako 70/70 in 12/12, a je popravljalna faza dosegla skupno časovno mejo.
Celoten [katalog neuspehov](failure-catalog.md) ohranja dokaze za vseh
39 oddaj brez strogega uspeha. Tudi 70/70 potrjuje le zamrznjeni testni nabor,
ne pravilnosti pri vseh možnih vhodih.

## Kaj razložijo faze, pregledi in vsebinske presoje?

Pri C je mediana znanih vsot priprave (constitution, specify, plan, tasks)
**12,87 minute pri Luni in 7,12 pri Astri**. Vsote vključujejo tudi
nedokončano pripravo; niso časi uspešnih rešitev. Pri Luni je implementacija
začeta v 19/24, zaključni pregled pa v 2/24 izvedbah. Obe konvergenci sta
potrjeni: P07-C-001 ima 11/12, P09-C-003 pa 12/12 in edini strogi uspeh C.
Trinajst oddaj C sicer doseže 12/12. Dokumenti in rezervacija časa za faze
so v tem protokolu povezani z zelo omejenim časom za implementacijo in
zaključek. Analiza faz je **naknadna**, dodana po 29 arhivih; ni vnaprej
prijavljena primarna mera ali dokaz izoliranega vzroka.

Pri B je vseh 24 pregledov začetih in 23 predaj potrjenih. En pregled
zahteva popravek specifikacije, osem popravek kode ali testov. Začetih je
devet povratnih implementacij, zaključenih osem; začeti popravek specifikacije
ni zaključen. Zahteva za popravek ni nujno funkcionalna napaka: nekateri
popravki okrepijo ali popravijo teste. Konkretna naknadna ilustracija
[P09-B-002](evidence/P09-B-002-url-repair.md) pokaže dejanski popravek kode:
pregled zazna izgubo dela iskalnega niza `foo?bar`, avtor ohrani celotno
vrednost po prvem ločilu in doda regresijski test. Skupni razvojni rezultat
zraste s 46/46 na 47/47. Raziskovalec stare kode ni ponovno izvajal.
Primeri v [development-cases.md](development-cases.md) ponazarjajo mehanizme,
ne ocenjujejo njihove pogostosti ali vzročne koristi pregledovalca.

Formalne presoje zajemajo samo vnaprej izbrane ponovitve 001: pri Luni
22 celotnih in dve delni, z 799 preverjenimi dokaznimi povezavami in
430 sidri. Vseh pet ordinalnih dimenzij se poroča ločeno. Lastna preverjanja
imajo pri A ocene 1/2 v razmerju 5/3, pri B vseh osem oceno 1, pri C pa
ocene 0/1/2 v razmerju 3/4/1. Sledljivost C ima sedem ocen 1 in eno 2;
organizacija kode pri dveh oddajah brez avtorske kode ostane neocenjena.
Presoje so AI-podprte, neslepe, brez izmerjenega človeškega soglasja.
Dimenzij ne seštevamo v skupno kakovost. Pri Astri je 17 celotnih in sedem
neocenljivih presoj; teh sedem ni ocenjeno z ničlo.

## Kako primerjati z Astro?

| Astra / postopek | Dokazane zahteve | Oddaje z 12/12 | Strogi uspehi | Povprečen čas |
| --- | ---: | ---: | ---: | ---: |
| A | 79,17 % | 19/24 | 19/24 | 8,84 min |
| B | 83,33 % | 20/24 | 19/24 | 13,24 min |
| C | 83,33 % | 20/24 | 19/24 | neznan |

Višje primarno pokritje Lune pri A/B **ne dokazuje boljšega modela**.
Pri Astri je 12 prekinitev HTTP 401 in ena omejitev uporabe brez avtorske
oddaje. To niso ugotovljene napake programske kode. Kratki poskusi dostopa
ostanejo v primarnih podatkih in znižajo povprečni čas; niso hitre rešitve.
P06-C-001 nima točnega časa, zato je povprečje C zadržano. Analiza samo
statusov `completed` ima pri Astri 100 % zahtev, pri Luni A/B/C pa
98,41/98,61/95,83 %; zadnji delež temelji le na dveh oddajah. Ta izbrani
podvzorec ni nadomestek za primarno analizo.

Poleg modela se razlikujeta CLI (0.154.0 proti 0.158.0-alpha.2.1) in čas
merjenja. Razlika razlik C−A med zbirkama je −29,17 odstotne točke zahtev
(opisni interval −46,88 do −11,46), vendar vključuje tudi te okoliščine.
A/B/C so celotni postopki z različnimi vlogami, predajami, dokumenti in
časovno razporeditvijo; rezultat ne izolira posamezne sestavine Spec Kita.
Osem sorodnih nalog iste aplikacije tudi ni splošen programski benchmark.

Popolna poraba je pri Luni znana za A/B/C v 21/18/2 od 24 primerov, pri
Astri v 19/19/19. Izbrana povprečja so v preglednici; posebej C ni primeren
za pošteno razmerje celotnih stroškov. Neznano ni nič, spodnja meja ni
popolna poraba. Predpomnjeni vhod in reasoning izhod sta vključena v
ustrezni vsoti. Tokeni niso zaračunani denarni strošek.

## Gradivo za pisanje in zaključek dela

Na voljo so [podatkovna primerjava](comparison.md), [presoje](content-review.md),
[faze](phase-timing.md), [procesni dogodki](process-summary.md),
[kazalo dokazov](evidence-map.md), trije grafi v `figures/`,
`outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/astra-luna-comparison.pdf`
in `primerjava-astra-luna.xlsx` (poti iz korena repozitorija experiments).
Generirani številčni vložek je v `naloga/latex/generated/luna-comparison.tex`.

[Končna revizija](final-verification.json) potrjuje skladnost arhivov,
izvozov, presoj in artefaktov. [Vizualni zapis](visual-verification.json)
pokriva vseh 13 strani PDF-ja, sedem predogledov preglednice in tri grafe;
formule so preverjene tudi s spremembo vhodne celice in obnovitvijo.
Zamrznjeni vhodi ter prvotni arhivi M/1.0 ostajajo nespremenjeni.
Vrsta in poročevalec sta končana, ključavnice ni, začasna združljivostna
datoteka je po preverbi odstranjena.

**Načrtovani eksperimentalni del je zaključen in pripravljen za pisanje.**
Za ta cilj niso potrebne dodatne meritve. Pri pisanju najprej določimo
primarne izide in omejitve, nato razložimo A/B/C ter ločeno predstavimo
zgodovinsko primerjavo modelov. Poglavja magistrske ostajajo v avtorskem
poteku; ta zaključek ne pomeni, da je besedilo naloge že napisano.
