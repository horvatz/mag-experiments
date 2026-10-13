SPEVNE VSEBINE DATOTEKE
# Specifikacija za pilot P10 – Lokalni vrstni red z razveljavitvami
## Problem in kontekst
Aplikacija **Folio** prikazuje opravila (*tasks*) v *table* prikazu. Naloga uvaja lokalni vrstni red opravil z možnostmi premikanja gor/dol, zgodovino razveljavitve in ponovitve.
**Izhodišče**: Zgodovina vrstnega reda je prazna. Vrstni red je enak kot v API-ju (polje *tasks*), vsako opravilo ima globalni položaj od 1 do N po sorazumnosti ID-jev.
**Cilj**: Dodati gumba "Premakni <id> gor" in "Premakni <id> dol", gumba "Razveljavi premik" in "Ponovi premik", ter števec "Razveljavitve: U. Ponovitve: R.". Premiki spreminjajo le vrstni red, ne vsebine, vendar **ne uporabljajo API-ja** – spremembe so lokalne.
**Dizajn**: Ohraniti obstoječe poimenovanja, barve, ikone in stil (Folio, 16 px odmike, 16 px zaobljenost). Nova dejanja za opravilo so zanj ločena.


## Vhodi, dejanja in izidi

**Podatkovni tipi**:
- `Task { id: string, projectId: string, title: string, description: string, status: 'todo'|'in_progress'|'done', assignee: string, dueDate: string }` (iz `shared/types.ts`)
- `Project { id: string, name: string }` (iz `shared/types.ts`)

**Beri**: Javni API `/api/projects/{id}/tasks` (GET). Testni podatki: poljubno število opravil (0, 1, >10), različni ID, možni enaki naslovi, sorazmerna zaporedja, veljavni koledarski datumi.


**Dejanja** (samo *table*):
- *Premakni <id> gor*: zamenjaj z neposrednim globalnim predhodnikom.
- *Premakni <id> dol*: zamenjaj z neposrednim globalnim naslednikom.
- *Razveljavi premik*: obnovi zadnjo permutacijo.
- *Ponovi premik*: obnovi zadnjo razveljavljeno permutacijo.
- *Začetni vrstni red*: vrne izvorno permutacijo.
- *Preklop pogleda* ↔ *povrni osvežitev*: ohranja/vrne vrstni red.

**Brez API-write**: Vse spremembe so lokalne, v pomnilniku.


---

## Zahteve in pravila

| Zahteva | Pravilo | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku vrstni red = API. Globalno mesto od 1 do N; enaki naslovi se ne povezujejo. | Prizor: 0, 1, >10 opravil |
| R02 | *Premakni gor/dol* zamenjata opravilo z neposrednim globalnim sosedom. Polja nespremenjena. | Vsebnina nedotaknjena |
| R03 | Robni *gor* za prvo in *dol* za zadnje onemogočeni; ne spremeni vrstnega reda. | Gumba onemogočena |
| R04 | Vsak premik shrani permutacijo v zgodovino; *Razveljavi* obnovi zadnjo. | Zgodovina raste/poniži |
| R05 | *Ponovi* obnovi zadnjo razveljavljeno permutacijo; več ciklov ohranijo ID-je pravilno. | Ciklična zgodovina |
| R06 | Nov veljaven premik po razveljavi zavrže zgodovino *ponovitev*. Neveljaven rob ne zavrne. | Čiščenje zgodovine |
| R07 | Maks 20 permutacij v zgodovini; obrisi po 21. veljavnem premiku. | Omejena zgodovina |
| R08 | *Začetni* vrne izvorno permutacijo in počisti *ponovitve*. Na izhodišču onemogočen. | Vrnenje na izhodišče |
| R09 | Preglednica: globalni; tabla: relativni; premiki uporabljajo globalne sosedbe. | Pogled ohranjen |
| R10 | *Preklop pogleda* in *podrobnosti*: ohranjen vrstni red. *Menjava projekta/osvežitev*: na izhodišče. | Stanje v celoti |
| R11 | Števec *Razveljavitve: U. Ponovitve: R.*; onemogočen pri 0. Prazno/eno opravilo onemogoči premike. | Števec pravilen |
| R12 | Vse lokalne permutacije; API ne slika; vsebina nespremenjena. | API- ni zapis |


---

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | (pregledano zgoraj) | Dodati testne primere v `tests/agent/p10.spec.ts` | Implementacija v `src/` (npr. `TaskBoard.tsx` ali `App.tsx`) | Izid po preverjanju (test-results, console/dnevnik) |

**Testni primeri**:
- 0 opravil: gumbi *Premakni* onemogočeni.
- 1 opravilo: gumbi *Premakni* onemogočeni, *Razveljavi/Ponovi* onemogočena.
- 2+ opravil: gumbi *Premakni* omogočeni za srednja opravila, robna onemogočena.
- 21+ premiki: zgodovina 20, 21. zavrže najstarejšo.
- Preklop pogledov: ohranja vrstni red.
- Menjava projekta/osvežitev: vrne na začetno stanje.


**Del kode**:
- `docs/agent/specification.md`: ta dokument.
- `docs/agent/specification-history.md`: spremembe specifikacije.


---

## Odprta vprašanja in omejitve

- **Globalno mesto**: Ustališen način določanja globalnega mesta (ID-ja ali vrstni red v API-ju) – predpostavljamo, da je ID leksikografski (ali po vrstnem redu v API-ju). Jasno je, da se ne povezujejo po naslovu.
- **Testi**: Ločeni razvojni testi v `tests/agent/p10.spec.ts` niso preverjeni. Končni testi (baseline) ostanejo izven območja te naloge.
- **API-napis**: Javni API `/api/projects/{id}/tasks` ne spremeni podatkov; spremembe so lokalne.
- **Projektna pravila**: Ni tražena trajna shramba ali URL- zapisov za vrstni red.


---

**Status**: Pripravljeno za implementacijo. Implementator naj dopolni testne primere v `tests/agent/p10.spec.ts`, izvede spremembe v `src/` ter dokumentira v `docs/agent/review.md`.
