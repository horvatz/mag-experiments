# P08 — Razvojna specifikacija: Koledarski pregled rokov

Različica 1.0 (osnutek, 2026-10-13). Lastnik dokumenta: avtor specifikacije.
Zajema vse zahteve R01–R12 iz `task/instructions.md`; če se predana
specifikacija in izvirne zahteve razlikujeta, veljajo izvirne zahteve.

## Problem in kontekst

Folio trenutno prikazuje opravila projekta v preglednici ali na tabli in
povzema samo stanja Pripravljeno/V delu/Končano. Uporabnik želi hitro
koledarsko sliko rokov glede na izrecno referenčni datum 2026-09-21:
koliko opravil je zapadlih, za danes, v naslednjih sedmih dneh in pozneje,
ter koliko jih je končanih. Izbor skupine naj filtrira preglednico in tablo,
števci pa naj vedno veljajo za celoten trenutni projekt.

Predvidena sprememba je samo v `src/` (uporabniški vmesnik). Aplikacija bere
obstoječi javni API `/api/`; strežnika, skupnih tipov, odvisnosti in skupnih
testov ne spreminja. Pregled je bralen: ne pošilja zapisovalnih zahtev in ne
uporablja testnih kontrol `/__test/` niti trajne shrambe ali URL-ja za stanje
filtra. Potrjeni videz Folio (`docs/dizajn.md`) se ohrani.

## Vhodi, dejanja in izidi

**Podatki.** `Project { id, name }`; `Task { id, projectId, title, description,
status: 'todo' | 'in_progress' | 'done', assignee, dueDate }`. Vsa polja so
enaka izhodišču (`shared/types.ts`). Opravila se berejo z
`GET /api/projects/:id/tasks`, projekti z `GET /api/projects`. Zapisi se
izbirajo po `id`; iskanje po naslovu ni zanesljivo (podvojeni naslovi).

**Dejanja in pričakovano stanje.**

| # | Dejanje | Uspeh | Preklic/napaka |
| --- | --- | --- | --- |
| A1 | Odpri ali osveži projekt | `ref = 2026-09-21`, `skupina = all`; prikažejo se vsa opravila projekta | — |
| A2 | Spremeni `Referenčni datum` | Veljaven datum takoj preračuna skupine, števce in vidne vrstice; aktivna skupina se ohrani | Prazno/neveljavno polje: `role=alert` z besedilom `Vnesi veljaven referenčni datum.`, zadnji veljavni preračun in izbor ostaneta; nov veljaven datum opozorilo odstrani |
| A3 | Izberi `Pogled rokov` (all/overdue/today/week/later/done) | Preglednica/tabla prikažeta točno to skupino v izvornem vrstnem redu; števci se ne spremenijo; datumi in stanja opravil se ne spremenijo | — |
| A4 | Preklop Preglednica/Tabla | Oba pogleda prikažeta iste filtrirane `data-task-id`; `ref`, trenutno besedilo polja in izbrana skupina se ohranijo | — |
| A5 | Zamenjaj projekt ali osveži stran | `ref = 2026-09-21`, `skupina = all`; stanje filtra se ne obnovi iz shrambe/URL-ja | — |
| A6 | Odpri podrobnosti opravila | Obstoječe bralne podrobnosti in povezave ostanejo nespremenjene; nova dejanja ob opravilu (če nastanejo) so zunaj povezave opravila | — |

**Vmesnik (dogovor).** `input type=date` z dostopnim imenom `Referenčni datum`;
`select` `Pogled rokov` z možnostmi `all`, `overdue`, `today`, `week`,
`later`, `done`. Pet števcev ima `aria-label="Število rokov <ključ>"` in
vsebuje samo številsko vrednost. Imena skupin so Zapadlo, Danes, Naslednjih
7 dni, Pozneje, Končano. Ohranijo se `data-task-id` na vrsticah in karticah,
dostopna imena obstoječih pogledov in stolpcev ter
`aria-label="Pregled stanj opravil"`. Pri širini 390 pik se cela stran ne
sme razširiti (`document.documentElement.scrollWidth <= innerWidth`);
notranje drsenje preglednice in table je dovoljeno. Razporeditev in
neobvezno besedilo novih kontrol nista predpisana.

## Zahteve in pravila

**Simboli.** Naj bo `ref` referenčni datum, `ref0 = 2026-09-21`. Za opravilo
`t` naj bo `due(t)` koledarski datum `YYYY-MM-DD`, `open(t) = t.status ≠ done`.
Datumi se primerjajo kot koledarski datumi (leto, mesec, dan), neodvisno od
časovnega pasu in poletnega časa. `validDate(s)` velja, če je `s` oblike
`YYYY-MM-DD` in obstaja kot koledarski datum (tudi 29. februar v prestopnem
letu). `ref + n` pomeni koledarski dan, dobljen z dodajanjem `n` dni čez meje
meseca, leta in prestopnega februarja. `sourceOrder` je vrstni red, v katerem
API vrne opravila; rezultat se ne sortira. `P` je trenutni projekt.

