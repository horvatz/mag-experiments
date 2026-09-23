# P10 — poročilo preverjanja

Naloga je izvedena samostojno po postopku A. Specifikacija je nastala pred
implementacijo; V2 dokumentira dopolnitev sledljivosti po preverjanju.
Začetek zagona: 2026-09-24 ob približno 01:16 CEST. Delo je zaključeno znotraj
20-minutne omejitve. Vse ročne spremembe so v `src/`, `tests/agent/`, `docs/agent/`.
Odvisnosti, strežnik, skupni tipi, konfiguracije in skupni testi niso spremenjeni.

## Rezultat

Implementirani so globalni lokalni vrstni red, premiki gor/dol, največ 20
razveljavitev, ponovitve, razveljavljiva vrnitev na začetni vrstni red, globalna
mesta in števci zgodovine. Preglednica in tabla uporabljata isto stanje.
Polja opravil in statusi se ne spreminjajo. Ni znanih neizpolnjenih zahtev R01–R12.

## Dejanski zagoni

| Ukaz / preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| `npm run check > docs/agent/check-initial.log 2>&1` | Izhod 0; ESLint, TypeScript, produkcijska gradnja in vseh 46 skupnih testov uspešnih. | [check-initial.log](check-initial.log) |
| `npm run check > docs/agent/check-final.log 2>&1` | Izhod 0; ESLint, TypeScript, Vite build in **53/53 testov uspešnih**; testni del 25,7 s. | [check-final.log](check-final.log) |
| `WEB_PORT=5193 API_PORT=3123 npm run dev` | Uspešen zagon lokalnega vmesnika na 5193 in API na 3123 za vizualni pregled. | Posnetki in visual-check.json spodaj. |
| `node tests/agent/visual-check.mjs` | Izhod 0; 1440×960 in 390×844, oba pogleda brez razširitve strani, viden fokus, brez napak JavaScript in zapisovalnih API zahtev. | [skripta](../../tests/agent/visual-check.mjs), [visual-check.json](visual-check.json) |
| Ogled štirih nastalih slik | Pregledani oba pogleda na obeh širinah. Ohranjeni Folio, slovenske oznake, stalni stolpci; mobilna orodna vrstica se prelomi, vsebina drsi znotraj preglednice/table. | [namizna preglednica](desktop-table.png), [namizna tabla](desktop-board.png), [mobilna preglednica](mobile-table.png), [mobilna tabla](mobile-board.png) |
| `npm run lint > docs/agent/lint-visual.log 2>&1` po dodani vizualni skripti | Izhod 0, brez napak; dodatni pregled vključuje tudi novo `.mjs` skripto. | [lint-visual.log](lint-visual.log) |
| Pregled kode z `rg` in branjem datotek | Nova funkcionalnost ne uporablja shrambe, `/__test/` ali zapisovalnega API-ja. Obstoječi neuporabljeni `updateTask` v api.ts ostaja izhodiščni pripomoček. | [taskOrder.ts](../../src/taskOrder.ts), [TaskList.tsx](../../src/TaskList.tsx), [App.tsx](../../src/App.tsx) |

Razčlenitev končnih 53 testov: 14 API + 12 izhodiščnih namiznih + 12
izhodiščnih mobilnih = 38 izhodiščnih; 4 razvojni namizni + 4 razvojni mobilni
= 8 P10 razvojnih; 7 dodatnih agentnih. A04 in A06 izrecno uporabljata širino
390 pik. Zagon uporablja že nastavljeni ločeni Chromium prek `connect`.

## Povezava zahtev, testov in rezultatov

Testi A01–A07 so v [P10.spec.ts](../../tests/agent/P10.spec.ts); polna imena in
rezultati vseh testov so v končnem dnevniku. Pogoji in povezave s kodo so tudi v
[specifikaciji](specification.md).

