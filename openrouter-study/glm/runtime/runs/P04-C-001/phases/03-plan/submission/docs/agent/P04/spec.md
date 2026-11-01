# P04: Stabilno razvrščanje z dvema ključema

**Različica**: 1.0.0  
**Status specifikacije**: pripravljena za načrtovanje  
**Viri zahtev**: `task/instructions.md`, `PROJECT_RULES.md`, `task/specification-template.md`, `docs/dizajn.md`, `.specify/memory/constitution.md`

## Problem in kontekst

Folio (`mag-app`) omogoča pregled opravil projekta v preglednici in tabli ter odpiranje podrobnosti posameznega opravila. Uporabnik želi razvrščati prikaz po primarnem in sekundarnem ključu, pri čemer mora razvrščanje ostati projekcija podatkov: enaki elementi ohranijo izvorni vrstni red, identitete in druge obstoječe funkcije pa ostanejo nespremenjene.

P04 doda štiri obstoječim pogledom skupne kontrole razvrščanja: primarni ključ in smer ter sekundarni ključ in smer. Potrjeni dizajn Folio in dostopnost obstoječih pogledov ostaneta okvir nove funkcionalnosti.

## Vhodi, dejanja in izidi

### Podatkovna polja

- `Task.id`: enkraten niz, prikazan kot `data-task-id` in uporabljen za odpiranje podrobnosti.
- `Task.projectId`: pripadnost projektu; vsako prikazano opravilo pripada izbranemu projektu.
- `Task.title` in `Task.assignee`: nizi, lahko tudi z Unicode znaki in ločili.
- `Task.status`: `todo`, `in_progress` ali `done`.
- `Task.dueDate`: veljaven koledarski datum `YYYY-MM-DD`.
- `Task.description`: obstoječe besedilo, razvrščanje ga ne spreminja.
- `Project.id` in `Project.name`: izbor projekta v obstoječi navigaciji.

### Stanje razvrščanja

```text
primaryKey:      original | title | assignee | status | dueDate
primaryOrder:    asc | desc
secondaryKey:    none | title | assignee | status | dueDate
secondaryOrder:  asc | desc
sourceTasks:     opravila v vrstnem redu, ki jih vrne GET /api/projects/{id}/tasks
visibleTasks:    projekcija(sourceTasks, primaryKey, primaryOrder,
                                        secondaryKey, secondaryOrder)
```

Privzeto stanje je `original`, `asc`, `none`, `asc`. Projekcija je čista funkcija nad `sourceTasks`; stanja ni dovoljeno shranjevati v URL, lokalno shrambo ali strežnik.

### Dovoljena dejanja

| Dejanje | Prehod stanja | Izid |
| --- | --- | --- |
| Sprememba primarnega ključa ali smeri | Posodobi ustrezno polje; ostale tri kontrole ostanejo enake. | `visibleTasks` se preračuna brez sprememb podatkov. |
| Sprememba sekundarnega ključa ali smeri | Posodobi ustrezno polje; primarne kontrole ostanejo enake. | `visibleTasks` se preračuna; sekundarni ključ vpliva samo ob enakosti primarnega. |
| Klik `Izvorni vrstni red` | Vse štiri kontrole nastavijo na privzete vrednosti. | Prikazan je vrstni red `sourceTasks`. |
| Preklop med preglednico in tablo | Ohrani vse štiri kontrole. | Oba pogleda uporabita isti `visibleTasks`. |
| Odpiranje ali zapiranje podrobnosti | Ne spreminja nastavitev razvrščanja. | Po zaprtju ostane enak prikazan vrstni red. |
| Menjava projekta ali osvežitev | Ponastavi vse štiri kontrole. | Nov projekt začne s privzetim vrstnim redom. |
| Nalaganje ali napaka podatkov | Ohrani obstoječe obnašanje nalaganja in prikaza napake. | Razvrščanje ne ustvarja dodatnih pisanj in ne skriva obstoječih stanj. |

## Zahteve in pravila

