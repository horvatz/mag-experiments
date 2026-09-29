# Implementacija in preverjanje: koledarski pregled rokov

## Izvedba

`src/App.tsx` doda projektno lokalni začetni datum `2026-09-21`, izbirnik skupin, ločen vnosni niz in zadnji veljavni datum. ISO datumi se validirajo po gregorijanskih pravilih in primerjajo kot koledarski nizi; sedem dni se prišteje z aritmetiko mesecev/leap years brez lokalnega časa. Vseh pet skupin nastane iz vseh opravil projekta, vidni seznam pa ostane v izvornem vrstnem redu. Isti seznam gre v `TaskBoard` ali preglednico. Zapisovalni API ni dodan.

`src/styles.css` ohranja obstoječe Folio barve, tipografijo in notranje drsenje ter doda odzivne kontrole/števce, ki pri 390 px ne razširijo strani. `tests/agent/P08.spec.ts` pokriva razrede rokov, prestopni februar in prehod leta, vse izbire, ohranitev stanja, prazno skupino/projekt, osvežitev, URL/shrambo, zapisovalne klice in mobilno širino.

## Sledljivost zahtev

| Zahteva | Pogoj in povezava s kodo | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | `ProjectView` inicializira `referenceDate` na `2026-09-21` in `deadlineView` na `all`. | D01 ter agentni test ponastavitve ob osvežitvi; uspešno v zadnjem `npm run check`. |
| R02 | `groupForTask` najprej razvrsti `status === 'done'` v `done`, ne glede na `dueDate`. | Agentni test s končanima opraviloma pred in po referenčnem datumu; `done=2`, brez odprtih skupin; uspešno. |
| R03 | Za odprta opravila primerjava ISO nizov loči `< referenceDate` in `=== referenceDate`. | D01 ter agentna izbira `overdue`/`today`; uspešno. |
| R04 | `week` pokriva `D < due <= D+7`, `later` pa `due > D+7`; klasifikator vrne natanko eno skupino. | D02 ter agentni robovi D+1, D+7, D+8; uspešno. |
| R05 | `isCalendarDate`, `daysInMonth`, `addCalendarDays` uporabljajo veljavne gregorijanske koledarske komponente, ne časovnega pasu. | Agentna scenarija prestopnega februarja (2024-02-24 + 7) in prehoda 2024/2025; uspešno. Polni razpon vseh možnih let ni izčrpno enumeriran. |
| R06 | `deadlineBuckets` se izračuna iz celotnega `tasks`, ločeno od `visibleTasks`. | Agentni test preveri pet števcev in jih znova preveri ob vsakem aktivnem skupinskem filtru; uspešno. |
| R07 | Select filtrira vse skupine in `all`; filtrirani elementi izvirajo iz skupin, ki ohranijo zaporedje nalog. | Agentni test izbere vseh pet skupin in `week`/`all`; D01–D04 pokrijejo dodatne poti; uspešno. |
| R08 | `referenceDateText` se posodobi takoj; samo veljaven datum posodobi preračun, prazen vnos pokaže alert in obdrži prejšnji datum. | D03 ter agentni test praznega in nato veljavnega vnosa; alert se odstrani, filter ostane; uspešno. |
| R09 | Datum, besedilo in skupina so React stanje v `ProjectView`, katerega ključ ostane isti med menjavo pogleda. | D04 in agentni test preverita preklop tabla/preglednica z ohranjenim datumom in `week`; uspešno. Agentni URL pregled potrdi, da je v hash zapisan samo pogled. |
| R10 | `ProjectView key={project.id}` ponastavi lokalno stanje ob projektu; osvežitev znova inicializira stanje; URL/shramba ne hranita filtrov. | Agentni test menja projekt in osveži; začetne vrednosti se vrnejo. Test preveri URL in prazno `localStorage`; uspešno. |
| R11 | Pet števcev deluje tudi za `tasks=[]`; pri nepraznem projektu in prazni skupini se pokaže predpisano sporočilo, kontrole ostanejo dosegljive. | Agentni test preveri `0` za vseh pet skupin in obnovitev prek `all`; uspešno. Osnovni prazni pogled še vedno prestane baseline. |
| R12 | Uporabi se obstoječi `/api/projects/{id}/tasks`; prikazni podatki in podrobnosti ostanejo nespremenjeni. | D04 in agentna `readonly` preverba: brez API zapisov; baseline ohrani vrstice, kartice in podrobnosti. Agentni test pri 390 px preveri `scrollWidth <= innerWidth`; uspešno. |

## Izvedeni pregledi

- `npm run check` — uspešno: lint, TypeScript, produkcijska gradnja in vseh 50 testov (14 API, 24 baseline, 8 razvojnih P08, 4 lastni), 0 napak. Končni zagon po zadnjih spremembah testa je bil zaključen pred predajo.
- `npx playwright test --project=development-desktop --project=development-mobile` — 8/8 uspešnih (D01–D04 v obeh konfiguracijah).
- Končnih skritih testov te naloge ni bilo mogoče zagnati; uspeh dosegljivih testov ni dokaz njihovega izida.

## Omejitve in odstopanja

- Napake specifikacije, ki bi bile v nasprotju z izvirnimi zahtevami, nisem našel. Predana specifikacija sama opozarja, da so D01–D04 delni; implementacija in lastni testi so zato dodali manjkajoče mejne in življenjske scenarije.
- `git status --short` ni deloval: okolje je javilo `xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), missing xcrun ...`. Vsebina delovne kopije zato ni bila preverljiva prek Git CLI.
- npm je izpisal opozorilo za neznano konfiguracijo `http-proxy`; testi so vseeno končali z izhodno kodo 0. Razvojni in produkcijski strežnik sta bila dostopna.
