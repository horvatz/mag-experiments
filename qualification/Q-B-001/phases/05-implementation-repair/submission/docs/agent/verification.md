# Preverjanje Q

`shift` vrne novo polje z vrednostmi, povečanimi za 1, in ne spremeni vhoda; tudi prazen vhod vrne novo polje.

`node task/qualification-check.mjs`: `QUALIFICATION_CHECK_PASSED` (izhodna koda 0). Specifikacija ni spremenjena.

2026-09-21: Po pregledu popravljena utemeljena napaka R01: `value + 2` → `value + 1`. Ponovni javni test: `QUALIFICATION_CHECK_PASSED` (izhodna koda 0), R01 in R02 uspešna. Specifikacija, zgodovina in pregled niso spremenjeni.
