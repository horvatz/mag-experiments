# Dodatni razvojni primeri za razpravo

To so naknadno izbrani, dejansko pregledani primeri zunaj vnaprej določene
ponovitve 001. Niso dodatne vsebinske ocene, novo eksperimentalno merilo ali
sistematičen popis pogostosti napak. Iz števila spodnjih primerov ni mogoče
sklepati na pogostost napak posameznega postopka. Vzorec 24 presoj in njegove
ocene ostanejo nespremenjeni; njihovi primeri so v [vsebinski presoji](content-review.md).
Raziskovalec ni popravljal ali ponovno izvajal oddaj.

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
