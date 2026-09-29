# Specifikacija P09: stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio trenutno prikaže vsa opravila iz javnega API-ja projekta v preglednici ali tabli. Pot projekta in opravila je v `location.hash`, način je neobvezen `view=board`. Uporabnik želi deljiv pregled, katerega iskalna fraza, stanje in vrstni red so potrjeni v povezavi ter se ob navigaciji Nazaj/Naprej obnovijo.

Sprememba doda osnutek treh kontrol, skupno uporabo/ponastavitev ter filtriranje in urejanje obeh prikazov. API ostane vir podatkov, dejanja pogleda pa ne spreminjajo opravil.

## Vhodi, dejanja in izidi

- Vhodi so projekti in opravila iz obstoječih GET `/api/` zahtev. Relevantna polja opravila: `id`, `projectId`, `title`, `description`, `assignee`, `status`.
- Pot projekta oziroma opravila lahko ima query del v fragmentu: `q`, `status`, `order`, `view`.
- Ob vstopu se veljavne potrjene vrednosti iz URL-ja takoj uporabijo kot stanje prikaza in osnutek kontrol. Neveljaven status ali vrstni red dobi privzeto vrednost. Prva ponovljena vrednost parametra je veljavna.
- Urejanje kontrol spremeni samo osnutek. »Uporabi pogled« obreže q, potrdi vse tri vrednosti skupaj in zamenja trenutno hash zgodovinsko stanje samo, če je potrjeni pogled drugačen. »Ponastavi pogled« potrdi privzete filtre.
- Navigacija med načinoma ali do opravila ohrani potrjene parametre; navigacija na drug projekt uporabi privzete filtre. Vsaka navigacija zavrže osnutek; neposredna povezava drugega projekta se razčleni normalno.
- Rezultat vključuje filtre in stabilno urejanje, kazalnik `Prikazano: N od M.`, prazen prikaz `Ni zadetkov.` ter povezave podrobnosti po ID-ju. Napaka nalaganja ostane obstoječi prikaz napake.

## Zahteve in pravila

Simboli: `T` je seznam opravil trenutnega projekta, `N(s)` je normalizacija `s = lowercase(remove(U+0300–U+036F, NFD(trim(s))))`, `S` in `O` sta potrjeno stanje in vrstni red, `F(T,S)` je filtriran seznam. Status `all` ne omeji statusa; ostali statusi zahtevajo enakost. q je prazen ali podniz vsaj enega od N(title, description, assignee, id). Razvrščanje po naslovu primerja normalizirana niza z operatorjema JS `<`/`>` (UTF-16); pri enakosti uporabi izvirni indeks.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Projektna in opravilska pot prebereta q/status/order iz query dela fragmenta; privzete vrednosti so `''`, `all`, `original`; ob prvem izrisu ni potrebna dodatna akcija. | Neposredno odpreti URL z filtri in preveriti kontrole ter seznam. |
| R02 | `N` je trim + NFD + odstrani U+0300–U+036F + lowercase. q je dobesedni podniz enega polja, ne tokenizacija ali regexp. | Iskanje z diakritiko, presledki, ločili in podnizom. |
| R03 | Status in q se združita z IN. Dovoljene so `all/todo/in_progress/done`, `original/title-asc/title-desc`; naslov se razvrsti po N in stabilno. | Filtri po statusu, asc/desc in enaki naslovi. |
| R04 | Prva pojavitev ponovljenega parametra velja; neznan status/order postane privzeti; drugi neznani parametri se prezrejo; razčlenitev ne spreminja URL. | Odpreti URL s podvojenimi/neznanimi parametri in preveriti hash. |
| R05 | Kontrole so osnutek `D`, prikaz ostane po potrjenem `S`; Uporabi pogleda nastavi `S := D` atomarno in opravi največ eno spremembo zgodovine. | Spremeniti vse kontrole brez uporabe, nato potrditi. |
| R06 | Serijalizacija izpusti q, če je po trim prazen, status `all` in order `original`; kodira ostale vrednosti, obdrži `view=board`, odstrani neznane parametre. Enako stanje ne doda vnosa zgodovine. | Potrditi različne in ponovljene vrednosti, pregledati URL in število navigacij. |
| R07 | `popstate`/hash navigacija ponovno nastavi potrjeni filter in osnutek iz ciljne poti; osvežitev sledi URL-ju. | Uporabiti pogled, spremeniti še osnutek, nato Nazaj/Naprej in osvežitev. |
| R08 | Preklop pogleda spremeni samo `view`, ohrani filtre in seznam ID-jev; navigacija zavrže osnutek. | Preglednica ↔ tabla ob aktivnih filtrih in osnutku. |
| R09 | URL opravila ohrani filter in način. Zapiranje z gumbom ali Escape se vrne na isti filtrirani projekt; podrobnost izbere `taskId`, ne naslov. | Odpreti enolično ID opravilo, zapreti na oba načina in pregledati hash. |
| R10 | Klik drugega projekta serijalizira privzete filtre ter ohrani `view`; neposredno vnesena druga projektna povezava uporabi njene parametre. | Klik navigacije med projektoma in neposreden URL drugega projekta. |
| R11 | Ponastavitev nastavi osnutek in potrjene filtre na privzete, z enakim pravilom zgodovine, ohrani view; prazen filtriran rezultat prikaže `Ni zadetkov.`; števec je `Prikazano: N od M.` | Ponastavitev, prazen rezultat in števec pri filtriranju. |
| R12 | Ni zapisovalnih klicev ali localStorage; obstoječe poti, API napake/prazni projekti, modal podrobnosti in odzivnost ostanejo delujoči. | Pregled kode, `npm run check`, testi začetnega stanja in razvojni scenariji. |

Predikati ključnega delovanja:

