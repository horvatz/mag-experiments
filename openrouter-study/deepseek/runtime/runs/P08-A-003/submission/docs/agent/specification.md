# P08 — Razvojna specifikacija: Koledarski pregled rokov

Različica 1.0 (postopek A, en agent). Predloga: task/specification-template.md.

## Problem in kontekst

Uporabnik v projektu Folio pregleduje opravila in njihove roke. Izhodišče
prikazuje vse naloge projekta v preglednici ali tabli ter tri števce stanj.
Za P08 potrebujemo koledarski pregled rokov: fiksni referenčni datum
2026-09-21, razvrščanje opravil v skupine Zapadlo/Danes/Naslednjih 7 dni/
Pozneje/Končano, pet števcev celotnega projekta in izbirnik skupine, ki
filtrira vidne vrstice oziroma kartice. Pregled je bralni: podatke beremo z
/api/, ničesar ne shranjujemo in ne pošiljamo zapisov.

## Vhodi, dejanja in izidi

Podatkovna polja opravila: id, projectId, title, description, status
(todo | in_progress | done), assignee, dueDate (YYYY-MM-DD). Referenčni
datum je lokalno stanje pogleda projekta, začetno 2026-09-21; izbrana
skupina je lokalno stanje, začetno all.

Dovoljena dejanja: vnos referenčnega datuma (input type=date, oznaka
Referenčni datum), izbor skupine (select, oznaka Pogled rokov), preklop
preglednica/tabla, odpiranje podrobnosti opravila.

- Uspeh: veljaven datum takoj preračuna skupine, števce in vidne vrstice,
  aktivni izbor skupine ostane. Prazno polje pokaže role=alert z besedilom
  Vnesi veljaven referenčni datum. in obdrži zadnji veljavni preračun;
  ponoven veljaven vnos opozorilo odstrani.
- Preklic/napaka: neveljaven vnos ne spremeni razvrstitve; napake branja
  obravnava obstoječi LoadError z ponovitvijo.
- Prazna skupina v nepraznem projektu pokaže Ni opravil v izbrani skupini.;
  prazen projekt pokaže pet ničel in obstoječe prazno stanje.

## Zahteve in pravila

Simboli: r = zadnji veljavni referenčni datum (začetno 2026-09-21),
d = dueDate opravila, +n = prištevanje koledarskih dni (UTC, neodvisno od
časovnega pasu/DST). skupina(t):

```
done(t)     ⇔ t.status = done
overdue(t)  ⇔ ¬done(t) ∧ d < r
today(t)    ⇔ ¬done(t) ∧ d = r
week(t)     ⇔ ¬done(t) ∧ r < d ≤ r+7
later(t)    ⇔ ¬done(t) ∧ d > r+7
```

