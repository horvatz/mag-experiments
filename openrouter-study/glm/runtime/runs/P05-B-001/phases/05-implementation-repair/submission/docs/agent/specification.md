# Specifikacija P05: Straničenje in filter stanja

## Problem in kontekst

Uporabnik želi nadzorovati, koliko opravil je naenkrat vidnih, in si ogledati le določeno stanje, ne da bi izgubil izvorni vrstni red ali obstoječe zmožnosti Folia. Izhodišče prebere projekte in opravila iz javnega API-ja, ponuja preglednico in tablo, preklop pogleda, podrobnosti, nalaganje, napako in poskus ponovnega branja. Dodajo se lokalne kontrole straničenja in filtra stanja; strežnik, tipi in javne poti ostanejo enaki.

## Vhodi, dejanja in izidi

- Podatkovni tipi ostanejo iz `shared/types.ts`: `Project` ima `id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; `TaskStatus` je `todo | in_progress | done`.
- Aplikacija bere obstoječe GET poti `/api/projects` in `/api/projects/{projectId}/tasks` ter podrobnost prek `/api/tasks/{taskId}`. Nova stanja ne shranjuje v `localStorage`, URL ali druge trajne shrambe.
- Nove kontrole sta HTML `select` z dostopnima imenoma `Velikost strani` in `Filter strani`. Velikosti so `all/2/5/10`, filtri so `all/todo/in_progress/done`.
- Gumbi so `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`. Element stanja ima `role="status"`, `aria-label="Stanje straničenja"` in besedilo iz razdelka o stanjih.
- Uspeh pomeni, da oba pogleda prikazujeta isti trenuten odsek opravil, status je točen, gumbi na robu so onemogočeni in obstoječe povezave, podrobnosti, nalaganje, napaka in prilagodljiv videz ostanejo uporabni.
- Obstoječe obnašanje ob napaki API-ja in ponovnem poskusu ostane; straničenje se izračuna šele iz uspešno prebranega polja opravil. Navigacija med nezaključenim nalaganjem ni nova zahteva.

## Stanje in predikati

Za trenutni projekt naj bo `T` seznam opravil v vrstnem redu, ki ga vrne obstoječi GET odgovor. Stanje UI naj bo lokalno v `ProjectView` in naj vsebuje `size`, `filter` ter `page`:

- `size ∈ {'all', '2', '5', '10'}`, privzeto `all`;
- `filter ∈ {'all', 'todo', 'in_progress', 'done'}`, privzeto `all`;
- `F = filter === 'all' ? T : T.filter(task => task.status === filter)` brez razvrščanja;
- `N = |F|`, `S = size === 'all' ? max(N, 1) : Number(size)`;
- `Y = N === 0 ? 0 : ceil(N / S)`;
- veljavna `page` je `0`, če je `N = 0`, sicer `1 ≤ page ≤ Y`; privzeta stran je `1` za neprazno polje in `0` za prazno;
- trenuten odsek je `P = N === 0 ? [] : F.slice((page - 1) * S, page * S)`;
- `A = N === 0 ? 0 : (page - 1) * S + 1`;
- `B = N === 0 ? 0 : min(N, page * S)`.

Pri `size = all` in `N > 0` je `S = N`, `Y = 1`, `A = 1` in `B = N`. Sprememba `size` ali `filter` nastavi `page` na prvo veljavno stran nove kombinacije (`1` za neprazno, `0` za prazno). Gumbi spremenijo `page` samo na veljavno stran: `Prva` na `1`, `Prejšnja` na `page - 1`, `Naslednja` na `page + 1` in `Zadnja` na `Y`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Po nalaganju sta `size = all` in `filter = all`; `page = 1` oz. `0`; prikazani so vsi `ID(T)`, v isti zaporedji kot v API-ju. | Naloži projekt z mešanim stanjem in neurejenim vrstnim redom ter preveri ID-je ter status. |
| R02 | Za `size = 2/5/10` odseki `F.slice(0,S)`, `F.slice(S,2S)`, … pokrijejo `F` brez ponovitev in lukenj; zadnji je lahko krajši. | Združi ID-je vseh strani in preveri enakost množice ter zaporedje z izvornim `F`. |
| R03 | Gumbi sledijo predikatom; onemogočeni so, kadar cilj ni veljaven (`page ≤ 1`, `page ≥ Y`, `Y = 0`). Klic ne spremeni stanja. | Preveri gumbe na prvi/zadnji strani in poskusi neveljavno dejanje ob praznem rezultatu. |
| R04 | `set size(new)` ohrani `filter` in nastavi `page` na prvo stran novega `S`; pri `all` neprazen rezultat pomeni `Y = 1`. | Zamenjaj velikost z višje strani in preveri prvo stran ter status. |
| R05 | Filter se uporabi na `T` pred rezino `P`; `set filter(new)` ohrani `size` in nastavi `page` na prvo stran. Vrstni red ujemajočih se opravil ostane izviren. | Primerjaj `ID(F)` v vseh filtrih z izvornim vrstnim redom in preveri reset strani. |
| R06 | Preglednica dobi `P`; tabla dobi isti `P` kot vhod, nato ga obstoječe skupine razvrstijo po `status`. `data-task-id` ostane na vrsticah in karticah. | Za isto kombinacijo preveri enakost množice `ID(P)` v obeh pogledih; stolpci table ne straničijo ločeno. |
| R07 | Preklop pogleda, odpiranje podrobnosti in zapiranje spremenita le obstoječo pot pogleda/podrobnosti, ne `size`, `filter` ali `page`. | Izvedi vse tri akcije v obeh zaporedjih in preveri enak status ter ID-je. |
| R08 | Menjava projekta ali osvežitev ponastavi `(size,filter,page)` na `(all,all,prva veljavna stran)`; stanja ni v URL-ju ali trajni shrambi. | Menjaj projekt po nastavitvi, osveži stran in preveri URL ter lokalno shrambo. |
| R09 | Za `N > 0` status vsebuje točno `Stran {page} od {Y}. Prikazano {A}–{B} od {N}.`; indeksi so eno-zgrajeni, pomišljaj je `–`. | Preveri status na prvi, srednji in zadnji strani za več velikosti. |
| R10 | Za prazen projekt ali prazen filter je status točno `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni; vrnitev na `all` pokaže prvo stran. | Naloži prazen projekt in neprazen filter, nato odstrani filter. |
| R11 | Pregled stanj nad `T` ostane nespremenjen pred in po straničenju/filterju. Števci stolpcev table štejejo `P` po stanjih. `count-badge` ostane `|T|`. | Primerjaj vrednosti `Pregled stanj opravil` in števcev pred/after ter na več straneh. |
| R12 | Straničenje ne spreminja `Task` zapisov in ne sproži napisov na `/api/`. Obstoječe povezave, ID-ji, podrobnosti, nalaganje, napaka in Folio videz ostanejo uporabni; morebitna dejanja ob opravilu so zunaj njegove povezave. | Zaženi obstoječe razvojne teste, lastne teste za vse zahteve ter nadzor omrežnih metod. |

