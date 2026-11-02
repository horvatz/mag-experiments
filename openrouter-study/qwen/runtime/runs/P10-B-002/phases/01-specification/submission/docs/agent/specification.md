# P10: Razredčeni lokalni vrstni red z razveljavitvami

## Problem in kontekst

Opravila v foliju imajo izhodiščno vrstni red enak inicialnemu seznamu API-ja (`task.id` ni primarni ključ; uporabniški vrstni red je neodvisen). Uporabniki želijo menjovati **globalni vrstni red** opravil (brez spremembe statusa ali odjemanja), razveljavljati spremembe in se vrniti k inicialnemu redosu.

Začetni stanje: `vrstniRed` = `tasks` v vrstnemряду iz API-ja. Vsako opravilo ima prikazano **globalno mesto** (1..N), določeno z indeksom v vrstnemряду. Naslovi niso ključ za povezovanje (R01, R09). Dodatna dokumentacija: `docs/dizajn.md` (Folio stil oblike), `src/components.tsx` (StatusBadge, Avatar, Loading, LoadError).

Predvideno delovanje: gumba **Premakni <id> gor/dol** menjata opravilo s globalnim neposrednim pred/naslednikom v trenutnemu vrstnemряду; **Rozveljavi** in **Ponovi** upravljata zgodovino permutacij; **Začetni vrstni red** vzpostavi izhodiščno permutacijo kot novo razveljavljivo dejanje.

## Vhodi, dejanja in izidi

### Podatkovni vhodi

- `tasks: Task[]` — opravila iz `/api/projects/{projectId}/tasks`
- `initialOrder: string[]` — `tasks.map(t => t.id)`

### UI komponente (implementacija)

- `TaskRow / Table` — vsaka vrstica prikazuje vrstico v tabeli s `data-task-id`
- `TaskMoveButton` — dva gumba za vsako opravilo:
  - `Premakni <id> gor` (doba prednika)
  - `Premakni <id> dol` (doba naslednika)
- `TaskHistoryBar` — vrstico s števcema in gumbi:
  - `Razveljavi premik`
  - `Ponovi premik`
- `TaskResetButton` — `Začetni vrstni red`

### Pričakovani izidi

- VRSTNI\_RED: `string[]` — permutacija ID-jev opravil (brez dvolastičnosti), vrstni red se lahko spreminja lokalno.
- ZGODOVINA: `{ moves: TaskPermutation[], undos: TaskPermutation[] }` — `undos` vsebuje največ 20 permutacij za razveljavljanje.
- STATUS:
  - `razveljave`: št. uspešno izvršenih razveljitev
  - `ponovitve`: št. uspešno izvršenih ponovitev
  - `mesto(id)": celotna globalna lokacija (1..vrstniRed.length) za določen ID
  - `pred(id)": neposredni globalni predhodnik ID-ja, `null` za prvega
  - `nasled(id)": neposredni globalni naslednik ID-ja, `null` za zadnjega

### Delo (implementacija)

Števec v **TaskHistoryBar** razbija razveljitev in ponovitve z `Razveljavitve: U. Ponovitve: R.`; obe vrednosti sta 0 ko ni mogoča. Gumba **Razveljavi** in **Ponovi** sta onemogočena ob 0. Projekta z enim opravilom sta še vedno uporabna, vendar brez razpoložljivih premikov; prazne projekti so uporabni brez premikov.



---

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| **R01** | Izhodiščno `vrstniRed` = originalni API vrstni red; vsako opravilo kaže globalno mesto 1..N. | Primer `D01`: začetni red; `getColumnIds` za preglednico s pravilnim zaporedjem. |
| **R02** | Gumb `Premakni <id> gor` zamenja opravilo s neposrednim globalnim prednikom; `dol` z naslednikom; polja in status nespremenjeni. | Primer `D01`: po prvem gumbu; `columnIds` ni spremembe stolpcu. |
| **R03** | `Premakni` gor za prvo in dol za zadnje opravilo (rob) je onemogočen; neveljavna/ponovljena dejanja ne spreminjata vrstnega reda in ne dodajata zgodovine. | Primer `D01`: `Premakni web-01 gor` (onemogočen); `toBeDisabled`. |
| **R04** | Vsak veljaven premik doda trenutno permutacijo v `moves` zgodovino; `undos` prazen ob začetku. `undo()` obnovi zadnjo permutacijo iz `undos` in posodobi `vrstniRed`. | Primer `D01`,`D02`: `Razveljavi premik` vrne inicialno; `moves[0]` se shrani. |
| **R05** | Gumb `Ponovi premik` obnovi zadnjo razveljavljeno permutacijo iz `undos`; več operacij pravilnim zaporedjem; `redo` poveča `razveljave`. | Primer `D02`: `Ponovi` vrne prejšnjo permutacijo; `ponovitve` se poveča. |
| **R06** | Nove veljavne premike po razveljavitvi zavržejo vse `undos`; neveljavni robni premik ne zavrže zgodovine. | Primer `D03`: `Razveljavi`->`Premakni` zavrže `undos`. |
| **R07** | Shranjevanje največ 20 permutacij v `moves`; 21. veljaven premik zavrže najstarejšo. `undos` ohranja vse trenutno razveljavljene permutacije. | Nima primerov (5 opravil); preverjati z lastnimi testi. |
| **R08** | Gumb `Začetni vrstni red` shrani trenutno permutacijo v `undos` in postavi `vrstniRed` na inicialno; če že inicialno, gumb onemogočen. | Primer `D04`: `Začetni vrstni red` vrne iniciali; `undos` raste. |
| **R09** | Preglednica prikazuje globalne lokacije (mesto); tabela relativni vrstni red znotraj stolpcev stavb; premik uporabi globalnega soseda. | Primer `D04`: `board()` globalne lokacije; `table()` relativni. |
| **R10** | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vrstni red; menjava projekta in osvežitev ponastavita na lokalno inicialno permutacijo. | Primer `D04`: preklop `table/board` ohrani vrstni red; menjava projekta ponastavi. |
| **R11** | Števec `Razveljavitve: U. Ponovitve: R.` in statusna vloga; gumba onemogočena ob 0; prazen/1 opravila uporabna brez premikov. | Primer `D03`: statusnik `role=status`, pravilne številke; gumb `Ponovi` onemogočen. |
| **R12** | Vse spremembe lokalne permutacije enake množice ID-jev; ni API zapisov; stanje števil in pravilne podrobnosti enaki; Folio prilagodljivost ohranjena. | Primer `D04`: `readonly()` preveri `/api/` brez zapisa; `saveRequests = 0`. |

## Izvedba in sledljivost

```typescript
// Predikati: globalna lokacija in pred/naslednik
const rank = (order: string[], id: string): number => order.indexOf(id) + 1;
const prev = (order: string[], id: string): string | null => {
  const i = order.indexOf(id); return i <= 0 ? null : order[i - 1];
};
const next = (order: string[], id: string): string | null => {
  const i = order.indexOf(id); return i >= order.length - 1 ? null : order[i + 1];
};

