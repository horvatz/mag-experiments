# P06 — implementacija in preverjanje

## Začetni zapis

Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana docs/agent/specification.md. Vloga: implementer. Izvirne zahteve R01–R12 ostajajo merilo. Specifikacije in pregledovalčevih datotek ne spreminjam. Začetno stanje: implementacija in spodnja preverjanja še niso izvedena.

Načrt: dodati čisto sestavljanje CSV ter projektne kontrole, ohraniti obstoječi Folio in API. Nastavitve se ohranijo med pogledoma in ponastavijo ob menjavi projekta/osvežitvi. Vse podrobnosti in rezultate sproti dopolnim spodaj.

## Začetni načrt preverjanj (ob začetku še neizvedeno)

- R01–R04: privzete nastavitve, vrstni red vrstic/kolon, vsi filtri, prazni podatki, izključitev vseh kolon in ponovni izbor.
- R05–R09: dejanski prenosi in natančni bajti (BOM, obe ločili, CRLF, narekovaji, Unicode, izvirni datumi/statusi, formule in negativni primeri).
- R10–R11: enaki bajti v obeh pogledih, zaporedni izvozi in ponastavitve projekta/osvežitve.
- R12: brez zapisov ali mutacij; regresijski testi; vizualni pregled pri 390 px in na namizju.
- Celotni `npm run check`: slog, tipi, gradnja, 38 osnovnih, 8 razvojnih in lastni testi.

## Omejitve

Javni internet je blokiran. Dovoljene so samo lokalne storitve in izvoz te naloge. Infrastruktura, odvisnosti, skupni tipi in skupni testi so samo berljivi. Za lastne brskalniške skripte je obvezen `chromium.connect(wsEndpoint)` iz task/browser.json; `chromium.launch()` v okolju ne deluje. Nedostopni končni testi ne bodo označeni kot izvedeni. Napaka specifikacije za zdaj ni ugotovljena.

## Spremembe in dejanski rezultati

- `src/csv.ts`: stalni seznam kolon, čista sestava CSV, filtriranje brez mutacij, nevtralizacija samo SP/TAB/CR/LF, BOM in končni CRLF. Pokriva R01–R09 in podatkovni del R12.
- `src/CsvExport.tsx`: dostopne kontrole, privzeto projektno stanje, zaščita praznega izvoza in lokalni prenos Blob z odstranitvijo povezave ter sprostitvijo URL. Pokriva R01–R05 in R10–R11.
- `src/App.tsx`: vključitev skupnih kontrol pred vejitvijo pogledov; obstoječi ključ projekta ponastavi stanje. Izvirno polje še vedno neposredno napaja oba pogleda in števce.
- `src/styles.css`: prilagodljiva postavitev kontrol uporablja obstoječe barve, kartice, pisavo in vidni fokus.
- `tests/agent/csv.spec.ts`: dodanih sedem dopolnilnih scenarijev S01–S07. S04 preverja tudi nize formul v generičnem postopku za status/datum, čeprav takšni nizi niso veljavni API podatki.
- Celotni `npm run check` je zaključen z izhodno kodo 0. ESLint, TypeScript in produkcijska gradnja so uspešni; **53 testov je uspešnih** (38 osnovnih + 8 razvojnih P06 + 7 lastnih), brez preskočenih ali neuspešnih testov. Playwright je trajal 21,9 s. Dokaz: [check.log](check.log).

## Končna sledljivost R01–R12

Vsi spodaj navedeni D in S scenariji so dejansko uspešno izvedeni v zgornjem celotnem preverjanju. D01–D04 so iz `tests/development/P06.spec.ts`, vsak na namizju in mobilnem profilu. S01–S07 so iz [tests/agent/csv.spec.ts](../../tests/agent/csv.spec.ts); S06 izrecno nastavi 390 × 844.

