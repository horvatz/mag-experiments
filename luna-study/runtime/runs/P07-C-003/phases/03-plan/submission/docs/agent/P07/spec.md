# P07: Priljubljena opravila in trajna shramba

**Stanje:** specifikacija, različica 1.0  
**Vir zahtev:** [`task/instructions.md`](../../../task/instructions.md), R01–R12  
**Pot funkcionalnosti:** `docs/agent/P07` (`.specify/feature.json`)

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali na tabli. Začetni vmesnik omogoča navigacijo do projekta in podrobnosti opravila, ne omogoča pa označevanja priljubljenih ali njihovega filtriranja. Uporabnik želi označiti opravila neodvisno od njihovega naslova, ohraniti izbor po osvežitvi ter ga uporabljati v obeh pogledih.

Izhodiščna koda nalaga projekte in opravila prek javnega `/api/`: seznam v [`src/App.tsx`](../../../src/App.tsx), kartice na [`src/TaskBoard.tsx`](../../../src/TaskBoard.tsx), podrobnosti po ID-ju na [`src/TaskDetails.tsx`](../../../src/TaskDetails.tsx). Vmesnik ohrani potrjeni dizajn Folio iz [`docs/dizajn.md`](../../dizajn.md), slovenska poimenovanja, obstoječo navigacijo, dostopna imena, delovanje nalaganja in odzivnost. Priljubljeni ne spreminjajo polj opravil ali podatkov API-ja.

Obseg sprememb je določen v [`PROJECT_RULES.md`](../../../PROJECT_RULES.md) in navodilih: aplikacijska koda v `src/`, lastni testi v `tests/agent/` in dokumenti v `docs/agent/`. Strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. `/__test/` je namenjen samo testom. Za priljubljene je izrecna izjema R02: lokalno se hranijo samo ID-ji.

## Vhodi, dejanja in izidi

| Vhod ali dejanje | Pogoj in izid |
| --- | --- |
| Seznam opravil projekta | Obstoječi API vrne opravila s polji izhodiščnega tipa. ID določa identiteto; enaka naslova ne združuje. Vrstni red API-ja je izvorni vrstni red. Prazni seznami so veljavni. |
| Shramba priljubljenih | Ključ `folio:favorites:v1` vsebuje objekt JSON z `version: 1` in `ids`, poljem nizov. V pomnilniku se ID-ji obravnavajo kot množica; neznani ID-ji ostanejo shranjeni, a ne ustvarijo opravila. |
| Klik gumba priljubljenega opravila | Preklopi samo njegov ID, posodobi `aria-pressed` in shrani množico. Gumb je ločen od povezave opravila; klik ne odpre podrobnosti. |
| Checkbox `Prikaži le priljubljena` | Vklop omeji prikaz na priljubljena opravila trenutnega projekta. Filter je lokalno stanje vmesnika. |
| `Odstrani priljubljene tega projekta` | Odstrani ID-je vseh opravil celotnega trenutnega projekta, tudi če filter kakšno skrije. ID-ji drugih projektov in neznani ID-ji ostanejo. |
| Menjava pogleda/projekta | Menjava pogleda ohrani množico in filter. Menjava projekta ohrani globalno množico in filter ponastavi. Osvežitev obnovi množico, filter pa je izklopljen. |
| Dogodek `storage` | Za pravi ključ uporabi ista pravila razčlenjevanja; `newValue === null` pomeni prazno množico. Drug ključ se ignorira. Dogodek ne sproži zapisa. |
| Neveljaven zapis ali izjema shrambe | Neveljaven zapis da prazno začetno množico; nalaganje ga ne prepiše. Izjema pri branju/pisanju ne ustavi vmesnika: priljubljeni delujejo v pomnilniku, prikaže pa se opozorilo `role="alert"`, ki vsebuje besedo »shramba«. |

Dejanja priljubljenih se uporabijo takoj; potrditvenega ali preklicnega koraka zahteve ne določajo. Navigacija, zapiranje podrobnosti ali preklop pogleda ne razveljavi preklopa. Klik istega ID-ja ga lahko znova preklopi. Napake nalaganja podatkov ostanejo obravnavane po obstoječem vedenju aplikacije.

