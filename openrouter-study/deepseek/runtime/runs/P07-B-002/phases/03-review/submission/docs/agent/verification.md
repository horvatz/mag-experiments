# Poročilo izvajalca – P07 (postopek B)

Avtor: agent-izvajalec. Vir zahtev: `docs/agent/specification.md` (R01–R12),
`task/instructions.md`, `PROJECT_RULES.md`. Specifikacije, njene zgodovine in
`docs/agent/review.*` nisem spreminjal. Status: zaključeno, predaja
pregledovalcu.

## Povzetek

Priljubljena opravila so v celoti lokalna funkcija: množica ID-jev v
`localStorage` (`folio:favorites:v1`) se prebere ob zagonu, shrani ob vsaki
spremembi, uskladi ob dogodku `storage` in ob izjemi shrambe pusti aplikacijo
uporabno z opozorilom `role=alert`. Oba pogleda uporabljata isto množico in
isti filter; števec je vedno za celoten projekt, števci stolpcev table pa
štejejo vidna opravila. Obstoječi videz Folio, nalaganje, navigacija in ozki
prikaz so ohranjeni.

## Spremembe

| Datoteka | Sprememba | Zahteve |
| --- | --- | --- |
| `src/favorites.ts` (nov) | `FAVORITES_KEY`, `parseFavorites`, `serializeFavorites`, `toggleFavorite`, `removeFavorites`, `useFavorites` (useSyncExternalStore, dogodek `storage`, stanje napake shrambe) | R02–R04, R08, R11 |
| `src/components.tsx` | `FavoriteButton` (aria-label, aria-pressed, zunaj povezave opravila) | R01 |
| `src/App.tsx` | filter, števec `Priljubljeno: X od M.`, odstranitev za projekt, opozorilo shrambe, prazno stanje, uporaba `visible` v preglednici | R01, R05, R06, R08–R12 |
| `src/TaskBoard.tsx` | gumbi na karticah (zunaj povezave), tabla prejme `visible` | R01, R07, R10 |
| `src/styles.css` | videz novih kontrol, notranje drsenje, brez prelivanja pri 390 px | R12 |
| `tests/agent/favorites.spec.ts` (nov) | 15 lastnih testov za R01–R12 | R01–R12 |
| `docs/agent/verification.md` | to poročilo | – |

## Načrtovana in dejansko izvedena preverjanja

| # | Ukaz | Obseg | Dejanski rezultat |
| --- | --- | --- | --- |
| P7 | `npx playwright test --project=development-desktop --project=development-mobile` | razvojni D01–D04, oba pogleda | 8/8 uspešnih (9,3 s) |
| P1–P6 | `npx playwright test --project=agent` | 15 lastnih testov (R01–R12) | 15/15 uspešnih |
| P8 | `npm run check` | `eslint` + `tsc` + `vite build` + vsi testi | uspešno, 61 uspešnih (22,8 s): 14 api, 24 baseline (desktop + mobile), 8 razvojnih, 15 lastnih |

Zapis rezultatov je v dnevniku zagona `npm run check` (seznam ✓ po projektih).
Neizvedenih preverjanj ne označujem kot uspešnih.

## Sledljivost zahtev

| Zahteva | Preverjanje | Izid |
| --- | --- | --- |
| R01 | lastni test »enaki naslovi ostanejo neodvisni …«; D01; D04 | ✓ gumba v obeh pogledih, `aria-pressed`, klik ne odpre dialoga |
| R02 | lastni test »zapis, privzeti filter …« (`{version:1, ids:['web-01','web-03']}`, po odstranitvi `ids:[]`); D03 | ✓ enkratni, naraščajoči po UTF-16 |
| R03 | lastni test »podvojeni in neznani ID-ji …« | ✓ `web-02` enkrat, `neznan-99` ohranjen in ne ustvari vrstice |
| R04 | 5 lastnih testov (manjkajoč ključ, neveljaven JSON, napačna `version`, manjkajoč `ids`, ne-niz) | ✓ prazna množica, shramba po nalaganju nespremenjena |
| R05 | lastni test R02/R05/R06; D02 | ✓ privzeto neoznačeno, vrstni red izvora |
| R06 | lastni test R02/R05/R06; D02 | ✓ takojšnja odstranitev, točno `Ni priljubljenih opravil.`, checkbox omogočen |
| R07 | lastni test R07; D04 | ✓ stanje v obe smeri, podrobnosti po ID-ju |
| R08 | lastni test R08 | ✓ menjava projekta in osvežitev ohranita `F`, filter `false` |
| R09 | lastni test R09 | ✓ odstrani samo ID-je projekta, tuji/neznani ostanejo, `disabled` pri `X=0` |
| R10 | lastni test R10 | ✓ `Priljubljeno: 2 od 8.` tudi ob filtru; števci stolpcev 1/0/1 za vidna |
| R11 | lastna testa (dogodek; izjema shrambe) | ✓ ključ uskladi brez povratnega zapisa, tuj ključ ignoriran, `null` izprazni; izjema → `alert` s »shramba«, aplikacija uporabna |
| R12 | lastni test R12; D04 (`readonly`); `tests/baseline.spec.ts` desktop + mobile | ✓ ni ne-GET `/api/`, `saveRequests=0`, 390 px brez prelivanja, podrobnosti dostopne |

## Omejitve in pojasnila

* Končnih sprejemnih testov P07 v repozitoriju ni; preverjanje temelji na
  razvojnih testih D01–D04, osnovnih testih in lastnih testih.
* Ločen ročni vizualni pregled ni bil izveden; videz in ozki prikaz sta
  preverjena avtomatsko (DOM, `scrollWidth`, baseline mobilni projekt).
* Dogodek `storage` se v istem dokumentu ne sproži sam; v testu je sprožen
  sintetično (`StorageEvent`).
* Pojasnilo izvedbe: opozorilo o nedostopni shrambi ostane vidno do osvežitve,
  tudi če kasnejši zapis uspe; specifikacija tega ne določa.
* Javni internet je blokiran; uporabljeni so izključno lokalni strežniki in
  nameščene odvisnosti. Napak v predani specifikaciji nisem našel.
* Aplikacija ne bere `/__test/` in ne uvaža pripomočkov razvojnih testov; vsi
  podatki tečejo prek javnega `/api/`.
