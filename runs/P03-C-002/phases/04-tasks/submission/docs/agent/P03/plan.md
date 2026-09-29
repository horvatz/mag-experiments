# Načrt izvedbe P03

2026-09-23. Podlaga: [specifikacija in skupna predloga](spec.md), [izvirne zahteve](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md) in [dizajn Folio](../../dizajn.md). Specifikacija ostaja osrednji dokument sprejemnih pogojev in sledljivosti.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6 in Vite 8; ikone zagotavlja nameščeni `lucide-react`. Node je 24.11, preverjanje uporablja ESLint, TypeScript in Playwright 1.63 z nameščenim Chromiumom ter priloženo povezavo brskalnika. Odvisnosti in nastavitve ostanejo nespremenjene.

`src/App.tsx` vsebuje `ProjectView`, pridobivanje opravil, pregled stanj, preglednico in preklop pogleda. `src/TaskBoard.tsx` že razvršča prejeti seznam po stanju ter računa števce stolpcev. `src/useResource.ts` uporablja preklic zahteve in ključ vira; `ProjectView` ima že `key={project.id}`. Navigacija uporablja hash in ohrani isto komponento pri preklopu pogleda. Skupni tipi `Task`, `TaskStatus` in `Project` so samo berljivi.

## Odločitve in tok podatkov

1. **Začasno stanje v ProjectView (R01, R06–R08, R11).** Dodamo en lokalni objekt filtrov `query`, `status`, `assignee` s privzetimi vrednostmi `""`, `all`, `all`. Čiščenje ga ponastavi z eno posodobitvijo. Obstoječi ključ projekta zagotovi ponastavitev ob menjavi projekta; sprememba pogleda ne spremeni ključa. Ne uporabljamo učinkov za zakasnjeno ponastavljanje, URL-ja ali brskalnikove shrambe.
2. **En izpeljani seznam (R02–R04, R06, R11).** Majhen čisti pomočnik v `src/taskFilters.ts` uresniči predikate iz specifikacije: NFD, odstranitev U+0300–U+036F, male črke, delitev po belinah, dobesedni `includes` za vsako besedo, nato IN s stanjem in natančno osebo. Filtriranje z `Array.filter` ne razvršča ali spreminja opravil. Besede pripravimo enkrat za izpeljavo seznama. Ni novih omrežnih zahtev, indeksov ali odvisnosti.
3. **Podatki ločeni od izpeljanega prikaza (R05, R09).** `tasks` ostane izvorni odgovor API-ja. `visibleTasks` se uporabi za preglednico, tablo, pregled stanj in števce prikaza. `M` in možnosti oseb izhajajo iz vseh `tasks`; `N` iz `visibleTasks`. Imena združimo s `Set`, izločimo samo prazne nize in ohranimo vrstni red prve pojavitve, brez normalizacije imen.
4. **Ohranitev table (R06, R09).** `TaskBoard` prejme `visibleTasks`; obstoječe razvrščanje v stolpce, štetje, oznake in povezave že izpolnijo zahteve. Sprememba njegove notranje zgradbe ni potrebna. Preglednica preslika isti seznam, povezave in ključi ostanejo vezani na ID.
5. **Prazna stanja (R10).** Pri `tasks.length > 0 && visibleTasks.length === 0` pokažemo `Ni zadetkov.` ob ohranjenih kontrolah in preklopu pogleda. Tabla se še vedno izriše s tremi praznimi stolpci. Preglednica ne uporabi besedila za prazen projekt pri neuspešnem iskanju. Za resnično prazen projekt ostanejo obstoječa prazna stanja preglednice/table in števec 0 od 0.
6. **Kontrole in slog (R12 in dogovor o vmesniku).** Nad vsebino dodamo označen iskalni vnos, dva označena HTML selecta, gumb za čiščenje in status rezultatov z natančnimi imeni iz specifikacije. Uporabimo obstoječe CSS spremenljivke, sistemsko pisavo, svetle robove in vidni fokus. Razporeditev se prelomi pri ozki širini, kontrole imajo omejeno širino in `min-width: 0`; drsenje podatkov ostane v obstoječih vsebnikih. Obstoječa stranska navigacija, kartice in podrobnosti ostanejo v slogu Folio.

