# P08 — Koledarski pregled rokov: specifikacija

Vir zahtev: `task/instructions.md` (R01–R12). Dizajn: `docs/dizajn.md`
(potrjeni Folio). Pravila: `PROJECT_RULES.md` in `.specify/memory/constitution.md`.
Različica specifikacije: 1.0 (2026-10-09).

## Problem in kontekst

Uporabnik pri pregledu opravil projekta potrebuje koledarski pregled rokov
glede na izrecni referenčni datum, ne glede na uro naprave. Folio zdaj
prikazuje opravila v preglednici in na tabli ter šteje stanja; pogleda rokov
še ni. Sprememba doda vmesnik za izbiro referenčnega datuma in skupine
rokov (all/overdue/today/week/later/done), pet števcev in filtrirane vrstice
oziroma kartice, ob ohranitvi potrjenega videza Folio. Zapisovalni API in
podatki se ne spreminjajo.

## Vhodi, dejanja in izidi

### Podatkovna polja (nespremenjena, iz `shared/types.ts`)

- `Task.id`, `Task.projectId`, `Task.title`, `Task.description`,
  `Task.status` (`todo`/`in_progress`/`done`), `Task.assignee`,
  `Task.dueDate` (veljaven koledarski `YYYY-MM-DD`).
- Vsi podatki se berejo prek javnega `/api/`; izbira po `id`. Pregled ne
  pošilja zapisov na API.

### Dejanja in pogoji

- Vnos referenčnega datuma v `input type=date` (oznaka Referenčni datum);
  začetna vrednost in ponastavitev: 2026-09-21.
- Izbira v `select` Pogled rokov: all/overdue/today/week/later/done;
  začetna izbira all.
- Preklop preglednica/tabla; menjava projekta; osvežitev strani; odpiranje
  podrobnosti opravila.
- Opravila se v skupino uvrstijo po pravilu iz razdelka Zahteve; skupine so
  disjunktne in pokrijejo vsa opravila projekta.

### Izidi

- Uspeh: ob veljavnem referenčnem datumu se skupine in vidne vrstice takoj
  preračunajo; števci kažejo število vseh opravil projekta po skupinah;
  aktivni filter se ohrani.
- Napaka: prazno polje prikaže `role=alert` z besedilom
  „Vnesi veljaven referenčni datum.“, ohrani zadnji veljavni preračun;
  ponoven veljaven datum opozorilo odstrani.
- Preklic: preklop pogleda ali skupine ne spremeni referenčnega datuma,
  besedila polja in izbrane skupine; stanja in datumi opravil se ne
  spreminjajo. Menjava projekta in osvežitev ponastavita datum in skupino.

## Zahteve in pravila

### Simboli in predpostavke

- `D(t)` = koledarski datum `dueDate` opravila `t`; `REF` = referenčni datum
  (začetno 2026-09-21); `diff(t)` = razlika v dnevih `D(t) − REF`, računana
  na koledarskih datumih neodvisno od časovnega pasu in poletnega časa.
- `done(t) ≡ status(t) = done`; odprto opravilo je `¬done(t)`.
- `group(t)` ∈ {overdue, today, week, later, done}:
  `done(t) → done`; sicer `diff(t) < 0 → overdue`; `diff(t) = 0 → today`;
  `1 ≤ diff(t) ≤ 7 → week`; `diff(t) ≥ 8 → later`.
- `count(g) = |{t : group(t) = g}|` za celoten trenutni projekt; filter `f`
  ∈ {all, overdue, today, week, later, done} ne vpliva na `count`.
- Vidne vrstice: `f = all → vsa opravila` v izvornem vrstnem redu; sicer
  opravila z `group(t) = f` v izvornem vrstnem redu.
- Stanje pregleda `S = (REF, f, view, text)`, kjer je `text` trenutno
  besedilo datumskega polja; `view` ∈ {table, board}.

### Pravila sprememb stanja

- `init`: `S = (2026-09-21, all, table, "2026-09-21")`; ne glede na uro
  naprave (R01, R10).
- `setRef(d)` z veljavnim `d`: `REF ← d`, `text ← d`, `f` in `view`
  nespremenjena, opozorilo odstranjeno; preračun `group` in `count` (R08).
- `setRef(prazno/neveljavno)`: `REF`, `f`, `view` in zadnji preračun
  nespremenjeni; prikaže se opozorilo (R08).
- `setFilter(g)`: `f ← g`; `REF`, `text` in `view` nespremenjeni; vidne
  vrstice po pravilu `f` (R07).
- `setView(v)`: `view ← v`; `REF`, `text`, `f` nespremenjeni; ista
  filtrirana množica ID-jev (R09).
- `switchProject` ali `refresh`: ponovni `init`; filter se ne hrani v
  trajni shrambi ali URL-ju (R10).

