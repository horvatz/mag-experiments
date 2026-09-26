# P10 — izvedbeni načrt

Datum: 2026-09-26. Vhod: [specifikacija](spec.md), vseh [R01–R12](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md). Ta faza ne spreminja aplikacije.

## Tehnični kontekst in lokalne ugotovitve

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8 in `lucide-react`; Playwright in Chromium sta že pripravljena. Ostanejo isti `package.json`, konfiguracije, strežnik, tipi v `shared/` in javni GET API. Nobenih novih odvisnosti, zapisovalnih poti ali trajne shrambe.

`src/App.tsx` vsebuje `ProjectView`, ki se zaradi `key={project.id}` ponovno ustvari ob menjavi projekta; sprememba pogleda ali ID-ja odprtih podrobnosti tega ključa ne spremeni. `useResource` pridobi opravila asinhrono ter obvladuje preklic nalaganja in ponovni poskus. `TaskBoard` že filtrira vhodno polje v tri stalne stolpce. `TaskDetails` nalaga po ID-ju. To omogoča lokalno dopolnitev brez spremembe navigacije ali podatkovnega sloja.

## Odločitve in razpored datotek

| Datoteka | Predvidena sprememba in namen | Zahteve |
| --- | --- | --- |
| `src/taskOrder.ts` (nova) | Tip stanja `{initial, order, past, future}`, inicializator in čisti reducer za move/undo/redo/reset. Posnetki so zaporedja ID-jev; pred veljavnim prehodom se preveri meja. Pri dodajanju v `past` se obdrži zadnjih 20. | R01–R08, R11–R12 |
| `src/TaskList.tsx` (nova) | Iz obstoječega `ProjectView` prestavljena sekcija opravil, ki se namesti šele po prejemu `Task[]`. `useReducer` se inicializira iz prejetega polja. Derivira urejena opravila po ID-jih, globalna mesta, števec in onemogočenost skupnih gumbov; izriše preglednico ali tablo. | R01, R09–R11 |
| `src/TaskOrderControls.tsx` (nova) | Skupne kontrole posameznega opravila: prikaz globalnega mesta in gumba gor/dol z zahtevanimi dostopnimi imeni. Dobijo ID, globalno mesto, število opravil in povratni klic za premik. | R02–R03, R09, R11 |
| `src/App.tsx` | Ohranitev pridobivanja podatkov, povzetka stanj, napak in podrobnosti; uporaba `TaskList` na mestu obstoječe sekcije. `ProjectView` ostane vezan na projektni ključ. | R10–R12 |
| `src/TaskBoard.tsx` | Prejme urejena opravila, globalna mesta in dejanje premika. Kontrole doda znotraj `li[data-task-id]`, vendar zunaj povezave kartice. Stolpci še naprej filtrirajo urejeno polje po nespremenjenem statusu. | R01–R03, R09, R12 |
| `src/styles.css` | Majhne kontrole in ovijajoča se orodna vrstica v obstoječih barvah, razmikih in obrobah; ohranitev videza kartic, fokusa in notranjega drsenja pri 390 px. | R12, dogovor UI |
| `tests/agent/P10.spec.ts` (nova) | Dodatni testi prehodov in vmesnika za vrzeli razvojnih primerov; uporabljajo obstoječi Playwright projekt `agent`. | R01–R12 |
| `docs/agent/P10/spec.md`, `verification.md` in dnevniki | Dopolnitev sledljivosti s konkretnimi funkcijami/testi in dejanskimi izidi; kratka dokazila brez podvajanja pravil. | Oddaja |

Inicializacija šele ob namestitvi naložene sekcije prepreči, da bi začetno prazno stanje nalaganja postalo izhodišče projekta. `TaskList` mora ostati ista komponenta ob preklopu pogleda in odprtju/zaprtju podrobnosti; ne dobi ključa po pogledu ali opravilu. Menjava projektnega ključa in osvežitev jo ponovno inicializirata. Napake in ponovni poskus ostanejo v obstoječem podatkovnem ovoju.