Tok: `GET opravila projekta → tasks → filterTasks(tasks, filters) → visibleTasks → preglednica / TaskBoard / števci`. Možnosti oseb in imenovalec števca se odcepijo neposredno iz `tasks`. Obstoječa stanja nalaganja, napake in ponovnega poskusa ostanejo nedotaknjena. API za zapisovanje se ne kliče; aplikacija ne uvaža testnih kontrol ali pripomočkov.

## Datoteke in vrstni red dela

| Datoteka | Predvidena vsebina oziroma poseg | Zahteve |
| --- | --- | --- |
| `src/taskFilters.ts` (nova) | Tip lokalnih filtrov, privzete vrednosti, normalizacija in čisti filter. | R01–R04, R11 |
| `src/App.tsx` | Stanje filtrov, možnosti oseb, kontrole, skupni prikazani seznam, števci in prazna stanja. | R01–R12 |
| `src/styles.css` | Omejeni slogi novih kontrol in statusa, prelom na ozki širini. | R12 |
| `tests/agent/P03.spec.ts` (nova) | Scenariji S01–S07 z dodatnimi kontroliranimi podatki in preverjanjem omrežja. | R01–R12 |
| `docs/agent/P03/spec.md` | Dopolnitev sledljivosti z dejanskimi funkcijami, testi, izidi in zgodovino. | R01–R12 |
| `docs/agent/P03/verification.md` in dnevniki | Jedrnat zapis ukazov, izidov, vizualnega pregleda in omejitev, povezan iz specifikacije. | Dokazila |

Najprej pomočnik in integracija, nato slogi, nato preverjanje in dopolnitev sledljivosti. `TaskBoard.tsx`, navigacija, API in podrobnosti se predvidoma samo ponovno uporabijo. Strežnik, skupni testi, tipi, konfiguracije, odvisnosti in datoteke veščin se ne spreminjajo. Izvedba ostaja pri enem agentu, brez vej ali commitov.

## Preverjanje in dokazila

Lastni Playwright testi uporabijo obstoječo konfiguracijo projekta `agent` in lahko ponovno uporabijo javne testne pripomočke iz `tests/development/helpers.ts` izključno v testih. Pričakovani ID-ji so določeni iz scenarijev, ne z uvozom produkcijskega predikata. Vključimo:

- S01/S02: poljubni ID-ji, več kot deset opravil, enaki naslovi, izvorno zaporedje, iskanje po vsakem polju, Unicode, več besed čez polja, beline in dobesedna ločila.
- S03/S04: presek treh pogojev, natančno različna imena oseb in popolnost njihovih možnosti, isti ID-ji obeh pogledov, pravilni stolpci ter N/M in pregled stanj.
- S05/S06: preklop obeh projektov in nazaj, osvežitev, nespremenjeni URL/shramba, prazen projekt, eno opravilo, nič zadetkov in čiščenje vseh kontrol.
- S07: odpiranje podrobnosti po ID-ju pri enakih naslovih, odsotnost zapisovalnih zahtev, primerjava podatkov pred/po, uporabnost obeh pogledov pri 390 pik. Shranimo posnetka namiznega in ozkega prikaza ter ju vizualno pregledamo glede na Folio.

Izvedemo `npm run lint`, `npm run build` (vključuje TypeScript) in `npm test` (API, baseline desktop/mobile, razvojni desktop/mobile in agent testi). Dnevnike hranimo pod `docs/agent/P03/`; Playwright ohrani svoje običajne izhodne mape. Po napaki popravimo dovoljeno kodo ali lasten test in ponovimo prizadeta preverjanja. Uspešne teste brez novih razlogov ne ponavljamo. Dokumentacija navede dejanske ukaze in izide ter ne predstavlja nedostopnih končnih testov kot uspešnih.

## Skladnost in omejitve

Načrt je skladen z ustavo: vse R01–R12 imajo sprejemne pogoje v specifikaciji in načrtovana mesta izvedbe/preverjanja; dizajn, infrastruktura in podatkovni API se ohranijo. Odločitev za majhen pomočnik ni širša arhitekturna prenova. Ni novih funkcionalnih zahtev, meritev zmogljivosti ali odvisnosti. Navigacija med nedokončanim nalaganjem in sočasne spremembe podatkov ostanejo v izhodiščnem regresijskem obsegu.

Načrt temelji na lokalnem pregledu kode, tipov, slogov in razvojnih testov. V tej fazi ni implementacije ali izvedenih aplikacijskih testov. Skupni rok se spremlja z `node task/time-budget.mjs`; zadnja minuta je namenjena predaji z jasno navedenimi nepreverjenimi deli.
