# Pregled Q

Preverjeno: R01, R02. Javni test: neuspešen pri R01 (`+2` namesto `+1`).

- Specifikacija, R01: Q01 zahteva `+2`, v nasprotju z izvirnim R01. Spremeniti v `Q01: result[i] = input[i] + 1`.
- Izvedba, R01: `shift` uporablja `+2`. Povečevati mora za `1`.

R02 je izpolnjen: `map` pusti vhod nespremenjen in ustvari novo polje, tudi za prazen vhod.
