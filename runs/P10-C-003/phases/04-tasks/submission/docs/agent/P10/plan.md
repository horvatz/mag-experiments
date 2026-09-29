# Načrt izvedbe P10

Datum: 2026-09-25. Vhod: [specifikacija](spec.md), vseh R01–R12 iz
[izvirnih navodil](../../../task/instructions.md) in
[projektna načela](../../../.specify/memory/constitution.md).
Status: načrt; implementacija in testi še niso izvedeni.

## Tehnični kontekst

Obstoječi sklad je React 19.3, TypeScript 6, Vite 8 in lucide-react;
preverjanje uporablja ESLint ter Playwright 1.63. Nameščene odvisnosti in
Chromium zadostujejo. Nobena nova odvisnost ali sprememba nastavitev ni
potrebna. API, skupni tipi ter zagonska in testna infrastruktura ostanejo
nespremenjeni.

Lokalni pregled je pokazal:

- `src/App.tsx`: `ProjectView` bere opravila z `useResource`, prikazuje
  števce, preglednico oziroma `TaskBoard` in podrobnosti. Starš uporablja
  `key={project.id}`, zato menjava projekta že uniči lokalno stanje.
- `src/useResource.ts`: podatki se pojavijo po GET; preklop pogleda ali
  podrobnosti ne spremeni poti seznama. Ob napaki že obstaja ponovni poskus.
- `src/TaskBoard.tsx`: stalni stolpci filtrirajo podano polje po statusu.
  Če dobi urejeno polje, sam ohrani relativni vrstni red posameznega stanja.
- `src/navigation.ts` in `src/TaskDetails.tsx`: obstoječe povezave ohranijo
  pogled in berejo podrobnosti po ID-ju; novih sprememb tam ne načrtujemo.
- `playwright.config.ts`: že vključuje skupne, razvojne in `tests/agent/`
  teste ter namizni in mobilni projekt. Brskalnik uporablja podani endpoint
  iz `task/browser.json`; konfiguracije ali strežnika ne spreminjamo.

## Odločitve in struktura

### Enotno lokalno stanje

