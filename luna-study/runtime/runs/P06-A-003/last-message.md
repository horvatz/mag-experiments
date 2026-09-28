Pilot P06 je zaključen. Dodal sem nastavljiv izvoz CSV, ki ohranja vrstni red opravil, ponastavi nastavitve ob menjavi projekta in ne spreminja podatkov.

- [Specifikacija in sledljivost R01–R12](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-003/app/docs/agent/specification.md>)
- [Poročilo preverjanja in omejitve](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-003/app/docs/agent/verification.md>)
- Izvedba: [App.tsx](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-003/app/src/App.tsx>) in [csv.ts](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-003/app/src/csv.ts>); lastni testi so v [P06.spec.ts](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-003/app/tests/agent/P06.spec.ts>).

Končni `npm run check` je uspel: lint, TypeScript, build in 49/49 testov. Posebej zapisa `-` in `@` v testnih podatkih nisem preveril; omejitve in nedostopen `git status` zaradi napake `xcrun` so opisani v poročilu. Nobene znane funkcionalne zahteve nisem pustil neizpolnjene.
