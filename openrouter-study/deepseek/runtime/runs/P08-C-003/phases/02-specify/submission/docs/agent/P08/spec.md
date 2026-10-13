# Specifikacija: P08 — Koledarski pregled rokov

**Pot funkcionalnosti**: `docs/agent/P08`
**Datum**: 2026-10-13
**Stanje**: osnutek (korak `$speckit-specify`)
**Vir zahtev**: `task/instructions.md` (R01–R12), `PROJECT_RULES.md`, `docs/dizajn.md`

## Problem in kontekst

Uporabnik želi v projektnem pogledu na enem mestu videti, katera opravila so
zapadla, danes, v naslednjih sedmih dneh, pozneje in končana, glede na izrecno
izbrani referenčni datum, ter pregled omejiti na posamezno skupino rokov.

Začetno delovanje: projektni pogled prikazuje povzetek stanj
(Pripravljeno/V delu/Končano), preglednico ali tablo opravil, preklop pogleda in
podrobnosti opravila; opravila bere prek javnega API-ja. Skupin rokov, izbirnika
pogleda rokov in števcev rokov v izhodišču ni.

Predvidena sprememba: v projektni pogled se doda polje `input type=date` z oznako
`Referenčni datum`, izbirnik `Pogled rokov` (all/overdue/today/week/later/done),
pet števcev in filtriranje vrstic oziroma kartic. Obseg ostane znotraj R01–R12;
potrjeni videz Folio se ohrani.

## Vhodi, dejanja in izidi

### Podatki

- `Project`: `id`, `name`. `Task`: `id`, `projectId`, `title`, `description`,
  `status` (`todo` | `in_progress` | `done`), `assignee`, `dueDate` (koledarski
  `YYYY-MM-DD`). Branje poteka prek `GET /api/projects` in
  `GET /api/projects/{id}/tasks`; funkcionalnost ne pošilja zapisovalnih zahtev.
- Lokalno stanje vmesnika za trenutni projekt: referenčni datum (začetno
  `2026-09-21`), izbrana skupina (začetno `all`) in trenutno besedilo polja.
  Stanje se ne hrani v trajni shrambi ali URL-ju.

### Dejanja

- A1 Vnos referenčnega datuma (veljaven `YYYY-MM-DD`).
- A2 Izbira pogleda rokov `all`/`overdue`/`today`/`week`/`later`/`done`.
- A3 Preklop med preglednico in tablo.
- A4 Menjava projekta ali osvežitev strani.
- A5 Odpiranje prazne skupine ali praznega projekta.

### Pravila spremembe stanja (predikati)

Simbole razlagamo takole: `r` je referenčni datum, `P` trenutni projekt, `t`
opravilo v `P`, `s(t)` njegovo stanje, `d(t)` njegov rok, `G(t)` skupina rokov,
`razlika(a,b)` pa število koledarskih dni od `a` do `b` (neodvisno od časovnega
pasu).

- `G(t) = done` natanko tedaj, ko je `s(t) = done`.
- Sicer `G(t) = overdue`, če je `d(t) < r`.
- Sicer `G(t) = today`, če je `d(t) = r`.
- Sicer `G(t) = week`, če je `1 ≤ razlika(r, d(t)) ≤ 7`.
- Sicer `G(t) = later`.

Posledice: skupine so disjunktne in skupaj vsebujejo vsa opravila projekta
(R04); števci so `c_k = |{t ∈ P : G(t) = k}|` za `k ∈ {overdue, today, week,
later, done}` in niso odvisni od filtra (R06); vidne vrstice so `V = P`, če je
filter `all`, sicer `V = {t ∈ P : G(t) = filter}`, v izvornem vrstnem redu (R07).

Prehodi stanja:

