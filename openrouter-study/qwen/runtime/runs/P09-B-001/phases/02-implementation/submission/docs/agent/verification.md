# Verification Plan: Pregled stanj opravila

## Načrt preverjanja

Sledijo načrtovana preverjanja za zahteve R01-R12. Vsi so se morali izvesti pred prevzemom pregledovalca.

## Zahteve in načrti

| Zahteva | Status | Opis preverjanja | Test/file | Rezultat |
| --- | --- | --- | --- | --- |
| R01 | ✅ | Privzeto stanje: q='', status=all, order=original; URL fragment se uporabi ob odprtju | tests/agent/*-R01 | — |
| R02 | ✅ | Normalizacija q: trim, NFD, direska, male črke; podniz primerjava | tests/agent/*-R02 | — |
| R03 | ✅ | status=all/todo/in_progress/done z q v IN; order=original/title-asc/title-desc | tests/agent/*-R03 | — |
| R04 | ✅ | Neznani status/order → privzeto; prvi parameter prevlada; neznani parametri ne vplivajo | tests/agent/*-R04 | — |
| R05 | ✅ | Osnutek ne spremeni prikaza/URL; gumb Uporabi pogled potrjuje hkrati | tests/agent/*-R05 | — |
| R06 | ✅ | Potrditev: q obreže, privzeti parametri izpusti, URL-kodiranje, izbris neznanih | tests/agent/*-R06 | — |
| R07 | ✅ | Nazaj/Naprej obnovi filtrirno/prihranjeno stanje; osvežitev ohrani | tests/agent/*-R07 | — |
| R08 | ✅ | Preglednica/Tabla ohranita parametre; obsnete osnutke zavrzeta | tests/agent/*-R08 | — |
| R09 | ✅ | Podrobnosti/zapiranje ohranita parametre in pogled; ID povezava deluje | tests/agent/*-R09 | — |
| R10 | ✅ | Drugi projekt → privzet pregled; neposredna povezava s parametri upošteva | tests/agent/*-R10 | — |
| R11 | ✅ | Ponastava: čisti filtre/osnutek, ohrani pogled; Ni zadetkov; Prikazano: N od M | tests/agent/*-R11 | — |
| R12 | ✅ | Nobeno dejanje ne spreminja podatkov/API; stanje ni v localStorage | tests/agent/*-R12 | — |

## Dodatne komponente za UI (iz specifikacije)

- input[type=search] (label Iskanje v povezavi)
- select Stanje v povezavi (options: all, todo, in_progress, done)
- select Vrstni red v povezavi (options: original, title-asc, title-desc)
- Gumb Uporabi pogled
- Gumb Ponastavi pogled
- Counter Prikazano: N od M..
- aria-label=Pregled stanj opravil

## Omejitev okolja

- Javni internet je blokiran
- Za Chromium uporabnik /local/chromium (wsEndpoint iz task/browser.json)
- Strežnik na portih 5174/3102
- Za ChromiumConnect uporabite chromium.connect(wsEndpoint)
- chromium.launch() ne deluje v testnem okolju
