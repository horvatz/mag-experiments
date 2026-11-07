# Razvojna specifikacija – P07: Priljubljena opravila in trajna shramba

Avtor: agent-specifikator (faza B, zaporedje specifikacija → implementacija → pregled).
Status: osnutek za izvajalca; polje dokazov v razdelku »Izvedba in sledljivost« je
načrt – izvajalec ga dopolni po dejanskem zagonu, ne označi neizvedenega kot uspešno.

## Problem in kontekst

Uporabnik v Folio želi označiti opravila kot priljubljena, jih filtrirati in
ohraniti izbiro med osvežitvami. Izhodišče (preverjeno v `src/`) nima nobene
logike priljubljenih ali `localStorage`: `ProjectView` v `src/App.tsx` bere
opravila projekta prek `useResource<Task[]>('/api/projects/:id/tasks')`,
prikazuje preglednico ali tablo (`src/TaskBoard.tsx`), podrobnosti odpre
`TaskDetails` glede na pot `#/projects/:pid/tasks/:tid` (`src/navigation.ts`).
Podatkovni tipi so v `shared/types.ts` (`Task`: `id`, `projectId`, `title`,
`description`, `status`, `assignee`, `dueDate`; `Project`: `id`, `name`).

Predvidena sprememba: v oba pogleda dodati ločen gumb Priljubljeno opravilo
`<id>` z `aria-pressed`, checkbox Prikaži le priljubljena, števec
Priljubljeno: X od M., gumb Odstrani priljubljene tega projekta ter trajno
množico v `localStorage` (ključ `folio:favorites:v1`), z upoštevanjem dogodka
`storage`. Vse je lokalno: brez zapisov na API, brez sprememb polj opravil,
obstoječi videz Folio, nalaganje, navigacija in ozki prikaz ostanejo.

## Vhodi, dejanja in izidi

### Podatki in simboli

| Simbol | Pomen |
| --- | --- |
| `KEY` | niz `folio:favorites:v1` |
| `F` | množica nizov (ID-jev) priljubljenih v pomnilniku; edina resnica UI-ja |
| `raw` | vrednost v `localStorage[KEY]` (`string` ali `null`) |
| `P`, `T_P` | trenutni projekt in njegova opravila iz `GET /api/projects/:id/tasks`, v vrstnem redu odgovora |
| `φ` | logični zastavica filtra (checkbox Prikaži le priljubljena), privzeto `false` |
| `visible` | `φ ? [t ∈ T_P : t.id ∈ F] : T_P` – ohrani vrstni red `T_P` |
| `X`, `M` | `X = \|{t ∈ T_P : t.id ∈ F}\|`, `M = \|T_P\|` |
| `sort16(xs)` | `xs.slice().sort()` – privzeto JS razvrščanje po UTF-16 kodnih enotah |
| `persist(F)` | `localStorage.setItem(KEY, JSON.stringify({version: 1, ids: sort16([...F])}))` |

Predikata:

* `valid(v) ⇔ v ≠ null ∧ typeof v = "object" ∧ v.version = 1 ∧ Array.isArray(v.ids) ∧ ∀x ∈ v.ids: typeof x = "string"`.
* `parse(raw) = {x : x ∈ JSON.parse(raw).ids}` (kot množica), če je `raw` niz in `valid(JSON.parse(raw))`; sicer `∅`. Neveljaven JSON se ujame brez izjeme.

Predpostavke: ID-ji opravil so enkratni nizi, naslovi pa so lahko enaki –
identiteta je izključno `id`. Shramba lahko vsebuje podvojene in trenutno
neznane ID-je; neznani ID-ji so dovoljeni in se ohranijo. Projekti so lahko
prazni, število opravil je poljubno (0, 1, > 10), besedila so navadno besedilo
z Unicode znaki. Aplikacija bere samo `/api/` in ne uvaža pripomočkov
razvojnih testov (`tests/development/`).

### Dejanja in pričakovano stanje