Skupine so disjunktne in pokrijejo vsa opravila. Števci štejejo po vseh
opravilih projekta ne glede na aktivni filter. Vidne vrstice so
filter = (izbrana skupina = all) ? vsa : {t : skupina(t) = izbrana} v
izvornem vrstnem redu odgovora API-ja.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta velja r = 2026-09-21 (konstanta, ne ura naprave); izbrana skupina = all. | Test: začetni value polja in izbira all; primerjava ob različnih urah ni potrebna, ker ni branja ure. |
| R02 | done(t) velja ne glede na d; done opravila niso v overdue/today/week/later in števci odprtih skupin jih ne štejejo. | Test: done opravilo s preteklim rokom v skupini Končano, ne v Zapadlo. |
| R03 | overdue(t) ⇔ ¬done(t) ∧ d < r; today(t) ⇔ ¬done(t) ∧ d = r. | Test: meja r-1, r. |
| R04 | week(t) ⇔ ¬done(t) ∧ r < d ≤ r+7; later(t) ⇔ ¬done(t) ∧ d > r+7; disjunktnost in pokritost. | Test: meje r+1, r+7, r+8; vsota števcev = število opravil. |
| R05 | Datumi so koledarski YYYY-MM-DD; +n teče čez mesec, leto in prestopni februar. | Test: 2026-12-31 in 2028-02-28 kot r ter roki v sosednjih dneh. |
| R06 | Pet števcev aria-label=Število rokov <ključ> (overdue/today/week/later/done) šteje vsa opravila projekta; filter jih ne spremeni. | Test: vrednosti pred/po izboru skupine; primerjava s pričakovanimi števili. |
| R07 | Izbirnik Pogled rokov (all/overdue/today/week/later/done) pokaže točno skupino v izvornem vrstnem redu; datumov in stanj ne spreminja. | Test: ID-ji po skupinah v vrstnem redu API-ja; API stanje nespremenjeno. |
| R08 | Veljaven vnos takoj preračuna in ohrani izbrano skupino; prazen vnos → role=alert Vnesi veljaven referenčni datum. in zadnji veljavni preračun; ponoven veljaven vnos opozorilo odstrani. | Test D03 + lastni test (sprememba datuma ob aktivnem filtru). |
| R09 | Preglednica in tabla prikažeta iste filtrirane ID-je; preklop pogleda ohrani r, besedilo polja in skupino. | Test: ID-ji v obeh pogledih, stanje kontrol po preklopu. |
| R10 | Menjava projekta in osvežitev ponastavita datum in skupino na začetni vrednosti; filter ni v localStorage/sessionStorage/URL-ju. | Test: sprememba → preklop projekta/osvežitev → privzeto; pregled location.hash in shramb. |
| R11 | Prazen projekt → pet ničel; prazna skupina v nepraznem projektu → Ni opravil v izbrani skupini. in izbirnik ostane uporaben. | Test: nadzorovani GET z []; filter brez zadetkov. |
| R12 | dueDate so veljavni YYYY-MM-DD (tudi prestopni); pregled ne pošilja zapisov; polja/podrobnosti ostanejo nespremenjeni; Folio ostane prilagodljiv (brez vodoravnega prelivanja strani pri 390 px). | Test: readonly (brez zapisov), podrobnosti, scrollWidth ≤ innerWidth pri 390 px. |

Splošno pravilo: noben izbor ali vnos ne sme spremeniti opravil ali poslati
zapisa na strežnik. Posamezni testni primeri so le primeri domene, ne
nadomeščajo pravila.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti r in all | D01, A01 | src/deadlines.ts, src/App.tsx | glej docs/agent/verification.md |
| R02 | done neodvisno od roka | D04, A02 | deadlines.ts: classifyTask | isto |
| R03 | meji r-1, r | D01, A03 | deadlines.ts | isto |
| R04 | meje r+1, r+7, r+8 | D02, A03 | deadlines.ts | isto |
| R05 | mesec/leto/prestop | A04 | deadlines.ts: addDays | isto |
| R06 | števci neodvisni od filtra | D02, A05 | App.tsx: counts | isto |
| R07 | vrstni red in skupine | D01, A06 | App.tsx: filtered | isto |
| R08 | opozorilo in preračun | D03, A07 | App.tsx: onDateChange | isto |
| R09 | ista filtracija v obeh pogledih | D04, A08 | App.tsx, TaskBoard.tsx | isto |
| R10 | ponastavitev brez shrambe | A09 | App.tsx (key={project.id}) | isto |
| R11 | ničle in prazna skupina | A10 | App.tsx | isto |
| R12 | bralni pregled, 390 px | D04, A11 | App.tsx, styles.css | isto |

## Odprta vprašanja in omejitve

- Besedilo možnosti all ni predpisano; izbrano je Vsi roki, vrednost all.
- Razporeditev novih kontrol ni predpisana; uporabljeni so obstoječi Folio
  gradniki, kontrole so nad pregledom in se pri ozkih zaslonih prelomijo.
- Končni ocenjevalni testi niso dostopni; preverjanje temelji na razvojnih
  testih D01–D04 in lastnih testih A01–A11.

### Dnevnik sprememb specifikacije

- 1.0 — začetna različica.
