# Ustava projekta Folio (P03)

## Temeljna načela

### I. Izhodišče ostane nespremenjeno (neogibno)

Začetni podatki, strežnik v `server/`, skupni tipi v `shared/`, skupni testi
`tests/baseline.spec.ts` in `tests/api.spec.ts`, odvisnosti ter nastavitve
zagona in preverjanja ostanejo enaki. Spremembe so dovoljene le v `src/`,
`tests/agent/` in `docs/agent/`; procesni datoteki tega postopka sta izjema.
Nove odvisnosti, novi zapisovalni API-ji in obvezne arhitekturne preureditve
niso dovoljeni.

### II. Podatki samo prek javnega vmesnika /api/

Aplikacija bere in shranjuje podatke izključno prek javnega API-ja `/api/` in
izbira po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`,
ne nadomešča strežnika z lokalno kopijo podatkov ali `localStorage` in ne
uvaža testnih pripomočkov.

### III. Potrjeni dizajn Folio je zavezujoč

Ohranijo se slovenska poimenovanja in potrjeni videz Folio iz `docs/dizajn.md`
(`src/styles.css` kot vir postavitve in barv), vključno s prikazom pri ozki
širini, vidnim fokusom pri tipkovnici ter obstoječimi dostopnimi imeni in
oznakami pogledov. Novi gradniki uporabljajo obstoječe slogovne spremenljivke.

### IV. Vsaka zahteva je preverjena z dokazom

Vsaka zahteva R01–R12 se preveri z dejansko izvedenimi testi: skupnimi in
lastnimi v `tests/agent/`. Rezultata se ne označi kot uspešnega brez
preverjanja; neizvedenih testov se ne navaja kot opravljenih. Izvor rezultata
mora biti določljiv (ime testa, dnevnik zagona).

### V. Izvirne zahteve so merilo

Zahteve iz `task/instructions.md` so merilo pravilnosti tudi, če jih
specifikacija izpusti. Obseg se ne širi prek zahtev; stanje nove
funkcionalnosti je lokalno trenutnemu projektu, brez URL-ja in trajne shrambe,
razen kjer zahteva določa drugače.

### VI. Dokumenti so jedrnati in sledljivi

Specifikacija po skupni predlogi poveže vsak R01–R12 s pogoji, kodo in
dejansko izvedenimi testi. Dokumenti v `docs/agent/` se ne podvajajo;
nejasnosti, uporabljena pojasnila in nepreverjeni deli se zapišejo.

## Dodatne omejitve

- Tehnološki sklad ostane enak (obstoječa React/Vite aplikacija in strežnik);
  brez novih knjižnic in brez posegov v skupno infrastrukturo.
- V okviru naloge se ne ustvarjajo veje ali commiti.
- Iskanje in filtri se ne shranjujejo v URL ali trajno shrambo brskalnika,
  razen če posamezna zahteva to izrecno določi.

## Potek dela

1. Specifikacija, načrt in naloge v `docs/agent/P03/` po skupni predlogi.
2. Izvedba le v `src/`, lastna preverjanja v `tests/agent/`.
3. Preverjanje s skupnimi testi izhodišča in lastnimi testi naloge.
4. Oddaja z opisom sprememb, izvedenih preverjanj in omejitev.

## Upravljanje

Ta ustava velja za pilot P03 in je zavezujoča znotraj njegovega obsega.
Spremembe se zapišejo v tem dokumentu z razlogom in datumom. Skupna predloga
P03 in vseh dvanajst zahtev ostajata obvezni.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-13 | **Nazadnje spremenjeno**: 2026-10-13
