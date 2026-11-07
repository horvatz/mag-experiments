# Razvojna specifikacija: P10 lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio omogoča pregled opravil v treh pogledih, ne omogoča pa urejanja vrstnega reda. Uporabnik potrebuje lokalno, na trenutni projekt vezano urejanje zaporedja opravil, z omejeno zgodovino razveljavitev in ponovitev, brez spreminjanja podatkov na strežniku.

Specifikacija pokriva R01–R12 iz `task/instructions.md`. Zahteva enako množico enkratnih ID-jev opravil v vseh permutacijah, ohranja obstoječa imena pogledov, stolpcev in dostopnost, ter dodaja nova dejanja v skladu z dogovorom o vmesniku.

## Vhodi, dejanja in izidi

- **Vhodi:** opravila pridobljena iz obstoječega javnega API-ja `/api/`, z enkratnimi ID-ji, veljavnimi datumi, navadnimi besedilnimi vrednostmi in morebitno enakimi naslovi. Projekta sta lahko prazna ali z enim opravilom.
- **Dejanja:** `Premakni <id> gor`, `Premakni <id> dol`, `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red`.
- **Izhodi:** preglednica prikazuje globalni vrstni red, tabla pa relativni vrstni red znotraj stolpcev stanj. Obe uporabljata globalnega soseda za premike. Zgodovina je izključno lokalna in se ponastavi ob menjavi projekta ali osvežitvi.
- **Napake:** neveljavna ali robna dejanja ne spremenijo vrstnega reda niti zgodovine. Uporabniški vmesnik ne sme brati ali pisati testnih kontrol `/__test__/` ali nadomeščati API-ja z lokalnimi podatki.

## Stanje in prehodi

Stanje nove funkcionalnosti je lokalno za trenutni projekt:

- `initial` je zaporedje ID-jev, kot ga vrne prvi uspešen GET `/api/projects/{projectId}/tasks`;
- `current` je trenutna permutacija istih enkratnih ID-jev;
- `undo` je sklad prejšnjih permutacij, največ dolžine 20;
- `redo` je sklad trenutno razveljavljenih permutacij.

Prehodi:

- `moveUp(id)` je veljaven, če je `index = current.indexOf(id)` in `index > 0`; nastavi `undo = [...undo, current].slice(-20)`, `redo = []` in zamenja `current[index]` s `current[index - 1]`.
- `moveDown(id)` je veljaven, če je `index >= 0` in `index < current.length - 1`; nastavi `undo = [...undo, current].slice(-20)`, `redo = []` in zamenja `current[index]` s `current[index + 1]`.
- Neveljaven premik, vključno z robnim, pusti `(current, undo, redo)` nespremenjen.
- `undoMove()` je veljaven samo, če `undo.length > 0`; nastavi `redo = [...redo, current]` in `current = undo.pop()`.
- `redoMove()` je veljaven samo, če `redo.length > 0`; nastavi `undo = [...undo, current]` in `current = redo.pop()`.
- `resetOrder()` je veljaven samo, če `current ≠ initial`; nastavi `undo = [...undo, current].slice(-20)`, `redo = []` in `current = initial`. Če je `current = initial`, je dejanje onemogočeno in pusti vse tri dele stanja nespremenjene.

Omejitev `slice(-20)` velja za vsako dodajanje v `undo`, torej tudi za `Začetni vrstni red`. Zgornja meja ne omejuje števila ponovitev.

## Izhodišče v kodi

- `shared/types.ts` določa `Task` z enkratnim `id`, `projectId`, naslovom, opisom, statusom, osebo in datumom; vrstni red ne sme spreminjati teh polj.
- `src/App.tsx` v `ProjectView` pridobi nabor opravil projekta, izračuna števce stanj, izriše preglednico in posreduje nabor v `TaskBoard`; to je primerno mesto za lokalno stanje vrstnega reda in globalna dejanja.
- `src/TaskBoard.tsx` ohrani tri stalne stolpce in izriše kartice v zaporedju prejetega nabora; implementacija naj prejme urejen nabor, globalna mesta in povratne klice za premike.
- `src/TaskDetails.tsx` in navigacija že omogočata odpiranje po ID-ju; novi gumbi morajo biti zunaj povezave na opravilo.
- `src/useResource.ts` uporablja obstoječi bralni API; za to nalogo UI ne sme uporabiti `updateTask`, zapisovalnega API-ja, `localStorage` ali testnih kontrol.
- `src/styles.css` že omogoča notranje drsenje preglednice in table ter pretočno postavitev; nove kontrole morajo ohraniti `document.documentElement.scrollWidth <= 390` pri širini 390 pik.

