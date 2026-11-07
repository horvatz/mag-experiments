# Folio Constitution

Projektna načela za aplikacijo Folio (`mag-app`). Izpeljana iz
`PROJECT_RULES.md` in skupne predloge razvojne specifikacije; ne dodajajo
novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## Core Principles

### I. Dovoljen obseg sprememb (NON-NEGOTIABLE)
Spreminjajo se samo koda uporabniškega vmesnika v `src/`, lastni testi v
`tests/agent/` in lastna dokumentacija v `docs/agent/`. Začetni podatki,
`server/`, skupni tipi `shared/`, skupni testi `tests/baseline.spec.ts` in
`tests/api.spec.ts`, odvisnosti ter nastavitve zagona in preverjanja ostanejo
nespremenjeni. Sprememba skupne infrastrukture je dovoljena le kot vnaprej
dogovorjena posodobitev izhodišča za vse postopke.

### II. Potrjeni videz Folio
Dopolnitve uporabljajo obstoječe gradnike in slogovne spremenljivke ter
ohranijo slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`.
Videz se ne preoblikuje; potrjeni dizajn je zavezujoč.

### III. Javni vmesnik /api/ kot edini vir podatkov (NON-NEGOTIABLE)
Podatki se berejo in shranjujejo izključno prek javnega vmesnika `/api/`,
izbira poteka po `id`. Uporabniški vmesnik ne uporablja testnih kontrol
`/__test/`, ne nadomešča strežnika z lokalno kopijo podatkov ali
`localStorage` in ne uvaja novih zapisovalnih API-jev.

### IV. Sledljivost zahtev
Vsaka zahteva R01–R12 je povezana s sprejemnim pogojem, mestom v kodi in
dejansko izvedenim preverjanjem. Izidi se ne označujejo kot uspešni brez
izvedbe; nepreverjeni deli in omejitve se jasno zapišejo.

### V. Pošteno preverjanje
Rešitev se preveri s skupnimi testi izhodišča, konkretne zahteve naloge pa z
ločeno pripravljenimi lastnimi testi. Neizvedeni testi se nikoli ne navajajo
kot opravljeni, rezultati pa morajo biti določljivi (ime testa, dnevnik).

## Meje izhodišča

- Nastavitve, odvisnosti, strežnik, skupni testi, uradne predloge in datoteke
  veščin so samo berljivi.
- Predloge ne dovoljujejo širjenja obsega naloge ali spreminjanja
  infrastrukture.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kadar
  zahteva določa trajno shrambo ali URL.

## Governance

Ta ustava prevlada nad drugimi praksami v projektu; ob neskladju veljajo
`PROJECT_RULES.md` in navodila naloge. Spremembe načel se zabeležijo z
datumom in razlogom. Vsak korak Spec Kit preveri skladnost z načeli I–V.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
