# P05 — izvedbeni načrt

## Tehnični kontekst

- Aplikacija je React 19 v TypeScriptu, gradnjo in razvojni strežnik poganja
  Vite 8; nameščene odvisnosti ostanejo nespremenjene.
- Uporabniški vmesnik je v `src/App.tsx`, tabla v `src/TaskBoard.tsx`, skupni
  gradniki v `src/components.tsx`, stil Folio pa v `src/styles.css`.
- Projekti in opravila se berejo z obstoječim `useResource` prek javnega API-ja
  `/api/`. P05 ne doda zapisov na API.
- Testiranje poteka s Playwrightom; lastni testi gredo v `tests/agent/`.

## Odločitve in arhitektura

- Stanje velikosti strani, filtra stanja in številke strani hranimo z lokalnim
  stanjem v `ProjectView`. Komponenta je že ključana po `project.id`, zato
  menjava projekta ali osvežitev samodejno ponastavi P05 stanje, brez trajne
  shrambe ali URL-ja.
- Izračun filtra, števila strani, trenutnega odseka in odseka prikazanih ID-jev
  izpeljemo v enem čistem pripomočku `src/pagination.ts`. Enake vrednosti
  uporabita preglednica in tabla, kar prepreči razhajanje.
- Kontroli postavimo v obstoječo glavo odseka opravil v `src/App.tsx`, z
  obstoječimi razredi in slogovnimi spremenljivkami Folio. Dodamo le potrebna
  minimalna pravila v `src/styles.css`; ne uvajamo novega vizualnega sistema.
- Filtriramo pred straničenjem. Izviren vrstni red ohranimo z `filter` in
  `slice`, brez ločene logike za posamezen prikaz.
- `TaskBoard` ne spreminja vmesnika: dobi že trenuten odsek opravil in šteje
  karte po trenutnem odseku. Preglednico v `App.tsx` preslikamo iz istega
  odseka.
- Števci stanj v pregledu opravil ostanejo izpeljani iz celotnega nefiltriranega
  polja; števci stolpcev table ostanejo iz trenutnega odseka.
- Gumbi za premikanje nastavijo `disabled` glede na rob strani. Ne smejo
  spremeniti `n` v neveljavno vrednost.
- Status straničenja ima `role=status`, `aria-label="Stanje straničenja"` in
  natančno besedilo iz zahtev, vključno s pomišljajem `–`.
- Ne uporabljamo `/__test/` v uporabniški kodi, ne spreminjamo strežnika,
  skupnih tipov, odvisnosti, nastavitev ali skupnih testov.

## Datoteke in koraki

1. `src/pagination.ts`
   - Definiraj tipe za velikost strani, filter in izračun P05.
   - Izračunaj `filteredTasks`, `total`, `pageCount`, `currentPage` in
     `visibleTasks` po pravilih v `docs/agent/P05/spec.md`.
2. `src/App.tsx`
   - Dodaj lokalno stanje za velikost, filter in številko strani.
   - Izpeljaj P05 vrednosti iz obstoječega polja `tasks`.
   - Dodaj obe HTML `select` kontrole, štiri gumbe in statusni element.
   - Prikazuj samo `visibleTasks` v preglednici in tabli.
   - Ohrani obstoječe povezave, `data-task-id`, podrobnosti in preklop prikaza.
3. `src/styles.css`
   - Uredi obstoječo glavo za nove kontrole z minimalnimi pravili.
   - Ohrani ozko postavitev in obstoječe notranje drsenje.
4. `tests/agent/`
   - Dodaj Playwrightove lastne preiskave za R01–R12 in tipične robne primere:
     prazen projekt, filter brez zadetkov, zadnja krajša stran in preklop prikaza.

## Preverjanje

- Za vsako zahtevo R01–R12 zapiši scenarij v testih in dokaz iz dnevnikov.
- Preveri skupne teste, gradnjo/typecheck ter lastne teste. Rezultate zapiši v
  dokumentacijo predaje; neizvedenih preverjanj ne označuj kot uspešnih.
- Brez dodatnih zunanjih meritev, sprememb infrastrukture ali novih odvisnosti.

## Sledljivost

| Zahteva | Izvedbeni del |
| --- | --- |
| R01–R12 | `src/pagination.ts`, `src/App.tsx`, `src/styles.css` in lastni testi |

Izvirne zahteve, sprejemne pogoje in pravila stanja so podrobno v
`docs/agent/P05/spec.md`. Ta načrt jih ne razširja.
