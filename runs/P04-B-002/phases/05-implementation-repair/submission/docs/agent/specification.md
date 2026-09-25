# P04 — Stabilno razvrščanje z dvema ključema

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta razvrščati po dveh ključih v preglednici in tabli ob ohranitvi videza Folio. Razvrščanje je lokalna projekcija podatkov javnega API-ja in ne zapisuje podatkov. Specifikacija je zaključena po pregledu izhodišča in dopolnjena po ugotovitvi pregledovalca; konkretni dokazi izvedbe so navedeni spodaj in pripisani implementerju.

## Vhodi, dejanja in izidi

Vhod je prejeto polje opravil z enkratnimi ID-ji; naslovi in odgovorne osebe so nizi, datumi so veljavni YYYY-MM-DD. Število opravil je poljubno, tudi 0 ali 1. Kontrole so štirje HTML selecti: Primarni ključ (original/title/assignee/status/dueDate), Primarna smer (asc/desc), Sekundarni ključ (none/title/assignee/status/dueDate), Sekundarna smer (asc/desc), ter gumb Izvorni vrstni red. Privzeto stanje je (original, asc, none, asc).

Tip Task v `shared/types.ts` vsebuje id, projectId, title, description, status, assignee in dueDate. Podatki prihajajo iz GET `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`. ID-ji in zaporedje so poljubni, naslovi se lahko ponavljajo, število opravil lahko preseže deset. Besedila lahko vsebujejo Unicode in ločila; vsako opravilo pripada svojemu projektu. Neveljavni ali manjkajoči datumi niso del zahtevanega obsega.

