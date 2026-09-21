# Neodvisni pregled P10

Končna predaja: vseh R01–R12 je primerjanih z izvirnimi navodili,
specifikacijo, izvedbeno kodo, razvojnimi in lastnimi testi ter verification.md.
Ni konkretne ugotovitve za spremembo specifikacije ali implementacije.

| Zahteva | Pregledana izvedba in dokazila | Presoja |
| --- | --- | --- |
| R01 | initialOrder kopira prejeti vrstni red; ProjectTasks preslika po ID; globalna mesta v obeh pogledih. S01 uporablja enake naslove in posebne ID-je. | Skladno. |
| R02 | orderReducer zamenja samo sosednja ID-ja v kopiji; oba pogleda uporabljata isti ukaz. D01, S01 in S06. | Skladno. |
| R03 | Zaščita index/neighbor vrne isti objekt; disabled iz globalnega mesta. S03 preverja ponovljene neveljavne ukaze. | Skladno. |
| R04 | move shrani celotno present; undo prenese trenutno permutacijo v redo. D02 in S02. | Skladno. |
| R05 | redo bere zadnji posnetek in vrne present v undo; nespremenljivi posnetki. S02 in S04 preverjata celotna zaporedja. | Skladno. |
| R06 | Brisanje redo se zgodi šele po preverjanju veljavnosti premika. D03 in S03. | Skladno. |
| R07 | remember uporablja slice(-20); 21 različnih premikov, 20 undo in redo v S04, tudi ponastavitev pri kapaciteti. | Skladno. |
| R08 | reset shrani prejšnji present, obnovi original in izprazni redo; no-op vrne isti objekt. D04, S03 in S05. | Skladno. |
| R09 | Tabla filtrira urejeni seznam v tri stalne stolpce, globalna mesta izračuna pred filtriranjem. D04 in S06. | Skladno. |
| R10 | ProjectTasks ohranja reducer pri spremembi pogleda/podrobnosti; ključ projekta ga ponovno namesti. S06 preverja oba sklada, vrnitev na projekt in osvežitev. Pregledovalec je dodatno preveril napako podrobnosti in ponovni poskus z obema nepraznima skladoma. | Skladno; dodatne štiri preverbe uspešne. |
| R11 | Števec neposredno bere oba sklada; gumbi disabled pri ničli. Prazen seznam še vedno izriše kontrole; S07 pokriva oba prazna/enojna projekta. | Skladno. |
| R12 | Reducer hrani samo ID-je, ni klicev updateTask ali shrambe; kontrole so zunaj povezav. S08 in regresije; pregledani slogi in štirje posnetki Folio. | Skladno. |

## Izvor preverjanj

Pregledovalec je sam prebral navedeno kodo in teste ter vizualno pregledal
desktop-table.png, desktop-board.png, mobile-table.png in mobile-board.png.
Vidne postavitve ustrezajo docs/dizajn.md; mobilna orodna vrstica se prelomi,
preglednica in tabla imata notranje drsenje.

Implementerjev docs/agent/check.log vsebuje uspešen lint, preverjanje tipov,
gradnjo in 53 uspešnih testov: 38 osnovnih, 8 razvojnih in 7 lastnih.
To je dokazilo implementerjevega zagona, ne ponovni zagon pregledovalca.
Prebrani testi in njihova imena se ujemajo s sledljivostjo v verification.md.

## Dodatno preverjanje pregledovalca

Izvedena je skripta Node prek standardnega vhoda, z @playwright/test in
chromium.connect. Uporabljena sta lokalna strežnika 5193/3123, zagnana z
`WEB_PORT=5193 API_PORT=3123 npm run dev`. Brskalnik je dobil nadzorovane GET
odgovore za javni API; ni uporabljal testnih kontrol. Skripta ni spreminjala
kode ali testnih datotek. Po preverjanju so konteksti zaprti in strežnik ustavljen.

V vsakem primeru so štiri opravila z enakimi naslovi, ID-ji s Unicode,
presledki, poševnico in narekovaji ter ID __proto__, z veljavnim datumom
2028-02-29. Po dveh premikih in razveljavitvi sta sklada U=1/R=1.
Odpiranje podrobnosti vrne 503, ponovni poskus uspe, Escape jih zapre.
Preverjeni so točen vrstni red, globalna mesta, relativni red stolpcev,
ohranitev U=1/R=1, nato pravilna ponovitev in obe razveljavitvi do izvora.
Preverjeni so tudi pravilne podrobnosti po ID, števci stanj, omogočenost
gumbov, nič zapisov na API, nič napak strani in odsotnost razširitve cele strani.

| Širina | Pogled | Izid skripte |
| --- | --- | --- |
| 1440 | Preglednica | PASS |
| 1440 | Tabla | PASS |
| 390 | Preglednica | PASS |
| 390 | Tabla | PASS |

Končni zagon skripte je vrnil izhodno kodo 0 in štiri rezultate PASS.
Prvi poskus skripte se je ustavil pri pričakovanju napake: simulacija je
vrnila 503 samo enkrat, naslednji GET pa je že uspel. Razvojni StrictMode
ponovi učinek nalaganja. Simulacija je zato popravljena na stalen 503 do
izrecnega ponovnega poskusa; aplikacija je ostala nespremenjena. Ta prvi
poskus ni štet kot uspešen test ali ugotovitev napake v aplikaciji.

## Omejitve

Skriti končni testi niso dostopni, poljubna vhodna domena ni izčrpno preverjena.
Javni internet je blokiran, uporaba brskalnika zahteva chromium.connect
z wsEndpoint iz task/browser.json. Gitova omejitev z manjkajočim xcrun je
navedba implementerja; pregledovalec Git ni uporabljal.

Celotnega npm run check pregledovalec ni ponovil, ker prebrana dokazila in
koda niso pokazali razloga za ponavljanje že opravljenih preverjanj.
Zgornje štiri dodatne preverbe so izvedene neodvisno in zapirajo izrecno
navedeno vrzel glede napake podrobnosti z obema nepraznima skladoma.
Pred dodatnim preverjanjem je bila shranjena vmesna predaja in preverjen čas.
Končna predaja je zaključena več kot 60 sekund pred rokom faze.
