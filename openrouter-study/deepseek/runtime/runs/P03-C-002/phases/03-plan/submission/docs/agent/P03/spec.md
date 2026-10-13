# P03 — Specifikacija: Iskanje in sestavljeni filtri

Različica 1.0 (korak specify, 2026-10-09). Predmet: uporabniški vmesnik Folio.
Povezave: izvirne zahteve `task/instructions.md` (R01–R12), skupna predloga
`task/specification-template.md`, ustava `.specify/memory/constitution.md`,
potrjeni dizajn `docs/dizajn.md`, načrt `docs/agent/P03/plan.md` (naslednji korak).

## Problem in kontekst

Uporabnik v projektu Folio želi poiskati opravila in jih omejiti po stanju in
odgovorni osebi. Začetna aplikacija prikaže vsa opravila trenutnega projekta v
preglednici ali na tabli, nima pa iskalnega vnosa ne filtrov. Cilj je dodati
iskanje po združenih poljih `id`, `title`, `description` in `assignee` ter
filter stanja in odgovorne osebe; vsi pogoji delujejo skupaj po logičnem IN in
se ohranijo ob preklopu pogleda. Sprememba je omejena na UI: podatki se berejo
iz obstoječega javnega API-ja `/api/`, brez novih zapisovalnih klicev in brez
sprememb strežnika, skupnih tipov ali odvisnosti. Potrjeni videz Folio ostane.

## Vhodi, dejanja in izidi

**Podatki.** `Project {id, name}`, `Task {id, title, description, assignee,
status, dueDate}`. Branje: `GET /api/projects`, `GET
/api/projects/:id/tasks`; izbira po `id`. Stanje filtra: `q` (iskalni niz),
`s ∈ {all, todo, in_progress, done}`, `a ∈ {all} ∪ imena odgovornih oseb`.

**Dejanja.** Vnos iskanja (filtriranje sproti), izbira stanja, izbira osebe,
`Počisti filtre`, preklop pogleda (Preglednica/Tabla), menjava projekta v
navigaciji, osvežitev strani, odpiranje bralnih podrobnosti opravila.

**Izidi.**

- Uspeh: prikazana so ustrezna opravila `S` v izvornem vrstnem redu, števec
  `Prikazano: N od M.`; ob `M > 0` in `N = 0` sporočilo `Ni zadetkov.`; ob
  `M = 0` običajno prazno stanje in `0 od 0`.
- Preklic oziroma nevtralna dejanja: preklop pogleda ne spremeni `(q, s, a)`;
  `Počisti filtre` vrne privzete vrednosti; filtriranje ne spreminja podatkov.
- Napaka: napake branja obravnava obstoječi prikaz napake z ponovitvijo;
  filtriranje je lokalno in ne uvaja novih omrežnih klicev ali napak.

## Zahteve in pravila

**Simboli in predpostavke.**

- `P`: trenutni projekt; `T(P)`: vsa opravila projekta `P` v izvornem
  vrstnem redu; `M = |T(P)|`.
- `S = { t ∈ T(P) : match(t, q) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a) }`;
  `N = |S|`.
- `norm(x)`: pretvorba v Unicode NFD, odstranitev kombinacijskih znamenj
  U+0300–U+036F, pretvorba v male črke.
- `words(q)`: neprazni deli niza `q`, razdeljeni po belinah.
- `fields(t) = norm(t.id · t.title · t.description · t.assignee)` (združena
  polja v tem vrstnem redu).
- `match(t, q)`: `q` je prazen **ali** vsaka beseda `w ∈ words(norm(q))` je
  dobesedni podniz `fields(t)`. Vrstni red besed ni pomemben; ločila so
  dobesedni znaki, ne regularni izrazi.
- Privzeto stanje: `(q, s, a) = (ε, all, all)`.

