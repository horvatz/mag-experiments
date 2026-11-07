# Specifikacija P05: Straničenje in filter stanja

**Feature directory**: `docs/agent/P05` | **Datum**: 2026-10-30 | **Vir zahtev**: `task/instructions.md` (R01–R12) | **Predloga**: `task/specification-template.md` | **Ustava**: `.specify/memory/constitution.md`

## Problem in kontekst

Uporabnik v aplikaciji Folio pregleduje opravila dveh projektov v preglednici ali na tabli. Začetno delovanje prikaže vsa opravila izbranega projekta naenkrat, brez filtra stanja in brez straničenja; preglednica in tabla prikazujeta iste elemente, podrobnosti se odpirajo ob opravilu.

Predvidena sprememba doda velikost strani (all/2/5/10), filter stanja (all/todo/in_progress/done), gumbe Prva stran, Prejšnja stran, Naslednja stran in Zadnja stran ter element `role=status` z `aria-label="Stanje straničenja"` in natančnim besedilom iz R09/R10. Potrjeni videz Folio ostane; stanje straničenja je lokalno trenutnemu projektu in se ne hrani trajno.

## Vhodi, dejanja in izidi

**Podatki**: `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`, `TaskStatus = todo | in_progress | done`. Vsi podatki se berejo iz javnega vmesnika `/api/`; straničenje in filtriranje uporabljata le `id`, `status` in vrstni red iz odgovora. Polja se ne spreminjajo.

**Dejanja in izidi**:

| Dejanje | Pogoji | Izid |
| --- | --- | --- |
| Sprememba velikosti strani (select: all/2/5/10) | vedno dovoljeno | `s := s2`, `p := 1`, ponovno izračunani `F`, `Y`, `S` (R04) |
| Sprememba filtra (select: all/todo/in_progress/done) | vedno dovoljeno | `f := f2`, `p := 1`, `F` je podzaporedje `T` (R05) |
| Prva stran | omogočeno, ko `p > 1` in `N > 0` | `p := 1` |
| Prejšnja stran | omogočeno, ko `p > 1` in `N > 0` | `p := p − 1` |
| Naslednja stran | omogočeno, ko `p < Y` in `N > 0` | `p := p + 1` |
| Zadnja stran | omogočeno, ko `p < Y` in `N > 0` | `p := Y` |
| Klik na onemogočen gumb | rob: `p = 1`, `p = Y` ali `N = 0` | stanje se ne spremeni |
| Preklop pogleda tabla/preglednica | vedno | `(s, f, p)` nespremenjeni (R07) |
| Odpiranje/zapiranje podrobnosti | vedno | `(s, f, p)` nespremenjeni (R07) |
| Menjava projekta | vedno | `(s, f, p) := (all, all, 1)` (R08) |
| Osvežitev strani | vedno | `(s, f, p) := (all, all, 1)` (R08) |

**Napake in robnice**: prazen projekt ali prazen rezultat filtra da `N = 0`; besedilo statusa in onemogočeni gumbi po R10. Neveljavno dejanje na robu ne spremeni stanja. Napake nalaganja in delo med nezaključenim nalaganjem ostanejo omejeni na obstoječe regresijske zahteve (glej Odprta vprašanja).

## Zahteve in pravila

