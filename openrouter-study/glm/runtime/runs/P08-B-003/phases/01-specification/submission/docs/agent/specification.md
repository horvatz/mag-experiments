# Specifikacija: Koledarski pregled rokov (P08)

## Problem in kontekst

Folio omogoča pregled opravil trenutnega projekta v preglednici in tabli. Uporabnik potrebuje koledarski pregled rokov: pet stabilnih števcev, filtriranje po skupini roka in možnost spreminjanja referenčnega datuma. Začetna aplikacija te funkcije ne implementira; sprememba mora ohraniti potrjeni Folio dizajn, obstoječa imena, navigacijo in dostopnost.

## Vhodi, dejanja in izidi

Podatkovna polja ostanejo skladna s `shared/types.ts`: `Task.id`, `projectId`, `title`, `description`, `status` (`todo`/`in_progress`/`done`), `assignee` in `dueDate`. Seznam opravil trenutnega projekta se bere z obstoječim GET `/api/projects/:id/tasks`; podrobnosti ostanejo na GET `/api/tasks/:id`. Nova API-ja, testne kontrole `/__test/`, `localStorage` ali URL-parameter za stanje naloge se ne dodajo.

- Vnos: `input type="date"` z oznako `Referenčni datum`; veljavna začetna vrednost je `2026-09-21`.
- Izbira: `select` z dostopnim imenom `Pogled rokov` in vrednostmi `all`, `overdue`, `today`, `week`, `later`, `done`; začetna vrednost je `all`.
- Izhod: pet števcev z `aria-label="Število rokov <ključ>"` in samo številsko vrednostjo ter isti filtriran nabor ID-jev v preglednici in tabli.
- Stanje referenčnega datuma in filtra je lokalno v trenutni projektni komponenti (`ProjectView`), ne v trajni shrambi ali URL-ju.
- Ob uspehu se podatki, vrstni red in obstoječa dostopnost ohranijo; filtriranje je izključno bralno.

## Zahteve in pravila

Datum interpretiramo kot koledarski `YYYY-MM-DD`, ne kot lokalni časovni žig. Seštevanje dni uporabi koledarski zapis brez ure, časovnega pasu in prehodov s poletnim časom; rezultat sestavimo iz leta, meseca in dneva (npr. `2028-02-28 + 1 = 2028-02-29`). Za odprto opravilo (`status != done`) velja:

- `overdue(d) = dueDate < referenceDate`
- `today(d) = dueDate == referenceDate`
- `week(d) = referenceDate + 1 <= dueDate <= referenceDate + 7`
- `later(d) = dueDate > referenceDate + 7`

```text
group(task, referenceDate) =
  task.status == done                           -> done
  task.dueDate < referenceDate                   -> overdue
  task.dueDate == referenceDate                  -> today
  task.dueDate <= calendarAdd(referenceDate, 7)  -> week
  otherwise                                      -> later
```

