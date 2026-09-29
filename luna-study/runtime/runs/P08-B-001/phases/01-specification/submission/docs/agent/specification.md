# Koledarski pregled rokov

## Problem in kontekst

V pogledu projekta Folio dodamo koledarski pregled rokov, ki uporabniku
pomaga hitro videti zamujena, današnja, bližnja, poznejša in končana opravila.
Izhodiščni zaslon že bere opravila izbranega projekta, kaže preglednico in
statusno tablo ter odpre bralne podrobnosti. Te vsebine in potrjeni videz
Folio ostanejo dostopni; pregled doda datum, števec petih skupin in filter,
ki vpliva na oba seznama.

## Vhodi, dejanja in izidi

Izhodiščni tip `Task` vsebuje `id`, `projectId`, `status` in `dueDate` ter
naslov, opis in odgovorno osebo. Status je `todo | in_progress | done`, rok
je koledarski niz `YYYY-MM-DD`; v domeni naloge so podatkovni roki veljavni
datumi, tudi prestopni. `ProjectView` pridobi seznam trenutnega projekta iz
`/api/projects/:id/tasks`. Začetni datum je izrecno `2026-09-21`, začetni
filter `all`. Uporabnik lahko vnese datum, izbere filter, projekt ali
obstoječi pogled. Veljaven datum takoj preračuna skupine, prazen datum prikaže
opozorilo in obdrži zadnji veljavni preračun. Izbira ne posodobi opravila;
pregled je samo bralen. Filter je lokalno stanje trenutnega projekta, brez
zapisa v URL ali trajno shrambo.

## Zahteve in pravila

Naj bo `P` seznam opravil trenutno izbranega projekta, `D` zadnji veljavni
referenčni koledarski datum, `d(t)` veljavni rok opravila `t`, `done(t)` pa
predikat `t.status = done`. Za vsa opravila velja:

```text
group(t, D) = done                         če done(t)
               overdue                     če ne done(t) in d(t) < D
               today                       če ne done(t) in d(t) = D
               week                        če ne done(t) in D < d(t) <= D + 7 dni
               later                       če ne done(t) in d(t) > D + 7 dni
```

