# P09 – Specifikacija: Stanje pogleda v povezavi in zgodovini

Različica 1.0 (postopek A, en agent). Predloga: `task/specification-template.md`.
Zahteve: `task/instructions.md` (R01–R12). Pravila: `PROJECT_RULES.md`.

## Problem in kontekst

Folio trenutno hrani samo `view=board|table` v URL-fragmentu (`src/navigation.ts`);
iskanje, stanje in vrstni red opravil se ne shranjujejo v povezavo, zato povezave
ni mogoče deliti, osvežitev pa izgubi pogled. Namen naloge je, da so potrjeni
filtri (`q`, `status`, `order`) del URL-fragmenta za obstoječo pot projekta ali
opravila, da jih brskalniška zgodovina (nazaj/naprej) obnovi, da osnutek kontrol
ne vpliva na prikaz, dokler ga uporabnik ne potrdi z `Uporabi pogled`, in da
`Ponastavi pogled` vrne privzeto stanje. Aplikacija še naprej samo bere
`/api/` in ne piše podatkov.

## Vhodi, dejanja in izidi

- Vhodna polja: `Task.id`, `Task.projectId`, `Task.title`, `Task.description`,
  `Task.status`, `Task.assignee`, `Task.dueDate` (nespremenjeni skupni tipi).
- URL-fragment: `#/projects/{id}[/tasks/{id}]?view=board&q=…&status=…&order=…`.
  Potrjeno stanje = `{q, status, order}` + `view`. Neznani parametri se pri
  branju ignorirajo, pri potrditvi odstranijo.
- Dejanja: vnos iskalne fraze, izbira stanja in vrstnega reda (osnutek),
  `Uporabi pogled` (potrditev), `Ponastavi pogled` (privzeto stanje),
  preklop Preglednica/Tabla, navigacija po projektih, odpiranje/zapiranje
  podrobnosti.
- Uspeh potrditve: eno novo zgodovinsko stanje z normaliziranimi parametri
  (q obrezan, privzeti izpuščeni, `view=board` ohranjen); če je ciljni URL enak
  trenutnemu, se zgodovina ne spremeni. Osnutek se sinhronizira s potrjenim.
- Preklic/navigacija: vsaka navigacija (sprememba fragmenta, nazaj/naprej,
  preklop pogleda, odpiranje podrobnosti) zavrže nepotrjen osnutek in ga
  napolni iz potrjenega stanja.
- Napaka: branje podatkov ostane nespremenjeno (obstoječi `LoadError` + ponovni
  poskus); filtri se ob napaki ne prikažejo, ker ni podatkov.

## Zahteve in pravila

Splošni simboli: `V = {q, status, order}` potrjeno stanje iz URL-fragmenta;
`D` osnutek kontrol; `N` število zadetkov, `M` število vseh opravil projekta.
Predpostavke: `normalize(x) = x.trim().normalize('NFD')`, odstranjeni znaki
U+0300–U+036F, `.toLowerCase()`; stabilno urejanje ohrani izvorni vrstni red
pri izenačenju (ES2019 `Array.prototype.sort`).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `V` se prebere iz query dela fragmenta za pot projekta in opravila; privzeto `q=''`, `status='all'`, `order='original'`; prikaz ob odprtju uporabi `V` brez klika. | A01, A02, D01; razčlenjevalnik `parseViewState` |
| R02 | Iskanje: `normalize(q)` mora biti podniz `normalize(title‖description‖assignee‖id)`; fraza je dobesedna (ni regex, brez deljenja na besede). | A03, A04, D01 |
| R03 | `status ∈ {all,todo,in_progress,done}` filtrira po enakosti in se veže z `q` po IN; `order ∈ {original,title-asc,title-desc}`; naslov se primerja z `normalize(title)` v UTF-16; izenačenje ohrani izvorni vrstni red. | A03, A05 |
| R04 | Neznan `status`/`order` ⇒ privzeto; ponovljen parameter ⇒ prva pojava; neznani parametri ne vplivajo na prikaz; branje ne prepiše URL-ja. | A06, A07 |
| R05 | Sprememba kontrol spreminja samo `D`; `Uporabi pogled` potrdi vse tri hkrati in doda največ eno zgodovinsko stanje. | A08, D02 |
| R06 | Potrditev: `q` obrezan, privzeti parametri izpuščeni, ostali URL-kodirani; `view=board` ohranjen, neznani parametri odstranjeni; enaka ponovitev ne doda stanja. | A08, A09, D02 |
| R07 | Nazaj/Naprej obnovita `V`, prikaz in `D`; osvežitev ohrani potrjeno stanje iz URL-ja. | A10, D03 |
| R08 | Preklop Preglednica/Tabla ohrani `V` in prikaže iste ID-je; vsaka navigacija zavrže `D`. | A11, D03 |
| R09 | Odpiranje podrobnosti in zapiranje (gumb, Escape) ohranita `V` in `view`; povezava cilja pravi ID tudi pri enakih naslovih. | A12, A13 |
| R10 | Klik na drug projekt odpre njegov privzeti pregled in ohrani `view`; neposredna povezava z parametri jih upošteva. | A14 |
| R11 | `Ponastavi pogled` počisti `q/status/order` in `D` ter posodobi zgodovino kot potrditev, `view` ostane; `N=0 ∧ M>0` ⇒ `Ni zadetkov.`; števec `role=status`, `aria-label="Rezultati povezave"`, besedilo `Prikazano: N od M.`. | A15, A16, D04 |
| R12 | Nobeno dejanje ne piše prek `/api/` ali `/__test/`, stanje ni v `localStorage`; obstoječa neznana pot, nalaganje, podrobnosti in videz Folio delujejo naprej. | D04 `readonly`, A17, baseline testi |