- `F(T,S) = stableSort([t ∈ T | S.status = all ∨ t.status = S.status, ter S.q = '' ∨ ∃f∈{title,description,assignee,id}: N(S.q) je podniz N(t[f])], S.order)`.
- Uporaba spremeni zgodovino natanko tedaj, ko `normalizeDraft(D) ≠ S`; serijalizacija ohrani le nestandardne parametre filtra in izbrani `view`.
- Po navigaciji se `D = parse(hash)`, pri čemer navigacija med pogledi/potmi opravila ohrani `S`, prehod projekta pa zapiše privzeti S.

## Izvedba in sledljivost

Razčlenjevanje in serijalizacija fragmenta sta v `src/navigation.ts`; osnutek, filtriranje in kontrole v `src/App.tsx`; tabla prejme isti filtrirani seznam v `src/TaskBoard.tsx`; podrobnosti vračajo na filtrirano pot v `src/TaskDetails.tsx`; odzivne sloge določa `src/styles.css`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Vrednosti iz URL-ja se prikažejo takoj, s privzetimi vrednostmi za manjkajoče parametre. | D01 `direct filtered URL`; agentni `query parsing uses first values…`. | `src/navigation.ts` `useRoute`; `src/App.tsx` `ProjectView`. | Uspešno v `npm run check`; dnevnik v `verification.md`. |
| R02 | q je triman, NFD/odstranjena diakritika/male črke in dobesedni podniz enega od štirih polj. | Agentni `literal normalized search and stable UTF-16 title ordering`. | `src/App.tsx` `normalizeSearch`, `visibleTasks`. | Uspešno; diakritika v naslovu in fraza z belinami preverjeni. |
| R03 | Status in q sta AND; naslovni vrstni red je normaliziran in stabilen. | D02; agentni `literal normalized search…`. | `src/App.tsx` `visibleTasks`. | Uspešno; asc/desc in enaka naslova preverjeni. |
| R04 | Prvi ponovljeni parameter velja; neveljaven status/order dobi privzeto vrednost; parse ne prepiše URL-ja. | Agentni `query parsing uses first values, defaults invalid filters, and leaves the URL untouched`. | `src/navigation.ts` `parseFilters`, `useRoute`. | Uspešno; hash po neposrednem odprtju ostane nespremenjen. |
| R05 | Kontrole so osnutek; potrditev atomarno uporabi tri vrednosti z enim vnosom zgodovine. | D02; agentni `draft, commit, duplicate commit, and browser history restore applied values`. | `src/App.tsx` `FilterControls`. | Uspešno; osnutek, commit in ponovljena potrditev preverjeni. |
| R06 | Ob commit izpusti privzete vrednosti, kodira q, ohrani board in odstrani neznane parametre. | Agentni `commit trims and encodes the phrase…` ter ponovljena potrditev. | `src/navigation.ts` `queryFor`; `src/App.tsx` `FilterControls.commit`. | Uspešno; URLSearchParams vrednosti q pravilno povrne in neznani parameter izgine. |
| R07 | Hash navigacija in reload obnovita potrjene filtre ter osnutek kontrol. | D03; agentni `draft, commit, duplicate commit, and browser history restore applied values`. | `src/navigation.ts` naročnina na `hashchange`; `src/App.tsx` `FilterControls` key. | Uspešno; Nazaj/Naprej in reload vključeni v skupne teste. |
| R08 | Menjava pogleda ohrani potrjene parametre in opravila, navigacija zavrže osnutek. | D03; agentni `navigation discards draft, project links preserve board…`. | `src/App.tsx` gumbi pogleda; `src/TaskBoard.tsx`. | Uspešno; ID-ji in obnovljena kontrola preverjeni. |
| R09 | Pot opravila ohrani filter/view; zapiranje modalnega pogleda se vrne na projekt. | Agentni `view and detail navigation keep committed filters…`, `detail close button returns…`; baseline duplicate-title details. | `src/navigation.ts` `taskUrl`; `src/TaskDetails.tsx` `close`. | Uspešno; Escape in gumb za zapiranje preverjena. |
| R10 | Klik projekta uporabi privzete filtre in ohrani board; neposreden URL uporabi podane filtre. | Agentni `navigation discards draft, project links preserve board…`. | `src/App.tsx` povezave projekta; `src/navigation.ts` `projectUrl`. | Uspešno; prehod na drug projekt in neposreden filtriran URL preverjena. |
| R11 | Ponastavitev potrdi privzete filtre; prazen rezultat/števec sta pravilna. | D04; agentni `reset clears filters and empty projects still announce a zero result count`. | `src/App.tsx` `FilterControls`, števec in prazno stanje. | Uspešno; `0 od 0`, status kontrol in board ohranitev preverjeni. |
| R12 | Samo GET podatki; brez localStorage; začetne poti, napake, modal in odzivnost ostanejo. | `npm run check`; D04 `reset and no writes`; baseline desktop/mobile suite. | `src/App.tsx`, `src/navigation.ts`; klici API ostajajo v `src/useResource.ts`. | Uspešno; podrobnosti in nič API zapisov preverjeni. Omejitve v `verification.md`. |

## Odprta vprašanja in omejitve

Specifikacija sledi pogoju, da ponovitev enake potrditve ne doda zgodovinskega stanja: enako stanje kanonizira URL z `replaceState`, spremenjeno stanje spremeni hash. Klik na drug projekt začne privzeti filter, neposredna URL navigacija pa upošteva podane parametre. Testi uporabljajo lokalne deterministične fixture podatke; ne izčrpajo vseh možnih identifikatorjev ali obsegov.

## Popravki specifikacije

- 2026-09-29: po izvedbi dopolnjena sledljivost z dejanskimi testnimi imeni in rezultati; sprejemni pogoji niso bili spremenjeni.
