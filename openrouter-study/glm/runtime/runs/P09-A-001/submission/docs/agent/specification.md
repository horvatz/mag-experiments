# P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio omogoča pregled opravil izbranega projekta v tabeli ali na tabli. Povezava trenutno nosi le identifikator projekta, opravila in načina prikaza, zato filtri niso deljivi in brskalnik ne obnovi stanja. Cilj je, da stanje pregleda določajo parametri `q`, `status` in `order` v hash delu URL-ja, osnutek kontrol pa se potrdi kot ena zgodovinska sprememba.

## Vhodi, dejanja in izidi

- Vhodni podatki: `Project = {id, name}`, `Task = {id, projectId, title, description, status, assignee, dueDate}`. Vse zadetke prebere iz `/api/projects` in `/api/projects/:id/tasks`, podrobnost pa iz `/api/tasks/:id`.
- Iskanje: ena dobesedna fraza `q`; normalizacija je `normalize(value) = lowercase(removeCombining(trim(value)))`, kjer `removeCombining` razcepi NFD in odstrani znake U+0300–U+036F.
- Dovoljena dejanja: urejanje osnutka, potrditev, ponastavitev, preklop načina, navigacija po projektih, odpiranje in zapiranje podrobnosti, brskalnik Nazaj/Naprej ter osvežitev.
- Uspeh: URL in kontrolniki prikazujejo potrjeno stanje; vrstni red ID-jev je odvisen od filtrov in načina prikaza, podrobnost deluje z identifikatorjem.
- Preklic ali napaka: napaka API-ja pokaže obstoječe sporočilo in ponovni poskus; filtri nimajo vpliva na shranjevanje podatkov.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `parseRoute(hash).viewState` ima privzeto vrednost `{q: "", status: "all", order: "original"}`; URL se uporabi ob prvem renderu. | Neposreden odprt URL in osvežitev. |
| R02 | Za vsak `task` velja `searchable = [title, description, assignee, id]`; zadeti so `searchable`, katerih normalizirana vsebina vsebuje normalizirani `q`. `String.includes` je dobesedno, ne regularni izraz. | Lastni preskusi iskanja, trim, diakritike, ločila in ID. |
| R03 | `matches(task) = statusMatch(q,status,task) && searchMatch(q,task)`; `all` sprejme vse. `order=original` ohrani API vrstni red; `title-asc`/`title-desc` uredita normalizirane naslove po UTF-16, ob enakosti pa ohranita izvorni indeks. | Lastni preskusi vseh vrstnih redov in IN pogoja. |
| R04 | Neznana ali manjkajoča vrednost `status`/`order` pomeni privzeto; `URLSearchParams` vrne prvo pojavitev; neznan parametri ne vplivajo; samo branje route ne popravi URL. | Neposredni URL z neznanimi in podvojenimi parametri. |
| R05 | Osrednje stanje kontrol je osnutek; sprememba `input`/`select` ne pokliče `history.pushState` in ne spremeni prikaza. Potrditev pokliče eno potisno stanje, če se potrjeno stanje razlikuje. | Spremljanje `history.length`, URL in ID-jev med urejanjem/potrditvijo. |
| R06 | Potrjena URL vsebuje le `view=board` (če je izbran board), trimani neprivzeti `q`, veljavni neprivzeti `status`/`order`; neznani parametri se izpustijo. Enoznačno uporabi `encodeURIComponent`; enaka potrditev ne doda zgodovine. | Lastni preskusi kodiranja in ponovitve potrditve. |
| R07 | Zgodovinska pot vsebuje celoten route z view stanjem; React na `hashchange` prebere URL in osveži potrdeno stanje, prikaz ter osnutek. | Brskalnik Nazaj/Naprej in osvežitev. |
| R08 | Preklop tabela/tabla ohrani veljavne parametre ter `view`, vsaka navigacija pa zavrže osnutek. | Os nutek spremeni, preklop, nato preveri kontrolnike in ID-je. |
| R09 | `taskUrl(project.id, task.id, view)` vsebuje veljavne parametre in `view`; podrobnost se išče po `id`; zapiranje z gumbom ali Escape ohrani URL. | Preklic v obeh načinih pri enakih naslovih. |
| R10 | Povezava do istega projekta in načina prenaša veljavne parametre; klik po drugem projektu pa začne privzeti pregled in ohrani način. | Klik iz filtriranega projekta in neposredna povezava drugega projekta. |
| R11 | Reset nastavi osnutek in potrdi `{q:"", status:"all", order:"original"}`, ohrani način prikaza, posodobi zgodovino po enakem pravilu; prazen zadetek pokaže `Ni zadetkov`; `role=status`, `aria-label=Rezultati povezave` in besedilo `Prikazano: N od M.`. | Lastni preskusi praznega zadetka, reset, števca in board. |
| R12 | Aplikacija ne kliče pisanega API-ja, testnih kontrol ali `localStorage`; ohrani neznano pot, nalaganje, napako, podrobnosti in obstoječi Folio videz. | `npm run check`, skupni razvojni testi, lastni test bralne povezave. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R11 | Glej tabelo zgoraj. | `tests/agent/P09-agent.spec.ts` pokriva vsako zahtevo z več primeri podatkov. | `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx` | Izpolnjeno po zagonu `npm run check`; rezultati v `docs/agent/verification.md`. |
| R01–R12 | Skupne zahteve P09 in obstoječa vedenja. | Skupni razvojni testi P09 ter izhodiščni/API testi. | `src/App.tsx`, `src/TaskBoard.tsx` | Izpolnjeno po zagonu `npm run check`. |

## Odprta vprašanja in omejitve

- Testni pripomoček `/__test/` uporabljajo samo lastni Playwright testi; produkcijska koda ga ne uvaža in ne kliče.
- Ne preverjamo sočasnih sprememb podatkov med nalaganjem in navigacijami, ker navodila teh primerov ne širijo.
- Končni testi niso dostopni; veljavnost je omejena na dostopne skupne, razvojne in lastne teste.

## Zgodovina popravkov specifikacije

- 2026-10-31: Prva različica po predlogi; dodani predikati, sledljivost in omejitve.
