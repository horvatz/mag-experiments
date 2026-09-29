Implementacija izvoza CSV je zaključena in predana pregledovalcu. Nastavitve veljajo za trenutni projekt, filter ne spreminja prikaza opravil, datoteka pa ohrani vrstni red polj, citiranje, CRLF in BOM.

- Izvoz in odzivne kontrole: [CsvExport.tsx](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-B-003/app/src/CsvExport.tsx), [App.tsx](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-B-003/app/src/App.tsx), [styles.css](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-B-003/app/src/styles.css).
- Dodal sem tri lastne scenarije v [P06.spec.ts](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-B-003/app/tests/agent/P06.spec.ts). Rezultati, sledljivost zahtev in omejitve so v [verification.md](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-B-003/app/docs/agent/verification.md).
- `npm run check` je uspešno zaključil lint, preverjanje tipov in gradnjo; vseh 49 testov je uspešnih.

Specifikacijske napake nisem zaznal. `git status` ni deloval zaradi manjkajočega `xcrun`, zato stanja veje nisem mogel preveriti; omejitev je zabeležena v predajnem zapisu.
