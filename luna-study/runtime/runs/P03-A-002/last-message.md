P03 je izveden. Iskanje in oba filtra delujejo skupaj, veljajo v tabeli in na tabli, ob menjavi projekta se ponastavijo, gumb pa jih počisti z enim dejanjem. Števci upoštevajo prikazane rezultate; dodano je tudi stanje brez zadetkov. Filtriranje ne zapisuje prek API-ja.

Specifikacija je bila pripravljena pred implementacijo, nato dopolnjena s sledljivostjo vseh zahtev R01–R12. Rezultati in omejitve preverjanja so zapisani v dokumentaciji.

`npm run check` je uspel: lint, tipovno preverjanje, produkcijska gradnja in vseh **54/54 testov**.

- [Implementacija](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P03-A-002/app/src/App.tsx>)
- [Lastni testi](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P03-A-002/app/tests/agent/P03.spec.ts>)
- [Specifikacija](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P03-A-002/app/docs/agent/specification.md>)
- [Preverjanje in omejitve](</Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P03-A-002/app/docs/agent/verification.md>)

Neizpolnjenih znanih zahtev ni. Skritih končnih testov nisem mogel zagnati, posebej velikega seznama z več kot desetimi opravili pa nisem preizkusil.
