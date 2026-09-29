# P07 — Priljubljena opravila in trajna shramba

Status: pripravljeno za predajo implementerju po branju navodil, tipov, relevantne kode in razvojnih testov. Izvirne zahteve v `task/instructions.md` ostajajo obvezne. Aplikacija in testi v tej fazi niso bili zagnani.

## Problem in kontekst

Uporabnik želi lokalno označevati priljubljena opravila, prikazati samo priljubljena in jih ohraniti med osvežitvami ter projekti. Izhodišče že bere projekte in opravila, prikazuje preglednico/tablo ter odpira podrobnosti po ID-ju; priljubljenih še nima. Dopolnitev ohrani obstoječi Folio, slovenska poimenovanja, API za branje opravil in oba pogleda. Izrecna zahteva R02 dovoljuje localStorage samo za ID-je priljubljenih; podatki opravil ostajajo iz API-ja.

## Vhodi, dejanja in izidi

Vhodi so opravila trenutnega projekta z enkratnimi nizi `id`, podatki javnega API-ja, začetni zapis `folio:favorites:v1` in dogodki `storage`. Dejanja so preklop priljubljenosti po ID-ju, filter, brisanje priljubljenih trenutnega projekta, menjava pogleda/projekta in osvežitev. Spremembe so takojšnje; napaka shrambe ohrani uporabnost v pomnilniku in pokaže opozorilo. Preklic oziroma potrditveni dialog ni zahtevan.

Preverjeni tipi v `shared/types.ts`: `Project = {id: string, name: string}`; `Task` ima nize `id`, `projectId`, `title`, `description`, `assignee`, `dueDate` ter `status: 'todo' | 'in_progress' | 'done'`. Identiteta je izključno `id`; nobenemu od teh tipov ni treba dodajati polja priljubljenosti. Naslovi, opisi in imena se izrišejo kot navadno besedilo; veljavnih datumov se ne spreminja.

Obstoječe branje: `GET /api/projects`, `GET /api/projects/{encodeURIComponent(project.id)}/tasks`, `GET /api/tasks/{encodeURIComponent(taskId)}`. Ne predpostavljaj predpon ID-jev, števila opravil ali njihovega vrstnega reda. Neznani priljubljeni ID-ji ne zahtevajo dodatnega pridobivanja podrobnosti.

## Zahteve in pravila

Naj bo `T` izvorno urejen seznam vseh opravil trenutnega projekta, `P` množica njihovih ID-jev, `F` globalna množica priljubljenih in `q` filter. Vidno je `V = q ? T.filter(t => F.has(t.id)) : T`. Števec ima `X = |F ∩ P|`, `M = |T|`.

Formalna pravila:

