# Načrt P03: Iskanje in sestavljeni filtri

## Tehnični kontekst

- Obstoječa aplikacija je React 19, TypeScript, Vite in Playwright; odvisnosti so zaklenjene.
- Strežnik in javni API ostanejo nespremenjeni. UI bere `GET /api/projects` in `GET /api/projects/:id/tasks` ter ne uporablja `/__test/`.
- Poti in pogled ostajata v obstoječem hash-routingu; v URL se ne zapisujejo filtri.
- Dizajn temelji na obstoječih Folio komponentah in slogovnih spremenljivkah iz `src/styles.css`.

## Odločitve

1. **Stanje filtrov hranimo v `ProjectView`.**
   - `query`, `statusFilter` in `assigneeFilter` so React state.
   - `ProjectView` je že ločen po projektu, zato menjava projekta naravno ponastavi vse tri vrednosti.
   - Pogled ostane v URL, zato preklop `table/board` ohrani filtre.

2. **Iskanje in filtriranje sta čisti izpeljeki.**
   - `useMemo` iz celotnega nabora trenutnega projekta izračuna `visibleTasks`.
   - Normalizacija polj uporabi NFD, odstrani `U+0300` do `U+036F` in pretvori v male črke.
   - Iskalni niz razdelimo po belinah; vsak del mora biti dobesedni podnizi združenih polj `id`, `title`, `description` in `assignee`.
   - Filtra stanja in osebe se združita s iskanjem po logičnem IN. Oseba se primerja natančno.

3. **Kontrole dodamo v obstoječo projektno vsebino.**
   - Iskalni input je `type="search"` z dostopnim imenom `Išči opravila`.
   - Dva HTML `select` elementa pokrijeta stanje in odgovorno osebo.
   - Gumb `Počisti filtre` ponastavi vse tri kontrole.
   - `role="status"` z `aria-label="Rezultati filtriranja"` izpiše `Prikazano: N od M.`
   - Kontrola postavimo v obstoječi Folio stil v `src/App.tsx`, brez nove odvisnosti.

4. **Preglednica in tabla uporabljata isti nabor.**
   - `ProjectView` prenese `visibleTasks` v obstoječi tabelni prikaz in `TaskBoard`.
   - Števci, stolpci table in prazna stanja izhajajo iz `visibleTasks`, skupna velikost projekta pa iz vseh naloženih opravil.
   - `data-task-id`, dostopna imena, povezave in podrobnosti ostanejo nespremenjeni.

5. **Osebe izpeljemo iz celotnega trenutnega projekta.**
   - Vsi `assignee` vrednosti se očistijo, prazna imena se izpustijo, enake vrednosti združijo in razvrstijo stabilno.
   - Izbirnik vsebuje `all` in vsako ime natanko enkrat, neodvisno od trenutnega iskanja ali filtra stanja.

## Datoteke

- `src/App.tsx`
  - Dodaj stanje filtrov, kontrolno vrstico, izpeljeno vidne opravil in posodobljene števce.
  - Prenesi vidna opravila v tabelo in tablo ter upravljaj prazna stanja.

- `src/TaskBoard.tsx`
  - Posodobi stolpce in števce, da uporabljajo samo vidna opravila iz `visibleTasks`.
  - Ohrani obstoječo strukturo kartic in dostopnost.

- `src/styles.css`
  - Doda le minimale Folio stile za novo kontrolno vrstico, ožji prikaz in `status` sporočilo.
  - Ne spreminja osnovne postavitve, barv ali navigacije.

- `tests/agent/p03.spec.ts`
  - Playwright testi za R01–R12 s kontroliranimi javnimi API odgovori.
  - Preveri iskanje, kombinirane filtre, preklop pogleda, menjavo projekta, števce, prazne zadetke, navigacijo in odsotnost pisalnih zahtev.

- `docs/agent/P03/spec.md`
  - Ostane izvirni specifikacijski vir za sprejemne pogoje in sledljivost.

## Koraki

1. V `App.tsx` dodaj stanje in izpeljeno funkcionalnost `visibleTasks`.
2. Dodaj kontrolno vrstico z iskanjem, obema filtra, gumbom za čiščenje in števcom rezultatov.
3. Posodobi tabelo, `TaskBoard` in števce, da uporabljajo `visibleTasks`.
4. Doda Folio stile za novo kontrolno vrstico in ozki prikaz.
5. Doda agentove Playwright teste za vseh R01–R12.
6. Izvede `npm run check`; po potrebi popravi napake in ponovi preverjanje.

## Meje

- Ne spreminjamo strežnika, skupnih tipov, odvisnosti, nastavitev, skupnih testov ali uradnih predlog.
- Ne dodajamo novih API-jev, zunanjih meritev, knjižnic ali arhitekturnih preureditev.
- Filtri se ne shranjujejo v URL, `localStorage` ali drugo trajno shrambo.

## Sledljivost

- Specifikacija: `docs/agent/P03/spec.md`
- Zahteve: `task/instructions.md`
- Projektna načela: `.specify/memory/constitution.md`
