# Specifikacija tehnične kvalifikacije Q

Namen: preveriti pogodbo funkcije `shift` za R01/R02.

- **R01:** `src/qualification.ts` izvozi `shift(values: readonly number[]): number[]`, ki vrne novo polje enake dolžine in v istem vrstnem redu poveča vsako vrednost za 1.
- **R02:** Vhod ostane nespremenjen. Tudi prazen vhod vrne novo prazno polje; rezultat nikoli ni isto polje kot vhod.

Q01: result[i] = input[i] + 1

**Scenarija:** Klic z `[-1, 0, 2]` vrne `[0, 1, 3]`, vhod ostane `[-1, 0, 2]`; klic z `[]` vrne novo `[]`.

**Merilo uspeha:** Po implementaciji `node task/qualification-check.mjs` uspešno preveri R01/R02, vključno z nespremenjenostjo vhoda in novo referenco rezultata.
