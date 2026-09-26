# P10 — preverjanje in predaja

2026-09-26, postopek C. [Specifikacija in sledljivost](P10/spec.md), [načrt](P10/plan.md), [naloge](P10/tasks.md).

## Rezultat

Implementirani so globalni lokalni premiki, do 20 razveljavitev, ponovitve, razveljavljiva vrnitev na izvorni red, globalna mesta in števec zgodovine v obeh pogledih. Pogledi in podrobnosti ohranijo stanje; menjava projekta in osvežitev ga ponastavita. Nova dejanja ne spreminjajo polj/statusov in ne zapisujejo na API ali v trajno shrambo.

## Evidenca izvedbe

- T001: pregledani lokalni viri, komponente, življenjska doba projekta in obstoječa konfiguracija Playwright. Testi uporabljajo pripravljeni Chromium in porte 5174/3102. Osrednja evidenca je po izrecnem navodilu implementacije ta datoteka namesto prvotno predvidene `P10/verification.md`.
- T002–T005: dodani reducer, naložena sekcija s skupnim stanjem, kontrole obeh pogledov in dodatki slogom. Podatkovni sloj, strežnik, tipi, odvisnosti, konfiguracije in skupni testi niso bili spremenjeni.
- T006–T007: dodani in izvedeni spodnji testi prehodov in UI, vključno s praznimi/enočlenskimi projekti, 13 opravili v UI ter 23 ID-ji v testu zgodovine.
- T008: `npm run check > docs/agent/P10/check.log 2>&1` je končal z izhodno kodo 0. Lint, tipi in gradnja uspešni. Playwright: **55 passed (21.3s)**, torej 38 osnovnih + 8 razvojnih + 9 lastnih preverjanj. [Celoten dnevnik](P10/check.log).
- T007 vizualno: odprti in pregledani [mobilna preglednica](P10/mobile-table.png), [mobilna tabla](P10/mobile-board.png) in [namizna tabla](P10/desktop-board.png). Ohranjen znak Folio, navigacija, sistemska pisava, modri poudarki, nevtralne kartice in stalni stolpci. Orodna vrstica se ovija; pri 390 px ni širjenja cele strani. Preglednica na posnetku kaže dovoljeni notranji vodoravni pomik do kontrol. A08 potrdi vidni fokus in premik s tipko Enter.
- T009: sledljivost vseh R01–R12 dopolnjena s kodo, testi in dokazi. Naloge označene po dejanski izvedbi.

## Lastni testi

Vsi so v [tests/agent/P10.spec.ts](../../tests/agent/P10.spec.ts), vsi uspešni v zgornjem dnevniku.

| Test | Preverjeno vedenje |
| --- | --- |
| A01 | Več undo/redo celotnih zaporedij, ponovljena robna/neznana dejanja ohranijo redo, razvejitev in zamrznjeni vhodi brez mutacij. |
| A02 | 23 ID-jev, 21 premikov, izguba samo najstarejše razveljavitve, 20 undo in vseh 20 redo z natančnimi zaporedji. |
| A03 | Reset kot eno dejanje, počisti redo, podpira undo/redo in je brez učinka pri izvornem redu z nepraznim redo. |
| A04 | 13 opravil, Unicode/ločila v ID-jih, enaki naslovi, mesta, meje, števec, pravilne podrobnosti in ohranjeni status/oseba/datum/opis. |
| A05 | Globalni sosed drugega statusa, relativni red stolpcev, oba sklada med pogledi/podrobnostmi, ponovitev po navigaciji, projekt/povratek in osvežitev. |
| A06 | UI reset/undo/redo; onemogočena robna dejanja in reset ohranijo redo; nov veljaven premik ga zavrže. |
| A07 (2 primera) | Nič ali eno opravilo, oba pogleda in projekti ostanejo uporabni; pravilna onemogočenost in števci. |
| A08 | 390 px, fokus in tipkovnica, premik v obeh pogledih, brez zapisov na API, posnetki. |

## Omejitve

Končni skriti testi niso dostopni in niso bili izvedeni. Preverjeni primeri ne pomenijo izčrpnega preverjanja vseh možnih vhodov in permutacij. Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov ne širimo prek skupnih regresijskih zahtev. Znane neizpolnjene zahteve R01–R12 niso ostale.
