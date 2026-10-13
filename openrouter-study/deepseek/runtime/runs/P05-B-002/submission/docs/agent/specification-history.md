# Zgodovina specifikacije P05 (postopek B)

## 2026-10-11 – začetni zapis (avtor specifikacije)

- Prebrani `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md`,
  `shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/api.ts`, `src/navigation.ts`,
  `src/useResource.ts` ter berljivi `tests/development/P05.spec.ts` in `helpers.ts`.
- Ustvarjen `docs/agent/specification.md`: kontekst, podatkovni model, lokalno stanje
  `filter/size/page`, predikati `F`, `n`, `P`, `V`, `A`, `B`, pravila dejanj ter
  sprejemni pogoji R01–R12 z načinom preverjanja in predvideno sledljivostjo.
- Izidi preverjanj so namerno označeni kot „ni še izvedeno“; zagon aplikacije in
  testov sta v domeni implementerja.

## 2026-10-11 – popravek (avtor specifikacije)

- V razdelku „Zahteve in pravila“ je bila formula statusa popravljena na
  `Stran {page} od {P}. Prikazano {A}–{B} od {n}.`; pri `n = 0` velja
  `Stran 0 od 0. Prikazano 0–0 od 0.` Usklajeno z R09/R10.
