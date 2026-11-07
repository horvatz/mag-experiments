Konstitucija je zapisana v `.specify/memory/constitution.md` (1.0.0, sprejeta 2026-11-01) — kratka projektna načela, izpeljana iz `PROJECT_RULES.md` in skupne predloge, brez novih zahtev, odvisnosti ali arhitekturnih preureditev:

- **I. Zvestoba izvirnim zahtevam** — R01–R12 in skupna predloga so merilo; sledljivost do pogoja, kode in dejansko izvedenega preverjanja.
- **II. Nespremenljiva skupna infrastruktura (NON-NEGOTIABLE)** — dovoljeni le `src/`, `tests/agent/`, `docs/agent/` ter obe procesni datoteki Spec Kit.
- **III. Javni vmesnik je edini vir podatkov** — branje/pisanje samo prek `/api/`, brez `/__test/`, `localStorage` ali lokalnih kopij.
- **IV. Ohranjen potrjeni dizajn Folio** — `docs/dizajn.md`, slovenska poimenovanja, fokus, ozka širina, ohranjena dostopna imena.
- **V. Lokalno in preverljivo stanje** — stanje vezano na trenutni projekt, brez trajne shrambe/URL-ja, dokazi zapisani sproti.

Vključena sta še razdelek o poteku dela Spec Kit (brez vej in commitov) in pravila upravljanja. Drugih namer, ki bi jih bilo treba preložiti, v argumentih ni bilo. Preostanek faze: ~1168 s.
