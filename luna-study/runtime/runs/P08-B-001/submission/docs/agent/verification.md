# Implementacija in preverjanje P08

## Obseg in izvedba

Prebrana so `PROJECT_RULES.md`, `task/instructions.md`,
`task/specification-template.md` in predana `docs/agent/specification.md`.
Izvirne zahteve R01–R12 ostajajo merodajne. Koda je spremenjena v `src/`,
lastni preverjanji sta v `tests/agent/deadlines.spec.ts`, ta dokument pa je
implementacijski zapis. Projektni API in prikazi opravil ostajajo vir podatkov.

`src/deadlines.ts` pretvori veljavni `YYYY-MM-DD` v UTC koledarski dan,
upošteva dolžino mesecev in prestopna leta ter razvrsti odprta opravila po
predikatu: `done` če je status `done`; sicer `overdue` če je `due < D`,
`today` če je `due = D`, `week` če je `D < due <= D + 7`, v ostalih primerih
`later`. Neveljaven datum vnosa vrne opozorilo; podatkovni roki so po
domenskih predpostavkah veljavni.

## Sledljivost zahtev

| Zahteva | Implementacija | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | `src/App.tsx`, začetni `useState('2026-09-21')`; projektni pogled ima `key={project.id}`. | D01 na namizju in mobilnem: začetni datum ter `overdue`; uspešno. |
| R02 | `src/deadlines.ts`, `deadlineGroup`: status `done` se preveri pred rokom. | D04 preveri opravljena opravila; `deadlines.spec.ts` preveri opravilo `done` s starim rokom; uspešno. |
| R03 | `deadlineGroup` primerja UTC koledarske dneve. | D01 preveri zamujene; lastni test preveri včeraj/danes; uspešno. |
| R04 | Meje `due < D`, `due = D`, `D < due <= D + 7`, nato `later`; ena zanka gradi razčlenjene skupine v vrstnem redu API. | D02 preveri vključujoči sedmi dan; lastni test preveri prestopni 29. februar, sedmi dan čez mejo meseca in osmi dan; uspešno. |
| R05 | `calendarDay` validira koledarski datum; UTC dan se izračuna brez lokalnih ur ali DST. | Lastni test uspešno razvrsti 29. februar 2024 in prehod februar–marec. Časovni pas ni posebej spreminjan, prehod leta ni posebej testiran. |
| R06 | `deadlineCounts` sešteje vse `tasks`, ne `visibleTasks`; vsaka od petih števil ima zahtevani `aria-label` in samo številsko besedilo. | Lastni test preveri vseh pet števil in prazen projekt; D02 preveri števec `week`; uspešno. |
| R07 | Kontrolirani `select` razvrsti prek `groupedTasks`; izbira ne spreminja podatkov in vrstni red znotraj skupine. | D01–D04 in lastni test preverijo `overdue`, `week`, `done`, `all`; uspešno. |
| R08 | Osnutek datuma in zadnji veljavni datum sta ločeni stanji; prazen/nesprejemljiv vnos pusti klasifikacijo pri miru. | D03 na namizju in mobilnem preveri opozorilo, ohranjen filter/vrstice in veljavno popravo; uspešno. |
| R09 | `visibleTasks` se poda tabeli ali `TaskBoard`; stanje datumskega polja in filtra ostane v `ProjectView` med spremembo pogleda. | D04 preveri filtrirano tablo; lastni test preveri prazno tablo in enak ID v filtrirani tabli/tabeli ter ohranitev kontrol; uspešno. |
| R10 | Stanje filtra/datuma ni v `navigation.ts`, URL-ju ali shrambi; `useState` se inicializira ob montaži projekta. | Lastni test preveri nespremenjen hash ob izbiri filtra, ponastavitev po osvežitvi in menjavi projekta; uspešno. |
| R11 | Pet števcev se izračuna tudi za prazen seznam; pri nepraznem projektu prazen filter pokaže predpisano besedilo, izbirnik in oba pogleda ostaneta na voljo. | Lastni test preveri prazno skupino, nadaljnjo izbiro druge skupine in projekt z nič opravili; uspešno. |
| R12 | Prikaz samo bere `/api/`; ohranjeni so `data-task-id`, pogledi, stolpci, obstoječa povezava po `id` ter `TaskDetails`. Tabela/tabla imata notranje drsenje; panel novih kontrol se zloži na ozkem zaslonu. | D04 preveri odsotnost zapisov in širino 390 px na obeh velikostih; osnovni testi preverijo bralne podrobnosti; uspešno. Podroben primerjava polj pred/po vsakem filtru ni dodana. |

## Rezultati zagonov

- `npm run check` — uspešno: lint, tipizacija in produkcijska gradnja;
  Playwright `48 passed` (API 14, osnovni namizni/mobilni 24,
  razvojni P08 namizni/mobilni 8, lastni 2).
- `npx playwright test --project=agent` po zadnji spremembi testa — `2 passed`.
- Med razvojem je prvi lastni robni scenarij pokazal, da se ob praznem filtru
  skrije tabla. Pogoj je popravljen: predpisano sporočilo se prikaže, tabla
  pa ohrani dostopno območje in prazne stolpce. Končni celotni zagon je po
  popravku uspešen.

## Omejitve in odstopanja

Specifikacija ne izpušča izvirne zahteve, ki bi zahtevala odstopanje; napake
specifikacije nisem našel. Končni skriti testi niso dostopni. Lastni scenariji
ne spreminjajo časovnega pasu brskalnika in ne pokrivajo prehoda leta; UTC
implementacija je zato preverjena prek kode in prestopnega/mesečnega scenarija,
ne prek vseh mogočih časovnih pasov. Okolje opozarja na npm nastavitev
`http-proxy` in kombinacijo `NO_COLOR`/`FORCE_COLOR`, vendar preverjanj ne
ovira. `git status` ni uspel, ker sistemski `xcrun` kaže na manjkajoča
Command Line Tools; stanje veje zato v tej fazi ni bilo potrjeno. Javni
internet in oddaljeni repozitoriji niso bili uporabljeni.
