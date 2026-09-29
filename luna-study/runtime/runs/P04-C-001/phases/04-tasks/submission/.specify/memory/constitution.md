# Folio — Ustava projekta

## Temeljna načela

### I. Omejen obseg in stabilno izhodišče
Aplikacijske spremembe ostanejo v `src/`, `tests/agent/` in `docs/agent/`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti ter nastavitve ostanejo nespremenjeni. Skupno infrastrukturo je mogoče spreminjati le z vnaprej dogovorjeno posodobitvijo izhodišča za vse postopke.

### II. Potrjeni videz in jezik
Dopolnitve ohranijo potrjeni videz Folio, uporabljajo obstoječe gradnike in slogovne spremenljivke ter ohranijo slovenska poimenovanja. Prikaz ostane uporaben na manjših zaslonih in s tipkovnico.

### III. Javni podatkovni vmesnik in celovitost podatkov
Aplikacija podatke bere in shranjuje prek javnega vmesnika `/api/` ter opravila izbira po `id`. Testne poti `/__test/` so namenjene samo testnemu programu. Aplikacija ne nadomešča strežniških podatkov z lokalno kopijo ali `localStorage`.

### IV. Preverljiva kakovost
Spremembe preverimo s skupnimi testi in po potrebi z lastnimi ciljanimi preverjanji. Poročilo navede dejansko izvedena preverjanja in rezultate; neizvedeni testi niso predstavljeni kot uspešni.

### V. Majhne, utemeljene dopolnitve
Dopolnimo pripravljeni vmesnik v okviru zahtev naloge. Ne uvajamo nepotrebnih odvisnosti ali sprememb zagona in preverjanja.

## Uporaba
Pri načrtovanju in izvedbi naloge so zahteve naloge ter ta načela vodilo za spremembe. Če zahtevana rešitev trči ob meje dovoljenega obsega ali skupno izhodišče, se odstopanje opiše in uskladi pred spremembo.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-29 | **Nazadnje spremenjeno**: 2026-09-29
