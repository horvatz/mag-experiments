# Specifikacija: lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici in na tabli. Uporabnik želi
lokalno preurejati vrstni red opravil, razveljaviti in ponoviti posamezne premike ter
v enem koraku vrniti izvorno zaporedje. Vrstni red velja globalno za celoten projekt,
ne glede na razvrstitev kartic po stanjih na tabli.

## Vhodi, dejanja in izidi

- Vhod so projekti in opravila iz javnega API-ja `/api/`; polja so enaka izhodišču.
- Dejanja so `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`,
  `Ponovi premik` in `Začetni vrstni red`.
- Vrstni red, status, naslov, opis, odgovorna oseba in rok ostanejo enaki, razen
  lokalnega zaporedja celotnih opravil.
- Novo funkcionalnost se ne shranjuje trajno in ne uporablja testnih kontrol `/__test/`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `T = [t₁ … tₙ]` je permutacija prejetih ID-jev po zaporedju odgovora; `rank(tᵢ) = i + 1`, naslovi ne vplivajo na povezave. | Razvojni in lastni testi preberejo `data-task-id` in `Mesto opravila`. |
| R02 | `move(tᵢ, up)` zamenja `tᵢ` z `tᵢ₋₁`; `move(tᵢ, down)` zamenja `tᵢ` z `tᵢ₊₁`. Polja ostanejo nespremenjena. | Test premika in preverjenih podatkov vrstic/kartic. |
| R03 | `i = 1 ∧ direction = up` ali `i = n ∧ direction = down` sta onemogočena; sicer pri neveljavnem ID-ju dejanje vrne nespremenjeno stanje. | Test onemogočenih gumbov in robnega primera. |
| R04 | Velik premik doda trenutno permutacijo v `undo`, nato nastavi novo. `undo` zadnji element premakne v `redo` in obnovi predhodno permutacijo. | Razvojni test D02. |
| R05 | `redo` zadnji element `redo` obnovi in doda trenutno permutacijo v `undo`; večkratna uporaba ohrani enolične ID-je. | Lastni test več razveljitev in ponovitev. |
| R06 | Velik premik nastavi `redo = []`; neveljaven oz. onemogočen robni premik ne spremeni zgodovin. | Razvojni test D03 in lastni robni test. |
| R07 | Po vsakem velikem premiku velja `|undo| ≤ 20`; ob 21. premiku se najstarejši element zavrže. | Lastni test 21 premikov in kasnejših ponovitev. |
| R08 | `reset` obnovi izvorno permutacijo, doda trenutno v `undo` in počisti `redo`; ob enakem vrstnem redu je gumb onemogočen. | Razvojni test D04 in lastni test izvornega stanja. |
| R09 | Preglednica prikazuje globalna mesta; tabla razvrsti kartice po globalnem redu znotraj stalnih stolpcev stanj, gumb za premik pa deluje na globalnega soseda. | Razvojna testa D01 in D04. |
| R10 | Preklop pogleda in podrobnosti ohranita `undo` in `redo`; menjava projekta ali osvežitev ponastavita na odgovor strežnika. | Lastna testa za preklop/podrobnosti in projekt/osvežitev. |
| R11 | Stanje `Razveljavitve: U. Ponovitve: R.` je usklajeno; gumba sta onemogočena pri `0`; prazen projekt in eno opravilo sta uporabna brez dovoljenega premika. | Lastna testa za števce ter prazen/eno opravilo. |
| R12 | Vsako stanje je permutacija istih ID-jev; ni zapisov na API, statusi, števci in podrobnosti ostanejo nespremenjeni. | Razvojni test D04 ter lastni test dostopnosti in odsotnosti zapisov. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- | --- |
| R01 | Globalni vrstni red po prejetem polju | D01; lastni test `R01–R06` | `src/App.tsx`: stanje `orderedTasks` in preglednica | Zeleno v `docs/agent/verification.md`. |
| R02 | Zamenjava globalnega soseda | D01; lastni test `R01–R06` | `src/App.tsx`: `moveTask` | Zeleno v `docs/agent/verification.md`. |
| R03 | Onemogočena robova in neveljavni ID | D01; lastni test `R03, R06 and R07` | `src/App.tsx`: pogoji `disabled` in `moveTask` | Zeleno v `docs/agent/verification.md`. |
| R04 | Veljaven premik doda prejšnjo permutacijo | D02; lastni test `R01–R06` | `src/App.tsx`: `undoStack` in `undoMove` | Zeleno v `docs/agent/verification.md`. |
| R05 | Več razveljavitev in ponovitev | lastni test `R01–R06` | `src/App.tsx`: `undoMove` in `redoMove` | Zeleno v `docs/agent/verification.md`. |
| R06 | Velik premik počisti ponovitve, rob pa ne | D03; lastna testa `R03, R06 and R07` in `R06` | `src/App.tsx`: `setRedoStack([])` in zaščita `moveTask` | Zeleno v `docs/agent/verification.md`. |
| R07 | Največ 20 razveljavitev | lastni test `R03, R06 and R07` | `src/App.tsx`: `stack.slice(-19)` | Zeleno v `docs/agent/verification.md`. |
| R08 | Razveljavljiv povratek na izhodišče | D04; lastni test `R08` | `src/App.tsx`: `resetOrder` | Zeleno v `docs/agent/verification.md`. |
| R09 | Globalna mesta in stolpci table | D01, D04; lastni test `R09 and R10` | `src/TaskBoard.tsx`: `globalRanks` in razvrstitev | Zeleno v `docs/agent/verification.md`. |
| R10 | Ohranitev ali ponastavitev lokalnega stanja | lastni test `R09 and R10` | `src/App.tsx`: `ProjectView` in `useEffect` | Zeleno v `docs/agent/verification.md`. |
| R11 | Števci, prazen in enoopravilen projekt | lastna testa `R11` in `R11 and R12` | `src/App.tsx`: števec zgodovine in prazna stanja | Zeleno v `docs/agent/verification.md`. |
| R12 | Permutacija ID-jev brez zapisov | D04; lastni test `R11 and R12` | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Zeleno v `docs/agent/verification.md`. |

## Zgodovina popravkov

- 2026-10-13: Ustvarjena specifikacija.
- 2026-10-13: Dopolnjena sledljivost z dejanskimi testi; dodan robni primer, da onemogočen premik ne počisti zgodovine ponovitev.

## Odprta vprašanja in omejitve

- Ne dodajamo novih API-jev in trajne shrambe, ker naloga določa lokalno trenutno stanje.
- Menjava projekta in osvežitev sta definiran kot ponastavitev na izhodišče strežnika.
- Vsi testi tečejo proti lokalnemu strežniku in namenskemu Chromiumu iz `task/browser.json`.
