# Razvojna specifikacija — P08: Koledarski pregled rokov

Različica: 1.0 (osnutek) · Avtor: snovalec specifikacije · Datum: 2026-10-09

## Problem in kontekst

Uporabnik želi v projektu Folio videti, katera opravila so zapadla, katera so
na vrsti danes, v naslednjih sedmih dneh in pozneje, ločeno od končanih. Namen
je koledarski pregled, ki se računa glede na izrecno določen referenčni datum
2026-09-21, ne glede na uro naprave ali časovni pas. Izhodiščna aplikacija
prikazuje preglednico ali tablo vseh opravil trenutnega projekta in povzetek
stanj; pogleda rokov še ni.

Predvidena sprememba: v `src/` dodati kontrolo `input type=date` z oznako
Referenčni datum in `select` Pogled rokov (all/overdue/today/week/later/done),
pet števcev po skupinah ter filtriranje vrstic/kartic. Podatki se berejo iz
obstoječega javnega API-ja `/api/`; strežnik, skupni tipi in infrastruktura se
ne spreminjajo.

## Vhodi, dejanja in izidi

**Vhodi.** `Project {id, name}` in `Task {id, projectId, title, description,
status: 'todo'|'in_progress'|'done', assignee, dueDate}` iz `shared/types.ts`,
prebrani prek `/api/` (`src/api.ts`). `dueDate` je veljaven koledarski datum
`YYYY-MM-DD` (tudi prestopni). Testi lahko vrnejo poljubno število opravil
(nič, eno, več kot deset), različno zaporedje, enake naslove in drugačne
enkratne ID-je; projekta sta lahko prazna. Vsa opravila pripadajo svojemu
projektu.

**Stanje nove funkcionalnosti (lokalno trenutnemu projektu, brez trajne
shrambe in brez URL-ja):**

- `refDate: string` — trenutno besedilo polja referenčnega datuma;
- `lastValidRef: string` — zadnji veljavni referenčni datum za izračun;
- `view: 'all'|'overdue'|'today'|'week'|'later'|'done'` — izbrana skupina.

Ob začetku projekta (prvi prikaz, menjava projekta, osvežitev strani) velja
`refDate = lastValidRef = 2026-09-21` in `view = 'all'`.

**Dejanja:**

1. Vnos datuma v polje Referenčni datum. Veljaven datum (`YYYY-MM-DD`,
   obstoječ koledarski dan) takoj posodobi `refDate` in `lastValidRef`,
   preračuna skupine in vidne vrstice, ohrani `view` ter odstrani opozorilo.
   Prazen ali neveljaven vnos prikaže opozorilo, izračun pa ostane pri
   `lastValidRef`; ponoven veljaven vnos opozorilo odstrani.
2. Izbor v selectu Pogled rokov. `all` prikaže vsa opravila projekta, ostale
   vrednosti ustrezno skupino; izbor ne spremeni datumov ali stanj opravil in
   ohrani `refDate` ter besedilo polja.
3. Preklop pogleda Preglednica/Tabla. Oba prikažeta iste filtrirane ID-je v
   izvornem vrstnem redu; preklop ohrani `refDate`, besedilo polja in `view`.
4. Odprtje podrobnosti opravila. Pregled ne pošilja zapisov na API; polja in
   bralne podrobnosti ostanejo nespremenjeni.

**Izidi.** Pet števcev prikazuje število opravil celotnega trenutnega projekta
po skupinah; filter nanje ne vpliva. Prazna skupina v nepraznem projektu
prikaže sporočilo in omogoča preklop na drugo skupino ali `all`. Prazen projekt
da pet ničel. Napaka pri branju podatkov se vede kot v izhodišču (obstoječe
stanje napake); novih zapisovalnih klicev ni.

## Zahteve in pravila

**Splošni model.** Naj bo `REF = 2026-09-21` (referenčni datum), `t` opravilo
trenutnega projekta, `d = t.dueDate`, `D = t.status === 'done'`. Primerjava
datumov je leksikografska primerjava nizov `YYYY-MM-DD` (enakovredna
koledarski). Tedenski razpon je `REF+1 .. REF+7` (od naslednjega dne do
vključno sedmega dne); `REF+7 = 2026-09-28`.

Skupine so predikati (medsebojno disjunktni, unija = vsa opravila projekta):

- `done(t)   ⇔ D`
- `overdue(t) ⇔ ¬D ∧ d < REF`
- `today(t)  ⇔ ¬D ∧ d = REF`
- `week(t)   ⇔ ¬D ∧ REF < d ≤ REF+7`
- `later(t)  ⇔ ¬D ∧ d > REF+7`

