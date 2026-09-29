# P08 — izvedljive naloge

2026-09-25. Viri: [specifikacija](spec.md), [načrt](plan.md), [izvirne zahteve](../../../task/instructions.md). Izvaja en agent zaporedno; vsaka naloga se začne po prejšnji. Vse naloge so ob pripravi neizvedene. Brez posegov v infrastrukturo ali odvisnosti.

## 1. Priprava

- [ ] [T001] V `docs/agent/P08/verification.md` odpri kratek dnevnik izvedbe: zabeleži preostali čas z `node task/time-budget.mjs`, potrdi obstoječe točke povezave v `src/App.tsx`, nespremenjeno konfiguracijo testov ter dovoljene poti. Rezultate označuj šele po izvedbi; scenarije in pogoje poveži na `docs/agent/P08/spec.md` brez podvajanja.

## 2. Temeljna logika

- [ ] [T002] Dodaj `src/deadlines.ts`: začetni datum `2026-09-21`, ključe/oznake skupin in tip filtra; implementiraj čisto koledarsko razvrstitev s prednostjo `done`, mejami `<0`, `0`, `1..7`, `>7` in petimi števci iz celotnega projekta. Uporabi izrecno UTC pretvorbo datuma v dan, brez trenutne ure, mutacij ali sortiranja. Pokritje: R01–R07.

## 3. Uporabniški potek: pregled in filtriranje

- [ ] [T003] V `src/App.tsx` poveži logiko z `ProjectView`: shrani besedilo in zadnji veljavni datum ter filter `all`; dodaj označeni kontroli `Referenčni datum`/`Pogled rokov`, vseh šest možnosti in pet številskih elementov s predpisanimi `aria-label`. Veljaven vnos takoj preračuna prikaz, prazen ohrani veljavni datum in pokaže točno opozorilo. Obstoječi števci stanj ostanejo iz vseh opravil. Pokritje: R01, R06–R08.

- [ ] [T004] V `src/App.tsx` uporabi isto stabilno filtrirano zaporedje v preglednici in props za `src/TaskBoard.tsx`; ohrani ID-je, povezave, stolpce in podrobnosti. Ohrani stanje ob preklopu pogledov, ob menjavi projekta uporabi obstoječi projektni ključ za ponastavitev; ne piši v API, URL ali shrambo. Dodaj sporočilo prazne skupine v oba pogleda, pet ničel praznega projekta in delujoče kontrole. Pokritje: R07, R09–R12.

## 4. Dodelava in preverjanje

- [ ] [T005] V `src/styles.css` dodaj sloge kontrol in petih števcev z obstoječimi gradniki Folio: prelom kontrol, prilagodljiva mreža in vidni fokus. Ohrani navigacijo, barve, notranje drsenje in brez razširitve cele strani pri 390 pik. Pokritje: R12 in dogovor o vmesniku.

- [ ] [T006] Dodaj `tests/agent/P08.spec.ts` za S01–S04: drugačna ura naprave, več kot deset opravil z drugačnimi ID-ji/podvojenimi naslovi in neurejenimi roki, prednost done v vseh datumskih položajih, meje −1/0/+1/+7/+8, vsota in disjunktnost skupin, šest filtrov ter nespremenjeni števci in vrstni red. Dodaj koledarske prehode meseca/leta/prestopnega februarja/DST v različnih časovnih pasovih z vnaprej določenimi pričakovanimi rezultati. Pokritje: R01–R07.

- [ ] [T007] V `tests/agent/P08.spec.ts` dodaj S05–S08: veljaven → prazen → veljaven datum ob aktivnem filtru, preklop obeh pogledov in iste ID-je, ponastavitev ob menjavi/vrnitvi projekta ter osvežitvi, pregled URL/shrambe, prazne projekte in prazno skupino z vrnitvijo na all, Unicode/ločila in nespremenjene podrobnosti, nič API-zapisov ter 390 pik. Shrani posnetek ozkega prikaza v `docs/agent/P08/` za vizualni pregled. Pokritje: R08–R12.

- [ ] [T008] Izvedi `npm run lint`, `npm run build` in `npm test` z nespremenjeno konfiguracijo, da se izvedejo skupni, razvojni in lastni testi. Izhode shrani v `docs/agent/P08/` in rezultate v `docs/agent/P08/verification.md`. Preglej posnetek Folio, popravi morebitne napake samo v dovoljenih datotekah in ponovi prizadeta preverjanja; neuspehov ali neizvedenih preverjanj ne označi kot uspešnih. Pokritje: R01–R12.

- [ ] [T009] V `docs/agent/P08/spec.md` za vseh R01–R12 dopolni obstoječi register sledljivosti s konkretnimi testi/scenariji, datotekami in mesti kode, izidi ter povezavami na dokaze iz `docs/agent/P08/verification.md`. Posodobi zgodovino in omejitve, v `docs/agent/P08/tasks.md` označi dejansko dokončane naloge ter pripravi kratko predajo sprememb, preverjanj in morebitnih preostalih delov. Nedostopni končni testi ostanejo označeni kot neizvedeni.

## Odvisnosti in zaključek

Zaporedje je T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009. Dodatno potrjevanje uporabnika ni potrebno. Zaključek zahteva izpolnitev R01–R12, dogovora o vmesniku ter resnično dokumentirane rezultate preverjanj; če čas ali okolje kaj preprečita, je to izrecna omejitev predaje, ne opravljen test.
