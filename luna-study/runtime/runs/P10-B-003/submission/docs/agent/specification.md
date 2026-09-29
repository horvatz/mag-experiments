# Specifikacija: lokalni vrstni red opravil

## Problem in kontekst

Folio prikaže opravila izbranega projekta v vrstnem redu javnega API-ja. Uporabnik naj jih lahko začasno prerazporedi, premike razveljavi ali ponovi ter povrne izvorni vrstni red. Vrstni red velja le za odprti projekt do menjave projekta ali osvežitve; vsebina opravil se ne spreminja. Ohraniti je treba potrjeni videz Folio in slovenska poimenovanja.

## Vhodi, dejanja in izidi

Projekt ima `id` in `name`. Vsako opravilo ima `id`, `projectId`, `title`, `description`, `status` (`todo`, `in_progress` ali `done`), `assignee` in `dueDate` (`shared/types.ts`). Začetni vhod je nespremenjen seznam iz `GET /api/projects/{id}/tasks`; API-jevega vrstnega reda se ne sortira. Opravila se vedno prepoznajo po ID-ju, tudi kadar imajo enake naslove. Ob neuspelem nalaganju ostane obstoječe sporočilo o napaki in vrstni red ni na voljo za spreminjanje.

Uporabnik premika opravila za eno mesto, razveljavlja/ponavlja premike, povrne začetni vrstni red, menja pogled ter odpira/zapira podrobnosti. Uspešna dejanja spremenijo samo lokalni vrstni red in zgodovino; robna ali neveljavna dejanja so brez učinka. Ni trajne shrambe ali novih zapisov na API.

## Zahteve in pravila

Naj `O` označuje trenutno permutacijo ID-jev, `O₀` API-jevo začetno permutacijo, `N = |O|`, indeks `i` pa šteje od 0. `T(O)` zamenja opravilo samo z globalnim neposrednim sosedom. `U` je zgodovina za razveljavitev, `R` za ponovitev; obe sta urejeni od najstarejšega do najnovejšega in hranita celotne permutacije. `take20(X)` obdrži zadnjih največ 20 elementov; `last(X)` je zadnji, `init(X)` pa vsi razen zadnjega; `++` združi zaporedji. Za veljavno zamenjavo velja: `U' = take20(U ++ [O])`, `O' = T(O)`, `R' = []`. Razveljavi: če `U` ni prazna, `O' = last(U)`, `U' = init(U)`, `R' = R ++ [O]`. Ponovi: če `R` ni prazna, `O' = last(R)`, `R' = init(R)`, `U' = take20(U ++ [O])`. Vse ostalo ostane enako; kadar dejanje ni dovoljeno, ostane celotno stanje nespremenjeno. V tabeli »preveri« označuje predlagani sprejemni scenarij, ne že izvedenega testa.

| Zahteva | Pravilo oziroma sprejemni pogoj | Preveri |
| --- | --- | --- |
| R01 | Ob nalaganju je `O = O₀`, brez preurejanja. Opravilo na indeksu `i` kaže globalno mesto `i+1`; povezava med opravilom in mestom določa `id`, ne `title`. | API-jevo zaporedje z enakimi naslovi; primerjaj `data-task-id` z mesti 1…N. |
| R02 | Premik gor pri `i>0` zamenja `O[i-1]` in `O[i]`; dol pri `i<N-1` zamenja `O[i]` in `O[i+1]`. Vsa opravila ohranijo vsa polja, zlasti status. | Premakni gor in dol; preveri samo sosednjo zamenjavo ter nespremenjena polja. |
| R03 | Gumb gor je onemogočen za `i=0`, dol za `i=N-1`. Robno ali neveljavno dejanje ne spremeni `O`, `U` ali `R`; ponovljen robni poskus ne ustvari zgodovine. | Preveri oba roba, gumbe in števce pred/po poskusu. |
| R04 | Vsak veljaven premik shrani prejšnji polni `O` v `U`. Razveljavi povrne zadnji shranjeni `O` in shrani odhajajoči vrstni red v `R`. | En premik in razveljavitev; preveri celotno zaporedje ter oba števca. |
| R05 | Ponovi povrne zadnji `R` in shrani odhajajoči `O` v `U`. Več razveljavitev/ponovitev ohrani prvotno množico ID-jev, brez izgub ali podvajanj. | Dva različna premika, dvakrat razveljavi in ponovi; primerjaj zaporedja. |
| R06 | Veljaven premik po razveljavitvi izprazni ves `R`. Neveljaven/robni premik zgodovine ponovitev ne izbriše. | Po razveljavitvi preveri oba primera dejanja. |
| R07 | `U` hrani največ 20 najnovejših predhodnih permutacij. Ob 21. dejanju odstrani samo najstarejšo; vsa trenutno razveljavljena dejanja je še mogoče ponoviti. | Izvedi 21 veljavnih premikov, nato preveri 20 razveljavitev in 20 ponovitev. |
| R08 | Če `O ≠ O₀`, začetni vrstni red shrani trenutni `O` v `U`, nastavi `O=O₀` in izprazni `R` kot eno razveljavljivo dejanje. Če `O=O₀`, je gumb onemogočen in zgodovini ostaneta nespremenjeni. | Ponastavi spremenjeno zaporedje in razveljavi; nato preveri ponastavitev na `O₀`. |
| R09 | Preglednica kaže globalni `O`. Tabla filtrira po stalnih stolpcih stanj in znotraj vsakega ohrani globalni relativni vrstni red. Premik s table cilja globalnega soseda, kaže globalno mesto in ne spreminja stanja. | Premakni na tabli opravilo čez mejo stolpca; preveri globalni vrstni red in števce stanj. |
| R10 | Menjava pogleda in odpiranje/zapiranje podrobnosti ohranita `O,U,R`. Menjava projekta ali osvežitev naloži njegov `O₀` in prazni zgodovini. Stanje se ne shrani trajno. | Preveri oba pogleda, podrobnosti, drug projekt in osvežitev; preveri, da ni API zapisov ali lokalne trajne shrambe. |
| R11 | Status ima besedilo `Razveljavitve: U. Ponovitve: R.` in prikazuje `|U|`, `|R|`; gumba za razveljavitev/ponovitev sta onemogočena pri ustrezni ničli. Prazen in enoopravilni projekt delujeta brez dovoljenega premika. | Preveri dostopno ime/status, onemogočene gumbe ter projekte z 0, 1 in več opravili. |
| R12 | Vsako dosegljivo `O` je permutacija istih projektnih ID-jev; permutacije ne spreminjajo `id`, `projectId`, naslova, opisa, stanja, odgovorne osebe ali roka. Števci stanj in podrobnosti ostanejo pravilni. Pri 390 px se stran ne razširi; notranje drsenje preglednice/table je dovoljeno. | Primerjaj množico ID-jev, polja in števce; preveri širino 390 px. |

