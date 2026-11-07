# Razvojna specifikacija P03 – Iskanje in sestavljeni filtri

## Problem in kontekst

Uporabnik v Folio pregleduje opravila enega projekta v preglednici ali na tabli.
Izhodišče prikazuje vsa opravila brez iskanja in filtrov. Cilj je dodati iskalni
vnos (type=search, oznaka »Išči opravila«), izbirnik stanja (»Filter stanja«),
izbirnik odgovorne osebe (»Filter odgovorne osebe«), gumb »Počisti filtre« in
obvestilo o rezultatih (role=status, aria-label »Rezultati filtriranja«).
Podatki se berejo izključno prek javnega API-ja `/api/`; filtriranje je lokalno
stanje trenutnega projekta, brez URL-ja in trajne shrambe.

## Vhodi, dejanja in izidi

- Vhodna polja opravila: `id`, `title`, `description`, `assignee`, `status`,
  `dueDate`, `projectId`. Iskanje uporabi `id`, `title`, `description`,
  `assignee`.
- Dovoljena dejanja: vnos iskalnega niza, izbira stanja, izbira odgovorne
  osebe, klik »Počisti filtre«, preklop pogleda (Preglednica/Tabla), navigacija
  med projekti, odpiranje/zapiranje podrobnosti.
- Uspešno stanje: prikazani so ustrezni rezultati v izvornem vrstnem redu,
  števec »Prikazano: N od M.«, pregled stanj in števci stolpcev štejejo
  prikazane rezultate.
- Napaka: če seznama ni mogoče pridobiti, obstoječi `LoadError` s ponovitvijo.
- Preklic/ponastavitev: »Počisti filtre« in menjava projekta vrneta privzete
  vrednosti; osvežitev strani začne privzeto (stanje ni shranjeno).
- Brez zadetkov: v nepraznem projektu sporočilo »Ni zadetkov.«, oba pogleda
  ostaneta uporabna; prazen projekt obdrži običajno prazno stanje in »0 od 0«.

## Zahteve in pravila

