Korak `$speckit-constitution` je opravljen.

**Izdelek**
- `.specify/memory/constitution.md` — nova ustava Folio (`mag-app`), različica 1.0.0, ratificirana 2026-10-30, izpeljana iz `PROJECT_RULES.md` in skupne predloge:
  - I. Meja dovoljenih sprememb (`src/`, `tests/agent/`, `docs/agent/`; infrastruktura in skupni testi nespremenjeni) — NON-NEGOTIABLE
  - II. Javni API `/api/` kot edini vir podatkov; brez `/__test/` v vmesniku, brez nadomeščanja strežnika
  - III. Ohranjen potrjeni videz Folio in slovenska poimenovanja
  - IV. Resnično preverjanje in dokazila (brez navajanja neizvedenih testov kot uspešnih)
  - V. Dokumentiranje sprememb s sledljivostjo zahtev
  - Dodatne omejitve, razvojni potek in governance (spremembe zahtevajo usklajeno posodobitev izhodišča)

**Opombe**
- Samo projektna pravila; brez novih zahtev, odvisnosti ali arhitekturnih preureditev.
- Uradne predloge Spec Kit so v tem pilotu samo berljive, zato ni bilo propagacije v odvisne artefakte.
- Ni bilo zunanjih (ne-governance) namer, zato ni razdelka Next Actions; naslednji korak izvajalnik sproži sam (`$speckit-specify`).
- Proračun: porabljenih ~130 s od 1199 s (`node task/time-budget.mjs`).
