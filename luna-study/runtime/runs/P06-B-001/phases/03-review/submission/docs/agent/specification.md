# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v pogledih Preglednica in Tabla. Dodati je treba lokalne kontrole za izvoz CSV. Izvoz ne sme spremeniti obstoječega prikaza, zapisov ali poti branja podatkov. Začetna rešitev in obstoječe bralne funkcije ostanejo izhodišče.

## Vhodi, dejanja in izidi

Vhod je urejeni seznam opravil trenutnega projekta iz `GET /api/projects/:projectId/tasks`; polja so `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`. Uporabnik izbira stolpce, ločilo (`;` ali `,`) in filter (`all`, `todo`, `in_progress`, `done`), nato sproži **Izvozi CSV**. Vsak stolpec ima checkbox z imenom `Stolpec <field>`; izbirnika sta HTML select `Ločilo CSV` in `Filter izvoza` z zahtevanimi vrednostmi. Začetne nastavitve: vsi stolpci, `;`, `all`. Uspeh sproži prenos `folio-<projectId>.csv`; brez ustreznih vrstic ali izbranega stolpca je gumb onemogočen in prenosa ni. Preklic ali lokalna napaka ne spremeni nastavitev ali opravil; napaka pri branju še naprej uporablja obstoječe stanje nalaganja/napake.

## Zahteve in pravila

Simboli: `T` je seznam opravil trenutnega projekta v izvornem vrstnem redu; `K = [id, projectId, title, status, assignee, dueDate, description]`; `S` je množica izbranih ključev in `C = [k ∈ K | k ∈ S]` (kanonični vrstni red, ne vrstni red klikov); `f` je filter; `R = [t ∈ T | f = all ∨ t.status = f]`; `d ∈ {';', ','}`. `enabled ⇔ (|C| > 0 ∧ |R| > 0)`. `CSV(T,C,f,d)` serializira `R` v njegovem vrstnem redu, le s stolpci `C`. Stanje izbranih polj/ločila/filtra pripada trenutno odprtemu projektu: pogledov menjava ga ohranja, projektna menjava ali osvežitev ga ponastavi.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `f=all`, `C=K`, `d=';'`; `R` ohranja vrstni red `T`. | Koda/API in CSV vsebina; test še ni izveden. |
| R02 | Stolpci so samo `K`; glava je enaka `C`, podatkovne celice sledijo istemu vrstnemu redu ne glede na vrstni red klikov. | Preveriti kontrole ter glavo/vrstico izvoza. |
| R03 | Izvoz omogočen natanko, ko `|C|>0` in `|R|>0`; sicer ni prenosa. | Prazna/ponovno izbrana izbira ter opazovanje prenosa. |
| R04 | Filter določa samo `R`; projektni prikaz vedno temelji na `T`. `|R|=0` onemogoči izvoz. | Primerjati obe stanji vmesnika s filtriranim izvozom. |
| R05 | Prenos vsebuje UTF-8 BOM (`U+FEFF`) in ime `folio-<projectId>.csv`; brez nove strani ali omrežnega zapisa. | Prestrezanje prenosa in pregled bajtov/mrežnih zahtev. |
| R06 | `d∈{';',','}`; vsaka celica je obdana z `"`, notranji `"` se podvoji. | Primeri z narekovaji in obema ločiloma. |
| R07 | Celice ločuje `d`; vrstice in zaključna vrstica uporabljajo CRLF. Ločila/novi redi v narekovani celici ostanejo. | Pregled natančnih bajtov z večvrstičnim opisom. |
| R08 | Za podatkovni niz `s`, če po začetnem zaporedju `[ \t\r\n]*` sledi `[=+\-@]`, je nevtraliziran v `'` + `s`; sicer ostane `s`. Glava je izvzeta. | Vrednosti z različnimi začetnimi presledki ter običajne vrednosti. |
| R09 | Unicode, presledki in opis se ohranijo; `status` je interna vrednost, `dueDate` izvorni `YYYY-MM-DD`, razen R08. | Preveriti izvožene vrednosti, vključno s šumniki. |
| R10 | Menjava pogleda ne spremeni `C,d,f`; pri istih podatkih/nastavitvah je `CSV` enak po bajtih. | Izvoz v obeh pogledih in primerjava. |
| R11 | Menjava projekta in osvežitev nastavita `C=K`, `d=';'`, `f=all`; zaporedni izvozi uporabijo trenutno stanje kontrol. | Menjati vsako nastavitev, projekt/osvežitev, nato primerjati. |
| R12 | Izvoz/izbira ne mutira opravila ali bralnih funkcij, ne pošlje zapisov API-ju; vmesnik ostane prilagodljiv. Ohrani `data-task-id`, obstoječa dostopna imena in `aria-label="Pregled stanj opravil"`; na 390 px širina strani ostane omejena, notranje drsenje je sprejemljivo. | Pregled sprememb/API omrežja, dostopnosti in mobilnega pogleda. |