Sprememba kontrole takoj spremeni prikaz brez shranjevanja. Zaprtje podrobnosti ohrani nastavitve; ločen preklic razvrščanja ni potreben. Napake GET, ponovni poskus in stanja nalaganja ohranijo obstoječe obnašanje. Kontrole ostanejo uporabne tudi v praznem projektu. Ohranijo se `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu so zunaj njegove povezave. Pri 390 px se cela stran ne razširi, notranje drsenje table in preglednice je dovoljeno.

## Zahteve in pravila

Formalna pravila so opredeljena v [Predikati in povezava z zahtevami](verification.md#predikati-in-povezava-z-zahtevami) in so del te specifikacije. T pomeni izvorno prejeto polje, i(t) njegov indeks, S štiri nastavitve in P(T,S) prikazno projekcijo. Pri primary=original velja `IDs(P(T,S))=IDs(T)` v istem zaporedju ne glede na ostale kontrole. Sicer velja prva neničelna primerjava primarnega ključa z njegovo smerjo, sekundarnega ključa z njegovo smerjo (pri none je 0), nato `i(a)-i(b)`, ki se nikoli ne obrne. Enaka ključa sta dovoljena tudi z nasprotnima smerema.

Normalizacija je točno NFD → odstranitev U+0300–U+036F → male črke; primerjava uporablja `<` in `>`, brez localeCompare, naravnega številskega razvrščanja ali dodatnega trimanja. Veljavne YYYY-MM-DD lahko primerjamo kot nize. Projekcija ohrani množico ID-jev, polja, pripadnost in števce, izvorno polje pa ostane nespremenjeno. Vsak stolpec je filter iste projekcije po statusu. Sprememba pogleda/podrobnosti ohrani S; menjava projekta, reload in gumb nastavijo S=(original,asc,none,asc). Sama izbira original ne zahteva ponastavitve drugih kontrol. Nastavitve razvrščanja se ne shranjujejo v URL ali trajno shrambo; obstoječa izbira pogleda v URL ostane.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzete štiri vrednosti in vrstni red prejetega polja. | Začetno nalaganje projekta. |
| R02 | title/assignee: NFD, odstranitev U+0300–U+036F, male črke, primerjava UTF-16 z < in >. | Unicode, enakovredne normalizacije, številke v besedilu. |
| R03 | status: todo < in_progress < done; dueDate kronološko. | Vsi statusi in različni veljavni datumi. |
| R04 | desc obrne le primerjavo ključa; izenačeni elementi ostanejo stabilni. | Enakosti v obeh smereh. |
| R05 | Sekundarni ključ deluje le ob enakem primarnem; smer je neodvisna. | Kombinacije ključev in smeri. |
| R06 | Ob popolni enakosti ohrani izvorni vrstni red; enaka ključa sta dovoljena; original vedno prevlada. | Enaka ključa, none, original z različnimi ostalimi kontrolami. |
| R07 | Stolpci table ostanejo stalni; njihove kartice sledijo relativnemu vrstnemu redu razvrščene preglednice. | Primerjava ID-jev med pogledoma. |
| R08 | Preklop pogleda ter odpiranje/zapiranje podrobnosti ohranita nastavitve in vrstni red. | Navigacija z aktivnim razvrščanjem. |
| R09 | Menjava projekta in osvežitev ponastavita vse kontrole; brez trajne shrambe ali URL-ja. | Menjava projekta, osvežitev. |
| R10 | Izvorni vrstni red ponastavi vse kontrole; 0/1 opravil podpira vse ključe/smeri. | Ponastavitev in robna projekta. |
| R11 | Projekcija ne spreminja podatkov, izvornega polja, pripadnosti ali skupnih števil in ne zapisuje na API. | Primerjava podatkov in opazovanje zahtev. |
| R12 | Vsak ID natanko enkrat in prave podrobnosti tudi pri enakih naslovih; ohranjene bralne funkcije in odzivni Folio. | ID-ji, navigacija, regresija, širina 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete vrednosti in izvorno zaporedje | D01, A04 | taskSorting.ts: defaultTaskSort; App.tsx: ProjectView | Implementer: uspešno, check.log. |
| R02 | Normalizacija in UTF-16 | D01, A01, A02 | taskSorting.ts: normalize, compareKey | Implementer: uspešno, check.log. |
| R03 | Statusni rang in kronološki datumi | D02, D03, A02 | taskSorting.ts: statusOrder, compareKey | Implementer: uspešno, check.log. |
| R04 | Neodvisna smer brez obrata enakosti | A01–A03 | taskSorting.ts: sortTasks | Implementer: uspešno, check.log. |
| R05 | Sekundarna primerjava ob enakosti | D02, A02, A03 | taskSorting.ts: sortTasks | Implementer: uspešno, check.log. |
| R06 | Stabilnost, enaka ključa, original | A01–A03 | taskSorting.ts: sortTasks in izvorni indeks | Implementer: uspešno, check.log. |
| R07 | Ista projekcija in stalni stolpci | D03, A04, A05 | App.tsx: sortedTasks; TaskBoard.tsx: filter | Implementer: uspešno, check.log. |
| R08 | Ohranjene štiri nastavitve | A04 | App.tsx: stanje ProjectView | Implementer: uspešno, check.log. |
| R09 | Ponastavitev projekta in osvežitve | A04 | App.tsx: key projekta, lokalni useState | Implementer: uspešno, check.log. |
| R10 | Ponastavitev ter 0/1 opravil | D04, A03, A04, A06 | TaskSortControls.tsx; taskSorting.ts | Implementer: uspešno, check.log. |
| R11 | Brez mutacij ali zapisov | D04, A03–A05 | taskSorting.ts; App.tsx: števci | Implementer: uspešno, check.log. |
| R12 | ID-ji, bralne funkcije, odzivni Folio | baseline, A04–A06 | App.tsx, TaskBoard.tsx, TaskDetails.tsx, styles.css | Implementer: uspešno, check.log in mobilni posnetek. |

Datoteke kode v tabeli so pod `src/`. D01–D04 so v `tests/development/P04.spec.ts`, A01–A06 pa v `tests/agent/sorting.spec.ts`. Podrobne povezave in razlaga pokritja so v [Sledljivost po izvedenem preverjanju](verification.md#sledljivost-po-izvedenem-preverjanju). [Dejanski rezultati in dokazi](verification.md#dejanski-rezultati-in-dokazi) pripisujejo implementerju `npm run check` z izhodno kodo 0: ESLint, TypeScript, gradnja in 52 uspešnih testov; dnevnik je [check.log](check.log). A03 vključuje vseh 100 kombinacij nastavitev na zamrznjenem vhodu ter praznem in enoelementnem polju. A05 vključuje 14 opravil, drugačne ID-je in širino 390 px. Vizualni dokaz je [mobilni posnetek](../../test-results/p04-mobile-board.png).

Avtor specifikacije je prebral izvorno kodo izhodišča, teste, pregled in zapis implementerja; sam ni zaganjal aplikacije, testov ali vizualnega pregleda. Navedeni uspehi so rezultati implementerja, ne nov neodvisni zagon. Pregledovalec v [review.json](review.json) ne zahteva sprememb kode. Skriti končni testi niso dostopni; namizni ročni vizualni pregled ni bil izveden. Zgodovina popravka je v [specification-history.md](specification-history.md).

## Odprta vprašanja in omejitve

Izvirna navodila so obvezna tudi ob izpustitvi v tem dokumentu. Specifikator piše samo to datoteko in specification-history.md; implementer izvede spremembe in preverjanja, pregledovalec poda neodvisen pregled. Infrastruktura, shared/, server/, odvisnosti in skupni testi ostanejo nespremenjeni. Aplikacija uporablja samo /api/; ne uporablja /__test/, testnih pripomočkov ali lokalnega nadomestka podatkov. Zagon aplikacije, testi in pregled videza niso naloga specifikatorja.
