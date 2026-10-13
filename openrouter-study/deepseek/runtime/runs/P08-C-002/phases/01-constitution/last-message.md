Korak `$speckit-constitution` je opravljen.

**Opravljeno**
- Ustvaril sem `.specify/memory/constitution.md` (različica 1.0.0, sprejeto 2026-10-13) iz `PROJECT_RULES.md` in skupne predloge.
- Pet kratkih načel, brez novih zahtev, odvisnosti ali arhitekturnih sprememb:
  - I. Zvestoba izvirnim zahtevam R01–R12 in poštena sledljivost.
  - II. Zaprte meje sprememb (`src/`, `tests/agent/`, `docs/agent/` + dve procesni datoteki Spec Kit).
  - III. Podatki izključno prek javnega `/api/`, brez `/__test/` in `localStorage`.
  - IV. Ohranjen potrjeni dizajn Folio in dogovor o vmesniku.
  - V. Poštena predaja z dejansko izvedenimi preverjanji.
- Upravljanje: ustava je nadrejena, spremembe dokumentirane; stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen če zahteva določa drugače.
- Aplikacijska koda, testi in infrastruktura se niso dotaknili. Ni bilo neupravljalskih namer, zato `Next Actions` niso potrebne.

Preostanek proračuna: ~1046 s; porabljenega približno 150 s. Pripravljen na naslednji korak.
