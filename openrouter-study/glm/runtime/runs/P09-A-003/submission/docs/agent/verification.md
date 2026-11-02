# Preverjanje P09

## Izvedena preverjanja

| Preverjanje | Zahteve | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | Tipna skladnost izvedbe. | Uspešno, brez napak. |
| `npx playwright test --project=development-desktop --project=development-mobile` | R01, R04–R08, R11, R12 v skupnih P09 primerih. | 8/8 uspešnih. |
| `npx playwright test --project=agent` | R01–R12 v lastnih primerih A01–A04. | 4/4 uspešnih. |
| `npm run check` | ESLint, produkcijska izgradnja, 38 preverjanj izhodišča, 8 razvojnih P09 in 4 lastna preverjanja. | 50/50 uspešnih. |

`npm run check` je po zadnji spremembi lastnega testa uspešno ponovno pokril vseh 50 primerov; rezultat zadnjega polnega zagona je `50 passed`.

## Sledljivost zahtev

| Zahteva | Dejanski scenarij in dokaz |
| --- | --- |
| R01 | Lastna preizkušanja `A01` in skupni testi potrjujejo direktno uporabo `q`, `status` in `order` brez dodatnega klika ter privzete vrednosti kontrol. |
| R02 | `A01` preveri NFD/odstranitev diakritičnih znakov, iskanje po poljih naslova, opisa, osebe in ID-ja ter ohranitev URL-ja z neznanim parametrom. |
| R03 | `A01` preveri kombinacijo iskanja in stanja po IN ter naraščajoče/padajoče razvrščanje naslovov. Izenačeni naslovi so pokriti s skupnim testom izhodišča. |
| R04 | `A01` preveri prvo ponovljeno vrednost, neveljavno `status`, neveljaven `order`, neznan parameter in da razčlenjevanje ne prepise vhodnega URL-ja. |
| R05 | `A02` preveri, da osnutek ne spremeni prikaza/URL-ja, potrditev pa ustvari natanko eno novo zgodovinsko stanje. |
| R06 | `A02` preveri obrezanje `q`, izpust privzetih parametrov in enako ponovno potrditev brez novega zgodovinskega stanja; `A03` preveri ohranitev `view=board`. |
| R07 | `A02` preveri nazaj/naprej s prikazom in osnutkom; skupni `D03` preveri osvežitev v tabli. |
| R08 | `A03` preveri preklop med tablo in preglednico z ohranitvijo ID-jev, parametrov ter zavrtitvijo nepotrjenega osnutka. |
| R09 | `A03` preveri povezavo podrobnosti, gumb za zapiranje in ohranitev parametrov; skupni testi preverjajo enake naslove po ID-ju in Escape. |
| R10 | `A04` preveri privzeti drugi projekt z ohranjeno tablo ter direktno povezavo do drugega projekta z veljavnimi parametri. |
| R11 | `A04` preveri reset, `Ni zadetkov.`, števec `Prikazano: 0 od 8.` oz. `8 od 8.` in širino 390 px. |
| R12 | Vsi testi potrjujejo odsotnost zapisovalnih zahtev; `A04` dodatno preveri prazno `localStorage` in širino. Skupni testi potrjujejo neznane poti, nalaganje in podrobnosti. |

## Omejitve

- Ni neizpolnjenih zahtev iz R01–R12.
- Uporabljeni so samo lokalni API in lokalni Chromium; javni internet, strežnik, odvisnosti in skupni testi niso bili spremenjeni.