- `valid(v) := v` je objekt, ki ni null ali polje, `v.version === 1`, `Array.isArray(v.ids)` in vsak element `v.ids` ima `typeof === 'string'`. Dodatna polja ne vplivajo na izbor ID-jev; ob pisanju se ne ohranijo. Prazni in Unicode nizi se obravnavajo kot nizi brez pretvarjanja ali krajšanja.
- `decode(raw) := new Set(JSON.parse(raw).ids)` samo pri veljavnem zapisu; pri `raw=null`, napaki razčlenjevanja ali neveljavnosti je rezultat prazna množica. En sam neniz zavrne celotni zapis. Branje/validacija ne zapisujeta ničesar, tudi pri podvojitvah ali neznanih ID-jih.
- Preklop `i ∈ P`: `F' = F △ {i}` (odstrani prisotnega oziroma doda odsotnega); ostali ID-ji ostanejo. Izbris projekta: `F' = F \\ P`, vedno glede na celoten `T`, ne le trenutni prikaz.
- Ob uporabniški spremembi množice se shrani `JSON.stringify({version: 1, ids: [...F'].sort()})`. Privzeti `sort()` zagotovi vrstni red kodnih enot UTF-16; ne uporabljaj jezikovnega ali številskega razvrščanja. Neznani ID-ji ostanejo tudi pri naslednjih zapisih.
- Dogodek z `event.key === 'folio:favorites:v1'`: `F' = decode(event.newValue)`; množica se nadomesti, ne združuje. Vsi drugi ključi se ignorirajo. `q` ostane isti. Dogodek ne povzroči `setItem` ali drugega povratnega zapisa.
- Menjava pogleda ohrani `(F,q)`; menjava projekta ohrani `F` in ponastavi `q=false`; osvežitev izvede `(decode(shramba), false)`. Napaka začetnega branja pomeni pomnilniški začetek s prazno množico; napaka pisanja ohrani že izračunani `F'`. Obe izjemi prikažeta opozorilo in omogočata nadaljnje spremembe v pomnilniku.
- Tabla razdeli `V` po statusu; vsak stolpec ohrani relativni vrstni red iz `T` in šteje samo svoje vidne elemente. Globalni vrstni red DOM table zaradi združevanja po statusu ni vrstni red celotnega `T`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica/kartica ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`; preklopi samo ID in ne odpre podrobnosti. | Enaka naslova, različna ID-ja; oba pogleda. |
| R02 | Zapis je JSON `{version:1,ids:[...]}` pod `folio:favorites:v1`; ID-ji so enkratni nizi v vrstnem redu UTF-16; brez polj opravil. | Pregled vsebine shrambe po spremembah. |
| R03 | Osvežitev obnovi `F`; podvojitve se združijo, neznani ID-ji ostanejo brez ustvarjanja opravil. | Prednastavljena shramba, osvežitev in menjava projekta. |
| R04 | Manjkajoča ali neveljavna vrednost pomeni prazno množico; nalaganje ne piše v shrambo in ne odpove. | Neveljaven JSON, različica, manjkajoči ids in nenizi. |
| R05 | Checkbox `Prikaži le priljubljena`, začetno false; filtrira trenutni projekt v izvornem vrstnem redu. | Primerjava vidnih ID-jev z `V`. |
| R06 | Odznačitev ob `q=true` takoj odstrani opravilo; prazen rezultat v obeh pogledih kaže `Ni priljubljenih opravil.` in omogoča izklop filtra. Enako velja za prazen projekt z aktivnim filtrom. | Odstranitev zadnjega vidnega priljubljenega, prazen projekt. |
| R07 | Oba pogleda delita `F` in `q`; preklop ju ohrani; povezave podrobnosti uporabljajo ID. | Preklopi pogledov in odpiranje podrobnosti. |
| R08 | Menjava projekta ohrani `F` in nastavi `q=false`; osvežitev obnovi `F` s `q=false`. | Dva projekta in osvežitev. |
| R09 | `Odstrani priljubljene tega projekta` izvede `F := F \\ P`; onemogočen natanko ko `F ∩ P` nima elementov. | Aktivni filter, drugi projekt in neznani ID-ji. |
| R10 | Element `role="status"`, `aria-label="Število priljubljenih"` kaže točno `Priljubljeno: X od M.` neodvisno od filtra; ostane tudi pri praznem rezultatu/projektu (`0 od 0`). Stolpci table štejejo vidna opravila. | Filtriran/nefiltriran in prazen projekt. |
| R11 | Storage za pravi ključ nadomesti `F` po isti validaciji; null izprazni; drug ključ ignorira; brez povratnega zapisa. Izjema branja/zapisa pokaže role=alert z besedo `shramba`, delovanje v pomnilniku ostane. | Dogodki storage, prestrežene izjeme in nadzor zapisov. |
| R12 | Dejanja priljubljenih ne pišejo na API in ne spreminjajo opravil; ohranijo Folio, nalaganje, navigacijo in širino strani pri 390 px. | Omrežje, regresije in pregled obeh pogledov pri 390 px. |

## Izvedba in sledljivost

Predlagana mesta izvedbe, preverjena glede na izhodiščno kodo:

- `src/App.tsx`: `App` ostane nameščen ob menjavi projekta; `ProjectView` ima `key={project.id}`, zato je primeren za projektni `q`, ne za lastništvo globalnega `F`. Globalno stanje in poslušalec `storage` naj živita nad tem ključem, npr. v hooku `src/useFavorites.ts`, uporabljenem iz `App` (predlog nove datoteke, še ne obstaja).
- `ProjectView`: iz `tasks` izračunaj celotni `P`, `X/M` in nato `V`; dodaj skupne kontrole ter gumbe vrstic zunaj `.task-link`. Obstoječe zgornje povzetke stanj in podatke o celotnem projektu ohrani iz `T`.
- `src/TaskBoard.tsx`: podaj `V` in skupno stanje/dejanje priljubljenosti. Trenutna `.board-card` je povezava čez celotno vsebino: novi gumb mora biti njen sorojenec znotraj istega `li[data-task-id]`, ne gumb v povezavi. Ohranijo se trije imenovani stolpci, tudi kadar so prazni; sporočilo aktivnega filtra je lahko dodano ob tabli.
- `src/styles.css`: uporabi obstoječe barve, odmike, fokus in prelom pri 760 px; dolge nove kontrole naj se prelomijo. Ohranita se notranje drsenje `.table-scroll`/`.board-scroll` in obstoječi dizajn iz `docs/dizajn.md`.
- `src/navigation.ts`, `src/TaskDetails.tsx`, `src/useResource.ts`: ohrani kodiranje ID-jev, hash navigacijo, zapiranje podrobnosti/fokus, nalaganje, ponovitev po napaki in zaščito pred prikazom podatkov prejšnjega projekta. `updateTask` v `src/api.ts` se za to nalogo ne uporablja.

`D01`–`D04` spodaj so dejanska imena obstoječih primerov v `tests/development/P07.spec.ts`; pokritost je delna. `S01`–`S08` so predlogi dodatnih scenarijev za implementerjeve teste v `tests/agent/`, ne že izvedeni testi:

- S01: po mešanem zaporedju preklopov preveri natančen zapis, edinstvenost, vrstni red UTF-16 (tudi velike/male črke in Unicode), odsotnost polj opravil ter ohranitev neznanega ID-ja.
- S02: pred nalaganjem nastavi manjkajoč ključ, pokvarjen JSON, `null`, polje, napačno/manjkajočo različico, manjkajoč `ids`, nepolje `ids`, mešanico niza in neniza; pričakuj prazno `F` brez zapisov. Ločeno veljaven zapis s podvojitvami/neznanim ID-jem ostane neprepisan, uporabniški preklop pa ga kanonizira.
- S03: izberi več opravil, vključi filter, preklopi oba pogleda, preveri vrstni red po stolpcih, pravilne povezave in `aria-pressed`; odstrani zadnjega, izključi filter ter preveri ponovno dostopnost vseh opravil. Ponovi s praznim projektom.
- S04: shrani ID-je dveh projektov in neznani ID; z aktivnim filtrom zamenjaj projekt in se vrni, nato osveži. `F` ostane, `q` se ob menjavi/osvežitvi ponastavi. Brisanje projekta odstrani vse njegove ID-je, ostale ohrani; gumb je ustrezno onemogočen tudi v praznem projektu.
- S05: preveri `X/M` pred/med filtrom, po preklopu, brisanju in dogodku storage; pri nič, enem in več kot deset opravilih. Preveri števce vseh stolpcev, tudi ničelne.
- S06: po inicializaciji pošlji storage dogodke s pravilnim ključem (veljaven, neveljaven, podvojen, neznan in null zapis) ter drugim ključem; preveri takojšnjo uskladitev gumbov, filtra in števcev ter nič povratnih zapisov. Velja isti validator kot pri inicializaciji.
- S07: ločeno povzroči izjemo pri `getItem` in `setItem` (tudi pri dostopu do shrambe); pričakuj `role=alert` z besedo `shramba`, nato uspešne preklop, filter, pogled, menjavo projekta in brisanje v pomnilniku. Ne zahtevaj trajnosti po ponovnem nalaganju ob nedostopni shrambi.
- S08: oba pogleda pri 390 px in običajni širini, daljša Unicode vsebina, tipkovnica in podrobnosti po ID-ju; preveri `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, ohranjen Folio, nič zapisovalnih zahtev API in nespremenjena polja opravil.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Samostojen preklop ID-ja, brez navigacije | D01: independent favorites by ID; S03, S08 | `App.tsx` vrstice; `TaskBoard.tsx` kartice; skupna množica | Ni izvedeno; mesta določena z branjem kode. |
| R02 | Kanoničen zapis ID-jev | D03: storage and refresh (delno); S01 | Predlagani `useFavorites.ts`: serializacija ob dejanju | Ni izvedeno. |
| R03 | Obnova, deduplikacija, ohranitev neznanih | D03 (delno); S02, S04 | Globalno stanje v `App`; dekodiranje shrambe | Ni izvedeno. |
| R04 | Celovita validacija brez samodejnih zapisov | S02 | Skupni validator in inicializacija | Ni izvedeno. |
| R05 | Projektni filter, relativni izvorni vrstni red | D02: filter and remove visible favorite; S03 | `ProjectView`: `q`, `V`; `TaskBoard` razdelitev | Ni izvedeno. |
| R06 | Takojšnja odstranitev in izhod iz praznega filtra | D02; S03 | `ProjectView`: kontrole, prazen prikaz; `TaskBoard` | Ni izvedeno. |
| R07 | Skupno stanje pogledov, podrobnosti po ID-ju | D04: view parity and no writes (delno); S03, S08; baseline navigacija | `App`, `ProjectView`, `TaskBoard`; obstoječi `taskUrl`/`TaskDetails` | Ni izvedeno. |
| R08 | Globalni `F`, ponastavitev projektnega `q` | S04 | `App` nad ključem projekta; `ProjectView` pod ključem | Ni izvedeno. |
| R09 | Odstranitev natanko `P`, stanje gumba | S04 | `ProjectView`: celoten `tasks`; skupno dejanje brisanja | Ni izvedeno. |
| R10 | Števec celote, števci vidnih stolpcev | S05 | `ProjectView`: status; `TaskBoard`: `entries.length` | Ni izvedeno. |
| R11 | Storage uskladitev brez zapisa, izjeme | S06, S07 | Globalni poslušalec, validator, varovano branje/pisanje in opozorilo | Ni izvedeno. |
| R12 | Lokalnost, nespremenjena opravila, regresije | D04; S08; `tests/baseline.spec.ts`, `tests/api.spec.ts` | `App.tsx`, `TaskBoard.tsx`, `styles.css`; ohranjeni API in navigacija | Ni izvedeno. |

