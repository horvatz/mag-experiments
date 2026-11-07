# P03 – Razvojna specifikacija: iskanje in sestavljeni filtri

## Problem in kontekst

Uporabnik v projektu Folio želi med opravili hitro najti tista, ki ustrezajo
besedilu in hkrati izbranemu stanju ter odgovorni osebi. Izhodišče prikazuje
vsa opravila trenutnega projekta v izvornem vrstnem redu, v pogledu
Preglednica ali Tabla, brez iskanja in filtrov. Dodamo iskalni vnos, dva
izbirnika (stanje, odgovorna oseba), gumb za počistitev in števec rezultatov,
ne da bi spremenili način branja podatkov prek javnega API-ja `/api/`.

## Vhodi, dejanja in izidi

- Vhodna polja opravila: `id`, `title`, `description`, `assignee`, `status`
  (`todo` | `in_progress` | `done`). Projekt je določen z izbiro v navigaciji.
- Dejanja: vnos iskalnega besedila, izbira stanja, izbira odgovorne osebe,
  počistitev filtrov, preklop pogleda, izbira drugega projekta.
- Uspeh: prikazana so samo opravila, ki zadoščajo vsem trem pogojem (logični
  IN), v izvornem vrstnem redu; števec pokaže `Prikazano: N od M.`.
- Preklic/napaka: filtriranje nima preklica; napake branja ohranijo obstoječe
  stanje `Podatki niso na voljo` z gumbom `Poskusi znova`.
- Preklop projekta ponastavi iskanje in oba filtra; osvežitev strani začne s
  privzetimi vrednostmi (stanje se ne shranjuje v URL ali trajno shrambo).

## Zahteve in pravila

Splošna pravila (veljajo za vse primere):

- `norm(x)` = `x.normalize('NFD')` z odstranjenimi znaki U+0300–U+036F in
  pretvorjenim v male črke.
- `haystack(t)` = `norm(t.id) + ' ' + norm(t.title) + ' ' + norm(t.description) + ' ' + norm(t.assignee)`.
- `words(q)` = neprazne besede vnosa, razdeljene po belinah, vsaka `norm`.
- `matchSearch(t, q)` ⇔ vsaka beseda `w ∈ words(q)` je podniz `haystack(t)`
  (prazen vnos ⇔ `true`).
- `matchStatus(t, s)` ⇔ `s = all ∨ t.status = s`.
- `matchAssignee(t, a)` ⇔ `a = all ∨ t.assignee = a` (natančna primerjava).
- `visible(t)` ⇔ `matchSearch(t, q) ∧ matchStatus(t, s) ∧ matchAssignee(t, a)`.
- `M` = število vseh opravil trenutnega projekta, `N` = število vidnih.
- Filtriranje ne spreminja podatkov niti njihovega vrstnega reda in ne piše
  na strežnik (samo GET).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju velja `q='' ∧ s=all ∧ a=all`; vrstice/kartice so vsa opravila projekta v izvornem vrstnem redu | D01, A01, A08 |
