**Predaja: specifikacija v1.0**

- `docs/agent/specification.md` — izpolnjena skupna predloga: problem/kontekst, dejanski podatkovni model (`Task` iz `shared/types.ts`), dejanja, predikati in pravila prehoda stanja (`move`/`undo`/`redo`/`reset`, `cap20`), invariante I1–I5, pogoji R01–R12 in tabela sledljivosti z mesti za dejanske izide implementerja.
- `docs/agent/specification-history.md` — zapis 0.1 → 1.0.

Ključne opredelitve za implementerja:
- Točna dostopna imena: `Premakni <id> gor/dol`, `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`, `Mesto opravila <id>`, `role=status` z `Zgodovina vrstnega reda` in besedilom `Razveljavitve: U. Ponovitve: R.`.
- Novi gumbi zunaj povezave opravila; `data-task-id` ostane na `<tr>`/`<li>`.
- Zgodovina: `U` največ 20, nov veljaven premik počisti `R`, neveljaven robni klik ne spremeni ničesar; `reset()` je eno dejanje in je onemogočen pri `P = P0`.
- Tabla uporablja globalnega soseda in prikazuje globalno mesto, ne spreminja statusov; preklop pogleda/podrobnosti ohrani stanje, menjava projekta in osvežitev ga ponastavita; brez zapisov na API in brez trajne shrambe.
- Predpostavke za `n=0` in `n=1` so izrecno zapisane.

V tej vlogi nisem zagnal aplikacije ali testov; razvojni testi D01–D04 so bili samo prebrani, zato so izidi v sledljivosti označeni kot neizpolnjeni do implementerjevega zagona.
