# Folio — ustava projekta

## Temeljna načela

### I. Ohrani potrjeni Folio
Nadgradnje dopolnjujejo obstoječi vmesnik. Ohranjajo slovenska poimenovanja,
gradnike in potrjeni prilagodljivi videz iz `docs/dizajn.md`; sprememba videza
izhodišča ni del naloge.

### II. Upoštevaj podatkovni vmesnik
Podatke pridobivaj in zapisuj prek javnega API-ja `/api/`, opravila prepoznavaj
po `id`, druga polja pa ohrani, razen če zahteva izrecno določa drugače.
Uporabniški vmesnik ne uporablja testnih poti `/__test/` in strežniških
podatkov ne nadomešča z lokalno shrambo.

### III. Varuj skupno izhodišče
Spremembe aplikacije omeji na `src/`, lastne teste v `tests/agent/` in
dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi, skupni
testi, odvisnosti ter nastavitve ostanejo nespremenjeni; širitev infrastrukture
zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### IV. Preverjaj in poročaj pošteno
Upoštevaj zahteve naloge in skupno predlogo. Uporabi primerna skupna in lastna
preverjanja ter ob predaji navedi izvedene korake, njihove dejanske rezultate
in nepreverjene zahteve ali omejitve.

## Upravljanje

Ta ustava povzema projektna pravila in potrjeni dizajn. Spremembe načel morajo
ostati skladne z njimi in z dovoljenim obsegom sprememb; izjema glede skupne
infrastrukture velja le ob vnaprej dogovorjeni posodobitvi izhodišča.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
