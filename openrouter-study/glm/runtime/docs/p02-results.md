# Piloti P02

Stanje: 21. september 2026. P02 preverja množično spreminjanje stanja
opravil z delnimi neuspehi in ponavljanjem samo neuspelih zapisov.
To je drugi pilot za umerjanje raziskave, ne glavna primerjava postopkov.

Pred prvim zagonom je bil določen [protokol P02/1](p02-pilot-protocol.md):
GPT-6 Astra, xhigh, Codex CLI 0.154.0 in skupna meja 20 minut na postopek.
Vsi trije postopki začnejo iz istega commita Folio, brez implementacije P01,
z istimi navodili P02 v0.1 in razvojnimi testi. Med merjenjem ni ročnih
namigov, sprememb kode ali povratnih informacij iz končnih testov.

## Izvedbe

| Izvedba | Čas | Neodvisna ocena kode | Zaključek postopka |
| --- | --- | --- | --- |
| [A-001](../runs/P02-A-001/report.md) | 16 min 16 s | 72/72 | Pravočasna oddaja enega agenta. |
| [B-001](../runs/P02-B-001/report.md) | 16 min 12 s | 72/72 | Vse tri faze zaključene; popravki niso zahtevani. |
| [C-001](../runs/P02-C-001/report.md) | 17 min 37 s | 72/72 | Vseh šest korakov zaključenih; dodatne naloge niso zahtevane. |

Ocena kode vsebuje 38 osnovnih, 8 razvojnih in 26 končnih preverjanj;
poleg teh ocenjevalec ločeno preveri slog, tipe in gradnjo. Lastni testi
agentov niso del teh 72 preverjanj. Uspeh kode in zaključek postopka sta
ločena izida. Vsi dejansko začeti poskusi ostanejo v evidenci.

## Preverjanje pogojev

Pred modeli je referenca opravila 72/72 preverjanj, testi pa zaznali
10/10 namernih napak. Veljavna zaporedna kontrola je opravila vseh 13
končnih scenarijev na računalniškem prikazu. Ločena tehnična kopija brez
klica modela je opravila 46/46 javnih preverjanj v izoliranem okolju;
nikoli ni bila uporabljena kot modelska izvedba.

Izvozi A/B/C imajo enakih 16 vsebinskih vhodnih datotek. Kontrolne vsote
navodil, testov, reference in izvajalnika so shranjene pred zagoni;
ocenjevalec zavrne oceno, če se ti viri vmes spremenijo.
Pri C je pred zagonom potrjena tudi izbira pripetega Pythona 3.12.14
in PyYAML 6.0.3 prek dejanske prijavne lupine.

Dokazila: [preverjanje reference](p02-verification.md),
[izolirani javni testi](../reports/P02-export-check.json) in
[enakost vhodov ter Python](../reports/P02-pilot-preparation.json).

## Postopek A

A-001 je sam pripravil specifikacijo, kodo in šest lastnih scenarijev,
vsakega pri širinah 1440 in 320 pik. Zadnji celotni agentov zagon je
opravil 58/58 preverjanj. Med delom je popravil napačno pričakovano
besedilo zavrnitve v svojih testih in manjšo težavo sloga gumba.
Neuspešni koraki in omejitve pregleda so zapisani v oddaji.

Poznejša neodvisna ocena zamrznjene kode je uspešna: 72/72 preverjanj,
slog, tipi in gradnja. Spremembe so omejene na dovoljene datoteke.
CLI je ob običajnem zaključku vrnil 1.410.352 vhodnih in 29.533 izhodnih
tokenov; vključena podštevca sta shranjena v poročilu. Naročniške porabe
ne pretvarjamo v ceno API ali znesek v evrih.

## Postopek B

B-001 je zaključil specifikacijo v 272,755 s, implementacijo v 514,733 s
in pregled v 182,676 s; skupni čas s predajami je 971,686 s. Avtor
specifikacije je predal strukturiran opis R01–R12 s predikati in načrtom
preverjanja. Implementer je opravil 57/57 dostopnih preverjanj, vključno
z enajstimi lastnimi. Med lastnim pregledom je dopolnil vidnost in zaklep
gumba za ponovitev med čakanjem ter dodal ustrezen test.

Pregledovalec je v ločeni seji pregledal zahteve, dokumente, kodo, teste,
dnevnike in posnetke. Testov ni ponovno zagnal, kar je izrecno navedel.
Strukturirana predaja zajema vseh dvanajst zahtev in ne zahteva popravkov.
Nadaljevanje prvotnih sej po zahtevanem popravku zato v tem poskusu ni bilo
potrebno. Implementerjev popravek pred predajo ni preizkus te povratne zanke.

Neodvisna ocena zamrznjene kode je uspešna: 72/72 preverjanj, slog, tipi
in gradnja. Vse tri vloge so ostale znotraj dovoljenih sprememb.
Celotna poraba je preverjena z dogodki treh natančno določenih sej:
1.020.321 vhodnih in 29.307 izhodnih tokenov. Omejitev ukaza Git v izvozu
je zabeležena v predaji; kontrolne vsote datotek in meje vlog je preveril
izvajalnik.

## Postopek C

C-001 je v isti ohranjeni seji izvedel Spec Kit 1.0.8 z uradnim presetom
Lean 1.0.0. Načela so trajala 95,510 s, specifikacija 191,698 s, načrt
105,518 s, naloge 77,850 s, implementacija 477,244 s in zaključni pregled
105,262 s. Skupaj s predajami je postopek trajal 1056,676 s.

