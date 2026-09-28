# Načrt izvedbe P07

## Tehnični kontekst

Aplikacija uporablja React 19, TypeScript 6 in Vite 8; odvisnosti in testi Playwright so že nameščeni. `App.tsx` nalaga projekte in izriše projektni pogled z vezanim ključem; `TaskBoard.tsx` izriše kartice table. URL določa projekt, pogled in podrobnosti opravila. Opravila ostanejo pridobljena prek obstoječih poti `/api/`. Sprememba ne zahteva novih odvisnosti ali posegov v strežnik, skupne tipe, konfiguracijo testov ali gradnjo.

## Odločitve pri zasnovi

- Dodati majhen hook `useFavorites` v `src/useFavorites.ts` in ga namestiti enkrat v `App`. Ta upravlja globalno množico ID-jev, branje in zapis shrambe, validacijo, dogodke `storage` ter opozorilo. Shranjuje samo `{version: 1, ids: [...]}`; neznane ID-je ohrani. Izjeme pri dostopu do shrambe ujame in ohrani uporabno stanje v pomnilniku.
- Logično vrednost filtra hraniti v projektnem pogledu, ki ima ključ projekta. Menjava projekta zato pogled znova ustvari in filter ponastavi; menjava preglednice in table spremeni samo lastnost pogleda in filter ohrani. Osvežitev začne s filtrom `false`, hook na vrhu pa obnovi priljubljene.
- Seznam vidnih opravil izračunati enkrat iz vrstnega reda API-ja, filtra in globalne množice ter ga posredovati preglednici in tabli. Števec priljubljenih izračunati iz vseh opravil projekta, števce stolpcev table pa iz vidnih opravil. Navigacijo do podrobnosti in podatke opravil pustiti nespremenjene.
- Gumb priljubljenega postaviti ob povezavo opravila, zunaj nje. Filter, odstranjevanje priljubljenih projekta, števec in prazno stanje postaviti v razdelek opravil, da so kontrole na voljo tudi brez rezultatov. Uporabiti obstoječe Folio sloge, oznake in drsne vsebnike.
- Ne dodajati odvisnosti. Uporabniški vmesnik za opravila uporablja samo `/api/` in nikoli ne kliče `/__test/`.

## Datoteke in zaporedje dela

1. Dodati `src/useFavorites.ts` za začetno branje, preverjanje JSON-a, kanonično enolično razvrščanje po UTF-16, preklop, odstranjevanje ID-jev projekta, varen zapis in usklajevanje zunanjih dogodkov shrambe.
2. Posodobiti `src/App.tsx`, da namesti in posreduje stanje priljubljenih, izračuna filtriran seznam ter doda filter, gumb za odstranitev, števec, gumbe v vrsticah in prazno stanje filtra. Ohraniti `data-task-id`, obstoječa imena pogledov, oznako pregleda stanj ter povezave do podrobnosti po ID-ju.
3. Posodobiti `src/TaskBoard.tsx` za gumbe na karticah zunaj povezav in števce stolpcev glede na vidna opravila. Posodobiti `src/styles.css` za nove kontrole in stanja z obstoječimi slogovnimi spremenljivkami; pri 390 px ohraniti širino strani in notranje vodoravno drsenje.
4. Dodati `tests/agent/favorites.spec.ts` za obstoječi Playwright agentni projekt. Preveriti R01–R12, vključno z enakimi naslovi, oblikami in napakami shrambe, dogodki, menjavo pogleda/projekta, praznim filtrom, števci, odsotnostjo API zapisov in prikazom pri 390 px. Različne nabore opravil podati z nadzorovanimi GET odgovori samo v testnem programu.
5. Po izvedbi dopolniti `docs/agent/P07/spec.md` z dejanskimi lokacijami kode, imeni testov in rezultati; nedostopne ali neizvedene kontrole pustiti jasno označene.

## Preverjanje

Zagnati obstoječi lint, preverjanje tipov/gradnjo in Playwright (`npm run lint`, `npm run build`, `npm test`). Playwright že vključuje `tests/agent/`; njegove konfiguracije ne spreminjati. Po matriki specifikacije preveriti R01–R12 in regresije izhodišča, odsotnost zapisov opravil zaradi priljubljenih ter odsotnost razširitve strani pri širini 390 px. Dejanske izide zabeležiti v specifikaciji. V tem koraku preverjanj izvedbe nisem zaganjal.

## Meje

Spremembe aplikacije ostanejo v `src/`, `tests/agent/` in `docs/agent/`. Ohraniti potrjeni dizajn Folio, obstoječi API in infrastrukturo. Ne dodajati trajne shrambe za polja opravil, zapisovalnih API-jev, uporabe testnih kontrol v uporabniškem vmesniku ali arhitekturnih sprememb zunaj opisanega majhnega hooka in povezave pogledov.
