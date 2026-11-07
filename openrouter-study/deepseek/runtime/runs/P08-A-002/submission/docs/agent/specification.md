# Razvojna specifikacija P08 — Koledarski pregled rokov

## Problem in kontekst

Folio trenutno prikazuje opravila projekta v preglednici in na tabli ter povzema
samo stanja (Pripravljeno / V delu / Končano). Uporabnik želi hiter koledarski
pregled rokov glede na izrecno referenčni datum: koliko opravil je zapadlih,
današnjih, v naslednjih sedmih dneh, poznejših in končanih, z možnostjo izbire
skupine. Izhodišče ostane enako: podatki se berejo iz javnega API-ja `/api/`,
videz sledi `docs/dizajn.md`, spremembe so dovoljene v `src/`, `tests/agent/`
in `docs/agent/`.

## Vhodi, dejanja in izidi

- Vhoda: polje `Referenčni datum` (`input type=date`, začetno `2026-09-21`) in
  izbirnik `Pogled rokov` (`select`: all/overdue/today/week/later/done,
  začetno `all`).
- Podatki: `Task { id, projectId, title, description, status, assignee, dueDate }`
  iz obstoječega API-ja; `dueDate` je koledarski `YYYY-MM-DD`.
- Dejanja: vnos veljavnega datuma, izpraznitev polja, izbira skupine, preklop
  pogleda Preglednica/Tabla, menjava projekta, osvežitev strani.
- Uspeh: veljaven datum takoj preračuna skupine in vrstice, aktivni filter se
  ohrani; izbira skupine pokaže le njene vrstice v izvornem vrstnem redu.
- Napaka: prazno/neveljavno polje pokaže `role=alert` z besedilom
  `Vnesi veljaven referenčni datum.` in obdrži zadnji veljavni preračun; nov
  veljaven datum opozorilo odstrani.
- Preklic/meja: filter in datum se ob menjavi projekta ter osvežitvi ponastavita
  na `2026-09-21` in `all`; stanje ni v trajni shrambi ali URL-ju.

## Zahteve in pravila

Simboli: `ref` = veljavni referenčni datum, `d` = `dueDate` opravila,
`ord(x)` = številka koledarskega dneva `x` (neodvisna od časovnega pasu),
`week_end = ord(ref) + 7`. Skupine: `overdue, today, week, later, done`.

- **R01** `ref = 2026-09-21` ob vsakem začetku projekta; začetni filter `all`.
- **R02** `status = done ⇒ skupina = done`; done ni v nobeni od štirih skupin
  odprtih opravil in se šteje le v `done`.
- **R03** `status ≠ done ∧ ord(d) < ord(ref) ⇒ overdue`; `ord(d) = ord(ref) ⇒ today`.
- **R04** `status ≠ done ∧ ord(ref) < ord(d) ≤ week_end ⇒ week`; `ord(d) > week_end ⇒ later`.
  Preslikava opravilo → natanko ena skupina; unija vseh petih skupin so vsa opravila.
- **R05** Primerjava in seštevanje potekata na ordinalih koledarskih dni
  (`Date.UTC`), zato prehodi meseca/leta in prestopni februar delujejo.
- **R06** Pet števcev `Število rokov overdue|today|week|later|done` prikazuje
  število vseh opravil projekta; izračun je neodvisen od aktivnega filtra.
- **R07** `select` ponuja all/overdue/today/week/later/done; izbrana skupina
  prikaže svoje vrstice/kartice v izvornem vrstnem redu, brez spremembe podatkov.
- **R08** Veljaven vnos posodobi `ref` in takoj preračuna skupine, vrstice in
  števce, filter ostane. Prazen vnos: opozorilo + nespremenjen `ref`. Veljaven
  vnos odstrani opozorilo.
- **R09** Preglednica in tabla prejmeta isto filtrirano množico ID-jev; preklop
  pogleda ohrani `ref`, besedilo polja in izbrano skupino.
- **R10** Menjava projekta ali osvežitev ponastavi `ref` in filter; stanje
  filtra ni v `localStorage`, `sessionStorage` niti v URL-ju.
- **R11** Prazen projekt ⇒ pet ničel in obstoječi prazen prikaz. Neprazen
  projekt z prazno izbrano skupino ⇒ `Ni opravil v izbrani skupini.`, izbirnik
  in preklop pogleda ostaneta dostopna.
- **R12** Prikaz ne piše prek API-ja; polja in podrobnosti opravil ostanejo
  nespremenjeni; Folio ostane prilagodljiv (brez vodoravnega prelivanja strani
  pri 390 px, notranje drsenje preglednice/table je dovoljeno).

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | začetna vrednost 2026-09-21, filter all | A00, A01 | `src/deadlines.ts` (REFERENCE_DATE), `src/App.tsx` (stanje ProjectView) | izvedeno, A00/A01 |
| R02 | done vedno v done | A00, A02 | `classifyTask` | izvedeno, A00/A02 |
| R03 | overdue/today meja | A00, A02 | `classifyTask` | izvedeno, A00/A02 |
| R04 | week meja ref+7, disjunktnost | A00, A02, A09 | `classifyTask`, `countGroups` | izvedeno, A00/A02/A09 |
| R05 | mesec/leto/prestop | A00, A03 | `parseCalendarDate`, ordinali | izvedeno, A00/A03 |
| R06 | pet števcev, neodvisni od filtra | A01, A02, A04 | `countGroups`, `DeadlineFilter` | izvedeno, A01/A02/A04 |
| R07 | izbor skupine, izvorni vrstni red | A02, A05 | `filterTasks` | izvedeno, A02/A05 |
| R08 | opozorilo in zadnji veljavni izračun | A04 | `App.tsx` (dateField/ref) | izvedeno, A04 |
| R09 | ista filtrirana množica v obeh pogledih | A05 | `App.tsx`, `TaskBoard` | izvedeno, A05 |
| R10 | ponastavitev ob projektu/osvežitvi | A06 | `key={project.id}`, lokalno stanje | izvedeno, A06 |
| R11 | ničle in prazna skupina | A07, A08 | `App.tsx` | izvedeno, A07/A08 |
| R12 | brez zapisov, nespremenjena polja | A02 (readonly), A05 (390 px), A06 (shramba) | obstoječi bralni tok | izvedeno, A02/A05/A06 |

## Zapis popravkov specifikacije

- 2026-10-13: prva različica pred izvedbo. Neveljavne datume podatkov
  obravnavamo kot `later` (R12 predpostavlja veljavne datume); prazno polje
  `type=date` je edini neveljaven vnos, ki ga uporabnik lahko ustvari.
- 2026-10-13: po izvedbi usklajeni ID-ji preverjanj A00–A09; dodani preverjanje
  meje leta (A03) in preverjanje odsotnosti trajne shrambe (A06).

## Odprta vprašanja in omejitve

- Končni ocenjevalni testi niso dostopni; preverjeno je z razvojnimi testi P08
  in lastnimi testi v `tests/agent/`.
- Barva opozorila in razporeditev novih kontrol nista predpisana; uporabljeni
  so obstoječi gradniki in slogovne spremenljivke.
