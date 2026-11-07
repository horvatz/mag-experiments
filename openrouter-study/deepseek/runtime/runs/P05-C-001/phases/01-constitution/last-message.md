Ustava je zapisana v `.specify/memory/constitution.md` (različica 1.0.0, sprejeto 2026-10-09).

**Vsebina**
- Pet kratkih načel iz `PROJECT_RULES.md` in skupne predloge: zaprt obseg sprememb, javni API `/api/` kot edini vir podatkov (brez `/__test/`, `localStorage` ali novih zapisovalnih API-jev), ohranjen potrjeni videz Folio s slovenskimi poimenovanji in dostopnostnimi zahtevami, zahteve R01–R12 kot merilo z dejanskimi dokazi, minimalnost in sledljivost.
- Kratka razvojna pravila (Spec Kit tok, lastni testi v `tests/agent/`, sprotni dokazi v `docs/agent/`, brez vej in commitov) ter upravljanje z nadrejenostjo ustave.

Spremenjena je bila samo dovoljena procesna datoteka; brez novih zahtev, odvisnosti ali arhitekturnih preureditev. Naslednji korak (specifikacija v `docs/agent/P05`) ostaja za `$speckit-specify`, ki ga sproži izvajalnik.
