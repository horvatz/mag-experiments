# Specifikacija P09: Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio trenutno prikaže opravila izbranega projekta v preglednici ali tabli, vendar povezava ne nosi filtrov ali vrstnega reda. Uporabnik potrebuje pregled, ki je določen s parametri `q`, `status` in `order`, se uspešno deli prek povezave, deluje z zgodovino brskalnika in se ne spreminja pred izrecno potrditvijo.

## Vhodi, dejanja in izidi

- Podatki: `Project` ima `id` in `name`; `Task` ima `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Stanja so `todo`, `in_progress` in `done`.
- Vmesnik: obstoječa pot projekta ali opravila v hash fragmentu (`#/projects/...`, `#/projects/.../tasks/...`) dobi neodvisne parametre `q`, `status` in `order`. Parameter `view=board` ostane podprt; brez njega ali z drugo vrednostjo je pogled preglednica.
- Nova kontrola: `input[type=search]` z oznako `Iskanje v povezavi`, `select Stanje v povezavi` z vrednostmi `all`, `todo`, `in_progress`, `done`, `select Vrstni red v povezavi` z vrednostmi `original`, `title-asc`, `title-desc`, gumba `Uporabi pogled` in `Ponastavi pogled` ter `role=status` z oznako `Rezultati povezave`.
- Izhod: po potrditvi se prikažejo filtrirani in razvrščeni ID-ji, osnutki kontrol se uskladijo s potrjenim stanjem, URL vsebuje le smiselne parametre in zgodovina brskalnika omogoča Nazaj/Naprej.

### Pravila stanja

- Veljavni parametri so `View := 'table' | 'board'`, `Q := trimmed text`, `Status := 'all' | 'todo' | 'in_progress' | 'done'`, `Order := 'original' | 'title-asc' | 'title-desc'`.
- Potrjeno stanje je izključno izvod hash URL-ja. Vsaka render pot dobi novo stanje iz trenutnega URL-ja; vmesni React state ne sme preglasiti potrjenega stanja med Nazaj/Naprej ali osvežitvijo.
- Osnutek obstaja samo v novih kontrolah. Spreminjanje kontrol ne sme klicati `history`, ne spreminjati `window.location.hash` in ne sme spremeniti prikaza.
- Potrditev nastavi `next := {q: trim(draft.q), status: draft.status, order: draft.order}` in novo URL z obstoječim `view`; potrdi ga le, če se `next` razlikuje od trenutnega potrjenega stanja. Enaka potrditev ne ustvari zgodovinskega vnosa.
- Nova povezava ima obliko `#/projects/{urlencoded projectId}[/tasks/{urlencoded taskId}]?...`. V query so po vrsti izpusti privzeti `q=''`, `status='all'`, `order='original'`, ohranjen je le `view=board`; `q` ter morebitni preostali parametri so kodirani z `URLSearchParams`. `view=table` se ne zapisuje.
- Normalizacija za iskanje in razvrščanje naslovov je `normalize(text) = trim(text).normalize('NFD').remove(U+0300..U+036F).toLowerCase()`.
- Prikaz je množica obstoječih opravil v obsegu trenutnega projekta:
  - `matchesQ(task, q) = q === '' || q is substring of any [normalize(title), normalize(description), normalize(assignee), normalize(id)]`
  - `matchesStatus(task, status) = status === 'all' || task.status === status`
  - `order='original'` ohrani JSON zaporedje; `title-asc`/`title-desc` razvrsti po `normalize(title)` z UTF-16 primerjavo in ohrani izvorno zaporedje za izenačene naslove.
  - `N` je število prikazanih opravil po vseh filtrih, `M` število vseh opravil trenutnega projekta.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za veljavno pot projekta ali opravila velja privzeto `q=''`, `status='all'`, `order='original'`. Vrednosti se preberejo iz query dela hash fragmenta in takoj uporabijo. | Neposredno odpri URL s parametri in preveri vrstice, kartice ter kontrolni osnutek brez klika. |
