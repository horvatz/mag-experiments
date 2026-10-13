# Projektna načela P03

**Datum sprejetja:** 2026-10-09

## Namen

Dopolnite obstoječi Folio vmesnik z iskalnim vnosom in dvehriterijskimi filtri za opravila.

## Načela

- **Ohrani Folio**: vzdržujte potrjeni dizajn in sestavne pogledé (seznam in tabelo).
- **Način READ-only**: podatke berite iz `/api/`; ne postavljajte neposredno niti ne nadomeščajte strežnika.
- **Koda le v src/**: uporabniški vmesnik v `src/`, testne enote v `tests/agent/`, dokumentacijo v `docs/agent/`.
- **Ne posegajmo v infrastrukturo**: skupni tipi, strežnik, odvisnosti in nastavitve ostanejo enaki.
- **Slovenski jeziki**: ohranjajte vsebino in poimenovanja v slovenščini, vključno z oznakami vmesnika.
- **Pridržite se predvolje**: določena imena in obstoječa navigacija ostajata nespremenjena.

## Nepogoj

- Ne ustvarjajte ali obnavljajte odvisnosti, skupnih zapisovalnih end point-ov ali strukturnih sprememb.
