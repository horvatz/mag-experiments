# P06 – Zapis implementacije in preverjanja (izvajalec)

- Status: v0.1, načrt (2026-10-30)
- Predmet: izvedba zahtev R01–R12 iz `docs/agent/specification.md`
- Spremembe: `src/exportCsv.ts`, `src/ExportControls.tsx`, `src/App.tsx`, `src/styles.css`, `tests/agent/export.spec.ts`
- Okolje: Chromium prek `task/browser.json` (`chromium.connect(wsEndpoint)`), testna strežnika 5174/3102; javni internet je blokiran.

## Načrt preverjanja (pred izvedbo)

| Preverjanje | Zahteve | Način | Izid |
| --- | --- | --- | --- |
| Čiste funkcije CSV (neutralize/quote/buildCsv) | R02, R06–R09 | `tests/agent/export.spec.ts` | ni izvedeno |
| Razvojni testi D01–D04 | R01–R10, R12 | `npx playwright test --project=development-desktop --project=development-mobile` | ni izvedeno |
| Lastni UI testi: privzetki, vrstni red, filter, gumb | R01–R04 | agentni test | ni izvedeno |
| Lastni UI testi: BOM/ime/prelomi/narekovaji/formule | R05–R09 | agentni test | ni izvedeno |
| Preklop pogleda in ponastavitve | R10, R11 | agentni test | ni izvedeno |
| Brez zapisov, brez nove strani, 390 pik | R05, R12 | agentni test + `readonly` | ni izvedeno |
| Celoten `npm run check` | vse | lint, tsc, build, vsi testi | ni izvedeno |

## Dnevnik izvedbe

(izidi se dopolnijo po zagonih)
