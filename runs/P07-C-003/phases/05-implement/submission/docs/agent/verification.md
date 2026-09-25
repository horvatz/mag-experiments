# P07 — Preverjanje izvedbe

Datum: 2026-09-25. Izvedeno po [specifikaciji](P07/spec.md), [načrtu](P07/plan.md) in [nalogah](P07/tasks.md). Izvirne [R01–R12](../../task/instructions.md) ostajajo merilo. T001–T008 so opravljene.

## Rezultat

Končni `npm run check` je uspešen: ESLint, TypeScript, produkcijska gradnja in **66 testov** (38 osnovnih, 8 razvojnih P07, 20 lastnih). Izhod procesa: 0. Brskalniški del: 26,5 s. Celoten določljiv izhod z imeni testov je v [check-verified.log](P07/check-verified.log).

Priljubljene so globalna lokalna množica ID-jev z validacijo, kanoničnim zapisom, sinhronizacijo in delovanjem v pomnilniku ob napaki shrambe. Oba pogleda uporabljata iste oznake, projektni filter, števec in odstranitev. Ohranjeni so Folio, navigacija, podrobnosti, dostopna imena in notranje drsenje na ozkem zaslonu.

## Potek in dejansko izvedeni ukazi

1. Odprta ta evidenca in pregledani izhodišče, specifikacija, načrt, naloge ter javni razvojni testi. Zaradi izrecnega navodila izvajalnika je načrtovani `P07/validation.md` nadomeščen s tem dokumentom.
2. Implementirane T002–T005: `useFavorites`, skupni gumb, vključitev v oba pogleda, filter, števci, odstranitev, opozorilo in slogi. Dodanih 20 lastnih vedenjskih primerov A01–A07 s parametrizacijami (T006).
3. Prvi `npm run check`: ESLint uspešen, TypeScript TS2684 v lastnem testnem prestrezniku združenih podpisov getItem/setItem; brskalniški testi niso tekli. Popravljeno s `Reflect.apply`. Ohranjen [check.log](P07/check.log).
4. Drugi `npm run check`: vsi pregledi in 66 testov uspešni, [check-final.log](P07/check-final.log). Pregledani posnetki prazne table ter filtrirane preglednice in table pri 390 pik.
5. Pregled domene ID-jev je pokazal, da se surove reference `aria-labelledby` na tabli pri presledkih razcepijo. Kodirane so samo DOM oznake; ID-ji podatkov in obstoječa navigacija so ohranjeni. A07 zdaj vključuje ID s presledkom, Unicode in URL ločili ter preverja dostopno ime povezave.
6. Ponovljeni `npm run check` po tej spremembi: vse uspešno, [check-verified.log](P07/check-verified.log). Brez nadaljnjih sprememb aplikacije ali testov po tem preverjanju.

## Sledljivost zahtev

