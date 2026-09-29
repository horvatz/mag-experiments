# Pregled Q

R01: specifikacija v Q01 in koda napačno prištevata 2 namesto 1. Ločena popravka:
- specification: vrstico zamenjati z `Q01: result[i] = input[i] + 1`.
- implementation: v `src/qualification.ts` uporabiti `value + 1`.

R02: specifikacija ustreza; pregled kode potrjuje nespremenjen vhod in novo polje, tudi za prazen vhod (`map`).

`node task/qualification-check.mjs`: neuspešno (izhod 1); rezultat `[2, 6, 0]`, pričakovano `[1, 5, -1]`. Izvajalno preverjanje R02 ostaja nepotrjeno, ker se test ustavi pri R01.