## Pravila stanja

Naj bodo `P` trenutni projekt, `T(P)` njegov celoten urejen seznam naloženih opravil, `I(T)` množica njihovih ID-jev, `G` globalna množica priljubljenih ID-jev, `F` stanje filtra in `V` pogled. `G` lahko vsebuje neznane ID-je.

1. **Preklop ID-ja `i`:** `G' = G △ {i}`. Spremenijo se samo članstvo ID-ja `i`, njegova oznaka `aria-pressed` in zapis shrambe. Naslov ni ključ.
2. **Shranjena oblika:** uporabniški zapis je JSON `{ "version": 1, "ids": [...] }`; `ids` vsebuje vsak ID iz `G` natanko enkrat in je urejen po UTF-16 (privzeti leksikografski vrstni red nizov JavaScripta). Polja opravil niso del zapisa. Samo nalaganje ne sproži zapisa.
3. **Razčlenjevanje:** zapis je veljaven, če je objekt JSON z `version === 1` in poljem `ids`, ki vsebuje samo nize. Podvojeni ID-ji štejejo enkrat, neznani nizi se ohranijo. Manjkajoč ključ, neveljaven JSON, napačna različica, manjkajoče/neveljavno `ids` ali neniz v polju dajo prazno množico.
4. **Vidna opravila:** `Prikaz(T,G,F) = T`, kadar je `F = false`; sicer `Prikaz(T,G,F) = [t ∈ T | t.id ∈ G]`. Filtriranje ohrani vrstni red. Tabla ta ista vidna opravila razporedi v obstoječe stolpce po stanju.
5. **Števci:** `X = |{t ∈ T(P) : t.id ∈ G}|`, `M = |T(P)|`. Status vedno prikaže `Priljubljeno: X od M.`. Števec stolpca table je število vidnih opravil v njem.
6. **Brisanje projekta:** `G' = G \ I(T(P))`. Gumb je onemogočen, ko je `G ∩ I(T(P))` prazna množica. Filter pri brisanju ostane; če ni rezultatov, se pokaže prazno stanje in filter je mogoče izklopiti.
7. **Prehodi:** sprememba `V` ne spremeni `G` ali `F`; sprememba `P` ohrani `G` in nastavi `F := false`; ponovni zagon obnovi `G` iz shrambe in začne z `F := false`. Dogodek `storage` za pravi ključ nastavi `G` po razčlenjevanju, brez povratnega zapisa.
8. **Napaka shrambe:** ob izjemi branja se začetno stanje vodi v pomnilniku; ob izjemi zapisa se posodobljeni `G'` ohrani v pomnilniku. Vmesnik ostane uporaben in pokaže opozorilo. Napaka razčlenjevanja ni izjema shrambe.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako prikazano opravilo v preglednici in na tabli ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`, postavljen zunaj povezave opravila. Klik spremeni samo ID, ne odpre dialoga; enaki naslovi ostanejo neodvisni. | D01; dopolniti z enakima naslovoma in obema pogledoma. |
| R02 | `folio:favorites:v1` hrani različico 1 z enkratnimi nizi ID-jev, urejenimi po UTF-16; brez polj opravil. | D03 delno; preveriti obliko, vrstni red, dvojnike in vsebino. |
| R03 | Osvežitev obnovi množico; dvojniki štejejo enkrat, neznani ID-ji ostanejo, brez lažnih opravil. | D03 delno; dodatni primer podvojenega in neznanega ID-ja. |
| R04 | Manjkajoč ključ, neveljaven JSON/različica/polje ali neniz dajo prazno stanje brez sesutja in brez zapisa ob nalaganju. | Ločeni primeri neveljavnih vrednosti; prestrezanje zapisov ob začetnem nalaganju. |
| R05 | Checkbox `Prikaži le priljubljena` je privzeto izklopljen; vklop filtrira trenutni projekt in ohrani vrstni red. | D02 delno; začetna vrednost, vrstni red in izolacija projekta. |
| R06 | Odznačeno opravilo takoj izgine iz aktivnega filtra. Pri nič rezultatih piše `Ni priljubljenih opravil.` in filter je mogoče izklopiti. | D02. |
| R07 | Oba pogleda delita množico in filter; preklop ne izgubi stanja. Podrobnosti ostanejo dostopne po pravilnem ID-ju. | D04 delno; preklop nazaj, filter in podrobnosti po ID-ju. |
| R08 | Menjava projekta ohrani globalno množico in izklopi filter; osvežitev obnovi množico in začne z izklopljenim filtrom. | Dodatni prehod projekta ter reload. |
| R09 | Brisanje odstrani samo ID-je opravil trenutnega projekta; ohrani ID-je drugih projektov in neznane. Gumb brez projektnih priljubljenih je onemogočen. | Dodatni scenarij dveh projektov, neznanega ID-ja in onemogočenega gumba. |
| R10 | `role="status"`, `aria-label="Število priljubljenih"` vedno kaže celotni `X` in `M`; števci table štejejo vidna opravila. | Dodatni scenarij pred/med filtrom in z nič opravili; preveriti stolpce table. |
| R11 | Dogodek pravega ključa uskladi množico; `null` jo izprazni, drug ključ se ignorira, brez povratnega zapisa. Izjeme pri branju/pisanju pustijo UI uporaben v pomnilniku ter pokažejo alert z besedo »shramba«. | Dodatni dogodki za veljaven/neveljaven zapis, `null`, drug ključ in izjeme get/set. |
| R12 | Spremembe priljubljenih ne zapisujejo v API in ne spreminjajo polj opravil. Ohranjeni so Folio, nalaganje, navigacija, `data-task-id`, imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"` in stran brez širjenja pri 390 px; notranje drsenje je dovoljeno. | D04 delno za zapise/širino; regresija nalaganja, navigacije, detajlov, dostopnih imen in atributov. |

