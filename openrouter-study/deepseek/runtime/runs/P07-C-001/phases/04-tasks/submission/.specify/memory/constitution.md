# Folio (mag-app) Constitution

## Core Principles

### I. Meja dovoljenih sprememb (NON-NEGOTIABLE)
Spremembe so dovoljene samo v `src/` (vključno s slogi), v lastnih testih
`tests/agent/` in v lastnih dokumentih `docs/agent/`. Začetni podatki,
strežnik `server/`, skupni tipi `shared/`, skupni testi `tests/baseline.spec.ts`
in `tests/api.spec.ts`, odvisnosti ter nastavitve zagona in preverjanja ostanejo
nespremenjeni. Sprememba skupne infrastrukture zahteva vnaprej dogovorjeno
posodobitev izhodišča za vse postopke.

### II. Javni API je edini vir podatkov
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`
in izbira po `id`. Testne kontrole `/__test/` uporablja samo testni program;
uporabniški vmesnik jih ne uvaža, ne bere testnega stanja in ne ponastavlja
podatkov. Strežnika se ne nadomešča z lokalno kopijo podatkov ali
`localStorage`. Novih zapisovalnih API-jev ni.

### III. Ohranjen potrjeni videz Folio
Uporabniški vmesnik ohranja slovenska poimenovanja in potrjeni dizajn Folio iz
`docs/dizajn.md`: lebdeči stranski meni, nežne modre poudarke, obstoječe
gradnike in slogovne spremenljivke. Nova dejanja ob opravilu so zunaj njegove
povezave; dostopna imena in oznake obstoječih pogledov ostanejo.

### IV. Resnično preverjanje in dokazila
Rešitev se preveri s skupnimi testi in smiselno dodanimi lastnimi preverjanji.
Neizvedenih testov ni dovoljeno navajati kot uspešnih; vsak izid mora biti
sledljiv do dejanskega zagona (ime testa, dnevnik). Omejitve in nepreverjeni
deli se jasno zapišejo.

### V. Dokumentiranje sprememb
Ob zaključku se zapišejo spremembe, izvedena preverjanja, njihovi rezultati in
morebitne neizpolnjene zahteve. Dokumentacija ne podvaja vsebine, ampak
povezuje zahteve (npr. R01–R12) s pogoji, kodo in izvedenimi testi.

## Dodatne omejitve

- Zahteve naloge so merilo; specifikacija jih ne sme razširiti ali zožiti brez
  utemeljitve. Predloge ne dovoljujejo širjenja obsega ali spreminjanja
  infrastrukture.
- Vsak postopek uporablja svoj strežnik; različni zavihki istega strežnika
  uporabljajo isto zbirko.
- Raziskovanje pomeni pregled lokalne kode in priloženih navodil; javni
  internet in druga gradiva niso dostopni.

## Razvojni potek

1. Preberi zahteve naloge in uporabi skupno predlogo specifikacije.
2. Dopolni obstoječi vmesnik; ohrani Folio in slovenska poimenovanja.
3. Preveri s skupnimi testi in lastnimi preverjanji; po potrebi ponovi.
4. Oddaj z opisom sprememb, dokazili in omejitvami.

## Governance

Ustava nadomešča druge prakse v tem repozitoriju; vsaka sprememba zahteva
usklajeno posodobitev izhodišča za vse postopke. Kršitve načel I–III pomenijo
nesprejemljivo oddajo; odstopanja od načel IV–V je treba izrecno utemeljiti.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
