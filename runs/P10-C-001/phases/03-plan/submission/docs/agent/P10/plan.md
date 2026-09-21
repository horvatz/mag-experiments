# P10 — izvedbeni načrt

2026-09-22 · Temelji na [specifikaciji](spec.md), [ustavi](../../../.specify/memory/constitution.md) in [izvirnih zahtevah](../../../task/instructions.md). Ta korak določa izvedbo; kode in testov še ne spreminja.

## Tehnični kontekst

Obstoječi React 19.3 / TypeScript 6 / Vite 8 uporablja `lucide-react`, javni API in navigacijo prek hash povezav. Vse odvisnosti so nameščene. `App.tsx` izbira projekt in prek `useResource` nalaga opravila. `ProjectView` ima že `key={project.id}`. `TaskBoard.tsx` filtrira opravila v stalne stolpce, `TaskDetails.tsx` bere posamezno opravilo po ID-ju. `styles.css` vsebuje potrjeni Folio in notranje drsenje.

Playwright ima že projekte za API, izhodišče na računalniku/telefonu, razvojne teste na obeh velikostih in `tests/agent/**/*.spec.ts`. Obstoječa konfiguracija uporablja pripravljeni Chromium in sama zažene testni strežnik. Nastavitve, odvisnosti, API, skupni tipi in razvojni/skupni testi ostanejo nespremenjeni.

## Odločitve in podatkovni tok

1. **Eno stanje vrstnega reda.** Majhen čisti reducer v `src/taskOrder.ts` hrani `{ initial, order, undo, redo }` kot polja ID-jev in posnetke celotnih permutacij. Izvede pravila P1–P6 iz specifikacije. Veljavnost premika preveri pred ustvarjanjem zgodovine in čiščenjem ponovitev. Neveljavno dejanje vrne nespremenjeno stanje. Novo dejanje in redo omejita undo na zadnjih 20 posnetkov. Podatki opravil se ne spreminjajo.
2. **Stanje obstaja po nalaganju.** Iz odseka opravil v `App.tsx` izločimo manjšo komponento `ProjectTasks` v isti datoteki. Dobi že naloženo polje `tasks`, projekt in pogled, ter z `useReducer` in začetnim argumentom ustvari stanje iz prejetih ID-jev. Montira se samo, ko so podatki na voljo (tudi prazno polje). Ostane na istem mestu v drevesu ob spremembi pogleda/podrobnosti, zato zgodovino ohrani. Obstoječi ključ projekta in osvežitev povzročita novo začetno stanje. `useResource` in navigacija ne potrebujeta sprememb.
3. **Prikaz po ID-jih.** Iz `tasks` pripravimo preslikavo ID → nespremenjeno opravilo, iz `order` urejeno polje in globalna mesta. Preglednica uporablja urejeno polje; tabla prejme isto polje ter ga po obstoječem pravilu filtrira v stolpce. Premik vedno pošlje ID in smer reducerju, ne indeksa znotraj stolpca. Števci stanj še naprej izhajajo iz podatkov opravil, podrobnosti uporabljajo obstoječo povezavo po ID-ju.
4. **Skupne kontrole.** `ProjectTasks` prikazuje tri gumbe zgodovine in točen status s številoma dolžin skladov. Kontrole so prisotne tudi pri praznem projektu. Primerjava `order` in `initial` upošteva vsa mesta. Onemogočenost sledi stanju reducerja, ne ločenim števcem.
5. **Kontrole ob opravilu.** `src/TaskOrderControls.tsx` deli prikaz globalnega mesta ter gumba gor/dol med preglednico in tablo. Sprejme ID, globalno mesto, število opravil in callback. Na tabli je sorojenec povezave znotraj obstoječega `li[data-task-id]`; v preglednici je zunaj povezave znotraj vrstice. Uporabi točna dostopna imena iz specifikacije in majhne ikone iz obstoječe knjižnice.
6. **Folio.** Dodatni slogi za vrstico zgodovine in kompaktne kontrole uporabljajo obstoječe barve, robove in fokus. Skupna vrstica se na ozkem zaslonu prelomi. Tabla ohrani kartice in stalne stolpce, preglednica svoj notranji pomik. Ne spreminjamo širine menija, vizualne hierarhije ali infrastrukturnih datotek.

## Datoteke in pokritost

