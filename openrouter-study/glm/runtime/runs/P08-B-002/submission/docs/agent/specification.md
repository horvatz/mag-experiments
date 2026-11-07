# Razvojna specifikacija: koledarski pregled rokov

Verzija: 1.0 — specifikacija za implementerja.

## Problem in kontekst

Uporabnik Folia potrebuje zanesljiv pregled rokov v izbranem projektu. Izhodišče v `src/App.tsx` pridobi opravila izbranega projekta prek `/api/projects/{projectId}/tasks`, jih prikaže v preglednici in statusnih stolpcih v `src/TaskBoard.tsx`, podrobnosti pa odpre prek obstoječih povezav. Nova funkcija doda referenčni datum, pet števcev in filter skupin rokov, pri čemer ohrani obstoječe poglede, statusna imena, stolpce, kartice, bralno podrobnost in potrjeni Folio videz.

## Vhodi, dejanja in izidi

- Podatki: tipi iz `shared/types.ts` ostanejo nespremenjeni. Opravila imajo polja `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; projekti imata `id` in `name`. Vsi datumi testne domene so veljavni koledarski `YYYY-MM-DD`.
- Testni obseg: lahko je 0, 1 ali več kot 10 opravil; ID-ji so enkratni znotraj projekta; naslovi so lahko enaki, zaporedje poljubno, besedilo je navadno besedilo z Unicode znaki in ločili; odgovorne osebe so neprazne in različne od rezervirane vrednosti `all`; vsako opravilo pripada svojemu projektu; oba projekta sta lahko prazna.
- Vnos: `input type="date"` z dostopnim imenom `Referenčni datum`; začetna vrednost je `2026-09-21`, neodvisna od naprave in ure.
- Izbira: HTML `select` z dostopnim imenom `Pogled rokov` in možnostmi `all`, `overdue`, `today`, `week`, `later`, `done`; začetna vrednost je `all`.
- Izid: pet števcev, filtrirani ID-ji v preglednici in tabli ter odprta podrobnost ostanejo skladni z referenčnim datumom, statusom in filtrom.
- Napaka: prazen vnos referenčnega datuma sproži `role="alert"` z natančnim besedilom `Vnesi veljaven referenčni datum.` ter ohrani zadnji veljaven izračun.

### Domena stanja

- `DeadlineView = "all" | "overdue" | "today" | "week" | "later" | "done"`.
- `group(task, referenceDate)` vrne enega od ključev `overdue`, `today`, `week`, `later`, `done`.
- Referenčni datum je nadzorovana vrednost UI in ne izhaja iz `Date.now()`, sistemskega časovnega pasu ali ure naprave.
- Vidni seznam za `all` je celoten trenutni projekt; za drug pogled je `tasks.filter(task => group(task, referenceDate) === view)`.
- Preglednica ohrani globalni izvorni vrstni red. Tabla ohrani obstoječe tri statusne stolpce; filtriran seznam razdeli v te stolpce, znotraj vsakega stolpca pa ohrani relativni izvorni vrstni red.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak začetni projekt in po osvežitvi velja `referenceDate = "2026-09-21"` in `deadlineView = "all"`, neodvisno od sistemske ure. | UI E2E test odpre več projektov in preveri vrednosti obeh kontrol. |
| R02 | `done(task) ⇔ task.status = "done"`; končana opravila se štejejo samo v skupini `done`, tudi kadar je rok pred ali po referenčnem datumu. | Test s končanimi opravili pred, na in po referenčnem datumu. |
| R03 | Za odprto opravilo (`todo` ali `in_progress`) velja `overdue ⇔ dueDate < referenceDate` in `today ⇔ dueDate = referenceDate`. | Testi z dnevi pred in na referenčnem datumu. |
| R04 | Za odprto opravilo velja `week ⇔ plusDays(referenceDate, 1) ≤ dueDate ≤ plusDays(referenceDate, 7)` in `later ⇔ dueDate > plusDays(referenceDate, 7)`; skupine so paroma disjunktne in pokrivajo vsa opravila. | Testi čez konec meseca, konec leta in prestopni februar. |
| R05 | Primerjava veljavnih `YYYY-MM-DD` je koledarska in ne odvisna od lokalnega pasu ali DST. `plusDays` je čista koledarska operacija, pri kateri so `2026-09-21 → 2026-09-28`, `2026-02-28 → 2026-03-01`, `2028-02-28 → 2028-02-29` in `2028-02-29 → 2028-03-01`. | Test čiste pomožne funkcije ali UI test čez navedene meje; logika ne sme uporabiti lokalnega `new Date()` brez UTC. |
| R06 | Števci prikazujejo `|{task ∈ currentProject : group(task, referenceDate) = key}|` za `overdue`, `today`, `week`, `later`, `done`; aktivni filter jih ne spreminja. | UI test primerja vrednosti pred in po zamenjavi filtra. |
| R07 | `all` in vsaka skupina vrneta samo pričakovana opravila; tabela ohrani izvorni vrstni red, tabla pa relativni vrstni red znotraj obstoječih statusnih stolpcev. Izbor ne spreminja datumov ali statusov. | UI test preveri ID-je v obeh pogledih, vrstni red in nespremenjene vrednosti po filtriranju. |
| R08 | Veljaven nov datum takoj preračuna skupine in vidne vrstice, pri čemer ostane aktivni filter. Prazen vnos ohrani zadnji veljaven izračun, prikaže opozorilo in ga ob novem veljavnem vnosu odstrani. | UI test z menjavo datuma, praznim vnosom in ponovno veljavnim vnosom. |
| R09 | Preglednica in tabla prikazujeta isti množici ID-jev; preklop ohrani referenčni datum, vnosno besedilo in izbrano skupino. | UI test preklopi pogled s filtrom in spremenjenim vnosom. |
| R10 | Menjava projekta ali osvežitev ponastavita referenčni datum in pogled rokov na začetni vrednosti; noben podatek o novem filtru se ne hrani v `localStorage`, `sessionStorage` ali URL-ju. Obstoječi parameter `view=board` za preklop preglednice/table ostaja dovoljen. | UI test preveri menjavo projekta, `location.reload()`, URL in trajni shrambi. |
| R11 | Prazen projekt ima vseh pet števil enakih `0` in obdrži obstoječe sporočilo o praznem projektu. Prazna izbrana skupina v nepraznem projektu prikaže natančno besedilo `Ni opravil v izbrani skupini.` ter omogoča preklop na drugo skupino ali `all`. | UI testi za prazen projekt in prazno skupino. |
| R12 | UI bere samo javni `/api/`, ne uporablja testnih kontrol `/__test/`, ne pošilja zapisov in ne spreminja obstoječih polj ali bralne podrobnosti. Obstoječi `data-task-id`, imena pogledov/stolpcev, `aria-label="Pregled stanj opravil"` in odsotnost razširjanja strani na 390 px ostanejo. | Strožni pregled kode, skupni testi, lastni UI testi in širinski test. |

### Pogodba vmesnika

- Datum ima dostopno ime `Referenčni datum` in je `input type="date"`.
- Izbirnik ima dostopno ime `Pogled rokov`, je HTML `select` in vsebuje natanko vrednosti `all`, `overdue`, `today`, `week`, `later`, `done`.
- Vidna imena skupin so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`.
- Vsak od petih števcev ima natanko `aria-label="Število rokov <key>"` (npr. `Število rokov overdue`) in vsebino samo številke, brez enot.
- Opozorilo za prazen datum je element z `role="alert"` in natančnim besedilom `Vnesi veljaven referenčni datum.`.
- Vsaka vidna vrstica in kartica ohranita `data-task-id`. Morebitna nova dejanja morajo biti izven povezave opravila; ta naloga ne zahteva novih dejanj.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01, R05, R06, R08, R10, R12 | Začetni in ponastavljeni datum, koledarske meje, števci, prazen osnutek, osvežitev in regresija. | Lastni UI test v `tests/agent/`. | Stanje in kontrole v `src/App.tsx`; čista pomožna funkcija v `src/`. | Ni izvedeno; rezultat bo zabeležil implementer. |
| R02, R03, R04, R07, R11 | Meje koledarskih dni, done neodvisno od roka, vse skupine, prazen projekt in prazna skupina. | Lastni UI test v `tests/agent/` z nadzorovanimi GET odgovori. | `src/App.tsx`, `src/TaskBoard.tsx` in pomožna funkcija za skupine. | Ni izvedeno; rezultat bo zabeležil implementer. |
| R09 | Preklop preglednica/table ob aktivnem filtru in veljavnem referenčnem datumu. | Lastni UI test v `tests/agent/`. | `src/App.tsx` in obstoječa navigacija v `src/navigation.ts`. | Ni izvedeno; rezultat bo zabeležil implementer. |
| R12 | Skupni testi, odzivnost 390 px, bralna podrobnost, `data-task-id`, brez API zapisov in brez `/__test/` v UI. | `npm test`, lastni UI test in pregled kode. | `src/`, `tests/agent/`; API ostaja v `src/api.ts`. | Ni izvedeno; rezultat bo zabeležil implementer. |

