# P07 verification

## Izvedeno

- Dodana je `src/favorites.ts` za varno branje/razčlenjevanje in determinističen zapis ID-jev.
- `src/App.tsx` zdaj upravlja globalne priljubljene, projektni filter, števec, projektno brisanje, storage dogodke in opozorilo ob nedostopni shrambi.
- `src/TaskBoard.tsx` in preglednica prikazujeta ločene gumbe po ID-ju; dodani so Folio slogi v `src/styles.css`.
- Dodan je osnovni Playwright tok v `tests/agent/P07.favorites.spec.ts` za zapis, preklop pogleda, filter, prazno stanje in odsotnost API zapisov.

## Preverjanja

- `npm run check`: v teku.
- Razvojni D01–D04 in novi robni scenariji R01–R12 še niso vsi preverjeni.

## Omejitve

- Trenutni lastni test ne pokriva vseh zahtev, zlasti neveljavnih zapisov, projektnega brisanja, storage dogodkov/izjem in ozkega prikaza. Rezultate dopolniti po preverjanju.
