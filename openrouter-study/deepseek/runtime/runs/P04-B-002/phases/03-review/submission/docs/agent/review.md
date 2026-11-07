# Poročilo pregledovalca P04 (postopek B)

Predmet: neodvisna primerjava `docs/agent/specification.md`, `src/`,
`tests/agent/`, `tests/development/` in `docs/agent/verification.md` z
zahtevami R01–R12 iz `task/instructions.md`. Pregledovalec ni spreminjal
kode ali specifikacije.

## Metoda

- Statični pregled vseh dvanajstih zahtev: pravila R01–R12, predikati
  P1–P11, koda (`src/sorting.ts`, `src/App.tsx`, `src/TaskBoard.tsx`,
  `src/styles.css`) in testi.
- Ročno izračunana pričakovana zaporedja za scenarije z izenačenimi ključi,
  `desc`, sekundarnim ključem in `original` (R04–R06) ter primerjava z
  izvedbo `sortTasks`.
- Samostojen ponovni zagon: `npx playwright test --project=development-desktop
  --project=development-mobile --project=agent` (22/22) in `npm run check`
  (slog, tipi, gradnja, 60/60 testov), izhod 0.
- Pregled sprememb po časih datotek: spremenjeni so le `src/App.tsx`,
  `src/sorting.ts` (nov), `src/styles.css`, `tests/agent/` in `docs/agent/`;
  strežnik, skupni tipi, skupni testi, odvisnosti in nastavitve ostajajo
  nespremenjeni.

## Rezultat

- Vse zahteve R01–R12 so v kodi zajete skladno s pravili; privzeti vrednosti,
  normalizacija NFD/UTF-16, vrstni red stanj in datumov, neodvisna smer
  sekundarnega ključa, izenačitev po izvornem indeksu, `original` ne glede na
  druge kontrole, fiksni stolpci table, ohranjanje nastavitev pri preklopu
  pogleda in podrobnostih, ponastavitev ob projektu/osvežitvi, gumb za izvorni
  vrstni red, projekcija brez zapisov ter enkratni ID-ji s pravimi
  podrobnostmi so preverjeni tudi z dejanskim zagonom testov.
- Konkretnih napak glede zahtev nisem našel; `specificationChangesRequired`
  in `codeChangesRequired` ostaneta `false`, `findings` je prazen.

## Omejitve preverjanja

- Končni (skriti) testi naloge niso dostopni; preverjeni so vsi dostopni
  testi (osnovni/API, razvojni D01–D04 na desktopu in mobilnem, lastni agentni).
- Ročni vizualni pregled v brskalniku ni bil izveden; videz in odzivnost pri
  390 pikslih sta preverjena avtomatsko (Playwright prek `chromium.connect`).
- Git v peskovniku ni dostopen (omejitev okolja), zato stanja commita nisem
  preverjal; obseg sprememb je ugotovljen iz vsebine in časov datotek.
- Razvojni primeri niso celoten obseg zahtev; domena končnih podatkov je
  dodatno preverjena z lastnimi podatki agentnih testov.
