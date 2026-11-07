# Specifikacija P07: Priljubljena opravila in trajna shramba

Verzija 1 (osnutek), 30. 10. 2026. Avtor: snovalec specifikacije (postopek B).

## Problem in kontekst

Folio trenutno prikazuje opravila izbranega projekta v preglednici ali na
tabli, podrobnosti pa v pogovornem oknu (`src/App.tsx`, `src/TaskBoard.tsx`,
`src/TaskDetails.tsx`). Uporabnik želi označiti poljubna opravila kot
priljubljena, jih filtrirati in ohraniti izbiro med osvežitvami, ne da bi se
dotaknil podatkov na strežniku. Namen je lokalna, projektno neodvisna množica
priljubljenih ID-jev, trajno shranjena v `localStorage` pod ključem
`folio:favorites:v1`, z filtrom `Prikaži le priljubljena` in števcem
`Priljubljeno: X od M.`.

Podatki ostajajo nespremenjeni: bere se samo javni API (`/api/`), opravila
niso predmet zapisovanja (noben PATCH/POST). Izhodiščni tipi
(`shared/types.ts`) in strežnik se ne spreminjajo.

## Vhodi, dejanja in izidi

**Podatki.** `Project {id, name}`, `Task {id, projectId, title, description,
status, assignee, dueDate}` (`shared/types.ts`). Vir: `GET /api/projects`,
`GET /api/projects/:id/tasks`, `GET /api/tasks/:id`. Projekta sta lahko
prazna; opravil je lahko 0, 1 ali več; ID-ji so enkratni nizi, naslovi pa se
lahko ponovijo in zato niso identiteta — identiteta je izključno `id`.

**Stanje funkcionalnosti** (lokalno, ni del API-ja):
- `fav : Set<string>` — globalna množica priljubljenih ID-jev (vsi projekti).
- `filter : boolean` — privzeto `false`.
- `storageError : boolean` — `true`, če branje/zapis `localStorage` vrže izjemo.
- `KEY = "folio:favorites:v1"`; zapis je `{version: 1, ids: string[]}`.

**Dejanja.**
- `toggle(id)`: `fav' = fav △ {id}` (simetrična razlika); shrani `fav'`.
- `setFilter(b)`: nastavi `filter`; ne piše v shrambo.
- `removeProject(projectTaskIds P)`: `fav' = fav \ P`; shrani `fav'`.
- `storage` dogodek za `KEY`: `fav' = parse(newValue)` (isto validacijo);
  `null` → `∅`; brez povratnega zapisa.

**Izidi.** Uspeh: sprememba je vidna takoj v obeh pogledih, shramba vsebuje
normaliziran zapis, API ni klican z metodo, ki bi spreminjala podatke.
Napaka shrambe: aplikacija deluje naprej v pomnilniku in prikaže opozorilo z
besedo »shramba« (`role=alert`). Preklica ni; klik je preklop.

## Zahteve in pravila

Predikati in oznake:
- `valid(v) ≡ v ≠ null ∧ v.version = 1 ∧ Array.isArray(v.ids) ∧ ∀x∈v.ids: typeof x = "string"`.
- `parse(raw) ≡ null, če raw = null ali JSON.parse vrže izjemo ali ¬valid(parsed); sicer `new Set(parsed.ids)`.
- `norm(S) = [...S].sort()` — enkratni nizi v UTF-16 vrstnem redu (privzeti `sort()`).
- `P(project)` = ID-ji vseh opravil trenutnega projekta iz API-ja.
- `visible(t) ≡ ¬filter ∨ t.id ∈ fav`.
- `X = |fav ∩ P|`, `M = |P|`.
- Predpostavke: osvežitev pomeni ponovni zagon aplikacije; »trenutni
  projekt« je projekt iz usmerjevalnika (`#/projects/:id`).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica preglednice in vsaka kartica table ima gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed = (id ∈ fav)`. Gumb je zunaj povezave opravila; klik spremeni samo ta ID (isti naslovi ostanejo neodvisni) in ne odpre podrobnosti (`role=dialog` se ne pojavi). | E2E: klik na `web-02`; preveri `aria-pressed` na `web-02`/`web-03` (enaka naslova), odsotnost dialoga. |
