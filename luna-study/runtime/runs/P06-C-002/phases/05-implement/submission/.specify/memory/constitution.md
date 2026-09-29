# Folio — ustava projekta

## Temeljna načela

### I. Ohrani potrjeni videz
Dopolnitve uporabniškega vmesnika ohranijo slovenska poimenovanja in potrjeno
usmeritev Folio iz `docs/dizajn.md`, pri čemer sledijo obstoječim gradnikom in
slogu.

### II. Uporabljaj obstoječe podatkovne pogodbe
Podatke beri in shranjuj prek javnega vmesnika `/api/` ter zapise izbiraj po
`id`. Testne poti `/__test/` so namenjene samo testnemu programu. Vmesnik jih
ne uporablja za podatke, odzive ali ponastavitve in ne nadomešča strežniških
podatkov z lokalno kopijo ali `localStorage`.

### III. Spoštuj meje sprememb
Spremembe aplikacije omeji na `src/`, lastne teste v `tests/agent/` in lastno
dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi,
odvisnosti ter nastavitve ostanejo nespremenjeni. Skupno infrastrukturo je
mogoče spremeniti le ob vnaprej dogovorjeni skupni posodobitvi izhodišča.

### IV. Utemelji sprejem z dokazi
Zahteve poveži s sprejemnimi pogoji in načini preverjanja. Zabeleži dejansko
izvedene teste in njihove rezultate; neizvedenih preverjanj ne označi kot
uspešnih ter navedi neizpolnjene zahteve in omejitve.

## Uporaba

Pred delom preberi zahteve in uporabi skupno predlogo specifikacije. Pri
izvedbi in preverjanju ohrani meje iz teh pravil ter dokazila zapiši tako, da
je njihov izvor določljiv.

## Upravljanje

Ta ustava povzema projektna pravila za Folio in jih ne razširja z novimi
zahtevami, odvisnostmi ali arhitekturnimi preureditvami. Konkretna naloga
določa dodatne sprejemne pogoje znotraj dovoljenega obsega. Spremembe ustave
morajo ostati skladne s skupnimi projektnimi pravili.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-28 | **Nazadnje spremenjeno**: 2026-09-28
