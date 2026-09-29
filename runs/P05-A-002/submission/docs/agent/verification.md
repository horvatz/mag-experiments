# P05 — Izvedena preverjanja

Naloga je bila izvedena samostojno po postopku A. Specifikacija je bila
zapisana pred implementacijo; končna sledljivost R01–R12, predikati in zapis
popravka so v [specification.md](specification.md).

## Končni rezultat

`npm run check` je končal z izhodno kodo 0: ESLint, TypeScript, produkcijska
gradnja Vite in **53 uspešnih testov** (25,9 s za testni del):

- 38 izhodiščnih: 14 API, 12 namiznih in 12 mobilnih.
- 8 razvojnih P05: D01–D04 na namiznem in mobilnem projektu.
- 7 dodatnih A01–A07 iz [tests/agent/pagination.spec.ts](../../tests/agent/pagination.spec.ts).

Dokaz: celoten [check-final.log](check-final.log). Noben test ni preskočen,
ni ponovnih poskusov, skupni testi in infrastruktura niso bili spremenjeni.

## Dejanski zagoni in popravek

| Korak | Ukaz oziroma dejanje | Rezultat in dokaz |
| --- | --- | --- |
| Začetna regresija po implementaciji | `npm run check > docs/agent/check-initial.log 2>&1` | ESLint, tipi, gradnja in vseh 46 skupnih testov uspešnih; [dnevnik](check-initial.log). |
| Prvo preverjanje z dodatnimi testi | `npm run check` | ESLint uspešen, TypeScript zavrne možnost `{ disabled: ... }` pri `toBeDisabled`; brskalniški testi se v tem zagonu niso izvedli. [Dnevnik napake](check-test-types.log). |
| Popravek dodatnega testa | V `expectEdges` uporabljena ločena `toBeDisabled()` in `toBeEnabled()` glede na pričakovani rob. | Popravljena združljivost z nameščenim Playwrightom; aplikacijska koda in zahteve so ostale enake. |
| Končno preverjanje | `npm run check > docs/agent/check-final.log 2>&1` | Izhod 0; 53/53 uspešnih; [dnevnik](check-final.log). |
| Vizualni pregled | `WEB_PORT=5193 API_PORT=3123 npm run dev`; lokalna Node skripta z `chromium.connect(wsEndpoint)` iz `task/browser.json` | Štirje posnetki pri 1440×960 in 390×844, preglednica in tabla z velikostjo 2; [meritve](visual-check.json). |
| Povezave v dokumentih | Lokalna Node skripta preveri obstoj vseh relativno povezanih datotek. | Specifikacija: 20 povezav, poročilo: 13 povezav, nobena manjkajoča datoteka. |

Opozorila npm o podedovanem `http-proxy` ter Node o `NO_COLOR`/`FORCE_COLOR`
niso ustavila preverjanj. Ni bilo potrebnih sprememb okolja, odvisnosti ali
zagonskih nastavitev; uporabljen je bil samo lokalni Chromium in lokalne storitve.

## Povezava testov z zahtevami

Lastni testi uporabljajo nadzorovane odgovore javnih GET klicev prek testnega
pripomočka. Aplikacija tega pripomočka ne uvaža. Podatki obsegajo 23 opravil
z neurejenimi enkratnimi ID-ji (Unicode, `/`, `?`), enakimi naslovi, ločili,
navadnim besedilom z znaki `<`/`&`, večvrstičnimi opisi in datumom 2028-02-29.

