# P06 — implementacija in preverjanje

Začetni zapis: 23. 9. 2026. Vloga: implementer. Prebrani so PROJECT_RULES.md,
task/instructions.md, task/specification-template.md in predana specifikacija.
Izvirne zahteve R01–R12 veljajo v celoti; napake specifikacije za zdaj niso zaznane.

## Začetni načrt (zgodovinski zapis pred izvedbo)

- Še ni izvedeno: pregled obstoječe kode in potrjenega dizajna.
- Še ni izvedeno: čisti CSV serializator (R01–R02, R05–R09) in lokalne
  izvozne kontrole s pravilno življenjsko dobo (R03–R04, R10–R12).
- Še ni izvedeno: lastni testi za vrstni red, prazne izbore/rezultate,
  natančne bajte, formule, preklop pogleda in ponastavitev projekta.
- Še ni izvedeno: npm run check (slog, tipi, gradnja, osnovni, razvojni in
  lastni testi), pregled prilagodljivosti pri 390 px ter namizni pogled.

## Omejitve in predaja

Infrastruktura, skupni testi, tipi in navodila so samo berljivi. Specifikacije
in datotek pregledovalca ne spreminjam. Uporabljam samo izvoz tega projekta
in lokalne storitve; javni internet je blokiran. Chromium je treba povezati
prek wsEndpoint iz task/browser.json; chromium.launch() ni na voljo.
Nedostopnih končnih testov ni mogoče preveriti. Pred daljšim preverjanjem
preverim čas; zadnja minuta faze je namenjena predaji.

## Izvedene spremembe

- `src/csv.ts`: čisti serializator; nespremenljiv vrstni red kolon, filter
  brez mutiranja, BOM, navedba vseh polj, CRLF in nevtralizacija formul.
- `src/CsvExport.tsx`: sedem checkboxov, dva izbirnika in lokalni prenos
  prek Blob URL. Onemogočen gumb in dodatno varovalo za prazne rezultate.
- `src/App.tsx`: stalna izvozna komponenta ob obeh pogledih z izvirnim
  poljem opravil. Obstoječi ključ projekta zagotavlja ponastavitev stanja.
- `src/styles.css`: dopolnilna prilagodljiva plošča kontrol v obstoječih
  barvah, tipografiji in obrobah; obstoječi gradniki ostajajo ohranjeni.
- `tests/agent/csv.spec.ts`: sedem lastnih testov S1–S7, vključno z natančnimi
  bajti, formulami in varnimi proti-primeri, 0/1/13 vrsticami, lokalnim
  prenosom, filtri, ponastavitvami, tipkovnico in širino 390 px.

Ob nastanku zgornjega izvedbenega zapisa preverjanja še niso bila izvedena;
končni dejanski rezultati so spodaj.
Okoljska omejitev: `git status --short` ne deluje, ker sistemski git kliče
manjkajoči xcrun v `/Library/Developer/CommandLineTools`. Git ni potreben
za izvedbo; vej in oddaljenih repozitorijev ne spreminjam.

## Končni rezultati preverjanja

`npm run check > docs/agent/check.log 2>&1` je končal z izhodno kodo **0**.
ESLint, TypeScript in produkcijska gradnja Vite so uspešni. Playwright:
**53 passed (21.7s)** — 38 osnovnih (API, namizje, mobilno), 8 razvojnih
P06 (štirje scenariji na obeh širinah) in 7 lastnih testov. Noben test ni
bil preskočen. Celoten dnevnik je [check.log](check.log), HTML poročilo
pa [playwright-report/html/index.html](../../playwright-report/html/index.html).
Prvi celotni zagon je uspel; popravljanje neuspešnih testov ni bilo potrebno.

Za ročni pregled je bil zagnan `WEB_PORT=5193 API_PORT=3123 npm run dev`.
Lastna skripta se je povezala prek `chromium.connect(wsEndpoint)` iz
`task/browser.json`, odprla projekt in shranila posnetke. Posnetki so bili
tudi dejansko vizualno pregledani:

- [desktop.png](desktop.png): 1440 × 960, preglednica in izvozne kontrole.
- [mobile.png](mobile.png): širina 390, preglednica z notranjim drsenjem.
- [mobile-board.png](mobile-board.png): širina 390, tabla z notranjim drsenjem.

Ohranjeni so Folio navigacija, sistemska pisava, barve, prikazi stanj,
razmik gradnikov in zaobljene površine. Kontrole se prelomijo v razpoložljivo
širino. Meritev `document.documentElement.scrollWidth > innerWidth` je
**false** v vseh treh ogledih; `pageerror` dogodkov je **0**.
Strojni zapis: [manual-check.json](manual-check.json). Dnevnik lokalnega
strežnika: [manual-server.log](manual-server.log).

## Sledljivost R01–R12

Veljajo predikati iz [predane specifikacije](specification.md). Dejanska
izvedba: `C = csvColumns.filter(c => selected.includes(c))`,
`V = tasks.filter(t => filter === 'all' || t.status === filter)`;
gumb je omogočen natanko pri `|C| > 0 ∧ |V| > 0`, komponenta pa obstaja
šele po uspešnem nalaganju opravil. Serializator pri praznem `C` ali `V`
vrne `null`, zato tudi handler ne sproži prenosa. Stanje je lokalno
komponenti: preklop pogleda ga ohrani; menjava ključa projekta ali osvežitev
ustvari privzeto stanje. Vsi spodnji testi so dejansko uspešno izvedeni v
navedenem celotnem zagonu; imena S… so v [csv.spec.ts](../../tests/agent/csv.spec.ts).

