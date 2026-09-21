# P05 — Načrt izvedbe

2026-09-22 · Spec Kit 1.0.8 / Lean 1.0.0 · [Specifikacija in R01–R12](spec.md)

## Tehnični kontekst in meje

Obstoječi React 19.3, TypeScript 6 in Vite 8, ikone lucide-react ter Playwright 1.63 so že nameščeni. Uporabimo obstoječe skripte `lint`, `build` (vključuje typecheck) in `test`; nastavitev in odvisnosti ne spreminjamo. Podatkovni model iz `shared/types.ts`, strežnik, API, začetni podatki in skupni testi ostanejo enaki.

`src/App.tsx` vsebuje `ProjectView`: prebere celoten seznam prek `useResource`, izračuna povzetek in prikazuje preglednico ali `TaskBoard`. `ProjectView` je že vezan na `key={project.id}`. Sprememba pogleda ali podrobnosti zato ohrani njegovo lokalno stanje, menjava projekta pa ga ponovno ustvari. `TaskBoard` že stabilno razdeli podano polje med stolpce in šteje njegove elemente. Usmerjanje v `navigation.ts`, prikaz podrobnosti in `useResource.ts` ostanejo v obstoječi obliki.

Načrt spoštuje [projektna načela](../../../.specify/memory/constitution.md), [izvirna navodila](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) ter [dizajn Folio](../../dizajn.md). Izvedbene spremembe so omejene na `src/`, `tests/agent/` in `docs/agent/`. Nobenih vej, commitov, zunanjih virov ali drugih agentov.

## Odločitve in podatkovni tok

1. **Lokalno stanje v ProjectView**: `pageSize: 'all' | 2 | 5 | 10`, `statusFilter: 'all' | TaskStatus`, `page: number`; privzeto `all/all/1`. Oba dogodka `select` neposredno nastavita svojo vrednost in `page=1`, brez efektov za ponastavljanje. Menjava projekta se opre na obstoječi ključ, osvežitev na ponovno ustvarjanje aplikacije. URL in trajna shramba ne dobita novih podatkov (R01, R04, R05, R07, R08).
2. **En izračun prikazanega odseka**: iz `tasks` dobimo stabilni `filteredTasks`, nato `pageCount`, indekse in `visibleTasks` s `slice`. Formule so določene v specifikaciji; prazno polje se obravnava izrecno, brez deljenja z nič. Podatki se ne mutirajo, ne razvrščajo in ne kopirajo v vzporedno stanje (R02, R05, R09, R10, R12).
3. **Skupni vir za oba pogleda**: preglednica preslika `visibleTasks`, tabla dobi `tasks={visibleTasks}`. Obstoječa logika stolpcev ostane veljavna. Povzetek `counts`, skupni `count-badge` in zaključni števec še naprej temeljijo na celotnem `tasks` (R06, R11).
4. **Kontrole zunaj povezav opravil**: pod obstoječim naslovom razdelka dodamo označena izbirnika, status in štiri gumbe z `type="button"` in dejanskim `disabled`. Gumbi uporabljajo izračunane robove; dovoljeni cilji so 1, p−1, p+1 in Y. Status izpiše natančno besedilo s pomišljajem `–` (R03, R09, R10).
5. **Praznina in nalaganje**: kontrole prikazujemo v že obstoječem bloku uspešno naloženih `tasks`, tudi za `[]`. Prazen projekt ohrani obstoječe sporočilo; prazen filter lahko prikaže ustrezno slovensko sporočilo brez trditve, da projekt nima opravil. Tabla ohrani tri prazne stolpce. Napake in ponovni poskusi ostanejo obstoječi (R10, R12).
6. **Videz**: novi izbirniki in gumbi uporabijo sistemsko pisavo, obstoječe barvne spremenljivke, robove in zaobljenost. Kontrole se prelamljajo z `flex-wrap`; pri 390 pikah ostanejo znotraj vsebine. Ohranimo viden `:focus-visible` in notranje drsenje preglednice/table. Brez spreminjanja potrjene navigacije, kartic ali osnovne postavitve (R12).

## Datoteke in zaporedje izvedbe

