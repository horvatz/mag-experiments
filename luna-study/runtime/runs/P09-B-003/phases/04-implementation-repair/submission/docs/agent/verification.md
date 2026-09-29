# Implementacija in preverjanje P09

Začetni zapis izvajalca. Spodaj je trenutni načrt; izidi bodo dodani šele po dejanskih zagonih.

## Načrt preverjanj

- Pregledati obstoječo navigacijo, prikaz opravil in razvojne primere D01–D04.
- Izvesti ciljne razvojne teste `npx playwright test --project=development-desktop --project=development-mobile` in jih dopolniti z lastnimi scenariji za URL/zgodovino, dobesedno iskanje, stabilno razvrščanje ter ponastavitev.
- Pred zaključnim preverjanjem preveriti čas; nato izvesti `npm run check` (slog, tipi, gradnja ter dostopni osnovni, razvojni in lastni testi).
- Zabeležiti vsak dejanski izid, neizveden scenarij in okoljsko omejitev ter povezati R01–R12 s spremembami in dokazi.

## Začetno stanje

- Specifikacija R01–R12 je prebrana; preverjanja še niso izvedena.
- Faza izvajalca se je začela z več kot 10 minutami; predaja mora biti zaključena vsaj 60 sekund pred rokom.

## Nadaljevana seja po pregledu

- Pregled `review.json` je podal eno utemeljeno ugotovitev za R11: prazen projekt z aktivnimi filtri je kazal začetno sporočilo. V `src/App.tsx` sem pogoj popravil tako, da `Ni zadetkov.` velja tudi pri M=0, kadar je q/status/order neprivzet; prazen projekt pri privzetem pogledu še vedno ohrani obstoječe sporočilo.
- Dodan je lasten Playwright primer za neposredni aktivni filter nad praznim projektom in ponastavitev.
- Preverjanja popravka še niso zagnana. `npm run check` v prvi seji je ustavil na lint napaki za odvisnost učinka; popravil sem odvisnost, vendar ponovni celotni zagon ni vrnil rezultata pred prekinitvijo seje.
- Omejitve okolja: javni internet je blokiran; lokalni testi uporabljajo nameščeni Chromium prek `task/browser.json`. Končni testi niso dostopni.
