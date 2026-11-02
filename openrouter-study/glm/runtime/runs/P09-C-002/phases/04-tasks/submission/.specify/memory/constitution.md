# Ustava projekta Folio

## Temeljna načela

### I. Zahteve pred vsem

Originalne zahteve P09 so merilo, tudi če jih poznejša specifikacija izpusti. Delo ostaja v zahtevanem obsegu; ne razširjaj obsega in ne izmišljuj manjkajočih odgovorov.

### II. Potrjeni dizajn

Ohranjaj potrjeni dizajn Folio, slovenska poimenovanja, dostopnost in obstoječo prilagodljivost.

### III. Obstoječe pogodbe

Uporabljaj obstojavi javni vmesnik `/api/` in obstoječe tipe. Uporabniški vmesnik ne bere testnih kontrol, ne shranjuje stanja v `localStorage` in ne nadomešča strežnika.

### IV. Stabilne temelje

Upoštevaj dovoljene meje sprememb in skupno izhodišče. Odvisnosti, nastavitve, strežnik, skupni tipi, skupni testi in infrastruktura se spremenijo le z vnaprej dogovorjeno posodobitvijo izhodišča.

### V. Pošteno preverjanje

Preveri delo z ustreznimi obstoječimi in nalogi pripravljenimi testi. Zapiši dejanske izide in omejitve; neizvedenih preverjanj ne navajaj kot uspešnih.

## Nepogodljiva pravila

- Spremembe aplikacije ohrani v `src/`, lastne teste v `tests/agent/`, dokumentacijo v `docs/agent/` in dovoljenih procesnih datotekah Spec Kit.
- Podatkovni dostop uporabniškega vmesnika ostaja prek obstoječega javnega API-ja in obstoječega domenskega modela.
- Ohrani potrjeno vizualno smer Folio in dostopne interakcije.
- Nevladelne namene odloži k ustreznemu poznejšemu koraku Spec Kit in jih ne izvajaj v fazi ustave.

## Upravljanje

Ta ustava usmerja odločitve za celo funkcionalnost P09. Ob sporu velja vrstni red: neposredna navodila naloge, originalne zahteve P09, ta ustava in nato preostala projektna dokumentacija. Spremembe ustave zahtevajo izrecno navodilo in zabeleženo potrditev.

**Različica**: 1.0.0 | **Sprejeto**: 2026-11-01 | **Zadnja sprememba**: 2026-11-01
