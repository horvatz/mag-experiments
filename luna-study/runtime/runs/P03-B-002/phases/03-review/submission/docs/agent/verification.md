# Implementer: spremembe in preverjanja

## Začetni zapis

Čas začetka: 2026-09-27; fazni rok 12:23:20.328 UTC. Začetna specifikacija `docs/agent/specification.md` pokriva R01–R12. Pred začetkom implementacije še niso izvedena preverjanja.

### Načrtovana preverjanja (še niso izvedena)

- Pregled obstoječega UI/API in razvojnih testov, da se določijo ustrezne točke integracije.
- Izvedba `npm run check` (lint, tipi, gradnja, dosegljivi testi), če čas dopušča.
- Izvedba razvojnih testov P03 prek Playwright projektov development-desktop in development-mobile.
- Po potrebi ročni pregled filtrov, obeh pogledov in širine 390 px z aplikacijo na portih 5193/3123.

Rezultate, povezave na zahteve in omejitve bom dopolnjeval po izvedbi.

## Spremembe in sledljivost

- `src/App.tsx`: v `ProjectView` sem dodal lokalno stanje iskanja, stanja in osebe. Iskalni niz se deli po belinah; vsaka beseda se primerja kot dobesedni podniz normaliziranega `id`, `title`, `description` in `assignee`. Filtri so vezani na vsa opravila aktivnega projekta; možnosti oseb izhajajo iz celotnega seznama. Tabela, tabla, pregled stanj, oznaka števila in noga uporabljajo ustrezen filtriran seznam. Dodana sta števec `Prikazano: N od M.` in sporočilo `Ni zadetkov.`. Gumb počisti tri filtre skupaj.
- `src/styles.css`: dodani so slogi kontrolnikov in razporeditev v dve koloni pri ozkem zaslonu; obstoječa tabela in tabla še naprej drsita znotraj svojega prikaza.
- `tests/agent/P03-implementation.spec.ts`: dodani so testi za vrstni red iskalnih besed, Unicode in dobesedna ločila, celoten seznam oseb, ponastavitev ob menjavi projekta, obstoj filtrov ob menjavi pogleda, gumb za čiščenje, osvežitev strani ter prazen projekt.

`ProjectView` že prejme `key={project.id}` v `src/App.tsx`, zato menjava projekta ustvari novo lokalno stanje filtrov. Pogled se še vedno menja prek obstoječe hash navigacije. Podatki se berejo prek obstoječega `/api/projects/:id/tasks`; koda filtriranja ne zapisuje podatkov in ne uporablja testnih kontrol.

