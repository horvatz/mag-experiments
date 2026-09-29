# P05 — Straničenje in filter stanja

Različica 1.0 · 2026-09-22 · postopek C · faza: specifikacija

## Problem in kontekst

Uporabnik želi pregledovati zaporedne odseke opravil izbranega projekta in jih omejiti na izbrano stanje. Folio trenutno prikazuje vsa opravila iz javnega API-ja v preglednici ali tabli, omogoča menjavo projekta in podrobnosti opravila. Dodamo lokalno straničenje in filter, pri čemer ohranimo slovenski vmesnik, podatke, povezave, dostopnost in [potrjeni dizajn](../../dizajn.md).

Merilo so [izvorne zahteve R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument pokriva razdelke [skupne predloge](../../../task/specification-template.md). Izvedbena sledljivost se dopolni po implementaciji; navedeni scenariji še niso dokaz uspeha.

## Vhodi, dejanja in izidi

- Projekt: `id`, `name`. Opravilo: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; tipi ostanejo obstoječi. `status` je `todo`, `in_progress` ali `done`.
- Vir je urejeno polje opravil obstoječega `/api/projects/:id/tasks`; projekti in podrobnosti uporabljajo obstoječa javna API-ja. Izbira in povezave temeljijo na `id`. Vrstni red polja se ne razvršča ali drugače spreminja.
- Domena vključuje prazne projekte, eno opravilo in poljubno večje število opravil, enkratne ID-je, enake naslove, Unicode in ločila v navadnem besedilu ter veljavne koledarske datume. Opravilo pripada svojemu projektu. Ni predpostavke o vrednostih ID-jev, naslovih ali začetnem zaporedju.
- HTML `select` z dostopnim imenom **Velikost strani** ima vrednosti `all`, `2`, `5`, `10`; **Filter strani** ima `all`, `todo`, `in_progress`, `done`.
- Gumbi imajo imena **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**. Uspešen premik spremeni samo trenutno stran. Onemogočen premik ne spremeni stanja.
- Sprememba velikosti ali filtra vrne na prvo stran. Preklop Preglednica/Tabla ter odpiranje in zapiranje podrobnosti (tudi preklic z Escape) ohranijo velikost, filter in stran. Menjava projekta in osvežitev dokumenta povrneta privzeto stanje.
- Operacije straničenja in filtra so lokalne, brez shranjevanja ali zapisov na API, zato nimajo novega potrditvenega ali preklicnega toka. Obstoječi prikazi nalaganja, napake, ponovnega poskusa in napak podrobnosti ostanejo uporabni; ne uvajamo novih pravil sočasnosti.
- Status je element `role="status"`, `aria-label="Stanje straničenja"`, z natančnim besedilom spodaj. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj njegove povezave.

## Zahteve in pravila

### Model in predikati

`T` je celotno urejeno polje opravil projekta, `f ∈ {all,todo,in_progress,done}` filter, `s ∈ {all,2,5,10}` velikost in `p` zahtevana stran, šteta od 1. `F = [t ∈ T | f = all ∨ t.status = f]` je stabilno filtrirano polje; `N = |F|`.

Število strani je `Y = 0`, če `N = 0`; sicer `Y = 1` za `s = all`, drugače `Y = ceil(N/s)`. Za neprazen rezultat velja `1 ≤ p ≤ Y`. Za prazen rezultat je notranja začetna stran lahko 1, prikazana stran pa je vedno `X = 0`; sicer `X = p`.

Trenutni odsek `V` je prazen pri `N = 0`, enak `F` pri `s = all`, sicer `F[(p−1)s : min(ps,N)]` (rez po indeksih od 0, desna meja izključena). Za neprazen rezultat sta `A = 1`, `B = N` pri `all`, sicer `A = (p−1)s+1`, `B = min(ps,N)`. Za prazen rezultat sta `A = B = 0`.

- Za vse strani končnega filtriranega polja velja `concat(V₁,…,Vᵧ) = F`; množice ID-jev različnih strani so disjunktne. To zagotavlja ohranitev vrstnega reda brez izgubljenih ali podvojenih ID-jev.
- Preglednica prikazuje `V` v njegovem vrstnem redu. Tabla za vsako stanje `q` prikaže `[t ∈ V | t.status = q]`; množica njenih ID-jev je enaka množici ID-jev preglednice, z enako številčnostjo. Združevanje v stolpce ne pomeni enakega globalnega vrstnega reda DOM kot pri preglednici.
- Pregled stanj: `summary(q) = |[t ∈ T | t.status = q]|`. Števec stolpca: `column(q) = |[t ∈ V | t.status = q]|`. Skupno število opravil ostane `|T|`.
- Začetek, menjava projekta in osvežitev: `(s,f,p) ← (all,all,1)`.
- Sprememba velikosti na `s′`: `(s,f,p) ← (s′,f,1)`; sprememba filtra na `f′`: `(s,f,p) ← (s,f′,1)`, tudi ob odstranitvi filtra.
- Preklop pogleda, odprtje/zaprtje podrobnosti: `(s,f,p)′ = (s,f,p)`.
- Pri `N > 0`: Prva/Prejšnja sta omogočena natanko pri `p > 1`, Naslednja/Zadnja pri `p < Y`. Njihovi cilji so `1`, `p−1`, `p+1`, `Y`. Pri `N = 0` so vsi štirje onemogočeni. Onemogočeno dejanje je identiteta stanja.
- Status: `Stran X od Y. Prikazano A–B od N.` z dejanskimi številkami in pomišljajem `–`. Prazen rezultat: `Stran 0 od 0. Prikazano 0–0 od 0.`

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku `s=all`, `f=all`; vidni so vsi ID-ji iz `T` v izvornem vrstnem redu preglednice. | S01: začetna izbira, ID-ji in status za različna polja. |
| R02 | Velikosti 2/5/10 izvajajo rez `V`; vsi odseki sestavijo `F` brez podvajanja ali izgube. Zadnji je lahko krajši. | S02: prehod čez vse strani pri vsaki velikosti, primerjava zaporedja ID-jev. |
| R03 | Štirje premiki sledijo ciljem in pogojem omogočenosti iz modela; robna dejanja so onemogočena in ohranijo stanje. | S03: prvi, vmesni in zadnji odsek, preverjanje vseh gumbov. |
| R04 | Vsaka sprememba velikosti vrne `p=1`, tudi če je stara številka še veljavna; `all` ima pri `N>0` eno stran. | S04: sprememba z druge strani v velikost, ki še dopušča drugo stran, nato v all. |
| R05 | Filter deluje pred rezom, ohrani relativni vrstni red in ob spremembi postavi `p=1`. | S05: vsi filtri na prepletenih stanjih, sprememba z višje strani. |
| R06 | Preglednica in tabla kažeta enake ID-je `V`; tabla združuje samo trenutni odsek po stanju. | S06: primerjava ID-jev obeh pogledov na filtrirani in nefiltrirani višji strani. |
| R07 | Menjava pogleda in odprtje/zaprtje podrobnosti ohranita `(s,f,p)`. | S07: oba pogleda, pravilen ID v podrobnostih, zaprtje z gumbom in Escape. |
| R08 | Menjava projekta in osvežitev vrneta `(all,all,1)`. Nova stanja se ne hranijo v URL-ju ali trajni shrambi. | S08: menjava in vrnitev med projektoma, osvežitev, pregled URL-ja in kode shranjevanja. |
| R09 | Neprazen status je natančno `Stran X od Y. Prikazano A–B od N.`, z indeksi od 1 in filtriranim N. | S09: all, srednja/zadnja stran, krajši odsek in filter. |
| R10 | Prazen projekt ali filter ima natančen ničelni status in štiri onemogočene gumbe; odstranitev filtra vrne prvo stran. | S10: prazen projekt in neujemajoči filter nepraznega projekta, nato all. |
| R11 | Povzetek stanj in skupno število štejeta `T`; stolpci štejejo samo prikazane ID-je `V`. | S11: primerjava števcev pred/po filtriranju in premikih po tabli. |
| R12 | Straničenje/filtriranje ne mutira opravil ali zapisuje na API. Obstoječa navigacija, ID-ji, podrobnosti, nalaganje in prilagodljivi Folio ostanejo uporabni. | S12: nadzor zapisovalnih zahtev, primerjava podatkov, skupni regresijski testi, tipkovnica in širina 390 pik. |

### Uporabniški scenariji in merilo uspeha

1. Uporabnik odpre projekt, vidi celoten seznam, izbere velikost 2/5/10 in prehodi vse strani v obe smeri. Primer s 13 opravili preveri tudi velikost 10 in krajšo zadnjo stran; to je testni primer, ne omejitev domene (S01–S04, S09).
2. Uporabnik na višji strani izbere stanje, primerja preglednico s tablo ter odpre in zapre opravilo. Filter se uporabi pred rezom, sprememba filtra ponastavi stran, pogledi in podrobnosti pa ohranijo stanje. Povzetek ostane za celoten projekt (S05–S07, S11).
3. Uporabnik izbere stanje brez zadetkov, odstrani filter, nato zamenja projekt in osveži stran. Ničelni prikaz in ponastavitve sledijo modelu; prazna projekta sta dovoljena (S08, S10).
4. Uporabnik opravlja ista dejanja na ozkem zaslonu in s tipkovnico. Fokus ostane viden; pri 390 pikah se celotna stran ne razširi, preglednica in tabla pa smeta imeti notranje drsenje. Med lokalnimi dejanji ni zapisov na API (S12).

Uspeh pomeni izpolnitev vseh R01–R12 in pogodbe vmesnika, preverjeno s skupnimi in namenskimi testi. Ne uvajamo zunanjih meritev ali dodatnih funkcionalnosti. Razvojni D01–D04 so le del dokazov, ne celoten obseg.

## Izvedba in sledljivost

Spodaj so scenariji in obstoječe točke za poznejšo izvedbo, ne trditev, da je funkcionalnost že zgrajena. Po implementaciji se dopolnijo dejanska imena testov, deli kode in povezave na dnevnike. Skupni in razvojni testi ostanejo nespremenjeni; dodatni sodijo v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto celotno polje | S01 | `src/App.tsx`: ProjectView, bodoče stanje in odsek | Ni izvedeno. |
| R02 | Disjunktni zaporedni odseki | S02; razvojni D01 delno | `src/App.tsx`: bodoči izračun trenutnega odseka | Ni izvedeno. |
| R03 | Cilji in robovi | S03; D01/D02 delno | `src/App.tsx`: bodoči gumbi premikov | Ni izvedeno. |
| R04 | Velikost ponastavi stran | S04; D04 delno | `src/App.tsx`: bodoča sprememba velikosti | Ni izvedeno. |
| R05 | Stabilni filter pred rezom | S05; D03 delno | `src/App.tsx`: bodoči filter | Ni izvedeno. |
| R06 | Isti odsek obeh pogledov | S06; D03 delno | `src/App.tsx`: podatki pogledov; `src/TaskBoard.tsx`: stolpci | Ni izvedeno. |
| R07 | Ohranjanje lokalnega stanja | S07 | `src/App.tsx`: ProjectView; obstoječa navigacija in TaskDetails | Ni izvedeno. |
| R08 | Ponastavitev projekta/osvežitve | S08 | `src/App.tsx`: ProjectView z `key={project.id}`, bodoče lokalno stanje | Ni izvedeno. |
| R09 | Natančen neprazen status | S09; D02 delno | `src/App.tsx`: bodoči status | Ni izvedeno. |
| R10 | Ničelni prikaz | S10 | `src/App.tsx`: bodoči prazen odsek, status in gumbi | Ni izvedeno. |
| R11 | Pravilna osnova števcev | S11 | `src/App.tsx`: counts in count-badge; `src/TaskBoard.tsx`: column-count | Ni izvedeno. |
| R12 | Brez zapisov in regresij | S12; D04 delno; baseline/api | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`; obstoječi API/podrobnosti | Ni izvedeno. |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni: pot dokumentov je določena, dovoljena lokalna pojasnila izhajajo iz izvornih zahtev. Besedilo opcij poleg predpisanih vrednosti in razpored novih kontrol se prilagodita obstoječemu Foliu. Prva notranja stran 1 pri praznem rezultatu je pojasnilo modela, ne vidna dodatna zahteva; prikaz je vedno 0 od 0.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne razširjamo čez obstoječe regresijske zahteve. Obstoječi URL pogleda/podrobnosti ostane dovoljen; v URL ne sodijo nova stran, velikost ali filter. Strežnik, infrastruktura, odvisnosti, skupni tipi, skupni testi in uradne predloge ostanejo nespremenjeni. Testne kontrole sme uporabljati samo testni program.

V tej fazi niso bili izvedeni testi funkcionalnosti; končni skriti testi niso dostopni in niso opravljeni. Dokazi o izvedbi sledijo v poznejših fazah.

## Zgodovina sprememb

- 2026-09-22, 1.0: začetna specifikacija vseh R01–R12, pogodbe vmesnika, predikatov, scenarijev in začetne sledljivosti; brez implementacije.
