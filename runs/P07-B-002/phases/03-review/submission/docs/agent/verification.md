# P07 – implementacija in preverjanje

**Končno stanje: implementacija in preverjanje končana; pripravljeno za pregledovalca.**

Začetni zapis implementerja, 25. 9. 2026. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specifikacija. Izvirne zahteve R01–R12 ostajajo obvezne. Specifikacije in pregledovalčevih datotek ne spreminjam.

## Načrt in trenutno stanje

- Implementirati globalno množico priljubljenih z validacijo, kanoničnim zapisom, dogodki storage in odpornostjo na nedostopno shrambo (R02–R04, R08, R11).
- Dodati ločene gumbe ob opravilih, projektni filter, odstranitev in števce v obeh pogledih; ohraniti Folio in navigacijo (R01, R05–R10, R12).
- Dodati smiselne teste vrzeli razvojnih testov v tests/agent/.
- Ob začetnem zapisu je bilo načrtovano in še neizvedeno: npm run check (slog, tipi, gradnja, vsi dostopni testi), dodatni testi shrambe in projektnih dejanj ter ogled pri 390 px. Vsa ta preverjanja so zdaj izvedena; rezultati sledijo.

## Rezultati

- Implementirano: `src/useFavorites.ts` (globalna množica, stroga validacija, UTF-16 zapis, dogodki storage, pomnilniško delovanje ob izjemah), `src/FavoriteButton.tsx` (ločen dostopen gumb), `src/App.tsx` (filter, števci, odstranitev projekta, opozorilo), `src/TaskBoard.tsx` (isto stanje in filter), `src/styles.css` (dopolnitve Folio).
- Prvi `npm run check`: uspešen, 46/46 testov (38 osnovnih in 8 razvojnih), slog, tipi in gradnja uspešni. Dokaz: `docs/agent/check-initial.log`.
- Dodanih je 20 testov v `tests/agent/favorites.spec.ts`: validacijska matrika, UTF-16 zapis, obnova, neznani ID-ji, 14 opravil, oba pogleda, projektno odstranjevanje, storage dogodki, tri vrste izjem ter 0/1 opravilo pri 390 px.
- Končni `npm run check`: **uspešen, izhodna koda 0**. ESLint, TypeScript in produkcijska gradnja uspešni; **66/66 testov uspešnih v 25,9 s** (38 osnovnih + 8 razvojnih + 20 lastnih). Dokaz: `docs/agent/check-final.log`; HTML poročilo: `playwright-report/html/index.html`. Ta zagon vključuje zadnjo spremembo dostopnega imena kartic in vse lastne teste. Po njem produkcijska koda in testi niso bili spreminjani.
- Povezava kartice uporablja neposredno dostopno ime namesto HTML ID-jev, sestavljenih iz ID-ja opravila: tako ostane pravilno dostopna tudi pri ID-jih s presledki in ločili.

## Sledljivost zahtev in dejanski dokazi

Oznake D01–D04 pomenijo skupne razvojne teste iz `tests/development/P07.spec.ts`, izvedene na namiznem in mobilnem projektu. Oznake S pomenijo dejanska imena novih testov v `tests/agent/favorites.spec.ts`. Vsi navedeni avtomatizirani testi so uspešni v končnem dnevniku `check-final.log`.