| Zahteva | Povezava na pogoj in izvedbo | Dejanski dokaz |
| --- | --- | --- |
| R01 | Privzeto `search=""`, `status="all"`, `assignee="all"`; stabilni `tasks.filter` v `src/App.tsx:19–32`. | `D01: default list and literal normalized search`; vsi razvojni testi namizje/mobilno uspešni. |
| R02 | `normalizeSearch` v `src/App.tsx:13–15` uporablja NFD, odstrani U+0300–U+036F in male črke. | D01; lastni test `Unicode whole-word-set search uses literal text and counts matching records` preveri `KOVAC` proti `Kovač`. |
| R03 | Besede v `src/App.tsx:25–28` se razdelijo po belinah in preverijo z `includes`, brez regex iskanja. | D01 in lastni test z besedami iz različnih polj, spremenjenim vrstnim redom ter dobesednim `+`/`[kvadrat]`. |
| R04 | Status in oseba sta dodatna pogoja `&&` v `src/App.tsx:29–30`; ime osebe se primerja natančno. | `D02: combined filters and view persistence` ter `D04: counts and read-only behavior` (namizje in mobilno). |
| R05 | `people` v `src/App.tsx:22` je množica nepraznih imen iz vseh `tasks`, ne iz zadetkov. | Lastni test preveri vse možnosti tudi ob izbranem filtru `done` in nato preklop projekta. |
| R06 | Tabela uporablja `filteredTasks` v `src/App.tsx:89`; `TaskBoard` prejme isti seznam v `src/App.tsx:85`. | D02 in lastni test preklopita tabla/preglednica ter preverita filtrirane ID-je in ohranjen filter. |
| R07 | Filtri so lokalni za `ProjectView`, ki je ključan po `project.id` (`src/App.tsx:129`). | Lastni test preklopi iz `web` v `launch`, preveri privzete kontrole in ID-je drugega projekta. |
| R08 | Filtri niso v hash poti ali trajni shrambi; lokalna stanja v `src/App.tsx:19–21`. | Lastni test naloži stran znova z izbranimi tremi filtri ter preveri privzete kontrole in vse rezultate. |
| R09 | Statusni števec je v `src/App.tsx:82`; counts/pregled in števec sekcije izhajajo iz `filteredTasks` (`src/App.tsx:33–37, 45–48, 57, 98`). | D04 preveri `Prikazano: 4 od 8.` in vedenje brez zapisov; lastni test preveri `1 od 2`. |
| R10 | Pogoj `filteredTasks.length === 0 && tasks.length > 0` prikaže sporočilo, tabela ali tabla pa ostane izrisana (`src/App.tsx:84–85`). Prazni projekt ohrani obstoječe stanje. | D03 preveri nič zadetkov; lastni testi preverijo števec `0 od 0` in navadno stanje praznega projekta. |
| R11 | En gumb nastavi iskanje, status in osebo na privzete vrednosti (`src/App.tsx:81`). | D03 preveri vrnjene ID-je; lastni test preveri vrednosti treh kontrol in vseh ID-jev po čiščenju. |
| R12 | Navigacija, podrobnosti in gradniki Folio ostanejo obstoječi; spremembe stilov so v `src/styles.css:61–68` in mobilnem bloku. Filtriranje ne kliče zapisovalnega API-ja. | Osnovni namizni/mobilni testi za navigacijo in podrobnosti; D04 preveri brez zapisov in brez širjenja strani pri mobilnem viewportu. |

## Izvedena preverjanja

- `npm run check` — uspešno: ESLint, `tsc --noEmit`, Vite produkcijska gradnja in vseh 49 Playwright testov (14 API, 24 osnovnih namiznih/mobilnih, 8 razvojnih P03 namiznih/mobilnih in 3 lastni testi). Zadnji zagon je po končni spremembi lastnega testa; trajal je približno 18 sekund.
- `git status --short` / `git diff --check` — nista bila izvedena do konca: ukaz Git se je ustavil z `xcrun: error: invalid active developer path ... missing xcrun`. Zato repo statusa in whitespace preverjanja prek Gita nisem mogel potrditi. Urejal sem samo `src/App.tsx`, `src/styles.css`, `tests/agent/P03-implementation.spec.ts` in ta zapis; produkcijsko gradnjo je ustvaril predpisani `npm run check`.
- Ročni vizualni pregled ni bil izveden. Mobilni razvojni testi pa so preverili `document.documentElement.scrollWidth <= innerWidth` pri mobilnem viewportu, tabela/tabla pa ohranita notranje drsenje.

## Omejitve okolja in odstopanja

- Predani specifikaciji nisem našel napake glede na obvezne zahteve R01–R12.
- Testi so delovali prek nameščenega Chromiuma in lokalnega testnega strežnika; omrežni dostop do javnega interneta ni bil potreben. Skriti/končni testi, ki niso v delovnem okolju, niso bili dostopni in jih ne štejem kot opravljene.
- `npm` je opozoril na neznano konfiguracijo `http-proxy`; Node je opozoril tudi, da je `NO_COLOR` prezrt zaradi `FORCE_COLOR`. Opozorili nista preprečili preverjanj.
- Gitova orodja so bila v okolju neuporabna zaradi manjkajočega `xcrun`, kot je opisano zgoraj. To omejuje neodvisen pregled končnega diff-a, ne pa rezultatov lint/build/test.

## Predaja

Implementacija in dostopna preverjanja so zaključeni. Pregledovalec naj pregleda spremembe v navedenih datotekah ter upošteva omejitev Git orodij pri svojem pregledu.
