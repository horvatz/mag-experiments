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
