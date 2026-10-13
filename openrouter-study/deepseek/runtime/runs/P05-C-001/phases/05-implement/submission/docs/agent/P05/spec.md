# P05: Straničenje in filter stanja — razvojna specifikacija

- Izvor zahtev: `task/instructions.md` (različica 1.0)
- Skupna predloga: `task/specification-template.md`
- Potrjeni videz: `docs/dizajn.md` (Folio)
- Ustava: `.specify/memory/constitution.md`

## Problem in kontekst

Uporabnik v projektu vidi opravila v preglednici ali tabli. Pri projektih z veliko opravili je seznam nepregleden, zato potrebuje straničenje z izbiro velikosti strani in filtriranje po stanju opravila. Začetna aplikacija Folio teh kontrol še nima: prikazuje vsa opravila v izvornem vrstnem redu, povzetek stanj nad celotnim projektom in preklop pogleda.

Predvidena sprememba: v pogled projekta se dodajo izbira velikosti strani (all/2/5/10), filter stanja (all/todo/in_progress/done), navigacijski gumbi (Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran) in status straničenja. Preglednica in tabla prikazujeta isti odsek trenutne strani. Podatki se še naprej berejo prek javnega API-ja `/api/`; funkcionalnost ne shranjuje stanja v trajno shrambo ali URL in ne pošilja zapisov.

## Vhodi, dejanja in izidi

**Podatki (nespremenjeni iz izhodišča):** opravilo ima `id`, `title`, `description`, `status` (todo | in_progress | done), `assignee`, `dueDate`, `projectId`; projekt ima `id` in `name`. Testi lahko vrnejo poljubno število opravil (tudi nič, eno ali več kot deset), različno zaporedje in enake naslove; imena odgovornih so neprazna in različna od `all`.

**Stanje straničenja (lokalno trenutnemu projektu):**

- `f` filter: all | todo | in_progress | done, privzeto all;
- `s` velikost strani: all | 2 | 5 | 10, privzeto all;
- `p` stran (1-indeksirana); `T` filtrirano polje opravil v izvornem vrstnem redu; `N = |T|`; `Y` število strani.

**Dejanja in stanje po uspehu:**

| Dejanje | Učinek |
| --- | --- |
| izbira velikosti `s'` | `s := s'`, `p := 1` (R04) |
| izbira filtra `f'` | `f := f'`, `p := 1`; vrstni red `T` se ne spremeni (R05) |
| Prva/Prejšnja/Naslednja/Zadnja stran | `p := 1 / p−1 / p+1 / Y` le, če je cilj veljaven; sicer gumb onemogočen in stanje nespremenjeno (R03) |
| preklop pogleda, odprtje/zaprtje podrobnosti | `s`, `f`, `p` nespremenjeni (R07) |
| menjava projekta, osvežitev podatkov | `s := all`, `f := all`, `p := 1` (R08) |
| napaka nalaganja | prikaz napake z možnostjo ponovnega nalaganja; stanje straničenja se ne shranjuje (R08, R12) |

**Uporabniški scenariji:**

