# Specifikacija P03: Iskanje in sestavljeni filtri (Folio)

Različica 0.1 (faza specifikacije). Izvirne zahteve: `task/instructions.md`,
R01–R12. Predloga: `task/specification-template.md`. Zgodovina:
`docs/agent/specification-history.md`.

## Problem in kontekst

Folio trenutno v projektu prikaže vsa opravila v izvornem vrstnem redu strežnika
(`src/App.tsx`, `ProjectView`; GET `/api/projects/:id/tasks`) ter ponuja pogleda
Preglednica in Tabla (`src/TaskBoard.tsx`). Uporabnik v večjih projektih seznama
ne more zožiti. Naloga doda iskalni vnos, filter stanja, filter odgovorne osebe
in gumb za ponastavitev, ki delujejo skupaj po logičnem IN v obeh pogledih, ob
ohranitvi videza Folio (`docs/dizajn.md`) in obstoječih poti.

Poseg je omejen na `src/`; strežnik, `shared/types.ts`, skupni testi, odvisnosti
in nastavitve ostanejo nespremenjeni. UI bere samo `/api/` (nikoli `/__test/`),
stanja filtrov ne shranjuje v URL ali trajno shrambo in ne pošilja zapisovalnih
zahtev na API.

## Vhodi, dejanja in izidi

Relevantna polja (nespremenjeni tipi iz `shared/types.ts`):

- `Task`: `id`, `projectId`, `title`, `description`, `status: 'todo' | 'in_progress' | 'done'`, `assignee`, `dueDate`.
- `Project`: `id`, `name`.

Simbologija in predpostavke:

- `P` = trenutni projekt (route hash), `T` = opravila projekta `P`, kot jih vrne
  GET `/api/projects/{P}/tasks`, v vrstnem redu strežnika; `M = |T|`.
- `q` = vsebina iskalnega vnosa; `Q = words(q)` = neprazne besede po razdelitvi
  `q` po belinah; prazen/ bel vnos pomeni `Q = ∅`.
- `s` ∈ {`all`,`todo`,`in_progress`,`done`} = filter stanja; `a` ∈ {`all`} ∪ imena
  = filter odgovorne osebe.
- `norm(x)` = pretvorba v Unicode NFD, odstranitev znakov U+0300–U+036F, nato
  pretvorba v male črke.
- `hay(t) = norm(t.id + " " + t.title + " " + t.description + " " + t.assignee)`.
- `hit(t) = ∀w ∈ Q: hay(t) vsebuje norm(w)` (dobesedni podniz; `Q = ∅` → `true`).
- `visible(t) = hit(t) ∧ (s = all ∨ t.status = s) ∧ (a = all ∨ t.assignee = a)`;
  `N = |{t ∈ T : visible(t)}|`. Prikazani ID-ji = `{t.id : visible(t)}` v
  vrstnem redu iz `T`.

Dejanja in izidi:

- Vnos iskanja/filtra takoj posodobi prikaz; `q`, `s`, `a` so lokalno stanje
  trenutnega projekta brez trajne shrambe.
- `Počisti filtre` v enem dejanju nastavi `q=""`, `s=all`, `a=all`.
- Menjava projekta ali osvežitev strani nastavi privzete filtre (`q=""`,
  `s=all`, `a=all`).
- Preklop pogleda Preglednica/Tabla ohrani `q`, `s`, `a` in rezultatov ne
  spremeni.
- Napake pri branju podatkov obravnava obstoječi `LoadError`; filtri se nikoli ne
- Preklic: filtriranje nima potrditvenega koraka; ponastavitev vseh pogojev je dejanje `Počisti filtre`.
  uporabijo na opravilih drugega projekta.

## Zahteve in pravila

