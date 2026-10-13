# razvojna specifikacija P03: Iskanje in filtri

## Problem in kontekst

Aplikacija Folio prikazuje opravila projektov v tabeli ali tabličnem pogledu. Trenutno aplikacija prikazuje vsa opravila trenutnega projekta brez možnosti iskanja ali filtriranja. Naloga zahteva implementacijo ustreznega vmesnika za iskanje in filtriranje opravil, ki mora biti dostopen in funkcionalen za uporabnika.

Ključne spremembe:
- Dodajanje vmesnika za iskanje s podporo za kombinirano iskanje besed
- Dodajanje filtrov za stanje in odgovorno osebo
- Uporaba obstoječih API mehanizmov za pridobivanje podatkov

## Vhodi, dejanja in izidi

### Podatkovni vhodi
- search: Iskalni vnos (prazno za noben filter)
- statusFilter: Filter stanja (all/todo/in_progress/done)
- assigneeFilter: Filter odgovorne osebe (all ali točno ime)
- project: Trenutno izbrani projekt (določen z URL)

### Dovoljena dejanja
1. Vnos iskalnih nizov v iskalno polje
2. Izbira filtrov v select elementih
3. Klik gumb "Počisti filtre"
4. Sprememba projekta v navigaciji
5. Preklop pogleda (tabla/preglednica)

### Pričakovani izidi po vsakem dejanju
- Ob nalaganju: Prazni filtri, vsa opravila prikazana
- Po iskanju: Filtrirani rezultati prikazani brez POST/PATCH/PUT/DELETE
- Po filtriranju: Filtrirani rezultati prikazani brez POST/PATCH/PUT/DELETE
- Ob spremembi projekta: Reset vseh filtrov, prikaz opravil novega projekta
