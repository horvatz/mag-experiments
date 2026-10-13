# Plan: R11 in R12 Implementacija
**Namestitev:** docs/agent/P04/plan.md
**Datum:** 2026-10-11

## R11: Razvrščanje (Sort)
### Funkcija
```
src/sort.js (nova)
```
### Implementacija
- Ustvari `src/sort.js` z funkcijo `multiKeySort` za stabilno razvrščanje po primarnem in sekundarnem ključu
- Implementiraj `stableSort` algoritem za ohranitev izvornega vrstnega reda pri enakih enotah
- Normalizacija: NFD normalizacija, odstranitev diakritike (U+0300–U+036F), male črke, UTF-16 primerjava
- Uporaba: v `src/App.jsx` za obdelavo sortnih parametrov iz API-ja
### Test
`node scripts/sort-e2e.mjs`

## R12: Prikaz ID-jev (Uniqueness & Identification)
### Funkcija
Update `src/ListItem.jsx` in `src/TaskDetail.jsx`
### Implementacija
- Dodaj `data-testid="task-title-{card.id}"` v `ListItem`
- Preveri obstoj tasks z GET `/api/tasks/{taskId}` pred prikazom
- Prikaži sporočilo "Task ne obstaja" ob napaki
- Ohrani `data-task-id` atribute
### Test
Preguj skupne teste v `tests/`

