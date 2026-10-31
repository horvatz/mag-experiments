# Poročilo implementacije in preverjanja (P09)

Vloga: implementer. Vir zahtev: task/instructions.md in docs/agent/specification.md.
Stanje: v izvajanju; načrtovana preverjanja so še neizvedena.

## Načrt preverjanja (še neizvedeno)

| Zahteva | Preverjanje | Status |
| --- | --- | --- |
| R01 | Neposredni URL s parametri uporabi stanje brez klika; privzetki | načrtovano |
| R02 | Normalizacija NFD/trim/male črke; podniz po title/description/assignee/id; dobesedna fraza | načrtovano |
| R03 | status filter IN z q; title-asc/desc stabilno pri enakih naslovih | načrtovano |
| R04 | Neveljavna status/order -> privzetek; prva ponovitev; neznani parametri; URL se ne prepiše ob branju | načrtovano |
| R05 | Osnutek ločen od prikaza/URL; eno zgodovinsko stanje; ponovitev brez vnosa | načrtovano |
| R06 | Serializacija URL (trim, izpust privzetkov, percent-encoding, view=board, odstranitev neznanih) | načrtovano |
| R07 | Nazaj/Naprej in osvežitev obnovijo C in D | načrtovano |
| R08 | Preklop pogleda ohrani C in ID-je; osnutek se zavrže | načrtovano |
| R09 | Podrobnosti ohranijo C/view; pravi ID pri enakih naslovih | načrtovano |
| R10 | Klik drugega projekta = privzetki; neposredna povezava s parametri jih upošteva | načrtovano |
| R11 | Ponastavi pogled; Ni zadetkov.; števec Prikazano: N od M. | načrtovano |
| R12 | Brez zapisov na API, brez localStorage, regresije, 390 px | načrtovano |
