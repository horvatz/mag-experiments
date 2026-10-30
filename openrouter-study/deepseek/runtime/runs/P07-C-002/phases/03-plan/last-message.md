Korak `$speckit-plan` je opravljen.

**Ustvarjeno**
- `docs/agent/P07/plan.md` (66 vrstic), jedrnat Lean načrt na podlagi `spec.md`, ustave in dejanske kode:
  - Tehnični kontekst: React 19/TS 6/Vite 8, obstoječi `useResource`//`api`, Playwright projekt `agent` za `tests/agent/**`; infrastruktura in odvisnosti nespremenjene.
  - Odločitve: globalno stanje priljubljenih v `App` prek novega `useFavorites` (preživi menjavo projekta, deljeno med pogledoma); čista logika v `src/favorites.ts` (validacija P2, serializacija P1, dogodek `storage`, izjema → opozorilo); `FavoriteButton` zunaj povezave opravila; kontrole filtra, števec in opozorilo v `ProjectView`; `visible` v izvornem vrstnem redu; ponovna pripenjanje `ProjectView` ob menjavi projekta ponastavi filter.
  - Datoteke: novo `src/favorites.ts`, `src/useFavorites.ts`, `tests/agent/p07-favorites.spec.ts`; spremembe `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `src/styles.css`.
  - Preverjanje: `typecheck`/`lint`/`build`, lastni testi za R01–R12, `npm test` za skupno regresijo; tveganja (okvarjena shramba, neznani ID-ji, ločenost od `tests/development/`).

**Omejitve**
- Brez novih zahtev, odvisnosti ali infrastrukturnih sprememb; drugih datotek nisem spreminjal.

Preostanek proračuna: ~1039 s.