Predikati in obseg: [model stanja ter sprejemni pogoji](P07/spec.md#model-stanja-in-predikati). Lastni primeri A01–A07 so v [tests/agent/P07.spec.ts](../../tests/agent/P07.spec.ts); D01–D04 so v [razvojnih testih](../../tests/development/P07.spec.ts). Za vse spodnje uspešne izide je dokaz [končni dnevnik](P07/check-verified.log), kjer so navedena celotna imena in rezultati testov.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Ločen gumb, preklop samo ID-ja, brez odpiranja podrobnosti | D01, A03, A07 | [FavoriteButton](../../src/FavoriteButton.tsx); gumbi v [ProjectView](../../src/App.tsx) in [TaskBoard](../../src/TaskBoard.tsx) | Uspešno; oba pogleda, enaki naslovi, sorojenost povezavi, tipkovnica |
| R02 | Točen ključ/oblika, enkratni nizi, UTF-16, brez polj opravila | D03, A01 | [useFavorites](../../src/useFavorites.ts), `commit` | Uspešno; preverjen celoten JSON, tudi razlika med znaki BMP in nadomestnimi pari |
| R03 | Obnovitev, združitev podvojitev in ohranitev neznanih ID-jev | A01, A04 | [useFavorites](../../src/useFavorites.ts), `decode`, `readInitial`, `commit` | Uspešno; osvežitev, neznani ne ustvarijo vrstic in preživijo zapis |
| R04 | Napačen vhod pomeni prazno množico brez prepisovanja | A02.0–A02.10 | [useFavorites](../../src/useFavorites.ts), `decode`, `readInitial` | Uspešno; 11 vhodov, primerjava originalne shrambe in stanja |
| R05 | Privzeto false, filtriranje trenutnega projekta v izvornem vrstnem redu | D02, A03, A04, A07 | [ProjectView](../../src/App.tsx), `onlyFavorites`, `visibleTasks` | Uspešno; urejeni vidni ID-ji in menjava projektov |
| R06 | Takojšnja odstranitev, zahtevano prazno stanje, izklop filtra | D02, A03, A07 | [ProjectView](../../src/App.tsx), `favorites-empty` in stalna orodna vrstica | Uspešno; oba pogleda, prazen projekt in zadnji zadetek |
| R07 | Enaka množica/filter ob preklopu pogleda, pravilne podrobnosti | D04, A03, A07, osnovna regresija | [App/ProjectView](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx) | Uspešno; ohranitev filtra in ID-ja tudi s presledkom/Unicode/ločili |
| R08 | Menjava projekta ohrani množico in ponastavi filter; obnovitev ob osvežitvi | A01, A04 | [App](../../src/App.tsx), globalni hook in `ProjectView key={project.id}` | Uspešno; oba projekta in osvežitev |
| R09 | Odstranitev samo ID-jev celotnega projekta, onemogočenost pri X=0 | A04, A07 | [ProjectView](../../src/App.tsx), `favorites.remove(tasks.map(...))`; [hook](../../src/useFavorites.ts), `remove` | Uspešno; drugi/neznani ID-ji ostanejo, aktivni filter in prazen projekt |
| R10 | X/M za celotni projekt, števci stolpcev za vidne vnose | A03, A04, A07 | [ProjectView](../../src/App.tsx), `favoriteCount`/status; [TaskBoard](../../src/TaskBoard.tsx), `entries` | Uspešno; filter, odstranitve, 0/1/13 vhodnih opravil |
| R11 | Storage validacija, null/tuji ključ, brez povratnega zapisa, izjeme | A05, obe A06 | [useFavorites](../../src/useFavorites.ts), `receive`, `readInitial`, `commit`; [App](../../src/App.tsx), opozorilo | Uspešno; 0 povratnih zapisov, nadaljnje delo po napakah getItem/setItem |
| R12 | Brez API zapisov/sprememb polj, Folio, nalaganje, navigacija, 390 pik | D04, A03, A06, A07, 38 osnovnih testov | [useFavorites](../../src/useFavorites.ts), lokalna dejanja; [slogi](../../src/styles.css), dodatni razredi | Uspešno; primerjava strežniškega stanja, nadzor zahtev, regresija in širina |

## Vizualni pregled in obseg

Pregledani posnetki: [prazna tabla](P07/mobile-board-0.png), [filtrirana preglednica](P07/mobile-table-13.png), [filtrirana tabla](P07/mobile-board-13.png). Končni test jih ponovno ustvari. Folio ohranja logotip, navigacijo nad vsebino pri 390 pik, nevtralne površine, modro označitev, notranje drsenje, ločen gumb na kartici in vidni fokus. Širina dokumenta je programsko preverjena v obeh pogledih za 0, 1 in 13 opravil.

Spremembe aplikacije: `src/useFavorites.ts`, `src/FavoriteButton.tsx`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`. Dodani so lastni testi v `tests/agent/` in dokumenti/dokazila v `docs/agent/`; predhodna koraka sta uredila dovoljeni procesni datoteki. Strežnik, odvisnosti, konfiguracija, skupni tipi in skupni testi niso spreminjani. Brez vej, commitov, drugih agentov ali zunanjih virov.

## Omejitve in predaja

Ni znanih neizpolnjenih R01–R12. Končni testi niso dostopni in niso izvedeni. Preverjanje ne pomeni izčrpnega preizkusa vseh možnih podatkov. Sinhronizacija je preverjena z dejanskimi dogodki `storage`, sproženimi v testni strani; ločen ročni preizkus dveh fizičnih zavihkov ni izveden. Ob nedostopni shrambi ostane stanje v pomnilniku, zato trajnost v tem primeru ni zagotovljena, kot določa zahteva.

Naslednji korak `speckit-converge` vodi izvajalnik. Noben kontrolni seznam kakovosti zahtev v implementacijskem koraku ni bil spreminjan.
