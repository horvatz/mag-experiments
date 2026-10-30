# Stabilno razvrščanje z dvema ključema
Pilot P04, specifikacija za stabilno razvrščanje opravil v tabeli in tabli.

## Problem in kontekst

Uporabniki Folio potrebujejo pregled opravil z možnostjo razvrščanja. Obvezno začetno delo:
- Projekti prikažejo opravila v tabeli ali tabli brez razvrščanja.
- Podatki se načrtujejo iz `/api/projects/:id/tasks` ali `/api/projects` in `/api/tasks/:id`.

Predvidena izboljšava:
- Dva neodvisna razvrščevalna ključa z ločenima smerema za vsako od štirih projektov.
- Gumb za vrnitev v izvorni (neposredni prejem) vrstni red.
- Razvrščanje je projekcija: operacije ne spreminjajo API-ja ali trajne shrambe.
