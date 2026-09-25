# P07 — izvedena preverjanja

Naloga je izvedena samostojno po postopku A. Začetek: 2026-09-25 ob
20:14:59 UTC. Specifikacija je bila zapisana pred spremembo kode.
Končna koda izpolnjuje R01–R12 v spodaj izvedenih preverjanjih; znanih
neizpolnjenih zahtev ni. Končni skriti testi niso bili na voljo.

## Izvedba

- [useFavorites.ts](../../src/useFavorites.ts): globalna množica, stroga
  validacija, obnova, kanonični zapis, uskladitev dogodkov in pomnilniško
  delovanje ob izjemi. Nalaganje in `storage` ne povzročata zapisov.
- [FavoriteButton.tsx](../../src/FavoriteButton.tsx): enak dostopen gumb v
  preglednici in na tabli, ločen od povezave opravila.
- [App.tsx](../../src/App.tsx): projektni filter, projektno brisanje, števec,
  prazno stanje in opozorilo. Ključ `ProjectView` ponastavi filter ob menjavi
  projekta, hook v `App` pa ohrani globalne priljubljene.
- [TaskBoard.tsx](../../src/TaskBoard.tsx): filtrirana opravila, vidni števci,
  ločene zvezdice in dostopna imena tudi za ID-je s presledki/ločili.
- [styles.css](../../src/styles.css): obstoječe Folio barve in gradniki,
  prelamljanje kontrol, zvezdice, prazno stanje in opozorilo.

## Dejanski zagoni in rezultati

| Preverjanje | Rezultat | Dokaz |
| --- | --- | --- |
| Prvi `npm run check`, pred dodajanjem lastnih testov | Uspešno: lint, TypeScript, Vite, vseh 46 skupnih testov (17,2 s za teste). | [check-initial.log](check-initial.log) |
| `npm run check` po dodajanju testov | Ustavljen pri lint: dva neuporabljena uvoza v lastnem testu. Uvoza odstranjena. | [check-lint-failure.log](check-lint-failure.log) |
| Naslednji `npm run check` | Lint uspešen; TypeScript je zavrnil skupni tip simuliranih `getItem`/`setItem`. Test popravljen z ločenima sklicema na metodi. | [check-typecheck-failure.log](check-typecheck-failure.log) |
| Končni `npm run check` | Izhod 0: lint, TypeScript, produkcijska gradnja in **68/68 testov** (28,5 s za teste). | [check.log](check.log) |
| Vizualni pregled obeh pogledov pri 1440 × 960 in 390 × 844 | Pregledani štirje posnetki; kontrole se prelomijo, izgled Folio ostane ohranjen. Ni napak `pageerror`. | Posnetki in meritve spodaj. |
| Pregled kode z `rg` za `__test`, `localStorage`, `fetch`, `setItem`, `storage` | V `src/` ni uporabe testnih kontrol; localStorage uporablja samo hook priljubljenih. Ni novega API zapisa ali mutacije opravila. | [useFavorites.ts](../../src/useFavorites.ts), [api.ts](../../src/api.ts), [App.tsx](../../src/App.tsx) |

Končni seštevek: 14 API + 12 namiznih + 12 mobilnih izhodiščnih testov,
4 namizni + 4 mobilni razvojni testi P07 ter 22 lastnih testov.
Opozorila npm o obstoječi nastavitvi `http-proxy` in Node o `NO_COLOR`
niso ustavila preverjanj. Infrastruktura, skupni testi in odvisnosti niso
spreminjani. Koda po uspešnem končnem preverjanju ni bila več spremenjena.

## Sledljivost zahtev

Testi A01–A08 so v [tests/agent/favorites.spec.ts](../../tests/agent/favorites.spec.ts).
Različice A01, A07 in A08 so ločeni parametrizirani testi. D01–D04 so v
[tests/development/P07.spec.ts](../../tests/development/P07.spec.ts).
Za vsako spodnjo vrstico je izid uspešen v [končnem dnevniku](check.log).

