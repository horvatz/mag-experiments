# Specifikacija: stanje pogleda v povezavi in zgodovini (P09-B)

## Problem in kontekst

Uporabnik želi iskati, filtrirati po stanju in urejati naslove v obstoječem projektu ali opravilu ter povezavo do tega pogleda deliti ali shraniti v brskalniški zgodovini. Izhodiščni Folio že omogoča nalaganje prek javnega API-ja, preglednico, tablo, podrobnosti in prehode med projekti. Nova funkcionalnost je samo stanje pregleda: ne dodaja, ne spreminja ne briše podatkov.

## Vhodi, dejanja in izidi

- URL fragment obstoječe poti projekte ali opravila prenaša `q`, `status` in `order`; obstoječi parameter `view` ostane nepogorešen. Privzeto so `q=""`, `status="all"`, `order="original"`.
- Obstoječi poti iz `src/navigation.ts` sta `#/projects/:projectId` in `#/projects/:projectId/tasks/:taskId`. Vsak parameter bere prvo pojavnico iz `URLSearchParams`.
- `Project` ima `id: string` in `name: string`. `Task` ima `id: string`, `projectId: string`, `title: string`, `description: string`, `status: "todo" | "in_progress" | "done"`, `assignee: string` ter `dueDate: string` (`shared/types.ts`).
- Kontrola `Iskanje v povezavi` ureja osnutek `q`, `Stanje v povezavi` osnutek `status`, `Vrstni red v povezavi` osnutek `order`. Spremembe osnutka ne spreminjajo prikaza ne URL.
- `Uporabi pogled` potrdi vse tri vrednosti in ustvari eno zgodovinsko stanje le ob spremembi potrjenega pogleda. `Ponastavi pogled` potrdi privzeti pogled po enakem pravilu in ohrani trenutni način prikaza.
- Nazaj, naprej, osvežitev in neposredno odprtje povezave obnovita potrjeni pogled iz URL-ja ter osnutek kontrol. Potrjeno stanje se ne shranjuje v `localStorage`.
- Preklop med Preglednica in Tablo, odpiranje in zapiranje podrobnosti ter prehod na drug projekt ohranijo veljavna potrjena polja, če zahteva ne določi drugače.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Stanje pregleda se razčleni iz prve pojavitve `q`, `status` in `order` v query delu URL fragmenta trenutne poti. Neizpolnjene ali neznane vrednosti se preslikajo v privzete vrednosti. Neposredno odprtje uporabi stanje brez dodatnega klika. | Playwright: neposredna odpritev ter navigacije nazaj/naprej preverita prikaz in URL. |
| R02 | Iskanje najprev `q` odreže zunanje beline, pretvori v NFD, odstrani segmente `U+0300`–`U+036F` in pretvori v male črke. Preveri se podniz (`includes`) polj `title`, `description`, `assignee` ali `id`; `q` se ne obravnava kot regularni izraz in se ne razbije na besede. | Enotski test normalizacije in Playwright primera z ločili ter eno besedno frazo. |
| R03 | `status ∈ {all, todo, in_progress, done}` se kombinira z iskanjem po `IN`. `order ∈ {original, title-asc, title-desc}` primerja naslove z enako normalizacijo in UTF-16 (`<`); izenačeni naslovi ohranijo izvorno zaporedje (stabilno urejanje). | Enotski test kombinacije ter Playwright test z izenačenimi naslovi in različnim izvornim zaporedjem. |
| R04 | Neznani `status`/`order` in drugi neznani parametri ne vplivajo na prikaz. Pri ponovljenem parametru velja prva vrednost. Razčlenjevanje ali ponastavitev neznanih vrednosti sama ne sme spremeniti URL-ja. | Playwright test ponovljenih, neveljavnih in dodatnih parametrov. |
| R05 | Sprememba treh kontrol spremeni samo osnutek. `Uporabi pogled` potrdi tri vrednosti hkrati; če se potrjeno stanje spremeni, ustvari eno `history` stanje, sicer ne. | Playwright test vhodnih sprememb ter enega/dveh klikov z zgodovino. |
| R06 | Ob potrditvi se `q` obreže, privzeti trije parametri izpustijo, preostali URL-kodirajo, `view=board` ohrani, neznani parametri odstranijo. Enaka potrditev ne doda zgodovinskega stanja. | Playwright test URL in `history.length` oz. opazovalce zgodovine. |
| R07 | Nazaj/naprej obnovita potrdene parametre, prikaz in osnutek. Osvežitev ohrani stanje iz URL-ja, tudi kadar sta projekta lahko prazna ali imata enake naslove. | Playwright test nazaj, naprej in osvežitve. |
| R08 | Preklop Preglednica/Tabla ohrani `q`, `status`, `order` in `view` ter prikaže iste `data-task-id`. Vsak prehod zavže nepotrjen osnutek. | Playwright test preklopa z umazanim osnutkom in enakim ID-jem. |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali `Escape` ohranita potrdene parametre in `view`; povezava izbere pravi `id`, ne naslov. | Playwright test podrobnosti z enakima naslovoma in `Escape`. |
| R10 | Klik na drug projekt začne njegov privzeti pregled (`q=""`, `status="all"`, `order="original"`) ter ohrani tabelo/tablo. Neposredna povezava na drugi projekt s parametri jih upošteva. | Playwright test običajnega in neposrednega prehoda med projekti. |
| R11 | `Ponastavi pogled` počisti osnutek in potrdi privzeti pogled po pravilu iz R05–R06 ter ohrani trenutni način prikaza. Prazen iskalni rezultat pokaže `Ni zadetkov`; `role=status` z `aria-label="Rezultati povezave"` pokaže `Prikazano: N od M.` | Playwright test ponastavitve ter števca za 0/N, 1/N in več zadetkov. |
| R12 | Nobeno dejanje ne pošlje API zapisa, ne spremeni podatkov in ne uporabi `localStorage` ali testnih kontrol `/__test/`. Ohranijo se obstoječa neznana pot, nalaganje, podrobnosti, dostopna imena, stolpci/kartice in prilagodljiv videz Folio. | Bralska preverba izvorne kode ter skupni/testni regresijski scenariji; noben API zapis ni dovoljen. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zgornja pravila. | Izvidi razvojnih testov `tests/development/P09.spec.ts` (D01–D04) ne pokrivajo celotnega obsega. Implementer naj doda manjkajoče agentove teste in zapiše dejanske izide. | Predvidena izhodišča: `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`; tipi so v `shared/types.ts`. | V tej fazi ni izveden noben test, zato izidi niso označeni kot uspešni. |

## Odprta vprašanja in omejitve

- Predpostavka: obstoječi poti sta lahko poti projekta in opravila; natančne poti, vrste, imena in navigacijski mehanizem se preverijo v izvorni kodi pred zaključkom specifikacije.
- Nadzorovani GET odgovori razvojnih testov so izključno testni mehanizem; UI ne sme uvažati ali klicati `/__test/`.
- V tej fazi ni zagnane aplikacije, testov ali pregleda videza, ker pripadajo implementerju.
