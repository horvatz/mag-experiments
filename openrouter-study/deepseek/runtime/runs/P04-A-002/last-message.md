Naloga P04 je zaključena po postopku A (en agent).

**Rezultat**
- Specifikacija: `docs/agent/specification.md` (R01–R12 s predikati, zgodovina sprememb 1.0 → 1.1).
- Implementacija: `src/sortTasks.ts` (normalizacija NFD + odstranitev U+0300–U+036F + male črke, UTF-16 primerjava, rang statusov, stabilen tie-break po izvornem indeksu, `original` vedno vrne izvorno polje), kontrole v `src/App.tsx` (štirje `select` z imeni Primarni/Sekundarni ključ in smer, gumb `Izvorni vrstni red`, stanje v `ProjectView` z `key={project.id}`), slogi v `src/styles.css`.
- Lastni testi: `tests/agent/P04-agent.spec.ts` (A01–A17: normalizacija, UTF-16, smeri brez obrata izenačenih, sekundarni ključ, tabla, ohranitev/ponastavitev nastavitev, prazno/eno opravilo, brez zapisov, enaki naslovi, 390 px).
- Poročilo: `docs/agent/verification.md` (izvedeni ukazi, sledljivost, omejitve).

**Preverjanja**
- `npm run check`: **64/64 uspeh** — 38 preverjanj izhodišča, 8 razvojnih P04 (D01–D04 × desktop/mobile), 18 lastnih; `typecheck`, `lint` in `vite build` čisti.
- Ločeno: `npx playwright test --project=development-desktop --project=development-mobile --project=agent` → 26/26.

**Omejitve**
- Končni ocenjevalni testi niso dostopni; ročni vizualni pregled ni bil izveden (videz posredno prek izhodiščnih testov in preverjanja prelivanja pri 390 px).
- Repozitorij je svež izvoz brez zgodovine Git, zato veja/objava nista bili izvedeni; spremenjene so le datoteke v `src/`, `tests/agent/` in `docs/agent/`. Vse zahteve R01–R12 so izpolnjene.