| Datoteka | Poseg | Zahteve |
| --- | --- | --- |
| `src/taskOrder.ts` | Novo lokalno stanje, inicializacija in reducer s preverjanjem robov ter omejitvijo zgodovine. | R01–R08, R11–R12 |
| `src/App.tsx` | `ProjectTasks`, povezava stanja s preglednico/tablo, skupne kontrole, števec, lokalna življenjska doba. | R01–R12 |
| `src/TaskOrderControls.tsx` | Skupni gumbi premika in globalno mesto, brez lastnega stanja. | R01–R03, R09, R11–R12 |
| `src/TaskBoard.tsx` | Uporaba globalnega vrstnega reda in kontrol zunaj povezave; stalni statusi ostanejo. | R01–R03, R09, R12 |
| `src/styles.css` | Samo dopolnilni slogi novih kontrol in odzivne vrstice. | R12 |
| `tests/agent/taskOrder.spec.ts` | Neposredni testi reducerja za robove, nespremenljivost in zgodovino. | R01–R08, R11–R12 |
| `tests/agent/P10.spec.ts` | Dodatni uporabniški scenariji S1–S6 prek javnega prikaza. | R01–R12 |
| `docs/agent/P10/spec.md` | Po izvedbi nadomestitev začasne sledljivosti s konkretnimi simboli/testi/izidi, zgodovina sprememb. | Vse zahteve |
| `docs/agent/P10/verification.md` in dnevniki | Dejanski ukazi, izidi, dokazila ter omejitve brez podvajanja specifikacije. | Vse zahteve |

## Preverjanje in vrstni red dela

Najprej izdelamo reducer, nato ga povežemo z obema pogledoma in kontrolami, dopolnimo slog, nato izvedemo preverjanja. Teste reducerja izvaja že nameščeni Playwright; novega testnega ogrodja ni.

- **Model:** neodvisno pričakovana zaporedja po več dejanjih; neznan ID in oba roba kot nespremenjeno stanje; ponovljen rob ob nepraznem redo; 21+ premikov, 20 razveljavitev in vse ponovitve; reset kot eno dejanje; onemogočen reset ohrani redo. Zamrznjeni vhodi pomagajo odkriti mutacije. Preverjamo vse permutacije, ne le dolžin skladov.
- **Vmesnik:** testni GET odzivi za poljubne ID-je, enake naslove, Unicode, drugačen začetni vrstni red in več kot deset opravil. Oba pogleda, premik med statusoma, globalna mesta, vsi gumbi/števci, nespremenjene podrobnosti in števci stanj. Opazovanje zahtev potrdi odsotnost zapisov. Testni pripomočki ostanejo izključno v testih.
- **Življenjska doba in robni podatki:** z nepraznima skladoma preklop pogleda in podrobnosti; nato menjava projekta, vrnitev in osvežitev. Posebej nič/eno opravilo, tudi oba prazna projekta.
- **Regresija in videz:** obstoječi razvojni D01–D04 ter skupni API/baseline testi; dodatni agentni preizkus pri širini 390 pik preveri celotno širino strani in notranje drsenje. Vizualni pregled obeh pogledov preveri ohranjen Folio, dostopnost kontrol in vidni fokus.

Za ciljno preverjanje uporabimo `npx playwright test --project=agent` in obstoječa razvojna projekta; celovito preverjanje je `npm run check` (lint, tipi/build, vsi konfigurirani testi). Zagonov, ki že pokrijejo iste spremembe, po uspehu ne ponavljamo brez razloga. Dejanske ukaze in izide sproti shranimo v dovoljeni dokumentacijski imenik. Nedostopnih končnih testov ne navajamo kot uspešnih.

## Meje in tveganja

Najpomembnejša tveganja so nenamerna ponastavitev ob navigaciji, premik po lokalnem sosedu stolpca in čiščenje redo pri neveljavnem dejanju; zgornja zasnova in namenski testi neposredno preverjajo vsa tri. Enaki naslovi ne sodelujejo pri identiteti, vrednosti ID-jev se ne predpostavljajo. Ne uvajamo trajnega stanja, zapisov na API, novih poti ali dodatnih zahtev za sočasne podatke.

Usklajenost z ustavo: vse predvidene spremembe so znotraj `src/`, `tests/agent/` in `docs/agent/`; infrastruktura in dizajn ostaneta. Ni potrebne nove odvisnosti ali dodatnega uporabniškega pojasnila. Ta načrt in njegovo preverjanje sta za zdaj neizvedena; naslednji korak razdeli delo v naloge.
