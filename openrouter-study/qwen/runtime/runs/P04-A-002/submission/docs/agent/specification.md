# Specifikacija P04: Stabilno razvrščanje z dvema ključema
## Problem in kontekst
Aplikacija Folio prikazuje opravila (tasks) za projekte v preglednici ali tabeli. Trenutno prikazuje opravila v **izvornem vrstnem redu** iz API-ja (po ID-u).

**Nova zahteva:** Prikaz opravil mora uporabnika omogočati razvrščanje z uporabo:
1. **Primarnega ključa** (title, assignee, status, dueDate) s smerjo (asc/desc)
2. **Sekundarnega ključa** (none, title, assignee, status, dueDate) s smerjo (asc/desc), ki se uporabi samo ob enakosti primarnega ključa

Nastavitve so **lokalne in trenutne** (ne v trajni shrambi ali URL). Menjava projekta ponastavi vse nastavitve.

## Zahteve in pravila

| Zahteva | Pravilo/sprejemni pogoj | Način preverjanja |
|---------|-------------------------|-------------------|
| R01 | Privzeti primarni ključ je original, smer asc; sekundarni none, smer asc | Default sort uporablja identity |
| R02 | Primarni ključ title: NFD, odstranitev dijakritikov, male črke, UTF-16 leksikografsko | `compareKeys()` normalizira |
| R03 | Primarni ključ status: todo→in_progress→done; dueDate: chronološki | Map za prioriteto |
| R04 | Smer asc/desc obrne samo izid, ne izenačenih | Smer upošteva rezultat primerjave |
| R05 | Sekundarni ključ samo ob enakosti primarnega | `secondarySort()` |
| R06 | Original sort za original ključ; stabilno za enake | Equality preserves original order |

## Načini preverjanja
- DOM: `data-task-id` vrstni red v tabeli
- Lastni testi: `tests/agent/sorting.spec.ts`


## Podrobno pojasnilo zahtev

### R01: Privzeti razvrstitev
- Primarni ključ: original (izvorni vrstni red iz API-ja)
- Primarna smer: asc (kot identity sort)
- Sekundarni ključ: none (ne uporabi sekundarnega ključa)
- Sekundarna smer: asc
- Vrstni red je enak izvornemu vrstnemu redu iz API-ja

### R02: Normalizacija naslovov (title)
- Unicode NFD normalizacija
- Odstranitev dijakritikov: U+0300-U+036F
- lowerCase
- UTF-16 leksikografska primerjava z < in > (ne localeCompare)
- Izraz: s`title` primerja normalizirane nize brez jezika/številk prilagoditve

### R03: Status in dueDate
- Status vrstni red: todo < in_progress < done
- dueDate: veljavni YYYY-MM-DD datumi, kronološki (nasprotje)
- Neveljavni datumi se izločijo ali obdrže na koncu

### R04: Smer asc/desc
- Smer obrača samo izid primerjave
- Ne obrača celotnega končnega polja
- Ne obrača vrstnega reda izenačenih elementov

### R05: Sekundarni ključ
- Sekundarni ključ samo ob enakosti primarnega
- Sekundarni ključ: none, title, assignee, status, dueDate
- Vsak sekundarni ključ ima svojo neodvisno smer

### R06: Izvorni vrstni red
- Ob enaki osnovi in enakem sekundarnem ključu: izvorni vrstni red
- Enak sekundarni in primarni ključ je dovoljen
- ``original`` na primarnem ključu vedno vrne izvorni vrstni red

### R07: Stolpci v tabeli
- Stalni vrstni red: Opravilo, Stanje, Oseba, Rok
- Znotraj stolpca: relativni vrstni red iz razvrščenega polja

### R08: Ohranjanje nastavitev
- Preklop board/table: ohrani vse štiri nastavitve
- Podrobnosti: ne ponastavi vrstnega reda
- Vse štiri kontrole: primary key, secondary key, primary dir, secondary dir

### R09: Preklop projekta
- Project change: reset all 4 sorting settings
- Retry: starts with defaults
- No localStorage or URL storage

### R10: Reset button
- Original order button: resets all 4 controls
- Empty project: works with all keys/dirs
- Single task project: works with all keys/dirs

### R11: Projection
- Sorting is projection only, no mutation of task data
- Does not affect task assignments or counts
- No side effects on API

### R12: IDs and details
- All IDs displayed exactly once
- Correct details for same titles (via ID)
- Other read functions preserved

