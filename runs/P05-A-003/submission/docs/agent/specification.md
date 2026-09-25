# P05 — specifikacija (postopek A, en agent)

## Problem in kontekst

Folio trenutno prikaže vsa opravila projekta v preglednici ali tabli. Uporabnik
potrebuje omejitev števila prikazanih opravil in izbor po stanju. Dopolnitev ohrani
slovenska imena, potrjeni videz iz `docs/dizajn.md`, obstoječe povezave po ID-jih,
nalaganje, napake in podrobnosti. Podatki ostanejo na obstoječem javnem API-ju.

## Vhodi, dejanja in izidi

- Vhod je urejeno polje `Task[]` iz `/api/projects/:id/tasks`; relevantni polji
  za izbor sta `id` in `status`. Naslov ni identifikator. Ostala polja se prikažejo
  kot navadno besedilo; zaporedje iz API-ja se ne sortira.
- Lokalno stanje projekta je `(s, f, p)`: velikost `s ∈ {all, 2, 5, 10}`,
  filter `f ∈ {all, todo, in_progress, done}` in interna stran `p ≥ 1`.
  Začetno stanje je `(all, all, 1)`.
- Izbira velikosti ali filtra nastavi ustrezno vrednost in `p := 1`. Štirje
  gumbi premaknejo stran znotraj veljavnega območja. Na robovih so onemogočeni.
- Preklop pogleda in odpiranje/zapiranje podrobnosti (gumb, Escape, zgodovina)
  ne spreminjajo `(s, f, p)`. Menjava projekta in ponovno nalaganje dokumenta
  ustvarita novo začetno stanje. Nastavitev ni v URL-ju ali trajni shrambi.
- Med nalaganjem oziroma napako ostaneta obstoječa prikaz in ponovni poskus;
  kontrole se pojavijo ob prejetem polju, tudi če je prazno. Spremembe strani
  ne zahtevajo API-ja in zato nimajo ločenega preklica ali napake shranjevanja.

## Zahteve in pravila

Naj bo `T` nefiltrirano polje projekta. `F = [t ∈ T | f = all ∨ t.status = f]`
ohrani vrstni red. `N = |F|`. Če je `N = 0`, je število strani `Y = 0` in
prikazana stran `X = 0`. Sicer je `Y = 1` za `s = all`, oziroma
`Y = ceil(N / s)`, in `1 ≤ X ≤ Y`. Za neprazno polje je začetni odmik
`o = 0` za `all`, sicer `o = (X − 1) × s`; prikazano polje `V` je celoten `F`
za `all`, sicer `F.slice(o, o + s)`. Status uporablja `A = o + 1`,
`B = o + |V|`; pri praznem polju sta `A = B = 0`.

Predikati: `concat(V₁, …, Vᵧ) = F`; ID-ji različnih strani se ne prekrivajo;
`IDs(preglednica) = IDs(tabla) = IDs(V)` (tabla jih sme združiti po stanju).
Pregled stanj za stanje `q` kaže `|{t ∈ T : t.status = q}|`, stolpec table pa
`|{t ∈ V : t.status = q}|`. Nobeno dejanje straničenja ne mutira `T` ali pošlje
zapisovalnega zahtevka. Predpostavka so veljavni podatki z enkratnimi ID-ji.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `(all, all, 1)`; vidno celotno `T` v vrstnem redu API-ja. | A01; regresijski testi |
| R02 | Velikosti 2/5/10 tvorijo neprekrivajoče odseke; zadnji je lahko krajši. | A02, D01/D02 |
| R03 | Prvi/prejšnji/naslednji/zadnji premik; neveljavni gumbi disabled. | A02, A05 |
| R04 | Vsaka sprememba velikosti nastavi `p := 1`, tudi pri še veljavni stari strani. | A03, D04 |
| R05 | `F` nastane pred `V`; vsak filter ohrani vrstni red in nastavi `p := 1`. | A03, A05, D03 |
| R06 | Oba pogleda uporabljata isti `V`; stolpci nastanejo šele iz `V`. | A04, D03 |
| R07 | Pogled in podrobnosti ohranijo `(s, f, p)`. | A04 |
| R08 | Menjava projekta in osvežitev nastavita `(all, all, 1)`; brez shrambe/URL. | A06 |
| R09 | Točno `Stran X od Y. Prikazano A–B od N.` v označenem statusu. | A01–A06 |
| R10 | Prazno: `Stran 0 od 0. Prikazano 0–0 od 0.`; vsi premiki disabled. | A05/A05b |
| R11 | Pregled stanj in skupno število iz `T`; števci stolpcev iz `V`. | A04, A05/A05b |
| R12 | Brez mutacij/zapisov; povezave po ID, podrobnosti, nalaganje in 390 px ostanejo uporabni. | A01, A04, A07; skupni testi |

