# P03 — Iskanje in sestavljeni filtri

## Problem in kontekst

Uporabnik želi zožiti opravila trenutnega projekta z iskanjem, stanjem in odgovorno osebo. Izhodiščni `ProjectView` v `src/App.tsx` prikazuje celoten seznam in njegove števce, `TaskBoard` pa seznam deli na tri stanja. Filtrov še ni. Ohraniti je treba obstoječi slovenski Folio iz `docs/dizajn.md`, navigacijo ter bralne podrobnosti. Obvezni vir zahtev je `task/instructions.md`; ta dokument jih ne nadomešča. Različica 1.0, pripravljena za predajo implementerju po statičnem pregledu kode.

## Vhodi, dejanja in izidi

Tip `Task` v `shared/types.ts` ima nizovna polja `id`, `projectId`, `title`, `description`, `assignee`, `dueDate` in `status: 'todo' | 'in_progress' | 'done'`. Datum in projekt nista iskalni polji. Identiteta je `id`, ne naslov. Podatki prihajajo iz GET `/api/projects`, `/api/projects/:projectId/tasks` in za podrobnosti `/api/tasks/:taskId`; segmente ID se kodira kot v izhodišču. Tipi in API ostanejo nespremenjeni.

Uporabnik išče, izbere stanje/osebo, počisti filtre ter menja projekt ali pogled. Sprememba kontrole preračuna prikaz brez dodatne potrditve. Iskanje in izbiri so lokalno stanje brez trajne shrambe in zapisovalnih zahtev API. Ob nalaganju, menjavi projekta in osvežitvi so privzete vrednosti `('', all, all)`. Preklop pogleda jih ohrani. Obstoječa stanja nalaganja in napake z gumbom `Poskusi znova` ostanejo; manjkajočih podatkov zaradi nalaganja ali napake ne obravnavaj kot uspešno naložen prazen projekt. Filtriranje nima dejanja preklica. Podrobnosti se še naprej zaprejo z gumbom ali Escape in vrnejo fokus.

## Zahteve in pravila

Naj bo T urejen seznam vseh opravil trenutnega projekta, q iskalni niz, s izbrano stanje, a izbrana oseba in F filtrirani podseznam. Veljajo splošna pravila, ne le primeri iz razvojnih podatkov:

```text
n(x) = x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
h(t) = n([t.id, t.title, t.description, t.assignee].join(' '))
W(q) = n(q).split(/\s+/).filter(w => w.length > 0)
ustreza(t) = W(q).every(w => h(t).includes(w))
             AND (s = 'all' OR t.status = s)
             AND (a = 'all' OR t.assignee = a)
F = T.filter(ustreza)
osebe(T) = ['all', ...unikatna(T.map(t => t.assignee).filter(x => x !== ''))]
N = F.length; M = T.length
stanje(k) = F.filter(t => t.status = k).length
```

`=` v predikatih pomeni enakost. Prazna množica besed ustreza vsakemu opravilu. Besede so dobesedni podnizi, zato npr. `.*` ne pomeni regularnega izraza. Med polji je presledek, da se konec enega in začetek drugega polja ne zlijeta v izmišljeno besedo. Osebe se deduplicirajo in primerjajo kot izvirni nizi; normalizacija je samo za iskanje. `F` ne mutira T ali objektov opravil.

Prehodi stanja: začetno stanje, menjava `project.id`, osvežitev in `Počisti filtre` dajo `(q,s,a) := ('','all','all')`; menjava `view` ohrani trojico. Prehod v drug projekt ne obudi njegovih prejšnjih filtrov. Obstoječi URL za projekt, pogled in podrobnosti ostane dovoljen; novi filtri niso del URL-ja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno prazno iskanje in oba filtra `all`; F = T v izvornem vrstnem redu. | Začetni prikaz različnih projektov, tudi neposreden vstop v tablo. |
| R02 | Združeni id, title, description, assignee in iskanje normaliziraj: NFD, odstrani U+0300–U+036F, male črke. | Različna polja, č/c, velikost črk. |
| R03 | Po belinah razdeli v neprazne besede; vsaka mora biti dobesedni podniz združenih polj. Prazen vnos ne omejuje. | Več besed v različnih poljih, beline in ločila. |
| R04 | Stanje `all/todo/in_progress/done` in natančna oseba delujeta z iskanjem po IN. | Posamezni in sestavljeni filtri. |
| R05 | Možnosti oseb so `all` in unikatna neprazna imena iz celotnega T; niso odvisne od F. | Podvojena imena, skrite osebe, menjava projekta. |
| R06 | Preglednica in tabla kažeta isto množico ustreznih ID-jev; tabla jih razdeli po stanju. Preglednica ohrani vrstni red F, vsak stolpec vrstni red svojega podseznama F. Preklop ohrani vse filtre. | Primerjava ID-jev obeh pogledov in vrstnega reda znotraj stolpcev; ne zahtevaj enakega globalnega DOM vrstnega reda table in preglednice. |
| R07 | Menjava projekta ponastavi vse tri filtre; podatki in filtri se ne mešajo med projekti. | Nastavi tri pogoje in menjaj projekt. |
| R08 | Osvežitev vrne privzete filtre; brez URL-ja ali trajne shrambe. | Osvežitev filtriranega pogleda in pregled kode. |
| R09 | Status `Prikazano: N od M.`, N = velikost F, M = velikost T; pregled stanj in stolpci štejejo F. | Preštej ID-je in prikazane števce. |
| R10 | Če M > 0 in N = 0, `Ni zadetkov.`; kontrole in preklop pogledov ostanejo uporabni. Če M = 0, običajno prazno stanje in `Prikazano: 0 od 0.`. | Preglednica ohrani `V tem projektu še ni opravil`; prazna tabla ohrani tri stolpce z `Ni opravil v tem stanju.`. |
| R11 | `Počisti filtre` v enem dejanju povrne privzete kontrole in celoten T; brez mutiranja podatkov ali vrstnega reda. | Počisti sestavljeni filter; primerjaj z začetnim T. |
| R12 | Navigacija, bralne podrobnosti, Folio in širina 390 px ostanejo uporabni; filtri ne sprožajo zapisovalnih API klicev. | Regresije, omrežje in ozki prikaz. |

