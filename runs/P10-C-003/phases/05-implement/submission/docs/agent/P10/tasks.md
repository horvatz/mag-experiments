# Naloge P10

Datum: 2026-09-25. Viri: [specifikacija](spec.md), [načrt](plan.md),
[izvirne zahteve](../../../task/instructions.md). Naloge izvaja isti agent
zaporedno T001 → T009. Vsaka je odvisna od predhodnih; oznaka `[x]` pomeni
dejansko opravljeno delo. Infrastruktura in odvisnosti ostanejo nespremenjene.

## Priprava

- [x] [T001] Preveri izhodišče `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` in obstoječe testne ukaze iz `package.json` glede na `docs/agent/P10/plan.md`; preveri čas z `node task/time-budget.mjs`. Brez namestitev ali sprememb nastavitev.

## Temelji

- [x] [T002] Dodaj `src/taskOrder.ts`: inicializacija po prejetih ID-jih, čisti prehodi premik/undo/redo/reset, nespremenjeno stanje ob neveljavnem dejanju, največ 20 prejšnjih permutacij. Ohrani vse ID-je in vhodne podatke ter pravilno počisti redo samo pri novem veljavnem dejanju (R01–R08, R12).
- [x] [T003] Dodaj neposredna preverjanja reducerja v `tests/agent/P10.spec.ts`: več različnih zaporednih permutacij in undo/redo, robno dejanje z ohranjenim redo, razvejitev, 21+ premikov in 20 razveljavitev/ponovitev, razveljavljiv reset ter reset brez učinka. Pri korakih preveri celotno zaporedje in nespremenjene vhodne podatke (R02–R08, R12).

## Uporabniški tokovi po prioriteti

- [x] [T004] V `src/App.tsx` izloči `ProjectTasks`, inicializiraj reducer šele ob prejetih opravilih in izpelji urejen seznam po ID-jih. V `src/TaskOrderControls.tsx` dodaj skupne gumbe, točni statusni števec in premik gor/dol z globalnim mestom. Vključi jih v preglednico zunaj povezav; ohrani prazni prikaz, števce stanj in življenjsko dobo projekta (R01–R08, R10–R12).
- [x] [T005] Dopolni `src/TaskBoard.tsx` z globalnimi mesti in istimi kontrolami kot sorojenci povezav kartic; filtriraj že urejeni seznam v stalne stolpce. Premiki uporabljajo globalnega soseda, ohranijo `data-task-id`, polja, imena stolpcev in pravilne podrobnosti (R01–R03, R09, R12).
- [x] [T006] Dopolni `tests/agent/P10.spec.ts` z brskalniškimi tokovi S1–S8 iz specifikacije, ki dopolnjujejo D01–D04: drugačni ID-ji/enaki naslovi, globalni premik prek stanj, več undo/redo in reset, ohranitev ob pogledih/podrobnostih, ponastavitev ob menjavi/povratku/osvežitvi, N=0/1/>10, točni števci/onemogočeni gumbi in nič zapisov API. Testne pripomočke uporabljaj samo v testih (R01–R12).

## Dodelava, preverjanje in predaja

- [x] [T007] V `src/styles.css` oblikuj nove kontrole skladno s Folio: prelamljanje skupnih gumbov, majhne ločene kontrole ob opravilih, vidni fokus in onemogočena stanja. Preveri oba pogleda pri 390 pikah ter namizni prikaz; dodaj ustrezne trditve in posnetke prek `tests/agent/P10.spec.ts`, brez širjenja cele strani (R12).
- [x] [T008] Zaženi `npm run check` za lint, tipe/gradnjo, skupne, razvojne in lastne teste; shrani dejanski izhod v `docs/agent/P10/verification.log`. Preglej vizualni dokaz Folio. Morebitne napake popravi samo v dovoljenih datotekah in ponovi ustrezne preglede; zapiši tudi vzroke prvih neuspehov.
- [x] [T009] Posodobi vseh 12 vrstic sledljivosti v `docs/agent/P10/spec.md` s konkretnimi deli kode, imeni izvedenih testov in povezavami na dokazila; posodobi zgodovino specifikacije, rezultate, nepreverjene dele in omejitve. Označi samo dokončane naloge v `docs/agent/P10/tasks.md`, preveri čas ter pripravi kratko predajo. Nedostopni končni testi ostanejo izrecno neizvedeni.

## Merilo dokončanja

Vsi R01–R12 imajo izvedeno vedenje in sledljiv dokaz oziroma pošteno opisano
omejitev. Skupna predloga je pokrita s `spec.md`; načrt in ta seznam ne
uvajata novih funkcionalnih zahtev. Vseh devet nalog je dokončanih; dokazi so v [verification.md](../verification.md).
