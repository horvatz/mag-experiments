# Načrt izvedbe P05

2026-09-23 · temelji na [specifikaciji](spec.md), izvirnih [R01–R12](../../../task/instructions.md) in [ustavi](../../../.specify/memory/constitution.md). Ta faza določa izvedbo; kode in testov še ne spreminja.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8 in `lucide-react`; Node je 24.11+. Vse odvisnosti in Chromium so nameščeni. Preverjanje uporabljata ESLint in Playwright. `package.json`, nastavitve, strežnik, skupni tipi in skupni testi ostanejo nespremenjeni.

`src/App.tsx` vsebuje `ProjectView`, nalaganje polja opravil, preglednico, preklop pogledov in skupne števce. `src/TaskBoard.tsx` že združuje podano polje po stanjih in iz njega šteje stolpce. `src/TaskDetails.tsx` ter `src/navigation.ts` izvajata obstoječe podrobnosti in navigacijo prek hash URL-ja. `src/useResource.ts` in `src/api.ts` zagotavljata GET, nalaganje, napake in ponovni poskus. `src/styles.css` določa potrjeni Folio in notranje drsenje obeh pogledov.

Javni API ostaja vir podatkov: `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`. Filter in straničenje ne potrebujeta novih zahtev na API. Ne dodajamo odvisnosti, novega strežnika, konfiguracije ali skupnega modela.

## Odločitve in podatkovni tok

1. **Lokalno stanje v ProjectView (R01, R04, R05, R07, R08).** Dodaj `useState` za velikost (`'all' | '2' | '5' | '10'`), filter (`'all' | TaskStatus`) in stran (začetna 1). Obstoječi `key={project.id}` zagotovi reset pri menjavi projekta; osvežitev ponovno inicializira React. Preklop pogleda in podrobnosti ne menjata ključa, zato stanje ostane. Ne dodajamo sinhronizacijskega učinka, shrambe ali URL parametrov za te vrednosti.
2. **Ena izpeljava odseka (R02, R05, R06).** Iz nespremenjenega polja `tasks` izpelji `filteredTasks` in nato `visibleTasks` z `filter` ter `slice`, po formulah iz specifikacije. Za `all` ne reži polja. Preglednica in `TaskBoard` prejmeta isti `visibleTasks`; tabla nato uporabi svoje obstoječe združevanje. Vrstni red se ne sortira. Tako ostaneta obravnava ID-jev in skaliranje na poljubno dolžino podatkov neodvisna od testnih primerov.
3. **Ločeni obsegi štetja (R11).** Obstoječi `counts`, značka ob naslovu Opravila in spodnji pregled končanih ostanejo vezani na celotni `tasks`. Stolpci table že štejejo iz podanega odseka. Skupnih števcev ne izpeljuj iz filtriranega polja.
4. **Neposredni prehodi (R03–R05).** Oba `onChange` hkrati nastavita izbrano vrednost in stran 1. Gumbi spreminjajo samo stran in so onemogočeni po robnih predikatih. Handlers ohranijo veljavne meje tudi pri zaporednih dogodkih. Za prazen rezultat ne postavi interne strani na 0; prikazano stran izpelji kot 0.
5. **Kontrole in status (R09, R10, R12).** V obstoječi razdelek opravil za uspešno naložene podatke dodaj dva označena HTML selektorja, štiri gumbe `type="button"` in imenovani `role="status"`. Vrednosti, dostopna imena, natančno besedilo in znak `–` določa specifikacija. Kontrole so na voljo tudi pri praznem polju. Med nalaganjem ostane obstoječi status nalaganja brez dodatnega statusa straničenja.
6. **Prazni prikazi.** Pri praznem projektu ohrani naslov `V tem projektu še ni opravil`; pri praznem filtru prikaži ustrezno kratko slovensko sporočilo. Tabla ostane tabla s tremi praznimi stolpci. Oba primera imata zahtevani ničelni status in štiri onemogočene gumbe. Selektor filtra ostane uporaben za vrnitev na prvo stran nepraznega rezultata.
7. **Folio in dostopnost.** Kontrole umesti zunaj povezav opravil in uporabi obstoječe barvne spremenljivke, nevtralne površine, zaobljene robove, `.button` in globalni `:focus-visible`. Vrstice kontrol in navigacije naj se prelamljajo; elementi ne smejo povzročiti širine dokumenta nad 390 pik. Ohrani obstoječe `data-task-id`, povezave in dostopna imena, notranje drsenje ter postavitev navigacije.

