# P06 – Poročilo o preverjanju

23. 9. 2026, postopek A, en agent. Delo se je začelo ob 20:00 UTC. Specifikacija je bila zapisana pred implementacijo, končno preverjanje kode pa zaključeno znotraj 20-minutne omejitve. Spremembe so omejene na `src/`, `tests/agent/` in `docs/agent/`; infrastruktura, skupni tipi, podatki, skupni testi in odvisnosti niso bili urejani.

## Rezultat

Implementirane so vse zahteve R01–R12. Znana neizpolnjena zahteva ni ostala. CSV se ustvari v brskalniku, ohranja izvorni vrstni red in vsebino ter uporablja zahtevano nevtralizacijo formul. Nastavitve so lokalne trenutnemu projektu. Filtriranje izvoza ne spremeni preglednice, table ali povzetkov.

## Dejanski zagoni

| Preverjanje | Dejanski rezultat | Dokaz |
| --- | --- | --- |
| `npm run lint && npm run typecheck` pred dodajanjem lastnih testov | Uspešno, izhodna koda 0. | Izhod ukaza v seji; ločen dnevnik ni bil shranjen. |
| Prvi `npm run check` | ESLint, TypeScript, produkcijska gradnja uspešni; **56/56 testov**, 23,9 s. | [check.log](check.log) |
| Končni `npm run check` po popravku prednosti CSS gumba | ESLint, TypeScript, produkcijska gradnja uspešni; **56/56 testov**, 24,1 s, izhodna koda 0. | [check-final.log](check-final.log) |
| Ročni ogled z `WEB_PORT=5193 API_PORT=3123 npm run dev` in skripto Node/Playwright | Preglednica in tabla pri 1440 × 960 ter 390 × 844; širina dokumenta 1440 oziroma 390; brez napak strani in zapisovalnih zahtev API. | [visual-check.log](visual-check.log) in spodnji posnetki |

56 preverjanj sestavlja 14 API + 12 namiznih + 12 mobilnih izhodiščnih preverjanj, 4 razvojna namizna + 4 razvojna mobilna preverjanja in 10 lastnih preverjanj. Razvojni testi D01–D04 so bili torej izvedeni v obeh konfiguracijah. Lastni A09 posebej nastavi širino 390 px. Playwright uporablja priloženo povezavo na Chromium; lastna skripta je prebrala `wsEndpoint` iz `task/browser.json` in uporabila `chromium.connect`, brez `launch()`.

## Lastna preverjanja in povezave z zahtevami

Vsi A01–A10 so v [tests/agent/csv.spec.ts](../../tests/agent/csv.spec.ts); izidi so razvidni po imenih v [končnem dnevniku](check-final.log). Primerjave dejanskih prenosov uporabljajo bajte in neodvisen bralnik CSV, ki preveri BOM, obvezne narekovaje, podvojene narekovaje in vsak zunanji CRLF. Bralnik ne uporablja produkcijske serializacije.

| Test | Izvedeni scenarij in izid | Zahteve |
| --- | --- | --- |
| A01 | Uspešno: primerjava vseh bajtov z ročno določenimi celicami za obe ločili, obraten izbor kolon, nesortirana ID-ja, šumniki, emoji, japonsko besedilo, notranji CR/LF/CRLF, prazna vsebina in datum 2028-02-29. | R01, R02, R05–R09 |
| A02 | Uspešno: za vseh 7 kolon kombinacija 6 začetnih preslednih predpon × 4 začetniki formule ter 10 negativnih primerov; skupaj 238 primerov. Apostrof je pred celotno vsebino. NBSP, vertikalni tabulator, form feed in em-space se ne obravnavajo kot dovoljeni začetni presledni znaki. | R08, R09 |
| A03 | Uspešno: zamrznjenih 13 izvornih objektov in izbor ostanejo nespremenjeni; serializacija brez vrstic ali brez kolon vrne prazen niz. | R03, R04, R12 |
| A04 | Uspešno: dejanski prenosi 13 nesortiranih opravil z enakimi naslovi in posebnimi znaki; drug projekt je izključen; privzete kontrole, vsi filtri, obraten vrstni red klikov in sprememba ločila; prikaz in povzetek ostajata enaka; brez navigacije, novih strani ali omrežnih zahtev med izvoznimi dejanji. | R01, R02, R04–R09, R11, R12 |
| A05 | Uspešno: odstranitev vseh kolon ne ustvari prenosa; ponovni izbor omogoči prenos samo ob ustreznih vrsticah; oba filtra brez zadetkov onemogočita gumb; preverjeno tudi programsko aktiviranje onemogočenega gumba. | R03, R04 |
| A06 | Uspešno: oba projekta prazna, oba pogleda in vsi štirje filtri; brez prenosa, povzetki ostanejo 0/0/0. | R04, R12 |
| A07 | Uspešno: poljubna ID-ja `atlas-7` in `beta-42`, eno opravilo na projekt; vse nastavitve se ponastavijo ob menjavi, vrnitvi z zgodovino in osvežitvi; pravilni imeni datotek in identiteta vrstic. | R01, R05, R11 |
| A08 | Uspešno: nestandardne nastavitve ostanejo pri preklopih preglednica → tabla → preglednica → tabla ter odpiranju podrobnosti; celotni bajti in imena prenosov so enaki; opis v podrobnostih ostane izvornik; nobenega zapisovalnega API klica in nespremenjeno testno stanje strežnika. | R09–R12 |
| A09 | Uspešno: 390 px, checkbox s tipkovnico in viden obris fokusa, kontrole znotraj zaslona, stran brez vodoravnega prelivanja, dejanski prenosi v obeh pogledih. | R05, R12 |
| A10 | Uspešno: simulirana sinhrona napaka `URL.createObjectURL` prikaže obvestilo; nastavitve ostanejo, naslednji prenos uspe in obvestilo izgine. | Obravnava napake iz specifikacije, dopolnilo R05/R12 |

