# P10: izvedbeni načrt

Podrobni sprejemni pogoji, pravila sprememb stanja in omejitve so v [spec.md](spec.md). Ta načrt določa tehnično izvedbo znotraj dovoljenega obsega.

## Tehnični kontekst

- Aplikacija uporablja React 19, TypeScript 6, Vite 8 in obstoječe odvisnosti; novih odvisnosti ne dodajaj.
- `ProjectView` v `src/App.tsx` naloži opravila prek `useResource` in izračuna števce. Preglednica prikaže seznam, `TaskBoard` v `src/TaskBoard.tsx` pa seznam stabilno filtrira v tri stolpce stanj.
- Pot opravila/pogleda je v hash-u. `ProjectView` je vezan na ključ projekta (`key={project.id}`), zato menjava projekta ustvari novo lokalno stanje, odpiranje podrobnosti ali menjava pogleda pa ohrani komponento.
- Playwright že vključuje projekt `agent`, ki zbira `tests/agent/**/*.spec.ts`. Primeri P10 v `tests/development/` in njihovi pripomočki so za branje; skupnih testov in konfiguracije ne spreminjaj.

## Odločitve zasnove

1. Vrstni red vodi z ID-ji, ločeno od nespremenjenih objektov `Task`. Novo čisto pomožno jedro v `src/taskOrder.ts` vsebuje tip stanja in prehode `load`, `move`, `undo`, `redo` ter `reset`. Hrani izvorno in trenutno permutacijo ter obe zgodovini; omejitev 20 in robna dejanja uveljavi v prehodih, ne v predstavitvenih komponentah.
2. `ProjectView` je lastnik stanja za trenutni projekt. Ko je odgovor opravil naložen, stanje inicializira iz njihovega prejetega zaporedja. Za tabelo in tablo iz trenutnih ID-jev sestavi urejene reference na iste objekte `Task`; ne razvršča ali mutira API-jevega seznama. Menjava pogleda in odpiranje/zapiranje podrobnosti ne ponastavita stanja. Nova instanca projekta in osvežitev ga začneta iz novo prejetega seznama.
3. `ProjectView` izriše globalno mesto in kontrolnike ob vrsticah; `TaskBoard` prejme enako globalno urejen seznam ter kontrolnike/povratni klic za kartice. Stolpci table ostanejo stalni, filtriranje po stanju pa ohrani vrstni red iz seznama. Dejanja kartice so bratje povezave, ne njeni potomci.
4. Zgodovinski gumbi, natančno besedilo števcev in onemogočenost izhajajo neposredno iz dolžin skladov. Slogi v `src/styles.css` uporabljajo obstoječe Folio spremenljivke in gradnike; pri 390 px se po potrebi pomikata samo preglednica in tabla.
5. Stanje ostane v pomnilniku trenutnega projekta. Ne dodajaj sprememb URL-ja za permutacijo, trajne shrambe, API zapisov ali uporabe poti `/__test/` v aplikaciji.

## Datoteke

| Datoteka | Načrtovana raba |
| --- | --- |
| `src/taskOrder.ts` (novo) | Čisti, tipizirani prehodi stanja permutacije in zgodovin; brez odvisnosti od Reacta ali API-ja. |
| `src/App.tsx` | Inicializacija projektnega stanja, izpeljava urejenih opravil/mest, globalni kontrolniki zgodovine in kontrolniki za vrstice. Obstoječi izračun števcev ostane vezan na nespremenjena opravila. |
| `src/TaskBoard.tsx` | Prikaz globalnih mest in premikov ob karticah, z globalnim sosedstvom ter nespremenjenim vrstnim redom znotraj fiksnih stolpcev. |
| `src/styles.css` | Postavitev kontrolnikov v obstoječem videzu Folio, vključno z notranjim drsenjem na ozkem zaslonu in vidnim fokusom. |
| `tests/agent/P10.spec.ts` (novo) | Playwright sprejemni scenariji za R01–R12; po potrebi uporabi obstoječe razvojne testne pripomočke samo za branje. |

`src/navigation.ts`, `src/TaskDetails.tsx`, API, strežnik, `shared/`, skupni testi, odvisnosti in konfiguracija niso predvideni za spremembe. Obstoječe preklapljanje hash poti naj ohrani lokalno stanje brez dodatnega upravljanja vrstnega reda v navigaciji.

## Zaporedje izvedbe

1. Izvedi in samostojno preglej čiste prehode stanja, posebej robne premike, mejo 20, vejo ponovitve in ponastavitev kot razveljavljivo dejanje.
2. V `ProjectView` poveži inicializacijo po nalaganju, urejen prikaz vrstice, globalna mesta, zgodovinske gumbe in števce; zagotovi, da so seznam in polja opravil nespremenjeni.
3. Razširi `TaskBoard` z globalnim mestom in dejanji ob kartici; preveri globalno sosedstvo čez različna stanja in ohrani obstoječe povezave, `data-task-id` ter dostopna imena.
4. Dopolni sloge ter teste v `tests/agent/P10.spec.ts`. Preveri oba pogleda, podrobnosti, menjavo projekta, osvežitev, prazne/enojne sezname, dostopna imena, odsotnost API zapisov in širino 390 px.

## Preverjanje

- Za razvoj uporabljaj `npm run lint` in `npm run build`; nato `npm run check` za skupne regresijske in Playwright razvojne ter agentne teste. Ti ukazi ne zahtevajo spremembe konfiguracije.
- Nove scenarije veži na R01–R12 in v zaključni specifikaciji zabeleži samo dejansko izvedene ukaze in rezultate. Končne nedostopne teste navedi kot nepreverjene.

## Omejitve

Ne spreminjaj začetnih podatkov, strežnika, skupnih tipov/testov, nastavitev ali odvisnosti. Uporabljaj samo javni API za branje in ohrani potrjeni dizajn Folio. Vedenja med nezaključenim nalaganjem in novih sočasnih sprememb brez osvežitve ne širi prek specifikacije.