Dodamo majhen čisti reducer v `src/taskOrder.ts` z izvorno permutacijo,
trenutno permutacijo ter skladoma undo/redo. Dejanja so premik ID-ja v smeri
-1/+1, undo, redo in reset. Prehodi sledijo predikatom v
[specifikaciji](spec.md#model-stanja-in-predikati); kopirajo polja ID-jev,
nikoli ne spreminjajo objektov opravil. Neveljavno dejanje vrne nespremenjeno
stanje. Prejšnje permutacije omejimo na zadnjih 20 na enem mestu; veljaven
nov premik in reset počistita redo. Primerjava izvornega reda je po ID-jih
na istih mestih.

V `src/App.tsx` izločimo obstoječi odsek opravil v lokalno komponento
`ProjectTasks`, ki se izriše šele ob prejetem seznamu. `useReducer` se zato
inicializira z dejanskimi ID-ji tudi pri praznem seznamu; ni učinka, ki bi
naknadno ponastavljal zgodovino. Komponenta ostane na istem mestu drevesa
ob preklopu pogledov in podrobnosti. Življenjska doba `ProjectView` s ključem
projekta zagotovi ponastavitev ob menjavi in povratku; osvežitev ustvari
novo stanje. Nova funkcionalnost nima localStorage ali stanja v URL-ju.

Iz trenutnih ID-jev in zemljevida `Map<id, Task>` izpeljemo urejeno polje
opravil. Števci stanj še naprej izhajajo iz prejetih podatkov. Zemljevid
globalnih mest izračunamo pred filtriranjem table. Ni dodatnih API klicev
za premike; javno branje ostane obstoječe.

### Kontrole in videz

V `src/TaskOrderControls.tsx` dodamo skupni prikaz mesta in gumbov gor/dol
ter vrstico undo/redo/reset s števcem. Gumbi uporabljajo točna dostopna
imena, `type="button"` in `disabled`, izpeljan iz trenutnega stanja.
Onemogočanje ni edina zaščita: reducer tudi sam zavrne robno dejanje.

Preglednica dobi celico z mestom in kontrolami zunaj povezave opravila.
`TaskBoard` prejme urejena opravila, globalna mesta in callback za premik;
kontrole so v `li`, kot sorojenec povezave kartice. Ostanejo `data-task-id`,
imena stolpcev in dostopna imena povezav. Pri premiku na tabli callback
vedno uporabi globalni red reducerja.

`src/styles.css` dobi omejene sloge kontrol z obstoječimi barvami, robovi,
vidnim fokusom in prelamljanjem skupnih gumbov. Notranje drsenje preglednice
in table ostane; pri 390 pikah cela stran ne sme presegati širine zaslona.
Ohranimo lebdeči meni, prelom navigacije pri 760 pikah in potrjeni Folio.

| Datoteka | Načrtovana odgovornost | Zahteve |
| --- | --- | --- |
| `src/taskOrder.ts` (nova) | Inicializacija, invariantne permutacije, premiki, undo/redo, reset in meja 20 | R01–R08, R11–R12 |
| `src/TaskOrderControls.tsx` (nova) | Točna imena, mesta, števec in onemogočenost kontrol | R01–R03, R08, R11 |
| `src/App.tsx` | Lokalno stanje projekta, izpeljan globalni prikaz, vključitev kontrol | R01–R12 |
| `src/TaskBoard.tsx` | Projekcija globalnega reda v stalne stolpce, globalni sosedi | R02, R03, R09, R12 |
| `src/styles.css` | Folio in prilagodljive nove kontrole | R12 |
| `tests/agent/P10.spec.ts` (nova) | Smiselna dopolnitev razvojnih in regresijskih testov | R01–R12 |
| `docs/agent/P10/spec.md`, dokazila v isti mapi | Dejanska sledljivost pogojev, kode in testov | R01–R12 |

## Preverjanje in dokazi

Razvojni D01–D04 že pokrijejo osnovni premik, undo/redo, novo vejo zgodovine
in tablo/reset/brez zapisov. Dopolnimo jih z lastnimi testi za večkratno
zgodovino in ohranitev redo pri robnih dejanjih, več kot 20 korakov, reset
kot razveljavljivo dejanje, globalna soseda različnih stanj, preklapljanje
pogledov/podrobnosti/projektov, osvežitev, N=0/1/>10, drugačne ID-je in enake
naslove. Čisti reducer lahko preverimo z neposrednim uvozom v agentne teste;
uporabniške tokove pa v brskalniku, vključno s širino 390 pik, podrobnostmi,
števci stanj in odsotnostjo zapisov API. Testni GET pripomočki ostanejo samo
v testih.

Po izvedbi zaženemo `npm run check` (lint, tipi/gradnja in vsi konfigurirani
testi). Dnevnik shranimo v `docs/agent/P10/verification.log`; dejanske izide
in konkretna imena testov v matriko specifikacije. Ob napaki popravimo samo
dovoljene datoteke in ponovimo ustrezno preverjanje; vzrok ter končni izid
navedemo. Vizualno preverimo namizni in mobilni prikaz z obstoječim brskalnikom
in po potrebi shranimo posnetek v dokumentacijo. Ne trdimo, da so nedostopni
končni testi izvedeni.

## Vrstni red izvedbe in omejitve

1. Reducer in osnovna preverjanja zaporedij ter robov.
2. Vključitev lokalnega stanja, kontrol, preglednice in table.
3. Slogi Folio ter brskalniški scenariji, skupno preverjanje in popravki.
4. Dopolnitev sledljivosti, rezultatov in omejitev ter predaja.

Vse odločitve ostanejo znotraj dovoljenih poti in zahtev. Ni potrebe po
spremembi API-ja, infrastrukture, skupnih tipov, testov ali predlog.
Bistvenih odprtih vprašanj ni. Posebnega ravnanja z novimi sočasnimi podatki
brez osvežitve ne dodajamo. Čas preverjamo z `node task/time-budget.mjs`;
zadnja minuta ostane za shranitev dokazov in predajo.
