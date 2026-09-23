# P06 — Načrt izvedbe

Datum: 2026-09-22. Podlaga: [specifikacija](spec.md), [izvirne zahteve](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md), [projektna pravila](../../../PROJECT_RULES.md) in [dizajn Folio](../../dizajn.md). Pogoji R01–R12 in scenariji S01–S07 ostanejo v specifikaciji; tukaj so odločitve za izvedbo.

## Tehnični kontekst in lokalne ugotovitve

Nameščeni so React 19.3, TypeScript 6, Vite 8, lucide-react in Playwright 1.63; Node je 24.11.1. Uporabimo obstoječe skripte in konfiguracijo brez novih odvisnosti. `src/App.tsx` prikazuje projekte prek `useResource`, ki bere `/api/`; tipi `Task` in `Project` so v samo berljivem `shared/types.ts`.

`App` že izriše `ProjectView key={project.id}`. Preklop Preglednica/Tabla spremeni lastnost `view` iste komponente, menjava projekta pa jo ponovno ustvari. To neposredno podpira zahtevano ohranjanje in ponastavljanje nastavitev. `src/styles.css` že vsebuje barvne spremenljivke, slog `.button`, viden fokus ter notranje drsenje preglednice in table.

`playwright.config.ts` že vključuje projekt `agent` za `tests/agent/**/*.spec.ts`, razvojna projekta za namizni/mobilni prikaz in skupne regresije. Uporablja nameščeni Chromium prek `task/browser.json` ter sam zažene obstoječi strežnik. Razvojni testi D01–D04 pokrivajo osnovni format, izbor/filter, del posebnih vrednosti ter enakost pogledov; niso popolna pokritost zahtev.

## Odločitve in datoteke

| Datoteka | Načrtovana odgovornost | Zahteve |
| --- | --- | --- |
| `src/csv.ts` (nova) | Stalni seznam in tip kolon, tipi nastavitev, nevtralizacija in navedba vrednosti ter čista sestava CSV iz nespremenljivega zaporedja opravil. | R01–R09, R12 |
| `src/CsvExport.tsx` (nova) | Dostopne kontrole, lokalni izbor kolon/ločila/filtra, predikat omogočenosti ter prenos s trenutnimi nastavitvami. | R01–R06, R10–R12 |
| `src/App.tsx` | Enkratna vključitev `CsvExport` v skupni del `ProjectView` za naložena opravila, pred razcepom preglednica/tabla; posreduje `project.id` in izvorne `tasks`. | R01, R04, R10–R12 |
| `src/styles.css` | Omejeni slogi novih kontrol z obstoječimi spremenljivkami in prelamljanjem pri ozki širini. | R12 in dogovor o vmesniku |
| `tests/agent/P06.spec.ts` (nova) | Dodatna preverjanja točnih bajtov, robnih podatkov, praznin, nastavitev, stranskih učinkov in širine 390 pik; po potrebi čisti testi z istim obstoječim izvajalnikom. | R01–R12, S01–S07 |
| `docs/agent/P06/spec.md`, `tasks.md`, `verification.md` | Sledljivost do dejanskih mest kode, naloge in jedrnati rezultati s povezavami na dnevnike. | Dokazila skupne predloge |

### Sestava CSV in prenos

Čista funkcija prejme `readonly Task[]`, izbor kolon, ločilo in filter. Najprej izpelje kolone po stalnem vrstnem redu K ter vrstice s stabilnim filtrom iz specifikacije. Izvornega polja ne sortira ali spreminja. Pri praznih kolonah ali vrsticah vrne signal brez datoteke, ki ga spoštuje tudi obravnavalnik klika.

Vrednosti bere neposredno iz polj opravila: brez prikaznega oblikovanja datuma, prevajanja statusa ali obrezovanja nizov. Nevtralizacija zazna samo začetne presledke/tabulatorje/CR/LF in štiri določene sprožilce. Apostrof doda pred izvirno vrednost, nato podvoji narekovaje in vedno navede celotno vrednost. Glavo navede brez nevtralizacije. Doda BOM in izrecne CRLF, vključno z zadnjim; notranjih prelomov ne pretvarja.

Ob kliku komponenta izračuna datoteko iz trenutnih lastnosti in stanja. Uporabi `Blob` z `text/csv;charset=utf-8`, `URL.createObjectURL` in začasni element `a` z `download="folio-<projectId>.csv"`. Povezava nima novega cilja; po kliku odstrani začasni element, objektni URL sprosti po sprožitvi prenosa. Izvoz nima omrežnega klica ali nove trajne shrambe. To so obstoječi brskalnikovi API-ji.

