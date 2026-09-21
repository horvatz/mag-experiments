# Izvedbeni načrt P02

2026-09-21. Podlaga: [specifikacija](spec.md), [izvirne zahteve](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md), [dizajn Folio](../../dizajn.md). Predikati P1–P9 in scenariji S1–S8 so opredeljeni v specifikaciji in se tu ne podvajajo.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8, lucide-react in CSS s spremenljivkami Folio. Preverjanje že podpirajo ESLint, TypeScript in Playwright z nameščenim Chromiumom. Novi paketi ali nastavitve niso potrebni.

`App.tsx` vsebuje `ProjectView`, ki bere opravila prek `useResource`; ključ `project.id` ob menjavi projekta ponovno ustvari komponento, preklop table/preglednice pa je ne. `TaskBoard` prejema isti seznam kot preglednica in števci. `TaskDetails` ob odprtju bere posamezno opravilo iz API-ja. `updateTask` že pošlje pravilni PATCH s tipom `TaskUpdate` iz nespremenjenega `shared/types.ts`.

## Odločitve in tok podatkov

1. **Projektno stanje operacije (R01–R04, R08–R11).** Dodati `useBulkStatus` kot lokalni React hook, klican v `ProjectView`. Hrani izbor kot množico ID-jev, cilj, stanje pošiljanja, napake in povzetek; posnetek operacije hrani ID-je/naslove, isti cilj ter množico kumulativnih uspehov. Podatki niso trajni. Obstoječi ključ projekta izvede ponastavitev; preklop pogleda ohrani hook. Čiščenje ponastavi samo operacijo.
2. **Posamično shranjevanje (R05–R10).** Ob potrditvi sinhrono postaviti zaščitni `useRef` pred podvojitvijo in zajeti izbor/cilj/naslove. Zagnati ločeno zahtevo `updateTask` za vsak ID, sočasno, s posamičnim `try/catch`. Vsak uspeh takoj posodobi pripadajoče potrjeno stanje, vsaka zavrnitev shrani ID/naslov/razlog. Zaključek vseh zahtev določi neuspele izbore in povzetek. Posamezna zavrnitev ne prekine ostalih. Ne filtrirati opravil, ki že imajo ciljno stanje.
3. **Ponovitev z istim posnetkom (R07–R11).** Poskus zajame samo trenutno neuspele ID-je, ohrani izvirni cilj/naslove in že uspešne ID-je. Množica uspehov prepreči dvojno štetje. Ob popolnem uspehu odstraniti napake, izprazniti izbor/cilj in ohraniti končni povzetek. Ob čiščenju ali novi običajni potrditvi se začne neodvisna evidenca uspehov. Zaklepi so v UI in v izvajalcih dejanj; ponovitev/čiščenje ne moreta obiti aktivne zahteve.
4. **En vir potrjenih podatkov (R06, R12).** `useResource` razširiti s funkcijo za funkcijsko posodobitev trenutnih podatkov, vezano na veljavni ključ vira. Ob uspešnem odgovoru zamenjati samo `status` opravila z ustreznim ID-jem; druga polja ohraniti. Funkcijske posodobitve preprečijo izgubo rezultatov ob skoraj sočasnih odgovorih. Preglednica, tabla in števci že uporabljajo isti seznam. Pozneje odprte podrobnosti ponovno berejo shranjeno opravilo; njihova obstoječa pot ne potrebuje spremembe. Ob osvežitvi vir ponovno pride iz API-ja.
5. **Kontrole in izgled (R01–R04, R07–R11).** `BulkActions` prikaže skupni checkbox, števec, označeni select, tri dejanja, napredek, povzetek in napake po dogovoru. Skupno polje uporablja DOM-lastnost `indeterminate`; prazen projekt ga onemogoči. Posamezna polja v vrsticah in karticah so zunaj povezav v podrobnosti; tabla ohrani povezavo z obstoječim dostopnim imenom in `data-task-id`. Nad pogledoma je ista skupna kontrolna vrstica, tudi ob praznem seznamu. Uporabiti obstoječe barve, odmike, gumbe, vidni fokus ter prelamljanje kontrol na ozki širini.

## Predvidene datoteke