Simboli: `T` = opravilo, `P` = trenutni projekt (množica vseh opravil), `Q` =
neprazne besede iskalnega vnosa, `norm(s)` = `NFD(s)`, odstranjeni znaki
U+0300–U+036F, male črke. `polja(T) = norm(id + ' ' + title + ' ' + description
+ ' ' + assignee)`. `ustreza(T) = ∀w ∈ Q: w ⊂ polja(T)`, kjer je `⊂` dobesedni
podniz (ne regularni izraz). Pri praznem `Q` je pogoj izpolnjen. `S` = izbrano
stanje (`all` pomeni brez omejitve), `A` = izbrana oseba (`all` pomeni brez
omejitve, sicer natančna enakost brez normalizacije). Končni pogoj prikaza:
`prikazan(T) = ustreza(T) ∧ (S = all ∨ status(T) = S) ∧ (A = all ∨ assignee(T) = A)`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju: `Q = ∅`, `S = all`, `A = all`, prikazani so vsi `T ∈ P` v izvornem vrstnem redu API-ja. | D01 (razvojni), A01, A02 (lastni) |
| R02 | Iskanje uporablja `polja(T)` z `norm`; `č` in `c` ter velikost črk se ne razlikujeta. | D01, A03 |
| R03 | `Q` so neprazne besede po belinah; `ustreza(T)` zahteva vse besede kot dobesedne podnize; vrstni red ni pomemben, ločila so dobesedna. Prazen vnos ne omejuje. | A03, A04, A05 |
| R04 | `prikazan(T)` združi iskanje, stanje in osebo z logičnim IN; `S ∈ {all, todo, in_progress, done}`; `A` se primerja natančno. | D02, A06 |
| R05 | Izbirnik oseb: `all` + vsako različno neprazno ime iz celotnega `P` natanko enkrat, ne glede na trenutne filtre; menjava projekta ne ohrani stare osebe. | A07, A08 |
| R06 | Preglednica in tabla prikazujeta isto množico prikazanih ID-jev; preklop pogleda ohrani `Q`, `S`, `A`; stolpci table vsebujejo le prikazana opravila svojega stanja. | D02, A09 |
| R07 | Menjava projekta ponastavi `Q`, `S`, `A`; filtri se nikoli ne uporabijo na podatkih drugega projekta. | A08, A10 |
| R08 | Osvežitev strani začne s privzetimi filtri; stanje ni v URL-ju ali trajni shrambi. | A11 |
| R09 | Obvestilo ima besedilo `Prikazano: N od M.`, kjer je `N = |{T: prikazan(T)}|`, `M = |P|`; pregled stanj in števci stolpcev štejejo prikazane rezultate. | D04, A02, A12 |
| R10 | Če `P ≠ ∅` in `N = 0`, je prikazano »Ni zadetkov.« in oba pogleda ostaneta uporabna; če `P = ∅`, ostane običajno prazno stanje z »0 od 0«. | D03, A13, A14 |
| R11 | »Počisti filtre« v enem dejanju vrne `Q = ∅`, `S = all`, `A = all` in prikaže vse; filtriranje ne spremeni vrstnega reda ali polj podatkov. | D03, A02, A15 |
| R12 | Obstoječa navigacija in podrobnosti delujejo; filtriranje ne pošilja POST/PATCH/PUT/DELETE na `/api/`; Folio in prikaz pri ozki širini sta ohranjena. | D04, A16, A17 (skupni baseline) |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzete vrednosti, izvorni vrstni red | D01, A01 | `src/App.tsx` (stanje filtrov, `filtered`), `src/search.ts` | glej verification.md |
| R02 | normirano ujemanje | D01, A03 | `src/search.ts` (`normalizeText`) | glej verification.md |
| R03 | vse besede, dobesedno | A03–A05 | `src/search.ts` (`matchesQuery`) | glej verification.md |
| R04 | logični IN | D02, A06 | `src/App.tsx` (`filtered`) | glej verification.md |
| R05 | možnosti oseb iz celotnega projekta | A07, A08 | `src/App.tsx` (`assignees`) | glej verification.md |
| R06 | isti ID-ji v obeh pogledih | D02, A09 | `src/App.tsx`, `src/TaskBoard.tsx` | glej verification.md |
| R07 | ponastavitev ob menjavi projekta | A08, A10 | `src/App.tsx` (`key={project.id}`) | glej verification.md |
| R08 | brez trajnega stanja | A11 | `src/App.tsx` (lokalno stanje) | glej verification.md |
| R09 | »Prikazano: N od M.« | D04, A02, A12 | `src/App.tsx` (`role=status`), `src/TaskBoard.tsx` | glej verification.md |
| R10 | »Ni zadetkov.« | D03, A13, A14 | `src/App.tsx` (pogojna sporočila) | glej verification.md |
| R11 | eno dejanje počisti vse | D03, A02, A15 | `src/App.tsx` (`reset`) | glej verification.md |
| R12 | brez pisanja, ozka širina | D04, A16, A17, baseline | `src/App.tsx`, `src/styles.css` | glej verification.md |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; uporabljena je vrstica filtrov med
  naslovom razdelka in prikazom, ki se pri ozki širini prelomi.
- Sporočilo »Ni zadetkov.« je v preglednici nadomestilo praznega stanja, na
  tabli pa opozorilo nad stolpci; stolpci ostanejo uporabni.
- Končnih (skritih) testov naloge ni mogoče zagnati; preverjanje temelji na
  razvojnih testih P03, skupnih testih izhodišča in lastnih testih v
  `tests/agent/`.
- Stanje filtrov je vezano na trenutni projekt in se ob menjavi projekta
  ponastavi (remount `ProjectView`).