| R02 | Ob vsakem zapisu: `localStorage[KEY] = JSON.stringify({version: 1, ids: norm(fav)})`; vsak element je niz, enkraten, urejen po UTF-16. V shrambo se ne zapiše nobeno polje opravila. | E2E: preberi `localStorage[KEY]` po preklopu; primerjaj s pričakovanim objektom. |
| R03 | `load()` ob zagonu vrne `parse(localStorage.getItem(KEY))`. Podvojeni ID-ji se obravnavajo kot en, neznani (npr. iz drugega projekta) se ohranijo v `fav`, a ne ustvarijo opravil. | E2E: vstavi zapis s podvojenim in neznanim ID; osveži; preveri stanje gumbov in odsotnost izmišljenih vrstic. |
| R04 | `parse` vrne `∅` pri manjkajočem ključu, neveljavnem JSON, `version ≠ 1`, manjkajočem/nenizovem `ids`. Aplikacija se ne sesuje in ob nalaganju ne kliče `setItem` za ta ključ. | E2E: za vsak neveljaven zapis osveži in preveri prazen `fav` ter nespremenjen `localStorage`. |
| R05 | Checkbox `Prikaži le priljubljena` ima privzeto `false`; ko je `true`, prikaz vsebuje natanko `{t ∈ P : t.id ∈ fav}` v izvornem vrstnem redu API-ja (tako v preglednici kot na tabli). | E2E: preklop dveh priljubljenih, vklop filtra, `expectIds`; privzeto stanje ob zagonu. |
| R06 | Če je filter aktiven in uporabnik odstrani priljubljeno vidno opravilo, vrstica/kartica takoj izgine. Ko je množica vidnih prazna, se prikaže točno `Ni priljubljenih opravil.`, checkbox in gumbi pa ostanejo uporabni (izklop filtra je mogoč). | E2E: D02 — vklop filtra z `web-02`, klik na gumb, prazno, besedilo, izklop. |
| R07 | Preglednica in tabla uporabljata isti `fav` in `filter`; preklop pogleda ne spremeni nobenega od njiju. Podrobnosti se odprejo po pravilnem ID-ju (`data-task-id`, `taskUrl`). | E2E: D04 — preklop `web-02` v preglednici, prehod na tablo, `aria-pressed`; odpri podrobnosti. |
| R08 | Menjava projekta ohrani `fav` (globalno), `filter` pa nastavi na `false`. Osvežitev obnovi `fav` iz shrambe, `filter` pa je `false`. | E2E: priljubi v `web`, preidi v `launch` (filter false, gumbi po ID-ju pravilni), nazaj; osvežitev. |
| R09 | Gumb `Odstrani priljubljene tega projekta` zapiše `fav' = fav \ P`; ID-ji drugih projektov in neznani ID-ji ostanejo. Brez priljubljenih trenutnega projekta (`fav ∩ P = ∅`) je gumb onemogočen (`disabled`). | E2E: priljubi `web-02` in `launch-01`; odstrani za `web`; preveri ostanek `launch-01` in shrambo. |
| R10 | Element `role=status` z `aria-label="Število priljubljenih"` ima vedno besedilo `Priljubljeno: X od M.` z `X = |fav ∩ P|`, `M = |P|`, tudi ko je filter aktiven. Števci stolpcev table štejejo vidna (`visible`) opravila. | E2E: branje števca pred/po filtru; števci stolpcev ob filtru. |
| R11 | `storage` dogodek za `KEY` takoj nastavi `fav = parse(event.newValue)`; `null` izprazni; drug ključ se ignorira. Ob dogodku se ne kliče `setItem`. Če branje/zapis vrže izjemo, UI ostane uporaben v pomnilniku in prikaže `role=alert` z besedo »shramba«. | E2E: umetni `storage` dogodek (pravi/drugi ključ, `null`, neveljaven zapis); simulirana izjema `Storage.prototype`. |
| R12 | Nobena sprememba priljubljenih ne kliče API-ja z metodo, ki ni GET (brez `PATCH`/`POST`), in ne spremeni nobenega polja opravila. Ohranjeni so Folio videz, nalaganje, navigacija, podrobnosti in ozki prikaz (pri 390 px `document.documentElement.scrollWidth ≤ innerWidth`), `data-task-id` na vrsticah/karticah, dostopna imena pogledov `Preglednica`/`Tabla` in stolpcev ter `aria-label="Pregled stanj opravil"`. | E2E: D04 `readonly()` (seznam zahtev + `/__test/state.saveRequests = 0`) in preveritev širine. |

