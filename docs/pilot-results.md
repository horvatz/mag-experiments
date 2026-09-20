# Doslej izvedeni piloti P01

Stanje: 20. september 2026. Spodaj so vsi dosedanji poskusi, tudi neuspešne
predaje. Vsak je začel iz istega commita Folio, z navodili P01 v0.2 ter
modelom GPT-6 Astra (`xhigh`, CLI 0.154.0). Skupna meja posameznega zagona je
bila 20 minut. Zagonov ne združujemo v eno meritev.

| Izvedba | Čas | Neodvisna ocena kode | Zaključek postopka |
| --- | --- | --- | --- |
| [A-001](../runs/P01-A-001/report.md) | 13 min 21 s | 68/68 | Običajen zaključek enega agenta. |
| [B-001](../runs/P01-B-001/report.md) | 3 min 1 s | Ni izvedena | Specifikacija ob meji prve faze ni bila shranjena. |
| [B-002](../runs/P01-B-002/report.md) | 15 min 57 s | 68/68 | Vse tri vloge so tekle; predaja pregledovalca manjka. |
| [B-003](../runs/P01-B-003/report.md) | 15 min 11 s | 68/68 | Vse tri vloge so normalno zaključile; popravki niso bili zahtevani. |
| [C-001](../runs/P01-C-001/report.md) | 18 min 1 s | 68/68 | Implementacija ni pravočasno oddala predaje; zaključni pregled ni stekel. |
| [C-002](../runs/P01-C-002/report.md) | 15 min 52 s | 68/68 | Z uradnim presetom Lean se je zaključilo vseh šest korakov; brez zahtevanih popravkov. |

## Spremembe med poskusi B

B-001, B-002 in B-003 niso ponovitve povsem istega protokola. Pred drugim
poskusom je bila omejitev za specifikacijo povečana s treh na pet minut,
poziv pa je zahteval sprotno zapisovanje. Pregled se je še vedno ustavil
po treh minutah brez obvezne predaje. Uspeh končnih testov ni nadomestil
manjkajočega pregleda.

Pred B-003 smo uvedli protokol B/0.3: prožnejšo razporeditev istega skupnega
časa, jasnejše obveznosti vlog, pripomoček za preverjanje časa in
strukturiran končni odgovor pregledovalca. Vse tri predaje so uspele.
Specifikacija je trajala 4 min 11 s, implementacija 7 min 12 s, pregled pa
3 min 45 s. Pregledovalec je pregledal vse zahteve, kodo, teste in dokazila;
testov ni ponovno zagnal in je to navedel v poročilu.

Pri poskusih B in C je vseh 16 vsebinskih datotek naloge in ocenjevalca iz
evidenc A ostalo nespremenjenih. Spremembe so v izvajalniku in pravilih
predaje med vlogami. Arhivi ohranjajo protokol in izvajalnik ob posameznem
zagonu. Osnovni mag-app ostaja nespremenjen.

## Postopek C

C-001 je uporabil Spec Kit 1.0.8 brez preseta. En agent je v isti seji
pripravil projektna načela, specifikacijo, načrt in naloge, nato začel
implementacijo. Priprava je skupaj s predajami porabila približno
12 minut in 36 sekund. Do meje implementacije je koda opravila 50
agentu dostopnih testov, končna predaja pa ni bila dokončana. Po pravilih
izvajalnika zato zaključni korak `converge` ni stekel. Poznejša neodvisna
ocena je opravila 68/68 preverjanj kode; celoten postopek ostaja nepopoln.

Za ločen poskus C-002 je protokol C/0.2 pred začetkom merjenja izbral
uradni Lean preset 1.0.0. Ta skrajša zahtevane dokumente, ohrani pa
osnovne korake in skupne zahteve P01. Prvi poskus ostaja v evidenci.
Takšna sprememba je umerjanje postopka in ni ponovitev enakih pogojev.
[Protokol C](pilot-c-protocol.md) in [priprava okolja](pilot-c-setup.md)
opisujeta pripeto orodje, omejitve in predaje.

C-002 je normalno zaključil vseh šest korakov v 15 minutah in 52 sekundah.
Priprava je skupaj s predajami trajala približno 7 minut in 25 sekund,
implementacija 7 minut in 14 sekund, zaključni pregled pa 1 minuto in
12 sekund. Agent je sam odpravil napako tipa v lastnem testu in opravil
60 dostopnih preverjanj. Pregled je uporabil ta dokazila, testov pa ni
ponavljal. Šele poznejši neodvisni ocenjevalec je opravil vseh 68 skupnih
preverjanj. Vse dovoljene meje sprememb so bile upoštevane.

## Poraba in preostala preverjanja

Celotna poraba B-001 in B-002 ni znana zaradi prekinjenih faz; delnih
števcev ne primerjamo s popolno porabo A. B-003 ima popolne končne števce,
preverjene glede na dnevnike vseh treh sej: 894.913 vhodnih in 26.574
izhodnih tokenov. Podrobnosti in vključeni podštevci so v poročilu.

Pregledovalec v B-003 ni zahteval popravkov. Nadaljevanje prvotnih sej po
pregledu zato še ni preizkušeno z dejanskim modelskim zagonom. Šestnajst
enotskih testov izvajalnika preverja tudi vrstni red predaje obema
avtorjema, nepopoln pregled, meje pisanja in iztek časa; to niso dodatne
merjene izvedbe modela. Dodatna preverjanja pokrivajo korake C, predaje,
meje sprememb, zaključni pregled in uradne skripte obeh predlog Spec Kit.
Tudi C-002 ni zahteval dodatnega kroga popravljanja, zato ta pot pri C
še ni preverjena z dejanskim modelskim zagonom.

C-001 nima popolnega končnega števca zaradi prekinitve. C-002 ima popolno
porabo, preverjeno po eni ohranjeni seji: 2.452.527 vhodnih in 27.494
izhodnih tokenov. Kumulativnih števcev posameznih korakov ne seštevamo.
Prekinjene faze ostajajo označene z neznano celotno porabo, delne dogodke
pa ohranimo ločeno. Za primerjavo stroškov bo treba pred glavnimi meritvami
potrditi merjenje tudi ob prekinitvi; naročnine ne pretvarjamo v ceno API.

## Zaključek P01 in naslednji korak

P01 zaključujemo kot prvi pilot: preizkušeni so A, B in C, za vsakega
obstaja vsaj en pravočasno zaključen postopek s 68/68 preverjanji kode.
Vseh šest poskusov ostaja v evidenci. B in C sta bila med poskusi
prilagojena, zato iz časov ali porabe ne določamo zmagovalca.

P01 je uporaben za preverjanje izvedbe in predaj, v teh poskusih pa ne
loči kakovosti pravilno oddanih rešitev: vse so prestale uporabljene teste.
Naslednji korak je druga, zahtevnejša pilotna naloga P02, na primer
množično urejanje z delnimi napakami. Njene zahteve in merila najprej
določimo ter preverimo na referenci in namerno napačnih rešitvah, šele
nato jo damo agentom. P01 ne otežujemo za nazaj.

Pred glavnimi meritvami ostajajo dejanski preizkus predaje zahtevanih
popravkov, merjenje porabe ob prekinitvah ter zamrznitev skupnega protokola
in nalog. Preveriti velja tudi dosleden izbor pripetega Pythona v agentovi
prijavni lupini: C-002 je pri dveh ukazih izbral sistemski Python in se
sam preusmeril na Node. PDF in glavne raziskovalne meritve še niso dopolnjeni.
