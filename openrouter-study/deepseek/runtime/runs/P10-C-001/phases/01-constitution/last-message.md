Korak `$speckit-constitution` je opravljen.

**Opravljeno**
- Prebran `.agents/skills/speckit-constitution/SKILL.md` ter viri: `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md`, `README.md`, `docs/dizajn.md`.
- `.specify/memory/constitution.md` nadomeščen s kratko ustavo projekta Folio (P10), verzija 1.0.0, ratificirana 2026-10-09.

**Načela**
- Omejena površina sprememb (dovoljene poti, berljiva infrastruktura).
- Javni API `/api/` kot edini vir podatkov; brez `/__test/`, `localStorage` in novih zapisovalnih API-jev.
- Ohranjen potrjeni dizajn Folio, slovenski vmesnik in dostopnost.
- Preverjeno, ne domnevano: R01–R12 se vežejo na dejansko izvedene teste; neizvedeni testi se ne navajajo kot uspešni.
- Lokalno stanje trenutnega projekta, brez širjenja obsega in trajne shrambe.

Dodatna omejitve in potek razvoja so povzeti po skupni predlogi P10; nobenih novih zahtev ali arhitekturnih sprememb ni bilo dodanih. V vhodu ni bilo zunaj-upravljavskih namer, zato razdelek `Next Actions` ni potreben. Časovni ostanek: ~1110 s.
