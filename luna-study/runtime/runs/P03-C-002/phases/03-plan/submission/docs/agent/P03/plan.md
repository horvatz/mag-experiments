# Načrt izvedbe: P03

## Tehnično izhodišče

Aplikacija je React 19 z TypeScriptom in Vite 8; odvisnosti so že nameščene. `ProjectView` v `src/App.tsx` pridobi opravila prek javnega `/api/projects/:id/tasks`, izriše preglednico in podaja opravila komponenti `TaskBoard`. Projektna komponenta ima `key={project.id}`, pogled pa ostane v obstoječi hash navigaciji (`src/navigation.ts`). Podrobnosti se berejo ločeno prek `/api/tasks/:id`. Skupni tipi določajo `Task`, `Project` in tri vrednosti `TaskStatus`.

Dodajanje odvisnosti, API-jev, sprememb strežnika, skupnih tipov ali nastavitev ni potrebno in ni del načrta.

## Odločitve zasnove

- Filtre hraniti lokalno v `ProjectView`: privzete vrednosti ob osvežitvi, samodejna ponastavitev ob menjavi projekta zaradi obstoječega ključa komponente in ohranitev vrednosti ob preklopu pogleda. Ne zapisovati filtrov v URL ali trajno shrambo.
- Iskanje izvajati s čistimi funkcijami v novem `src/taskFilters.ts`: normalizacija NFD, odstranitev U+0300–U+036F, male črke, razrez po belinah in dobesedno preverjanje vseh besed v poljih `id`, `title`, `description`, `assignee`. Sestaviti en predikat IN za iskanje, stanje in natančno ime osebe. Filtriranje z `Array.filter` ohrani izvorni vrstni red in podatke.
- Možnosti oseb izpeljati iz celotnega trenutnega projektnega seznama, ne iz rezultatov; vključiti `all` in vsako različno neprazno ime enkrat.
- `ProjectView` naj izračuna `F`, `N` in `M` ter iz `F` tudi pregled stanj. Ista `F` uporabiti za vrstico preglednice in `TaskBoard`; tabla po stanju razporedi le ustrezna opravila in temu prilagodi števce.
- Kontrole, status `Prikazano: N od M.` in skupno sporočilo `Ni zadetkov.` postaviti v obstoječi razdelek opravil, zunaj povezav posameznih opravil. Ločiti prazen projekt (`M = 0`, obstoječe prazno stanje) od projekta brez ujemanj (`M > 0`, `N = 0`); ohraniti uporabne stolpce table.
- Uporabiti obstoječe komponente in barvne/spacingske vzorce Folio; v `src/styles.css` dodati le sloge kontrol in prilagoditve, potrebne za 390 px brez širjenja strani. Ohraniti vidni fokus, dostopna imena in obstoječe ID atribute.
- Filtriranje ostane lokalna operacija prikaza: aplikacija bere prek obstoječega API-ja, vendar ob vnosu, izbiri, menjavi pogleda ali čiščenju ne pošlje zapisovalnih zahtev. Ne uporabljati `/__test/` iz uporabniškega vmesnika.

## Koraki in datoteke

1. Dodati tipizirane funkcije za normalizacijo, ujemanje besed, sestavljen predikat in dedupliciranje oseb v `src/taskFilters.ts`.
2. V `src/App.tsx` dodati kontrole in projektno stanje filtrov; izračunati rezultate in števce, obdržati ločeno velikost izvornega seznama ter pokriti obe vrsti praznega stanja.
3. V `src/TaskBoard.tsx` uporabiti posredovani filtrirani seznam; v `src/styles.css` oblikovati kontrolno vrstico in preveriti notranje drsenje ter širino 390 px. `src/TaskDetails.tsx` in `src/navigation.ts` ostaneta obstoječa integracijska robova za regresijsko preverjanje.
4. Dodati `tests/agent/P03.spec.ts` za R01–R12: testne projekte/opravila podati s Playwright `page.route` za GET `/api/` (tudi Unicode, podvojene naslove, prazen projekt in večji nabor); preveriti kontrole, ID-je obeh pogledov, štetje, resetiranje, prazna stanja, odsotnost zapisovalnih zahtev, navigacijo/podrobnosti in mobilno širino. Testna stran ne uporablja `/__test/` za nastavitev podatkov.
5. Izvesti preverjanje z obstoječima lint/build in skupnimi ter agentnimi testi. V `spec.md` dopolniti sledljivost z dejanskimi datotekami, imeni testov, izidi in določljivim dokazom; neozagnanih preverjanj ne označiti kot uspešnih.

## Meje

Izvedba spreminja le `src/`, `tests/agent/` in dokumentacijo v `docs/agent/`. Potrjeni Folio, slovenska poimenovanja, javni API, strežnik, skupni tipi in testna infrastruktura ostanejo v okviru obstoječih dogovorov.
