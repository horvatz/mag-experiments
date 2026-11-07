Pilotna naloga P03 je zaključena. Povzetek:

**Rezultat**
- Specifikacija: `docs/agent/specification.md` (R01–R12 s predikati, sledljivostjo in omejitvami); med izvedbo ni bila spremenjena, popravki so bili le v testnih pričakovanjih in so zabeleženi v `docs/agent/verification.md`.
- Implementacija: `src/search.ts` (NFD normalizacija U+0300–U+036F, male črke, vse besede kot dobesedni podnizi), `src/App.tsx` (iskanje, filtra stanja/osebe, »Počisti filtre«, `role=status` »Prikazano: N od M.«, sporočilo »Ni zadetkov.«, ponastavitev ob menjavi projekta), `src/styles.css` (vrstica filtrov, odzivnost pri 390 px).
- Lastni testi: `tests/agent/P03-agent.spec.ts` – 17 testov A01–A17, povezanih z R01–R12.

**Preverjanja**
- `npm run typecheck` in `npm run lint`: uspešno.
- `npm run check`: **63/63 uspešno** (38 izhodišče + 8 razvojnih P03 + 17 lastnih); dokaz v `playwright-report/html/`.
- Pokrito: združeni filtri z IN, Unicode `č`/`c`, dobesedna ločila, možnosti oseb iz celega projekta, ohranitev filtrov ob preklopu pogleda, ponastavitev ob menjavi projekta/nalaganju, števci, prazna stanja, odsotnost pisanja na `/api/` in prelivanja pri 390 px.

**Omejitve**
- Skritih končnih testov ni bilo mogoče zagnati; ročni vizualni pregled ni bil izveden (videz sloni na obstoječih gradnikih, preverjen odzivno).
- Git v tem okolju ni na voljo (svež izvoz brez zgodovine), zato vej/commitov nisem ustvarjal.
