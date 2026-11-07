# Folio Constitution

## Core Principles

### I. Source of Truth
Izvirne zahteve naloge, `PROJECT_RULES.md` in skupna predloga so izhodišče dela. Zahteve iz izvirnih navodil veljajo tudi, če jih dokument posameznega postopka izpusti.

### II. Protected Baseline
Spremembe so omejene na `src/`, `tests/agent/`, `docs/agent/` ter procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, skupni tipi, skupni testi, odvisnosti, nastavitve in infrastruktura ostajajo nespremenjeni.

### III. Folio and Existing Contracts
Potrjeni dizajn Folio in obstoječe dostopnostne, podatovne ter bralne pogodbe ostajajo ohranjeni. Uporabniški vmesnik komunicira prek javnega `/api/` in ne uporablja testnih kontrol ali nadomestnih lokalnih podatkov.

### IV. Honest Verification
Rešitev preverimo s skupnimi testi in smiselnimi lastnimi preverjanji. Ne navajamo neizvedenih preverjanj kot uspešnih; nezapolnjene zahteve, omejitve in izide zapišemo jasno.

### V. Traceable Specifications
Specifikacija sledi skupni predlogi. Vsaka zahteva ima sprejemni pogoj, način preverjanja, vez na kodo ali dokumentacijo ter dokaz o dejanskem izidu. Dokumenti so jedrnati, povezani in brez nepotrebnega podvajanja.

## Non-Negotiable Rules

- Ne dodajaj novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.
- Ne spreminjaj izhodiščne infrastrukture brez vnaprejšnjega dogovora.
- Ne uporabljaj testnih kontrol `/__test/` v uporabniškem vmesniku.
- Ne skrivi ali izpusti pomembne omejitve, napake ali nezapolnjene zahteve.

## Governance

Ta ustava je vezana na pilot P06. Spremembe zahtevajo izrecen dogovor in ažuriranje relevantne dokumentacije. Konkretna implementacija ostaja v postopkovnih dokumentih in v skladu s sprejemnimi pogoji specifikacije.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
