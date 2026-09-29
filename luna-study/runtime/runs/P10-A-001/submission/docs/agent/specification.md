# Specifikacija P10: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio pridobi projekte in opravila prek javnega `/api/` ter jih pokaže v preglednici ali tabli. Opravila so trenutno prikazana v vrstnem redu API-odgovora, brez lokalnega urejanja. Uporabnik potrebuje začasno preurejanje istega seznama, premike gor/dol po globalnem vrstnem redu, razveljavitev in ponovno izvedbo. Vrstni red mora delovati enako v obeh pogledih, ne da bi spreminjal opravila, stanja ali strežniške podatke.

## Vhodi, dejanja in izidi

Vhod je `Task[]` iz `GET /api/projects/:id/tasks`; `Task.id` je enkraten in stabilen za opravilo. Začetna permutacija `O` je zaporedje prejetih ID-jev. Prazno polje je veljavno. Dejanja so premik določenega ID-ja za eno mesto gor/dol, razveljavitev, ponovitev in vrnitev na `O`. Veljaven premik ustvari novo permutacijo, shrani celotno prejšnjo v sklad razveljavitev in počisti sklad ponovitev. Razveljavitev/ponovitev prestavita trenutno permutacijo med skladoma. Ponastavitev na `O`, kadar se razlikuje, je eno razveljavljivo dejanje. Neveljavna ali robna dejanja ne spremenijo permutacije ali zgodovine. Stanje velja samo do menjave projekta ali osvežitve.

## Zahteve in pravila

Naj bo `O` izvorna permutacija, `C` trenutna permutacija, `U` sklad prejšnjih permutacij (vrh na koncu), `R` sklad ponovitev, `N=|O|`. Veljavne permutacije vsebujejo vsak ID iz `O` natanko enkrat. Premik `swap(C,i,j)` zamenja le sosednja indeksa `i,j`, zato ohrani vse podatke opravila.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju `C=O`; za ID `O[i]` prikazano globalno mesto je `i+1`; identiteta temelji na ID-ju. | Razvojni in agentski UI primeri, začetni DOM-vrstni red in oznake mest. |
| R02 | Gor za `i>0` izvede `swap(C,i,i-1)`; dol za `i<N-1` izvede `swap(C,i,i+1)`. Druga polja in status ostanejo enaki. | Gumbi v obeh pogledih; preveri soseda, status in podrobnosti. |
| R03 | Gor na `i=0` in dol na `i=N-1` sta onemogočena; neuspešna/robna operacija je identiteta nad `(C,U,R)`. | Dostopnost stanj gumbov ter poskus roba pred in po zgodovinskih dejanjih. |
| R04 | Veljaven premik: `U'=tail20(U ++ [C])`, `C'=swap(C,...)`, `R'=[]`. Undo ob `U!=[]`: `R'=R ++ [C]`, `C'=last(U)`, `U'=init(U)`. | Zaporedni premik/undo in primerjava točnega vrstnega reda. |
| R05 | Redo ob `R!=[]`: `U'=tail20(U ++ [C])`, `C'=last(R)`, `R'=init(R)`. | Več korakov undo in redo z natančnim zaporedjem ID-jev. |
| R06 | Vsak veljaven nov premik počisti `R`; robna poteza ne spreminja `R`. | Undo, nova poteza, preveri onemogočen redo; dodatno robno dejanje po undo. |
| R07 | Po vsaki spremembi `|U|<=20`; odstranijo se le najstarejši vnosi. Redo ohrani vse trenutno razveljavljene korake. | Več kot 20 zaporednih potez in pregled števcev/vrnitev. |
| R08 | Če `C!=O`, reset uporabi eno običajno zgodovinsko spremembo z `C'=O`, `R'=[]`; če `C=O`, je onemogočen in stanje se ne spremeni. | Reset, undo nazaj na predhodno permutacijo, ponastavitev v izhodišču. |
| R09 | Tabela sledi `C`; tabla filtrira `C` v stalne stolpce stanj in znotraj stolpca ohrani relativni vrstni red. Premiki v obeh pogledih uporabljajo globalni indeks v `C`. | Premik med različnima stanjema v tabli, globalne oznake, nespremenjeni stolpci/števci. |
| R10 | `C,U,R` živijo na ravni projekta in preživijo preklop pogleda ter modalne podrobnosti. Nov projekt dobi svoje `O`; ponovno nalaganje začne iz API `O`. | Preklop pogleda/modal, projekt, osvežitev strani. |
| R11 | Statusno besedilo je `Razveljavitve: |U|. Ponovitve: |R|.`; undo/redo sta onemogočena natanko pri praznem pripadajočem skladu. | Preveri besedilo in onemogočena stanja pri praznih/nepraznih skladih. |
| R12 | Za vsa stanja `multiset(C)=multiset(O)`; sprememba je samo permutacija ID-jev, noben zapisni API ni klican; counts in podatkovni prikaz ostanejo iz izvirnih opravil. Folio in notranje drsenje na 390 px se ohranita. | API opazovanje, primerjava polj/stanj/countov in mobilni pregled. |