**Pravila sprememb stanja.** Vnos iskanja: `q := q′`. Izbira stanja:
`s := s′`. Izbira osebe: `a := a′`. Počisti filtre: `(q, s, a) := (ε, all,
all)`. Preklop pogleda: `pogled := v′`, `(q, s, a)` in `S` nespremenjena.
Menjava projekta: `P := P′`, `(q, s, a) := (ε, all, all)`, `T := T(P′)`.
Osvežitev strani: `(q, s, a) := (ε, all, all)`. V vseh primerih velja
`prikazano = S`, razen pri `M = 0`, kjer velja običajno prazno stanje.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju je `(q, s, a) = (ε, all, all)` in prikazana so točno opravila `T(P)` v izvornem vrstnem redu. | Test začetnega stanja: privzete kontrole in enaki ID-ji v enakem vrstnem redu. |
| R02 | `match` uporablja `norm` na obeh straneh; zato `č` in `c` ter velikost črk ne razlikujeta zadetkov. | Testi: iskanje `č` najde `c` in obratno; različne velikosti črk. |
| R03 | `words(q)` so neprazne besede; opravilo ustreza, če so vse besede dobesedni podnizi `fields(t)`; vrstni red besed ni pomemben; ločila so dobesedna; prazen `q` ne omejuje. | Testi: dve besedi v obratnem vrstnem redu, beseda z ločilom, prazen vnos. |
| R04 | `S` je presek pogojev `match(q)`, `status(s)` in `assignee(a)` (logični IN); `s ∈ {all, todo, in_progress, done}`; `a` se primerja natančno, brez normalizacije. | Testi: kombinacije iskanja, stanja in osebe; natančno ujemanje imena. |
| R05 | Izbirnik oseb ponuja `{all} ∪ { t.assignee : t ∈ T(P) ∧ t.assignee ≠ ε }`, vsako različno ime natanko enkrat, neodvisno od trenutnega `S`; menjava projekta ne ohrani stare osebe. | Test: možnosti ob opravilih, skritih zaradi filtrov; menjava projekta. |
| R06 | Preglednica in tabla prikazujeta iste ID-je `S`; preklop pogleda ohrani `(q, s, a)`; stolpec stanja `c` vsebuje `{ t ∈ S : t.status = c }`. | Test: primerjava ID-jev med pogledi; vsebina stolpcev ob filtru. |
| R07 | Menjava projekta nastavi `(q, s, a) := (ε, all, all)`; filtri prejšnjega projekta se nikoli ne uporabijo na podatkih novega. | Test: filter pred menjavo, nato preveritev privzetega stanja in podatkov. |
| R08 | Osvežitev strani začne s `(q, s, a) = (ε, all, all)`; filtri se ne zapišejo v URL ali trajno shrambo brskalnika. | Test: ponovno nalaganje; pregled URL-ja in trajne shrambe. |
| R09 | Element `role=status` z `aria-label="Rezultati filtriranja"` kaže `Prikazano: N od M.`; pregled stanj in števci stolpcev štejejo prikazane rezultate (`|S ∩ status|`). | Test: besedilo ob različnih filtrih; števci pregleda in stolpcev. |
| R10 | `M > 0 ∧ N = 0` → sporočilo `Ni zadetkov.` in oba pogleda ostaneta uporabna; `M = 0` → običajno prazno stanje in števec `0 od 0`. | Testa: neprazni projekt brez zadetkov; prazni projekt. |
| R11 | `Počisti filtre` v enem dejanju nastavi `(q, s, a) := (ε, all, all)` in prikaže `T(P)`; uporaba filtrov ne spremeni izvornega vrstnega reda ali polj podatkov. | Test: gumb; primerjava ID-jev, vrstnega reda in polj pred/po. |
| R12 | Obstoječa navigacija in bralne podrobnosti delujejo; nobeno dejanje filtriranja ne pošlje `POST/PATCH/PUT/DELETE` na `/api/`; Folio in prikaz pri ozki širini ostaneta. | Omrežni dnevnik med filtriranjem, regresijski testi, ročna kontrola širine 390 px. |

