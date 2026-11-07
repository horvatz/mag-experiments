# P08 — Preverjanje

Datum: 2026-10-13.

## Zapis med izvedbo

- Začetek izvedbe: specifikacija, načrt in naloge so prebrani; spremembe bodo omejene na `src/`, `tests/agent/` in dokumente v `docs/agent/`.
- Končnih skritih testov ni na voljo; njihovih rezultatov ne navajam kot izvedenih.

## Rezultati

| Preverjanje | Datum in ura | Rezultat | Dokaz |
| --- | --- | --- | --- |
| Pred izvedbo | 2026-10-13 | Ni še izvedenih preverjanj. | Ta datoteka je začeta pred spremembami. |
| `npm run typecheck` | 2026-10-13 | Uspešno. | `tsc --noEmit` brez napak. |
| `npx playwright test --project=agent --project=development-desktop --project=development-mobile` | 2026-10-13 | Uspešno. | 14 ciljanih P08 testov uspešno izvedenih po uskladitvi pričakovanih vrstnih redov v statusni tabli. |
| `npm run check` | 2026-10-13 | Uspešno. | ESLint brez napak, Vite izgradnja uspešna, Playwright 52/52 testov uspešnih. |

## Pokritost zahtev

- R01–R12 so pokrite z lastnimi testi v `tests/agent/P08.spec.ts`.
- Meje koledarja so preverjene za prehod meseca (`2026-09-30 → 2026-10-07`), prehod leta (`2026-12-31 → 2027-01-07`) in prestopni dan (`2024-02-28 → 2024-02-29`).
- Preverjeni so: začetni datum in filter, pet števcev, vse skupine, prazen/neveljaven vnos, preklop preglednica/tabla, menjava projekta, osvežitev, prazna projektna in skupinska stanja, `data-task-id`, podrobnosti, odsotnost zapisov na API in širina 390 px.

## Omejitve

- Končni skriti testi niso na voljo in niso izvedeni; njihovih rezultatov ne navajam.
- Ročnega ogleda na ločenih vratih 5193/3123 ni bilo, ker so vključeni UI-testi na 390 px ter obstoječa izhodiščna in razvojna preverjanja uspešna.
