# Specifikacija: Straničenje in filter stanja

## Problem in kontekst

Folio aplikacija prikazuje opravila projekta v tabeli. Sedaj prikazuje vsa opravila enostransko. Značilnost P05 doda straničenje (page size: all/2/5/10) in filter po stanju (all/todo/in_progress/done), da lahko uporabniki pregledujejo veliko število opravil.

## Vhodi, dejanja in izidi

**Vhodi (UI):**
- \`page_size\`: "all" | "2" | "5" | "10" — velikost strani v HTML selectu (label: Velikost strani)
- \`filter_status\`: "all" | "todo" | "in_progress" | "done" — filter v HTML selectu (label: Filter strani)
- Navigacijski gumbi: "Prva stran", "Prejšnja stran", "Naslednja stran", "Zadnja stran"

**Dejanja:**
1. Sprememba \`page_size\` → resetirano na stran 1, filter ostane nespremenjen
2. Sprememba \`filter_status\` → resetirano na stran 1, page_size ostane nespremenjen (razen če je "all")
3. Navigacijski gumbi → preklop na ustrezno stran znotraj trenutnega filtra in page_size
4. Preklop pogleda (table ↔ board) → stran, page_size in filter ostanejo
5. Odpiranje/zapiranje podrobnosti → stran, page_size in filter ostanejo
6. Sprememba projekta od strani → resetirano na stran 1, page_size="all", filter="all"

**Izidi (stanje):**
- \`tasks\`: niz opravil po filtru in strani
- \`page_number\`: trenutna stran (1-based)
- \`page_size\`: trenutna velikost strani ali "all"
- \`total_results\`: skupno število opravil po filtru (ne glede na straničenje)
- \`total_pages\`: celotno število strani (0, če je rezultat = 0)
- \`displayed_range\`: obseg prikazanih indeksov (1-based) "A-B"
- \`status_text\`: "Stran X od Y" ali "Stran 0 od 0" ko je rezultat prazen
- \`all_view\`: če je \`page_size="all"\`, je vse opravilo na eni strani (če je rezultat ≠ 0)

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto: \`page_size="all"\`, \`filter_status="all"\`, \`page=1\`. Vsi podatki prikazani, vrstni red iz API-ja. | Preveriti privzet pogled, ko aplikacija zažene. |
| R02 | Velikosti 2/5/10 razdelijo \`filtered_tasks\` v neprekrivajoče se odseke. Zadnja stran manj kot page_size je dovoljena. Noben ID ne podvoji ali izgine. | \`displayed\` = \`tasks\` od \`(page-1)*page_size\` do \`min(page*page_size, total_results)\`. |
| R03 | Prva/Prejšnja/Naslednja/Zadnja stran prestanita na ustrezno stran. Če stran ni veljavna (npr. Prejšnja na stran 1), gumb je onemogočen in ne spremeni stanja. | Gumbi \`disabled\` ko so na robu, klik ne spremeni \`page\`. |
| R04 | Sprememba \`page_size\` → \`page=1\` vedno. Če je \`page_size="all"\`, je vse opravilo na eni strani (če je rezultat ≠ 0). | Preveriti po spremembi velikosti: \`page=1\`. |
| R05 | Filter \`all/todo/in_progress/done\` se uporabi pred straničenjem. Sprememba filtra → \`page=1\`. Ne vpliva na vrstni red. | Filter narekuje \`filtered_tasks\`; vsi na strani 1 po spremembi. |
| R06 | Preglednica in tabla prikazujeta iste opravila po strani. Tabla združi prikazana opravila v stolpce po statusu; ne straniči vsak stolpce ločeno. | Obe vrsti prikazov hkrati uporabljata isto \`tasks\` in \`page\`. |
| R07 | Preklop table ↔ board ter odprtje/zapiraj podrobnosti ohranita \`page\`, \`page_size\`, \`filter_status\`. | Navigacija ne spremenita statusa straničenja. |
| R08 | Menjava projekta ali osvežitev: \`page_size="all"\`, \`filter_status="all"\`, \`page=1\`. Stanje ni v \`localStorage\` ali URL. | Zamenjava projekta resetira; ni trdne shrambe. |
| R09 | Za \`total_results > 0\`: status="Stran X od Y", prikaz="A–B od N.", kjer je X=page, Y=total_pages, A=start_index+1, B=end_index, N=total_results. | Preveriti besedilo status elementa in aria-label. |
| R10 | Za prazen projekt ali filter: status="Stran 0 od 0", prikaz="0–0 od 0.", vsi gumbi onemogočeni. Ob odstranitvi filtra je spet stran 1. | Preveriti stanje ko je \`tasks.length===0\`. |
| R11 | Pregled stanj: število = celoten nefiltriran projekt. Stolpci table: števci = prikazana opravila na trenutni strani. | Preveriti \`counts.total\` in stolpce. |
| R12 | Straničenje ne spreminja podatkov na API. ID-ji pravilni, podrobnosti delujejo. API lebere \`/api/projects/{id}/tasks\`. | Preveriti, da API ni POST/PATCH ob strani. |

## Simboli in predpostavke

- \`filtered_tasks\`: niz opravil po \`filter_status\` (vsota vse projekti)
- \`page_size="all"\` → \`filtered_tasks.length\` opravil, ena stran
- \`page_size="2"|"5"|"10"\` → odseki \`(page-1)*size\` do \`min(page*size, filtered_tasks.length)\`
- \`total_pages = max(1, ceil(filtered_tasks.length / page_size))\` ko je \`page_size ≠ "all"\`
- Če je \`filtered_tasks.length = 0\`: \`total_pages = 0\`, \`page_number\` efektivno 0
- Filtriranje: \`filter_status === "all"\` → vsa opravila; sicer \`task.status === filter_status\`
- Vrstni red: enak kot prihaja iz API-ja; filter ne sortira

## Odprta vprašanja in omejitve

- Stanje se ne shrani v \`localStorage\` ali URL
- Brez API-ja za strežnik: preverjanje le preko \`/__test/state\` in simulacije
- Neuporabljeni UI: \`aria-label\` statusa mora vsebovati "Stran X od Y" med indeksi
- Začetni pogled: privzeti \`page_size="all"\`, \`filter_status="all"\` je R02
