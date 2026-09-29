# Preverjanje P10

## Izvedeni ukazi in rezultati

- `npm run check` — uspeh: ESLint, `tsc --noEmit`, produkcijska gradnja Vite in 53/53 Playwright preverjanj.
- `npx playwright test --project=agent` — uspeh v ločenem ciljanem zagonu: 6/6 agentnih scenarijev; končni `npm run check` je nato vključil še sedmi, čisti preizkus reducerja.
- Testi izhodišča: 38/38 (API ter namizni in mobilni baseline).
- Skupni razvojni testi: 8/8 (štirje primeri v namiznem in mobilnem Chromiumu).
- Lastni testi: 7/7. Preverjajo robne in neveljavne prehode, več undo/redo, zavrženo vejo, ponastavitev, omejitev zgodovine, globalnega soseda na tabli, enake naslove, ohranitev statusa/podrobnosti in vrstnega reda, ponastavitev ob menjavi projekta/osvežitvi, prazno/enojno zbirko ter širino 390 px. `readonly()` preveri, da ni bilo zapisov na API in da širina dokumenta ne preseže pogleda.

V prvem ciljanem zagonu lastnih testov je en test neuspešno ponovno uporabil isto stran za dve različni `mount()` postavitvi; prekrivajoče se testne prestrezne poti so vrnile star fixture. Test je bil razdeljen na dva neodvisna scenarija in v ponovitvi je vseh 6/6 uspelo. Končno preverjanje z vsemi sedmimi lastnimi scenariji je prav tako uspelo.

## Sledljivost zahtev

