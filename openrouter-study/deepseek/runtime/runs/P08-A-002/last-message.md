Pilotna naloga P08 je zaključena. Vse zahteve R01–R12 so implementirane in preverjene.

**Rezultat**
- `docs/agent/specification.md` — specifikacija po skupni predlogi s predikati za R01–R12, sledljivostjo in zapisom popravkov.
- `src/deadlines.ts` — čista koledarska logika: fiksni `REFERENCE_DATE = 2026-09-21`, ordinali prek `Date.UTC` (neodvisno od časovnega pasu/DST), `classifyTask`/`countGroups`/`filterTasks`.
- `src/DeadlineFilter.tsx` — `input type=date` (Referenčni datum), `select` Pogled rokov (all/overdue/today/week/later/done), pet števcev z `aria-label="Število rokov <ključ>"` in `role=alert` ob praznem polju.
- `src/App.tsx` — filtrirane vrstice/kartice za oba pogleda, ohranjeno stanje ob preklopu pogleda, ponastavitev ob menjavi projekta/osvežitvi, sporočilo `Ni opravil v izbrani skupini.`; brez URL-ja ali trajne shrambe.
- `src/styles.css` — Folio slog novih kontrol z ustrezno mobilno postavitvijo.
- `tests/agent/p08.spec.ts` — 10 lastnih preverjanj (A00–A09): meje skupin, prestopni februar, prehod leta, prazno polje, oba pogleda, ponastavitve, prazni primeri, disjunktnost.
- `docs/agent/verification.md` — dejansko izvedeni ukazi, rezultati, povezave z zahtevami in omejitve.

**Preverjanje**
- `npm run check` (lint + build + vsi testi): **56 uspešnih, 0 neuspešnih** — 14 api, 12 desktop, 12 mobile, 4 development-desktop, 4 development-mobile (D01–D04), 10 agent (A00–A09).
- Ročni pregled z ločenim dev strežnikom ni bil izveden; zapisano med omejitvami skupaj z nepreverjeno menjavo časovnega pasu v brskalniku in nedostopnimi končnimi testi.
