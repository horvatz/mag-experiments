# Specifikacija P08: Koledarski pregled rokov

## Problem in kontekst

Folio trenutno prikaže vsa opravila projekta v tabeli ali na tabli, brez
razvrstitve po rokih. Uporabnik potrebuje predvidljiv pregled odprtih in
končanih opravil glede na koledarski referenčni datum. Obstoječi API, podatki,
podrobnosti opravila in izbira prikaza ostanejo vir oziroma del istega
vmesnika. Privzeti referenčni datum je vedno `2026-09-21`, ne ura naprave.

## Vhodi, dejanja in izidi

- Vhod je seznam opravil trenutnega projekta iz `GET /api/projects/{id}/tasks`;
  za vsako opravilo uporabimo `id`, `status` in koledarski niz `dueDate`.
- Polje `type=date` ureja trenutno besedilo ter zadnji veljavni referenčni
  datum. Veljavno izbrani datum takoj preračuna skupine. Prazno polje prikaže
  določeno opozorilo, a pusti zadnji veljavni preračun. Naslednji veljavni
  vnos opozorilo odstrani.
- Izbirnik skupine sprejema `all`, `overdue`, `today`, `week`, `later` in
  `done`; spremeni samo vidni podnabor, ne podatkov.
- Gumba Preglednica in Tabla spremenita prikaz prek obstoječe navigacije.
  Lokalni datum, tudi neveljavno/prazno besedilo polja, ter skupina ostanejo.
  Nova izbira projekta ustvari začetne vrednosti; osvežitev strani prav tako.
- Pregled je samo bralni. Uspešna uporaba ne pošilja zapisov API-ju, ne
  spreminja URL-ja zaradi filtra in ne hrani filtra v trajni shrambi.
- Prazen seznam kaže pet ničel; prazna izbrana skupina kaže `Ni opravil v
  izbrani skupini.` in kontrola omogoča izbiro druge skupine ali vseh opravil.

## Zahteve in pravila

Naj bo `R` veljaven datum oblike `YYYY-MM-DD`, `d(t)` rok opravila `t` v isti
obliki in `G(t,R)` njegova skupina. Za koledarske nize enake oblike leksikalna
primerjava ustreza vrstnemu redu datumov. `R+1` in `R+7` pomenita koledarsko
seštevanje v UTC, ne milisekund ali lokalnega pasu. Skupine so urejene:
`overdue`, `today`, `week`, `later`, `done`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob montaži `R = 2026-09-21`, skupina `all`. | Razvojni testi in lastni test začetnega stanja. |
| R02 | `t.status = done ⇒ G(t,R) = done`; done ni v odprtih skupinah. | Lastni mejni podatki z dokončanim starim in prihodnjim rokom. |
| R03 | `t.status ≠ done ∧ d(t)<R ⇒ G=overdue`; `d(t)=R ⇒ G=today`. | Skupni primeri in lastni primeri pred/enako datumu. |
| R04 | Za odprto opravilo: `R<d≤R+7 ⇒ week`; `d>R+7 ⇒ later`. Razredi so paroma disjunktni in njihova unija zajame vsako opravilo. | Razvojni test meje tedna ter lastni meji +7/+8. |
| R05 | Primerjava uporablja nize koledarskih datumov; meje izračuna koledarsko po UTC. | Lastni scenarij čez mesec/leto in prestopni februar; pregled algoritma. |
| R06 | Števci štejejo celoten seznam projekta: `count[k]=|{t:G(t,R)=k}|`, ne filtriranega prikaza. | Razvojni test števca, lastni filter in prazen projekt. |
| R07 | `all` ohrani izvorni seznam; druga izbira vrne samo `G(t,R)=filter`, vedno v izvornem vrstnem redu. | Skupni in lastni testi ID-jev vrstic/kartic. |
| R08 | Veljaven vnos nastavi `R` takoj in ne spremeni `filter`; prazen vnos ohrani `R` ter razvrstitev in pokaže točno opozorilo. | Razvojni test praznega vnosa; lastni test ohranjanja filtra. |
| R09 | Tabela in tabla kažeta isti nabor ID-jev; sprememba pogleda ne ponastavi lokalnih kontrol. | Razvojni in lastni testi obeh prikazov ter kontrol po preklopu. |
| R10 | `ProjectView` stanje je lokalno projektu; remount ob menjavi projekta in ponovni zagon strani vrneta `R` ter filter na začetno vrednost. Filter se ne zapiše v URL ali trajno shrambo. | Lastni scenarij ponastavitve; pregled URL/shrambe. |
| R11 | Prazni seznam: vsi števci 0. Prazna filtrirana skupina kaže določeno sporočilo in izbirnik ostane na voljo. | Lastni podatkovni scenarij praznega projekta in prazne skupine. |
| R12 | Vmesnik uporablja veljavne `dueDate` le za prikaz/razvrstitev, ne spreminja zapisov ali bralnih podrobnosti; postavitev sledi Folio slogu in pri 390 px nima vodoravnega prelivanja cele strani. | Skupni regresijski testi, lastni API read-only, mobilna širina, pregled kode/slogov. |

