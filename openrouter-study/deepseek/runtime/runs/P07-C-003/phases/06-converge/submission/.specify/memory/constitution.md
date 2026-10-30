# Folio Constitution

## Temeljna načela

### I. Meje obsega
Spreminjamo samo dovoljene dele: kodo uporabniškega vmesnika v `src/`,
lastne teste v `tests/agent/` in lastno dokumentacijo v `docs/agent/`.
Strežnik `server/`, skupni tipi `shared/`, skupni testi `tests/baseline.spec.ts`
in `tests/api.spec.ts`, odvisnosti ter nastavitve zagona in preverjanja
ostanejo nespremenjeni. Novih odvisnosti in širjenja obsega naloge ni.

### II. Javni vmesnik
Podatke beremo in shranjujemo izključno prek javnega vmesnika `/api/` in
izbiramo po `id`; novih zapisovalnih API-jev ne dodajamo. Testne kontrole
`/__test/` uporablja samo testni program, uporabniški vmesnik pa jih ne
uporablja; strežnika ne nadomeščamo z lokalno kopijo podatkov ali
`localStorage`.

### III. Potrjeni videz Folio
Ohranjamo slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`.
Nove kontrole uporabljajo obstoječe gradnike in slogovne spremenljivke ter
ostajajo dostopne s tipkovnico.

### IV. Preverjanje in dokazila
Vsako zahtevo preverimo s skupnimi testi in smiselnimi lastnimi preverjanji.
Izvirne zahteve naloge so merilo, tudi če jih specifikacija izpusti.
Izvedena preverjanja, njihove izide in neizpolnjene zahteve zapišemo;
neizvedenih testov ne navajamo kot uspešnih.

## Upravljanje

Konstitucija velja za celoten pilot P07. Spremembe zahtevajo dokumentirano
posodobitev te datoteke; odstopanja od načel morajo biti odpravljena pred
oddajo. Podrobnejša pravila dela ostajajo v `PROJECT_RULES.md`, potrjene
smernice videza pa v `docs/dizajn.md`.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-30 | **Zadnja sprememba**: 2026-10-30
