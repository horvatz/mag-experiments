# P05 — Straničenje in filter stanja

## Problem in kontekst

Folio trenutno v `ProjectView` prikaže vsa opravila projekta, `TaskBoard` pa jih razvrsti v tri stolpce po stanju. Dodamo lokalni filter stanja in straničenje, skupna preglednici in tabli. Ohranimo slovenska poimenovanja, povezave, podrobnosti in potrjeni videz iz `docs/dizajn.md`. Izvirne zahteve `task/instructions.md` R01–R12 veljajo v celoti. Specifikacija je pripravljena za predajo po statičnem pregledu kode; izvedba in izvajanje testov sledita pri implementerju.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }`; vsa polja so nizi, `status` je `todo | in_progress | done`. Vhodni seznam projekta prihaja iz `GET /api/projects/:projectId/tasks`; projekti iz `GET /api/projects`, podrobnosti iz `GET /api/tasks/:taskId`. ID-ji v poteh so kodirani z `encodeURIComponent`. Izbiramo po `id`, nikoli po naslovu ali indeksu.

Velikost strani je `all | 2 | 5 | 10`, filter `all | todo | in_progress | done`. Oba izbirnika sta HTML `select` z dostopnima imenoma `Velikost strani` in `Filter strani` ter navedenimi vrednostmi možnosti. Premiki imajo imena `Prva stran`, `Prejšnja stran`, `Naslednja stran`, `Zadnja stran`. Oznake možnosti naj ostanejo slovenske; njihovo konkretno besedilo in postavitev kontrol nista predpisana.

Spremembe kontrol takoj spremenijo lokalni prikaz. Potrjevanja, shranjevanja in posebnega preklica ni. Zapiranje podrobnosti z gumbom ali Escape ohrani stanje seznama. Med nalaganjem in ob napaki ohranimo obstoječe `Loading`, `LoadError` in `Poskusi znova`; manjkajoč odgovor (`null`) ni uspešno naložen prazen projekt (`[]`). Napaka ne sme povzročiti zapisa podatkov. Neposredne povezave, povrnitev fokusa in brskalnikov korak nazaj ostanejo uporabni.

## Zahteve in pravila

Naj bo `T` seznam vseh opravil trenutnega projekta v vrstnem redu odgovora API, `f` filter, `s` velikost in `p` lokalna številka strani od 1. Definiramo:

- `F = T.filter(t => f === 'all' || t.status === f)`; filter je stabilen, brez dodatnega razvrščanja. `N = F.length`.
- `Y = N === 0 ? 0 : s === 'all' ? 1 : ceil(N / s)`.
- Za `N > 0`: `1 ≤ p ≤ Y`; `V = s === 'all' ? F : F.slice((p−1)·s, p·s)`.
- Za `N = 0`: `V = []`; prikazani `X = A = B = Y = 0`, ne glede na notranjo predstavitev prve strani.
- Za `N > 0`: `X = p`, `A = s === 'all' ? 1 : (p−1)·s+1`, `B = s === 'all' ? N : min(p·s,N)`.
- Za fiksna `T,f,s`: zaporedno združeni seznami strani so natanko `F`, vključno z vrstnim redom; množici ID-jev katerihkoli različnih strani sta disjunktni.

Prehodi stanja: sprememba velikosti `(s,f,p) → (s',f,1)`; sprememba filtra `(s,f,p) → (s,f',1)`; menjava projekta ali osvežitev dokumenta `→ (all,all,1)`. Preklop pogleda ter odpiranje/zapiranje podrobnosti ohranijo celotno trojico. Ob vrnitvi v prejšnji projekt se prav tako uporabi začetna trojica.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `s=f=all, p=1`, `V=T`. Preglednica ohrani vrstni red T; tabla le stabilno združi T po stanju. | S01: začetni prikaz in vrednosti obeh izbirnikov. |
| R02 | Velikosti 2/5/10 uporabijo zgornji izračun V; zadnja stran je lahko krajša. Noben ID se ne izgubi ali podvoji. | D01 delno; S01: prehod vseh strani pri vseh velikostih. |
| R03 | Prva nastavi 1, prejšnja p−1, naslednja p+1, zadnja Y. Prva/prejšnja sta onemogočeni pri N=0 ali p=1, naslednja/zadnja pri N=0 ali p=Y. Onemogočeno dejanje je brez učinka. | D02 delno; S01: oba roba, vmesna in edina stran. |
| R04 | Sprememba velikosti vedno vrne p=1 in ohrani f; all ima pri N>0 natanko eno stran. | D04 delno; S01: pri 13 opravilih stran 2 velikosti 2 → velikost 5 vrne stran 1, čeprav je stran 2 še veljavna; tudi prehod v all. |
| R05 | Filter se uporabi pred odsekom; sprememba vedno vrne p=1 in ohrani s ter izvorni vrstni red ujemanj. | D03 delno; S02: vsi štirje filtri iz poznejše strani. |
| R06 | ID-ji preglednice so zaporedje V; ID-ji table so ista množica brez podvojitev. Vsak stolpec vsebuje `V.filter(t => t.status === stanje)`, brez lastnega straničenja. | D03 delno; S02: stran z več stanji, oba pogleda in zaporedje znotraj stolpcev. |
| R07 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranijo s,f,p in trenutne ID-je. | S03: poznejša filtrirana stran, oba pogleda, zapiranje z gumbom in Escape. |
| R08 | Menjava projekta in osvežitev ponastavita all/all/prvo stran. Novega stanja ni v trajni shrambi ali URL-ju. | S03: projekt A → B → A ter osvežitev v obeh pogledih; pregled URL-ja in kode. |
| R09 | Neprazen status je natančno `Stran X od Y. Prikazano A–B od N.` po zgornjih formulah; N šteje filtrirana opravila. | D02 delno; S01/S02: prva, srednja, krajša zadnja in all, tudi po filtru. |
| R10 | Prazen status je natančno `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi premiki so onemogočeni. Ob odstranitvi filtra velja prva stran; če je projekt prazen, ostane prikaz 0 od 0. | S04: prazen projekt in prazen rezultat filtra v obeh pogledih, nato filter all. |
| R11 | Pregled stanj za stanje k kaže `count(T,k)`, skupno število `T.length`; tudi obstoječi števec končanih ostane vezan na T. Stolpec table šteje `count(V,k)`. | S02: primerjava vseh števcev pred in po filtru/premiku, tudi ko je V prazen. |
| R12 | Straničenje/filter ne mutirata T in ne sprožita zapisovalnih zahtev API. Obstoječe povezave, ID-ji, podrobnosti, nalaganje in videz ostanejo uporabni. | D04 delno; S05: omrežje, regresijski testi, tipkovnica, namizni prikaz in širina 390 pik. |

