# P08 — Specifikacija: Koledarski pregled rokov

Različica 1.0 (2026-10-13). Izvirne zahteve: `task/instructions.md` (R01–R12).
Meje: `PROJECT_RULES.md` in `.specify/memory/constitution.md`. Skupna predloga:
`task/specification-template.md`. Načrt in naloge: `plan.md`, `tasks.md`.

## Problem in kontekst

Folio je React aplikacija za pregled projektov in opravil. Uporabnik izbere
projekt, pregleduje opravila v preglednici ali na tabli ter odpira njihove
podrobnosti. Izhodišče prikazuje vsa opravila projekta in števce po stanjih
(Pripravljeno, V delu, Končano); roki so prikazani, niso pa razvrščeni v
skupine.

Namen P08 je dodati koledarski pregled rokov v obstoječi pregled projekta:
uporabnik določi referenčni datum in pogled rokov, opravila pa se razvrstijo
v pet skupin glede na stanje in razliko med rokom ter referenčnim datumom.
Pet števcev prikazuje velikost skupin v celotnem projektu, izbirnik pa
filtrira vidne vrstice in kartice. Potrjeni videz Folio in bralne
podrobnosti opravil ostanejo nespremenjeni; sprememba je omejena na `src/`.

## Uporabniške zgodbe

- US1 (R01, R03, R04, R05): uporabnik vidi roke razvrščene glede na fiksni
  referenčni datum 2026-09-21, neodvisno od ure naprave in časovnega pasu.
- US2 (R02, R06): uporabnik vidi pet števcev za celoten projekt; končana
  opravila so vedno v skupini Končano in ne v odprtih skupinah.
- US3 (R07, R09, R11): uporabnik filtrira po skupini, preklaplja med
  preglednico in tablo ter v obeh vidi iste filtrirane ID-je.
- US4 (R08, R12): uporabnik varno spremeni referenčni datum; neveljaven vnos
  ne pokvari zadnjega veljavnega izračuna.
- US5 (R10): ob menjavi projekta ali osvežitvi se stanje filtra ponastavi;
  podatki filtra se ne hranijo trajno.

## Vhodi, dejanja in izidi

### Podatki

- `Task`: `id`, `projectId`, `title`, `description`, `status` (`todo`,
  `in_progress`, `done`), `assignee`, `dueDate` (koledarski `YYYY-MM-DD`,
  veljaven tudi v prestopnem letu).
- `Project`: `id`, `name`.
- Vir: obstoječi javni API `GET /api/projects` in
  `GET /api/projects/{id}/tasks`; izvorni vrstni red je vrstni red iz odgovora.

### Dejanja

- Vnos referenčnega datuma (input type=date z oznako Referenčni datum).
- Izbira pogleda rokov (select Pogled rokov: all/overdue/today/week/later/done).
- Preklop prikaza Preglednica/Tabla (obstoječe vedenje).
- Menjava projekta (obstoječe vedenje) in osvežitev strani.

### Izidi

- Uspeh: pet števcev in filtrirane vrstice/kartice ustrezajo pravilom iz
  razdelka Zahteve in pravila.
- Prazen vnos datuma: opozorilo `Vnesi veljaven referenčni datum.`
  (role=alert); zadnji veljavni izračun ostane; ponoven veljaven vnos
  opozorilo odstrani.
- Napaka branja API-ja: obstoječi prikaz napake s ponovnim poskusom ostane;
  novih zapisov na API ni.
- Prazna skupina v nepraznem projektu: sporočilo
  `Ni opravil v izbrani skupini.`; preklop na drugo skupino ali all ostane
  mogoč.
- Prazen projekt: pet števcev je nič; obstoječi prikaz praznega projekta se
  ohrani.

## Zahteve in pravila

### Simboli in predpostavke

- T: opravila trenutnega projekta, kot jih vrne API.
- ref: referenčni datum (koledarski datum).
- d(t): rok opravila t kot koledarski datum.
- D(t) = d(t) − ref v koledarskih dnevih (celo število, lahko negativno).
- g(t) ∈ {overdue, today, week, later, done}: skupina opravila t.
- filter ∈ {all, overdue, today, week, later, done}; view ∈ {table, board}.
- C[k] = število opravil t ∈ T z g(t) = k, za k ∈ {overdue, today, week,
  later, done}.
