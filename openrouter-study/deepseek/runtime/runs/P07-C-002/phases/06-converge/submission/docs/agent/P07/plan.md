# P07 — načrt izvedbe

Podlaga: `docs/agent/P07/spec.md` (R01–R12), `.specify/memory/constitution.md`,
`docs/dizajn.md`. Obseg: samo `src/`, `tests/agent/`, `docs/agent/`.

## Tehnični kontekst

- React 19 + TypeScript 6 + Vite 8 z `lucide-react`; obstoječe odvisnosti zadoščajo.
- Podatki tečejo prek obstoječega `useResource`/`request` na javni `/api/`; opravila se
  nalagajo v `ProjectView` (`src/App.tsx`), podrobnosti v `TaskDetails`, tabla v `TaskBoard`.
- Shramba: `localStorage`, ključ `folio:favorites:v1`, JSON `{version:1, ids:[...]}`.
- Playwright 1.63: projekt `agent` izvaja `tests/agent/**/*.spec.ts`; skupni testi ostanejo
  nedotaknjeni. Infrastruktura (`server/`, `shared/`, `tests/baseline.spec.ts`,
  `tests/api.spec.ts`, nastavitve) je nespremenljiva.

## Odločitve

1. Stanje priljubljenih je globalno v `App` prek novega hooka `useFavorites`, zato
   preživi menjavo projekta (R08) in si ga delita preglednica in tabla (R07).
   `ProjectView` ohrani `key={project.id}`, zato se ob menjavi projekta ponovno pripne
   in lokalno stanje filtra samodejno pade na `false` (R08); osvežitev prav tako.
2. Čista logika shrambe gre v nov `src/favorites.ts`: `parseFavorites(value)`
   (validacija P2: `version === 1`, `ids` je polje nizov; podvojene strne, neznane
   ohrani; sicer `null`), `serializeFavorites(ids)` (enkratni nizi, razvrščeni po
   UTF-16), `readFavorites()`/`writeFavorites(ids)` z `try/catch`, ter naročnina na
   dogodek `storage` (pravi ključ, `null` prazni, brez povratnega zapisa; drug ključ
   se ignorira). Izjema pomeni `storageError` in delovanje v pomnilniku (R11).
3. `useFavorites` vrne `{ ids: Set<string>, toggle, removeForProject, storageError }`;
   začetno branje je leno in ne prepiše shrambe (R04); vsaka sprememba sproži zapis po
   P1, razen prihoda iz dogodka `storage`.
4. UI: `FavoriteButton` v `src/components.tsx` (gumb `Priljubljeno opravilo <id>` z
   `aria-pressed`; v tabeli v ločeni celici, na tabli v `li` zunaj povezave – akcije
   zunaj povezave, klik ne odpre podrobnosti, R01). Kontrole filtra: checkbox
   `Prikaži le priljubljena`, gumb `Odstrani priljubljene tega projekta`, števec
   `role=status` z `aria-label=Število priljubljenih` in besedilom `Priljubljeno: X od M.`
   za celoten projekt (R10), opozorilo `role=alert`, ki vsebuje `shramba` (R11).
5. `ProjectView` izračuna `visible = showOnly ? tasks.filter(t => ids.has(t.id)) : tasks`
   v izvornem vrstnem redu in ga posreduje tabeli in tabli; števci stolpcev table štejejo
   vidna opravila (R05, R10). Prazno stanje filtra pokaže `Ni priljubljenih opravil.` in
   omogoča izklop (R06); gumb za odstranitev je onemogočen brez priljubljenih v projektu (R09).
6. Slogi se dopolnijo v `src/styles.css` z obstoječimi gradniki in spremenljivkami;
   postavitev in notranje drsenje ostaneta (R12). Brez novih odvisnosti.

## Datoteke

- Novo: `src/favorites.ts`, `src/useFavorites.ts`, `tests/agent/p07-favorites.spec.ts`
  (po potrebi `tests/agent/helpers.ts`).
- Spremenjeno: `src/App.tsx`, `src/TaskBoard.tsx`, `src/components.tsx`, `src/styles.css`.
- Dokumenti: ta `plan.md`; med izvedbo se v `spec.md` vpišejo dokazila sledljivosti.

## Preverjanje

- `npm run typecheck`, `npm run lint`, `npm run build`.
- `npx playwright test tests/agent/p07-favorites.spec.ts` (projekt `agent`).
- `npm test` za skupne regresijske teste skupaj z lastnimi.
- Lastni testi pokrijejo R01–R12: neveljavna shramba in podvojeni/neznani ID-ji,
  dogodki `storage` in tuj ključ, brez povratnega zapisa, izjema shrambe (init skript),
  brez zapisov na API, preklop pogleda, menjava projekta, ozki prikaz 390 pik.

## Tveganja in omejitve

- Shramba ni na voljo: opozorilo in delovanje v pomnilniku; testirano z nadzorovanim
  okvarjenim `localStorage`.
- `tests/development/` je berljiv pomočnik za razvojne teste; lastni testi ga ne uvažajo,
  ampak pripravijo svoje nadzorovane GET odgovore.
- Neznani ID-ji se hranijo, a ne ustvarijo opravil (R03).
