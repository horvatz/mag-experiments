# Plan: P08 — Koledarski pregled rokov

## Povzetek

Dodaj izračun skupin rokov in lokalni filter za trenutno izbrani projekt. Filtrirani nabor uporabljata obstoječa preglednica in tabla; podatki opravil ostanejo samo za branje. Sprejemni pogoji so v [spec.md](spec.md), ki ohranja vseh R01–R12.

## Tehnična osnova in omejitve

- React 19, TypeScript 6 in Vite 8; Node 24.11.1. Potrebni paketi in Playwright so že nameščeni. Ne dodajaj odvisnosti ali spreminjaj nastavitev.
- `App.tsx` nalaga projekte/opravila prek obstoječega `useResource` in `/api/`; tabela je trenutno v `App.tsx`, tabla v `TaskBoard.tsx`. Tipi `Task` in statusi so v `shared/types.ts` in ostanejo nespremenjeni.
- Uporabljaj samo `src/`, `tests/agent/` in `docs/agent/`. Strežnik, skupne teste, API, deljene tipe in konfiguracijo pusti nespremenjene. UI ne kliče `/__test/`, ne zapisuje opravil ter filtra ne shranjuje v URL ali trajno shrambo.
- Ohrani potrjeni Folio, slovenska imena, obstoječe poglede/stolpce, dostopna imena in fokus tipkovnice; pri 390 px stran ne sme dobiti vodoravnega preliva.

## Odločitve izvedbe

1. Novo čisto funkcijsko jedro v `src/deadlineGroups.ts`: klasifikacija, pet celotnih števcev in izbor filtriranih opravil. Datumsko razliko računaj kot koledarske dni iz `YYYY-MM-DD` z UTC koledarsko aritmetiko; ne uporabljaj lokalnega časa, poletnega časa ali dodatne knjižnice. Pravila klasifikacije in meje so natančno določeni v specifikaciji.
2. V `ProjectView` hrani lokalno zadnji veljavni datum, besedilo datumske kontrole in filter skupine. Začetni vrednosti sta `2026-09-21` in `all`; prazen vnos spremeni samo besedilo in opozorilo, preračun ostane vezan na zadnji veljavni datum. Veljaven vnos preračuna takoj in ohrani filter. Obstoječi `key={project.id}` ponastavi stanje ob menjavi projekta; osvežitev ga ponastavi z novim nalaganjem.
3. Ne spreminjaj `navigation.ts`: stanje ostane v komponenti, zato preklop table/board z obstoječim URL-jem ohrani datum, trenutno besedilo in filter, osvežitev pa ga izgubi.
4. Izračunani vidni seznam preda obema prikazoma. Preglednica ohranja vrstni red API-ja; tabla ohranja svoje stolpce po stanju in vrstni red opravil znotraj stolpca. Prazen projekt obdrži obstoječe prazno stanje in dobi pet ničel; prazna filtrirana skupina v nepraznem projektu pokaže predpisano sporočilo.
5. Kontrole, števci in opozorilo uporabijo natančne oznake, vrednosti ter `role=alert` iz specifikacije. Slogi uporabijo obstoječe spremenljivke in odzivne vzorce.

## Datoteke in zaporedje dela

| Datoteka | Delo | Zahteve |
| --- | --- | --- |
| `src/deadlineGroups.ts` (nova) | Čista razvrstitev opravil, koledarska aritmetika, števci in filter; nobenega API-klica ali stanja UI. | R02–R05, R07 |
| `src/App.tsx` | Lokalni datum/filter, kontrole, opozorilo, števci iz celotnega projekta, filtriranje pred obema prikazoma in prazna filtrirana skupina. Ohraniti obstoječe navigacijske kontrole in `data-task-id`. | R01, R06–R11 |
| `src/TaskBoard.tsx` | Uporabiti prejeti filtrirani seznam, ohraniti statusne stolpce, ID-je in relativni vrstni red v stolpcu; podpreti prazen filtrirani nabor. | R07, R09, R11 |
| `src/styles.css` | Oblikovati nove kontrole/števce v Folio slogu; preveriti prelom pri 390 px, notranje drsenje in vidni fokus. | R06, R08, R12 |
| `tests/agent/P08-deadlines.spec.ts` (nov) | Playwright scenariji z GET odgovori za poljubne nabore opravil; obstoječa konfiguracija že zajame `tests/agent/**/*.spec.ts`. Ne spreminjati konfiguracije ali skupnih testov. | R01–R12 |
| `docs/agent/P08/spec.md` | Po implementaciji dopolniti sledljivost z dejanskimi datotekami, scenariji in izidi; ne označiti neizvedenih preverjanj kot uspešnih. | R01–R12 |

Zaporedje: najprej koledarsko jedro, nato lokalno stanje in kontrole v `App.tsx`, zatem povezava obeh pogledov in slogov, nazadnje lastni testi ter dokumentiranje dokazov. Ne spreminjaj `src/api.ts`, `src/navigation.ts`, `src/TaskDetails.tsx`, `shared/`, `server/`, skupnih testov ali projektnih nastavitev.

## Preverjanje po implementaciji

- Lastni Playwright testi z nabori nič, eno in več kot deset opravil pokrijejo meje `d−1`, `d`, `d+1`, `d+7`, `d+8`, prestopni februar, prehod leta/meseca in različna časovna pasova; opravljeno opravilo z različnimi roki; števce in dostopna imena pred/po filtriranju; prazen projekt/skupino; prazen/veljaven vnos; enak nabor ID-jev ob preklopu pogledov; menjavo projekta/osvežitev; ozko širino 390 px in odsotnost zapisov.
- Skupni testi dodatno varujejo bralne podrobnosti, obstoječe dostopne poglede in osnovno vedenje aplikacije; preveri, da so polja opravila po uporabi pregleda nespremenjena.
- Uporabi obstoječi projekt `agent` in nato `npm run check` za skupne regresijske teste, lint in build. Testni API-ji so lahko uporabljeni samo iz testov za nadzor GET odgovorov; uporabniški vmesnik uporablja le `/api/`.
- Zapiši dejanska imena testov, ukaze in izide v sledljivost specifikacije. Ne trdi, da so bili v tej fazi načrta testi izvedeni.