**Pravilo skupine.**

- `group(t) = done`, če `t.status = done` (ne glede na `due(t)`);
- sicer `overdue`, če `due(t) < ref`;
- sicer `today`, če `due(t) = ref`;
- sicer `week`, če `ref < due(t) ≤ ref + 7`;
- sicer `later` (`due(t) > ref + 7`).

Skupine done/overdue/today/week/later so disjunktne, njihova unija pa so vsa
opravila projekta. `counts(k) = |{ t ∈ P : group(t) = k }|` za
`k ∈ {overdue, today, week, later, done}`. Filtrirane vrstice za `all` so vsa
opravila `P`, za posamezno skupino pa `{ t ∈ P : group(t) = k }` v
`sourceOrder`.

**Predpostavke.** (1) Referenčni datum je ob vsakem začetku projekta izrecno
`ref0`, ne glede na uro naprave. (2) Začetni pogled je `all`. (3) Stanje
filtra (datum, skupina, osnutek besedila) je lokalno trenutnemu projektu in
živi v pomnilniku; ob menjavi projekta/ponovni naložitvi se ne ohrani in ni v
URL-ju, `localStorage`, `sessionStorage`, piškotkih ali drugi trajni shrambi.
Izjema je obstoječi pogled table/preglednice v URL-hashu, ki ni podatek filtra.
(4) Števci veljajo za celoten projekt `P`, tudi ko je izbrana skupina prazna.
(5) Opravila pripadajo svojim projektom; v izračun se štejejo samo opravila
trenutnega projekta. (6) Neobstoječi/prazni `dueDate` se v skladu z nalogo ne
pojavljajo; če bi se, velja `validDate` in opravilo ne sme podreti pregleda.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem odprtju projekta velja `ref = 2026-09-21` neodvisno od ure naprave; izbrana skupina je `all`. | Preveri začetno vrednost polja `Referenčni datum` in izbrani `Pogled rokov`; primerjaj z uro naprave (zamrznjen drug čas). |
| R02 | `t.status = done ⇒ group(t) = done`; taka opravila ne prispevajo h `counts(overdue)`, `counts(today)`, `counts(week)`, `counts(later)`. | Scenarij z done opravili z roki pred/na/za `ref`; preveri `group` in števce. |
| R03 | `open(t) ∧ due(t) < ref ⇒ group(t) = overdue`; `open(t) ∧ due(t) = ref ⇒ group(t) = today`. | Scenarij z robovi `ref − 1`, `ref`, `ref + 1`; preveri vrstice in števce. |
| R04 | `open(t) ∧ ref < due(t) ≤ ref + 7 ⇒ group(t) = week`; `open(t) ∧ due(t) > ref + 7 ⇒ group(t) = later`; skupine so disjunktne in pokrijejo vsa opravila. | Preveri vključujočo mejo `ref + 7` in `ref + 8`; unija skupin = vsa opravila, preseki prazni. |
| R05 | Primerjava in seštevanje sta koledarska; `ref + n` deluje čez meje meseca, leta in prestopni februar neodvisno od časovnega pasu/poletnega časa. | Scenariji: `2026-09-28` (meja tedna), prehod meseca/leta, npr. `2027-12-28`, `2028-02-28` (prestopno leto). |
| R06 | Pet elementov `aria-label="Število rokov <ključ>"` prikazuje `counts(overdue)`, `counts(today)`, `counts(week)`, `counts(later)`, `counts(done)` za celoten `P`; aktivna skupina jih ne spremeni. | Zamenjaj skupine all/overdue/… in primerjaj vrednosti števcev; preveri samo številsko vsebino. |
| R07 | `select` `Pogled rokov` z možnostmi all/overdue/today/week/later/done prikaže ustrezno množico iz `sourceOrder`; izbor ne spremeni `dueDate` ali `status`. | Za vsako možnost primerjaj `data-task-id` z pričakovano množico; preveri, da se polja opravil niso spremenila in ni zapisovalnih klicev. |
| R08 | `validDate(s) ⇒` takojšnji preračun skupin, števcev in vrstic ob ohranjeni aktivni skupini; `s = ''` ali `¬validDate(s) ⇒` `role=alert` `Vnesi veljaven referenčni datum.` ob nespremenjenem zadnjem veljavnem stanju; ponoven veljaven datum opozorilo odstrani. | Vnesi veljaven, nato prazen in neveljaven datum; opazuj alert, vrstice in števce. |
| R09 | Za vsak izbor skupine in `ref` je množica `data-task-id` v preglednici enaka množici na tabli; preklop pogleda ohrani `ref`, trenutno besedilo polja in izbrano skupino. | Preveri enakost ID-jev v obeh pogledih in ohranitev vrednosti kontrol po preklopu (tudi ob praznem osnutku). |
| R10 | Menjava projekta ali osvežitev ponastavi `ref = ref0` in skupino na `all`; stanje filtra ni v trajni shrambi ali URL-ju. | Zamenjaj projekt/osveži; preveri začetne vrednosti in odsotnost `ref`/skupine v URL-ju ter shrambah. |
| R11 | Projekt brez opravil prikaže `counts(k) = 0` za vseh pet skupin; prazna skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`. | Prazni projekt in projekt z opravili, a prazno skupino; preveri števce, sporočilo in delovanje izbirnika. |
| R12 | `dueDate` je veljaven `YYYY-MM-DD` (tudi prestopni); pregled ne pošilja zapisovalnih zahtev na `/api/` (POST/PUT/PATCH/DELETE), polja in bralne podrobnosti ostanejo nespremenjeni, Folio pa ostane prilagodljiv (pri 390 pik brez vodoravnega prelivanja strani). | Spremljaj omrežne klice med pregledovanjem; primerjaj vrednosti polj pred/po; izmeri `scrollWidth` pri 390 pik. |

## Izvedba in sledljivost

Rezultati v zadnjem stolpcu so v fazi specifikacije namerno neizpolnjeni;
implementer in recenzent vpišeta dejanske dokaze (ime testa, dnevnik zagona,
opravljeno/ni opravljeno). Vrstic, ki niso bile dejansko izvedene, ni dovoljeno
označiti kot uspešnih.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetni `ref = 2026-09-21`, skupina `all` | D01 + lastni test za uro naprave | določi implementer (`src/`) | Ni izvedeno (faza specifikacije); pričakovani dokaz: Playwright D01 in lastni test |
| R02 | Done vedno v done, nikoli v odprtih števcih | D04 + lastni test meje done | določi implementer | Ni izvedeno; dokaz: D04, lastni test |
| R03 | Robova overdue/today | D01/D03 + lastni test `ref − 1`, `ref` | določi implementer | Ni izvedeno; dokaz: D01, D03, lastni test |
| R04 | Vključujoča meja `ref + 7`, disjunktnost | D02 + lastni test `ref + 7`, `ref + 8` | določi implementer | Ni izvedeno; dokaz: D02, lastni test |
| R05 | Koledarsko seštevanje čez meje | lastni testi prehodov meseca/leta/prestopnega februarja | določi implementer | Ni izvedeno; dokaz: lastni testi |
| R06 | Pet neodvisnih števcev | lastni test menjave skupin | določi implementer | Ni izvedeno; dokaz: lastni test |
| R07 | Filter skupine v izvornem vrstnem redu | D01–D04 + lastni test vseh možnosti | določi implementer | Ni izvedeno; dokaz: D01–D04, lastni test |
| R08 | Preračun in alert ob praznem polju | D03 | določi implementer | Ni izvedeno; dokaz: D03 |
| R09 | Enaki ID-ji v obeh pogledih, ohranjeno stanje | D04 + lastni test preklopa z aktivnim filtrom | določi implementer | Ni izvedeno; dokaz: D04, lastni test |
| R10 | Ponastavitev ob menjavi projekta/osvežitvi | lastni test | določi implementer | Ni izvedeno; dokaz: lastni test |
| R11 | Prazne skupine in prazni projekt | lastni test | določi implementer | Ni izvedeno; dokaz: lastni test |
| R12 | Brez zapisov, nespremenjena polja, 390 pik | `readonly` v D04 + lastni test 390 pik | določi implementer | Ni izvedeno; dokaz: D04 `readonly`, lastni test |

## Odprta vprašanja in omejitve

- Vgrajeni `input type=date` običajno vrne `''` ali veljaven datum; predikat
  `validDate` pokriva tudi morebitne neveljavne nize, ki jih vnese test.
- Pogoji R06 ne predpisujejo postavitve števcev, le njihova dostopna imena,
  številsko vsebino in neodvisnost od filtra.
- R11 zahteva sporočilo o prazni skupini le v nepraznem projektu; za popolnoma
  prazen projekt zadošča pet ničel, sporočilo pa ni prepovedano.
- Preverjanje videza (posnetki, 390 pik) in zagon aplikacije sta naloga
  implementerja; ta specifikacija jih ne izvaja in ne navaja kot opravljene.
- Razvojni testi D01–D04 so primeri, ne celoten obseg; končne podatke lahko
  sestavljajo tudi drugačna opravila iz opisane domene.
- Navigacije med nedokončanim nalaganjem in sočasnih sprememb brez osvežitve
  P08 ne širi; veljajo obstoječe regresijske zahteve izhodišča.