Testne oznake A01–A07 so lastni scenariji v
[`tests/agent/pagination.spec.ts`](../../tests/agent/pagination.spec.ts); A02 ima
tri primere, A05 je dopolnjen z A05b (skupaj 10 testov). D01–D04 so obstoječi
razvojni scenariji, vsak za namizje in mobilni pogled.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno stanje in izvorno zaporedje | A01 | [App](../../src/App.tsx), ProjectView: inicializacija | Uspešno; [končni dnevnik](check-final.log), A01 |
| R02 | Odseki `V` | A02 (2/5/10), D01/D02 | [App](../../src/App.tsx), filteredTasks/visibleTasks | Uspešno; [dnevnik](check-final.log), 23 ID-jev brez izgub/podvojitev |
| R03 | Robovi premikov | A02/A05/A05b | [TaskPagination](../../src/TaskPagination.tsx), atStart/atEnd in gumbi | Uspešno; [dnevnik](check-final.log), vsi štirje premiki in disabled click |
| R04 | Ponastavitev ob velikosti | A03, D04 | [App](../../src/App.tsx), onPageSizeChange | Uspešno; [dnevnik](check-final.log), tudi še veljavna druga stran |
| R05 | Filter pred odsekom | A03/A05b, D03 | [App](../../src/App.tsx), filteredTasks/onPageFilterChange | Uspešno; [dnevnik](check-final.log), vsi filtri |
| R06 | Isti `V` | A04, D03 | [App](../../src/App.tsx), visibleTasks v table/TaskBoard | Uspešno; [dnevnik](check-final.log), mešana in filtrirana stran |
| R07 | Ohranitev lokalnega stanja | A04 | [App](../../src/App.tsx), stanje ProjectView in TaskDetails | Uspešno; [dnevnik](check-final.log), pogled, Escape, gumb, zgodovina |
| R08 | Nova instanca projekta | A06 | [App](../../src/App.tsx), ProjectView key=project.id | Uspešno; [dnevnik](check-final.log), odhod/povratek, reload, URL/shramba |
| R09 | Natančen status | A01–A06 | [TaskPagination](../../src/TaskPagination.tsx), role=status | Uspešno; [dnevnik](check-final.log), točno besedilo in pomišljaj |
| R10 | Prazni rezultati | A05/A05b | [App](../../src/App.tsx), prazno polje; [TaskPagination](../../src/TaskPagination.tsx) | Uspešno; [dnevnik](check-final.log), oba projekta prazna in filter brez zadetkov |
| R11 | Obseg števcev | A04/A05/A05b | [App](../../src/App.tsx), counts/tasks.length; [TaskBoard](../../src/TaskBoard.tsx), entries | Uspešno; [dnevnik](check-final.log), skupni in prikazani števci |
| R12 | Regresija in samo branje | A01/A04/A07, baseline/api/development | [App](../../src/App.tsx), [TaskPagination](../../src/TaskPagination.tsx), [styles](../../src/styles.css); obstoječa navigacija/API | Uspešno; [dnevnik](check-final.log), [vizualni pregled](manual-check.log) |

Dejansko izvedeni ukazi, rezultati, posnetki in omejitve so v
[verification.md](verification.md). Zabeleženi rezultati veljajo za izvedene
scenarije, ne pomenijo izvedbe nedostopnih končnih testov.

## Odprta vprašanja in omejitve

- »Osvežitev« pomeni ponovno nalaganje dokumenta; novega gumba za osveževanje ni.
- Sprememba projekta pomeni drug projektni ID; isti pogled projekta ohrani stanje.
- Ob praznem filtru preglednica prikaže pojasnilo brez vrstic; tabla ohrani vse
  tri prazne stolpce. Filter je še vedno mogoče odstraniti.
- Nove sočasne spremembe podatkov brez osvežitve niso predmet naloge. Obstoječe
  regresijske zahteve navigacije med nalaganjem ostanejo obvezne.
- Nedostopni končni testi niso izvedeni. Preverjanje vseh možnih vhodov ni možno;
  lastni testi razširijo razvojne primere z robnimi in drugačnimi podatki.

## Zgodovina specifikacije

- v1, 2026-09-25: specifikacija pripravljena pred spremembami kode; vsi izidi
  označeni kot načrtovani.
- v2, 2026-09-25: po izvedbi dodana sledljivost do kode in dejanskih dnevnikov;
  scenarij A05 razdeljen na A05 in A05b. Zahteve in predikati ostajajo enaki.
  Popravljen pričakovani števec v lastnem A04: pri 23 zapisih v vzorcu
  done/todo/in_progress/todo je porazdelitev 11/6/6, ne 12/5/6. Popravek testa
  in neuspešni predhodni zagon sta zabeležena v verification.md.
