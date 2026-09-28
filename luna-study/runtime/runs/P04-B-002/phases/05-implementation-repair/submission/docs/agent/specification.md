# Razvojna specifikacija: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Dodati je treba lokalno razvrščanje po primarnem in neobveznem sekundarnem ključu, ob nespremenjenih podatkih opravil, pripadnosti projektu, seštevkih in obstoječih bralnih funkcijah. Ohranita se potrjeni videz Folio in prilagodljivost.

Začetna koda pridobi opravila prek `GET /api/projects/:id/tasks` v `ProjectView`; preglednico izriše `App.tsx`, `TaskBoard` pa jih razdeli v tri fiksne stolpce (`todo`, `in_progress`, `done`). Pogled in izbrano opravilo določa hash navigacija (`navigation.ts`); podrobnosti se berejo prek `GET /api/tasks/:id`. Model `Task` v `shared/types.ts` vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Trenutno sortirnih kontrol ni. Seštevki izhajajo iz izvornega polja. API in skupnih tipov se ne spreminja.

## Vhodi, dejanja in izidi

Vhod `T` je prejeto polje opravil izbranega projekta. Štirje HTML selecti določajo primarni ključ (`original`, `title`, `assignee`, `status`, `dueDate`), primarno smer (`asc`, `desc`), sekundarni ključ (`none`, `title`, `assignee`, `status`, `dueDate`) in sekundarno smer (`asc`, `desc`). Privzeto stanje je `original/asc, none/asc`. Gumb »Izvorni vrstni red« povrne vse štiri privzete vrednosti.

Naj bo `i(t)` indeks opravila `t` v prejetem `T`. `N(s)` pomeni NFD, odstranitev znakov U+0300–U+036F in pretvorbo v male črke, v tem vrstnem redu. Leksikografski primerjalnik vrne `-1`, če je prvi niz po JavaScriptovem `<` manjši, `1`, če je večji, sicer `0` (primerjava UTF-16, brez locale ali numeričnega načina). Naslove in odgovorne primerja po `N`. Statusni rang je `todo=0`, `in_progress=1`, `done=2`; veljavna datuma ISO `YYYY-MM-DD` se primerjata kronološko, kar je enako leksikografski primerjavi teh nizov.

Za smer `asc` ohrani predznak primerjave, za `desc` ga pomnoži z `-1`. Če je `primary=original`, rezultat je vedno izvorni `T`, ne glede na druge izbire. Sicer za opravili `a`, `b` velja:

```text
p = direction(primary) * compare(primaryKey(a), primaryKey(b))
če p != 0: vrni p
če secondary == none: primerjaj i(a), i(b)
s = direction(secondary) * compare(secondaryKey(a), secondaryKey(b))
če s != 0: vrni s
sicer: primerjaj i(a), i(b)
```

Razvrščena projekcija se izračuna iz kopije `T`; izvora se ne mutira. Ob nalaganju ali napaki ostanejo obstoječa stanja nalaganja, napake in ponovnega poskusa. Lokalno razvrščanje ne sproži zahtev API.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `original`, `asc`, `none`, `asc`; prikaz sledi `T`. | Začetno stanje in namenoma premešan odziv API. |
| R02 | `title`/`assignee` primerjata `N(s)` z `<`/`>` po UTF-16; brez locale ali numeričnega razvrščanja. | Unicode z diakritiko, velike/male črke, ločila, številski nizi in UTF-16 robovi. |
| R03 | Status uporablja rang zgoraj; datumi veljavnega formata se uredijo kronološko. | Vsi statusi in datumi čez mejo meseca/leto. |
| R04 | Smer spremeni le predznak primerjave izbranega ključa; izenačenja ohranijo `i`. Končnega polja se ne obrne. | Asc/desc z izenačenimi vrednostmi. |
| R05 | Sekundarno primerjaj samo ob primarni primerjavi `0`; njegova smer je neodvisna. `none` izključi drugo primerjavo. | Kombinacije različnih ključev in smeri. |
| R06 | Če sta obe primerjavi `0`, ohrani `i`; ponovljen ključ je dovoljen. `primary=original` vedno vrne `T`. | Podvojene vrednosti, isti ključ dvakrat in `original` ob drugih izbirah. |
| R07 | Stolpci table ostanejo fiksni; znotraj vsakega je relativni vrstni red enak kot v sortirani `T`. | Primerjava tabele in stolpcev pri več statusih. |
| R08 | Menjava pogleda ali odprtje/zaprtje podrobnosti ohrani vse štiri vrednosti. | Spremeni nastavitve, zamenjaj pogled, odpri/zapri podrobnosti in preveri. |
| R09 | Menjava projekta in osvežitev ponastavita privzete vrednosti; stanje ni v URL-ju ali trajni shrambi. | Menjava projekta, preverba URL/shrambe in reload. |
| R10 | »Izvorni vrstni red« ponastavi vse selecte. Prazno in enoelementno `T` delujeta pri vseh ključih in smereh. | Vse kontrole nad praznim/enim opravilom ter reset. |
| R11 | Projekcija ohrani opravila, polja, ID-je, pripadnost, seštevke in izvor `T`; sprememba nastavitev ne pošlje zapisovalne zahteve. | Primerjava pred/po, seštevki, izvornega polja in prestrezanje zahtev. |
| R12 | Vsak ID je prikazan natanko enkrat in odpre svoje podrobnosti tudi ob enakem naslovu. Ohrani `data-task-id`, dostopna imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"` in Folio pri 390 px. Nova dejanja so zunaj povezave opravila. | Podvojeni naslovi, pravilna podrobnost, aria/DOM ter brez razširitve strani pri 390 px. |

