# Preverjanje P07 — rezultati in sledljivost

Dokazila so nastala med izvedbo; vrstice odražajo dejanske zagone.
Okolje: Node 24.11.1, Playwright 1.63, strežnik testov na 5174/3102 (upravlja `playwright.config.ts`).

## Dnevniki zagonov

| Zagon | Ukaz | Rezultat |
| --- | --- | --- |
| 1 | `npx playwright test --project=agent` | 15 uspelih, 1 neuspeh (test R12: klik na skrit gumb pod filtrom — napaka v zaporedju testa, ne v kodi) |
| 2 | `npm run check` (lint + typecheck + build + vsi testi) | uspešno: 62 uspelih, 0 neuspešnih (25,1 s za teste); med njimi 38 skupnih (api/desktop/mobile), 8 razvojnih primerov P07 (desktop+mobile), 16 lastnih testov |

## Sledljivost zahtev R01–R12

| Zahteva | Test (tests/agent/favorites.spec.ts) | Izid | Dokaz |
| --- | --- | --- | --- |
| R01 | „gumbi preklapljajo samo svoj id …“; „enaki naslovi ostanejo neodvisni“ | uspešno | zagon 2 |
| R02 | „zapis je {version:1, ids} …“ | uspešno | zagon 2 |
| R03 | „obnova ohrani neznane id-je …“ | uspešno | zagon 2 |
| R04 | „neveljavni zapisi pomenijo prazno množico …“ (6 neveljavnih zapisov + manjkajoč ključ) | uspešno | zagon 2 |
| R05 | „filter je privzeto izklopljen …“ | uspešno | zagon 2 |
| R06 | „odstranitev med filtrom …“ | uspešno | zagon 2 |
| R07 | „preglednica in tabla si delita stanje …“ | uspešno | zagon 2 |
| R08 | „menjava projekta in osvežitev …“ | uspešno | zagon 2 |
| R09 | „odstranitev priljubljenih projekta …“ | uspešno | zagon 2 |
| R10 | „števec kaže cel projekt …“ | uspešno | zagon 2 |
| R11 | „dogodek storage …“; „izjema zapisa …“; „izjema branja …“ | uspešno | zagon 2 |
| R12 | „brez API zapisov“; „390 px …“; skupni testi | uspešno | zagon 2 |

Razvojni primeri D01–D04 (`tests/development/P07.spec.ts`) so v zagonu 2 prav tako uspeli na obeh profilih;
skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts` niso pokazali regresij.

## Spremenjene datoteke

- `src/favorites.ts` (novo), `src/useFavorites.ts` (novo), `src/FavoriteButton.tsx` (novo)
- `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`
- `tests/agent/favorites.spec.ts` (novo, 16 testov)
- `docs/agent/P07/spec.md` (izidi), `docs/agent/P07/tasks.md` (oznake), ta dokument

## Omejitve in nepreverjeno

- Končni (skriti) testi te naloge niso dostopni; niso bili izvedeni in niso navedeni kot uspešni.
- T002 (ločen izhodiščni zagon pred spremembami) ni bil izveden; izhodišče je potrjeno posredno s skupnimi
  testi v zagonu 2, ki pokrivajo obstoječe vedenje.
- Razporeditev novih kontrol in nedoločeno besedilo nista predpisana; preverjeni so le določeni pogoji zahtev.
- Obnašanje ob sočasnih spremembah podatkov brez osvežitve in med nedokončanim nalaganjem ni del obsega P07.