**Simboli**: `T` = opravila trenutnega projekta v izvornem vrstnem redu odgovora; `f` = filter stanja; `F(f) = T` pri `f = all`, sicer `[t v T : t.status = f]`; `N = |F|`; `s` = velikost strani (`all`, 2, 5, 10); `p` = trenutna stran (1-osnovna); `Y(s) = 1`, če `s = all` in `N > 0`; `Y(s) = 0`, če `N = 0`; sicer `ceil(N / s)`; `S(s, p)` = zaporedni odsek `F`: pri `s = all` kar `F` (ena stran), pri `N = 0` prazen, sicer elementi `F[(p − 1)·s … min(p·s, N) − 1]`; `A = (p − 1)·s + 1` oziroma 1 pri `s = all`; `B = min(p·s, N)` oziroma `N` pri `s = all`; pri `N = 0` je prikaz `Stran 0 od 0` in `0–0 od 0`. Vsi simboli opisujejo stanje seje v trenutnem projektu.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno stanje je `s = all`, `f = all`, `p = 1`; prikazano je `S = T` v izvornem vrstnem redu; vsak `t v T` je viden natanko enkrat. | Odprtje projekta z n ≥ 1 opravili; primerjava vrstnega reda z odgovorom API. |
| R02 | Za `s v {2, 5, 10}`: `S(s, 1) … S(s, Y)` so zaporedni, paroma neprekrivajoči se odseki `F`; velja `S(s, 1) ∪ … ∪ S(s, Y) = F`; noben id se ne izgubi ali podvoji; zadnja stran je lahko krajša. | Za vsako velikost prehod čez vse strani; množica id-jev in vrstni red na vsaki strani. |
| R03 | Gumbi Prva/Prejšnja/Naslednja/Zadnja vodijo na `1`, `p − 1`, `p + 1`, `Y`; na robu (`p = 1` ali `p = Y` ali `N = 0`) je neveljavno dejanje onemogočeno in ne spremeni `(s, f, p)`. | Klik na vsak gumb v notranjosti in na obeh robovih; primerjava stanja pred in po. |
| R04 | Sprememba velikosti strani `s -> s2` vedno postavi `p := 1`, tudi če bi bila prejšnja številka še veljavna; `s = all` pomeni eno stran pri `N > 0` (`Y = 1`). | Zamenjava velikosti iz srednje strani; preverjanje `p = 1`, `Y`, prikaza. |
| R05 | Filter se uporabi pred straničenjem: `F(f2)` je podzaporedje `T` (vrstni red ujemajočih se opravil nespremenjen); sprememba filtra postavi `p := 1`. | Prehod all -> todo -> in_progress -> done -> all; id-ji in vrstni red. |
| R06 | Preglednica in tabla kažeta iste id-je trenutne strani `S`; tabla združi v stolpce šele ta odsek; noben stolpec ni straničen ločeno. | Primerjava id-jev med pogledoma na vsaki strani; stolpci table vsebujejo le `S`. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `s`, `f` in `p` (ter `S`). | Zabeleženo stanje pred in po dejanju v obeh pogledih. |
| R08 | Menjava projekta in osvežitev postavita `s = all`, `f = all`, `p = 1`; stanje se ne hrani v trajni shrambi ali URL-ju. | Menjava projekta in ponovno nalaganje; pregled URL-ja in shrambe. |
| R09 | Pri `N > 0` status vsebuje natančen niz `Stran p od Y. Prikazano A–B od N.`, kjer sta `A`/`B` indeksa z začetkom 1 in `N = |F|`. | Branje besedila elementa `role=status` za vsako stran in velikost. |
| R10 | Pri `N = 0` (prazen projekt ali prazen rezultat filtra) status vsebuje `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi za premik so onemogočeni; ob odstranitvi filtra je spet prva stran (`p = 1`). | Prazen projekt in filtriranje na prazen rezultat; stanje gumbov, besedilo, odstranitev filtra. |
| R11 | Pregled stanj opravil šteje celoten nefiltrirani projekt `T`; števci stolpcev table štejejo prikazana opravila trenutne strani `S`; skupno število opravil se zaradi straničenja ne spremeni. | Primerjava števcev pred/po straničenju in ob filtrih; števci stolpcev table po straneh. |
| R12 | Straničenje ne spreminja podatkov in ne pošilja zapisov na API; obstoječe povezave, pravilni id-ji (`data-task-id`), podrobnosti, nalaganje in prilagodljiv videz Folio ostanejo uporabni. | Nadzor omrežnih klicev med straničenjem; regresijski scenariji povezav, id-jev, podrobnosti in videza. |

**Dogovor o vmesniku**: select Velikost strani (all/2/5/10) in Filter strani (all/todo/in_progress/done); gumbi Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran; element `role=status` z `aria-label="Stanje straničenja"` in pomišljajem – med indeksoma; ohranjeni `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik se cela stran ne razširi, notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Izvedeno 2026-10-30: koda in lastni testi so napisani; izidi so iz dejanskih zagonov (`npm run check`: lint, typecheck, build, 59/59; podrobnosti v `docs/agent/verification.md`). Neizvedenih preverjanj ni.

