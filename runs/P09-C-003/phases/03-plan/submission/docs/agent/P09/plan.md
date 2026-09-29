# P09 — izvedbeni načrt

Datum: 2026-09-26. Podlaga: [specifikacija](spec.md), [R01–R12](../../../task/instructions.md), [projektna načela](../../../.specify/memory/constitution.md). V tej fazi je izveden samo lokalni pregled; implementacija in funkcionalna preverjanja sledijo.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8, lucide-react, CSS in hash navigacijo prek `useSyncExternalStore`. `App.tsx` nalaga projekte in opravila z `useResource`; `TaskBoard.tsx` grupira opravila, `TaskDetails.tsx` odpre dialog po ID-ju. Skupni tipi so v `shared/types.ts`. Nameščeni Playwright uporablja že pripravljeni Chromium in nespremenjeni `playwright.config.ts`.

Ohranimo javne GET poti `/api/projects`, `/api/projects/{id}/tasks` in `/api/tasks/{id}`. Obstoječega zapisovalnega pripomočka `updateTask` P09 ne uporablja. Ni nove knjižnice, podatkovnega modela strežnika, shrambe ali spremembe infrastrukture.

## Odločitve in pretok podatkov

1. **Čista logika pogleda** (`src/viewState.ts`): lokalni tip `ViewState` za q/status/order, privzete vrednosti, branje parametrov, normalizacija in izbor/urejanje opravil. `URLSearchParams.get` zagotovi prvo pojavitev; dovoljena status/order validiramo. Iskanje uporablja eno normalizirano frazo ter `includes` po štirih poljih. Urejamo kopijo rezultata z `<`/`>` po UTF-16 in izvirnim indeksom pri izenačenju; API podatkov ne mutiramo. S tem pokrijemo R01–R04 brez spremembe skupnih tipov.
2. **URL je vir potrjenega stanja** (`src/navigation.ts`): razširimo rezultat poti s potrjenimi filtri in identifikacijo trenutnega fragmenta. Ločimo razčlenjevanje od zapisovanja; odprtje povezave ničesar ne prepisuje. Gradnika `projectUrl`/`taskUrl` dobita izbirno potrjeno stanje in sestavita eno query zaporedje za pravilno kodirano pot. Parametre prenašamo v navigacijo, ne osnutka. Podrobnosti še vedno uporabljajo ID.
3. **Potrditev in zgodovina**: pred potrditvijo obrežemo q, izpustimo privzete parametre in neznane ključe ter ohranimo pogled. Spremenjeni potrjeni trojček pomeni en vnos (`location.hash`); enaka ponovitev ga ne doda. Kadar je potrebna le kanonizacija istega stanja, uporabimo `history.replaceState` in obvestimo obstoječo naročnino, ker replaceState sam ne sproži hashchange. Nazaj/Naprej in osvežitev ponovno izpeljejo stanje iz fragmenta. Potrditev in reset uporabljata isto pot zapisovanja (R05–R07, R11).
4. **Osnutek kontrol** (`src/ViewControls.tsx`, integracija v `App.tsx`): tri označene kontrole, gumb za potrditev in gumb za reset. Lokalni osnutek ne določa prikazanih opravil. Ob navigaciji se kontrole ponovno inicializirajo iz potrjenih filtrov; ključenje omejimo na kontrole ali uporabimo izrecno uskladitev osnutka. Celotnega projekta ne montiramo na novo ob vsaki spremembi fragmenta, saj to prekine obnovo fokusa iz dialoga. Reset počisti osnutek tudi, kadar URL ostane isti.
5. **Skupen izbor rezultatov** (`App.tsx`): enkrat izračunamo izbrana in urejena opravila ter isti seznam predamo tabeli ali tabli. Tabla ohrani tri stolpce; urejanje velja znotraj vsakega stolpca. Obstoječi pregled stanj ostane iz vseh opravil projekta, novi števec jasno kaže N od M. Rezultatski status se izriše po nalaganju, da ne podvoji obstoječega statusa nalaganja. Za N=0 dodamo »Ni zadetkov.«; pri M=0 ohranimo tudi obstoječi naslov praznega projekta oziroma prazne stolpce table (R08, R11, R12).
6. **Prenos pri navigaciji**: povezave vrstic in kartic, preklop pogledov ter zapiranje dialoga z gumbom/Escape dobijo potrjeno stanje. Povezave do drugega projekta namenoma sestavijo privzete filtre in ohranijo samo način pogleda; direktna povezava se vselej razčleni s svojimi parametri (R08–R10). Osnutek se ob navigaciji zavrže, tudi ko se spremeni samo pot opravila ali način pogleda.
7. **Folio in dostopnost** (`src/styles.css`): nov blok kontrol uporablja obstoječe barve, obrobe, pisavo in gumbe; prelomi se na ozkem zaslonu. Polja imajo vidne povezane oznake in `min-width: 0`. Ohranimo fokus, dostopna imena, `data-task-id`, statusne povzetke in notranje drsenje. Pri 390 pikah preverimo širino celotne strani. Ne spreminjamo postavitve navigacije ali osnovnega videza.

