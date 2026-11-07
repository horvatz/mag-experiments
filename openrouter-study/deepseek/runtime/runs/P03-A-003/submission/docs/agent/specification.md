# P03: Iskanje in sestavljeni filtri – razvojna specifikacija

Izdelek postopka A (en agent). Predloga: `task/specification-template.md`.
Zahteve: `task/instructions.md`. Koda: `src/App.tsx`, `src/filters.ts`,
`src/styles.css`; testi: `tests/agent/p03-filters.spec.ts`.

## Problem in kontekst

Uporabnik želi v projektu Folio hitro najti opravila po besedilu in jih zožiti
po stanju ter odgovorni osebi, pri čemer morata preglednica in tabla kazati isti
nabor zadetkov. Izhodišče prikazuje vsa opravila trenutnega projekta brez
iskanja in filtrov (glej `src/App.tsx`). Sprememba doda tri nove kontrole
(iskanje, filter stanja, filter odgovorne osebe) in gumb za ponastavitev; vse
deluje lokalno v odjemalcu, podatki pa se še naprej berejo iz javnega API-ja
`/api/`.

## Vhodi, dejanja in izidi

- Vhodi: `query: string` (iskalni vnos), `status: 'all' | 'todo' | 'in_progress' | 'done'`,
  `assignee: 'all' | string` (točno ime). Vir podatkov je
  `GET /api/projects/:id/tasks` s polji `Task.id, projectId, title, description,
  status, assignee, dueDate`.
- Dejanja: vnos besedila, izbira stanja, izbira osebe, klik na `Počisti filtre`,
  preklop pogleda (preglednica/tabla), navigacija po projektih, odpiranje
  podrobnosti opravila.
- Uspešno stanje: seznam zadetkov `Z = filter(V, q, s, o)` v izvornem vrstnem
  redu vira; povzetek stanj, števci stolpcev in `Prikazano: N od M.` štejejo
  `Z`, kjer je `M = |V|` (celoten trenutni projekt).
- Napaka: napake branja ostanejo obstoječe (`LoadError` s ponovitvijo). Novih
  zapisovalnih dejanj ni, zato filtriranje ne more spremeniti podatkov.
- Preklic: `Počisti filtre` vrne privzeto stanje; prazen vnos ne omejuje.
  Če nobeno opravilo ne ustreza, je prikazano `Ni zadetkov.` in oba pogleda
  ostaneta uporabna.

## Zahteve in pravila

Simboli: `V` = opravila trenutnega projekta v izvornem vrstnem redu, `M = |V|`,
`q` = iskalni niz, `s` ∈ {all, todo, in_progress, done}, `o` ∈ {all} ∪ imena(V).
`norm(x)` = `x.normalize('NFD')`, nato odstranjeni znaki U+0300–U+036F in male
črke. `T = [norm(w) za neprazne w ∈ q.split(/\s+/)]`.
`hay(t) = norm(t.id + ' ' + t.title + ' ' + t.description + ' ' + t.assignee)`.
Predikat ujemanja `hit(t) = ∀ w ∈ T: w ⊆ hay(t)` (dobesedni podniz; ločila niso
regularni izrazi; vrstni red besed ni pomemben). Privzeto stanje: `q = ''`,
`s = 'all'`, `o = 'all'`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `q='' ∧ s='all' ∧ o='all'` ob nalaganju ⇒ `Z = V` v izvornem vrstnem redu | D01, A01 |
| R02 | Normalizacija na obeh straneh ⇒ `č`/`c` in velikost črk ne vplivata | A02 |
| R03 | `hit(t)` po besedah iz belih znakov; `T = ∅` ⇒ brez omejitve; ločila dobesedna | A02–A04 |
| R04 | `Z = [t ∈ V : hit(t) ∧ (s='all' ∨ t.status=s) ∧ (o='all' ∨ t.assignee=o)]` (logični IN); ime se primerja natančno | D02, A05 |
| R05 | Možnosti oseb = `{all} ∪ {t.assignee : t ∈ V, t.assignee ≠ ''}`, vsaka enkrat, neodvisno od trenutnih pogojev; menjava projekta ne ohrani stare osebe | A06, A07 |
| R06 | Preglednica in tabla prejmeta isti `Z`; preklop pogleda ohrani `q, s, o`; stolpec vsebuje `[t ∈ Z : t.status = stanje]` | D02, A08 |
| R07 | Ob menjavi projekta velja `q='' ∧ s='all' ∧ o='all'`; filtri se nikoli ne uporabijo na podatkih drugega projekta | A07 |
| R08 | Stanje filtrov je samo v komponenti (brez URL-ja in trajne shrambe) ⇒ osvežitev da privzete vrednosti | A09 |
| R09 | `Prikazano: |Z| od M.` v `role=status` z `aria-label="Rezultati filtriranja"`; povzetek stanj in števci stolpcev štejejo `Z` | D04, A10 |
| R10 | `M>0 ∧ |Z|=0` ⇒ vidno `Ni zadetkov.`, kontrole in oba pogleda delujeta; `M=0` ⇒ običajno prazno stanje in `Prikazano: 0 od 0.` | D03, A11 |
| R11 | `Počisti filtre` v enem dejanju nastavi `q=''`, `s='all'`, `o='all'` ⇒ `Z = V`; filtriranje ne spremeni vrstnega reda ali polj podatkov | D03, A12 |
| R12 | Navigacija, bralne podrobnosti in videz Folio delujejo; filtriranje ne pošlje POST/PATCH/PUT/DELETE na `/api/`; pri 390 px ni vodoravnega prelivanja | A13, A14 |

