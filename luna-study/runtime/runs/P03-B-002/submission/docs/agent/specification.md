# Specifikacija: iskanje in sestavljeni filtri (P03)

## Problem in kontekst

Uporabnik želi v aktivnem projektu hitro poiskati opravila po besedilu, stanju in odgovorni osebi, ne da bi izgubil obstoječi Folio prikaz, navigacijo ali bralne podrobnosti. Privzeto se prikažejo vsa opravila projekta v vrstnem redu API-ja. Filtri so začasno stanje strani; izbira drugega projekta začne s praznimi filtri.

## Vhodi, dejanja in izidi

Vhod so opravila trenutnega projekta iz javnega `/api/`. Tip `Task` v `shared/types.ts` določa `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; `TaskStatus` dopušča `todo`, `in_progress`, `done`. Uporabnik lahko spremeni poljuben filter, zamenja projekt/pogled ali izbere **Počisti filtre**. Filtriranje je lokalno za izbrani projekt in ne zapisuje podatkov. Navigacijski pogled ostane v obstoječi hash poti, filtri pa ne. Ob napaki nalaganja ostane v veljavi obstoječe obnašanje aplikacije; ta naloga ne določa novih zapisovalnih ali obnovitvenih dejanj.

## Zahteve in pravila

Oznake R01–R12 sledijo izvornim zahtevam naloge. Za trenutni projekt naj bo `T` zaporedje opravil, `M = |T|`, `q` niz iskanja, `s` izbrano stanje, `a` izbrana oseba, `F` pa prikazano zaporedje. Definiraj `norm(x) = lowercase(remove(U+0300–U+036F, NFD(x)))`, `W = splitWhitespace(q)` brez praznih besed in `text(t) = norm(t.id + " " + t.title + " " + t.description + " " + t.assignee)`. Potem `textMatch(t) = ∀w∈W: norm(w)` je dobesedni podniz `text(t)`; za `W=∅` velja. `matches(t) = textMatch(t) ∧ (s=all ∨ t.status=s) ∧ (a=all ∨ t.assignee=a)`, `F = stableFilter(T, matches)`.

Vmesnik mora imeti iskalni vnos `type="search"` z dostopno oznako **Išči opravila**, izbirnika z oznakama **Filter stanja** (`all`, `todo`, `in_progress`, `done`) in **Filter odgovorne osebe** (`all` ali ime), gumb **Počisti filtre** ter `role="status"`, `aria-label="Rezultati filtriranja"`, z besedilom `Prikazano: N od M.`. Ohraniti je treba `data-task-id` na vrsticah/karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku `q=""`, `s=all`, `a=all`, `F=T`; prikaži vsa opravila v izvornem vrstnem redu. | Naloži projekt z več opravili in preveri kontrole ter vrstni red. |
| R02 | Uporabi `norm` iz definicije. Diakritični znaki, kot `č` in `c`, ter črkovna velikost se ne razlikujeta. | Preveri sestavljeno in razstavljeno Unicode č, c ter velike/male črke. |
| R03 | Uporabi `W` in `textMatch` iz definicije; za več besed je vrstni red polj nepomemben, iskanje je podnizovno in ločila so dobesedna vsebina, ne vzorec regex. | Preveri več besed v poljubnem vrstnem redu, ločila kot navadno besedilo, beline in prazen vnos. |
| R04 | `matches(t) = textMatch(t) ∧ (s=all ∨ t.status=s) ∧ (a=all ∨ t.assignee=a)`; osebo primerjaj natančno. | Preveri vsak filter ter njuno sestavo z iskanjem in med seboj. |
| R05 | Možnosti oseb so `all ∪ unique({t.assignee | t∈T ∧ t.assignee≠""})`, po enkrat; ne filtriraj jih z `F`. Ob menjavi projekta počisti `a`. | Skrij osebo z drugim filtrom, preveri možnost in nato zamenjaj projekt. |
| R06 | Preglednica in tabla izrisujeta isti ID-nabor `{t.id | t∈F}`; pogled ne spremeni `q,s,a`. Tabla razvrsti samo `F` v stolpec `t.status`. | Primerjaj ID-je in filtre pri preklopu pogleda ter vsebino stolpcev. |
| R07 | Menjava projekta nastavi `q=""`, `s=all`, `a=all`; kandidati za `F` vedno izhajajo samo iz `T` trenutnega projekta. | Preklopi projekta z različnimi opravili in preveri ponastavitev ter izolacijo. |
| R08 | Ob ponovnem nalaganju so filtri privzeti; filter ne spreminja URL-ja ali trajne shrambe brskalnika. | Nastavi filtre, osveži stran in preglej URL/shrambo. |
| R09 | Status filtra pove `Prikazano: |F| od M.`; pregled stanj in števci table štejejo elemente v `F`. | Preveri skupni števec in števce po stanju pri filtriranih rezultatih. |
| R10 | Če `M>0 ∧ |F|=0`, pokaži `Ni zadetkov.` in ohrani uporabnost obeh pogledov. Če `M=0`, ohrani obstoječe stanje praznega projekta ter števec `Prikazano: 0 od 0.`. | Preveri nič zadetkov ter prazen projekt v obeh pogledih. |
| R11 | Dejanje počisti nastavi `q=""`, `s=all`, `a=all` hkrati; nato `F=T`. Filtriranje ne spreminja vrstnega reda ali podatkov opravil. | Uporabi več filtrov, počisti in preveri vse tri kontrole, rezultat ter nespremenjene podatke. |
| R12 | Ohranijo se obstoječa navigacija in bralne podrobnosti; filtriranje ne pošlje POST/PATCH/PUT/DELETE na `/api/`. Folio stran se pri širini 390 px ne razširi; notranje drsenje je dovoljeno. | Regresijski scenariji navigacije/podrobnosti, spremljanje zahtev in prikaz pri 390 px. |

**Pojasnila in predpostavke:** `T` je seznam, ki ga `ProjectView` v `src/App.tsx` že prebere prek `useResource` iz `/api/projects/:id/tasks`; `F` je stabilni filter tega seznama (ne novo sortiranje). `Task.projectId` potrjuje pripadnost projekta; kartice uporabljajo projektno ID opravila. `all` je sentinel brez pogoja, imena oseb so neprazna in se ne ujemajo z njim, kot določa naloga. Izvorne zahteve in dogovor o dostopnih imenih/oznakah imajo prednost pred primeri testov.

## Izvedba in sledljivost

Preverjeni izhodiščni deli kode: `ProjectView` v `src/App.tsx` trenutno šteje in izrisuje surovi seznam `tasks`; `src/TaskBoard.tsx` razvršča prejeta opravila po treh statusih in nosi `data-task-id`; `src/navigation.ts` hrani izbrani pogled v hash poti; `src/styles.css` že omejuje stran na ozkem zaslonu ter dovoljuje drsenje preglednice/table; `src/api.ts` ima GET-pripomoček in pripravljeno funkcijo PATCH. Nove filtrirne funkcije še niso izvedene, zato so navedeni deli izhodiščne točke integracije, ne dokaz izpolnitve. V tej vlogi testi niso zagnani.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05, R07–R11 | Privzeto/ponastavitev, `matches`, osebe iz `T`, lokalnost projekta, števci in prazna stanja po zgornjih pogojih. | Razvojni scenariji z 0/1/več kot 10 opravili; unicode, whitespace/ločila, sestavljeni filtri, reset, projektni preklop, reload, nič rezultatov. | Ciljna integracija: `src/App.tsx` (`ProjectView`); kontrolniki in logika naj bodo v `src/` po presoji implementerja. | Zahteve/koda pregledane; scenariji in testi niso zagnani, izpolnitev odprta. |
| R06 | Enak ID-nabor v obeh pogledih, stanje/oseba/iskanje ostanejo ob preklopu; tabla razporedi samo zadetke. | Primerjaj `data-task-id` v obeh pogledih in preklopi večkrat. | Ciljna integracija: `src/App.tsx`, `src/TaskBoard.tsx`, `src/navigation.ts`. | Izhodiščna tabla preverjena; sprememba/testi niso izvedeni. |
| R12 | Regresije, brez zapisovalnih zahtev zaradi filtrov, Folio in širina 390 px ter dostopne pogodbe. | Navigacija/podrobnosti, zahteve omrežja, oba pogleda pri 390 px, dostopna imena. | Ciljna integracija: `src/App.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `src/styles.css`. | Izhodiščne datoteke pregledane; vizualni/regresijski/testni dokaz še manjka. |

## Odprta vprašanja in omejitve

Filtriranje, kontrolniki, števec rezultatov in prazno stanje so v izhodiščni kodi manjkajoči; obstoječa navigacija in prikazi so opisani zgoraj. V tej vlogi niso preverjeni zagon, odzivni prikaz ali končni testi. Pri API napaki naloge ne določa novega UI-ja; uporabiti je treba obstoječe obnašanje.