| Zahteva | Preverjeni pogoj | Koda | Test in izid |
| --- | --- | --- | --- |
| R01 | Preklop po ID, ločen gumb, aria-pressed, brez odpiranja podrobnosti | `FavoriteButton.tsx`; `App.tsx:59`; `TaskBoard.tsx:27` | D01, S05/S07/S10 in S06/S10/S12: uspešno, tudi tipkovnica in enaki naslovi. |
| R02 | Zapis samo `{version:1,ids:[...]}`, enkratni nizi, UTF-16 vrstni red | `useFavorites.ts:38` | S02/S03: uspešno, primerjava celotnega zapisa z ASCII, č, emoji in U+E000. |
| R03 | Deduplikacija, obnova, ohranitev neznanih brez izmišljenih opravil | `useFavorites.ts:5`, `:15`, `:38` | D03, S02/S03: uspešno; števec in seznam upoštevata le API opravila. |
| R04 | Neveljaven vhod pomeni prazno množico, ob nalaganju nič zapisov | `useFavorites.ts:5`, `:15` | 11 primerov S04: uspešno; prvotni surovi zapis ostane nespremenjen do uporabniškega dejanja. |
| R05 | Filter je privzeto false, ohrani vrstni red API | `App.tsx:15` | D02, S05/S07/S10 s 14 opravili: uspešno. |
| R06 | Takojšnja odstranitev, prazno sporočilo in dosegljive kontrole | `App.tsx:48`, `:53` | D02, S06/S10/S12 za 0 in 1 opravilo ter S11 ob izjemah: uspešno v obeh pogledih. |
| R07 | Enako stanje obeh pogledov, podrobnosti pravilnega ID-ja | `App.tsx:54`, `:70`; `TaskBoard.tsx:28` | D04, S05/S07/S10 in osnovni navigacijski testi: uspešno. |
| R08 | Globalna množica, projektni in po osvežitvi ponastavljeni filter | `App.tsx:75`, `:100`, `:15` | S08/S09 in S02/S03: uspešno. |
| R09 | Odstranitev vseh ID-jev trenutnega projekta, ohranitev drugih in neznanih | `App.tsx:51`; `useFavorites.ts:56` | S08/S09: uspešno pod aktivnim filtrom; S06/S10/S12 preveri disabled tudi pri praznem projektu. |
| R10 | Celoten projektni X/M, vidni števci stolpcev | `App.tsx:16`, `:50`; `TaskBoard.tsx:18` | S05/S07/S10, S08/S09, S11 in S06/S10/S12: uspešno, vključno z 0/0. |
| R11 | Dogodek zamenja množico brez zapisa; napake omogočajo nadaljnje delo | `useFavorites.ts:27`, `:38`; `App.tsx:96` | S11 storage in ločeni testi read/write/getter: uspešno; tuj ključ in null ključ ignorirana, prava null vrednost izprazni. |
| R12 | Brez zapisov API in mutacij, ohranjen Folio, navigacija in ozki prikaz | `App.tsx`, `TaskBoard.tsx`, `styles.css`; hook nima API klicev | D04, S08/S09 (primerjava celotnega strežniškega stanja), S06/S10/S12, vseh 38 osnovnih testov in ročni ogled: uspešno. |

Uporabljena pravila iz specifikacije ostajajo: vidni seznam je `T.filter(t => !q || F.has(t.id))`; projektno odstranjevanje je `F \ Iₚ`; število priljubljenih je `|F ∩ Iₚ|`. Zapis je samo v eksplicitnem lokalnem dejanju, nikoli v učinku inicializacije ali poslušalcu storage. Nobene napake ali izpuščene obvezne zahteve predane specifikacije nisem ugotovil.

## Vizualno preverjanje

Lokalni strežnik je bil zagnan z `WEB_PORT=5193 API_PORT=3123 npm run dev`; lastna skripta je prebrala `task/browser.json` in uporabila `chromium.connect(wsEndpoint)`. Pri 1440 × 960 in 390 × 844 sem zajel in pregledal oba pogleda z označenim opravilom. Ohranjeni so meni, barve, povzetek, tipografija in kartice Folio; nove kontrole se na ozkem zaslonu prelomijo. Preglednica in tabla se pomikata znotraj vsebine. V obeh mobilnih pogledih je `scrollWidth=390`, `innerWidth=390`; dogodkov `pageerror` je bilo 0.

Dokazi: `desktop-table.png`, `desktop-board.png`, `mobile-table.png`, `mobile-board.png` v `docs/agent/`; meritve so zapisane tudi v `manual-check.json`.

## Predaja pregledovalcu

Preglej spremembe v petih produkcijskih datotekah (`App.tsx`, `TaskBoard.tsx`, `styles.css`, novi `FavoriteButton.tsx` in `useFavorites.ts`) ter `tests/agent/favorites.spec.ts`. Specifikacija in njena zgodovina ostajata avtorjevi; pregledovalčevih dokumentov nisem ustvarjal ali spreminjal. Znane neizpolnjene zahteve: nobena. Vsi načrtovani dostopni pregledi so končani. Za ponovitev uporabi `npm run check`.

## Omejitve

Čas faze je omejen do 19:52:07 UTC; zadnja minuta je namenjena predaji. Infrastruktura, odvisnosti in skupni testi ostanejo samo brani. Javni internet je blokiran; Chromium je dostopen prek wsEndpoint iz task/browser.json, chromium.launch() ni podprt. Nedostopni končni testi niso izvedeni.

Sinhronizacija storage je preverjena z oddanimi brskalniškimi dogodki; ločen ročni preizkus dveh pravih zavihkov ni izveden. Vizualni pregled je omejen na navedeni širini. Opozorilo o napaki shrambe ostane prikazano do osvežitve; naloga trajanja opozorila ne predpisuje. Nepreverjenih delov ne predstavljam kot uspešne končne teste.

Ukaz `git status --short` ni deloval, ker sistemski git zahteva manjkajoči xcrun/CommandLineTools. Git ni potreben za implementacijo ali preverjanje; vej, oddaljenih repozitorijev in infrastrukture nisem spreminjal.
