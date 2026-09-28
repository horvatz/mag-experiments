# P04 — preverjanje

## Izvedeni ukazi in rezultati

- `npm run check` — uspešno. ESLint in TypeScript sta zaključila brez napak, Vite je zgradil aplikacijo. Playwright: **50/50 uspešnih** (14 API, 12 desktop izhodiščnih, 12 mobilnih izhodiščnih, 4 razvojne desktop, 4 razvojne mobile in 4 lastni agentni testi).
- `npx playwright test --project=agent` — uspešno, **4/4** lastnih testov.
- Med razvojem je prvi `npm run check` ustavil tipizacijo zaradi zožitve `SortKey` v povratnem klicu primerjalnika; zožitev je popravljena. Naslednji zagon je odkril dve napaki v agentnem testu: primerjava pričakovanega vrstnega reda in ponovna uporaba istega URL-ja pri zamenjavi mock podatkov. Popravil sem pričakovanja ter test po menjavi podatkov ponovno naložil. Končni ciljni zagon in končni `npm run check` sta uspešna.

## Pokritost zahtev

| Zahteva | Izvedeno preverjanje in rezultat |
| --- | --- |
| R01 | Razvojni D01 preveri privzeto izvorno zaporedje; agentni test ponastavitve, menjave projekta in osvežitve preveri vse štiri privzete kontrole. Uspešno. |
| R02 | Razvojni D01 in agentni Unicode/numerični test preverita NFD, odstranitev naglasov, velike/male črke ter leksikografsko `A10`/`a2`; agentni test preveri tudi normalizacijo imen odgovornih. Uspešno. Primerjalnik uporablja `<` in `>` v `src/taskSorting.ts`. |
| R03 | Razvojni D02 ter agentni test statusov in datumov preverita vrstni red stanj in kronološko razvrstitev datumov. Uspešno. |
| R04 | Razvojni D02 ter agentna testa primarne padajoče smeri in izenačenih vrednosti preverita, da se obrne samo ključ, medtem ko vezi ostanejo stabilne. Uspešno. |
| R05 | Razvojni D02 ter agentni test status desc z naslovom oziroma odgovorno osebo desc preverita neodvisni smeri in uporabo sekundarnega ključa znotraj primarne skupine. Uspešno. |
| R06 | Agentni test preveri enake primarne/sekundarne vrednosti ter `original` skupaj z izbranim sekundarnim rokom desc. Uspešno, izvorni vrstni red ostane nedotaknjen. |
| R07 | Razvojni D03 in agentni test primerjata urejeno preglednico s tablo; agentni test potrdi stalne stolpce Pripravljeno, V delu, Končano in relativni vrstni red kartic. Uspešno. |
| R08 | Agentni test zamenja pogled in odpre/zapre podrobnosti med nastavljenimi vsemi štirimi kontrolami; njihove vrednosti in vrstni red ostaneta. Izhodiščni testi podpirajo podrobnosti in navigacijo table. Uspešno. |
| R09 | Agentni test nastavi vse štiri kontrole, zamenja projekt in nato osveži stran; obakrat preveri vse štiri privzete vrednosti. Stanje je v React komponenti. Uspešno. |
| R10 | Razvojni D04 in agentni test preverita gumb ponastavitve ter prazno in enojno polje. Uspešno. |
| R11 | Razvojni D04 in agentni `readonly` preverita odsotnost zapisov API; agentni test preveri tudi nespremenjene številke povzetka pred/po razvrščanju. Uspešno. |
| R12 | Izhodiščni testi preverijo podrobnosti po ID pri podvojenih naslovih, povezave v obeh pogledih in mobilni videz. Agentni test preveri podvojena naslova, ID-ja in širino 390 px brez vodoravnega razširjanja strani. Uspešno. |

Podrobna sledljivost kode in testov po posamezni zahtevi je v [specifikaciji](specification.md#izvedba-in-sledljivost). Lastni scenariji so v [sorting.spec.ts](../../tests/agent/sorting.spec.ts).

## Omejitve

- Končni oziroma skriti testi, ki niso del izvoženega projekta, niso bili dostopni. Razvojni P04 testi in vsi dostopni testi so bili vključeni v uspešni končni zagon `npm run check`.
- Integracijski testi zamenjajo odgovore javnega `/api/` z nadzorovanimi GET odgovori; produkcijski API ni bil ločeno preizkušen z novimi podatki.
- Klic `git status` ni uspel, ker okolje kaže na neobstoječo namestitev Command Line Tools (`xcrun` manjka). Preverjanje kode in testov s tem ni bilo prizadeto; oddaja je trenutno stanje dovoljenih datotek.
- npm je izpisal opozorilo o neznani konfiguraciji `http-proxy` in Node opozorila za `NO_COLOR`/`FORCE_COLOR`; ukaza sta se kljub temu uspešno zaključila.
