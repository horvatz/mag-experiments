# P04: Stabilno razvrščanje z dvema ključema

Različica 1.0 · funkcionalna specifikacija · 2026-09-27

## Problem in kontekst

Folio že prikazuje projektna opravila v preglednici in na tabli ter omogoča odpiranje podrobnosti opravila. Preglednica sledi vrstnemu redu, ki ga vrne API; tabla ohrani vrstni red vhodnega polja znotraj treh statusnih stolpcev. Uporabnik potrebuje možnost, da trenutno prikazana opravila razvrsti po enem ali dveh ključih, ne da bi s tem spreminjal opravila. Dopolnitev ohrani potrjeni videz in bralne zmožnosti Folio; dodatne kontrole sledijo smernicam in obstoječemu slogu v [docs/dizajn.md](../../dizajn.md).

## Vhodi, dejanja in izidi

Vhod `T` je zaporedje opravil izbranega projekta, prejeto prek obstoječega javnega `GET /api/projects/:id/tasks`. Položaj opravila `t` v tem zaporedju označimo z `i(t)`. Podatkovna polja in tipi ostanejo taki kot v izhodišču; ID-ji so enkratni, naslovi in imena so nizi, datumi pa veljavni koledarski datumi `YYYY-MM-DD`. Seznam je lahko prazen ali vsebuje eno ali več opravil.

Stanje razvrščanja je `S = (p, pd, s, sd)`: primarni ključ `p ∈ {original, title, assignee, status, dueDate}`, primarna smer `pd ∈ {asc, desc}`, sekundarni ključ `s ∈ {none, title, assignee, status, dueDate}` in sekundarna smer `sd ∈ {asc, desc}`. Začetno stanje in stanje po ponastavitvi je `S0 = (original, asc, none, asc)`.

Uporabnik izbere vrednosti v štirih HTML `select` kontrolah z oznakami »Primarni ključ«, »Primarna smer«, »Sekundarni ključ« in »Sekundarna smer«, ali pritisne gumb »Izvorni vrstni red«. Izbor začne učinkovati takoj. Posodobitev ene kontrole spremeni samo pripadajočo koordinato `S`; izračunana projekcija se prikaže v preglednici ali tabli.

Ob uspešnem izboru se posodobi samo `S` in izpeljani vrstni red; opravila in strežniško stanje ostanejo nespremenjeni. Preklop pogleda ter odprtje ali zaprtje podrobnosti ohrani `S`. Preklic odpiranja izbirnika ne spremeni izbrane vrednosti; zaprtje podrobnosti z gumbom ali Escape ohrani `S`. Menjava projekta in osvežitev strani nastavita `S0`. Če nalaganje opravil spodleti, ostaneta obstoječi prikaz napake in ponovni poskus; aplikacija ne izdela nadomestnih opravil. Napaka pri branju ne zapiše podatkov in ne shrani nastavitev. Razvrščanje ni vključeno v URL ali trajno shrambo.

### Pravilo projekcije

Primerjava besedilnega ključa `k ∈ {title, assignee}` je leksikografska primerjava nizov po teh korakih: Unicode NFD, odstranitev vseh znakov U+0300–U+036F, pretvorba v male črke, nato primerjava po UTF-16 z operatorjema `<` in `>`. Ne uporablja se primerjava, prilagojena jeziku ali številom. Primerjava `status` sledi vrstnemu redu `todo < in_progress < done`. Veljavni `dueDate` se primerja kronološko.

Za vsak izbrani ključ `k` smer `asc` ohrani predznak njegove primerjave, `desc` pa obrne samo ta predznak. Če je `p = original`, je rezultat vedno `T` v vhodnem vrstnem redu, ne glede na druge tri nastavitve. Sicer je primerjalni vrstni red leksikografski: najprej `p`; ob enakosti `s`, če `s ≠ none`; ob enakosti obeh ključev pa `i(a) < i(b)`. Zadnje pravilo ohranja vhodni vrstni red izenačenih opravil. Če sta primarni in sekundarni ključ enaka, sekundarna primerjava pri izenačenju primarnega ključa ne spremeni rezultata.

## Uporabniški scenariji

