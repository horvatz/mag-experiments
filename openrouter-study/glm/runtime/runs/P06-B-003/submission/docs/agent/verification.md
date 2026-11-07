# Implementacija in preverjanje P06

## Zaključek

Implementacija je končana. Izvoz je bralen, nastavljiv po stolpcih, filtru in ločilu, ustvari UTF-8 CSV z BOM v bralniku in ne pošilja nobenega zapisa na API.

## Zahteve

Izpolnjene so zahteve R01–R12 iz `task/instructions.md` ter vsi sprejemni pogoji predane specifikacije. Specifikacija ni v nesoglasju z izvirnimi zahtevami.

## Spremembe

- `src/export.ts`: nespremenljivo zaporedje sedmih stolpcev, filter po projektu in statusu, kvotiranje, formulna zaščita, UTF-8 BOM, CRLF in bralni prenos prek `Blob` ter object URL.
- `src/App.tsx`: izvozne kontrole s predpisi dostopnimi imeni, privzete vrednosti, onemogočenje brez stolpcev ali vrstic, ohranitev nastavitev med pogledoma in ponastavitev ob menjavi projekta ali osvežitvi.
- `src/styles.css`: prilagodljiv izvozni panel v obstoječem Folio slogu, vključno z razporeditvijo na 390 px.
- `tests/agent/export.spec.ts`: štiri lastni UI testi za točno obliko CSV, prazen projekt in ponastavitev/pogled/prenos/brez zapisov.

## Sledljivost zahtevam

- R01–R02, R06–R09: izvozna logika v `src/export.ts` zagotavlja projekt, vrstni red, kanonično zaporedje stolpcev, kvotiranje, ločila, CRLF, formulno zaščito in Unicode.
- R03–R05: `src/App.tsx` onemogoči izvoz brez izbranega stolpca ali vrstice; `src/export.ts` ustvari `folio-<projectId>.csv` z UTF-8 BOM kot lokalni prenos.
- R10–R11: izvozno stanje ostane med pogledoma, `ProjectView` pa se ponastavi ob menjavi projekta in osvežitvi.
- R12: izvoz uporablja obstoječi javni GET odgovor, spreminja samo lastno stanje in ne kliče testnih kontrol ali zapisovalnih metod.

## Izvedena preverjanja

- `npm run typecheck`: uspešno.
- `npm run lint`: uspešno po odstranitvi lastnega začasnega Playwright predpomnilnika.
- `npx playwright test --project=agent`: 4 uspešni testi.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8 uspešnih testov.
- `npm run check`: uspešno; slog, tipi, gradnja in 50 testov (14 API, 12 namiznih osnovnih, 12 mobilnih osnovnih, 8 razvojnih, 4 lastni) so uspešni.
- Test na 390 px potrjuje, da stran ni širša od okna; ločeno ročno ogledno preverjanje ni bilo izvedeno.

## Omejitve okolja

- Javni internet je blokiran; uporabljeni so samo lokalni testni strežnik, lokalni API in lokalni prenos.
- Odvisnosti in Chromium so bile nameščene; testi so se povezali prek `wsEndpoint` iz `task/browser.json`.
- Infrastruktura, odvisnosti, skupni testi in navodila ostajajo nespremenjeni.
- Ukaz `apply_patch` v tem okolju ni bil dosegljiven v PATH, zato so bile lastne datoteke zapisane z lokalnim Node zapisom.
- `git status` zaradi omejenega dostopa do uporabniške Git konfiguracije in Xcode pomožnih datotek ni bil izveden.
- `npm` je izpisal opozorili o neznani `http-proxy` nastavitvi in barvnih spremenljivkah; oba sta neblokirajoči in nista vplivali na rezultate.

## Predaja

Implementacija in preverjanje sta zaključena. Čas lahko prevzame pregledovalec.