## Uporabniški scenariji in uspeh

1. **Označi opravilo:** v kateremkoli pogledu uporabnik preklopi priljubljenost; spremeni se le izbrani ID, gumb odraža stanje, podrobnosti se ne odprejo. Ponovni klik stanje preklopi nazaj.
2. **Obnovi izbor:** osvežitev vrne ID-je iz veljavne shrambe. Neznan ID ne ustvari opravila; napačen zapis pusti varno prazno stanje brez samodejnega popravnega zapisa.
3. **Omeji prikaz:** filter pokaže priljubljena opravila projekta v izvornem vrstnem redu. Odznačitev zadnjega vidnega opravila izprazni seznam, kontrola za izklop pa ostane dostopna.
4. **Upravljaj izbor med projekti:** menjava projekta/pogleda ne izgubi globalnih priljubljenih. Brisanje odstrani samo priljubljene trenutnega projekta. Filter se po menjavi projekta in po osvežitvi izklopi.
5. **Nadaljuj ob nedosegljivi shrambi:** izjema ne ustavi interakcij; stanje se vodi v pomnilniku, dostopno opozorilo pa pove, da shramba ni na voljo. Oddaljeni podatki ostanejo nespremenjeni.

Pogoji R01–R12, dogovorjena dostopna imena/ARIA pogodba in Folio dizajn morajo ostati izpolnjeni. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Pri 390 px se celotna stran ne razširi po širini; notranje drsenje preglednice/table je dovoljeno. Testni API lahko vrne nič, eno ali več kot deset opravil, različne enkratne ID-je, enake naslove, različen vrstni red, veljavne koledarske datume, prazne projekte in navadno besedilo z Unicode znaki/ločili. Polja ostanejo taka kot v izhodiščnih tipih. Aplikacija bere samo `/api/`; novih zapisovalnih API-jev ni.

## Izvedba in sledljivost

