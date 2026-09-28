# Specifikacija P09: stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio že bere projekte in opravila iz `/api/`, podpira poti `#/projects/:id` in `#/projects/:id/tasks/:id` ter prikaz preglednice in table. Stanje pogleda je trenutno le `view=board`; preklopi pogled izgubijo morebitne parametre. Dodana bo povezljiva filtracija in vrstni red opravil, osnutek kontrol z izrecno potrditvijo ter navigacija po potrjenih stanjih prek zgodovine brskalnika. Obstoječi videz, slovenska poimenovanja, API, podrobnosti in odzivna postavitev ostanejo.

## Vhodi, dejanja in izidi

Za aktivni projekt so vhodna polja opravila `id`, `title`, `description`, `assignee`, `status` in `projectId`. Vhod začetnega stanja je query v URL fragmentu na obstoječi projektni ali opravilni poti: `q`, `status`, `order`, opcijsko `view`. Kontrole urejajo lokalni osnutek; Uporabi potrdi vse tri vrednosti z enim novim zgodovinskim vnosom, Ponastavi potrdi privzete vrednosti, preklop pogleda in navigacija podrobnosti ohranita potrjene filtre. Klik drugega projekta začne njegove privzete filtre, neposredna URL povezava pa uporabi podane filtre. `popstate`/`hashchange` obnovi URL stanje in osnutek. Neuspešno nalaganje še naprej prikaže obstoječe sporočilo napake in ponovni poskus.

Iskalna normalizacija je `N(s) = lowercase(removeU0300-036f(NFD(trim(s))))`. Rezultat vsebuje opravilo `t` natanko tedaj, ko velja izbrani status (`all` pomeni katerikoli) IN je `N(q)` prazen ali podniz vsaj enega od `N(t.title)`, `N(t.description)`, `N(t.assignee)`, `N(t.id)`. Iskanje uporablja eno dobesedno frazo, ne besednega razreza ali regularnega izraza. Razvrščanje `title-asc`/`title-desc` primerja `N(title)` po UTF-16; primerjalnik pri izenačenju vrne 0, stabilno urejanje ohrani izvorni vrstni red. Števec `N` je število prikazanih, `M` pa skupno število opravil trenutnega projekta.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Fragment query za projekt in opravilo poda začetno stanje takoj; privzeto `q=''`, `status=all`, `order=original`. | Neposredni URL-ji, ponovni zagon/refresh. |
| R02 | `N(q)` je dobesedni podniz `N` vsaj enega od štirih polj; zunanji presledki in diakritika se normalizirajo. | Fraze z naglasi, presledki, ločili, regex znaki ter iskanje po vsakem polju. |
| R03 | Status `all/todo/in_progress/done` se združi z iskanjem po IN; order `original/title-asc/title-desc`, stabilno pri enakih normaliziranih naslovih. | Kombinirani filtri, oba vrstna reda in izenačeni naslovi. |
| R04 | Prva ponovljena vrednost zmaga; neznani status/order privzeti; neznani parametri prezrti. Parsiranje samo po sebi ne piše URL-ja. | Neposredni URL z dvojnimi/neznanimi parametri in preverjanje nespremenjenega URL-ja. |
| R05 | Kontrole spreminjajo le osnutek; Uporabi potrdi vse skupaj in doda natanko eno zgodovinsko stanje samo ob spremembi potrjenega stanja. | Spreminjanje kontrol, nato potrditev, tudi nespremenjene potrditve. |
| R06 | Potrditev obreže q, izpusti privzete filtre, pravilno kodira parametre, ohrani `view=board`, odstrani neznane parametre. | Preverjanje serializiranega fragmenta z ločili/Unicode ter neznanimi parametri. |
| R07 | Nazaj/Naprej obnovita prikaz in osnutek; osvežitev uporabi potrjeno URL stanje. | Več potrditev, browser back/forward in reload. |
| R08 | Preglednica/Tabla ohranita ID-je in potrjene filtre; vsaka navigacija zavrže osnutek. | Preklop pogleda in navigacija z neuporabljenim osnutkom. |
| R09 | Podrobnosti in zaprtje z gumbom/Escape ohranijo filtre in način; ID določi opravilo tudi pri enakih naslovih. | Odprtje iz obeh pogledov, zaprtje, enaki naslovi. |
| R10 | Klik drugega projekta uporabi privzete filtre in ohrani način; neposredna povezava s parametri jih upošteva. | Klik med projekti v obeh pogledih in neposredna pot. |
| R11 | Ponastavitev potrdi privzete filtre po pravilih zgodovine in ohrani pogled; prazno filtriranje pokaže `Ni zadetkov.`; števec je `Prikazano: N od M.` | Ponastavitev, prazen rezultat, nič/eno/več opravil. |
| R12 | UI uporablja samo `/api/`, ne zapisuje API/localStorage/testnih kontrol; obstoječe poti, napake, podrobnosti in odzivni Folio ostanejo. | Pregled kode, regresijski testi in namenske navigacijske/odzivne kontrole. |

