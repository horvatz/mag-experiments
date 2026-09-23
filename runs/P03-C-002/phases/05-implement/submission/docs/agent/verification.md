# P03 — preverjanje in dokazila

2026-09-23, postopek C. Merilo so [R01–R12](../../task/instructions.md), [specifikacija](P03/spec.md) in [načrt](P03/plan.md).

## Potek

- Začetek implementacije: pregledane lokalna veščina, ustava, specifikacija, načrt, naloge in izvorne zahteve. Potrjeni posegi v ProjectView, čisti pomočnik in slogi kontrol; TaskBoard se ponovno uporabi. Infrastruktura ostaja nespremenjena.
- Dokazila so po izrecnem navodilu tega koraka v `docs/agent/verification.md`; prejšnje omembe `docs/agent/P03/verification.md` so usklajene s to potjo.
- Ob začetku aplikacijski testi še niso bili izvedeni. Nedostopni končni testi ne bodo predstavljeni kot izvedeni.

- T001–T005: izvedeni pomočnik, lokalno stanje, kontrole, skupni prikazani seznam, števci, prazna stanja in prilagodljivi slogi. TaskBoard, API, navigacija in strežnik niso spremenjeni. Preverjanje s testi še sledi.

- T006–T007: napisani testi A01–A08 v `tests/agent/P03.spec.ts`; pokrivajo S01–S07 z dodatnimi podatki in zamrznjenim vhodom. Zagon `npm run check` sledi; uspeh še ni potrjen.

## Rezultati preverjanja

- `npm run check` — **uspešno, izhodna koda 0**. Vključuje ESLint, `tsc --noEmit`, produkcijsko gradnjo Vite in Playwright. **54/54 testov uspešnih**: 38 osnovnih (14 API + 12 namiznih + 12 mobilnih), 8 razvojnih P03 in 8 lastnih A01–A08. Playwright: 21,1 s. Celoten [dnevnik check.log](P03/check.log) vsebuje imena testov in rezultate. Popravki po zagonu niso bili potrebni.
- `WEB_PORT=5193 API_PORT=3123 npm run dev` — zagon za pregled izvirnih podatkov; [dnevnik](P03/preview.log). Brskalnik je povezan prek `chromium.connect(wsEndpoint)` iz `task/browser.json`, brez lokalnega zagona Chromiuma.
- Vizualni pregled: [izvirni namizni Folio](P03/folio-desktop.png), [izvirna tabla pri 390 pik](P03/folio-mobile.png), [filtrirana preglednica](P03/desktop.png), [ozka filtrirana preglednica](P03/mobile-table.png) in [ozka filtrirana tabla](P03/mobile-board.png). Vseh pet posnetkov je bilo dejansko odprtih in pregledanih. Ohranjen je logotip, stranski/zgornji meni, sistemska pisava, barve, kartice in vidni fokus. Kontrole se prelomijo; oba pogleda uporabljata notranje drsenje. [Vizualni dnevnik](P03/visual.log): pri 390 × 844 ni razširitve strani in ni napak JavaScript.
- Test A07 potrjuje odsotnost zapisovalnih zahtev in aplikacijskih dostopov do `/__test/`, nespremenjene podatke API-ja, podrobnosti po ID-ju in tipkovnični fokus. A08 preveri filtriranje zamrznjenih vhodnih objektov brez spremembe polj ali zaporedja.

## Sledljivost R01–R12

