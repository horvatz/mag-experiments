# Specifikacija P07: priljubljena opravila

## Problem in kontekst

Folio trenutno bere projekte in opravila iz javnega API-ja ter jih prikaže v
preglednici ali na tabli. Uporabnik želi označiti opravila neodvisno po ID-ju,
izločiti nepriljubljena opravila ter oznake ohraniti po osvežitvi. API in polja
opravil ostanejo nespremenjeni; potrjeni videz in odzivno vedenje Folio ostaneta.

## Vhodi, dejanja in izidi

Vhodi so projekti in opravila iz `/api/`, trenutni URL, obstoječa shramba
`localStorage` ter `storage` dogodki. Oznake hranijo samo nize ID-jev pod
`folio:favorites:v1` v obliki `{version:1,ids:[...]}`. Uporabnik lahko
posamično preklopi oznako, vključi/izključi filter ali odstrani oznake vseh
opravil trenutnega projekta. Ob uspehu se spremeni samo množica ID-jev,
prikaz se takoj uskladi in zapis se shrani lokalno. Pri neveljavnem vhodu v
shrambo se uporabi prazna množica; pri izjemi shrambe ostane delo v pomnilniku
in prikaže se opozorilo. Filtra ob menjavi projekta ali osvežitvi ni treba
obnoviti.

## Zahteve in pravila

Naj bo `F` množica globalnih priljubljenih ID-jev, `T` urejeni seznam vseh
opravil trenutnega projekta, `V = T`, če je filter izključen, sicer pa
`V = [t ∈ T | t.id ∈ F]`. ID-ji v `T` so enolični znotraj projekta.
Normalizacija veljavnega zapisa vrne množico nizov `ids`; zapis nove množice
serializira `ids` enkratno in z JavaScriptovim privzetim UTF-16 leksikalnim
vrstnim redom.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Gumb vsakega opravila ima ime `Priljubljeno opravilo <id>` in `aria-pressed`; klik spremeni le pripadnost tega ID-ja v `F`. | Test klika in dostopnih imen v obeh pogledih; različni ID-ji z enakim naslovom. |
| R02 | Vsak zapis vsebuje le `{version:1,ids:sort(unique(F))}` pod ključem `folio:favorites:v1`. | Pregled localStorage po preklopu; brez polj opravila. |
| R03 | Veljaven zapis se deduplicira, neznani ID-ji ostanejo v `F`, vendar se prikazujejo samo ID-ji iz `T`. | Ponovni zagon z znanim, podvojenim in neznanim ID-jem. |
| R04 | Manjkajoč/okvarjen/neustrezen zapis se naloži kot `F=∅`; začetno nalaganje ne zapisuje. | Primeri veljavnosti in preverjanje, da se naložena shramba ne prepiše. |
| R05 | Privzeti filter je izključen; vključen prikaže `V` v vrstnem redu `T`. | Začetno stanje in vrstni red filtriranih rezultatov. |
| R06 | Po odstranitvi zadnjega vidnega favorita je `V=[]`; prikaže se `Ni priljubljenih opravil.` in filter je mogoče izklopiti. | Odstranitev med aktivnim filtrom. |
| R07 | Preglednica in tabla porabita isti `F` in `V`; navigacija do podrobnosti ohrani pravilni ID. | Preklop pogledov in odpiranje podrobnosti. |
| R08 | Projektna menjava ohrani `F`, ponastavi filter; osvežitev obnovi `F` in filter začne izključen. | Navigacija med projekti in osvežitev. |
| R09 | Čiščenje odstrani iz `F` samo ID-je iz celotnega `T`; gumb je onemogočen, če `T ∩ F=∅`. | Čiščenje ob tujih/neznanih ID-jih in prazen projekt. |
| R10 | Status vedno izpiše `Priljubljeno: |T ∩ F| od |T|.`; števci stolpcev table so `|V ∩ status|`. | Primerjava števcev pred/med filtrom. |
| R11 | `storage` z ustreznim ključem uporabi isto validacijo; `newValue=null` pomeni `F=∅`; drugi ključ se prezre; dogodek ne zapisuje. Izjema branja/pisanja ne prekine UI in sproži opozorilo z besedo »shramba«. | Sinhronizacija in ignoriranje dogodkov; simulacija izjem, če jo okolje dopušča. |
| R12 | Funkcionalnost priljubljenih ne pošilja API zapisov in ne spreminja polj `Task`; Folio ostane uporabna pri praznih in velikih seznamih ter na ozkem zaslonu. | Skupni regresijski testi, API opazovanje, odzivni pregled in robni podatki. |

## Izvedba in sledljivost

