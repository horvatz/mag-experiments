# Zgodovina sprememb specifikacije P10

- 0.1 (osnutek): struktura po skupni predlogi; prve formulacije R01–R12,
  seznam dejanj in osnovni dogovor o vmesniku.
- 1.0 (predaja implementerju): po pregledu `shared/types.ts`, `src/App.tsx`,
  `src/TaskBoard.tsx`, `src/components.tsx`, `src/TaskDetails.tsx`,
  `src/navigation.ts`, `src/useResource.ts` ter `tests/development/P10.spec.ts`
  in `tests/development/helpers.ts`. Dodani: predikati in pravila prehoda
  stanja (move/undo/redo/reset, cap20), invariante I1–I5, točna dostopna imena
  in aria oznake, pravila za n=0 in n=1, tabela sledljivosti R01–R12.
  Opombe: razvojni testi D01–D04 so bili samo prebrani, ne zagnani; dejanske
  izide in dokaze vpiše implementer. Končni skriti testi niso dostopni.