### Dostopnost in združljivost

Ob vrstici/kartici sta gumba `Premakni <id> gor` in `Premakni <id> dol`, ločena od povezave opravila. Mesto ima `aria-label="Mesto opravila <id>"`. Zgodovinski gumbi so poimenovani `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`; števec ima `role="status"` in `aria-label="Zgodovina vrstnega reda"`. Ohranijo se `data-task-id`, dostopna imena obeh pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Besedila naslovov, opisov in imen so lahko Unicode in vsebujejo ločila; število opravil, ID-ji in datumi se ne smejo predpostaviti iz privzetih podatkov. Veljajo obstoječi prikazi praznega nalaganja in napake.

## Izvedba in sledljivost

Izhodiščna mesta za dopolnitev: `src/App.tsx` nalaga projektna opravila, izračuna števce in izriše preglednico; `src/TaskBoard.tsx` razvrsti opravila po stanju; `src/TaskDetails.tsx` prikaže podrobnosti; `src/navigation.ts` vodi pogled/projekt; `src/styles.css` določa odzivni prikaz. `src/useResource.ts` bere prek javnega API-ja. Nove kontrole naj ohranijo obstoječa imena in povezave; izpostavljeni `updateTask` v `src/api.ts` za to funkcionalnost ni dovoljen.

| Zahteve | Ciljni deli izhodišča | Scenariji sprejema | Izid v fazi specifikacije |
| --- | --- | --- | --- |
| R01–R08, R11 | `App.tsx` — `ProjectView`, tabela; nova lokalna permutacija in zgodovina | Scenariji iz istoimenskih vrstic zgoraj, vključno z robovi in omejitvijo 20. | Koda in tipi pregledani; aplikacija/testi niso zagnani. |
| R09 | `App.tsx` — preglednica; `TaskBoard.tsx` — statusni stolpci/kartice | Globalni premik na tabli čez statusno mejo, brez spremembe statusa. | Koda pregledana; ni izvedeno. |
| R10 | `App.tsx` — `ProjectView key={project.id}`; `TaskDetails.tsx`; `navigation.ts` | Menjava pogleda/projekta, odprtje/zaprtje podrobnosti in osvežitev. | Koda pregledana; ni izvedeno. |
| R12 | `shared/types.ts`; `App.tsx`; `TaskBoard.tsx`; `TaskDetails.tsx`; `styles.css` | Nespremenjena polja/števci, isti ID-ji in prikaz pri 390 px. | Koda in tipi pregledani; ni izvedeno. |

## Odprta vprašanja in omejitve

Predpostavke naloge: ID-ji znotraj projekta so enolični, vendar njihove konkretne vrednosti niso fiksne; projekti lahko vsebujejo 0, 1 ali poljubno več opravil; naslov ni identiteta. Veljajo tudi različna zaporedja, Unicode besedila ter veljavni koledarski datumi. Predaja ne potrjuje izvedbe. Specifikacijski agent ni spreminjal kode ali zagnal testov; implementer naj po izvedbi dopolni sledljivost z dejanskimi datotekami, testi, izidi in dokazom zagona. Testne poti `/__test/` UI ne uporablja; strežnik, skupni tipi, odvisnosti, infrastruktura in skupni testi ostanejo nespremenjeni.