Agent je pripravil deset izvedbenih nalog in opravil 55/55 dostopnih
preverjanj, od tega devet lastnih. Zaključni pregled je primerjal kodo z
zahtevami, dokumenti in dokazili; testov ni ponovno zagnal. Izid je
`converged`, brez pripetih novih nalog. Datoteka nalog in koda sta med
tem pregledom ostali nespremenjeni. Dodatni par implementacije in
pregleda zato ni bil potreben.

Uradni `check-prerequisites.sh` je med dejansko izvedbo uspešno razrešil
mapo `docs/agent/P02`. Pripeti Python in PyYAML sta neposredno preverjena
v predhodnem preizkusu prijavne lupine; uspeh tega zagona sam zase ne
preveri vseh poti orodja, ki lahko uporabljajo Python.

Neodvisna ocena zamrznjene kode je uspešna: 72/72 preverjanj, slog, tipi
in gradnja. Vseh šest faz je spoštovalo meje pisanja. Poraba je popolna,
preverjena po eni seji: 2.444.380 vhodnih in 31.828 izhodnih tokenov.
Končni kumulativni števec je upoštevan enkrat; števci nadaljevanj niso
sešteti med seboj.

## Poraba in celovitost evidence

| Postopek | Vhodni tokeni | Od tega predpomnjeni | Izhodni tokeni | Popolna evidenca |
| --- | ---: | ---: | ---: | --- |
| A | 1.410.352 | 1.325.696 | 29.533 | Da, končni dogodek CLI. |
| B | 1.020.321 | 878.080 | 29.307 | Da, primerjava treh sej. |
| C | 2.444.380 | 2.175.488 | 31.828 | Da, primerjava ene nadaljevane seje. |

Predpomnjeni vhodi so del vhodnih tokenov. Poraba razmišljanja je del
izhodnih tokenov in je ohranjena v strojnih poročilih. To so opažanja treh
izvedb prek obstoječe naročnine; ne določajo cene API, zneska v evrih ali
splošne stroškovne prednosti posameznega postopka.

[Strojni povzetek](../reports/P02-pilot-summary.json) povezuje čase, izide,
faze, porabo in kontrolne vsote arhivov. Po vseh treh ocenah je potrjeno:
125 zamrznjenih izvornih datotek izvajalnika in meril se ni spremenilo,
manifesti ustrezajo dokazilu pred začetkom, arhivirane oddaje pa ustrezajo
ocenjeni kodi. Izvirni `mag-app` je ostal nespremenjen.

## Kaj je pilot pokazal

Vsi trije postopki so v prvem poskusu P02 pravočasno zaključili predpisane
korake in opravili vseh 72 neodvisnih preverjanj. Med temi tremi zagoni ni
bilo spremembe protokola, namigov ali ročnih popravkov. Izvedeni so bili
zaporedno A, B, C; vrstni red v tem pilotu ni bil naključno razporejen.

Tudi ta nabor testov ni ločil funkcionalne uspešnosti treh oddanih rešitev.
En poskus na postopek ne zadostuje za statistično primerjavo ali sklep o
splošnem zmagovalcu. Razlike v času, porabi in številu lastnih testov same
ne dokazujejo razlik v kakovosti. Neodvisna rubrika kakovosti kode in
pravilnosti sledljivosti še ni uporabljena.

B in C nista zahtevala popravkov po pregledu, zato dejanska pot vračanja
zahtevanih popravkov ostaja nepreverjena. Popravki lastnih testov in kode
znotraj implementacije ter ponavljanje shranjevanja v aplikaciji te poti
ne nadomestijo. Ker noben od treh zagonov ni bil prekinjen, popolna poraba
P02 tudi ne potrjuje merjenja pri prekinitvi.

## Naslednji koraki magistrske

1. Izvesti ločen, vnaprej opisan tehnični preizkus popravkov: pri B vrnitev
   ugotovitev prvotnemu avtorju specifikacije in implementerju; pri C
   pripenjanje novih nalog, ponovna implementacija in zaključni pregled.
   Namen je preveriti pot predaje, ne ustvariti dodatne primerjalne meritve.
2. Preveriti ustavitev ob časovni meji in beleženje porabe pri prekinitvi.
   Določiti, kateri števci so popolni, kateri le delni in kako se to poroča.
3. Pripraviti izbor glavnih nalog in neodvisno rubriko kakovosti kode ter
   sledljivosti. Upoštevati, da P01 in P02 v uspešno oddanih rešitvah nista
   ustvarila razlik na uporabljenih funkcionalnih testih. Pilotnih zahtev
   in meril zaradi že znanih izidov ne spreminjati za nazaj.
4. Zamrzniti skupni protokol, obseg in ponovitve glede na čas ter način
   merjenja porabe. Delovnih 72 glavnih izvedb še ni potrjena kvota.
5. Dopolniti poglavji 4.6 in 4.7 ter metodologijo z dejansko izvedenim
   okoljem in potrjenimi odločitvami, nato začeti glavne meritve.

P01 in P02 sta zaključena kot izvedena pilota vseh treh postopkov.
Odprta tehnična preverjanja zgoraj ostajajo pogoj pred glavnimi meritvami.
Skupaj je ohranjenih devet modelskih poskusov: šest na P01 in trije na P02.
Tehnične kopije brez modela niso vključene v to število. PDF v tem koraku
ni bil dopolnjen.