Vrstni red je edini vir razvrstitve za oba pogleda. Predvidena preslikava `Map<id,Task>` in globalna mesta iz `order` omogočajo identiteto neodvisno od naslovov in pozicij. Reducer ne spreminja vhodnih polj ali objektov opravil. Neveljaven premik oziroma prazna undo/redo vrneta nespremenjeno stanje; to ohrani redo tudi ob robnem dejanju. Reset uporabi enak postopek shranjevanja prejšnjega stanja kot veljaven premik, le če `order` ni enak `initial`.

Formalne prehode, pogoje in pogodbo UI določa [specifikacija](spec.md#zahteve-in-pravila); tukaj jih ne podvajamo. Nove kontrole so zunaj povezav in ohranijo `data-task-id`, stolpce in obstoječa dostopna imena. Povzetek stanj in podrobnosti še vedno izhajata iz nespremenjenih podatkov.

## Zaporedje izvedbe in preverjanje

1. Uvesti in preveriti čiste prehode za celotna zaporedja ID-jev, omejitev 20, reset in neveljavna dejanja. Pri ponovljenih robnih dejanjih preveriti tudi nespremenjen redo.
2. Povezati naloženo sekcijo, preglednico, skupne kontrole in tablo; dodati zmerne prilagodljive sloge. Preveriti ohranitev stanja med pogledi/podrobnostmi in ponastavitev med projekti.
3. V `tests/agent/P10.spec.ts` preveriti scenarije S01–S08 iz specifikacije z neodvisnimi pričakovanimi zaporedji: vsaj 21 premikov in vseh 20 undo/redo; razvejitev; razveljavljiv reset; globalnega soseda drugega statusa; oba sklada ob navigaciji; poljubne ID-je, enake naslove, Unicode, več kot deset opravil, nič in eno opravilo. Testi DOM preverijo vsebino mest, števcev in onemogočenost gumbov. Čisti prehodi omogočajo neposredno preverjanje neveljavnega dogodka, ki ga onemogočen gumb ne pošlje.
4. Spremljati zahteve API med UI dejanji in potrditi odsotnost zapisov. Primerjati števce stanj, podatke in pravilne podrobnosti. Pri 390 px preveriti širino dokumenta, notranje drsenje, dostopnost kontrol in vizualno ohranitev Folia; shraniti ustrezen posnetek.
5. Zagnati `npm run check` (lint, preverjanje tipov, gradnja in vse konfigurirane skupne, razvojne ter lastne teste). Ob napakah ciljno popraviti dovoljene datoteke in ponovno preveriti prizadeto vedenje. Obstoječe konfiguracije in skupni testi ostanejo nespremenjeni. Dnevnike shraniti v `docs/agent/P10/`.
6. Posodobiti sledljivost R01–R12 v specifikaciji s konkretnimi testi, kodo in dokazili. Neizvedene ali neuspešne korake izrecno označiti. Skritih končnih testov ni mogoče potrditi.

## Skladnost in tveganja

Načrt ostaja znotraj ustave: spremembe aplikacije samo v `src/`, dodatni testi v `tests/agent/`, dokumenti v `docs/agent/`. Ne zahteva selitve infrastrukture ali drugih dovoljenj. Raziskovanje je bil samo pregled lokalnih datotek. Nobene veje, commiti ali dodatni agenti.

Glavni tveganji sta neželena ponastavitev zgodovine zaradi ponovne namestitve komponente in zamenjava globalnega soseda s sosedom znotraj stolpca; zgornja postavitev stanja in scenarija S06/S07 ju neposredno preverjata. Vpliv dodatnih kontrol na ozko stran preveri S08. Sočasnih sprememb podatkov brez osvežitve in navigacije med nalaganjem ne širimo prek obstoječih regresij. Bistvenih odprtih vprašanj ni.

Status: načrt pripravljen; implementacija in testi še niso izvedeni. Čas se preverja z `node task/time-budget.mjs`; zadnja minuta skupnega roka je namenjena predaji.