| Datoteka | Sprememba | Zahteve |
| --- | --- | --- |
| `src/useBulkStatus.ts` (nova) | Stanje operacije, zaščita pred dvojnim zagonom, API poskusi, ponavljanje, čiščenje. | R03–R11 |
| `src/BulkActions.tsx` (nova) | Skupni izbor, cilj, zaklepi, napredek, povzetek in napake. | R02, R04, R07–R11 |
| `src/App.tsx` | Povezava hooka in potrjenih podatkov; polja preglednice; posredovanje izbora tabli. | R01–R12 |
| `src/useResource.ts` | Funkcijska posodobitev samo veljavnega vira po potrjenem odgovoru. | R06, R12 |
| `src/TaskBoard.tsx` | Checkbox po ID ob vsaki povezavi; skupno upravljanje izbora in zaklepa. | R01, R03, R06, R10, R12 |
| `src/styles.css` | Omejeni dodatki za kontrolno vrstico, polja in sporočila v slogu Folio. | Dogovor o vmesniku, R12 |
| `tests/agent/P02.spec.ts` (nova) | Manjkajoči scenariji S1–S8; uporaba priloženega javnega testnega pripomočka. | R01–R12 |
| `docs/agent/P02/spec.md`, `plan.md`, poznejši `tasks.md` in `verification.md` | Posodobljena sledljivost, stanje izvedbe, dejanski izidi in dnevniki pod to mapo. | Oddaja |

`src/api.ts`, `TaskDetails.tsx` in navigacija se uporabijo v obstoječi obliki, razen če preverjanje pokaže konkretno napako v dovoljenem obsegu. Strežnik, skupni tipi in testi, priloženi razvojni testi/pripomoček, odvisnosti in infrastruktura ostanejo nespremenjeni.

## Vrstni red izvedbe in preverjanje

1. Dodati hook ter možnost posodabljanja potrjenih podatkov; nato povezati kontrolno vrstico in oba pogleda. Preveriti tipe in lint.
2. Dodati smiselne Playwright scenarije iz specifikacije, zlasti ponavljajoče in popolne zavrnitve, sprotni uspeh ob zadržanem odgovoru, natančna telesa/število zahtev, enake naslove, prazen projekt, zaklepe in novo operacijo po čiščenju. Vključiti projekt/pogled/osvežitev ter podrobnosti in mobilno širino. Priprava izidov uporablja samo testni pripomoček; API se v aplikaciji ne nadomešča.
3. Zagnati `npm run lint`, `npm run build` in `npm test` v obstoječem okolju. Konfiguracija že zajame skupne teste, razvojne teste za namizni in mobilni prikaz ter `tests/agent/`. Uporabiti pripravljeni brskalniški endpoint; če strežnik brskalnika ni zagnan, uporabiti priloženi `node task/browser-server.mjs` brez spreminjanja datotek. Napake odpravljati v dovoljenih aplikacijskih datotekah/lastnih testih.
4. Primerjati celotne podatkovne posnetke vseh projektov, ne samo vidnih stanj. Preveriti točne ID-je in telesa zahtev ter nič novih zahtev ob pripravi/čiščenju. Za omejitve razvojnih primerov dodati ustrezne scenarije iz specifikacije.
5. Shraniti dejanske dnevnike v `docs/agent/P02/`, posodobiti sledljivost v `spec.md` z dejanskimi simboli/testi in povezavo na `verification.md`. Navesti neizvedena preverjanja in odstopanja, če ostanejo. Ne ponavljati uspešnih preverjanj brez sprememb ali nerešenega dvoma.

## Usklajenost in omejitve

Načrt pokriva R01–R12 brez novih funkcionalnih zahtev, odvisnosti, zunanjih meritev ali sprememb infrastrukture. Raziskava je omejena na lokalno kodo in priložene dokumente. Ni bistvenih odprtih vprašanj. Izključitve iz specifikacije ostanejo veljavne. Posebna tveganja izvedbe so zastareli posnetki React stanja, podvajanje zahtev in checkbox znotraj povezave; zgornje odločitve jih neposredno naslovijo.

Ta korak je pripravil samo načrt. Implementacija in preizkusi še niso izvedeni; naslednje korake sproži izvajalnik. Čas se spremlja z `node task/time-budget.mjs`, zadnja minuta ostane za predajo.
