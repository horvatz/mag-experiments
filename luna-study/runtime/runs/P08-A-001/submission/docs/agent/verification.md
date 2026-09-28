# P08 — preverjanje izvedbe

## Izvedeni ukaz in rezultat

Končni zagon po zadnji spremembi kode in testov: `npm run check`.

- ESLint: uspešno.
- `tsc --noEmit` in Vite produkcijski build: uspešno.
- Playwright: **50/50 uspešno** z nameščenim lokalnim Chromiumom in lastnim testnim strežnikom.
- Struktura rezultatov: 14 API, 24 izhodiščnih namiznih/mobilnih, 8 razvojnih P08 namiznih/mobilnih in 4 lastni testi.

Zagon je opravil vse preverjanja; bilo je neškodljivih opozoril npm o okoljski nastavitvi `http-proxy` ter Node opozoril o `NO_COLOR`/`FORCE_COLOR`.

## Sledljivost zahtev

| Zahteva | Dejanski testni dokaz | Rezultat |
| --- | --- | --- |
| R01 | `D01: fixed anchor and overdue tasks` preveri začetni datum; `P08: view switch keeps local filter, project change and reload reset it` preveri začetni `all`, začetne ID-je, ponastavitev ob menjavi projekta in osvežitvi. | Uspešno. |
| R02 | `D04: done group, board and no writes`; `P08: calendar buckets include leap day and cross the year boundary` preveri opravilo `done-past` z rokom pred referenčnim datumom. | Uspešno. |
| R03 | `D01` preveri opravili pred datumom; lastni koledarski test izbere `today` in `overdue`. | Uspešno. |
| R04 | `D02: inclusive week boundary` preveri vključitev sedmega dne; lastni test loči `2024-03-05` (+7) od `2024-03-06` (+8) in leto 2025. | Uspešno. |
| R05 | Lastni koledarski test uporablja 29. februar 2024 ter prehod 28. 12. 2024 → 4./5. 1. 2025. | Uspešno v Chromiumu. |
| R06 | `D02` preveri števec skupine; lastni test preveri, da je števec `week` še vedno 2 ob aktivnem filtru `overdue`. | Uspešno. |
| R07 | `D01`/`D04` preverita filtre; lastni test preveri vrstni red ID-jev skupin `week`, `later`, `done` in vseh opravil ter uporabo istega filtra v tabeli in tabli. | Uspešno. |
| R08 | `D03: empty draft retains last valid classification`; `P08: blank date retains the last calculation and empty groups remain switchable` preverita prazno opozorilo, ohranjen preračun, spremembo filtra in odstranitev opozorila ob veljavnem datumu. | Uspešno. |
| R09 | `P08: view switch keeps local filter, project change and reload reset it` primerja ID-je, skupino in datum po preklopu; preveri tudi, da prazen osnutek in opozorilo ostaneta. | Uspešno. |
| R10 | Isti lastni test preveri ponastavitev projekta in reload; preveri tudi, da se filter ne pojavi v hash URL-ju ali `localStorage`. | Uspešno za preverjena dejanja. |
| R11 | Lastni test prazne skupine preveri zahtevano sporočilo in dosegljiv izbirnik; test praznega projekta preveri pet ničel. Izhodiščni testi preverijo prazno tabelo in tablo. | Uspešno. |
| R12 | Razvojni `D04` in lastni testi uporabijo preverjanje brez API zapisov. Izhodiščni testi preverijo bralne podrobnosti; mobilni izhodiščni/razvojni testi ter lastni preizkus pri 390 px preverijo, da stran nima vodoravnega preliva. | Uspešno v prednastavljenem Chromiumu. |

## Omejitve

- Preverjen je bil nameščeni Chromium; drugi brskalniki in ročni pregled z drugimi napravami niso bili izvedeni.
- Testni podatki za naloge izpolnjujejo pogodbo, da so datumi veljavni `YYYY-MM-DD`. Neveljavni datumi iz API-ja niso bili preizkušeni in niso del vhodne domene P08.
- Končni skriti oziroma nedostopni testi niso bili na voljo; uspeh se nanaša samo na naštete API, izhodiščne, razvojne in lastne teste.
- `git status` ni bil na voljo, ker sistemski `xcrun` kaže na neobstoječo namestitev Xcode Command Line Tools. Preverjanje kode in delovanja je bilo vseeno izvedeno z `npm run check`; pregled sprememb temelji na prebranih dovoljenih datotekah.
