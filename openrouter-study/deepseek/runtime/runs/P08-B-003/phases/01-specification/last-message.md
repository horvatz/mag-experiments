Specifikacija je predana.

- `docs/agent/specification.md` (v1.0): problem in kontekst, vhodi/dejanja/izidi z dogovorom o vmesniku, predikati `group(t)`, `counts(k)`, `validDate(s)`, `ref + n` ter pravila R01–R12 z načinom preverjanja.
- Sledljivost R01–R12 je povezana s primeri D01–D04 in predvidenimi lastnimi testi; izidi so namerno označeni kot neizvedeni v fazi specifikacije.
- `docs/agent/specification-history.md`: zapisan potek in odprta vprašanja (neveljavni nizi pri `input type=date`, postavitev števcev, sporočilo pri praznem projektu, preverjanje videza).
- Preverjeni viri: `shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/navigation.ts`, `src/api.ts`, `src/formatDate.ts`, `docs/dizajn.md`, `tests/development/P08.spec.ts`.

Implementer lahko iz pogojev neposredno izpelje tako UI kot testne trditve; edini odprti del je dejanski dokaz izvedbe, ki ga vpišeta implementer in recenzent.
