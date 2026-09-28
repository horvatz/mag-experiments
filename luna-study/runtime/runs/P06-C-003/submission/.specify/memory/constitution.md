# Ustava projekta Folio

## Temeljna načela

### I. Ohranjaj Folio
Nadgrajuj obstoječi vmesnik in potrjeni videz Folio. Ohranjaj slovenska poimenovanja ter slog aplikacije.

### II. Uporabljaj dogovorjene podatkovne vmesnike
Podatke pridobivaj in shranjuj prek javnega API-ja `/api/`; zapise izbiraj po `id`. Ne nadomeščaj strežniških podatkov z lokalno kopijo ali `localStorage`.

### III. Varuj meje aplikacije in testov
Testne kontrole `/__test/` so namenjene testnemu programu. Uporabniški vmesnik ne sme nastavljati njihovih odzivov, brati njihovega stanja ali ponastavljati podatkov. Skupni strežnik, tipi, testi, odvisnosti in nastavitve ostanejo nespremenjeni, razen ob vnaprej dogovorjeni posodobitvi izhodišča.

### IV. Preverjaj in poročaj natančno
Uporabi skupne teste in po potrebi dodaj lastna preverjanja. Poveži zahteve s pogoji in preverjanji; navedi dejanske rezultate ter odkrito označi neizvedene teste in nepreverjene dele.

## Uporaba

Konkretne zahteve naloge določajo pričakovano vedenje. Specifikacija jih mora zajeti brez sklepanja iz posameznih testnih primerov; dokumentiraj pogoje in sledljivost do izvedbe ter dokazil.

## Upravljanje

Ta ustava dopolnjuje `PROJECT_RULES.md`; obe vodili uporabljaj skupaj pri načrtovanju, izvedbi in pregledu sprememb.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Zadnja sprememba**: 2026-09-27
