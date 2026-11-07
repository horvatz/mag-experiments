# Folio (P04) Constitution

## Core Principles

### I. Meje dovoljenih sprememb
Spremembe so omejene na `src/`, lastne teste v `tests/agent/` in dokumente v
`docs/agent/`. Dovoljeni sta še procesni datoteki `.specify/memory/constitution.md`
in `.specify/feature.json`. Strežnik, skupni tipi, skupni testi, odvisnosti in
nastavitve zagona ostanejo nespremenjeni; sprememba skupne infrastrukture bi
zahtevala vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### II. Podatki samo prek javnega API-ja
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`,
izbira po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne sme uvažati,
brati ali ponastavljati; strežnika se ne nadomešča z lokalno kopijo podatkov
ali `localStorage`. Novih zapisovalnih API-jev ni.

### III. Ohranitev potrjenega dizajna Folio
Videz in gradniki iz `docs/dizajn.md` so potrjeni in se ohranijo: slovenska
poimenovanja, sistemska pisava in barvna paleta, `data-task-id` na vrsticah in
karticah, dostopna imena pogledov in stolpcev, `aria-label="Pregled stanj
opravil"`, viden fokus ter notranje drsenje pri širini 390 pik.

### IV. Preverjanje z dejanskimi dokazi
Rešitev se preveri s skupnimi testi in smiselno dodanimi lastnimi preverjanji.
Vsaka zahteva R01–R12 se poveže s pogoji, kodo in dejansko izvedenimi testi.
Neizvedenih testov ni dovoljeno navajati kot uspešnih; nepreverjeni deli in
omejitve se zapišejo.

### V. Najmanjši obseg
Predloge in navodila ne dovoljujejo širjenja obsega naloge. Ne dodajajo se nove
zahteve, odvisnosti ali obvezne arhitekturne preureditve; obstoječi vmesnik se
dopolni, zahteve P04 pa so merilo ne glede na izpuščeno vsebino specifikacije.

## Governance

Ta ustava velja za pilot P04 in je podrejena izvirnim zahtevam naloge. Spremembe
ustave zahtevajo zapisan razlog in ohranitev skladnosti z R01–R12 ter
`PROJECT_RULES.md`. Vsak korak Spec Kit preveri skladnost s temi načeli.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