Splošne predpostavke naloge: task vedno pripada svojemu projektu; API lahko vrne nič, eno ali več kot deset opravil, poljubne enkratne ID-je, podvojene naslove in veljavne koledarske datume. Imena in naslovi so nizi; imena odgovornih oseb so neprazna in niso `all`. Aplikacija uporablja `/api/`, nikoli testnega `/__test/`. Ne dodaja zapisovalnega API-ja, lokalne kopije strežnika ali trajne sortirne nastavitve.

## Izvedba in sledljivost

Končna implementacija in poročani izidi so povzeti iz [implementacijskega zapisa](verification.md), tabela »Sledljivost zahtev in izidi«. Pregledovalec je skladnost statično potrdil. Testov nisem neodvisno ponovil, zato so uspehi spodaj pripisani temu zapisu, ne tej seji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete vrednosti in izvorni red. | Agent `P04.spec.ts:53-59,75-77`; D01. | `taskSorting.ts:14-19,46-48`; `App.tsx:46-68`. | Uspešno po [verification.md, R01](verification.md#sledljivost-zahtev-in-izidi); npm check 50/50, P04 4/4. |
| R02 | NFD, odstranitev U+0300–036F, lowercase, UTF-16. | Agent `P04.spec.ts:61-69`; Unicode/številke/smeri. | `taskSorting.ts:23-30,33-36`. | Uspešno po [verification.md, R02](verification.md#sledljivost-zahtev-in-izidi); ne-BMP primer ni izrecno testiran. |
| R03 | Rang statusa in kronološki datumi. | Agent `P04.spec.ts:66-70`; D03 datum primarno. | `taskSorting.ts:21,33-39`. | Uspešno po [verification.md, R03](verification.md#sledljivost-zahtev-in-izidi). |
| R04 | Smer obrne samo primerjalnik; vezi ostanejo stabilne. | Agent `P04.spec.ts:61-73`; D02 sekundarna smer. | `taskSorting.ts:42-44,53-60`. | Uspešno po [verification.md, R04](verification.md#sledljivost-zahtev-in-izidi). |
| R05 | Sekundarno samo ob primarni enakosti; neodvisna smer. | Agent `P04.spec.ts:66-73`; D02. | `taskSorting.ts:54-60`; `App.tsx`. | Uspešno po [verification.md, R05](verification.md#sledljivost-zahtev-in-izidi). |
| R06 | Stabilna vez, ponovljen ključ in primarni `original`. | Agent `P04.spec.ts:70-77`. | `taskSorting.ts:46-48,57-64`. | Uspešno po [verification.md, R06](verification.md#sledljivost-zahtev-in-izidi). |
| R07 | Fiksni stolpci; filtriranje ohrani relativni vrstni red. | D03; agentni test table/board. | `App.tsx:69`; `TaskBoard.tsx:4-11,14-18`. | Uspešno v desktop/mobile po [verification.md, R07](verification.md#sledljivost-zahtev-in-izidi). |
| R08 | Pogled/podrobnosti ohranijo nastavitve. | Agent `P04.spec.ts:80-99`. | `App.tsx:12-15,42-43,85`; `TaskDetails.tsx`. | Uspešno po [verification.md, R08](verification.md#sledljivost-zahtev-in-izidi). |
| R09 | Projekt/reload ponastavita brez persistiranja. | Agent `P04.spec.ts:93-99`. | `App.tsx:113`, `navigation.ts`. | Uspešno po [verification.md, R09](verification.md#sledljivost-zahtev-in-izidi). |
| R10 | Reset ter prazna/enoelementna polja pri vseh kontrolah. | Agent `P04.spec.ts:108-129`. | `App.tsx:67`; `taskSorting.ts`. | Uspešno po [verification.md, R10](verification.md#sledljivost-zahtev-in-izidi). |
| R11 | Brez mutacije, spremembe seštevkov ali zapisov. | D04 desktop/mobile. | `App.tsx:15-20,69,73`; `taskSorting.ts`. | Uspešno po [verification.md, R11](verification.md#sledljivost-zahtev-in-izidi). |
| R12 | Enkraten ID, pravilne podrobnosti, dostopnost in mobilna širina. | Agent `P04.spec.ts:86-98`; izhodiščni in mobilni testi. | `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`, `navigation.ts`, `styles.css`. | Uspešno po [verification.md, R12](verification.md#sledljivost-zahtev-in-izidi); ročni vizualni pregled ni bil opravljen. |

## Odprta vprašanja in omejitve

Dogovor zagotavlja veljaven format `YYYY-MM-DD`, zato primerjava datumskih nizov zadošča. Poročilo navaja `npm run check` 50/50 in agentne Playwright teste 4/4; rezultatov v tej nadaljevani avtorski seji nisem ponovil. Izrecnega ne-BMP testa ni, vendar pregledovalec potrjuje neposredno uporabo zahtevanih `<`/`>` operatorjev. Mobilno omejitev širine pokrivajo poročani testi; ročni vizualni pregled ni potrjen.
