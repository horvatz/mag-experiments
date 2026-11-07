# Ustava projekta Folio (P07)

## Osnovna načela

### I. Meje sprememb
Dovoljene spremembe so koda vmesnika v `src/`, lastni testi v `tests/agent/`
in lastna dokumentacija v `docs/agent/`. Začetni podatki, strežnik `server/`,
skupni tipi `shared/`, skupni testi, odvisnosti ter nastavitve zagona in
preverjanja ostanejo nespremenjeni; sprememba skupne infrastrukture zahteva
vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### II. Javni vmesnik in podatki
Podatke beri in shranjuj prek javnega vmesnika `/api/`, opravila izbiraj po
`id`. Strežnika se ne nadomešča z lokalno kopijo podatkov ali `localStorage`.
Testnih kontrol `/__test/` uporabniški vmesnik ne uporablja. Novih
zapisovalnih API-jev se ne dodaja.

### III. Potrjeni dizajn Folio
Ohranjata se potrjeni videz Folio iz `docs/dizajn.md` in slovensko
poimenovanje. Nove kontrole uporabljajo obstoječe gradnike, dostopna imena
obstoječih pogledov ostanejo, na ozkih zaslonih stran ne razširi.

### IV. Preverjanje z dokazi
Rešitev se preveri s skupnimi testi in smiselno dodanimi lastnimi
preverjanji. Izida se ne navaja kot uspešnega brez dejanskega preverjanja;
neizvedeni testi in neizpolnjene zahteve se jasno zapišejo.

### V. Specifikacija po skupni predlogi
Specifikacija za funkcionalnost v `docs/agent/P07` sledi
`task/specification-template.md`: vseh dvanajst zahtev R01–R12 je povezanih
s pogoji, kodo in dejansko izvedenimi testi, izbrani pogoji so izraženi s
predikati, odprta vprašanja in omejitve so zapisane. Obseg naloge se ne širi.

## Upravljanje

Ta ustava velja za delo na funkcionalnosti P07 v tem repozitoriju in ima
prednost pred drugimi praksami znotraj njenega obsega. Spremembe zahtevajo
dokumentirano posodobitev po postopku ustave; spremembe skupne infrastrukture
dodatno vnaprej dogovorjeno uskladitev izhodišča.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-30 | **Zadnja sprememba**: 2026-10-30