## Izvedba in sledljivost

Klasifikacija je čista funkcija v `src/deadlines.ts`; `ProjectView` v
`src/App.tsx` hrani stanje datuma, skupine in opozorila, izračuna števce ter
isti filtrirani seznam preda tabeli oziroma tabli. Razvojni P08 testi in lastni
Playwright testi so dejansko zagnani kot del `npm run check`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetna vrednost `2026-09-21` in `all`. | `D01: fixed anchor and overdue tasks`; `projects show their own tasks and all three states`; `P08 project changes and reload reset the local filter state`. | `src/App.tsx`: začetni `useState` v `ProjectView`; privzeti seznam `all`. | Uspešno v končnem `npm run check`; vnos D01 ja, osnovni prikaz vsebuje vsa opravila, ponastavitev preverjena. |
| R02 | `done` vedno zmaga nad rokom. | `P08 calendar groups include their boundaries, done tasks, and leap day`; `D04: done group, board and no writes`. | `src/deadlines.ts`: zgodnji `task.status === 'done'` razcep. | Uspešno; agentni test preveri opravili `done-old` in `done-future`, števec `done=2`. |
| R03 | Odprti rok pred `R` je `overdue`, enak `R` je `today`. | `D01: fixed anchor and overdue tasks`; `P08 calendar groups include their boundaries, done tasks, and leap day`. | `src/deadlines.ts`: dnevna razlika `< 0` oziroma `=== 0`. | Uspešno; D01 ID-ja overdue, agentni test števec overdue/today. |
| R04 | Odprti roki `R+1…R+7` so `week`; `R+8` je `later`; vse skupine so izčrpne in ločene. | `D02: inclusive week boundary`; `P08 calendar groups include their boundaries, done tasks, and leap day`; `P08 calendar arithmetic crosses a year boundary`. | `src/deadlines.ts`: razvejitve `difference < 0`, `=== 0`, `<= 7`, sicer. | Uspešno; testi preverijo +7, +8, teden čez februar/marec in december/januar. |
| R05 | Izračun uporablja cele koledarske dni v UTC. | `P08 calendar groups include their boundaries, done tasks, and leap day`; `P08 calendar arithmetic crosses a year boundary`. | `src/deadlines.ts`: `calendarDay` uporablja `setUTCFullYear` in UTC epoch dan. | Uspešno; prestopni dan in prehod leta preverjena. Ločeno zaganjanje testa v več časovnih pasovih ni bilo izvedeno. |
| R06 | Števci so `|{t: G(t,R)=k}|` za vsa opravila projekta, ne glede na filter. | `D02: inclusive week boundary`; `P08 calendar groups include their boundaries, done tasks, and leap day`; `P08 empty projects show zero counters`. | `src/App.tsx`: pet vrednosti iz `deadlineGroups`, izračunanih nad `tasks`, ne `filteredTasks`. | Uspešno; vseh pet števcev preverjenih po izbiri skupine in vseh pet ničel za prazen projekt. |
| R07 | `all` ohrani vrstni red API-ja; filter odstrani druge ID-je brez sortiranja. | `D01`, `D02`, `D04`; `P08 calendar groups include their boundaries, done tasks, and leap day`. | `src/App.tsx`: `filteredTasks`; `tbody` neposredno preslika seznam; `TaskBoard` prejme isti seznam in ga razporedi v obstoječe statusne stolpce. | Uspešno; tabela preveri vrstni red, tabla isti ID nabor. Znotraj table ID-ji ostanejo v izvornem vrstnem redu. |
| R08 | Veljaven datum takoj spremeni `R`; prazen ohrani zadnji veljavni izračun in filter ter pokaže alert. | `D03: empty draft retains last valid classification`; `P08 empty reference date preserves the last calculation and filter`. | `src/App.tsx`: `handleDateChange`, `dateInput`, `referenceDate`, `dateError`. | Uspešno; opozorilo se odstrani ob novem veljavnem datumu; prazen osnutek in opozorilo ostaneta tudi ob preklopu pogleda. |
| R09 | Oba prikaza uporabljata isti filtrirani seznam; pogled ne ponastavi stanja. | `D04: done group, board and no writes`; `P08 calendar groups include their boundaries, done tasks, and leap day`; `P08 empty reference date preserves the last calculation and filter`. | `src/App.tsx`: skupni `filteredTasks`; lokalni React hooks ostanejo ob hash spremembi pogleda. | Uspešno; ID-ji in datum/filter (tudi prazen osnutek) preverjeni pri preklopu tabela/tabla. |
| R10 | Menjava projekta in ponovni zagon začneta z `2026-09-21`/`all`; filter ni v URL/shrambi. | `P08 project changes and reload reset the local filter state`. | `src/App.tsx`: stanje v `ProjectView`; `key={project.id}` sproži ponastavitev pri projektu; noben zapis URL/shramba. | Uspešno; test preveri menjavo projekta, reload, `location.search` in lokalno/session shrambo. |
| R11 | Prazen projekt ima pet ničel; prazna skupina v nepraznem projektu ima zahtevano sporočilo. | `P08 empty groups and empty projects keep their controls and all five counts`; `P08 empty projects show zero counters`; razvojni prazen board regresijski scenarij. | `src/App.tsx`: empty-group stanje in obstoječe prazno-projektno stanje; kontrole/števci renderirajo ob seznamu `[]`. | Uspešno; sporočilo, obnovitev `all`, kontrole in ničle preverjene. |
| R12 | Veljaven koledarski rok ostane bralni; API brez zapisov; Folio ohrani mobilno širino. | `P08 calendar groups include their boundaries, done tasks, and leap day`; `P08 remains read-only and fits a 390 pixel viewport`; vseh 38 regresijskih testov. | `src/App.tsx`: GET opravil; ni klica zapisovalnega API-ja; `TaskDetails` ostane nespremenjen; `src/styles.css`: odzivna mreža in obstoječe notranje drsenje. | Uspešno; prestopni `datetime`, brez API zapisov in brez vodoravnega razširitvenega prelivanja pri 390 px; izhodiščni regresijski testi uspešni. |

## Odprta vprašanja in omejitve

- Predpostavka: izraz »osvežitev« pomeni polno ponovno nalaganje strani, kot
  običajno za lokalno stanje React komponente.
- API in navodila zagotavljajo veljavne koledarske datume; validacija domenskih
  zapisov ni del uporabniškega pregleda. Uporabniški datum pa omejuje brskalnik
  prek `input type=date`.
- Končni skriti primeri niso dostopni; pokritost bo opisana samo glede na
  scenarije, ki so bili dejansko zagnani.

## Zapis dopolnitev

- Začetna specifikacija pred spremembo kode, 2026-09-27.
- 2026-09-27: po implementaciji je načrtno sledljivostno tabelo zamenjala
  tabela z dejanskimi deli kode, imeni izvedenih testov, izidi in navedeno
  omejitvijo testiranja več časovnih pasov.
