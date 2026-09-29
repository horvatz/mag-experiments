# Preverjanje P09

## Izvedena preverjanja

Zadnji `npm run check` je uspešno zaključil `eslint`, `tsc --noEmit`, produkcijski `vite build` in vseh 54 Playwright preverjanj:

- 14 API testov (`tests/api.spec.ts`)
- 12 začetnih testov za namizje in 12 za telefon (`tests/baseline.spec.ts`)
- 4 razvojni testi za namizje in 4 za telefon (`tests/development/P09.spec.ts`)
- 8 lastnih agentnih testov za namizje (`tests/agent/P09.spec.ts`)

Ločen `npx playwright test --project=agent` je prav tako uspel z 8/8 testi. Agentni testi preverijo prvi podvojeni parameter in privzete vrednosti, nedotaknjen URL ob razčlenitvi, dobesedno normalizirano iskanje, stabilno razvrščanje, osnutek in potrditev, Nazaj/Naprej, kanonično kodiranje query parametrov, odstranitev neznanih parametrov, ponastavitev, navigacijo med pogledi/projekti ter zapiranje podrobnosti z gumbom in Escape.

Med pisanjem agentnih testov je prvi poskus imel eno neuspešno asercijo zaradi napačnega pričakovanja testa: kombinacija fraze »pregled« in stanja »končano« vrne `web-03`, ne `web-03` in `web-06`. Pričakovanje sem popravil; končni ločeni zagon je uspel 8/8, zadnji `npm run check` pa 54/54.

## Sledljivost zahtev

Podrobna tabela pogojev, datotek in posameznih testnih imen je v [specification.md](./specification.md#izvedba-in-sledljivost).

| Zahteve | Dejanski dokaz |
| --- | --- |
| R01, R04 | D01 in `query parsing uses first values, defaults invalid filters, and leaves the URL untouched`; neposredni URL se uporabi brez samodejnega prepisa. |
| R02, R03 | `literal normalized search and stable UTF-16 title ordering`; vsebuje diakritiko, frazo z belinami in enaka naslova pri sortiranju. D02 pokriva združitev statusa in iskanja. |
| R05, R06 | D02; `draft, commit, duplicate commit, and browser history restore applied values`; `commit trims and encodes the phrase, preserves board, and removes unknown parameters`. |
| R07 | D03 preveri osvežitev; agentni zgodovinski test preveri Nazaj/Naprej in osnutek. |
| R08 | `navigation discards draft, project links preserve board, and direct project URLs apply filters`; D03 preveri isti filtrirani rezultat ob preklopu pogleda. |
| R09 | Začetni testi podvojenih naslovov; `view and detail navigation keep committed filters…` preveri Escape; `detail close button returns to the filtered project path` preveri gumb. |
| R10 | Agentni projektni test preveri privzeti pregled ob kliku in filtriranje neposredne povezave drugega projekta. |
| R11 | D04 preveri prazen filtriran rezultat, ponastavitev in odsotnost zapisov; agentni reset test preveri `Prikazano: 0 od 0.` in ohranjen board. |
| R12 | Začetni namizni/mobilni testi, D04 brez zapisov in `npm run check`; produkcijska koda uporablja `useResource` za GET, v novih spremembah ni `localStorage` ali zapisovalnega API-ja. |

## Omejitve in opombe

- Testi uporabljajo lokalne Playwright fixture podatke in nameščeni Chromium; javni internet ni bil potreben. Preizkušeni so primeri z enakimi naslovi, več stanji, Unicode znaki, praznim projektom in praznim filtriranim rezultatom. Vseh mogočih velikosti seznama ter vseh Unicode kombinacij ni mogoče izčrpati.
- Git status/diff poskus ni deloval: okoljski `git` je javil `xcrun: error: invalid active developer path ... missing xcrun`. Izhodišče je po navodilih svež izvoz brez zgodovine; nadaljeval sem z dovoljenim testnim in build preverjanjem.
- Začetni poskus pisanja specifikacije prek shell here-doc ni uspel, ker shell ni mogel ustvariti začasne datoteke (`can't create temp file for here document: operation not permitted`). Dokument sem zapisal prek neposrednega patch orodja; vse zahtevane datoteke so bile ustvarjene.
- Končnih testov zunaj dosegljivega Playwright nabora nisem imel na voljo. Nobena znana zahteva R01–R12 ni ostala neizpolnjena.