### Predlagani testni scenariji

1. **Začetno stanje in projekti:** odprej oba projekta; preveri `2026-09-21`, `all`, pet števcev in prvotni seznam.
2. **Koledarske meje:** z referenčnim datumom `2026-02-28` preveri `2026-02-27`, `2026-02-28`, `2026-02-29`, `2026-03-01` in poznejši datum; ponovi mejo leta ter dodaj končana opravila pred, na in po datumu.
3. **Števci in filtri:** preveri vseh pet števil, izmenjaj vse poglede ter primerjaj ID-je in vrstni red.
4. **Prazen osnutek:** izberi `overdue`, izprazni datum, preveri opozorilo in zadnji veljaven izračun, nato vpiši veljaven datum in preveri takojšnjo ponovno klasifikacijo.
5. **Pogleda:** pri enem datumu in eni skupini preklopi med preglednico in tablo ter preveri enake ID-je, ohranjeni vnos in izbor.
6. **Ponastavitev in trajnost:** spremeni datum in skupino, osveži stran, zamenjaj projekt in preveri začetni vrednosti ter odsotnost novih URL/Storage podatkov.
7. **Prazni stanji:** preveri pet ničel za prazen projekt in natančno sporočilo za prazno skupino nepraznega projekta; preklopi nazaj na `all`.
8. **Regresija:** zaženi skupni test in lastni test; preveri, da UI ne izvede zapisov na `/api/`, ne dostopa do `/__test/`, da so `data-task-id` ohranjeni in da `document.documentElement.scrollWidth <= 390` pri nastavitvi širine 390 px.

## Odprta vprašanja in omejitve

- Specifikacija predpostavlja, da testni pripomočki vračajo samo podatke v tipih iz `shared/types.ts`, da so ID-ji enkratni znotraj projekta, da je vsako opravilo v svojem projektu in da so datumi veljavni.
- Ohranitev statusnih stolpcev table je predpostavka obstoječega dizajna; novi filter deluje pred razdelitvijo v stolpce.
- Za prazen datum je sprejemni pogoj opredeljen za prazno polje, ki ga obravnava `input type="date"`; testiranje poljubnih nedokončanih vnosov brskalnika ni del P08.
- Agent-specifikacija ne zaganja aplikacije, testov ali vizualnega pregleda; to sta nalogi implementerja in preglednika.
- Nezaključeno nalaganje in sočasne spremembe podatkov brez osvežitve nista del zahteve.