| Zahteva | Izvedeno preverjanje in ugotovitev |
| --- | --- |
| R01 | D01 in A01: izvorni vrstni red sledi polju, tudi pri 15 opravilih, nesortiranih ID-jih in enakih naslovih; preverjena vsa mesta. A01 vključuje ID s presledki, Unicode, poševnico, narekovaji in %. Uspešno. |
| R02 | D01/D04, A01/A04: premik dol s tipkovnico in gor na tabli zamenjata globalna soseda; A01 primerja vsa preostala polja prikazanih vrstic pred/po premiku. Uspešno. |
| R03 | D01, A02: prvi gor in zadnji dol sta disabled; ponovljeni DOM `click()` ne spremenijo zgodovine. A07 neposredno preveri zavrnitev robnih in neznanih ID-jev v reducerju. Uspešno. |
| R04 | D02, A02/A03: po več premikih vsaka razveljavitev obnovi točno celotno pričakovano zaporedje; preverjeni števci in stanje gumbov. Uspešno. |
| R05 | D02, A02/A03: več ponovitev vrne vse shranjene permutacije v pravilnem zaporedju; primerjava celotnih polj ID-jev zazna izgubo ali podvojitev. Uspešno. |
| R06 | D03, A02/A07: nova veljavna veja počisti redo; robni premiki, neznan ID in reset pri izvorni permutaciji ohranijo redo. Uspešno. |
| R07 | A03: 26 opravil, 25 različnih veljavnih premikov. Možnih je natanko 20 razveljavitev do stanja po petem premiku ter vseh 20 ponovitev. Po vsakem koraku preverjeno celotno zaporedje in števci. Uspešno. |
| R08 | D04, A02/A03/A07: reset je eno novo dejanje, počisti redo, ga je mogoče razveljaviti/ponoviti; pri izvorni permutaciji je disabled in brez učinka. Reset pri polni zgodovini ohrani mejo 20. Uspešno. |
| R09 | D04, A04: premik med različnima statusoma spremeni globalna mesta, stolpca ostaneta ista; naslednji premik med istima statusoma spremeni relativni vrstni red kartic. Preglednica prikazuje globalno zaporedje. Uspešno. |
| R10 | A04: pogled/podrobnosti ohranijo hkrati U=1 in R=1. A05: menjava projekta, vrnitev z Nazaj, ponoven obisk in osvežitev v podrobnostih table vrnejo izhodišče z U=R=0. Izhodiščni testi nalaganja/navigacije uspešni. |
| R11 | A02/A03/A06 in D03: natančno besedilo statusa in enabled/disabled po vsakem koraku; oba prazna projekta in eno opravilo ostanejo uporabni v obeh pogledih, brez dovoljenih premikov. Uspešno. |
| R12 | A01/A04: polja, podatki podrobnosti (vključno z datumom 2028-02-29), statusi in števci nespremenjeni. A01/A02/A03/A04/A06 beležijo API zapise: nič. Izhodiščni testi in ogled preverijo Folio in uporabo na mobilnem zaslonu. Uspešno. |

## Omejitve in neuspeli koraki okolja

- Poskus avtomatizirane tekstovne spremembe s `python3` ni stekel, ker v okolju
  manjka veljavna pot Xcode Command Line Tools (`xcrun: invalid active developer
  path`). Datoteka s tem poskusom ni bila spremenjena; ista sprememba je bila
  uspešno izvedena z že nameščenim Node.js. Okolje ni bilo spreminjano.
- Npm opozarja na obstoječo nastavitev `http-proxy`, Playwright pa na hkratni
  `NO_COLOR`/`FORCE_COLOR`. Nobeno opozorilo ni preprečilo preverjanja.
- Končni skriti testi niso dostopni in niso bili izvedeni. Ni formalnega dokaza
  za vsa možna zaporedja, temveč predikati, pregled reducerja in konkretni testi.
  Največji preverjeni seznam ima 26 opravil; zmogljivost pri zelo velikih seznamih
  ni bila merjena. Podatki v vmesniku ostajajo iz javnega API-ja; testni nadzor
  in nadzorovani odgovori GET se uporabljajo izključno v testih.
- Preverjen je Chromium. Bralnik zaslona, drugi brskalniki in zunanje sočasne
  spremembe brez osvežitve niso bili posebej preverjeni. Slednje je zunaj obsega
  naloge; obstoječe regresije nalaganja so uspešne.