Simboli `N`, `M`, `N(s)` in `t` so definirani v razdelku Vhodi, dejanja in izidi. Vrstni red URL parametrov ni pomemben. Potrditev spremeni zgodovino le, če je kanonično potrjeno stanje različno; navigacija poti/ID pogleda ohrani potrjene filtre, razen ko R10 izrecno zahteva privzeto stanje za izbrani projekt.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Stanje iz URL pri mount in navigaciji | Razvojni D01/D03; agentni neposredni URL in navigacija drugega projekta | `src/navigation.ts` `readRoute`; `src/App.tsx` | Uspešno: `npm run check`, 53/53; glej dnevnik spodaj. |
| R02 | Predikat `N(q)` podniza polje | Agentni literalni Unicode scenarij preveri title, description, assignee, id in frazo `^=SUM` | `src/navigation.ts` `normalizeSearch`; `src/App.tsx` `selectTasks` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R03 | Status IN query; stabilen vrstni red | Agentni kombinirani status, asc/desc in stabilna izenačitev naslovov | `src/App.tsx` `selectTasks` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R04 | Prva vrednost in varno razčlenjevanje brez pisanja | Agentni ponovljeni/neznani parametri pred potrditvijo | `src/navigation.ts` `readRoute` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R05 | Osnutek proti potrjenemu stanju; največ en nov vnos | Razvojni D02; agentna odložena potrditev, sprememba in ponovljena potrditev | `src/App.tsx` `ProjectView.commit` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R06 | Kanonična serializacija | Agentna obrezava q, board, odstranitev neznanih parametrov in ponastavitev | `src/navigation.ts` `queryFor`, `projectUrl`; `src/App.tsx` `commit` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R07 | Sinhronizacija zgodovine | Agentni nazaj/naprej; razvojni D03 reload | `src/navigation.ts` `subscribe`, `useRoute`; `src/App.tsx` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R08 | Filter neodvisen od pogleda; zavržen osnutek | Agentni preklop table, osnutek ter navigacija opravila/projekta | `src/App.tsx`, `src/TaskBoard.tsx`, `src/navigation.ts` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R09 | Task path ohrani query in view | Agentno odprtje in zaprtje z gumbom/Escape; izhodiščni test podvojenih naslovov po ID | `src/navigation.ts` `taskUrl`, `projectUrl`; `src/TaskDetails.tsx` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R10 | Navigacija projekta resetira filtre | Agentni klik iz boarda in neposredni URL drugega projekta s statusom | `src/App.tsx`, `src/navigation.ts` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R11 | Reset, števec, prazen rezultat | Agentni board reset, sporočilo in števec; razvojni D04 brez zapisov | `src/App.tsx`, `src/styles.css` | Uspešno: agentnih 7/7 in `npm run check` 53/53. |
| R12 | Samo branje javnega API-ja in regresije | Razvojni D04 `readonly`; baseline API/UI desktop/mobile; agentni viewport 390 px; pregled `src/` | `src/` | Uspešno: `npm run check`, 53/53. |

### Zapis popravkov specifikacije

- Začetna specifikacija, različica 1.0, je bila zapisana pred implementacijo.
- Po implementaciji so dopolnjene povezave do kode, agentnih scenarijev in dejanskih rezultatov; zahteve niso bile spremenjene.

## Odprta vprašanja in omejitve

Navodila določajo besedilo za prazen filtrirani rezultat in števec, ne pa preostale razporeditve kontrol; uporabi se obstoječa hierarhija Folio. Query stanje velja na projektni poti in task podpoti. Ohranitev neznanih parametrov ni zahtevana in se pri potrditvi zavrže. Preverjanja in njihove omejitve so zapisani v `verification.md`.