1. **Izbira dveh ključev.** Uporabnik v projektu nastavi primarni ključ in smer ter po želji sekundarni ključ in njegovo smer. Preglednica pokaže predpisani vrstni red, sekundarni ključ pa razloči samo izenačenja primarnega.
2. **Primerjava in stabilnost.** Uporabnik izbere naslov ali odgovorno osebo, status ali rok ter preizkusi smeri. Enaki ključi ohranijo vhodni vrstni red, tudi pri `desc`; `original` vedno povrne vhodni vrstni red.
3. **Preklop pogleda in podrobnosti.** Uporabnik spremeni razvrščanje, preklopi med preglednico in tablo ter odpre in zapre podrobnost. Nastavitve ostanejo enake; tabla ohrani vrstni red filtriranih opravil v vsakem stolpcu.
4. **Ponovni začetek.** Uporabnik zamenja projekt, osveži stran ali pritisne »Izvorni vrstni red«. Menjava projekta in osvežitev začneta z `S0`; gumb ponastavi vse štiri kontrole v trenutnem projektu.
5. **Robni in enaki podatki.** Prazen projekt, projekt z enim opravilom, več opravil z enakimi naslovi in različnimi ID-ji ter poljubno vhodno zaporedje se lahko prikažejo brez izgube ali podvajanja opravil. Povezava odpre podrobnost po ID-ju.
6. **Bralno delovanje in prilagodljivost.** Uporabnik ohrani obstoječe branje projektov, stanj, oseb, rokov, opisov in podrobnosti. Pri širini 390 pik se stran ne razširi; notranje pomikanje preglednice ali table je dovoljeno.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob prvem prikazu sta izbrana `original`, `asc`, `none`, `asc`; vrstni red je `T`. | V01: ob začetnem prikazu preveri vrednosti vseh štirih kontrol in zaporedje ID-jev, enako vhodnemu polju. |
| R02 | Za primarni `title` ali `assignee` velja zgoraj določena normalizacija NFD, odstranitev U+0300–U+036F, male črke ter primerjava UTF-16 z `<` in `>`; brez lokaliziranega ali številskega razvrščanja. | V02: uporabi šumnike/diakritiko, velike in male črke, Unicode ter nize s števkami; primerjaj z določenim algoritmom. |
| R03 | Primarni `status` sledi `todo`, `in_progress`, `done`; `dueDate` sledi kronološkemu vrstnemu redu veljavnih datumov `YYYY-MM-DD`. | V03: preveri vsak statusni par in datume čez mesece ter leta, v obeh smereh. |
| R04 | Smer vsakega ključa obrne samo primerjavo tega ključa; ne obrne celotnega končnega polja in ne spremeni vrstnega reda elementov, izenačenih po njem. | V04: uporabi izenačenja primarnega in sekundarnega ključa ter preveri asc/desc z večjim naborom. |
| R05 | Sekundarni `none`, `title`, `assignee`, `status` ali `dueDate` se upošteva samo, ko sta primarni vrednosti enaki; njegova smer je neodvisna od primarne. | V05: primerjaj nastavitve sekundarnega ključa in smeri pri primarnih izenačenjih ter neizenačenjih. |
| R06 | Izenačenje obeh ključev ohrani `i(t)`. Enak primarni in sekundarni ključ je dovoljen. `original` kot primarni ključ vedno vrne `T`, ne glede na druge kontrole. | V06: preveri stabilne skupine pri obeh smereh, enaka ključa in `original` ob različnih sekundarnih nastavitvah. |
| R07 | Tabla ohrani stolpce v vrstnem redu Pripravljeno (`todo`), V delu (`in_progress`), Končano (`done`); znotraj vsakega uporabi relativni vrstni red iste projekcije kot preglednica. | V07: primerjaj ID-je preglednice s karticami, filtriranimi v vsakem fiksnem stolpcu. |
| R08 | Preklop med preglednico in tablo ter odprtje/zaprtje podrobnosti ne spremeni nobene od štirih vrednosti `S` ali vrstnega reda po izbranem pravilu. | V08: spremeni vse kontrole, preklopi pogled in odpri/zapri podrobnost z gumbom ter Escape. |
| R09 | Menjava projekta in osvežitev strani nastavita `S0`; nastavitev se ne shrani v URL ali trajno shrambo. | V09: nastavi nestandardne vrednosti, zamenjaj projekt in osveži stran; preveri privzete kontrole in URL. |
| R10 | Gumb »Izvorni vrstni red« ponastavi vse štiri kontrole v `S0`. Prazen projekt in projekt z enim opravilom omogočata izbire vseh ključev in smeri brez napake ali izgube podatkov. | V10: ponastavi iz vsakega stanja ter preizkusi vse kombinacije kontrol pri nič in enem opravilu. |
| R11 | Projekcija ne spreminja polj opravil, projektne pripadnosti, povzetkov ali vhodnega polja; sprememba vrstnega reda ne pošlje zapisov na API. | V11: primerjaj podatke in povzetke pred/po razvrščanju ter preveri, da ni zahtev za zapis. |
| R12 | Vsak ID opravila je v seznamu aktivnega pogleda prikazan natanko enkrat in odpira pravo opravilo tudi pri enakih naslovih. Ohranijo se obstoječe neposredne povezave in navigacija, preglednica/tabla, povzetki, stanje nalaganja, napaka s ponovnim poskusom, podrobnosti in upravljanje s tipkovnico; ohranijo se tudi `data-task-id`, dostopna imena pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave. Pri 390 pikah ni razširitve cele strani; notranje drsenje je dovoljeno. | V12: uporabi ponovljene naslove z različnimi ID-ji; preveri vsako povezavo/podrobnost, obstoječe bralne poti, atribute in dostopna imena ter stran pri 390 pikah. |

