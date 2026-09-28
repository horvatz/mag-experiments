# P06: Načrt izvedbe

## Tehnični kontekst

Aplikacija uporablja React 19, TypeScript 6 in Vite 8. `ProjectView` v `src/App.tsx` pridobi opravila trenutnega projekta prek `useResource` in `/api/projects/:id/tasks`; projektno komponento že ponastavi `key={project.id}`. Preklop Preglednica/Tabla zamenja hash-pot, ne ključa projekta. V tabeli in tabli so obstoječi prikazi opravil, API in tipi pa so skupni izhodiščni vmesniki.

## Odločitve

1. **Stanje nastavitev:** `ProjectView` hrani izbrane kolone, ločilo in filter z React stanjem, z začetnimi vrednostmi iz R01. Ne shranjuje jih v URL ali trajno. Obstoječi ključ projekta poskrbi za ponastavitev ob menjavi projekta; ponovni zagon aplikacije jih začne s privzetimi vrednostmi. Hash preklop pogleda ohrani stanje komponente.
2. **Izbor vrstic in stolpcev:** filter uporabiti samo pri pripravi izvoza; obstoječi seznam, števci, preglednica in tabla ostanejo nespremenjeni. Stolpce pred serializacijo razporediti po kanoničnem vrstnem redu iz specifikacije, ne po vrstnem redu klikanja. Gumb omogočiti natanko, ko je izbran vsaj en stolpec in obstaja vsaj ena izvozna vrstica.
3. **CSV:** dodati čisto serializacijsko funkcijo v `src/csv.ts`. V njej izvesti nevtralizacijo formul pred citiranjem, podvojitev dvojnih narekovajev, obvezno citiranje vseh polj, izbrano ločilo, `CRLF` za vsako vrstico in UTF-8 BOM. Ločeno dejanje v `App.tsx` naj pripravi Blob ter sproži prenos `folio-<projectId>.csv` v trenutnem zavihku; ne pošilja vsebine prek API-ja.
4. **Prikaz:** kontrole umestiti v obstoječi razdelek opravil in uporabiti slovenske dostopne oznake, obstoječe slogovne spremenljivke in gradnike Folio. Na ozkem zaslonu smejo drseti samo notranja prikaza tabele in table. Brez novih odvisnosti ali sprememb infrastrukture.
5. **Nespremenljivost podatkov:** ne spreminjati `src/api.ts`, skupnih tipov ali bralnih funkcij; izvoz je samo bralen. Ne uporabljati `/__test/`, `localStorage` ali lokalne kopije strežniških podatkov.

## Datoteke in preverjanje

- `src/App.tsx`: stanje nastavitev, dostopne kontrole, enable/disable pogoji in prenos.
- `src/csv.ts` (novo): deterministična priprava vsebine po pravilih R02 in R05–R09.
- `src/styles.css`: postavitev kontrol v Folio slogu in odzivnost pri širini 390 px.
- `tests/agent/P06.spec.ts` (novo): scenariji za privzete nastavitve, filtre/kolone, vsebino prenosa, preklop pogleda, ponastavitev, nespremenjene podatke in dostopne oznake. Uporabiti obstoječi Playwright in razvojni GET pripomoček samo v testih.

Preveriti s `npm run typecheck`, `npm run build`, skupnimi regresijskimi testi in lastnimi testi P06. Rezultate in povezave do testov ter kode dopolniti v specifikaciji po dejanski izvedbi; neozagnanih preverjanj ne označiti kot uspešnih.
