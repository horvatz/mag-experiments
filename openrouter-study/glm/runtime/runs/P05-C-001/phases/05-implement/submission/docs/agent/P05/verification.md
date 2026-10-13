# Preverjanje P05 — Straničenje in filter stanja

**Datum:** 2026-10-09

## Potek izvedbe

- [T001] Dodana čista logika v `src/pagination.ts`.
- [T002] Dodana lokalna stanja, nadzori in natančen status v `src/App.tsx`.
- [T003] Preglednica in tabla zdaj uporabljata isti trenutni odsek; pregled stanj ostane izračunan iz celotnega nefiltriranega polja.
- [T004] Dodani minimalni Folio slogi za nove nadzore ter prikaz pri širini 390 px.
- [T005]–[T009] Dodani lastni testi za vse zahteve v `tests/agent/p05.spec.ts`.
- Prvi lint je odkril neuporabljen parameter v testu; napaka je odpravljena.
- Prva gradnja je odkrila `null` v preslikavi DOM ID; testna preslikava je odpravljena.
- Prvi zagon lastnih testov je odkril tri napačna pričakovanja v testih (vrstni red ID-jev v tabli, manjkajoči mock projekta in zadnji filtrirani odsek). Pričakovanja so odpravljena.
- Drugi zagon je odkril še eno primerjano zaporedje namesto množice ID-jev; primerjava je odpravljena.

## Končni rezultati

- `npx playwright test tests/agent/p05.spec.ts`: **12/12 uspešnih** (4,8 s).
- `npm run lint`: **uspešno**.
- `npm run build`: **uspešno** (TypeScript in Vite).
- `npm run check`: **uspešno**, 58/58 preverjanj (38 osnovnih, 8 razvojnih P05 in 12 lastnih P05).

## Omejitve

- Končni skriti testi in javni internet niso na voljo; teh preverjanj nismo izvedli in jih ne navajamo kot uspešnih.
- Ročni ogled v ločenem brskalniku ni izveden; vedenje, dostopnost in ozki prikaz pokrivajo uspešni Playwright testi.
