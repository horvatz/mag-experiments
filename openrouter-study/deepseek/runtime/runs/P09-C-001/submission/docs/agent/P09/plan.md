# P09 — Načrt izvedbe

Vir zahtev: `task/instructions.md` (R01–R12) · Specifikacija: `spec.md` · Pravila: `.specify/memory/constitution.md` · Dizajn: `docs/dizajn.md`

## Tehnični kontekst

- React 19 + TypeScript + Vite; brez novih odvisnosti.
- Usmerjanje: hash fragment (`src/navigation.ts`, `useSyncExternalStore` na `hashchange`).
- Podatki: `useResource` + `request` prek javnega `/api/`, samo branje (`updateTask` se ne uporablja).
- Testi: Playwright; projekt `agent` za lastne teste, `api`/`desktop`/`mobile` za skupne teste.
- Okolje: Node 24, Chromium nameščen; strežnik, odvisnosti in skupni tipi ostanejo nespremenjeni.

## Arhitektura in odločitve

1. Vir resnice je URL: potrjeno stanje S = (q, status, order, view) se bere iz query dela fragmenta; osnutek kontrol je lokalno stanje React in se ob vsaki spremembi poti ponastavi na S (R05, R07, R08).
2. Novo čisto jedro `src/viewState.ts`: `normalize` (obrez zunanjih belin, NFD, odstranitev U+0300–U+036F, male črke); `parseViewState` (prva pojava parametra, neznane vrednosti → privzete, neznani parametri se ignorirajo, brez prepisa URL-ja) (R01–R04); `buildHash` (privzeti parametri izpuščeni, ostali URL-kodirani, `view=board` ohranjen, neznani parametri odstranjeni) (R06); `matches` (P(q) podniz P(title|description|assignee|id)) (R02); `compareTasks` (naslov po P v UTF-16, stabilno) (R03); `sameState` (idempotentna potrditev) (R05, R06, R11).
3. `src/navigation.ts`: `useRoute` vrne tudi S; `projectUrl`/`taskUrl` sprejmeta S, da povezave (vrstice, kartice, zapiranje podrobnosti) ohranijo parametre (R07, R09); preklop pogleda ohrani S (R08); navigacija po projektih uporabi privzeto stanje (R10).
4. Potrditev: "Uporabi pogled" in "Ponastavi pogled" izračunata ciljni hash; `window.location.hash` se nastavi le, če se razlikuje od trenutnega (natanko eno novo zgodovinsko stanje, sicer nobeno) (R05, R06, R11).
5. `src/App.tsx`: kontrole (iskanje, dva selecta, gumba) v `ProjectView`; filtriran seznam se preda tabeli in `TaskBoard`; števec `role=status`, `aria-label="Rezultati povezave"`, besedilo "Prikazano: N od M."; prazen rezultat "Ni zadetkov."; ohranjeni `data-task-id`, `aria-label="Pregled stanj opravil"` in obstoječe povezave (R11, R12).
6. Podatki ostanejo samo za branje: nobenih zapisovalnih klicev, brez `localStorage`; obstoječe nalaganje, napake, podrobnosti in Folio slog ostanejo (R12).

## Datoteke

| Datoteka | Sprememba |
| --- | --- |
| `src/viewState.ts` | novo: normalizacija, razčlenjevanje, gradnja hash-a, filtriranje in urejanje |
| `src/navigation.ts` | S v `useRoute`; URL pomočniki s parametri |
| `src/App.tsx` | kontrole, osnutek, potrditev/ponastavitev, filtriran prikaz, števec |
| `src/TaskBoard.tsx` | prejme filtrirana opravila in S za povezave |
| `src/TaskDetails.tsx` | zapiranje ohrani S |
| `src/styles.css` | slog novih kontrol v okviru Folio |
| `tests/agent/helpers.ts`, `tests/agent/p09.spec.ts` | lastni testi za R01–R12 |
| `docs/agent/P09/spec.md` | dopolnitev sledljivosti po izvedbi |

## Vrstni red izvedbe

1. `viewState.ts` z logiko razčlenjevanja, gradnje in filtriranja.
2. `navigation.ts` in povezave s parametri.
3. `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx` ter `styles.css`.
4. Lastni testi v `tests/agent/` in zagon skupnih testov.
5. Vpis dejanskih rezultatov v sledljivost `spec.md`.

## Preverjanje

- Lastni testi: `npx playwright test --project=agent` (neposredna povezava, osnutek, potrditev, zgodovina, ponastavitev, enaki naslovi, ozek zaslon, brez zapisov).
- Skupni testi: `npx playwright test --project=api --project=desktop --project=mobile`.
- Razvojni testi `tests/development/P09.spec.ts` (samo branje) so orientacija; končni rezultati se vpišejo v sledljivost `spec.md`, neizvedeni testi se navedejo kot neizvedeni.
