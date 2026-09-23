# P03 — razvojna specifikacija

Različica 1.1, 2026-09-23. Postopek A, en agent. Začetna specifikacija 1.0 je bila pripravljena pred spremembami kode; 1.1 dodaja dejanske rezultate.

## Problem in kontekst

Folio trenutno prikazuje vsa opravila projekta v preglednici ali tabli. Uporabnik želi najti opravila po besedilu in hkrati omejiti prikaz po stanju ter odgovorni osebi. Dopolnitev ohrani slovenski vmesnik, potrjeni videz, izvorni vrstni red, navigacijo in bralne podrobnosti. Podatki ostanejo iz javnega API-ja; filtriranje je lokalno in ne zapisuje podatkov.

## Vhodi, dejanja in izidi

- Vhod je seznam opravil trenutnega projekta: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Število je poljubno, tudi 0, 1 ali več kot 10; ID-ji so enkratni, naslovi niso nujno enkratni. Besedilna polja so navadno besedilo. Imena niso rezervirana vrednost `all`.
- Uporabnik ureja `input type=search` z imenom **Išči opravila**, HTML select **Filter stanja** (`all`, `todo`, `in_progress`, `done`) in HTML select **Filter odgovorne osebe** (`all` ali natančno ime).
- Sprememba kontrole takoj preračuna rezultate, pregled stanj in števce. **Počisti filtre** v enem dejanju povrne vse tri privzete vrednosti.
- Preklop preglednica/tabla in odpiranje/zapiranje podrobnosti ohranita filtre trenutnega projekta. Menjava projekta (tudi vrnitev nazaj) in ponovno nalaganje strani jih ponastavita. URL vsebuje samo obstoječo navigacijo, ne filtrov.
- Filtriranje nima potrjevanja ali preklica; ponastavitev predstavlja vrnitev v začetno stanje. Napake in nalaganje API-ja uporabljajo obstoječa stanja in gumb za ponovni poskus. Neuspešno nalaganje se ne prikazuje kot 0 zadetkov.
- Ob veljavnem praznem seznamu preglednica ohrani sporočilo »V tem projektu še ni opravil«, tabla vse tri prazne stolpce. Pri nepraznem projektu brez zadetkov oba pogleda prikažeta **Ni zadetkov.**, kontrole in preklop pogledov ostanejo uporabni.

## Zahteve in pravila

Naj bo `Tₚ` urejeni seznam opravil trenutnega projekta, `q` iskalno besedilo, `s` filter stanja in `a` filter osebe. Privzeto stanje je `F₀ = ('', all, all)`.

`norm(x) = lower(remove[U+0300–U+036F](NFD(x)))`.

`W(q)` so neprazne besede iz `norm(q)`, ločene po belinah. `H(t) = norm(t.id + ' ' + t.title + ' ' + t.description + ' ' + t.assignee)`.

`ustreza(t, q, s, a) ⇔ (∀ w ∈ W(q): H(t).includes(w)) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a)`.

`V = [t ∈ Tₚ | ustreza(t, q, s, a)]`, z ohranjenim vrstnim redom. `N = |V|`, `M = |Tₚ|`; števec stanja `k` je `|[t ∈ V | t.status = k]|`. Nobeno pravilo ne spreminja polj ali razvršča `Tₚ`. Besede so dobesedni podnizi, ne regularni izrazi; lahko pripadajo različnim poljem istega opravila.

`osebe(Tₚ) = distinct([t.assignee | t ∈ Tₚ ∧ t.assignee ≠ ''])`, po prvem pojavljanju in brez normalizacije. Izbirnik ima pred tem rezervirano možnost `all`.

Prehodi: `changeProject(p → p') ⇒ F := F₀`; `reload ⇒ F := F₀`; `clear ⇒ F := F₀`; `changeView ⇒ F ostane`. Filtri živijo v komponenti projekta, katere ključ je `project.id`, zato podatki ali filtri prejšnjega projekta niso prikazani v naslednjem.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `F₀`, vsi ID-ji v izvornem vrstnem redu. | D01, A01 z več kot 10 opravili, A05 z enim. |
| R02 | `norm` se uporabi na vseh štirih poljih in iskalnem vnosu. | D01, A01: sestavljeni/razstavljeni Unicode, ID, naslov, opis, oseba. |
| R03 | Vse besede morajo ustrezati dobesedno; beline in prazen vnos ne omejujejo. | A01: vrstni red besed, različna polja, ločila, tabulatorji in prelomi. |
| R04 | Iskanje, stanje in natančna oseba so povezani z IN. | D02, A02: vsa stanja in podobna imena z različnimi naglasi/črkami. |
| R05 | Osebe iz celotnega projekta, vsaka enkrat; menjava počisti star izbor. | A02, A04; tudi osebe skritih opravil in drugačen projekt. |
| R06 | Preglednica in tabla imata enako množico ID-jev; stolpci so podseznami `V` svojega stanja. | D02, A03: primerjava množic in vrstnega reda znotraj stolpcev. |
| R07 | Menjava projekta ustvari `F₀` in uporabi samo podatke novega projekta. | A04, regresijski test menjave med nalaganjem. |
| R08 | Osvežitev ustvari `F₀`; ni filtrov v URL, localStorage ali sessionStorage. | A04: pregled URL/shramb ter reload obeh pogledov. |
| R09 | `role=status`, ime »Rezultati filtriranja«, točno »Prikazano: N od M.«; pregled in stolpci štejejo `V`. | D04, A03, A05. |
| R10 | `M>0 ∧ N=0` pomeni »Ni zadetkov.«; `M=0` običajno prazno stanje, števec 0 od 0. | D03, A05 v obeh pogledih. |
| R11 | `clear` ponastavi tri kontrole; podatki in vrstni red ostanejo enaki. | D03, A02, A06: ponovno vsi ID-ji, izvorna polja in API. |
| R12 | Obstoječa navigacija/podrobnosti po ID, brez zapisovalnih API zahtev; Folio in stran pri 390 px ostaneta uporabna. | Regresijski testi, D04, A06, A07; vizualni pregled. |

