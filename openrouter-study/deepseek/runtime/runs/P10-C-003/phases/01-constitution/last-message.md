Konstitucija je zapisana v `.specify/memory/constitution.md`.

**Kaj vsebuje**
- Načelo I: omejen obseg sprememb (`src/`, `tests/agent/`, `docs/agent/`, procesni datoteki) in nespremenljiva infrastruktura.
- Načelo II: podatki izključno prek javnega `/api/`, brez `/__test/`, `localStorage` in novih zapisovalnih API-jev.
- Načelo III: ohranjen potrjeni dizajn Folio, slovenska poimenovanja in dostopnost (390 px, viden fokus).
- Načelo IV: sledljivost R01–R12 s predikati, kodo in dejansko izvedenimi dokazi.
- Načelo V: preverjanje s skupnimi in lastnimi testi, brez označevanja neizvedenih testov kot uspešnih.
- Upravljanje: različica 1.0.0, sprejeto 2026-10-13, spremembe infrastrukture le z vnaprej dogovorjeno posodobitvijo izhodišča.

Datoteka `.specify/feature.json` ostaja prazna; korak `speckit-specify` jo bo iz `SPECIFY_FEATURE_DIRECTORY` samodejno nastavil na `docs/agent/P10`. V tem koraku ni bilo odloženih ne-governančnih namer, zato seznama Next Actions ni.
