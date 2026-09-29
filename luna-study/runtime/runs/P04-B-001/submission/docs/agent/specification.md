# Specifikacija: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio prikazuje opravila iz izbranega projekta v preglednici ali na tabli. Dodamo uporabniško nastavljivo razvrščanje prikazanega seznama po primarnem in izbirnem sekundarnem ključu. Ob izenačenju ostane vrstni red iz API-ja. Sprememba ohrani potrjeni videz in bralne funkcije Folio.

## Vhodi, dejanja in izidi

Vhod je seznam `Task[]` iz `GET /api/projects/{projectId}/tasks` in njegov izvorni indeks `i(t)`. Tip [Task](../../shared/types.ts#L8) določa polja `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; status je `todo | in_progress | done`. Domenski vhod zagotavlja nize, veljavne datume `YYYY-MM-DD`, unikatne ID-je in pripadnost naloge svojemu projektu.

Kontrole so HTML selecti: **Primarni ključ** = `original/title/assignee/status/dueDate`, **Primarna smer** = `asc/desc`, **Sekundarni ključ** = `none/title/assignee/status/dueDate`, **Sekundarna smer** = `asc/desc`. **Izvorni vrstni red** ponastavi vse štiri vrednosti na `(original, asc, none, asc)`. Nastavitve veljajo za trenutni projekt. Preklop preglednice/table in odpiranje ali zapiranje podrobnosti jih ohrani; drug projekt in osvežitev jih ponastavita. Nastavitve niso v URL-ju ali trajni shrambi.

## Zahteve in pravila

Naj bo `T=[t₀,…,tₙ₋₁]` prejeto polje. `cmpK(a,b)` vrne −1, 0 ali 1. Za besedilna ključa je `N(s)=lowercase(removeU+0300–U+036F(NFD(s)))`; primerjava `N(a) < N(b)` oziroma `>` je leksikografska po UTF-16, brez lokalnih pravil ali naravnega razvrščanja števil. Statusni vrstni red je `todo < in_progress < done`; zaradi veljavnega formata `YYYY-MM-DD` je leksikografska primerjava datumov kronološka.

Pravilo projekcije: če je primarni ključ `original`, je rezultat `T` ne glede na druge kontrole. Sicer primerjaj najprej `dP·cmpP(a,b)` (`d=1` za `asc`, `d=−1` za `desc`). Ob rezultatu 0 uporabi 0, če je sekundarni ključ `none`, sicer `dS·cmpS(a,b)` z neodvisno sekundarno smerjo. Če sta primerjavi 0, uredi po `i(a)<i(b)`. Tako ponovitev istega ključa ne obrne izenačenih elementov. Razvrščanje je kopija/projekcija; prejeto polje in opravila ostanejo nespremenjeni.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetne kontrole `(original, asc, none, asc)` pokažejo `T` v prejetem vrstnem redu. | Preveri izbrane vrednosti in zaporedje ID-jev ob prvem prikazu. |
| R02 | `title` in `assignee` uporabljata zgoraj določeni `N(s)` in UTF-16 primerjavo. | Različice z diakritiko, velikostjo črk, ločili in številkami kot nizi. |
| R03 | `status` primerja po določenem vrstnem redu; `dueDate` veljavne datume kronološko. | Vsi statusi; datumi čez mesece/leto. |
| R04 | Smer obrne le primerjavo svojega ključa; pri enakosti primarnega in sekundarnega ostane izvorni vrstni red. | Obe primarni smeri z enakimi vrednostmi. |
| R05 | Sekundarni ključ se uporabi samo ob primarnem izenačenju; njegova smer je neodvisna. | Ključna para in kombinacije smeri. |
| R06 | Izenačenost obeh ključev razreši `i`; podvojen ključ je dovoljen. `original` kot primarni vedno vrne `T`. | Podvojeni ključi, isti primarni/sekundarni ključ in kontrole ob `original`. |
| R07 | Tabla ima stalne stolpce `todo`, `in_progress`, `done`; kartice znotraj vsakega so podzaporedje skupno razvrščenega `T`. | Primerjaj urejene ID-je v preglednici in po stolpcih table. |
| R08 | Preklop pogleda in odprtje/zaprtje podrobnosti ne spremenita štirih nastavitev. | Spremeni nastavitve, preklopi pogled, odpri in zapri podrobnosti. |
| R09 | Menjava projekta in osvežitev nastavita vse kontrole na privzete. V URL-ju/shrambi ni nastavitev razvrščanja. | Menjava projekta; osvežitev po nestandardnih nastavitvah. |
| R10 | Gumb ponastavi vse štiri vrednosti. `T=[]` in `|T|=1` delujeta pri vseh ključih/smereh. | Ponastavitev; prazni in enoelementni vhod. |
| R11 | Projekcija ne spreminja polj, pripadnosti, štetij ali `T` ter ne sproži zapisovalnega API-ja. | Primerjaj vhod/povzetke pred in po; zabeleži API metode. |
| R12 | Vsak ID se v aktivnem pogledu pojavi natanko enkrat in odpre svoje podrobnosti, tudi ob enakih naslovih. Ohranijo se navigacija projektov, stanje nalaganja/napake/praznega seznama, povzetki, slovenske oznake ter Folio. Dostopni ostanejo skupina `Prikaz opravil`, gumba `Preglednica`/`Tabla`, tabela s stolpci Opravilo/Stanje/Odgovorna oseba/Rok, regija `Tabla opravil` in njeni stolpci Pripravljeno/V delu/Končano. Ohranita se `data-task-id` in `aria-label="Pregled stanj opravil"`. Nova dejanja so zunaj povezave opravila. Pri 390 px se stran ne razširi; notranje drsenje je dovoljeno. | ID-ji in cilj podrobnosti; regresijski bralni/dostopnostni pogoji; širina 390 px. |

## Izvedba in sledljivost

Relevantno obstoječe mesto za kontrole, podatkovni seznam in preglednico je [ProjectView](../../src/App.tsx#L10); seznam se bere iz javnega API-ja, povzetki pa iz `tasks` ([App](../../src/App.tsx#L11)). Tabla prejme opravila in ohranja vrstni red znotraj statusnega filtra ([TaskBoard](../../src/TaskBoard.tsx#L7)). `key={project.id}` že ponastavi lokalno stanje ob menjavi projekta ([App](../../src/App.tsx#L86)); pot vsebuje le projekt/opravilo/pogled ([navigation](../../src/navigation.ts#L10)). Podrobnosti se nalagajo po ID-ju ([TaskDetails](../../src/TaskDetails.tsx#L9)). Preglednica in tabla imata notranje vodoravno drsenje ([styles.css](../../src/styles.css#L66)). To so izhodiščna mesta, ne dokaz implementacije novega razvrščanja.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti tuple; ohrani `T`. | D01: začetni vrstni red. | `App.tsx` `ProjectView` (kontrole/projekcija). | D01 obstaja; avtor specifikacije ga ni zagnal. |
| R02 | `N(s)` in UTF-16. | D01 preveri del naslova; Unicode/assignee primeri niso v vidnem razvojnem testu. | `App.tsx`; obstoječa polja v `shared/types.ts`. | Nepreverjeno. |
| R03 | Rang statusa in datuma. | D02 preverja status + sekundarni datum v desc; polna matrika ni zajeta. | `App.tsx`; `TaskStatus` v `shared/types.ts`. | Nepreverjeno. |
| R04 | Samo lokalni obrat primerjave; stabilnost. | D02 preveri desc sekundarnega ključa; izenačenja/smer primarnega niso posebej zajeti. | `App.tsx`. | Nepreverjeno. |
| R05 | Sekundarno samo pri primarnem izenačenju. | D02: status + datum. | `App.tsx`. | Scenarij obstaja; ni zagnan. |
| R06 | Stabilen izid in `original` ignorira ostale kontrole. | Namenski dvojni ključi in različne kontrole; ni v D01–D04. | `App.tsx`. | Nepreverjeno. |
| R07 | Fiksni stolpci, relativni vrstni red. | D03: tabla po sortiranju datuma. | `App.tsx`; `TaskBoard.tsx`. | Scenarij obstaja; ni zagnan. |
| R08 | Nastavitve preživijo pogled/podrobnosti. | Regresijska scenarija preklopa in dialoga. | `App.tsx`; `TaskDetails.tsx`; `navigation.ts`. | V `tests/development/P04.spec.ts` ni pokrito. |
| R09 | Projekt/osvežitev ponastavita. | Menjava projekta in refresh. | `App.tsx` `key={project.id}`; brez novih URL/shrambnih nastavitev. | V D01–D04 ni pokrito. |
| R10 | Ponastavi vse; deluje pri 0/1. | D04: gumb; ločena prazna/enojna robna primera. | `App.tsx`; prazen izhodiščni prikaz. | D04 obstaja, ni zagnan; 0/1 nepreverjeno. |
| R11 | Brez mutacije in zapisov. | D04 spremlja zapisovalne zahteve. | `App.tsx`; bralni `useResource`; zapis mora ostati odsoten. | Scenarij obstaja, ni zagnan. |
| R12 | Enkratni ID, pravilni detajli, Folio/a11y/390 px. | `tests/baseline.spec.ts`: podvojeni naslovi po ID, navigacija table/board in prazen pogled; D04 preveri `scrollWidth`. | `App.tsx`; `TaskBoard.tsx`; `TaskDetails.tsx`; `styles.css`. | Testi so na voljo, niso bili zagnani v vlogi avtorja specifikacije. |

Razvojni testi D01–D04 so v `tests/development/P04.spec.ts`. V tej vlogi nisem zagnal aplikacije ali testov; končnih testov ni mogoče šteti kot izvedenih. Implementer naj ob implementaciji dopolni to tabelo s svojimi datotekami, dejanskimi zagoni in dokazi.

## Odprta vprašanja in omejitve

Nejasnosti glede domenskih vhodov ni: manjkajoči datumi niso zahtevani; prazni/enoopravilni seznami pa so. Končni testi niso dostopni. Pregled kode potrjuje začetna mesta in obstoječe obnašanje, ne pa še nove funkcionalnosti. Potrjeni slog je Folio iz [dizajna](../dizajn.md); na ozkem zaslonu sta drsni vsebniki že predvidena.
