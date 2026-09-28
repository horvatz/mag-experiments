# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Folio v izbranem projektu že prikazuje opravila v preglednici ali tabli. Uporabnik potrebuje nastavljiv CSV trenutnega projekta, ne da bi filter skril opravila iz vmesnika ali spremenil njihova izvorna polja. Izhodiščna aplikacija teh kontrol in izvoza še nima.

## Vhodi, dejanja in izidi

`ProjectView` bere `Task[]` iz `/api/projects/<projectId>/tasks`; projekt je izbran po `Project.id`. `Task` ima polja `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`, vsa besedilna; `status` je `todo | in_progress | done`. Izvozna glava ima ločen predpisan vrstni red, naveden pri R02.

Uporabnik izbere poljubno podmnožico stolpcev, ločilo (`;` ali `,`) in filter (`all`, `todo`, `in_progress`, `done`), nato izbere **Izvozi CSV**. Privzete nastavitve: vseh sedem stolpcev, `;`, `all`. Nastavitve ostanejo lokalne trenutnemu projektu in se ne zapišejo v URL ali shrambo. Prazna izbira stolpcev ali nič ustreznih opravil onemogoči prenos. Ob menjavi projekta in ponovnem nalaganju aplikacije se uporabijo privzete nastavitve. Izvoz prenese datoteko brez navigacije, nove strani ali zahteve s CSV vsebino na API.

## Zahteve in pravila

Naj bo `T` zaporedje opravil, prejetih za trenutno izbrani projekt, `C` izbrani podnabor dovoljenih stolpcev, `D` izbrani filter in `F_D(T) = [t ∈ T | D = all ∨ t.status = D]`. Filtriranje ohrani relativni vrstni red in velja le za izvoz. Gumb je omogočen natanko, ko so opravila naložena, `|C| > 0` in `|F_D(T)| > 0`; sicer je onemogočen in klik ne sproži prenosa.

Za `C` vedno uporabi kanonični vrstni red iz R02. Za vsako glavo in vrednost CSV celico zapiši kot `"` + vse notranje `"` podvoji + `"`; med celicami uporabi izbrano ločilo. Pred citiranjem vsake podatkovne vrednosti uporabi R08; glave izvzemi. Ne odstranjuj ali normaliziraj presledkov, ločil, CR/LF, Unicode znakov ali vsebine. Celice posameznega zapisa združi, zapise pa loči z `\r\n` in dodaj zaključni `\r\n`; pred vsebino dodaj U+FEFF. Tako sta enaka stanja nastavitev in enaki vhodni podatki v obeh pogledih enaka bajtom.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `C` vsebuje vse dovoljene stolpce, `D=all`, ločilo `;`. `F_D(T)` ohrani izvorni vrstni red `T`. | Privzeto prenesi več opravil v znanem vrstnem redu; primerjaj vrstice z API odgovorom. |
| R02 | Dovoljeni stolpci so `id, projectId, title, status, assignee, dueDate, description`. Glava in vrednosti sledijo temu vrstnemu redu ne glede na vrstni red izbiranja. | Izberi kolone v obratnem/mešanem vrstnem redu; preveri glavo in preslikavo vrednosti. |
| R03 | Če `C=∅`, je gumb onemogočen in prenos se ne zgodi. Izbira kolone ga omogoči natanko, če so ustrezne vrstice. | Odstrani vse kolone, nato izberi eno; opazuj stanje gumba in število prenosov. |
| R04 | Filter izbere `all` ali opravila z natanko izbranim statusom. Prikaz preglednice/table ostane `T`; prazen projekt ali `F_D(T)=∅` onemogoči izvoz. | Preveri vse filtre z več statusi, prazen projekt in filter brez zadetkov v obeh pogledih. |
| R05 | Ime je `folio-<projectId>.csv`; bajti se začnejo z UTF-8 BOM/U+FEFF. Ustvari se lokalni prenos, brez navigacije/nove strani in brez pošiljanja vsebine na strežnik. | Preveri ime in bajte prenosa, trenutno stran ter omrežne zahteve med izvozom. |
| R06 | Ločilo je `;` ali `,`. Vsaka glava/vrednost je obdana z dvojnimi narekovaji, vsak notranji `"` podvojen. | Za obe ločili preveri surovi CSV s praznim poljem, narekovaji in ločilom v vrednosti. |
| R07 | Zapisi so ločeni s CRLF, tudi zadnji se konča s CRLF. Ločila ter CR/LF v vrednostih ostanejo nespremenjeni znotraj citiranih celic. | Primerjaj surove bajte z vrednostjo, ki vsebuje ločilo, LF, CRLF in več vrstic. |
| R08 | Za izvirni niz `s` dodaj apostrof pred prvim znakom natanko, kadar `s` po nič ali več začetnih ASCII presledkih, tabulatorjih, CR ali LF sledi z `=`, `+`, `-` ali `@`. Ostalo ostane enako. Pravilo velja za vse podatkovne kolone, ne za glavo. | Preveri vsak znak, dovoljene predpone in druge predpone; preveri celice vseh sedmih polj in glavo. |
| R09 | Besedilo, šumniki, Unicode, presledki in opis ostanejo enaki, razen R08. `status` je interna vrednost; `dueDate` je izvorni niz `YYYY-MM-DD`, brez formatiranja. | Primerjaj CSV celice z API vrednostmi, vključno z Unicode in datumom, ki se razlikuje od prikaznega formata. |
| R10 | Menjava Preglednica/Tabla ohrani `C`, ločilo in `D`. Ob enakih nastavitvah sta izvožena zaporedja bajtov enaka. | Izvozi v obeh pogledih z enakimi podatki/nastavitvami in primerjaj bajte. |
| R11 | Menjava `projectId` in ponovno nalaganje aplikacije nastavita vse stolpce, `;` in `all`. Vsak zaporedni prenos uporabi trenutno stanje kontrol. | Spreminjaj nastavitve, zamenjaj projekt/osveži, nato primerjaj več zaporednih prenosov. |
| R12 | Izvoz ne mutira opravil/polj, ne kliče zapisovalnega API-ja in ne spreminja obstoječih bralnih funkcij. Ohrani Folio, obstoječa dostopna imena/preglede, `data-task-id`; pri 390 px ni vodoravnega drsenja cele strani, notranji drsnik preglednice/table je dovoljen. Nova dejanja so zunaj povezave opravila. | Primerjaj prikaz/API podatke pred in po izvozu; preveri DOM, omrežje, tipkovnico in širino 390 px. |

