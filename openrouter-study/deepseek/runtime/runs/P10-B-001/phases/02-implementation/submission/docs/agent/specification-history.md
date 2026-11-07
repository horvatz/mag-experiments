# Zgodovina specifikacije P10

Vodi jo avtor specifikacije. Vsak vnos: različica, čas (UTC), vloga, sprememba.

## 2026-10-09T01:31Z — različica 1.0 (avtor specifikacije)

- Prebrani `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md`.
- Pregledani `shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/TaskDetails.tsx`, `src/api.ts`, `src/navigation.ts`, `src/useResource.ts`,
  `server/http.ts` in `tests/development/P10.spec.ts` s pomočjo `helpers.ts`.
- Ustvarjen `docs/agent/specification.md`: kontekst, podatkovna polja, simboli
  stanja (`I`, `P`, `U`, `R`), prehodi dejanj, dogovor o vmesniku ter pogoji
  R01–R12 s predikati in načinom preverjanja.
- Sledljivost pripravljena kot plan (D01–D04 + lastni testi + skupni testi);
  polji za dejansko kodo in izide pusti implementerju.

### Odprte točke za naslednje vloge

- Implementer izpolni stolpca »Datoteka in del kode« ter »Izid ter dokaz« z
  dejansko izvedenimi preverjanji; brez navajanja neizvedenih testov.
- Če implementacija odstopi od predpostavk (npr. omejitev skladov, ponastavitev
  kot dejanje), naj se specifikacija dopolni in to zabeleži tukaj.
