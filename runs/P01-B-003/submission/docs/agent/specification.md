# P01 – Urejanje opravila

Različica 1.0, pripravljeno za predajo 2026-09-20. Podlaga: `task/instructions.md` v0.2, `PROJECT_RULES.md`, `task/specification-template.md` in `docs/dizajn.md`. Izvirne zahteve ostajajo obvezne. Dokument temelji na branju kode; aplikacija in testi v tej fazi niso bili zagnani. Zgodovina: [specification-history.md](specification-history.md).

## Problem in kontekst

Uporabnik v podrobnostih obstoječega opravila izbere »Uredi« ter spremeni samo naslov in stanje. Ohranijo se slovenska poimenovanja, obstoječi gradniki in videz Folio. Podatki se berejo in shranjujejo prek javnega `/api/`, opravila se izbirajo po `id`.

Izhodišče že prikazuje projekte, preglednico, tablo, števce in stranski dialog podrobnosti; obrazca še ni. Dopolni obstoječi dialog z načinom urejanja. »Shrani« in »Prekliči« zaključita urejanje, podrobnosti ostanejo prikazane. Ohranijo se postavitev, barve, razmiki, odzivnost in viden fokus iz `src/styles.css` ter `docs/dizajn.md`; uporabijo se obstoječi gradniki, npr. `StatusBadge`, `Loading` in slog `.button`.

## Vhodi, dejanja in izidi

Vhod sta shranjeni naslov in stanje trenutno izbranega opravila. Obrazec ima polje »Naslov«, HTML `select` »Stanje« in gumba »Shrani« ter »Prekliči«. Dovoljena stanja so Pripravljeno (`todo`), V delu (`in_progress`) in Končano (`done`). Osnutek je ločen od shranjenih podatkov. Uspeh shrani obe polji skupaj in zapre obrazec; preklic zavrže osnutek brez zahteve; zavrnitev ohrani osnutek in omogoči ponovitev.

Potrjeno z branjem kode:

- `shared/types.ts`: `Task` vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`; `TaskUpdate` vsebuje samo `title: string` in `status: TaskStatus`. Druga polja se ne urejajo.
- `src/api.ts`: uporabi `updateTask(id, { title, status })`; pošlje en JSON `PATCH /api/tasks/{encodeURIComponent(id)}` in vrne celoten shranjeni `Task`. Neuspešen odgovor sproži izjemo s sporočilom strežnika oziroma nadomestnim sporočilom.
- Branje: `GET /api/projects`, `GET /api/projects/{id}/tasks`, `GET /api/tasks/{id}`. `server/store.ts` validira in atomarno zapiše obe polji; ob zavrnitvi ne zapiše ničesar. Osvežitev brskalnika podatkov ne ponastavi; ponovni zagon strežnika jih ponastavi in ni del zahtevane trajnosti.
- `TaskDetails` in `App.tsx`/`ProjectView` uporabljata ločena klica `useResource`; zgolj zapis na strežnik ne osveži njunega lokalnega stanja. Po uspehu je treba uskladiti oba vira s potrjenim odgovorom ali ponovnim branjem. `useResource.ts` trenutno vrača `data`, `error`, `loading`, `retry`, nima javnega setterja. `TaskBoard` in števci izhajajo iz seznama `tasks`.

## Zahteve in pravila

Naj bo S preslikava vseh shranjenih opravil po id, i izbrani id, D začasni par `(title, status)` in P število odprtih zahtev za shranjevanje. N(x) odstrani samo robne U+0020, U+0009, U+000A, U+000D; notranji in drugi znaki ostanejo. Ustrezen izraz je `x.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')`; `trim()` in splošni `\s` odstranita preveč znakov. Veljavnost: `N(D.title) !== ''` in `D.status ∈ {todo, in_progress, done}`.

