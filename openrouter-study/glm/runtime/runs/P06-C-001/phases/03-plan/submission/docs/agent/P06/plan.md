# Načrt P06: Nastavljiv izvoz CSV

**Različica**: 1.0.0 | **Datum**: 2026-10-09

## Tehnični kontekst

- Aplikacija je React 19 s TypeScriptom in Vite; podatke že bere obstoječi `useResource` prek javnega API-ja.
- Testiranje poteka s Playwrightom; ne dodajamo odvisnosti, strežnika, skupnih tipov ali nastavitev.
- Spremembe so omejene na `src/`, `tests/agent/` in dokumentacijo v `docs/agent/`.
- Uporabniški vmesnik ne sme uporabljati `/__test/`, `localStorage` ali novega zapisovalnega API-ja.

## Odločitve in arhitektura

- **CSV logika kot čista funkcija**: dodamo `src/csv.ts`. Določi dovoljene kolone, privzeti vrstni red, filtriranje po statusu, navedbo vrednosti, nevtralizacijo formul, CRLF in UTF-8 BOM.
- **Lokalno stanje izvoza v `ProjectView`**: izbrane kolone shranimo v `Set`, ločilo in filter v ločenih stanjih. Privzeti vrednosti so vse kolone, `;` in `all`.
- **Ohramba pri preklopu pogleda**: stanje izvoza ostane v isti `ProjectView` komponenti pri preklopu Preglednica/Tabla, zato nastavitve ostanejo nespremenjene.
- **Ponastavitev ob menjavi projekta ali osvežitvi**: obstoječi `key={project.id}` v `App.tsx` ponovno ustvari `ProjectView`; sveža komponenta začne s privzetimi nastavitvami.
- **Prenos v bralniku**: z `Blob` in začasnim `objectURL` ustvarimo prenos `folio-<projectId>.csv`, s klikom na nevidno/odstranjeno sidro z `download`. Ne pošiljamo vsebine na strežnik in ne odpiramo nove strani.
- **Folio**: nove kontrole umestimo v projektni vsebinski blok z obstoječimi razredi, barvami in tipografijo; na 390 px širine preprečimo razširjanje strani.

## Datoteke

- `src/csv.ts`: vrstni red kolon, tipi nastavitev, filtriranje, obdelava formul, navedba, oblikovanje CSV in ime datoteke.
- `src/App.tsx`: kontrole izbire kolon, ločila in filtra, stanje izvoza, omogočenje gumba, integracija preklopa pogledov in izvedba prenosa.
- `src/styles.css`: minimalne Folio razširitve za novo območje kontrol in ozko postavitev.
- `tests/agent/p06-export.spec.ts`: lastni Playwright testi za R01–R12.
- `docs/agent/P06/spec.md`: posodobitev sledljivosti po dejanski izvedbi.

## Vrstni red implementacije

1. Dodaj čisto CSV-logiko s testnimi primeri za vrstni red, navedbo, CRLF, BOM, Unicode, ločila in nevtralizacijo formul.
2. Dopolni `ProjectView` s stanjem izvoza, kontrolami in gumbom ter poveži obstoječi seznam opravil.
3. Izvedi prenos datoteke z `Blob` in `objectURL`; ne uporabi `localStorage` ali zapisovalnega API-ja.
4. Dopolni slog po Folio in preveri ozko postavitev.
5. Dodaj agentove teste za privzeti izvoz, izbor kolon, filter, preklop pogleda, menjavo projekta in ohranjenost podatkov.
6. Izvedi typecheck, lint, gradnjo in teste ter posodobi sledljivost v specifikaciji.

## Preverjanje

- Zahtevane ukaze izvedemo z obstoječimi skripti: `npm run typecheck`, `npm run lint`, `npm run build` in `npm test`.
- Uspeh zapišemo samo za dejansko izvedene preglede; neizvedene preglede jasno navedemo.

## Omejitve

- Ne spreminjamo javnega API-ja, podatkovnega modela, strežnika, skupnih testov ali odvisnosti.
- Testni mehanizmi `/__test/` so dovoljeni samo testom, ne produkcijski kodi.
- Besedilo in razporeditev, ki nista določena v izvirnih zahtevah, izberemo v skladu s potrjenim dizajnom Folio.
