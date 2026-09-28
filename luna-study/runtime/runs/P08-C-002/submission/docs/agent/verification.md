# P08 — preverjanje

Končnih testov nimam na voljo; ne navajam jih kot izvedenih.

## Izvedba

- Dodan je koledarski razvrščevalnik `src/deadlines.ts`, lokalni datum/skupina,
  števci in prazno-datumsko opozorilo v `src/App.tsx`, skupno filtriranje za
  preglednico/tablo ter odzivni slogi v `src/styles.css`.
- Lastni scenariji so v `tests/agent/P08.spec.ts`; uporabljajo nadzorovane
  GET odzive in preverjajo skupine, mejne datume, filtre, podrobnosti,
  ponastavitve, nepošiljanje zapisov in širino 390 px.

## Preverjanja

- `npm run check`: v teku; rezultat dopolnim po zaključku.