## Izvedba in sledljivost

Predvidene implementacijske točke (izvedbeni agent jih lahko prilagodi, ne da
bi kršil pogojev): `src/favorites.ts` (shramba, validacija, predikati) in
uporaba v `src/App.tsx` (ProjectView), `src/TaskBoard.tsx`, `src/components.tsx`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | gumb + `aria-pressed`, neodvisnost po ID-ju | `tests/development/P07.spec.ts` D01 + lastni `tests/agent/` | `src/App.tsx` (vrstica), `src/TaskBoard.tsx` (kartica) | Ni izvedeno v fazi specifikacije; izvede implementer. |
| R02 | normaliziran zapis v `localStorage` | D03 + lastni test zapisa | `src/favorites.ts` | Ni izvedeno; preveri implementer. |
| R03 | obnova in toleranca zapisa | lastni `tests/agent/` (podvojeni/neznani ID) | `src/favorites.ts`, `src/App.tsx` | Ni izvedeno; preveri implementer. |
| R04 | neveljavni zapisi → ∅ brez prepisa | lastni `tests/agent/` (4 različice) | `src/favorites.ts` | Ni izvedeno; preveri implementer. |
| R05 | filter po `visible`, vrstni red | lastni test + D02 | `src/App.tsx` | Ni izvedeno; preveri implementer. |
| R06 | takojšen izbris, prazno stanje, izklop | D02 | `src/App.tsx` | Ni izvedeno; preveri implementer. |
| R07 | skupno stanje pogledov | D04 | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno; preveri implementer. |
| R08 | globalna množica, ponastavitev filtra | lastni `tests/agent/` | `src/App.tsx`, `src/navigation.ts` (uporaba) | Ni izvedeno; preveri implementer. |
| R09 | brisanje po projektu, `disabled` | lastni `tests/agent/` | `src/App.tsx` | Ni izvedeno; preveri implementer. |
| R10 | števec `X od M`, števci stolpcev | lastni `tests/agent/` | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno; preveri implementer. |
| R11 | `storage` sinhronizacija, izjema shrambe | lastni `tests/agent/` (dogodki + izjema) | `src/favorites.ts`, `src/App.tsx` | Ni izvedeno; preveri implementer. |
| R12 | brez API zapisov, ohranjeni videz in ozko | D04 `readonly()` + lastni test 390 px | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Ni izvedeno; preveri implementer. |

Ob izvedbi naj implementer v svoje zapise v `docs/agent/` vpiše imena
izvedenih testov in izide; ta tabela se ob morebitnem popravku specifikacije
dopolni z dokazili. Skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts`
morajo ostati zeleni.

## Odprta vprašanja in omejitve

- Specifikacija ne izbira razporeditve novih kontrol; dovolj je, da so
  dostopna imena, vloge in stanja iz dogovora o vmesniku izpolnjeni.
- V tej fazi niso bili izvedeni nobeni testi (naloga snovalca je branje in
  pisanje specifikacije). Vsi izidi v tabeli so zato »ni izvedeno«.
- Obseg ne vključuje novih zapisovalnih API-jev, sprememb `shared/`, `server/`,
  `tests/development/` ali odvisnosti; testne kontrole `/__test/` UI ne sme
  brati ali uporabljati.
- Razvojni primeri niso celoten obseg: končni testi lahko uporabijo poljubno
  število opravil (tudi 0 in >10), enake naslove, drugačno zaporedje in
  neznane ID-je v shrambi.
- Nejasnost, ki ostaja: ali naj povzetek `Pregled stanj opravil` šteje vsa ali
  vidna opravila — zahteve tega izrecno ne določajo (R10 ureja le števec
  priljubljenih in števce stolpcev table), zato se obstoječe vedenje ohrani.
