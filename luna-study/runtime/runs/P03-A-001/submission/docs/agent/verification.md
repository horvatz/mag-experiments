# P03 – preverjanje rešitve

Preverjanje je bilo izvedeno 27. 9. 2026 v lokalnem pilotnem okolju. Končni zagon je bil `npm run check` po zadnji spremembi kode in testov.

## Izvedeni ukazi in rezultat

| Ukaz oziroma nabor | Rezultat | Pokritost |
| --- | --- | --- |
| `npm run check` – `npm run lint` | Uspešno; ESLint brez napak. | Vsa koda in testi. |
| `npm run check` – `npm run build` (`tsc --noEmit`, Vite build) | Uspešno; typecheck in produkcijska gradnja končana. Vite je sestavil 1875 modulov. | Tipi in paket aplikacije. |
| `npm run check` – Playwright | **52 passed**, 0 failed. | 14 API testov; 12 namiznih in 12 mobilnih izhodiščnih testov; 4 razvojni P03 testi na vsaki velikosti (8); 6 agentnih testov. |

Razvojni testi `D01`–`D04` so opravili na `development-desktop` in `development-mobile`. Agentni testi `A01`–`A06` so opravili na projektu `agent`. Ključna scenarija: Unicode in dobesedno iskanje (`A01`), osebe ter menjava projekta/čiščenje (`A02`), brez zadetkov in osvežitev (`A03`), prazen projekt (`A04`), števci in širina 390 px (`A05`), seznam z 12 opravili in vrstni red (`A06`). Izhodiščni testi so potrdili obstoječo navigacijo, podrobnosti in prazno tablo na namizju ter mobilniku.

V dnevniku npm se je pojavil opozorilni zapis o neznani konfiguraciji `http-proxy`; ukaz se je kljub temu uspešno zaključil. Prvi zagon pred popravkom R10 je odkril regresijo prazne table, agentni test praznega projekta in napačno asinkrono trditev v agentnem testu širine. Implementacija je ohranila tri prazne stolpce, testa sta bila popravljena, nato pa je končni zagon s 52 testi uspel.

## Povezava zahtev s preverjanji

| Zahteve | Dokaz |
| --- | --- |
| R01–R03 | `D01` in `A01`: privzeti seznam/kontrole, ID, naslov, opis in oseba, NFD, male črke, vrstni red besed, dobesedna ločila, presledki in izvorni vrstni red. |
| R04 | `D02` in `A01`/`A02`: kombinirani filtri ter primerjava imena z veliko/malo začetnico. |
| R05, R07 | `A02`: različna imena iz celega projekta, tudi skrita z drugimi pogoji; po menjavi projekta so osebe in filtri iz novega projekta. |
| R06 | `D02` ter `A05`/`A06`: isti ID-ji med pogledoma, ohranitev filtrov, filtrirani povzetki in števci stolpcev. |
| R08 | `A03`: osvežitev vrne privzete kontrole in seznam; filter ni v URL-ju. |
| R09 | `D04`, `A01`, `A04`–`A06`: status `N od M`, števec 0/0, povzetek stanj in tabla. |
| R10 | `D03`, `A03`, `A04` ter izhodiščni test prazne table: sporočilo za nič zadetkov v obeh pogledih in prazna projektna stanja. |
| R11 | `D03` in `A02`: en ukaz ponastavi iskalni niz in oba filtra. |
| R12 | `D04` preveri brez zapisov in širino strani; `A05` preveri širino 390 px; izhodiščni namizni in mobilni testi preverijo navigacijo ter bralne podrobnosti. |

Natančna pravila, predikati in povezave do kode so v [specification.md](specification.md). Testno stanje `/__test/` so uporabili le obstoječi Playwright pripomočki; UI se nanj ne sklicuje.

## Omejitve preverjanja

- Končni oziroma skriti ocenjevalni testi niso bili dostopni in niso navedeni kot izvedeni.
- Agentni testi pokrivajo 12 zapisov, ponovljene naslove, več statusov ter zahtevane primere; niso izčrpen test vseh kombinacij poljubnih Unicode znakov in velikosti projektov.
- Preverjanje videza je avtomatizirano. Ločen ročni vizualni pregled v brskalniku ni bil izveden.