Obvezni vmesnik: `input type=search` z dostopnim imenom `Išči opravila`, HTML selecta `Filter stanja` in `Filter odgovorne osebe`, gumb `Počisti filtre` ter `role=status`, `aria-label="Rezultati filtriranja"`, z natančnim besedilom `Prikazano: N od M.` (ena končna pika). Vrednosti možnosti stanja so `all`, `todo`, `in_progress`, `done`; vrednosti oseb `all` in točno ime. Vidna besedila možnosti ostanejo slovenska, razpored kontrol ni predpisan.

Ohrani `data-task-id` na vrsticah in karticah, `Prikaz opravil`, gumba `Preglednica`/`Tabla` z `aria-pressed`, regijo `Tabla opravil`, stolpce `Pripravljeno`/`V delu`/`Končano` ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj povezave opravila. Uporabi obstoječe barve, tipografijo in gradnike; kontrole naj se pri 390 px prelomijo brez širjenja dokumenta, fokus naj ostane viden. Notranje vodoravno drsenje preglednice in table je dovoljeno.

## Izvedba in sledljivost

Mesta kode spodaj so preverjena v izhodišču in predlagana mesta sprememb, ne trditev o že izvedeni funkcionalnosti. `ProjectView key={project.id}` že zagotavlja ločitev življenjske dobe po projektu; lokalne filtre je smiselno hraniti v njem. Isti F naj napaja preglednico, `TaskBoard` in pregled stanj, T pa možnosti oseb in M. `TaskBoard` že računa stolpce in njihove števce iz prejetega seznama. `useResource` že prekliče staro zahtevo in preverja ključ podatkov; ohrani to zaščito.

