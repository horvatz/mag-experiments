# P06 — izvedbene naloge

Podlaga: [specifikacija R01–R12 in scenariji S01–S08](spec.md), [načrt](plan.md) ter izvirni [dogovor naloge](../../../task/instructions.md). Naloge opravi isti agent po vrstnem redu T001 → T008. Vsaka naslednja uporablja rezultat prejšnje; brez drugih agentov, vej, commitov ali sprememb infrastrukture. Oznako zaključka dodamo šele po dejanski izvedbi. Stanje spodaj odraža dejansko izvedbo; dokazila so v `docs/agent/verification.md`.

## Priprava

- [x] T001 Preveri integracijsko mesto `ProjectView` v `src/App.tsx`, tip `Task` in že nastavljeno izvajanje projekta `agent` v `playwright.config.ts` (oboje samo branje). Ustvari `docs/agent/verification.md` za sprotne ukaze, rezultate in omejitve; preostanek časa preveri z `node task/time-budget.mjs`. Uporabi nameščene odvisnosti in obstoječe testno okolje.

## Temelji

- [x] T002 Dodaj `src/csv.ts`: kanonične kolone in tipe, čisto nevtralizacijo/navajanje celic ter `serializeCsv` po predikatih specifikacije. Ohrani vrstni red in izvirne nize, filtriraj samo izvozne vrstice, zavrni prazne kolone/vrstice z `null`, sestavi BOM in CRLF tudi na koncu; vhodov ne mutiraj. Pokritje: R01–R04, R06–R09, R12.
- [x] T003 Dodaj `tests/agent/csv.spec.ts` z neodvisnimi pričakovanimi nizi/bajti: obe ločili, izbor kolon v drugačnem vrstnem redu, prazne vrstice/kolone/filter, interni status in izvorni datum, Unicode/presledki, narekovaji ter notranji CR/LF/CRLF. Preveri vse štiri sprožilce formule, njihove dovoljene začetne beline in negativne primere (druga belina, znak sredi niza, navaden niz), uporabo pravila v podatkovnih kolonah ter nespremenjenost zamrznjenih vhodov. Zaženi `npx playwright test tests/agent/csv.spec.ts --project=agent` in zapiši rezultat v `docs/agent/verification.md`. Pokritje: S01–S05/S07, R01–R09/R12.

## Uporabniška zgodba 1 — nastavljivi lokalni izvoz

- [x] T004 Dodaj `src/CsvExport.tsx` s sedmimi checkboxi, označenima HTML selectoma in gumbom s predpisanimi dostopnimi imeni. Uporabi lokalno privzeto stanje in predikat omogočenosti; ob kliku serializiraj trenutne nastavitve, pri neveljavnem izboru ne ustvari prenosa. Izvedi prenos `folio-<projectId>.csv` prek Blob/object URL, odstrani začasno povezavo in asinhrono sprosti URL. V `src/App.tsx` vstavi kontrole pred preklapljajoči prikaz, ohrani ključ projekta in izvorni `tasks` za prikaze/povzetke. Pokritje: R01–R05, R10–R12.

## Uporabniška zgodba 2 — ohranitev pogledov in Folia

- [x] T005 Dopolni samo lokalne sloge kontrol v `src/styles.css`: obstoječe spremenljivke in slog gumba, fieldset/legenda, prelamljanje kontrol in vidni fokus. Ohrani dostopna imena, `data-task-id`, povzetek stanj, povezave opravil in notranje drsenje obeh pogledov; pri 390 pikah prepreči prelivanje cele strani. Pokritje: R12, S08 in dogovor o vmesniku.
- [x] T006 Dodaj `tests/agent/export.spec.ts` in zaženi `npx playwright test --project=agent`. Preveri dejanske prenose (ime, surovi BOM, CRLF, trenutne kolone/ločilo/filter), vse filtre brez sprememb prikaza in povzetkov, izklop vseh kolon brez prenosa ter ponovno omogočenje, prazna projekta in prazen filter. Uporabi tudi 13+ preurejenih opravil z enakimi naslovi in drugačnimi ID-ji. Preveri enake bajte/nastavitve po preklopu pogledov, ponastavitev ob menjavi/vrnitvi projekta in osvežitvi ter zaporedne izvoze po spremembah. Potrdi nič zapisov API, nič novih strani, ohranitev branja podrobnosti in širino 390 pik v obeh pogledih. Shrani posnetka namizja in mobilnega prikaza v `docs/agent/P06/` za vizualni pregled; rezultate zapiši v `docs/agent/verification.md`. Pokritje: vsi S01–S08 in R01–R12 skupaj s T003.

## Zaključek in dokazila

- [x] T007 Izvedi `npm run check` (lint, tipi/gradnja, skupni API/regresijski testi, razvojni P06 na obeh velikostih in lastni testi). Dnevnik z dejansko izhodno kodo shrani v `docs/agent/P06/check.log`; preglej posnetka iz T006 glede na `docs/dizajn.md`. Napake odpravi samo v dovoljenih `src/` in `tests/agent/`, nato ponovi ustrezna preverjanja. V `docs/agent/verification.md` navedi rezultate in morebitne neizvedene preglede; nedostopnih končnih testov ne označi za opravljene.
- [x] T008 Dopolni tabelo sledljivosti vseh R01–R12 v `docs/agent/P06/spec.md` z dejanskimi datotekami/funkcijami, imeni izvedenih testov in povezavami na dokaze iz `docs/agent/verification.md`/dnevnikov. Zabeleži zgodovino sprememb, omejitve in neizpolnjene zahteve; uskladi dejansko stanje kljukic v `docs/agent/P06/tasks.md`. Zaključi s kratko predajo izvedbe in preverjanj v preostalem času.
