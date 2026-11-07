# Preverjanje P04: Stabilno razvrščanje z dvema ključema

Datum: 11. oktober 2026

## Izvedena preverjanja

| Preverjanje | Ukaz ali scenarij | Rezultat | Povezave z zahtevami |
| --- | --- | --- | --- |
| Lint | `npm run lint` | Uspešno, brez napak ali opozoril ESLint. | Vsi |
| Tipi | `npm run typecheck` | Uspešno. | Vsi |
| Produkcija | `npm run build` | Uspešno; Vite build končan. | Vsi |
| Agentovi testi | `npx playwright test --project=agent` | 6/6 uspešno. | R01–R12 |
| Skupni P04 testi | `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno. | R01, R02, R03, R04, R05, R07, R10, R11 |
| Celotna kontrola | `npm run check` | Uspešno: lint, typecheck, build in 52/52 Playwright preverjanj. | R01–R12 |

## Pokritje zahtev

| Zahteva | Dejanski scenarij in rezultat |
| --- | --- |
| R01 | A01 preveri privzete vrednosti kontrol in izvorni vrstni red; uspešno. |
| R02 | A01 preveri naslove/osebe z Unicode, velikimi črkami, ločili in številčnimi nizi; uspešno. |
| R03 | A01 preveri stanja `todo`, `in_progress`, `done` in več datumov; uspešno. |
| R04 | A01 primerja asc/desc z enakimi ključi; izenačene skupine ostanejo stabilne; uspešno. |
| R05 | A01 preveri sekundarni datum z lastno smerjo znotraj enakega primarnega naslova; uspešno. |
| R06 | A01 preveri izvorni indeks, enak primarni/sekundarni ključ in neodvisnost kontrol od `original`; uspešno. |
| R07 | A02 preveri vrstni red vseh treh stolpcev table iz istega razvrščenega polja; uspešno. |
| R08 | A02 preklopi tabelo/tablo ter odpre/zapre podrobnosti brez spremembe štirih nastavitev; uspešno. |
| R09 | A03 preveri menjavo projekta in osvežitev brez URL-ja ali lokalne shrambe; uspešno. |
| R10 | A04 preveri prazen projekt, A05 eno opravilo, obe kontroli smeri ter reset; uspešno. |
| R11 | A01/A04 preverita nespremenjene števce, reset brez zapisov in odsotnost API zapisov; uspešno. |
| R12 | A02/A06 preverita enkraten prikaz ID-jev in odpiranje pravih podrobnosti pri enakih naslovih; uspešno. |

## Rezultati po naborih

- API: 14/14 uspešno.
- Izhodiščne namizne preveritve: 12/12 uspešno.
- Izhodiščne mobilne preveritve: 12/12 uspešno.
- Razvojne preveritve P04: 8/8 uspešno (namizje in mobilno).
- Agentove preveritve: 6/6 uspešno.
- Skupaj: 52/52 uspešno.

## Omejitve in opažanja

- Končni skriti testi niso bili dostopni, zato njihovih rezultatov ne navajam.
- Javni internet ni bil uporabljen; vsi testi so tekli proti lokalnim storitvam naloge.
- Podpora manjkajočim ali neveljavnim datumom ni zahtevana in ni dodana.
- Med prvo iteracijo agentovih testov sta bila dva neuspešna zagona zaradi napačnih pričakovanih vrstnih redov in ponovne uporabe route v enem testu. Testni scenariji so bili popravljeni; končni zagoni so uspešni.
- Ni znanih neizpolnjenih zahtev R01–R12.
