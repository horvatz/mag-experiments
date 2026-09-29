# Ustava projekta Folio

## Temeljna načela

### I. Ohranitev potrjenega vmesnika
Dopolnjuj obstoječi vmesnik ter ohrani potrjeni videz Folio in slovenska poimenovanja. Upoštevaj skupne smernice za oblikovanje.

### II. Uporaba javnega podatkovnega vmesnika
Podatke beri in shranjuj prek javnega vmesnika `/api/`; zapise izbiraj po `id`. Uporabniški vmesnik ne uporablja testnih kontrol, lokalnih kopij strežniških podatkov ali `localStorage`.

### III. Spoštovanje meja sprememb
Spremembe aplikacije omeji na `src/`, lastne teste v `tests/agent/` in lastno dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni. Sprememba skupne infrastrukture zahteva enako dogovorjeno posodobitev izhodišča za vse postopke.

### IV. Preverjanje in poštena predaja
Rešitev preveri s skupnimi testi in po potrebi dodaj lastna preverjanja. Ob predaji opiši spremembe, dejansko izvedena preverjanja in njihove rezultate ter neizpolnjene zahteve. Neizvedenih testov ne navajaj kot uspešnih.

Testni program uporablja poti `/__test/`; uporabniški vmesnik prek njih ne nastavlja odzivov, ne bere testnega stanja in ne ponastavlja podatkov. Strežnika ne nadomeščaj z lokalno kopijo podatkov ali `localStorage`.

## Upravljanje

Ta načela povzemajo `PROJECT_RULES.md`. Če je potrebna sprememba skupne infrastrukture, pred njeno uporabo posodobi dogovorjeno izhodišče za vse postopke. Ustavo uskladi s spremembami projektnih pravil.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-29 | **Nazadnje spremenjeno**: 2026-09-29
