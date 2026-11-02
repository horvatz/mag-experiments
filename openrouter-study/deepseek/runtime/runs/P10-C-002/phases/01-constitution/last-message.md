Korak `$speckit-constitution` je zaključen.

**Izdelek**
- `.specify/memory/constitution.md` — nova ustava projekta Folio (P10), različica 1.0.0, sprejeta 2026-11-01 (datum pilota).
- Pet kratkih načel: I. stroge meje sprememb (NEDOGOVORLJIVO), II. potrjeni videz Folio, III. javni API `/api/` kot edini vir podatkov (brez `/__test/`, `localStorage`), IV. dokazi o preverjanju (R01–R12 s pogojem, kodo in dejanskim testom), V. sledljiva specifikacija po skupni predlogi.
- Dodatne omejitve in razvojni tok le ponavljajo pravila iz `PROJECT_RULES.md` in `task/instructions.md`; nobenih novih zahtev, odvisnosti ali arhitekturnih preureditev.

**Opombe**
- Argumenti niso vsebovali ne-upravljavskih namer, zato razdelek `Next Actions` ni potreben; specifikacija sledi v naslednjem koraku (`$speckit-specify`).
- `.specify/feature.json` je v tem peskovniku samo berljiv, zato ga nisem mogel dopolniti s `feature_directory`; korak specify ga bo moral zapisati sam (iz `SPECIFY_FEATURE_DIRECTORY`).
- Brez vej, commitov in sprememb kode. Preostanek proračuna: 1140 s.