### Stanje in umestitev

`CsvExport` hrani samo C, d in f v Reactovem lokalnem stanju s privzetim D. Ostane na istem mestu v drevesu med preklopom pogledov. Ob ponovni postavitvi `ProjectView` zaradi drugega ID-ja se nastavitve naravno ponastavijo; enako velja za osvežitev. Novi učinki za sinhronizacijo nastavitev, globalna shramba in spremembe usmerjanja niso potrebni.

Filter se uporablja izključno za izvoz. Obstoječa preglednica, `TaskBoard`, število opravil, povzetek stanj in podrobnosti še prejemajo iste celotne podatke. Kontrole so na ravni projekta, zunaj povezav opravil. Ob praznem naloženem projektu so vidne z onemogočenim gumbom. Pri nalaganju ali napaki ostane obstoječe ravnanje aplikacije.

Checkboxi imajo točna dostopna imena `Stolpec <ime>`, oba nativna selecta in gumb pa imena iz specifikacije. Skupina kolon in vrstica nastavitev se prelamljata; uporabita nevtralno površino, robove, tipografijo in modri poudarek Folia. Ohranjeni ostanejo navigacija, oznake pogledov/stolpcev, `data-task-id`, povzetek stanj in notranje drsenje. Nove kontrole ne določajo najmanjše širine cele strani.

## Vrstni red izvedbe in preverjanja

1. Izdelaj čisto sestavo CSV in preverjanja robnih vrednosti z ročno določenimi pričakovanimi nizi/bajti. Pokrij obe ločili, BOM, CRLF, narekovaje, Unicode, vse sprožilce formul in negativne primere. Zamrznjeni vhodni objekti/polje naj razkrijejo neželene mutacije.
2. Dodaj `CsvExport`, integracijo in omejene sloge. Preveri privzete nastavitve, prazen izbor, prazen rezultat in ohranitev polnega prikaza.
3. Dodaj integracijske scenarije za 0, 1 in več kot 10 opravil, neobičajen vrstni red ter ponovljene naslove; nato preklop pogledov, zaporedne izvoze, menjavo projekta in osvežitev. Pričakovani prenos se ne sme računati s produkcijskim serializatorjem.
4. Preveri nadzor omrežnih zapisov in novih strani, ohranitev opravil ter obstoječe navigacije in podrobnosti. Pri 390 pikah preveri `document.documentElement.scrollWidth <= innerWidth` v obeh pogledih ter vizualno preglej nove kontrole in fokus.
5. Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo. Celotni `npm test` vključuje skupne API/namizne/mobilne teste, D01–D04 v obeh razvojnih projektih ter lastne teste. Posamezni projekt `agent` se lahko zažene prej za usmerjeno odpravljanje napak. Po uspehu ne ponavljaj preverjanj brez spremembe ali razloga.
6. Sproti shrani dnevnike v `docs/agent/P06/`, zapiši ukaze in izhodne kode v `verification.md`, posodobi vsako vrstico sledljivosti in zgodovino specifikacije. Jasno označi neizvedeno in omejitve; skriti končni testi ostanejo nedostopni.

Testi lahko uporabljajo samo berljivi razvojni pripomoček `tests/development/helpers.ts` za nadzorovane GET odgovore in prenose ali lastne pripomočke v `tests/agent/`. Aplikacija jih ne uvaža. Testni podatki spoštujejo domeno izvirnih zahtev; čisto pravilo nevtralizacije se lahko preveri neposredno tudi ločeno od omejenih tipov statusa in datuma.

## Meje, tveganja in stanje

Glavni preverljivi tveganji sta prezgodnje uničenje lokalnega stanja ob preklopu pogleda in izguba natančnih bajtov pri oblikovanju CSV; struktura skupne komponente in primerjave prenesenih datotek ju neposredno naslovijo. Mobilni preliv se preveri z dejansko širino dokumenta in vizualnim pregledom.

Načrt je skladen z dovoljenimi potmi in ne zahteva sprememb infrastrukture ali novih API-jev. Bistvenih odprtih vprašanj ni. V tej fazi sta opravljena lokalni pregled in načrtovanje; implementacija in izvajanje testov še nista opravljena.