Pogoji in simboli so opredeljeni v [specifikaciji](P03/spec.md#predikati-in-spremembe-stanja). A01–A08 pomenijo poimenovane teste v [lastni testni datoteki](../../tests/agent/P03.spec.ts); D01–D04 so [razvojni testi](../../tests/development/P03.spec.ts), izvedeni na namiznem in mobilnem projektu. Izid »uspešno« spodaj velja za navedena izvedena preverjanja, ne za nedostopne končne teste.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | F₀; V=T_p in izvorno zaporedje | A01, A06; D01 | [taskFilters.ts](../../src/taskFilters.ts), `defaultFilters`; [App.tsx](../../src/App.tsx), `ProjectView` stanje in vrstice | Uspešno — [check.log](P03/check.log), A01/A06/D01. |
| R02 | NFD, odstranitev U+0300–U+036F in male črke vseh štirih polj | A01: ID, naslov, opis, oseba ter obe obliki Unicode; D01 | [taskFilters.ts](../../src/taskFilters.ts), `normalize`, sestavljanje `text` | Uspešno — [check.log](P03/check.log), A01/D01. |
| R03 | Vse neprazne besede so dobesedni podnizi; prazne beline ne omejujejo | A01: preurejene besede, tabulator, `.*`, `[x]`, `^$` | [taskFilters.ts](../../src/taskFilters.ts), `words` in `every/includes` | Uspešno — [check.log](P03/check.log), A01. |
| R04 | Iskanje ∧ stanje ∧ natančna oseba | A02, A03; D02 | [taskFilters.ts](../../src/taskFilters.ts), `filterTasks`; [App.tsx](../../src/App.tsx), kontrolirani selecti | Uspešno — [check.log](P03/check.log), A02/A03/D02. |
| R05 | Enkratne neprazne osebe iz T_p, brez stare izbire po menjavi | A02: nespremenjene možnosti ob filtrih; A04/A06: drugi projekt | [App.tsx](../../src/App.tsx), `assignees` iz `tasks` in `key={project.id}` | Uspešno — [check.log](P03/check.log), A02/A04/A06. |
| R06 | Enaki ID-ji pogledov, ohranitev F in pravilni stolpci | A03; D02 | [App.tsx](../../src/App.tsx), `visibleTasks`; [TaskBoard.tsx](../../src/TaskBoard.tsx), obstoječi `entries` | Uspešno — [check.log](P03/check.log), A03/D02. |
| R07 | Menjava projekta ponastavi F, podatki pripadajo trenutnemu projektu | A04, A06; baseline »switching project during loading…« | [App.tsx](../../src/App.tsx), ključ ProjectView in projektni URL vira; obstoječi [useResource.ts](../../src/useResource.ts) | Uspešno — [check.log](P03/check.log), A04/A06 in baseline na obeh širinah. |
| R08 | Osvežitev F₀, brez filtrov v URL-ju/shrambi | A04: primerjava URL-ja, localStorage/sessionStorage/piškotkov in osvežitev | [App.tsx](../../src/App.tsx), lokalni `useState`; pregled kode brez zapisov v shrambo | Uspešno — [check.log](P03/check.log), A04. |
| R09 | N iz V, M iz T_p, C_k iz V | A03, A05, A06; D04 | [App.tsx](../../src/App.tsx), `counts`, status in badge; [TaskBoard.tsx](../../src/TaskBoard.tsx), dolžina `entries` | Uspešno — [check.log](P03/check.log), A03/A05/A06/D04. |
| R10 | Ni zadetkov samo pri M>0,N=0; pravi prazen projekt ohrani običajen prikaz | A05, A06; D03; baseline prazni projekt | [App.tsx](../../src/App.tsx), pogoji praznih stanj in ohranjen `TaskBoard` | Uspešno — [check.log](P03/check.log), A05/A06/D03. |
| R11 | Enkratno čiščenje F₀, stabilno zaporedje in nespremenjena polja | A01/A02/A05: čiščenje; A07: podatki API-ja; A08: zamrznjeni vhodi; D03 | [App.tsx](../../src/App.tsx), `setFilters(defaultFilters)`; [taskFilters.ts](../../src/taskFilters.ts), čisti `filter` | Uspešno — [check.log](P03/check.log), navedeni testi. |
| R12 | Navigacija/podrobnosti, brez zapisov, Folio in 390 pik | A07; D04; 38 osnovnih preverjanj; vizualni pregled | [App.tsx](../../src/App.tsx), povezave po ID; [styles.css](../../src/styles.css), `.task-filters`; nespremenjene navigacija/podrobnosti/API | Uspešno — [check.log](P03/check.log), [visual.log](P03/visual.log) in zgornji posnetki. |

## Omejitve in predaja

Vsa načrtovana preverjanja so izvedena; znanih neizpolnjenih zahtev R01–R12 ni. Končni testi niso dostopni in niso bili izvedeni. Dovoljena podatkovna domena je širša od končnega nabora lastnih primerov; poročilo ne trdi izčrpnega preverjanja vseh besedil ali velikosti podatkov.

Spremenjene aplikacijske datoteke: `src/App.tsx`, `src/styles.css`, nova `src/taskFilters.ts`. Dodani lastni testi: `tests/agent/P03.spec.ts`. Strežnik, skupni testi/tipi, odvisnosti in nastavitve so ohranjeni. Procesna dokumentacija je v `docs/agent/P03`; ustava in kazalec funkcionalnosti sta bila pripravljena v predhodnih fazah. Naslednji korak `converge` sproži izvajalnik.
