# P08: Koledarski pregled rokov

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta pregledovati po koledarskem roku v obstoječi preglednici in tabli Folio. Izhodišče prikazuje vsa opravila in povzetek treh stanj. Dodamo lokalni referenčni datum, filter skupine in pet števcev; ohranimo slovenska poimenovanja, obstoječi dizajn in bralne podrobnosti. Obvezna podlaga so `task/instructions.md`, `PROJECT_RULES.md` in `docs/dizajn.md`.

Stanje: zaključena specifikacija po statičnem pregledu kode in razvojnih testov. Aplikacija, testi in vizualni pregled v tej vlogi niso bili zagnani.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`; vsa polja opravila so nizi, `status` je `todo | in_progress | done`. Odprto pomeni `status !== 'done'`. `dueDate` je veljaven koledarski `YYYY-MM-DD`. ID-ji so enkratni; naslovi so lahko enaki, besedilo vsebuje Unicode in ločila. Število opravil je poljubno, tudi 0, 1 in več kot 10; vrstni red določi API.

Obstoječe branje: `GET /api/projects`, `GET /api/projects/:projectId/tasks` in za podrobnosti `GET /api/tasks/:id`; ID-ji v poti ostanejo kodirani z `encodeURIComponent`. Podatkov ne kopiramo v lokalno shrambo in jih ne nadomestimo s testnimi primeri.

Uporabnik spreminja datum/skupino brez potrditvenega gumba. Veljavna sprememba takoj učinkuje; prazna ohrani zadnji veljavni preračun. Preklop prikaza in odpiranje/zapiranje obstoječih podrobnosti ne spreminjata stanja filtrov istega projekta. Posebnega preklica novih kontrol ni; sprememba skupine na `all` spet pokaže vsa opravila. Obstoječa stanja nalaganja, napake in ponovitve zahteve ostanejo.

Obvezni dogovor vmesnika:

- `input type="date"` z dostopno oznako **Referenčni datum**; HTML `select` z oznako **Pogled rokov** in vrednostmi `all/overdue/today/week/later/done`.
- Imena petih skupin: **Zapadlo**, **Danes**, **Naslednjih 7 dni**, **Pozneje**, **Končano**. Besedilo možnosti `all` ni predpisano; primer je »Vsa opravila«.
- Pet ločenih številskih elementov: `aria-label="Število rokov <ključ>"`, kjer je ključ `overdue`, `today`, `week`, `later` ali `done`; vsebina označenega elementa je samo število, brez imena skupine.
- Prazno datumsko polje: `role="alert"` z besedilom **Vnesi veljaven referenčni datum.**
- Ohranimo `data-task-id` na vrsticah/karticah, dostopna imena pogledov in stolpcev, tri obstoječe števce ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu, če sploh nastanejo, so zunaj povezave opravila.

## Zahteve in pravila

Naj bo `T` celoten urejeni seznam opravil trenutnega projekta, `d` besedilo datumskega polja, `r` zadnji veljavni referenčni datum in `f` izbrana skupina. `day(x)` označuje zaporedno številko koledarskega dne, brez lokalnega časa; `Δ(t,r) = day(t.dueDate) − day(r)`.

```text
g(t,r) = done      če t.status = done
         overdue  sicer, če Δ < 0
         today    sicer, če Δ = 0
         week     sicer, če 1 ≤ Δ ≤ 7
         later    sicer (Δ ≥ 8)
