# Specifikacija: Koledarski pregled rokov

## Problem in kontekst

Aplikacija **Folio** prikazuje opravila v projektu z možnostjo tabele in tabele. Za pilot P08 se doda funkcionalnost koledarskega pregleda rokov, ki klasificira odprta opravila glede na razliko med njunim rokom in referenčnim datumom.

**Namen:** Omogočiti uporabniku, da vidi opravila razvrščena kot Zapadlo, Danes, Naslednjih 7 dni, Pozneje in Končano.

**Začetno delovanje:** Aplikacija prikazuje opravila po stanjih (todo/in_progress/done) v tabelarnem ali tabličnem pogledu.

**Predvidena sprememba:** Dodati se bo novi referenčni datum (2026-09-21 po defaultu), izbira pogleda rokov (all/overdue/today/week/later/done) in pet števcev za vsako kategorijo rokov.

## Vhodi, dejanja in izidi

### Podatkovni vhodi

- Task.dueDate – koledarski datum v formatu YYYY-MM-DD (veljavno tudi za februarje, prestopa leta)
- Task.status – lahko todo, in_progress, done
- ReferenceDate – datum, ki ga vpiše uporabnik v element z oznako "Referenčni datum"

### Dejanja

- Uporabnik vpiše datum v polje "Referenčni datum"
- Uporabnik izbere pogled v kombinacijskem polju "Pogled rokov" (html select)
- Strežnik vrne opravila prek /api/projects/{id}/tasks brez sprememb

### Omejitve pristopa

- API samo GET začetje – brez brisal za posredovanje
- Dejavni elementi:
  - aria-label="Število rokov overdue|today|week|later|done"
  - role=alert z besedilom Vnesi veljaven referenčni datum. (pri praznem datumu)

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Naican preverjanja |
|---------|--------------------------------|-------------------|
| R01 | Referencni datum je izrecno 2026-09-21 ob vsakem zacetku projekta; zacetni pogled je all. | D01 |
| R02 | opravilo s status: done vedno v skupino done, ne glede na datum. | D04 |
| R03 | Odprto opravilo z dueDate pred referencnim datumom -> overdue; enakim -> today. | D01, D03 |
| R04 | Odprto opravilo z datumom od +1 do +7 dni -> week; poznejši -> later. | D02 |
| R05 | Datumi YYYY-MM-DD v UTC, neodvisno od casovnega pasu. | formatDate z timeZone: UTC |
| R06 | Pet stevec z aria-label: Steilo rokov {overdue|today|week|later|done}. | R06 test |
| R07 | Izbirnik all/overdue/today/week/later/done prikazuje skupino. | D01,D02,D04 |
| R08 | Novi datum preraunava skupine. Prazno polje prikaže alert. | D03 |
| R09 | Preglednica in tabla prikazujeta iste filtrirane ID-je. | R09 |
| R10 | Meni projekta ponastavi dan in skupino. | R10 |
| R11 | Pazen projekt -> [0,0,0,0,0]. Prazna skupina -> opozorilo. | R11 |
| R12 | GET samo, brez zapisov na API. | R12 |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
|---------|-------|-------------------|---------------------|----------------|
| R01 | Default datum 2026-09-21; začetni pogled all | D01 | src/App.tsx (nov container), src/ constants.ts | Test preverja polje in filter |
| R02 | done opravila vedno v skupino done | D04 | src/hooks/useTaskGrouping.ts | Filter: status === done |
| R03 | overdue < referenca; today = enak | D01, D03 | src/hooks/useTaskGrouping.ts | isOverdue, isToday |
| R04 | +1 ali +7 dni → week; poznejši → later | D02 | src/hooks/useTaskGrouping.ts | getTaskGroup |
| R05 | UTC obravnava datume | formatDate že uporablja timeZone: UTC | src/formatDate.ts, hooks/useTaskGrouping.ts | UTC obravnava |
| R06 | Pet stevec z labeli; filter ne vpliva na številke | Dodati R06 test | src/App.tsx (pet števcev) | expect(aria-label) |
| R07 | Select vpraša pogled; ne spreminja staj | D01,D02,D04 | src/App.tsx (select onChange) | Test preverja izbire |
| R08 | Novi datum preračuna; prazen datum → alert | D03 | src/App.tsx, hooks/useTaskGrouping.ts | role="alert" pri praznem |
| R09 | Tabela in tabla iste filterirane ID-je | R09 | src/App.tsx (obe) | expectIds |
| R10 | Novega projekt ponastavi datum in pogod | src/useTaskContext.ts | src/App.tsx (project change) | reset datum |
| R11 | Pazen projekt → [0,0,0,0,0]; prazna skupina → opozorilo | R11 test | src/hooks/useTaskGrouping.ts | če tasks.length === 0 |
| R12 | GET samo, brez zapisov | readonly v helpers | src/api.ts, App.tsx | expect(writes) === [] |

## Odprta vprašanja in omejitve

- Testni strežnik: 127.0.0.1:3102; aplikacija ne dostopa do zunanjega interneta.
- Chromium se poveže preko ws://127.0.0.1:9223/<token> (task/browser.json).
- Referenčni datum: ključen za logiko; prazni datum → alert, ohrani zadnje veljavne rezultate.
- Števci se izračunajo samo iz trenutnih tasks (brez memorije).
- API /api/ ne podpira ustvarjanja/brisanja opravil; samo PATCH za stanje.
- Lokalni čas in časovni pas ne vplivata na datume (UTC obravnava).
- Filter shrani v localStorage, ne v trajnem URL-ju ali shrambi.

## Skupaj implementiranih zahtev

Pričakuje se 12 zahtev (R01-R12), vse preverjene z razvojnimi testi in lastnimi testi.

