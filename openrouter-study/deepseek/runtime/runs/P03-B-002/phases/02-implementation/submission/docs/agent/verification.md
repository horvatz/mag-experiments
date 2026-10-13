# P03 — implementersko poročilo in dnevnik preverjanj

Vloga: agent-implementer. Vir zahtev: `docs/agent/specification.md` (različica 1) in
`task/instructions.md` (izvirne zahteve R01–R12 veljajo tudi, če specifikacija kaj izpusti).
Obseg sprememb: `src/` in `tests/agent/`; specifikacij in pregledov ne spreminjam.

## Načrt preverjanja (na začetku, še neizvedeno)

- R01 privzetki in izvorni vrstni red: `tests/agent/filters.spec.ts`.
- R02 Unicode normalizacija NFD (č≈c, Č≈č, š≈s, ž≈z): test iskanja.
- R03 večbesedno iskanje (vse besede, poljuben vrstni red, dobesedni podnizi): test.
- R04 IN kombinacije iskanje+stanje+oseba, natančno ime brez normalizacije: test.
- R05 možnosti oseb iz celega projekta, vsako enkrat, reset ob menjavi projekta: test.
- R06 enaki ID-ji v preglednici in tabli, stolpci po stanju, ohranjeni filtri: test.
- R07 menjava projekta ponastavi vse tri kontrole: test.
- R08 osvežitev brez shranjenih filtrov (brez URL/shrambe): test reload + pregled.
- R09 `Prikazano: N od M.` in števci (pregled stanj, stolpci, značka, noga): test.
- R10 `Ni zadetkov.` ob nepraznem projektu in `0 od 0.` ob praznem: test.
- R11 `Počisti filtre` v enem dejanju, nespremenjen vrstni red/polja: test.
- R12 navigacija/podrobnosti, brez zapisovalnih klicev, 390 px brez prelivanja: test.
- Skupni testi: `npm run check` (lint, tipi, gradnja, 38 osnovnih + 8 razvojnih + lastni).
- Razvojni testi: `npx playwright test --project=development-desktop --project=development-mobile`.

Status: izvedeno; rezultati spodaj.

## Izvedene spremembe in rezultati

### Spremembe

- `src/App.tsx`: stanje filtrov `query`/`status`/`assignee` (privzeto prazno/vse/vse),
  `normalizeText` (NFD, odstranjeni U+0300–U+036F, male črke), `matchesSearch`
  (delitev po belinah, vse besede kot dobesedni podnizi združenih `id,title,description,assignee`),
  IN-kombinacija s statusom in natančnim imenom, izbirnik oseb iz celega projekta
  (Set, brez praznih), `Počisti filtre`, `role=status` z `aria-label="Rezultati filtriranja"`,
  `Ni zadetkov.` ob nepraznem projektu brez zadetkov, `Prikazano: 0 od 0.` ob praznem.
  Pregled stanj, značka ob naslovu, noga in oba pogleda uporabljajo vidne rezultate.
  `ProjectView` je vezan na `key={project.id}`, zato menjava projekta ponastavi stanje;
  stanje ni v URL-ju ne v shrambi. Podrobnosti/navigacija ostajajo nespremenjene.
- `src/styles.css`: `.filter-bar` (ovijanje vrstice, 390 px brez prelivanja),
  `.filter-search`, `.filter-status`, `.no-results`; mobilne prilagoditve v `@media 760px`.
- `tests/agent/filters.spec.ts`: 9 lastnih testov (R01–R12), uporabljajo javne
  pripomočke razvojnih testov (`tests/development/helpers.ts`, samo branje).

### Dokazi po zahtevah (vsi testi so bili dejansko izvedeni)

| Zahteva | Test (datoteka:vrstica) | Izid |
| --- | --- | --- |
| R01 | `tests/agent/filters.spec.ts:6` (privzetki, izvorni vrstni red) | uspešno |
| R02 | `tests/agent/filters.spec.ts:26` (`CAS`→web-01, `CRT`→web-07, `ziva`→web-06, `csz`→web-06) | uspešno |
| R03 | `tests/agent/filters.spec.ts:26` (`alfa 2`, `2   alfa`, `"citat"`, `a.*` brez regex učinka) | uspešno |
| R04 | `tests/agent/filters.spec.ts:51` (IN, natančno `Ana Novak` ≠ `ana novak`) | uspešno |
| R05 | `tests/agent/filters.spec.ts:71` (možnosti iz celega projekta, enkrat, reset ob preklopu) | uspešno |
| R06 | `tests/agent/filters.spec.ts:85` (isti ID-ji, stolpci po stanju, filtri ohranjeni) | uspešno |
| R07 | `tests/agent/filters.spec.ts:100` (preklop projekta ponastavi kontrole) | uspešno |
| R08 | `tests/agent/filters.spec.ts:100` (reload + pregled URL/`localStorage`/`sessionStorage`) | uspešno |
| R09 | `tests/agent/filters.spec.ts:6` in `:123` (`Prikazano: N od M.`, pregled stanj, značka, noga) | uspešno |
| R10 | `tests/agent/filters.spec.ts:123` in `:142` (`Ni zadetkov.`, oba pogleda; prazno `0 od 0.`) | uspešno |
| R11 | `tests/agent/filters.spec.ts:6` (`Počisti filtre` v enem dejanju) | uspešno |
| R12 | `tests/agent/filters.spec.ts:149` (podrobnosti, brez zapisovalnih klicev, 390 px) + vseh 38 osnovnih | uspešno |

### Izvedeni ukazi in rezultati (2026-10-09)

- `npm run typecheck` — brez napak.
- `npm run lint` — brez napak.
- `npm run build` — uspešno (`dist/`, 100 ms).
- `npx playwright test --project=development-desktop --project=development-mobile` — 8/8 uspešno.
- `npx playwright test --project=agent` — 9/9 uspešno (skupaj z razvojnimi v istem teku: 17/17, 7,3 s).
- `npx playwright test --project=api --project=desktop --project=mobile` — 38/38 uspešno (12,9 s).
- Skupno torej 55/55 testov; `npm run check` kot ena povezana ukazna veriga ni bil izveden,
  vsi njegovi koraki (lint, tipi, gradnja, vsi projekti testov) pa so bili izvedeni ločeno.

### Omejitve in opombe

- Celoten obseg končnih testov ni dostopen; preverjeni so razvojni in lastni scenariji
  na podatkih iz domene specifikacije. Testov nisem označil kot uspešnih brez izvedbe.
- Vzporedne spremembe podatkov med nalaganjem in navigacija med nezaključenim nalaganjem
  nista bila predmet novih preverjanj (skladno z omejitvijo specifikacije); obstoječi
  regresijski testi zanju ostajajo zeleni.
- Napake v specifikaciji nisem našel; izvirne zahteve R01–R12 so pokrite tudi, kjer bi
  specifikacija kaj izpustila (npr. R09 značka/noga kot isti števci, R10 oba pogleda).
- Okolje: javni internet je blokiran, zato so bili uporabljeni samo lokalni strežnik
  (Playwright `webServer` na 5174/3102), nameščene odvisnosti in Chromium prek
  `wsEndpoint` iz `task/browser.json`; ni bilo uvoza testnih kontrol `/__test/` v `src/`.