Splošno pravilo: vsi pogoji veljajo za trenutni projekt `P` in podatke `T` iz
javnega API-ja. Razvojni testi (npr. `tests/development/P03.spec.ts`) so le
posamezni primeri, ne celoten obseg.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju velja `q="" ∧ s=all ∧ a=all`; prikazani ID-ji so `ids(T)` v izvornem vrstnem redu; brez shranjenega stanja. | Playwright: privzeti seznam enak `webIds()`; vrednosti kontrol `all`; osvežitev ponovi privzeto stanje. |
| R02 | `hit(t)` uporablja `norm` na obeh straneh: NFD → odstranitev U+0300–U+036F → male črke; zato `č`≡`c` in velikost črk ne vpliva; polja `id`, `title`, `description`, `assignee`. | Primer `CAS` → `web-01` (`Čas za pregled`); lastni primeri s `č/š/ž` in različno velikostjo črk. |
| R03 | `Q = words(q)`; `t` ustreza, če so vse besede `Q` dobesedni podnizi `hay(t)`. Vrstni red besed ni pomemben, ločila so dobesedni znaki (ne regex). `Q = ∅` ne omejuje. | Lastni testi: več besed v poljubnem vrstnem redu; `=SUM(A1)` in `"citat"` kot dobesedna niza; samodejno praznjenje vnosa. |
| R04 | Iskanje in oba filtra se vežeta po IN: `visible(t)` = `hit ∧ status ∧ assignee`. `s` ima vrednosti `all/todo/in_progress/done`; `a` se primerja natančno, brez `norm`. | Primer `s=done ∧ a='Ana Novak'` → `web-03`; lastni test razlike v velikosti/diakritiki imena. |
| R05 | Možnosti `a`: `all` + vsako različno neprazno `assignee` iz celotnega `T`, natanko enkrat, neodvisno od `q`/`s` (tudi če so opravila skrita). Ob menjavi projekta se `a` ponastavi na `all`. | Lastni test: v možnostih so vsa imena projekta tudi iz filtriranih opravil; po preklopu projekta je izbrano `all`. |
| R06 | Preglednica in Tabla prikažeta isto množico `{t.id : visible(t)}`; Tabla razdeli po `t.status`, stolpec vsebuje samo `visible` opravila svojega stanja; preklop pogleda ohrani `q`,`s`,`a`. | Primer D02 + `columnIds` po stolpcih v obeh pogledih; filtri ostanejo po preklopu. |
| R07 | Menjava projekta nastavi `q=""`, `s=all`, `a=all` in na novo izračuna iz `T` novega projekta; nobeno stanje prejšnjega projekta se ne prenese. | Lastni test: filtri na `web`, preklop na `launch` in nazaj; vsakič privzeto stanje in samo ID-ji tega projekta. |
| R08 | Osvežitev strani začne s privzetimi filtri; `q`,`s`,`a` se ne shranjujejo v URL hash/query ali trajno shrambo brskalnika. | Lastni test: nastavi filtre, reload, preveri privzete vrednosti; pregled hash-a in odsotnost zapisov filtra v `localStorage`/`sessionStorage`. |
| R09 | Besedilo elementa `role=status` je natanko `Prikazano: N od M.`, kjer `M=|T|` (celoten projekt) in `N=|visible|`. Pregled stanj (`aria-label="Pregled stanj opravil"`) in števci stolpcev štejejo samo prikazane rezultate po stanjih. | Primer D04 (`Prikazano: 4 od 8.` pri `s=todo`); `summary()` in števci stolpcev ustrezajo `visible`. |
| R10 | Če `M>0 ∧ N=0`: prikazano je sporočilo `Ni zadetkov.` in oba pogleda ostaneta uporabna (Tabla s praznimi stolpci). Če `M=0`: običajno prazno stanje projekta in status `Prikazano: 0 od 0.` | Primer D03 + lastni test praznega projekta; preklop pogleda pri `N=0`. |
| R11 | `Počisti filtre` v enem dejanju nastavi `q=""`, `s=all`, `a=all` in prikaže `ids(T)`. Filtriranje ne spremeni vrstnega reda `T` niti vrednosti polj opravil. | Primer D03 + lastni test primerjave podatkov pred/po filtriranju. |
| R12 | Obstoječa navigacija (projekti, hash poti) in bralne podrobnosti (dialog `Podrobnosti opravila`, Escape) delujejo. Nobeno dejanje filtriranja ne pošlje POST/PATCH/PUT/DELETE na `/api/`. Ohranjen je videz Folio in pri širini 390 pik se stran ne razširi (`scrollWidth <= innerWidth`); notranje drsenje preglednice/table je dovoljeno. | `readonly()` v D04 (brez zahtev, `saveRequests=0`); lastni test odprtja/zaprtja podrobnosti in širine 390 px; `tests/baseline.spec.ts`. |

Dogovor o vmesniku (obvezna dostopna imena in oznake):

