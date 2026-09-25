# P05 — dejansko preverjanje

Naloga izvedena samostojno po postopku A, 2026-09-25. Specifikacija je nastala
pred implementacijo. Spremembe aplikacije so omejene na `src/App.tsx`, novo
`src/TaskPagination.tsx` in dopolnitve `src/styles.css`; lastni testi so v
`tests/agent/pagination.spec.ts`. Strežnik, skupni tipi/testi, odvisnosti in
nastavitve niso bili spremenjeni. Uporabljene so bile samo lokalne storitve.

## Ukazi in rezultati

| Preverjanje | Dejanska izvedba | Rezultat in dokaz |
| --- | --- | --- |
| Prva regresija po implementaciji | `npm run check > docs/agent/check-initial.log 2>&1` | Izhod 0; lint, TypeScript, gradnja in 46 skupnih testov uspešnih (16,8 s za teste). [Dnevnik](check-initial.log) |
| Prvi zagon z lastnimi testi | `npm run check` z zapisom, ohranjenim kot `check-agent-initial.log` | Izhod 1; 55 uspešnih, 1 neuspešen (A04). Napačno pričakovani števec v testu, opis spodaj. [Dnevnik](check-agent-initial.log) |
| Končno preverjanje po popravku testa | `npm run check > docs/agent/check-final.log 2>&1` | Izhod 0; lint, TypeScript in produkcijska gradnja uspešni. **56/56 testov uspešnih**, 23,8 s za teste. [Dnevnik](check-final.log) |
| Lokalni vizualni pregled | `WEB_PORT=5193 API_PORT=3123 npm run dev`; Node/Playwright skripta prek `chromium.connect(wsEndpoint)` iz `task/browser.json` | Pregledani trije posnetki, brez napak JavaScripta; mere spodaj. [Zapis](manual-check.log) |
| Pregled kode | Pregled ProjectView, TaskPagination, CSS in iskanje `__test`, `localStorage`, `sessionStorage`, `updateTask` v `src/` | Nova funkcionalnost uporablja samo lokalni React state in izpeljana polja. Ni testnih kontrol/shrambe/zapisov. Obstoječi neuporabljeni `updateTask` v api.ts ostaja nespremenjen. |
| Povezave dokumentacije | Lokalna Node skripta je preverila obstoj datotečnih ciljev Markdown povezav v specification.md in verification.md | Izhod 0; 2 dokumenta, 0 manjkajočih datotek. |

Končnih 56 testov sestavlja 14 API-testov, 24 regresijskih testov izhodišča
(12 namizje + 12 mobilni), 8 razvojnih testov P05 (4 + 4) in 10 lastnih testov.
Opozorili okolja o `http-proxy` in `NO_COLOR` nista preprečili preverjanja.
Noben korak ni zahteval obhoda okoljskih omejitev ali nove odvisnosti.

## Lastni scenariji in povezave z zahtevami

Vsi spodnji scenariji so dejansko uspešno izvedeni v končnem zagonu; vir je
[`pagination.spec.ts`](../../tests/agent/pagination.spec.ts), dokaz z imenom
vsakega testa pa [končni dnevnik](check-final.log).

| Scenarij | Vhod in preverjeno delovanje | Zahteve |
| --- | --- | --- |
| A01 | 23 opravil, nesortirani ID-ji, podvojeni naslovi in Unicode/ločila kot besedilo; all/all, izvorni vrstni red, natančen status, disabled gumbi, nič zapisov | R01, R09, R12 |
| A02 × 3 | Celoten prehod 23 opravil pri velikostih 2, 5 in 10; primerjava vsake strani, združitev vseh ID-jev brez podvojitev/izgub, krajša zadnja stran, vsi štirje premiki, onemogočen click ne spremeni strani | R02, R03, R09, R12 |
| A03 | Menjava 2 → 5 → 10 → all z druge strani; vsak filter all/todo/in_progress/done vrne na prvo stran, pravilna prva/zadnja filtrirana stran in ohranjen vrstni red | R04, R05, R09 |
| A04 | Mešana druga stran v tabli in preglednici, števci posameznih stolpcev in nefiltriranega projekta, podrobnosti po ID-ju z Unicode in URL-ločili, Escape/fokus, zapiranje z gumbom in zgodovino, ohranitev filtra/velikosti/strani | R06, R07, R09, R11, R12 |
| A05 | Oba projekta prazna; vse velikosti, ničelni status, vsi premiki onemogočeni, trije prazni stolpci in ničelni pregled stanj | R03, R09, R10, R11 |
| A05b | En zapis in filter brez zadetkov; vse velikosti, prazen status, obnovitev prve strani po odstranitvi filtra, enostranski status in pravilni skupni/stolpčni števci | R03, R05, R09, R10, R11 |
| A06 | Nastavljen filter/velikost/druga stran; menjava projekta in vrnitev, nato osvežitev table; vedno all/all/prva, nastavitve ne spreminjajo URL-ja, localStorage ali sessionStorage | R08, R09 |
| A07 | Širina 390 px; Tab med označenima selectoma in veljavnim gumbom, viden fokus, Enter premakne stran; gumbi znotraj širine zaslona, drsenje znotraj table/preglednice; kontrolna dejanja ne sprožijo niti dodatnega GET na API, nič zapisov | R03, R06, R12 |

