Pilotna naloga P08 je zaključena v okviru časovne omejitve.

**Rezultat**
- Specifikacija: `docs/agent/specification.md` (R01–R12 s predikati, sledljivostjo in zapisom sprememb — zahtev med izvedbo ni bilo treba spreminjati).
- Implementacija: `src/dueGroups.ts` (koledarska logika v UTC), `src/App.tsx` (referenčni datum `2026-09-21`, izbirnik `Pogled rokov` all/overdue/today/week/later/done, pet števcev z `aria-label="Število rokov <ključ>"`, filtriranje preglednice in table, opozorilo ob praznem datumu z ohranjenim zadnjim veljavnim izračunom), `src/styles.css` (odzivna orodna vrstica in petstolpčni povzetek).
- Lastni testi: `tests/agent/P08.spec.ts` — 12 preverjanj za R01–R12, vključno s prestopnim letom, mejami +1/+7/+8, nespremenjenimi števci ob filtru, skladnostjo tabele/table, ponastavitvijo ob menjavi projekta/osvežitvi, praznimi stanji in širino 390 px.

**Preverjanja**
- `npx tsc --noEmit` in `npx eslint src tests/agent`: brez napak.
- `npm run check`: **58/58 uspešnih** (38 izhodiščnih, 8 razvojnih P08, 12 lastnih).
- Dokazi, povezave z zahtevami in omejitve so v `docs/agent/verification.md`.

**Omejitve**
- Skriti končni testi niso dostopni; preverjanje temelji na izhodiščnih, razvojnih in lastnih testih.
- Pri popolnoma praznem projektu se ohrani izhodiščni prikaz, pri prazni skupini nepraznega projekta pa sporočilo `Ni opravil v izbrani skupini.` v obeh pogledih.
- Neizpolnjenih zahtev ni; ročni ogled v brskalniku ni bil izveden (videz in odzivnost preverjena strojno).
