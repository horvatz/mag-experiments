# P07 – Priljubljena opravila in trajna shramba

Stanje: predaja implementerju, različica 1.0, 25. 9. 2026. Vir zahtev: `task/instructions.md` (R01–R12); izvirne zahteve veljajo tudi ob morebitni opustitvi v tem dokumentu. Prebrani so navodila, skupni tipi, relevantna koda, pravila videza in razvojni testi. Aplikacija in testi v tej vlogi niso bili zagnani.

## Problem in kontekst

Folio že prikazuje projekte, preglednico, tablo s tremi stanji in podrobnosti opravila v dialogu. Dodamo lokalne priljubljene, skupne preglednici in tabli ter trajno shranjene med osvežitvami. Ohranimo slovenski vmesnik, videz iz `docs/dizajn.md`, navigacijo, nalaganje in dostopnost. Podatki opravil ostanejo na javnem `/api/`; samo množica priljubljenih uporablja namenski localStorage. To je izrecna izjema naloge od splošne prepovedi nadomeščanja podatkov API-ja z localStorage.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project {id,name}` in `Task {id,projectId,title,description,status,assignee,dueDate}`. Vsa polja so nizi; `status` je `todo | in_progress | done`. Identiteta je izključno `id`, nikoli naslov, indeks ali položaj. Vhodi so GET `/api/projects`, GET `/api/projects/:projectId/tasks`, GET `/api/tasks/:id`, localStorage in dogodki `storage`. ID-je v URL-jih kodiramo z obstoječimi pripomočki.

Podatki so lahko prazni, z enim ali več kot deset opravili, poljubnimi enkratnimi ID-ji, enakimi naslovi, Unicode besedilom, ločili, veljavnimi datumi in drugačnim vrstnim redom. Vsako opravilo pripada svojemu projektu. Besedilo se izriše kot navadno besedilo; ne ustvarjamo kopij opravil iz shrambe.

Uporabnik preklopi posamezen ID, filtrira prikaz, odstrani priljubljene celotnega trenutnega projekta, zamenja pogled/projekt ali odpre podrobnosti. Nova dejanja učinkujejo takoj in nimajo potrditvenega dialoga oziroma faze preklica. Zapiranje podrobnosti z gumbom, Escape ali obstoječo navigacijo ne spreminja priljubljenih. Ob napaki shrambe se sprememba vseeno uveljavi v pomnilniku; ob napaki API-ja ostaneta obstoječa prikaz napake in ponovitev nalaganja.

## Zahteve in pravila

Oznake: `K = folio:favorites:v1`; `Tₚ` je celoten urejen seznam opravil trenutnega projekta iz API-ja; `Iₚ = {t.id : t ∈ Tₚ}`; `F` je globalna množica priljubljenih nizov; `q` je lokalni boolean filtra. `Vₚ = filter(Tₚ, t => !q || F.has(t.id))`; `X = |F ∩ Iₚ|`, `M = |Tₚ|`.

- `decode(raw)` vrne množico `ids` le, če se JSON razčleni v objekt z `version === 1`, `Array.isArray(ids)` in `ids.every(id => typeof id === 'string')`; sicer vrne `∅`. `null` oziroma manjkajoč ključ prav tako vrne `∅`. Neveljaven član razveljavi celoten zapis. Podvojitve se združijo; nizi se ne krajšajo, ne preimenujejo in ne izločajo glede na trenutno naloženi projekt. Dodatna polja veljavnega vhodnega objekta lahko ignoriramo.
- Preklop `i`: `F' = F △ {i}`. Odstranitev projekta: `F' = F \ Iₚ`. Po lokalnem dejanju poskusimo zapisati natanko obliko `{version:1,ids:[...F'].sort()}`; privzeti `sort()` primerja enote UTF-16, ne uporabljamo jezikovnega razvrščanja. Ob neuspešnem zapisu ostane `F'` v pomnilniku.
- Inicializacija: `F = decode(getItem(K))`, `q = false`, brez zapisa. Če branje vrže izjemo, začnemo z `F = ∅` in opozorilom. Preklop pogleda ohrani `(F,q)`; menjava projekta ohrani `F` in postavi `q = false`.
- `storage` z `event.key === K`: `F' = decode(event.newValue)`, brez zapisa, brez spremembe `q`. Drug ključ (tudi `key === null`) se ignorira. `newValue === null` pri pravem ključu izprazni množico. Dogodek nadomesti množico, ne združuje je s prejšnjo.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica/kartica ima gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed="true"` natanko tedaj, ko `id ∈ F`, sicer `"false"`. Gumb je zunaj povezave opravila. Klik spremeni samo ta ID, ne URL-ja in ne odpre dialoga; ohrani `data-task-id`. | D01 in S01: enaka naslova, različna ID-ja; oba pogleda. |
| R02 | Uspešen zapis pod K ima le `version:1` in `ids`; ID-ji so enkratni nizi, razvrščeni po UTF-16. Nobeno polje opravila se ne shrani. | D03 delno; S02 preveri celotno obliko in vrstni red z različnimi Unicode ID-ji. |
| R03 | Osvežitev obnovi veljaven zapis; podvojeni ID-ji štejejo enkrat. Neznani ID-ji ostanejo v F in v naslednjem zapisu, ne ustvarijo vrstic/kartic ter ne povečajo X. | D03 delno; S03 z dvojniki, drugim projektom in neznanim ID-jem. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna version, manjkajoči/neveljavni ids ali katerikoli neniz dajo prazno množico. Inicializacija ne prepisuje niti veljavnega nekanoničnega niti neveljavnega zapisa in ne odpove. | S04: matrika vrednosti in spremljanje `setItem`; šele uporabniška sprememba zapiše veljaven zapis. |
| R05 | Checkbox `Prikaži le priljubljena`, privzeto false, določa Vₚ. Preglednica ohrani izvorni vrstni red; tabla ohrani ta vrstni red znotraj vsakega stolpca. | D02 delno; S05 z drugačnim vrstnim redom in več kot deset opravili. |
| R06 | Pri `q=true` odstranitev priljubljenega takoj odstrani njegovo vrstico/kartico. Pri praznem Vₚ se pokaže `Ni priljubljenih opravil.`; filter in preklop pogledov ostaneta dostopna. | D02 in S06 v obeh pogledih, tudi prazni projekt; izklop filtra spet pokaže Tₚ. |
| R07 | Preglednica in tabla uporabljata isti F in q; menjavanje pogledov ne izgubi sprememb. Povezava še vedno odpre podrobnosti pravega ID-ja, tudi pri enakih naslovih. | D04 delno; S07 preveri oba prehoda z aktivnim filtrom in zapiranje podrobnosti. |
| R08 | Menjava projekta ohrani globalni F in ponastavi q na false. Osvežitev obnovi F iz shrambe in q=false. | S08: označi opravila dveh projektov, filtriraj, zamenjaj projekt, vrni se, osveži. |
| R09 | Gumb `Odstrani priljubljene tega projekta` uveljavi `F \ Iₚ`, tudi ob filtru. Onemogočen je natanko pri X=0. ID-ji drugih projektov in neznani ID-ji ostanejo. | S09: mešana množica, prazen projekt, pregled shrambe po odstranitvi. |
| R10 | Element `role="status"`, `aria-label="Število priljubljenih"` kaže natanko `Priljubljeno: X od M.` glede na celoten Tₚ, tudi pri filtru in M=0. Števec stolpca stanja s je število opravil v Vₚ s tem stanjem. | S10: brez/z aktivnim filtrom, prazen rezultat, preklop ID-ja in storage; neznani ID-ji ne štejejo. |
| R11 | Dogodek za K takoj nadomesti F z novo dekodirano vrednostjo; null izprazni, drug ključ se ignorira. Ni povratnega zapisa. Izjeme branja/zapisa ne prekinejo vmesnika; opozorilo ima `role="alert"` in vsebuje besedo `shramba`. Nadaljnje spremembe, filter in navigacija delujejo v pomnilniku. | S11: veljaven, neveljaven, podvojen, null in tuj ključ; ločeni izjemi dostopa/branja in zapisa, nadzor zapisov. |
| R12 | Dejanja priljubljenih ne pošljejo zapisovalnih zahtev API in ne spremenijo nobenega polja Task. Ohranijo Folio, nalaganje/ponovitev, navigacijo in ozki prikaz. Pri 390 px velja `document.documentElement.scrollWidth <= window.innerWidth`; notranje drsenje preglednice/table je dovoljeno. | D04 delno; S12 in skupne regresije, omrežni nadzor in primerjava opravil pred/po dejanjih. |

## Izvedba in sledljivost

Priporočena mesta sprememb, potrjena z branjem izhodišča:

- `src/App.tsx`: `App` je primeren lastnik globalne množice/napake shrambe ali uporabnik namenskega hooka v `src/`. `ProjectView` je že vezan na `key={project.id}`, zato njegov lokalni filter ob menjavi projekta naravno začne s false; sprememba `view` ga ne ustvari znova. F ne sme obstajati samo v tem ponovno ustvarjenem delu.
- `ProjectView` že nalaga celoten Tₚ. Iz njega izpeljemo X, M, omogočenost odstranitve in Vₚ; ne zamenjamo izvornega seznama s filtriranim. Obstoječi povzetek `aria-label="Pregled stanj opravil"` ostane in zaradi ohranitve izhodišča šteje celoten projekt.
- `src/TaskBoard.tsx`: `TaskBoard` prejme Vₚ ter stanje/dejanje priljubljenih. Sedanji `<a className="board-card">` obdaja vsebino kartice; novi gumb mora biti njegov sorojenec v kartici, ne njegov otrok. Ostanejo regija `Tabla opravil` in vsi trije poimenovani stolpci tudi pri prazni tabli; ob praznem filtriranem izidu dodamo zahtevano skupno sporočilo.
- `src/styles.css`: dopolnimo obstoječe gradnike/barve; kontrole se na ozkem zaslonu prelomijo. Ohranimo vidni fokus, drsenje `.table-scroll`/`.board-scroll`, nevtralne kartice, modri poudarek in navigacijo nad vsebino do 760 px. Zaščitimo tudi dolge ID-je/besedila pred razširitvijo strani.
- `src/main.tsx` uporablja React StrictMode. Inicializacija in poslušalec storage morata prenesti ponovitev inicializacije/učinkov brez samodejnega zapisa in puščanja poslušalcev. Zapis naj sledi lokalnemu dejanju, ne splošnemu učinku ob vsaki spremembi F, ki bi zapisoval tudi po dogodkih storage.

Spodnji S01–S12 so predlagani dodatni scenariji, ne že obstoječi ali izvedeni testi. D01–D04 so dejanska imena testov v `tests/development/P07.spec.ts`; njihov obseg je omejen. Vsi izidi spodaj pomenijo **ni izvedeno**. Implementer dejanske poti novih testov/kode, ukaze, rezultate in dokaze dopiše v svoje implementacijske zapiske v `docs/agent/`; to specifikacijo in njeno zgodovino spreminja prvotni avtor.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Preklop po ID, ločen gumb | D01; S01 oba pogleda, ponovni klik, dialog ostane zaprt | `src/App.tsx` vrstice v ProjectView; `src/TaskBoard.tsx` kartice | Ni izvedeno; prebrana koda trenutno še nima gumbov. |
| R02 | Kanonični zapis brez podatkov Task | D03 delno; S02 premešani ID-ji npr. `z`, `A`, `č`, `😀`, `\uE000` | Predlagani pomočnik/hook za shrambo v `src/`, uporabljen iz App | Ni izvedeno; helper še ni implementiran. |
| R03 | Obnova, deduplikacija, ohranitev neznanih | D03; S03 začetni zapis z dvojniki in neznanim ID-jem, reload, novo lokalno dejanje | Inicializacija globalnega F in serializer | Ni izvedeno. |
| R04 | Stroga validacija, nič začetnih zapisov | S04: odsoten ključ, `{`, `null`, `[]`, `{}`, version `2`/`"1"`, manjkajoči ids, ids kot niz, `["a",null]`/`[1]`; veljaven prazen in podvojen seznam | Dekodiranje ter inicializacija shrambe | Ni izvedeno. |
| R05 | Filter in izvorni vrstni red | D02; S05 0/1/>10 opravil, premešani ID-ji in stanja | `src/App.tsx` ProjectView izračun Vₚ; `src/TaskBoard.tsx` entries | Ni izvedeno. |
| R06 | Takojšnja odstranitev in prazni izid | D02; S06 zadnji priljubljeni v preglednici in tabli, nato izklop filtra | ProjectView prazni izid/vedno dostopne kontrole; TaskBoard | Ni izvedeno. |
| R07 | Skupno stanje in pravilne podrobnosti | D04 delno; S07 oba prehoda in enaka naslova; baseline `board navigation preserves the view and opens duplicate titles by ID without writes` | `App.tsx`, `TaskBoard.tsx`; obstoječa `navigation.ts` in `TaskDetails.tsx` | Ni izvedeno. |
| R08 | F globalen, q lokalni in netrajen | S08 oba projekta, povratek, reload z aktivnim filtrom | App globalno stanje; ProjectView lokalno stanje in key projekta | Ni izvedeno. |
| R09 | Odstranitev celotnega projekta, pravilna omogočenost | S09 npr. F={a,b,c,u}, Iₚ={a,b}, po odstranitvi F={c,u}, X=0, gumb disabled | ProjectView kontrola/izračun Iₚ; globalno dejanje odstranitve | Ni izvedeno. |
| R10 | Projektni in vidni števci | S10 primer X=2,M=5 pred/po vklopu filtra; stolpci iz Vₚ; M=0 | ProjectView status števca; TaskBoard `entries.length` | Ni izvedeno. |
| R11 | Sinhronizacija brez odzivnega zapisa, odpornost na izjeme | S11 dispatch StorageEvent za K z veljavnim/neveljavnim/null zapisom in tujim ključem, nadzor setItem; ločeno simuliran nedostopen getter/getItem/setItem | Globalni hook/pomočnik, listener s čiščenjem, opozorilo v App | Ni izvedeno. |
| R12 | Brez zapisov API/mutacij, ohranjen vmesnik | D04; S12 vsa nova dejanja + omrežni nadzor, 390 px in namizje; `tests/baseline.spec.ts`, `tests/api.spec.ts` | `App.tsx`, `TaskBoard.tsx`, `styles.css`; `api.ts` updateTask se za priljubljene ne uporabi | Ni izvedeno; vizualni pregled pripada implementerju. |

Predlagano preverjanje implementerja: `npm run lint`, `npm run build`, `npm test` (konfiguracija vključuje API, baseline namizje/mobilni prikaz, razvojne in `tests/agent/` teste). Lastni testi naj smiselno pokrijejo vrzeli S02–S12, zlasti validacijo, neznane ID-je, odstranitev projekta, storage in izjeme. Uporabi obstoječo infrastrukturo brez sprememb; samo testi lahko uporabljajo kontrolne poti. Pri dokazih navedi dejanski ukaz, izid in pot poročila/dnevnika. Nobeden od teh ukazov v specifikacijski fazi ni bil izveden.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj, ki bi preprečevala implementacijo. Besedilo opozorila razen besede `shramba`, ikona priljubljenega in razporeditev novih kontrol niso predpisani; sledijo obstoječemu videzu. Neveljavna vsebina shrambe sama po sebi ni izjema dostopa in ne zahteva opozorila.
- Ker ni predpisano drugače, filter ni shranjen niti v localStorage niti v URL. Trajnost med osvežitvami je pri nedostopni shrambi nemogoča; v tej napaki je zahtevan delujoč pomnilniški način z opozorilom. Trajanje opozorila po ponovni dostopnosti ni predpisano.
- Obstoječi nefiltrirani prazni projekt obdrži svoj prazni prikaz; pri aktivnem filtru velja zahtevano sporočilo tudi za projekt brez opravil. Obstoječi prikaz nalaganja/napake ne sme postati lažni prikaz »ni priljubljenih« pred prejemom opravil.
- Ne širimo navigacije med nezaključenim nalaganjem ali novih sočasnih sprememb podatkov prek obstoječih regresijskih zahtev. Dogodki storage iz R11 ostajajo obvezni.
- Dovoljene implementacijske spremembe so `src/`, lastni testi `tests/agent/` in lastni dokumenti v `docs/agent/`; infrastruktura, odvisnosti, strežnik, skupni tipi, navodila in skupni testi ostanejo nespremenjeni. UI ne uporablja `/__test/`, razvojnih testnih pripomočkov, drugih projektov ali oddaljenih storitev. Ta avtor piše samo `specification.md` in `specification-history.md`.
- V tej fazi je preverjena le skladnost specifikacije z branimi viri. Delovanje, videz in vsi testi so nepreverjeni; nedostopni končni testi niso bili izvedeni. Zgodovina sprememb: `docs/agent/specification-history.md`.
