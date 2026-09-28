# P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali na tabli; povezave odprejo podrobnosti opravila. Uporabnik trenutno ne more označiti priljubljenih opravil ali omejiti prikaza nanje. Ta dopolnitev doda priljubljene, trajno shranjene v brskalniku, skupne obema pogledoma in projektno omejen filter. Ohraniti mora potrjeni dizajn Folio, slovenska poimenovanja, obstoječo navigacijo in odzivno obnašanje.

Opravila in projekti ostanejo podatki javnega API-ja (`/api/`); lokalna shramba vsebuje samo ID-je priljubljenih, ne kopij opravil. Testne poti `/__test/` uporablja samo testni program. Veljajo meje iz [PROJECT_RULES.md](../../../PROJECT_RULES.md) in vse podrobnosti iz izvirnih [zahtev P07](../../../task/instructions.md).

## Vhodi, dejanja in izidi

- Podatkovni vhod: projekti in opravila iz obstoječega API-ja; ID opravila je identiteta, naslov ni enoličen.
- Trajni vhod: ključ `folio:favorites:v1` v `localStorage`, oblika `{ "version": 1, "ids": ["..."] }`.
- Uporabniška dejanja: preklop priljubljenosti opravila, vklop/izklop filtra, odstranitev priljubljenih trenutnega projekta, menjava projekta, preklop pogleda in običajna navigacija do podrobnosti.
- Zunanji vhod: dogodek `storage` za navedeni ključ.
- Uspeh: stanje priljubljenih se uskladi v uporabniškem vmesniku in, za lokalno dejanje, shrani v kanonični obliki. Filter spremeni samo prikaz.
- Neveljaven zapis: začetna množica je prazna, aplikacija ostane uporabna in nalaganje samo ne zapisuje v shrambo. Dogodek `storage` z `newValue === null` izprazni množico.
- Napaka branja ali zapisa: uporabniški vmesnik ostane uporaben s stanjem v pomnilniku in prikaže opozorilo `role="alert"`, ki vsebuje besedo »shramba«. Preklic dejanja ni predviden.

## Zahteve in pravila

### Pravila stanja

Naj bo `p` trenutni projekt, `T(p)` opravila projekta v vrstnem redu API-ja, `I(p)` množica njihovih ID-jev, `F` globalna množica ID-jev priljubljenih in `A` stanje filtra (privzeto `false`). Neznani ID-ji lahko ostanejo v `F`, ne predstavljajo pa opravila za prikaz. `V` je izbrani pogled.

