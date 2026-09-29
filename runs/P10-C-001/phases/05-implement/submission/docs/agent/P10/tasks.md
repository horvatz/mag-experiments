# P10 — izvedbene naloge

2026-09-22 · Podlagi: [specifikacija](spec.md) in [načrt](plan.md). Izvirne R01–R12 ostajajo merilo. Naloge izvaja isti agent zaporedno, brez delegiranja ali sprememb infrastrukture. Vse naloge so ob nastanku neizvedene; kljukico dodaj šele po izpolnitvi pogoja.

## Priprava

- [x] T001 V `docs/agent/verification.md` vzpostavi kratek dnevnik izvedbe: navedi uporabljeni `spec.md`/`plan.md`, dovoljene poti in stanje preverjanj »še neizvedeno«. Preveri čas z `node task/time-budget.mjs`; ne nameščaj odvisnosti in ne spreminjaj nastavitev.

## Temelj — stanje in pravila

- [x] T002 V `src/taskOrder.ts` implementiraj začetno stanje in čisti reducer za premik, undo, redo in reset po P1–P6. Hrani ID-je in celotne posnetke, omeji undo na 20; pred spremembo preveri rob/neznan ID, pri neveljavnem dejanju ohrani oba sklada. Reset pri izvornem zaporedju je brez učinka. Pogoj: vsa dejanja ohranijo množico ID-jev in vhodnih polj ne mutirajo. Pokritje R01–R08, R11–R12; odvisno od T001.
- [x] T003 V `tests/agent/taskOrder.spec.ts` dodaj smiselne teste reducerja: vnaprej določena zaporedja premikov/undo/redo, oba roba in neznan ID, ponovljen rob z nepraznim redo, nova veja, reset/undo/redo, nespremenjen reset z redo, 21+ premikov in izčrpanje 20 undo ter vseh redo, nič/eno opravilo in zamrznjeni vhodi. Preveri celotne permutacije, ne samo števcev; zaženi ciljno prek obstoječega projekta `agent` in zapiši rezultat v `docs/agent/verification.md`. Pokritje R01–R08, R11–R12; odvisno od T002.

## Uporabniška zgodba 1 — premikanje v obeh pogledih

- [x] T004 V `src/App.tsx` izloči `ProjectTasks` z inicializacijo reducerja iz že naloženih opravil, razreši urejeno polje po ID-ju in uporabi ga v preglednici ter `src/TaskBoard.tsx`. Dodaj skupni `src/TaskOrderControls.tsx` za globalno mesto in gumba gor/dol, zunaj povezav in z natančnimi dostopnimi imeni. Ohranita se `data-task-id` in stalni stolpci; tabla premika globalnega soseda. Komponenta ohranja stanje ob pogledu/podrobnostih in se ponastavi prek obstoječega ključa projekta. Pokritje R01–R03, R09–R10, R12; odvisno od T003.

## Uporabniška zgodba 2 — zgodovina in začetni vrstni red

- [x] T005 V `src/App.tsx` poveži gumbe `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red` in status `Zgodovina vrstnega reda` s stanjem reducerja. Točno besedilo števca in omogočenost izpelji iz skladov oziroma enakosti permutacij. Kontrole delujejo tudi pri praznem projektu in enem opravilu. Podatki, števci stanj in podrobnosti ostanejo nespremenjeni; brez zapisov API/URL/trajna shramba. Pokritje R04–R08, R10–R12; odvisno od T004.

## Dodelava in preverjanje

- [x] T006 V `src/styles.css` dopolni Folio z majhnimi kontrolami premika in prelomljivo vrstico zgodovine. Ohranijo se videz kartic, meni, barve in vidni fokus; pri 390 pikah ni širjenja cele strani, tabela/tabla drsita znotraj obstoječih vsebnikov. Pokritje R12; odvisno od T005.
- [x] T007 V `tests/agent/P10.spec.ts` dodaj scenarije S1–S6: poljubni ID-ji, enaki naslovi/Unicode in več kot deset opravil; globalna mesta in premiki v obeh pogledih, tudi med statusoma; več undo/redo, nova veja/reset, števci/gumbi; oba sklada ob preklopu pogleda in odpiranju/zapiranju podrobnosti; menjava projekta/vrnitev/osvežitev; nič/eno opravilo in oba prazna projekta; nespremenjena polja/podrobnosti/števci, nič zapisovalnih zahtev, kontrole zunaj povezav ter širina 390 pik. Uporabi testne GET odzive samo v testih. Skupaj s T003 pokrij vseh R01–R12; odvisno od T006.
- [x] T008 Zaženi `npm run check` za lint, tipe/build, skupne API/baseline teste, razvojne D01–D04 in lastne teste. Izhod shrani v `docs/agent/P10/check.log`. Preglej oba prikaza Folio na računalniku in pri 390 pikah ter zapiši dokaz v `docs/agent/verification.md`. Morebitne napake popravi le v dovoljenih datotekah in ponovi prizadeta preverjanja; zabeleži tudi neuspešne zagone. Pogoj: izidi so dejanski, neizvedena preverjanja izrecno označena. Odvisno od T007.
- [x] T009 V `docs/agent/P10/spec.md` posodobi tabelo sledljivosti vseh R01–R12 s končnimi datotekami/simboli, imeni testov in povezavami na rezultate v `docs/agent/verification.md`; dodaj zgodovino sprememb. V `docs/agent/P10/tasks.md` označi samo zaključene naloge. Preveri dovoljeni obseg sprememb in v predaji navedi rezultate, morebitne odprte zahteve ter nedostopne končne teste. Zadnjo minuto skupnega časa nameni tej predaji. Odvisno od T008.

## Pokritost in zaključek

R01–R03: T002–T004, T007. R04–R08: T002–T003, T005, T007. R09: T004, T007. R10: T004–T005, T007. R11: T002–T003, T005, T007. R12: T002–T008. T009 zaključi sledljivost vseh zahtev po skupni predlogi. Nobena naloga ne dovoljuje spreminjanja strežnika, odvisnosti, konfiguracije, skupnih testov ali uradnih Spec Kit datotek.
