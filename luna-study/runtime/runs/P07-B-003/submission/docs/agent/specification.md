# Specifikacija: priljubljena opravila in trajna shramba

## Problem in kontekst

Folio nalaga projekte in opravila iz javnega API-ja, izbira projekt prek navigacije ter opravila prikazuje v preglednici ali tabli. Dodamo priljubljene, prepoznane po ID-ju, lokalni filter in trajno shranjevanje. Obstoječe poimenovanje, postavitev, nalaganje, navigacija in podatkovni API ostanejo del sprejema; priljubljenost ne spremeni opravila.

## Vhodi, dejanja in izidi

Vhod je seznam opravil trenutnega projekta (`id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`) iz `GET /api/projects/{id}/tasks` in vrednost `localStorage` ključa `folio:favorites:v1`. Uporabnik lahko preklopi priljubljenost opravila, vključi/izključi filter, počisti priljubljene projekta ali zamenja pogled/projekt. Uspešna sprememba posodobi pomnilniško množico in poskusi shraniti samo ID-je. Osvežitev obnovi veljavno shrambo; filter se ne obnovi. Nalaganje samo po sebi ne prepiše ključa. Neveljavna shramba pomeni prazno začetno množico, izjema shrambe pa ne sme onemogočiti dela v pomnilniku; ob njej je prikazano opozorilo. Podrobnosti ostanejo dosegljive po obstoječi povezavi opravila.

## Zahteve in pravila

Oznake: `F` je množica priljubljenih ID-jev; `T` je seznam opravil trenutnega projekta v vrstnem redu API-ja; `P={t.id | t∈T}`; `q` je lokalni filter; `V=[t∈T | q=false ∨ t.id∈F]`. `IDs(T)` pomeni ID-je opravil v T. ID je identiteta opravila, naslov ni identifikator. Veljaven shranjeni objekt ima `version === 1`, polje `ids`, ki je polje nizov; normalizacija odstrani podvojitve, neznane ID-je pa ohrani. Nizi se razvrstijo po leksikografskem vrstnem redu UTF-16 (privzeti vrstni red `Array.sort()` za nize). Vrednost ob zapisu je natanko JSON `{version:1,ids:[...F razvrščen...]}`. Ob predpostavki enoličnih ID-jev opravil je število priljubljenih projekta `X=|F∩P|`, skupno število opravil pa `M=|P|`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed` glede na članstvo ID-ja v F. Klik preklopi `F' = F △ {id}` (simetrična razlika), ne sledi povezavi in ne odpre podrobnosti. Enaka naslova ostaneta neodvisna. | V obeh pogledih klikaj opravila z enakim naslovom in preveri gumb, drugo opravilo ter URL/dialog. |
| R02 | Vsaka uspešna uporabniška sprememba shrani ključ `folio:favorites:v1` kot `{version:1,ids:[...]}`; ID-ji so enkratni nizi, UTF-16 razvrščeni. V shrambi ni polj opravila. | Po dodajanju, odstranitvi in več ID-jih preglej surovo vrednost ključa. |
| R03 | Zagon sprejme veljaven zapis, odstrani podvojitve in ohrani neznane ID-je. Neznani ID-ji se ne prikažejo kot izmišljena opravila. | Osveži z zapisom z duplikatom in neznanim ID-jem; preveri prikaz in zapis po naslednji spremembi. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna različica, manjkajoče/nepolje `ids` ali vsaj en neniz v `ids` dajo `F=∅`. Nalaganje ne prepiše shrambe. | Za vsak neveljaven primer zaženi aplikacijo; preveri prazen števec in nespremenjeno surovo vrednost. |
| R05 | Ob zagonu in vsaki menjavi projekta je `q=false`. Pri `q=true` je `V` priljubljena podmnožica T v izvornem vrstnem redu. | Preveri privzeti checkbox in vrstni red po vklopu filtra. |
| R06 | Odstranitev ID-ja iz F med aktivnim filtrom takoj odstrani pripadajoče opravilo iz V. Če je V prazen, pokaži točno `Ni priljubljenih opravil.` in omogoči izklop filtra. | Odstrani zadnjo vidno priljubljeno opravilo v preglednici in tabli; preveri prazno stanje in uporabno kontrolo filtra. |
| R07 | Preglednica in tabla izrišeta isto V iz istega F in q; menjava pogleda ohrani F in q. Povezava do podrobnosti še vedno cilja opravilo po ID-ju. | Uredi priljubljene, menjaj pogled in odpri opravilo z enakim naslovom kot drugo. |
| R08 | F je globalen med projekti. Menjava projekta ga ohrani in nastavi `q=false`; osvežitev obnovi F iz shrambe in začne z `q=false`. | Filtriraj, zamenjaj projekt, vrni se in nato osveži. |
| R09 | Gumb odstrani iz F samo ID-je trenutnega projekta: `F' = {id ∈ F | id ∉ P}`. Onemogočen je natanko, ko `F∩P=∅`. Neznani ID-ji in ID-ji drugih projektov ostanejo. | Z mešanico ID-jev počisti trenutni projekt; ponovi, ko projekt nima priljubljenih. |
| R10 | Dostopen števec ima `role=status`, `aria-label="Število priljubljenih"` in besedilo `Priljubljeno: X od M.` ne glede na q. Števci stolpcev table preštejejo samo vidna opravila v V, razvrščena po stanju. | Primerjaj števec s celotnim projektom pred filtrom/med njim; primerjaj stolpce z vidnimi karticami. |
| R11 | `storage` dogodek za pravi ključ zamenja F po validaciji R03–R04; `newValue=null` pomeni `F=∅`. Drug ključ se prezre; obdelava dogodka ne zapiše nazaj. Izjema pri branju ali pisanju ohrani uporabno sejsko stanje in pokaže `role=alert` z besedo `shramba`. | Sproži dogodka za pravi in drug ključ ter `null`; preveri, da dogodek ne sproži zapisa. Simuliraj izjemo pri branju/pisanju in uporabi filtre. |
| R12 | Priljubljenost ne sproži zapisovalnega API-ja in ne spremeni nobenega polja opravila. Ohranijo se Folio, obstoječe branje/nalaganje, navigacija in podrobnosti. Pri širini 390 px se širina strani ne poveča; notranje drsenje preglednice/table je dovoljeno. | Spremljaj omrežne klice in podatke opravila; preveri obstoječe poti ter vodoravni preliv na 390 px. |