1. Vidna opravila so `D(p,F,A) = T(p)`, če `A = false`; sicer so to opravila `t` iz `T(p)` v istem vrstnem redu, za katera `t.id ∈ F`.
2. Preklop ID-ja `i` da `F' = F △ {i}` (simetrična razlika); ne spremeni `A`, projekta ali podatkov opravila. Vsako lokalno dejanje zapiše `{version:1, ids:sortUTF16(unique(F'))}` pod ključ `folio:favorites:v1`.
3. Zapis je veljaven natanko, če je JSON objekt z `version === 1` in poljem `ids`, ki je seznam nizov. Veljaven zapis se v pomnilniku združi po ID-jih, neveljaven zapis pa pomeni `F = ∅`. Nalaganje nikoli ne prepiše shrambe. Veljavni neznani ID-ji se ohranijo.
4. Odstranitev priljubljenih projekta da `F' = F \ I(p)`; ne spremeni ID-jev drugih projektov ali neznanih ID-jev.
5. Menjava projekta spremeni `p` in ponastavi `A = false`, `F` pa ohrani. Osvežitev obnovi `F` po pravilih nalaganja in nastavi `A = false`.
6. Dogodek `storage` za ciljni ključ nastavi `F` iz `newValue` po pravilih validacije (null pomeni prazno); druge ključe prezre. Dogodek ne povzroči povratnega zapisa.
7. Za števec velja `M = |T(p)|` in `X = |{t ∈ T(p): t.id ∈ F}|`, ne glede na `A`. Števci stolpcev table pa štejejo opravila v `D(p,F,A)` po stanju.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb z imenom `Priljubljeno opravilo <id>` in ustreznim `aria-pressed`. Klik preklopi samo ID opravila; ne odpre podrobnosti. Enaka naslova ostaneta neodvisna. | Preveriti gumbe v obeh pogledih; aktivirati pri enakih naslovih in potrditi samo izbrani ID ter nespremenjeno pot podrobnosti. |
| R02 | Lokalni zapis je JSON v `folio:favorites:v1`, `version` je 1, `ids` so enolični nizi v UTF-16 vrstnem redu; drugih polj opravila ni. | Preveriti surovo vrednost shrambe po več preklopih in Unicode ID-jih. |
| R03 | Ob ponovnem nalaganju se obnovijo veljavni ID-ji. Podvojeni so enkratni; neznani ostanejo shranjeni, brez ustvarjanja opravil. | Vnaprej nastaviti veljaven zapis s podvojenim in neznanim ID-jem, osvežiti in preveriti stanje, prikaz ter zapis. |
| R04 | Manjkajoč ključ ali zapis brez pravilne oblike/različice/`ids`, oziroma `ids` z nenizom, pomeni prazno množico; aplikacija ne odpove in nalaganje ne zapiše. | Ponoviti začetni prikaz za vsak neveljaven primer in primerjati shrambo pred/po. |
| R05 | Checkbox `Prikaži le priljubljena` privzeto ni označen. Ob vklopu `D` vsebuje samo priljubljena opravila trenutnega projekta v prvotnem vrstnem redu. | Preveriti privzeto stanje ter filtriranje in vrstni red z mešanimi priljubljenimi ID-ji. |
| R06 | Odstranitev priljubljenega med filtrom ga takoj odstrani iz prikaza. Prazen filtriran prikaz pokaže `Ni priljubljenih opravil.` in omogoča izklop filtra. | Vklopiti filter, odstraniti zadnji vidni ID ter preveriti sporočilo in uporabnost kontrol. |
| R07 | Preglednica in tabla uporabljata isti `F` in `A`; menjava pogleda ju ohrani. Podrobnosti so dosegljive za pravilen ID. | Spreminjati priljubljene/filter v enem pogledu, preklopiti v drugega in odpreti podrobnosti opravila. |
| R08 | Menjava projekta ohrani globalni `F`, ponastavi `A`; osvežitev obnovi `F` in nastavi `A = false`. | Označiti ID-je iz več projektov, filtrirati, zamenjati projekt ter osvežiti; preveriti stanje množice in filtra. |
| R09 | `Odstrani priljubljene tega projekta` izbriše natanko `I(p)` iz `F`; onemogočen je, kadar `X = 0`. | Preveriti mešano množico ID-jev čez projekte ter stanje gumba pri `X = 0` in `X > 0`. |
| R10 | `role="status"`, `aria-label="Število priljubljenih"` kaže `Priljubljeno: X od M.` glede na celoten projekt, tudi ob filtru. Števci stolpcev table upoštevajo vidna opravila. | Primerjati besedilo in števce pred/med filtrom ter po spremembah množice. |
| R11 | Dogodek za pravi ključ uskladi veljavno ali neveljavno vrednost po pravilih R03–R04; null izprazni, drugi ključ se prezre in ni povratnega zapisa. Izjema branja/zapisa ne prekine uporabe in pokaže opozorilo o shrambi. | Sprožiti oba tipa dogodka, null, veljavno/neveljavno vrednost ter simulirati izjeme branja in zapisa; preveriti UI in število zapisov. |
| R12 | Priljubljene ne povzročijo API zapisov ali spremembe polj opravila. Ohranijo se Folio, nalaganje, navigacija in prikaz pri širini 390 px; notranje drsenje je dovoljeno. | Opazovati API zahteve in podatke opravila med spremembami; preveriti regresijske poti in postavitev 390 px. |

