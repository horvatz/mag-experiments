# P04 Specifikacija

## Pregled

Implementacija vrstnega reda z osnovnimi funkcijami podatkovne tablice za opravila (tasks), ki omogoča razvrščanje po primarnem in sekundarnem ključu ter ohranja stabilen vrstni red.

## Vhodi, dejanja in izidi

### Podatkovna polja
- id, projectId, title, description, status (todo|in_progress|done), assignee, dueDate (YYYY-MM-DD format), originalIndex

## Zahteve in pravila

| ID | Pravilo |
|---|---|
| R01 | Privzeti primarni ključ original, smer asc; sekundarni ključ none, smer asc |
| R02 | Naslov se normalizira z NFD, odstranitev diakritike in male črke za primerjavo |
| R03 | Status vrstni red: todo < in_progress < done; dueDate kronološko |
| R04 | Smer obrne samo primerjavo izbranega ključa, ne celotnega polja |
| R05 | Sekundarni ključ se uporabi samo ko se primarni ključ ujema |
| R06 | Ob enakosti obeh ključev ohranitev izvoren vrstni reda |
| R07 | Stabilni vrstni red znotraj vsakga stolpca |
| R08 | Ob menjavi pogleda ohranitev vseh nastavitev |
| R09 | Ob menjavi projekta resetirajo se vse kontrole |
| R10 | Prazen in enojni projekt delujeta pri vseh ključih |
| R11 | Razvrščanje je samo projekcija, ni API pisnega |
| R12 | Vsi ID-ji enkrat prikazani |