Vse vrstice in kartice ohranijo `data-task-id`; gumbi so zunaj povezav. Ohrani dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Kontrole so checkbox `Prikaži le priljubljena` in gumb `Odstrani priljubljene tega projekta`. Napaka shrambe je opozorilo, ne napaka API-ja. Besedilo praznega filtra je zahtevano tudi na tabli; običajna prazna tabla brez filtra ohrani svoje obstoječe sporočilo. Uporabljajo se samo podatki `/api/`; vmesnik ne bere ali spreminja `/__test/` in ne uporablja `localStorage` kot kopije opravil.

## Izvedba in sledljivost

Spodnje poti opisujejo izhodiščno mesto za implementacijo, ne že dokončano kodo. Scenariji so sprejemni predlogi, ne izvedeni testi; avtor specifikacije aplikacije ne zaganja in testov ne izvaja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01, R05–R10, R12 | Pogoji v zgornji tabeli. | Predlogi zgoraj; še neizvedeni. | `src/App.tsx` `ProjectView`/`App`; trenutni prikaz in preklop pogleda. | Ni preverjeno; izhodišče pregledano. |
| R01, R06–R07, R10, R12 | Gumb ločen od kartične povezave; filtrirane kartice in stolpci. | Predlogi zgoraj; še neizvedeni. | `src/TaskBoard.tsx` `TaskBoard`; stolpci, `data-task-id`, kartična povezava in števci. | Ni preverjeno; izhodišče pregledano. |
| R01, R07, R12 | Podrobnosti ciljajo pravi ID, preklic/zapiranje ohranja navigacijo. | Predlogi zgoraj; še neizvedeni. | `src/TaskDetails.tsx` `TaskDetails`; GET po ID-ju in dialog. | Ni preverjeno; izhodišče pregledano. |
| R02–R04, R08–R09, R11 | Branje, validacija, normalizacija, shranjevanje in storage dogodek. | Predlogi zgoraj; še neizvedeni. | Potreben nov pripomoček ali stanje v `src/`; izhodišče trenutno ne vsebuje upravljanja priljubljenih. | Ni preverjeno; implementer določi dejansko datoteko. |
| R12 | API ostane vir opravil; brez zapisov priljubljenosti na API. | Spremljanje omrežja; še neizvedeno. | `src/useResource.ts`, `src/api.ts`; trenutni prikazi berejo z `request`, podrobnosti z `useResource`. | Ni preverjeno; pregledana koda opravil. |
| R12 | Pri 390 px brez razširitve strani; dovoljeno notranje drsenje. | Pogled pri 390 px; še neizvedeno. | `src/styles.css` media pravili (do 1180 px in 760 px), `.table-scroll` in `.board-scroll`. | Ni preverjeno; slog pregledan, postavitev ni zagnana. |

Pred implementacijo obstajajo `Project`, `Task` in `TaskUpdate` v `shared/types.ts`; `Task` vsebuje navedena polja in `TaskStatus` je `todo | in_progress | done`. `src/App.tsx` nalaga projekte prek `/api/projects` in naloge prek `/api/projects/{id}/tasks`, `src/TaskBoard.tsx` razdeli opravila po stanju, `src/TaskDetails.tsx` pridobi podrobnost prek ID-ja. `src/navigation.ts` nosi projekt/pogled v hash URL-ju, `ProjectView` pa je ključan z ID-jem projekta. Potrjeni Folio slog in notranje drsenje določa `docs/dizajn.md`. Implementer po izdelavi dopolni to tabelo z dejanskimi datotekami, imeni testov, dnevniki rezultatov in nepreverjenimi primeri; neoznačen test ni dokaz uspeha.

## Odprta vprašanja in omejitve

Zahteve določajo vedenje dovolj natančno; besedilo drugih kontrol in njihova razporeditev ostajata odločitev implementacije, ob ohranitvi potrjenega dizajna. Sprejemni robni primeri vključujejo poljubno število opravil, nič/eno/več kot deset, ponovljene naslove, poljubne enolične nize ID-jev, Unicode ter prazen projekt. Navigacija med nedokončanim nalaganjem in sočasne spremembe podatkov brez osvežitve ne dobita novih jamstev. Končni testi niso bili dostopni niti izvedeni v vlogi avtorja specifikacije.
