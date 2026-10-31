# Preverjanje P04

## Izvedena preverjanja

- `npm run typecheck`: uspešno, brez tipizacijskih napak.
- `npm run lint`: uspešno, brez ESLint napak.
- `npx playwright test --project=agent`: uspešno, 5/5 lastnih preverjanj.
- `npx playwright test --project=development-desktop --project=development-mobile`: uspešno, 8/8 razvojnih preverjanj.
- `npm run check`: uspešno; lint, produkcijska gradnja in vsi Playwright projekti, 51/51 preverjanj.

## Sledljivost zahtev

| Zahteva | Dejansko preverjanje | Izid |
| --- | --- | --- |
| R01 | A01 preveri privzete vrednosti vseh štirih kontrol in izvorni vrstni red; D01 preveri privzeti vrstni red. | Uspešno. |
| R02 | A01 preveri razvrščanje naslovov in odgovornih oseb z normaliziranimi Unicode nizi ter leksikografskimi primerjavami. | Uspešno. |
| R03 | A01 preveri vrstni red stanj in kronološke datume; D02 dodatno preveri status ter datum. | Uspešno. |
| R04 | A01 preveri naraščajočo in padajočo primarno smer ob enakih primarnih vrednostih; D02 preveri neodvisni smeri. | Uspešno. |
| R05 | A01 in D02 preverita sekundarni ključ le ob enakosti primarnega ključa. | Uspešno. |
| R06 | A01 preveri stabilnost izenačenih elementov, enak primarni/sekundarni ključ in primarni `original`. | Uspešno. |
| R07 | A02 in D03 preverita fiksne stolpce table in relativni vrstni red kartic znotraj stolpcev. | Uspešno. |
| R08 | A02 preveri ohranjevanje nastavitev po preklopu v tablo ter po odprtju in zaprtju podrobnosti. | Uspešno. |
| R09 | A03 preveri ponastavitev ob menavi projekta in osvežitvi, prazno `localStorage` ter odsotnost nastavitev v URL. | Uspešno. |
| R10 | A04 preveri prazen projekt in gumb za izvorni vrstni red; A05 preveri eno opravilo pri vseh ključih in smereh; D04 preveri reset. | Uspešno. |
| R11 | A01–A05 spremljajo API pisanja in strežniško stanje; vsi so brez pisanj. Razvrščanje je izvedeno kot nova projekcija. | Uspešno. |
| R12 | A02 odpre podrobnosti duplikatnega naslova po ID; osnovni testi potrjujejo prikaz vseh ID-jev, podrobnosti in odzivnost. | Uspešno. |

## Rezultati in dokazi

- Končni zagon `npm run check` je izvedel 51 preverjanj: 14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih in 5 lastnih; vsa so uspešna.
- Gradnja je uspešno ustvarila produkcijske podatke v `dist/`.
- Lastna preverjanja so v `tests/agent/P04-agent.spec.ts`; vsak scenario vsebuje tudi preverjanje, da sprememba vrstnega reda ne povzroči pisanj na API.

## Omejitve

- Zasebni končni testni primeri niso dostopni, zato njihove uspešnosti ni mogoče potrditi.
- Podpora manjkajočim ali neveljavnim datumom ni implementirana, ker je naloga izrecno omejuje na veljavne `YYYY-MM-DD`.
- Stanje razvrščanja je namerno trenutno in ni shranjeno v `localStorage` ali URL, kot zahtevata R09 in dogovor o vmesniku.

## Zgodovina preverjanja

- 2026-11-01: Prvi zagon lastnih testov je odkril React 19 težavo z `event.currentTarget` v odloženem updaterju; po popravku so vsa preverjanja uspešna.
- 2026-11-01: Končni `npm run check` uspešen z 51/51 preverjanji.