## Vhodi, vmesnik in meje

Dogovorjene vrednosti kontrol so:

| Kontrola | Dovoljene vrednosti |
| --- | --- |
| Primarni ključ | `original`, `title`, `assignee`, `status`, `dueDate` |
| Primarna smer | `asc`, `desc` |
| Sekundarni ključ | `none`, `title`, `assignee`, `status`, `dueDate` |
| Sekundarna smer | `asc`, `desc` |

Podatki se berejo iz obstoječega `/api/`; razvrščanje je odjemalska projekcija in ne dodaja zapisovalnih klicev. UI ne uporablja testnih kontrol `/__test/`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti ter nastavitve ostanejo zunaj obsega sprememb. Ne širi se obseg sočasnih sprememb podatkov ali navigacije med nedokončanim nalaganjem prek obstoječih regresijskih zahtev. Manjkajoči datumi niso del zahtevanega vhodnega območja.

## Merila uspeha

- **US1:** Za vsak dopusten vhod `T` privzeta nastavitev in ponastavitev vrneta natančno vhodno zaporedje; vsak ID ostane natanko enkrat.
- **US2:** Za vsak izbran ključni par in smeri izhod ustreza opisani primerjavi, ohranja vhodni vrstni red izenačenih opravil ter uporablja predpisani statusni in datumski vrstni red.
- **US3:** Preglednica in tabla predstavljata isto razvrščeno zaporedje; tabla ga razdeli samo po stalnem vrstnem redu statusnih stolpcev.
- **US4:** Preklop pogleda in podrobnosti ohrani nastavitve, menjava projekta/osvežitev jih ponastavi, gumb pa ponastavi vse štiri kontrole.
- **US5:** Razvrščanje ne spremeni podatkov ali povzetkov in ne sproži zapisovanja; opravila z enakimi naslovi se še vedno odprejo po ID-ju.
- **US6:** Vse navedeno deluje pri nič, enem in več opravilih ter ohrani zahtevani dostopni in prilagodljivi prikaz.

## Izvedba in sledljivost

Pogoji R01–R12 in scenariji V01–V12 v zgornji tabeli so osrednja sledljivost specifikacije. Datoteke izvedbe, imena dejanskih testov, izidi in dokazila bodo zabeleženi po načrtovanju in izvedbi; v tem koraku ni bilo sprememb kode ali testov. Trenutno so R01–R12 **neizvedene in nepreverjene**. Pri zaključni sledljivosti se za vsak ID dopolnijo datoteka/koda, izvedeni scenarij ter izvor rezultata; neizvedeni končni testi se ne označijo kot uspešni.

## Odprta vprašanja in omejitve

Za zahtevano funkcionalnost ni odprtih vprašanj: dovoljene vrednosti, primerjave, stanje skozi navigacijo, vhodni podatki in omejitve so določeni v `task/instructions.md`. Manjkajoči datumi so izrecno zunaj testnega območja. Končnih testov te naloge v tej specifikacijski fazi nisem izvajal; njihova izvedba in rezultati ostajajo za poznejši korak.