- Iskalni vnos: `input type=search` z dostopnim imenom `Išči opravila`.
- `select` z imenom `Filter stanja` (vrednosti `all`,`todo`,`in_progress`,`done`)
  in `select` z imenom `Filter odgovorne osebe` (`all` ali točno ime).
- Gumb z imenom `Počisti filtre`.
- Element `role=status` z `aria-label="Rezultati filtriranja"` in besedilom
  `Prikazano: N od M.`.
- Ohranjeni: `data-task-id` na vrsticah in karticah, dostopna imena obstoječih
  pogledov (`Preglednica`, `Tabla`) in stolpcev, `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu (če nastanejo) so zunaj povezave opravila.
- Besedilo, ki ni določeno zgoraj, in razporeditev kontrol nista predpisana.

## Izvedba in sledljivost

Izid v tej fazi: aplikacija in testi niso bili zagnani (faza specifikacije ne
izvaja testov). Spodnja tabela določa predvidene dokaze; implementer izvede
preverjanja in zapiše dejanske rezultate v svoje beležke (`docs/agent/`),
pregledovalec pa v `docs/agent/review.md`. Končnih testov naloge tu ne navajamo
kot opravljenih.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `q="" ∧ s=all ∧ a=all`; `ids(T)` v izvornem vrstnem redu | `tests/development/P03.spec.ts` D01; baseline | `src/App.tsx` (`ProjectView`), nova komponenta filtrov | ni izvedeno; dokaz bo dnevnik Playwright |
| R02 | `hit(t)` z `norm` (NFD, U+0300–U+036F, male črke) | D01 (`CAS`→`web-01`) + lastni testi č/š/ž | iskalna logika v `src/` | ni izvedeno |
| R03 | `Q=words(q)`, vse besede kot dobesedni podnizi | lastni testi več besed/ločil; D01 | iskalna logika v `src/` | ni izvedeno |
| R04 | `visible = hit ∧ status ∧ assignee` (IN, natančen `assignee`) | D02 (`done` + `Ana Novak` → `web-03`) | iskalna logika v `src/` | ni izvedeno |
| R05 | Možnosti `all` + vsa različna neprazna imena iz `T`; reset ob menjavi projekta | lastni test z imenom samo na filtriranem opravilu | izbira možnosti v `src/` | ni izvedeno |
| R06 | Enaki ID-ji v obeh pogledih; stolpci le `visible`; filtri se ohranijo | D02 + `columnIds` v obeh pogledih | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R07 | Menjava projekta resetira `q`,`s`,`a`; podatki le novega projekta | lastni test preklop `web`↔`launch` | `src/App.tsx` (`key={project.id}`), stanje filtrov | ni izvedeno |
| R08 | Reload → privzeto; brez URL/`localStorage`/`sessionStorage` | lastni test reload + pregled hash-a | stanje filtrov v `src/` | ni izvedeno |
| R09 | `Prikazano: N od M.`; pregled in števci štejejo `visible` | D04 (`Prikazano: 4 od 8.`), `summary()` | `src/App.tsx` (pregled), `src/TaskBoard.tsx` (števci) | ni izvedeno |
| R10 | `M>0 ∧ N=0` → `Ni zadetkov.`; `M=0` → prazno stanje + `0 od 0` | D03 + lastni test praznega projekta | `src/App.tsx`, `src/TaskBoard.tsx` | ni izvedeno |
| R11 | `Počisti filtre` resetira vse tri kontrole; izvorni vrstni red in polja nespremenjena | D03 + lastni test primerjave podatkov | nova komponenta filtrov | ni izvedeno |
| R12 | Navigacija in podrobnosti delujejo; ni zapisovalnih klicev; Folio in 390 px brez prelivanja | `readonly()` v D04; lastni test 390 px; `tests/baseline.spec.ts` | `src/App.tsx`, `src/TaskDetails.tsx`, `src/styles.css` | ni izvedeno |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; implementer jih umesti skladno z
  obstoječimi gradniki in slogovnimi spremenljivkami (`src/styles.css`).
- `norm` velja za obe strani primerjave (tudi za iskalne besede).
- `M` je vedno velikost celotnega `T`, tudi ko filter stanja ni `all`.
- Tabla pri `N=0` ohrani uporabne prazne stolpce (R10); pri `M=0` se prikaže
  običajno prazno stanje projekta.
- Končni testi naloge v času pisanja specifikacije niso bili izvedeni; rezultati
  bodo vpisani po izvedbi v okviru implementacije in pregleda.
