Naloga je zaključena. Povzetek:

**Rezultat**
- `npm run check` je uspešen: lint, tipi, gradnja in **55/55 preverjanj** (14 API/strežnik, 24 skupnih UI, 8 razvojnih P10, 9 lastnih).
- Implementiran lokalni vrstni red z razveljavitvami: premiki gor/dol z globalnim sosedom, sklada razveljavitev/ponovitev (omejitev 20), reset na izhodišče kot eno dejanje, števec `Razveljavitve: U. Ponovitve: R.`, prazna in eno-opravilna projekta ostaneta uporabna.
- Preglednica prikazuje globalni vrstni red (`Mesto opravila <id>`), tabla podzaporedja po stolpcih stanj; gumbi so zunaj povezave opravila. Vse spremembe so lokalne – nobenih zapisov na `/api/`, števci stanj in podrobnosti nespremenjeni.

**Datoteke**
- `docs/agent/specification.md` – specifikacija po predlogi s predikati R01–R12.
- `src/useTaskOrder.ts` (novo), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` – implementacija.
- `tests/agent/p10.spec.ts` – lastni testi T01–T09 (meje, kapaciteta 20, reset, prazni/enojni projekt, pogledi/podrobnosti/projekt/osvežitev, 390 px, brez zapisov).
- `docs/agent/verification.md` – dejanska preverjanja, povezave na zahteve, omejitve.

**Omejitve**
- Skriti končni testi niso dostopni in niso navedeni kot opravljeni; ročni pregled v brskalniku ni bil izveden, odzivnost je pokrita avtomatsko (390 px in mobilni projekti).
- Neizpolnjenih zahtev R01–R12 ni; med izvedbo so bile popravljene le napačne pričakovane vrednosti v lastnih testih (zapisano v `verification.md`).