C(k) = število t iz T, za katere g(t,r) = k
V = stabilni filter T s pogojem (f = all ali g(t,r) = f)
```

Vsako opravilo ima točno eno skupino in `Σ C(k) = |T|`. Stabilni filter ohrani relativni vrstni red vhodnega seznama; ne sortira in ne mutira opravil. Na tabli se ohrani obstoječa razdelitev po statusu in relativni vhodni vrstni red znotraj vsakega stolpca; množica prikazanih ID-jev mora biti enaka preglednici.

Pravila stanja: začetek projekta/osvežitev strani nastavi `(d,r,f) = ('2026-09-21','2026-09-21','all')`. Vnos veljavnega `x` nastavi `(d,r) = (x,x)` in odstrani opozorilo, `f` ostane. Prazen vnos nastavi samo `d = ''` in opozorilo; `r` in `f` ostaneta. Izbira skupine spremeni samo `f`; preklop preglednica/tabla ohrani celotno `(d,r,f)` in opozorilo.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni `(d,r,f)` ima zgoraj določene konstante; brez odvisnosti od trenutne ure. | D01 in S3 z drugo sistemsko uro. |
| R02 | Prednost statusa `done`: vedno in izključno `g=done`. | S1: zaključeno opravilo za vsako mejo datuma. |
| R03 | Odprta opravila z `Δ<0` so `overdue`, z `Δ=0` so `today`. | D01 in S1: meje −1 in 0. |
| R04 | Odprta opravila z `1≤Δ≤7` so `week`, z `Δ≥8` so `later`; skupine so disjunktne in popolne. | D02 in S1: +1, +7, +8 ter unija ID-jev in vsota števcev. |
| R05 | Primerjava in prištevanje dni delujeta koledarsko, tudi ob prehodu meseca, leta, prestopnega februarja in DST. | S2 v več časovnih pasovih. |
| R06 | Števci so `C(k)` iz celotnega `T`; sprememba `f` jih ne spremeni. Veljaven nov `r` jih preračuna. | S1/S3: vse skupine in nov datum. |
| R07 | Izbirnik prikaže `V`, po ID-jih in brez mutacij podatkov; `all` vrne celoten seznam. | S1: vse možnosti, premešan vhod, ponovljeni naslovi, vrstni red. |
| R08 | Veljaven → prazen → veljaven sledi zgornjim pravilom stanja; opozorilo in ohranitev zadnjega preračuna sta obvezna. | D03 in S3; ob praznem polju preveriti tudi števce. |
| R09 | Oba prikaza imata isto množico filtriranih ID-jev; preklop ohrani `(d,r,f)` in opozorilo. | D04 in S3: preklop v obe smeri, tudi s praznim datumom. |
| R10 | Menjava projekta, vrnitev nanj in osvežitev strani resetirajo novo stanje. Datum/filter nista v URL-ju, localStorage, sessionStorage ali drugi trajni shrambi. | S3; obstoječi URL `view=board` ostane dovoljen. |
| R11 | `T=[]` da pet ničel. Pri `T≠[]` in `V=[]` je vidno `Ni opravil v izbrani skupini.`; izbirnik ostane uporaben v obeh pogledih. | S4; ohraniti tudi prazno tablo s tremi stolpci iz regresijskih testov. |
| R12 | Vsa izvorna polja in bralne podrobnosti ostanejo; pregled ne sproži zapisovalnih API-zahtev. Folio, tipkovnica in širina 390 px ostanejo uporabni brez vodoravnega širjenja strani. | S1/S5, D04 in skupni regresijski testi. |

## Izvedba in sledljivost

Predlagana izvedba: stanje in izračun v `src/App.tsx`, funkcija `ProjectView`, ki je že vstavljena z `key={project.id}`. Lokalno stanje naj ostane nad vejo preglednica/tabla; ista izpeljana `V` naj napaja `tbody` in `TaskBoard`. Čisto koledarsko razvrščanje se lahko izloči v nov pripomoček v `src/`. Uporabiti dosledno UTC-koledarsko aritmetiko ali civilne dneve; izogniti se seštevanju lokalnih časov prek DST. `src/formatDate.ts` že formatira v UTC in ne potrebuje spremembe zaradi filtriranja. Obstoječi povzetek stanj naj ostane izračunan iz celotnega projekta.

`D01–D04` so obstoječi testi v `tests/development/P08.spec.ts`, prebrani, ne zagnani. `S1–S5` so spodaj opredeljeni predlagani scenariji, ne že izdelani testi. V stolpcu izida **N** pomeni »ni izvedeno; brez dokaza delovanja«. Mesta kode označujejo predvideno vključitev v pregledano izhodišče, ne opravljene implementacije.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetne konstante | D01, S3 | `src/App.tsx`: inicializacija `ProjectView` | N |
| R02 | Prednost `done` | D04, S1 | `src/App.tsx`: razvrščanje oziroma novi pripomoček | N |
| R03 | `Δ<0`, `Δ=0` | D01, S1 | Isto razvrščanje | N |
| R04 | `1≤Δ≤7`, `Δ≥8`, razdelitev | D02, S1 | Isto razvrščanje | N |
| R05 | Koledarski dnevi | S2 | Koledarski pripomoček v `src/`; `src/formatDate.ts` ohranjen | N |
| R06 | `C(k)` iz `T` | D02 delno, S1/S3 | `src/App.tsx`: novi števci ob obstoječem povzetku | N |
| R07 | Stabilni filter `V` | D01/D02/D04 delno, S1 | `src/App.tsx`: select, filter in `tbody` | N |
| R08 | Ločena `d` in `r` | D03, S3 | `src/App.tsx`: date input, opozorilo in stanje | N |
| R09 | Enaki ID-ji in ohranjeno stanje | D04 delno, S3 | `src/App.tsx`: veja prikaza; `src/TaskBoard.tsx`: `tasks` | N |
| R10 | Ponastavitev projekta/osvežitve | S3 | `src/App.tsx`: `key={project.id}`; `src/navigation.ts` brez novih parametrov | N |
| R11 | Pet ničel/prazna skupina | S4, baseline prazni prikazi | `src/App.tsx`: prazna stanja; `src/TaskBoard.tsx`: stolpci | N |
| R12 | Bralnost, podatki in Folio | D04, S1/S5, baseline/API regresija | `src/api.ts`, `src/TaskDetails.tsx`, `src/styles.css`, oba prikaza | N |

Predlagani dopolnilni scenariji za `tests/agent/`:

- **S1 – razdelitev in podatki:** premešan seznam več kot desetih opravil z novimi ID-ji in enakimi naslovi, odprtimi statusi pri −1/0/+1/+7/+8 dneh ter `done` pri vseh teh mejah. Za vsak filter primerjati pričakovane ID-je in vrstni red, vseh pet števcev, disjunktnost ter vsoto. Dodati projekt z enim opravilom. Pri `r=2026-09-21` je `2026-09-28` še `week`, `2026-09-29` že `later`.
- **S2 – koledar:** preveriti +7/+8 pri `r=2026-01-25` (1./2. februar), `2026-12-25` (1./2. januar 2027), `2024-02-22` (29. februar/1. marec) in neprestopnem februarju. Enake rezultate zahtevati v UTC, Europe/Ljubljana in America/Los_Angeles, tudi ob marčevskem/oktobrskem prehodu DST. Primerjati dejanske pričakovane datume, ne kopije implementacijskega algoritma.
- **S3 – stanje:** spremeniti datum in skupino; izprazniti datum; preveriti nespremenjene ID-je/števce in opozorilo; preklopiti oba prikaza; ponovno vnesti veljaven datum. Preveriti tudi spremembo skupine ob praznem polju. Menjati projekt in se vrniti ter osvežiti stran: začetne vrednosti, brez opozorila. Preveriti odsotnost novih filtrov v URL-ju/shrambi ter začetek ob drugačni sistemski uri.
- **S4 – praznina:** oba projekta prazna ter neprazen projekt z vsaj eno prazno skupino; pet ničel za prazni projekt, natančno sporočilo za prazno skupino, preklop na `all` in drugo skupino v obeh prikazih. Ohraniti obstoječe prazne stolpce table in navigacijo.
- **S5 – regresija:** skozi spremembe datumov, vse filtre, oba prikaza in podrobnosti spremljati API-zahteve: nobenega zapisa zaradi uporabniškega pregleda. Zapisovanje iz testne priprave podatkov ni uporabniško dejanje. Preveriti polja in povezave po ID, Unicode, dolga besedila, tipkovnico ter Folio pri namizni in 390 px širini; `document.documentElement.scrollWidth <= innerWidth`, notranje drsenje je dovoljeno.

Predaja implementerju: izvesti ustrezna preverjanja (`npm run lint`, `npm run build`, skupne baseline/API in razvojne teste ter smiselne lastne scenarije). V lastnih dokumentih v `docs/agent/` povezati R01–R12 z dejanskimi funkcijami, imeni testov, ukazi, rezultati in dokazili; navesti tudi neizvedene scenarije. Ta specifikacija ostaja v lasti prvotnega avtorja.

## Odprta vprašanja in omejitve

Ni blokirajočih odprtih vprašanj. Razlaga vrstnega reda table je ohranitev vrstnega reda znotraj obstoječih statusnih stolpcev; R09 primerja množico ID-jev obeh pogledov, ne globalnega vrstnega reda DOM med stolpci. Besedilo za `all` in postavitev kontrol sta prosti izbiri znotraj potrjenega Folio.

Predpostavka iz naloge: vhodni podatkovni datumi so veljavni; ne dodajamo popravljanja strežniških podatkov. Za prazno datumsko polje je vedenje izrecno določeno; če brskalnik neveljaven vnos izpostavi kot prazno vrednost, velja ista ohranitev zadnjega veljavnega izračuna. Nalaganja in sočasnih sprememb ne širimo prek obstoječih regresijskih zahtev.

Preverjeno je samo branje navodil, tipov, relevantne kode in testnih scenarijev; ni dokazov izvedbe ali videza. Končni testi niso dostopni. Izvorne zahteve veljajo tudi ob morebitni opustitvi v tej specifikaciji. Dovoljen je samo ta izvoz in njegove lokalne storitve; brez drugih projektov ali zunanjih povezovalnikov. Implementer sme spreminjati le `src/`, lastne `tests/agent/` in lastne dokumente. Strežnik, infrastruktura, skupni tipi/testi, začetni podatki, odvisnosti in navodila ostanejo nespremenjeni. `/__test/` in razvojni pripomočki so dovoljeni samo testom, nikoli uporabniškemu vmesniku; pripravljena funkcija `updateTask` ni del te funkcionalnosti.
