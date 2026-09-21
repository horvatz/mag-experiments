# Načela tehnične kvalifikacije Q

- **R01:** `src/qualification.ts` mora izvoziti `shift(values: readonly number[]): number[]`, ki vrne novo polje z vsako vrednostjo povečano za 1 in ohrani vrstni red.
- **R02:** Vhod mora ostati nespremenjen; tudi pri praznem vhodu mora biti rezultat novo prazno polje.
- **Obvezne meje:** Spoštuj dodeljeno vlogo in `task/instructions.md`; dokumenti naj bodo kratki. Brez posegov v Folio UI, infrastrukturo, odvisnosti, `task/` ali artefakte drugih vlog. Edini dovoljeni test je `node task/qualification-check.mjs`; brez gradnje, brskalnika, javnega interneta ali drugih agentov.