| Zahteva | Pogoj in izvedba | Izvedeni dokaz in izid |
| --- | --- | --- |
| R01 | `src/csv.ts:serializeCsv` bere izvirno zaporedje; `CsvExport` privzeto izbere vse kolone, `all`, `;`. `App` posreduje opravila trenutnega projekta. | S1/S2: 13 nesortiranih ID-jev in enaki naslovi, vse privzete kontrole; D01 na namizju/mobilno. Uspešno. |
| R02 | `csvColumns` določa nespremenljiv vrstni red glave in celic. | S1/S2 izbere description, id, title in preveri id, title, description; S4 preveri natančne bajte. D02. Uspešno. |
| R03 | `CsvExport:canExport`, disabled in `download` + `serializeCsv` varovalo. | S1/S2: prazni checkboxi, DOM click na disabled gumb brez prenosa, ponovni izbor in en prenos; S3: ponovni izbor ob praznem filtru ostane disabled. Uspešno. |
| R04 | Filter vpliva le na serializacijo in števec izvoza; preglednica, tabla in povzetek še dobijo vsa opravila. | S3: vsi štirje filtri z natančnimi vrsticami, nespremenjen seznam in povzetek; prazen projekt v obeh pogledih, manjkajoče stanje, enovrstični izvoz. S7: tabla ostane cela. Uspešno. |
| R05 | `serializeCsv` doda BOM; `CsvExport:download` uporabi lokalni Blob URL in ime projekta brez navigacije. | S1/S2: EF BB BF, ime, natanko en download, nespremenjen URL/število strani, nič novih omrežnih zahtev. S6: imeni obeh projektov. Uspešno. |
| R06 | `quote` navede vsako polje in podvoji vsak notranji narekovaj; podprti obe ločili. | S4: natančen CSV za obe ločili, prazne celice, notranji narekovaji, vejice in podpičja. D01–D03. Uspešno. |
| R07 | `records.join('\r\n')` in končni CRLF; vsebina celic ostane izvirna. | S4: natančni bajti s samostojnimi LF, CR in CRLF znotraj opisa. D01/D03. Uspešno. |
| R08 | `quoteValue` uporabi `/^[ \t\r\n]*[=+\-@]/` pred `quote` na vsaki podatkovni celici. | S5: vsi štirje začetki, mešan začetni whitespace, štiri besedilne kolone, projekt z začetnim vezajem, prazno/whitespace/abc=1/apostrof/NBSP/VT in kombinacija s citati. D03. Uspešno. |
| R09 | Polja `Task` se berejo neposredno, brez prikaznih pretvorb. | S4: šumniki, emoji, kombinirani Unicode, robni presledki, `in_progress`, prestopni datum `2028-02-29`; S5: varni proti-primeri ostanejo nespremenjeni. Uspešno. |
| R10 | `CsvExport` je stalni sorojenec pogleda v `ProjectView`. | S6: enak celoten prenos po Preglednica→Tabla→Preglednica z nestandardnimi nastavitvami; kontrole ostanejo enake. D04 na obeh širinah. Uspešno. |
| R11 | `ProjectView key={project.id}` ponastavi lokalni `useState`; handler bere trenutne nastavitve. | S6: zaporedne spremembe vsake nastavitve, projekta A→B→A, osvežitev v obeh pogledih in preverjanje vseh privzetih kontrol. Uspešno. |
| R12 | Brez zapisovalnih API klicev ali mutacij; obstoječi bralni prikazi in oznake ohranjeni; novi slogi se prelamljajo. | S4: zamrznjeno polje in objekt + primerjava po serializaciji; S1/S2/S3/S6/S7: brez zapisov; vseh 38 osnovnih testov; S7 tipkovnica, podrobnosti po ID, Escape, 390 px; vizualni pregled treh posnetkov. Uspešno. |

## Odstopanja, nepreverjeni deli in predaja

- Napake ali opustitve predane specifikacije niso bile zaznane. Nobena
  znana zahteva R01–R12 ni ostala neimplementirana. Specifikacija in njena
  zgodovina sta ostali nespremenjeni; ta dokument vsebuje dejanske izide.
- Nedostopni končni testi niso bili izvedeni. Preverjanje brskalnika je
  omejeno na nameščeni Chromium, vključno z mobilno emulacijo; drugih
  brskalnikov ali izvornih mobilnih naprav ni bilo v preverjanju.
- Sistemski dialog za preklic/shranjevanje prenosa ni bil ročno preverjen;
  preverjeni so dogodek prenosa, njegovo ime in prebrani bajti. Prenos ne
  spreminja aplikacijskega stanja.
- Slogovni pregled, tipi, gradnja, vsi dostopni testi in vizualni pregled
  so končani. Npm je izpisal opozorilo o okoljski nastavitvi `http-proxy`,
  Node pa o `NO_COLOR`/`FORCE_COLOR`; oba sta neblokirajoča, brez sprememb
  infrastrukture. Javnega interneta nisem uporabljal.
- Pregledovalec naj začne pri tem poročilu, `src/csv.ts` in `src/CsvExport.tsx`;
  dokazi in lastni testi so povezani zgoraj. Ni znanih odprtih napak.

Predaja je pripravljena več kot 60 sekund pred rokom implementacijske faze
2026-09-23T18:12:59.392Z; preostali čas je na voljo pregledovalcu.