- `setDate(v)`: če `v` ni veljaven `YYYY-MM-DD` (tudi prazno polje), se prikaže
  opozorilo `Vnesi veljaven referenčni datum.` (role=alert), `r` in `V` ostaneta
  nespremenjena; ob veljavnem `v` se `r := v`, skupine in `V` se takoj
  preračunajo, filter in besedilo polja ostaneta, opozorilo izgine (R08).
- `setFilter(f)`: `filter := f`, `V` se preračuna; datumi in stanja opravil se ne
  spremenijo (R07).
- Preklop pogleda: oba pogleda prikazujeta isti `V`; `r`, besedilo polja in filter
  se ohranijo (R09).
- Menjava projekta ali osvežitev: `r := 2026-09-21`, `filter := all` (R01, R10).
- Prazna skupina v nepraznem projektu: prikaže se `Ni opravil v izbrani skupini.`
  in omogočen je preklop na drugo skupino ali `all` (R11).
- Prazna projekt: vseh pet števcev je `0` (R11).

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta je `r = 2026-09-21` izrecno in ni odvisen od ure naprave; začetni filter je `all`. | Ob nalaganju preberi vrednost polja in izbirnika; primerjaj z zahtevanima vrednostma; test ponovi z drugačno sistemsko uro. |
| R02 | `s(t) = done ⇒ G(t) = done` ne glede na `d(t)`; tako opravilo ne šteje v nobeno od štirih skupin odprtih opravil. | Test z opravili `done` z roki pred, na in po `r`; preveri skupino in števce. |
| R03 | `s(t) ≠ done ∧ d(t) < r ⇒ G(t) = overdue`; `s(t) ≠ done ∧ d(t) = r ⇒ G(t) = today`. | Test s po enim opravilom na vsakem robu; preveri skupino in števce. |
| R04 | `s(t) ≠ done ∧ 1 ≤ razlika(r, d(t)) ≤ 7 ⇒ G(t) = week`; `s(t) ≠ done ∧ razlika(r, d(t)) > 7 ⇒ G(t) = later`; skupine so disjunktne in skupaj vsebujejo vsa opravila. | Test z roki `r+1`, `r+7`, `r+8` in več; preveri razvrstitev in vsoto števcev. |
| R05 | Datumi so koledarski `YYYY-MM-DD` neodvisno od časovnega pasu in poletnega časa; seštevanje dni deluje čez meje meseca, leta in prestopni februar. | Test z `2026-12-31`, `2027-01-01`, `2028-02-28/29`; primerjaj meje skupin. |
| R06 | Pet števcev prikazuje `c_k` celotnega projekta; aktivni filter jih ne spremeni; vsak ima `aria-label` `Število rokov <ključ>` in samo številsko vrednost. | Test: preberi vseh pet elementov pred in po izbiri skupine; vrednosti morajo ostati enake. |
| R07 | Izbirnik `Pogled rokov` ponuja `all`/`overdue`/`today`/`week`/`later`/`done`; izbrana skupina se prikaže v izvornem vrstnem redu, izbor ne spremeni datumov ali stanj. | Test: izbira vsake skupine; primerjaj prikazane ID-je in nespremenjene podatke. |
| R08 | Veljaven nov `r` takoj preračuna skupine in vidne vrstice ter ohrani filter; prazno polje prikaže opozorilo in ohrani zadnji veljavni preračun; ponoven veljaven datum opozorilo odstrani. | Test: vnos veljavnega, praznega in ponovno veljavnega datuma; preveri skupine, filter in opozorilo. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je; preklop pogleda ohrani `r`, besedilo polja in izbrano skupino. | Test: preklop pogleda ob izbranem filtru; primerjaj `data-task-id` in stanje kontrol. |
| R10 | Menjava projekta in osvežitev ponastavita datum in skupino na začetne vrednosti; noben podatek o filtru se ne hrani v trajni shrambi ali URL-ju. | Test: nastavi datum in filter, zamenjaj projekt oziroma osveži; preveri začetne vrednosti in odsotnost zapisa v shrambi/URL-ju. |
| R11 | Prazen projekt daje pet ničel; prazna skupina v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`. | Test s praznim projektom in s projektom brez zadetkov v skupini. |
| R12 | Datumi podatkov so veljavni `YYYY-MM-DD`, tudi prestopni; pregled ne pošilja zapisov na API; polja in bralne podrobnosti ostanejo nespremenjeni; ohranjen je prilagodljiv Folio. | Test: opazuj omrežne zahteve med pregledom; preveri podrobnosti opravila in videz pri 390 pikah. |

Dodatna dogovorjena pravila vmesnika: imena skupin so `Zapadlo`, `Danes`,
`Naslednjih 7 dni`, `Pozneje` in `Končano`; `data-task-id` ostane na vrsticah in
karticah; `aria-label="Pregled stanj opravil"` in obstoječa dostopna imena
ostanejo; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik
se cela stran ne razširi (notranje drsenje je dovoljeno).

## Uporabniški scenariji

- P1 (najpomembnejši): uporabnik v projektnem pogledu vidi pet števcev in izbere
  skupino rokov, da se seznam omeji na ustrezna opravila.
- P2: uporabnik vnese drug veljaven referenčni datum in takoj vidi preračunane
  skupine ob ohranjenem filtru; pri praznem polju dobi opozorilo.
- P3: uporabnik preklopi med preglednico in tablo; prikazani ID-ji in izbrano
  stanje ostanejo enaki.
- P4: ob menjavi projekta ali osvežitvi se pogled povrne na `2026-09-21` in `all`.

## Merila uspeha

- SC-001: vsak prikazan `data-task-id` pripada izbrani skupini glede na `r`, vsa
  ostala opravila projekta pa niso prikazana.
- SC-002: pet števcev se ujema z velikostjo skupin celotnega projekta tudi ob
  aktivnem filtru.
- SC-003: pregled ne pošlje nobene zapisovalne zahteve na `/api/` in ne shrani
  stanja filtra v trajno shrambo ali URL.
- SC-004: ob preklopu pogleda in po veljavnem datumu so ID-ji v obeh pogledih enaki.
- SC-005: pri širini 390 pik se cela stran ne razširi.

## Robni primeri

- Prestopni februar, meje meseca in leta pri seštevanju dni.
- `d(t) = r`, `d(t) = r+7` (week) in `d(t) = r+8` (later).
- Vsa opravila `done`; prazna skupina; prazen projekt; eno opravilo; več kot deset.
- Prazno polje datuma; neveljaven datum; ponoven veljaven vnos.
- Naslovi z Unicode znaki in ločili; enaki naslovi; poljubno zaporedje opravil.

## Izvedba in sledljivost

Podrobna sledljivost se vodi v `docs/agent/P08/plan.md` (načrt) in
`docs/agent/P08/tasks.md` (naloge); testi nastanejo v `tests/agent/`. Ob
izpolnitvi se za vsako zahtevo dopišejo datoteka in del kode ter izid z dokazom.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | glej preglednico zgoraj | načrtovani testi v `tests/agent/` | `src/` (izbira v `docs/agent/P08/plan.md`) | ni še preverjeno; se izpolni po izvedbi |

## Odprta vprašanja in omejitve

- Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista
  predpisana; privzeto se uporabijo obstoječi gradniki Folio.
- Končni testi izvajalca niso dostopni; preverjanje poteka z lastnimi testi in
  skupnimi regresijskimi testi izhodišča.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso del obsega.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu; novih zapisovalnih
  API-jev ni.

### Predpostavke

- Referenčni datum velja za trenutni projekt in se ne shranjuje.
- Opravila imajo natanko eno od stanj `todo`, `in_progress`, `done`.
- Testni podatki lahko vsebujejo poljubno število opravil z drugačnimi ID-ji in
  veljavnimi koledarskimi datumi; polja ostajajo enaka izhodišču.
