# P05 — Straničenje in filter stanja

**Različica:** 1.0.0 | **Datum specifikacije:** 2026-10-09

## Problem in kontekst

Uporabnik želi pregledati opravila izbranega projekta po stanju in jih pregledovati po straneh,
ne da bi se pri tem spremenili podatki ali izgubila obstoječa uporabnost Folia. Izhodišče bere
projekte in opravila prek javnega `/api/` vmesnika, omogoča preglednico, tablo in podrobnosti
opravil ter ohranja potrjeni dizajn iz [`docs/dizajn.md`](../../../docs/dizajn.md).

P05 doda tri lokalna stanja trenutnega projekta: velikost strani, filter stanja in številko strani.
Filter se vedno uporabi pred straničenjem. Stanje straničenja se ne hrani v trajni shrambi in se ne
zapisuje v URL; obstoječe poti za projekt, pogled in opravilo ostanejo nespremenjene. Izvirna besedila
zahtev v [`task/instructions.md`](../../../task/instructions.md) so merilo, tudi če ta specifikacija
kakšno podrobnost izpusti. Projektna načela so v [`.specify/memory/constitution.md`](../../../.specify/memory/constitution.md).

## Vhodi, dejanja in izidi

### Simboli in stanje

- `T` je nefiltrirano polje opravil projekta v izvirnem vrstnem redu iz `GET /api/projects/:id/tasks`.
- `Filter ∈ {all, todo, in_progress, done}`; `M = Filter(T)` je ohranjeno zaporedje opravil z izbranim stanjem.
- `Size ∈ {all, 2, 5, 10}`.
- `n = |M|`. Če je `n = 0`, je `lastPage = 0`; sicer je `lastPage = 1` za `Size = all`, sicer pa `ceil(n / Size)`.
- `Page` je veljavna stran med `1` in `lastPage`, kadar je rezultat neprazen; za prazen rezultat je `0`.
- `A = (Page - 1) * Size + 1` in `B = min(Page * Size, n)` za neprazen numeričen rezultat; za `Size = all` sta `A = 1` in `B = n`. Za prazen rezultat sta `A = 0` in `B = 0`.
- Prikazana opravila so `M[(Page - 1) * Size : Page * Size]`; za `Size = all` so prikazana vsa opravila iz `M`.

### Nadzorovali in dejanja

- Select `Velikost strani` ima vrednosti `all`, `2`, `5` in `10`. Sprememba nastavi novo velikost in `Page = 1` oziroma `0`, kadar je nov rezultat prazen.
- Select `Filter strani` ima vrednosti `all`, `todo`, `in_progress` in `done`. Sprememba nastavi nov filter in prvo stran novega rezultata.
- Gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran` spremenijo samo `Page`, in sicer na `1`, `max(1, Page - 1)`, `min(Page + 1, lastPage)` in `lastPage`.
- Neveljavna dejanja na robu so onemogočena: na prvi strani sta onemogočena `Prva stran` in `Prejšnja stran`, na zadnji strani `Naslednja stran` in `Zadnja stran`; za prazen rezultat so onemogočeni vsi štirje gumbi. Onemogočen klic ne spremeni stanja.
- Element z `role="status"` in `aria-label="Stanje straničenja"` prikazuje natančno `Stran X od Y. Prikazano A–B od N.`; vrednosti so izračunane po zgoraj. Za prazen rezultat je besedilo `Stran 0 od 0. Prikazano 0–0 od 0.`
- Preklop med preglednico in tablo ter odpiranje oziroma zapiranje podrobnosti ohranita `Size`, `Filter` in `Page`.
- Menjava projekta in osvežitev stranita `Size = all`, `Filter = all` ter `Page` na prvo stran novih podatkov; za prazen projekt je statusna stran `0`.
- Nova stanja niso shranjena v `localStorage` ali drugi trajni shrambi in niso del URL-ja. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`.

### Izidi

Preglednica prikaže vrstice trenutne strani. Tabla najprej razdeli ista prikazana opravila v obstoječe stolpce po stanju; stolpci niso straničeni ločeno. Pregled stanj šteje celoten nefiltrirani projekt, števci stolpcev table pa prikazana opravila trenutne strani. Podatki, `id`, vrstni red, povezave, podrobnosti, nalaganje, napake in prilagodljiv videz Folia ostanejo delujoči.

### Uporabniški scenariji

- Uporabnik odpre projekt in najprej vidi vsa opravila v izvirnem zaporedju.
- Uporabnik zoži seznam na izbrano stanje, izbere velikost strani in se premika po zaporednimi odseki.
- Uporabnik preklopi med preglednico in tablo ali odpre podrobnosti ter se vrne na isto stran, velikost in filter.
- Uporabnik zamenja projekt, osveži stran ali izbere filter brez ujemanja in dobi jasno privzeto oziroma prazno stanje.

### Merila uspeha

