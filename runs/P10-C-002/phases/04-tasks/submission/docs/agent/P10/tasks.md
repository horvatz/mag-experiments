# P10 — izvedbene naloge

Datum: 2026-09-26. Vira: [spec.md](spec.md) in [plan.md](plan.md); izvirne [R01–R12](../../../task/instructions.md) ostajajo merilo. Naloge izvaja isti agent zaporedno T001 → T009; vsaka uporablja rezultat predhodnih nalog. Oznaka `[x]` pomeni dejansko zaključeno delo. Brez posegov v infrastrukturo ali odvisnosti.

## Priprava

- [ ] [T001] Potrdi meje sprememb in začetno stanje `src/App.tsx`, `src/TaskBoard.tsx`, `src/useResource.ts` ter obstoječo konfiguracijo preverjanj; ustvari kratek `docs/agent/P10/verification.md` za beleženje ukazov, izidov in omejitev. Preveri čas z `node task/time-budget.mjs`.

## Temelj: lokalni prehodi

- [ ] [T002] Dodaj `src/taskOrder.ts`: stanje z začetnim in trenutnim zaporedjem ID-jev ter skladoma undo/redo, inicializacijo, veljavne globalne premike, neveljavna dejanja brez učinka, undo, redo in razveljavljiv reset po predikatih v specifikaciji. Omeji pretekle posnetke na 20, ohrani vhodne podatke in redo pri neveljavnem dejanju. Pokritje: R01–R08, R11–R12.

## Uporabniška zgodba 1: premik in zgodovina v preglednici

- [ ] [T003] Dodaj `src/TaskList.tsx` in `src/TaskOrderControls.tsx`, v `src/App.tsx` poveži sekcijo po uspešnem nalaganju. Inicializiraj reducer iz prejetih ID-jev, izriši urejena opravila in mesta, gumbe gor/dol zunaj povezav, skupne undo/redo/reset ter točen status zgodovine. Ohraniti je treba prazno stanje, enočlenski projekt, `data-task-id` in povzetek stanj. Pokritje: R01–R08, R11–R12.

## Uporabniška zgodba 2: tabla in življenjska doba

- [ ] [T004] V `src/TaskBoard.tsx` uporabi urejeno polje, globalna mesta in skupne kontrole zunaj povezav; ohrani tri stalne stolpce in njihov relativni red. V `src/App.tsx`/`src/TaskList.tsx` zagotovi isto stanje ob preklopu pogleda in podrobnostih ter ponovno inicializacijo ob menjavi projekta in osvežitvi. Brez zapisov ali trajne shrambe. Pokritje: R09–R12.

## Dodelava in dokazi

- [ ] [T005] Dopolni `src/styles.css` za nove kontrole skladno s Foliem: obstoječe barve, zmerni razmiki, vidni fokus, ovijanje orodne vrstice, notranje drsenje brez širjenja cele strani pri 390 px. Ohrani obstoječa dostopna imena in videz kartic. Pokritje: R12 in dogovor UI.

- [ ] [T006] V `tests/agent/P10.spec.ts` dodaj smiselne teste prehodov: več undo/redo z neodvisnimi pričakovanimi zaporedji, ponovljena robna in neznana dejanja brez spremembe redo, razvejitev po undo, 21 premikov/20 undo/20 redo, reset kot eno razveljavljivo dejanje in reset brez učinka pri izvornem redu. Preveri nespremenljivost vhodov in ohranitev množice ID-jev. Scenariji S02–S05; R02–R08, R12.

- [ ] [T007] V `tests/agent/P10.spec.ts` dodaj UI preverjanja S01–S08 z nadzorovanimi GET odgovori samo v testu: drugačni ID-ji in vrstni red, enaki naslovi/Unicode, več kot deset opravil, prazna in enočlenska projekta; globalni premik med statusi na tabli; oba sklada pri preklopu pogleda in podrobnostih; ponastavitev ob projektu/povratku/osvežitvi; mesta, števci, onemogočenost, pravilne podrobnosti in odsotnost API zapisov. Pri 390 px preveri širino in uporabo kontrol; shrani posnetek Folia v `docs/agent/P10/` in ga vizualno preglej. Pokritje: R01–R12 skupaj s T006.

- [ ] [T008] Zaženi `npm run check` za lint, tipe, gradnjo, skupne regresije, razvojne D01–D04 in lastne teste; shrani izhod v `docs/agent/P10/check.log` ter izid v `docs/agent/P10/verification.md`. Morebitne napake popravi samo v dovoljenih datotekah in ciljno ponovi potrebna preverjanja z ločenim dnevnikom. Neizvedene ali neuspešne teste jasno zabeleži.

- [ ] [T009] Dopolni tabelo sledljivosti R01–R12 v `docs/agent/P10/spec.md` s konkretnimi datotekami/funkcijami, imeni izvedenih testov in povezavami na dokaze v `docs/agent/P10/verification.md`; posodobi zgodovino specifikacije in stanje nalog v `docs/agent/P10/tasks.md`. Navedi preostale omejitve in nedostopne končne teste. Preveri čas in zadnjo minuto nameni predaji.

## Merilo zaključka

Izvedeni prehodi ustrezajo predikatom v specifikaciji, obe predstavitvi sledita istemu globalnemu redu, Folio in infrastruktura sta ohranjena. Vsaka R01–R12 ima določljiv dokaz ali izrecno zapisano omejitev; uspeh se ne sklepa iz samega seznama nalog.
