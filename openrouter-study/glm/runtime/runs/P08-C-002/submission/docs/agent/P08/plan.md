# P08 — Izvedbeni načrt

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript 6 + Vite 8, s Playwrightom kot testnim
  ogrodjem. Obstoječi vmesnik je v `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/TaskDetails.tsx`, `src/components.tsx`, `src/navigation.ts`,
  `src/styles.css` in `src/useResource.ts`.
- Strežnik, `shared/types.ts`, skupni testi, odvisnosti in nastavitve ostanejo
  nespremenjeni. Podatke beremo iz obstoječega `GET /api/projects/.../tasks`
  in `GET /api/tasks/...`; novih zapisovalnih klicev ni.
- Izvod je na voljo v `docs/agent/P08/spec.md`; obvezno pravilo je ohranitev
  potrjenega dizajna Folio.

## Odločitve

1. **Ločena koledarska logika.** Dodaj `src/dueDates.ts` s tipi
   `DueDateGroup = 'overdue' | 'today' | 'week' | 'later' | 'done'` in
   `DueDateFilter = DueDateGroup | 'all'` ter funkcijami:
   - `parseDate(value)` za strogo preverjanje `YYYY-MM-DD`;
   - `addDays(date, days)` kot čisto koledarsko aritmetiko na nizu;
   - `getDueDateGroup(task, referenceDate)` z določenim vrstnim redom:
     `done`, nato `overdue`, `today`, `week` in `later`.
   Datum ne pretvarjamo v `Date`, ker to vnose ure, pasove in poletni čas.

2. **Krajevno stanje v projektu.** V `ProjectView` obdrži referenčni datum,
   besedilo datumskega polja in izbrano skupino. `key={project.id}` že zagotavlja
   ponastavitev ob menjavi projekta. Začetni vrednosti sta vedno `2026-09-21`
   in `all`; stanje se ne zapisuje v URL, `localStorage` ali druge trajne shrambe.

3. **Nadzorovana obdelava neveljavnega vnosa.** Ob vnosu datuma ločeno hranimo
   besedilo polja in zadnji veljavni referenčni datum. Prazen ali neveljaven vnos
   prikaže `role="alert"` z navedenim besedilom in pusti zadnji veljaven preračun.
   Nov veljaven vnos takoj posodobi preračun in odstrani opozorilo, izbrana
   skupina pa ostane.

4. **Enoten izračun števcev in filtriranje.** Iz istega nabora opravil izračunaj
   vseh pet skupin ter števce. Filter naj ne vpliva na števce, temveč samo na
   `filteredTasks`, ki ga podata tabeli in tabli. Oba prikaza ohranita izvorni
   vrstni red in enake ID-je.

5. **Minimalne spremembe obstoječih pogledov.** `ProjectView` doda kontrole
   `Referenčni datum` in `Pogled rokov`, pet števcev ter opozorilo; tabela dobi
   filtrirane vrstice. `TaskBoard` spremeni vnos na filtriran seznam kartic z
   istim vrstnim redom in obstoječo zgradbo kartice ter ohrani `data-task-id`.
   Ne spreminjamo navigacije, podrobnosti ali javnega API-ja.

6. **Dizajn in dostopnost.** Nove kontrole vgradimo v obstoječo projektno
   glavo oz. nadzorno območje in oblikujemo z obstoječimi spremenljivkami ter
   razredi v `src/styles.css`. Pet števcev ima predpisana dostopna imena in samo
   številko. Ohranimo obstoječa dostopna imena, focus, notranje drsenje ter
   obnašanje na 390 px.

## Datoteke in koraki

| Korak | Datoteke | Vsebina |
| --- | --- | --- |
1 | `src/dueDates.ts` | Datumsko preverjanje, koledarska aritmetika, klasifikacija in metapodatki skupin. |
2 | `src/App.tsx` | Stanje referenčnega datuma in filtra, števci, kontrole, opozorilo, filtriranje in posodobljen prikaz tabele. |
3 | `src/TaskBoard.tsx` | Filtrirana tabla v izvornem vrstnem redu, ohranjene kartice, oznake in dostopnost. |
4 | `src/styles.css` | Postavitev novih kontrol in števcev v obstoječem Folio vizualnem jeziku, odzivnost 390 px. |
5 | `tests/agent/P08.spec.ts` | Agentovi Playwrightovi testi za vseh pet skupin, meje, preklope, ponastavitev in ohranjene poglede. |
6 | `docs/agent/P08/spec.md` | Po izvedbi posodobi sledljivost R01–R12 z dejanskimi izidi. |

## Preverjanje

- `npm run typecheck`: statična veljavnost TypeScripta.
- `npm test`: skupni testi in agentovi testi P08.
- `npm run build`: proizvodna izgradnja po uspešni tipizaciji.
- Ročno/preverbeno pokrij še kritične meje:
  - `2026-09-20` → `overdue`, `2026-09-21` → `today`;
  - `2026-09-22` in `2026-09-28` → `week`, `2026-09-29` → `later`;
  - `2026-09-30 → 2026-10-01`, `2026-12-31 → 2027-01-01`,
    `2024-02-28 → 2024-02-29`;
  - končana opravila vedno `done`;
  - prazen projekt, prazna izbrana skupina, menjava projekta in osvežitev;
  - isti ID-ji v preglednici in tabli, ohranjeni stari pogoji.

## Tveganja in meje

- Ne razširjamo stanja nalaganja in sočasnih sprememb brez osvežitve čez
  obstoječe regresije.
- Testni pripomočki `/__test/` so izključno za testni program; produkcijska koda
  jih ne sme uvoziti ali klicati.
- Končni skriti testi niso na voljo, zato se izidi uvrstijo šele po dejanskem
  zagonu pripravljenih testov.
