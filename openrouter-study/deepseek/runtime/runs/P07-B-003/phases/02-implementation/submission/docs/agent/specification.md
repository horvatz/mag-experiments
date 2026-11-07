# Razvojna specifikacija — P07: Priljubljena opravila in trajna shramba

Predloga: task/specification-template.md. Zahteve: task/instructions.md (R01–R12).
Specifikacijo uporablja implementer; izidi testov se dopolnijo med izvedbo.

## Problem in kontekst

Uporabnik v Folio aplikaciji želi med pregledovanjem opravil označiti
posamezna opravila kot priljubljena, jih filtrirati in ohraniti izbiro med
osvežitvami strani. Začetni Folio zna bere projekte in opravila prek javnega
API-ja (`/api/projects`, `/api/projects/:id/tasks`) ter prikazuje preglednico
in tablo; priljubljenih še ne pozna.

Predvidena sprememba je v celoti v `src/`: lokalna množica priljubljenih ID-jev
v `localStorage`, kontroli za prikaz/odstranitev, števec in odpornost na
nedostopno shrambo. Strežnik, skupni tipi in testi izhodišča ostanejo enaki;
nobena sprememba priljubljenih ne sme klicati API-ja.

## Vhodi, dejanja in izidi

Podatkovna polja (shared/types.ts): `Task { id, projectId, title, description,
status, assignee, dueDate }`, `Project { id, name }`. Vsa dejanja so vezana na
`task.id` (enkraten niz znotraj odgovora), tudi pri enakih naslovih.

Dejanja:

- Klik na `Priljubljeno opravilo <id>` preklopi pripadnost ID-ja množici F in
  ne odpre podrobnosti opravila.
- Klik na checkbox `Prikaži le priljubljena` preklopi filter f.
- Klik na `Odstrani priljubljene tega projekta` odstrani iz F ID-je opravil
  trenutnega projekta.
- Dogodek `storage` za ključ `folio:favorites:v1` nadomesti F z novo vrednostjo.

Stanje: F = množica nizov (shranjena kot `{version:1, ids:[...]}`),
f ∈ {false, true} (privzeto false), pogled ∈ {table, board}, projekt iz URL-ja.
Uspeh: F in f se takoj odrazita v obeh pogledih. Preklic: drug klik preklopi
nazaj. Napaka: če branje/zapis `localStorage` vrže izjemo, aplikacija dela z F
v pomnilniku in prikaže opozorilo `role=alert` z besedo "shramba".

## Zahteve in pravila

