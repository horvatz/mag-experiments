# P03 — Izvedbeni načrt

2026-09-24 · podlaga: [specifikacija](spec.md), [načela](../../../.specify/memory/constitution.md), [izvirne zahteve](../../../task/instructions.md). Načrt ne dodaja funkcionalnih zahtev.

## Tehnični kontekst in lokalne ugotovitve

Aplikacija uporablja React 19.3, TypeScript 6, Vite 8 in `lucide-react`; preverjanje uporablja ESLint ter Playwright 1.63 z že nameščenim Chromiumom. Odvisnosti so nameščene. Obstoječi `package.json`, konfiguracije, strežnik in `shared/types.ts` ostanejo nespremenjeni.

`src/App.tsx` vsebuje `ProjectView`, ki bere opravila prek `useResource`. `App` že uporablja `key={project.id}`, zato menjava projekta ponovno ustvari lokalno stanje. Pogled in podrobnosti sta del obstoječega usmerjanja v `src/navigation.ts`; menjava pogleda ne spremeni ključa projekta. `src/TaskBoard.tsx` že razdeli prejeta opravila po stanju in iz njih izračuna števce. `src/useResource.ts` veže rezultat na pot in podpira preklic ter ponovitev; to vedenje ohranimo.

## Odločitve in tok podatkov

1. **Čisto filtriranje:** nov `src/taskFilters.ts` vsebuje tip filtrov in funkcijo `filterTasks`. Izvede natančen `norm`, delitev po belinah, `every/includes` in presek s stanjem ter natančnim imenom po predikatih v specifikaciji. Sprejme izvorni seznam in vrne njegovo filtrirano podzaporedje; ne uporablja sortiranja ali spreminjanja opravil. Vzorec za odstranjevanje znamenj je samo `U+0300–U+036F`, ne splošno odstranjevanje vseh Unicode znamenj. Iskalno besedilo se nikoli ne sestavi v regularni izraz. Pokriva R02–R04 in R11.
2. **Projektno stanje:** v `ProjectView` dodamo en objekt `useState` z `query: ''`, `status: 'all'`, `assignee: 'all'`. Sprememba kontrole zamenja ustrezno polje; gumb ponastavi celoten objekt v enem dejanju. Obstoječi ključ projekta zagotovi R01, R07 in R08; isti primerek ob preklopu pogleda zagotovi R06. Ne dodajamo učinkov za sinhronizacijo filtrov z URL-jem ali shrambo.
3. **Izvorni in prikazani podatki:** `tasks` ostane izvor za `M` in za možnosti oseb (`Set` nepraznih imen, vrstni red prvega pojava). `visibleTasks` je edini izvor za preglednico, tablo, pregled stanj, prikazano značko in števce prikazanih opravil. Tako možnosti oseb niso odvisne od filtrov, števci pa si ne nasprotujejo. Pokriva R05, R06 in R09.
4. **Kontrole in izidi:** v obstoječi razdelek opravil dodamo vidno označene native input/select kontrole ter gumb. Dostopna imena in vrednosti so natančno po specifikaciji. Status z `Prikazano: N od M.` je prikazan, ko so podatki uspešno naloženi. Pri `M > 0 && N === 0` prikažemo `Ni zadetkov.`; tabla še vedno vsebuje tri prazne stolpce, preklop pogledov in kontrole ostanejo dosegljivi. Pri `M === 0` ohranimo obstoječe prazno stanje izbranega pogleda. Pokriva R09–R11, brez zamenjave napake ali nalaganja s praznim stanjem.
5. **Folio in prilagodljivost:** v `src/styles.css` dodamo omejene sloge za filtre, označbe in rezultat. Uporabimo obstoječe barvne spremenljivke, robove in gumb `.button`. Kontrole imajo omejeno širino, `min-width: 0` in prelom oziroma zložitev na ozkem zaslonu; dolga imena ne razširijo strani. Ohranimo navigacijo, kartice, preglednico, vidni fokus in notranje drsenje. Pokriva R12.
6. **Branje in identiteta:** povezave, `data-task-id`, prikaz podrobnosti ter izbira po ID-ju ostanejo obstoječi. Filtriranje je izključno izračun iz GET podatkov, brez uporabe `updateTask`, `/__test/` ali testnih pripomočkov v aplikaciji. Pokriva R11–R12.

