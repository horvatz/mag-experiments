# Naloge P08

2026-09-25. Vir: [spec.md](spec.md), [plan.md](plan.md) in izvirne [zahteve R01–R12](../../../task/instructions.md). Naloge se izvajajo zaporedno z istim agentom; vsaka je odvisna od prejšnje. Oznako dokončanosti spremenimo šele po izvedbi. V tem koraku ni izvedena nobena implementacijska naloga.

## Priprava

- [ ] [T001] V `docs/agent/P08/verification.md` vzpostavi kratek zapis dejanske izvedbe: preveri razpoložljivi čas z `node task/time-budget.mjs`, potrdi dovoljene meje iz `PROJECT_RULES.md` in zabeleži načrtovane ukaze brez pripisovanja uspeha. Uporabi obstoječo konfiguracijo in nameščene odvisnosti.

## Temeljna logika

- [ ] [T002] Dodaj `src/deadlines.ts`: začetni datum `2026-09-21`, skupine in slovenske oznake, koledarski izračun z izrecnim UTC, prednost `done`, meje −1/0/1/7/8, pet števcev nad celotnim projektom in stabilno filtriranje brez spreminjanja opravil. Uporabi predikate iz `spec.md` (R01–R07).

## Uporabniška zgodba 1 — pregled in izbira rokov

- [ ] [T003] V `src/App.tsx` dodaj lokalne `dateInput`, `referenceDate`, `deadlineFilter` v `ProjectView`, označen `input type=date`, HTML `select` s šestimi možnostmi in pet številskih elementov z zahtevanimi `aria-label`. Veljaven datum preračuna podatke ob ohranjenem filtru; prazen ohrani zadnji veljavni datum in pokaže točno opozorilo. Za ponastavitev uporabi obstoječi ključ projekta, brez trajne shrambe ali sprememb URL-ja (R01, R06–R08, R10).

## Uporabniška zgodba 2 — pogledi in prazni rezultati

- [ ] [T004] V `src/App.tsx` poveži isto `visibleTasks` s preglednico in `src/TaskBoard.tsx`. Ohrani izvorni vrstni red, ID-je, originalne podatke, bralne podrobnosti in števce stanj celotnega projekta. Preklop pogleda ohrani oba datuma in filter. Dodaj točno sporočilo prazne skupine ob dosegljivih kontrolah; pri praznem projektu pokaži pet ničel, pri tabli ohrani regijo in stolpce (R06–R12).

## Dodelava in preverjanje

- [ ] [T005] V `src/styles.css` oblikuj samo nove kontrole, števce in opozorilo z obstoječimi gradniki Folio. Zagotovi prelom kontrol in oznak, vidni fokus ter širino strani največ 390 pik pri istoimenskem vidnem polju; ohrani notranje drsenje table/preglednice, navigacijo in kartice (R12, dogovor o vmesniku).

- [ ] [T006] Dodaj `tests/agent/P08.spec.ts` z neodvisnimi pričakovanimi izidi za scenarije S01–S12 iz `spec.md`: koledarske meje meseca/leta/prestopnega februarja in poletnega časa v dveh časovnih pasovih; prednost `done`; razdelitev in števci; več kot deset premešanih ID-jev in podvojeni naslovi; vsi filtri in oba pogleda; veljaven/prazen vnos; menjava projekta/osvežitev brez shrambe filtra; nič/eno opravil in prazna skupina; bralne podrobnosti, odsotnost zapisov ter 390 pik in dostopne kontrole. Uporabi obstoječi testni mehanizem nadzorovanih GET odgovorov samo iz testov (R01–R12).

- [ ] [T007] Izvedi `npm run check` z obstoječo konfiguracijo: lint, preverjanje tipov, gradnja, skupni API in namizni/mobilni regresijski testi, razvojni P08 ter lastni testi. Shrani dejanski izhod in izhodno kodo v `docs/agent/P08/verification.md` s povezavo na dnevnik v isti mapi. Morebitne napake odpravi samo v dovoljenih datotekah in ponovi prizadeta preverjanja; vizualno preglej Folio na namizju in pri 390 pikah ter navedi dokazila ali omejitev (R01–R12).

- [ ] [T008] V `docs/agent/P08/spec.md` dopolni vseh dvanajst vrstic sledljivosti s konkretnimi deli kode, dejanskimi imeni testov in povezavami na rezultate v `docs/agent/P08/verification.md`. Posodobi zgodovino specifikacije in dokončanost `docs/agent/P08/tasks.md`; zapiši neizpolnjene zahteve, nepreverjene dele in omejitve. Preveri čas, zadnjo minuto nameni predaji; nedostopnih končnih testov ne navajaj kot uspešnih.