**Dogovor o vmesniku.** Iskalni vnos `type=search` z dostopnim imenom `Išči
opravila`. Izbor `Filter stanja` (`all/todo/in_progress/done`) in izbor
`Filter odgovorne osebe` (`all` ali točno ime). Gumb `Počisti filtre`.
Element `role=status` z `aria-label="Rezultati filtriranja"` in besedilom
`Prikazano: N od M.`. Ohranjeni: `data-task-id` na vrsticah in karticah,
dostopna imena obstoječih pogledov in stolpcev, `aria-label="Pregled stanj
opravil"`; nova dejanja ob opravilu so zunaj njegove povezave. Pri širini
390 pik se cela stran ne razširi; notranje drsenje preglednice in table je
dovoljeno. Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol
nista predpisana.

## Izvedba in sledljivost

Dokazi se vpišejo ob implementaciji in zagonu (korak implement); v tej fazi
niso izvedeni, zato izid ni označen kot uspešen.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete kontrole in `T(P)` v izvornem vrstnem redu. | Začetno nalaganje projekta. | `src/App.tsx` (stanje filtrov, prikaz), `src/TaskBoard.tsx`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R02 | `norm` na obeh straneh iskanja. | Iskanje `č`/`c`, velike/male črke. | Iskalna logika v `src/`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R03 | Vse besede kot dobesedni podnizi; vrstni red in ločila. | Dve besedi, ločilo, prazen vnos. | Iskalna logika v `src/`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R04 | Logični IN iskanja, stanja in osebe. | Kombinirani filtri. | `src/App.tsx`, `src/TaskBoard.tsx`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R05 | Možnosti oseb iz celotnega `T(P)`, brez ohranitve ob menjavi. | Skrita opravila; menjava projekta. | Izbirnik oseb v `src/`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R06 | Enaki ID-ji med pogledi; ohranjeni filtri; stolpci `S`. | Primerjava Preglednica/Tabla. | `src/App.tsx`, `src/TaskBoard.tsx`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R07 | Ponastavitev ob menjavi projekta. | Menjava projekta s filtri. | `src/App.tsx` (ključ projekta). | Načrtovano; dokaz se vpiše ob zagonu. |
| R08 | Brez URL-ja in trajne shrambe. | Osvežitev in pregled shrambe. | `src/App.tsx`, `src/navigation.ts` (nespremenjen). | Načrtovano; dokaz se vpiše ob zagonu. |
| R09 | `Prikazano: N od M.` in števci `S`. | Različni filtri. | `src/App.tsx` (status, pregled), `src/TaskBoard.tsx` (stolpci). | Načrtovano; dokaz se vpiše ob zagonu. |
| R10 | `Ni zadetkov.` oziroma prazno stanje `0 od 0`. | Neprazni brez zadetkov; prazni projekt. | `src/App.tsx`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R11 | Ponastavitev v enem dejanju; podatki in vrstni red nespremenjeni. | Gumb `Počisti filtre`. | `src/App.tsx`. | Načrtovano; dokaz se vpiše ob zagonu. |
| R12 | Navigacija, podrobnosti, brez zapisovalnih klicev, Folio in 390 px. | Omrežni dnevnik, regresijski testi, ročna kontrola. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Načrtovano; dokaz se vpiše ob zagonu. |

Zgodovina sprememb: v1.0 (2026-10-09) — začetna specifikacija v koraku
specify; dokazi o izvedbi še niso na voljo.

## Odprta vprašanja in omejitve

- Razporeditev in besedilo novih kontrol nista predpisana; izbira gradnikov
  Folio se določi v načrtu.
- Preverjanje poteka z lastnimi testi v `tests/agent/` in skupnimi testi;
  končni ocenjevalni testi niso dostopni.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso del obsega.
- Vmesnik bere samo `/api/`; testne kontrole `/__test/` so prepovedane.
- Stanje filtrov je lokalno trenutnemu projektu in se ne shranjuje.
