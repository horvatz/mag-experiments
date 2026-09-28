# Implementacijski načrt P06

## Tehnični kontekst

Aplikacija uporablja React, TypeScript in Vite; nameščeni so Playwright in
Chromium. `ProjectView` v `src/App.tsx` nalaga opravila trenutnega projekta z
obstoječim `useResource` in javnim GET API-jem. `Task` ter njegova polja so
določeni v `shared/types.ts`. Preglednica in tabla uporabljata isti seznam
opravil; njun preklop je v poti/hashu. Upoštevaj vse sprejemne pogoje v
[`spec.md`](spec.md) in potrjeno usmeritev iz `docs/dizajn.md`.

## Zasnova

- CSV pripravi deterministična funkcija v `src/csvExport.ts`: določi stalni
  vrstni red polj, izberi izvozne vrstice brez spreminjanja vhodnega seznama,
  nevtraliziraj nevarne predpone, citiraj vsako celico ter sestavi UTF-8
  vsebino z BOM, izbranim ločilom in zaključnimi CRLF. Status in datum uporabi
  neposredno iz tipa `Task`.
- `src/CsvExportControls.tsx` prikaže checkboxe in selecte z dogovorjenimi
  dostopnimi imeni ter gumb `Izvozi CSV`. Stanje filtrov, ločila in izbora je
  lokalno komponenti; komponenta ostane na istem mestu ob preklopu pogleda.
  `ProjectView` ima ključ projekta, zato menjava projekta ali osvežitev
  vzpostavi privzeto stanje. Gumb onemogoči, kadar ni stolpcev ali izvoznih
  vrstic.
- Za prenos uporabi `Blob`, začasni objektni URL in povezavo z atributom
  `download`; po sprožitvi povezavo odstrani in URL sprosti. Izvoz ne kliče
  zapisovalnega API-ja, ne uporablja `/__test/` in ne spremeni opravil.
- V `src/App.tsx` vstavi kontrole v obstoječi projektni razdelek ob preklopu
  Preglednica/Tabla. Obe predstavitvi še vedno dobita celoten seznam opravil;
  izbrani filter vpliva le na izvoz. Obstoječa dostopna imena, `data-task-id`
  in položaj dejanj zunaj povezav opravil ostanejo ohranjeni.
- `src/styles.css` naj uporabi obstoječe gradnike in slogovne spremenljivke
  Folio. Kontrole se pri ozkem prikazu lahko prelomijo; širina strani pri
  390 px ostane omejena, drsenje preglednice in table pa notranje.

## Datoteke in preverjanje

| Datoteka | Namen |
| --- | --- |
| `src/csvExport.ts` | Vrstni red stolpcev, filtriranje, formula-varna CSV serializacija in prenos. |
| `src/CsvExportControls.tsx` | Dostopne kontrole in lokalno stanje nastavitev. |
| `src/App.tsx` | Umestitev kontrol ob obstoječi projektni prikaz. |
| `src/styles.css` | Folio slog in odzivna postavitev kontrol. |
| `tests/agent/P06.spec.ts` | Lastni Playwright scenariji za vse R01–R12, prenosne bajte, robne podatke, reset/persistenco nastavitev, odzivnost in odsotnost zapisov API. |

Uporabi obstoječi React/TypeScript/Vite in Playwright brez novih odvisnosti.
Preveri tipizacijo in lint ter zaženi skupne regresijske teste, pripravljene
razvojne teste P06 in lastne teste. Testni scenariji naj podatke podajo z
lokalnimi GET odgovori in pokrijejo prazen projekt, prazne filtrirane rezultate,
poljubno število in vrstni red opravil, narekovaje, ločila, CR/LF ter Unicode.
Skupnih testov, tipov, API-ja, strežnika in nastavitev ne spreminjaj.
