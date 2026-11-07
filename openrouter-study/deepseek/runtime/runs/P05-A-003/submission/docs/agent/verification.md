# Preverjanje P05

Datum izvedbe: 2026-10-30. Vsi spodnji ukazi so bili dejansko izvedeni v tem okolju.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run check` | eslint, tsc, vite build, vsi Playwright projekti | Uspešno: lint brez napak, typecheck brez napak, build uspešen, **57/57 testov uspešnih** (38 izhodišče + 8 razvojni P05 + 11 lastni) |
| `npx playwright test --project=development-desktop --project=development-mobile` | razvojni testi P05 | 8/8 uspešnih (D01–D04 na desktopu in mobilnem profilu) |
| `npx playwright test --project=agent` | lastni testi | 11/11 uspešnih (A01–A11) |

Med izvajanjem je bil odkrit in odpravljen tipski zapis v lastnem testu
(`seen: (string | null)[]` namesto `string[]`); po popravku je `npm run check`
uspešen v celoti. Zahteve se zaradi tega niso spremenile.

## Povezava zahtev z dokazi

| Zahteva | Dokaz (test) | Rezultat |
| --- | --- | --- |
| R01 | A01: privzetka `all/all`, izvorni vrstni red, status `Stran 1 od 1. Prikazano 1–8 od 8.` | uspešno |
| R02 | A02: 4 strani po 2 pokrijejo 8 ID-jev brez podvajanj v izvornem vrstnem redu; A11: 5 strani po 2 za 10 opravil; D01 | uspešno |
| R03 | A02: robova (prva/zadnja stran onemogočena), prehod naprej/nazaj; D02 | uspešno |
| R04 | A03: sprememba 5→2→all vrne na prvo stran, `all` = ena stran; D04 | uspešno |
| R05 | A04: filter `todo` po premiku na zadnjo stran vrne na prvo in obdrži vrstni red (`web-02, web-04, web-07, web-08`); D03 | uspešno |
| R06 | A05/A09: preglednica in tabla kažeta iste ID-je trenutne strani; stolpci table združujejo le ta odsek; D03 | uspešno |
| R07 | A05: preklop pogleda ter odpiranje/zapiranje podrobnosti ohranijo velikost `2`, filter `all` in stran 2 | uspešno |
| R08 | A06: menjava projekta in osvežitev ponastavita `all/all/1`; stanje ni v URL-ju (test bere le `select` vrednosti) | uspešno |
| R09 | A01–A04, A10, A11: natančno besedilo statusa z en dash `–`, npr. `Stran 2 od 2. Prikazano 6–8 od 8.`; D02 | uspešno |
| R10 | A07 (prazen projekt) in A08 (filter brez zadetkov): `Stran 0 od 0. Prikazano 0–0 od 0.`, vsi štirje gumbi onemogočeni, ob odstranitvi filtra spet prva stran | uspešno |
| R11 | A04/A08/A09: povzetek šteje celoten nefiltrirani projekt (`4/2/2`, `1/0/1`), značka skupnega števila ostane 8, števci stolpcev table štejejo le trenutno stran | uspešno |
| R12 | A04 (`readonly`: ni ne-GET zahtevkov, `saveRequests = 0`), vsi testi izhodišča (povezave, ID-ji, podrobnosti, nalaganje, videz) in mobilni testi izhodišča (`scrollWidth <= clientWidth`) | uspešno |

Dodatno: `npm run build` je uspešno zgradil produkcijsko različico, kar potrjuje,
da spremembe tipov in slogov ne zlomijo gradnje.

## Omejitve in nepreverjeno

- Končni (skriti) ocenjevalni testi niso bili dostopni; zahtev nisem mogel
  preveriti z njimi.
- Videz novih kontrol je preverjen posredno skozi obstoječe teste (mobilni
  profil iPhone 13 pri širini 390 pik ne povzroči vodoravnega drsenja celotne
  strani) in z uporabo obstoječih gradnikov; ročni vizualni pregled ni bil izveden.
- Scenariji sočasnih sprememb podatkov med nalaganjem in navigacijo med
  nezaključenim nalaganjem ostajajo v okviru obstoječih regresijskih testov;
  novih takih testov nisem dodajal (skladno z omejitvijo iz navodil).
- Testi v `tests/agent/` tečejo le v projektu `agent` (namizni profil); mobilni
  profil pokrivajo razvojni in izhodiščni testi.