| R02 | Iskanje uporablja `norm` na obeh straneh; `č` in `c` ter različne velikosti črk se ne razlikujejo | A01, A02 |
| R03 | `matchSearch` po besedah; vrstni red besed nepomemben; ločila dobesedna; prazen vnos ne omejuje | A02, A03 |
| R04 | `visible(t)` je konjunkcija vseh treh pogojev; stanje ∈ {all, todo, in_progress, done}; oseba natančno | D02, A04 |
| R05 | Izbirnik oseb = `all` + vsako različno neprazno ime celotnega projekta enkrat, tudi če je skrito; preklop projekta ga ponastavi | A05, A09 |
| R06 | Preglednica in tabla prikazujeta iste vidne ID-je; preklop pogleda ohrani filtre; stolpec vsebuje le vidna opravila svojega stanja | D02, A06 |
| R07 | Ob menjavi projekta velja `q='' ∧ s=all ∧ a=all`; filtri se nikoli ne uporabijo na podatkih drugega projekta | A09 |
| R08 | Osvežitev začne s privzetki; stanje filtrov ni v URL niti v trajni shrambi | A08 |
| R09 | Besedilo `Prikazano: N od M.`; povzetek stanj in števci stolpcev štejejo vidna opravila | D04, A04, A06 |
| R10 | Neprazen projekt brez zadetkov: `Ni zadetkov.`, oba pogleda ostaneta uporabna; prazen projekt obdrži prazno stanje in `0 od 0.` | D03, A07 |
| R11 | `Počisti filtre` nastavi `q='' ∧ s=all ∧ a=all` in prikaže vsa opravila; vrstni red in polja nespremenjena | D03, A03 |
| R12 | Navigacija in bralne podrobnosti delujejo; filtriranje ne pošilja POST/PATCH/PUT/DELETE; Folio in ozka širina ohranjena | D04, A10, baseline/razvojni testi |

Dogovor o vmesniku: `input[type=search]` z dostopnim imenom `Išči opravila`;
`select` z imeni `Filter stanja` in `Filter odgovorne osebe`; gumb
`Počisti filtre`; element `role=status` z `aria-label="Rezultati filtriranja"`.
Ohranjeni so `data-task-id`, `aria-label="Pregled stanj opravil"` in dostopna
imena obstoječih pogledov.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzetki ob nalaganju | A01, A08, D01 | `src/App.tsx` `ProjectView` (začetno stanje) | glej verification.md |
| R02 | normalizacija NFD | A01, A02 | `src/taskFilters.ts` `normalizeSearchValue` | glej verification.md |
| R03 | besedni podnizi | A02, A03 | `src/taskFilters.ts` `searchWords`, `matchesSearch` | glej verification.md |
| R04 | IN konjunkcija | A04, D02 | `src/taskFilters.ts` `filterTasks` | glej verification.md |
| R05 | možnosti oseb | A05, A09 | `src/taskFilters.ts` `assigneeOptions`; `src/App.tsx` | glej verification.md |
| R06 | oba pogleda | A06, D02 | `src/App.tsx`, `src/TaskBoard.tsx` | glej verification.md |
| R07 | menjava projekta | A09 | `src/App.tsx` (`key={project.id}`) | glej verification.md |
| R08 | brez trajne shrambe | A08 | `src/App.tsx` (lokalno stanje) | glej verification.md |
| R09 | števci | A04, A06, D04 | `src/App.tsx` `result-status`, povzetek | glej verification.md |
| R10 | prazna stanja | A07, D03 | `src/App.tsx` `Ni zadetkov.` | glej verification.md |
| R11 | počisti | A03, D03 | `src/App.tsx` `clearFilters` | glej verification.md |
| R12 | regresije | A10, D04, baseline | `src/App.tsx`, `src/styles.css` | glej verification.md |

## Zgodovina sprememb specifikacije

- 1.0 (začetna različica): zahteve R01–R12, pravila in tabela sledljivosti.
- 1.1 (popravek med izvedbo): ob `Ni zadetkov.` v pogledu Tabla se poleg
  sporočila vseeno izrišejo stolpci s prikazanimi (nič) rezultati, v
  Preglednici pa ostane sporočilo brez vrstic; s tem sta oba pogleda
  uporabna tudi brez zadetkov.

## Odprta vprašanja in omejitve

- Združitev polj za iskanje je izvedena z ločilom presledek; iskanje besede,
  ki bi nastala šele na stiku dveh polj, zato ni predvideno.
- Vrstni red možnosti v izbirniku oseb ni predpisan; uporabljen je vrstni red
  prvega pojava v izvornih podatkih.
- Končni (skriti) testi niso dostopni; preverjanje temelji na razvojnih in
  lastnih agentnih testih ter ročnem pregledu.
