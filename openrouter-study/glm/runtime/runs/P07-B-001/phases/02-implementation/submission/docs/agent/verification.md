# Implementerjevo preverjanje P07-B

## Stanje zapisa

- Implementacija in preverjanje so zaključena; čas prevzame pregledovalec.

## Spremembe po zahtevah

- R01, R05–R10, R12: `src/App.tsx` dodaja gumb za priljubljeno opravilo v preglednici, filter, števec, čiščenje trenutnega projekta, filtriran skupni prikaz in ohranjeno navigacijo/podrobnosti.
- R01, R07, R10, R12: `src/TaskBoard.tsx` dodaja ločen gumb na karticah, uporablja isto filtrirano množico in šteje vidna opravila po stolpcih.
- R02–R04, R08, R09, R11: `src/useFavorites.ts` shranjuje in validira `folio:favorites:v1`, ohranja globalne ID-je, posluša `storage` in ob napaki shrambe ohrani stanje v pomnilniku.
- Folio videz: `src/styles.css` dopolni obstoječo postavitev s kompaktnim nadzornim panelom in zvezdičnimi gumbi, vključno z ozkim prikazom.

## Izvedena preverjanja

- `npm run lint`: uspešno.
- `npm run typecheck`: uspešno.
- `npx playwright test --project=agent`: 3/3 uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npm run check`: 49/49 uspešno (14 API, 24 osnovnih, 8 razvojnih P07, 3 lastni).

## Ugotovitve

- Med prvim celotnim `npm run check` je osnovni test pričakoval enoličen `role="status"` med nalaganjem. Števec je zato prikazan šele, ko so opravila naložena; ponovljeni osnovni testi 24/24 in celoten `npm run check` 49/49 uspešno.
- Napake ali neskladja v predani specifikaciji niso bile ugotovljena.
- Priljubljena so izključno lokalna; ni zapisov na API ali uporabe `/__test/` v uporabniškem vmesniku.

## Omejitve okolja

- Javni internet je blokiran; uporabljene so samo lokalne storitve te naloge.
- Chromium se povezuje z `wsEndpoint` iz `task/browser.json`; `chromium.launch()` v tem okolju ni na voljo.
- Testni strežnik uporablja vrata 5174/3102; ročni ogled bi uporabil 5193/3123.
- `apply_patch` izvajalni program v tem okolju ni na voljo; spremembe so bile zapisane neposredno znotraj dovoljenih poti.
