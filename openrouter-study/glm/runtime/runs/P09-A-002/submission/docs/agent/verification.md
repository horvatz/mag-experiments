# Preverjanje P09

## Izvedena preverjanja

| Datum | Ukaz ali pregled | Obseg | Izid |
| --- | --- | --- | --- |
| 2026-11-01 | `npm run lint` | ESLint nad projektom | Uspešno, brez napak. |
| 2026-11-01 | `npm run typecheck` | TypeScript brez izdaje | Uspešno, brez napak. |
| 2026-11-01 | `npm run build` | TypeScript in Vite produkcijska izgradnja | Uspešno. |
| 2026-11-01 | `npx playwright test --project=development-desktop --project=development-mobile` | 4 P09 scenarije v obeh velikostih | 8/8 uspešno. |
| 2026-11-01 | `npx playwright test --project=agent` | 7 lastnih P09 scenarijev | 7/7 uspešno. |
| 2026-11-01 | `npx playwright test --project=agent --project=development-desktop --project=development-mobile` | celoten P09 nabor po dopolnitvi tabule | 15/15 uspešno. |
| 2026-11-01 | `npm run check` | lint, build/typecheck in vsi Playwright projekti | 53/53 uspešno. |

## Sledljivost zahtev

| Zahteva | Dejanski scenariji | Rezultat |
| --- | --- | --- |
| R01 | D01, A03 in A04 preverijo neposreden URL brez dodatnega klika ter vrednosti kontrol. | Izpolnjeno. |
| R02 | A01 preveri NFD/odstranjevanje kombinacijskih znakov, male črke, celotno frazo, ID, naslov, opis in odgovorno osebo. | Izpolnjeno. |
| R03 | A02 preveri asc/desc primerjavo po UTF-16 in izvorni vrstni red pri enakih normaliziranih naslovih; D01 preveri IN s `status`. | Izpolnjeno. |
| R04 | A03 preveri neznane vrednosti, ponovljene parametre, neznani parameter in odsotnost samodejnega prepisa URL. | Izpolnjeno. |
| R05 | D02 in A04 preverita, da spremembe kontrol ostanejo osnutek in da `Uporabi pogled` potrdi vse hkrati. | Izpolnjeno. |
| R06 | A03/A04 preverita trim, izpuščanje privzetih, URL-kodiranje, odstranjevanje neznanih parametrov, `view=board` in ponovitev brez nove zgodovine. | Izpolnjeno. |
| R07 | D03 preveri osvežitev; A04 preveri Nazaj/Naprej ter obnovo prikaza in osnutka. | Izpolnjeno. |
| R08 | A06 preveri preklop Preglednica/Tabla z ohranjenim stanjem in zavrženim osnutkom. | Izpolnjeno. |
| R09 | A06 preveri podrobnosti in Escape; skupni baseline preveri tudi enake naslove in zapiranje z gumbom. | Izpolnjeno. |
| R10 | A06 preveri klik na drug projekt, ohranitev board in neposreden URL drugega projekta s parametri. | Izpolnjeno. |
| R11 | D04, A05 in A07 preverijo ponastavitev, `Ni zadetkov` v preglednici in tabuli ter števec `Prikazano: N od M.`. | Izpolnjeno. |
| R12 | A05/A07 preverita odsotnost zapisovalnih zahtevkov in `localStorage`; baseline/API preverita nalaganje, napake, neznane poti in prazne projekte. | Izpolnjeno. |

## Omejitve

- Končni testi naloge niso dostopni, zato uspešnost ne sme biti razumljena kot
  formalna garancija nad vsemi možnimi podatki.
- Poseben primer z več kot desetimi opravili ni ločeno izveden; implementacija
  ne ima meje števila zapisov in uporablja stabilno urejanje.
- Navigacije med nezaključenim nalaganjem ter novimi sočasnimi spremembami
  podatkov niso dodatno razširjene, ker navodilo izrecno ne zahteva regulatorja
  za te scenarije.