### Uporabniški scenariji

1. Uporabnik označi opravilo v preglednici, preklopi na tablo in vidi isto označbo; ponovni klik na kartici jo odstrani brez navigacije.
2. Uporabnik vklopi filter, vidi priljubljena opravila projekta v izvornem vrstnem redu, nato odstrani zadnjega in dobi določeno prazno stanje ter možnost izklopa filtra.
3. Uporabnik zamenja projekt ali osveži stran; globalna priljubljena množica ostane, filter je izklopljen. Podrobnosti ostanejo dosegljive prek ID-ja.
4. Uporabnik odstrani vse priljubljene trenutnega projekta, ne da bi izgubil ID-je drugih projektov ali neznane ID-je.
5. Drugi zavihek spremeni lokalno shrambo; trenutni prikaz se uskladi brez ponovnega zapisa. Če brskalnik shrambo zavrne, se uporabnik lahko še naprej orientira po stanju v pomnilniku in opozorilu.

### Uspešna merila

- R01–R12 so preverljivi po zgornji matriki; nobeno opravilo ni identificirano po naslovu.
- Izbrane predikate za prikaz, preklop, odstranjevanje, števec in prehode projekta povzema razdelek »Pravila stanja«.
- Obstoječe dostopne oznake pogledov in stolpcev, `data-task-id`, `aria-label="Pregled stanj opravil"` ter ločenost dejanj od povezav ostanejo ohranjeni.
- Na širini 390 px se stran ne razširi; ohrani se potrjeni videz Folio.
- Uporabniški vmesnik uporablja samo `/api/` za podatke ter ne zapisuje sprememb opravil.

## Izvedba in sledljivost

Začetno stanje preglednice in table je v [App.tsx](../../../src/App.tsx) in [TaskBoard.tsx](../../../src/TaskBoard.tsx); zahteve in prikaz ne spreminjajo javnega API-ja iz [api.ts](../../../src/api.ts). Ciljne lokacije izvedbe in testov so še odprte do implementacije.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Zgoraj: R01 | Scenarij 1; test gumba/ID obeh pogledov | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno; implementacija in dokaz še ne obstajata. |
| R02 | Zgoraj: R02 | Shrambo preveriti po preklopu | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R03 | Zgoraj: R03 | Veljaven zapis, podvojeni in neznani ID | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R04 | Zgoraj: R04 | Manjkajoči in neveljavni zapisi | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R05 | Zgoraj: R05 | Scenarij 2; privzeto in vrstni red filtra | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R06 | Zgoraj: R06 | Scenarij 2; odstranitev zadnjega rezultata | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R07 | Zgoraj: R07 | Scenarij 1; menjava pogleda in podrobnosti | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R08 | Zgoraj: R08 | Scenarij 3; menjava projekta in osvežitev | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R09 | Zgoraj: R09 | Scenarij 4; ohranitev tujih/neznanih ID-jev | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R10 | Zgoraj: R10 | Števci s filtrom in brez njega | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R11 | Zgoraj: R11 | Scenarij 5; dogodki, napake in API zapisi | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |
| R12 | Zgoraj: R12 | API brez zapisov, regresija in 390 px | TBD: `src/`; TBD: `tests/agent/` | Ni izvedeno. |

## Odprta vprašanja in omejitve

Izvirne zahteve določajo funkcionalno vedenje, obliko shrambe in dostopnost; dodatnih odločitev uporabnika ni treba ugibati. Še niso znane lokacije prihodnje kode/testov in dejanski rezultati preverjanj, zato so slednji zgoraj izrecno označeni kot neizvedeni. Razvojni in končni testi niso bili izvedeni v tem koraku. Zahteve za nalaganje in sočasne spremembe podatkov ostajajo omejene, kot piše v izvirnih navodilih; nova API pot, strežniška sprememba ali sprememba skupnih tipov ni v obsegu.
