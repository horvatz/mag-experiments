# P08 — Plan izvedbe: koledarski pregled rokov

Spec: `docs/agent/P08/spec.md` (R01–R12). Ustava: `.specify/memory/constitution.md`.
Pot: `docs/agent/P08` (`.specify/feature.json`). Datum: 2026-10-09.

## Povzetek

V obstoječo aplikacijo Folio dodamo pogled rokov: referenčni datum
(začetno 2026-09-21), izbirnik all/overdue/today/week/later/done, pet
števcev in filtrirane vrstice/kartice. Logika je v čistem modulu, stanje v
`ProjectView`; infrastruktura, strežnik in dizajn ostanejo nespremenjeni.

## Tehnični kontekst

- React 19.3 + TypeScript 6.0 + Vite 8.3, ikone `lucide-react`; Node 24.11.
- Podatki samo prek obstoječega javnega `GET /api/` (`src/useResource.ts`,
  `src/api.ts`); strežnik je simuliran in v pomnilniku.
- Preverjanje: Playwright 1.63 (`npm test`), poleg tega `npm run typecheck`,
  `npm run lint`, `npm run build`. Brez novih odvisnosti.
- Dizajn: `docs/dizajn.md`, slogovne spremenljivke v `src/styles.css`.

## Skladnost z ustavo

- I. Folio: spremembe uporabljajo obstoječe gradnike in spremenljivke; brez
  prenove videza.
- II. Obseg: `src/`, `tests/agent/`, `docs/agent/`; `server/`, `shared/`,
  skupni testi, odvisnosti in nastavitve nespremenjeni.
- III. `/api/`: samo branje prek javnega vmesnika; brez `/__test/` v UI,
  brez trajne shrambe; ni novih zapisovalnih poti.
- IV. Sledljivost: R01–R12 iz specifikacije se povežejo s kodo in izvedenimi
  testi; neizvedeno se ne označi kot uspešno.
- V. Preverjanje: lastni testi v `tests/agent/` in skupni testi.

## Odločitve in arhitektura

1. **Nov čisti modul `src/dueDates.ts`**: tipi `DueGroup` in `DueFilter`;
   `isValidDate` (natančen `YYYY-MM-DD`), `diffDays(ref, due)` z aritmetiko
   `Date.UTC` (neodvisno od pasu/DST), `dueGroup(task, ref)` po predikatih iz
   specifikacije, `dueCounts(tasks)` in `visibleTasks(tasks, filter)`.
   `src/formatDate.ts` ostane samo za prikaz (posodobitev povezave v
   specifikaciji med izvedbo).
2. **Stanje v `src/App.tsx` (`ProjectView`)**: `refDate` in `refInput`
   (začetno `2026-09-21`), `dueFilter` (začetno `all`); neveljaven/prazen
   vnos ne spremeni `refDate`, prikaže `role=alert` z „Vnesi veljaven
   referenčni datum.“ in ga ob ponovnem veljavnem vnosu odstrani.
3. **Kontrole**: `input type=date` z oznako Referenčni datum in `select`
   Pogled rokov (all/overdue/today/week/later/done) v glavi projekta;
   imena skupin Zapadlo, Danes, Naslednjih 7 dni, Pozneje, Končano.
4. **Števci**: pet elementov `strong` z `aria-label="Število rokov <ključ>"`
   in samo številom, znotraj obstoječega `[aria-label="Pregled stanj
   opravil"]`; števci so neodvisni od aktivnega filtra.
5. **Filtriranje**: preglednica in `TaskBoard` prejmeta `visibleTasks`;
   `data-task-id`, dostopna imena pogledov/stolpcev in odpiranje podrobnosti
   ostanejo; prazna skupina v nepraznem projektu pokaže „Ni opravil v
   izbrani skupini.“, prazen projekt pet ničel.
6. **Ponastavitev**: `ProjectView` se ob menjavi projekta remountira
   (`key={project.id}`); osvežitev ponastavi sama. Filter se ne hrani v
   `localStorage` ali URL-ju; preklop pogleda ohrani datum, besedilo polja
   in skupino.
7. **Slogi `src/styles.css`**: `.summary-grid` na pet stolpcev in kontrole
   datumov z obstoječimi spremenljivkami; obstoječe odzivne meje (760, 390
   pik) se ohranijo, pri 390 pik se stran ne razširi.
8. **Testi `tests/agent/`**: `dueDates.spec.ts` (enote: meje REF−1/REF/REF+1/
   REF+7/REF+8, done prednost, prestopni februar, menjava leta, disjunktnost)
   in `dueView.spec.ts` (UI: začetno stanje, števci, opozorilo in ponovni
   preračun, preklop pogleda in projekta, prazen projekt, brez zapisov).
   Pomožne funkcije `tests/development/helpers.ts` se uporabljajo samo za
   branje (testni program, ne UI).

## Struktura datotek

```text
docs/agent/P08/
├── spec.md      # zahteve R01–R12 (v1.0)
├── plan.md      # ta načrt
└── tasks.md     # koraki (iz $speckit-tasks)
src/
├── dueDates.ts  # novo: čista koledarska logika
├── App.tsx      # stanje, kontrole, števci, filtriranje
├── TaskBoard.tsx# prejme filtrirana opravila (brez spremembe podatkov)
└── styles.css   # števci in kontrole po obstoječih spremenljivkah
tests/agent/
├── dueDates.spec.ts  # novo: enotski testi predikatov
└── dueView.spec.ts   # novo: UI scenariji P08
```

## Tveganja in preverjanje

- Mejni dnevi in prestopna leta: preveri `dueDates.spec.ts` neposredno na
  funkcijah; enakost med preglednico in tablo preveri primerjava
  `data-task-id`.
- Prazno datumsko polje: Playwright `fill('')` mora sprožiti opozorilo in
  ohraniti zadnji preračun; ponovni vnos opozorilo odstrani.
- Nobenega zapisa na API: test spremlja zahtevke (`readonly`) in primerja
  `/__test/state` (`saveRequests`).
- Končni testi izvajalca niso dostopni; izidi se vpišejo po dejanskem zagonu.