Prehodi: podrobnosti → urejanje inicializira D in počisti napake; neveljavno shranjevanje ostane v urejanju brez PATCH; veljavno shranjevanje → čakanje (`P = 1`); uspeh → podrobnosti s potrjenimi podatki; zavrnitev → urejanje z ohranjenim D; preklic → podrobnosti brez spremembe S. Vedno `P ≤ 1`. Pred uspehom velja `S' = S`; ob uspehu se pri `S[i]` spremenita samo `title = N(D.title)` in `status = D.status`, za vsak `j ≠ i` pa `S'[j] = S[j]`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | »Uredi« inicializira D z zadnjim shranjenim naslovom in stanjem izbranega id. Enak naslov ne pomeni istega opravila. | S01: odpri opravili z enakim naslovom in različnima id/stanjema, primerjaj obrazec z API. |
| R02 | Spremembe D in čakanje na odgovor ne spreminjajo S, preglednice, table ali števcev. Brez optimistične posodobitve teh prikazov. | S02: spremeni obe polji, primerjaj podatke in prikaze pred oddajo ter med zadržanim odgovorom; ponovi iz obeh pogledov. |
| R03 | Pred validacijo in pošiljanjem uporabi N. Prazen rezultat prepreči PATCH; napaka ob polju se umakne takoj ob veljavnem popravku. Ohranijo se notranji in vsi nepredpisani beli znaki. | S03: prazen niz in kombinacija štirih belih znakov nimata zahtev; preveri normalizacijo payload-a, dvojni notranji presledek ter U+00A0 na robovih in samostojno. |
| R04 | Izbirnik ponuja točno tri poimenovana stanja; dovoljen vsak prehod med njimi. | S04: preveri vse možnosti in vseh šest usmerjenih prehodov med različnimi stanji; sprememba samo naslova lahko ohrani stanje. |
| R05 | En uspešen PATCH posodobi obe polji izbranega id. Obrazec se zapre, podrobnosti in preglednica pokažejo odgovor; kartica je v pravilnem stolpcu, vsi števci so usklajeni. Po osvežitvi velja isto. | S05: shrani obe spremembi; preveri API, podrobnosti, preglednico, tablo, števce in osvežitev. Za stanje k velja števec `count(k) = število opravil projekta s statusom k`. |
| R06 | »Prekliči« zapre obrazec, zavrže D in vse napake brez PATCH. Ponovno odprtje uporabi S[i]. | S06: prekliči spremenjen obrazec, obrazec z validacijsko napako in obrazec po zavrnitvi; ponovno odpri ter preveri vrednosti in odsotnost napak. |
| R07 | Nespremenjeni ostanejo vsi drugi id in `id`, `projectId`, `description`, `assignee`, `dueDate` urejanega opravila. | S07: primerjaj vse zapise pred/po; zajemi istoimensko opravilo v istem in drugem projektu. |
| R08 | Zavrnitev ohrani S in uporabnikov D; obrazec ostane odprt z razumljivim sporočilom neuspeha. Ponovna oddaja je mogoča, uspeh odstrani sporočilo in izpolni R05. | S08: zavrni poskus z obema spremembama, preveri vnos in podatke, nato uspešno ponovi ter preveri prikaze. |
| R09 | Med zahtevo je viden `role="status"`; polji ter »Shrani« in »Prekliči« imajo dejansko onemogočeno interakcijo. Hitri pritiski ne ustvarijo sočasnih zahtev. Po zavrnitvi so vsi štirje kontrolniki omogočeni. | S09: zadrži odgovor, večkrat hitro sproži shranjevanje, preveri točno eno zahtevo, stanje in disabled; sprosti z zavrnitvijo ter ponovno urejaj in shrani. |
| R10 | Po koncu urejanja delujejo izbor projekta, preklop preglednica/tabla in odpiranje podrobnosti. Novo opravilo nikoli ne podeduje D ali napak prejšnjega. | S10: po uspehu ter po preklicu (tudi po napaki) menjaj projekt/pogled in odpri drugo opravilo; ponovi urejanje prvega. |

Napaka vnosa je povezana s poljem prek `aria-describedby`, neveljavno polje ima `aria-invalid="true"`; sporočila napak imajo `role="alert"`. Ohranijo se `data-task-id`, poimenovani stolpci table in `aria-label="Pregled stanj opravil"`.