Pravila spremembe stanja (predikati):

- Potrditev: `hash' = buildUrl(projectId, taskPath, view, trim(D))`;
  `hash' = hash ⇒ zgodovina nespremenjena`, sicer natanko en `pushState` prek
  `location.hash`.
- Reset: `D := {q:'', status:'all', order:'original'}` in enaka potrditev.
- Navigacija: `hash` se spremeni ⇒ `D := V(hash)`.
- Prikaz: `N = |{t : qFilter(t) ∧ statusFilter(t)}|`, urejeno po `order`.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | glej R01 | A01, A02, D01 | `src/navigation.ts` (`parseViewState`, `useRoute`) | glej `verification.md` |
| R02 | glej R02 | A03, A04, D01 | `src/viewState.ts` (`normalizeText`, `matchesQuery`) | glej `verification.md` |
| R03 | glej R03 | A03, A05 | `src/viewState.ts` (`filterTasks`) | glej `verification.md` |
| R04 | glej R04 | A06, A07 | `src/navigation.ts` (`parseViewState`) | glej `verification.md` |
| R05 | glej R05 | A08, D02 | `src/App.tsx` (`applyDraft`) | glej `verification.md` |
| R06 | glej R06 | A08, A09, D02 | `src/navigation.ts` (`buildViewQuery`), `src/App.tsx` | glej `verification.md` |
| R07 | glej R07 | A10, D03 | `src/App.tsx` (učinek ob `route.key`), `src/navigation.ts` | glej `verification.md` |
| R08 | glej R08 | A11, D03 | `src/App.tsx` (`view-switch`), `src/TaskBoard.tsx` | glej `verification.md` |
| R09 | glej R09 | A12, A13 | `src/App.tsx`, `src/TaskDetails.tsx`, `src/TaskBoard.tsx` | glej `verification.md` |
| R10 | glej R10 | A14 | `src/App.tsx` (stranska navigacija) | glej `verification.md` |
| R11 | glej R11 | A15, A16, D04 | `src/App.tsx` (`resetView`, filter bar, prazen izid) | glej `verification.md` |
| R12 | glej R12 | A17, D04 | `src/App.tsx`, `src/api.ts` (nespremenjeno) | glej `verification.md` |

Testi: A01–A17 so lastni testi v `tests/agent/p09.spec.ts`; D01–D04 so skupni
razvojni testi `tests/development/P09.spec.ts`. Dejanski izidi in dnevniki so
zapisani v `docs/agent/verification.md`.

## Zgodovina sprememb specifikacije

- 1.0 – začetna različica (pred implementacijo).
- 1.1 – po prvem zagonu testov: osnutek je vezan na par (zaporedna številka navigacije, fragment) namesto na surovi fragment, potrditev pa označi ciljni fragment kot usklajen (`syncedHash`). Razlog: prva različica je ob hitrem zaporedju potrditev in sprememb kontrol izgubila osnutek, vračanje nazaj na že obiskan fragment pa je pokazalo zastarel osnutek. Sprememba ne vpliva na zahteve R01–R12.

## Odprta vprašanja in omejitve

- `Ni zadetkov.` je zapisan s končno piko, ker zahteva navaja besedilo tako;
  iskanje po podnizu ustreza tudi brez pike.
- Ob enaki potrditvi z neznanimi parametri v URL-ju se URL očisti in zato
  nastane novo zgodovinsko stanje (zahteva R06 izrecno zahteva odstranitev).
- Zaslonske bralnike in prave mobilne naprave preverjamo posredno prek
  dostopnostnih imen in meritev širine (Playwright, Chromium).
- Končni skriti testi niso dostopni; preverjamo z lastnimi in razvojnimi testi.