Skupni pogoji vmesnika: dodatni ukrepi so zunaj povezav posameznih opravil. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena Preglednica/Tabla ter obstoječa imena stolpcev in `aria-label="Pregled stanj opravil"`. Dovoljene spremembe so v `src/`; ne spreminjaj `shared/`, `server/`, infrastrukture, odvisnosti ali skupnih testov. Podatki se berejo prek javnega `/api/`; uporabniški vmesnik ne uporablja `/__test/`, lokalne kopije podatkov ali `localStorage`.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `f=all`, `C=K`, `d=';'`, vrstni red `T` | Razvojni D01 preverja privzeti glavo/okvir; vse vrstice dodatno preveriti | `src/App.tsx`: `ProjectView`, `useResource` | Koda prebrana; D01 ni zagnan in le delno pokriva pogoj. |
| R02 | `C` ohrani vrstni red `K`, glava ustreza vrednostim | Izbiranje v drugačnem vrstnem redu in pregled glave | Nove kontrole v `ProjectView` | Ni implementirano ali preverjeno v tej fazi. |
| R03 | `enabled ⇔ |C|>0 ∧ |R|>0` | Izprazni/obnovi izbor; prazen projekt/filter; potrdi odsotnost prenosa | Nove kontrole v `ProjectView` | Ni preverjeno; ni ustreznega razvojnega primera. |
| R04 | Filter spremeni `R`, ne `T` za prikaz | Razvojni D02 filtrira izvoz; posebej potrdi celoten prikaz | `src/App.tsx`: preglednica in `<TaskBoard tasks={tasks}>` | Koda potrjuje en seznam za prikaz; D02 ni zagnan, polni UI pogoj ni pokrit. |
| R05 | Ime, BOM, brez nove strani/zapisa | Razvojni D01 preverja ime/BOM; D04 preverja zapise | Serializacija/prenos v `ProjectView`; `src/api.ts` ostane bralna pot | Testi niso zagnani; D01/D04 sta delna namenska dokaza. |
| R06 | Vse celice narekovane, notranji narekovaji podvojeni, obe ločili | Razvojna D02/D03 ter primeri z delimitrom znotraj vrednosti | Serializator v `ProjectView` ali lokalni pomožni modul v `src/` | Testi niso zagnani; D02/D03 ne pokrijeta vseh kombinacij. |
| R07 | CRLF med vrsticami in za zadnjo; notranji prelomi se ohranijo | Razvojni D01 preverja zadnji CRLF, D03 večvrstični opis; preglej natančne bajte | Serializator v `src/` | Testi niso zagnani; končni bajti niso preverjeni. |
| R08 | Začetni `[ \\t\\r\\n]*[=+\\-@]` dobi apostrof pred izvirnim nizom | Razvojni D03 pokriva `=`, dodati primere presledkov, tabulatorja, `+`, `-`, `@` in varnega niza | Funkcija normalizacije vrednosti v `src/` pred citiranjem | Testi niso zagnani; D03 je nepopoln. |
| R09 | Ohranitev Unicode/description, internega `status`, izvornega datuma | Primerjaj vsa polja z API nalogo; datum ne gre skozi prikazni `formatDate` | `shared/types.ts`: `Task`; `src/App.tsx`/`src/formatDate.ts` | Tipi/koda prebrani; izvoz še ni implementiran ali preverjen. |
| R10 | Menjava table/board ohrani nastavitve in bajte | Razvojni D04 primerja prenosa po menjavi pogleda | Stanje v `ProjectView`, izbirnik pogleda v `src/App.tsx` | D04 ni zagnan; implementacija še manjka. |
| R11 | Nov projekt/osvežitev → `K`, `;`, `all`; vsak prenos uporabi trenutno stanje | Zaporedni prenosi, projektna menjava, reload | `src/App.tsx`: `ProjectView key={project.id}`; stanje naj bo projektno lokalno | Koda prebrana; scenarij v razvojnih testih manjka. |
| R12 | Brez mutacij/zapisov, obstoječi semantiki in širini ostaneta | Razvojni D04 preverja zapisne zahteve in širino; dodatno preveri atribute/fokus | `src/App.tsx`, `src/TaskBoard.tsx`, `src/api.ts`, `src/styles.css` | Koda prebrana; D04 ni zagnan in ne pokriva vseh atributov/videzov. |

## Odprta vprašanja in omejitve

Začetni tip `Task` potrjuje vseh sedem polj; `status` je `TaskStatus` z vrednostmi `todo`, `in_progress`, `done`, datum pa je niz. `ProjectView` nalaga seznam prek `/api/projects/${encodeURIComponent(project.id)}/tasks`; obstoječi prikaz podatke ne filtrira, Tabla jih razvrsti po stolpcih, datum pa se za prikaz formatira z `formatDate`. Komponenta je ključena z ID-jem projekta; stanje za izvoz v njenem obsegu ohrani nastavitve med menjavo pogleda in ga ob menjavi projekta ponastavi.

Razvojni primeri `tests/development/P06.spec.ts` so specifikatorju berljivi, niso bili zagnani in niso popolno kritje zahtev. Aplikacije, testov ali videza v tej fazi nisem preverjal. Končni dokazi za implementacijo naj navedejo dejansko izvedene teste, dnevnik ter nepreverjene robne primere; izvorne zahteve v `task/instructions.md` ostajajo obvezne.
