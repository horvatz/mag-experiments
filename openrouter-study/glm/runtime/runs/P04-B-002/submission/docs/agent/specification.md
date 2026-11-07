# Razvojna specifikacija P04: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio pridobi opravila iz javnega `/api/` in jih prikaže v prejetem vrstnem redu (`src/App.tsx`, `src/TaskBoard.tsx`). Dodati je treba primarni in sekundarni ključ z neodvisnima smerema; enaki elementi ohranijo prejeti vrstni red. Dizajn, navigacija, podrobnosti in obstoječe bralne funkcije ostanejo nespremenjene.

## Vhodi, dejanja in izidi

- Model ostane `Task` iz `shared/types.ts`: `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; stanja so `todo`, `in_progress`, `done`, datumi pa veljavni `YYYY-MM-DD`.
- Dostopna imena kontrol: `Primarni ključ` (`original`, `title`, `assignee`, `status`, `dueDate`), `Primarna smer` (`asc`, `desc`), `Sekundarni ključ` (`none`, `title`, `assignee`, `status`, `dueDate`), `Sekundarna smer` (`asc`, `desc`) in gumb `Izvorni vrstni red`.
- Privzeto stanje je `original`, `asc`, `none`, `asc`. Stanje je lokalno projektu, brez `localStorage`, URL-ja in API pisanja. Napake ostanejo v obstoječem `LoadError`; UI nikoli ne uporablja `/__test/`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju so vse štiri kontrole privzete; prikaz sledi prejetemu polju. | Preveri vrednosti kontrol in `data-task-id` po nalaganju ter osvežitvi. |
| R02 | `title`/`assignee` uredi po NFD, brez U+0300–U+036F, z malimi črkami in UTF-16 `<`/`>`; brez lokalnega ali številskega razvrščanja. | Uporabi Unicode, ločila ter `Alfa 10` pred `alfa 2`. |
| R03 | `status` gre `todo`, `in_progress`, `done`; `dueDate` je kronološki `YYYY-MM-DD`. | Preveri vsa stanja in datume v več mesecih/letih. |
| R04 | Smer obrne samo izid izbrane primerjave; izenačeni elementi ostanejo v prejetem redu. | Preveri `desc` z enakimi vrednostmi ključa. |
| R05 | Sekundarni ključ se uporabi samo ob izenačenem primarnem ključu; njegova smer je neodvisna. | Preveri `status + dueDate`, `title + assignee` in nasprotne smeri. |
| R06 | Ob izenačenosti obeh ključev velja prejeti red; enak primarni in sekundarni ključ ne doda obrata. Za primarni `original` vedno velja prejeti red. | Preveri enaka ključa, vse nastavitve in `original`. |
| R07 | Tabla ohrani stolpce `todo`, `in_progress`, `done`; vsak stolpec ohrani relativni red razvrščenega polja. | Preberi ID-je po stolpcih table. |
| R08 | Preklop pregleda ter odpiranje/zapiranje podrobnosti ohranita vse štiri nastavitve. | Spremeni kontrole, preklopi pogled, odpri in zapri podrobnosti. |
| R09 | Menjava projekta in osvežitev ponastavita vse štiri kontrole; ni `localStorage` ali URL-ja. | Nastavi, preklopi projekt, osveži in preveri privzete vrednosti. |
| R10 | `Izvorni vrstni red` ponastavi vse štiri kontrole; prazen projekt in eno opravilo delujeta pri vseh kombinacijah. | Preveri prazno, eno in več opravil. |
| R11 | Razvrščanje je čista projekcija: ne spremeni zapisov, pripadnosti, številcev ali izvornega polja in ne piše na API. | Preveri podrobnosti, vsote in odsotnost ne-GET zahtev. |
| R12 | Vsak ID je prikazan enkrat, tudi z enakimi naslovi, in odpre prave podrobnosti; ohranita se `data-task-id` in Folio videz. | Odpri enaka naslova po ID, preveri prikaze in 390 px. |

### Formalno pravilo

1. `normalize(value) = value.normalize('NFD').replace(/[\u{0300}-\u{036F}]/gu, '').toLowerCase()`.
2. `originalIndex(task)` je mesto v prejetem polju. `title`/`assignee` primerjata normalizirana niza, `status` vrednosti `todo=0`, `in_progress=1`, `done=2`, `dueDate` niza `YYYY-MM-DD`.
3. Za primarni `original` vrni primerjavo originalnih mest, brez vpliva smeri ali sekundarnega ključa.
4. Sicer `primary = compareKey(a, b, primaryKey) * (primaryDirection === 'desc' ? -1 : 1)`; če ni nič, vrni `primary`.
5. Sekundarni `none` pomeni neposredno primerjavo originalnih mest.
6. Sicer `secondary = compareKey(a, b, secondaryKey) * (secondaryDirection === 'desc' ? -1 : 1)`; če ni nič, vrni `secondary`, sicer primerjavo originalnih mest.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti red | `D01: default and title order` | `src/App.tsx:10` | Ni preverjeno v specifikacijski fazi. |
| R02 | Normalizacija | Unicode/ločila/številke | nova pomožna funkcija v `src/` | Ni preverjeno v specifikacijski fazi. |
| R03 | Stanja in datumi | vsa stanja, datumi v več mesecih | nova pomožna funkcija v `src/` | Ni preverjeno v specifikacijski fazi. |
| R04 | Smeri in izenačenosti | `D02` + enake vrednosti | nova pomožna funkcija v `src/` | Ni preverjeno v specifikacijski fazi. |
| R05 | Sekundarna smer | `D02: state and independent secondary direction` | nova pomožna funkcija v `src/` | Ni preverjeno v specifikacijski fazi. |
| R06 | Stabilnost | enak primarni/sekundarni ključ | nova pomožna funkcija v `src/` | Ni preverjeno v specifikacijski fazi. |
| R07 | Table | `D03: board preserves relative sorted order` | `src/TaskBoard.tsx:13` | Ni preverjeno v specifikacijski fazi. |
| R08 | Ohranitev stanja | preklop pogleda + podrobnosti | `src/App.tsx:37`, `src/TaskDetails.tsx:9` | Ni preverjeno v specifikacijski fazi. |
| R09 | Ponastavitev | preklop projekta + osvežitev | `src/App.tsx:62` | Ni preverjeno v specifikacijski fazi. |
| R10 | Reset in robni projekti | `D04`, prazna/eno opravilo | `src/App.tsx` | Ni preverjeno v specifikacijski fazi. |
| R11 | Brez pisanja | `D04: reset and no writes` | `src/App.tsx:10`, `src/api.ts:3` | Ni preverjeno v specifikacijski fazi. |
| R12 | ID, podrobnosti, videz | baseline + enaki naslovi + 390 px | `src/App.tsx:42`, `src/styles.css` | Ni preverjeno v specifikacijski fazi. |

Implementer naj izvede razvojne teste `D01`–`D04` ter baseline, dopolni pa še normalizacijo, enak primarni/sekundarni ključ, prazen projekt, eno opravilo, preklop projekta, podrobnosti, tablo pri vseh smereh in 390 px. Rezultate zabeleži v lastni dokumentaciji.

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj. Predpostavke: datumi so veljavni, imena so neprazna in niso `all`, naslovi/imena so navadno besedilo, ID-ji so enkratni.
- Manjkajoči datumi in neveljavna stanja niso v obsegu; javni tipi jih ne dovolijo.
- Strežnik, `server/`, `shared/`, skupni testi, odvisnosti, konfiguracije in infrastruktura ostanejo nespremenjeni.
- Nova razporeditev kontrol ni predpisana; mora ohraniti Folio dizajn, dostopnost in notranje drsenje pri 390 px.