Implementer naj izvede projektni `npm run check` (lint, build/typecheck, Playwright) in preveri, da so vključeni razvojni ter dodani lastni testi. Dejanska imena novih testov, ukaze, rezultate in poti dokazov naj poveže z R01–R12 v svojih implementacijskih dokumentih; reviewer v svojih preglednih dokumentih. Specifikacije drugih vlog ne spreminjata.

## Odprta vprašanja in omejitve

- Infrastruktura, odvisnosti, strežnik, skupni tipi, skupni testi in navodila so samo za branje. UI bere samo javni `/api/`, nikoli `/__test/`.
- Podatki so dinamični: nič, eno ali več kot deset opravil, poljubni enkratni ID-ji, enaki naslovi, Unicode in drugačen izvorni vrstni red. Oba projekta sta lahko prazna.
- Ohraniti je treba `data-task-id`, obstoječa dostopna imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`; nova dejanja so zunaj povezav opravil.
- Končni testi niso dostopni in niso izvedeni; razvojni primeri ne omejujejo zahtev. Razširjanje sočasne navigacije med nalaganjem ni predmet naloge.
- Pri `q=false` se ohranijo obstoječa prazna preglednica in vsi prazni stolpci table. Pri `q=true` se doda predpisano sporočilo brez odstranitve kontrol.
- Neveljavna vsebina shrambe je primer praznega začetnega stanja, ne izjema dostopa. Način umika opozorila po morebitni obnovi dostopa ni predpisan; opozorilo mora biti vidno po napaki, uporabnost pa ohranjena.
- Filter se ne zapisuje v URL ali trajno shrambo. Odpiranje in zapiranje podrobnosti v istem projektu ga ne ponastavlja. Nova opozorila ne smejo nadomestiti vsebine z uporabnimi opravili.
- Ni odprtih vprašanj, ki bi blokirala izvedbo. Pregled videza, zagoni testov in zbiranje izvajalnih dokazov so naloga naslednjih vlog.