Vsako opravilo pripada natanko eni skupini. Končano opravilo (`status == done`) vedno spada v `done`, ne glede na rok, in ne v nobeno od štirih odprtih skupin. `all` ni klasifikacijska skupina, temveč prikaz celotnega trenutnega projekta.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob inicializaciji vsakega projekta je referenčni datum izrecno `2026-09-21`, izbrani pogled rokov pa `all`; ne odvisita od trenutne ure naprave. | Agentni test inicializacije in menjave projekta. |
| R02 | `done` neodvisno od `dueDate`; `done` se ne šteje v `overdue`, `today`, `week` ali `later`. | Agentni test z enakim datumom, različnimi statusi in razmejem. |
| R03 | Za odprta opravila veljata `dueDate < ref` za `overdue` in `dueDate == ref` za `today`. | Agentni test datumov pred referenco in na njej. |
| R04 | Odprta opravila z `ref+1` do vključno `ref+7` so `week`; odprta poznejša so `later`; skupine so disjunktne in pokrivajo vsa opravila. | Agentni test robnih datumov in več opravil. |
| R05 | Datumski račun uporablja koledarski dan in pokriva prestopni februar ter meje meseca/leta. | Agentna enota ali test datumov čez meje. |
| R06 | Pet števcev šteje celoten trenutni projekt; aktivni filter rokov ne spremeni nobene vrednosti števca. | Agentni test števcev pri `all` in vsaki drugi izbrani skupini. |
| R07 | Izbirnik prikaže samo ustrezno skupino. Preglednica ohrani izvorni vrstni red; tabla ohrani obstoječe statusne stolpce, znotraj vsakega pa izvorni vrstni red. Filtriranje ne spremeni datumov ali stanj. | Agentni test interakcije, vrstnega reda in API-ja. |
| R08 | Veljaven nov referenčni datum takoj preračuna skupine, števce in vidne vrstice ter ohrani aktivni filter. Prazen vnos prikaže opozorilo in zadnji veljaven račun; naslednji veljaven vnos opozorilo odstrani. | Agentni test praznine, menjave datuma in kombinacije z filtrom. |
| R09 | Tabla in preglednica vsebujeta isti filtriran nabor ID-jev. Preklop med preglednico/tablo ohrani referenčni datum, trenutno besedilo v datumskem polju in izbrano skupino rokov. | Agentni test obeh pogledov, tudi s praznim ali spremenjenim datumom. |
| R10 | Menjava projekta ali osvežitev ponastavita referenčni datum na `2026-09-21` in pogled rokov na `all`; filter se ne hrani trajno ali v URL-ju. | Agentni test menjave projekta, osvežitve in URL-ja. |
| R11 | Prazen projekt da pet ničel. Prazen izbrani filter v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`. | Agentni test praznega projekta in prazne skupine. |
| R12 | Pregled je izključno bralno: ne sproži zapisovalnega API-ja, ne spremeni podatkov, polj ali obstoječih bralnih podrobnosti; ohrani se prilagodljivi Folio. | Agentni test odsotnosti zapisov in branja podrobnosti. |

Dogovor o vmesniku: oznaka `Referenčni datum`, `select` `Pogled rokov`, `aria-label="Število rokov <ključ>"`, opozorilo `Vnesi veljaven referenčni datum.`, imena skupin `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje`, `Končano`. Ohranijo se `data-task-id`, dostopna imena obstoječih pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. Nova dejanja so zunaj povezave opravila. Pri širini 390 px stran ne širi čez zaslon; notranje drsenje preglednice/table ostane dovoljeno.

## Izvedbeni namig

- Dodaj čista pripomočka za seštevanje koledarskih dni in razvrščanje skupin; oba preizkusi neodvisno od ure naprave.
- V `ProjectView` dodaj lokalni stanji za veljavni referenčni datum in izbrano skupino. Ob praznem vnosu loči trenutno besedilo polja od zadnjega veljavnega referenčnega datuma.
- Preglednici in tabli podaj isti filtriran nabor opravil. Ohrani obstoječe statusne stolpce table in izvorni vrstni red znotraj stolpcev.
- Pet števcev izračunaj iz celotnega nabora opravil trenutnega projekta pred filtriranjem za prikaz.
- Menjava projekta naj zaradi obstoječega kljuca komponente ponastavi novo lokalno stanje na zahtevani začetni vrednosti.

## Izvedba in sledljivost

Specifikacijska faza ne spreminja izvorne kode in testov, zato izidi še niso preverjeni. Implementer naj doda podatkovna/modelna pravila, UI stanje in agentne teste ter spodnjo tabelo izpolni z dejanskimi testi, kodo in dokazi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zahteve in sprejemni pogoji zgoraj. | Za še ni izveden. | Za še ni izveden. | Ni preverjen; predaja implementerju. |

## Odprta vprašanja in omejitve

- Nejasnosti ni; izvirna zahteva iz `task/instructions.md` je obvezna tudi, če ta specifikacija kaj izpusti.
- Strežnik, `shared/`, skupni testi, infrastruktura, odvisnosti in testne kontrole `/__test/` ostanejo nespremenjeni.
- Pregled videza, zagon aplikacije in testiranje pripadata implementerju.
