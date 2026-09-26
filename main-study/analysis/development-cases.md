# Dodatni razvojni primeri za razpravo

To so naknadno izbrani, dejansko pregledani primeri zunaj vnaprej določene
ponovitve 001. Niso dodatne vsebinske ocene, novo eksperimentalno merilo ali
sistematičen popis pogostosti napak. Iz števila spodnjih primerov ni mogoče
sklepati na pogostost napak posameznega postopka. Vzorec 24 presoj in njegove
ocene ostanejo nespremenjeni; njihovi primeri so v [vsebinski presoji](content-review.md).
Raziskovalec ni popravljal ali ponovno izvajal oddaj.

Pri branju omejitev v predajah P10-B-003 in P08-B-003 upoštevaj
[naknadno preverjeno pojasnilo poti do referenčnih slik](diagnostics/README.md#pot-do-referenčnih-slik-folio):
slike so bile izvožene pod `docs/predogled/`, ne pod `predogled/` v korenu.
Opustitev primerjave ni bila posledica manjkajočih izvoznih slik.

## P03–A–002: napačna predpostavka testa o številu bralnih zahtev

Prvi skupni razvojni zagon je uspel 46/46. Po dodatku sedmih lastnih testov
je A06 pričakoval skupaj dve zahtevi `/api/tasks/omega` ob odpiranju
podrobnosti v obeh pogledih, dejansko pa so bile zabeležene štiri. Ohranjeni
dnevnik potrdi razliko pričakovano/dejansko in izid 52 uspehov ter en neuspeh.
Model v predaji vzrok poveže z razvojnim načinom React StrictMode, ki ponovi
učinke. Zahteve naloge omejujejo zapisovalne zahteve, ne števila dovoljenih
bralnih zahtev pri odpiranju podrobnosti.

Model je popravil samo lastno trditev: preveri, da je množica uporabljenih
API-poti natanko `{ /api/tasks/omega }`, brez zahteve po točnem številu
ponovitev. Ohranil je preverjanje brez
uporabniških zahtev na `/__test/`, brez zapisovalnih zahtev ter enakosti
strežniškega stanja pred in po scenariju. Aplikacije zaradi tega neuspeha
ni spreminjal. Končni celotni razvojni zagon je uspel 53/53, neodvisna ocena
pa 70/70, 12/12 zahtev in strogi uspeh. To je primer popravka testnega
pričakovanja, ne potrjene napake končne funkcionalnosti.

Dokazi: [prvi skupni zagon](../../runs/P03-A-002/submission/docs/agent/check-initial.log),
[neuspešni A06](../../runs/P03-A-002/submission/docs/agent/check-test-correction.log),
[končni test](../../runs/P03-A-002/submission/tests/agent/P03.spec.ts#L219),
[končni razvojni zagon](../../runs/P03-A-002/submission/docs/agent/check.log),
[predaja in pojasnilo](../../runs/P03-A-002/submission/docs/agent/verification.md),
[neodvisna ocena](../../runs/P03-A-002/evaluation-summary.json).

## P05–B–002: pregledovalec dopolni mobilno preverjanje

Implementer je predal uspešen celotni zagon 54/54. V dnevnikih sta ohranjena
tudi predhodna razvojna zapleta: nedovoljeni argument `disabled` pri
testnem matcherju (TS2353) in A07, ki po tipkah ArrowDown/Enter pri izvornem
izbirniku ni dobil pričakovane vrednosti 2. Zadnji test uporablja tipki
2/Enter; predaja navaja popravek lastnega testa brez spremembe produkcijske
kode zaradi tega neuspeha. To se je zgodilo pred pregledovalčevo predajo.

Pregledovalec je pregledal vseh R01–R12, kodo, predane dnevnike in štiri
posnetke. Konkretnega neskladja ni našel, vendar je opazil, da lastni mobilni
test A07 uporablja le eno opravilo. Zato je sam izvedel ciljan dodatek pri
390 × 844 pikah: 27 opravil, od tega 16 filtriranih zadetkov, velikosti
strani 2, 5 in 10 ter skupaj 14 filtriranih strani, vsako v obeh pogledih.
Preveril je tudi kodirane projektne/opravilne ID-je s posebnimi znaki,
podrobnosti, ohranitev strani, ponastavitve, prazen filter in projekt,
širino strani ter odsotnost zapisovalnih in testnih API zahtev.

V arhiviranem dogodku **`item.completed`, `item_21`** faze `03-review`
je dejanski izhod `PASS` z izhodno kodo 0; polje
`filteredPagesCheckedInBothViews` je 14. Branje celotnega ukaza potrdi,
da števec pomeni 14 odsekov, vsak preverjen v obeh pogledih, ne 14 različnih
testnih datotek ali 14 novih neodvisnih eksperimentov. Celotnega zagona
54 testov pregledovalec ni ponovil. Kode in specifikacije ni spreminjal
ter ni zahteval popravka. Poznejša neodvisna ocena je 70/70 in strogi uspeh.

To je primer konkretne dodatne dejavnosti pregledovalca, ne dokaz odkrite
funkcionalne napake ali vzročnega izboljšanja uspešnosti postopka B.
Izbran je naknadno zaradi razvidne razlike med predanimi in lastnimi dokazi
pregleda; ni del vnaprej izbranega vzorca 24 vsebinskih ocen.

Dokazi: [začetna napaka tipov](../../runs/P05-B-002/submission/docs/agent/check-initial.log),
[neuspešni test tipkovnice](../../runs/P05-B-002/submission/docs/agent/check-keyboard.log),
[končni testni zagon](../../runs/P05-B-002/submission/docs/agent/check.log),
[predaja implementerja](../../runs/P05-B-002/submission/docs/agent/verification.md),
[pregledovalčev zapis](../../runs/P05-B-002/submission/docs/agent/review.md),
[surovi dogodki pregleda, item_21](../../runs/P05-B-002/phases/03-review/events.jsonl.gz),
[neodvisna ocena](../../runs/P05-B-002/evaluation-summary.json).

## P10–B–003: dodatno preverjanje napake podrobnosti z zgodovino

Implementer je predal 53/53 uspešnih testov, vendar kombinacijo napake
nalaganja podrobnosti z nepraznima zgodovinama izrecno označil kot še
neavtomatizirano. Pregledovalec je zato izvedel svoj scenarij pri 390 × 844
pikah, s štirimi opravili enakega naslova in različnimi ID-ji.
Dva premika in ena razveljavitev ustvarijo vrstni red `[b,a,c,d]`,
eno razveljavitev in eno ponovitev. Scenarij zahteva, da napaka GET 503,
ponovni poskus in zapiranje podrobnosti v obeh pogledih ohranijo to stanje.
Nato preveri ponovitev, dve razveljavitvi, globalna mesta, končni vrstni red,
širino strani in odsotnost zapisovalnih zahtev ter napak JavaScript.

Prva izvedba, surovi dogodek **item_32**, se konča z izhodom 1: injekcija
vrne 503 samo prvi zahtevi za posamezni ID, naslednjim pa že uspešne
podatke. Pričakovano sporočilo napake ni vidno; izpis pokaže naložene
podrobnosti b. Pregledovalec pojav poveže z razvojnim StrictMode in
ponovnim GET. V naslednjem poskusu je priprava spremenjena tako, da za b
vrača napako do izrecne sprostitve tik pred klikom »Poskusi znova«,
za a pa napako ohrani do zapiranja podrobnosti. Aplikacija ostane
nespremenjena. **item_34** potrdi `PASS`, izhod 0, brez razširitve strani,
zapisov API ali dogodkov `pageerror`. Celotnega zagona 53 testov
pregledovalec ne ponovi in ne zahteva popravkov kode ali specifikacije.

Ločen implementerjev prvi zagon je dosegel 52/53 zaradi pričakovanja
vidnega tipkovničnega fokusa takoj po programskem `focus()` po kliku.
Končni test uporablja dejanski Tab/Shift+Tab, preveri viden obris in
aktivacijo z Enter. Ohranjena sta oba dnevnika; končni zagon je 53/53,
poznejša neodvisna ocena 70/70 in 12/12 zahtev s strogim uspehom.

Primer kaže dopolnitev priznane vrzeli ter popravek priprave lastnega
preverjanja. Ne dokazuje odkrite napake končne aplikacije ali vzročnega
izboljšanja postopka B. Izbran je naknadno, zunaj formalne presoje 001;
ne povečuje števila vsebinsko ocenjenih oddaj ali neodvisnih eksperimentov.

Dokazi: [prvotni razvojni zagon](../../runs/P10-B-003/submission/docs/agent/check-first.log),
[končni test fokusa](../../runs/P10-B-003/submission/tests/agent/order.spec.ts#L114),
[končni razvojni zagon](../../runs/P10-B-003/submission/docs/agent/check.log),
[predaja](../../runs/P10-B-003/submission/docs/agent/verification.md),
[pregledovalčev zapis](../../runs/P10-B-003/submission/docs/agent/review.md),
[surovi dogodki pregleda, item_32 in item_34](../../runs/P10-B-003/phases/03-review/events.jsonl.gz),
[neodvisna ocena](../../runs/P10-B-003/evaluation-summary.json).

## P08–B–003: pregledovalčev ločen koledarski izračun

Implementerjev prvi celotni zagon je dosegel 50/53. Trije koledarski testi
so pri različnih časovnih pasovih pričakovali 0 zamujenih opravil, prejeli
pa 4. Predaja to pripiše ponovni uporabi iste strani ob menjavi testnih
podatkov. Končna različica ustvari novo stran za vsak primer, jo po njem
zapre in ohrani preverjanje natančnih števcev ter ID-jev. Celotni zagon
nato uspe 53/53 v 25,9 s, vključno s sedmimi lastnimi testi. Trije od njih
izvedejo sedem koledarskih primerov v UTC, Europe/Ljubljana in
America/New_York.

Pregledovalec je dodal neposredno preverjanje funkcij `deadlines.ts`
z referenčnim premikanjem dneva, meseca in leta po gregorijanskih pravilih,
brez uporabe `Date` v referenčnem izračunu. Obravnaval je 18 izbranih let,
šest mesecev, tri izbire dneva, osem odmikov in tri statuse opravila.
Vključeni so zgodnja leta, prestopna stoletja ter neprestopna 0100, 1900
in 2100. Primeri zunaj let 0001–9999 so izpuščeni. Surovi dogodek
**item_18** faze `03-review` potrdi izhod 0 in
`{"result":"passed","anchors":324,"classifications":7743}`.

Število 324 pomeni iteracije izhodišča, ne 324 različnih datumov:
v neprestopnem februarju sta 28. dan in zadnji dan meseca isti datum.
Iz ukaza je razvidnih **312 različnih izhodiščnih datumov** ter
12 ponovitev. 7.743 je število preverjenih razvrstitev, ne toliko
neodvisnih eksperimentov ali vnaprej določenih sprejemnih testov.
Pregled zajema tudi števce, šest neveljavnih vnosov in prazen seznam.

Pregledovalec ni ponovno izvedel celotnega brskalniškega preverjanja,
ni spremenil aplikacije ali zahteval popravkov. Poznejša neodvisna ocena
je 70/70 in 12/12 zahtev s strogim uspehom. Ta naknadno izbrani primer
ponazarja dodatno preverjanje z drugačnim načinom izračuna, ne potrjene
napake aplikacije ali vzročnega izboljšanja postopka B. Ne nadomešča
ocene ponovitve 001 in ne dokazuje pravilnosti celotne domene datumov.

Dokazi: [prvi razvojni zagon](../../runs/P08-B-003/submission/docs/agent/check-initial.log),
[končni koledarski testi](../../runs/P08-B-003/submission/tests/agent/deadlines.spec.ts#L145),
[končni razvojni zagon](../../runs/P08-B-003/submission/docs/agent/check.log),
[predaja](../../runs/P08-B-003/submission/docs/agent/verification.md),
[pregledovalčev zapis](../../runs/P08-B-003/submission/docs/agent/review.md),
[surovi dogodki pregleda, item_18](../../runs/P08-B-003/phases/03-review/events.jsonl.gz),
[neodvisna ocena](../../runs/P08-B-003/evaluation-summary.json).

## P08: trije izbrani primeri ponovnega nalaganja testnih podatkov

Podoben zaplet priprave koledarskih testov je dokumentiran v treh
naknadno pregledanih oddajah različnih postopkov. Lastni test je znotraj
iste strani večkrat klical skupni `mount` z istim URL-jem z razpršilcem
in spremenjenimi prestreženimi podatki. Naslednji primer je obdržal podatke
prejšnjega, zato neuspeh ni sam po sebi dokaz napačne razvrstitve rokov.
Predaje pojasnjujejo to razliko; končni testi izrecno zagotovijo novo stran
oziroma novo nalaganje. Izvirni skupni pripomoček ni bil spremenjen.

| Oddaja | Prvi celotni zagon | Popravek priprave | Končni celotni zagon |
| --- | --- | --- | --- |
| P08-A-002 | 51/54; trije A02 neuspešni | `about:blank`, odstranitev starih prestrezanj in preverjanje dejansko naloženega roka | 54/54, 26,6 s |
| P08-B-003 | 50/53; trije A05 neuspešni | nova stran za vsak koledarski primer, nato zapiranje strani | 53/53, 25,9 s |
| P08-C-002 | 51/54; trije A02 neuspešni | `about:blank` pred vsakim novim primerom | 54/54, 23,7 s |

Vsi trije končni arhivi imajo tudi 70/70 neodvisnih preverjanj in 12/12
zahtev. To so primeri razlikovanja med pripravo testa in funkcionalno
napako; ne gre za tri napake končnih rešitev ali formalne povratne korake
po pregledu. Izbor je naknaden in ni sistematičen popis vseh razvojnih
zagonov, zato tabela ne meri pogostosti napak ali prednosti katerega
postopka. Vnaprej določene presoje ponovitve 001 ostanejo ločene.

Dokazi za A: [prvi dnevnik](../../runs/P08-A-002/submission/docs/agent/check-first.log),
[končni test](../../runs/P08-A-002/submission/tests/agent/deadlines.spec.ts#L80),
[končni dnevnik](../../runs/P08-A-002/submission/docs/agent/check.log),
[predaja](../../runs/P08-A-002/submission/docs/agent/verification.md).
Dokazi za B so navedeni v prejšnjem primeru. Dokazi za C:
[prvi dnevnik](../../runs/P08-C-002/submission/docs/agent/P08/check.log),
[končni test](../../runs/P08-C-002/submission/tests/agent/P08.spec.ts#L73),
[končni dnevnik](../../runs/P08-C-002/submission/docs/agent/P08/check-final.log),
[predaja](../../runs/P08-C-002/submission/docs/agent/verification.md).

## P04–B–002: dejanski povratni popravek specifikacije ob faznih omejitvah

Začetna specifikacija je po 360,040 s dosegla svojo časovno mejo. Ohranjeni
osnutek je vseboval sprejemne pogoje R01–R12, vendar še ne konkretnih
predikatov in sledljivosti. Implementer je obvezne pogoje dopolnil v
`verification.md`, pripravil kodo ter prvi uspešni zagon 52/52 testov
(20,6 s; šest lastnih testov). Pregledovalec je potrdil eno dokumentacijsko
ugotovitev za specifikatorja: specifikacija ostaja osnutek in ne povezuje
že obstoječih dokazil. `specificationChangesRequired=true`,
`codeChangesRequired=false`; funkcionalnega odstopanja ni ugotovil.

Izvajalnik je nadaljeval izvirno sejo specifikatorja. Njegov popravek je
po 90,050 s prav tako dosegel fazno mejo, vendar sta dopolnjena specifikacija
in zgodovina dejansko shranjeni. Končni dokument ima formalna pravila,
ločene vrstice R01–R12 ter povezave na predikate, sledljivost in rezultate
implementerja. Nato je nadaljeval izvirni implementer: v 119,193 s je
obravnaval ugotovitev in preveril dokumentacijske povezave. Surovi
**item_8 v fazi 05-implementation-repair** potrdi izhod 0 in štiri izpise
PASS. Sedem povezav in sidra je preveril v tedanjem delovnem okolju;
testov funkcionalnosti ni ponovil. Drugega formalnega pregleda protokol
ne predvideva.

Primerjava SHA-256 vseh 12 datotek `src/` in ene lastne testne datoteke
med koncem prve implementacije in končno oddajo potrdi nespremenjenost
kode in testov. Popravek ni zahteval njihove spremembe. Faza popravka
specifikacije zato šteje kot **začeta, a ne normalno zaključena**, čeprav
je dokument spremenjen; povratni korak implementerja je zaključen.
Trditev zgodovine »predaja zaključena« ne nadomesti procesnega statusa.

Končni status je `completed_with_phase_time_limit`, skupni čas
1109,156 s. Neodvisna ocena je **70/70 in 12/12**, dovoljeni obseg je
potrjen, strogi uspeh pa je negativen zaradi prekinjenih faz. Celotna
poraba ostane manjkajoča; opažena spodnja meja je 960745 vhodnih in
29808 izhodnih tokenov (814080 predpomnjenih in 3537 reasoning sta
podmnožici). To ni posledica omejitve naročnine. Oddaja ni ponovljena.

Primer je izbran naknadno zaradi dokumentiranega formalnega popravka in
razlike med procesnim ter funkcionalnim izidom. Ne dokazuje vzročnega
vpliva pregleda na pravilnost kode ali splošne prednosti postopka B.
Ni dodatna ordinalna ocena: ponovitev 002 ostaja zunaj vzorca 001.

Omejitev arhiva: mobilna slika je nastala v `test-results/`, ki ni del
zamrznjene oddaje, zato povezava nanjo znotraj arhivirane specifikacije
ni prenosljiva. Preživela izvirna slika je naknadno prekopirana v
[ločeno diagnostično prilogo](diagnostics/P04-B-002/p04-mobile-board.png),
z [navedenim poreklom in hashom](diagnostics/P04-B-002/provenance.json).
Ni ponovno ustvarjena in ni naknadno vstavljena v zamrznjeni arhiv.

Dokazi: [začetna specifikacija po prekinitvi](../../runs/P04-B-002/phases/01-specification/submission/docs/agent/specification.md),
[prvi zagon](../../runs/P04-B-002/submission/docs/agent/check.log),
[strukturirani pregled](../../runs/P04-B-002/phases/03-review/final-response.json),
[končna specifikacija](../../runs/P04-B-002/submission/docs/agent/specification.md),
[zgodovina](../../runs/P04-B-002/submission/docs/agent/specification-history.md),
[zapis implementerja](../../runs/P04-B-002/submission/docs/agent/verification.md),
[novi dnevnik preverjanja dokumentov](../../runs/P04-B-002/submission/docs/agent/review-response-check.log),
[surovi item_8](../../runs/P04-B-002/phases/05-implementation-repair/events.jsonl.gz),
[proces in časi](../../runs/P04-B-002/execution.json),
[neodvisna ocena](../../runs/P04-B-002/evaluation-summary.json),
[delno opažena poraba](../../runs/P04-B-002/usage-observation.json).

## P07–C–003: popravek podedovanih sklicev pri ID-ju s presledkom

Prvi skupni zagon je uspešno opravil lint, ustavil pa ga je TS2684 v
lastnem testu izjem shrambe: združena podpisa `getItem`/`setItem` nista
ustrezala klicu z določenim `this`. Testni prestreznik je bil popravljen z
`Reflect.apply`. Brskalniški testi v tem prvem zagonu še niso tekli.
Naslednji celotni zagon je uspel 66/66 v 26,0 s.

Model je nato pri pregledu domene ID-jev opazil surove identifikatorje
DOM v `aria-labelledby` kartic. Pri presledku se sklic razdeli na več
imen. Spremenil je samo sestavljanje DOM oznak in njihovih sklicev z
`encodeURIComponent`; podatkovni ID in navigacija ostaneta nespremenjena.
A07 je dopolnil z ID-ji oblike `č /0?&` ter s preverjanjem natančnega
imena povezave. Končni celotni zagon je uspel 66/66 v 26,5 s, neodvisna
ocena pa 70/70 in 12/12 s strogim uspehom. Converge je pregledal dokazila,
brez novega popravka ali ponovitve testov.

To je popravek aplikacijske kode med razvojem, vendar izhodiščne omejitve,
ne novo uvedene regresije. SHA-256 začetne komponente v arhivu se ujema
z izvirnim izvoznim manifestom in nespremenjenim izhodiščem prej opravljenega
[ločeno označenega pregleda dostopnosti](diagnostics/README.md#dostopno-ime-kartice-pri-id-ju-s-presledkom).
Nova primerjava ni dodatno brskalniško merjenje ali preizkus bralnika
zaslona. Izbrana je naknadno; ne spreminja primarnih meril, ne ocenjuje
ponovitve 003 po rubriki 001 in ne dokazuje splošne prednosti postopka C.

Dokazi: [napaka tipov](../../runs/P07-C-003/submission/docs/agent/P07/check.log),
[zagon pred dopolnitvijo](../../runs/P07-C-003/submission/docs/agent/P07/check-final.log),
[začetna komponenta](../../runs/P07-C-003/phases/01-constitution/submission/src/TaskBoard.tsx),
[končna komponenta](../../runs/P07-C-003/submission/src/TaskBoard.tsx),
[končni A07](../../runs/P07-C-003/submission/tests/agent/P07.spec.ts#L183),
[končni zagon](../../runs/P07-C-003/submission/docs/agent/P07/check-verified.log),
[zapis poteka](../../runs/P07-C-003/submission/docs/agent/verification.md),
[primerjava zgoščenih vrednosti](diagnostics/P07-C-003-accessibility.json),
[neodvisna ocena](../../runs/P07-C-003/evaluation-summary.json).

## P10–B–002: popravek tipov in primerjava z modelom časovnice

V prvi implementaciji je TypeScript zavrnil dostop do `id` in `direction`
po obravnavi undo/redo/reset: `OrderAction` je združeval tri vrednosti
`type` v enem členu unije. Surovi dogodek implementacije `item_14` vsebuje
dve napaki TS2339 in izhodno kodo 2. Implementer je razdelil te tri člene
na ločene diskriminirane tipe. To je popravek aplikacijske kode med razvojem,
ne napaka končne oddaje.

Prvi skupni zagon (`item_19`) je nato opravil 52/53 testov. Lastni S4 je
pričakoval vidni fokus po programskem `focus()` v miškinem načinu. Test
je bil popravljen na dejanski Tab; naslednji skupni zagon (`item_26`) je
uspel s 53/53 v 27,5 s: 38 regresijskih, 8 razvojnih in 7 lastnih preverjanj.
Oba dnevnika sta ohranjena; neuspešni zagon ni nadomeščen samo s povzetkom.

Pregledovalec je brez spreminjanja kode izvedel še ločen preizkus dejanskega
reducerja proti modelu časovnice in kazalca. Uporabil je generator s semenom
`0x102b002`, velikosti 0, 1, 2, 5 in 24, pri vsaki 30 zaporedij po 1000
korakov. Vseh **150.000 prehodov** se je ujemalo; preverjeni so tudi
nespremenljivost prejšnjega stanja, število ID-jev in meja 20 razveljavitev.
Opaženih je 90.129 premikov, 30.045 undo, 16.192 redo in 13.634 reset;
55.874 neveljavnih premikov je podmnožica premikov. Dogodek pregleda
`item_17` ima izhod 0 in izpis `passed`. Gre za 150.000 korakov v 150
zaporedjih, ne za toliko različnih nalog ali izčrpen dokaz pravilnosti.

Pregled ni zahteval povratnega popravka. Neodvisna končna ocena je 70/70,
12/12 in strogi uspeh. Celoten čas 997,802 s vključuje ta pregled; ločena
raziskovalčeva ekstrakcija dokazov ni nova merjena seja. Primer je izbran
naknadno in ne dodaja ordinalne ocene ponovitvi 002 ali dokaza, da pregled
vedno izboljša rezultat.

Dokazi: [dogodki implementacije](../../runs/P10-B-002/phases/02-implementation/events.jsonl.gz),
[končni tipi dejanj](../../runs/P10-B-002/submission/src/useTaskOrder.ts#L11),
[prvi skupni zagon](../../runs/P10-B-002/submission/docs/agent/check.log),
[končni zagon](../../runs/P10-B-002/submission/docs/agent/check-final.log),
[test S4](../../runs/P10-B-002/submission/tests/agent/order.spec.ts#L91),
[izvirni pregled](../../runs/P10-B-002/phases/03-review/events.jsonl.gz),
[izluščen dokaz s poreklom](diagnostics/P10-B-002-review-timeline.json),
[predaja](../../runs/P10-B-002/submission/docs/agent/review.json),
[neodvisna ocena](../../runs/P10-B-002/evaluation-summary.json).
