# P08 — Koledarski pregled rokov

Različica 1.0, 2026-09-25. Status: specifikacija; implementacija in preverjanje še nista izvedena.

Viri: [izvirne zahteve](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [skupna predloga](../../../task/specification-template.md), [ustava](../../../.specify/memory/constitution.md) in [potrjeni Folio](../../dizajn.md). Ta dokument izpolnjuje skupno predlogo. Izvirne zahteve ostajajo merilo tudi ob morebitni izpustitvi v tem dokumentu.

## Problem in kontekst

Uporabnik želi v trenutnem projektu pregledati zapadla, današnja, bližnja, poznejša in končana opravila glede na izbrani koledarski datum. Obstoječi Folio iz javnega API-ja prikaže vsa opravila v preglednici ali tabli, tri števce stanj in bralne podrobnosti. Dopolnitev doda referenčni datum, pet števcev rokov in izbiro skupine, ki enako omeji oba pogleda.

Ohranijo se obstoječa navigacija, podatkovna polja, bralne podrobnosti, pregled stanj in potrjena prilagodljiva podoba. Ni zapisovanja opravil, novih API-jev, trajnega shranjevanja filtrov ali sprememb infrastrukture.

## Vhodi, dejanja in izidi

Vhod je urejeno zaporedje `T` vseh opravil trenutnega projekta iz obstoječega `/api/`. Relevantna polja so `id`, `projectId`, `status` in `dueDate`; naslov, opis in odgovorna oseba ostanejo običajno besedilo. ID-ji so enkratni, naslovi niso nujno različni. Dovoljeni so prazni projekti in poljubno število opravil ter veljavni koledarski datumi `YYYY-MM-DD`, vključno s prestopnimi datumi. `done` pomeni končano; preostala obstoječa statusa sta odprta.

Uporabnik lahko spremeni datum, izbere skupino, preklopi med preglednico in tablo, odpre obstoječe podrobnosti, zamenja projekt ali osveži stran. Ob uspešni spremembi se prikaz preračuna brez zapisovanja podatkov. Preklic izbirnika datuma brez spremembe vrednosti ne spremeni stanja. Ob praznem datumu polje ostane prazno in se pokaže opozorilo, zadnji veljavni preračun pa ostane. Obstoječe nalaganje, napake API-ja in ponovni poskusi ohranijo obstoječe delovanje.

### Dogovor o vmesniku

- `input type="date"` z dostopno oznako **Referenčni datum**.
- HTML `select` z oznako **Pogled rokov** in vrednostmi `all`, `overdue`, `today`, `week`, `later`, `done`.
- Imena petih skupin: **Zapadlo**, **Danes**, **Naslednjih 7 dni**, **Pozneje**, **Končano**. Besedilo za `all` lahko uporablja **Vsa opravila**.
- Natanko pet števcev ima `aria-label="Število rokov <ključ>"`; vsebina označenega elementa je samo številska vrednost.
- Pri praznem datumskem polju je `role="alert"` z besedilom **Vnesi veljaven referenčni datum.**
- Prazna izbrana skupina v nepraznem projektu pokaže **Ni opravil v izbrani skupini.** Kontroli ostaneta uporabni.
- Vrstice in kartice ohranijo `data-task-id`. Ohranijo se dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave.
- Obstoječi gradniki, barve in vidni fokus sledijo Folio. Pri širini 390 pik ni vodoravnega širjenja cele strani; notranje drsenje preglednice in table je dovoljeno.

## Zahteve in pravila

### Predikati in izpeljano stanje

`r` je zadnji veljavni referenčni datum; `x` je trenutno besedilo datumskega polja; `g` je izbrana skupina; `v` je pogled. `ord(d)` je zaporedna številka koledarskega dne, ne lokalni časovni trenutek. `Δ(t,r) = ord(t.dueDate) − ord(r)`.

Za vsako opravilo `t` definiramo natanko eno skupino:

```text
bucket(t,r) = done     če t.status = done
              overdue če t.status ≠ done ∧ Δ(t,r) < 0
              today   če t.status ≠ done ∧ Δ(t,r) = 0
              week    če t.status ≠ done ∧ 1 ≤ Δ(t,r) ≤ 7
              later   če t.status ≠ done ∧ Δ(t,r) > 7
```

`Bₖ(T,r) = [t iz T, za katere bucket(t,r)=k]` ohrani relativni vhodni vrstni red. Za različna ključa sta skupini disjunktni, njuna celotna unija vsebuje vsa opravila. `Cₖ = |Bₖ(T,r)|` in `Σ Cₖ = |T|`. Števci niso odvisni od `g`. `V(T,r,g) = T`, če `g=all`, sicer `B_g(T,r)`. Preglednica in tabla dobita isto zaporedje `V`; tabla ohrani obstoječe stolpce stanj in relativni vrstni red znotraj njih. Množici prikazanih ID-jev obeh pogledov sta enaki.

### Pravila sprememb stanja

| Dogodek | Novo stanje in izid |
| --- | --- |
| Začetek projekta, menjava projekta ali osvežitev strani | `x = r = 2026-09-21`, `g = all`; ni datumskega opozorila; uporabljena so opravila novega trenutnega projekta. |
| Vnos veljavnega datuma `d` | `x = r = d`; `g` in `v` ostaneta; števci in `V` se takoj preračunajo, opozorilo izgine. |
| Izpraznitev datuma | `x = ""`; `r`, `g` in `v` ostanejo; opozorilo se pokaže; preračun še naprej uporablja `r`. |
| Izbira skupine `k` | `g = k`; `x`, `r`, `v` in števci ostanejo; prikaže se `V(T,r,k)`. |
| Preklop pogleda | Spremeni se samo `v`; tudi prazno besedilo `x`, veljavni `r` in `g` ostanejo. |
| Odprtje bralnih podrobnosti | Ohranijo se obstoječa polja in obnašanje povezav; podatki opravila se ne spreminjajo. |

Nobeno od novih dejanj ne spremeni `T`, datumov ali statusov opravil in ne pošlje zapisa na API. Novo stanje filtrov ni v URL-ju, `localStorage` ali drugi trajni shrambi. Obstoječa navigacija s pogledom v URL-ju ostane dovoljena.

### Sprejemni pogoji in preverjanje

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projekta `r=x=2026-09-21`, `g=all`, neodvisno od ure naprave. | S01: začetek ob drugačni uri naprave; preverjanje polj in vseh ID-jev. |
| R02 | Status `done` ima prednost pred vsemi roki in šteje samo v `done`. | S02: končana opravila s preteklim, enakim in prihodnjim rokom. |
| R03 | Odprta opravila z `Δ<0` so `overdue`, z `Δ=0` so `today`. | S02: odprti opravili dan pred datumom in na njem. |
| R04 | Odprta opravila z `1≤Δ≤7` so `week`, z `Δ>7` so `later`; razdelitev je popolna in disjunktna. | S02: meje +1, +7, +8; unija ID-jev in vsota števcev. |
| R05 | Razvrstitev uporablja koledarske dni neodvisno od časovnega pasu/DST ter prehodov meseca, leta in prestopnega februarja. | S03: koledarske meje in primerjava v različnih časovnih pasovih. |
| R06 | Pet števcev izhaja iz celotnega `T`, tudi ko se `g` spremeni; imajo predpisane oznake in samo številko. | S02/S04: znane skupine in preklop vseh filtrov. |
| R07 | Vsaka vrednost `g` prikaže ustrezne ID-je v relativnem izvornem vrstnem redu; podatki ostanejo nespremenjeni. | S04: vseh šest možnosti nad premešanimi ID-ji in podvojenimi naslovi. |
| R08 | Veljaven datum takoj preračuna prikaz ob ohranjenem `g`; prazno polje ohrani zadnji izračun in pokaže opozorilo; veljaven vnos ga odstrani. | S05: veljaven → prazen → veljaven datum ob aktivnem filtru. |
| R09 | Oba pogleda imata iste filtrirane ID-je; preklop ohrani `x`, `r` in `g`. | S05: preklop v obe smeri tudi s praznim poljem in zadnjim veljavnim izračunom. |
| R10 | Menjava projekta in osvežitev obnovita začetni datum in `all`; filter ni shranjen trajno ali v URL. | S06: sprememba → drugi projekt → vrnitev → osvežitev; pregled shrambe/URL. |
| R11 | Prazen projekt ima pet ničel; prazna skupina nepraznega projekta predpisano sporočilo in delujočo izbiro. | S07: 0 in 1 opravilo; prazna skupina v obeh pogledih ter vrnitev na `all`. |
| R12 | Veljavni podatki ostanejo nespremenjeni; ni API-zapisov; bralne podrobnosti in prilagodljiv Folio ostanejo. | S08: spremljanje omrežja, podrobnosti, skupni regresijski testi in širina 390 pik. |

### Uporabniški scenariji in merilo uspeha

S01–S08 iz tabele pomenijo preverljive uporabniške scenarije, ne omejitve dovoljene domene. S02/S04 uporabita tudi več kot deset opravil, enake naslove, drugačne enkratne ID-je in neurejene roke; izbor mora vedno slediti ID-jem in vhodnemu zaporedju. S03 vključuje konec meseca, prehod decembra v januar, 29. februar prestopnega leta in prehod poletnega časa. S08 vključuje običajno besedilo z Unicode znaki in ločili.

Funkcionalnost je uspešna, ko velja vseh R01–R12 in dogovor o vmesniku, skupna regresijska preverjanja ohranijo obstoječe delovanje in dokazi jasno ločijo izvedeno od neizvedenega. Dodatnih zunanjih meritev ni.

## Izvedba in sledljivost

Pogoji in načini preverjanja so določeni v zgornji tabeli. Spodnji register se ob izvedbi dopolni z dejanskimi testi, mesti kode in dnevniki; trenutno so vsi izidi **neizvedeno**, ne uspešno.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Inicializacija | S01 | Še ni implementirano | Neizvedeno |
| R02 | Prednost `done` | S02 | Še ni implementirano | Neizvedeno |
| R03 | Meja preteklost/danes | S02 | Še ni implementirano | Neizvedeno |
| R04 | Meji +7/+8 in razdelitev | S02 | Še ni implementirano | Neizvedeno |
| R05 | Koledarska aritmetika | S03 | Še ni implementirano | Neizvedeno |
| R06 | Celotni števci | S02/S04 | Še ni implementirano | Neizvedeno |
| R07 | Filter, ID-ji in vrstni red | S04 | Še ni implementirano | Neizvedeno |
| R08 | Veljaven/prazen vnos | S05 | Še ni implementirano | Neizvedeno |
| R09 | Skladnost pogledov | S05 | Še ni implementirano | Neizvedeno |
| R10 | Ponastavitev in lokalno stanje | S06 | Še ni implementirano | Neizvedeno |
| R11 | Prazne množice | S07 | Še ni implementirano | Neizvedeno |
| R12 | Nespremenjeni podatki in Folio | S08 | Še ni implementirano | Neizvedeno |

Izhodiščne točke, pregledane za kontekst: `src/App.tsx` (`ProjectView`, števci stanj, preglednica in projektni ključ), obstoječa `TaskBoard` in `TaskDetails`. Načrt bo določil konkretne posege; ta korak ne spreminja kode.

## Odprta vprašanja in omejitve

Bistvenih manjkajočih podatkov ni. Razporeditev kontrol in besedilo, ki ni predpisano, se prilagodita obstoječemu Folio; `all` je poimenovan Vsa opravila. Tabla ohrani razporeditev po statusnih stolpcih, zato se izvorni vrstni red ocenjuje znotraj stolpcev, enakost s preglednico pa po ID-jih.

Podatkovni datumi so po pogodbi veljavni; obravnave pokvarjenih API-datumov ne dodajamo. Zahteva za neveljaven uporabniški vnos izrecno določa prazno polje. Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Testni pripomočki in `/__test/` so dovoljeni samo testom, ne uporabniškemu vmesniku. Končni testi niso dostopni in niso bili izvedeni; tudi razvojna in skupna preverjanja v tej fazi še niso bila izvedena.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12, pogodbe vmesnika, predikatov, prehodov stanja in načrtovanih scenarijev po skupni predlogi.
