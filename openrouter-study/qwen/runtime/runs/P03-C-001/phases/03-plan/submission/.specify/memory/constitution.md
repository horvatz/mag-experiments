# Folio Constitution

## Core Principles

### I. Library-First
Vse funkcionalnost izhajajoč iz obstoječih skupnih library v `server/` in `shared/`.

### II. Spec-Kit Workflow
Spec Kit je enotni način za specifikacije, načrte in implementacijo; lokalne veščini so izključno za te korake.

### III. Test-Verified (NON-NEGOTIABLE)
Vsa nova dejanja zahtevajo ustrezne lastne teste v `tests/agent/` pred izvedbo; skupni testi ostanejo nedotaknjeni.

### IV. API-Constrained
Vsi bralci in zapisovalci uporabljajo javni API `/api/`; interna testna kontrola `/__test/` je na voljo le razvojnim testom.

### V. Slovenian by Design
Uporabniški vmesnik ohranja slovenska poimenovanja, UI besedila in kontrole iz potrjenega dizajna Folio.

## Scope Boundaries

- Koda uporabniškega vmesnika v `src/` z modrimi poudarki, sistemsko pisavo in Folio barvno shemo.
- Lastni dodatni testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`.
- Predlogi, odvisnosti, strežnik, skupni tipi in skupni testi ostajajo nedotaknjeni.
- Sprememba skupne infrastrukture zahteva enotno, vnaprej dogovorjeno posodobitev za vse postopke.

## UI Constraints

- Iskalnik obvezno `input type=search` z oznako Išči opravila.
- Filterji obvezno `select` elementi za stanja in odgovorne osebe.
- Gumb `Počisti filtre` z `role=status` in `aria-label=Rezultati filtriranja`.
- `data-task-id` na vseh opravilih; `aria-label=Pregled stanj opravil` za pogled.
- Na širini 390 pik stran ostane kompaktna brez horizontalnega skrola.

## Governance

- Ustava velja nad vsemi drugi praksami; spremembe zahtevajo dokumentacijo.
- Agent opravlja korake specifikacije, načrtovanja in implementacije z enim postopkom.
- Vsak korak Spec Kit shrani delo sproti in pripravi naslednji korak.

**Version**: 1.0 | **Ratified**: 2026-10-13
