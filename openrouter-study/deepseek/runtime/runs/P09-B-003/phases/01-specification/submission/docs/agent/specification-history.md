# Zgodovina specifikacije P09

| Različica | Datum (UTC) | Sprememba | Avtor |
| --- | --- | --- | --- |
| 0.1 | 2026-11-02 | Prva različica: problem in kontekst, vhodi/dejanja/izidi, predikati, pogoji R01–R12 po skupni predlogi, dogovor o vmesniku, načrt izvedbe in sledljivosti, odprta vprašanja in omejitve. | agent-specifikator |

Opombe:

- Specifikacija je osnutek; izidi testov v tabeli sledljivosti so označeni kot
  neizvedeni in jih dopolni faza implementacije z dejanskimi dokazi.
- Vir pogojev so `task/instructions.md` (R01–R12); predpostavke o podatkih so
  povzete iz razdelka »Podatki, obseg in preverjanje«.
- Preverjeno proti dejanski kodi: `shared/types.ts`, `src/navigation.ts`,
  `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`,
  `tests/development/P09.spec.ts`, `tests/development/helpers.ts`.
- V tej fazi aplikacija ni bila zagnana in testi niso bili izvedeni.
