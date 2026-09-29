# Razvojna specifikacija: P09 – stanje pogleda

## Problem in kontekst

Folio prikazuje projekte, opravila in podrobnosti v preglednici ali tabli. Uporabnik naj lahko opravilom nastavi skupno iskanje, filter stanja in vrstni red, potrjeno stanje deli prek povezave ter ga obnovi z osvežitvijo in zgodovino brskalnika. Dopolnitev uporablja obstoječi slovenski vmesnik in videz Folio.

## Vhodi, dejanja in izidi

Pot projekta je `#/projects/:projectId`; podrobnost opravila je `#/projects/:projectId/tasks/:taskId`. Parametri pogleda so v query delu fragmenta (`q`, `status`, `order`, `view`). Projekt in opravila se berejo z obstoječih GET klicev `/api/projects` in `/api/projects/:id/tasks`; podrobnost se bere z `/api/tasks/:id`. Tipi v `shared/types.ts`: `Project(id, name)`, `Task(id, projectId, title, description, status, assignee, dueDate)`; stanja opravila so `todo`, `in_progress`, `done`.

Kontrole urejajo osnutek. Uporabi pogled potrdi trojico filtrov, Ponastavi pogled jo vrne na privzeto. Napaka/nalaganje ohranita obstoječa obvestila in ponovni poskus. Pot potrjuje trenutno stanje; navigacija obnovi stanje iz novega URL-ja.

## Zahteve in pravila

Naj bo `S=(q,status,order,view)`. Privzeto so `q=""`, `status=all`, `order=original`, `view=table`. `N(x) = lowercase(remove U+0300–U+036F from NFD(trim(x)))`. Za opravilo `t` velja:

`match(t,S) = (S.status=all ∨ t.status=S.status) ∧ (N(q)="" ∨ ∃f∈{title,description,assignee,id}: N(t[f]) vsebuje N(q))`.

`contains` je dobesedni podniz, ne regex ali iskanje po besedah. Vrstni red `original` ohrani vrstni red API; `title-asc`/`title-desc` primerja `N(title)` po UTF-16, pri izenačenju pa ohrani vrstni red API. V tabeli »preveri« pomeni primerjati URL, kontrole, prikazane `data-task-id` in dostopna imena/vidna sporočila; noben test spodaj ni bil izveden v tej fazi.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob neposrednem odprtju poti se prikaže stanje iz queryja brez klika; manjkajoči `q/status/order` pomenijo privzete vrednosti. | Neposredna povezava, osvežitev, vrednosti kontrol in ID-ji. |
| R02 | `q` je ena fraza. Iskanje uporabi `N(q)` in `N` vsakega od štirih polj po predikatu zgoraj; presledki med besedami ostanejo del fraze. | Preveri robne presledke, diakritiko, velike/male črke, ločila in da morajo besede stati skupaj. |
| R03 | Dovoljeni statusi so `all/todo/in_progress/done`; vrstni red `original/title-asc/title-desc`. Status in iskanje se združita z IN. Naslovno razvrščanje je stabilno. | Kombiniran filter ter asc/desc, enaki normalizirani naslovi in izvorni vrstni red. |
| R04 | Za ponovljeni parameter velja prva pojavitev. Neznan status/order pade na privzeto; drugi neznani parametri ne vplivajo na pogled. Samo razčlenitev URL-ja ga ne prepiše. | URL z dvojnimi, neveljavnimi in dodatnimi parametri; preveri, da ob odprtju URL ostane nespremenjen. |
| R05 | Sprememba kontrol spremeni samo osnutek. Uporabi potrdi vse tri vrednosti skupaj; če se potrjena trojica spremeni, doda natanko en vnos zgodovine. | Pred klikom primerjaj prikazane ID-je/URL; po kliku preveri trojico ter en prehod Nazaj. |
| R06 | Ob potrditvi se `q` obreže; prazni q, `status=all` in `order=original` se izpustijo. Preostanek je pravilno URL-kodiran. Ohranjen je `view=board`; neznani parametri se odstranijo. Enaka potrditev ne doda vnosa. | Preveri fragment URL, dekodirane vrednosti, kodirane ločila, ponovljeno potrditev in dolžino zgodovine prek Nazaj. |
| R07 | Nazaj/Naprej obnovita filtre, prikaz in osnutek kontrol. Osvežitev obnovi potrjeno stanje iz URL-ja. | Potrdi dve različni stanji, uporabi Nazaj/Naprej in osveži. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene filtre in isti urejeni nabor ID-jev. Vsaka navigacija zavrže nepotrjen osnutek. | Zamenjaj pogled ob aktivnih filtrih; začni osnutek, navigiraj in preveri, da je zavržen. |
| R09 | Odpiranje podrobnosti ter zapiranje z gumbom ali Escape ohrani filtre in način pogleda. Opravilo določi ID, ne naslov. | Odpri/deep-link opravilo z enakim naslovom kot drugo; zapri z obema dejanji, preveri pot in ID-je. |
| R10 | Klik na drug projekt začne privzete filtre in ohrani trenutni način pogleda. Neposredna povezava do drugega projekta upošteva svoje parametre. | Preveri prehod prek navigacije projekta in neposredno odpri drugi projekt z iskanjem. |
| R11 | Ponastavi nastavi osnutek in potrjeno trojico na privzeto, ohrani pogled ter uporabi pravilo zgodovine R05. Pri nič prikazanih opravilih je `Ni zadetkov.`; števec je `Prikazano: N od M.`, kjer je N število prikazanih po filtru in M število opravil projekta. | Ponastavi iz filtriranega stanja; preveri URL, osnutek, pogled, števec in prazen seznam. |
| R12 | Dejanja pogleda ne spreminjajo podatkov, ne pošiljajo zapisov na API in ne uporabljajo `localStorage` ali `/__test/`. Ohrani neznano pot, nalaganje, podrobnosti, `data-task-id`, obstoječa dostopna imena, `aria-label="Pregled stanj opravil"` in prilagodljiv Folio; pri 390 px ni vodoravnega drsenja cele strani (notranje drsenje tabel/tabla je dovoljeno). | Preglej omrežne klice in shrambo, regresijske poti/napake, dostopnost ter širino 390 px. |

