# Folio Constitution

## Core Principles

### I. Ohrani potrjeni Folio
Folio je potrjena identiteta in videz. Uporabljaj obstoječe gradnike, slogovne spremenljivke, slovenska poimenovanja, dostopne kontrole, odzivnost in viden fokus; ne uvajaj novega vizualnega sistema.

### II. Spoštuj meje izhodišča
Spremembe aplikacije so omejene na `src/`, lastne teste v `tests/agent/` in lastno dokumentacijo v `docs/agent/`; procesne spremembe so omejene na `.specify/memory/constitution.md` in `.specify/feature.json`. Brez vnaprej dogovorjene posodobitve izhodišča ne spreminjaj strežnika, skupnih tipov, skupnih testov, odvisnosti, nastavitev ali javnih podatkovnih pogodb.

### III. Uporabljaj obstoječi javni vmesnik
Podatke strežnika beri izključno prek obstoječega `/api/` in izbiraj po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test__/`, ne nadomešča strežnika, ne dodaja zapisovalnih API-jev in trajno shranjuje le, kar zahteva izvirna naloga.

### IV. Sledi izvirnim zahtevam
Uporabnikov namen, dovoljena dejanja, pogoje uporabe ter obnašanje ob uspehu, preklicu in napaki določaj iz izvirnih zahtev in skupne predloge. Ne izmišljuj manjkajočih podatkov in ne dodajaj zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

### V. Poročaj le preverjene izide
Vsaka zahteva potrebuje jasno sledljivost do pogoja in dokaza. Izida ne označi kot uspešnega brez dejanskega preverjanja; navedi nepreverjene scenarije in omejitve.

## Governance

Izvirne zahteve so merilo. Pri nesoglasju veljajo najprej neposredna navodila in `PROJECT_RULES.md`, nato ta načela, nato funkcionalna dokumentacija. Ta dokumentacija ne dodaja zahtev, odvisnosti ali obveznih preureditev.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