## Datoteke in odgovornost

| Datoteka | Predvidena sprememba | Zahteve |
| --- | --- | --- |
| `src/viewState.ts` (nova) | tipi lokalnega stanja, privzete vrednosti, parse, normalizacija, filtriranje in stabilno urejanje | R01–R04 |
| `src/navigation.ts` | branje filtrov, gradnja URL-jev, usklajena zgodovina potrditve | R01, R04, R06–R10 |
| `src/ViewControls.tsx` (nova) | lokalni osnutek, tri kontrole, potrditev in reset | R05–R07, R11 |
| `src/App.tsx` | integracija kontrol in rezultatov, števec, prazna stanja, povezave in projektna navigacija | R05, R08–R12 |
| `src/TaskBoard.tsx` | prenos potrjenih filtrov v povezave kartic | R08–R09 |
| `src/TaskDetails.tsx` | ohranitev filtrov ob obeh načinih zapiranja | R09 |
| `src/styles.css` | slog in odzivnost novih kontrol | R12 |
| `tests/agent/P09.spec.ts` (nova) | preverjanje manjkajočih scenarijev iz S01–S12 | R01–R12 |
| `docs/agent/P09/spec.md` in dokazila v isti mapi | dopolnjene dejanske povezave na kodo/teste, rezultati in omejitve | sledljivost |

## Zaporedje izvedbe in preverjanje

1. Izvesti čisto logiko in navigacijo; nato kontrole ter prikaze/povezave; nato sloge. Vsi koraki ostanejo znotraj dovoljenih datotek.
2. Dodati smiselne lastne Playwright scenarije za vrzeli štirih razvojnih testov D01–D04: normalizacijo vseh polj in dobesedno frazo, UTF-16 in izenačitve, podvojene/neznane parametre brez prepisovanja, potrditev/reset in zgodovino, zavržen osnutek pri navigaciji, detajle z enakimi naslovi, oba projekta, prazne/večje podatke, kodiranje, nič zapisov in 390 pik. Pričakovane ID-je podati neodvisno od implementacije. Testni GET odgovori ostanejo samo v testih; uporabniški vmesnik ne uvaža testnih pripomočkov.
3. Izvesti `npm run lint`, `npm run build` in `npm test` z obstoječimi nastavitvami. Celotni `npm test` zajame API, namizne/mobilne regresije, razvojne teste P09 ter lastne teste. Dnevnike shraniti v `docs/agent/P09/`; po napakah ponoviti relevantna preverjanja. Namestitev ali sprememba konfiguracije ni del načrta.
4. Dopolniti sledljivost v specifikaciji z dejanskimi funkcijami, imeni testov in dnevniki; ločiti uspešne, neuspešne in neizvedene dele. Shraniti omejitve in predati pred iztekom skupnega roka.

## Tveganja in omejitve

Največ pozornosti zahtevajo dodajanje natanko enega zgodovinskega vnosa, ohranjanje filtrov skozi vse povezave in obnova osnutka brez izgube fokusa po dialogu. To preverijo scenariji S05–S10. Obstoječi testi praznega projekta zahtevajo staro prazno stanje; novo obvestilo ga dopolni. Nedostopni končni testi niso izvedeni; domena izvirnih zahtev ostaja širša od razvojnih primerov. Širjenja sočasnosti in nalaganja preko obstoječih regresij ni.

Preverba projektnih načel: načrt ne zahteva odstopanj, novih odvisnosti ali zapisov zunaj dovoljenih poti.
