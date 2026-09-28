# Folio — ustava projekta

## Temeljna načela

### I. Ohranjanje potrjenega uporabniškega vmesnika
Funkcionalne dopolnitve razširijo obstoječi vmesnik, ohranijo slovenska poimenovanja in sledijo potrjenemu videzu Folio iz `docs/dizajn.md`. Uporabnost s tipkovnico in prilagodljiv prikaz ostaneta del kakovosti vmesnika.

### II. Uporaba obstoječega podatkovnega vmesnika
Podatki se berejo in shranjujejo prek javnega `/api/`. Opravila se povezujejo po `id`, ne po naslovu. Vmesnik ne uporablja lokalne kopije podatkov ali testnih kontrol `/__test/`.

### III. Varovanje obsega in izhodišča
Spremembe so omejene na uporabniški vmesnik, lastne teste in dokumentacijo v dovoljenih mapah. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni; infrastruktura se spremeni le ob vnaprej dogovorjeni posodobitvi izhodišča za vse postopke.

### IV. Zvestoba zahtevam in preprostost
Izvirne zahteve naloge in skupna predloga vodijo specifikacijo in izvedbo. Razširitve dopolnijo obstoječe gradnike brez nepovezanih zahtev ali nepotrebnega preurejanja.

### V. Preverljiva kakovost
Rešitev se preveri z ustreznimi skupnimi testi in po potrebi z lastnimi testi. Poročilo loči dejansko izvedena preverjanja od neizvedenih ter navede znane omejitve.

## Omejitve projekta

- Ohranja se potrjeni dizajn Folio in obstoječe delovanje izhodiščne aplikacije.
- Uporabniški vmesnik ne bere ali spreminja testnega stanja in ne uvaja novega zapisovalnega API-ja.
- Nastavitve, odvisnosti, strežniška in skupna infrastruktura so zunaj običajnega obsega funkcionalne naloge.

## Potek dela

Pred izvedbo se pregledajo zahteve naloge in dovoljeni projektni dokumenti. Specifikacija poveže vsako zahtevo s sprejemnim pogojem in načinom preverjanja; zaključek navede spremembe, opravljena preverjanja in odprte omejitve. Dokumentacija se posodobi brez podvajanja vsebine.

## Upravljanje

Ta ustava povzema projektna pravila in ne širi obsega posamezne naloge. Ob neskladju veljajo izrecne omejitve in zahteve naloge ter pravila projekta. Spremembe ustave morajo biti utemeljene s spremembo teh pravil.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-27 | **Nazadnje spremenjeno**: 2026-09-27
