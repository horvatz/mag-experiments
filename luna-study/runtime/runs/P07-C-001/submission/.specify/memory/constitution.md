# Folio Constitution

## Core Principles

### I. Ohrani potrjeni Folio
Dopolnitve ohranijo potrjeni videz Folio, obstoječe vzorce uporabe, dostopnost in slovenska poimenovanja. Uporabi obstoječe gradnike in sloge.

### II. Podatki prek javnega vmesnika
Podatke aplikacije beri in zapisuj prek javnega vmesnika `/api/`. Testne poti `/__test/` so namenjene samo testom; strežniških podatkov ne nadomeščaj z lokalno kopijo.

### III. Spoštuj meje sprememb
Aplikacijske spremembe so omejene na `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni, razen ob vnaprej dogovorjeni skupni posodobitvi izhodišča.

### IV. Sledljivost in resnični dokazi
Specifikacije povežejo zahteve s sprejemnimi pogoji, preverjanji in deli izvedbe. Rezultate označi kot uspešne samo ob dejanskem preverjanju; navedi neizvedene preizkuse in omejitve.

## Development Workflow

Pred spremembami preberi zahteve in uporabi skupno predlogo specifikacije. Ob koncu povzemaj spremembe in dejansko izvedena preverjanja.

## Governance

Ta ustava povzema projektna pravila in skupno predlogo. Ne uvaja dodatnih zahtev, odvisnosti ali arhitekturnih preureditev. Ob morebitni skupni spremembi pravil ohrani dogovorjeno izhodišče.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
