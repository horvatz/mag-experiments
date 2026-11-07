**Implementacija zaključena (vloga: implementer, P04/B)**

- `src/sorting.ts` (novo): `normalizeText` (NFD, odstranitev U+0300–U+036F, male črke), `compareText` (UTF-16 `<`/`>`), `compareKey` (rang stanj, kronološki datumi), `sortTasks` — smer je le predznak primerjave, izenačitve po izvornem indeksu, primarni `original` vedno vrne T.
- `src/App.tsx`: štiri kontrole (`Primarni/Sekundarni ključ`, `Primarna/Sekundarna smer`) in gumb `Izvorni vrstni red`; stanje je lokalno v `ProjectView` (ponastavitev ob menjavi projekta prek `key={project.id}`), isto razvrščeno polje gre v preglednico in tablo.
- `src/styles.css`: prilagodljive kontrole Folio, brez prelivanja pri 390 px.
- `tests/agent/p04-sorting.spec.ts`: 11 lastnih testov za R01–R12; zapis v `docs/agent/verification.md` (potek, sledljivost, izidi, omejitve).

**Dejansko preverjeno**
- `npm test`: **57 uspešnih, 0 neuspešnih** (38 osnovnih/API + 8 razvojnih D01–D04 desktop/mobile + 11 lastnih).
- `npm run typecheck`, `npm run lint`, `npm run build`: brez napak.

**Omejitve**
- Napake predane specifikacije nisem našel; skriti končni testi niso dostopni.
- `apply_patch` v peskovniku ni dosegljiv in heredoc v zsh ni dovoljen, zato so bile datoteke zapisane prek PTY (`cat >`) in `node` popravkov ter po vsakem koraku preverjene.
- Spremenjeni so le `src/`, `tests/agent/` in `docs/agent/verification.md`; specifikacija, njena zgodovina in review zapisi niso bili dotaknjeni.

Čas prevzame pregledovalec; rezervni čas do skupne omejitve je še ~8 minut.