| Zahteva | Pogoj in dejanska koda | Izveden dokaz |
| --- | --- | --- |
| R01 | `CsvExport` privzeto izbere vseh sedem kolon, `;`, `all`; `App.ProjectView` posreduje opravila trenutnega projekta; `csv.createCsv` ohrani vrstni red. | D01, S01: 13 vrstic, enaki naslovi, spremenjeni ID-ji in vrstni red; drug projekt z eno vrstico. |
| R02 | `csvColumns` določa stalni vrstni red, izbrana podmnožica ga ne spreminja. | D02, S05: izbrana title pred id, izvožena id pred title; S07. |
| R03 | `disabled ⇔ selected.length = 0 ∨ rowCount = 0`; `createCsv` dodatno vrne null, kadar ni kolon/vrstic. | S02: izklop vseh, programatski klik brez prenosa, ponovni izbor in uspešen prenos; S07. |
| R04 | Filter v `CsvExport`/`createCsv` vpliva samo na izvoz; preglednica, tabla in števci še uporabljajo prvotne tasks. | S01: all/todo/in_progress/done in nespremenjene vrstice/števci; S02: prazen filter in oba prazna projekta; D04. |
| R05 | `download` uporabi Blob in lokalno povezavo z `download=folio-<projectId>.csv`; CSV začne U+FEFF. | D01, S01, S03: obe imeni, surovi bajti EF BB BF, brez novih strani, spremembe URL ali omrežnih zahtev med izvozoma. |
| R06 | `quote` obdaja vse celice in podvoji vse notranje narekovaje; separator je ; ali ,. | D02/D03, S03: natančna pričakovana datoteka za obe ločili, prazne vrednosti in narekovaji. |
| R07 | `createCsv` doda CRLF med zapise in na konec; vsebina celic se ne normalizira. | D01/D03, S03: natančna bajtna primerjava z notranjimi CR, LF, CRLF ter ločili. |
| R08 | `neutralize` uporablja `/^[ \t\r\n]*[=+@-]/` pred `quote` za vsako podatkovno kolono, glavo navaja ločeno. | D03, S04: 15 pozitivnih/negativnih primerov × 7 kolon (105 preverjanj), vključno z NBSP, navpičnim tabulatorjem in že začetnim apostrofom. |
| R09 | Izvoz neposredno uporablja task[column], brez formatiranja datuma/statusa ali krajšanja. | D03, S03: Čšž, emoji, kitajski znak, presledki, celoten opis, interni status in prestopni datum 2028-02-29. |
| R10 | `CsvExport` ostane na istem mestu v `ProjectView`, zunaj vejitve table/board. | D04, S05: iste nastavitve in isti bajti v obeh pogledih; S06. |
| R11 | Obstoječi `ProjectView key={project.id}` in lokalni useState ponastavita nastavitve; klik vedno uporablja aktualno stanje. | S05: zaporedne spremembe kolon/ločila/filtra, A→B→A ter osvežitev v preglednici in tabli. |
| R12 | Čisto sestavljanje z map/filter; nobenega zapisovalnega API-ja, testnih kontrol ali shrambe v novi produkcijski kodi; prilagodljivi slogi. | D04, S01/S02/S03/S06: brez zapisov; S04/S07: zamrznjeni vhodi nespremenjeni; vseh 38 regresij; vizualni dokazi spodaj. |

## Vizualno in okoljsko preverjanje

Lokalni ogled je uporabil `WEB_PORT=5193 API_PORT=3123 npm run dev` ter `chromium.connect(wsEndpoint)` z vrednostjo iz `task/browser.json`. Pregledane so slike preglednice in table pri 1440 × 960 in 390 × 844. Navigacija, sistemska pisava, nevtralne kartice, modri poudarki in izvorni prikaz opravil so ohranjeni. Kontrole se na mobilnem zaslonu prelomijo znotraj širine. Preglednica in tabla imata dovoljeno notranje drsenje.

Dokazi: [namizna preglednica](visual-desktop-table.png), [namizna tabla](visual-desktop-board.png), [mobilna preglednica](visual-mobile-table.png), [mobilna tabla](visual-mobile-board.png), [meritve](visual-check.json). Za oba pogleda velja scrollWidth = innerWidth (1440 oziroma 390); zabeleženih napak strani je 0. Prvi posnetek namizne table je bil narejen pred zaključkom preklopa; meritev in vse slike so bile zato ponovno shranjene po izrecnem preverjanju izbranega gumba in vidnosti pravilnega pogleda.

`git diff --stat` ni uspel zaradi okolja: `xcrun: invalid active developer path (/Library/Developer/CommandLineTools)`. Zato preverjanje Git statusa ni izvedeno. Spremembe so bile narejene samo z navedenimi popravki dovoljenih datotek; veje, commit in push niso bili ustvarjeni. Gradnja in testi so ustvarili običajne dovoljene izhodne artefakte. npm opozorili o `http-proxy` in `NO_COLOR` nista povzročili napak preverjanja.

## Predaja pregledovalcu

Implementacija je pripravljena za pregled. Predana specifikacija ni imela ugotovljene vsebinske napake in ni bila spremenjena; njeno načrtovano mesto stanja v ProjectView je realizirano z njegovim stabilnim otrokom CsvExport. Specifikacijska zgodovina, review.md/review.json, infrastruktura, odvisnosti, strežnik, skupni tipi in skupni testi niso bili urejani.

Preostale omejitve: nedostopni končni testi niso izvedeni; preverjen je nameščeni Chromium, ne drugi brskalniki. Preklic sistemskega dialoga za shranjevanje ni posebej simuliran. Ob izvozu ni aplikacijskega dialoga ali spremembe podatkov. Posebnega simuliranja pomanjkanja pomnilnika oziroma napake brskalnikovega Blob API-ja ni bilo. Nobena znana zahteva R01–R12 ni ostala neimplementirana.

Ob pripravi predaje je `node task/time-budget.mjs` izpisal še 311 sekund faze in 670 sekund skupnega časa. Končujem predčasno, da čas prevzame pregledovalec. Lokalni strežnik za ogled na 5193/3123 je bil zagnan; testni strežnik 5174/3102 se je po uspešnem preverjanju sam zaključil.
