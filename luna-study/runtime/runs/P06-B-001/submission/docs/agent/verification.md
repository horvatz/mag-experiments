# P06 — implementacija in preverjanje

## Vloga in izvedba

Vloga: implementer. Pred začetkom sem prebral `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md` in predano `docs/agent/specification.md`. Pri implementaciji so izvirne zahteve R01–R12 merodajne tudi tam, kjer specifikacija ne bi bila popolna. Specifikacije in njenih zgodovin nisem spreminjal. Napake predane specifikacije nisem našel.

V `src/csv.ts` sem dodal kanonični seznam stolpcev ter serializacijo s citiranjem, podvajanjem notranjih narekovajev, zaščito pred formulami in zaključki CRLF. V `src/App.tsx` sem dodal projektno lokalne kontrole za izbor stolpcev, ločilo in filter ter prenos BOM datoteke; obstoječe opravilo, prikaz, API in preklop pogleda ostanejo ločeni od nastavitev izvoza. V `src/styles.css` sem kontrole oblikoval z obstoječimi barvami in dodal prilagoditev za ozke zaslone. V `tests/agent/P06.spec.ts` je pet lastnih scenarijev.

## Sledljivost zahtev in dokazov

| Zahteva | Izvedba | Preverjanje in dejanski izid |
| --- | --- | --- |
| R01 | Privzete vrednosti in filter/izbor v `src/App.tsx`; vrstni red izvornih vrstic ohrani `filter` in `map` v `src/csv.ts`. | `D01: default file framing` ter `CSV uses canonical columns...`; oboje uspešno. |
| R02 | `CSV_COLUMNS` določa nespremenljivi vrstni red glave in podatkovnih vrednosti; checkboxi so označeni `Stolpec <field>`. | `D02: selected fields and separator` ter lastni preizkus izbire v drugačnem vrstnem redu; uspešno. |
| R03 | `canExport` je resničen natanko ob vsaj eni koloni in vsaj eni filtrirani vrstici; onemogočen gumb nima prenosa. | Lastni `CSV filter and empty column selection...` preveri onemogočenje in ponovno omogočenje; uspešno. |
| R04 | `exportTasks` filtrira samo izvoz; preglednica in tabla še vedno prejmeta `tasks`. | Razvojni D02 in lastna preizkusa praznega rezultata/polnega prikaza; uspešno. |
| R05 | Prenos uporablja `folio-${project.id}.csv`, UTF-8 BOM in Blob URL brez omrežnega zapisa. | D01 preveri ime/BOM; D04 preveri odsotnost zapisov; vsi uspešni. Prenos ostane na isti strani. |
| R06 | `quoteCell` vedno citira; `replaceAll` podvoji narekovaje, izbrano ločilo pa je `;` ali `,`. | Lastni CSV scenarij preveri obe ločili, narekovaje in ločila v besedilu; D02/D03 uspešna. |
| R07 | Serializator uporabi `\r\n` med vrsticami in za zadnjo vrstico; vsebina citirane celice ohrani prelom. | Lastni preizkus primerja natančno besedilo, vključno z vdelanim CRLF in zadnjim CRLF; D01/D03 uspešna. |
| R08 | Pred citiranjem se začetni `[ \t\r\n]*[=+\-@]` nevtralizira z apostrofom pred izvornim nizom; glava je izvzeta. | Lastni preizkus zajame `=`, `+`, `-`, `@`, začetni presledek/tabulator in CRLF; D03 uspešen. |
| R09 | Vrednosti se berejo neposredno iz polj `Task`, brez prikaznega formatiranja; status in datum ostaneta interna oziroma izvorna. | Lastni izvoz primerja šumnike, opis, `in_progress` in datum `YYYY-MM-DD`; uspešno. |
| R10 | Stanje kontrol je v `ProjectView`; preklop pogleda komponente ne zamenja. | D04 in lastni primer primerjata prenosa pred/po preklopu table; uspešno. |
| R11 | Ključ `ProjectView` je ID projekta; začetne vrednosti so lokalne stanju komponente, zato menjava projekta in ponovni zagon nastavita privzeto stanje. | Lastni primer preveri privzete kontrole po menjavi projekta in osvežitvi ter zaporedna izvoza; uspešno. |
| R12 | Izvoz le serializira prebrane naloge in sproži lokalni prenos; obstoječi atributi, imena pogledov, povzetek in prikaz nalog so ohranjeni. | D04 preveri zapise in širino strani; osnovni testi preverijo obstoječi UI; vsi uspešni. |

Pogoja za omogočenost sta v kodi izražena kot `canExport = exportColumns.length > 0 && exportTasks.length > 0`. V lastnih testih sta preverjena prazna izbira kolon, prazen projekt in filter brez zadetkov.

## Preverjanja

- `npm run check` — uspešno: lint, TypeScript, produkcijska gradnja in vseh 51 Playwright testov (14 API, 24 osnovnih namiznih/mobilnih, 8 razvojnih namiznih/mobilnih, 5 agentnih).
- `npx playwright test --project=development-desktop --project=development-mobile` — uspešno: 8/8 razvojnih testov.
- `npx playwright test --project=agent` — uspešno: 5/5 lastnih testov.

Vmesni zagon je odkril napako v prvotni sestavi lastnega testa: dva zaporedna fixtureja sta si delila prestrezanje API. Testa za prazen projekt in prazen filtrirani rezultat sem ločil; končni celoviti zagon je nato uspel.

## Omejitve okolja in nepreverjeno

- Javni internet je po navodilih nedostopen; zunanjih storitev nisem uporabljal. Odvisnosti in Chromium so bili že nameščeni.
- `git status` se je ustavil z napako `xcrun: error: invalid active developer path`; lokalnega stanja Git zato nisem mogel potrditi. Datoteke izhodišča, strežnik, odvisnosti in skupni testi niso bili spreminjani.
- Opozorila npm o neznani nastavitvi `http-proxy` ter Node opozorila `NO_COLOR`/`FORCE_COLOR` so se pojavila, vendar vsi končni pregledi uspešno zaključili.
- Ročnega ogleda strani nisem izvedel. Mobilni razvojni testi preverijo, da širina dokumenta ne preseže širine zaslona; dodatnega ročnega vizualnega pregleda nisem opravil.
- Testni nabori niso posebej preverili več kot deset opravil ali vsake možne kombinacije znakov; serializacija je generična nad seznamom `Task` in polji v `CSV_COLUMNS`.
