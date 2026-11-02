# Skupina: Stanje pogleda v povezavi in zgodovina

## Problem in kontekst

P29 aplikacija prikazuje opravila Projekti v Folio vmesniku z dvema možnostma pogleda: Preglednica in Tabla. 
Upravne funkcije za branje podatkov so dostopne prek javnega API-ja `/api/`. 
Naloga uvaja kontrolo stanja in iskanja v povezavi (URL fragment), ki omogoča shranjevanje in obnovitev 
filtriranih rezultatov na brskalniku. Funkcionalnost ne spremeni podlage podatkov, le odzorne uporabe.

## Vhodi, dejanja in izidi

### URL struktura in parametri

```
#/projects/<projectId>?q=<query>&status=<status>&order=<order>
#/projects/<projectId>/?view=board&<params...>
#/projects/<projectId>/tasks/<taskId>
```

| Parameter | Tip | Možne vrednosti | Privzeta | Opozorilo |
|-----------|-----|-----------------|----------|-----------|
| q | string (trimmed) | obvezen podniz v title/description/assignee/id | prazen | NFD, odstrani diareze U+0300–U+036F, male črke |
| status | enum | all, todo, in_progress, done | all | Neveljavno zanemarjemo |
| order | enum | original, title-asc, title-desc | original | Neveljavno zanemarjemo |
| view | enum | table, board | table | obstoječa kontrola |

### Pričakovani oblike odgovora

- `GET /api/projects` → `{ id: string, name: string }[]`
- `GET /api/projects/<id>/tasks` → `{ id, projectId, title, description, status, assignee, dueDate }[]`
- `GET /api/tasks/<id>` → zgornji enoten objekt
- API za branje samo; `PATCH /api/tasks/<id>` ni uporabljan v tej fazi

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
|---------|-------------------------------|-------------------|
| R01 | Stanje pregleda: q prazen, status=, order= začetni. URL-ji se ob prvem dostopu uporabijo takoj brez pritiskavanja | Test pri zagonu na vsaki določeni URL-ovi poti; primer: `#/projects/web` ima prazen q, all, original |
| R02 | q: trim belin okoli, NFD normalizacija, odstranjevanje diarez (U+0300–U+036F), UTF-8 v male črke za primerjavo z title, description, assignee, id. Deluje kot podniz, ne razdeli besed. Vsaj en polje mora vsebovati iskalni niz | Test s slovenskimi/angleškimi imeni in naslovi; `q=Pregled vsebine` ujame dela naslovov; `q=π` ujame slovenski π |
| R03 | Filter q in status delujeta skupaj po IN; order primerja title z isto NFD, UTF-16 in sorazmernost ob izenačenju obdrži izvirni vrstni red; status filter znotraj projekta vpliva le na prikazane opravila | Primeri z enakimi naslovi v različnih statusih; preverjanje vrstnega reda in presenetljivega ujemanja |
| R04 | Neznana vrednost za status ali order privzame privzeto stanje iz mape. Ponovitev istega parametra se upošteva samo enkrat; neznane ključev ne vplivajo. Razčlenjevanje URL-ja ne dopušča avtomatskega prilagajanja | Določitev neveljavnih parametrov; testiranje predpon zgoraj, odsevanje neznanih parametov |
| R05 | Sprememba treh kontrol (q, status, order) brez pritisnjenega gumba ne spremeni prikaza ali URL-ja. Uporabi pogled zaključi osnutek in ustvari nov zgodovinski zapis ob spremembi potrjenega stanja | Klik na kontrol, preverjanje obdrženih vrednosti; klik gumba zanj doda kodo kodo koda |
| R06 | Pri potrditvi se q obreže, prazni parametri se izpustijo, preostali parametri pravilno kodirajo. view=board ohranja neznani se izvzame iz URL-ja. Ponovitev enakih parametov ne doda novega zgodovinskega stanja | Test s praznim q in praznimi status/order; ponovita enak potrditve preverita eno samo stopnjo v kodo |
| R07 | Nazaj in Naprej obnovita potrjena stanja filtrov in prikaza; osvežitev (reload) ohrani potrjeno stanje iz URL-ja; navigacija prek brskalnika upošteva URL | Brskalnik "Go Back/Forward" za vsako potrditvo; reload po vsakem potrjenem stanju |
| R08 | Preglednica/Tabla ohranita potrjene parametre in prikaza isti ID-je. Nepotrjen osnutek se zavrže ob navigaciji na druga stran | Sprememba pogleda s kontrolami; navigacija v tabelo in nazaj; preverjanje izgube nepotrjenih sprememb |
| R09 | Odpiranje zapravlja s podrobnosti in zaprtju z gumbom ali Escape ohranita filtre in pogled. Povezava do ID-ja prispeva pravilni pogled tudi pri enakoimenskih opravilih | Klik na podrobnosti, Escape/gumb, navigacija, preverjanje filtrov; vsota povezav z enakimi naslovi |
| R10 | Klik na drug projekt začne njegov privzeti pregled (q prazen, status=all, order=original), ohranja pogled table/board. Neposredna povezava z parametri obdrži parametre | Preskok med projekti; preverjanje privzetih vrednosti; test neposrednih povezav z parametri |
| R11 | Gumb Ponastavi pogled očisti filtre, osnutek in zgodovino enako kot potrditev, obdrži trenutni pogled. Ni zadetkov se prikaže "Ni zadetkov"; števec prikaže "Prikazano: N od M." | Klik guba; vsota filtra; preverjanje praznih parameterov; testiranje praznih rezultatov |
| R12 | Nobena dejanja ne spremeni podatkov ne pošlje API. Stanje ni v localStorage. Obstoječa neznana pot, nalaganje, podrobnosti in prilagodljivost Folio delujeta normalno | Preverjanje odsotnosti API za branje/zapisovanje; preverjanje localStorage; testiranje obstoječih funkcij |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Zacetno stanje: q="", status="all", order="original"; URL se uporabi takoj ob odprtju. | test | src/navigation.ts - useRoute() z privzetimi vrednostmi | Preverba hitrosti ob odprtju URL |
| R02 | q: trim, NFD, diareze odstranimo, male crke; subniz za title/description/assignee/id | test | src/useResource.ts - filter funkcija z normalizeQuery() | Preverba slovanskih/angleških imen |
| R03 | q in status po IN; order primerja NFD/UTF-16; enaki naslovi ohranjajo izvirni red | test | src/useResource.ts - filteredTasks obdelava | Primeri s titli, statusi, vrstni red |
| R04 | Neznani status/order -> privzeto; ponovitev parametra se upossteva enkrat; neznani parametri ignoriramo | test | src/navigation.ts - useRoute() ignorir a neznane kljuce | Neznani parametri ne vplivajo |
| R05 | Kontrola ne spremeni UI/URL pred pritisnjjenim gumbom; "Uporabi pogled" ustvari zgodovinski zapis | test | src/useResource.ts - onFilterChange() drzi draftState | Draft stanje se ne reflektira v UI |
| R06 | Potrditev: q obreze, prazni parametri odstranijo, view=board ohranja, enaka potrditev -> eno stanje | test | src/useResource.ts - applyView() URL-kodiranje | URL znotraj calasa potrjenih stanj |
| R07 | Go Back/Forward ohranita potrjena stanja; reload ohrani iz URL | test | src/navigation.ts - useSyncExternalStore s hashchange | URL vs. stanje |
| R08 | Toggle table/board ohrani parametr; nepotrjena sprememba se izbledi ob navigaciji | test | src/useResource.ts - filteredTasks obdelava | Zvrtenje nepokrpljenih stanj |
| R09 | Podrobnosti/Escape/zapri ohranita filter in view; povezava do ID z enakim naslovom | test | src/navigation.ts - useRoute() obdelava | ID vs. naslov povezava |
| R10 | Projekt klik -> privzet pregled (q="", all, original), view ohranja; neposredni link -> parametri se upossteajo | test | src/navigation.ts - projectUrl() z novimi privzetimi | Privzeti projekti |
| R11 | "Ponastavi pogled" ocisti filtre/draft/zgodovine; "Ni zadetkov" ob praznem rezultatu | test | src/useResource.ts - funkcija za resetiranje | Resetira UI z Prikazano: 0 od N |
| R12 | Nobena dejanja ne odprstvi podatkov, ne uporablja localStorage, ne uporablja API za zapis | test | src/api.ts - request() samo za GET | Brez PATCH za branje filters |

