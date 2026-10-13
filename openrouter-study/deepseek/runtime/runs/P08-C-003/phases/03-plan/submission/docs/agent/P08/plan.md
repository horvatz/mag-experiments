# Načrt izvedbe: P08 — Koledarski pregled rokov

**Pot funkcionalnosti**: `docs/agent/P08`
**Datum**: 2026-10-13
**Viri**: `docs/agent/P08/spec.md`, `.specify/memory/constitution.md`, `task/instructions.md`, `PROJECT_RULES.md`

## Tehnični kontekst

- React 19 + TypeScript + Vite; obstoječe odvisnosti in nastavitve se ne spreminjajo.
- Podatki se berejo prek javnega API-ja (`GET /api/projects`, `GET /api/projects/{id}/tasks`)
  z obstoječima `useResource` in `request`; zapisovalne zahteve se ne dodajajo.
- Testiranje: Playwright; projekt `agent` pokriva `tests/agent/**/*.spec.ts`,
  razvojni primeri pa so v `tests/development/P08.spec.ts` (samo berljivi).
- Stanje funkcionalnosti je lokalno v komponenti projektnega pogleda; brez trajne
  shrambe, URL-ja in novih globalnih odvisnosti.

## Arhitekturne odločitve

1. **Čisti koledarski modul `src/deadlines.ts`**: funkcije za veljavnost datuma
   (`YYYY-MM-DD`), seštevanje dni in razliko v koledarskih dneh prek `Date.UTC`
   (enako kot `formatDate.ts`, brez časovnega pasu in poletnega časa), ter
   `deadlineGroup(task, referenceDate)` in pomožni funkciji za števce in filtriranje.
   Modul ne bere ure naprave in nima stranskih učinkov, zato je neposredno preverljiv.
2. **Ločena komponenta `src/DeadlineControls.tsx`** za polje `Referenčni datum`
   (`input type=date`), izbirnik `Pogled rokov` in pet števcev z `aria-label`
   `Število rokov <ključ>`; pri praznem ali neveljavnem vnosu izriše opozorilo z
   `role=alert` (`Vnesi veljaven referenčni datum.`). Kontroli imata dostopni imeni
   točno `Referenčni datum` in `Pogled rokov` (razvojni testi ju iščejo tako).
3. **Stanje v `ProjectView` (v `src/App.tsx`)**: `dateText` (besedilo polja),
   `referenceDate` (zadnji veljavni datum, začetno `2026-09-21`), `deadlineView`
   (začetno `all`) in `invalid`. Menjava projekta in osvežitev ponastavita stanje
   prek remonta (`key={project.id}`), brez shranjevanja.
4. **En vir filtriranih opravil**: izračunane vidne vrstice (`V`) se uporabijo za
   preglednico in za `TaskBoard`; oba pogleda zato prikazujeta iste ID-je,
   `data-task-id` pa ostane na vrsticah in karticah. Obstoječe oznake
   (`Pregled stanj opravil`, dostopna imena pogledov in stolpcev) ostanejo.
5. **Prazna stanja**: prazen projekt prikaže pet ničel; prazna skupina v nepraznem
   projektu prikaže `Ni opravil v izbrani skupini.` in pusti izbirnik aktiven.
6. **Videz Folio**: nova kontrola se vklopita v obstoječo postavitev z obstoječimi
   slogovnimi spremenljivkami; pri 390 pikah se stran ne razširi (notranje drsenje
   preglednice in table je že urejeno).

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/deadlines.ts` | novo: čisti koledarski pomočniki, skupine, števci, filtriranje |
| `src/DeadlineControls.tsx` | novo: datum, izbirnik, števci, opozorilo |
| `src/App.tsx` | stanje in filtriranje v `ProjectView`, povezava obeh pogledov |
| `src/TaskBoard.tsx` | po potrebi le sprejem filtriranih opravil (brez spremembe API-ja) |
| `src/styles.css` | slogi nove kontrole in prazne skupine v duhu Folio |
| `tests/agent/p08.spec.ts` | novo: lastni testi R01–R12 |

## Preverjanje

1. `npm run typecheck` in `npm run lint`.
2. `npx playwright test --project=agent` za lastne teste.
3. `npx playwright test tests/development/P08.spec.ts` za razvojne primere D01–D04
   (samo branje, brez spreminjanja).
4. Skupni regresijski testi ostanejo nespremenjeni in se ne prilagajajo.

## Tveganja in omejitve

- Datumi se obravnavajo izključno koledarsko; vsaka uporaba lokalnega časa je napaka.
- Razvojni testi preverjajo tudi odsotnost zapisov (`/__test/state`) in širino strani.
- Končnih testov izvajalca ni mogoče brati; preverjanje ostane na lokalnih in
  razvojnih primerih, nepreverjeni deli se zapišejo v specifikacijo.