Skupni razvojni D01–D04 preverijo prve odseke, zadnjo stran/status, filter pred
tablo in ponastavitev velikosti brez zapisov na namizju in mobilnem prikazu.
Regresijski testi dodatno pokrijejo nalaganje, ponovni poskus ob napakah,
preklop projekta med nalaganjem, nepravilne lokacije, neposredne povezave,
osvežitev podrobnosti, tipkovnico in pravilno izbiro podvojenih naslovov po ID.
Sledljivost vsake zahteve do pogoja in kode je v
[specifikaciji](specification.md#izvedba-in-sledljivost).

## Odkrita napaka v lastnem testu in popravek

Prvi A04 je za 23 testnih zapisov pričakoval pregled stanj `[12, 5, 6]`.
Vhodni cikel `done, todo, in_progress, todo` dejansko vsebuje 11 pripravljenih,
6 v delu in 6 končanih opravil. Aplikacija je pokazala pravilno `[11, 6, 6]`.
Popravljena sta bila pričakovana porazdelitev in filtrirani total 12 → 11.
Aplikacijska koda zaradi tega ni bila spremenjena. Neuspešen zagon ostaja
ohranjen v [dnevniku](check-agent-initial.log), ponovni celotni zagon je uspel.

## Vizualni pregled

Skripta je na lokalnem strežniku odprla projekt, počakala na preglednico,
zajela namizje, preklopila širino na 390 px, izbrala velikost 2 in nato tablo.
Posnetki so bili tudi vizualno pregledani:

- [Namizna preglednica, 1440 × 960](desktop-table.png): ohranjena stranska
  navigacija, pregled stanj in nevtralne kontrole v slogu Folio.
- [Mobilna preglednica, 390 px](mobile-table.png): izbiri v eni vrstici,
  gumbi v dveh vrsticah, status čitljiv, vse kontrole znotraj zaslona.
- [Mobilna tabla, 390 px](mobile-board.png): isto stanje straničenja in
  notranje vodoravno drsenje stolpcev.

Izmerjeni `document.documentElement.scrollWidth` je bil 1440 pri namizju in
390 pri obeh mobilnih pogledih, enako širini okna. Zaznanih `pageerror` je bilo
0. Natančni rezultati so v [manual-check.log](manual-check.log).

## Omejitve in neizpolnjene zahteve

- Znanih neizpolnjenih zahtev R01–R12 ni.
- Nedostopni končni testi niso bili izvedeni in niso vključeni v navedeno število.
- Lastni testi uporabljajo nadzorovane javne GET-odgovore prek dovoljenega
  razvojnega pripomočka. Aplikacija ne uvaža tega pripomočka in bere samo API.
- Preverjen je nameščeni Chromium; drugi brskalniki in dejanski bralniki zaslona
  niso bili preizkušeni. Dostopna imena, nativna onemogočenost, status in
  tipkovnica so preverjeni v brskalniku.
- Preverjeni vzorci obsegajo 0, 1, 3, 8 in 23 opravil ter vse dovoljene izbire.
  Ne gre za izčrpen preizkus vseh možnih podatkov ali meritev zelo velikih polj.
- Nove sočasne spremembe podatkov brez osvežitve niso v obsegu zahteve;
  obstoječa regresija navigacije med nalaganjem je uspešna.
