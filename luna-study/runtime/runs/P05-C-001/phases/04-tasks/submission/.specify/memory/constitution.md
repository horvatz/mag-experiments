# Ustava projekta mag-app (Folio)

## Temeljna načela

### I. Ohranjaj potrjeno izkušnjo Folio
Dopolnjuj obstoječo aplikacijo ter ohranjaj potrjeni videz Folio, slovenska poimenovanja vmesnika, prilagodljivost in dostopnost. Uporabljaj obstoječe gradnike in slogovne spremenljivke; oblikovno vodilo je `docs/dizajn.md`.

### II. Uporabljaj dogovorjeni podatkovni vmesnik
Aplikacijske podatke beri in zapisuj prek javnega vmesnika `/api/`, zapise pa izbiraj po `id`. Strežnika ne nadomeščaj z lokalnimi podatki ali `localStorage`. Kontrole `/__test/` so namenjene samo testnemu programu.

### III. Upoštevaj dogovorjeni obseg sprememb
Aplikacijske spremembe sodijo v `src/`, `tests/agent/` in `docs/agent/`. Začetne podatke, strežnik, skupne tipe, osnovne teste, odvisnosti ter nastavitve zagona in preverjanja ohranjaj nespremenjene. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča. Procesne datoteke spreminjaj le, kadar jih postopek izrecno dovoli.

### IV. Preverjaj in poročaj o dejanskem delu
Uporabi razpoložljiva preverjanja izhodišča in po potrebi dodaj usmerjena lastna preverjanja. Poročaj o dejansko izvedenih preverjanjih, rezultatih in nepreverjenih zahtevah; neizvedenih preverjanj ne navajaj kot uspešnih.

## Projektna vodila

`PROJECT_RULES.md` določa skupne meje dela. `docs/dizajn.md` opisuje potrjeni dizajn Folio. Zahteve posamezne naloge in skupna predloga specifikacije določajo vedenje funkcionalnosti ter potrebna dokazila.

## Upravljanje

Ta načela upoštevaj skupaj s projektnimi pravili in zahtevami naloge. Spremembe ustave omeji na projektna vodila ter ob vsaki spremembi posodobi različico in datume.

**Version**: 1.0.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-09-27