Števci `n_g` za `g ∈ {overdue, today, week, later, done}` so kardinalnosti
`{t : g(t)}` po vseh opravilih projekta, neodvisno od `view`. Vidne vrstice so
`{t : view = 'all' ∨ view(t)}` v izvornem vrstnem redu podatkov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta (prvi prikaz, menjava projekta, osvežitev) je referenčni datum izrecno 2026-09-21 in ni odvisen od ure naprave; začetni `view` je `all`. | Test UI: ob zagonu je vrednost polja 2026-09-21 in izbran `all`; ponoven zagon/nov zagon projekta enako. |
| R02 | `done(t) ⇔ status === 'done'`, ne glede na `d`; končano opravilo ni v nobeni od štirih skupin odprtih opravil in ne v njihovih števcih. | Test UI z opravili done z roki v preteklosti, danes, v tednu in pozneje: vsa samo v Končano; `n_overdue = n_today = n_week = n_later = 0` za ta opravila. |
| R03 | `overdue(t) ⇔ ¬done ∧ d < REF`; `today(t) ⇔ ¬done ∧ d = REF`. | Test UI: odprto opravilo z datumom 2026-09-20 v Zapadlo, z 2026-09-21 v Danes. |
| R04 | `week(t) ⇔ ¬done ∧ REF < d ≤ REF+7` (2026-09-22 .. 2026-09-28); `later(t) ⇔ ¬done ∧ d > REF+7` (od 2026-09-29); skupine so disjunktne in skupaj vsebujejo vsa opravila. | Test UI z mejnimi datumi 2026-09-22, 2026-09-28, 2026-09-29 in vsota števcev enako številu opravil (razvojni D02: week = web-02, web-04, števec 2). |
| R05 | Datumi so koledarski `YYYY-MM-DD` neodvisno od časovnega pasu in poletnega časa; seštevanje dni prečka meje meseca, leta in prestopni februar (npr. 2028-02-28+2 = 2028-03-01, 2028-02-29 veljaven; 2026-12-31+1 = 2027-01-01). | Test UI z mejnimi datumi; enote datumske aritmetike preverjene posredno prek razvrstitve in polja. |
| R06 | Pet števcev (`overdue/today/week/later/done`) prikazuje število opravil celotnega trenutnega projekta; aktivni filter jih ne spremeni. | Test UI: ob izbiri vsakega pogleda so vrednosti enake; sprememba `view` ne spremeni nobenega števca. |
| R07 | Izbirnik Pogled rokov (all/overdue/today/week/later/done) prikaže ustrezno skupino v izvornem vrstnem redu; izbor ne spremeni `dueDate` ali `status` opravil. | Test UI: za vsako vrednost se ujemajo prikazani `data-task-id` z pričakovano množico v izvornem vrstnem redu; stanja/datumi nespremenjeni. |
| R08 | Veljaven nov datum takoj preračuna skupine in vidne vrstice ter ohrani `view`; prazen/neveljaven vnos prikaže opozorilo in ohrani zadnji veljavni izračun; ponoven veljaven datum opozorilo odstrani. | Test UI: vnos 2026-09-22 ob `view=week` spremeni števce/vrstice, `view` ostane; izpraznitev polja prikaže opozorilo brez spremembe izračuna (razvojni D03); ponoven vnos opozorilo odstrani. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je; preklop ohrani `refDate`, besedilo polja in `view`. | Test UI: primerjava `data-task-id` med pogledoma za vsak filter; po preklopu sta datum in izbira nespremenjena. |
| R10 | Menjava projekta in osvežitev ponastavita datum in skupino na začetni vrednosti (2026-09-21, `all`). Noben podatek o filtru se ne hrani v trajni shrambi ali URL-ju. | Test UI: sprememba filtra, nato menjava projekta/osvežitev; polje in izbira nazaj na začetku, URL in shramba brez zapisa filtra. |
| R11 | Prazen projekt da pet ničel; prazna skupina v nepraznem projektu prikaže »Ni opravil v izbrani skupini.« ter omogoča preklop na drugo skupino ali `all`. | Test UI: projekt brez opravil → pet × 0; projekt z opravili samo v eni skupini → sporočilo v prazni skupini, izbirnik deluje. |
| R12 | `dueDate` podatkov so veljavni `YYYY-MM-DD`, tudi prestopni; pregled ne pošilja zapisov na API; polja in bralne podrobnosti ostanejo nespremenjeni; ohranjen je prilagodljiv videz Folio. | Test UI + pregled omrežnih klicev (samo GET `/api/`); prestopni datum; vizualna in vedenjska primerjava s Folio. |

**Dogovor o vmesniku (preverljivi selektorji):**

- `input type=date` z oznako Referenčni datum; vrednost `YYYY-MM-DD`.
- `select` z oznako Pogled rokov; možnosti `all`, `overdue`, `today`, `week`,
  `later`, `done`.
