# P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v izvornem vrstnem redu. Uporabnik želi pregledno pregledovanje večjih projektov z zaporednim straničenjem in filtrom po stanju, ne da bi pri tem spremenil podatkov, obstoječih povezav, podrobnosti ali potrjenega videza Folio.

Zahteve so v `task/instructions.md`, skupna predloga pa v `task/specification-template.md`. Ta specifikacija je izdelek faze `$speckit-specify` in ne izvaja implementacije.

## Vhodi, dejanja in izidi

Vhodni podatki so obstoječi odgovori `/api/projects` in `/api/projects/:id/tasks` ter obstoječi `Task`: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. Nova stanja uporabniškega vmesnika so lokalna in trenutna:

- `filter` je `all`, `todo`, `in_progress` ali `done`;
- `pageSize` je `all`, `2`, `5` ali `10`;
- `page` je enkratna številka trenutne strani;
- `view` je obstoječi `table` ali `board`, podrobnost pa se odpre obstoječe po `id`.

Dejanja so izbira `Velikost strani`, izbira `Filter strani`, klik na `Prva stran`, `Prejšnja stran`, `Naslednja stran` ali `Zadnja stran`, preklop pogleda, odpiranje in zapiranje podrobnosti, menjava projekta ter osvežitev. Po uspešnem dejanju se prikaže trenutna stran filtriranega polja v obeh pogledih. Neveljavno dejanje na robu je onemogočeno in ne spremeni stanja. Obstoječe nalaganje, napake in ponovni poskus ostanejo nespremenjeni.

## Zahteve in pravila

Naj bo `P` seznam opravil projekta v vrstnem redu iz API-ja, `F` izbrani filter, `K` izbrana velikost strani, `C` trenutna stran in `T` trenutno filtrirano polje. Velja:

- `T = P`, če je `F = all`; sicer `T = P.filter(task => task.status === F)`;
- `N = |T|`;
- `L = N`, če je `K = all`; sicer `L = K`;
- `Y = 0`, če je `N = 0`; sicer `Y = max(1, ceil(N / L))`;
- `A = (C - 1)L + 1` in `B = min(CL, N)`;
- `TrenutnaStran = T.slice((C - 1)L, CL)`.

Spremembe stanja:

- zagon projekta: `K = all`, `F = all`, `C = 1`;
- sprememba `K`: nastavi `C = 1`, ne glede na prejšnjo veljavno stran;
- sprememba `F`: ponovno izračuna `T` iz celotnega `P`, nato nastavi `C = 1`;
- `Prva stran`: nastavi `C = 1`;
- `Prejšnja stran`: nastavi `C = C - 1`, samo če je `C > 1`;
- `Naslednja stran`: nastavi `C = C + 1`, samo če je `C < Y`;
- `Zadnja stran`: nastavi `C = Y`, samo če je `Y > 0`;
- preklop pogleda, odpiranje in zapiranje podrobnosti: ohranijo `K`, `F` in `C`;
- menjava projekta ali osvežitev: ponastavita `K = all`, `F = all`, `C = 1`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeti `K = all` in `F = all` prikažeta celoten `P` v izvornem vrstnem redu. | Naloži projekt in primerjaj vrstni red vseh ID-jev v obeh pogledih. |
| R02 | Za `K = 2`, `5` ali `10` so strani zaporedne, neprekrivajoče in skupaj vsebujejo vse ID-je iz `T`; zadnja je lahko krajša. | Prečrta vse strani in preveri odsotnost podvojenih ali manjkajočih ID-jev. |
| R03 | Štirje gumbi premaknejo `C` na ustrezno stran. Na robu so onemogočeni in ne spremenijo `K`, `F`, `C` ali prikazanih ID-jev. | Preveri vsako dejanje na prvi, srednji, zadnji in prazni strani ter atribute `disabled`. |
| R04 | Vsaka sprememba `K` nastavi `C = 1`. Pri nepraznem `T` in `K = all` obstaja ena sama stran. | Spremeni `K` iz srednje strani in preveri `C`, status ter `A–B od N`. |
| R05 | `F` se uporabi pred straničenjem, ohrani vrstni red ujemajočih se opravil in ob spremembi nastavi `C = 1`. | Naloži več opravil z več stanji, preklapljaj `F` in primerjaj ID-je po straneh. |
| R06 | Preglednica in tabla prikažeta isti `TrenutnaStran`. Tabla razdeli le ta odsek v tri stolpce po stanjih, ne straniči vsakega stolpca posebej. | Za več stanj preveri `data-task-id` v obeh pogledih in število kartic v stolpcih. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `K`, `F`, `C` in odprto podrobnost po pravem `id`. | Nastavi neprivzeto stanje, izvedi vsako dejanje in preveri vse tri spremenljivke. |
| R08 | Menjava projekta in osvežitev ponastavita `K`, `F` in `C` na privzete vrednosti; stanja ni v trajni shrambi ali URL-ju. | Po spremembah preklopi projekt ali osveži stran ter preveri stanje, URL in lokalno shrambo. |
| R09 | Za `N > 0` status vsebuje `Stran C od Y` in `Prikazano A–B od N.` z enojnim pomišljajem in enkratnimi indeksi. | Preberi element `role=status` z `aria-label="Stanje straničenja"` na več straneh in velikostih. |
| R10 | Za prazen projekt ali `N = 0` status vsebuje `Stran 0 od 0`, `Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni. Odstranitev filtra vrne prvo stran. | Preveri prazen projekt in vsak neprazen filter brez ujemajočih se opravil. |
| R11 | Pregled stanj šteje celoten `P`; števci stolpcev table štejejo le `TrenutnaStran`. Straničenje ne spremeni števila vseh opravil. | Primerjaj števce pred in po straničenju ter s prikazanimi karticami trenutne strani. |
| R12 | Straničenje in filter ne spreminjata podatkov, ne pošiljata zapisov na API, ne pokvarita povezav, `data-task-id`, podrobnosti, nalaganja, napak ali prilagodljivosti Folio na 390 pik. | Izvedi navigacijo in podrobnosti ter preveri stanje API-ja, obseg dokumenta in obstoječe regresijske teste. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Vsa zgoraj navedena sprejemna pogoja. | Agentni Playwright testi za privzete vrednosti, vse velikosti, vse filtre, obe pogleda, podrobnosti, prazne rezultate in meje. | `tests/agent/p05.spec.ts`; implementacija je v `src/App.tsx` in `src/styles.css`. | Uspešno; 5 testov je opravljenih. Sledljivost po zahtevah je v `docs/agent/verification.md`. |
| R12 | Ohranjanje obstoječih povezav, ID-jev, podrobnosti, nalaganja, napak in prilagodljivega videza Folio. | Obstoječi `tests/baseline.spec.ts` in `tests/api.spec.ts`. | Skupni testi izhodišča. | Uspešno; skupni testi so opravljeni v okviru `npm run check`. |

## Odprta vprašanja in omejitve

Ni bistvenih odprtih vprašanj. Besedilo in razporeditev kontrol, ki nista izrecno določena v zahtevah, ostajata implementacijska izbira v okviru potrjenega dizajna Folio. Specifikacija ne dodaja novih odvisnosti, API-jev, trajnih shramb ali zunanjih meritev.
