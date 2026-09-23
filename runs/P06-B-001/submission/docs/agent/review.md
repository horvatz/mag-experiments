# Neodvisni pregled P06

Pregledovalec je prebral izvirne zahteve, projektna pravila, predlogo,
specifikacijo in njeno zgodovino, implementacijo, lastne in razvojne teste,
osnovne regresijske teste ter verification.md in njegove dokaze.
Pregled vseh dvanajstih zahtev ni pokazal konkretnih napak. Izidi se sproti
beležijo v review.json; spodnja sledljivost je lastni pregled kode in dokazov.

| Zahteva | Neodvisno pregledano | Predani dokaz implementerja |
| --- | --- | --- |
| R01 | App posreduje izvorno polje trenutnega projekta; CsvExport inicializira vse kolone, all in podpičje; filter/map ohranita vrstni red. | S1/S2, S3, D01. |
| R02 | csvColumns določa vrstni red glave in vrednosti, izbor ga le omeji. Dostopna imena checkboxov ustrezajo navodilom. | S1/S2, S4, D02. |
| R03 | Disabled temelji na kolonah in številu vrstic; serializeCsv vrne null brez obeh, handler ne sproži prenosa. | S1/S2, S3. |
| R04 | Izvozni filter je ločeno lokalno stanje; prikazi in povzetki uporabljajo vsa opravila. Prazni projekti imajo kontrole in disabled gumb. | S3, S7, D02/D04. |
| R05 | Blob vsebuje U+FEFF, download ime vsebuje projectId, ni target ali API klica; URL se sprosti po začetku prenosa. | S1/S2, S6, D01. |
| R06 | quote obdaja vsako polje in podvoji vse narekovaje; oba dovoljena separatorja sta povezana s selectom. | S4, D01–D03. |
| R07 | join CRLF in končni CRLF sta izrecna; vsebina polj se ne deli ali normalizira. | S4, D01/D03. |
| R08 | Točen vzorec /^[ \t\r\n]*[=+\-@]/ doda apostrof pred celoten izvirni niz za vsako podatkovno kolono; glava uporablja samo quote. | S5, D03. |
| R09 | Neposredno branje task[column], brez obrezovanja ali prikaznih pretvorb datumov/stanj. | S4/S5. |
| R10 | CsvExport je stalni sorojenec preglednice/table in vedno prejme izvorne tasks. | S6, D04. |
| R11 | ProjectView key={project.id} in lokalni useState zagotavljata ponastavitev ob menjavi projekta/osvežitvi; handler uporablja trenutno stanje. | S6. |
| R12 | Ni mutacij ali zapisovalnih klicev izvoza; ohranjeni data-task-id, imena, podrobnosti in povzetki; prelom kontrol uporablja obstoječe sloge. | S4/S7, 38 osnovnih testov, manual-check.json in trije posnetki. |

Specifikacija pokriva vsa izvirna pravila in uporablja ustrezne predikate.
Njeni izidi so pošteno označeni kot še neizvedeni v avtorski fazi, dejanska
sledljivost izvedbe in rezultatov je dopolnjena v verification.md.

Pregledovalec je sam vizualno pregledal desktop.png, mobile.png in
mobile-board.png: postavitev, tipografija, barve in novi gradniki so skladni
z docs/dizajn.md; kontrole so znotraj mobilne širine. To so predani posnetki,
ne nov zajem pregledovalca. Meritev overflow in odsotnost pageerror iz
manual-check.json sta predana rezultata implementerja.

Prebran check.log vsebuje uspešen ESLint, TypeScript, gradnjo in 53 uspešnih
testov (38 osnovnih, 8 razvojnih, 7 lastnih). Pregledovalec teh zagonov ni
ponavljal; ta podatek je rezultat implementerja, potrjen z branjem dnevnika.

Pred dodatnim preverjanjem je bila shranjena ta predaja. Ciljno preverjanje
bo pokrilo izvoz vseh prepletenih stanj s table in poljubna ID-ja projektov,
ker obstoječa primerjava pogledov uporablja filter in_progress.

Omejitve: končni testi niso dostopni; javni internet je blokiran. Sistemski
git ne deluje zaradi manjkajočega xcrun, zato git diff ni bil preverjen.
Chromium se povezuje prek task/browser.json; drugih brskalnikov ali naprav
in sistemskega dialoga prenosa pregled ne vključuje. Koda, specifikacija,
testi in infrastruktura niso bili popravljeni.

## Lastno izvedeno ciljno preverjanje

Pregledovalec je prek chromium.connect(wsEndpoint) na lokalnem strežniku
5193/3123 izvedel ločen brskalniški scenarij pri širini 390 px. GET odgovori
so bili nadzorovani samo v testnem programu; uporabljeni sta poljubni oznaki
projektov in 13 opravil s prepletenimi stanji ter drugačnim vrstnim redom
na tabli. Prebrane so bile surove bajtne vsebine štirih dejanskih prenosov.
Izid: PASS. Natančni rezultati:

```json
{
  "result": "PASS",
  "records": 13,
  "downloads": 4,
  "distinctProjectIds": [
    "-review-A7",
    "review-B2"
  ],
  "mixedStatusAllViewParity": true,
  "exactBytesBothDelimiters": true,
  "formulaAndUnicodeIntegration": true,
  "reversedColumnClicks": true,
  "emptyProjectsBothViews": true,
  "resetOnProjectChange": true,
  "mobileOverflow": false,
  "apiWrites": 0,
  "testControlRequests": 0,
  "pageErrors": 0
}
```

Pričakovani CSV ni uporabil produkcijskega serializatorja; pričakovana
apostrofa za projectId in title sta bila določena neposredno iz testnih
vrednosti. Primerjava je vključevala BOM, notranje narekovaje, podpičja,
vejice, CR/LF/CRLF, Unicode, NBSP pred plusom ter končni CRLF. Ni bilo
navigacije ali nove strani zaradi prenosa. Celotna zbirka testov ni bila
ponovno zagnana, ker pregled ni odkril razloga za ponavljanje.

## Končna predaja

Pregled je končan. Vseh R01–R12 je preverjenih s primerjavo izvirnih zahtev,
specifikacije, kode, testov in zapisanih dokazov. Dodatni lastni brskalniški
scenarij je uspel. Konkretnih ugotovitev za popravek specifikacije ali
implementacije ni; obe zastavici v review.json sta false in findings je
prazen. Omejitve in izvor rezultatov so navedeni zgoraj in v review.json.
