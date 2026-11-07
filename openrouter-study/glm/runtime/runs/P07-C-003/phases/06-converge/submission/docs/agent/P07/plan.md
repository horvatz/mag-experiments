# P07 Implementation Plan

Verzija načrta: 1.0. Izhodišče: `docs/agent/P07/spec.md`, `task/instructions.md`, `PROJECT_RULES.md` in `.specify/memory/constitution.md`.

## Technical context

- Aplikacija je React 19 + TypeScript + Vite; ikone so `lucide-react`, testiranje pa Playwright.
- Obstoječi podatkovni tok ostane: `useResource` bere `/api/projects/:id/tasks`, podrobnosti pa `/api/tasks/:id`.
- Ni novih odvisnosti, API-jev, strežniških sprememb ali sprememb infrastrukture.
- UI ostaja v potrjenem Folioju: uporabljajo obstoječi CSS tokeni, tipografija, obljeni robovi, dostopna imena in obstoječi odzivni vzorci.

## Design decisions

- Priljubljeni so globalna množica ID-jev (`Set<string>`), ne seznam objektov opravil. Filter in prikaz sta stanji trenutnega projekta.
- Validacija in serializacija bosta v ločeni, preskusljivi enoti, stanje in stranski učinki pa v React hooku. Neveljavna shranjena vrednost ne sproži zapis.
- `localStorage` se piše samo ob uporabnikovem dejanju; dogodek `storage` samo posodobi stanje. Zunanje spremembe se obravnavajo po istih pravilih validacije.
- `Prikaži le priljubljena` je lokalno stanje projekta s privzetim `false`; ob menjavi projekta ali osvežitvi se ponastavi.
- Preglednica in tabla uporabljata isti izračun `visibleTasks`, zato preklop pogleda ohrani filter in množico.
- Števec priljubljenih šteje `ID ∩ trenutni projekt`, števci stolpcev table pa vidna opravila. Pregled stanj ostane vezan na celoten trenutni projekt.
- Napaka shrambe ne zaustavi aplikacije: stanje ostane v pomnilniku, prikaže se `role="alert"` z besedo `shramba`.

## File plan

1. `src/favorites.ts`
   - Konstanta ključa `folio:favorites:v1`.
   - Stroga validacija `{ version: 1, ids: string[] }`, odstranjevanje podvojitev in sortiranje po UTF-16.
   - Serializacija samo ID-jev ter varno branje/pisanje `localStorage`.

2. `src/useFavorites.ts`
   - Inicializacija iz shrambe, uporabniški preklop ID-ja in brisanje ID-jev trenutnega projekta.
   - Poslušanje dogodka `storage` samo za pravi ključ; `null` izprazni množico, drugi ključi se ignorirajo.
   - Oznaka napake shrambe brez povratnega zapisa.

3. `src/App.tsx`
   - Dodaj checkbox, gumb za brisanje in števec `Priljubljeno: X od M.` z `role="status"`.
   - Izračun `visibleTasks` v izvornem vrstnem redu, enako za preglednico in tablo.
   - Ohranitev obstoječega nalaganja, napak, navigacije in podrobnosti.

4. `src/TaskBoard.tsx`
   - Gumb priljubljenega na kartici, zunaj povezave, z `aria-pressed`.
   - Stolpci in števci prejmejo filtrirana vidna opravila.

5. `src/styles.css`
   - Nove kontrole oblikuj s Folio žetoni; brez širjenja strani na 390 px, notranje drsenje ostane dovoljeno.

6. `tests/agent/p07.spec.ts`
   - Playwright preskusi za vse `R01`–`R12`, vključno s podvojenimi/neznanimi ID-ji, neveljavnimi zapisi, dogodki `storage`, napakami shrambe, preklopom pogledov, menjavo projektov in ozkim prikazom.

## Implementation order

1. Dodaj čisto validacijo, serializacijo in hook za `localStorage`.
2. Poveži stanje v `App`, dodaj kontrole, števec in filter.
3. Dopolni preglednico in tablo z gumbi po ID-ju ter enotnim prikazom.
4. Dopolni Folio stile in odzivnost.
5. Dodaj lastne Playwright teste in jih uskladi s specifikacijo.
6. Zaženi ciljne teste, nato `npm run typecheck`, `npm run lint`, `npm run build` in celoten `npm test`, če časovni okvir dovoljuje.

## Risks and guards

- Dogodek `storage` ne sme povzročiti zanke zapis-beri-zapis; preskus je obvezen.
- Neveljaven zapis ob nalaganju ostane nespremenjen.
- Neznani ID-ji se ohranijo, vendar se ne prikažejo kot nova opravila.
- Enaki naslovi se obravnavajo izključno po ID-ju.
- Vsak uspeh se zabeleži šele po dejavnem zagonu ustreznega testa.

## Traceability

- `R01`, `R07`, `R12`: `App.tsx`, `TaskBoard.tsx`, tabelni prikaz in novi UI preskusi.
- `R02`, `R03`, `R04`, `R11`: `favorites.ts`, `useFavorites.ts` in preskusi shrambe.
- `R05`, `R06`, `R08`, `R10`: `App.tsx`, izračun `visibleTasks` in preskusi filtra/števcev.
- `R09`: `useFavorites.ts`, `App.tsx` in preskus brisanja trenutnega projekta.

## Verification

- Ciljno: `npx playwright test tests/agent/p07.spec.ts`.
- Statično/build: `npm run typecheck`, `npm run lint`, `npm run build`.
- Regresijsko: `npm test`, ob omejitvah časa pa vsaj skupne obstoječe teste, ki so na voljo v privzetem izboru Playwrighta.
- Pred predajo posodobi sledljivostno tabelo v `docs/agent/P07/spec.md` samo z dejansko izvedenimi rezultati.
