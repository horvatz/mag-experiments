Implementiran je nastavljiv izvoz CSV: izbira stolpcev, ločila in filtra; pravilno navajanje ter nevtralizacija formul; prenos z BOM in obdržan izvorni vrstni red. Izvoz ne zapisuje na API. Nastavitve ostanejo ob menjavi pogleda in se ponastavijo ob menjavi projekta ali osvežitvi.

- Koda: [CsvExport.tsx](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/src/CsvExport.tsx), povezava s pogledi v [App.tsx](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/src/App.tsx:43) in prilagodljivi slogi v [styles.css](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/src/styles.css).
- Specifikacija in sledljivost: [specification.md](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/docs/agent/specification.md); preverjanja in omejitve: [verification.md](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/docs/agent/verification.md).
- `npm run check` je uspešno zaključil vseh 52 preverjanj; dodanih je šest agentnih testov v [csv-export.spec.ts](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P06-A-002/app/tests/agent/csv-export.spec.ts).

Znanih neizpolnjenih zahtev ni. Skriti končni testi in ročna združljivost z zunanjimi preglednicami niso bili preverjeni.
