# P09: Stanje pogleda v povezavi in zgodovini — specifikacija

Izvedbeni postopek A (en agent). Dokument sledi `task/specification-template.md`.

## Problem in kontekst

Uporabnik želi deliti in obnoviti pogled seznama opravil prek URL-ja: iskalno
frazo, stanje in vrstni red ter izbrani način preglednice/table. Izhodišče
pozna le `view=board` v fragmentu in ob spremembi projekta izgubi filtriranje.
Rešitev doda tri kontrolnike (osnutek), potrditvena gumba in branje stanja iz
query dela URL fragmenta, brez pisanja podatkov.

## Vhodi, dejanja in izidi

- Vhodi: obstoječi javni API `/api/projects`, `/api/projects/:id/tasks`,
  `/api/tasks/:id`; URL fragment `#/projects/<id>[/tasks/<taskId>][?q&status&order&view]`.
- Dejanja: urejanje osnutka (search, dva selecta), `Uporabi pogled`,
  `Ponastavi pogled`, preklop Preglednica/Tabla, navigacija med projekti,
  odpiranje/zapiranje podrobnosti (gumb ali Escape), Nazaj/Naprej, osvežitev.
- Uspeh: prikaz se ujema s potrjenim stanjem iz URL-ja; osnutek se ob navigaciji
  zavrže; potrditev doda največ eno novo zgodovinsko stanje.
- Napaka: obstoječi `LoadError` z gumbom `Poskusi znova`; neznana pot ostane
  `Projekt ne obstaja`. Preklic (osnutek) ne spremeni prikaza ne URL-ja.

## Zahteve in pravila

Simbologi: `S` = potrjeno stanje `{q, status, order}`, `D` = osnutek,
`N(x)` = normalizacija (trim, NFD, odstranitev U+0300–U+036F, male črke),
`P` = opravila projekta v izvornem vrstnem redu. `match(t,S)` velja, ko je
`S.status ∈ {all, t.status}` in je `N(S.q)` prazen ali podniz `N(t.title)`,
`N(t.description)`, `N(t.assignee)` ali `N(t.id)` (ena fraza, ne regex).
`sort(S)` je stabilno urejanje po `N(title)`; pri `title-desc` se primerjava
obrne, izenačenja ohranijo izvorni vrstni red. `render(S) = sort({t ∈ P | match(t,S)})`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju je `S` razčlenjen iz query dela fragmenta; privzeto `q=''`, `status=all`, `order=original`; prikaz se izračuna takoj. | D01, A01, A08 |
| R02 | Iskanje uporabi `N` in podniz na title/description/assignee/id; fraza se ne deli. | A02, A03, A04 |
| R03 | `status` filtrira po IN s q; `order` je `original`/`title-asc`/`title-desc` s stabilnimi izenačenji. | A03, A05, D01 |
| R04 | Neznan status/order → privzeto; prva ponovitev parametra velja; neznani parametri se ignorirajo; branje ne prepiše URL-ja. | A06, A09 |
| R05 | Urejanje kontrol spremeni samo `D`; `Uporabi pogled` potrdi `D` in doda eno zgodovinsko stanje, če se `S` spremeni. | D02, A07 |
| R06 | Potrditev obreže q, izpusti privzete parametre, ohrani `view=board`, odstrani neznane parametre; ponovitev ne doda stanja. | A07, A09 |
| R07 | Nazaj/Naprej obnovita `S`, prikaz in `D`; osvežitev ohrani `S` iz URL-ja. | D03, A08, A10 |
| R08 | Preklop pogleda ohrani `S` in iste ID-je; `D` se ob navigaciji zavrže. | D03, A11 |
| R09 | Odpiranje/zapiranje podrobnosti (gumb, Escape) ohrani `S` in pogled; povezava uporabi ID. | A12, A13 |
| R10 | Klik na drug projekt nastavi privzeto `S` in ohrani table/board; neposredna povezava upošteva parametre. | A14, A15 |
| R11 | `Ponastavi pogled` počisti `S` in `D` ter posodobi zgodovino kot potrditev, ohrani pogled; prazen rezultat pokaže `Ni zadetkov.`; števec `Prikazano: N od M.` | D04, A16, A17 |
| R12 | Nobeno dejanje ne pošlje zapisa in ne uporabi localStorage; obstoječe stanje (neznana pot, nalaganje, podrobnosti, videz) ostane. | D04, baseline, A18 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | razčlenjevanje in filtriranje | D01, A01–A06 | `src/viewState.ts`, `src/navigation.ts` (`parseHash`, `parseViewState`, `filterTasks`) | glej `verification.md` |
| R05–R07 | osnutek, potrditev, zgodovina | D02, D03, A07–A10 | `src/App.tsx` (`ProjectView`, `commitView`), `src/navigation.ts` | glej `verification.md` |
| R08–R10 | pogled, podrobnosti, projekt | D03, A11–A15 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts` | glej `verification.md` |
| R11–R12 | ponastavitev, števec, brez zapisov | D04, A16–A18 | `src/App.tsx`, `src/api.ts` (nespremenjen), `tests/agent/P09.spec.ts` | glej `verification.md` |

## Odprta vprašanja in omejitve

- Končnih skritih testov ni mogoče zagnati; preverjanje temelji na razvojnih in
  lastnih testih ter baseline regresiji.
- Sočasne spremembe podatkov med nalaganjem niso del obsega (kot dovoljujejo
  navodila); stanje nove funkcionalnosti je lokalno trenutnemu projektu.
- Prazno opravilo brez aktivnih filtrov ohrani izhodiščni prazni prikaz
  (`V tem projektu še ni opravil`), ob aktivnih filtrih pa `Ni zadetkov.`.

## Zgodovina sprememb specifikacije

- 2026-11-01: začetna različica; prazno stanje razločeno po aktivnosti filtrov
  zaradi regresijskega testa praznega projekta.