Tok: javni GET → izvorni `tasks` → možnosti oseb in `M`; `tasks + lokalni filtri` → `visibleTasks` → oba pogleda, `N` in števci stanj. Ne uvajamo drugega skladišča podatkov ali novega API-ja.

## Datoteke in obseg sprememb

| Datoteka | Predvidena sprememba |
| --- | --- |
| `src/taskFilters.ts` | Majhen čisti modul za tipe filtrov in iskanje/presek. |
| `src/App.tsx` | Lokalno stanje, kontrole, možnosti oseb, skupni rezultat, števci in prazna stanja. |
| `src/styles.css` | Slogi novih kontrol in prilagoditev njihove postavitve pri ozki širini. |
| `src/TaskBoard.tsx` | Obstoječo komponento ponovno uporabimo s filtriranim seznamom; sprememba notranje logike ni potrebna. |
| `tests/agent/P03.spec.ts` | Lastna preverjanja scenarijev S01–S08; javne testne pripomočke lahko uvozi samo test. |
| `docs/agent/P03/spec.md` | Po izvedbi posodobimo sledljivost z dejanskimi testi, deli kode, rezultati in zgodovino. |
| `docs/agent/P03/evidence/` | Jedrnati dnevniki z ukazi/izhodnimi kodami in posnetki za preverjanje Folia. |

Drugih aplikacijskih datotek ni treba spreminjati. Dodatni dokumenti raziskav ali modeli API-ja niso potrebni: odločitve izhajajo iz lokalne kode in obstoječih navodil.

## Preverjanje in vrstni red izvedbe

1. Uvedemo čisti filter, projektno stanje in enoten seznam za oba pogleda; nato kontrole, števce, prazna stanja in sloge.
2. Dodamo lastne Playwright teste z neodvisno določenimi pričakovanimi ID-ji. Ponovno uporabimo samo obstoječi testni mehanizem nadzorovanih GET odgovorov, brez sprememb skupnih testov ali konfiguracije. Podatki vključujejo 0, 1 in več kot 10 opravil, enake naslove, nestandardne ID-je, drugačen vrstni red, Unicode in dobesedna ločila.
3. Scenariji S01–S03 preverijo privzete kontrole, vsa štiri polja iskanja, kombinacije besed in vseh treh filtrov, natančna imena ter celotne možnosti oseb. S04 preveri preklop projektov, vrnitev, osvežitev in odsotnost zapisa filtrov v URL/shrambo.
4. S05–S07 preverijo enake ID-je, stolpce in števce, razločevanje praznega projekta in nič zadetkov, enkratno ponastavitev ter nespremenjeno zaporedje in polja. Smiselno preverjanje čiste funkcije uporablja zamrznjene vhodne podatke; pričakovani izidi se ne računajo s produkcijskim filtrom.
5. S08 preveri podrobnosti po ID-ju, ohranjeno navigacijo, odsotnost zapisovalnih zahtev in širino dokumenta pri 390 pikah; posnetka širokega in ozkega prikaza omogočita vizualni pregled Folia. Obstoječi skupni testi pokrivajo tudi napake, ponovitev nalaganja in preklop projekta med nalaganjem.
6. Izvedemo `npm run lint`, `npm run build` (vključuje preverjanje tipov) in `npm test`. Obstoječi Playwright vključuje projekte API, desktop, mobile, razvojna desktop/mobile ter agent. Zagonov, ki uporabljajo isti strežnik, ne izvajamo sočasno. Izhode in dejanske izhodne kode shranimo v `evidence/`; napake odpravimo v dovoljenem obsegu in ponovimo prizadeta preverjanja.
7. Izpolnimo sledljivost vseh R01–R12 v specifikaciji, zapišemo omejitve in predamo. Končnih nedostopnih testov ne označimo kot opravljenih.

## Skladnost in tveganja

Načrt je skladen z načeli: ohranja infrastrukturo in Folio, uporablja le javni API ter spremembe omejuje na dovoljene poti. Pomembna izvedbena tveganja so uporaba filtriranega seznama za možnosti oseb, izguba stanja ob preklopu pogleda, napačen imenovalec števca in širjenje selecta z dolgim imenom; navedene odločitve in scenariji jih neposredno preverijo. V tej fazi testi niso bili izvedeni. Bistvenih odprtih vprašanj ni.