## Odprta vprašanja in omejitve

- **Testiranje**: V tej fazi niso napisani novi testi; implementer bo pripravljal `tests/agent/` teste za vsako zahtevo.
- **Data model**: Nalogi se ne spremeni obstoječi model opravilo (task), samo odzorni prikaz z filtriranjem.
- **Nalaganje podatkov**: Pri "Ni zadetkov" se prikaze "Prikazano: 0 od 0" (ni opravil v projektu ali filter ne ujame nič).
- **Povratna napaka**: Razčlenjevanje URL-ja `#/projects/` → { projectId: "web", taskId: null, view: table } obravnava prazno q.
- **Diareze**: NFD normalizacija z uporabo `Intl.Segmenter` ali `Intl.Normalizer` in odstranitev U+0300–U+036F.
- **Fusioniranje filter**: q in status uporabita `includes` operator za podniz in enakost za status.
- **URL kodiranje**: `encodeURIComponent()` za q, status, order in projectionId.
- **View parametra**: view=board ohranja status/order/q preko navigacije.
- **Prikaz rezultatov**: "Prikazano: N od M" prikaze število filtriranih opravil N in vseh opravil M v projektu.
- **Nepreverjeni scenariji**: Vse trijskosti kontrol hkrati z dolgimi iskanji; okrajšane URL-je brez query-stringa ob praznem q.
- **Izhodišče**: Števec "0 od M" kaže prazno iskanje v projektu z M opravili; "Prikazano: N od 0" (ni opravil v projektu).
