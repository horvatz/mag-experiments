# Naloge P08

Vir: [specifikacija](spec.md), [načrt](plan.md) in vseh R01–R12 iz [izvirnih navodil](../../../task/instructions.md). Izvaja jih isti agent zaporedno, brez sprememb infrastrukture. Oznaka `[x]` pomeni dejansko končano nalogo; testni uspeh zahteva dnevnik. Implementacija je zaključena; dejanski izidi so v [dokazilih](../verification.md).

## 1. Priprava

- [x] T001 V `docs/agent/verification.md` odpri kratek dnevnik izvedbe, potrdi dovoljene datoteke iz `plan.md`, preveri čas z `node task/time-budget.mjs` ter zabeleži začetni status preverjanj kot neizveden.

## 2. Osnova

- [x] T002 V `src/deadlines.ts` dodaj fiksno referenco, ključe in imena skupin, pretvorbo koledarskega datuma v dan UTC, prednostno razvrščanje `done`, števce celotnega seznama in stabilno filtriranje brez spreminjanja vhodnih opravil. Pokrij pravila R02–R07 in veljavne prestopne datume R12; odvisno od T001.

## 3. Uporabniški scenariji po prednosti

- [x] T003 V `src/App.tsx` dodaj projektno lokalno stanje vsebine polja, zadnje veljavne reference in skupine, označeni datum ter izbirnik, pet dostopnih števcev in opozorilo ob praznem datumu. Ohranitev zadnjega izračuna, začetni datum `2026-09-21`, `all` ter ponastavitev ob menjavi projekta/osvežitvi morajo slediti R01, R06–R08, R10. Brez shrambe ali filtrskih podatkov v URL; odvisno od T002.

- [x] T004 V `src/App.tsx` uporabi isto filtrirano zaporedje za preglednico in vhod obstoječega `src/TaskBoard.tsx`, ohrani stanje ob preklopu in dodaj predpisano prazno skupino. Ohrani regijo/stolpce table, ID-je, vrstni red, bralne podrobnosti in celotni pregled stanj. Preveri pet ničel za prazne projekte. R07, R09, R11–R12; odvisno od T003.

- [x] T005 V `src/styles.css` oblikuj nove kontrole, opozorilo in števce z obstoječimi spremenljivkami Folio, vidnim fokusom ter prelamljanjem pri 390 pik. Ohranjen mora biti notranji pomik preglednice/table brez razširitve cele strani. R12; odvisno od T004.

## 4. Preverjanje in zaključek

- [x] T006 V `tests/agent/P08.spec.ts` dodaj scenarije S1–S4: drugačna sistemska ura, vse skupine in nespremenjeni števci, meje −1/0/+1/+7/+8, `done` z različnimi roki, poljubni ID-ji, ponovljeni naslovi, več kot deset opravil in vrstni red. Dodaj koledarske primere čez mesec/leto, prestopni februar in DST v različnih pasovih; pričakovane rezultate podaj neodvisno od produkcijske logike. R01–R07, R12; odvisno od T005.

- [x] T007 V `tests/agent/P08.spec.ts` dodaj scenarije S5–S8: veljaven/prazen/popravljen datum ob aktivnem filtru in preklopu pogledov, primerjavo ID-jev, menjavo projektov, osvežitev in odsotnost filtrskih zapisov v URL/shrambi; prazne projekte in skupine z vrnitvijo na `all`, bralne podrobnosti in odsotnost zapisov na API. Preveri širino 390 pik in shrani posnetek za vizualni pregled Folio v `docs/agent/P08/`. R08–R12; odvisno od T006.

- [x] T008 Izvedi `npm run check` z obstoječo konfiguracijo: lint, preverjanje tipov, gradnjo, skupne teste API/vmesnika, razvojne P08 teste in lastne teste. Dnevnik shrani v `docs/agent/P08/check.log`, dejanske izide in vizualni pregled v `docs/agent/verification.md`. Napake popravi samo v dovoljenih datotekah ter ponovi ustrezna preverjanja. R01–R12; odvisno od T007.

- [x] T009 V `docs/agent/P08/spec.md` za vseh R01–R12 dopolni sledljivost s točnimi testi, deli kode, izidi in povezavami na dokaze iz `docs/agent/verification.md`; posodobi zgodovino in omejitve. V `docs/agent/P08/plan.md` zabeleži morebitna dejanska odstopanja, v `docs/agent/P08/tasks.md` označi le dokončano delo. Pripravi jedrnato predajo sprememb, preverjanj in nepreverjenih delov; končnih nedostopnih testov ne označi kot opravljenih. Odvisno od T008.

## Odvisnosti in zaključni pogoj

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009. Zaključek zahteva izvedbo vseh nalog ter preverljivo sledljivost iz skupne predloge; morebitne blokade ostanejo izrecno zapisane. Ne ustvarjamo vej, commitov ali dodatnih agentov. Čas preverjamo sproti in zadnjo minuto skupnega roka namenimo predaji.
