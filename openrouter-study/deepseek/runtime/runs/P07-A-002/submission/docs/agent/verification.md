# P07 – poročilo o preverjanju

Datum: 2026-10-30. Izvedeno v tem okolju z nameščenim Chromiumom prek
`task/browser.json` (Playwright `connectOptions`), brez omrežja.

## Izvedeni ukazi in izidi

| Ukaz | Obseg | Izid |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` | uspešno (0 napak) |
| `npm run lint` | `eslint .` | uspešno (0 napak/opozoril) |
| `npx playwright test --project=development-desktop --project=development-mobile --project=agent` | 8 razvojnih + 18 agentnih | 26 passed |
| `npm run check` | lint + build + vsi testi (baseline 38, razvoj 8, agent 18) | 64 passed (25,1 s) |

Vsi testi tečejo v pravem Chromiumu; skupni strežnik na 5174/3102 in ločen
Chromium sta bila uporabljena prek konfiguracije projekta.

## Sledljivost zahtev do dokazov

| Zahteva | Dejansko preverjeno | Dokaz |
| --- | --- | --- |
| R01 | D01, A01: `aria-pressed` na gumbih v preglednici in na tabli, neodvisnost ID-jev, klik ne odpre pogovornega okna | 26/64 zelenih; A01 v `tests/agent/favorites.spec.ts` |
| R02 | A02: zapis `{version:1, ids:[...]}` z normalizacijo (dedupe + sort po UTF-16), le ključa `version`/`ids`; D03 | A02 + D03 |
| R03 | A03: seme z dvojniki in `unknown-9`; neznani ID ostane, neznano opravilo se ne prikaže; ob zapisu se ohrani | A03 |
| R04 | A04 (6 variant: manjka ključ, neveljaven JSON, napačna version, manjka ids, neniz v ids, ids ni seznam): prazna množica, shramba nespremenjena do prvega uporabniškega dejanja, aplikacija uporabna | 6× A04 |
| R05 | A05: privzeto neoznačeno, filter v izvornem vrstnem redu | A05 |
| R06 | D02, A06: odstranitev pod filtrom takoj, `Ni priljubljenih opravil.`, potrditveno polje ostane omogočeno | D02 + A06 |
| R07 | D04, A07: ista množica/filter v obeh pogledih, podrobnosti po ID-ju | D04 + A07 |
| R08 | A08: menjava projekta ohrani množico in ponastavi filter; osvežitev obnovi množico, filter neoznačen | A08 |
| R09 | A09: čiščenje odstrani le ID-je trenutnega projekta, ohrani `launch-01` in `unknown-7`; gumb onemogočen brez priljubljenih | A09 |
| R10 | A10: `Priljubljeno: 2 od 8.` tudi ob aktivnem filtru; števci stolpcev table štejejo vidna opravila (1/1/0) | A10 |
| R11 | A11: dogodek za pravi ključ uskladi, `null` izprazni, drug ključ ignoriran, 0 povratnih zapisov; A12: izjema shrambe → `role=alert` z "shramba" in delovanje v pomnilniku | A11 + A12 |
| R12 | D04 (`readonly`), A13: ni ne-GET zahtev in `saveRequests = 0`; pri širini 390 pik ni vodoravnega prelivanja | D04 + A13 |

## Odkrite in odpravljene težave med preverjanjem

1. A07 je sprva pričakoval napačen vrstni red na tabli (stolpci združujejo po
   stanju); popravljen je bil test, ne koda.
2. A11 je pokazal dvojni zapis v shrambo na en klik (React v razvojnem načinu
   dvojno izvede posodabljalnik `useState`). `src/favorites.ts` zdaj hrani
   zadnje stanje v `useRef` in zapiše enkrat na dejanje; po popravku A11
   pričakuje in dobi 1 zapis. Zapis v zgodovini specifikacije (v1.2).

## Omejitve

- Skriti končni testi naloge niso dostopni; zgoraj so navedena le resnično
  izvedena preverjanja.
- Dogodek `storage` v istem dokumentu brskalnik ne sproži sam, zato je bil v
  A11 sprožen ročno z `StorageEvent`, enako kot bi prišel iz drugega zavihka.
- Izjema shrambe je simulirana z nedosegljivim `window.localStorage`; prave
  kvote/izpad diska niso bili preverjeni.
- Vizualni pregled z `WEB_PORT=5193 API_PORT=3123 npm run dev` ni bil izveden;
  postavitev je preverjena v Chromiumu pri 1440×960, iPhone 13 in 390×844.
