# Razvojna specifikacija: Dopolnitev sistema razvrščanja opravil

## Problem in kontekst

Aplikacija Folio omogoča pregled in upravljanje opravil z dvema pregledoma:
- **Preglednica**: tabelarni prikaz vseh opravil projekta
- **Tabla**: kanbanov prikaz z stolpci po stanjih

Obstojajoči vmesnik prikazuje opravila brez možnosti razvrščanja.
Naloga vključuje implementacijo naprednega sistema razvrščanja z dvema ključema:
- Primarni ključ (original, title, assignee, status, dueDate)
- Sekundarni ključ (none, title, assignee, status, dueDate)
- Primarna smer (asc/desc)
- Sekundarna smer (asc/desc, samo ko je sekundarni ključ aktiven)

## Podatkovni vhodi in dejanja

### Podatkovni vhodi
- \`Task[]\`: Polje opravil z ID, title, assignee, status, dueDate, projectId
- \`TaskView\`: Preglednica ali table

### Dejanja
- Izbira primarnega ključa v seznamu
- Izbira primarne smeri (asc/desc)
- Aktivacija/Deaktivacija sekundarnega ključa
- Izbira sekundarne smeri
- Ponastavitev na izvorni vrstni red

### Izidi
- Preglednica/tabla prikazuje opravila razvrščena po izbranih ključih
- Vsi ID-ji prejemnikov natanko enkrat (key={task.id})
- Razvrščanje je projekcija - ne spremeni podatkov API-ja

## Zahteve in pravila

| Zahteva | pogoj in sprejemni pogoj | preverjanje |
| --- | --- | --- |
| R01 | Privzeti: primarni ključ \`original\`, smer \`asc\`; sekundarni ključ \`none\`. 
Ohrani vrstni red prejetega polja. | Test D01 (privzeti) |
| R02 | Primarni ključ \`title\` ali \`assignee\`: NFD normalization, odstranitev diakritike (U+0300-U+036F), male črke, leksikografsko UTF-16 primerjavo. | Test D01 (title alphabetical) |
| R03 | Primarni ključ \`status\`: todo < in_progress < done. \`dueDate\`: YYYY-MM-DD kronološko. | Test D02 (status sort) |
| R04 | Smer obrne samo izbiro primarnega ključa. Ne obrača celotnega polja ali enačitev. | Test D01 (asc/desc) |
| R05 | Sekundarni ključ se uporabi samo ob enaki primarni vrednosti. Neodvisna smer obrne znotraj primarnih enakosti. | Test D02 (secondary sort) |
| R06 | Pri enakosti obeh ključev ostane izvorni vrstni red. \`original\` primarni ključ vedno vrača izvorni vrstni red. | Test D04 (original sort) |
| R07 | Tabla ohrani tri stolpce. Vrednost stolpca uporabi relativni vrstni red iz razvrščenega polja. | Test D03 (board preserves order) |
| R08 | Preklop pogleda ohrani vse štiri nastavitve. Zapiranje podrobnosti ne ponastavi. | Test D04 (persist settings) |
| R09 | Menjava projekta ponastavi vse štiri kontrole na privzete vrednosti. | Test z menjavo projektov |
| R10 | Gumb \`Izvorni vrstni red\` ponastavi vse štiri kontrole. Pranje in eno opravilo delujeta. | Test D04 (reset button) |
| R11 | Razvrščanje je projekcija API-ja. Ne spremeni polj, pripadnosti, API-ja. | Test D04 (no writes) |
| R12 | Vsi ID-ji enkrat. Enačila imena delujejo pravilno. 
Ostale bralne funkcije pravilno. | Test D01–D03 (expectIds) |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test | Datoteka | Izid |
| --- | --- | --- | --- | --- |
| R01–R08 | Implementacija v src/TaskTable.tsx | D01–D04 | TaskTable.tsx | Čakajo |
| R09 | App.tsx ponastavi sortState ob menjavi projekta | - | ProjectView | - |
| R10 | Gumb \`Izvorni vrstni red\` resetuje sortState | - | TaskTable | - |
| R11 | API samo branje, React setState | - | - | - |
| R12 | key={task.id} tabelam in karticam | - | Table.tsx/Board.tsx | - |

## Odprta vprašanja in omejitve

- Testi D03 preverjajo relacijo stolpcev, ne celotnega vrstnega reda vseh stolpcev.
- Normalizacija title/assignee testov ni neposredna (JavaScript String.localeCompare).
- Datumi so odvisni od veljavnega API-ja YYYY-MM-DD.
- Pri 390px širini mora biti stranska vrstica.

