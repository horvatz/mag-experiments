Izvedel sem koledarski pregled rokov z datumskim filtrom, petimi števci in enakim filtriranjem v preglednici in tabli. Specifikacija povezuje R01–R12 s pravili, kodo in preverjanji; dodal sem tudi lastne teste.

`npm run check` je uspešno zaključil lint, TypeScript, build in vseh **54 testov**. Neizpolnjenih zahtev nisem ugotovil. V [zapis preverjanja](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P08-A-002/app/docs/agent/verification.md) so navedene omejitve: različni časovni pasovi niso bili ločeno testirani, končni skriti testi pa niso bili na voljo.

- [Specifikacija](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P08-A-002/app/docs/agent/specification.md)
- [Implementacija rokov](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P08-A-002/app/src/deadlines.ts)
- [Lastni testi](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P08-A-002/app/tests/agent/P08.spec.ts)