- visible(filter): ID-ji opravil iz T, ki ustrezajo filtru, v izvornem
  vrstnem redu.
- Predpostavka: vrednost datuma, ki ni veljaven koledarski `YYYY-MM-DD`
  (tudi prazen vnos), se obravnava kot neveljavna po pravilu S3.

### Pravila sprememb stanja

- S1 (začetek, osvežitev, menjava projekta): ref := 2026-09-21;
  filter := all; polje datuma prikazuje `2026-09-21`; view ostane po
  obstoječem pravilu izhodišča (URL).
- S2 (veljaven vnos datuma d): ref := d; opozorilo se odstrani; g in vidne
  vrstice se preračunajo takoj; filter se ne spremeni.
- S3 (prazen ali neveljaven vnos): prikaže se opozorilo
  `Vnesi veljaven referenčni datum.`; ref in prikaz ostaneta zadnja veljavna;
  ob naslednjem veljavnem vnosu velja S2.
- S4 (izbira filtra s): filter := s; vidne vrstice := visible(s); d(t) in
  statusi se ne spreminjajo.
- S5 (preklop prikaza): view := drugi pogled; ref, besedilo polja in filter
  se ohranijo; visible(filter) je enak v obeh pogledih.
- S6 (nalaganje podatkov): T := opravila iz odgovora GET; C in visible se
  preračunata; med pregledom se ne pošilja noben zapis (brez PATCH/POST/
  DELETE).

### Razvrstitev

g(t) = done, če je t.status = done. Sicer velja:

- D(t) < 0 → overdue,
- D(t) = 0 → today,
- 1 ≤ D(t) ≤ 7 → week,
- D(t) ≥ 8 → later.

Skupine so disjunktne, njihova unija pa je T (vsako opravilo je v natanko
eni skupini).

### Dogovor o vmesniku (obvezni elementi)

- input type=date z oznako Referenčni datum; HTML select Pogled rokov z
  možnostmi all/overdue/today/week/later/done.
- Pet števcev ima aria-label `Število rokov <ključ>` in samo številsko
  vrednost (npr. `Število rokov overdue`).
- Prazen datum: role=alert z besedilom `Vnesi veljaven referenčni datum.`
- Imena skupin: Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano.
- Ohranjeni so `data-task-id` na vrsticah in karticah, dostopna imena
  obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
  Nova dejanja ob opravilu so zunaj njegove povezave.
- Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice
  in table je dovoljeno. Besedilo, ki ni izrecno določeno, in razporeditev
  novih kontrol nista predpisana.

