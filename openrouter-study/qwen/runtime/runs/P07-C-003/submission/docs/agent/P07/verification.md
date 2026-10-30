# Verifikacija: Folio — Priljubljena opravila in trajna shramba

**Priredba:** P07.1.0. Glej `docs/agent/P07/spec.md`.

## Rezultati zahtev

| ID | Status | Pomembno | Napake ali omejitve |
| --- | --- | --- | --- |
| R01 | - | Gumbi `aria-pressed` ločeno od povezave |  |
| R02 | - | `localStorage` ključ `folio:favorites:v1`, JSON `{version:1,ids:[...]}` |  |
| R03 | - | Osvežitev obnovi ID-je |  |
| R04 | - | Napačni podatki → prazna množica |  |
| R05 | - | Checkbox `Prikaži le priljubljena`, privzeta `false` |  |
| R06 | - | Filter priljubljenih, prazno stanje |  |
| R07 | - | Preglednica in tabla, ista množica |  |
| R08 | - | Menjava projekta, filter resetira |  |
| R09 | - | Gumb `Odstrani priljubljene`, `disabled` brez priljubljenih |  |
| R10 | - | Števec `Priljubljeno: X od M.` |  |
| R11 | - | `storage` dogodk, `null` izprazni |  |
| R12 | - | Lokalne spremembe, ni zapisov na API |  |

## Sledljivost

- **Naloge:** `docs/agent/P07/tasks.md`
- **Načrt:** `docs/agent/P07/plan.md`
- **Testi:** `tests/agent/P07.spec.ts`

---
*Ta dokument se posodablja ob sledovnem izvajanju.*
