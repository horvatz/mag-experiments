# P04 — Stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio trenutno prikazuje opravila v vrstnem redu, ki ga vrne `/api/projects/:id/tasks`, in omogoča preglednico, tablo ter podrobnosti opravila. Dodajam lokalne kontrole za primarni in sekundarni ključ razvrščanja. Razvrstitev bo nova projekcija prejetega polja; podatki API-ja, povzetki stanj in pripadnost projektom ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Vhod je polje `Task[]` iz javnega API-ja s polji `id`, `projectId`, `title`, `assignee`, `status` in veljavnim `dueDate` v zapisu `YYYY-MM-DD`. Uporabnik lahko izbere primarni ključ `original/title/assignee/status/dueDate`, njegovo smer `asc/desc`, sekundarni ključ `none/title/assignee/status/dueDate` in neodvisno sekundarno smer. Gumb »Izvorni vrstni red« ponastavi nastavitve. Menjava projekta in ponovni zagon strani uporabita privzete nastavitve. Preklop pogleda in odpiranje oziroma zapiranje podrobnosti ohranita nastavitve trenutnega projekta. API napake še naprej uporablja obstoječi prikaz napake in ponovni poskus.

## Zahteve in pravila

Naj bo `T` izvorno polje in `i < j` položaja v njem. `norm(s) = lower(removeMarks(NFD(s)))`, kjer `removeMarks` odstrani U+0300–U+036F. Nizovna primerjava vrne -1, 0 ali 1 z operatorjema `<` in `>` po UTF-16. `cmp(k,a,b)` primerja nizovna polja po `norm`, status po vrstnem redu `todo < in_progress < done`, rok po koledarskem vrstnem redu (veljavni datumi ISO) in `original` vedno vrne 0. Smeri preslikata `asc` v +1 in `desc` v -1.