| Dejanje | Stanje po uspehu | Preklic / napaka |
| --- | --- | --- |
| Klik Priljubljeno opravilo `<id>` | `F := F △ {id}`; `persist(F)`; `aria-pressed` se obrne; podrobnosti se ne odprejo; drugi ID-ji in enaki naslovi nespremenjeni | Napaka zapisa: `F` se vseeno posodobi v pomnilniku, prikaže se opozorilo o shrambi; UI ostane uporaben |
| Vklop/izklop Prikaži le priljubljena | `φ := ¬φ`; `visible` se preračuna; v shrambo se ne piše | – |
| Klik Odstrani priljubljene tega projekta | `F := F \ {t.id : t ∈ T_P}`; `persist(F)`; gumb onemogočen, ko `X = 0` | Napaka zapisa kot zgoraj |
| Zamenjava projekta | `φ := false`; `F` ostane globalna in nespremenjena | – |
| Osvežitev strani | `F := parse(raw)`; `φ := false`; shramba se ob nalaganju ne prepiše | Napaka branja: `F := ∅` v pomnilniku, opozorilo o shrambi, aplikacija deluje |
| Dogodek `storage` | če `e.key = KEY`: `F := parse(e.newValue)` (`null → ∅`), brez povratnega zapisa; drug ključ se ignorira | – |

Robni primeri: ob neveljavnem `raw` je `F = ∅` in aplikacija ne odpove
(R04). Med aktivnim filtrom odstranitev priljubljenega takoj spremeni
`visible`; če je `visible = ∅`, se prikaže točno `Ni priljubljenih opravil.`,
checkbox pa ostane omogočen za izklop filtra (R06). `F` nikoli ne ustvari
izmišljenih opravil: `visible ⊆ T_P` (R03).

## Zahteve in pravila

