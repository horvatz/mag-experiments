# Folio — ustava projekta P07

Ta ustava določa načela za razvoj Folia v pilotu P07. Izhaja iz `PROJECT_RULES.md`, potrjenega videza Folio in skupne predloge razvojne specifikacije.

## Temeljna načela

### 1. Ohranitev Folia
Obstoječi vmesnik dopolnjujemo, ohranjamo slovenska poimenovanja in potrjeni videz iz `docs/dizajn.md`. Uporabljamo obstoječe gradnike in slogovne spremenljivke.

### 2. Omejen obseg sprememb
Aplikacijske spremembe so omejene na `src/`, lastne teste v `tests/agent/` in dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni. Sprememba skupne infrastrukture je mogoča le z vnaprej dogovorjeno posodobitvijo izhodišča za vse postopke.

### 3. Uporaba javnega podatkovnega vmesnika
Podatke o projektih in opravilih beremo ter shranjujemo prek javnega `/api/`; opravila prepoznavamo po `id`. Uporabniški vmesnik ne uporablja testnih poti `/__test/` in ne nadomešča strežniških podatkov z lokalno kopijo ali `localStorage`.

### 4. Preverljiva oddaja
Zahteve zajamemo po skupni predlogi, rešitev preverimo s skupnimi testi in primernimi lastnimi preverjanji ter poročamo o dejansko izvedenih preverjanjih in neizpolnjenih zahtevah. Neizvedenega testa ne označimo kot uspešnega.

## Naslednji koraki

- Za specifikacijo funkcije P07 uporabi `$speckit-specify` in vključi zahteve iz `task/instructions.md`.

## Upravljanje

Zahteve posamezne naloge podrobneje opredelijo to ustavo, ne širijo pa dovoljenih meja sprememb. Spremembe skupne infrastrukture morajo slediti vnaprej dogovorjenemu postopku posodobitve izhodišča.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-28 | **Nazadnje spremenjeno**: 2026-09-28