// Premagovanje opravila s prednikom ali naslednikom
function move(order: string[], id: string, dir: 'up'|'down'): string[] | null {
  const i = order.indexOf(id);
  if (dir === 'up') return i <= 0 || i === order.length - 1 ? null : [...order].splice(i - 1, 2).reverse().flat();
  if (dir === 'down') return i >= order.length - 1 || i === 0 ? null : [...order];
  return null;
}
```

| Zahteva | Pogoj | Test | Datoteka | Izid |
| **R01** | Izhodiščni vrstni red | D01, D04 | `src/App.tsx` | API vrne 8 opravil, red `[web-01..web-08]` |
| **R02** | Premagovanje s pred/naslednikom | D01 | `TaskMoveButton` | `web-02` gor: `[web-02,web-01,web-03,...]` |
| **R03** | Robna dejanja onemogočena | D01 | `TaskMoveButton` | Gumbi `onemogočeni` |
| **R04** | Zapis v zgodovino | D01, D02 | `TaskHistoryBar` | `moves[0]` shrani permutacijo |
| **R05** | Ponovitev undo | D02 | `TaskHistoryBar` | `vrstniRed` vrne prejšnjo |
| **R06** | Nova premagovanje zavrže `undos` | D03 | `TaskHistoryBar` | `undos` postane prazen |
| **R07** | `maxUndoMoves=20` | lastni test | `TaskHistoryBar` | `undoMoves.splice(0,1)` ob 21. |
| **R08** | Reset na inicialno | D04 | `TaskResetButton` | `vrstniRed` = `initialOrder` |
| **R09** | Globalne lokacije | D04 | `TaskRow/Table` | `Mesto opravila <id>: 1` (ARIA) |
| **R10** | Ohranjanje/ponastavitev | D04 | navigacija | Menjava projekta ponastavi |
| **R11** | Števec statusika | D03 | `TaskHistoryBar` | `role=status`, tekst `Razveljavitve: U. Ponovitve: R.` |
| **R12** | Localno, brez API | D04 | `readonly` | `writes === []`, `saveRequests = 0` |

## Odprta vprašanja in omejitve

- **R07**: Implementacija 20-permutacijske omejitve zahteva `undoMoves = undoMoves.slice(0, 20)`
- **R10**: Lokalna upravljanje sprememb ne vpliva na API zapisovanje; osvežitev ponastavi na inicialno
- **R12**: Ni API zapisov; spremembe so lokalne permutacije
- **Nepreverjeni scenariji**:
  - Prazen projekt: `vrstniRed = []`, noben gumb ni razpoložljiv
  - Projekt s enim opravilom: `Premakni` onemogočen za to opravilo
EOF