Tok: `API → tasks → filter → odsek → preglednica / tabla → stolpci`. Skupni pregled stanj se odcepi neposredno iz `tasks`. Izvedba ostane v obstoječih komponentah; dodatna arhitekturna plast ni potrebna.

## Datoteke in zaporedje izvedbe

| Korak | Datoteka | Vsebina in zahteve |
| --- | --- | --- |
| 1 | `src/App.tsx` | Lokalno stanje, izpeljava odseka, skupni prikaz, kontrole, status in praznina; R01–R11 ter ohranitev R12. |
| 2 | `src/styles.css` | Omejeni slogi novih kontrol, prelamljanje in ozki zaslon; R12. |
| 3 | `tests/agent/P05.spec.ts` | Scenariji S01–S08 po specifikaciji; testni podatki in GET prestrezanje samo v testih. |
| 4 | `docs/agent/P05/spec.md` in `docs/agent/P05/validation.md` | Posodobi sledljivost z dejanskimi testi, mesti kode, rezultati in dnevniki; ohrani zgodovino. |

`TaskBoard`, podrobnosti, API in navigacijo ohranimo z obstoječim vedenjem; spremeni se polje, podano tabli. Če preverjanje pokaže potrebo po popravku v dovoljenem `src/`, ga poveži z izvirno zahtevo in zabeleži odstopanje od načrta. Dodatnih funkcionalnosti ne dodajaj.

## Strategija preverjanja

Obstoječa konfiguracija že odkrije `tests/agent/**/*.spec.ts` v projektu `agent`, razvojne teste na namizju in mobilni napravi ter skupne teste API in obeh velikosti zaslona. Uporabi jo brez sprememb. Testi lahko uvozijo obstoječe pripomočke iz `tests/development/helpers.ts`; aplikacija jih ne sme uvažati.

- S01/S02: preurejenih vsaj 13 opravil z različnimi ID-ji in ponovljenimi naslovi; velikosti 2/5/10/all, vsi štirje premiki, robovi, celotna konkatenacija ID-jev, natančni indeksi in krajša zadnja stran. Dodaj primer enega opravila.
- S03: vsi trije filtri in `all`; preveri filter pred rezom, filtrirani imenovalec, prehod z višje strani, reset velikosti, ko bi bila prejšnja stran še veljavna, ter povratek na `all`.
- S04: izbrana višja stran, preklop obeh pogledov, podrobnosti po ID-ju in oba načina zapiranja; primerjaj množico ID-jev med pogledoma, vrstni red znotraj stolpcev in števce celotnega projekta proti trenutnemu odseku.
- S05/S06: menjava in vrnitev projekta, reload, URL in odsotnost trajnega zapisa; prazen projekt, prazen filter, povratek iz praznine in prazni stolpci table.
- S07/S08: spremljaj zapisovalne zahteve in nespremenjenost podatkov; preveri besedila z Unicode/ločili, pravilne povezave ter 390-pikselni prikaz in tipkovniški fokus v obeh pogledih. Skupni testi pokrijejo obstoječe nalaganje, napake, ponovni poskus, podrobnosti in navigacijske regresije.

Po implementaciji izvedi `npm test -- --project=agent` za dodatne scenarije, nato `npm run check` za lint, preverjanje tipov, produkcijsko gradnjo in vse teste. Dnevnike shrani pod `docs/agent/P05/`; ob preusmerjanju izhoda ohrani izhodno kodo procesa. Teste ponavljaj po popravkih ali ob nerešenem neuspehu, ne brez novega razloga. Ob neuspehu opiši dejanski vzrok in ne označi zahteve za preverjeno.

Končna sledljivost v specifikaciji mora za vsak R01–R12 kazati na dejansko kodo, izvedeni test in dokaz. `validation.md` vsebuje ukaze, izhodne kode, rezultate in omejitve, brez podvajanja specifikacije. Končnih nedostopnih testov ne navajaj kot izvedenih.

## Skladnost in omejitve

Načrt ostaja znotraj dovoljenih poti, uporablja nameščene odvisnosti in dani javni API, ohranja Folio ter ne zahteva sprememb infrastrukture. Ni nerešenih bistvenih vprašanj. Novi primeri sočasnih sprememb podatkov in navigacije med nalaganjem ostajajo zunaj razširitve obsega, skladno z izvirnimi navodili. V tej fazi ni bilo izvedenih aplikacijskih testov.
