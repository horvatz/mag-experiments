# P01 – Implementacija in preverjanje

Začetni zapis implementerja, 2026-09-20. Prebrani so `PROJECT_RULES.md`, `task/instructions.md`, predloga in predana specifikacija 1.0. Izvirne zahteve R01–R10 ostajajo merilo; za zdaj ni ugotovljenega odstopanja specifikacije.

## Načrt ob začetku (takrat še neizvedeno)

- Pregled obstoječega vmesnika in dizajna Folio ter implementacija ločenega osnutka naslova/stanja v podrobnostih (R01–R10).
- Lastni testi v `tests/agent/`: normalizacija natančno štirih robnih belih znakov, zavrnitev in ponovitev, čakanje in ena zahteva, identiteta/izolacija, vsi prehodi stanj in uskladitev prikazov.
- `npm run check`: slog, tipi, gradnja, osnovni, razvojni in lastni testi; za zdaj ni zagnano.
- Ročni pogled na širokem in ozkem zaslonu z obstoječim Chromium prek `task/browser.json`; za zdaj ni izvedeno.
- Dopolnitev sledljivosti R01–R10, dejanskih rezultatov, omejitev in predaje vsaj minuto pred rokom faze 13:23:22.943 UTC.

## Meje in okolje

Spreminjam samo `src/`, `tests/agent/` in svoje zapise. Specifikacija, njena zgodovina, pregled, skupni testi, strežnik, odvisnosti in infrastruktura so samo berljivi. Dovoljene so le lokalne storitve naloge; javni internet je blokiran. Chromium je treba povezati s `chromium.connect(wsEndpoint)`; `chromium.launch()` ni podprt. Testne kontrole uporablja samo testni program. Drugih agentov ne zaganjam.

## Izvedene spremembe

- `src/TaskDetails.tsx`: obrazec `TaskEditor`, inicializiran iz shranjenega opravila po id; ločeni osnutek, validacijska napaka, napaka shranjevanja in stanje čakanja. Normalizacija uporablja `/^[ \t\r\n]+|[ \t\r\n]+$/g`, brez `trim()`. Polje Naslov je `textarea`, zato je mogoče vnesti tudi prelome vrstic; Stanje je HTML `select` s tremi dovoljenimi možnostmi. Napake in čakanje imajo zahtevane ARIA povezave/vloge. Sinhrona zaščita `pending` prepreči sočasne oddaje. Preklic odstrani komponento obrazca in s tem njen osnutek in napake. Fokus se ob odprtju prenese na Naslov, ob zaključku pa na Uredi.
- `src/useResource.ts`: `updateData` omogoča zamenjavo trenutno naloženih podatkov z odgovorom strežnika; preveri ključ vira.
- `src/App.tsx`: uspešen odgovor zamenja samo opravilo z ustreznim id v seznamu. Če seznam še ni naložen, sproži ponovno branje. Tabla in števci ostanejo izpeljani iz seznama; podrobnosti se posodobijo z istim potrjenim odgovorom. Pred uspehom ni optimističnih sprememb.
- `src/styles.css`: lokalni slogi obrazca uporabljajo obstoječe barve, gumbe, razmike, robove in fokus Folio. Obstoječa postavitev, oznake vrstic/kartic in poimenovanja table ostanejo ohranjeni.
- `tests/agent/editing.spec.ts`: pet dodatnih funkcionalnih testov (A02 se izvede za preglednico in tablo). `tests/agent/visual-inspection.mjs`: ponovljiv zajem vizualnih dokazov prek nameščenega brskalnika.

## Dejanski rezultati in dokazi

`npm run check` se je končal z izhodno kodo 0. ESLint, TypeScript in produkcijska gradnja so uspešni. Playwright: **51 uspešnih testov v 21,8 s** – 38 osnovnih (14 API, 12 desktop, 12 mobile), 8 razvojnih P01 in 5 lastnih. Celotni dnevnik: [check.log](check.log); HTML poročilo: [Playwright](../../playwright-report/html/index.html). Noben test ni bil preskočen ali popravljen po neuspehu; prvi celotni zagon je uspel. Samostojni ukaz samo za razvojne teste ni bil potreben, saj je vseh osem izvedel celotni pregled.

