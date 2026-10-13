# Razvojna specifikacija P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio prikazuje opravila izbranega projekta. Uporabnik želi opravila poiskati z
besedami in jih hkrati omejiti po stanju ter odgovorni osebi. Rezultat mora biti
enak v preglednici in tabli ter v izvornem vrstnem redu, brez sprememb podatkov
ali dodatnih pisanj na strežnik. UI bere izključno javni API `/api/`, ne pa
testnih kontrol `/__test/`.

## Vhodi, dejanja in izidi

- Vhod: opravila trenutnega projekta prek javnega API `/api/`; relevantna polja
  so `id`, `title`, `description`, `assignee` in stanje (`todo`,
  `in_progress`, `done`).
- Dejanja: iskanje z `type=search`, izbira stanja `all|todo|in_progress|done`,
  izbira odgovorne osebe `all|<ime>` ter počiščenje filtrov.
- Dogovorjeni dostopni nazivi: `Išči opravila`, `Filter stanja`,
  `Filter odgovorne osebe`, `Počisti filtre`; status z
  `aria-label="Rezultati filtriranja"` in besedilom `Prikazano: N od M.`.
- Izhod: isti nabor ID-jev v preglednici in tabli, števec
  `Prikazano: N od M.`, sporočilo `Ni zadetkov.` le pri nepraznem projektu brez
  zadetkov in ohranjena obstoječa navigacija ter bralne podrobnosti.

## Zahteve in pravila

Simboli in predikat:

- `T_p` so vsa opravila trenutnega projekta v vrstnem redu GET odgovora;
  `M = |T_p|`.
- `normalize(s)` je `s.normalize("NFD")`, odstranitev znakov U+0300–U+036F
  in `toLowerCase()`.
- `haystack(t) = normalize([t.id, t.title, t.description, t.assignee].join(" "))`.
- `terms(q) = q.split(/\s+/).filter(word => word !== "").map(normalize)`.
- `visibleTasks(q, status, person)` so tiste `t ∈ T_p`, za katere velja:
  `terms(q).every(term => haystack(t).includes(term))`
  `∧ (status = "all" ∨ t.status = status)`
  `∧ (person = "all" ∨ t.assignee = person)`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju in spremembi projekta so `q=""`, `status="all"`, `person="all"`; vidni so vsi ID-ji iz `T_p` v izvornem vrstnem redu. | Test nalaganja in preklopa projekta. |
| R02 | Iskanje primerja samo normaliziran `haystack(t)`; `č`/`c` in velikost črk ne razlikujeta, zadetki pa so možni v `id`, `title`, `description` ali `assignee`. | Test z Unicode in zadetki v vsakem iskalnem polju. |
| R03 | Velja predikat `terms(q).every(...)`; vrstni red besed ni pomemben, ločila so dobesedna, prazen vnos ali samo presledki ne omejujeta. | Testi z več besedami, presledki in znaki `.*[]()|`. |
| R04 | Stanje in oseba sta dodatna pogoja v `visibleTasks`; kombinacija s `q` je logični IN. `person ≠ "all"` se primerja z `t.assignee === person`, brez normalizacije. | Test vseh treh kontrol in vsaj ene kombinacije. |
| R05 | Seznam oseb ima `all` in vsako različno neprazno ime iz celotnega `T_p` natanko enkrat, tudi če je trenutno skrito zaradi drugih filtrov; po preklopu projekta `person` postane `all`. | Test z več osebami in preklopom projekta. |
| R06 | Preglednica in tabla kažeta iste ID-je `visibleTasks`; preklop pogleda ohrani tri filtre, tablični stolpci pa vsebujejo le ustrezna prikazana opravila. | Test preklopa pogleda pri aktivnih filtrih. |
| R07 | Po menjavi projekta se tri kontrole ponastavijo in filtri se uporabijo izključno na novem `T_p`; stara izbira ne sme preživeti. | Test preklopa z aktivnimi `q`, `status` in `person`. |
| R08 | Osvežitev začne s privzetimi filtri; filtri niso v URL, `localStorage`, `sessionStorage` ali piškotkih. | Test osvežitve, URL-ja in brskalnikove shrambe. |
| R09 | `N = |visibleTasks(...)|`, `M = |T_p|`; števci stanj in stolpcev štejejo prikazane rezultate. | Test s filtriranimi in nefiltriranimi projekti. |
| R10 | Pri nepraznem projektu brez zadetkov je vidno `Ni zadetkov.` in oba pogleda uporabna; prazen projekt ohrani prazno stanje in števec `Prikazano: 0 od 0.` | Testi praznega projekta in brez zadetkov. |
| R11 | Gumb `Počisti filtre` ponastavi tri kontrole in prikaže vsa opravila; filtriranje ne spremeni vrstnega reda niti polj podatkov. | Test počiščenja in primerjava vhodnih/izhodnih podatkov. |
| R12 | Obstoječa navigacija, `data-task-id`, dostopna imena pogledov/stolpcev,
  `aria-label="Pregled stanj opravil"` in bralne podrobnosti delujejo; dejanja
  so zunaj povezave. Filtriranje ne sproži `POST/PATCH/PUT/DELETE` na `/api/`;
  pri 390 px se stran ne razširi. | Agent preverjanja dostopnosti, omrežja in ozke širine. |

