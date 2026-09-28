# Folio — ustava projekta

## Temeljna načela

### I. Ohranitev potrjenega Folia
Nadgradnje ohranijo ime in potrjeno vizualno smer Folia iz `docs/dizajn.md`. Uporabljajo obstoječe gradnike in sloge, slovenska poimenovanja ter prilagodljivo postavitev z vidnim fokusom tipkovnice.

### II. Javni podatkovni vmesnik
Vmesnik bere in shranjuje podatke prek obstoječega javnega API-ja. Zapise prepozna po `id`. Testne poti `/__test/` so namenjene samo testom; vmesnik jih ne uporablja in strežniških podatkov ne nadomešča z lokalno kopijo ali `localStorage`.

### III. Omejen in osredotočen poseg
Spremembe aplikacije ostanejo v `src/`, lastni testi v `tests/agent/`, dokumentacija pa v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. Skupna infrastruktura se spremeni samo z vnaprej dogovorjeno posodobitvijo izhodišča za vse postopke.

### IV. Zahteve in dokazila
Delo sledi izvornim zahtevam in skupni predlogi specifikacije. Preverjanje uporablja skupne teste in po potrebi lastne teste; poročilo navaja dejansko izvedena preverjanja, njihove izide in preostale omejitve.

## Omejitve in potek

Specifikacija in izvedba ne širita obsega zahtev ter ne uvajata novih odvisnosti ali preureditev infrastrukture. Prednost imajo obstoječi vzorci aplikacije in potrjeni dogovori Folia.

## Upravljanje

Ta ustava določa stalna projektna načela. Konkretna naloga določa njene funkcionalne zahteve; spremembe ustave so namenjene spremembam teh načel.

**Različica**: 1.0.0 | **Sprejeta**: 2026-09-27 | **Nazadnje spremenjena**: 2026-09-27
