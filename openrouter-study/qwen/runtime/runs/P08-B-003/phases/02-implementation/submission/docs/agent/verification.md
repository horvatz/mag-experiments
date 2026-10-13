# Verifikacija: Koledarski pregled rokov (P08)

## Načrtovana preverjanja

### Infrastruktura
- [ ] Testni strežnik streže na PORT 3102, WEB_PORT 5193
- [ ] Chromium preko `chromium.connect(wsEndpoint)` s `wsEndpoint` iz `task/browser.json`
- [ ] API endpoint \`/api/projects\` in \`/api/projects/${{id}}/tasks\`
- [ ] Razvojni testi iz \`tests/development/P08.spec.ts\`

### Obvezne zahteve R01-R12 (dokumentirane v specifikaciji)

## Status implementacije

| Zahteva | Stanje | Opombe |
|---------|--------|--------|
| R01 | 📝 Draft | Referenčni datum 2026-09-21, All kot default |
| R02 | 📝 Draft | Done taski ločeni od ostalih skupin |
| R03 | 📝 Draft | Overdue (< datum) in Today (= datum) |
| R04 | 📝 Draft | Week (1-7 dni), Later (>) |
| R05 | ✅ | Datumi kot koledarske vrednosti, UTC |
| R06 | 📝 Draft | 5 števcев, filter ne spremeni celotnega števila |
| R07 | 📝 Draft | Izbirnik pogledov all/overdue/today/week/later/done |
| R08 | 📝 Draft | Prazen datum → alert, veljaven datum brise alert |
| R09 | 🚧 Neuporabno | Preglednica/tabla prikazujeta iste podatke |
| R10 | 🐠 Neuporabno | Menjava projekta / osvežitev |
| R11 | 📝 Draft | Priznanje praznega projekta, prazna skupina |
| R12 | ✅ | YYYY-MM-DD formati, samo branje |

## Omejitve

- Začetna specifikacija ni popolna za vse zahteve
- Manjkajo enote preglednice in sheme komponent za referenčni datum
- Oblikovalni odločitve za pozicijsko razporeditev (flex/grid) niso določene
- API ne vrne taskov z statusom \`done\` v seznam (samo todo, in_progress)

## Implementacija vsaka faza

- [ ] Ustvaritev StateManager za ločen reference date in active filter
- [ ] Implementacija computeTaskGroups function z utemeljitvami R01-R04
- [ ] dodajanje date input in select v ProjectView
- [ ] dodajanje counter UI z \`aria-label="Število rokov <ključ>"\`
- [ ] dodajanje conditional rendering za vidne taskove glede filter
- [ ] validacija inputov in error display (role=alert)
- [ ] razvojne teste v tests/agent/
