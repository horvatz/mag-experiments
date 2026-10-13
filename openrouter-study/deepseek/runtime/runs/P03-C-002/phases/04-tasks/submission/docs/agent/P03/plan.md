# P03 — Načrt izvedbe: Iskanje in sestavljeni filtri

Različica 1.0 (korak plan, 2026-10-09). Povezave: specifikacija
`docs/agent/P03/spec.md`, ustava `.specify/memory/constitution.md`, dizajn
`docs/dizajn.md`, izvirne zahteve `task/instructions.md`.

## Tehnični kontekst

- React 19 + TypeScript + Vite 8; ikone `lucide-react`; brez novih odvisnosti.
- Podatki: `GET /api/projects`, `GET /api/projects/:id/tasks` prek
  `src/useResource.ts`; brez novih zapisovalnih klicev.
- Testi: Playwright 1.63; skupni `tests/baseline.spec.ts` in `tests/api.spec.ts`
  (samo branje), razvojni primeri `tests/development/P03.spec.ts` in pomočnik
  `tests/development/helpers.ts` (branje dovoljeno, uvaža se samo v testih).
- Lastni testi: nov `tests/agent/P03.spec.ts` (projekt `agent` v
  `playwright.config.ts` že obstaja).

## Struktura datotek

| Datoteka | Sprememba |
| --- | --- |
| `src/filters.ts` | Novo: čiste funkcije `norm`, `words`, `matchTask`, `filterTasks`, `assigneeOptions`. |
| `src/App.tsx` | Stanje filtrov v `ProjectView`, kontrolna vrstica, `S`/`N`, `role=status`, sporočilo `Ni zadetkov.`, posredovanje `S` v pogleda. |
| `src/TaskBoard.tsx` | Prejme filtrirana opravila; stolpci in števci samodejno štejejo `S` (pogodba nespremenjena). |
| `src/styles.css` | Slogi kontrolne vrstice z obstoječimi Folio gradniki; 390 px brez prelivanja strani. |
| `tests/agent/P03.spec.ts` | Novo: scenariji R01–R12 z razvojnim pomočnikom. |
| `docs/agent/P03/spec.md` | Posodobitev tabele sledljivosti z dokazi ob implementaciji. |

## Odločitve

1. **Odjemalsko filtriranje.** `S` se izračuna iz že naloženih `T(P)`; filtri ne
   sprožajo novih omrežnih klicev (R12), podatki se ne spreminjajo (R11).
2. **Stanje filtrov lokalno.** `useState` v `ProjectView`; obstoječi
   `key={project.id}` ob menjavi projekta ponovno ustvari komponento in s tem
   ponastavi `(q, s, a)` (R07). Brez URL-ja in trajne shrambe (R08); preklop
   pogleda je navigacija in stanja ne spremeni (R06).
3. **Ista množica v obeh pogledih.** `TaskBoard` dobi `S`; stolpec stanja
   prikaže `{ t ∈ S : t.status = c }`; števci stolpcev in pregled stanj štejejo
   `S` (R06, R09).
4. **Normalizacija.** `norm(x)`: NFD → odstranitev U+0300–U+036F → male črke.
   `words(q)`: `split(/\s+/u)` brez praznih delov. Ujemanje: `includes`
   (dobesedni podniz, brez regularnih izrazov) (R02, R03).
5. **Izbirnik oseb.** Možnosti `{all}` + različna neprazna imena iz celotnega
   `T(P)` (ne iz `S`), vsako natanko enkrat (R05). Menjava projekta ponastavi
   izbor (točka 2).
6. **Števec rezultatov.** Element `role=status` z `aria-label="Rezultati
   filtriranja"` kaže `Prikazano: N od M.`; prikazan je tudi ob `M = 0` kot
   `Prikazano: 0 od 0.` (R09, R10).
7. **Brez zadetkov.** Ob `M > 0 ∧ N = 0` sporočilo `Ni zadetkov.`; oba pogleda
   ostaneta uporabna. Ob `M = 0` ostane obstoječe prazno stanje (R10).
8. **Počisti filtre.** En gumb nastavi `q := ε`, `s := all`, `a := all` (R11).
9. **Dostopnost in vmesnik.** `input type=search` z imenom `Išči opravila`,
   izbora `Filter stanja` in `Filter odgovorne osebe`, gumb `Počisti filtre`;
   ohranjeni `data-task-id`, dostopna imena pogledov in stolpcev ter
   `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu zunaj
   povezave (R12). Razporeditev kontrol po zgledu Folio; pri 390 px se stran ne
   razširi, notranje drsenje preglednice/table ostane.
10. **Meje.** Brez sprememb `server/`, `shared/`, `tests/baseline.spec.ts`,
    `tests/api.spec.ts`, `navigation.ts`, `playwright.config.ts`, odvisnosti in
    nastavitev.

## Preverjanje

- `npm run typecheck` in `npm run build`.
- `npm test` (skupni in razvojni testi) ter `npx playwright test
  tests/agent/P03.spec.ts --project=agent` (lastni scenariji R01–R12).
- Ročna kontrola: Folio videz, 390 px brez prelivanja, fokus viden, omrežni
  dnevnik brez zapisovalnih klicev.
- Izidi se vpišejo v tabelo sledljivosti v `spec.md`; neizvedeni testi se ne
  navajajo kot uspešni.

## Tveganja in omejitve

- Končni ocenjevalni testi niso dostopni; preverjanje temelji na skupnih in
  lastnih testih.
- Razporeditev in besedilo novih kontrol nista predpisana; izbira sledi
  obstoječim Folio vzorcem.
- Sočasne spremembe podatkov med nalaganjem niso del obsega.
