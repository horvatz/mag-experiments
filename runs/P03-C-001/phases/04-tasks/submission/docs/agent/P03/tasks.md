# P03 — Zaporedne izvedbene naloge

Podlaga: [spec.md](spec.md), [plan.md](plan.md), [izvirne zahteve R01–R12](../../../task/instructions.md) in [skupna predloga](../../../task/specification-template.md). En agent izvaja naloge po vrsti; vsaka naslednja je odvisna od zaključka predhodne. Oznako `[x]` dodamo šele po izvedbi. Brez sprememb infrastrukture, vej, commitov ali novih odvisnosti.

## Priprava

- [ ] [T001] V `tests/agent/P03.spec.ts` pripravi lastne testne podatke za scenarije S01–S08: nič, eno in več kot deset opravil, dva projekta, drugačne ID-je in vrstni red, enake naslove, Unicode, ločila ter podobna in ponovljena imena. Uporabi obstoječi mehanizem nadzorovanih GET odgovorov samo v testih. Pripravi `docs/agent/P03/evidence/` za dejanske rezultate; ne dodajaj novih konfiguracij.

## Temeljna logika

- [ ] [T002] V `src/taskFilters.ts` uvedi tip filtrov in čisto funkcijo `filterTasks`: NFD → odstranitev U+0300–U+036F → male črke na nizu štirih polj in poizvedbi, neprazne besede po belinah, dobesedni podnizi z IN, presek s stanjem in natančno osebo; ohrani vhodna polja in relativni vrstni red. Pokritje: R02–R04, R11.

## Uporabniške zgodbe po prednosti

- [ ] [T003] V `src/App.tsx` dodaj lokalno projektno stanje in kontrole z zahtevanimi tipi, dostopnimi imeni ter vrednostmi; možnosti oseb izpelji iz celotnega projekta brez praznih imen in duplikatov. Dodaj enkratno ponastavitev. Ohranjen `key={project.id}` naj ponastavi filtre ob menjavi projekta, isti primerek pa naj jih ohrani ob menjavi pogleda. Brez URL-ja ali trajne shrambe filtrov. Pokritje: R01, R04–R08, R11.

- [ ] [T004] V `src/App.tsx` uporabi isti `visibleTasks` za preglednico, obstoječi `src/TaskBoard.tsx` in števce stanj; izvorni seznam uporabi za imenovalec M. Dodaj status `Prikazano: N od M.` in loči `Ni zadetkov.` od običajnega praznega projekta. Tabla naj ohrani tri stolpce tudi brez zadetkov. Ohraniti je treba `data-task-id`, dostopna imena, povezave in bralne podrobnosti po ID-ju. Pokritje: R01, R06, R09–R12.

## Dodelava, preverjanje in predaja

- [ ] [T005] V `src/styles.css` oblikuj nove kontrole in rezultat z obstoječimi slogi Folia, vidnim fokusom ter prelomom na ozkem zaslonu. Omeji širine tudi za dolga imena; ohrani notranje drsenje preglednice/table ter navigacijo. Pokritje: R12, dogovor o vmesniku.

- [ ] [T006] V `tests/agent/P03.spec.ts` izpelji S01–S08 v smiselne teste z neodvisnimi pričakovanimi ID-ji: vse štiri iskalne vsebine, normalizacija, več besed in ločila; vsi trije filtri hkrati, natančna oseba in celotne možnosti; preklop pogledov/projektov, reload in odsotnost trajnega zapisa; števci in praznine v obeh pogledih; ponastavitev in nespremenjenost zamrznjenih podatkov; podrobnosti ter odsotnost zapisovalnih API zahtev. Vključi preverjanje širine 390 pik in posnetka širokega/ozkega prikaza v `docs/agent/P03/evidence/`. Pokritje: R01–R12; pričakovanj ne računaj s produkcijskim filtrom.

- [ ] [T007] Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo: skupni API/regresijski testi, razvojni P03 na desktop/mobile in lastni testi. V `docs/agent/P03/evidence/` shrani ukaze, izhodne kode in dnevnike; vizualno preglej posnetke glede na `docs/dizajn.md`. Morebitne napake odpravi samo v dovoljenih aplikacijskih/testnih datotekah ter ponovi prizadeta preverjanja. Ne označi neizvedenih ali nedostopnih testov kot uspešnih.

- [ ] [T008] V `docs/agent/P03/spec.md` dopolni tabelo sledljivosti vseh R01–R12 s konkretnimi deli kode, dejanskimi imeni testov in povezavami na dokaze; posodobi stanje, zgodovino sprememb, omejitve in nepreverjene dele. V `docs/agent/P03/tasks.md` označi dejansko zaključene naloge. Predaj izvedene spremembe, rezultate in morebitne vrzeli ter preveri preostanek z `node task/time-budget.mjs`.

## Merilo zaključka

Vse zahteve imajo izvedbo in določljiv dokaz ali izrecno navedeno omejitev; uspešni so le dejansko uspešno zaključeni zagoni. Kontrole, Folio, bralni API in obstoječa navigacija ostanejo v dogovorjenem obsegu. V trenutku nastanka tega seznama implementacija in preverjanja še niso izvedena.
