# P05 – razvojna specifikacija

## Problem in kontekst

Uporabnik želi omejiti prikaz opravil projekta po stanju in velikosti strani,
ne da bi izgubil vrstni red, povezave ali kontekst pri menjavi pogleda. Folio
trenutno prebere vsa opravila projekta prek javnega API-ja in jih pokaže v
preglednici ali tabli. Dopolnitev doda lokalno filtriranje in skupno straničenje
pred obema prikazoma, v obstoječem slovenskem in prilagodljivem videzu.

## Vhodi, dejanja in izidi

- Vhod je urejeno polje `Task[]` iz `GET /api/projects/:id/tasks`. Identiteta
  je `id`, pripadnost `projectId`, filter uporablja `status`. Naslov, opis,
  odgovorna oseba in datum ostanejo običajno besedilo oziroma obstoječi prikaz.
  Dovoljena so prazna polja, enaki naslovi, Unicode in poljubni enkratni ID-ji.
- Lokalno stanje projekta: velikost `s ∈ {all, 2, 5, 10}`, filter
  `f ∈ {all, todo, in_progress, done}`, zahtevana stran `p`, začetno `(all, all, 1)`.
- Sprememba velikosti ali filtra vedno nastavi `p := 1`. Štirje gumbi se premikajo
  na prvo, prejšnjo, naslednjo ali zadnjo stran, omejeni z robovi rezultata.
- Preklop pogleda in odpiranje/zapiranje podrobnosti (gumb, Escape, zgodovina)
  ohranita stanje. Menjava projekta in osvežitev dokumenta ustvarita začetno stanje.
- Filtriranje in straničenje sta takojšnja ter ne pošiljata zahtev za zapis.
  Ni potrjevanja ali preklica. Zaprtje podrobnosti ne spreminja izbire.
- Ob nalaganju ali napaki se ohranita obstoječi prikaz in možnost ponovitve.
  Kontrole in status straničenja se pokažejo, ko je polje opravil uspešno prebrano.

## Zahteve in pravila

Naj bo `T` izvorno polje projekta, `F = [t ∈ T | f = all ∨ t.status = f]`
z ohranjenim vrstnim redom in `N = |F|`. Efektivna velikost `k` je `max(1, N)`
pri `s = all`, sicer številska vrednost `s`. Število strani `Y = ceil(N/k)`.
Pri `N > 0` velja `1 ≤ p ≤ Y`, `a = (p−1)k`, `V = F[a : min(a+k,N)]`,
`A = a+1`, `B = min(a+k,N)`, `X = p`. Pri `N = 0` so `V = []` in
`X = Y = A = B = 0`; notranja začetna stran ostane 1.

Predikati:

- Razdelitev: konkatenacija vseh strani je `F`, za različni strani pa je presek
  množic ID-jev prazen (vhodni ID-ji so enkratni).
- Robovi: `disabled(first) = disabled(previous) = (N = 0 ∨ p = 1)`;
  `disabled(next) = disabled(last) = (N = 0 ∨ p = Y)`.
- Prehodi: `changeSize(s') → (s', f, 1)`, `changeFilter(f') → (s, f', 1)`;
  `changeProject ∨ reload → (all, all, 1)`; sprememba pogleda/podrobnosti je
  identiteta nad `(s,f,p)`.
- Enakost prikazov: `IDs(table) = IDs(V)` po vrstnem redu in
  `set(IDs(board)) = set(IDs(V))`; posamezen stolpec ohrani relativni vrstni red.
- Števci: povzetek stanja `q` je `|[t ∈ T | t.status=q]|`, števec stolpca pa
  `|[t ∈ V | t.status=q]|`. Skupno število je vedno `|T|`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni `(all,all,1)` pokaže vse ID-je v izvornem vrstnem redu. | Razvojni testi in A01. |
