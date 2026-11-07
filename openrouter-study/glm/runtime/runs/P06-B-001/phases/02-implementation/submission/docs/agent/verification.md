# Preverjanje implementacije (P06)

## Stanje

- Vloga: implementer.
- Začetni zapis ustvarjen pred izvedbo; vsa preverjanja so trenutno še neizvedena.

## Načrtovana preverjanja

- Pregled izhodiščne kode v src/ glede obstoječega dizajna in podatkovnih poti.
- Implementacija izvoza CSV z nespremenljivim zaporedjem dovoljenih stolpcev, filtri, ločili, UTF-8 BOM, CRLF, navedbami in nevtralizacijo formul.
- Lastni testi v tests/agent/ za pogoje, ki jih razvojni testi ne pokrijejo v celoti.
  - R02: zaporedje glave ne glede na vrstni red klikov.
  - R03: onemogočen izvoz brez izbranih stolpcev.
  - R04: vsi filtri in prazni rezultati/projekti.
  - R07: natančna vsebina vključno s končnim CRLF.
  - R08: vse nevarne formule in kombinacije vodilnih znakov.
  - R09: Unicode, večvrstični opisi in izvirni datumi.
  - R10/R11: ohranitev ob preklopu pogleda ter ponastavitev ob menjavi projekta/osvežitvi.
- Zagon npm run check, ki vključi slog, tipe, gradnjo in dostopne teste.
  - Pred daljšim preverjanjem preveri časovni proračun.

## Dnevnik sprememb

- Prebrana navodila, izvirne zahteve in predana specifikacija.
- Implementacija še ni pričela.

## Omejitve okolja

- Odvisnosti in Chromium so nameščene; chromium.launch() v tem okolju ne deluje.
- Lastni skripti naj uporabijo wsEndpoint iz task/browser.json prek chromium.connect(wsEndpoint).
- Javni internet je blokiran; dovoljena sta samo izvoz in lokalne storitve te naloge.
- Strežnika, skupnih tipov, odvisnosti, infrastrukture in skupnih testov ne spreminjam.

## Rezultati

- Ni še rezultatov; preverjanja niso bila izvedena.

## Dnevnik sprememb (dopolnitev)

- Dodan src/csvExport.ts: nespremenljivo zaporedje stolpcev, filtri, CSV navedba, nevtralizacija formul, UTF-8 BOM, CRLF in prenos.
- Dodan src/CsvExportControls.tsx: kontrole za stolpce, filter, ločilo in izvoz; stanje je lokalno v komponenti trenutnega projekta.
- src/App.tsx sedaj vključi izvozne kontrole v obstoječem razdelku opravil.
- src/styles.css dopolnjen z kontrolami v obstoječem Folio dizajnu; ni sprememb strežnika, skupnih tipov ali odvisnosti.
- Naslednji korak: lastni testi, nato ciljana in skupna preverjanja.