## Izvedba in sledljivost

Skupni razvojni testi so v `tests/development/P10.spec.ts`; dodatni P10 scenariji so v `tests/agent/P10.spec.ts`. Imena funkcij spodaj kažejo implementacijo, podrobni dnevnik zagona in omejitve pa so v [verification.md](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Ob začetku `order=tasks.map(id)` in mesto `index+1`; ID določa identiteto. | Agent: začetni seznam in 12 opravil z enakimi naslovi. | `src/App.tsx`: `TaskWorkspace`; `src/OrderControls.tsx`: `OrderControls`. | Uspešno v agentskih testih in končnem `npm run check`; začetni vrstni red ter mesto 12 potrjena. |
| R02 | Zamenjava samo izbranega ID-ja z globalnim sosedom. | D01, agent: adjacent movement, board global neighbor. | `src/App.tsx`: `move`; `src/TaskBoard.tsx`: globalni indeks. | Uspešno; vrstni red se spremeni za eno mesto, counts/status ostanejo. |
| R03 | Indeks izven meje vrne isto stanje; robna gumbna stanja so disabled. | D01; agent: meja po undo, enojno opravilo. | `src/App.tsx`: `move`; `src/OrderControls.tsx`: disabled pogoji. | Uspešno; sklop ponovitev ostane pri neveljavni meji nedotaknjen. |
| R04 | Veljaven premik shrani `C`; undo obnovi vrh `U` in shrani `C` v `R`. | D02; agent: undo/reset sequence. | `src/App.tsx`: `move`, `undo`. | Uspešno; preverjen točen vrstni red in števci. |
| R05 | Redo obnovi vrh `R`, shrani trenutno permutacijo v `U`. | D02; agent: undo/redo 20 korakov. | `src/App.tsx`: `redo`. | Uspešno; ponovna izvedba vrne zadnje zaporedje. |
| R06 | Veljaven move/reset počisti `R`, neveljaven move vrne isto stanje. | D03; agent: meja po undo ohrani redo. | `src/App.tsx`: `move`, `reset`. | Uspešno; D03 potrdi novo potezo, agent potrdi, da robna poteza ne spremeni števca ponovitev. |
| R07 | `|U|<=20`, zavržejo se najstarejši vnosi. | Agent: 22 izmeničnih potez, 20 undo in 20 redo. | `src/App.tsx`: `addUndo`. | Uspešno; po 22 potezah je 20 undo, sklad se obnovi v obe smeri. |
| R08 | Reset je ena sprememba na `O`; pri `C=O` je identiteta in gumb disabled. | D04; agent: reset, undo reset, nespremenjen reset; prazen/enojni seznam. | `src/App.tsx`: `reset` in gumb Začetni vrstni red. | Uspešno; reset se razveljavi in onemogoči pri izhodišču. |
| R09 | Tabla filtrira `C` v stalne statusne stolpce; rank in akcija uporabljata globalni indeks. | D04; agent: `web-02` prečka globalno sosedo drugega stanja. | `src/TaskBoard.tsx`; `src/OrderControls.tsx`. | Uspešno; rank 1/2 in vseh 8 kartic potrjenih, summary ostane `[4,2,2]`. |
| R10 | Lokalno stanje živi v projektovem `TaskWorkspace`; projekt key/remount in osvežitev ga inicializirata iz API. | Agent: preklop tabela/tabla, podrobnosti, menjava projekta, reload. | `src/App.tsx`: `TaskWorkspace key={project.id}`; `src/TaskDetails.tsx` ostane znotraj workspacea. | Uspešno; vrstni red in zgodovina preživita pogled/podrobnosti, projekt/reload ponastavita. |
| R11 | Statusno besedilo kaže dolžini skladov; undo/redo sta disabled pri 0. | D02–D03; agent: prazno, eno opravilo, 20 korakov. | `src/App.tsx`: toolbar in `role=status`. | Uspešno; vse preverjene oznake in disabled stanja ustrezajo skladom. |
| R12 | Permutacija ohranja isto množico ID-jev; brez zapisov; fields/counts ostanejo; 390 px brez širjenja strani. | D04; agent: API brez zapisov, statusi/counts, mobilna tabela/tabla. | `src/App.tsx`; `src/TaskBoard.tsx`; `src/styles.css`: drsenje prikaza in kontrol. | Uspešno; agentski testi so potrdili nič API zapisov ter notranje drsenje pri 390 px. |

### Zapis spremembe specifikacije

2026-09-27: Po implementaciji sem načrtovano sledljivost zamenjal z dejanskimi povezavami na funkcije in izvedene scenarije. Vsebinske zahteve R01–R12 in predpostavke se niso spremenile.

## Odprta vprašanja in omejitve

`Task.id` je po pogodbi API-ja enkraten, zato vrstni red hranim kot ID-je, ne kot objekte ali naslove. Specifikacija ne uvaja trajne shrambe ali novih API klicev. Skupni končni testi niso nujno dostopni; neizvedenih scenarijev ne bom označil kot uspešnih.
