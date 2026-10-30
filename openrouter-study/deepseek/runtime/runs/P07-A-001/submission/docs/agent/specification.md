# Specifikacija P07 – Priljubljena opravila in trajna shramba

Različica 1.0 (2026-10-30). Predloga: `task/specification-template.md`.

## Problem in kontekst

Uporabnik želi v Folio označiti opravila kot priljubljena, jih filtrirati in
izbor ohraniti med osvežitvami. Izhodišče prikazuje preglednico in tablo ter
podrobnosti, bere pa samo javni API `/api/`. Sprememba doda lokalno množico
priljubljenih ID-jev (shramba `localStorage`), kontrolo filtra, gumb za
odstranitev priljubljenih trenutnega projekta, števec in opozorilo ob napaki
shrambe. API se ne spreminja; nobena sprememba priljubljenih ne piše na strežnik.

## Vhodi, dejanja in izidi

- Vhod: opravila trenutnega projekta iz `GET /api/projects/:id/tasks` (polja
  `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`)
  ter projekt iz `GET /api/projects`.
- Dejanja: klik na `Priljubljeno opravilo <id>` (preklop enega ID-ja, brez
  odpiranja podrobnosti), vklop/izklop `Prikaži le priljubljena`, klik na
  `Odstrani priljubljene tega projekta`, zunanji dogodek `storage`.
- Uspeh: množica priljubljenih se takoj odraža v obeh pogledih in v shrambi
  (razen pri zunanjem dogodku, ki se ne zapisuje nazaj).
- Napaka shrambe (branje/zapis vrže izjemo): stanje ostane uporabno v
  pomnilniku, prikaže se opozorilo `role=alert` z besedo »shramba«.
- Preklic/neveljaven vnos shrambe: prazna množica, brez prepisa shrambe.

## Zahteve in pravila

Simboli: `F` = trenutna množica priljubljenih ID-jev (nizov, enkratnih),
`T` = opravila trenutnega projekta v izvornem vrstnem redu, `K` = `T` ∩ `F`,
`filter` = stanje kontrolnega polja (privzeto `false`), `Prikazana` =
`filter ? [t ∈ T : t.id ∈ F] : T`. Shramba je `localStorage["folio:favorites:v1"]`
z vrednostjo `{version:1, ids:[...]}`.

