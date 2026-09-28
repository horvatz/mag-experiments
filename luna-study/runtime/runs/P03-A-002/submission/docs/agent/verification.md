# Preverjanje P03

## Izvedeni ukazi in rezultat

Preverjanje je bilo izvedeno 27. 9. 2026 v lokalnem okolju te naloge.

| Ukaz | Rezultat |
| --- | --- |
| `npm run check` | Uspešno; ESLint brez napak, `tsc --noEmit` uspešen, Vite produkcijska gradnja uspešna, Playwright **54/54** uspešnih. |
| Vključeni API testi | 14/14 uspešnih (`tests/api.spec.ts`). |
| Vključeni izhodiščni UI testi | 12/12 namiznih in 12/12 mobilnih uspešnih (`tests/baseline.spec.ts`). |
| Razvojni testi P03 | 4/4 namiznih in 4/4 mobilnih uspešnih (`tests/development/P03.spec.ts`). |
| Lastni testi | 8/8 uspešnih (`tests/agent/P03.spec.ts`, projekt `agent`). |

Prvi celotni zagon je imel 50 uspešnih in 3 neuspešne teste: trije novi
scenariji so predpostavili opis in število opravil, ki ju njihova razvojna
testna priprava ne zagotavlja, ter izvorni vrstni red pri tabeli, ko je bil
vklopljen pogled table. Popravljene so bile te predpostavke v lastnih testih;
izvedba aplikacije se zaradi tega ni spreminjala. Naslednji ciljni zagon
lastnih testov je uspel, zadnji `npm run check` pa je uspešno zaključil vseh
54 testov z zadnjo različico testov.

## Sledljivost zahtev

Predikati in popolni sprejemni pogoji so v [specifikaciji](specification.md).
Spodaj so navedeni scenariji, ki so dejansko tekli v zadnjem uspešnem zagonu.

| Zahteva | Izvedeno preverjanje in dokaz | Rezultat |
| --- | --- | --- |
| R01 | D01 `default list and literal normalized search`; preveri vse začetne ID-je. | Uspešno; zadnji `npm run check`. |
| R02 | D01; `search normalizes diacritics, checks every text field, and treats punctuation literally`; `search words can match ID, title, description, and assignee together`. | Uspešno; zadnji `npm run check`. |
| R03 | Lastna iskalna scenarija preverita več besed v drugem vrstnem redu, ločila, beline in večpoljni zadetek. | Uspešno; zadnji `npm run check`. |
| R04 | D02 `combined filters and view persistence`; lastni `project navigation and reload reset local filters…` sočasno izbere besede, stanje in osebo; ločen primer preveri natančno ime. | Uspešno; zadnji `npm run check`. |
| R05 | `assignee options come from the whole project and compare exact names` preveri skrito ime v opcijah, unikatnost in izbor; ločen scenarij primerja `Črt` in `Crt`; projektni preklop preveri nove možnosti. | Uspešno; zadnji `npm run check`. |
| R06 | D02 preklopi pogled z aktivnimi filtri; `filtered counts and board columns use the same subset…` preveri ID-je in števce stolpcev. | Uspešno; zadnji `npm run check`. |
| R07 | `project navigation and reload reset local filters…` preveri ponastavitev vseh kontrol in seznam drugega projekta. | Uspešno; zadnji `npm run check`. |
| R08 | Isti lastni scenarij preveri URL, dolžino `localStorage`/`sessionStorage` in ponastavitev po osvežitvi. | Uspešno; zadnji `npm run check`. |
| R09 | D04 preveri besedilo števila; `filtered counts and board columns use the same subset…` preveri povzetek stanj in zaključeni števec; tabla preveri število v stolpcih. | Uspešno; zadnji `npm run check`. |
| R10 | `no results are explicit in both views…` preveri neprazen projekt brez zadetkov in oba pogleda; `empty project retains its standard empty state…` preveri 0/0; izhodiščni empty-board scenarij preveri prazne stolpce. | Uspešno; zadnji `npm run check`. |
| R11 | D03 in `no results are explicit in both views…` preverita brisanje, ponastavitev iskanja in obeh izbirnikov ter obnovo ID-jev. | Uspešno; zadnji `npm run check`. |
| R12 | Namizni in mobilni izhodiščni testi preverijo navigacijo, podrobnosti in Folio; D04 ter lastni read-only test preverita odsotnost zapisov in širino strani. | Uspešno; zadnji `npm run check`. |

## Omejitve

- Končnih skritih preverjanj ni bilo mogoče zagnati; uspeh 54 lokalnih testov
  ne potrjuje njihovega izida.
- Scenariji uporabljajo vzorčne sezname in en dodan zapis; primer s posebej
  več kot deset opravili ni bil izveden. Filtriranje iterira po prejetem
  seznamu in ne določa fiksnega števila opravil.
- Ročni ogled v brskalniku ni bil izveden. Ozko širino preverjajo avtomatski
  namizni in mobilni testi ter lastni test pri širini 390 pik.
