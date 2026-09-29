# P08 — Koledarski pregled rokov

Različica 1.0, 2026-09-25. Postopek C, Spec Kit 1.0.8, Lean 1.0.0.

## Problem in kontekst

Uporabnik želi v trenutnem projektu hitro prepoznati zapadla, današnja, bližnja, poznejša in končana opravila ter jih pregledati glede na izbrani koledarski dan. Začetni Folio že bere projekte in opravila, prikazuje preglednico, tablo, števce stanj in bralne podrobnosti. Dodamo referenčni datum, pet števcev rokov in filter, skupen preglednici in tabli.

Merilo so vse izvirne [zahteve R01–R12 in dogovor o vmesniku](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [potrjeni Folio](../../dizajn.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md); izvedbene povezave in dejanska dokazila se dopolnijo v korakih načrtovanja in implementacije.

## Vhodi, dejanja in izidi

- Projekt: `id`, `name`. Opravilo: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; iz obstoječega javnega `/api/`. `status` je `todo`, `in_progress` ali `done`. `dueDate` je veljaven koledarski `YYYY-MM-DD`, tudi v prestopnem letu.
- Število opravil je poljubno, vključno z nič, ena in več kot deset. ID-ji so enkratni in niso vezani na začetne podatke. Naslovi se lahko ponavljajo; besedila ostanejo navadno besedilo z Unicode znaki in ločili. Izvorno zaporedje je zaporedje odgovora API-ja. Opravila pripadajo trenutnemu projektu.
- Dovoljena nova dejanja: sprememba referenčnega datuma in izbira skupine rokov. Obstoječa dejanja ostanejo: preklop pogleda, menjava projekta, osvežitev in odpiranje/zapiranje bralnih podrobnosti po ID-ju.
- Ob uspešni spremembi datuma ali filtra se prikaz takoj preračuna brez zapisovanja opravil. Prazno datumsko polje ostane prazno, pokaže opozorilo in ne spremeni zadnjega veljavnega preračuna. Ponovni veljaven vnos opozorilo odstrani.
- Nov postopek nima potrjevanja ali preklica. Zaprtje izbirnika brez spremembe vrednosti ne sproži spremembe stanja. Obstoječi prikazi nalaganja, napake API-ja in ponovnega poskusa ostanejo; ne uvajamo novih pravil za sočasne spremembe ali navigacijo med nalaganjem.

### Dogovor o vmesniku

- `input type="date"` z dostopno oznako **Referenčni datum**.
- HTML `select` z oznako **Pogled rokov** in vrednostmi `all`, `overdue`, `today`, `week`, `later`, `done`. Besedilo za `all` je **Vsa opravila**; ostala imena so **Zapadlo**, **Danes**, **Naslednjih 7 dni**, **Pozneje**, **Končano**.
- Pet ločenih številskih elementov ima `aria-label="Število rokov <ključ>"`, kjer je ključ `overdue`, `today`, `week`, `later` ali `done`. Vsebina vsakega je samo številska vrednost; ime skupine je prikazano ločeno.
- Prazno polje: `role="alert"` z besedilom **Vnesi veljaven referenčni datum.**
- Prazna izbrana skupina v nepraznem projektu: **Ni opravil v izbrani skupini.** Kontrole ostanejo dosegljive.
- Ohranimo `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Ne dodajamo dejanj znotraj povezave opravila.
- Uporabimo obstoječe gradnike in slogovne spremenljivke Folio, slovenska besedila in vidni fokus. Pri širini 390 pik ni vodoravnega razširjanja cele strani; preglednica in tabla se lahko pomikata znotraj svojega prikaza. Razporeditev novih kontrol ni predpisana.

## Zahteve in pravila

### Koledarski predikati

Naj bo `T` urejeno zaporedje vseh opravil trenutnega projekta, `r` zadnji veljavni referenčni datum in `day(d)` zaporedna številka koledarskega dne v gregorijanskem koledarju. Računanje ne uporablja lokalne polnoči ali trenutne ure naprave. `δ(t,r) = day(t.dueDate) − day(r)`. `open(t) ⇔ t.status ≠ done`.

Skupina `g(t,r)` je določena izključno tako:

- `done ⇔ t.status = done`, ne glede na `δ`;
- `overdue ⇔ open(t) ∧ δ < 0`;
- `today ⇔ open(t) ∧ δ = 0`;
- `week ⇔ open(t) ∧ 1 ≤ δ ≤ 7`;
- `later ⇔ open(t) ∧ δ > 7`.

Vsako opravilo ima natanko eno skupino. Za vsako skupino `k` je števec `C(k,T,r) = |{t ∈ T : g(t,r) = k}|`, zato je vsota petih števcev `|T|`. Za filter `f` je `V(T,r,f)` izvorno zaporedje `T`, iz katerega odstranimo opravila, ki ne izpolnjujejo `f = all ∨ g(t,r) = f`. Filtriranje ne spreminja `T`, datumov ali statusov. Tabla ohrani obstoječe stolpce stanj in izvorni relativni vrstni red znotraj vsakega stolpca; množica prikazanih ID-jev je enaka preglednici.

### Pravila sprememb stanja

Stanje je `(p, x, r, f, v)`: projekt, besedilo datumskega polja, zadnji veljavni datum, skupina rokov, pogled `table/board`. Začetna konstanta je `r₀ = 2026-09-21`. Opozorilo je prisotno ob `x = ""`; izračun vedno uporablja `r`.

| Dogodek | Naslednje stanje in izid |
| --- | --- |
| Začetek projekta, menjava projekta ali osvežitev | `x := r₀`, `r := r₀`, `f := all`; opozorilo izgine. Pogled sledi obstoječi navigaciji. |
| Vnos veljavnega koledarskega datuma `d` | `x := d`, `r := d`; `f` in `v` ostaneta. Vsi `C` in `V` se takoj preračunajo; opozorila ni. |
| Izpraznitev datumskega polja | `x := ""`; `r`, `f`, `v`, števci in zadnji veljavni preračun ostanejo. Prikaže se zahtevano opozorilo. |
| Izbira skupine `k` | `f := k`; `x`, `r`, `v` in pet števcev ostanejo. `V` se preračuna tudi ob praznem polju z uporabo zadnjega veljavnega `r`. |
| Preklop preglednice/table | Spremeni se samo `v`; `x`, `r`, `f` ostanejo, tudi med opozorilom. Oba prikaza uporabljata iste filtrirane ID-je. |
| Odpiranje ali zapiranje bralnih podrobnosti | Obstoječa navigacija po ID-ju; nova dejanja ne spreminjajo podatkov opravil. |

`x`, `r` in `f` so lokalno stanje trenutnega projekta, brez trajne shrambe in brez zapisa v URL. To ne spreminja obstoječega URL-ja za projekt, pogled in podrobnosti.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsak začetek projekta ima `x = r = 2026-09-21`, `f = all`, ne glede na uro naprave. | S01: začetek pri drugačnem sistemskem datumu; pregled vrednosti in vseh ID-jev. |
| R02 | `done` ima prednost pred rokom in je izključen iz vseh odprtih skupin. | S02: končana opravila z roki pred, na in po referenčnem datumu; preveri ID-je in števce. |
| R03 | Odprta opravila z `δ < 0` so `overdue`, z `δ = 0` so `today`. | S03: roki na prejšnji dan in referenčni dan. |
| R04 | Odprta opravila z `δ ∈ [1,7]` so `week`, z `δ > 7` so `later`; razdelitev je popolna in disjunktna. | S04: odmiki 1, 7, 8; presek skupin je prazen, unija vseh skupin vsebuje vse ID-je. |
| R05 | Koledarska klasifikacija je neodvisna od časovnega pasu in poletnega časa ter deluje čez mesec, leto in prestopni februar. | S05: meje meseca/leta, 2028-02-29, prehod poletnega časa; primerjaj rezultate v različnih časovnih pasovih. |
| R06 | Pet `C` se računa iz celotnega `T` in se ob spremembi `f` ne spremeni. | S06: zabeleži števce ter zaporedoma izberi vseh šest filtrov; vsota ostane `|T|`. |
| R07 | Vsaka vrednost izbirnika vrne `V` v izvornem vrstnem redu brez spreminjanja podatkov. | S07: premešani unikatni ID-ji, podvojeni naslovi, več kot deset opravil; primerjaj natančna zaporedja in podatke. |
| R08 | Veljaven datum preračuna prikaz in ohrani filter; prazen pokaže opozorilo in ohrani zadnji veljavni izračun; veljaven ga odstrani. | S08: veljaven → prazen → veljaven datum ob aktivnem filtru, vmes primerjaj števce in ID-je. |
| R09 | Preglednica in tabla imata enake filtrirane ID-je; preklop ohrani `x`, `r`, `f`. | S09: oba pogleda za vse filtre; preklop ob veljavnem in praznem datumskem polju. |
| R10 | Menjava projekta in osvežitev ponastavita `x`, `r`, `f`; filter ni v trajni shrambi ali URL-ju. | S10: spremenjen datum/filter → drug projekt → vrnitev → osvežitev; pregled shrambe, URL-ja in kode. |
| R11 | Prazen projekt ima pet ničel; prazna skupina nepraznega projekta pokaže točno zahtevano besedilo in omogoči drugo izbiro. | S11: oba prazna projekta ter neprazen projekt s prazno skupino v obeh pogledih, nato vrnitev na `all`. |
| R12 | Veljavni datumi, tudi prestopni, delujejo; ni zapisov na API ali uporabe testnih kontrol; podatki, bralne podrobnosti in prilagodljiv Folio so ohranjeni. | S12: spremljanje zahtev pri novih dejanjih, primerjava podatkov in podrobnosti po ID-ju, skupni regresijski testi, pogled pri 390 pikah in preverjanje oznak/fokusa. |

### Uporabniški scenariji in merilo uspeha

1. Uporabnik odpre projekt, vidi privzeti datum in vsa opravila, nato po števcih izbere skupino. Prikazana opravila ustrezajo predikatom, števci pa ostanejo za celoten projekt (S01–S07).
2. Uporabnik ob aktivni skupini spremeni datum, ga izbriše, preklopi pogled in vnese veljaven datum. Izračun in opozorilo sledita pravilom stanja; preglednica in tabla se ujemata (S08–S09).
3. Uporabnik zamenja projekt ali osveži stran in dobi začetne vrednosti. Pri praznem projektu vidi ničle, pri prazni skupini pa sporočilo ter lahko izbere drugo skupino (S10–S11).
4. Uporabnik uporablja Folio na ozkem zaslonu in odpira podrobnosti opravil. Videz, podatki, dostopnost in bralno delovanje ostanejo ohranjeni (S12).

Uspeh pomeni izpolnitev vseh R01–R12 in dogovora o vmesniku na opisani podatkovni domeni, podprto z dejanskimi preverjanji. Dodatnih funkcionalnosti ali zunanjih meritev ni.

## Izvedba in sledljivost

Stanje ob nastanku specifikacije: implementacija in testi tega koraka niso izvedeni. Spodnje lokacije so izhodiščne povezave za poznejšo izvedbo, ne trditev o obstoječi implementaciji. Po implementaciji se dopolnijo s konkretnimi deli kode, imeni testov in dnevniki.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno stanje | S01 | `src/App.tsx`, `ProjectView` (predvideno) | Ni izvedeno. |
| R02 | Prednost `done` | S02 | Klasifikacija rokov, lokacija bo določena v načrtu | Ni izvedeno. |
| R03 | `δ < 0`, `δ = 0` | S03 | Klasifikacija rokov, lokacija bo določena v načrtu | Ni izvedeno. |
| R04 | Meje 1/7/8 in razdelitev | S04 | Klasifikacija rokov, lokacija bo določena v načrtu | Ni izvedeno. |
| R05 | Koledarski dnevi | S05 | Koledarski izračun, lokacija bo določena v načrtu | Ni izvedeno. |
| R06 | `C` iz celotnega `T` | S06 | `src/App.tsx`, prikaz števcev (predvideno) | Ni izvedeno. |
| R07 | Stabilno filtriranje `V` | S07 | `src/App.tsx`, izbira in vrstice (predvideno) | Ni izvedeno. |
| R08 | Veljaven/prazen vnos | S08 | `src/App.tsx`, stanje in kontrole (predvideno) | Ni izvedeno. |
| R09 | Isti ID-ji in ohranitev stanja | S09 | `src/App.tsx`, vhod za `src/TaskBoard.tsx` (predvideno) | Ni izvedeno. |
| R10 | Ponastavitev in lokalno stanje | S10 | `src/App.tsx`, meja projekta (predvideno) | Ni izvedeno. |
| R11 | Prazni prikazi | S11 | `src/App.tsx`, prikaz prazne skupine (predvideno) | Ni izvedeno. |
| R12 | Bralno delovanje in Folio | S12 | `src/App.tsx`, `src/styles.css`; regresija `src/TaskDetails.tsx` | Ni izvedeno. |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Pot funkcionalnosti `docs/agent/P08` je podal uporabnik. Oznaka možnosti `all` je izbrana znotraj dovoljenega prostega besedila. Izvorni vrstni red na tabli pomeni ohranitev relativnega vrstnega reda znotraj obstoječih stolpcev stanj; zahtevana enakost med pogledoma je enakost ID-jev.

Neveljavni datumi podatkov so zunaj podane domene. Za datumski vnos je izrecno zahtevan prazen vnos; ne uvajamo novih načinov vnosa ali dodatnih zapisovalnih API-jev. Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Strežnik, infrastruktura, odvisnosti, skupni tipi in testi ostanejo nespremenjeni. Testne kontrole smejo uporabljati samo testi.

Vsi izvedbeni scenariji so za zdaj nepreverjeni. Končni testi niso dostopni in jih ne smemo navesti kot opravljene. Dejanske omejitve preverjanja se dopolnijo ob izvedbi.

## Zgodovina sprememb

- 2026-09-25, v1.0: začetna specifikacija vseh R01–R12 po skupni predlogi; zapisani koledarski predikati, prehodi stanja in načrtovani scenariji. Brez implementacije in izvedenih testov.
