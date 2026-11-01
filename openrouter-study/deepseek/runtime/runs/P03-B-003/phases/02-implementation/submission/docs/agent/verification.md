# P03 — Poročilo implementacije in preverjanja

Vloga: implementer. Datum: 2026-11-01. Podlaga: predana
`docs/agent/specification.md` (različica 1.0), `task/instructions.md`,
`PROJECT_RULES.md`.

## Načrt preverjanja (začetni zapis, še ne izvedeno)

| # | Zahteve | Preverjanje | Status |
| --- | --- | --- | --- |
| V1 | R01, R09 | Privzeto stanje: prazno iskanje, oba filtra `all`, `Prikazano: 8 od 8.`, izvorni vrstni red | ni izvedeno |
| V2 | R02, R03 | NFD normalizacija (`č`/`c`, velikost črk), vse besede kot dobesedni podnizi, vrstni red besed, ločila brez regularnih izrazov | ni izvedeno |
| V3 | R04 | Logični IN iskanja, stanja in osebe; natančno ujemanje imena | ni izvedeno |
| V4 | R05 | Možnosti oseb iz celega projekta tudi za skrite osebe; menjava projekta ne ohrani stare osebe | ni izvedeno |
| V5 | R06, R09 | Isti ID-ji v preglednici in na tabli ob filtrih; števci stolpcev in povzetek štejejo prikazane | ni izvedeno |
| V6 | R07, R08 | Menjava projekta in osvežitev strani ponastavita filtre; brez URL-ja in trajne shrambe | ni izvedeno |
| V7 | R10 | `Ni zadetkov.` pri nepraznem projektu; oba pogleda uporabna; prazen projekt `0 od 0` | ni izvedeno |
| V8 | R11 | `Počisti filtre` v enem dejanju; izvorni vrstni red in podatki nespremenjeni | ni izvedeno |
| V9 | R12 | Navigacija in podrobnosti delujejo; noben zapis na `/api/`; ozka širina 390 px brez vodoravnega prelivanja | ni izvedeno |
| V10 | vsi | Razvojni testi D01–D04, osnovni testi, lastni agentni testi, `npm run check` | ni izvedeno |

## Spremembe (sprotni dnevnik)

| Čas | Sprememba | Zahteve |
| --- | --- | --- |
| 05:00 | Ustvarjen začetni načrt preverjanja | — |

## Dejanski rezultati

_(izpolnjeno sproti med izvajanjem)_

## Omejitve okolja

_(izpolnjeno sproti med izvajanjem)_
