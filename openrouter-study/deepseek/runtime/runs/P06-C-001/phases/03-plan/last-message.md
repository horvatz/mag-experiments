**Načrt izdelan**

- `docs/agent/P06/plan.md` (78 vrstic): tehnični kontekst, 5 ključnih odločitev (čista logika `src/csv.ts`, predstavitvene kontrole `src/ExportControls.tsx`, stanje v `ProjectView` z `key={project.id}`, prenos prek `Blob`/`URL.createObjectURL`, Folio slog), seznam datotek, zaporedje izvedbe, strategija preverjanja R01–R12 in tveganja.
- Ugotovljeno in upoštevano: preklop Preglednica/Tabla ne remontira `ProjectView`, zato se nastavitve ohranijo (R10); menjava projekta in osvežitev ju ponastavita (R11). Razvojni testi v `tests/development/` ostajajo nedotaknjeni.
- Brez novih odvisnosti, brez sprememb infrastrukture.
- Preostanek časa: ~491 s.

Naslednji korak (sproži izvajalnik): `$speckit-tasks` za `docs/agent/P06`.
