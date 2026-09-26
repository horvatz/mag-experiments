# P09 — naloge za izvedbo

Podlaga: [spec.md](spec.md), [plan.md](plan.md) in izvirni [R01–R12](../../../task/instructions.md). Naloge se izvajajo zaporedno T001 → T010 z enim agentom. Označitev `[x]` pomeni dejansko dokončanje; napredek je označen spodaj. Ni namestitev, sprememb infrastrukture, vej ali commitov.

## Priprava

- [x] [T001] Pred implementacijo preveri obstoječe integracijske točke, testne ukaze in omejitve iz `docs/agent/P09/plan.md`; sprotna dokazila in morebitna odstopanja beleži v `docs/agent/verification.md`. Preveri čas z `node task/time-budget.mjs`.

## Temelji

- [x] [T002] Dodaj `src/viewState.ts`: tip in privzeto stanje, branje prve pojavitve parametrov, validacija status/order, normalizacija trim/NFD/U+0300–U+036F/male črke, dobesedno iskanje po štirih poljih, status po IN in stabilno UTF-16 urejanje kopije podatkov. Pokrij R01–R04.
- [x] [T003] Razširi `src/navigation.ts`: potrjeni filtri v poti, kodirani URL-ji projekta/opravila, prenos pogleda in filtrov, kanonizacija samo ob potrditvi, en zgodovinski vnos ob spremembi stanja in zamenjava vnosa ob samem čiščenju URL-ja. Branje ostane brez stranskih učinkov; Nazaj/Naprej morata obvestiti prikaz. Pokrij R01, R04, R06–R07, osnovo R08–R10.

## Zgodba 1 — neposredna povezava, osnutek in potrditev

- [x] [T004] Dodaj `src/ViewControls.tsx` in ga vključi v `src/App.tsx`: zahtevane oznake in vrednosti treh kontrol, ločen osnutek, skupna potrditev, reset z istim pravilom zgodovine, obnova osnutka ob navigaciji ter reset tudi brez spremembe URL-ja. Izpelji en rezultat za tabelo/tablo, dodaj status N od M in »Ni zadetkov.« ob ohranitvi praznega projekta/stolpcev. Pokrij R05–R07, R11.

## Zgodba 2 — pogledi, podrobnosti in projekti

- [x] [T005] V `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx` poveži potrjene filtre z vsemi preklopi, povezavami opravila in zapiranjem z gumbom/Escape. Ohranitev fokusa ne sme zahtevati ponovne montaže celotnega projekta. Klik drugega projekta naj ponastavi filtre in ohrani pogled; direktni URL naj upošteva svoje parametre. Pokrij R08–R10 in R12.

## Dodelava in preverjanje

- [x] [T006] Dopolni `src/styles.css` za nove kontrole z obstoječimi slogi Folio, vidnim fokusom in prelomom pri 390 pikah; ohrani dostopna imena, `data-task-id`, pregled stanj in notranje drsenje. Pokrij R12 ter dogovor o vmesniku.
- [x] [T007] Dodaj `tests/agent/P09.spec.ts` s samostojno določenimi pričakovanimi ID-ji za S01–S04/S06: vsako iskalno polje, diakritika, literalna fraza in ločila, vsi statusi in vrstni redi, izenačitve, prva pojavitev, neznane vrednosti/ključi, branje brez prepisovanja, kodiranje ter nič/eno/več kot deset opravil. Testne GET odgovore uporabljaj samo v testih.
- [x] [T008] V `tests/agent/P09.spec.ts` dodaj uporabniška zaporedja S05–S12: osnutek brez vpliva, ena potrditev/en vnos in ponovitev brez vnosa, Nazaj/Naprej/reload, reset in njegov osnutek, tabela/tabla z istimi ID-ji, zavržen osnutek ob navigaciji, pravilne podrobnosti pri enakih naslovih, oba načina zapiranja, projektni prehod proti direktni povezavi, nič zapisovalnih zahtev ali localStorage ter širina 390 pik.
- [x] [T009] Izvedi `npm run lint`, `npm run build` in `npm test` z nespremenjeno infrastrukturo; dnevnike shrani v `docs/agent/P09/`. Preglej skupne API in namizne/mobilne regresije, razvojne D01–D04 ter lastne teste. Odpravi napake znotraj dovoljenih datotek, po popravkih ponovi ustrezna preverjanja in dejanske rezultate zapiši v `docs/agent/verification.md`.
- [x] [T010] Dopolni vseh dvanajst vrstic sledljivosti v `docs/agent/P09/spec.md` z dejanskimi funkcijami/datotekami, imeni testov, izidi in povezavami na dnevnike; posodobi zgodovino sprememb, nepreverjene dele in omejitve. Uskladi oznake v `docs/agent/P09/tasks.md` in pripravi kratko predajo v `docs/agent/verification.md` najpozneje v zadnji minuti skupnega roka. Končnih nedostopnih testov ne označi za opravljenih.

## Pokritost

R01–R04: T002, T003, T007; R05–R07: T003, T004, T007, T008; R08–R10: T003, T005, T008; R11: T004, T008; R12 in Folio: T005, T006, T008, T009. Dokazila za vse zahteve: T009–T010. Podrobni sprejemni pogoji in predikati ostanejo v specifikaciji.
