# Pilot P01 po postopku B

Aktualni protokol je B/0.3, pripravljen 20. septembra 2026 za P01-B-003.
Arhivi starejših izvedb ohranjajo protokol in izvajalnik, ki sta veljala
ob njihovem zagonu. Spremembe ne veljajo za nazaj.

Tri ločene agentske seje zaporedno pripravijo specifikacijo, implementacijo
in pregled. Predajajo si dokumente in kodo; pogovori ostanejo ločeni.
Popravke opravi prvotni avtor v nadaljevani seji. Pregledovalec ne spreminja
kode ali specifikacije. Izvirne zahteve so dostopne vsem trem vlogam.

Izhodišče, P01 v0.2, qwen/qwen3.5-9b z xhigh, CLI 0.158.0-alpha.2.1, odvisnosti in testi
ostajajo isti kot pri A. [Osnovni protokol](pilot-protocol.md) določa izvoz
in omejitve dostopa. Referenca, prejšnje rešitve, osebni podatki in končni
testi niso del okolja agentov. Pred začetkom preverimo vse tri meje pisanja
in zapremo predoglede prejšnjih kandidatov. Med delom ni ročnih namigov.

## Skupni čas in sprotna predaja

Skupna meja ostane 1200 sekund od začetka prve seje, vključno s predajami.
Priprava okolja in neodvisna ocena sta izključeni. Izvajalnik ves čas uporablja
isto uro; zgodnejši zaključek prepusti preostali čas naslednjim vlogam.

| Faza | Razporeditev preostalega časa |
| --- | --- |
| Specifikacija | Cilj 2–3 minute; najpozneje ostane 8 minut za implementacijo, 4 za pregled in 2 za popravke. |
| Implementacija | Uporabi čas do zadnjih šestih minut skupnega časa. |
| Pregled | Uporabi ves preostali čas razen zadnjih dveh minut za morebitne popravke. Fiksne triminutne meje ni več. |
| Popravek specifikacije | Po potrebi največ 90 sekund; vsaj 30 sekund ostane implementerju. |
| Popravek implementacije | Po potrebi preostanek skupnega časa. |

Faze se končajo takoj, ko agent opravi svoje obveznosti. Avtor specifikacije
pripravi pogoje iz navodil in kode; zagon aplikacije, testi in pregled videza
sodijo v implementacijo. Implementer sproti beleži rezultate. Pregledovalec
najprej zapiše ugotovitve nad zahtevami, nato izvede dodatna preverjanja,
ki jih utemelji s konkretnim vprašanjem. Ponavljanje vseh testov ni obvezno.

Vsak agent dobi dejanski rok svoje faze in lahko z `node task/time-budget.mjs`
preveri preostanek. Ura je del pripravljene infrastrukture; agenti je ne
morejo spreminjati. Poziv zahteva, da zadnjo minuto namenijo oddaji in
končnemu odgovoru. Trde meje še vedno uveljavlja izvajalnik.

## Predaja pregleda

Pregledovalec na začetku ustvari `docs/agent/review.json` z `complete:false`
in ga sproti dopolnjuje. Zapiše pregledane zahteve, konkretne ugotovitve,
omejitve preverjanja in zastavici za potrebne popravke. Osnutek ni odobritev.

Ob koncu mora biti `complete:true`, obravnavanih mora biti vseh deset zahtev
R01–R10, zastavici pa se morata ujemati z ugotovitvami. Obvezna struktura je
shranjena v `task/review-schema.json`. `review.md` je neobvezna razlaga;
za avtomatsko predajo zadošča veljaven končni JSON.

Isti objekt je tudi končni odgovor pregledovalca. CLI ga po dani shemi shrani
v `phases/.../final-response.json`. Po običajnem zaključku ga izvajalnik
preveri in brez vsebinskih sprememb prenese v `docs/agent/review.json`.
Kontrolna vsota in izvor predaje sta zabeležena. To je prenos agentovega
odgovora, ne pregled ali popravek, ki bi ga napisal izvajalec.

Neveljaven ali nedokončan končni odgovor ne more potrditi starejšega
osnutka. Manjkajočega pregleda ne nadomestimo z uspehom testov. Če so
potrebni popravki, se samodejno nadaljujeta ustrezni prvotni seji; dodatnega
kroga pregleda v tem pilotu ni. Neutemeljeno ugotovitev avtor lahko obrazloženo
zavrne in to zabeleži. Predaje in rezultati vsake faze ostanejo shranjeni.

Ob izteku faze je prekinitev vidna v rezultatu. Če uporabna specifikacija
ali veljavna predaja pregleda manjka, se postopek ustavi. Tudi ob uporabnem
zapisniku prekinjene faze celotnega zagona ne označimo kot običajen zaključek.
Po ustavitvi zamrznjeno kodo neodvisno ocenimo; ročnih popravkov ne dodajamo.

## Merjenje in preverjanje

Pred začetkom zamrznemo vhod, pozive, nastavitve in izvor izvajalnika.
Vsebinske datoteke P01 in ocenjevalca ostajajo nespremenjene. Po zadnji fazi
preverimo dovoljene spremembe, zamrznemo predajo in izvedemo slog, tipe,
gradnjo ter 38 osnovnih, 8 razvojnih in 22 skritih preverjanj.

Porabo zapišemo po sejah. Pri nadaljevanju seje skupni števec upoštevamo
samo enkrat; to preverimo z dogodki porabe. Prekinjena faza lahko vrne le
delne podatke, zato odsotne porabe ne nadomestimo z nič in je ne prikažemo
kot popolno meritev. Naročniških tokenov ne pretvarjamo v račun za API.

Enotska preverjanja izvajalnika zajemajo nepopoln pregled, manjkajočo
specifikacijo, predajo popravkov obema prvotnima avtorjema in iztek časa.
To so simulacije nadzora izvedbe, ne dodatne merjene izvedbe modela.

Zagon uporablja `pilot:prepare`, `pilot:browser`, `pilot:preflight`,
`pilot:run`, `pilot:evaluate` in `pilot:archive` z novim ID-jem. Mehanizma
[nadaljevanja seje in strukturiranega končnega odgovora](https://learn.chatgpt.com/docs/non-interactive-mode)
sta preverjena v uradni dokumentaciji in pomoči pripete različice CLI.

## Prejšnja poskusa in sprememba protokola

B-001 se je ustavil po triminutni fazi brez shranjene specifikacije. Pri
B-002 je bila meja specifikacije povečana na pet minut; vse tri vloge so
tekle, vendar pregledovalec v treh minutah ni oddal obveznega dokumenta.
Koda B-002 je pozneje opravila 68/68 neodvisnih preverjanj. Oba poskusa sta
v [pregledu pilotov](pilot-results.md).

B/0.3 zato spreminja razporeditev časa, obveznosti vlog ter zapis in prenos
predaje. Naloga, model, testi in skupna meja ostajajo enaki. To je nova
različica pilotnega protokola, ne ponovitev povsem enakih pogojev B-002.
Rezultati še ne sodijo med glavne meritve.
