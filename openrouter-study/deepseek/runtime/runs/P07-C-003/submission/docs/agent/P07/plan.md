# P07 — Načrt izvedbe: Priljubljena opravila in trajna shramba

**Funkcijska mapa**: `docs/agent/P07` · **Datum**: 2026-10-30 · **Spec**: `spec.md` · **Konstitucija**: `.specify/memory/constitution.md`

## Tehnični kontekst

- React 19.3 + TypeScript 6 + Vite 8, `lucide-react`; obstoječi javni API `/api/` se uporablja samo za branje.
- Testi: Playwright 1.63; agentni testi v `tests/agent/*.spec.ts` (projekt `agent`, Desktop Chrome); razvojni primeri `tests/development/P07.spec.ts` (D01–D04) kot lokalno merilo; skupna `tests/baseline.spec.ts` in `tests/api.spec.ts` kot regresija.
- Ukazi: `npm run typecheck`, `npm run lint`, `npm test`, `npx playwright test tests/development/P07.spec.ts`.
- Brez novih odvisnosti; strežnik, skupni tipi, nastavitve in skupni testi ostanejo nespremenjeni.

## Arhitektura in odločitve

1. **Stanje v modulu `src/favorites.ts`** (vzorec kot `navigation.ts`), ker se `ProjectView` ob menjavi projekta ponovno vzpostavi (`key={project.id}`), globalna množica pa mora ostati:
   - `STORAGE_KEY = 'folio:favorites:v1'`;
   - `parseFavorites(raw): Set<string>` — validacija P3 (`{version:1, ids:string[]}`; neveljavno → prazna množica, brez izjeme);
   - `readFavorites()` — ob napaki branja v pomnilnik brez prepisa (P7, R04);
   - `writeFavorites(ids)` — `unique` + `sort` (UTF-16), zapis `{version:1,ids}`; napaka → stanje napake (P2, P7);
   - `toggleFavorite(id)` (P1) in `removeProjectFavorites(ids)` (P5) vsak zapišeta (P2);
   - `useFavorites()` — `useSyncExternalStore` in poslušalec `storage`: pravi ključ → `parseFavorites` (`null` → prazno), drug ključ ignoriran, brez povratnega zapisa (P6).
2. **Filter** — lokalno stanje v `ProjectView` (`useState(false)`): ob menjavi projekta se ponastavi na `false` (R08), privzeto `false` (R05); ob aktivnem filtru ostane izklopljiv (R06).
3. **Prikaz** — `vidna = filter ? tasks.filter(t => ids.has(t.id)) : tasks`; tabela in tabla dobita isto filtrirano množico (R07); `TaskBoard` prejme filtrirana opravila, zato števci stolpcev štejejo vidna (R10); števec `Priljubljeno: X od M.` računa X/M iz vseh opravil projekta (R10).
4. **Vmesnik**:
   - `src/FavoriteButton.tsx` — gumb `Priljubljeno opravilo <id>` z `aria-pressed`; v vrstici tabele nova celica, na tabli zunaj povezave kartice (R01, dogovor o vmesniku);
   - filter `Prikaži le priljubljena`, gumb `Odstrani priljubljene tega projekta` (onemogočen brez priljubljenih projekta — R09), števec `role=status` z `aria-label="Število priljubljenih"`;
   - prazno stanje filtra `Ni priljubljenih opravil.` (R06); opozorilo `role=alert` z besedo `shramba` (P7, R11);
   - nespremenjeni `data-task-id`, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"` (R12); slogi v `src/styles.css` z obstoječimi spremenljivkami, pri 390 px brez prelivanja strani.
5. **Brez zapisov na API** — noben nov klic; `updateTask` ostane neuporabljen (R12).

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/favorites.ts` | nov modul: validacija, shramba, `storage`, hook |
| `src/FavoriteButton.tsx` | nov gumb za preklop priljubljenosti |
| `src/App.tsx` | filter, gumb projekta, števec, filtriranje, opozorilo o shrambi |
| `src/TaskBoard.tsx` | gumb zunaj povezave kartice; prejme filtrirana opravila |
| `src/styles.css` | slogi novih kontrol |
| `tests/agent/p07.spec.ts` | agentni testi za R01–R12 |

## Zaporedje izvedbe

1. `favorites.ts` (validacija, zapis, dogodek, napake); 2. gumbi v tabeli in na tabli; 3. filter, števec in odstranitev projekta; 4. opozorila in robni primeri; 5. agentni testi in regresija.

## Preverjanje

- `npm run typecheck`, `npm run lint`, `npm test` (skupni in agentni), `npx playwright test tests/development/P07.spec.ts`.
- Izidi se vpišejo v `spec.md` (razdelek Izvedba in sledljivost) in končno poročilo; neizvedenih testov ne označujemo kot uspešnih.
