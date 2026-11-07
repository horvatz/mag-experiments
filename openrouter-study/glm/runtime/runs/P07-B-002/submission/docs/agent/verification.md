# Implementerjevo poročilo o preverjanju

## Načrtovana preverjanja

- [x] Pregled obstoječega vmesnika, API-ja, razvojnih testov P07 in dostopnih imen.
- [x] Izvedba lastnih testov za vse zahteve R01–R12, ki jih razvojni testi ne pokrivajo.
- [x] Zagon razvojnih testov P07.
- [x] Zagon celotnega `npm run check`.
- [x] Preverjanje ozke širine 390 px z lastno Playwright projekto in obstoječe Folio navigacije s skupnimi testi.
- [x] Posodobitev sledljivosti zahtev in zapis dejanskih rezultatov.

## Stanje

- Specifikacija je prebrana. Dodan je `src/useFavorites.ts` za branje, validacijo, urejanje, pisanje in poslušanje `folio:favorites:v1`.
- `src/App.tsx` zdaj skupno uporablja stanje priljubljenih, filter, števec in odstranjevanje ID-jev trenutnega projekta; `src/TaskBoard.tsx` in preglednica dobita enake kontrole.
- `src/styles.css` vsebuje slogovne dopolnitve v obstoječem Folio jeziku.
- Popravljen je rojni vzrok validacije: niz, ki v `ids` vsebuje nestruno vrednost, se obravnava kot neveljaven in ne kot delno veljaven.
- Neveljaven JSON zdaj pomeni prazno začetno množico brez lažnega opozorila o nedostopni shrambi; opozorilo se rezerva za dejansko izjemo pri branju ali pisanju.
- Tabla in preglednica uporabljata isti filter in množico; prazen filtriran seznam pokaže `Ni priljubljenih opravil.` v obeh pogledih.

## Sledljivost zahtev

- R01: gubi po ID so ločeni v preglednici in na tabli; klik ne odpre podrobnosti.
- R02: zapis je vedno `{version:1,ids:[...]}` z enkratnimi nizi v UTF-16 vrstnem redu.
- R03: podvojene ID-je preberemo kot enega, neznani ID-ji ostanejo globalno, ne ustvarijo prikaza.
- R04: manjkajoč ključ, neveljaven JSON, napačna verzija, manjkajoči `ids` in nestruni elementi pomenijo prazno množico brez povratnega zapisa.
- R05/R06: filter je privzeto izklopljen, omeji trenutni projekt in takoj odstrani odprte priljubljene.
- R07/R08: pogled in projekt ohranita globalno množico; filter se ponastavi ob zamenjavi projekta in osvežitvi.
- R09: odstranjevanje pobriše samo ID-je opravil trenutnega projekta.
- R10: status šteje celoten trenutni projekt, števci stolpcev pa vidna opravila.
- R11: `storage` dogodki se validirajo in ne pišejo nazaj; izjema shrambe pokaže opozorilo, stanje ostane v pomnilniku.
- R12: ni API zapisov, sprememba ne dotika polj opravil, obstoječa navigacija in ozki prikaz ostanejo.
- Okoljske omejitve: internet je blokiran, Chromium je nameščen, testni strežnik uporablja `5174/3102`, `chromium.launch()` ni na voljo, za Playwrightovo povezavo je treba uporabiti `wsEndpoint` iz `task/browser.json`.

## Spremembe

- Dodani so lastni Playwright testi v `tests/agent/favorites.spec.ts`.

## Rezultati

- `npm run typecheck`: uspešno.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešno.
- `npx playwright test --project=agent`: 7/7 uspešno po popravkih.
- `npm run check`: uspešno; slog, tipi, gradnja in 53/53 testov.

## Omejitve

- Javni internet ni bil na voljo in ni bil potreben; uporabljena sta samo lokalna testna strežnika na `5174/3102`.
- `chromium.launch()` v tem okolju ni na voljo; Playwright se povezuje z `wsEndpoint` iz `task/browser.json`.
- Ročni dev ogled ni bil izveden; ozko prikazovanje na 390 px in navigacijo pokrivajo avtomatizirani testi.
- Napake v specifikaciji niso bile ugotovljene. Vse zahteve R01–R12 so izvedene in preverjene.