Predikati so definirani zgoraj; posamezni testni primer ne nadomešča
splošnega pravila.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | V preglednici in na tabli ima vsak `t ∈ T_P` ločen gumb z dostopnim imenom `Priljubljeno opravilo <t.id>`, zunaj povezave opravila, z `aria-pressed = (t.id ∈ F)`. Klik preklopi natanko `t.id` in ne odpre dialoga; za `id₂ ≠ id₁` klik na `id₁` ne spremeni `(id₂ ∈ F)`; enaki naslovi so neodvisni | Razvojni D01, D04; lastni test z enakima naslovoma; ročni pregled DOM |
| R02 | Po vsakem `persist(F)` je `localStorage[KEY] = {"version":1,"ids":[...]}`; vsi elementi so nizi, enkratni in naraščajo po `sort16`; polja opravil se ne zapišejo | Razvojni D03; lastni test oblike, enkratnosti in vrstnega reda |
| R03 | Ob nalaganju in ob dogodku `storage` velja `F = parse(raw)`; podvojeni ID-ji se obravnavajo kot eden, neznani ostanejo v `F` (in v naslednjem zapisu), neznani ID-ji ne ustvarijo opravil (`visible ⊆ T_P`) | Lastni test: `{ids:["a","a","neznan"]}` → `F = {a, neznan}`, prikaz brez izmišljenih vrstic |
| R04 | `raw = null`, neveljaven JSON, `version ≠ 1`, manjkajoč `ids` ali katerikoli ne-niz v `ids` → `F = ∅`, brez izjeme in brez zapisa ob nalaganju | Lastni test z vsemi petimi variantami; preveritev, da se `raw` po nalaganju ne spremeni |
| R05 | Checkbox Prikaži le priljubljena je privzeto `false`; ob `φ = true` je `visible = [t ∈ T_P : t.id ∈ F]` v vrstnem redu `T_P` | Razvojni D02; lastni test vrstnega reda in privzetega stanja |
| R06 | Med aktivnim filtrom klik na priljubljeno opravilo takoj odstrani to vrstico/kartico iz `visible`; če `visible = ∅`, je prikazano točno `Ni priljubljenih opravil.` in checkbox ostane omogočen (izklop filtra vrne celoten seznam) | Razvojni D02; lastni test omogočenosti checkboxa in vrnitve seznama |
| R07 | Preglednica in tabla uporabljata isto `F` in `φ`; preklop pogleda (hash) ne izgubi sprememb v nobeno smer; podrobnosti se odprejo za pravilen `id` | Razvojni D04; lastni test preklopa v obe smeri; pripomoček `details` |
| R08 | Zamenjava projekta ohrani `F` (globalno) in nastavi `φ := false`; osvežitev obnovi `F = parse(raw)` in `φ := false` | Lastni test: priljubljeno v `web`, prehod na `launch`, vrnitev; osvežitev |
| R09 | Odstrani priljubljene tega projekta: `F := F \ {t.id : t ∈ T_P}`; ID-ji drugih projektov in neznani ID-ji ostanejo; gumb je onemogočen natanko takrat, ko `X = 0` | Lastni test z ID-ji dveh projektov in neznanim ID-jem; preveritev `disabled` |
| R10 | Element `role=status` z `aria-label="Število priljubljenih"` ima vedno besedilo točno `Priljubljeno: X od M.` za celoten trenutni projekt, tudi ob `φ = true`; števci stolpcev table štejejo `visible` po statusih | Lastni test števca ob filtru on/off; lastni test števcev stolpcev |
| R11 | `window` dogodek `storage` s `e.key = KEY` takoj nastavi `F := parse(e.newValue)`, `null` izprazni `F`, brez povratnega zapisa; drug ključ se ignorira. Izjema pri branju ali zapisu shrambe pusti aplikacijo uporabno v pomnilniku in prikaže `role=alert`, ki vsebuje `shramba` | Lastni test: `StorageEvent`, ključ `null`/tuj, oba `setItem` in `getItem` vržeta; preveritev odsotnosti zapisa ob dogodku |
| R12 | Spremembe priljubljenih ne pošljejo nobenega ne-GET zahtevka na `/api/` in ne spremenijo nobenega polja opravila; ohranjeni so Folio videz, nalaganje, navigacija in ozki prikaz (pri širini 390 px `document.documentElement.scrollWidth ≤ innerWidth`) | Razvojni D04 (`readonly`), `tests/baseline.spec.ts`; lastni test širine 390 px |

### Dogovor o vmesniku

* Gumbi: dostopno ime `Priljubljeno opravilo <id>`, `aria-pressed="true|false"`, postavljeni zunaj povezave opravila; `data-task-id` ostane na vrsticah in karticah.
* Checkbox: dostopno ime `Prikaži le priljubljena`. Gumb: `Odstrani priljubljene tega projekta` (onemogočen, ko `X = 0`).
* Števec: `role="status"`, `aria-label="Število priljubljenih"`, besedilo `Priljubljeno: X od M.`. Opozorilo shrambe: `role="alert"` in vsebuje besedo `shramba`.
* Ostanejo `aria-label="Pregled stanj opravil"`, dostopna imena obstoječih pogledov in stolpcev ter notranje drsenje preglednice/table pri 390 px. Besedilo in razporeditev novih kontrol, ki nista izrecno določena, sta svobodna.

## Izvedba in sledljivost

Predlagana razdelitev (izvajalec jo lahko prilagodi, meje ostanejo `src/`,
`tests/agent/`, `docs/agent/`):