Vsi spodnji izidi se nanašajo na končni zagon `npm run check` z dne
28. 9. 2026: 54/54 preverjanj je uspelo. Imena agentnih testov so v
`tests/agent/P07.agent.spec.ts`; razvojni ID-ji D01–D04 so v skupnem
`tests/development/P07.spec.ts`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Klik spremeni le `F` za ID gumba; naslov ni identiteta. | D01 independent favorites by ID; `favorites are independent by task ID and persist as sorted ID-only data`. | `src/App.tsx` (62), `src/TaskBoard.tsx` (36), `src/useFavorites.ts` (51–56). | Uspešno, v končnem `npm run check`. |
| R02 | Serializacija je `{version:1,ids:sort(unique(F))}`. | `favorites are independent by task ID and persist as sorted ID-only data`. | `src/useFavorites.ts` (40–48). | Preverjena sta vrstni red ID-jev in odsotnost polj opravila; uspešno. |
| R03 | Veljavni nizi se deduplicirajo; neznani ostanejo v `F`, a niso prikazani. | Zunanji storage dogodek z dvojnim ID-jem; projektno čiščenje ohrani `unknown-id`. | `src/useFavorites.ts` (5–15), `src/App.tsx` (15–16, 49). | Uspešno; števec vsebuje le ujemanje s trenutnimi opravili. |
| R04 | Neveljavni zapis da prazno množico brez začetnega zapisa. | `invalid initial storage is ignored without being rewritten; storage events synchronize without writing`; `unsupported storage shapes and a missing key start empty without rewriting them`. | `src/useFavorites.ts` (5–23). | Preverjeni so napačen JSON, version, manjkajoči ids, neniz v ids in manjkajoči ključ; uspešno. |
| R05 | `V` ohrani vrstni red `T`; privzeto je filter izključen. | `filter, board, project switch, and project clearing retain the global IDs`; `more than ten tasks retain source order and count only visible favorites`. | `src/App.tsx` (13–16, 48). | Preverjena sta izklopljen začetni filter in vrstni red pri 12 opravilih; uspešno. |
| R06 | Če je filter aktiven in `V=∅`, je prikazano zahtevano prazno stanje, filter ostane dostopen. | D02 filter and remove visible favorite; `empty project keeps favorite controls available and reports zero results in both views`. | `src/App.tsx` (47–53). | Odstranitev zadnjega rezultata ter ničelni projekt v obeh pogledih; uspešno. |
| R07 | Preglednica in tabla porabita isti `F` in `V`; podrobnosti ciljajo ID. | D04 view parity and no writes; osnovni `board navigation preserves the view and opens duplicate titles by ID without writes`. | `src/App.tsx` (53–70), `src/TaskBoard.tsx` (13–43), obstoječi `src/TaskDetails.tsx` in `src/navigation.ts`. | Preklop pogleda in ID-povezava sta prestala skupne in agentne teste. |
| R08 | Ob zamenjavi projekta je filter false; globalni `F` ostane. | D03 storage and refresh; `filter, board, project switch, and project clearing retain the global IDs`. | `src/App.tsx` (13, 100), `src/useFavorites.ts` (26–64). | Preverjeni sta menjava projekta in osvežitev; uspešno. |
| R09 | Odstrani se samo `F ∩ ids(T)`; brez zadetkov je gumb onemogočen. | `filter, board, project switch, and project clearing retain the global IDs`; prazni projektni test. | `src/App.tsx` (16, 49), `src/useFavorites.ts` (58–62). | Tuji in neznani ID-ji so ostali; ničelni projekt ima onemogočen gumb; uspešno. |
| R10 | Števec kaže `|F ∩ T| od |T|`; stolpci štejejo `V`. | `filter, board, project switch, and project clearing retain the global IDs`; `more than ten tasks retain source order and count only visible favorites`. | `src/App.tsx` (16, 50), `src/TaskBoard.tsx` (16–22). | Preverjeni so števci 2/8, 2/12 in števci filtriranih stolpcev; uspešno. |
| R11 | Ustrezen storage dogodek sinhronizira brez zapisa; izjeme pustijo UI uporaben in opozorijo. | `invalid initial storage is ignored without being rewritten; storage events synchronize without writing`; testi bralne in zapisovalne napake. | `src/useFavorites.ts` (18–23, 31–38, 40–48), `src/App.tsx` (95). | Preverjeni so pravi in drugi ključ, `null` ter izjemi branja in zapisa; uspešno. |
| R12 | Oznake se zapisujejo lokalno; API in polja opravil ostanejo nedotaknjeni, ozka stran se ne razširi. | `npm run check`, D04 ter agentni `readonly` preverijo API zapise in širino; osnovni mobilni regresijski testi. | `src/useFavorites.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. | Vseh 54 testov uspešnih; API zapisov ni bilo, mobilni preverjevalnik ni zaznal vodoravnega preliva strani. |

## Odprta vprašanja in omejitve

Specifikacija sledi izrecnim navodilom. Za neznane ID-je ni prikaza, saj API
ostaja edini vir opravil. Če brskalnik blokira `localStorage`, oznake delujejo
do osvežitve in opozorijo uporabnika. Končni skriti testi niso bili na voljo;
dejanski obseg preverjanja je naveden v `verification.md`.

## Zapis popravkov

- 28. 9. 2026: po izvedbi so bile načrtovane povezave v tabeli sledljivosti
  zamenjane z dejanskimi datotekami, testi in rezultati. Sprejemna pravila se
  niso spremenila.
