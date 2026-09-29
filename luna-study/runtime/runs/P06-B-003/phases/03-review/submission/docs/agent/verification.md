# Implementacija in preverjanje

## Začetni načrt

- Prebrati projektna pravila, izvorne zahteve in predano specifikacijo.
- Pregledati obstoječo implementacijo ter določiti najmanjše potrebne spremembe v `src/`.
- Dodati usmerjene lastne teste v `tests/agent/`, če jih zahteve potrebujejo.
- Zagnati zahtevana preverjanja (`npm run check` in po potrebi P06 razvojne teste); rezultate in omejitve zapisati spodaj.

## Preverjanja

- Začetno preverjanje časa: 564 sekund faze in 923 sekund skupnega časa (po `node task/time-budget.mjs`; 2026-09-27).
- `git status --short`: ni deloval, ker `xcrun` ne najde `/Library/Developer/CommandLineTools`; sprememb Gita zato ni bilo mogoče pregledati.
- `npm run check`: uspeh, 2026-09-27 (končni zagon po dopolnitvi testa). ESLint uspešen; `tsc --noEmit` uspešen; Vite produkcijska gradnja uspešna; Playwright: vseh 49 testov uspešnih v 18,7 s.
- Vključenih je bilo 38 osnovnih/API testov, 8 P06 razvojnih testov (D01–D04 na namizju in mobilnem projektu) ter 3 lastni testi.

## Spremembe in povezava z zahtevami

- `src/CsvExport.tsx`: lokalno stanje za kolone/ločilo/filter, kanonična serializacija CSV, formula nevtralizacija in prenos z BOM. Pokriva R01–R11.
- `src/App.tsx`: kontrola je znotraj projektnega pogleda in prejme vsa opravila trenutnega projekta; ohrani se celoten prikaz. Ključ projekta ponastavi stanje. Pokriva R01, R03, R04, R10–R12.
- `src/styles.css`: kontrolam dodan slog v obstoječem Folio videzu in prelom za ozke zaslone. Pokriva R12.
- `tests/agent/P06.spec.ts`: scenarija za R03/R04 in ponastavitev ob menjavi projekta (R11).

## Zahteve, preverjanje in izidi

| Zahteva | Koda | Dejanski scenarij in izid |
| --- | --- | --- |
| R01 | `src/CsvExport.tsx` | D01 preveri privzete nastavitve, glavo in zaključni CRLF; D02 preveri vrstni red filtriranih fixture opravil; uspešno v obeh razvojnih projektih. |
| R02 | `src/CsvExport.tsx` | D01 preveri vrstni red polne glave; D02 preveri izbrano kolono; uspešno namizno in mobilno. Serializator uporablja stalni vrstni red `columns`. |
| R03 | `src/CsvExport.tsx` | Lastni test izprazni izbor, preveri onemogočen gumb ter nato ponovni izvoz po izbiri; uspešno. |
| R04 | `src/CsvExport.tsx`, `src/App.tsx` | D02 preveri statusni filter; lastni test preveri prazen filtrirani rezultat in da opravilo ostane v prikazu; uspešno. |
| R05 | `src/CsvExport.tsx` | D01 preveri ime in U+FEFF na začetku prenosa; D04 in pomožni `readonly` preverita odsotnost zapisovalnih zahtev. Uspešno. |
| R06 | `src/CsvExport.tsx` | D02 preveri obe ločili; D03 preveri citiranje in podvojene notranje narekovaje; uspešno v obeh razvojnih projektih. |
| R07 | `src/CsvExport.tsx` | D01 preveri zaključni CRLF; D03 in lastni test preverita LF/CRLF znotraj citirane celice; uspešno. |
| R08 | `src/CsvExport.tsx` | D03 preveri `=`; lastni test preveri `=`, `+`, `-`, `@` z začetnimi presledki/tabulatorjem/CR/LF; uspešno. |
| R09 | `src/CsvExport.tsx` | D03 preveri Unicode in vsebino opisa; CSV neposredno uporablja izvirna polja `Task`, vključno z interno vrednostjo statusa in datumskim nizom. Uspešno v obeh razvojnih projektih. |
| R10 | `src/CsvExport.tsx`, `src/App.tsx` | D04 spremeni pogled in primerja prenose bajt za bajtom; uspešno namizno in mobilno. |
| R11 | `src/App.tsx`, `src/CsvExport.tsx` | Lastni test zamenja projekt in preveri vseh sedem kolumn, `;`, `all` ter ime datoteke; uspešno. |
| R12 | `src/CsvExport.tsx`, `src/App.tsx`, `src/styles.css` | D04 preveri, da ni zapisov na API in da stran pri mobilni širini ne preseže zaslona; osnovni namizni/mobilni testi ostanejo uspešni. Izvoz samo bere opravila. |

Specifikacijske napake med implementacijo nisem zaznal. Izvedeni scenariji preverijo podane fixture podatke in pomembne robne pogoje. Ne preverijo vsake kombinacije formul v vseh sedmih stolpcih ali vsakega možnega števila opravil; podatki tipa status, projectId in dueDate v testih ostanejo v veljavni domeni.

## Omejitve okolja

- Okolje prijavlja manjkajoč Xcode Command Line Tools (`xcrun`); `git status --short` zato ni uspel in delovnega drevesa/veje ni bilo mogoče preveriti. Browser testi so delovali prek nastavljenega `chromium.connect(wsEndpoint)`.
- NPM je ob izvajanju opozoril na neznano konfiguracijo `http-proxy`; opozorilo ni preprečilo preverjanj. Javnega interneta nisem uporabljal.
