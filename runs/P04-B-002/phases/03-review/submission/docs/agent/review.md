# Neodvisni pregled P04

Pregledane so izvirne zahteve R01–R12, obvezna predloga, specifikacija, izvorna koda, razvojni in lastni testi, osnovni uporabniški testi ter `verification.md` in `check.log`. Funkcionalnega odstopanja nisem ugotovil. Potrebna je dokumentacijska dopolnitev specifikacije, opisana v `review.json`.

## Pregled po zahtevah

V tej tabeli »skladno« pomeni rezultat mojega pregleda kode in testnih trditev. Navedeni uspešni zagoni so dokazila implementerja, ne moji ponovni zagoni.

| Zahteva | Neodvisno pregledana izvedba | Pregledani testi in dokazila | Sklep |
| --- | --- | --- | --- |
| R01 | `taskSorting.ts`: štiri privzete vrednosti in kopija vhodnega polja pri original; `App.tsx`: začetno lokalno stanje. | D01, A04. | Skladno. |
| R02 | Normalizacija v zaporedju NFD, odstranitev samo U+0300–U+036F, male črke; primerjava z `<` in `>`. | D01, A01 z leksikografskimi številkami, sestavljenimi znaki, znakom zunaj območja in UTF-16 parom; A02. | Skladno. |
| R03 | Izrecni rangi todo=0, in_progress=1, done=2. Leksikografska primerjava veljavnih, enako dolgih YYYY-MM-DD ustreza koledarskemu redu. | D02, D03, A02 z različnimi leti in prestopnim datumom. | Skladno. |
| R04 | Smer pomnoži samo izid primerjave ključa; izvorni indeks ostane nespremenjen. Končno polje se ne obrača. | A01, A02; pregled zadnjega člena primerjalnika. | Skladno. |
| R05 | Sekundarna primerjava se izvede samo pri primarni enakosti in ključu, različnem od none; uporablja svojo smer. | D02, A02. | Skladno. |
| R06 | Popolno enakost razreši izvorni indeks; enaka ključa ne ustvarita novega obrata; original vrne kopijo pred obema primerjavama. | A01–A03, v A03 vseh 100 kombinacij nastavitev. | Skladno. |
| R07 | `App.tsx` deli `sortedTasks` med oba pogleda; `TaskBoard.tsx` filtrira isto polje v stalno določenih treh stolpcih. | D03, A04, A05. | Skladno. |
| R08 | Stanje je v `ProjectView`, katerega identiteta je vezana na projekt. Pogled in podrobnosti ne zamenjajo te komponente. | A04 preveri oba pogleda in odpiranje podrobnosti z enakimi naslovi. | Skladno. |
| R09 | `key={project.id}` ponastavi stanje ob menjavi projekta; osvežitev ustvari novo stanje. Pregled `navigation.ts` in iskanje shrambe ne pokažeta shranjevanja nastavitev. | A04 preveri vse štiri vrednosti po menjavi in osvežitvi. | Skladno. |
| R10 | Gumb posreduje celoten `defaultTaskSort`; prazno polje je veljaven prikaz s kontrolami; primerjalnik sprejme 0/1 elementov. | D04, A03 preveri vse kombinacije za 0/1 elementov; A06 preveri vse možnosti kontrol v vmesniku. | Skladno. |
| R11 | Primerjalnik razvršča novo polje ovojnih objektov in vrne iste objekte opravil; števci ostanejo iz izvornega polja. Spremembe kontrol kličejo samo `setSort`. Pripravljeni `updateTask` nima klicatelja v vmesniku. | A03 zamrzne vhod; D04 in A04–A05 preverijo odsotnost zapisov; A04 tudi števce. | Skladno. |
| R12 | Preslikave in povezave uporabljajo ID, podatkov ne krajšajo ali odstranjujejo. `TaskDetails.tsx` bere po ID. Oznake pogledov, stolpcev, števcev in `data-task-id` ostanejo prisotne. Kontrole imajo oznake, prelome in obstoječe slogovne spremenljivke. | Osnovni testi, A04 za enake naslove, A05 za 14 opravil in širino 390 px. Pregled obstoječega mobilnega posnetka glede na potrjeni posnetek Folio. | Skladno v pregledanem obsegu. |

## Ugotovitev za specifikatorja

Specifikacija vsebuje pravilne sprejemne pogoje vseh dvanajstih zahtev, vendar je razdelek izvedbe ostal začetni osnutek brez konkretnih povezav na kodo in dokaze. Manjkajo tudi zahtevani predikati. Implementer je oboje smiselno dopolnil v `verification.md`; specifikator naj zaključi dokument s povezavami na te razdelke ali vključitvijo vsebine ter ohrani zgodovino dopolnitve. To ni ugotovljena napaka uporabniškega delovanja.

## Dokazi in omejitve

- Sam sem prebral `check.log`: vsebuje uspešne ESLint, TypeScript, Vite in **52 passed (20.6s)**; razčlenitev je 38 osnovnih, 8 razvojnih in 6 lastnih testov. Vsebina se ujema z `verification.md` in pregledanimi testi. Zagon je izvedel implementer.
- Testov nisem ponavljal: pregled ni pokazal konkretnega razloga za ponovitev in ugotovitev zahteva dokumentacijski popravek.
- Sam sem vizualno primerjal že ustvarjeni `test-results/p04-mobile-board.png` z `docs/predogled/tabla-telefon.png` ter prebral `docs/dizajn.md` in sloge. Ohranjeni so Folio, navigacija, barve, kartice in notranje drsenje; nove kontrole so na prikazanem mobilnem posnetku razporejene v dve koloni. Novega posnetka ali interaktivnega namiznega pregleda nisem izvedel.
- Skriti končni testi niso dostopni. Javni internet je po navodilih blokiran; uporabljene so bile samo datoteke izvoza. Infrastrukture, odvisnosti, skupnih testov, kode ali specifikacije nisem spreminjal.
- Brskalnika nisem zaganjal. Pregledana skupna Playwright konfiguracija uporablja predpisani `wsEndpoint` iz `task/browser.json`; neposredni `chromium.launch()` po navodilih ni podprt. Implementerjevo poročilo o nedelujočem sistemskem Git/xcrun ostaja njegovo poročilo; sam ga nisem preverjal.

Končna strojno berljiva predaja je `review.json`.
