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

Pri B-002 in B-003 je vseh 16 vsebinskih datotek naloge in ocenjevalca iz
evidenc A ostalo nespremenjenih. Spremembe so v izvajalniku in pravilih
predaje med vlogami. Arhivi ohranjajo protokol in izvajalnik ob posameznem
zagonu. Osnovni mag-app ostaja nespremenjen.

## Poraba in preostala preverjanja

Celotna poraba B-001 in B-002 ni znana zaradi prekinjenih faz; delnih
števcev ne primerjamo s popolno porabo A. B-003 ima popolne končne števce,
preverjene glede na dnevnike vseh treh sej: 894.913 vhodnih in 26.574
izhodnih tokenov. Podrobnosti in vključeni podštevci so v poročilu.

Pregledovalec v B-003 ni zahteval popravkov. Nadaljevanje prvotnih sej po
pregledu zato še ni preizkušeno z dejanskim modelskim zagonom. Deset
enotskih testov izvajalnika preverja tudi vrstni red predaje obema
avtorjema, nepopoln pregled, meje pisanja in iztek časa; to niso dodatne
merjene izvedbe modela.

Naslednji korak je priprava postopka C. Pred glavnimi meritvami je treba
preveriti še dejansko predajo popravkov, potrditi ravnanje s porabo ob
prekinitvah in zamrzniti skupni protokol. Ti rezultati so namenjeni
pripravi raziskave in ne dokazujejo, kateri postopek je boljši.