Status ima `role="status"` in `aria-label="Stanje straničenja"`; med indeksoma je znak `–` (U+2013). Kontrole in status so uporabni v obeh pogledih, tudi po uspešnem praznem odgovoru. Ohraniti `data-task-id` vrstic/kartic, imena `Preglednica`, `Tabla`, `Tabla opravil`, stolpce `Pripravljeno`, `V delu`, `Končano` ter `aria-label="Pregled stanj opravil"`. Tabla ohrani vse tri stolpce tudi pri praznem odseku. Nova dejanja ob opravilu morajo biti zunaj njegove povezave.

Pri širini 390 pik velja `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; notranje vodoravno drsenje preglednice in table je dovoljeno. Kontrole se prilagodijo prostoru, fokus ostane viden. Uporabimo obstoječe gradnike, barve in slogovne spremenljivke Folio, ohranimo navigacijo nad vsebino do širine 760 pik.

## Izvedba in sledljivost

Priporočena izvedba: lokalno stanje v `ProjectView` (`src/App.tsx:10`), en izračun F/V za oba pogleda, `TaskBoard tasks={V}` in vrstice iz V. `counts`, značka vseh opravil in števec končanih ostanejo iz T. Obstoječi `key={project.id}` v `App` že omogoča ponastavitev ob menjavi projekta; ne vezati ključa na pogled ali taskId. `TaskBoard` že stabilno filtrira prejete podatke po stanju in iz njih izračuna števce, zato samostojno straničenje stolpcev ni potrebno.

Spodaj so lokacije pregledanega izhodišča in načrtovani scenariji, ne dokaz izvedene spremembe. D01–D04 so obstoječi testi v `tests/development/P05.spec.ts`; oznake S01–S05 so predlog lastnih testov/scenarijev implementerja v `tests/agent/`:

- S01: podatki z 0, 1 in 13 opravili, drugačnimi enkratnimi ID-ji, mešanimi stanji in vrstnim redom; preveriti razdelitev, vse premike, ponastavitev velikosti in natančne statuse.
- S02: filter all/todo/in_progress/done, filtriran rezultat z več stranmi, stabilen vrstni red, tabla za mešano stran, skupni in lokalni števci. Pri primerjavi obeh pogledov primerjati množice ID-jev; vrstni red preveriti posebej v preglednici in znotraj stolpca.
- S03: ohranitev s/f/p pri pogledih in podrobnostih ter ponastavitve ob projektih/osvežitvi; enaki naslovi morajo odpreti pravilen ID.
- S04: oba projekta prazna ter neprazen projekt s praznim filtrom; onemogočeni štirje gumbi, natančen ničelni status, povratek na all.
- S05: spremljati zapisovalne zahteve med uporabniškimi dejanji (pričakovano nič), preveriti obstoječe regresije, Unicode/ločila kot navadno besedilo, fokus in prilagodljivost pri 390 pikah.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno V=T. | S01 | `src/App.tsx`, ProjectView, začetno stanje. | Ni izvedeno; statično pregledano izhodišče. |
| R02 | Zaporedni odseki F. | D01, S01 | `src/App.tsx`, izračun V in tbody. | Ni izvedeno. |
| R03 | Premiki in robovi. | D02, S01 | `src/App.tsx`, nove navigacijske kontrole. | Ni izvedeno. |
| R04 | Sprememba s ponastavi p. | D04, S01 | `src/App.tsx`, obravnava izbirnika velikosti. | Ni izvedeno. |
| R05 | Filter pred odsekom. | D03, S02 | `src/App.tsx`, izračun F in obravnava filtra. | Ni izvedeno. |
| R06 | Oba pogleda dobita V. | D03, S02 | `src/App.tsx:42`, izbira pogleda; `src/TaskBoard.tsx:13`, filtriranje stolpcev. | Ni izvedeno. |
| R07 | Ohranitev s/f/p. | S03 | `src/App.tsx`, življenjska doba ProjectView; `src/TaskDetails.tsx`, close/onCancel; `src/navigation.ts`. | Ni izvedeno. |
| R08 | Ponastavitve brez hrambe. | S03 | `src/App.tsx:86`, ključ projekta in začetno stanje; `src/navigation.ts`, obstoječe poti. | Ni izvedeno. |
| R09 | Pravilen X/Y/A/B/N. | D02, S01, S02 | `src/App.tsx`, nov status straničenja. | Ni izvedeno. |
| R10 | Ničelni status in robovi. | S04 | `src/App.tsx`, prazen F in kontrole; `src/TaskBoard.tsx`, prazni stolpci. | Ni izvedeno. |
| R11 | Števci iz T oziroma V. | S02 | `src/App.tsx`, counts, count-badge, table-footer; `src/TaskBoard.tsx`, entries.length. | Ni izvedeno. |
| R12 | Brez zapisov, uporabne regresije. | D04, S05; `tests/baseline.spec.ts`, `tests/api.spec.ts` | `src/api.ts`, `src/useResource.ts`, povezave v obeh pogledih, `src/TaskDetails.tsx`, `src/styles.css`. | Ni izvedeno; opravljen samo statični pregled. |

Implementer naj izvede ustrezna lastna preverjanja in skupni `npm run check` (lint, build/typecheck, Playwright, vključno z razvojnimi testi za namizni in mobilni prikaz). V svojih izvedbenih zapiskih v `docs/agent/` naj za R01–R12 navede dejanska imena testov, rezultate in poti do dnevnikov/dokazov ter končne lokacije kode. Specifikacijo in njeno zgodovino spreminja njen prvotni avtor. Testne pomožne funkcije smejo uporabljati testi; uporabniški vmesnik jih ne sme uvažati.

## Odprta vprašanja in omejitve

Ni odprtih vprašanj, ki bi preprečevala implementacijo. Ne predpostavljamo števila opravil, konkretnih ID-jev, edinstvenih naslovov ali vrstnega reda iz začetnih podatkov. Oba projekta sta lahko prazna; vsako opravilo pripada svojemu projektu. Naslovi, opisi in imena so navadno besedilo z Unicode znaki in ločili; datumi so veljavni koledarski datumi.

Prepoved URL-ja/trajne hrambe velja za novo stanje straničenja in filtra; obstoječa hash pot projekta, opravila in `?view=board` ostane veljavna. Osvežitev pomeni ponovno nalaganje dokumenta. Ne širimo obravnave novih sočasnih sprememb ali navigacije med nedokončanim nalaganjem prek obstoječih regresij. Ne dodajamo urejanja, izvoza, novih zapisovalnih API-jev ali drugih funkcij.

Aplikacija uporablja samo javni `/api/`, ne `/__test/`, lokalne kopije strežnika ali `localStorage`. Obstoječi `updateTask` v `src/api.ts` za to nalogo ni potreben. Strežnik, skupni tipi, odvisnosti, infrastruktura, skupni testi in navodila ostanejo nespremenjeni. D01–D04 so le delno pokritje in niso nadomestilo za splošna pravila. V tej fazi niso bili zagnani aplikacija, testi ali pregled videza; to je naloga implementerja. Nedostopni končni testi niso preverjeni.
