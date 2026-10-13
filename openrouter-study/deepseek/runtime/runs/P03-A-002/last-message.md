Pilot P03 je zaključen. Vse zahteve R01–R12 so implementirane in preverjene.

**Spremembe**
- `src/taskFilters.ts` – normalizacija NFD/č-c, besedno iskanje, IN-konjunkcija filtrov, možnosti oseb.
- `src/App.tsx` – iskalni vnos, filtra stanja/osebe, gumb `Počisti filtre`, `Prikazano: N od M.`, filtrirani povzetek in oba pogleda, `Ni zadetkov.`, ponastavitev ob menjavi projekta (remount prek `key`).
- `src/styles.css` – slog filtrirne vrstice in prilagoditev na 390 px (brez vodoravnega prelivanja strani).
- `tests/agent/P03-agent.spec.ts` – 10 lastnih preverjanj A01–A10.
- `docs/agent/specification.md`, `docs/agent/verification.md` – specifikacija s sledljivostjo in dejanski rezultati (vključno z zapisom popravka 1.1: ob `Ni zadetkov.` tabla vseeno izriše prazne stolpce).

**Preverjanja**
- `npm run check` (lint + build + vsi testi): **56/56 uspešnih** – izhodišče, 8 razvojnih P03 (desktop + mobile) in 10 agentnih.
- Pokrite so vse zahteve R01–R12; nobena ni neizpolnjena.
- Omejitve: skriti končni testi niso dostopni in niso navedeni kot izvedeni; iskanje polja združuje z presledkom (beseda čez stik dveh polj se ne šteje), kar je zabeleženo v specifikaciji.