## Izvedba in sledljivost

Predlagani implementacijski vtisi:

- `src/App.tsx`: lokalno stanje v `ProjectView`, izračun `F/Y/A/B/P`, kontrole in status ter posredovanje `P` preglednici in tabli.
- `src/TaskBoard.tsx`: uporabi posredovan trenuten odsek; obstoječe razvrščanje po `status` in števci stolpcev štejejo ta odsek.
- `src/styles.css`: slogi novih kontrol v obstoječih Folio spremenljivkah in komponentah; širina 390 px ne povzroča širšega dokumenta, notranje drsenje preglednice/tabele je dovoljeno.
- `src/navigation.ts`: ohrani obstoječi URL za projekt, pogled in podrobnost; ne dodaja straničenja ali filtra v URL.
- `tests/agent/`: lastni Playwright testi, ki poleg skupnih primerov pokrijejo robne in izpuščene pogoje.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R02 | Privzeto stanje in pokritost odsekov. | Podatki z 0, 1, 2, 11 in več kot 10 opravili ter mešanim vrstnim redom. | `src/App.tsx` – stanje in izračun; `tests/agent/`. | Ni izvedeno v fazi specifikacije. |
| R03–R05 | Gumbi, reset ob spremembi velikosti/filterja in filter pred rezino. | Robne strani, sredina, spremembe kontrol, vsi filtri. | `src/App.tsx` – akcije; `tests/agent/`. | Ni izvedeno v fazi specifikacije. |
| R06–R08 | Enak odsek v obeh pogledih, ohranitev pri podrobnosti, reset ob menjavi/osvežitvi. | Preklop pogleda, odprti/zaprti podrobnosti, menjava projekta, ponovni nalagalni cikel. | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/`. | Ni izvedeno v fazi specifikacije. |
| R09–R11 | Točen status, prazen rezultat, nespremenjen pregled stanj in števci. | Statistični podatki za več strani ter prazen projekt/filter. | `src/App.tsx`, `src/TaskBoard.tsx`; `tests/agent/`. | Ni izvedeno v fazi specifikacije. |
| R12 | Brez napisov na API, ohranjene obstoječe zmožnosti in prilagodljiv videz. | Skupni testi, nadzor omrežja, tipkovnica in širina 390 px. | `src/App.tsx`, `src/styles.css`; `tests/agent/`. | Ni izvedeno v fazi specifikacije. |

Implementer naj pred oddajo zapiše dejanske teste, izide in dokaze ter po potrebi dopolni to tabelo. Skupni primeri `tests/development/P05.spec.ts` pokrivajo le del obsega in niso zadostni za zaključek.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj za obseg P05.
- V tej fazi specifikacije ni zagona aplikacije, testov ali pregleda videza; ti pripadajo implementerju.
- Izpuščeni ali nedokončani izidi implementer izrecno označi; nedostopnih končnih testov ne sme navesti kot uspešnih.

## Dodatek po implementaciji in pregledu

Sledljivost R01–R12 je potrdil pregledovalnik z dejanskimi testi iz `tests/agent/P05.spec.ts`: lastni 8/8 in razvojni 8/8 so uspešni, celotni `npm run check` pa 54/54. Testi zajemajo straničenje, reset, filter, oba pogleda, podrobnosti, menjava projekta, prazne rezultate, števce, pisanje na API in širino 390 px.
Končni testi izven tega okolja in javni internet niso bili dostopni; niso izvedeni in se ne navajajo kot uspešni.