Simbologi: T = opravila trenutnega projekta iz API-ja v izvornem vrstnem redu;
F = množica priljubljenih ID-jev (brez podvojenih); fav(i) ⇔ i ∈ F;
f = vključen filter; visible(t) ⇔ (¬f ∨ fav(t.id)).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica preglednice in kartica table ima gumb z dostopnim imenom `Priljubljeno opravilo <task.id>` in `aria-pressed=fav(id)`. Klik spremeni F samo za ta ID, ne odpre podrobnosti; enaki naslovi so neodvisni. Gumb je zunaj povezave opravila. | Testi: kliki na dva opravila z enakim naslovom; preverjanje aria-pressed, URL-ja/hash-a in odsotnosti podrobnosti. |
| R02 | Zapis v `localStorage` pod ključem `folio:favorites:v1` je JSON `{version:1,ids:[...]}`; `ids` so enkratni nizi, razvrščeni po UTF-16 (`sort()`), brez polj opravil. | Branje surove vrednosti shrambe po klikih; preverjanje tipov, unikatnosti in razvrstitve. |
| R03 | Ob nalaganju se F obnovi iz veljavnega zapisa. Podvojeni ID-ji se obravnavajo kot en, neznani (brez opravila v T) ostanejo v F in shrambi, ne ustvarijo pa izmišljenih opravil. | Vnaprej pripravljena shramba s podvojenim in neznanim ID-jem; preverjanje prikaza in ohranitve zapisa. |
| R04 | Manjkajoč ključ, neveljaven JSON, version ≠ 1, manjkajoč `ids` ali katerikoli element, ki ni niz, pomenijo F = ∅. Aplikacija se naloži brez napake in ob nalaganju ne prepiše shrambe. | Vnos vsake neveljavne oblike; preverjanje prazne množice in nespremenjene surove vrednosti. |
| R05 | f privzeto false. Ko je f true, preglednica in tabla prikažeta natanko {t ∈ T : fav(t.id)} v izvornem vrstnem redu; checkbox je `Prikaži le priljubljena`. | Testi: vklop filtra z mešano množico; primerjava ID-jev in vrstnega reda. |
| R06 | Odstranitev priljubljenega med aktivnim filtrom takoj odstrani opravilo iz prikaza. Ko ni vidnih rezultatov, se izpiše `Ni priljubljenih opravil.`, checkbox pa ostane omogočen za izklop filtra. | Test: vklop filtra z enim priljubljenim, klik na gumb, preverjanje sporočila in stanja checkboxa. |
| R07 | Preglednica in tabla uporabljata isto F in f; preklop pogleda ne izgubi sprememb. Podrobnosti so dosegljive prek veljavnega ID-ja; `data-task-id` ostane na vrsticah in karticah. | Test: sprememba v preglednici, preklop na tablo in nazaj; klik na povezavo opravila. |
| R08 | Menjava projekta ohrani F (globalno), f pa se ponastavi na false; tudi osvežitev obnovi F in postavi f = false. | Test: priljubljeno v projektu A, prehod na B in nazaj; osvežitev strani. |
| R09 | `Odstrani priljubljene tega projekta` odstrani natanko {i ∈ F : ∃t ∈ T, t.id = i}; ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen, ko {t ∈ T : fav(t.id)} = ∅. | Test z opravili dveh projektov in neznanim ID-jem; preverjanje F in `disabled`. |
| R10 | Element `role=status` z `aria-label="Število priljubljenih"` vedno kaže `Priljubljeno: X od M.`, kjer je X = |{t ∈ T : fav(t.id)}| in M = |T|, tudi ob aktivnem filtru. Števci stolpcev table štejejo vidna opravila. | Test: primerjava besedila pred/po filtru in ob spremembi F; branje števcev stolpcev. |
| R11 | Dogodek `storage` za `folio:favorites:v1` takoj nastavi F po pravilih R03/R04 iz `newValue` (null → F = ∅); dogodek za drug ključ se ignorira. Obdelava ne sproži povratnega zapisa. Ob izjemi branja/zapisa ostane aplikacija uporabna s F v pomnilniku in prikaže `role=alert` z besedo "shramba". | Testi: umetni `StorageEvent` (veljaven, null, drug ključ), preverjanje odsotnosti zapisa nazaj; simulirana izjema `localStorage`. |
| R12 | Vse spremembe priljubljenih so lokalne: noben klic `PATCH/POST/PUT/DELETE` na API in nobeno polje opravila se ne spremeni. Ohranjeni so videz Folio, nalaganje, navigacija in ozki prikaz; pri 390 px se stran ne razširi (notranje drsenje preglednice/table je dovoljeno). | Omrežni dnevnik med dejanji; vizualni/pretočni pregled 390 px; obstoječi testi izhodišča. |

Dogovor o vmesniku (obvezno): gumbi `Priljubljeno opravilo <id>` z
`aria-pressed=true/false`, ločeni od povezave opravila; checkbox
`Prikaži le priljubljena`; gumb `Odstrani priljubljene tega projekta`; element
`role=status` z `aria-label="Število priljubljenih"` in besedilom
`Priljubljeno: X od M.`; opozorilo shrambe `role=alert` z besedo "shramba".
Ohranijo se `data-task-id` na vrsticah/karticah, dostopna imena obstoječih
pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.

## Izvedba in sledljivost

Predvidena mesta izvedbe: `src/favorites.ts` (hook/stanje in shramba),
`src/App.tsx` (kontroli, filter, števec, povezava obeh pogledov),
`src/TaskBoard.tsx` in `src/components.tsx` (gumbi in opozorila), `src/styles.css`
(videz). Vsak pogled mora dobiti F/fav prek skupnega stanja, ne lastne kopije.

Ključne posledice obstoječe kode:

- `App.tsx` izriše `ProjectView` s `key={project.id}`, zato se stanje znotraj
  `ProjectView` (npr. f) ob menjavi projekta ponastavi samo od sebe; F mora
  živeti izven `ProjectView` (npr. v `App` ali v hooku na ravni modula), da
  R08 ohrani globalno množico.