| Test | Zahteve | Dejansko preverjen izid |
| --- | --- | --- |
| A01 | R01, R02, R03, R09, R12 | Privzeto all/all in izvorno zaporedje; vsi odseki pri 2/5/10; združeni ID-ji so točno izvorno polje, brez izgub/podvojitev; status in robovi na vsaki strani; brez zapisov. |
| A02 | R03, R04, R09 | Vsi štirje premiki; onemogočena dejanja ne učinkujejo; sprememba 5→10 vrne na prvo, čeprav bi bila druga še veljavna; all vrne vse. |
| A03 | R05, R06, R09, R11, R12 | Filter za vsako od treh stanj pred odsekom, stabilni vrstni red in ponastavitev; mešan odsek table je globalen; isti ID-ji v preglednici; skupni števci 7/8/8 in 23 ostanejo, stolpci štejejo le odsek. |
| A04 | R07, R12 | Velikost 2, filter todo in druga stran ostanejo po preklopu pogleda in vseh treh načinih zapiranja podrobnosti; izbran je pravi ID pri enakih naslovih, popoln opis/oseba/datum in vrnjen fokus; brez zapisov. |
| A05 | R08, R09 | Menjava projekta in povratek ter reload v pogledu table ponastavijo all/all/1; sam pogled table preživi reload; hash vsebuje le obstoječo navigacijo; localStorage/sessionStorage ostaneta prazna. |
| A06 | R03, R09, R10, R11 | Oba prazna projekta pri vseh velikostih imata 0/0 in 0–0; vsi gumbi so onemogočeni; enojni rezultat ima 1/1; prazen filter ne spremeni skupnega števila in povzetka; odstranitev filtra obnovi prvo stran. |
| A07 | R06, R12 | Pri 390 pikah ni vodoravnega širjenja dokumenta, vse nove kontrole so znotraj zaslona; Enter premakne stran, fokus je viden; oba pogleda kažeta isti odsek; brez zapisov. |
| D01–D04, namizni + mobilni | R02, R03, R04, R05, R06, R09, R12 | Vseh 8 skupnih razvojnih preverjanj uspešnih. |
| Izhodiščni namizni + mobilni | R07, R08, R12 | Navigacija, ID-ji, podrobnosti, zgodovina, direktne povezave, nalaganje, napake in retry, prazni projekti, tabla ter osvežitev shranjenih podatkov: 24/24. |
| Izhodiščni API | R12, regresijska meja | 14/14 preverjanj nespremenjenega javnega API-ja in izolacije testnih kontrol. |

Dejanska mesta kode za vsako R-zahtevo so v tabeli »Izvedba in sledljivost«
v [specifikaciji](specification.md). Pregled kode potrjuje lokalni React state,
nespremenjen ključ projekta, stabilna `filter`/`slice` brez mutacij vhodov in
brez novih zapisovalnih API-klicev, URL-parametrov ali trajne shrambe.

## Vizualni pregled

Vsi štirje posnetki so bili odprti in vizualno pregledani. Oznake, razmiki,
barve in prelom kontrol sledijo obstoječemu Foliu. Na mobilnem zaslonu se
gumbi razporedijo v dve koloni, preglednica in tabla se pomikata znotraj
svojega prikaza; dokument se ne razširi. Skripta ni zaznala `pageerror`.

- [Preglednica, 1440 pik](table-1440.png)
- [Tabla, 1440 pik](board-1440.png)
- [Preglednica, 390 pik](table-390.png)
- [Tabla, 390 pik](board-390.png)
- [Meritve širine, statusi in napake](visual-check.json)

## Omejitve in neizpolnjene zahteve

Znanih neizpolnjenih zahtev R01–R12 ni. Skriti končni testi niso dostopni in
niso bili izvedeni. Preverjanja ne predstavljajo izčrpnega preizkusa vseh
možnih podatkov ali zelo velikih zbirk. Uporabljen je samo nameščeni Chromium;
drugi brskalniki in dejanski bralnik zaslona niso bili preizkušeni. Dostopnost
je preverjena z dogovorjenimi vlogami/imeni, native disabled stanji in
tipkovnico, brez posebnega avtomatskega pregledovalnika dostopnosti.

Nove sočasne spremembe podatkov brez osvežitve in širitev obnašanja med
nedokončanim nalaganjem so po navodilih zunaj dodatnega obsega. Obstoječa
regresijska preverjanja nalaganja so uspešna. Testne kontrole `/__test/`
uporabljajo le testi; uporabniški vmesnik bere javni `/api/`.