| Zahteva | Dejanska koda / pravilo | Izvedeni dokaz | Izid |
| --- | --- | --- | --- |
| R01 | `TaskDetails` in `TaskEditor`: nalaganje po id, začetno lokalno stanje iz Task | D01 desktop/mobile; A03 preveri ponovno urejanje in istoimenski opravili `web-01` ter `launch-01` | Uspešno |
| R02 | Osnutek samo v `TaskEditor`; `updateData` se kliče šele po uspešnem PATCH | D03; A02 table/board primerja vse strežniške zapise, seznam/kartico in števce pred oddajo in med zadržanjem | Uspešno |
| R03 | `normalizeTitle`, validacija in povezana napaka ob polju | D04 desktop/mobile; A01: prazen in bel naslov brez PATCH, umik napake, dejanski payload brez predpisanih robov, ohranjen NBSP (tudi samostojen), U+2003 in notranji presledki/tabulator/prelom | Uspešno |
| R04 | `TaskEditor`: select, tri vrednosti `TaskStatus` | A03: vse oznake in šest prehodov todo→in_progress→done→todo→done→in_progress→todo; A01 ohrani stanje ob spremembi samo naslova | Uspešno |
| R05 | En `updateTask(id, { title, status })`; oba vira dobita odgovor | D02 desktop/mobile; A02 preveri podrobnosti, seznam, tablo, stolpec, števce in osvežitev; A03 po šestih shranjevanjih preveri podatke in osvežene podrobnosti | Uspešno |
| R06 | Preklic odmontira obrazec brez zahteve | D03; A04 prekliče navaden osnutek, validacijsko napako in zavrnjen poskus; ponovno odprtje brez ostankov, število zahtev nespremenjeno | Uspešno |
| R07 | Payload vsebuje samo naslov/stanje; seznam se zamenja po id | A02 in A03 primerjata celoten seznam vseh projektov z dovoljenima spremembama samo `web-02`, vključno z vsemi nespremenjenimi polji; osnovni API-test izolacije | Uspešno |
| R08 | `catch` ohrani osnutek in prikaže napako, `finally` omogoči urejanje | A02 table/board: zadržana zavrnitev, nespremenjeni zapisi, ohranjen vnos, ponovno uspešno shranjevanje in umik sporočila | Uspešno |
| R09 | Ref `pending`, disabled na obeh poljih in gumbih, `role="status"` | A02 table/board: pet sinhronih oddaj ustvari eno zahtevo; vsi štirje kontrolniki so disabled; po zavrnitvi enabled; status viden med čakanjem | Uspešno |
| R10 | Ključi projekta/opravila; nov obrazec za vsako urejanje | A03 in A04: po uspehu/preklicu menjava pogleda in projekta ter drugo istoimensko opravilo brez starega vnosa/napak; osnovni testi navigacije desktop/mobile | Uspešno |

Vizualni zajem je uporabil ločen lokalni strežnik `WEB_PORT=5193 API_PORT=3123 npm run dev` in `chromium.connect(wsEndpoint)` iz `task/browser.json`. Skripta je uspešno zajela običajen obrazec in validacijsko napako pri 1440×960 ter 390×844. Ročno sta bila pregledana [široki obrazec](editing-1440.png) in [ozka validacija](validation-390.png): postavitev in barve Folio so ohranjene, polji in gumba so čitljivi, napaka stoji ob polju in fokus je viden. Dodatna posnetka: [ozki obrazec](editing-390.png), [široka validacija](validation-1440.png). [visual-check.json](visual-check.json) potrjuje enako `scrollWidth` in `clientWidth` dialoga pri obeh širinah, začetni fokus na Naslov, vrnitev fokusa na Uredi po preklicu ter nič napak `pageerror`. To ni avtomatska primerjava pik s prvotnimi posnetki.

Po zajemu je skripta shranjena v `tests/agent/visual-inspection.mjs`; dodatni `npx eslint tests/agent/visual-inspection.mjs` je uspešen (izhod 0). Ročni strežnik na 5193/3123 je ustavljen. Testni strežnik se je ustavil ob zaključku Playwright. Zadnja meritev časa pred predajo: 186 sekund do roka implementacije in 546 sekund do skupne omejitve.

## Omejitve in predaja

- Ni ugotovljenih napak predane specifikacije, znanih neizpolnjenih zahtev ali neuspešnih preverjanj aplikacije. Izid se nanaša na zgoraj navedene izvedene scenarije, ne na nedostopne končne teste.
- Brskalnik je Chromium; drugi pogoni in resnična mobilna naprava niso bili preverjeni. Osnovni/razvojni mobilni testi uporabljajo nameščeno emulacijo iPhone 13, lastni A02 board širino 390 pik.
- Git pregled (`git diff --stat` / `git status --short`) je blokiran zaradi manjkajočega `/Library/Developer/CommandLineTools/usr/bin/xcrun`. To ni napaka aplikacije. Veje, commiti, push ali PR niso bili ustvarjeni. Tuja projektna dokumentacija in infrastruktura nista bili spreminjani.
- Npm opozarja na okoljsko nastavitev `http-proxy`, zagon testov pa na hkratni `NO_COLOR`/`FORCE_COLOR`; to ni preprečilo nobenega pregleda. Javni internet ni bil uporabljen.
- Trajnost je preverjena z osvežitvijo strani v isti strežniški seji; ponovni zagon strežnika po dogovoru ponastavi začetne podatke. Navigacija med odprtim urejanjem in dodatni načini zapiranja urejanja niso predmet naloge.
- Pregledovalec lahko uporabi sledljivost zgoraj, dnevnik in lastne teste. Implementacija je pripravljena za pregled; dokument je zaključen več kot minuto pred rokom faze.