## Izvedba in sledljivost

Namenjena sprememba ostane v obstoječem Folio dizajnu:

- `src/App.tsx:10` pridobi `T_p`; tam dodaj tri kontrole, lokalno stanje filtrov,
  izpeljavo `visibleTasks`, status in sporočilo brez zadetkov. Stanje se ob
  menjavi projekta ponastavi (npr. zaradi obstoječega `key={project.id}`).
- `src/TaskBoard.tsx:13` dobi samo `visibleTasks`; obstoječe grupe in števci
  stolpcev se nanašajo na prikazane rezultate.
- `src/App.tsx:24` in `:36` ohranita `aria-label="Pregled stanj opravil"` in
  obstoječe oznake; `:37` ohranja preklop pogleda. `src/navigation.ts:18`
  ostane odgovoren za pogled in poti, filtri se ne dodajo v URL.

| Zahteva | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- |
| R01, R09, R11 | Privzeti prikaz, števci in počiščenje z več opravili. | `src/App.tsx`, `src/TaskBoard.tsx`. | Ni izvedeno; to je specifikacijska faza. |
| R02–R04 | Normalizacija, dobesedne besede v poljubnem vrstnem redu in kombinacija filtrov. | `src/App.tsx` ali pomožna funkcija v `src/`. | Ni izvedeno. |
| R05, R07, R08 | Celoten seznam oseb, preklop projekta in osvežitev brez trajne shrambe. | `src/App.tsx`, `src/navigation.ts`. | Ni izvedeno. |
| R06, R10 | Enaki ID-ji v obeh pogledih, sporočilo brez zadetkov in prazen projekt. | `src/App.tsx`, `src/TaskBoard.tsx`. | Ni izvedeno. |
| R12 | Ohranjena dostopnost, navigacija, bralne podrobnosti, samo branje in 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Ni izvedeno. |

Razvojni testi D01–D04 so v `tests/development/P03.spec.ts` in pokrivajo osnovne
kombinacije. Implementer naj doda lastne teste v `tests/agent/` za izpustene
robne primere: prazen projekt, eno in več kot deset opravil, Unicode, osebe
skrite zaradi filtrov, menjavo projekta, osvežitev, števce stolpcev ter
navigacijo. Priporočena preverjanja so `npm run build` ter ciljani agent in
razvojni testi; v tej fazi niso zagnani.

## Odprta vprašanja in omejitve

- Vrstni red možnosti oseb ni predpisan; specifikacija priporoča prvi pojav in
  enkratnost.
- Navigacija med nezaključenim nalaganjem in sočasnimi spremembami podatkov brez
  osvežitve ni nadaljnje zahtevana.
- Strežnik, `shared/`, odvisnosti, skupni testi in infrastruktura ostanejo
  nespremenjeni.
