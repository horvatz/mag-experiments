# P03 — Izvedbeni načrt

Status: načrt 1.0. Ureja [`docs/agent/P03/spec.md`](./spec.md) in projektno konstitucijo [`../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md). Izvirne zahteve ostanejo v [`task/instructions.md`](../../../task/instructions.md).

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript + Vite; podatki gredo skozi obstoječi javni API `/api/` in `src/useResource.ts`.
- Pogled projekta je `ProjectView` v `src/App.tsx`. Že je ključan z `project.id`, zato sprememba projekta ustvari novo lokalno stanje in samodejno ponastavi filtre.
- Tabla v `src/TaskBoard.tsx` že razdeli opravila po statusu; lahko prejme skupni filtriran seznam in ohrani obstoječe števce stolpcev.
- Slogovi so v `src/styles.css`; uporabimo obstoječe Folio spremenljivke, belo površino, nežne modre poudarke in obstoječe dimenzije.
- Odvisnosti, strežnik, `shared/`, skupni testi, Playwright nastavitve in javni API-ji se ne spreminjajo.

## Odločitve in arhitektura

### Stanje filtrov

V `ProjectView` dodamo lokalno stanje:

```ts
const [query, setQuery] = useState("")
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all")
```

Stanje je vezano na trenutni projekt prek obstoječega `key={project.id}`. Ne uporabljamo URL-a, `localStorage`, `sessionStorage` ali globalne shrambe. Preklop pregleda ohrani vsa tri stanja, ker sta odvisna samo od poti in ne od filtra.

### Iskanje

Uvedemo čiste pomožne funkcije v `src/App.tsx` ali ločeni modul, če postane `App.tsx` prenatlačen:

- `normalize`: `NFD`, odstrani kombinacijska znamenja `\\u0300`–`\\u036F` in pretvori v male črke.
- `searchTerms`: `trim().split(/\\s+/)` brez praznih nizov, nato normalizacija.
- `matchesSearch`: vsaka iskalna beseda je dobesedni podnizi vsaj enega polja `id`, `title`, `description` ali `assignee`.
- Iskanje je izključno odjemalec in ne pošlje novih zahtev.

Ločila in znaki kot `.*` ostanejo navadno besedilo; ne uporabimo `RegExp`.

### Sestavljeni filtri

Z `useMemo` izračunamo:

1. `assigneeOptions` iz **celotnega** trenutnega projekta; vsebuje `all` in vsako različno neprazno ime natanko enkrat, tudi če ga trenutno iskanje skrije.

2. `visibleTasks` z logičnim IN:

```text
matchesSearch(task) &&
matchesStatus(task) &&
matchesAssignee(task)
```

Status primerjamo z `all`, `todo`, `in_progress` ali `done`. Odgovorno osebo primerjamo natančno, brez normalizacije.

3. `counts` iz `visibleTasks`, ne iz vseh opravil.

Pregled stanj, tabela in tabla uporabijo isti `visibleTasks`, zato sta ID-ja in stolpci usklajeni. Vrstni red ostane enak kot v odgovoru API-ja.

### Kontrol in stanja

- `input type="search"`, dostopno ime `Išči opravila.`
- `select` `Filter stanja` z `all`, `todo`, `in_progress`, `done`.
- `select` `Filter odgovorne osebe` z `all` in različnimi imeni trenutnega projekta.
- Gumb `Počisti filtre` v en dejanju nastavi `""`, `"all"`, `"all"`.
- `role="status"`, `aria-label="Rezultati filtriranja"` in `Prikazano: N od M.`
- Prazen projekt ohrani obstoječe prazno stanje; neprazen projekt brez zadetkov prikaže `Ni zadetkov.` v obeh pogledih.

Nova dejanja ob opravilu niso potrebna; obstoječe povezave na podrobnosti ostanejo nespremenjene.

## Datoteke

| Datoteka | Načrtovana sprememba |
| --- | --- |
| `src/App.tsx` | Lokalno filtrirno stanje, normalizacija, logični IN, kontrol, števci, prazna stanja in povezava na skupni `visibleTasks`. |
| `src/TaskBoard.tsx` | Prejme `visibleTasks`; ohrani obstoječe razdeljevanje po stolpcih, `data-task-id` in števce. |
| `src/styles.css` | Minimalen Folio styling za novo kontrolno vrstico, `select`/input in ozki zaslon; brez spremembe splošnega sistema. |
| `tests/agent/P03.spec.ts` | Nova lastna Playwright preverjanja za R01–R12 z nadzorovanimi GET odgovori; brez uporabe `/__test/` iz aplikacije. |
| `docs/agent/P03/spec.md` | Po implementaciji posodobi sledljivost in dejanske izide preverjanj. |

## Zaporedje

1. Dodaj čiste funkcije za normalizacijo in ujemanje.
2. Dodaj lokalno stanje, kontrol in skupni `visibleTasks`.
3. Preusmeri preglednico, tablo, števce ter prazna stanja na isti seznam.
4. Dopolni Folio slogove in preveri 390 px.
5. Dodaj lastne Playwright teste za R01–R12.
6. Izvedi preverjanja in posodobi sledljivost v specifikaciji.

## Preverjanje

Načrtovani ukazi:

```sh
npm run typecheck
npm run lint
npm test -- --project=agent
npm test -- --project=desktop
npm test -- --project=mobile
```

Testni obseg:

- R01: privzete kontrole, izvorni vrstni red in vsi ID-ji.
- R02: normalizacija NFD, odstranjevanje diakritikov in iskanje po vseh štirih poljih.
- R03: večbesedno iskanje, neodvisen vrstni red besed in dobesedna obravnava ločil.
- R04: kombinacija iskanja, statusa in odgovorne osebe po logičnem IN.
- R05: `all` plus različna imena iz celega projekta in reset ob preklopu.
- R06: enaki ID-ji v obeh pogledih in ohranitev filtrov ob preklopu pogleda.
- R07: reset iskanja, statusa in osebe ob preklopu projekta.
- R08: osvežitev, URL in trajna shramba brez filtrirnega stanja.
- R09: sporočilo rezultatov, pregled stanj in števci stolpcev po prikazanih rezultatih.
- R10: `Ni zadetkov.` v obeh pogledih ter prazno stanje praznega projekta.
- R11: čiščenje vseh treh kontrol v en dejanju in ohranitev izvornega vrstnega reda.
- R12: obstoječa navigacija in podrobnosti, samo GET pri filtriranju, Folio in 390 px.

Neizvedenih preverjanj ne označimo kot uspešnih. Končnih skritih testov ni na voljo, zato veljajo samo dejansko izvedeni lastni in skupni testi.

## Omejitve

- Ne dodajamo novih API-jev, odvisnosti, zunanjih meritev ali trajne shrambe.
- Ne spreminjamo strežnika, skupnih tipov, skupnih testov ali infrastrukture.
- Sočasnih sprememb podatkov med nalaganjem ne obravnavamo izven obstoječih regresijskih zahtev.
- Imena odgovornih oseb so po nalogi neprazna in različna od rezervirane vrednosti `all`.
