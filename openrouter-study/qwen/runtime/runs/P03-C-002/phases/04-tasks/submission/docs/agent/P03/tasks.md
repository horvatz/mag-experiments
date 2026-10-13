# Naloge za implementacijo P03

## Setup

- [ ] T001: Pripraviti mapo `src/components/` in ustvariti osnovno strukturo za nove komponente.
- [ ] T002: Ustvariti testno datoteko `tests/agent/P03.spec.ts` z imports in osnovno strukturo testov.
- [ ] T003: Pripraviti mapo `src/hooks/` za custom hooks.

## Foundational - UI komponente

- [ ] T004: Ustvariti `src/components/SearchFilter.tsx` z iskalnim inputom (type=search) in dvoma select elementi.
  - Filter stanja: all/todo/in_progress/done
  - Filter odgovorne osebe: all + ime
  - Gumb "Počisti filtre" z role=status, aria-label="Rezultati filtriranja"
- [ ] T005: Ustvariti `src/hooks/useSearchFilter.tsx` custom hook z uporabo `useState` za `searchQuery`, `statusFilter`, `assigneeFilter`.
- [ ] T006: Implementirati funkcijo `filterTasks()` v `useSearchFilter.tsx` s logiko:
  - Unicode NFD pretvorba in odstranitev kombinacijskih znamenj (R02)
  - Razdelitev iskalnega vstosa na besede (R03)
  - Logični IN za iskanje + stanje + oseba (R04)

## Foundational - Integracija z App.tsx

- [ ] T007: V `src/App.tsx` dodati import in uporabo `useSearchFilter` hook.
- [ ] T008: V `ProjectView` komponenti v `App.tsx` dodati filter kontrole pred seznam opravil.
- [ ] T009: V `ProjectView` komponenti `App.tsx` integrirati filtrirane rezultate obrata namesto vseh opravil.
- [ ] T010: V `src/App.tsx` implementirati reset filter po preklopu projekta (ruter navigacije).

## User Stories - Iskanje in filtri

- [ ] T011: [R01] Test in preverjanje, da so iskalni vnos in filtri prazni ob nalaganju.
- [ ] T012: [R02] Test Unicode NFD - iskanje "č" najde opravila z "č" ali "c" (primer: "član" = "clan").
- [ ] T013: [R03] Test iskanja po več besedah - "Ana Novak" najde opravila z obema besedama v title/description/assignee.
- [ ] T014: [R04] Test kombiniranja iskanja in obeh filtrov - logični IN deluje pravilno.
- [ ] T015: [R05] Test seznama oseb v izbirniku - vse ime iz projekta so prisotne + "all".
- [ ] T016: [R06] Test konzistence - tabela in tabla prikazujeta iste ID-je z ohranjenimi filtri.
- [ ] T017: [R07] Test preklopa projekta - iskanje in filtri se resetirajo na privzete vrednosti.

## User Stories - Prikaz in posebna stanja

- [ ] T018: [R08] Test osvežitve - preveri, da se filtri ne shranjujejo v URL.
- [ ] T019: [R09] Test števca - prikaže "Prikazano: N od M" z pravilnim številom.
- [ ] T020: [R10] Test praznih rezultatov - prikaže "Ni zadetkov." ob praznem naboru.
- [ ] T021: [R11] Test gumba počisti filtre - vrne vse tri kontrole na privzete vrednosti.

## Polish - Styling in preverjanje

- [ ] T022: [R12] Ustvariti minimalni CSS za filter kontrole v `src/styles.css` (layout, alignment, responsive).
- [ ] T023: Preveriti ozko širino (390px) - notranje drsenje preglednice in table je dovoljeno.
- [ ] T024: Preveriti bralne podrobnosti - aria-label="Pregled stanj opravil" na summary-grid in tabeli.
- [ ] T025: Končni pregled - preveriti vsak test proti zahtevi in zagotoviti pokritost R01-R12.
- [ ] T026: Testi proti baseline - izvesti `tests/baseline.spec.ts` za regresijsko preverjanje.
- [ ] T027: Dokumentiranje - posodobiti konvergenco z rezultati preverjanja.