| R02 | Velikosti 2/5/10 razdelijo `F` po zgornjem pravilu; zadnji odsek je lahko krajši. | A02: prehod skozi vse strani različnih velikosti, več kot 10 opravil. |
| R03 | Vsi štirje premiki upoštevajo robne predikate; onemogočen gumb ne spremeni stanja. | A02 in A06. |
| R04 | Vsaka sprememba velikosti vrne prvo stran; all je pri nepraznem rezultatu ena stran. | D04 in A03, tudi prej veljavna številka strani. |
| R05 | Filter se izvede pred razrezom, ohrani vrstni red in ponastavi stran. | D03 in A04 za vsa stanja. |
| R06 | Tabla združi samo `V`; preglednica in tabla prikazujeta iste ID-je. | A04 in A05 z mešanimi stanji na strani. |
| R07 | Pogleda in podrobnosti ohranijo celotno lokalno stanje. | A05: oba prikaza, Escape, gumb in zgodovina. |
| R08 | Projekt in osvežitev ponastavita vse tri vrednosti; brez trajne shrambe/URL-ja. | A07 in pregled kode. |
| R09 | Status je točno `Stran X od Y. Prikazano A–B od N.` | D02, A01–A04. |
| R10 | Prazen projekt/filter: `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi premiki onemogočeni. | A06, prazna oba projekta in odstranitev filtra. |
| R11 | Povzetek in skupno število štejeta `T`, stolpci pa `V`. | A04 in A05. |
| R12 | Samo branje `/api/`, ohranjeni ID-ji, povezave, podrobnosti, nalaganje in širina 390 px. | Izhodiščni testi, A05, A08, nadzor zahtev in vizualni pregled. |

Kontrole so HTML `select` z dostopnima imenoma `Velikost strani` in `Filter strani`
ter predpisanimi vrednostmi. Gumbi imajo imena `Prva stran`, `Prejšnja stran`,
`Naslednja stran`, `Zadnja stran`. Status ima `role="status"` in
`aria-label="Stanje straničenja"`; med indeksoma je pomišljaj `–`.
Obstoječa dostopna imena in `data-task-id` se ohranijo.

## Izvedba in sledljivost

Začetna specifikacija je bila zapisana pred implementacijo. Spodnja tabela
povezuje končno kodo s testi; zaporedje dejanskih zagonov in njihove omejitve
so v [verification.md](verification.md). A01–A08 so v
[`tests/agent/P05.spec.ts`](../../tests/agent/P05.spec.ts), D01–D04 pa v
[`tests/development/P05.spec.ts`](../../tests/development/P05.spec.ts).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno vse, izvorni vrstni red | A01 | `src/App.tsx`: začetni `useState`, `filteredTasks` | Uspešno; [dnevnik](check.log). |
| R02 | Popolna, neprekrivajoča razdelitev 2/5/10 | A02 (3 primeri), A04, D01–D02 | `src/App.tsx`: `size`, `offset`, `visibleTasks` | Uspešno; [dnevnik](check.log). |
| R03 | Štirje premiki in neaktivni robovi | A02, A06 | `src/App.tsx`: `atStart`, `atEnd`, gumbi | Uspešno; [dnevnik](check.log). |
| R04 | Sprememba velikosti nastavi prvo stran | A03, D04 | `src/App.tsx`: `onChange` velikosti | Uspešno; [dnevnik](check.log). |
| R05 | Filter pred razrezom, stabilni vrstni red | A04, D03 | `src/App.tsx`: `filteredTasks`, `onChange` filtra | Uspešno; [dnevnik](check.log). |
| R06 | Isti odsek v obeh pogledih | A05, A08, D03 | `src/App.tsx`: oba uporabljata `visibleTasks`; `src/TaskBoard.tsx`: združevanje | Uspešno; [dnevnik](check.log). |
| R07 | Pogled in podrobnosti ohranijo stanje | A05 | `src/App.tsx`: stanje v `ProjectView`, nespremenjen ključ pri podrobnostih | Uspešno; [dnevnik](check.log). |
| R08 | Ponastavitev na projektu/osvežitvi; brez shrambe | A07, pregled kode | `src/App.tsx`: `key={project.id}`, lokalni `useState` | Uspešno; [dnevnik](check.log). |
| R09 | Točno besedilo in indeksi statusa | A01–A05, D02 | `src/App.tsx`: `.pagination-status` | Uspešno; [dnevnik](check.log). |
| R10 | Prazno 0/0, vsi premiki onemogočeni, odstranitev filtra | A06 | `src/App.tsx`: `total === 0`, `atStart`, `atEnd`, prazno stanje | Uspešno; [dnevnik](check.log). |
| R11 | Projektni števci iz `T`, stolpci iz `V` | A04, A05 | `src/App.tsx`: `counts`, `tasks.length`; `src/TaskBoard.tsx`: `entries.length` | Uspešno; [dnevnik](check.log). |
| R12 | Brez zapisov, povezave po ID, dostopnost, širina 390 px | A01–A02, A04–A05, A08, 38 izhodiščnih preverjanj in vizualni pregled | `src/App.tsx`, `src/TaskBoard.tsx`: povezave in imena; `src/styles.css`: `.pagination-*`, mobilna pravila | Končni rezultat in popravek ID-jev sta v [preverjanju](verification.md). |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi preprečevala implementacijo. Osvežitev pomeni
  osvežitev dokumenta; aplikacija nima ločenega gumba za osvežitev seznama.
- Sočasne spremembe podatkov brez osvežitve in širitev navigacije med nalaganjem
  niso del naloge; obstoječe regresije ostanejo obvezne.
- Končni skriti testi niso dostopni. Razvojni testi sami ne dokazujejo vseh pravil.
- Delo poteka z enim agentom in brez novih odvisnosti; urejajo se samo dovoljene mape.

## Zgodovina popravkov

- 2026-09-21, v1: začetna specifikacija pred spremembami kode; definirani R01–R12,
  predikati in načrt dopolnilnih preverjanj. Rezultati še niso navedeni kot uspešni.
- 2026-09-21, v2: dodana sledljivost izvedene kode in testov. A08 je razširjen z
  ID-jem s presledkom, Unicode in rezerviranimi URL-znaki. Ta veljavni vhod je
  razkril neustrezno vezavo `aria-labelledby` na izvorni ID; kartica zdaj dobi
  neposredno dostopno ime iz naslova in ID-ja. Zahteve in predikati se niso spremenili.
