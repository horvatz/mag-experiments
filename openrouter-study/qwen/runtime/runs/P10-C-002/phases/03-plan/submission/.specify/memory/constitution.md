# Projektna ustava — Pilot P10

**Datum sprejetja:** 2026-11-01

## Načela

- **Folio ostaja celoten dizajn:** Ohrani potrjen vizualni slog, poimenovanja in razporeditev.
- **Minimalne spremembe infrastrukture:** Ne spremeni strežnika, odvisnosti, skupnih tipov ali preverjanj.
- **Lokalna reševanja:** Vsi premiki in razveljavitve so permutacije istih opravil; brez zapisov na API.
- **Javni API samo za branje:** Podatki se berejo le prek `/api/`; `/__test/` je dostopen le za testske namene.
- **Slovenski besedilni sloj:** Ohrani vsebino v slovenščini; Unicode in ločila so dovoljena.

## Nepogodljiva pravila

- Spreminjaj samo `src/`, `tests/agent/` in `docs/agent/`.
- Datoteki Spec Kit `.specify/memory/constitution.md` in `.specify/feature.json` sta edina procesna izvzeta.
- Razvojni testi `/__test/` ne sme uporabljati uporabniški vmesnik.
- Št. prejšnjih permutacij za razveljavo: 20.
- Pomembne spremenljivke: id opravila, globalni in relativni vrstni red, zgodovina in ponovitve.