| R02 | `q` se obreže zunanjih belih znakov, normalizira v NFD, odstranijo se znaki U+0300–U+036F in pretvori v male črke. Išče se po `title`, `description`, `assignee` ali `id`; fraza je enodelna in mora biti podniz vsaj enega polja. Ni regularni izraz. | Primerjaj `æ`/`é`, presledke, velike/male črke, znake `.*`, več besed in zadetek v vsakem iskanem polju. |
| R03 | `status` je filter `all` ali eno od treh veljavnih stanj in se kombinira po AND z `q`. `order` je `original`, `title-asc` ali `title-desc`; naslovi se primerjajo po isti normalizaciji in UTF-16, izenačeni zapisi pa po izvornem vrstnem redu. | Preveri kombinacijo `q` in `status` ter razvrstitev z Unicode, enakimi naslovi in izvornim vrstnim redom. |
| R04 | Neznana ali manjkajoča vrednost `status`/`order` pomeni privzeto. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri se ignorirajo. Samo branje URL-ja ne spremeni naslova ali zgodovine. | Odpri URL z neveljavnimi, podvojenimi in dodatnimi parametri ter preveri prikaz, osnutek in nespremenjen URL. |
| R05 | Sprememba `q`, `status` ali `order` spremeni le lokalni osnutek. Gumb `Uporabi pogled` potrdi vse tri vrednosti hkrati, posodobi prikaz in ustvari eno novo zgodovinsko stanje le, če se potrdjeno stanje razlikuje. | Med urejanjem preveri nespremenjen prikaz/URL; po potrditvi preveri eno zgodovinsko stanje. |
| R06 | Pri potrditvi se `q` obreže; privzeti parametri se izpustijo, ostali se URL-kodirajo. `view=board` se ohrani, neznani parametri se odstranijo. Enaka potrditev ne doda zgodovine. | Primerjaj izhodne hash fragmente in dogodkov `popstate`/dolžino zgodovine za spremembo in ponovitev. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, prikaz in osnutek; osvežitev ohrani stanje iz URL-ja. | Naredi več potrditev, uporabi brskalnikovo navigacijo in osvežitev ter preveri URL, prikaz in kontrole. |
| R08 | Preklop med Preglednico in Tablo ohrani `q`, `status`, `order` ter prikaže iste ID-je; med navigacijami se nepotrjen osnutek zavrže. | Uredi osnutek, preklopi pogled in preveri osnutek, vrstice/kartice ter URL. |
| R09 | Odpiranje podrobnosti ter zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava izbere po `id`, ne po naslovu. | Preveri povezavo z enakimi naslovi, URL, dialog, Escape in gumb za zapiranje. |
| R10 | Klik na drugi projekt začne z njegovim privzetim pogledom in ohrani `view`. Neposredna povezava na drug projekt upošteva njegove parametre. | Preklopi iz projekta s filtri, nato neposredno odpri URL drugega projekta s parametri. |
| R11 | `Ponastavi pogled` počisti `q`, `status` in `order`, posodobi prikaz, osnutek in zgodovino po enakem pravilu kot potrditev ter ohrani trenutni pogled. Prazen rezultat prikaže `Ni zadetkov.`; status ima besedilo `Prikazano: N od M.`. | Preveri ponastavitev v obeh pogledih, URL, zgodovino, besedilo praznega stanja in števec za različne N/M. |
| R12 | Nobena zahtevana akcija ne piše podatkov ali localStorage. Ostanejo obstoječi izgled Folio, neznana pot, nalaganje, napake, podrobnosti, `data-task-id`, dostopna imena in ožji postrojeni zaslon. | Zaznavaj vse ne-GET zahteve, stanje strežnika, localStorage in horizontalni overflow na 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Neposredna povezava uporabi vse tri parametre; neveljavne, podvojene in neznane vrednosti se zmehčajo brez prepisovanja. | Odprejo se URL-i z veljavnimi, neveljavnimi, podvojenimi in dodatnimi parametri. | `src/navigation.ts`, `src/App.tsx`, `tests/agent/` | Ni preverjeno; to zapiše implementer po zagonu. |
| R05–R07 | Osnutek, enkratna potrditev in zgodovina sledita pravilom stanja. | Uredi kontrole, potrdi več različnih stanj, uporabi Nazaj/Naprej in osvežitev. | `src/App.tsx`, `src/navigation.ts`, `tests/agent/` | Ni preverjeno; to zapiše implementer po zagonu. |
| R08–R10 | Preklop pogleda, projektov in podrobnosti ohranja ali začisti stanje po R06–R10. | Primerjaj ID-je, `view`, URL in osnutek pred/po vsaki navigaciji. | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts`, `tests/agent/` | Ni preverjeno; to zapiše implementer po zagonu. |
| R11–R12 | Ponastavitev, rezultati in read-only/odzivnost ostanejo skladni z izhodiščem. | Preveri ponastavitev v obeh pogledih, `Ni zadetkov.`, številke, ne-GET zahteve, localStorage, neznano pot, nalaganje, napake in širino 390 px. | `src/App.tsx`, `src/components.tsx`, `src/styles.css`, `tests/agent/` | Ni preverjeno; to zapiše implementer po zagonu. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj; zahteve so samozadostne.
- Specifikacija ne uvaja novega API-ja, sprememb strežnika ali skupnih tipov.
- Izhodni razvojni testi so namenjeni implementerju, vendar v tej fazi niso izvedeni.
