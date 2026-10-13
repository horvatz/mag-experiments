# Specifikacija P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio trenutno prikaže opravila v zaporedju, ki ga vrne javni API za izbrani projekt. Uporabnik želi začasno spremeniti vrstni red z premiki po sosedih, spremembe razveljaviti in ponoviti, ter se vrniti na izvorno zaporedje. Spremembe so samo lokalne permutacije obstoječih opravil; ne shranjujejo se na strežnik in ne spreminjajo podatkov opravil.

## Vhodi, dejanja in izidi

- Vhod: `GET /api/projects/{projectId}/tasks` vrne poljubno število opravil s tipi iz `shared/types.ts`.
- Izvorno zaporedje `O = [id_1, …, id_N]` je enako zaporedju v odgovoru. Vsak ID je enkraten.
- Trenutno zaporedje `C` je vedno permutacija `O`. Zgodovina `U = [P_1, …, P_m]`, `m ≤ 20`, vsebuje prejšnje celotne permutacije za razveljavitev; zgodovina `R = [Q_1, …, Q_r]` vsebuje ponovitve.
- `Premakni id gor`: če `index(id) > 0`, zamenja sosedna ID-ja; sicer dejanje nima učinka.
- `Premakni id dol`: če `index(id) < N-1`, zamenja sosedna ID-ja; sicer dejanje nima učinka.
- `Razveljavi premik`: veljavno, če `m > 0`; `C` se shrani v `R`, zadnji `P` postane novi `C`.
- `Ponovi premik`: veljavno, če `r > 0`; `C` se shrani v `U`, zadnji `Q` postane novi `C`.
- `Začetni vrstni red`: veljavno, če `C ≠ O`; trenutni `C` se shrani v `U`, `C := O`, `R := []`.
- Vsak nov veljaven premik ali veljaven reset počisti `R`; neveljavno dejanje na robu ne spremeni zgodovine.
- Projekt ima svoje stanje; preklop projekta ali osvežitev začne znova z API zaporedjem. Preklop pogleda in podrobnosti stanja ne resetirata.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni prikaz uporabi `O`; mesto `rank(id) = index_C(id) + 1`; enaki naslovi ne vplivajo na ID. | Skupni P10 testi in lastni test za izvorno zaporedje ter mesta. |
| R02 | `move(id, up)` zamenja `C[k]` in `C[k-1]`; `move(id, down)` zamenja `C[k]` in `C[k+1]`; druga polja ostanejo nespremenjena. | Razvojna in lastna Playwright preverjanja ID-jev, stanj, oseb in rokov. |
| R03 | Gumba sta onemogočena za `k = 0` oziroma `k = N-1`; neveljavno dejanje ne spreminja `C`, `U` ali `R`. | Skupni P10 test in lastni test za obe meji. |
| R04 | Veljaven premik naredi `U := append(U, C)` predno spremeni `C`. Razveljavi obnovi zadnji `P`. | Skupni P10 test in lastni test več razveljavitev. |
| R05 | Razveljavitev shrani `C` v `R`; ponovitev shrani `C` v `U` in obnovi zadnji `Q`. Zaporedji ostaneta brez podvajanj ID-jev. | Lastni test več zaporednih razveljavitev in ponovitev. |
| R06 | Nov veljaven premik po razveljavitvi izprazni `R`; neveljaven robni premik `R` ohrani. | Skupni P10 test in lastni test neveljavnega premika po razveljavitvi. |
| R07 | `m ≤ 20`; ob 21. veljavnem premiku se `P_1` zavrže. `R` obvladuje vse trenutno razveljavljene korake. | Lastni test z 21 premiki, razveljavitvami in ponovitvami. |
| R08 | Reset je onemogočen za `C = O`; sicer ustvari eno razveljavljivo dejanje in počisti `R`. | Skupni P10 test in lastna preverjava onemogočenega gumba. |
| R09 | Preglednica je ureena po `C`; tabla ureja kartice znotraj stalnih stolpcev stanj, mesta na karticah so globalna, premiki uporabljajo soseda v `C`. | Skupni in lastni test preklopa pogleda. |
| R10 | Preklop pogleda, odpiranje in zapiranje podrobnosti ohranita `C`, `U`, `R`; menjava projekta ali osvežitev resetira na njegovo izhodišče. | Lastni test navigacij in projektov; osvežitev preverimo z obstoječim brskalnikom. |
| R11 | Status ima točno `Razveljavitve: m. Ponovitve: r.`; gumba sta onemogočena pri `0`; prazni projekt in projekt z enim opravilom nimata veljavnih premikov. | Skupni P10 test in lastna testova za prazen in eno opravilo. |
| R12 | Vse operacije so permutacije istih ID-jev; brez zapisov na API in sprememb polj; Folio ostane prilagodljiv. | Lastni test odsledi API zapisov in vsebine ter skupni `readonly`. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej zgornjo tabelo. | `tests/agent/P10-agent.spec.ts` ter skupni razvojni testi. | `src/taskOrder.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Popravljeno po dejanskem zagonu v `docs/agent/verification.md`. |

## Zgodovina popravkov specifikacije

- 9. 10. 2026: prvotna specifikacija po predlogi.
- 9. 10. 2026: po implementaciji pojasnjena številka zgodovine pri resetu (`undo` se poveča za ena) in dodani lastni preverjanji za osvežitev ter prikaz datuma; pravila R01–R12 se niso spremenila.

## Odprta vprašanja in omejitve

- Ni znanih odprtih vprašanj.
- Izvedena preverjanja so omejena na lokalni testni strežnik, nadzorovane API odgovore in nameščen Chromium.
- Trajna shramba vrstnega reda ni zahtevana in ni izvedena.
