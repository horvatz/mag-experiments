# Implementacija in preverjanje P10-B-002

## Začetni načrt (2026-09-29)

Vloga: implementacija lokalnega vrstnega reda z razveljavitvami po `docs/agent/specification.md` in izvirnih R01–R12. Dovoljene spremembe so `src/`, `tests/agent/` in ta zapis.

### Načrtovana preverjanja

- [x] Pregled obstoječih komponent, slogov, API-ja in dizajna; `ProjectView` je vezan na `project.id`, pogled in podrobnosti pa ga ohranita.
- [x] Implementacija in pregled povezav z R01–R12; uporabniška koda ne kliče `/__test/` in vrstni red ni shranjen trajno.
- [x] Dodani lastni testi v `tests/agent/` za 20-koračno mejo, pogled/podrobnosti in mejne sezname.
- [x] `npm run check` (slog, tipi, gradnja in dostopni testi).
- [x] Pregled implementiranih mest in zapis rezultatov/omejitev; `git diff --check` ni bilo mogoče izvesti, ker Git javlja manjkajočo aktivno pot Command Line Tools (`xcrun`).

### Začetno stanje

Rok implementacijske faze: 2026-09-29T18:40:55.902Z. Okolje po navodilih: javni internet je blokiran; `npm run check` je uporabil prednastavljeno povezavo Playwright prek `task/browser.json`; ročni Chromium zagon ni bil uporabljen. Pri izvajanju so npm izpisal opozorilo o zastareli nastavitvi `http-proxy`, Playwright pa opozorila, da `NO_COLOR` ne velja ob `FORCE_COLOR`. Git ukaz je spodletel z `xcrun: error: invalid active developer path ... CommandLineTools`; zato Git status in `git diff --check` nista bila na voljo. Ukazi npm in testi so se kljub temu uspešno končali.

## Implementacija in sledljivost

Vrstni red ID-jev in sklada sta lokalni stanji `ProjectView` v `src/App.tsx`. Vsak projekt dobi novo komponento prek `key={project.id}`; spreminjanje pogleda ali dialoga ne spremeni ključa. Tabela in tabla prejmeta enako globalno urejen seznam; stolpci table ga filtrirajo po statusu brez spremembe statusa. Gumbi ob opravilu so ločeni od njegove povezave. Dodatni testni scenariji so v `tests/agent/order-history.spec.ts`.

| Zahteva | Pogoj in koda | Izvedeno preverjanje | Rezultat |
| --- | --- | --- | --- |
| R01 | Začetno stanje uporablja zaporedje ID-jev iz GET; prikaz išče opravilo po ID-ju, mesto je globalni indeks v `src/App.tsx` in `src/TaskBoard.tsx`. | P10 D01/D04; osnovni testi podvojenih naslovov; oba prikaza. | Uspešno; vključeno v `npm run check`. |
| R02 | `moveTask` zamenja ID z neposrednim sosedom; objekti Task se ne spreminjajo. | P10 D01/D04, agentni test undo permutacij. | Uspešno; pregledani statusi ostajajo iz istih objektov. |
| R03 | Gumba sta disabled na robovih; `moveTask` preveri indeks in ne spremeni stanja ob neveljavnem klicu. | P10 D01; samostojna agentna testa za robova in enojni seznam. | Popravek po pregledu: testna fixture-a sta zdaj ločena. Neposreden programski klic zavrnjenega handlerja ni ločeno simuliran. |
| R04 | Undo odstrani vrh `undo`, obnovi ga in trenutno stanje doda v `redo`. | P10 D02; agentni test 20 zaporednih undo. | Uspešno. |
| R05 | Redo obnovi vrh `redo`; permutacije vsebujejo samo začetne ID-je. | P10 D02; agentni test 20 zaporednih redo. | Uspešno. |
| R06 | Veljaven premik počisti `redo`; robni premik se vrne brez posodobitve stanja. | P10 D03; agentni mejni test preveri onemogočena gumba na robovih. | Uspešno po kodi in razvojnih scenarijih. |
| R07 | `MAX_UNDO_HISTORY=20`; premik, redo in reset omejijo undo na zadnjih 20 stanj. | Agentni test `undo keeps the latest twenty permutations`. | Uspešno; undo/redo števci in vrstni red so preverjeni. |
| R08 | Reset pri drugačnem vrstnem redu shrani trenutno permutacijo v undo in počisti redo; gumb je disabled pri izvorni permutaciji. | P10 D04; agentni test enega opravila in reset v osnovnih razvojnih primerih. | Uspešno. |
| R09 | Globalni vrstni red je vhod table; tabla filtrira stalne stolpce, mesta in meje premika izhajajo iz globalnih indeksov. | P10 D04 preveri tablo in globalno mesto. | Uspešno; izvirna stanja objektov se ne spreminjajo. |
| R10 | Stanje je v `ProjectView`, ki ostane ista pri preklopu pogleda in podrobnostih, zamenja pa se pri novem projektu; polna osvežitev strani znova naloži API vrstni red. | Agentni test `view and task details keep...`; osnovni testi menjave projekta/osvežitve. | Uspešno. |
| R11 | Statusno besedilo poroča dolžini skladov; undo/redo disabled pri ničli. | P10 D03; agentni test enega opravila; osnovni prazni projekt. | Uspešno. |
| R12 | Brez zapisovalnih API-jev ali sprememb Task polj; obstoječi statusni izračuni in podrobnosti ostanejo; novi slogi so omejeni na kontrole. | P10 D04 preveri brez zapisov in širino dokumenta; osnovni testi statusov/podrobnosti. | Uspešno v razpoložljivih testih. |

### Rezultati zagona

- Pred pregledovalčevim popravkom je `npm run check` uspešno opravil lint, tipe in gradnjo, Playwright pa končal z **48 passed, 1 failed**: zadnji robni test je zaradi ponovno uporabljene route prestregel solo fixture tudi pri drugem `mount` klicu. Ta neuspeh je bil v postavitvi lastnega testa, ne v aplikaciji.
- Po ločitvi fixture-ov je ponovni `npm run check` uspel: lint, TypeScript, gradnja in **50/50 Playwright testov** (14 API, 24 osnovnih namiznih/mobilnih, 8 razvojnih P10, 4 agentni namizni testi).
- `git diff --check`: ni izveden zaradi manjkajoče sistemske Command Line Tools poti (`xcrun` napaka zgoraj).

## Odprta vprašanja in omejitve

V predani specifikaciji nisem našel neskladja z izvirnimi R01–R12. Končni skriti testi niso dostopni, zato niso navedeni kot preverjeni. Ni bil opravljen ločen ročni vizualni pregled; prilagodljivost je preverjena prek P10 D04 pri mobilnem projektu in preizkusa, da dokument pri 390 px ni širši od viewporta. Git pregled ni bil mogoč zaradi sistemske napake `xcrun`.

## Obravnava pregleda

`review.json` je označil implementacijo za pregledano za R01–R12 ter zahteval kodo spremembo samo zaradi R03 agentnega testa. Ugotovitev je utemeljena: `mount` doda route handler, vendar prejšnjega na isti strani ne odstrani. Preverbo začetnih robov in preverbo enega opravila sem razdelil v ločena Playwright testa, ki dobita ločeni strani. Kode aplikacije, specifikacije ali pregleda nisem spreminjal. Drugih ugotovitev ni bilo; omejitve glede skritih testov, vizualnega pregleda in `git diff --check` ostajajo.