| Zahteva | Pogoj | Test ali scenarij (načrtovan v `tests/agent/`) | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeto stanje in izvorni vrstni red | agent: R01: privzeto stanje all/all in izvorni vrstni red | `src/App.tsx` (privzeto stanje), `src/pagination.ts` | uspešno |
| R02 | Odseki brez izgube/podvajanja id-jev | agent: R02: strani 2/5/10 so zaporedni odseki | `src/pagination.ts` (`paginate`) | uspešno |
| R03 | Robovi in onemogočeni gumbi | agent: R03: navigacija in robovi | `src/PaginationControls.tsx`, `src/App.tsx` | uspešno |
| R04 | Sprememba velikosti vrne na prvo stran; all = ena stran | agent: R04: sprememba velikosti vedno vrne na prvo stran | `src/App.tsx` (sprememba velikosti) | uspešno |
| R05 | Filter pred straničenjem in vrstni red | agent: R05: filter pred straničenjem in vrnitev na prvo stran | `src/pagination.ts` (`filterTasks`), `src/App.tsx` | uspešno |
| R06 | Skladnost preglednice in table | agent: R06: preglednica in tabla kažeta isti odsek | `src/App.tsx` (odsek v oba pogleda), `src/TaskBoard.tsx` | uspešno |
| R07 | Ohranitev stanja ob preklopu in podrobnostih | agent: R07: preklop pogleda in podrobnosti ohranijo stanje | stanje v `ProjectView` (`src/App.tsx`) | uspešno |
| R08 | Ponastavitev ob menjavi projekta in osvežitvi | agent: R08: menjava projekta in osvežitev ponastavita stanje | `key={project.id}`, privzeto stanje | uspešno |
| R09 | Natančno besedilo statusa pri N > 0 | agent: R09: besedilo statusa pri nepraznem rezultatu | `src/pagination.ts` (`statusText`) | uspešno |
| R10 | Natančno besedilo in gumbi pri N = 0 | agent: R10a: prazen projekt; R10b: prazen rezultat filtra | `src/pagination.ts`, `src/PaginationControls.tsx` | uspešno |
| R11 | Števci pregleda in stolpcev table | agent: R11: pregled stanj in števci stolpcev | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno |
| R12 | Brez zapisov na API; obstoječe delovanje | agent: R12: brez zapisov, povezave in podrobnosti; regresija baseline/api 38/38 | `src/App.tsx`, `src/styles.css`; `src/api.ts` nespremenjen | uspešno |

## Odprta vprašanja in omejitve

- Med nezaključenim nalaganjem in ob sočasnih spremembah podatkov brez osvežitve ne dodajamo novih pravil; veljajo obstoječe regresijske zahteve.
- Razporeditev novih kontrol in besedilo, ki ni izrecno določeno zgoraj, nista predpisana.
- Testi lahko vrnejo poljubno število opravil (0, 1, več kot 10), enake naslove, različno zaporedje in veljavne datume; projekta sta lahko prazna. Pravila zato veljajo za poljuben `N`, ne le za razvojne primere.
- Stanje je lokalno trenutnemu projektu, brez trajne shrambe in brez URL-ja; novih zapisovalnih API-jev ni.
- Končni testi niso na voljo; nedostopnih ali neizvedenih testov se ne navaja kot opravljenih.