Pravilo urejanja: če je primarni ključ `original`, je rezultat `T`; sicer rezultat je stabilno urejen `T` po `cmp(primary,a,b) * primaryDirection`, in ob primarni enakosti, če secondary ni `none`, po `cmp(secondary,a,b) * secondaryDirection`; ob enakosti obeh se primerja izvorni indeks naraščajoče. Za tabla je razvrščeno polje razdeljeno po stalnem vrstnem redu stolpcev `todo, in_progress, done`, pri čemer se znotraj vsakega stolpca ohrani relativni vrstni red razvrščenega polja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto (`original, asc, none, asc`) `sorted(T) = T`. | Razvojni D01 in agentni test privzetih kontrol. |
| R02 | `title` in `assignee` uporabljata `norm` in leksikografska operatorja, brez lokalnega ali številskega razvrščanja. | Razvojni D01; agentni Unicode/numerični primer. |
| R03 | Status sledi `todo < in_progress < done`; ISO datum je kronološki. | Razvojni D02–D03; agentni preverbi statusa in rokov. |
| R04 | Smer pomnoži samo primerjavo trenutno obravnavanega ključa. | Razvojni D02; agentni primarni/sekundarni desc z izenačenimi skupinami. |
| R05 | Sekundarno primerjavo uporabi samo, ko je `cmp(primary,a,b) = 0`; smer je neodvisna. | Razvojni D02; agentni mešana smer. |
| R06 | Enakost obeh ključev ohrani indeks; `original` vrne `T` pri poljubnih drugih kontrolah. | Agentni stabilnost/izvorni ključ testi. |
| R07 | Tabla ohrani tri stolpce in uporabi filter stabilno urejene skupne projekcije. | Razvojni D03; agentni vrstni red stolpcev in elementov. |
| R08 | Stanje kontrol je v `ProjectView` in preživi samo spremembe pogleda/podrobnosti znotraj istega projekta. | Agentni navigacijski test; razvojni pogled. |
| R09 | Ključ `ProjectView` je `project.id`; ob novi instanci so privzete vrednosti, URL ne vsebuje kontrol. | Agentni menjava projekta in osvežitev. |
| R10 | Ponastavitev vrne vse štiri privzete vrednosti; nič in eno opravilo se varno razvrstita. | Razvojni D04; agentni prazno/enojno in reset. |
| R11 | `sortedTasks` je kopija/projekcija; skupne številke berejo isto vsebino, urejanje ne zapisuje na API. | Razvojni D04; agentni preverjanje zahtev API in povzetka. |
| R12 | Vsi ID-ji se pojavijo natanko enkrat, povezave uporabljajo ID; ohranijo se podrobnosti, dostopna imena in odziven Folio. | Razvojni testi in agentni podrobnosti/390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete vrednosti so `original/asc/none/asc`; projekcija jih spoštuje. | D01; agentni test »reset, empty and single task…« preveri privzete vrednosti po resetu, menjavi projekta in osvežitvi. | `src/taskSorting.ts:14-19,46-48`; `src/App.tsx:14-18,49-68,113` | Uspešno: `npm run check`, test 47 in 49; vse kontrole imajo pričakovane vrednosti. |
| R02 | Nizovna primerjava: NFD, odstrani U+0300–U+036F, male črke, `<`/`>`; ne upošteva lokalnih pravil ali števil. | D01; agentni test »normalized UTF-16 sorting…« preveri naslove in imena z Č/É/Ž, velike/male črke ter `A10` pred `a2`. | `src/taskSorting.ts:21-29,33-39` | Uspešno: test 47 v končnem `npm run check` potrdi pričakovani vrstni red naslovov in odgovornih. |
| R03 | Status `todo < in_progress < done`; veljavni datumi ISO se primerjajo kronološko. | D02; agentni test »status and date sort…« preveri status in datume v obeh smereh. | `src/taskSorting.ts:31-39` | Uspešno: razvojna testa 40–41 in agentni test 48 v končnem zagonu. |
| R04 | Smer obrne le rezultat trenutnega primerjalnika; indeksa izenačenih opravil ne obrne. | D02; agentna testa »normalized UTF-16 sorting…« in »status and date sort…« preverita padajoči vrstni red ob ohranjenih izenačenjih. | `src/taskSorting.ts:42-62` | Uspešno: test 47 potrdi stabilnost v skupini izenačenih naslovov; test 48 potrdi padajoče datume. |
| R05 | Sekundarni ključ se uporabi le po primarni enakosti in ima lastno smer. | D02; agentni test »normalized UTF-16 sorting…« kombinira status desc in naslov/odgovorno osebo desc. | `src/taskSorting.ts:55-60` | Uspešno: razvojni test 40 in agentni test 47. |
| R06 | Enakost ohrani indeks; `original` vrne izvorni vrstni red kljub ostalim nastavitvam. | Agentni test »normalized UTF-16 sorting…« preveri stabilne vezi in `original` z izbranim rokom desc. | `src/taskSorting.ts:47-48,61` | Uspešno: test 47 v končnem zagonu. |
| R07 | Tabla filtrira isto urejeno projekcijo v stalnem vrstnem redu stanj. | D03; agentni test »status and date sort…« primerja vrstni red preglednice in ID-je v treh stolpcih. | `src/App.tsx:18,69`; `src/TaskBoard.tsx:7-18,24-35` | Uspešno: razvojni test 41 in agentni test 48. |
| R08 | Nastavitve ostanejo v `ProjectView` med menjavo pogleda in podrobnosti opravila. | Agentni test »reset, empty and single task…« odpre/zapre podrobnost v tabli in preklopi v preglednico; baseline test podrobnosti in table navigacije. | `src/App.tsx:12-18,85`; `src/TaskDetails.tsx` | Uspešno: agentni test 49 ter baseline 16, 24, 26, 28 in 36 v končnem zagonu. |
| R09 | Nova instanca `ProjectView` ima privzete vrednosti; URL in trajna shramba nastavitev ne vsebujeta. | Agentni test »reset, empty and single task…« zamenja projekt in osveži stran. | `src/App.tsx:12-18,113`; nastavitve niso vključene v `src/navigation.ts` | Uspešno: test 49 preveri projektno ponastavitev in osvežitev. |
| R10 | Reset nastavi vse štiri privzete vrednosti; nič in eno opravilo sta veljavna. | D04; agentni test »reset, empty and single task…«. | `src/App.tsx:62-68`; `src/taskSorting.ts:46-63` | Uspešno: razvojni test 42 in agentni test 49. |
| R11 | Razvrščanje vrne novo projekcijo; povzetek uporablja izvorne naloge in sort ne zapisuje na API. | D04; agentni test »reset, empty and single task…« pokliče preverjanje brez zapisov. | `src/taskSorting.ts:46-63`; `src/App.tsx:18-23,31-35,73` | Uspešno: test 42 in agentni test 49 potrdita brez zapisov ter ohranjene številke. |
| R12 | ID-ji so prikazani enkrat in povezani po ID; ohranjeni so dostopni pogledi, podrobnosti in ozka postavitev. | Baseline test »duplicate titles open by ID…«; agentni test »duplicate titles keep unique task links…«; baseline mobilni testi. | `src/App.tsx:44-47,73-79`; `src/TaskBoard.tsx:14,25-34`; `src/styles.css:62-66,172-175` | Uspešno: baseline 16, 24–26, 28–38 in agentni test 50 v končnem zagonu. |

### Zapis popravkov specifikacije

- 2026-09-29: začetna specifikacija na podlagi `task/instructions.md` 1.0; po preverjanju kode/testov bodo dodani konkretni deli izvedbe in dokazi.
- 2026-09-29: dopolnjena tabela sledljivosti z izvedenimi funkcijami, poimenovanimi testi in dejanskimi rezultati končnega preverjanja; vsebinska pravila ostajajo po različici 1.0.

## Odprta vprašanja in omejitve

Datumi so po pogodbi veljavni `YYYY-MM-DD`; manjkajočih/neveljavnih datumov ni treba obravnavati. Zahteve določajo stanje le za lokalno stran projekta; za navigacijo med nedokončanim nalaganjem ni dodatnih pričakovanj. Končni testi naloge niso dostopni iz repozitorija.