1. Privzeto: projekt z osmimi opravili pokaže vsa v izvornem vrstnem redu, status `Stran 1 od 1. Prikazano 1–8 od 8.`
2. Velikost 5: prvih pet opravil, `Stran 1 od 2. Prikazano 1–5 od 8.`; Naslednja stran pokaže zadnje tri (`Stran 2 od 2. Prikazano 6–8 od 8.`).
3. Rob: na prvi strani sta Prva stran in Prejšnja stran onemogočeni; na zadnji Naslednja stran in Zadnja stran.
4. Filter: `V delu` omeji polje pred straničenjem in vrne na prvo stran; `all` spet pokaže vsa opravila.
5. Prazen rezultat: `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi onemogočeni; odstranitev filtra vrne prvo stran.
6. Tabla: preklop ohrani stran, velikost in filter; stolpci združujejo samo opravila trenutne strani.
7. Menjava projekta: stanje se ponastavi na all/all/1.

**Merila uspeha:** vsaka zahteva R01–R12 ima izveden test ali scenarij z opazljivim izidom; skupni in lastni testi P05 uspejo; pri širini 390 pik se stran ne razširi. Merila ne uvajajo zunanjih meritev.

## Zahteve in pravila

Splošna pravila so zapisana s predikati; posamezni testni primeri jih konkretizirajo in niso dodatne zahteve. Simboli: `T` filtrirano polje, `N = |T|`, `s` velikost strani, `p` stran, `Y` število strani, `A`/`B` prikazana indeksa (1-indeksirana, vključujoča), `S(i)` odsek strani `i` z zaporednimi, neprekrivajočimi se indeksi dolžine največ `s`. Zapis `x := v` pomeni dodelitev ob dejanju; ob neveljavnem dejanju se stanje ne spremeni.

- `Y = 0`, če `N = 0`; sicer `Y = 1`, če `s = all`, in `Y = ⌈N / s⌉` drugače.
- `A = (p−1)·s + 1` in `B = min(p·s, N)` za `s ≠ all`; za `s = all` je `A = 1`, `B = N` (ko `N > 0`).
- Pri `N = 0` sta prikazana stran 0 in `Y = 0` (R10).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob odprtju projekta velja `s := all`, `f := all`, `p := 1`; prikazana so vsa opravila projekta v izvornem vrstnem redu (`T` = vsa opravila, `S(1) = T`). | Test: privzeti vrednosti obeh selectov in vrstni red vrstic/kartic enak vrstnemu redu odgovora API-ja. |
| R02 | Za `s ∈ {2, 5, 10}`: `S(1) ∪ … ∪ S(Y) = T` in `S(i) ∩ S(j) = ∅` za `i ≠ j`; vsak `id` se pojavi natanko enkrat; `|S(Y)| ≤ s`. | Test: za polja z 0, 1, 7 in 12 opravili preveri particijo ter odsotnost podvojenih in izgubljenih ID-jev. |
| R03 | Prva stran: `p := 1`; Prejšnja: `p := p−1`; Naslednja: `p := p+1`; Zadnja: `p := Y`. Dejanje se izvede le, če je ciljni `p` veljaven (`1 ≤ p ≤ Y`); sicer je gumb onemogočen in stanje nespremenjeno. | Test: kliki na robovih in v sredini; primerjava stanja pred neveljavnim dejanjem in po njem. |
| R04 | Ob `s := s'` velja `p := 1`, tudi če je prejšnji `p` še veljaven; če `s' = all` in `N > 0`, je `Y = 1`; če `N = 0`, je `Y = 0`. | Test: menjava velikosti z druge strani in z `all`; preverjanje `p = 1` in `Y`. |
| R05 | `T = { t | f = all ∨ t.status = f }` in vrstni red `T` je enak izvornemu; ob `f := f'` velja `p := 1`. | Test: vsi štirje filtri; preverjanje vrstnega reda ujemajočih se opravil in vrnitve na prvo stran. |
| R06 | Preglednica in tabla prikazujeta isto množico ID-jev `S(p)`; tabla združi `S(p)` v stolpce in ne straniči vsakega stolpca posebej. | Test: primerjava `data-task-id` med pogledoma za isto stran in filter. |
| R07 | Preklop pogleda ter odprtje in zaprtje podrobnosti ohranijo `s`, `f`, `p`. | Test: nastavi stran, velikost in filter, preklopi pogled in odpri/zapri podrobnosti; stanje ostane nespremenjeno. |
| R08 | Menjava projekta ali osvežitev podatkov: `s := all`, `f := all`, `p := 1`. Stanje se ne zapiše v trajno shrambo ali URL. | Test: menjava projekta in ponovno nalaganje; pregled `localStorage`, `sessionStorage` in URL-ja. |
| R09 | Če `N > 0`: status (element `role=status`, `aria-label="Stanje straničenja"`) vsebuje `Stran ${p} od ${Y}.` in `Prikazano ${A}–${B} od ${N}.` s pomišljajem – med indeksoma. | Test: branje besedila in atributov statusa za več strani. |
| R10 | Če `N = 0` (prazen projekt ali filter brez zadetkov): status vsebuje `Stran 0 od 0.` in `Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni; ob odstranitvi filtra velja spet `p := 1` in veljaven prikaz. | Test: prazen projekt in filter brez zadetkov; preverjanje besedila, gumbov in ponovnega prikaza. |
| R11 | Pregled stanj (`aria-label="Pregled stanj opravil"`) šteje celoten nefiltrirani projekt; števci stolpcev table štejejo opravila `S(p)`; skupno število opravil projekta se zaradi straničenja ne spremeni. | Test: primerjava povzetka, števcev stolpcev in skupnega števila pri različnih straneh in filtrih. |
| R12 | Straničenje ne spreminja podatkov in ne pošilja zapisov; uporabljene so samo povezave `/api/` z metodo GET. Obstoječe povezave, pravilni `id`, `data-task-id`, podrobnosti, nalaganje in videz Folio ostanejo uporabni; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik se cela stran ne razširi (notranje drsenje je dovoljeno). | Test: opazovanje omrežnih zahtev med straničenjem; regresijski testi povezav, podrobnosti in videza; preverjanje širine 390 pik. |

**Dogovor o vmesniku (iz navodil):** select Velikost strani z vrednostmi all/2/5/10; select Filter strani z vrednostmi all/todo/in_progress/done; gumbi Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran; element `role=status` z `aria-label="Stanje straničenja"`; ohranjeni `data-task-id`, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Povezava zahteva → pogoj → test → koda. Izvedeno 2026-10-09; podrobni dokazi, imena testov in omejitve so v `docs/agent/verification.md` (vsebine ne podvajamo).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto all/all, izvorni vrstni red | tests/agent/p05-pagination.spec.ts:6 | src/App.tsx | uspešno (13/13 agent testov) |
| R02 | particija polja pri 2/5/10 | tests/agent/p05-pagination.spec.ts:16 | src/App.tsx | uspešno |
| R03 | veljavnost dejanj na robovih | tests/agent/p05-pagination.spec.ts:36 | src/App.tsx, src/Pagination.tsx | uspešno |
| R04 | sprememba velikosti vrne na prvo stran | tests/agent/p05-pagination.spec.ts:60 | src/App.tsx | uspešno |
| R05 | filter pred straničenjem, vrstni red | tests/agent/p05-pagination.spec.ts:75 | src/App.tsx | uspešno |
| R06 | ista množica ID-jev v obeh pogledih | tests/agent/p05-pagination.spec.ts:90 | src/App.tsx, src/TaskBoard.tsx | uspešno |
| R07 | ohranitev stanja ob preklopu in podrobnostih | tests/agent/p05-pagination.spec.ts:103 | src/App.tsx | uspešno |
| R08 | ponastavitev ob menjavi projekta in osvežitvi | tests/agent/p05-pagination.spec.ts:117 | src/App.tsx | uspešno |
| R09 | besedilo statusa za neprazen rezultat | tests/agent/p05-pagination.spec.ts:135 | src/App.tsx, src/Pagination.tsx | uspešno |
| R10 | besedilo in gumbi za prazen rezultat | tests/agent/p05-pagination.spec.ts:141,157 | src/App.tsx, src/Pagination.tsx | uspešno |
| R11 | povzetek in števci stolpcev | tests/agent/p05-pagination.spec.ts:166 | src/App.tsx, src/TaskBoard.tsx | uspešno |
| R12 | brez zapisov, obstoječe povezave in videz | tests/agent/p05-pagination.spec.ts:184, skupni testi | src/App.tsx, src/styles.css | uspešno (59/59 v npm run check) |

Zgodovina sprememb: 1.0.0 (2026-10-09) — začetna specifikacija za R01–R12; 1.0.1 (2026-10-09) — izpolnjena sledljivost po izvedbi (dokazi v `docs/agent/verification.md`).

## Odprta vprašanja in omejitve

- Zapis statusa iz navodil vsebuje oba stavka (`Stran X od Y.` in `Prikazano A–B od N.`); ločila in razporeditev zunaj predpisanega besedila niso določena, zato jih specifikacija ne predpisuje.
- Ob nezaključenem nalaganju in novih sočasnih spremembah podatkov brez osvežitve se obseg ne širi prek obstoječih regresijskih zahtev.
- Končni (skriti) testi in njihovi podatki niso dostopni; razvojni primeri niso celoten obseg. Dokazi bodo izključno iz dejansko izvedenih skupnih in lastnih testov.
- Skladnost z ustavo: spremembe ostajajo v `src/`, `tests/agent/` in `docs/agent/`; brez novih odvisnosti, zapisovalnih API-jev in trajne shrambe.
