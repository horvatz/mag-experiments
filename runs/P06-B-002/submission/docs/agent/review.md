# Neodvisni pregled P06

Merilo so izvirne R01–R12 v task/instructions.md. Pregledani so specifikacija, njena zgodovina, izvorna koda, razvojni in lastni testi ter verification.md, check.log in visual-check.json. Specifikacija pokriva vseh dvanajst zahtev; predlagani scenariji so jasno ločeni od implementerjevih dejanskih rezultatov.

## Statična presoja po zahtevah

- **R01:** ProjectView bere opravila projektnega API-ja; createCsv uporablja filter brez sortiranja. CsvExport privzeto izbere CSV_COLUMNS, podpičje in all. Dokazi implementerja: D01, A03, A05. Konkretnega odstopanja ni.
- **R02:** CSV_COLUMNS določa vseh sedem kolon; createCsv izbira po tem seznamu za glavo in vsako vrstico. Vrstni red klikov zato ne vpliva na vrstni red izvoza. Dokazi: D02, A01, A04. Konkretnega odstopanja ni.
- **R03:** CsvExport onemogoči gumb brez izbranih kolon; createCsv dodatno vrne null. Ponovni izbor se računa skupaj s številom ustreznih vrstic. Dokazi: A01, A04, A05. Konkretnega odstopanja ni.
- **R04:** Vsi štirje filtri se uporabljajo samo v CsvExport/createCsv. Preglednica, tabla, števec in povzetki dobijo celoten tasks. Prazen rezultat onemogoči prenos. Dokazi: D02, A04, A05, A07. Konkretnega odstopanja ni.
- **R05:** createCsv doda U+FEFF; Blob in povezava download ustvarita lokalni folio-<projectId>.csv brez target ali omrežnega klica. Dokazi: D01, A03, A06. Konkretnega odstopanja ni.
- **R06:** Select ima natanko ločili ; in ,. Funkcija quote navede vse glave in vrednosti ter podvoji vsak notranji narekovaj. Dokazi: D02/D03, A01, A04, A06. Konkretnega odstopanja ni.
- **R07:** createCsv združi zapise s CRLF in doda končni CRLF. quote ne odstranjuje notranjih CR, LF ali ločil. Dokazi: D01/D03, A01, A03. Konkretnega odstopanja ni.
- **R08:** csvValue uporablja natančen izraz /^[ \t\r\n]*[=+@-]/ in apostrof pripne pred izvirni niz. Uporabi se za vsako podatkovno kolono; glava uporablja le quote. Dokazi: D03, A01, A02. Konkretnega odstopanja ni.
- **R09:** Pretvornik bere task[column] neposredno, brez trim ali formatiranja; status in dueDate sta izvirna. Dokazi: D03, A01, A03, A06. Konkretnega odstopanja ni.
- **R10:** CsvExport je pred vejo preglednica/tabla in ima stabilen življenjski cikel; sprememba view ne ponastavi njegovega stanja. Dokazi: D04, A03, A06. Konkretnega odstopanja ni.
- **R11:** ProjectView ima key={project.id}; menjava projekta in reload ponovno ustvarita privzeto stanje CsvExport. download ob vsakem dejanju uporabi trenutni render nastavitev. Dokazi: A05, A06. Konkretnega odstopanja ni.
- **R12:** Pretvornik uporablja nemutirajoče filter/map. Izvozne kontrole ne kličejo API-ja; obstoječi bralni prikazi, atributi in oznake so ohranjeni. Novi slogi uporabljajo Folio spremenljivke in prelamljanje. Dokazi: A01/A03/A04/A07, D04, 38 regresij ter predani posnetki in meritve. Konkretnega odstopanja ni.

## Izvor dokazov in omejitve

Implementerjev dnevnik navaja uspešen lint, TypeScript, Vite in 53 testov (38 osnovnih, 8 razvojnih, 7 lastnih). Pregledovalec je dnevnik in testno kodo prebral; zagona še ni ponovil. Predane meritve kažejo širino strani 1440 oziroma 390 px v obeh pogledih. Git status je tudi pri pregledovalcu odpovedal zaradi manjkajočega xcrun/CommandLineTools. Skriti končni testi niso dostopni. Javni internet je blokiran. Pregledovalec ne spreminja kode, specifikacije, infrastrukture ali testov.

## Neodvisno izvedeno dopolnilno preverjanje

Ročna skripta Node/Playwright se je povezala prek chromium.connect(wsEndpoint) iz task/browser.json na lokalni strežnik 5193/3123. API GET odgovori so bili nadzorovani s page.route; aplikacija ni uporabljala testnih kontrol. Pričakovani CSV je bil zapisan neodvisno, brez uvoza produkcijskega pretvornika. Vse štiri skupine preverjanj so uspele:

- R01/R05–R09: dejanski prenos z drugim projektnim ID-jem; točni UTF-8 bajti, BOM, CRLF, notranji CR/LF/CRLF, narekovaji, prazna vrednost, Unicode, formule in negativna NBSP/VT primera; brez omrežnega prenosa ali nove strani.
- R02–R04/R11: obrnjeni kliki kolon ohranijo fiksni vrstni red; brez kolon/prazni filter onemogočita izvoz; zaporedni prenos uporabi nove nastavitve; prikaz ostane celoten.
- R10/R12: nespremenjeni bajti in nastavitve med preglednico/tablo; širina celotne strani brez preliva pri 390 in 1440 px v obeh pogledih.
- R11/R12: prazni drugi projekt, vrnitev in reload ponastavijo nastavitve; brez zapisovalnih API zahtev in napak strani.

## Končna presoja

Vseh R01–R12 je pregledanih; ni konkretnih ugotovitev za specifikacijo ali implementacijo. Obe zastavici potrebnih sprememb sta false. Neodvisna dopolnilna skripta je končala z izhodno kodo 0; celotnega npm run check nisem ponavljal, ker za ponovitev uspešnega predanega zagona ni bilo konkretnega razloga. Pregledal sem tudi predana posnetka 390-table.png in 1440-board.png ter slogovna pravila Folio; nove kontrole se vizualno ujemajo z obstoječim videzom. Lastne meritve širine pri 390 in 1440 px v obeh pogledih so uspele. Predanih posnetkov nisem ponovno zajemal.

Omejitve: Celotnega npm run check nisem ponovil; 53 uspešnih testov ter uspešen lint, tipi in gradnja so dokazani v prebranem implementerjevem check.log. Skriti končni testi niso dostopni. Preverjanje je omejeno na Chromium; drugih brskalnikov, zunanjih pregledničnih programov in sistemskega preklica prenosa nisem preveril. Git status ni deloval zaradi manjkajočega xcrun/CommandLineTools; primerjava sprememb prek Gita ni bila mogoča. Javni internet je blokiran.

Končni strojno berljivi zapis je review.json. Koda, specifikacija in testi niso bili spremenjeni.
