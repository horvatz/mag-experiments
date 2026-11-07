**Popravki zaključeni (vloga: implementer, nadaljevanje)**

**Ugotovitve pregleda**
- R05 (utemeljena, popravljeno): sekundarni select je ponujal `original`. `src/App.tsx` zdaj gradi `SECONDARY_OPTIONS` iz eksplicitnega seznama `none, title, assignee, status, dueDate`; primarni select ostaja `original, title, assignee, status, dueDate`. Lastni test R01 zdaj preverja oba seznama možnosti.
- R06 v specifikaciji (utemeljena, a zunaj moje vloge): predikata za primer primarnega `original` res ne zajemata izjeme. Implementacija že sledi izrecnemu pravilu R06 (`original` vrne T ne glede na sekundarni ključ in smeri), zato koda ni napačna; uskladitev formule mora opraviti avtor specifikacije, specifikacije pa v tej vlogi ne smem spreminjati.

**Preverjanja po popravku**
- `npm test`: **57 uspešnih, 0 neuspešnih** (38 osnovnih/API + 8 razvojnih D01–D04 desktop/mobile + 11 lastnih).
- `npx playwright test --project=agent --project=development-desktop --project=development-mobile`: 19/19.
- `npm run typecheck` in `npm run lint`: brez napak.

Obravnavo obeh ugotovitev in rezultate sem sproti zapisal v `docs/agent/verification.md`. Spremenjeni so le `src/App.tsx`, `tests/agent/p04-sorting.spec.ts` in `docs/agent/verification.md`; specifikacija in pregled nista bila dotaknjena.
