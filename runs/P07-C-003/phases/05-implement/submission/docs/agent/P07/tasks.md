# P07 — Izvedbene naloge

Podlaga: [spec.md](spec.md), [plan.md](plan.md), [izvirne zahteve](../../../task/instructions.md). En agent izvaja naloge zaporedno po številkah; vsaka je odvisna od predhodne. Označi opravljeno šele po izvedbi. Infrastruktura, odvisnosti, uradne predloge in skupni testi ostanejo nespremenjeni.

## Priprava

- [x] T001 Preveri izhodišče `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` in `tests/development/P07.spec.ts` glede na R01–R12; v `docs/agent/verification.md` odpri kratko evidenco izvedbe in preverjanj. Uporabi obstoječe skripte in časovni pripomoček, brez nastavitvenih sprememb.

## Temelj

- [x] T002 V `src/useFavorites.ts` izvedi validacijo in varno začetno branje, globalno množico nizov, preklop in odstranitev podanih ID-jev, kanoničen UTF-16 zapis ter opozorilo ob izjemi branja/pisanja. Dodaj poslušalca `storage` z odstranitvijo ob odklopu; ne piši pri inicializaciji ali prejemu dogodka. Ohrani podvojene kot en ID in neznane ID-je, brez podatkov opravil ali API zapisov. Pokritje: R02–R04, R08–R09, R11–R12.

## Uporabniške zgodbe po prednosti

- [x] T003 V `src/FavoriteButton.tsx` dodaj skupni gumb s točnim imenom in `aria-pressed`; v `src/App.tsx` pokliči `useFavorites` nad projektom ter poveži gumbe preglednice in opozorilo. V `src/TaskBoard.tsx` poveži ločene gumbe zunaj povezav kartic. Ohrani `data-task-id`, pravilne povezave in neodvisnost enakih naslovov. Pokritje: R01, R07, R11–R12; S1.
- [x] T004 V `src/App.tsx` dodaj projektni checkbox z začetno vrednostjo false, izračun vidnih opravil, stalno dostopne kontrole, zahtevano prazno stanje, odstranitev priljubljenih celotnega projekta in status `Priljubljeno: X od M.`. `src/TaskBoard.tsx` podaj vidni seznam, ohrani tri stolpce in štetje vidnih vnosov. Preveri ohranitev filtra med pogledoma/podrobnostmi in ponastavitev ob menjavi projekta. Pokritje: R05–R10; S4–S5.

## Dodelava in preverjanje

- [x] T005 V `src/styles.css` uskladi nove kontrole, opozorilo in oba gumba z obstoječim Foliom; zagotovi prostor ob povezavi kartice, vidni fokus, prelamljanje kontrol in notranje drsenje pri 390 pik. Ohraniti je treba vsebino in dostopna imena obstoječih pogledov ter pregled stanj. Pokritje: R01, R12; S8.
- [x] T006 V `tests/agent/P07.spec.ts` dodaj vedenjske scenarije: kanoničen zapis s podvojitvami/neznanimi in Unicode ID-ji ter obnovitev; parameterizirani neveljavni zapisi brez samodejnega pisanja; filter, oba pogleda, prazni rezultati in števci; prehodi projektov in odstranitev le njihovih ID-jev; storage dogodki za pravilen/tuji ključ, neveljavna vrednost in null brez povratnih zapisov; ločeni izjemi branja/pisanja z nadaljnjo uporabo. Uporabi tudi prazne, enojne in večje sezname, enake naslove ter preverjanje pravilnih podrobnosti, nespremenjenih podatkov in odsotnosti API zapisov. Dodaj preverjanje 390 pik in po možnosti posnetek v `docs/agent/P07/`. Pokritje: R01–R12; S1–S8, zlasti vrzeli D01–D04.
- [x] T007 Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo; slednji vključuje skupne API/osnovne, razvojne in lastne teste. Ukaze, rezultate in izhode shrani v `docs/agent/verification.md` ter povezane dnevnike. Morebitne napake popravi samo v `src/` oziroma `tests/agent/` in ponovi prizadeta preverjanja. Preglej ozki prikaz ter označi dejansko izvedeno in nepreverjeno. Pokritje: R01–R12.
- [x] T008 V `docs/agent/P07/spec.md` dopolni vseh dvanajst vrstic sledljivosti s konkretnimi deli kode, imeni testov in dokazili iz `docs/agent/verification.md`; posodobi zgodovino. V `docs/agent/P07/tasks.md` označi izvedene naloge, dokumentiraj omejitve in neizpolnjene zahteve ter pripravi kratko predajo. Nedostopnih končnih testov ne navajaj kot opravljenih.

## Pogoj zaključka

Izvedene naloge T001–T008, dokumentirana pokritost vseh R01–R12 in resnični rezultati preverjanj. Če rok prepreči dokončanje, ostanejo neizvedene naloge neoznačene in so izrecno navedene v predaji. Ta seznam sam po sebi ni dokaz uspešne izvedbe.