- `navigation.ts` uporablja hash; preklop pogleda (`Tabla`/`Preglednica`) ne
  sme izgubiti F niti f, zato mora biti stanje neodvisno od pogleda (R07).
- `useResource.ts` bere izključno `/api/`; hook priljubljenih ne sme uvoziti
  razvojnih pomočnikov iz `tests/development/` in ne sme brati `/__test/`.
- Vrstice imajo `data-task-id` in povezavo `taskUrl(...)`, kartice pa
  `data-task-id` in povezavo `board-card`; gumb za priljubljeno mora biti
  zunaj teh povezav (R01, R07).

Razvojni testi, ki jih implementer lahko zažene (samo izvajanje, datoteke so
nespremenljive): `tests/development/P07.spec.ts` D01 (neodvisnost po ID-ju,
R01), D02 (filter in odstranitev, R05/R06), D03 (zapis in osvežitev, R02/R03),
D04 (ujemanje pogledov in odsotnost zapisov, R07/R12). Preostale pogoje
(R04, R09, R10, R11, R12 v celoti) je treba pokriti z lastnimi testi v
`tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Gumbi z aria-pressed, neodvisni po ID-ju, brez odpiranja podrobnosti | D01 + lastni test enakih naslovov | `src/favorites.ts`, `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno (dopolni implementer) |
| R02 | Shramba `{version:1,ids:[...]}`, enkratni nizi, sort() | D03 + lastni test razvrstitve | `src/favorites.ts` | Ni izvedeno |
| R03 | Obnova F, dedup, ohranitev neznanih ID-jev | Lastni test prednapolnjene shrambe | `src/favorites.ts` | Ni izvedeno |
| R04 | Neveljavni zapisi → F = ∅, brez prepisa ob nalaganju | Lastni testi petih oblik zapisa | `src/favorites.ts` | Ni izvedeno |
| R05 | Filter prikaže natanko priljubljena v izvornem vrstnem redu | D02 + lastni test vrstnega reda | `src/App.tsx` | Ni izvedeno |
| R06 | Takojšnja odstranitev med filtrom, sporočilo in omogočen checkbox | D02 + lastni test praznega rezultata | `src/App.tsx` | Ni izvedeno |
| R07 | Skupna F/f med pogledi, ohranjene podrobnosti in `data-task-id` | D04 + lastni test preklopa pogleda | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno |
| R08 | Menjava projekta ohrani F in ponastavi f; osvežitev enako | Lastni test prehoda projektov in reload-a | `src/App.tsx`, `src/favorites.ts` | Ni izvedeno |
| R09 | Odstranitev le ID-jev trenutnega projekta, disabled brez njih | Lastni test dveh projektov in neznanega ID-ja | `src/App.tsx`, `src/favorites.ts` | Ni izvedeno |
| R10 | `Priljubljeno: X od M.` za celoten projekt; števci stolpcev za vidna | Lastni test pred/po filtru in po spremembi F | `src/App.tsx`, `src/TaskBoard.tsx` | Ni izvedeno |
| R11 | `storage` dogodek (veljaven/null/drug ključ), brez povratnega zapisa, opozorilo ob izjemi | Lastni testi StorageEvent in simulirane izjeme | `src/favorites.ts`, `src/components.tsx` | Ni izvedeno |
| R12 | Brez zapisovalnih klicev, nespremenjena polja opravil, ohranjen videz in 390 px | D04 + `tests/baseline.spec.ts` + vizualni pregled | `src/` celota, `src/styles.css` | Ni izvedeno |

## Odprta vprašanja in omejitve

- Predpostavka: povzetek `Pregled stanj opravil` ostane vezan na vsa opravila
  projekta; R10 izrecno zahteva le štetje vidnih opravil v stolpcih table.
- Predpostavka: neznani ID-ji se ohranijo pri vsakem zapisu, ki ga sproži
  uporabnik (tudi pri odstranitvi priljubljenih projekta), in se ob morebitni
  kasnejši veljavnosti ne oživijo samodejno.
- Predpostavka: shramba je na voljo prek `window.localStorage`; če dostop ali
  klic vrže izjemo, se uporabi pomnilniška množica in eno opozorilo.
- Ne preverjeno v tej vlogi: vsi scenariji R01–R12 (avtor specifikacije ne
  izvaja testov). Povezave na dejanske dokaze doda implementer.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov niso
  del obsega; stanje filtra je lokalno trenutnemu projektu.
