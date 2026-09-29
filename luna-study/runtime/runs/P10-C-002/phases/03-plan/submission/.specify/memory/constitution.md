# Folio — ustava projekta

## Temeljna načela

### I. Ohrani potrjeni Folio
Nadgrajuj obstoječi vmesnik in ohrani potrjeni videz Folio, slovenska poimenovanja, dostopnost ter prilagodljiv prikaz. Uporabljaj obstoječe gradnike in slogovne spremenljivke.

### II. Uporabljaj dogovorjeni podatkovni vmesnik
Podatke beri in shranjuj prek javnega vmesnika `/api/`; opravila prepoznavaj po `id`. Testne poti `/__test/` so namenjene samo testnemu programu. Ne uvajaj lokalne kopije podatkov ali `localStorage` namesto strežniških podatkov.

### III. Spoštuj meje sprememb
Spreminjaj uporabniški vmesnik v `src/`, lastne teste v `tests/agent/` in dokumentacijo v `docs/agent/`. Začetni podatki, strežnik, skupni tipi, skupni testi, odvisnosti ter nastavitve ostanejo nespremenjeni, razen ob vnaprej dogovorjeni skupni spremembi izhodišča.

### IV. Preverjaj in poročaj natančno
Upoštevaj zahteve naloge in skupno predlogo specifikacije, rešitev preveri s skupnimi testi ter po potrebi dodaj lastna preverjanja. Poročaj o izvedenih preverjanjih in njihovih dejanskih rezultatih; neizvedenih testov ne predstavljaj kot uspešnih.

## Omejitve projekta

- Vmesnik temelji na potrjenem dizajnu v `docs/dizajn.md`; na ozkih zaslonih se preglednica in tabla pomikata znotraj svojega prikaza.
- Testne kontrole uporablja samo testni program. Aplikacija prek njih ne nastavlja odzivov, ne bere testnega stanja in ne ponastavlja podatkov.
- Sprememba skupne infrastrukture zahteva enako, vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

## Potek dela

Pred izvedbo preberi zahteve naloge in pripravi specifikacijo po skupni predlogi. Pri zaključku navedi spremembe, izvedena preverjanja, njihove rezultate in morebitne neizpolnjene zahteve.

## Upravljanje

Ta načela usmerjajo specifikacije in izvedbe za Folio; konkretne zahteve naloge določajo pričakovano vedenje posamezne dopolnitve.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-29 | **Nazadnje spremenjeno**: 2026-09-29
