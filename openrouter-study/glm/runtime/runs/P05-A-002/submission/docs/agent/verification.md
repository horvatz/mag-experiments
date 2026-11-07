# Preverjanje P05

Datum: 2026-10-11

## Izvedena preverjanja

- `npm run typecheck`: uspešno; TypeScript brez napak.
- `npm run lint`: uspešno; ESLint brez opozoril.
- `npx playwright test --project=agent`: uspešno; 4 agentova preverjanja so bila uspešna.
- `npx playwright test --project=development-desktop --project=development-mobile`: uspešno; 8 razvojnih preverjanj P05 je bilo uspešnih.
- `npm run check`: uspešno; vključuje lint, typecheck, produkcijsko izgradnjo in 50 preverjanj. Končni izid je 50 passed.
- Prvi zagon `npm run check` je odkril 4 neuspešna izhodiščna preverjanja praznega projekta, ker je bil spremenjen natančen naslov praznega stanja. Naslov je bil popravljen na izhodiščno besedilo, prazen filter pa ima svoje sporočilo. Po popravku je bil celoten `npm run check` ponovno uspešen.

## Sledljivost zahtev

| Zahteva | Dejansko preverjanje | Rezultat |
| --- | --- | --- |
| R01 | A01 preveri začetne ID-je v izvornem redu. | Uspešno. |
| R02 | A01 preveri velikosti 2, 5 in 10 ter zadnji krajši strani. | Uspešno. |
| R03 | A01 preveri vse štiri gumbe, premike in onemogočene robne gumbe. | Uspešno. |
| R04 | A01 preveri reset na prvo stran ob spremembi velikosti in obnašanje `all`. | Uspešno. |
| R05 | A01 preveri filter pred straničenjem, vrstni red in reset strani. | Uspešno. |
| R06 | A01 preveri enake ID-je v preglednici in tabli ter števce stolpcev. | Uspešno. |
| R07 | A01 preveri preklop pogleda ter odpiranje in zapiranje podrobnosti. | Uspešno. |
| R08 | A03 in A04 preverita osvežitev ter menavo projekta; preverjena sta tudi prazni `localStorage` in URL brez stanja. | Uspešno. |
| R09 | A01 preveri natančni statusni besedili za prvo in zadnjo stran. | Uspešno. |
| R10 | A02 preveri prazen filter; A03 preveri prazen projekt. | Uspešno. |
| R11 | A01 preveri, da projektni pregled ostane nad celotnim poljem, števci stolpcev pa nad trenutno stranjo. | Uspešno. |
| R12 | A01 preveri odsotnost zapisov, podrobnost in širino 390 px; celoten `npm run check` preveri obstoječe regresije. | Uspešno. |

## Omejitve

- Končnih skritih preverjanj ni bilo na voljo; njihovih rezultatov ne navajam kot opravljenih.
- Sočasnih sprememb podatkov brez osvežitve in navigacije med nezaključenim nalaganjem nisem razširjal, ker to presega dogovorjeno območje obstoječih regresij.