Ločitev splošnega pravila od primera: pravila zgoraj veljajo za poljubne
podatke domene; testni primeri (razvojni D01–D04, lastni A01–A14) preverjajo
posamezne nabore podatkov in ne zožujejo pravil.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzete vrednosti | D01, A01 | `src/App.tsx` (začetne vrednosti `useState`), `src/filters.ts:filterTasks` | uspešno (glej `docs/agent/verification.md`) |
| R02 | NFD, črtanje, male črke | A02 | `src/filters.ts:normalizeText` | uspešno |
| R03 | vse besede kot podnizi | A02–A04 | `src/filters.ts:searchTerms`, `matchesSearch` | uspešno |
| R04 | IN vseh treh pogojev | D02, A05 | `src/filters.ts:filterTasks` | uspešno |
| R05 | možnosti oseb iz `V` | A06, A07 | `src/filters.ts:assigneeOptions`, `src/App.tsx` (izbirnik oseb) | uspešno |
| R06 | skupni `Z` za oba pogleda | D02, A08 | `src/App.tsx` (`TaskBoard` in preglednica prejmeta `visible`) | uspešno |
| R07 | ponastavitev ob menjavi projekta | A07 | `src/App.tsx` (`key={project.id}` na `ProjectView`) | uspešno |
| R08 | stanje le v komponenti | A09 | `src/App.tsx` (`useState`, brez URL-ja/shrambe) | uspešno |
| R09 | števci in povzetek iz `Z` | D04, A10 | `src/App.tsx` (`role=status`, `counts`) | uspešno |
| R10 | sporočilo in prazno stanje | D03, A11 | `src/App.tsx` (`noMatches`, obstoječe prazno stanje) | uspešno |
| R11 | gumb za ponastavitev | D03, A12 | `src/App.tsx:clearFilters` | uspešno |
| R12 | brez zapisov, videz, širina | A13, A14 | `src/App.tsx`, `src/styles.css` (`.filter-bar`) | uspešno |

## Zgodovina sprememb specifikacije

- 1.0: začetna specifikacija pred implementacijo.
- 1.1: po implementaciji potrjeno, da se neznana izbira osebe (npr. po spremembi
  podatkov) obravnava kot `all`; pri R10 dodan pogoj `M=0` in zabeležen vrstni
  red možnosti oseb (prvi pojav v `V`), ki ni predpisan z navodili.

## Odprta vprašanja in omejitve

- Vrstni red možnosti v izbirniku oseb in razporeditev novih kontrol nista
  predpisana; izbrana sta prva pojavitev imena v `V` in orodna vrstica nad
  seznamom.
- Pri praznem naboru zadetkov ostaneta ogrodji preglednice in table vidni, da
  oba pogleda ostaneta uporabna; vsebina je prazna, prikazano je sporočilo.
- Vzporedne spremembe podatkov med nezaključenim nalaganjem niso del obsega.
- Končni (skriti) testi naloge niso dostopni; preverjeni so razvojni testi,
  lastni testi in ročni pregledi.