## Izvedba in sledljivost

To je predaja pred implementacijo; spodaj so izhodiščne točke za dopolnitev, ne trditev, da je koda že spremenjena. Izvajalec naj po izvedbi doda dejanski del kode in dokaz za vsak pogoj.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Razčlenitev, normalizacija, filtriranje in razvrščanje po zgornjih pravilih. | D01 (neposredni URL) in ciljni primeri neveljavnih/dvojnih parametrov ter stabilnega vrstnega reda. | `src/navigation.ts` (hash in query); `src/App.tsx` (podatki in seznam). | Ni izvedeno; razvojni scenarij D01 je prebran, ne zagnan. |
| R05–R07 | Osnutek/objava, serijalizacija in obnova navigacije. | D02 (osnutek), D03 (tabla in osvežitev), Nazaj/Naprej ter enaka potrditev. | `src/App.tsx`, `src/navigation.ts`. | Ni izvedeno; D02/D03 sta prebrana, ne zagnana. |
| R08–R10 | Ohranitev stanja pri pogledih/podrobnostih; ponastavitev pri menjavi projekta. | Tabla/preglednica, Escape/zapri, enaki naslovi in drug projekt. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`. | Ni izvedeno; scenariji niso zagnani. |
| R11–R12 | Ponastavitev, število/empty state, samo branje in odzivnost. | D04 (ponastavitev, prazen filter, brez zapisov), API in 390 px. | `src/App.tsx`, `src/styles.css`, obstoječi bralni API v `src/api.ts`. | Ni izvedeno; D04 je prebran, ne zagnan. |

## Odprta vprašanja in omejitve

V izhodišču `src/navigation.ts` bere le `view`, `projectUrl` in `taskUrl` ne prenašata filtrov, `src/App.tsx` prikazuje vsa opravila, `TaskBoard` jih razvršča samo po stanju, `TaskDetails` zapira na pot projekta. To so mesta za dopolnitev, ne pričakovana končna obnašanja. Skupni tipi in API ostanejo nespremenjeni. Razvojni `tests/development/P09.spec.ts` vsebuje D01–D04; izvaja ga implementer. Končnih testov ni bilo mogoče preveriti v vlogi avtorja specifikacije.