| Datoteka | Predvidena sprememba | Zahteve |
| --- | --- | --- |
| `src/App.tsx` | Tipizirano lokalno stanje, filter in odsek, kontrole/status, vir podatkov za oba pogleda, razlikovanje praznega filtra | R01–R12 |
| `src/styles.css` | Omejeni slogi za nove kontrole, prelamljanje in uskladitev s Folio | R12, pogodba vmesnika |
| `src/TaskBoard.tsx` | Predvidoma brez sprememb; preverimo obstoječe združevanje in štetje podanega odseka | R06, R11 |
| `tests/agent/P05.spec.ts` | Namenski vedenjski testi z različnimi podatki in mobilno širino | R01–R12 |
| `docs/agent/P05/spec.md` | Dopolnitev sledljivosti z dejanskimi deli kode, testi, izidi in zgodovino | Vse zahteve |
| `docs/agent/P05/validation.md` in dnevniki v isti mapi | Jedrnat zapis zagonov, rezultatov in omejitev, povezan iz specifikacije | Dokazi |

Najprej se izvede stanje in izračun odseka, nato poveže oba pogleda in kontrole ter doda sloge. Sledijo namenski testi, preverjanje celotne rešitve in posodobitev dokazov. Ločen podatkovni sloj, nove knjižnice ali preureditev komponent za ta obseg niso potrebni.

## Preverjanje

Testi se izvajajo z obstoječim Playwright projektom `agent`, ki že vključuje `tests/agent/**/*.spec.ts`. Javni testni pripomoček `tests/development/helpers.ts` se sme uvoziti samo iz dodatnih testov: nudi nadzorovane GET odgovore in izbiro po ID-jih. Testne podatke razširimo v lastni datoteki; skupnega pripomočka ne spreminjamo.

| Skupina testov | Vsebina in povezana pravila |
| --- | --- |
| P01: odseki in robovi | S01–S04, S09: 13 opravil z nesortiranimi ID-ji in ponovljenimi naslovi; velikosti 2/5/10/all, vsi premiki, krajša zadnja stran, natančen status, ponastavitev tudi ob še veljavni stari strani. |
| P02: filter, pogledi in števci | S05–S07, S11: prepletena stanja, vsi filtri, višja stran, enaki ID-ji obeh pogledov, štetje celotnega projekta in trenutnih stolpcev, podrobnosti po ID-ju in oba načina zaprtja. |
| P03: projekt in osvežitev | S08: menjava in vrnitev med projektoma, reload, privzete izbire, brez novih parametrov v URL-ju; pregled kode za odsotnost shrambe. |
| P04: praznine in singleton | S09–S10: prazna projekta, filter brez zadetkov, odstranitev filtra, eno opravilo, štirje onemogočeni gumbi. |
| P05: regresije in ozki zaslon | S12: lokalni premiki brez zapisovalnih zahtev ali spremembe podatkov, širina 390 pik v obeh pogledih, tipkovnica in viden fokus. Skupni testi dodatno pokrijejo nalaganje, napake, povezave in API. |

Po implementaciji izvedemo `npm run check` in shranimo dejanski izhod ter izhodno kodo. To pokrije lint, typecheck/build, skupne API in UI teste, razvojne D01–D04 na obeh velikostih ter lastni projekt agent. Po konkretni napaki ponovimo ustrezno preverjanje; ponovnega zagona ne predstavljamo kot prvi uspešen rezultat. Mobilni pogled tudi vizualno pregledamo z lokalnim posnetkom, če je na voljo v okviru preverjanja.

## Tveganja in predaja

Glavni tveganji sta pomotoma filtriran povzetek in ločeno straničenje stolpcev; oba prepreči ločitev `tasks`/`filteredTasks`/`visibleTasks` in preverjanje števcev ter ID-jev. Ponastavitev velikosti mora biti izrecna tudi, ko stara stran še obstaja. Prazen rezultat mora ločiti notranjo začetno stran od prikazane ničle. Prelom kontrol se preveri pri 390 pikah.

Bistvenih odprtih vprašanj ni. Skriti končni testi niso dostopni. Ta faza pripravi samo načrt: implementacija in navedeni zagoni še niso izvedeni. Po izvedbi bodo omejitve in rezultati zabeleženi v `validation.md`, sledljivost pa posodobljena v `spec.md`, brez podvajanja celotnih zahtev.
