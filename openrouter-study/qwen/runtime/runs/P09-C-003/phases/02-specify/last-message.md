### Summary
Izvedel sem korak **speckit-specify**:
- Ustvaril sem mapi **docs/agent/P09/**
- Ustvaril in dopolnil specifikacijo v **docs/agent/P09/spec.md** z 145 vrsticami
- Specifikacija zajema vse zahteve **R01–R012**:
  - Problem in kontekst (enhance Folio UI with filters)
  - Inputs, Actions, Outputs (vključno s podrobnimi polji)
  - Podrobne specifikacije za vsako zahtevo R01-R12:
    - R01: View state parameters (defaults, immediate apply)
    - R02: Search query normalization (NFD, unicod marks, lowercase, substring)
    - R03: Status and sort filtering (all/todo/in_progress/done, title-asc/desc)
    - R04: Unknown parameter handling (defaults, no auto-update)
    - R05: Draft state behavior (UI update only on Apply View)
    - R06: View confirmation logic (trim, omit defaults, preserve view=board)
    - R07: Browser history navigation (Back/Forward/F5 restore)
    - R08: View mode switching (Tabla/Board preserves filters)
    - R09: Task details navigation (preserve filters, ID resolution)
    - R10: Cross-project navigation (defaults per project, retain mode)
    - R11: Reset view functionality (clear all, keep view mode)
    - R12: Data integrity constraints (no localStorage, no API writes)
  - UI Contract (input fields, buttons, aria-labels)
  - Execution and Traceability table (Req → Rule → Test → File → Proof)
  - Open Questions and Limitations
- Posodobil sem **.**.specify/feature.json
- Preostali čas: **852 sekund**

Specifikacija je pripravljena za naslednje korake (plan, implementacija, testi).