- Vsi pogoji R01–R12 so izpolnjeni za poljubno veljavno število opravil, vključno s praznim projektom, enim opravilom in več kot desetimi opravili.
- Filtriranje in straničenje ohranjata izvirni zaporedje ter enkratne `id`, ne spreminjata podatkov in ne dodajata zapisovalnih klicev.
- Preglednica, tabla, pregled stanj, podrobnosti, nalaganje in ozki prikaz ostanejo skladni s potrjenim dizajnom Folio.
- Preverjanja so lahko razložljivo sledljiva do testov in njihovih dnevnikov; neizvedeni testi se ne navajajo kot uspešni.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za nov projekt sta `Size = all` in `Filter = all`; če rezultat ni prazen, je `Page = 1`, vidni so vsi `id` iz `T` v izvirnem zaporedju. | Naloži projekt in primerjaj vidne `data-task-id` z zaporedjem API-odgovora. |
| R02 | Za vsak `Size ∈ {2,5,10}` so strani zaporedne in neprekrivajoče; njihova združitev je enaka `M`, noben `id` ni izgubljen ali podvojen, zadnja stran je lahko krajša. | Preveri vse tri velikosti z različnimi dolžinami, vključno z 0, 1, večkratnikom in nekonsistentnim ostankom. |
| R03 | Veljavni gumbi premaknejo na opisano stran; neveljavni robni gumbi so onemogočeni in ne spremenijo `Page` niti prikaza. | Naloži prvo, srednjo in zadnjo stran ter preveri stanje pred in po kliku onemogočenih gumbov. |
| R04 | Sprememba `Size` vedno nastavi prvo stran nove velikosti. `all` pomeni eno stran za neprazen rezultat in nobeno stran za prazen rezultat. | Spremeni velikost s strani, ki bi ostala številčno veljavna, in primerjaj status ter prikaz. |
| R05 | `Filter` se uporabi pred straničenjem, ohrani zaporedje ujemajočih se opravil in ponastavi `Page`. | Za vsak filter primerjaj celoten filtriran niz z izvirnim zaporedjem ter preveri prvo stran po spremembi. |
| R06 | Preglednica in tabla prikazujeta iste `id` trenutne strani. Tabla grupira ta odsek v obstoječe stolpce po stanju in ne straniči stolpcev ločeno. | Preklopi pogled na isti strani in primerjaj `data-task-id` v vrsticah in karticah. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ne spremenita `Size`, `Filter` niti `Page`. | Izvedi vsako dejanje in preveri kontrolne vrednosti ter status. |
| R08 | Menjava projekta in osvežitev ponastavita `Size = all`, `Filter = all` in prvo stran; novo stanje ni v trajni shrambi ali URL-ju. | Nastavi neprivzete vrednosti, zamenjaj projekt oziroma osveži in preveri reset ter odsotnost v URL-ju ter shrambi. |
| R09 | Za neprazen rezultat status vsebuje natančno izračunane `X`, `Y`, `A`, `B` in `N` po definicijah zgoraj. | Preveri status na več straneh, velikostih in filtrih, vključno z `all`. |
| R10 | Za prazen projekt ali prazen filter je status `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni; odstranitev filtra vrne prvo stran. | Naloži prazen projekt oziroma izberi filter brez ujemanja, preveri gumbe in nato filter `all`. |
| R11 | Pregled stanj šteje celoten nefiltrirani projekt; števci stolpcev table štejejo prikazana opravila trenutne strani; skupno število opravil se ne spremeni. | Primerjaj pregled stanj z API-poljem in števce stolpcev s trenutnim odsekom pred ter po straničenju. |
| R12 | Straničenje ne spremeni podatkov in ne pošilja zapisov na API; obstoječe povezave, `id`, podrobnosti, nalaganje in Folio ostanejo uporabni. | Izvedi straničenje in filtriranje ter preveri, da so dovoljeni samo obstoječi GET-klici, ter pregledaj regresijske preverjanje povezav, podrobnosti in ozkega zaslona. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Specifikacija zgoraj. | Predlagani lastni testi: privzeto stanje, vse velikosti, navigacija, reset ob spremembi, preklop pogleda, prazen rezultat, status, števci in odsotnost zapisov. | Načrtovano `tests/agent/`; datoteke bodo določene v načrtu in nalogah. | Še ni izvedeno; tega ne smatramo za uspešen test. |

## Odprta vprašanja, privzeti predpostavke in omejitve

- Vprašanje o poti funkcionalnosti ni odprto: pot je izrecno določena kot `docs/agent/P05`.
- Novo stanje je lokalno trenutnemu projektu. Zahteve ne razširjajo obnašanja med nezaključenim nalaganjem ali sočasnimi spremembami podatkov brez osvežitve.
- Besedilo in razpored novih kontrol niso predpisani, razen izrecnih imen, oznak, statusnega besedila in obstoječih dostopnih imen.
- Ni zunanjih meritev; preverjanje je omejeno na lokalne skupne in lastne teste, ki pokrijejo zgoraj opisane pogoje.

