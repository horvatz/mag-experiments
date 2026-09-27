# Tehnična specifikacija Q

R01: `shift(values: readonly number[]): number[]` v `src/qualification.ts` vrne novo polje z vsako vrednostjo, povečano za 1.
R02: Vhodno polje ostane nespremenjeno; prazen vhod vrne novo prazno polje.
Q01: result[i] = input[i] + 1