- Pet elementov s `aria-label="Število rokov <ključ>"` (npr.
  `Število rokov overdue`) in vsebino samo s številsko vrednostjo.
- Prazen/neveljaven datum: element z `role=alert`, ki vsebuje besedilo
  »Vnesi veljaven referenčni datum.« (razvojni D03 uporablja `toContainText`).
- Imena skupin v vidnem besedilu: Zapadlo, Danes, Naslednjih 7 dni, Pozneje,
  Končano.
- Prazna skupina: besedilo »Ni opravil v izbrani skupini.«.
- Ohranjeni so `data-task-id` na vrsticah in karticah, dostopna imena
  obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu so zunaj njegove povezave (niso gnezdena v `<a>`).
- Filter velja tudi za tablo: kartice se najprej filtrirajo po `view`, nato
  razvrstijo v obstoječe stolpce po `status` (razvojni D04).
- Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in
  table je dovoljeno. Besedilo, ki ni določeno zgoraj, in razporeditev novih
  kontrol nista predpisana.

**Predpostavke.** Referenčni datum je konstanta naloge (ne sistemski čas).
»Začetek projekta« pomeni prvi prikaz projekta v seji, menjavo projekta in
osvežitev strani. Opravila so že naložena prek obstoječih vtičnikov
(`useResource`); sprememba `view` ali datuma ne sproži ponovnega branja.
Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
osvežitve niso razširitev zahtev. Stanje filtra ni trajno in ni v URL-ju.

## Izvedba in sledljivost

Povezave na kodo so okvirne za načrtovano izvedbo v `src/`; rezultati testov se
vpišejo ob izvedbi (faza implementacije/pregleda). Nič ni označeno kot uspešno
brez dejanskega zagona. Razvojni testi `tests/development/P08.spec.ts`
(D01–D04) so del skupnih kontrol; lastni testi v `tests/agent/` naj jih
dopolnijo, ne podvajajo.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetni datum 2026-09-21, `all` | D01 + lastni začetni test | `src/App.tsx` (stanje filtra), `src/components.tsx` | bo izvedeno |
| R02 | done izven odprtih skupin | D04 + lastni test done z vsemi roki | `src/App.tsx` (predikati/števci) | bo izvedeno |
| R03 | overdue/today meja REF | D01 + lastni test datuma 2026-09-21 | `src/App.tsx`, `src/formatDate.ts` | bo izvedeno |
| R04 | week 1–7 dni, later > 7 | D02 + lastni mejni 22./28./29. 9. | `src/App.tsx` (predikati) | bo izvedeno |
| R05 | koledarski datumi brez TZ | D02 + lastni prestopni test | `src/formatDate.ts`, pomožna datumska funkcija | bo izvedeno |
| R06 | števci celotnega projekta | D02 + lastni test ob vseh filtrih | `src/App.tsx` (summary) | bo izvedeno |
| R07 | filter = ustrezna skupina, izvorni vrstni red | D01, D02, D04 + lastni za `all`/`later` | `src/App.tsx`, `src/TaskBoard.tsx` | bo izvedeno |
| R08 | preračun, ohranjen filter, opozorilo | D03 + lastni neveljavni vnos | `src/App.tsx`, `src/components.tsx` | bo izvedeno |
| R09 | iste ID med preglednico in tablo | D04 + lastni za vsak filter | `src/App.tsx`, `src/TaskBoard.tsx` | bo izvedeno |
| R10 | reset ob projektu/osvežitvi, brez shrambe | lastni test menjave projekta in ponovnega zagona | `src/App.tsx`, `src/navigation.ts` | bo izvedeno |
| R11 | pet ničel; sporočilo prazne skupine | lastni test praznega projekta in prazne skupine | `src/App.tsx`, `src/TaskBoard.tsx` | bo izvedeno |
| R12 | veljavni datumi, samo bralni API, Folio | D04 (`readonly`) + omrežni dnevnik + vizualni pregled | `src/api.ts`, `src/styles.css` | bo izvedeno |

## Odprta vprašanja in omejitve

- Končni testi niso dostopni; specifikacija se opira na razvojne teste in
  lastne teste naloge. Razvojni primeri niso celoten obseg.
- Neveljaven (ne le prazen) datum v polju `type=date` je odvisen od brskalnika;
  opozorilo je zahtevano za prazen vnos, smiselno tudi za neveljavnega.
- Točna razporeditev novih kontrol in besedila, ki niso določena, so prepuščeni
  izvedbi ob ohranitvi Folio.
- Mejni primeri, ki niso izrecno določeni (npr. navigacija med nalaganjem), se
  ne razširjajo prek obstoječih regresijskih zahtev.
