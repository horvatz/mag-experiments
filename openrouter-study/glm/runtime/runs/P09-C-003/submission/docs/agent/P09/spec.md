# P09: Stanje pogleda v povezavi in zgodovini

**Različica:** 1.0  
**Vir zahtev:** [`task/instructions.md`](../../../task/instructions.md)  
**Projektna načela:** [`.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)  
**Faza:** specifikacija; implementacija in testi še niso izvedeni.

## Problem in kontekst

Folio omogoča izbiro med projekti, preglednico in tablo opravil ter odpiranje podrobnosti opravila. Uporabnik želi stanje pregleda deliti, obnoviti po osvežitvi in uporabljati gumba Nazaj in Naprej brez izgube filtrov.

P09 doda parameter `q`, `status` in `order` v query del URL fragmenta obstoječih poti projekta ali opravila. Vmesnik dobi osnutek treh kontrol ter gumba `Uporabi pogled` in `Ponastavi pogled`. Podatki ostajajo na strežniku, dostopani samo prek javnega branja prek `/api/`; stanje pogleda ni v `localStorage` in ne povzroča zapisov.

Potrjeni dizajn Folio in slovenska poimenovanja obstoječega vmesnika se ohranita.

## Vhodi, dejanja in izidi

### Vhodni podatki

- URL fragment obstoječe poti: `#/projects/:projectId` ali `#/projects/:projectId/tasks/:taskId`.
- Query parametri: `q` (niz), `status` (`all`, `todo`, `in_progress`, `done`) in `order` (`original`, `title-asc`, `title-desc`).
- Obstoječi parameter `view=board` ohrani svoj sedanji pomen. Neznani parametri ne vplivajo na prikaz in se pri naslednji generirani povezavi odstranijo.
- Podatki iz API: projekt ima `id` in `name`; opravilo ima `id`, `projectId`, `title`, `description`, `assignee`, `status` in datum. Polja in tipi so enaki izhodišču.

### Dejanja

- Urejanje `Iskanje v povezavi`, `Stanje v povezavi` in `Vrstni red v povezavi` kot osnutka.
- Potrditev treh vrednosti z gumbom `Uporabi pogled` ali ponastavitev na privzete vrednosti z gumbom `Ponastavi pogled`.
- Neposredno odprtje povezave, navigacija Nazaj/Naprej, osvežitev, preklop Preglednica/Tabla, menjava projekta, odpiranje in zapiranje podrobnosti.

### Izidi

- Uspeh: prikaz, URL, potrjeno stanje in osnutek kontrol so usklajeni; rezultat vsebuje samo naloge, ki zadostijo iskanju in statusu, v izbranem vrstnem redu; števec kaže `Prikazano: N od M.`.
- Osnutek: sprememba kontrole spremeni samo osnutek; prikaz in URL se ne spremenita, dokler uporabnik ne potrdi.
- Preklic ali navigacija: nepotrjen osnutek se zavrže in nadomesti stanje iz ciljnega URL.
- Napaka API: obstoječe prikazi nalaganja, napake in ponovnega poskusa ostanejo nespremenjeni; stanje URL ne povzroči zapisov.

## Pravila sprememb stanja

- Za query parameter `k` velja `first(U,k)`: prva pojavitev v URL, če obstaja; sicer privzeta vrednost. Neznana vrednost `status` ali `order` pomeni privzeto vrednost.
- Potrjeno stanje je `C = (q, status, order)` iz URL po razčlenitvi; osnutek kontrol je `D`. Prikaz in URL uporabljata `C`, vnosilna polja pa `D`.
- Ob odprtju, osvežitvi, Nazaj/Naprej in vsaki navigaciji se `C` postavi iz URL, nato pa `D := C`. Sprememba kontrole spremeni samo `D`.
- `normalize(q)` pomeni: odstrani zunanje beline, razstavi v NFD, odstrani znake U+0300 až U+036F in pretvori v male črke.
- Naloga `t` je prikazana, če je `normalize(q)` podniz vsaj enega izmed `normalize(t.title)`, `normalize(t.description)`, `normalize(t.assignee)` in `normalize(t.id)` ter status ustreza `status` po IN.
- `original` ohrani zaporedje iz API. `title-asc` in `title-desc` urejata po `normalize(title)` in primerjavi UTF-16; ob izenačenju ostane izvorno zaporedje.
- Pri potrditvi ali ponastavitvi se `q` obreže, privzeti parametri izpustijo, preostali parametri URL-kodirajo, `view=board` in pot projekta ali opravila pa ohranijo. Novo zgodovinsko stanje se ustvari samo, če se novo potrjeno stanje razlikuje od prejšnjega.
- Filtriranje in urejanje sta odvisna samo od podatkov trenutnega projekta in potrjenega stanja; ne spreminjata podatkov, poti projektov ali ID-jev opravil.

## Zahteve in sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za pot projekta ali opravila se `q`, `status` in `order` preberejo iz query dela URL fragmenta. Privzete vrednosti so prazen `q`, `status=all` in `order=original`; neposredna povezava se uporabi brez dodatnega klika. | Odprti URL-ji z vsakim parametrom in vsemi tremi ter brez parametrov; preveri se prikaz, kontrole in števec. |
| R02 | `q` je ena dobesedna fraza po `normalize(q)` in se iskan po `title`, `description`, `assignee` in `id` kot podniz. Ni regularni izraz in se ne deli v besede. | Testi z presledki, Unicode, ločili, izrazom z metaznaki, delnim ID/em in več besedami brez zaporedja. |
| R03 | `status` sprejme `all`, `todo`, `in_progress`, `done` in se združuje z iskanjem po IN. `order` sprejme `original`, `title-asc`, `title-desc`; naslovi se uredijo po isti normalizaciji in UTF-16, ob izenačenju pa ostane izvorno zaporedje. | Testi vseh statusov in vrstnih redov, kombinacija `q` plus status, Unicode, enaki naslovi in stabilna izenačenja. |
| R04 | Neznana `status` ali `order` vrneta privzeto vrednost; pri ponovljenem parametru velja prva pojavitev; neznani parametri ne vplivajo na prikaz; razčlenjevanje samodejno ne prepiše URL. | Testni URL-ji z neznanimi, ponovljenimi, neznanimi in mešanimi parametri; preveri se stanje prikaza in nespremenjen naslov takoj po odprtju. |
| R05 | Sprememba katerekoli od treh kontrol spremeni samo osnutek. Gumb `Uporabi pogled` potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje le, če se potrjeno stanje spremeni. | Vnos treh sprememb brez potrditve, ena ali dve potrditvi ter potrditev neveljavnih URL vrednosti; štejejo se vnosi kontrole in zgodovinska stanja. |
| R06 | Potrjena povezava vsebuje obrezan `q`, izpusti privzete parametre, URL-kodira preostale vrednosti, ohrani obstoječi `view=board`, odstrani neznane parametre in ne doda novega zgodovinskega stanja pri enaki potrditvi. | Testi s presledki, rezerviranimi znaki, privzetimi vrednostmi, `view=board`, neznanimi parametri in ponovljeno potrditvijo. |
| R07 | Nazaj in Naprej obnovita potrjene filtre, prikaz in osnutek kontrol; osvežitev ohrani stanje iz URL. | Zaporedje dveh potrditev, navigacija Nazaj/Naprej in ponovni nalaganje strani; preverijo se URL, prikaz in vrednosti kontrol. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je; nepotrjen osnutek se zavrže ob vsaki navigaciji. | Sprememba osnutka, preklop obeh pogledov, preverba parametrov, ID-jev in vrednosti kontrol. |
| R09 | Odpiranje podrobnosti ter zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda; izbira temelji na ID-ju in deluje tudi pri enakih naslovih. | Testi s podatki z enakimi naslovi v obeh pogledih; preverita se URL podrobnosti in URL po zaprtju. |
| R10 | Klik na drugi projekt začne njegov privzeti pregled in ohrani `view=board`; neposredna povezava do drugega projekta s parametri pa jih upošteva. | Klik po potrjenem filtru, neposreden URL drugega projekta s parametri in preklop pogleda; preverijo se URL, prikaz in kontrole. |
| R11 | Gumb `Ponastavi pogled` počisti tri filtre in osnutek, posodobi zgodovino po enakem pravilu kot potrditev in ohrani trenutni način pogleda. Prazen rezultat kaže `Ni zadetkov.`; števec ima `role=status`, `aria-label="Rezultati povezave"` in besedilo `Prikazano: N od M.`. | Test ponastavitve po filtru in po nepotrjeni spremembi; testi za nič zadetkov, enega, več in vseh zadetkov ter dostopno ime števca. |
| R12 | Nobeno dejanje ne spremeni podatkov ali ne pošlje zapisov na API; stanje ni v `localStorage`. Ohranijo se neznana pot, nalaganje, podrobnosti, dostopnost in prilagodljiv videz Folio. | Testi omrežnih zahtev (samo GET), primerjalnica podatkov, nedostopnost `localStorage`, obstoječi regresijski scenariji in pregled dostopnosti ter ozkega zaslona. |

## Uporabniški scenariji

1. Uporabnik odpre deljeno povezavo s statusom, iskanim nizom in vrstnim redom; vmesnik takoj prikaže iste ID-je in vrednosti v kontrolah.
2. Uporabnik vpiše frazo, spremeni status in vrstni red, vendar še ne potrdi; prikaz in URL se ne spremenita. Po potrditvi se spremeni enkrat, po drugi enaki potrditvi pa se zgodovina ne podvoji.
3. Uporabnik potrdi dve različni stanji, uporabi Nazaj in Naprej; vsak pogled, URL in osnutek kontrol se obnovita.
4. Uporabnik preklopi pregled, odpre podrobnost opravila z enakim naslovom kot drugo opravilo in jo zapne; filtri in način pogleda se ohranijo, podatki pa se ne spremenijo.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Predvideni vir | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Razčlenjevanje, normalizacija, filtriranje in urejanje | `tests/development/P09.spec.ts` D01 ter ad-hoc preverjanji 1–2 | `src/navigation.ts`, `src/App.tsx` | Uspesno: D01 desktop/mobile in ad-hoc 1–2; glej `verification.md`. |
| R05–R07 | Osnutek, potrditev, kanonični URL in zgodovina | `tests/development/P09.spec.ts` D02–D04 ter ad-hoc preverjanji 3–4 | `src/App.tsx`, `src/navigation.ts` | Uspesno: D02–D04 desktop/mobile in ad-hoc 3–4; glej `verification.md`. |
| R08–R10 | Ohranjanje stanja pri navigaciji projekta, pogleda in podrobnosti | `tests/development/P09.spec.ts` D03 ter ad-hoc preverjanji 5–7 | `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` | Uspesno: D03 desktop/mobile in ad-hoc 5–7; glej `verification.md`. |
| R11 | Prazno stanje in dostopni števec | `tests/development/P09.spec.ts` D04 ter ad-hoc preverjanje 8 | `src/App.tsx`, `src/styles.css` | Uspesno: D04 desktop/mobile in ad-hoc 8; glej `verification.md`. |
| R12 | Nedestruktivnost, obstoječe stanje in prilagodljivost | `tests/baseline.spec.ts` (brez zapisov in ozka postavitev), D04 ter ad-hoc preverjanje 8 | `src/`, `tests/baseline.spec.ts` | Uspesno: celoten `npm run check` 46/46; glej `verification.md`. |

Rezultati so zapisani po dejanskih izvedbah. Skriti končni testi niso na voljo in niso navesti kot izvedeni.

## Uspešna merila

- Vsi R01–R12 so pokriti z sprejemnimi pogoji in načrtovanim preverjanjem.
- Prikaz upošteva URL ob neposrednem odprtju in po zgodovinski navigaciji.
- Osnutek je ločen od potrjenega stanja in se ob navigaciji zavrže.
- Generirane povezave so kanonične, URL-kodirane in ohranijo način pogleda.
- Podatki se izključno berejo prek javnega API in se ne spreminjajo.
- Folio ostane dostopen, pregleden in prilagodljiv na širini 390 pik.

## Odprta vprašanja in omejitve

- Odprtih vprašanj ni; vsa pravila izhajajo iz `task/instructions.md`.
- Navigacija med nezaključenim nalaganjem ter novih sočasnih sprememb podatkov brez osvežitve sta po navodilih izven obstoječih regresijskih zahtev in nista del P09.
- Javni internet, skriti končni testi in druge reference niso na voljo; specifikacija ne sme navajati njihovih rezultatov.
- `tests/agent/` v tem izvajalnem okolju ni zapisljiv (sandbox), zato dodatni lastni test ni dodan v izvorno drevo. Za polno pokritje je bila izvedena začasna ad-hoc Playwright zbirka (8/8 uspešno) v `.tmp`, nato pa odstranjena; trajno dodani testi ostajajo v `tests/development/P09.spec.ts`.