Oznake D01–D04 se nanašajo na obstoječe teste v `tests/development/P03.spec.ts`. S01–S07 so spodnji dodatni načrtovani scenariji za implementerjeve teste v `tests/agent/`; še niso napisani ali izvedeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete kontrole, F = T. | D01 delno; S01. | `src/App.tsx`: `ProjectView`, prikaz vrstic. | Ni izvedeno. |
| R02 | n nad vsemi štirimi polji in q. | D01 delno; S02. | `src/App.tsx`: nova izpeljava F oziroma lasten pomožni modul v `src/`. | Ni izvedeno. |
| R03 | Vse neprazne besede, dobesedni podnizi. | S02. | Ista izpeljava F. | Ni izvedeno. |
| R04 | Trojni IN, natančna oseba. | D02 delno; S03. | `src/App.tsx`: lokalno stanje in izpeljava F. | Ni izvedeno. |
| R05 | Unikatna imena iz T, ponastavitev. | S03, S04. | `src/App.tsx`: možnosti selecta in ključ `ProjectView`. | Ni izvedeno. |
| R06 | Enaki ID-ji, stolpci, ohranjeni filtri. | D02 delno; S03, S06. | `src/App.tsx`: oba pogleda; `src/TaskBoard.tsx`: `entries`. | Ni izvedeno. |
| R07 | Ponastavitev in ločitev projektov. | S04; baseline test menjave med nalaganjem. | `src/App.tsx`: `ProjectView key`; `src/useResource.ts`: ključ in preklic zahteve. | Ni izvedeno. |
| R08 | Osvežitev ponastavi, brez shrambe/URL filtrov. | S04 in pregled kode. | `src/App.tsx`: začetno stanje; `src/navigation.ts`: ohrani obstoječe poti. | Ni izvedeno. |
| R09 | N/M in števci iz F. | D04 delno; S05. | `src/App.tsx`: status, `counts`; `src/TaskBoard.tsx`: `column-count`. | Ni izvedeno. |
| R10 | Loči M = 0 od M > 0, N = 0. | D03 delno; S01, S05; baseline prazne preglednice/table. | `src/App.tsx`: prazna stanja; `src/TaskBoard.tsx`: prazni stolpci. | Ni izvedeno. |
| R11 | En klik ponastavi, nespremenjen T. | D03 delno; S06. | `src/App.tsx`: gumb in stabilno filtriranje brez mutacij. | Ni izvedeno. |
| R12 | Regresije, nič API zapisov, Folio, 390 px. | D04 delno; S07; `tests/baseline.spec.ts`, `tests/api.spec.ts`. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/styles.css`; brez klicev `updateTask`. | Ni izvedeno. |

- **S01 — Podatkovni robovi:** projekti z 0, 1 in več kot 10 opravili, drugačnimi ID-ji, enakimi naslovi in premešanim izvornim zaporedjem. Preveri privzete kontrole, vse ID-je in vrstni red; pri praznem projektu oba pogleda in 0 od 0.
- **S02 — Iskanje:** zadetek iz vsakega od štirih polj posebej; veliki/mali znaki, sestavljeni in razstavljeni Unicode naglasi. Besede npr. ` KOVAC\tcas ` se ujemajo s title `Čas za pregled` in assignee `Luka Kovač`; zamenjan vrstni red enako, dodatna odsotna beseda izključi zadetek. Preveri same beline ter dobesedne `.*`, `[`, `=SUM(A1)` brez napake ali razširjenega ujemanja.
- **S03 — Sestavljanje in osebe:** aktiviraj vse tri pogoje in izberi podatke, kjer vsak pogoj sam skrije druga opravila. Preveri natančno razlikovanje oseb `Črt`, `Crt`, `črt`, deduplikacijo ter vidnost vseh možnosti iz T tudi pri nič zadetkih. Menjaj oba pogleda in primerjaj kontrole ter množico ID-jev.
- **S04 — Življenjska doba:** nastavi tri filtre, preklopi projekt in nazaj; vsakič privzete kontrole in samo ID-ji tekočega projekta. Ponovno nastavi filtre in osveži; privzete kontrole. Preveri odsotnost zapisovanja filtrov v URL, localStorage, sessionStorage ali drugo trajno shrambo.
- **S05 — Števci in prazni zadetki:** za sestavljeni filter preveri N/M, tri vrednosti pregleda stanj in števce posameznih stolpcev; njihova vsota je N. Pri M > 0, N = 0 oba pogleda pokažeta `Ni zadetkov.`, nič ID-jev in ničelne števce; čiščenje in preklop še delujeta. Pri M = 0 uporabi običajno prazno stanje, ne sporočila o neuspešnem iskanju.
- **S06 — Čiščenje in stabilnost:** z več različnimi stanji in nesortiranim T preveri podzaporedje ID-jev v preglednici in vsakem stolpcu. Po enem kliku `Počisti filtre` so vse tri kontrole privzete in izvorno zaporedje vrnjeno; polja, podrobnosti in podatki API ostanejo nespremenjeni.
- **S07 — Regresije in prikaz:** navigacija nazaj/naprej, neposredne povezave in podrobnosti po ID pri enakih naslovih, zapiranje/fokus, napaka/ponovni poskus in nalaganje. Spremljaj omrežje med vsemi filtrirnimi dejanji: nič POST/PATCH/PUT/DELETE na `/api/`. Pri 390 px in namizju preveri vse kontrole, vidni fokus, ohranjen Folio in `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, tudi z dolgimi imeni in naslovom.

Implementer izvede ustrezne skupne in lastne teste ter statična preverjanja; `npm run check` združi lint, build/typecheck in Playwright. Obstoječa konfiguracija že vključuje baseline in razvojne teste na namizju/mobilno ter `tests/agent/` (slednji privzeto namizno; za S07 eksplicitno nastavi 390 px). Rezultate, točna imena dodanih testov in dokaz zagona poveže z R01–R12 v svojih opombah v `docs/agent/`; ne ureja te specifikacije ali skupnih testov. Avtor specifikacije je izvedel samo branje kode in dokumentacije, nobenega zagona aplikacije, testa ali pregleda videza.

## Odprta vprašanja in omejitve

Ni odprtega vprašanja, ki bi blokiralo izvedbo. Združevanje polj s presledkom je navedeno pojasnilo sicer neopredeljenega ločila. Vrstni red možnosti oseb ni predpisan; ohranitev prve pojavitve je ustrezna. Dodatna značka števila opravil in obstoječa noga nista izrecno določeni; priporočeno je uskladiti ju s prikazanim F, pri M pa jasno ohraniti pomen celotnega projekta.

Podatki so poljubne veljavne velikosti, ID-ji in zaporedje; besedila obravnavaj kot navadno besedilo, datumi so veljavni. Imena v primerih izbire so neprazna in niso `all`; pravilo možnosti kljub temu izloči prazni niz. Ne spreminjaj strežnika, skupnih tipov, infrastrukture, odvisnosti, skupnih testov ali navodil. UI ne sme uporabljati `/__test/`, testnih pripomočkov ali lokalnega nadomestka API. Navigacija med nezaključenim nalaganjem in nove sočasne spremembe ostanejo v obstoječem regresijskem obsegu. Končni testi niso dostopni; vsa dinamična in vizualna preverjanja ostajajo implementerju in pregledovalcu. Obvezne zahteve niso izpuščene ali odložene zaradi omejenega obsega D01–D04.
