# P08 — Načrt izvedbe

Status: načrt je pripravljen pred implementacijo. Izhodišče je obstoječa aplikacija Folio; strežnik, skupni tipi, javni API in testna infrastruktura ostanejo nespremenjeni.

## Tehnični kontekst

- React 19, TypeScript in Vite; ikone so `lucide-react`, preverjanja pa ESLint, `tsc` in Playwright.
- Podatke beremo z obstoječima GET potema `/api/projects` in `/api/projects/:id/tasks`. P08 ne dodaja zapisovalnih API-jev.
- Stanje koledarskega pregleda je lokalno komponenti trenutnega projekta, ne v URL-ju, `localStorage` ali drugi trajni shrambi.

## Odločitve

1. Datumsko logiko izločimo v čisti modul `src/dueDates.ts`.
   - Konstanti: `DEFAULT_DUE_DATE = "2026-09-21"` in privzeti pogled `all`.
   - Funkciji `addCalendarDays(date, days)` in `getDueDateGroup(task, referenceDate)` uporabljata samo koledarski zapis `YYYY-MM-DD` v UTC, brez ure, lokalnega časovnega pasu in poletnega časa.
   - Vrstni red primerjav: `done` pred datumom; nato `overdue`, `today`, `week` in `later`. Skupine so tako enolične in disjunktne.
2. Stanje referenčnega datuma, izbrane skupine, besedila vnosnega polja in opozorila upravlja `ProjectView` z React stanjem.
   - `ProjectView` je že obešen s `key={project.id}`, zato menjava projekta ponastavi lokalno stanje. Osvežitev ga prav tako ponastavi.
   - Veljaven datum takoj preračuna skupine; prazen ali neveljaven vnos prikaže `role="alert"` z `Vnesi veljaven referenčni datum` in ohrani zadnji veljaven izračun.
   - Stanje se prenese prek preklopa med preglednico in tablo, ker se URL spremeni znotraj istega projekta.
3. Števce in kontrole postavimo v obstoječi povzetek projekta v `src/App.tsx`, v slogu Folio.
   - Pet števcev ima `aria-label="Število rokov <ključ>"` in samo številsko vrednost; imena so `Zapadlo`, `Danes`, `Naslednjih 7 dni`, `Pozneje` in `Končano`.
   - `input type="date"` ima oznako `Referenčni datum`; HTML izbirnik `Pogled rokov` ponudi vseh šest vrednosti.
   - Števci vedno štejejo celoten trenutni projekt in se ne spreminjajo z aktivnim filtrom.
4. Preglednica in tabla prejmeta isti filtriran seznam opravil v izvornem API-vrstnem redu.
   - Tabela uporabi obstoječe stolpce in ohrani `data-task-id`.
   - `TaskBoard` ohrani svoje tri obstoječe stolpce po stanju, prikazuje le filtrirana opravila in ohrani `data-task-id`.
   - Prazen projekt prikaže pet ničel. Prazna izbrana skupina v nepraznem projektu v obeh prikazih prikaže `Ni opravil v izbrani skupini.` in omogoča preklop na drugo skupino ali `all`.
5. Spremembe so minimalne in znotraj obstoječega dizajna.
   - Ne spreminjamo navigacije po hash poteh, strežnika, `shared/types.ts`, skupnih testov, odvisnosti ali Playwright nastavitev.
   - Nova dejanja ob opravilu niso potrebna; obstoječa povezava do podrobnosti ostane enaka.

## Spremembe po datotekah

| Datoteka | Načrtovana sprememba |
| --- | --- |
| `src/dueDates.ts` | Nov čist modul s tipi skupin, koledarsko aritmetiko, klasifikacijo in števci. |
| `src/App.tsx` | Lokalno stanje referenčnega datuma in filtra, nove kontrole, pet števcev, skupni filtriran seznam in prilagojena prazna stanja. |
| `src/TaskBoard.tsx` | Uporabi filtriran seznam iz propsa in omogoči enotno prazno sporočilo brez spreminjanja obstoječih stolpcev. |
| `src/styles.css` | Dopolni obstoječe slogovne razrede za kontrole in pet števcev; ohrani Folio tipografijo, barve, fokus in prelom na 390 px. |
| `tests/agent/P08.spec.ts` | Novi Playwright razvojni testi za R01–R12 z nadzorovanimi GET odgovori. |

## Zaporedje

1. Dodaj in uporabi čiste funkcije za koledarsko razvrščanje.
2. V `ProjectView` dodaj stanje, kontrole, pet števcev in skupni filtriran seznam.
3. Prilagodi prazna stanja ter preklop med preglednico, tablo in projektom.
4. Dopolni slogove v obstoječem Folio dizajnu in preveri širino 390 px.
5. Dodaj agentne Playwright teste in posodobi sledljivost v specifikaciji po dejanski izvedbi.

## Preverjanje

- Testni scenariji pokrijejo:
  - meje `overdue/today/week/later`, prednost `done` in prestopne datume;
  - vseh šest izborov, nespremenjene števce pri filtriranju in izvorni vrstni red;
  - veljaven, prazen in ponovno veljaven referenčni datum z opozorilom in ohranjenim filtrom;
  - enake ID-je v preglednici in tabli ter ohranjenje stanja ob preklopu;
  - ponastavitev ob menjavi projekta in osvežitvi ter odsotnost trajne shrambe ali URL parametrov;
  - prazen projekt, prazno izbrano skupino in odsotnost zapisovalnih zahtev;
  - obstoječa dostopna imena, `data-task-id` in širino 390 px.
- Ukazi: `npm run lint`, `npm run build` in `npm test -- tests/agent/P08.spec.ts`; po uspehu po potrebi še celoten `npm run check`.
- Vsak uspeh zapiši v specifikacijo z imenom testa ali ukaza in dnevnikom zagona. Neizvedenih preverjanj ne navajaj kot uspešnih.

**Sledljivost:** `docs/agent/P08/spec.md`, `task/instructions.md`, `PROJECT_RULES.md`, `.specify/memory/constitution.md`.