Primeri ne omejujejo pravil na začetne podatke: `web-01`, `web-02` in `launch-01` imajo isti naslov in so uporabni za preverjanje identitete. Primer normalizacije: `" \tŽanov  pregled\r\n"` → `"Žanov  pregled"`; `"\u00A0"` ostane neprazen veljaven naslov. Besedila napak so prosta, vendar morajo jasno pojasniti razlog.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Inicializacija po id | D01 + S01 | `src/TaskDetails.tsx`: nalaganje in vstop v urejanje | Ni izvedeno. |
| R02 | Ločen D, nespremenjeni prikazi | D03 delno + S02 | `src/TaskDetails.tsx`: osnutek; `src/App.tsx`: seznam | Ni izvedeno. |
| R03 | N in povezana napaka | D04 delno + S03 | `src/TaskDetails.tsx`: validacija in priprava payload-a | Ni izvedeno. |
| R04 | Tri stanja in vsi prehodi | S04 | `src/TaskDetails.tsx`: select; tip `TaskStatus` v `shared/types.ts` (samo branje) | Ni izvedeno. |
| R05 | Uskladitev in trajnost | D02 delno + S05 | `src/api.ts`: `updateTask`; `src/TaskDetails.tsx`, `src/App.tsx`, po potrebi `src/useResource.ts`: potrjeni podatki; `src/TaskBoard.tsx`: izpeljan prikaz | Ni izvedeno. |
| R06 | Preklic brez zapisa in ostankov | D03 + S06 | `src/TaskDetails.tsx`: preklic in ponovna inicializacija | Ni izvedeno. |
| R07 | Nespremenjena druga polja/zapisi | S07; podporni API-test »a successful update changes only the chosen record and fields« | `src/api.ts`: `TaskUpdate`; `src/App.tsx`: zamenjava samo po id | Ni izvedeno. |
| R08 | Zavrnitev in ponovitev | S08 | `src/TaskDetails.tsx`: obdelava izjeme, sporočilo in ohranitev D | Ni izvedeno. |
| R09 | Čakanje in ena zahteva | S09 | `src/TaskDetails.tsx`: zaščita oddaje, disabled in status | Ni izvedeno. |
| R10 | Navigacija in izolacija obrazcev | S10 + skupni testi navigacije | `src/App.tsx`: ključi projekta/opravila; `src/TaskDetails.tsx`: reset; `src/navigation.ts`: obstoječe poti | Ni izvedeno. |

D01–D04 so obstoječi testi v `tests/development/P01.spec.ts`; S01–S10 so zgoraj opredeljeni načrtovani scenariji, ne že napisani testi. Navedena mesta kode so izvedbene smernice po pregledu izhodišča, ne trditev o opravljenih spremembah. Implementer v svojih zapiskih poveže dejanske spremembe in imena dodatnih testov s temi ID-ji ter zabeleži ukaze, rezultate in dokazila. Specifikacijo ob popravkih posodobi njen avtor.

Predaja preverjanja: implementer naj izvede zahtevane skupne preglede (`npm run check`, ki vključuje lint, build in Playwright), preveri vključitev razvojnih testov ter dopolni manjkajoče scenarije v `tests/agent/`. Sam uspeh D01–D04 ne dokazuje vseh R01–R10. Za zavrnitev/zadržanje in štetje zahtev lahko samo testni program uporablja obstoječe `/__test/next-save`, `/__test/release`, `/__test/state` ter `/__test/reset`. Implementer preveri tudi ohranjen videz na širokem in ozkem zaslonu.

## Odprta vprašanja in omejitve

Ni odprtih vprašanj, ki bi preprečevala implementacijo. Med urejanjem ni sočasnih sprememb drugih uporabnikov; shranjevanje je uspešno ali zavrnjeno brez zapisa. Escape, klik izven obrazca, navigacija med odprtim urejanjem, opozorilo ob zapustitvi in prijava niso predmet naloge; za zaključek urejanja sta zahtevana samo »Shrani« in »Prekliči«. Obstoječe delovanje podrobnosti izven urejanja ostane ohranjeno.

Infrastruktura, odvisnosti, skupni tipi, začetni podatki, podatkovna storitev, skupni testi in navodila so samo berljivi. UI ne uporablja `/__test/`, lokalne kopije strežnika ali `localStorage` kot podatkovne storitve. Dovoljeni so samo izvožena aplikacija in lokalne storitve naloge. Avtor specifikacije piše samo ta dokument in njegovo zgodovino; implementer piše `src/`, `tests/agent/` in svoje zapiske, reviewer svoje poročilo. Brez novih agentov. Vsi izvedbeni, testni in vizualni scenariji so v tej fazi nepreverjeni; odstopanj od zahtev specifikacija ne uvaja.
