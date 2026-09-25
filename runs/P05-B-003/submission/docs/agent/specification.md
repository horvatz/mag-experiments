# P05 — Straničenje in filter stanja

Predaja avtorja specifikacije, različica 1.0, 2026-09-25. Vir obveznosti: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, `task/specification-template.md` in `docs/dizajn.md`. Izvirne zahteve ostajajo obvezne tudi ob izpustu v tem dokumentu. Koda in javni testi so prebrani; aplikacija, testi in vizualni pregled v tej vlogi niso bili zagnani.

## Problem in kontekst

Obstoječi Folio v `ProjectView` prikazuje celotno polje opravil; `TaskBoard` ga razvršča v tri stolpce. Uporabnik potrebuje filter stanja in straničenje istega projekta v obeh pogledih. Dopolnitev ohrani slovenska poimenovanja, potrjeni dizajn, povezave po ID, podrobnosti in nalaganje. Novi kontroli spreminjata samo lokalni prikaz podatkov.

## Vhodi, dejanja in izidi

- `shared/types.ts`: `Project { id, name }`; `Task { id, projectId, title, description, status, assignee, dueDate }`, vsa polja so nizi, `status` ima tip `TaskStatus = 'todo' | 'in_progress' | 'done'`. Vrstni red določa odgovor API, identiteto določa `id`, ne naslov ali indeks. Besedilo je navadno besedilo z možnimi Unicode znaki in ločili; datumi so veljavni koledarski datumi.
- Obstoječi GET viri: `/api/projects`, `/api/projects/{encodeURIComponent(project.id)}/tasks`, `/api/tasks/{encodeURIComponent(taskId)}`. Število nalog je poljubno, tudi 0, 1 ali več kot 10; oba projekta sta lahko prazna. ID-ji in zaporedje se lahko razlikujejo od začetnih podatkov, naslovi se lahko ponavljajo. Vsaka naloga pripada svojemu projektu.
- HTML `select` z dostopnim imenom **Velikost strani** ima vrednosti `all`, `2`, `5`, `10`; HTML `select` **Filter strani** ima vrednosti `all`, `todo`, `in_progress`, `done`. Gumbi se imenujejo **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**. Uporabi dejanski `disabled` za neveljavne premike.
- Status ima `role="status"`, `aria-label="Stanje straničenja"` in natančno besedilo iz R09/R10, vključno s pikami in pomišljajem `–` (U+2013). Kontrole in status ostanejo na voljo tudi po uspešno naloženem praznem rezultatu.
- Izbira velikosti/filtra in dovoljeni premiki učinkujejo takoj. Zaprtje podrobnosti z gumbom, Escape ali obstoječo navigacijo nazaj ohrani lokalne nastavitve. Nova funkcija ne potrebuje potrjevanja ali preklica.
- Med nalaganjem in ob napaki ohrani `Loading`, `LoadError` ter `Poskusi znova`; manjkajoč odgovor ni uspešno naloženo prazno polje. Obstoječi neposredni URL-ji, obravnava neznanih ID-jev in preverjanje pripadnosti projekta ostanejo uporabni.

## Zahteve in pravila

Model: `T` je celotno urejeno polje trenutnega projekta, `f` filter, `s` velikost in `p` interna stran z začetkom 1. `F = T`, kadar je `f = all`, sicer `F = T.filter(t => t.status === f)`; `N = F.length`. Pri `N > 0` je `Y = s === all ? 1 : ceil(N / s)`, `1 ≤ p ≤ Y`, `V = s === all ? F : F.slice((p−1)·s, p·s)`, `A = s === all ? 1 : (p−1)·s+1`, `B = s === all ? N : min(p·s,N)` in prikazana stran `X = p`. Pri `N = 0` so `V = []`, `X = Y = A = B = 0`; interna prva stran je lahko še vedno 1. `V` je edini odsek za oba pogleda.