### Tabela zahtev

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku, osvežitvi in menjavi projekta je ref = 2026-09-21 in filter = all, neodvisno od sistemske ure naprave. | Test z različnimi sistemskimi časi: začetni ref in izbrani all. |
| R02 | t.status = done ⇒ g(t) = done; t ne šteje v nobeno od skupin overdue, today, week, later, tudi če je rok v preteklosti ali prihodnosti. | Test z done opravili z roki pred, na in po ref. |
| R03 | t.status ≠ done in d(t) < ref ⇒ g(t) = overdue; d(t) = ref ⇒ g(t) = today. | Test na mejah ref − 1 dan in ref. |
| R04 | t.status ≠ done in 1 ≤ D(t) ≤ 7 ⇒ week; D(t) ≥ 8 ⇒ later; skupine se ne prekrivajo in vsako opravilo je v natanko eni skupini. | Test na mejah D = 0, 1, 7, 8 in preveritev unije. |
| R05 | d(t) in D(t) se računata po koledarskih dnevih `YYYY-MM-DD` brez vpliva časovnega pasu in poletnega časa; seštevanje dni deluje čez meje meseca, leta in prestopni februar. | Test z datumi 2026-12-31/2027-01-01 in 2028-02-28/2028-02-29. |
| R06 | C[k] je število opravil t ∈ T z g(t) = k za vseh pet ključev; aktivni filter ne spremeni C. | Test: števci pred izbiro filtra in po njej so enaki. |
| R07 | Izbirnik ponuja all/overdue/today/week/later/done; visible(k) so opravila skupine k v izvornem vrstnem redu, visible(all) vsa opravila v izvornem vrstnem redu; izbor ne spremeni d(t) ali statusov. | Test: ID-ji in vrstni red po vsakem filtru; podatki ostanejo nespremenjeni. |
| R08 | Veljaven nov ref takoj preračuna g in vidne vrstice ter ohrani filter; prazen vnos prikaže opozorilo in ohrani zadnji veljavni izračun; ponoven veljaven datum opozorilo odstrani. | Test: sprememba datuma, prazen vnos, ponovni veljaven vnos. |
| R09 | visible(filter) je v preglednici in na tabli enak (enaka množica ID-jev); preklop pogleda ohrani ref, besedilo polja in filter. | Test: primerjava ID-jev obeh pogledov in stanja po preklopu. |
| R10 | Menjava projekta in osvežitev nastavita ref = 2026-09-21 in filter = all; noben podatek o filtru ni v trajni shrambi ali URL-ju. | Test: spremenjeno stanje, osvežitev in menjava projekta; pregled URL-ja in shrambe. |
| R11 | T = ∅ ⇒ vseh pet C = 0; prazna skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali all. | Test s praznim projektom in s projektom brez opravil v izbrani skupini. |
| R12 | Vsi dueDate so veljavni koledarski `YYYY-MM-DD`, tudi prestopni; pregled ne pošilja zapisov na API; polja in bralne podrobnosti ter prilagodljiv Folio ostanejo nespremenjeni. | Omrežni dnevnik: samo GET; primerjava podrobnosti; vizualni pregled pri 390 pik. |

## Izvedba in sledljivost

Ob specifikaciji ni izvedenih preverjanj. Koda in lastni testi nastanejo v
korakih `$speckit-plan`, `$speckit-tasks` in `$speckit-implement`; podrobna
preslikava zahteva → naloga → test se vodi v `tasks.md`, končni izidi in
dnevniki pa v končnem poročilu. Spodnja tabela je izhodišče iz skupne
predloge in se izpolni z dejanskimi dokazi po izvedbi; izidov ne označujem
kot uspešnih brez preverjanja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Zgoraj, R01 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R02 | Zgoraj, R02 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R03 | Zgoraj, R03 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R04 | Zgoraj, R04 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R05 | Zgoraj, R05 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R06 | Zgoraj, R06 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R07 | Zgoraj, R07 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R08 | Zgoraj, R08 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R09 | Zgoraj, R09 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R10 | Zgoraj, R10 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R11 | Zgoraj, R11 | lastni test (tests/agent/) | določeno v plan.md | ni izvedeno ob specifikaciji |
| R12 | Zgoraj, R12 | lastni test in vizualni pregled | določeno v plan.md | ni izvedeno ob specifikaciji |

Opomba: skupni testi izhodišča (`tests/baseline.spec.ts`, `tests/api.spec.ts`)
se izvedejo ob implementaciji in preverjajo infrastrukturo; zahteve P08
preverjajo lastni testi te naloge v `tests/agent/`.

## Odprta vprašanja in omejitve

- Neveljaven ne-prazen vnos datuma: zahteve izrecno določajo le prazen vnos;
  uporabljeno je enako ravnanje kot pri praznem vnosu (opozorilo, ohranjen
  zadnji veljavni izračun).
- Natančno besedilo oznak, ki ni določeno v `task/instructions.md`, in
  razporeditev novih kontrol sta svobodna; določena so le imena skupin in
  navedena besedila.
- Vpliv nezaključenega nalaganja in sočasnih sprememb podatkov ni predmet te
  specifikacije (izven obsega po `task/instructions.md`).
- Prikaz Preglednica/Tabla ostaja v URL-ju po obstoječem vedenju izhodišča;
  podatka ref in filter se v URL ali trajno shrambo ne dodajata.

## Zgodovina sprememb

- 1.0 (2026-10-13): prva različica (korak `$speckit-specify`), zajetih vseh
  dvanajst zahtev R01–R12.
