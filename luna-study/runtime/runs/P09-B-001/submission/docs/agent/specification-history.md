# Zgodovina specifikacije

## 2026-09-28 — začetni zapis (avtor specifikacije)

- Prebrano: `PROJECT_RULES.md`, `task/instructions.md` (P09 1.0) in `task/specification-template.md`.
- Obseg: sprejemni pogoji R01–R12 za filtre, fragment URL-ja, zgodovino, preklop pogledov in podrobnosti; javni API in obstoječi videz Folio ostaneta izhodišče.
- Začetni osnutek sledi predlogi in ohranja vse izvirne zahteve. Pravila normalizacije, filtriranja, vrstnega reda in navigacije so izražena kot preverljiva stanja/predikati.
- Naslednje: preveriti dejanska skupna polja ter poti/komponente v `shared/` in `src/`, nato dodati konkretne sledi kode in zapisati meje preverjanja. Koda aplikacije, testi in videz so zunaj vloge specifikatorja.

## 2026-09-28 — pregled izhodišča in predaja

- Preverjeno: `shared/types.ts` (polja `Project`, `Task`, `TaskStatus`); `src/navigation.ts`, `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`, `api.ts`, `useResource.ts`, `styles.css`; potrjeni dizajn `docs/dizajn.md`; skupni regresijski testi in `tests/development/P09.spec.ts`/`helpers.ts`.
- Specifikacija zdaj navaja konkretne integracijske točke, ohranja scenarije D01–D04 kot le delno pokritost in jasno označi, da testi/vizualni pregled niso bili izvedeni v tej vlogi.
- Pravilo R02 loči obrezovanje zunanjih belin q od normalizacije podatkovnih polj, ki se ne obrezujejo.
- Predaja implementerju: izpolni vse R01–R12, posebej Back/Forward, nepravilne/ponovljene query parametre, dobesedno Unicode iskanje, stabilno razvrščanje, ohranjanje parametrov pri task/detail/view navigaciji in rezultatni števec. Po izvedbi dopolni sledljivost z dejanskimi datotekami, zagnanimi testi in dokazi v skladu s predlogo.
