# Naloge P07

Podlaga: [specifikacija](spec.md) in [načrt](plan.md). Naloge izvaja isti agent zaporedno T001 → T009; vsaka naslednja upošteva rezultat predhodnih. Oznaka opravljenosti pomeni dejansko zaključeno delo, ne zgolj pripravo tega seznama. Zaščitene infrastrukture ne spreminjamo.

## Priprava

- [x] T001 Potrdi izhodišče in dovoljene poti s pregledom `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `tests/development/P07.spec.ts` ter obstoječe testne konfiguracije; preveri čas z `node task/time-budget.mjs`. Uporabi odločitve iz `docs/agent/P07/plan.md` brez dodajanja odvisnosti ali spreminjanja konfiguracije.

## Temelji

- [x] T002 Dodaj `src/useFavorites.ts`: stroga validacija celotnega zapisa, leno branje brez zapisa, množica enkratnih ID-jev z ohranitvijo neznanih, preklop/odstranitev ID-jev in kanoničen zapis po UTF-16. Dodaj storage poslušalec brez povratnega zapisa ter uporabno pomnilniško stanje in opozorilo ob izjemah dostopa, branja ali zapisa. Stranski učinki naj bodo zunaj renderja/updaterjev. Pokritje R01–R04, R08–R09, R11–R12.

## Uporabniški scenariji po prednostnem vrstnem redu

- [x] T003 Dodaj `src/FavoriteButton.tsx` in poveži en primerek hooka v `src/App.tsx`; isti F in preklop posreduj v `src/TaskBoard.tsx`. V vrsticah in karticah dodaj ločene gumbe zunaj povezav, z imenom `Priljubljeno opravilo <id>` ter aria-pressed. Ohrani data-task-id in podrobnosti po ID-ju. Pokritje R01, R07–R08, R12.
- [x] T004 V `src/App.tsx` dodaj projektni filter s privzeto false, stabilno izpeljan vidni seznam za oba pogleda, dostopne kontrole, prazno sporočilo, števec celotnega projekta ter odstranjevanje ID-jev celotnega projekta z ustreznim disabled stanjem. V `src/TaskBoard.tsx` ohrani stolpce in števce vidnih opravil tudi pri nič rezultatih. Prikaži opozorilo o shrambi z role=alert. Pokritje R05–R11.
- [x] T005 V `src/styles.css` dodaj omejene sloge novih kontrol in gumbov v skladu s Folio; ohrani kartice, viden fokus in notranje drsenje. Kontrole se pri 390 px prelomijo brez razširitve strani. Pokritje R12.

## Preverjanje in zaključek

- [x] T006 V `tests/agent/P07.spec.ts` dodaj vedenjske teste S01–S10 in S12: poljubni/Unicode ID-ji, enaki naslovi, več kot deset opravil, izvorno zaporedje, oba pogleda in podrobnosti, obnova dvojnikov/neznanih ID-jev, UTF-16 zapis samo ID-jev, projektni prehodi, odstranitev samo trenutnega projekta, števci, prazen projekt/prazen filter, 390 px in odsotnost API zapisov/sprememb opravil. Obstoječe razvojne D01–D04 dopolni brez njihovega spreminjanja.
- [x] T007 V `tests/agent/P07.spec.ts` dodaj S04/S11: matriko manjkajočih in neveljavnih zapisov brez samodejnega prepisovanja, veljaven/neveljaven/null storage dogodek, ignoriranje drugega ključa in odsotnost povratnega zapisa; ločeno preveri izjemo branja in zapisa ter nadaljnje preklapljanje/filtriranje v pomnilniku z opozorilom. Pokritje R04, R11.
- [x] T008 Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo za API, baseline, razvojne in agentne teste. Dnevnike shrani v `docs/agent/P07/`; popravi napake samo v dovoljenih datotekah in ponovi prizadeta preverjanja. Shrani ter vizualno preglej namizni in 390-pikselni posnetek Folio. Zabeleži tudi neuspešne ali blokirane izide; nedostopnih končnih testov ne šteješ kot opravljenih. Pokritje R01–R12.
- [x] T009 Dopolni `docs/agent/P07/spec.md`: vseh R01–R12 poveži s pogoji, točnimi deli kode, dejanskimi imeni testov, izidi in dnevniki. Posodobi zgodovino ter odprte omejitve in označi zaključene naloge v `docs/agent/P07/tasks.md`. Pripravi jedrnato predajo z opravljenim, nepreverjenim in preostalim časom; brez vej ali commitov.
