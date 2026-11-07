Ustava je zapisana v `.specify/memory/constitution.md` (različica 1.0.0, sprejeto 2026-10-10).

**Opravljeno**
- Iz `PROJECT_RULES.md`, skupne predloge in `task/instructions.md` izpeljanih pet temeljnih načel: omejene spremembe (`src/`, `tests/agent/`, `docs/agent/` + procesni izjemi), javni API `/api/` kot edini vir podatkov brez `/__test/`, ohranjen videz Folio in slovenska poimenovanja, sledljivost R01–R12 z dejanskimi dokazi, prepoved širjenja obsega.
- Dodane omejitve (nepromenjeno izhodišče, lokalno stanje, 390 px), razvojni tok (skupni + lastni testi, resnično poročanje) in upravljanje (izvirne zahteve so merilo; spremembe se dokumentirajo).
- Brez novih zahtev, odvisnosti ali arhitekturnih preureditev; nobenih odloženih neupravljavskih namer, zato `Next Actions` ni potreben.

**Preostanek**: 1001 s do roka faze; korak končan v ~3 minutah. Naslednji korak lahko začne izdelavo specifikacije v `docs/agent/P06`.
