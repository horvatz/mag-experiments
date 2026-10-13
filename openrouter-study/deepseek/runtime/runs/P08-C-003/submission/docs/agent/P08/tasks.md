# Naloge: P08 — Koledarski pregled rokov

**Pot**: `docs/agent/P08` | **Datum**: 2026-10-13
**Viri**: `spec.md`, `plan.md`, `.specify/memory/constitution.md`

## Faza 1: Priprava

- [ ] T001 Preveri obseg in meje: `docs/agent/P08/spec.md`, `docs/agent/P08/plan.md`, `.specify/memory/constitution.md`; potrdi, da se `server/`, `shared/`, `package.json` in skupni testi ne spreminjajo.

## Faza 2: Temelj

- [ ] T002 V `src/deadlines.ts` dodaj čiste koledarske pomočnike: veljavnost `YYYY-MM-DD`, `addDays`, `daysBetween` prek `Date.UTC`, `deadlineGroup`, števce in filtriranje (R01–R05).
- [ ] T003 V `src/DeadlineControls.tsx` dodaj polje `Referenčni datum`, izbirnik `Pogled rokov` in pet števcev z `aria-label` `Število rokov <ključ>` ter opozorilo `role=alert` (R06, R08).
- [ ] T004 V `src/App.tsx` poveži stanje (`dateText`, zadnji veljavni datum, izbrana skupina) v `ProjectView`; ob menjavi projekta remont prek `key={project.id}`; filtrirane vrstice posreduj preglednici in tabli; prazna skupina prikaže `Ni opravil v izbrani skupini.` (R07, R09–R11).
- [ ] T005 V `src/styles.css` dopolni sloge nove kontrole in praznega stanja v duhu Folio; preveri, da se pri 390 pikah stran ne razširi (R12).

## Faza 3: Uporabniški scenarij P1 — števci in izbira skupine

- [ ] T006 Dopolni `src/App.tsx` in `src/deadlines.ts` za pet števcev celotnega projekta neodvisno od filtra in za izvorni vrstni red izbrane skupine (R06, R07).
- [ ] T007 V `tests/agent/p08.spec.ts` dodaj teste za začetni datum in skupino, meje overdue/today/week/later, disjunktnost in števce (R01–R04, R06, R07).

## Faza 4: Uporabniški scenarij P2 — referenčni datum

- [ ] T008 Dopolni `src/App.tsx` in `src/DeadlineControls.tsx`: veljaven datum takoj preračuna in ohrani filter; prazno polje ohrani zadnji veljavni izračun in pokaže opozorilo; ponoven veljaven vnos opozorilo odstrani (R08).
- [ ] T009 V `tests/agent/p08.spec.ts` dodaj teste za prestopni februar, meje meseca/leta, neveljaven vnos in odsotnost zapisov na API (R05, R08, R12).

## Faza 5: Uporabniška scenarija P3/P4 — pogledi in ponastavitev

- [ ] T010 Uskladi `src/App.tsx` in po potrebi `src/TaskBoard.tsx`: oba pogleda prikazujeta iste filtrirane ID-je, preklop ohrani datum, besedilo polja in skupino (R09).
- [ ] T011 V `src/App.tsx` poskrbi za ponastavitev ob menjavi projekta in osvežitvi ter za prazna stanja (pet ničel, prazna skupina), brez trajne shrambe in URL-ja (R10, R11).
- [ ] T012 V `tests/agent/p08.spec.ts` dodaj teste za preklop pogleda, ponastavitev, prazna stanja in širino 390 pik (R09–R12).

## Faza 6: Zaključek in dokazila

- [ ] T013 Zaženi `npm run typecheck` in `npm run lint`; odpravi napake v svojih datotekah.
- [ ] T014 Zaženi `npx playwright test --project=agent` in `npx playwright test tests/development/P08.spec.ts`; zabeleži izide.
- [ ] T015 V `docs/agent/P08/spec.md` izpolni preglednico sledljivosti z datotekami, izvedenimi testi in izidi; nepreverjene dele označi.
- [ ] T016 Pripravi predajo: seznam sprememb, izvedena preverjanja, omejitve.
