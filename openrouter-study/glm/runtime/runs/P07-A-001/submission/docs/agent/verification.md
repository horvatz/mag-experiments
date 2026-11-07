# Preverjanje P07

 Datum: 2026-10-30. Preverjanja so izvedena v lokalnem Chromium prek Playwrighta nad lokalnim strežnikom naloge.

## Izvedena preverjanja

| Preverjanje | Ukaz | Rezultat |
| --- | --- | --- |
| Prevajanje TypeScript | `npm run typecheck` | Uspešno, brez napak. |
| Statična analiza | `npm run lint` | Uspešno, brez opozoril ali napak. |
| Lastni testi | `npx playwright test --project=agent` | 7/7 uspešno. |
| Skupni P07 razvojni testi | `npx playwright test --project=development-desktop --project=development-mobile` | 8/8 uspešno. |
| Celotna kontrola | `npm run check` | Uspešno: lint, build/typecheck in 53/53 Playwright testov. |

## Sledljivost zahtev

| Zahteva | Dejansko preverjanje | Izid |
| --- | --- | --- |
| R01 | `tests/agent/P07.spec.ts` – test o neodvisnih priljubljenih preveri stanje dveh gumbov in odsotnost dialoga. | Uspešno. |
| R02 | Isti test preveri točno obliko zapisa, sortiranje in odsotnost polj opravil. | Uspešno. |
| R03 | Test filtriranja in čiščenja uporabi podvojen ID, ID drugega projekta in neznani ID. | Uspešno. |
| R04 | Test neveljavne shrambe preveri neveljaven JSON, napačno verzijo, manjkajoče `ids` in nestring v `ids`; preveri tudi, da se vrednost ne prepise. | Uspešno. |
| R05 | Test filtriranja preveri privzeto neizklopano stanje in izvorni vrstni red prikaza. | Uspešno. |
| R06 | Test filtriranja odstrani vidni priljubljeni ID in preveri sporočilo ter omogočen checkbox. | Uspešno. |
| R07 | Test enakosti pogledov preveri preklop med tablo in preglednico ter podrobnosti po ID-ju. | Uspešno. |
| R08 | Testi preverita ohranitev globalne množice, reset filtra ob menjavi projekta in reset filtra po osvežitvi. | Uspešno. |
| R09 | Test čiščenja preveri odstranitev le trenutnega projekta in ohranitev tujih/neznanih ID-jev ter onemogočen gumb. | Uspešno. |
| R10 | Test filtriranja preveri `Priljubljeno: X od M.` in števce vidnih stanj. | Uspešno. |
| R11 | Testa storage dogodka in nedostopne shrambe preverita validacijo, ignoriranje tujega ključa, pomanjkanje povratnega zapisa, opozorilo in delovanje v pomnilniku. | Uspešno. |
| R12 | Lastni testi nadzorujejo ne-GET API zahteve in strežniško stanje; ozki prikaz je preverjen pri 390 px. | Uspešno. |

## Omejitve

- Preverjanje je izvedeno samo v lokalnem Chromiumu; drugi brskalniki in izklopljen JavaScript niso preverjeni.
- Dogodek `storage` je preverjen z diskretnim `StorageEvent`, ne z dvema sočasno odprtima zavihkoma. Uporabljena kontrola pokriva isti vmesnik.
- Ni znanih neizpolnjenih zahtev R01–R12.
