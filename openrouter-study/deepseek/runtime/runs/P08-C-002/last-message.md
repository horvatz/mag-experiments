Korak `$speckit-plan` je opravljen.

**Opravljeno**
- `docs/agent/P08/plan.md` (69 vrstic): tehnični kontekst (React 19/TS/Vite/Playwright, obstoječi API, nedotaknjena infrastruktura), odločitve (nova čista logika `src/deadlines.ts` z UTC dnevnim štetjem, stanje v `ProjectView` s ponastavitvijo prek `key={project.id}`, kontrole in pet števcev v `App.tsx`, slog v `styles.css`, lastni testi `tests/agent/p08.spec.ts`), tabela datotek, preverjanje in tveganja.
- Manjši popravek specifikacije: R09 zdaj zahteva enako filtrirano množico ID-jev (ne napačno istega globalnega vrstnega reda), skladno s tablo po stolpcih.
- Meje sprememb in Folio so upoštevani; nobenih novih odvisnosti.

Proračun te faze je izčrpan (~25 s); pripravljen na `$speckit-tasks`.