### Pregled zahtev

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `init` vedno da `REF = 2026-09-21` in `f = all`, neodvisno od ure naprave | test brskalnika: začetno stanje in ponovni zagon |
| R02 | `done(t) → group(t) = done` in `done` ni v nobeni od štirih skupin odprtih opravil | test: opravilo done z rokom v preteklosti/danes/prihodnosti |
| R03 | `¬done(t) ∧ diff(t) < 0 → overdue`; `¬done(t) ∧ diff(t) = 0 → today` | test: mejna datuma REF−1 in REF |
| R04 | `¬done(t) ∧ 1 ≤ diff(t) ≤ 7 → week`; `¬done(t) ∧ diff(t) ≥ 8 → later`; skupine disjunktne, unija vsa opravila | test: mejna dneva REF+1 in REF+7 ter REF+8; vsota števcev |
| R05 | `diff` se računa na koledarskih `YYYY-MM-DD`; deluje čez mesec, leto in prestopni februar | test: 2026-12-31→2027-01-01 in 2028-02-28→2028-02-29 |
| R06 | pet števcev = `count(g)` za cel projekt; `setFilter` jih ne spremeni | test: števci ob različnih filtrih |
| R07 | `select` prikaže skupino po pravilu `f` v izvornem vrstnem redu; ne spremeni datumov/stanj | test: izbira vsake skupine; primerjava podatkov pred/po |
| R08 | `setRef(veljaven)` takoj preračuna ob ohranjenem `f`; `setRef(prazno)` da opozorilo in ohrani zadnji preračun; veljaven datum opozorilo odstrani | test: vnos veljavnega, praznega in ponovno veljavnega datuma |
| R09 | preglednica in tabla prikažeta iste filtrirane ID-je; `setView` ohrani `REF`, `text`, `f` | test: primerjava `data-task-id` med pogledoma |
| R10 | `switchProject`/`refresh` ponastavita `REF` in `f`; ni shrambe v `localStorage` ali URL-ju | test: menjava projekta, osvežitev, pregled shrambe/URL-ja |
| R11 | prazen projekt → pet ničel; prazna skupina → „Ni opravil v izbrani skupini.“ in omogočen preklop | test: prazen projekt in skupina brez opravil |
| R12 | datumi so veljavni `YYYY-MM-DD` tudi prestopni; pregled ne pošilja zapisov; polja in podrobnosti nespremenjene; prilagodljiv Folio | test: prestopni datumi; nadzor zahtevkov; `data-task-id`, dostopna imena in `aria-label` |

Dogovor o vmesniku (iz `task/instructions.md`): oznaka Referenčni datum,
`select` Pogled rokov, pet elementov z `aria-label` „Število rokov <ključ>“,
imena skupin Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano, opozorilo
„Vnesi veljaven referenčni datum.“, ohranjeni `data-task-id`, dostopna imena
pogledov in stolpcev, `aria-label="Pregled stanj opravil"`, nova dejanja
zunaj povezave opravila, pri 390 pikah brez razširitve strani (notranji
pomik dovoljen).

## Scenariji uporabnika in merila uspeha

- Pregled začetnega stanja: uporabnik odpre projekt in vidi pet števcev za
  referenčni datum 2026-09-21 ter filter all. Uspeh: števci ustrezajo
  `count(g)`, vrstice vsa opravila v izvornem vrstnem redu.
- Koledarska uvrstitev: opravila z roki pred, na, v 7 dneh po in pozneje od
  REF se uvrstijo v overdue/today/week/later; done vedno v done. Uspeh:
  skupine disjunktne, mejni dnevi pravilni, tudi čez leto in prestopni
  februar.
- Filtriranje in preklop pogleda: izbira skupine prikaže ustrezne vrstice in
  kartice z istimi ID-ji; preklop pogleda ne spremeni datuma in izbire.
  Uspeh: enaka filtrirana množica ID-jev, ohranjeno stanje `S`.
- Neveljaven datum: prazno polje pokaže opozorilo in ohrani zadnji
  preračun; ponoven veljaven vnos opozorilo odstrani. Uspeh: brez spremembe
  podatkov, pravilen preračun.
- Prazen projekt in prazna skupina: pet ničel oziroma sporočilo „Ni opravil
  v izbrani skupini.“ z možnostjo preklopa. Uspeh: berljivo stanje brez
  napake.

Merila uspeha so preverljiva s testi te naloge; zunanjih meritev ni.

## Izvedba in sledljivost

Načrtovane datoteke: `src/App.tsx` (stanje `S`, kontrole, števci,
filtriranje), `src/formatDate.ts` (koledarska aritmetika), `src/TaskBoard.tsx`
in `src/components.tsx` (prikaz filtriranih kartic), `tests/agent/` (lastni
testi P08). Izidi se vpišejo po dejanskem zagonu; do takrat velja „ni še
izvedeno“.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | pravila iz pregleda zahtev | lastni testi v `tests/agent/` (načrtovani) | `src/App.tsx`, `src/formatDate.ts` | ni še izvedeno (specifikacija pred implementacijo) |

## Odprta vprašanja in omejitve

- Končni testi izvajalca niso dostopni; specifikacija jih ne navaja kot
  izvedene. Razvojni pripomoček `/__test/` uporablja samo testni program;
  aplikacija bere izključno `/api/`.
- Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb
  podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu; če zahteva ne
  določa trajne shrambe ali URL-ja, se ne shranjuje.

## Zgodovina sprememb

- 1.0 (2026-10-09): prva različica; zajeti R01–R12 po skupni predlogi.