Splošna pravila veljajo za vse primere; testni primeri so le dokaz.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`, zunaj povezave opravila; klik spremeni `F` samo za ta ID in ne odpre podrobnosti; enaki naslovi ostanejo neodvisni. | D01, A01, A11 |
| R02 | Ob vsakem zapisu: `ids = sort(unique(F))` po UTF-16, JSON `{version:1,ids}`; zapisujejo se samo ID-ji (brez polj opravil). | D03, A02 |
| R03 | Branje ob osvežitvi obnovi `F`; podvojeni ID-ji se obravnavajo kot eden; neznani ID-ji (brez opravila v projektu) se ohranijo v `F`/shrambi, ne ustvarijo pa izmišljenih opravil. | A02, A05 |
| R04 | Manjkajoč ključ, neveljaven JSON, `version !== 1`, manjkajoč `ids` ali katerikoli ne-niz v `ids` ⇒ `F = ∅`; aplikacija ne odpove in ob nalaganju ne zapiše shrambe. | A03 |
| R05 | `filter` privzeto `false`; ob `true` je `Prikazana` podmnožica `T` v izvornem vrstnem redu. | D02, A04 |
| R06 | Če `filter` in `Prikazana = ∅`, se prikaže `Ni priljubljenih opravil.`, kontrole pa ostanejo uporabne za izklop filtra; odstranitev priljubljenega med filtrom takoj posodobi prikaz. | D02, A04, A12 |
| R07 | Preglednica in tabla uporabljata isto `F` in `filter`; preklop pogleda ne izgubi stanja; podrobnosti se odprejo po ID-ju. | D04, A06 |
| R08 | Menjava projekta ohrani `F` (globalna, vključno z ID-ji drugih projektov) in ponastavi `filter=false`; osvežitev obnovi `F` iz shrambe in `filter=false`. | A05, A06 |
| R09 | `Odstrani priljubljene tega projekta`: `F' = F \ {t.id : t ∈ T}`; ID-ji drugih projektov in neznani ID-ji ostanejo; gumb je onemogočen, ko `K = ∅`. | A05, A07 |
| R10 | Element `role=status`, `aria-label="Število priljubljenih"` vedno kaže `Priljubljeno: X od M.`, kjer `X = |K|`, `M = |T|`, tudi ob aktivnem filtru; števci stolpcev table štejejo `Prikazana`. | A04, A06, A12 |
| R11 | `storage` dogodek za `folio:favorites:v1` takoj nastavi `F` po istih pravilih validacije (`newValue=null` ⇒ `∅`), drugi ključi se ignorirajo, dogodek ne sproži zapisa. Izjema branja/zapisa ⇒ stanje ostane v pomnilniku in `role=alert` z besedo »shramba«. | A08, A09 |
| R12 | Spremembe priljubljenih ne pošljejo nobene zahteve, ki ni GET, in ne spremenijo polj opravila; Folio, nalaganje, navigacija, ozki prikaz in `data-task-id` ostanejo. | D04, A01, A10 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | gumb z aria-pressed zunaj povezave | D01, A01 | `src/FavoriteButton.tsx`, `src/App.tsx` (celica vrstice), `src/TaskBoard.tsx` (kartica) | izvedeno; glej `docs/agent/verification.md` |
| R02 | sort(unique), samo `ids` | D03, A02 | `src/favorites.ts` (`serializeFavorites`) | izvedeno |
| R03 | obnova, dedupe, ohranitev neznanih | A02, A05 | `src/favorites.ts` (`parseFavorites`), `src/App.tsx` | izvedeno |
| R04 | neveljaven zapis ⇒ ∅, brez prepisa | A03 | `src/favorites.ts` (`parseFavorites`, `readFavorites`) | izvedeno |
| R05 | filter nad `T`, privzeto false | D02, A04 | `src/App.tsx` (`showFavoritesOnly`, `visibleTasks`) | izvedeno |
| R06 | prazno sporočilo + uporabne kontrole | D02, A04 | `src/App.tsx` (stanje `Ni priljubljenih opravil.`) | izvedeno |
| R07 | skupno stanje obeh pogledov | D04, A06 | `src/App.tsx` (stanje v `ProjectView`, pogled le URL) | izvedeno |
| R08 | globalna `F`, ponastavitev filtra | A05, A06 | `src/App.tsx` (`key={project.id}` na `ProjectView`), `src/favorites.ts` | izvedeno |
| R09 | odstranitev samo `K`, gumb onemogočen | A05, A07 | `src/App.tsx` (`removeProjectFavorites`) | izvedeno |
| R10 | števec `X od M`, stolpci `Prikazana` | A04, A06 | `src/App.tsx` (števec), `src/TaskBoard.tsx` | izvedeno |
| R11 | sync dogodka, brez povratnega zapisa, opozorilo | A08, A09 | `src/favorites.ts` (hook `useFavorites`), `src/App.tsx` (opozorilo) | izvedeno |
| R12 | brez zapisov API, ohranjena osnova | D04, A01, A10 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | izvedeno |

## Odprta vprašanja in omejitve

- Razporeditev novih kontrol ni predpisana; izbrana je vrstica pod naslovom
  `Opravila`, filter in gumb pa sta tudi v praznem stanju vidna.
- Pravilo R10 za števce stolpcev table se bere kot: stolpci štejejo
  `Prikazana`; skupni povzetek stanj ostane vezan na vsa opravila projekta.
- Razvojni testi P07 (D01–D04) so na voljo le za branje; lastni testi so v
  `tests/agent/` in pokrivajo tudi R03, R04, R08–R11, ki jih D-testi ne zajamejo.
- Nedostopni končni ocenjevalni testi niso bili izvedeni in niso navedeni kot
  uspešni.

## Zgodovina sprememb specifikacije

- 1.1 (2026-10-30): med izvedbo dodana lastna testa A11 (neodvisnost enakih
  naslovov, R01) in A12 (prazen projekt, R06/R10); povezave v tabelah
  dopolnjene. Vsebinskih sprememb zahtev ni bilo.