Za vsak status `q` velja `pregled[q] = T.filter(t => t.status === q).length` in `stolpec[q] = V.filter(t => t.status === q)`. Vsota števcev pregleda je `T.length`, vsota števcev stolpcev pa `V.length`. Vsa spodnja pravila veljajo za poljubne dovoljene podatke; navedeni scenariji so primeri preverjanja, ne omejitev domene.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | C01: začetno `(s,f,p) = (all,all,1)`; preglednica prikazuje zaporedje ID-jev `T`. | S01: naloži 0, 1 in 23 nalog z drugačnimi ID-ji, ponovljenimi naslovi in nesortiranim zaporedjem; preveri vrednosti izbirnikov in ID-je. |
| R02 | C02: za s=2/5/10 so strani odseki po formuli; konkatenacija vseh strani je natanko `F`, ID-ji različnih strani se ne prekrivajo. | S02: prehodi vse strani za N=1,2,3,5,6,10,11,23; preveri tudi polno in krajšo zadnjo stran. D01 delno. |
| R03 | C03: dovoljena dejanja nastavijo p na 1, p−1, p+1, Y. Prva/prejšnja sta onemogočeni pri N=0 ali p=1, naslednja/zadnja pri N=0 ali p=Y; neveljavno dejanje ohrani stanje. | S03: na večstranskem rezultatu uporabi vse štiri gumbe; preveri robova in enostranski rezultat, vključno z `all`. D02 delno. |
| R04 | C04: sprememba s pomeni `(s,f,p) → (sNovo,f,1)`; neprazen `all` ima Y=1. | S04: pri N=23 preidi s strani 2 velikosti 2 na velikost 5 (stara stran bi ostala veljavna), nato preveri tudi 10, 2 in all. D04 delno. |
| R05 | C05: sprememba f pomeni `(s,f,p) → (s,fNovo,1)`; stabilni filter se uporabi pred odsekom. | S05: prepletena stanja, vsi štirje filtri, spremembe z neprve strani; pričakovane ID-je izpelji iz `T.filter(...).slice(...)`. D03 delno. |
| R06 | C06: množici ID-jev preglednice in table sta enaki ID-jem V, vsak ID nastopa enkrat. Tabla stabilno združi V po stanju, brez straničenja posameznih stolpcev. | S06: pri mešani strani preklopi oba pogleda, primerjaj množici in zaporedje ID-jev znotraj vsakega stolpca; ponovi s filtrom in na zadnji strani. D03 delno. |
| R07 | C07: sprememba pogleda ali odprtje/zaprtje podrobnosti pomeni `(s,f,p) → (s,f,p)`. | S07: izberi filter in neprvo stran, preklopi v oba pogleda; odpri nalogo po ID in zapri z gumbom, Escape ter zgodovino nazaj; preveri vrednosti, status, ID-je in vrnitev fokusa. |
| R08 | C08: menjava projekta ali osvežitev brskalnika pomeni `(s,f,p) → (all,all,1)`; brez trajne shrambe in parametrov straničenja/filtra v URL. | S08: nastavi neprvo filtrirano stran; zamenjaj projekt, vrni se in osveži tudi v pogledu table; preveri privzete nastavitve in ohranitev obstoječega URL pogleda. |
| R09 | C09: pri N>0 je natančen status `Stran X od Y. Prikazano A–B od N.` po formulah; N je filtrirano število. | S09: prva, vmesna, krajša zadnja in all; N=8,s=5,p=2 daje `Stran 2 od 2. Prikazano 6–8 od 8.` (D02). Preveri tudi filtrirani rezultat. |
| R10 | C10: pri N=0 je natančen status `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje premiki so onemogočeni. Odstranitev filtra vrne prvo stran; če je projekt prazen, status ostane ničeln. | S10: prazen projekt in neprazen projekt brez zadetkov filtra, all in številčne velikosti, oba pogleda; odstrani filter. Prazna tabla ohrani tri stolpce, prazen projekt obstoječe prazno stanje. |
| R11 | C11: pregled stanj in skupno število opravil uporabljata T; števci stolpcev uporabljajo V. Filter/stran ne zmanjšata projektnih števcev. | S11: shrani začetne števce; menjaj filter, velikost in stran, preveri formule števcev, oznako ob Opravila in obstoječi zaključeni/skupaj prikaz. |
| R12 | C12: `T_po = T_pred`, nič zapisovalnih zahtev na API zaradi novih dejanj; ohranjeni ID-ji, dostopnost, povezave, nalaganje in dizajn. | S12: spremljaj API med vsemi dejanji; regresijski testi podrobnosti, povezav, napak/ponovitve in nalaganja; vizualno preveri oba pogleda pri 1440 in 390 px ter `document.documentElement.scrollWidth ≤ innerWidth`. D04 delno. |

Ohrani `data-task-id` na vrsticah in karticah, dostopni imeni pogledov **Preglednica**/**Tabla**, skupino **Prikaz opravil**, regijo **Tabla opravil**, stolpce **Pripravljeno**/**V delu**/**Končano** in `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave. Nove kontrole naj uporabljajo obstoječe slogovne spremenljivke in vidni fokus ter se pri 390 px prelomijo brez širjenja cele strani. Notranje drsenje preglednice in table je dovoljeno. Ohranijo se Folio, barve, sistemska pisava, kartice ter navigacija nad vsebino do širine 760 px; razporeditev novih kontrol in nenaročeno besedilo sta izbira implementerja.

## Izvedba in sledljivost