A02 namenoma uporablja sintetične nize tudi v poljih, ki imajo v dejanski domeni strožji format (status, datum, ID), da preveri enako pravilo navedbe v vsaki koloni. Vsi brskalniški scenariji uporabljajo veljavne statuse, datume in projektne ID-je.

## Sledljivost zahtev v kodi

Sprejemni pogoji in formalni predikati so v [specification.md](specification.md). Celotna tabela R01–R12 tam povezuje pravilo, kodo, teste in dejanski rezultat.

| Zahteve | Del implementacije |
| --- | --- |
| R01, R02, R06–R09 | [src/csv.ts](../../src/csv.ts): `CSV_COLUMNS`, `quote`, `quoteData`, `serializeTasksCsv`; kanonični izbor, navajanje, formula, BOM, CRLF. |
| R01, R03, R04, R05, R11 | [src/CsvExport.tsx](../../src/CsvExport.tsx): začetna stanja, `rows`, `disabled`, `download`; lokalni Blob in začasna povezava, sproščanje objektnega URL-ja. |
| R04, R10, R11, R12 | [src/App.tsx](../../src/App.tsx): `CsvExport` pred vejitvijo pregleda; obstoječi `ProjectView key={project.id}`; oba prikaza še vedno prejmeta izvorni `tasks`. |
| R12 | [src/styles.css](../../src/styles.css): `.csv-export`, `.csv-column-options`, `.csv-export-actions`, `.csv-select`, `.button.csv-download` in mobilne prilagoditve. |

## Vizualni pregled in opažanja okolja

Pregledani so končni posnetki [namizne preglednice](desktop-table.png), [namizne table](desktop-board.png), [mobilne preglednice](mobile-table.png) in [mobilne table](mobile-board.png). Ohranjeni so sistemska pisava, navigacija, nevtralne površine, modri poudarek, zaobljeni robovi ter notranje drsenje preglednice/table. Pri 390 px se checkboxi prelomijo, izbirnika ostaneta v širini vsebine, izvozni gumb zavzame celo vrstico. Dodatni [mobilni posnetek A09](mobile.png) uporablja 13 opravil s posebnimi znaki.

Prvi vizualni pregled je odkril, da je splošni slog `.button` preglasil modro ozadje izvoza. Popravljeno s selektorjem `.button.csv-download`; nato je bil ponovljen celotni `npm run check`. Ročni strežnik je sprva še vračal staro CSS pravilo, zato dodatna preverba barve ni uspela (dejansko belo namesto modrega ozadja). Po ustavitvi in ponovnem zagonu istega dovoljenega strežnika je končna preverba vrnila `rgb(47, 109, 204)` v vseh štirih kombinacijah. Zajem posnetkov je bil dopolnjen s čakanjem na `aria-pressed=true` in vidnost ciljnega pogleda, da posnetek ne prehiti dogodka `hashchange`.

Opozorila npm o okoljski nastavitvi `http-proxy` in opozorila Node glede `NO_COLOR`/`FORCE_COLOR` niso prekinila preverjanj. Javnega interneta, povezovalnikov, drugih projektov ali drugih agentov ni bilo uporabljenih.

## Omejitve in nepreverjeno

- Nedostopni končni testi niso bili izvedeni in niso navedeni kot uspešni.
- Preverjeno je nameščeno okolje Chromium; drugih brskalnikov, dejanskega uvoza v Excel/LibreOffice in celotnega pregleda z bralnikom zaslona ni bilo.
- Uporabnikov preklic prenosa in napake pri zapisovanju na njegov disk niso bili simulirani; aplikacija za ta dejanja nima povratnega signala. Preverjen je dejanski uspešen prenos in obnovljiva napaka lokalne priprave.
- Testni obseg vsebuje 0, 1, 2, 3, 8 in 13 opravil na projekt; ekstremno velikih naborov ni bilo merjeno. Algoritem nima fiksne omejitve števila opravil.
- Navigacija med nalaganjem je preverjena z obstoječo regresijo. Novih scenarijev sočasnih sprememb brez osvežitve nismo razširjali skladno z navodili.