| Zahteva | Dejansko preverjen pogoj in scenarij | Koda |
| --- | --- | --- |
| R01 | D01: neodvisnost enakih naslovov po ID-ju. A04: Space/Enter in klik ne odprejo dialoga; gumb ni potomec povezave; stanje ostane v obeh pogledih. A08: drugačni ID-ji z Unicode, presledki in ločili. | `FavoriteButton`, `ProjectView`, `TaskBoard` |
| R02 | D03 in A02: točna oblika `{version:1,ids:[...]}`, deduplikacija in UTF-16 vrstni red (tudi emoji pred znakom U+E000), brez polj opravila. | `useFavorites.save` |
| R03 | A02: podvojeni ID, prazen niz in neznani ID-ji se obnovijo, ne ustvarijo opravil in preživijo zapis. A02/A03: osvežitev obnovi izbiro. | `parseFavorites`, `readFavorites` |
| R04 | A01: 11 vhodov — manjkajoč ključ, pokvarjen JSON, null, tabela, napačna/tekstovna različica, manjkajoči ids, ids kot niz, število/null/objekt med ID-ji. Začetek je prazen, opozorila o nedostopnosti ni, vsebina ostane nespremenjena, število zapisov je 0. | `parseFavorites`, `readFavorites` |
| R05 | D02, A04, A08: privzeto false; filtrira samo trenutni projekt v izvornem vrstnem redu, tudi pri 13 opravilih in nasprotnem vrstnem redu ID-jev v shrambi. | `ProjectView.favoritesOnly`, `visibleTasks` |
| R06 | D02: odstranitev zadnjega vidnega priljubljenega. A03/A04/A08: zahtevano prazno besedilo in možnost izklopa filtra v obeh pogledih, tudi pri praznem projektu. | `ProjectView`: kontrole, `favorites-empty` |
| R07 | D04 in A04: množica in filter ostaneta ob menjavi pogleda; števci se osvežijo; podrobnosti ločijo enaka naslova po ID-ju. A08: podrobnosti ID-ja z ločili, navadno Unicode besedilo in veljaven prestopni datum. | `App`, `TaskBoard`, obstoječi `TaskDetails`/`taskUrl` |
| R08 | A02/A03: menjava projekta, vrnitev in osvežitev ohranijo množico, filter pa ponastavijo. A07: globalna množica ostane tudi pri nedostopni shrambi in navigaciji. | `App.useFavorites`, `ProjectView` s ključem projekta |
| R09 | A03: brisanje ob aktivnem filtru odstrani vse priljubljene trenutnega projekta; oba ID-ja drugega projekta in neznani ID ostanejo. A07/A08: onemogočen gumb brez priljubljenih oziroma v praznem projektu. | `ProjectView`: gumb, `useFavorites.remove` |
| R10 | A03/A04/A08: točno besedilo in dostopna oznaka števca za celoten projekt, tudi med filtrom in pri 0/0. A04: vsak stolpec šteje samo vidna opravila; zgornji pregled stanj ostane celoten. | `favoriteCount`, `tasks.length`, `TaskBoard.entries.length` |
| R11 | A05: zamenjava množice, vsi neveljavni vhodi, null in ignoriranje drugega ključa, brez zapisov nazaj. A06: dva dejanska zavihka uskladita dodajanje, odstranjevanje in `removeItem`. A07: izjema getItem, setItem in dostopnika localStorage; opozorilo ter nadaljnje filtriranje, preklopi in projektno brisanje v pomnilniku. | `synchronize`, `readFavorites`, `save`, opozorilo v `App` |
| R12 | Vseh 38 izhodiščnih testov; D04 ter A02/A04/A07/A08 spremljajo odsotnost API zapisov. A04 primerja celotno strežniško stanje pred/po. A08 in vizualne meritve potrdijo širino 390 px. | Celotna dopolnitev, posebej `styles.css` |

## Vizualni pregled

Uporabljen je bil `WEB_PORT=5193 API_PORT=3123 npm run dev`. Lokalna skripta
je prebrala `wsEndpoint` iz `task/browser.json`, uporabila
`chromium.connect(wsEndpoint)`, odprla lastni kontekst, označila `web-02`,
preklopila pogleda in zajela obe velikosti. Uporabljen ni bil `chromium.launch()`.
Posnetki so bili tudi dejansko vizualno pregledani:

- [Preglednica, namizni prikaz](table-desktop.png)
- [Tabla, namizni prikaz](board-desktop.png)
- [Preglednica, 390 px](table-mobile.png)
- [Tabla, 390 px](board-mobile.png)

[Meritve](visual-check.json): širina dokumenta je v obeh ozkih pogledih
390 px pri širini okna 390 px. Notranja širina preglednice je 747 px in table
864 px; drsenje ostane znotraj prikaza. Zabeleženih napak JavaScript ni bilo.

## Omejitve in nepreverjeni deli

- Nedostopni končni testi niso bili izvedeni. Preverjanja so tekla v
  nameščenem Chromiumu; drugih brskalnikov in bralnika zaslona nismo izvajali.
- Nedostopnost shrambe je preverjena z nadzorovano izjemo metod in dostopnika;
  dejanska zapolnitev diska oziroma kvote ni bila povzročena. Ob izpadu
  trajnost ni zagotovljena, zato vmesnik prikaže opozorilo in ohrani pomnilniško stanje.
- Preverjena je zaporedna uskladitev dveh zavihkov. Sočasno konfliktno
  pisanje iz več zavihkov nima dodatnega protokola združevanja; dogodki po
  zahtevi nadomestijo množico z novo vrednostjo.
- Obseg naloge ne širi sočasnih sprememb strežniških opravil in navigacije
  med nalaganjem prek skupnih regresijskih zahtev. Te regresije so uspešne.
- Ni znanih neizpolnjenih zahtev R01–R12 in nobenega okoljsko blokiranega
  preverjanja. Uporabljene so bile samo lokalne storitve in en agent.
