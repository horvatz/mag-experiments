# Specifikacija Q

## Problem in kontekst

Tehnična kvalifikacija Q preverja predajo izvajalca. Namen je funkcija, ki vsak element vhodnega polja poveča za 1, brez spremembe vhoda.

## Vhodi, dejanja in izidi

Vhod: `values: readonly number[]`. Izhod: novo polje `number[]`. Prazno polje vrne novo prazno polje. Vhod ostane nespremenjen.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `export function shift(values: readonly number[]): number[]` vrne novo polje s povečavo vsake vrednosti za 1. | `node task/qualification-check.mjs` |
| R02 | Vhod ostane nespremenjen; prazno polje vrne novo prazno polje. | `node task/qualification-check.mjs` |

Q01: result[i] = input[i] + 1

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Vsak element povečan za 1. | `qualification-check.mjs` | `src/qualification.ts` (ni napisana) | Ni preverjeno; koda ni bila napisana. |
| R02 | Vhod nespremenjen, prazno polje → prazno. | `qualification-check.mjs` | `src/qualification.ts` (ni napisana) | Ni preverjeno; koda ni bila napisana. |

## Odprta vprašanja in omejitve

Koda ni del tega koraka; test zato ni bil izveden. Izvedba sledi v nadaljevanju.