Priporočena umestitev: `src/App.tsx`, komponenta `ProjectView`, hrani s/f/p in enkrat izpelje F/V. Obstoječi `key={project.id}` v `App` omogoča ponastavitev pri menjavi projekta, medtem ko preklop pogleda in podrobnosti ohranita komponento. Preglednica izriše V, `TaskBoard` prejme V; obstoječi `counts`, oznaka skupnega števila in zaključeni/skupaj še naprej uporabljajo T. To je priporočilo izvedbe, ne zahteva po določeni arhitekturi.

D01–D04 so obstoječi testi v `tests/development/P05.spec.ts`; S01–S12 so zgoraj opredeljeni dodatni scenariji za implementerja, še niso napisani ali izvedeni. Stolpec kode označuje prebrano mesto predvidene dopolnitve oziroma ohranitve, ne trditve o dokončani implementaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | C01 | S01 | `src/App.tsx`: ProjectView, začetno stanje in tbody | Ni izvedeno; statično prebrano izhodišče. |
| R02 | C02 | D01; S02 | `src/App.tsx`: izpeljava V in tbody | Ni izvedeno. |
| R03 | C03 | D02; S03 | `src/App.tsx`: nove kontrole premikov | Ni izvedeno. |
| R04 | C04 | D04; S04 | `src/App.tsx`: sprememba velikosti | Ni izvedeno. |
| R05 | C05 | D03; S05 | `src/App.tsx`: stabilni filter in ponastavitev p | Ni izvedeno. |
| R06 | C06 | D03; S06 | `src/App.tsx`: V za oba pogleda; `src/TaskBoard.tsx`: entries | Ni izvedeno. |
| R07 | C07 | S07; baseline testi podrobnosti in table | `src/App.tsx`: življenjska doba ProjectView; `src/TaskDetails.tsx`: close/onCancel; `src/navigation.ts`: povezave | Ni izvedeno. |
| R08 | C08 | S08 | `src/App.tsx`: key projekta in začetno stanje; `src/navigation.ts`: obstoječi URL | Ni izvedeno. |
| R09 | C09 | D02; S09 | `src/App.tsx`: izpeljani indeksi in novi status | Ni izvedeno. |
| R10 | C10 | S10; baseline testa praznega projekta/table | `src/App.tsx`: prazni rezultat in kontrole; `src/TaskBoard.tsx`: prazni stolpci | Ni izvedeno. |
| R11 | C11 | S11 | `src/App.tsx`: counts/count-badge/table-footer; `src/TaskBoard.tsx`: column-count | Ni izvedeno. |
| R12 | C12 | D04; S12; celotni baseline/API testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `src/useResource.ts`, `src/api.ts`, `src/styles.css` | Ni izvedeno; vizualni pregled ni opravljen. |

Implementer naj izvede `npm run check` (lint, typecheck/build, Playwright) in smiselne dodatne teste v `tests/agent/`. Obstoječa konfiguracija vključuje API, baseline in razvojne teste za namizje/mobilni pogled ter lastne teste; lastne mobilne scenarije je treba izrecno nastaviti na 390 px. Dejanske izide za R01–R12, imena novih testov, končna mesta kode in pot do dnevnika/poročila zapiše v lastne implementacijske opombe v `docs/agent/`; reviewer jih oceni v svojih datotekah. Ta dokument ne poroča o uspešnih zagonih.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi preprečevala implementacijo. »Osvežitev« pomeni ponovno nalaganje dokumenta v brskalniku; nov gumb za osvežitev ni zahtevan. Ohranjanje obstoječega pogleda v URL ostane dovoljeno, novo stanje s/f/p pa se vanj ne zapisuje. Ponoven obisk prej obiskanega projekta uporabi privzeto stanje.
- Ne širimo obsega na nove sočasne spremembe podatkov brez osvežitve ali dodatne scenarije navigacije med nalaganjem; obstoječe regresije, vključno s preprečitvijo prikaza nalog napačnega projekta po zakasnjenem odgovoru, ostajajo obvezne.
- UI bere samo javni `/api/`, ne uporablja `/__test/`, testnih pripomočkov, lokalne kopije strežnika ali `localStorage`. Funkcije `updateTask` v `src/api.ts` ta naloga ne potrebuje. Nobenega novega zapisovalnega API-ja.
- Infrastruktura, strežnik, začetni podatki, skupni tipi, odvisnosti, skupni testi in navodila so samo berljivi. Brez drugih projektov, oddaljenih repozitorijev, konektorjev ali dodatnih agentov. Avtor je pisal samo to specifikacijo in njeno zgodovino; implementer ima `src/`, `tests/agent/` in lastne opombe, reviewer svoji datoteki.
- Vsi dinamični, vizualni in regresijski izidi ostajajo nepreverjeni v tej predaji. D01–D04 niso celoten obseg zahtev. Nedostopni končni testi niso bili izvedeni in jih ni dovoljeno navesti kot uspešne.