Seštevek `D + 7 dni` pomeni koledarsko, ne časovno trajanje. Datum se razčleni
in primerja po letu, mesecu in dnevu oziroma z UTC koledarsko aritmetiko, ne
glede na krajevni časovni pas. `done` ima prednost pred rokom. Ker je za
vsako opravilo predpostavljen veljaven rok, pet skupin tvori disjunktno
particijo `P`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob vsakem začetku projekta `D = 2026-09-21`, izbrani ključ je `all`; vrednost ni odvisna od sistemske ure. | Začetni zaslon in stanje po menjavi projekta/osvežitvi; razvojni D01 preveri začetni datum. |
| R02 | `t.status = done => group(t,D)=done`, ne glede na rok; tak ID ne pripada nobeni odprti skupini. | Končano opravilo z rokom pred `D`, na `D` in po `D`; D04 pokriva končano skupino. |
| R03 | Za odprto opravilo `d(t)<D => overdue`, `d(t)=D => today`. | Včeraj in danes; D01 preveri zamujeno pri začetnem datumu. |
| R04 | Za odprto opravilo `D<d(t)<=D+7 => week`, `d(t)>D+7 => later`; skupine so disjunktne in njihova unija je `P`. | Jutri, sedmi in osmi koledarski dan; D02 preveri vključujočo mejo sedmega dne. |
| R05 | Razvrstitev in seštevanje dni sledita koledarju neodvisno od časovnega pasu in DST, tudi ob prehodih meseca, leta in 29. februarja. | Ponoviti meje v različnih brskalniških TZ; prehod meseca/leto in prestopni februar. |
| R06 | Za vsako ključno skupino števec kaže `|{t∈P : group(t,D)=key}|`; vrednosti niso odvisne od filtra. Vsak element ima `aria-label="Število rokov <ključ>"` in samo številsko vrednost. | Primerjati vseh pet števcev s člani skupin pred/po menjavi filtra; D02 preveri števec `week`. |
| R07 | `all` kaže `P`, vsaka druga izbira kaže natanko svojo skupino in ohrani vrstni red seznama API; sama izbira ne spremeni `status` ali `dueDate`. Izbirnik je HTML `select` z oznako `Pogled rokov` ter ključi `all/overdue/today/week/later/done`. | Preklopiti vse možnosti z urejenim vhodnim seznamom ter primerjati ID-je in izvorna polja. |
| R08 | Veljaven datum v polju `type=date` takoj postane `D`, preračuna skupine/vidne vrstice, ohrani izbrani filter in odstrani opozorilo. Prazna vrednost roli `alert` prikaže natančno `Vnesi veljaven referenčni datum.` in obdrži zadnji veljavni `D`/preračun. | D03 preveri prazen vnos, ohranjen filter/vrstice in veljavno popravo; dodatno preveriti takojšnjo spremembo ostalih števcev. |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je (kot množico; tabla jih razporedi po statusnih stolpcih). Preklop pogleda ohrani `D`, besedilo datuma in ključ filtra. | Preveriti ID-je in stanje kontrol pred/po preklopu v obe smeri; D04 delno preveri tablo za `done`. |
| R10 | Menjava projekta in osvežitev vrneta `D` na `2026-09-21` ter filter na `all`; filter ni v URL-ju ali trajni shrambi. | Izbrati drug datum/skupino, menjati projekt in osvežiti; pregledati hash in shrambo brskalnika. |
| R11 | Pri `P=[]` je vsak števec `0`. Če `P` ni prazen, izbrana skupina pa je prazna, prikaži `Ni opravil v izbrani skupini.` in uporabniku pusti izbrati drugo skupino ali `all`. | Podatkovni odgovori za prazen projekt in neujemajočo se skupino. |
| R12 | Pregled sprejme veljavne koledarske roke `YYYY-MM-DD`, tudi veljaven prestopni datum; ne pošlje zapisovalnih zahtev API-ju ter ne spremeni polj ali prikaza bralnih podrobnosti. Ohrani obstoječe dostopne oznake, `data-task-id`, stolpce in prilagodljiv Folio; pri širini 390 px se stran ne razširi vodoravno, notranje drsenje prikaza je dovoljeno. | Preveriti podatke in podrobnosti pred/po filtriranju, omrežne zahteve ter širino strani; D04 pomaga pri kontroli samo bralnosti/390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Fiksni datum in `all` ob začetku projekta | D01; še menjava projekta in osvežitev | Izhodiščno: `src/App.tsx`, `ProjectView` je priklopljen s `key={project.id}`; dodatek bo del lokalnega stanja tega pogleda. | Ni izvedeno v vlogi specifikacije. |
| R02–R05 | Predikat skupine ter koledarska aritmetika zgoraj | D01–D02 pokrivata le zamujeno in mejo `week`; dodati meje/datum TZ scenarije | Tipi: `shared/types.ts` (`Task.status`, `Task.dueDate`); izhodiščni prikaz datuma: `src/formatDate.ts`. Nova klasifikacija še ne obstaja. | Ni izvedeno; ni dokazila o implementaciji. |
| R06–R08 | Števci iz celotnega `P`, skupinski filter in validacija | D02 števec `week`; D03 prazen datum; ostalo še preveriti | Izhodišče `src/App.tsx`, `ProjectView`; nove kontrole/izpeljanke še ne obstajajo. | Ni izvedeno v vlogi specifikacije. |
| R09 | Isti filtrirani ID-ji v obeh pogledih in ohranitev kontrol | D04 filtrirana tabla; primerjati tabelo, povratni preklop in stanje kontrol | `src/App.tsx` izbira pogleda; `src/navigation.ts` shrani v hash le obstoječo izbiro `view`; `src/TaskBoard.tsx` sprejema `tasks`. | Ni izvedeno v vlogi specifikacije. |
| R10 | Ponastavitev lokalnih kontrol; brez trajnega/URL filtra | Menjava projekta/osvežitev ter pregled URL/shrambe | `src/App.tsx`, `ProjectView key`; `src/navigation.ts` trenutno kodira projekt, opravilo in `view`. | Ni izvedeno v vlogi specifikacije. |
| R11 | Ničelni števci in stanje prazne izbrane skupine | Ločen prazen projekt in neujemajoča skupina | Trenutni prazen celoten seznam obravnava `src/App.tsx`; prazen filter je nov pogoj. | Ni izvedeno v vlogi specifikacije. |
| R12 | Samo bralni prikaz, združljivost, odzivnost | D04 `readonly`; pregled podrobnosti in oznak | GET seznam v `src/App.tsx`; GET podrobnosti v `src/TaskDetails.tsx`; obstoječe vrstice/kartice v `src/App.tsx`, `src/TaskBoard.tsx`; postavitev `src/styles.css`. API pomočnik `src/api.ts` vsebuje pripravljeno funkcijo PATCH, ki je pregled ne sme klicati. | Ni izvedeno v vlogi specifikacije. |

Razvojni testi so `tests/development/P08.spec.ts` (D01–D04) in
`tests/development/helpers.ts`; navedeni scenariji opisujejo pričakovana
preverjanja, ne dokazujejo, da so bili testi zagnani. Naloga specifikacije ne
zaganja aplikacije ali testov. Implementer po izvedbi dopolni sledljivost z
dejanskimi imeni testov, povezavami na končno kodo in rezultati zagonov.

## Odprta vprašanja in omejitve

Predpostavke izvora naloge so veljavni datumi vseh prejetih opravil ter
enočasna izbira projekta in prikaza; navigacije med nalaganjem in sočasne
spremembe podatkov brez osvežitve ni treba širiti. Razvojni testi ne pokrivajo
vseh pogojev, končni testi niso dostopni v tej fazi. Prazno polje je izrecno
določeno; po veljavnem novem datumu opozorilo izgine. Izid vsakega testa ostaja
nepreverjen, dokler ga implementer dejansko ne zažene.