## Izvedba in sledljivost

Spodaj so izvedena mesta kode in scenariji. Vsi navedeni testi so dejansko uspeli v končnem zagonu `npm run check` (53/53). Podrobni dokazi, povezave in omejitve so v [verification.md](verification.md), celoten izpis pa v [check.log](check.log). A01–A07 so v [lastnih testih](../../tests/agent/P03.spec.ts), D01–D04 v [razvojnih testih](../../tests/development/P03.spec.ts); slednji tečejo na namizju in mobilnem prikazu.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `F₀`, izvorni seznam | D01, A01, A05 | `src/App.tsx`: ProjectView; `src/filterTasks.ts`: privzete vrednosti | Uspešno — check.log: D01, A01, A05. |
| R02 | NFD na štirih poljih in vnosu | D01, A01 | `src/filterTasks.ts`: normalizacija in filtriranje | Uspešno — check.log: D01, A01. |
| R03 | Dobesedni podnizi vseh besed | A01 | `src/filterTasks.ts`: words/every/includes | Uspešno — check.log: A01 (17 iskalnih primerov). |
| R04 | IN in natančna oseba | D02, A02 | `src/filterTasks.ts`; `src/TaskFilters.tsx`: select | Uspešno — check.log: D02, A02. |
| R05 | Celoten nabor oseb | A02, A04 | `src/TaskFilters.tsx`: osebe iz izvornih tasks | Uspešno — check.log: A02, A04. |
| R06 | Skupni `V` | D02, A03 | `src/App.tsx`: posredovanje `visibleTasks`; `src/TaskBoard.tsx`: stolpci | Uspešno — check.log: D02, A03. |
| R07 | Projektni ključ in reset | A04, baseline | `src/App.tsx`: ProjectView key; `src/useResource.ts` | Uspešno — check.log: A04 in »switching project during loading…« v obeh prikazih. |
| R08 | Samo React stanje | A04 | `src/App.tsx`: useState, obstoječa navigacija | Uspešno — check.log: A04 (oba pogleda, URL in obe shrambi). |
| R09 | N/M in filtrirani števci | D04, A03, A05 | `src/TaskFilters.tsx`: status; `src/App.tsx`: counts; `src/TaskBoard.tsx` | Uspešno — check.log: D04, A03, A05. |
| R10 | Ločena prazna stanja | D03, A05 | `src/App.tsx`: pogoji za prazna stanja | Uspešno — check.log: D03, A05. |
| R11 | Atomski reset brez mutacij | D03, A02, A06 | `src/TaskFilters.tsx`: Počisti filtre; `src/filterTasks.ts`: filter | Uspešno — check.log: D03, A02, A06. |
| R12 | Bralno, dostopno, odzivno | baseline, D04, A06, A07 | `src/styles.css`, `src/TaskFilters.tsx`, obstoječa navigacija in TaskDetails | Uspešno — check.log; visual-check.log; vizualno pregledani posnetki v verification.md. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi blokirala izvedbo. Združevanje polj uporablja presledek; vrstni red oseb ni predpisan, izbran je vrstni red prvega pojavljanja.
- Izvorni vrstni red se na tabli ohrani znotraj posameznega stolpca, med pogledoma se primerja množica ID-jev.
- Sočasne spremembe podatkov brez osvežitve in dodatne navigacijske tekme niso del razširitve; obstoječe regresije ostanejo obvezne.
- Končni skriti testi niso dostopni. Preverjanje temelji na lokalnih skupnih in dodatnih testih; izvedeni pregledi bodo navedeni ločeno od načrtovanih.

## Zgodovina specifikacije

- 1.0: začetna specifikacija pred implementacijo, pravila in načrt preverjanja R01–R12.
- 1.1: po izvedbi dodani rezultati in dokazi za R01–R12; sprejemna pravila se niso spremenila. Test A06 je bil popravljen, ker razvojni React StrictMode lahko ponovi GET za podrobnosti; preverja dovoljene poti in odsotnost zapisov, ne števila ponovitev GET. Začetni neuspešni zagon ostaja v `check-test-correction.log`.
