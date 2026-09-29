# Implementacija in preverjanje P04

## Začetni zapis

Vloga: implementer. Začetek: prebrani `PROJECT_RULES.md`, `task/instructions.md`, `task/specification-template.md` ter predana `docs/agent/specification.md` in njena zgodovina. Spremembe so omejene na `src/`, `tests/agent/` in ta implementacijski zapis; specifikacije in pregledovalčevih datotek ne spreminjam.

### Načrtovana preverjanja

- Pregledati obstoječi pogled, API-branje, tablo, navigacijo in dostopnostne oznake.
- Dodati stabilno projekcijsko razvrščanje in štiri lokalne kontrole po R01–R12.
- Zagnati `npm run check` in razvojne P04 teste; po potrebi dodati lastne teste v `tests/agent/`.
- Zabeležiti rezultate, neizvedene primere in omejitve okolja pred predajo.

### Še neizvedeno ob začetku

- Pregled izvorne kode in razvojnih testov.
- Implementacija.
- Vsa avtomatska in ročna preverjanja.

### Okolje in čas

- `node task/time-budget.mjs`: ob začetku je kazal 502 s faznega in 861 s skupnega časa.
- `git status --short` ni uspel: orodje `git` kliče `xcrun`, ki javlja neveljavno aktivno pot Command Line Tools (`/Library/Developer/CommandLineTools`).
- Omejitev: javni internet je blokiran; uporaba Chromiuma v lastnih skriptah mora upoštevati `task/browser.json` in `chromium.connect(wsEndpoint)`.

## Spremembe in sledljivost

`src/App.tsx` zdaj hrani štiri nastavitve v lokalnem stanju `ProjectView`, izračuna stabilno kopijo seznama in jo preda preglednici ali tabli. `src/styles.css` doda zadržane kontrole v slogu Folio, pri 390 px v dve koloni. API, tipov, navigacije in trajne shrambe se ne dotikam. Pri `original` primerjalnik vrne izvorni indeks; besedilo primerja po NFD, odstranitvi U+0300–U+036F, `toLowerCase()` in operatorjih `<`/`>`; status uporablja rangiranje, datumi pa primerjavo veljavnih ISO nizov. Izenačitve razreši izvorni indeks.

| Zahteva | Koda / predikat | Izveden scenarij |
| --- | --- | --- |
| R01 | `ProjectView` začetni tuple `(original, asc, none, asc)`; kopija ohrani T. | Agent: privzete vrednosti in začetni ID-ji. |
| R02 | `compareText`: NFD → odstrani U+0300–U+036F → male črke → UTF-16 `<`/`>`. | Agent: `Čaj`/`caj`, `Cafe`/`Café`, velika/mala začetnica in `A10`/`A2`; obe smeri in stabilni izenačeni pari. |
| R03 | `statusRank`; veljavni `YYYY-MM-DD` primerjani kronološko. | Agent: status + datumi čez mesece/leto v obeh smereh. |
| R04 | Smer množi le primerjavo posameznega ključa; izvorni indeks ostane zadnji izenačevalnik. | Agent: oba primarna in sekundarna obrata; enaki naslovi ostanejo stabilni. |
| R05 | Sekundarni ključ se primerja samo po primarnem izenačenju, s svojo smerjo. | Agent: status + rok z neodvisnima smerema. |
| R06 | Primarni `original` vrne vrstni red indeksov; enaka ključa se razrešita z indeksom. | Agent: poljubne druge kontrole ob `original`; ponovljen naslov kot oba ključa. |
| R07 | `TaskBoard` prejme isti `orderedTasks`; obstoječi fiksni stolpci filtrirajo po statusu in s tem ohranijo podzaporedje. | Agent: razvrščena todo kolona; razvojni D03 pregleda podzaporedje. |
| R08 | Stanje je v `ProjectView`, ki ostane montiran ob spremembi pogleda ali dialogu. | Agent: tabela ↔ tabla in odprtje/zaprtje podrobnosti; razvojni/baseline regresijski testi. |
| R09 | Projektni `key={project.id}` ustvari sveže lokalno stanje; refresh ponovno ustvari začetne vrednosti. | Agent: menjava projekta in osvežitev po nestandardnih kontrolah. |
| R10 | Gumb nastavi vse štiri privzete vrednosti; comparator podpira poljubno dolžino seznama. | Agent: ponastavitev; nič opravil in eno opravilo pri vseh primarnih ključih/smereh. |
| R11 | Razvrščanje mapira v ovoj `{task,index}` in vrne nov seznam; zapisovalne poti ni. | Agent + D04: brez API zapisov po sortiranju/ponastavitvi; API fixture ostane nespremenjen. |
| R12 | Obstoječi `data-task-id`, povezave po ID-ju, ARIA in bralni prikazi ostanejo; kontrole se prilagodijo ozkemu zaslonu. | Osnovni testi preverijo podvojene naslove, podrobnosti, dostopnost in oba pogleda na namizju/mobilno; agent preveri 390 px. |

## Rezultati in omejitve

Končni zagon `npm run check` je uspešen: ESLint, TypeScript in Vite build so zaključeni brez napak; Playwright je poročal **50 passed**: 14 API, 24 baseline (namizni/mobilni), 8 razvojnih P04 in 4 lastni testi. Prvi zagoni so odkrili samo napačna pričakovanja v lastnih testih, ki so bila popravljena; ti neuspehi niso bili napaka aplikacije. Končni uspešni zagon je potekal po popravkih.

V tem okolju `git status --short` ni dosegljiv: Git se ustavi pri napačni poti Xcode Command Line Tools (`xcrun: invalid active developer path`). `npm` opozarja na neznano okoljsko nastavitev `http-proxy`; opozorilo ne prepreči lint/build/test zagona. Specifikacija je skladna z navodili; napake, ki bi zahtevala odstopanje, nisem našel. Končnih skritih testov ni bilo mogoče zagnati ali videti.
