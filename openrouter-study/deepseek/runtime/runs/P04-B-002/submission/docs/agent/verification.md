# Poročilo izvajalca: načrt in preverjanje P04

Vloga: izvajalec (postopek B). Predmet: `docs/agent/specification.md`
(R01–R12). Spremembe: `src/`, `tests/agent/`, ta dokument.

## Načrtovana preverjanja (stanje ob zapisu: načrtovano, še neizvedeno)

| Zahteva | Načrtovano preverjanje | Vir |
| --- | --- | --- |
| R01 | privzete vrednosti štirih kontrol; `original` = prejeto polje | agent test |
| R02 | normalizacija NFD/šumniki in UTF-16 vrstni red | agent test |
| R03 | `status` todo<in_progress<done; `dueDate` kronološko | agent test |
| R04 | `desc` obrne le primerjavo; stabilnost enakih ključev | agent test |
| R05 | sekundarni ključ le ob izenačitvi, neodvisna smer | agent test |
| R06 | `idx` izenačitev, `K1=K2`, `original` ne glede na druge kontrole | agent test |
| R07 | stolpci table fiksni, relativni vrstni red = filtriran sortiran seznam | agent test |
| R08 | preklop pogleda in podrobnosti ohranita vse štiri nastavitve | agent test |
| R09 | menjava projekta in osvežitev ponastavita; ni v URL-ju | agent test |
| R10 | gumb ponastavi vse; prazen projekt in eno opravilo | agent test |
| R11 | razvrščanje ne piše na API, števci in polja nespremenjeni | agent test |
| R12 | vsak ID natanko enkrat, podrobnosti po ID, 390 px brez preliva | agent test |

Poleg tega: `npm run check` (slog, tipi, gradnja, vsi testi) in razvojni
testi D01–D04.

## Izvedba

Spremembe (samo dovoljene poti):

- `src/sorting.ts` (nov): `SortControls`, `defaultSortControls`, `normalize`,
  `sortTasks`. Primerjalnik: `dir(D1, cmp(K1))` → `dir(D2, cmp(K2))` → `idx`;
  `K1 = original` vrne kopijo prejetega polja ne glede na ostale kontrole.
- `src/App.tsx`: stanje štirih kontrol v `ProjectView` (`useState`), projekcija
  `sortedTasks = useMemo(() => sortTasks(tasks, sort))`; kontrole
  (4 × `select` + gumb `Izvorni vrstni red`) v vrstici `.sort-bar`; preglednica
  in tabla prejmeta `sortedTasks`. Števci in `tasks.length` ostajajo vezani na
  nepredelano polje. Ponastavitev ob menjavi projekta zagotavlja obstoječi
  `key={project.id}`.
- `src/styles.css`: `.sort-bar`, `.sort-field`, `.sort-reset` (flex-wrap, brez
  preliva na 390 px).
- `tests/agent/p04-verification.spec.ts` (nov): 14 testov, po eden ali dva na
  zahtevo, z lastnimi podatki in ročno izračunanimi pričakovanji.

## Izvedena preverjanja in rezultati

Ukaz: `npm run check` (eslint + tsc + vite build + Playwright) —
**vsi preizkusi uspešni, 60/60** (38 osnovnih/API, 8 razvojnih D01–D04
(desktop + mobilna), 14 lastnih agentnih). Zagona:
`npm run check`, izhod 0; dnevnik `playwright-report/`.

| Zahteva | Pogoj (dejanski izid) | Dokaz (test) | Koda |
| --- | --- | --- | --- |
| R01 | privzeto original/asc/none/asc; `original` = prejeto polje; vrednosti `option` točno določene | agent R01; D01 | `src/App.tsx`, `src/sorting.ts` |
| R02 | NFD + odstranitev U+0300–U+036F + male črke; UTF-16 (`Alfa 10` pred `alfa 2`); velike/šumniki pravilno | agent R02 | `src/sorting.ts` (`normalize`, `compareKey`) |
| R03 | todo<in_progress<done; datumi kronološko | agent R03 | `src/sorting.ts` (`statusRank`) |
| R04 | `desc` obrne le primerjavo; enake vrednosti ostanejo v izvornem vrstnem redu | agent R04 | `src/sorting.ts` (`applyDirection`, `idx`) |
| R05 | sekundarni ključ le ob izenačitvi, neodvisna smer | agent R05; D02 | `src/sorting.ts` |
| R06 | izenačitev po `idx`; `K1=K2` brez dodatnega obrata; `original` ne glede na druge kontrole | agent R06 | `src/sorting.ts` |
| R07 | stolpci fiksni Pripravljeno/V delu/Končano; relativni vrstni red = filtriran sortiran seznam | agent R07; D03 | `src/App.tsx`, `src/TaskBoard.tsx` |
| R08 | preklop pogleda in odprtje/zaprtje podrobnosti ohranita vse 4 nastavitve | agent R08 | `src/App.tsx` (stanje v `ProjectView`) |
| R09 | menjava projekta in `page.reload()` ponastavita; ni parametrov v URL-ju | agent R09 | `src/App.tsx` (`key={project.id}`) |
| R10 | gumb ponastavi vse 4; prazen in enoopravilni projekt pri vseh ključih/smereh | agent R10 (×2); D04 | `src/App.tsx` |
| R11 | nič pisnih zahtev (`writes = []`, `saveRequests = 0`); števci in polja nespremenjeni | agent R11; D04 | `src/sorting.ts` (čista projekcija) |
| R12 | vsak ID natanko enkrat; enaki naslovi odpirajo prave podrobnosti po ID; 390 px brez preliva | agent R12; osnovni testi | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` |

Neuspehi med razvojem: prvi zagon lastnih testov je imel 4 napake, vse v mojih
pričakovanjih (napačno predviden obrat izenačenih elementov pri `desc`,
napačen vrstni red sekundarnega ključa v R11, dvojno zaprtje pogovornega okna,
ponoven `mount` na isto pot brez osvežitve). Po popravkih testov vsi uspejo;
napake v izdelku niso bile ugotovljene.

## Omejitve in odprta vprašanja

- Končni (skriti) testi naloge niso dostopni; preverjeni so zahtevani scenariji
  z razvojnimi in lastnimi podatki. Razvojni primeri niso celoten obseg.
- `dueDate` je obravnavan kot veljaven `YYYY-MM-DD` (dogovor naloge); manjkajoči
  ali neveljavni datumi niso podprti.
- Razvrščanje je stanje v pomnilniku trenutnega projekta: brez trajne shrambe,
  brez URL-parametrov, brez novih zapisovalnih API-jev (zahtevano).
- Ročni pregled v brskalniku ni bil izveden; preverjanje je avtomatsko
  (Playwright prek `chromium.connect(wsEndpoint)` iz `task/browser.json`).
- Omejitve okolja: heredoc v lupini ni dovoljen (uporabljen `apply_patch`);
  javni internet ni potreben. Napak specifikacije nisem našel.
