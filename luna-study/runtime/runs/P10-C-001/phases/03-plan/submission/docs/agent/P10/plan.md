# P10 — izvedbeni načrt

## Tehnični okvir

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8 in Playwright;
uporabniški vmesnik podatke bere prek `/api/`. Odvisnosti, API, strežnik,
skupni tipi, konfiguracija in skupni testi ostanejo nespremenjeni. Zahteve in
sprejemni pogoji so v [specifikaciji](spec.md), R01–R12.

## Odločitve

- Vrstni red in oba sklada bosta lokalno stanje izbranega `ProjectView`.
  Izhodiščni ID-ji se vzamejo iz odgovora API; menjava projekta in ponovni
  zagon ju zato ponastavita, preklop pogleda in podrobnosti pa ju ohranita.
- Stanje bo predstavljeno s permutacijo ID-jev ter skladi celotnih
  permutacij. Prehodna logika bo čista in omejila sklad za razveljavitev na
  20. Prikaz opravil bo iz ID-jev izpeljan iz nespremenjenih podatkov API;
  premik nikoli ne kliče zapisovalnega API-ja.
- Globalno mesto se izračuna iz vrstnega reda ID-jev. Preglednica uporabi
  globalni seznam, tabla pa isti seznam filtrira v obstoječe stalne stolpce,
  s čimer ohrani relativni vrstni red znotraj stanja. Premik na tabli uporabi
  globalnega soseda.
- Kontrole premika bodo ločene od povezav opravil. Zgodovinski gumbi in
  števec bodo skupni za oba pogleda. Obstoječa slovenska imena, dostopne
  oznake, `data-task-id`, stolpci, povzetki stanj ter videz Folio se ohranijo.

## Datoteke in koraki

1. **Prehodi vrstnega reda** — dodati majhen tipiziran pripomoček v
   `src/orderHistory.ts` za sosednjo zamenjavo, reset, undo/redo in omejitev
   zgodovine; pri vsakem prehodu ohraniti množico ID-jev in zavrniti robne
   premike brez stranskih učinkov.
2. **Stanje in preglednica** — v `src/App.tsx` povezati pripomoček z naloženim
   seznamom trenutnega projekta, izpeljati urejeni seznam in mesta, ter dodati
   gumbe premika, undo/redo/reset in statusni števec z določenimi dostopnimi
   imeni. Vrstni red ohraniti med odprtimi podrobnostmi.
3. **Tabla in slog** — v `src/TaskBoard.tsx` sprejeti urejene naloge, mesta in
   callback za globalni premik; ohraniti stolpce stanj in `data-task-id`.
   `src/styles.css` dopolniti le za nove kontrole, vidni fokus in ozko širino;
   pri 390 px mora vodoravno drsenje ostati znotraj preglednice in table.
4. **Regresijsko preverjanje** — dodati lastne scenarije v
   `tests/agent/P10-ordering.spec.ts`: permutacije in enaki naslovi, oba robova,
   undo/redo ter nova veja, meja 20, reset, preklop pogledov/podrobnosti,
   menjava projekta/osvežitev, prazni/enojni podatki, nespremenjena polja in
   odsotnost zapisov, dostopnost ter širina 390 px. Nato izvesti skupna
   preverjanja po `PROJECT_RULES.md` in poročati samo dejanske rezultate.

## Merilo zaključka

Vseh R01–R12 iz specifikacije je implementiranih in preverjenih; ne spremenijo
se polja, stanja, števci, API ali infrastruktura. Vsaka odstopanja in
neizvedena preverjanja se zabeležijo v specifikaciji.
