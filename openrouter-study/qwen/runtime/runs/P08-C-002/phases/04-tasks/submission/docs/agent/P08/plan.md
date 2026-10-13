# P08: NaČrt implementacije
**Datum:** 2026-10-13

## 1. Tehnični kontekst

**Stack:** React + TypeScript, Vite Dev Server, Custom Hooks, Shared types, Javni API

## 2. Arhitekturne odločitve

State management: uporabimo obstoječih useResource.ts, dodan useDeadlineViewer hook za referenčni datum, brez trajne shrambe.
Components: novi CalendarHeader za datum in filtre, dodatni TaskCounters, osnovni TaskBoard ostaja nespremenjen.
Date processing: ločeni useDateLogic.ts za kategorizacijo opravil, leap year handling, format YYYY-MM-DD.

## 3. Struktura datotek

src/:
  - useDateLogic.ts (nova: datumski izračun)
  - useDeadlineView.ts (nova: state + hooks)
  - calendar-header.tsx (nova: date picker + filter)
  - task-counters.tsx (nova: 5 števec)
  - App.tsx (modifikacija: integracija)

## 4. Implementation Steps

| Korak | Datoteka | Akcija | Zahteve |
| ----- | -------- | ------ | ------- |
| 1 | src/useDateLogic.ts | Ustvari datumski hook | R03, R04, R05, R11 |
| 2 | src/calendar-header.tsx | Dodaj date input + dropdown | R08, R07 |
| 3 | src/task-counters.tsx | Ustvari 5 števec | R06 |
| 4 | src/App.tsx | Integriraj hook + UI | R01, R02 |
| 5 | Tests | Tests API + UI | R01-R12 |

## 5. Dependencies

- Brej dodatnih odvisnosti
- Uporaba React hooks, obstojecih api.ts, lucide-react ikone

## 6. Konvergenc
- docs/agent/P08/convergence.json dopolni z dokazi
- Sledi: \$speckit-converge

## 7. Namesto naslednjih namenov:
- \$speckit-converge – Izvodi implementacijo po korakih
- \$speckit-taskstoissues – Pretvori zahteve v naloge