Simboli: `a <[UTF-16] b` pomeni leksikografsko primerjavo po kodnih enotah UTF-16 z `<` ali `>`; `normalize(s)` pomeni NFD, odstranitev znakov U+0300–U+036F in male črke; `rank(status)` ima vrednosti `todo=0`, `in_progress=1`, `done=2`; `date(t)` pomeni kronološko vrednost veljavnega datuma. Primerjava primarnega ključa je `c1`, sekundarnega `c2`. Smer samo pomnoži izid primerjave izbranega ključa z `-1` za `desc`; nikoli ne obrne končnega polja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju velja `primaryKey=original`, `primaryOrder=asc`, `secondaryKey=none`, `secondaryOrder=asc`; `visibleTasks=sourceTasks`. | Odpre se projekt s poljubnim vrstnim redom in preverijo vrednosti kontrol ter vrstni red ID-jev. |
| R02 | Za `title` in `assignee` velja `c1(a,b)=normalize(a.k) <[UTF-16] normalize(b.k)` z odgovarjajočim predznakom smeri; brez jezikovno ali številčno prilagojenega razvrščanja. | Uporabijo se naslovi in imena z diakritičnimi znaki, ločili in številkami. |
| R03 | Za `status` je vrstni red po `rank` vrednostih `todo`, `in_progress`, `done`. Za `dueDate` sta dva veljavna datuma urejena kronološko po `date`. | Uporabijo se vsa tri stanja in datumi z različnim letom, mesecem ter dnevom. |
| R04 | `desc` pomnoži izid primerjave izbranega ključa z `-1`. Enaki elementi po tem ključu ohranijo relativni vrstni red in celotno polje ni zrcaljeno. | Primerjata se naraščujoč in padajoč vrstni red nad neurejenim vhodom z enakimi vrednostmi. |
| R05 | `c2` se uporabi samo, kadar je `c1(a,b)=0`; sekundarna smer je neodvisna od primarne. | Posploši se kombinacija enakega primarnega ključa in različnih sekundarnih ključev/smeri. |
| R06 | Če sta `c1=0` in `c2=0`, ostane izvorni vrstni red. Enak primarni in sekundarni ključ ne vpeljeta dodatnega obrata. Če je primarni ključ `original`, je `visibleTasks=sourceTasks` ne glede na ostale kontrole. | Preverita se podvojitve vrednosti in kombinacija `original` z neprivzetimi sekundarnimi kontrolami. |
| R07 | Tabla vedno prikaže stolpce v zaporedju `todo`, `in_progress`, `done`; znotraj vsakega stolpca je relativni vrstni red enak delu `visibleTasks` s tem stanjem. | Posploši se ID-je vseh treh stolpcev in primerjajo z razvrščeno preglednico. |
| R08 | Preklop pogleda, odpiranje in zapiranje podrobnosti ohranita vseh štiri nastavitve. | Nastavitve se spremenijo, pogled se preklopi, podrobnost odpre in zapre ter stanje kontrol ponovno preveri. |
| R09 | Menjava projekta in osvežitev sta po privatnosti stanja enaka novemu nalaganju: vse štiri kontrole so privzete; URL in trajna shramba jih ne nosita. | Nastavitve se spremenijo, projekt zamenja ali stran osveži; nato se preverita privzete vrednosti in vrstni red. |
| R10 | Klik na `Izvorni vrstni red` nastavi vse štiri kontrole na privzete vrednosti. Prazno polje in eno opravilo delujeta za vse dovoljene ključe in smeri. | Posploši se reset nad spremenjenim stanjem ter vsi ključi/smeri nad praznim in enim opravilom. |
| R11 | `visibleTasks` je samo permutacija `sourceTasks`: ne spremeni polj, `projectId`, pripadnosti, števcev stanj ali izvornega polja. Sprememba vrstnega reda ne sproži nobenega pisanja na `/api/`. | Primerjata se podatkovni odgovor ali izvorno stanje pred in po razvrščanju, skupne vrednosti številcev ter spremljani nebralni API zahteev. |
| R12 | Vsak `Task.id` je v vsakem pogledu prikazan natanko enkrat, njegova povezava odpre podrobnosti tega ID-ja tudi pri enakih naslovih. Ohranijo se obstoječe imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"`, `data-task-id` in prilagodljivost Folio. | Uporabijo se enaki naslovi z različnimi ID-ji, odprejo se podrobnosti in preverita dostopna imena ter širina 390 px. |

## Izvedba in sledljivost

Specifikacija je pripravljena pred izvedbo. Načrtovana sledljivost bo med implementacijo dopolnjena z dejanskimi mesti in izidi; izida ni dovoljeno označiti kot uspešnega brez izvedenega preverjanja.

| Zahteva | Načrtovano območje | Načrtovano preverjanje | Trenutni izid |
| --- | --- | --- | --- |
| R01–R12 | `src/App.tsx`, `src/TaskBoard.tsx`, morebitna pomožna funkcija za razvrščanje v `src/` | Lastni testi v `tests/agent/`, ki pokrijejo vsa pravila, in skupni testi, kjer so relevantni | Ni izvedeno v tej fazi; sledljivost bo posodobljena po implementaciji. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi ovirala načrtovanje ali izvedbo R01–R12.
- Manjkajoči datumi niso del obsega: vsi testni datumi so veljavni `YYYY-MM-DD`.
- Testne kontrole `/__test/` so izključno orodje testov; uporabniški vmesnik jih ne sme brati ali uporabljati.
- Navigacije med nezaključenim nalaganjem in sočasnimi zunanjimi spremembami podatkov brez osvežitve niso del obstoječih regresijskih zahtev.
- Končni, za odjemalca nedostopni testi se v tej fazi ne smejo navajati kot izvedeni. Lastni testi morajo pokriti vseh dvanajst zahtev.
