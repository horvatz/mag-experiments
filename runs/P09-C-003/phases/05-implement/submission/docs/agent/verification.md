# P09 — preverjanje in predaja

2026-09-26, postopek C. Implementacija je zaključena; končni celotni zagon je uspešen (55/55 testov). Merilo: vseh R01–R12 iz `task/instructions.md`. Specifikacija, načrt in naloge: [P09](P09/spec.md).

## Sprotni zapis

- T001: preverjeni obstoječi React/TypeScript prikazi, hash navigacija, javni API, Folio ter skupni/razvojni testi. Uporabljene bodo obstoječe nastavitve `npm run check` (5174/3102) in nameščeni Chromium. Dokument dokazil je po izrecnem navodilu uporabnika `docs/agent/verification.md`; nadomešča načrtovano lokacijo v podmapi P09.
- Omejitev: končni testi niso dostopni in ne bodo navedeni kot opravljeni. Ni drugih agentov, novih odvisnosti ali sprememb infrastrukture.

- T002–T003: dodani čista logika izbora/urejanja in razširjena hash navigacija. Branje nima zapisov; potrditev loči nov vnos od zamenjave ob kanonizaciji. Funkcionalni testi še sledijo.
- T004–T005: dodane kontrole, števec in prazen rezultat. Tabela/tabla in podrobnosti prenašajo potrjene filtre; ključ ponovne montaže je omejen na kontrole, da dialog ohrani obnovo fokusa. Projektne povezave ohranijo pogled in ponastavijo filtre.
- T006: slogi novih kontrol uporabljajo Folio spremenljivke in prelom pri ozki širini; pregled v brskalniku in regresije še sledijo.
- T007–T008: dodanih devet lastnih Playwright testov A01–A09 za normalizacijo, stabilnost, neznane/podvojene parametre, 0/1/13 opravil, kodiranje, zgodovino, prehode, podrobnosti, nič zapisov in širino 390 pik. Zagon še sledi.
- Prvi `npm run check`: lint, tipi in gradnja uspešni; 54/55 testov uspešnih (vseh 38 osnovnih in 8 razvojnih). A07 je pritisnil Escape pred odprtjem drugega dialoga in nato poskušal klikniti za modalnim dialogom. Test je popravljen z izrecnim čakanjem na odprtje in zaprtje, enako kot skupne regresije; aplikacijska koda se zaradi tega ni spremenila. Dokaz: [prvi dnevnik](P09/check.log).

- T009: drugi celotni `npm run check` je končal z izhodom 0. Lint, TypeScript in Vite gradnja so uspešni; Playwright: **55/55 uspešnih**, 23,2 s (38 osnovnih + 8 razvojnih + 9 lastnih). Dokaz: [končni dnevnik](P09/check-final.log).
- Vizualno pregledan [posnetek širine 390 pik](P09/mobile.png): navigacija in osnovni Folio ohranjena, oznake in gumbi berljivi, kontrole se prelomijo, tabla se pomika znotraj svojega prikaza. A09 je preveril širino dokumenta v obeh pogledih.
- T010: [sledljivost vseh R01–R12](P09/spec.md#izvedba-in-sledljivost) dopolnjena z dejanskimi testi in kodo. Naloge so označene po izvedbi.

## Končna predaja implementacije

Dodani so iskanje, status in urejanje iz URL fragmenta, ločen osnutek s potrditvijo/resetom, zgodovina brskalnika, prenos filtrov med pogledi in podrobnostmi ter ponastavitev pri kliku drugega projekta. Novi kontroli rezultata sta števec N od M in prazen rezultat. API podatki se ne spreminjajo; ni novih odvisnosti ali posegov v strežnik, skupne tipe/teste in nastavitve.

Spremenjena aplikacijska koda: `src/viewState.ts`, `src/navigation.ts`, `src/ViewControls.tsx`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` in `src/styles.css`. Lastni testi: [A01–A09](../../tests/agent/P09.spec.ts). Procesni dokumenti: [specifikacija](P09/spec.md), [načrt](P09/plan.md), [naloge](P09/tasks.md).

Ni znanih neizpolnjenih obveznih zahtev. Končni nedostopni testi niso izvedeni; preverjanja pokrivajo navedene scenarije in regresije, ne izčrpno celotne domene. Prvi zagon ostaja dokumentiran; uspešni končni zagon vključuje popravljeni test A07. Implementacijski korak je zaključen; nadaljnji converge sproži izvajalnik.
