# P08 — dnevnik preverjanj

Stanje ob začetku implementacije: preverjanja še niso izvedena. Izide, imena testov in omejitve bom dopisal sproti; nedostopnih končnih testov ne bom prikazal kot izvedenih.

## Izvedba

- Dodan je `src/deadlineGroups.ts` za strogo preverjanje koledarskega datuma, koledarsko prištevanje, klasifikacijo in stabilno filtriranje.
- `src/App.tsx` zdaj hrani referenčni datum/skupino lokalno projektu, prikaže pet števcev, datum in izbirnik; prazen datum ohrani zadnji izračun. Preglednica in tabla dobita isti filtrirani seznam. `src/styles.css` oblikuje kontrole in pet povzetkov z odzivno postavitvijo.
- Dodani so agentni Playwright scenariji v `tests/agent/P08.spec.ts`; pripravljeni testi in infrastruktura ostajajo nespremenjeni.
- T001–T005 so opravljeni. Lint, tipi, gradnja in Playwright še niso preverjeni.
- Prvi `npm run check`: lint, typecheck/build so uspešni; Playwright 49/51 uspešnih. D01–D04 desktop/mobile (8), API (14), osnovni UI (24) in trije od petih agentnih scenarijev so uspešni. Dva lastna scenarija sta razkrila napake v testni navigaciji/selektorju ter manjkajoč preklopni prazen prikaz table; popravljeno, celoten nabor ponovno teče.
