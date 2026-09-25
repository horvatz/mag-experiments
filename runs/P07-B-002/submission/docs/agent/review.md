# Neodvisni pregled P07

Pregled R01–R12 je končan. Konkretnih neskladnosti v specifikaciji ali implementaciji nisem ugotovil; popravki niso zahtevani. Merodajna strukturirana predaja je `review.json`.

Prebral sem izvirna navodila, projektna pravila in predlogo ter primerjal `specification.md`, zgodovino specifikacije, produkcijsko kodo, razvojne in implementerjeve teste, `verification.md` ter končni dnevnik preverjanja. Začetni osnutek `review.json` je bil shranjen pred pregledom implementacije in dopolnjen ob obravnavi zahtev.

## Pregled zahtev

V spodnji tabeli so ugotovitve neodvisnega branja kode in testnih scenarijev. Navedeni obstoječi avtomatizirani testi so rezultat implementerjevega zagona, ne mojega ponovnega zagona.

| Zahteva | Neodvisno pregledan dokaz | Sklep |
| --- | --- | --- |
| R01 | `FavoriteButton.tsx` posreduje izključno ID in določa dostopno ime ter `aria-pressed`. V `App.tsx` in `TaskBoard.tsx` je gumb zunaj povezave. D01 in S05/S07/S10 obravnavajo enake naslove. | Brez neskladnosti. |
| R02 | `useFavorites.ts:commit` zapiše samo `{version:1,ids:[...ids].sort()}`; Set zagotovi enkratnost, privzeti sort vrstni red UTF-16. S02/S03 primerja celoten zapis. | Brez neskladnosti. |
| R03 | `decodeFavorites` ohrani vse veljavne nize in združi dvojnike. Prikaz nastaja samo iz podatkov API. S02/S03 preveri obnovo in neznane ID-je. | Brez neskladnosti. |
| R04 | Dekodiranje preveri objekt, številčno version 1, polje ids in vsak niz; izjeme ali neveljaven vhod vrnejo prazno množico. Inicializacija nima zapisa. S04 ima 11 primerov in nadzor zapisov. | Brez neskladnosti. |
| R05 | Lokalni filter začne s false; `tasks.filter` ohrani vrstni red API, tabla nadalje filtrira po stanju. D02 in S05/S07/S10 pokrijeta filtriranje in 14 opravil. | Brez neskladnosti. |
| R06 | Seznam je izpeljan iz trenutne množice. Prazno sporočilo je zunaj pogojnega prikaza preglednice/table; kontrole ostanejo prisotne. D02 in S06/S10/S12 vključujejo odstranitev ter 0/1 opravilo. | Brez neskladnosti. |
| R07 | `App` hrani skupno množico; isti ProjectView hrani filter pri menjavi pogleda. Povezave in nalaganje podrobnosti uporabljajo kodiran ID. S05/S07/S10 preveri oba pogleda in podrobnosti. | Brez neskladnosti. |
| R08 | `ProjectView key={project.id}` ponastavi lokalni filter pri menjavi projekta; hook ostane v App. Ob osvežitvi se množica prebere in filter začne s false. S08/S09 in S02/S03 preverita oba prehoda. | Brez neskladnosti. |
| R09 | Odstranitev dobi ID-je celotnega `tasks`, ne filtriranega seznama; izbriše samo te ID-je. Gumb je disabled pri projektnem števcu 0. S08/S09 preveri druge projekte in neznane ID-je. | Brez neskladnosti. |
| R10 | Status uporablja celoten `tasks` za X/M in zahtevano ime/besedilo. Tabla šteje `entries.length` iz vidnega seznama. S05/S07/S10 in S06/S10/S12 preverita tudi prazne stolpce. | Brez neskladnosti. |
| R11 | Poslušalec preveri pravi ključ, uporabi isto dekodiranje ter ne zapisuje. Branje in zapis lovita izjeme; opozorilo ima role=alert in besedo shramba. S11 pokrije dogodke in tri vrste izjem. Dodatno sem uspešno preveril naravne dogodke med pravima zavihkoma. | Brez neskladnosti. |
| R12 | Dejanja priljubljenih uporabljajo le množico ID-jev; ne kličejo zapisovalnega API in ne mutirajo opravil. UI ne uporablja testnih kontrol. Prebral sem navigacijo/nalaganje in sloge ter pregledal namizno preglednico in mobilno tablo iz predanih posnetkov glede na `docs/dizajn.md`. | Brez neskladnosti. |

Specifikacija vsebuje vseh dvanajst zahtev, predikate sprememb stanja, sprejemne pogoje, predlagane scenarije in omejitve. Njene oznake »ni izvedeno« jasno pripadajo specifikacijski fazi; `verification.md` jih dopolnjuje z implementerjevimi dejanskimi rezultati in sledljivostjo.

## Dejanska preverjanja in izvor rezultatov

- **Pregledovalec, neodvisno izvedeno:** lokalni strežnik `WEB_PORT=5193 API_PORT=3123 npm run dev`; skripta Node prek standardnega vhoda, `chromium.connect(wsEndpoint)` iz `task/browser.json`, dva prava zavihka istega konteksta, preglednica pri 1440 × 960 in tabla pri 390 × 844. Preizkus je uspešno preveril sinhronizacijo v obe smeri, odsotnost povratnih zapisov, dvojnike/neznane ID-je v vhodu, izpraznitev ob neveljavnem zapisu in odstranitvi ključa, ignoriranje drugega ključa in ohranitev aktivnega filtra. Proces je vrnil kodo 0 in rezultat PASS.
- **Pregledovalčeve meritve:** mobilna stran `scrollWidth=390`, `innerWidth=390`; zapisovalnih zahtev `/api/` je bilo 0 in dogodkov `pageerror` 0. Drugi zavihek je imel natanko en zapis iz lastnega klika; sprejeti dogodki niso dodali nobenega. Lokalni strežnik je po preverjanju ustavljen.
- **Implementerjev rezultat, preverjen z branjem dokaza:** `docs/agent/check-final.log` beleži uspešne ESLint, TypeScript in produkcijsko gradnjo ter 66/66 testov v 25,9 s (38 osnovnih, 8 razvojnih, 20 lastnih). Celotnega `npm run check` nisem ponovil, ker branje ni pokazalo konkretnega razloga za ponovitev že opravljenih testov.
- **Vizualni dokaz:** neposredno sem pregledal implementerjeva `desktop-table.png` in `mobile-board.png`; postavitev, barve, navigacija in nove kontrole sledijo dokumentiranemu Folio. Njegovih drugih posnetkov in celotnega ročnega postopka nisem neodvisno ponovil.

## Omejitve

Nedostopni končni testi niso bili izvedeni. Celotna regresijska zbirka, slog, tipi in gradnja so prevzeti iz preverjenega dnevnika implementerja. Neodvisni dinamični preizkus je omejen na zgoraj navedeni scenarij in širini; ne pomeni preverjanja vseh možnih podatkov ali okolij. Javni internet je blokiran, `chromium.launch()` v okolju ni podprt; uporabljen je dovoljen lokalni strežnik in obstoječi brskalniški wsEndpoint. Kode, specifikacije, testov, odvisnosti in infrastrukture nisem spreminjal.