| Datoteka | Odgovornost |
| --- | --- |
| `src/favorites.ts` (nov) | `KEY`, `parse`, `serialize`/`persist`, branje ob zagonu, naročnina na `storage`, stanje napake shrambe |
| `src/App.tsx` | `φ`, filtriranje `visible`, števec R10, gumb R09, prikaz opozorila |
| `src/TaskBoard.tsx` | gumbi R01 na karticah, števci stolpcev nad `visible` |
| `src/components.tsx` | skupni gumb Priljubljeno, opozorilo shrambe |
| `src/styles.css` | videz Folio, brez vodoravnega prelivanja pri 390 px |
| `tests/agent/` | lastni testi za R03, R04, R06–R12 (in morebitne dodatne) |

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | gumb po opravilu, `aria-pressed`, brez dialoga | D01, D04 + lastni test enakih naslovov | `src/App.tsx`, `src/TaskBoard.tsx` | načrtovano; izvajalec vpiše ukaz, izid in dnevnik |
| R02 | zapis `{version:1, ids:sort16(unique)}` | D03 + lastni test oblike | `src/favorites.ts` | načrtovano; izvajalec |
| R03 | `parse` ohrani neznane, podvojene strne | lastni test | `src/favorites.ts` | načrtovano; izvajalec |
| R04 | pet neveljavnih vhodov → `∅`, brez zapisa ob nalaganju | lastni test | `src/favorites.ts` | načrtovano; izvajalec |
| R05 | privzeto `false`; filtriranje v vrstnem redu izvora | D02 + lastni test | `src/App.tsx` | načrtovano; izvajalec |
| R06 | takojšnja odstranitev, točno besedilo, izklop filtra | D02 + lastni test | `src/App.tsx` | načrtovano; izvajalec |
| R07 | ista `F` in `φ` v obeh pogledih | D04 + lastni test preklopa | `src/App.tsx`, `src/TaskBoard.tsx` | načrtovano; izvajalec |
| R08 | menjava projekta/refresh ponastavi `φ`, ohrani `F` | lastni test | `src/App.tsx` | načrtovano; izvajalec |
| R09 | odstranitev samo ID-jev `T_P`, `disabled` pri `X = 0` | lastni test | `src/App.tsx` | načrtovano; izvajalec |
| R10 | `Priljubljeno: X od M.` neodvisno od `φ`; števci stolpcev = `visible` | lastni test | `src/App.tsx`, `src/TaskBoard.tsx` | načrtovano; izvajalec |
| R11 | `storage` uskladi brez povratnega zapisa; izjema → `alert` s `shramba` | lastni test | `src/favorites.ts`, `src/App.tsx` | načrtovano; izvajalec |
| R12 | ni ne-GET `/api/`, ni sprememb polj, 390 px brez prelivanja | D04 `readonly`, `tests/baseline.spec.ts`, lastni test | `src/`, `src/styles.css` | načrtovano; izvajalec |

Dokazi: izvajalec naj rezultate (ime testa, ukaz, izid) zapiše v svoje opombe
v `docs/agent/` in označi, kateri od R01–R12 so preverjeni, kateri delno in
kateri ne. Tega razdelka v fazi specifikacije nihče ni zagnal; razvojni testi
D01–D04 in `tests/baseline.spec.ts` v tem trenutku niso bili izvedeni.

## Odprta vprašanja in omejitve

* Točna postavitev in besedilo novih kontrol (razen predpisanih imen in
  besedil) nista določena; ohraniti je treba obstoječi dizajn in ozki prikaz.
* Dogodek `storage` se v istem dokumentu ne sproži sam od sebe; test R11 naj
  dogodek sproži sintetično (`StorageEvent`) ali z drugo stranjo/kontekstom.
  Prepisovanje `getItem`/`setItem` za simulacijo izjeme je dovoljeno v testu.
* Če branje shrambe vrže izjemo, velja `F = ∅` plus opozorilo; nadaljnji
  poskusi zapisa se prav tako ujamejo in ne smejo podreti UI-ja.
* Neznani ID-ji se pri zapisu ohranijo; R09 jih ne sme odstraniti.
* Omejitev obsega: brez sprememb `server/`, `shared/`, odvisnosti, skupnih
  testov in brez novih zapisovalnih API-jev; brez branja `/__test/` v UI-ju.
* Nejasnosti glede medsebojnega vpliva sočnih sprememb podatkov in nalaganja
  so izven obsega, kot določajo navodila.
