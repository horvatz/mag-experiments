# Specifikacija: P09 – stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio omogoča pregled opravil izbranega projekta v preglednici ali tabli. Stanje pregleda trenutno ni zajeto v URL, zato ni mogoče deliti ali obnoviti filtrov, kontrola pa takoj ne sme vplivati na prikaz. Rešitev doda potrditveni model treh filtrov (`q`, `status`, `order`) v query del obstoječega hash fragmenta, ohrani način pogleda, podrobnosti in obstoječe Folio obnašanje.

## Vhodi, dejanja in izidi

- Podatki: projekti in opravila se berejo izključno prek `/api/`; polja so enaka izhodiščnim tipom.
- Vhod URL: `q` (ena fraza), `status` (`all|todo|in_progress|done`) in `order` (`original|title-asc|title-desc`) na poti projekta ali opravila; `view=board` ostaja obstoječi parameter.
- Dejanja: urejanje osnutka, `Uporabi pogled`, `Ponastavi pogled`, preklop `Preglednica/Tabla`, odpiranje in zapiranje podrobnosti ter projektna in brskalniška navigacija.
- Uspeh: potrjeno stanje določa prikaz, kontrole in URL; sprememba stanja ustvari eno zgodovinsko stanje; nepotrjen osnutek se ob vsaki navigaciji zavrže.
- Preklic/napaka: neveljavne ali neznane vrednosti filtrov padajo na privzeto (`q=''`, `status='all'`, `order='original'`) brez prepisovanja vhodnega URL; obstoječa obvestila o nalaganju in napakah ostanejo.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za veljavno pot projekta ali opravila velja `viewState(route) = parse(q,status,order)` z privzetkami `('', 'all', 'original')`; neposreden URL takoj določi prikaz in osnutek. | Preskusi direktnega odprtja in privzete vrednosti. |
| R02 | Iskalni izraz `q` se najprej obreže, normalizira v NFD, odstranita se kombinirajoči znaki U+0300–U+036F in zmanša; primerja se kot podniz vsaj enega polja `title`, `description`, `assignee` ali `id`. | Preskus diakritike, besedne zveze, ID-ja ter prepoved deljenja na besede. |
| R03 | `status` filtrira po enakosti; `q ∧ status` delujeta po IN. `order=original` ohrani zaporedje API; naslovní razvrščanje uporabi isto normalizacijo in UTF-16 primerjavo, ob izenačenju pa izvorno zaporedje. | Preskus kombiniranega filtra, naraščanja, padanja in izenačenih naslovov. |
| R04 | Prvi vrednost parametra je relevantna; neznana vrednost `status`/`order` ali neznan parameter ne vpliva na stanje in ne povzroči prepisa URL. | Preskus podvojenih, neznanih in neuveljavljenih parametrov. |
| R05 | Spremembe kontrol spremenijo samo osnutek. Potrditev primerja normalizirani osnutek s potrjenim stanjem; ob spremembi ustvari en hash-navigacijo in novo zgodovinsko stanje. | Preskus osnutka, prikaza, URL in dolžine zgodovine. |
| R06 | Potrjena fraza se obreže; privzeti `q/status/order` se izpustijo; `view=board` se ohrani; neznani parametri se odstranijo; enaka potrditev ne doda zgodovine. | Preskus URL po potrditvi, izpusta privzetkov, ohranitve table in ponovitve. |
| R07 | `hashchange` in osvežitev znova razčlenita URL in osnutek postavita na potrjeno stanje; nazaj/naprej obnovita prikaz. | Preskus brskalniške zgodovine in osvežitve. |
| R08 | Preklop pogleda ohrani potrjene tri parametre in ID-je; vsaka navigacija zavre nepotrjen osnutek. | Preskus preklopa pred in po urejanju osnutka. |
| R09 | Povezave opravil vsebujejo `view` in tri parametre; zapiranje ali Escape se vrne na isti projekt, pogled in parametre; ID se uporabi kot ključ, ne naslov. | Preskus podrobnosti z izenačenimi naslovi, gumb in Escape. |
| R10 | Povezava na drug projekt uporablje privzet pogled, a ohrani `table/board`; direktna povezava na drug projekt z parametri jih upošteva. | Preskus preklopa projekta in direktnega URL. |
| R11 | Reset postavi tri privzetke in osnutek, ohrani pogled ter deluje po enakem zgodovinskem pravilu. Prazen filtriran rezultat pokaže `Ni zadetkov.`; status ima `Prikazano: N od M.`. | Preskus reseta, praznega rezultata, števca in širine 390 px. |
| R12 | Nobeno dejanje ne pošilja zapisovalnih zahtev, ne uporablja `/__test/` ali `localStorage`; ohrani se obstoječa neznana pot, nalaganje, podrobnosti, imena pogledov in Folio videz. | Preskus odsotnosti zapisov in lokalne shrambe ter skupne regresijske teste. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | URL takoj razčleni `q`, `status` in `order` ter nastavi prikaz in osnutek. | `A01`, skupni testi direktnih povezav | `src/navigation.ts` (`useRoute`), `src/App.tsx` (`ProjectView`) | `docs/agent/verification.md` |
| R02 | Fraza se obreže, NFD-normalizira, očisti U+0300–U+036F, zmanjša in primerja kot podniz posameznega polja. | `A01`, `A02` | `src/navigation.ts` (`normalizeSearchText`), `src/App.tsx` (`visibleTasks`) | `docs/agent/verification.md` |
| R03 | `status` in `q` delujeta po IN; razvrščanje primerja normalizirana naslova po UTF-16, izenačeni naslovi ohranijo zaporedje. | `A01` | `src/App.tsx` (`visibleTasks`) | `docs/agent/verification.md` |
| R04 | Neznane vrednosti in parametri padajo na privzeto, brez prepisa URL. | `A01` | `src/navigation.ts` (`parseFilters`) | `docs/agent/verification.md` |
| R05 | Kontrole spreminjajo samo osnutek; potrditev spremembe ustvari eno zgodovinsko stanje. | `A02` | `src/App.tsx` (`draft`, `commit`) | `docs/agent/verification.md` |
| R06 | Potrditev obreže `q`, izpusti privzete parametre, ohrani `view=board`, odstrani neznane parametre in ne ponovi istega zgodovinskega vnosa. | `A02`, `A03` | `src/navigation.ts` (`queryString`), `src/App.tsx` (`commit`) | `docs/agent/verification.md` |
| R07 | Nazaj/naprej/osvežitev znova uporabita URL in osnutek postavita na potrjeno stanje. | `A02`, skupni test `D03` | `src/navigation.ts` (`useRoute`), `src/App.tsx` (`useEffect`) | `docs/agent/verification.md` |
| R08 | Preklop pogleda ohrani potrjene parametre in ID-je ter zavre nepotrjen osnutek. | `A03` | `src/App.tsx` (`view-switch`), `src/TaskBoard.tsx` | `docs/agent/verification.md` |
| R09 | Povezave opravil vsebujejo ID, pogled in filtrirne parametre; zapiranje ohrani enak projekt, pogled in filtre. | `A03`, skupni test izenačenih naslovov | `src/navigation.ts` (`taskUrl`), `src/TaskDetails.tsx` (`close`) | `docs/agent/verification.md` |
| R10 | Projektna navigacija začne privzet pregled in ohrani način; direktni URL drugega projekta upošteva parametre. | `A04` | `src/App.tsx` (projektna navigacija) | `docs/agent/verification.md` |
| R11 | Reset počisti tri filtre in osnutek, ohrani pogled, pokaže prazno stanje in števec `Prikazano: N od M.`. | `A04` | `src/App.tsx` (`commit`, `view-results`) | `docs/agent/verification.md` |
| R12 | Vmesnik bere samo `/api/`, ne uporablja testnih kontrol ali `localStorage`, in ohrani obstoječe regressionsko obnašanje. | Vsi izvedeni testi | `src/useResource.ts`, `src/App.tsx`, `src/TaskDetails.tsx` | `docs/agent/verification.md` |

## Zgodovina popravkov

- 2026-11-02, verzija 1.0: izvedba URL-stanja, potrditvenega osnutka, filtriranja, razvrščanja, navigacijske ohranitve in lastnih testov.
- 2026-11-02, verzija 1.0.1: odpravljena opozorila ESLint z odvisnostjo `filters` v efektu za osnutek; vedenje ostaja enako.

## Odprta vprašanja in omejitve

- Ni dodatnih odprtih vprašanj; predpostavka je, da se za neveljavno/neznano pot ne prikažejo kontrole projekta, ker projekt ni izbran.
- Končni scenariji so omejeni na javne API podatke in lokalnega Chromeriuma; strežnik, odvisnosti in skupni testi se ne spreminjajo.
