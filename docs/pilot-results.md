# Doslej izvedeni piloti P01

Stanje: 17. september 2026. Spodaj so vsi dosedanji poskusi, tudi neuspešne
predaje. Vsak je začel iz istega commita Folio, z navodili P01 v0.2 ter
modelom GPT-6 Astra (`xhigh`, CLI 0.154.0). Skupna meja posameznega zagona je
bila 20 minut. Zagonov ne združujemo v eno meritev.

| Izvedba | Čas | Neodvisna ocena kode | Zaključek postopka |
| --- | --- | --- | --- |
| [A-001](../runs/P01-A-001/report.md) | 13 min 21 s | 68/68 | Običajen zaključek enega agenta. |
| [B-001](../runs/P01-B-001/report.md) | 3 min 1 s | Ni izvedena | Specifikacija ob meji prve faze ni bila shranjena. |
| [B-002](../runs/P01-B-002/report.md) | 15 min 57 s | 68/68 | Vse tri vloge so tekle; predaja pregledovalca manjka. |

B-001 in B-002 nista ponovitvi povsem istega protokola. Pred drugim poskusom
je bila omejitev za specifikacijo povečana s treh na pet minut, poziv pa je
zahteval sprotno zapisovanje. Celotna poraba tokenov B ni znana zaradi
prekinjenih faz; delne števce hranimo, vendar jih ne primerjamo z dokončno
porabo A kot popolno meritev.

Za B-002 je vseh 16 vsebinskih datotek naloge in ocenjevalca iz evidenc A
ostalo nespremenjenih. Spremenjen je izvajalnik za zaporedno predajo med
vlogami. Delo se je ustavilo pred skupno mejo, ker triminutna faza pregleda
ni oddala obveznega dokumenta. Manjkajočega pregleda ne nadomestimo z
izvajalčevim naknadnim mnenjem ali uspehom končnih testov.

Pred glavnimi meritvami je treba izboljšati pravočasno predajo pri B,
preizkusiti nadaljevanje prvotnega agenta po prejetem pregledu in potrditi
pravila merjenja porabe pri prekinitvah. Nadaljevanje sej je pripravljeno,
v teh dveh poskusih pa do popravkov še ni prišlo. Postopek C še ni izveden.

Ti rezultati so namenjeni pripravi protokola. Ne dokazujejo, kateri
postopek je boljši, in ne sodijo med glavne meritve.
