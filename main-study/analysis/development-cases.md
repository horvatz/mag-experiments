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
