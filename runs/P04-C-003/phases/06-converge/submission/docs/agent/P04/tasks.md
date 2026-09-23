# P04 — izvedbene naloge

Podlaga: [spec.md](spec.md), [plan.md](plan.md) in izvorne R01–R12 v [task/instructions.md](../../../task/instructions.md). Vse naloge opravi isti agent zaporedno; vsaka naloga je odvisna od predhodne. Oznako `[x]` dodaj šele po dokončanju. Začetno stanje: brez implementacije in preverjanj. Končno stanje 2026-09-23: T001–T009 opravljene; dokazi v [verification.md](../verification.md).

## Priprava

- [x] [T001] Pripravi `docs/agent/P04/validation.md` za sprotno beleženje dejanskih ukazov, izhodnih statusov, dokazil in omejitev. Preveri čas z `node task/time-budget.mjs` ter obstoječa mesta integracije v `src/App.tsx` in testno konfiguracijo samo preberi; ne spreminjaj infrastrukture.

## Temelji

- [x] [T002] Dodaj `src/taskSorting.ts`: lokalne tipe in privzeto četverico, natančno normalizacijo nizov, primerjavo statusov/datumov, neodvisni smeri, sekundarno primerjavo samo ob enakosti ter stabilen izvorni indeks. `original` vrne izvorni vrstni red; funkcija ne mutira vhodnega polja ali opravil. Zajema R01–R06, R10, R11 in ohranitev ID-jev iz R12.
- [x] [T003] Dodaj `tests/agent/P04.sorting.spec.ts` z vnaprej določenimi pričakovanimi ID-ji za S02–S06: Unicode/NFD, ločila in števila v nizih, obe smeri, statusi, kronološki datumi, vsak sekundarni ključ, popolna izenačenja, isti ključ z nasprotnima smerema in prevlada `original`. Vseh 100 kombinacij nastavitev preveri še na praznem, enoelementnem in izenačenem zamrznjenem vhodu ter preveri nespremenjenost polj in enkratnost ID-jev (R01–R06, R10–R12). Testov ne označi kot uspešnih pred zagonom v T008.

## Uporabniški potek 1 — razvrščanje in ponastavitev

- [x] [T004] Dodaj `src/SortControls.tsx` in poveži kontrole v `src/App.tsx`: štirje označeni HTML selecti z vrednostmi iz specifikacije, gumb Izvorni vrstni red, lokalni `SortSettings` v `ProjectView` in skupna projekcija za preglednico ter `TaskBoard`. Kontrole delujejo tudi pri 0/1 opravilu in dovoljujejo enaka ključa. Povzetki in števila ostanejo vezani na izvorne podatke; nič zapisov na API (R01, R05–R07, R10–R12).
- [x] [T005] Dopolni `src/styles.css` za prelamljanje skupine kontrol, omejeno širino selectov in vidni fokus skladno s Folio. Ohrani obstoječe gradnike, imena pogledov/stolpcev, `data-task-id`, oznako povzetkov in notranje drsenje; pri 390 px se stran ne sme razširiti (R12).

## Uporabniški potek 2 — pogledi, podrobnosti in projekti

- [x] [T006] V `src/App.tsx` preveri življenjski cikel lokalnega stanja: obstoječi ključ `project.id` ponastavi vse štiri vrednosti ob menjavi projekta, pogled in podrobnosti jih ohranita, osvežitev začne s privzetimi vrednostmi. Nastavitev ne zapisuj v URL ali shrambo. Ohrani ID-je povezav ter stalni vrstni red stolpcev v `src/TaskBoard.tsx`; obstoječa navigacija in `src/TaskDetails.tsx` po načrtu ne potrebujeta sprememb (R07–R09, R12).
- [x] [T007] Dodaj `tests/agent/P04.ui.spec.ts` za S01 in S07–S12: nadzorovani GET podatki z več kot 10 drugimi ID-ji in podvojenimi naslovi; preveri privzete vrednosti, neodvisne smeri, relativno zaporedje vseh stolpcev, podrobnosti po ID in ohranitev nastavitev, projekt A → B → A, osvežitev, odsotnost nastavitev v URL/shrambi, ponastavitev vseh kontrol, povzetke in nič zapisov. Za 0/1 opravilo prehodi vseh 100 kombinacij in oba pogleda. Dodaj preverjanje 390 px, dostopnih imen in fokusa ter shrani posnetke obeh pogledov v `docs/agent/P04/` za vizualni pregled Folio. Testne pripomočke uporabljaj samo v testih.

## Zaključna preverjanja in predaja

- [x] [T008] Zaženi `npm run check` ter shrani celoten izhod in izhodni status v `docs/agent/P04/check.log` in `docs/agent/P04/validation.md`. S tem izvedi lint, typecheck/build, skupne API/bralne teste, razvojne P04 in lastne teste. Preglej shranjene posnetke Folio. Morebitne napake odpravi samo v dovoljenem obsegu in ponovi prizadeta preverjanja; zabeleži vsak zagon in dejanski rezultat. Preveri, da aplikacija ne uvaža testnih pripomočkov ter ne uporablja `/__test/` ali shrambe za razvrščanje (R01–R12).
- [x] [T009] Posodobi tabelo sledljivosti in zgodovino v `docs/agent/P04/spec.md`: vsaki R01–R12 pripiši dejansko datoteko/del kode, ime izvedenega testa, rezultat in povezavo na dokazilo. V `docs/agent/P04/validation.md` jedrnato navedi spremembe, izvedena preverjanja, morebitne neizpolnjene zahteve in omejitve; nedostopnih končnih testov ne označi kot opravljenih. Posodobi stanje nalog v `docs/agent/P04/tasks.md`, preveri preostali čas in pripravi predajo.