## Zahteve in pravila

Za `permutacija(P)` velja, da vsebuje natanko enkrat vsak `id` iz trenutno naloženih opravil projekta `P` in da so polja opravil nespremenjena. `predhodnik(id)` oziroma `naslednik(id)` sta opravili na globalni poziciji ena manj oziroma ena več. Vsi premiki delujejo na globalnem vrstnem redu, ne na prikazu znotraj tabele.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak projekt začetno stanje nastavi `order = prejetoZaporedje`. Vsak `id` ima prikazano globalno mesto `index+1`; naslovi se ne uporabljajo za razvrščanje ali povezovanje. | Test naloži podatke z enakimi naslovi in v neabecednem zaporedju ter preveri vrstni red, mesta in `data-task-id`. |
| R02 | Veljaven `gor(id)` zamenja soseda v `order`; `dol(id)` zamenja `id` z naslednjim. Polja opravil in status ostanejo enaki. | Test premakne srednje opravilo v obeh smereh in primerja celoten odziv, vrstni red, status in podrobnosti. |
| R03 | `gor(order[0])` in `dol(order[n-1])` sta onemogočena. Ponovljena ali neveljavna robna dejanja ne spremenita `order`, zgodovine ali prikaza. | Test preveri `disabled`, poskuša dejanje in primerja celotno stanje pred/po. |
| R04 | Vsak veljaven premik shrani prejšnjo celotno permutacijo v sklad razveljavitev. `Razveljavi` obnovi zadnjo prejšnjo permutacijo in trenutno shrani v sklad ponovitev. | Test naredi zaporedje premikov, naredi več razveljavitev in preveri permutacije brez podvajanj ID-jev. |
| R05 | `Ponovi` obnovi zadnjo razveljavljeno permutacijo. Večkratna izmenjava ohranja pravilni skladovni zaporedji. | Test izvede več razveljavitev/ponovitev in primerja izide s pričakovanim zaporedjem. |
| R06 | Nov veljaven premik po razveljavitvi počisti zgodovino ponovitev. Onemogočen ali ponovljen robni premik zgodovine ponovitev ne počisti. | Test razveljavi, ponovi/neveljavno premakne, preveri ohranitev; nato veljavno premakne in preveri ponastavitev. |
| R07 | `undo.length ≤ 20`; ob 21. veljavnem premiku se odstrani najstarejša. `redo.length` pokriva vse trenutno razveljavljene korake. | Test naredi 22+ premikov in preveri meje zgodovine ter vseh ponovitev. |
| R08 | `Začetni vrstni red` nastavi izvorno permutacijo kot eno novo razveljavljivo dejanje in počisti ponovitve. Če je trenutni vrstni red enak izvornemu, je gumb onemogočen in ne spremeni zgodovine. | Test premakne, ponastavi, preveri razveljavo; nato ponovno klikne v izvornem stanju in preveri onemogočenost. |
| R09 | Preglednica prikazuje globalni vrstni red. Tabla ohrani obstoječe stalne stolpce stanj in znotraj njih prikaže relativni vrstni red; gumbi uporabljajo globalnega soseda in prikazujejo globalno mesto. | Test zaposli opravila v različnih stolpcih in preveri oba prikaza ter globalne premike. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vrstni red in zgodovini. Menjava projekta ali osvežitev ponastanita vse novo stanje na izhodišče projekta. Brez trajne shrambe ali zapisovalnega API-ja. | Test izvede prehode pogledov, odpiranje/zapiranje podrobnosti ter osvežitev; preveri enake naloge API-ja. |
| R11 | `role=status` z `aria-label="Zgodovina vrstnega reda"` kaže točno `Razveljavitve: U. Ponovitve: R.`. Gumba `Razveljavi premik` in `Ponovi premik` sta onemogočena pri ničli. Projekta z 0 ali 1 opravilom ostaneta uporabna, brez dovoljenega premika. | Test preveri števce, onemogočenosti, prazen projekt in projekt z enim opravilom. |
| R12 | Vsaka sprememba je permutacija iste množice ID-jev; ni omrežnih zapisov, sprememb polj, statusov ali pravilnih števcev stanj. Ohranjen sta prilagodljiv Folio in dostopnost obstoječih imen. | Test primerja podatke pred/po, nadzira omrežne zahteve in izvede skupne ter lastne dostopnostne/pretočne preglede. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni vrstni red, globalna mesta in enaki naslovi se razlikujejo po ID-ju. | `R01_initial_order_ignores_equal_titles` | `src/App.tsx` — `ProjectView` in tabela; `src/TaskBoard.tsx`; `shared/types.ts`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R02 | Veljaven premik zamenja točno globalnega soseda in ohrani vse podatke. | `R02_moves_swap_global_neighbors` | `src/App.tsx` — stanje `current`; `src/TaskBoard.tsx` — akcije kartic. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R03 | Robna dejanja so onemogočena in brez učinka na stanje. | `R03_boundary_actions_are_noops` | `src/App.tsx` — dejanji `moveUp`/`moveDown`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R04 | Razveljava obnovi zadnjo prejšnjo permutacijo in shrani trenutno za ponovitev. | `R04_undo_restores_previous_permutations` | `src/App.tsx` — sklada `undo`/`redo`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R05 | Več razveljavitev in ponovitev ohrani pravilni zaporedji. | `R05_redo_replays_all_undone_permutations` | `src/App.tsx` — sklada `undo`/`redo`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R06 | Veljaven nov premik počisti samo zgodovino ponovitev; robni premik je brez učinka. | `R06_valid_move_clears_only_redo_history` | `src/App.tsx` — prehodi premika. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R07 | Zgodovina razveljavitev je omejena na 20; vse ponovitve ostanejo dostopne. | `R07_undo_history_is_limited_to_20` | `src/App.tsx` — `slice(-20)` in `redo`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R08 | Ponastavitev na izvorni red je ena razveljavljiva sprememba; v izvornem stanju je onemogočena. | `R08_reset_is_undoable_and_disabled_when_initial` | `src/App.tsx` — `initial` in `resetOrder`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R09 | Preglednica kaže globalni red; tabla ohrani stolpce in relativni red znotraj njiju, premiki pa uporabljajo globalnega soseda. | `R09_board_shows_global_rank_and_global_neighbors` | `src/App.tsx` — tabela; `src/TaskBoard.tsx` — filtriranje in kartice. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R10 | Preklop pogleda in podrobnosti ohranita stanje; menjava projekta ali osvežitev ga ponastavita. | `R10_view_details_project_and_refresh_reset_rules` | `src/App.tsx` — `key={project.id}` in route; `src/useResource.ts`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R11 | Števca, onemogočenosti ter projekta z 0 ali 1 opravilom so pravilni. | `R11_history_counts_and_edge_projects` | `src/App.tsx` — status zgodovine in prazna stanja; `src/TaskBoard.tsx`. | Načrtovano, ni izvedeno v specifikacijski fazi. |
| R12 | Ni zapisov, podatki in statusi ostanejo enaki, Folio in dostopnost sta ohranjeni. | `R12_readonly_integrity_and_folio_layout` | `src/api.ts`/`src/useResource.ts` — samo branje; `src/App.tsx`; `src/styles.css`. | Načrtovano, ni izvedeno v specifikacijski fazi. |

Predlagana lokacija lastnih testov je `tests/agent/P10-order.spec.ts`. Obstoječi `tests/development/P10.spec.ts` pokriva le D01–D04 in ni zadosten dokaz za celoten obseg. Implementer mora pred oddajo zagnati lastne teste, skupne razvojne teste, typecheck/lint/build po razpoložljivem času ter po potrebi `npm run check`; v sledljivost zapiše dejanske izide in dnevnik, ne more pa navajati nedostopnih končnih testov kot uspešnih.

## Odprta vprašanja in omejitve

- Specifikacija predpostavlja, da javni API v celoti vrne nabor opravil trenutnega projekta in da so ID-ji enkratni, kot zahtevajo navodila.
- Navigacije med nezaključenim nalaganjem ter sočasne spremembe podatkov brez osvežitve niso v obsegu obstoječih regresij.
- Končni (nedostopni) testi se ne navajajo kot uspešni. Implementer mora dokumentirati dejansko izvedene preglede, morebitne neizpolnjene zahteve in rezultate.
