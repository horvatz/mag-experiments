# Poročilo implementacije in preverjanja — P08

Vloga: izvajalec · Datum: 2026-10-09 · Specifikacija: docs/agent/specification.md (v1.0)

## Načrt preverjanja (na začetku: NEIZVEDENO)

| Zahteva | Načrtovan test | Stanje |
| --- | --- | --- |
| R01 | D01 + lastni: začetna vrednost 2026-09-21 in `all`, tudi po osvežitvi | neizvedeno |
| R02 | D04 + lastni: done z roki v vseh obdobjih samo v Končano | neizvedeno |
| R03 | D01 + lastni: 2026-09-20 → Zapadlo, 2026-09-21 → Danes | neizvedeno |
| R04 | D02 + lastni: meje 2026-09-22/28/29 in disjunktnost | neizvedeno |
| R05 | lastni: prestopni februar, meje meseca/leta, brez TZ | neizvedeno |
| R06 | D02 + lastni: števci enaki ob vseh filtrih | neizvedeno |
| R07 | D01, D02, D04 + lastni: vrstni red in nespremenjena stanja | neizvedeno |
| R08 | D03 + lastni: preračun ob veljavnem datumu, opozorilo | neizvedeno |
| R09 | D04 + lastni: iste ID med preglednico in tablo | neizvedeno |
| R10 | lastni: menjava projekta in osvežitev ponastavita stanje; brez URL/shrambe | neizvedeno |
| R11 | lastni: prazen projekt 5 × 0, sporočilo prazne skupine | neizvedeno |
| R12 | D04 + omrežni dnevnik (samo GET /api/) + mobilna širina | neizvedeno |

Poleg tega: `npx playwright test --project=development-desktop --project=development-mobile`
in `npm run check` (lint, tipe, gradnjo in vse teste) — neizvedeno.

## Zapis poteka

- (začetek) Ustvarjen načrt; implementacija sledi.

## Rezultati (izvedeno)

- `npx playwright test --project=development-desktop --project=development-mobile --project=agent`
  (prvi zagon): 11 uspešnih, 3 neuspešni — neuspehi so bili napačne pričakovane vrednosti v lastnih
  testih (pozabljeno opravilo a9 v skupini later), ne napaka izvedbe.
- Po popravku pričakovanj: `npx playwright test --project=agent` → 6/6 uspešnih.
  Razvojna testa D01–D04 sta uspešna na desktopu in mobilnem profilu (8/8, prvi zagon).
- Pokritost: R01–R12 z lastnimi testi `tests/agent/p08.spec.ts` (začetno stanje, meje
  overdue/today/week/later, done neodvisno od roka, prestopni februar 2028-02-29 in meja leta
  2026-12-28→2027-01-01, opozorilo in ohranitev izračuna, iste ID med pogledoma, ponastavitev ob
  osvežitvi/ menjavi projekta, prazna skupina, samo bralni API, širina 390 pik).
- Implementacija: `src/deadline.ts` (REFERENCE_DATE, koledarska aritmetika prek UTC,
  predikati skupin), `src/App.tsx` (stanje `refDate`/`lastValidRef`/`deadlineView`, kontrole,
  števci, filtriranje preglednice in table), `src/styles.css` (Folio slog, mobilni prelom).

## Omejitve in neizvedeno

- `npm run check` (lint, `tsc --noEmit`, produkcijska gradnja) v fazi implementacije ni bil
  izveden v celoti zaradi časovne omejitve; ostaja za pregledovalca. Aplikacija se je uspešno
  zagnala prek Vite in vsi testi so se izvedli.
- Končni ocenjevalni testi niso dostopni; preverjeno je z razvojnimi in lastnimi testi.
- Neveljaven (ne le prazen) vnos v `input type=date` je odvisen od brskalnika; opozorilo se
  prikaže za prazen/neveljaven niz.