Izhodiščna koda je pregledana, implementacije P07 pa v tej fazi ni. Koda spodaj navaja obstoječa mesta razširitve, ne trdi, da je zahteva izpolnjena. [`tests/development/P07.spec.ts`](../../../tests/development/P07.spec.ts) vsebuje D01–D04; pregledal sem jo, vendar je v koraku Specify nisem zagnal. Dodatni scenariji so predvidena preverjanja, ne obstoječi ali izvedeni testi. Po implementaciji je treba vnesti dejanska imena zagnanih testov in dokazila.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Gumb in stanje po ID-ju, ne naslovu. | D01; dopolnitev za enake naslove. | [`src/App.tsx`](../../../src/App.tsx) `ProjectView`; [`src/TaskBoard.tsx`](../../../src/TaskBoard.tsx) `TaskBoard`. | Ni izvedeno; Specify faza. |
| R02 | Shranjena različica, unikatni in urejeni ID-ji. | D03 delno; oblika/vrstni red. | `src/` — logika shrambe priljubljenih (mesto določi načrt); `ProjectView`. | Ni izvedeno; Specify faza. |
| R03 | Obnova, dvojniki, neznani ID-ji. | D03 delno; dodatni robni primer. | `src/` — razčlenjevanje shrambe in seznam v `ProjectView`. | Ni izvedeno; Specify faza. |
| R04 | Varno prazno stanje brez začetnega zapisa. | Dodatni neveljavni JSON/vrednosti. | `src/` — razčlenjevanje in začetno stanje priljubljenih. | Ni izvedeno; Specify faza. |
| R05 | Projektni filter, vrstni red, privzeto izklopljen. | D02 delno; začetno stanje in več ID-jev. | [`src/App.tsx`](../../../src/App.tsx) `ProjectView`; [`src/TaskBoard.tsx`](../../../src/TaskBoard.tsx). | Ni izvedeno; Specify faza. |
| R06 | Takojšnje skrivanje in prazno stanje z izklopom filtra. | D02. | `src/App.tsx` `ProjectView`, kontrole in prazno stanje. | Ni izvedeno; Specify faza. |
| R07 | Skupna množica/filter in podrobnosti po ID-ju. | D04 delno; nazaj, filter, detajli. | `src/App.tsx`, `src/TaskBoard.tsx`, [`src/TaskDetails.tsx`](../../../src/TaskDetails.tsx), [`src/navigation.ts`](../../../src/navigation.ts). | Ni izvedeno; Specify faza. |
| R08 | Globalna množica, filter ponastavljen ob projektu/reloadu. | Dodatni menjava projekta in reload. | `src/App.tsx` ter stanje priljubljenih v `src/`. | Ni izvedeno; Specify faza. |
| R09 | Briše le ID-je celotnega trenutnega projekta. | Dodatna dva projekta in neznan ID. | `src/App.tsx` `ProjectView`; operacija množice v `src/`. | Ni izvedeno; Specify faza. |
| R10 | Celotni projektni števec; vidni števci stolpcev. | Dodatno pred/med filtrom in prazen projekt. | `src/App.tsx` status; `src/TaskBoard.tsx` stolpci. | Ni izvedeno; Specify faza. |
| R11 | Storage dogodki brez zapisa nazaj; fallback in alert. | Dodatni dogodki ter izjeme `localStorage`. | `src/` — logika shrambe/dogodkov; `src/App.tsx` status/alert. | Ni izvedeno; Specify faza. |
| R12 | Brez API zapisov/sprememb polj; Folio in ozka širina. | D04 delno; regresijski scenariji R12. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, [`src/api.ts`](../../../src/api.ts). | Ni izvedeno; Specify faza. |

## Odprta vprašanja in omejitve

- Zahteve določajo podatkovno obliko, ID-semantiko, besedila in vedenje filtrov; odprtega funkcionalnega vprašanja, ki bi zahtevalo odločitev uporabnika, ni.
- R02 ne pove, ali so dodatna polja ob veljavnem objektu dovoljena. Sprejemni pogoj zahteva navedeni `version` in veljavno `ids`; zapisovalnik shrani samo ti polji.
- Položaj novih kontrol in drugo besedilo nista predpisana; sledita Folio dizajnu in ne uvajata dodatnih funkcij.
- D01–D04 pokrivajo le del zahtev in niso dokaz uspeha. V tej fazi niso bili zagnani; noben pogoj ni označen kot implementiran ali uspešno preverjen. Končna sledljivost mora navesti dejansko izvedena preverjanja in omejitve.
- Navigacije med nedokončanim nalaganjem in sočasnih sprememb podatkov brez osvežitve se ne širi prek obstoječih regresijskih zahtev. Množica ID-jev se trajno hrani lokalno, kot določa R02; preostalo stanje funkcionalnosti je lokalno trenutnemu projektu.