Dodatni pogodbeni pogoji uporabniškega vmesnika: checkbox za stolpec ima dostopno ime `Stolpec <ime>`; HTML `select` z dostopnim imenom `Ločilo CSV` ima vrednosti `;` in `,`; HTML `select` z dostopnim imenom `Filter izvoza` ima vrednosti `all`, `todo`, `in_progress`, `done`; gumb se imenuje `Izvozi CSV`. Ohrani imeni pogledov `Preglednica` in `Tabla`, dostopna imena stolpcev `Opravilo`, `Stanje`, `Odgovorna oseba`, `Rok`, `Podrobnosti`, ter `aria-label="Pregled stanj opravil"`. Uporabniški vmesnik ne sme uporabljati `/__test/` ali `localStorage`.

## Izvedba in sledljivost

Obstoječe sidrne točke za implementacijo: `src/App.tsx` (`ProjectView`, API pridobitev opravil, stikalo pogledov in `key={project.id}`); `src/TaskBoard.tsx` (tabla prejme vsa opravila); `src/navigation.ts` (pogled v hash poti); `shared/types.ts` (`Project`, `Task`, `TaskStatus`); `src/styles.css` in `docs/dizajn.md` (odzivni Folio in notranje drsenje). Izvozna logika še ne obstaja v izhodišču. Predvideni testi spodaj so načrt preverjanja za implementacijsko fazo, ne dokaz izvedbe.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete nastavitve in izvorni vrstni red. | Prenos za API zaporedje 3+ opravil. | `src/App.tsx`: `ProjectView`; `shared/types.ts`: `Task`. | Ni preverjeno; specifikacijska faza ni zagnala aplikacije/testov. |
| R02 | Fiksni vrstni red sedmih polj. | Mešan vrstni red klikov; glava in vrstice. | `shared/types.ts`; nova izvozna kontrola/serializator. | Ni preverjeno; predano implementerju. |
| R03 | `C=∅` ali neprazno po predikatu omogočenosti. | Onemogočen gumb brez prenosa; ponovni izbor. | Nova izvozna kontrola v `ProjectView`. | Ni preverjeno; predano implementerju. |
| R04 | Filtriran izvoz, celoten prikaz. | Vsi štirje filtri in prazen rezultat. | `src/App.tsx`: vsebina projekta; `src/TaskBoard.tsx`: tabla prejme `tasks`. | Ni preverjeno; predano implementerju. |
| R05 | Ime, BOM, lokalni prenos brez navigacije/API zapisovanja. | Pregled prenosa in omrežja. | Nova lokalna izvozna funkcija v `src/`. | Ni preverjeno; predano implementerju. |
| R06 | Ločili in citiranje vseh celic. | Bajtna preverba obeh ločil ter narekovajev. | Nova CSV serializacija v `src/`. | Ni preverjeno; predano implementerju. |
| R07 | CRLF tudi na koncu; notranje prelome ohrani. | Surov CSV z večvrstično vrednostjo. | Nova CSV serializacija v `src/`. | Ni preverjeno; predano implementerju. |
| R08 | Predikat nevtralizacije pred citiranjem. | Robni nizi v vsakem podatkovnem polju. | Nova obdelava vrednosti v `src/`. | Ni preverjeno; predano implementerju. |
| R09 | Surove vrednosti API, brez formatiranja. | Primerjava celic z odzivom `/api/`. | `shared/types.ts`; `src/App.tsx`: `tasks`. | Ni preverjeno; predano implementerju. |
| R10 | Stanje preživi spremembo pogleda; bajti so enaki. | Zaporedni izvoz v obeh hash pogledih. | `src/App.tsx`: stikalo; `src/navigation.ts`: `useRoute`. | Ni preverjeno; predano implementerju. |
| R11 | Privzeto stanje po menjavi projekta/osvežitvi. | Spremeni kontrole, zamenjaj projekt, ponovno naloži. | `src/App.tsx`: `ProjectView key={project.id}`. | Ni preverjeno; predano implementerju. |
| R12 | Brez mutacij/zapisov; ohranjen dostopni in odzivni Folio. | Primerjava pred/po, pregled omrežja in 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `docs/dizajn.md`. | Ni preverjeno; predano implementerju. |

## Odprta vprašanja in omejitve

Razumevanje »osvežitve« je ponovno nalaganje aplikacije; to ponastavi lokalno stanje. Izvozna kontrola je ob nalaganju podatkov nedosegljiva/onemogočena, ker še ni mogoče določiti `F_D(T)`. Vse zahteve izvirnih navodil so obvezne ne glede na to, ali jih kasnejši test ponovi. Izvoz, aplikacija in testi v tej specifikacijski fazi niso bili zagnani; vsa preverjanja ostajajo odprta za implementerja/reviewerja.
