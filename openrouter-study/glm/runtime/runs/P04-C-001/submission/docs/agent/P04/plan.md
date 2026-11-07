# P04 Implementation Plan

**Cilj**: Izvesti P04 po `docs/agent/P04/spec.md` brez sprememb strežnika, API-ja, odvisnosti, skupnih tipov ali infrastrukture.

## Technical Context

- Aplikacija je React + TypeScript + Vite; obstoječi pogledi so v `src/App.tsx` in `src/TaskBoard.tsx`, oblikovanje pa v `src/styles.css`.
- Branje podatkov ostane prek obstoječega javnega API-ja prek `src/useResource.ts`; razvrščanje ne dodaja pisanj.
- Potrjeni dizajn Folio se ohrani z obstoječimi gradniki, barvami, odmiki, odzivnostjo in dostopnimi imeni iz `docs/dizajn.md`.

## Design Decisions

1. **Razvrščanje kot čista projekcija**  
   Ustvari `src/sorting.ts` z tipi `SortKey`, `SortOrder` in `SortSettings`, privzetimi vrednostmi ter funkcijo, ki kopira vhodno polje in ne spremeni opravil. Primerjava vrača `-1`, `0` ali `1`; za `desc` se pomnoži izid primerjave, končno polje se ne zrcali.

2. **Izrecna stabilnost**  
   Vsakemu elementu pred razvrščanjem pridruži izvorni indeks. Ob enakosti izbranega ključa (in morebitnem sekundarnem ključu) primerjalnik uporabi izvorni indeks. To velja tudi, kadar sta primarni in sekundarni ključ enaka ali kadar je primarni ključ `original`.

3. **Natančne primerjave**  
   Za `title` in `assignee` normaliziraj NFD, odstrani U+0300–U+036F, pretvori v male črke in primerjaj po UTF-16 z `<`/`>`. Ne uporabljaj `localeCompare` ali `Intl.Collator`. Za `status` uporabi zaporedje `todo`, `in_progress`, `done`; za veljavne `YYYY-MM-DD` primerjaj datumske nize kronološko.

4. **Stanje samo za trenutni projekt**  
   V `App` renderiraj `ProjectView` s `key={project.id}`; lokalno stanje s privzetimi vrednostmi se tako čisto ponastavi ob zamenjavi projekta. Ne shranjuj ga v URL, `localStorage` ali strežnik. Preklop pogleda in odpiranje podrobnosti sta prosti spremembi `project.id`, zato nastavitve ostaneta.

5. **Enoten razvrščen rezultat**  
   `visibleTasks` izpelji z `useMemo` in ga podaj tako preglednici kot `TaskBoard`. Če je sekundarni ključ enak primarnemu, ga ne uporabi še enkrat; s tem se izogne dodatnemu obratu pri enakih vrednostih. Števci stanj in izvorno polje ostanejo iz nespremenjenih `tasks`; tabela dobi `visibleTasks`.

6. **Kontrole v obstoječem odseku**  
   V `src/App.tsx` dodaj štiri `select` kontrole z zahtevanimi slovenskimi dostopnimi imeni in gumbom `Izvorni vrstni red`. Razporeditev reši z novo, odzivno `sort-controls` plastjo v `src/styles.css`; na 390 px se stran ne sme razširiti.

7. **Ohranitev table**  
   `TaskBoard` ohrani zaporedje stolpcev `todo`, `in_progress`, `done`. `filter` ohranja relativni vrstni red prejetega `visibleTasks`, zato je vrstni red znotraj stolpcev enak razrezu pregledničnega polja.

## File Plan

| Datoteka | Delo |
| --- | --- |
| `src/sorting.ts` | Nov modul za tipe, privzete nastavitve, normalizacijo in stabilno projekcijo. |
| `src/App.tsx` | Stanje nastavitev, kontrole, reset, prehod na `visibleTasks` in ohranjanje obstoječih funkcij. |
| `src/TaskBoard.tsx` | Brez logičnih sprememb; obstoječi `filter` ohrani relativni vrstni posredovane projekcije. |
| `src/styles.css` | Odzivna Folio slogovna dopolnitev za nove kontrole. |
| `tests/agent/P04.spec.ts` | Lastna Playwright preverjanja za R01–R12, vključno s praznim in enim opravilom. |
| `docs/agent/P04/spec.md` | Po izvedbi posodobi sledljivost z dejanskimi mesti in izidi. |

## Verification Plan

1. Zažení samo lastni test: `npm test -- tests/agent/P04.spec.ts`.  
2. Zažení obstoječe skupne teste: `npm test -- tests/baseline.spec.ts tests/api.spec.ts`.  
3. Zažení `npm run lint` in `npm run build`.  
4. Vsak neuspeh popraví in ponovno zaženi relevantne preglede. Izida ne označi za uspešnega brez dejanskega zagona.

## Out of Scope

- Brez novih API-jev, odvisnosti, server changes, shared type changes, URL/localStorage persistence, locale-aware sorting ali infrastrukturne spremembe.