| Zahteva | Pogoj in koda | Izveden test ter dokaz |
| --- | --- | --- |
| R01 | `order` se začne kot vhodni ID-ji; mesto je indeks + 1. `src/App.tsx:16-22,59`; `src/TaskOrderControls.tsx:14-17`. | `premiki, robovi, večkratni undo in redo ter zavržena veja` preveri začetni seznam in mesta za vsak ID; `tests/baseline.spec.ts` preveri začetni prikaz in enake naslove po ID-ju. `npm run check`: uspeh. |
| R02 | Za veljaven indeks se zamenja le sosednji indeks. `src/taskOrder.ts:30-37`; preglednica: `src/App.tsx:59-64`; tabla: `src/TaskBoard.tsx:16-20,28-38`. | Agentni test več premikov gor/dol in `tabla premika globalnega soseda…`; razvojni D01 v namiznem in mobilnem projektu. Uspešno. |
| R03 | Gor/dol sta neveljavna zunaj meja; prehod vrne isto stanje, UI robni gumb je onemogočen. `src/taskOrder.ts:31-33`; `src/TaskOrderControls.tsx:16-17`. | `neveljaven robni premik ne spremeni permutacije ali zgodovine ponovitev` preveri nespremenljivo stanje tudi ob čakajočem redo; večstopenjski agentni test preveri onemogočene robne gumbe. Uspešno. |
| R04 | Veljaven premik shrani prejšnji seznam; undo povrne vrh in shrani trenutno permutacijo v redo. `src/taskOrder.ts:18-19,35-43`; kontrolnik/števci `src/TaskOrderControls.tsx:31-37`. | `premiki, robovi, večkratni undo in redo ter zavržena veja` ter D02 desktop/mobile. Uspešno. |
| R05 | Redo vzame zadnjo razveljavljeno permutacijo, odstrani jo z redo in shrani sedanjo v undo; dodajanje v undo ostane omejeno. `src/taskOrder.ts:46-49`. | Agentni test izvede dva undo in dva redo ter preveri obnovljen vrstni red; D02 preveri en korak. Uspešno. |
| R06 | Veljaven premik počisti redo; neveljaven vrne isto stanje. `src/taskOrder.ts:33,37`; `src/TaskOrderControls.tsx:16-17`. | Neveljaven robni premik preveri ohranjen redo; agentni večstopenjski test po undo preveri, da je redo na voljo pred veljavnim premikom in onemogočen po njem; D03 preveri novo vejo. Uspešno. |
| R07 | `appendHistory` doda celotno permutacijo in odreže na 20. `src/taskOrder.ts:16-19`; undo/redo uporabljata iste prehode (`40-49`). | `zgodovina razveljavitev hrani največ zadnjih 20 permutacij` izvede 21 premikov, 20 undo in 20 redo, preveri mejo mest ter množico ID-jev. Uspešno. |
| R08 | Ponastavitev je neaktivna pri `order=initialIds`; sicer zabeleži trenutno permutacijo, povrne izvor in počisti redo. `src/taskOrder.ts:52-57`; gumb `src/TaskOrderControls.tsx:28-35`. | `začetni vrstni red je eno razveljavljivo dejanje` preveri reset, undo, redo, onemogočen reset in števce; D04 dodatno preveri reset na tabli. Uspešno. |
| R09 | Preglednica uporabi celoten `orderedTasks`; tabla filtrira isti seznam po nespremenjenem statusu in položaj računa iz globalnega seznama. `src/App.tsx:20-22,59`; `src/TaskBoard.tsx:16-20,28-38`. | `tabla premika globalnega soseda…` zamenja opravili v različnih stolpcih in preveri globalni mesti; D04 namizni/mobilni preveri mesto na tabli. Uspešno. |
| R10 | Reducer živi v `ProjectView`, ki je stabilen med spremembo pogleda/podrobnosti; ključ projekta ustvari nov pogled, reload pa novo aplikacijo. `src/App.tsx:13-20,71,99`. | `tabla premika globalnega soseda…` preveri pogled, modal, menjavo projekta in reload. Uspešno. |
| R11 | Števci izhajajo iz dolžin skladov; undo/redo in ponastavitev so onemogočeni pri prazni zgodovini oziroma izvornem vrstnem redu. `src/TaskOrderControls.tsx:26-37`; prazni seznami se prikažejo v `src/App.tsx:45-55`. | `prazen projekt ostane uporaben` in `enoopravilen projekt in ozek zaslon ostaneta uporabna`; razvojni D02/D03 preverita besedilo in gumbe. Uspešno. |
| R12 | Seznam ID-jev se preureja brez mutacije opravil; števci se računajo iz vhodnih `tasks`, podrobnosti jih berejo prek obstoječega GET API. `src/taskOrder.ts:26-57`; `src/App.tsx:14,21-27,60-64`; brez zapisovalnega klica v toku naročanja. | `readonly()` v reset, globalni premik in enoopravilnem scenariju potrdi nič API zapisov; pregled stanja in modal potrdita nespremenjene števce/status. D04 desktop/mobile potrjuje API samo za branje. Širina 390 px je preverjena v agentnem testu; baseline ohranja Folio in odzivno postavitev. Uspešno. |

## Omejitve

- Končnih, ločeno pripravljenih skritih testov v tem okolju ni bilo na voljo; niso navedeni kot izvedeni.
- Ročni pregled v običajnem brskalniku ni bil izveden. Odzivnost in tokovi so bili preverjeni z nameščenim Playwright Chromiumom.
- `git status` ni bil dostopen: sistemski `git` je odpovedal pri klicu `xcrun`, ker v okolju manjka aktivna namestitev Command Line Tools. Izhodišče je po navodilih svež izvoz brez Git zgodovine; vse ročno urejene datoteke so v dovoljenih mapah `src/`, `tests/agent/` in `docs/agent/`.
- Vhodi iz dogovorjene domene zagotavljajo enolične ID-je in pripadnost opravila projektu. Dinamične spremembe seznama opravil brez navigacije/ponovnega nalaganja niso del dogovorjenega obsega.
- npm je ob zagonih izpisal opozorilo o okoljski nastavitvi `http-proxy`; lint, gradnja in testi so kljub temu uspešno zaključeni.
