# Folio — projektna ustava

## Temeljna načela

### I. Ohranitev potrjenega Folio
Dopolnitve ohranjajo potrjeni videz Folio iz `docs/dizajn.md`, slovenska poimenovanja ter odzivno in dostopno uporabo. Prednost imajo obstoječi gradniki in slogovne spremenljivke.

### II. Spoštovanje meje sprememb
Aplikacijske spremembe ostanejo v `src/`, lastni testi v `tests/agent/` in dokumentacija v `docs/agent/`. Začetni podatki, strežnik, skupni tipi, skupni testi, odvisnosti in nastavitve ostanejo nespremenjeni. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno enako posodobitev izhodišča za vse postopke.

### III. Uporaba javnega podatkovnega vmesnika
Uporabniški vmesnik podatke bere in shranjuje prek javnega `/api/` ter zapise prepoznava po `id`. Testnih poti `/__test/` ne uporablja; strežniških podatkov ne nadomešča z lokalno kopijo ali `localStorage`.

### IV. Preverljiva in poštena oddaja
Rešitev se preveri s skupnimi testi in po potrebi z lastnimi preverjanji. Poročilo navaja dejansko izvedene preglede in njihove rezultate ter jasno opiše neizpolnjene zahteve ali omejitve.

## Uporaba

Načela izhajajo iz `PROJECT_RULES.md` in potrjenega dizajna v `docs/dizajn.md`; uporabljajo se skupaj s konkretnimi zahtevami in omejitvami posamezne naloge.

## Upravljanje

Pri delu se upošteva dogovorjena meja sprememb. Spremembe skupne infrastrukture se uskladijo kot enaka posodobitev izhodišča za vse postopke.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
