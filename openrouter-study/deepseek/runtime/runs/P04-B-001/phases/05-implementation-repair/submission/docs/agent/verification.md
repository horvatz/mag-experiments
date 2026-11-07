# Poročilo implementacije in preverjanja (P04, postopek B)

Vloga: implementer. Vir zahtev: `task/instructions.md` (R01–R12) in predana
`docs/agent/specification.md`. Izidi spodaj so dejansko izvedeni; neizvedenih
preverjanj ni med uspešnimi.

## Spremembe (sledljivost kode)

- `src/sorting.ts` (nov): `SortKey/SortDirection/SecondaryKey/SortSettings`,
  `DEFAULT_SORT`, `normalizeText` (NFD, odstranitev U+0300–U+036F, `toLowerCase`),
  `compareText` (leksikografska primerjava z `<` in `>` po UTF-16), `compareKey`
  (rang `todo < in_progress < done`, kronološki `dueDate`), `sortTasks`
  (projekcija v novo polje; smer je le predznak primerjave; izenačitve po
  izvornem indeksu; primarni `original` vedno vrne T).
- `src/App.tsx`: `SortControls` s štirimi `select` (dostopna imena Primarni
  ključ, Primarna smer, Sekundarni ključ, Sekundarna smer) in gumbom
  `Izvorni vrstni red`; stanje je lokalno `useState(DEFAULT_SORT)` v
  `ProjectView`, `sortedTasks` prek `useMemo`; tabela in `TaskBoard` dobita
  isto razvrščeno polje. Ob menjavi projekta komponenta remountira
  (`key={project.id}`), zato se nastavitve ponastavijo; v shrambo ali URL se
  ne zapišejo.
- `src/TaskBoard.tsx`: nespremenjen; fiksni stolpci filtrirajo že razvrščeno
  polje, zato je relativni vrstni red stolpca enak kot v preglednici (R07).
- `src/styles.css`: `.sort-controls`, `.sort-field`, `.sort-reset` in mobilne
  prilagoditve; pri 390 px se stran ne preliva (preverjeno).
- `tests/agent/p04-sorting.spec.ts` (nov): 11 lastnih testov za R01–R12
  (normalizacija, smeri, sekundarni ključ, tabla, preklop pogleda,
  podrobnosti, menjava projekta/osvežitev, ponastavitev, prazni in
  eno-opravilni projekt, enkratni ID-ji, 390 px).

## Dejansko izvedena preverjanja in rezultati

- `npm test`: 57 uspešnih (38 osnovnih/API, 8 razvojnih D01–D04 na
  desktop+mobile, 11 lastnih v `tests/agent/`), 0 neuspešnih.
- `npx playwright test --project=development-desktop`: D01–D04 4/4 uspešno.
- `npm run typecheck`: brez napak. `npm run lint`: brez napak.
- `npm run build`: uspešno (vite, 1876 modulov).

| Zahteva | Preverjanje | Izid |
| --- | --- | --- |
| R01 | D01 + lastni R01 (privzeti vrednosti `original`/`asc`/`none`/`asc`, S = T) | uspešno |
| R02 | lastni R02 (`Alfa 10` pred `alfa 2`, `Čas`/`cas` izenačena, tie po izvoru) | uspešno |
| R03 | D02, D03, lastni R03 (rang stanj, kronološki datumi) | uspešno |
| R04 | D02, lastni R02/R03/R04 (desc ne obrne izenačenih) | uspešno |
| R05 | D02, lastni R04/R08 (neodvisna smer sekundarnega ključa) | uspešno |
| R06 | D01/D04, lastni R04 (title+title desc, original+desc+sekundarni) | uspešno |
| R07 | D03, lastni R07 (stolpci asc in desc) | uspešno |
| R08 | lastni R08 (tabla/preglednica, odpri/zapri podrobnosti, iste nastavitve) | uspešno |
| R09 | lastni R09 (menjava projekta in `reload`; `localStorage`/`sessionStorage` prazna, URL brez ključev) | uspešno |
| R10 | D04, lastni R10 (gumb, prazen projekt in eno opravilo pri vseh ključih/smereh) | uspešno |
| R11 | D04 `readonly`, lastni R11 (brez pisnih zahtev, `saveRequests` = 0) | uspešno |
| R12 | baseline/API, D01–D04, lastni R11/R12 (enkratni ID-ji, prave podrobnosti pri enakih naslovih, 390 px) | uspešno |

## Omejitve in opombe

- Napake predane specifikacije nisem našel; predpostavke iz specifikacije
  (vrednosti možnosti so angleški ključi, stanje je lokalno, `original`
  vedno vrne T) držijo in so implementirane.
- Okolje: `apply_patch` v peskovniku ni dosegljiv, heredoc v zsh ni dovoljen;
  datoteke sem zato pisal prek PTY (`cat >`) in ciljnih `node` popravkov,
  vsebino pa po vsakem koraku preveril z branjem.
- Končni (skriti) testi niso dostopni; preverjanje temelji na R01–R12,
  razvojnih testih D01–D04 in 11 lastnih testih.
- Testirano v Chromiumu (desktop in mobile projekta Playwright); drugi
  brskalniki niso bili preverjeni.
- Manjkajoči datumi in sočasne spremembe podatkov med nalaganjem po dogovoru
  naloge niso del obsega.
- `src/TaskBoard.tsx` ni bil spremenjen; R07 je dosežen s posredovanjem
  razvrščenega polja iz `App.tsx`.
- Vsa spremenjena koda je v `src/` in `tests/agent/`; skupna infrastruktura,
  strežnik, odvisnosti in skupni testi niso bili spremenjeni.

## Obravnava ugotovitev pregleda (dopolnitev)

1. Ugotovitev R05 (utemeljena, popravljeno): sekundarni select je ponujal tudi
   `original`. V `src/App.tsx` je `SECONDARY_OPTIONS` zdaj eksplicitni seznam
   `none, title, assignee, status, dueDate` (brez `original`); primarni select
   ostaja `original, title, assignee, status, dueDate`. V lastni test R01 je
   dodano preverjanje možnosti obeh selectov.
2. Ugotovitev R06 v specifikaciji (utemeljena, a ni moja domena): predikata
   E(t,u) = dS * S(t,u) pri P = 0 in cmp = dP * E(t,u) res ne zajemata izjeme
   za primarni `original`. Implementacija sledi izrecnemu pravilu in R06
   (`original` na primarnem ključu vrne T ne glede na sekundarni ključ in
   smeri), zato koda ni napačna in je ne spreminjam. Specifikacije v tej vlogi
   ne smem urejati; uskladitev formule mora opraviti avtor specifikacije.

Ponovno izvedeno po popravku:
- `npm run typecheck`: brez napak; `npm run lint`: brez napak.
- `npx playwright test --project=agent --project=development-desktop --project=development-mobile`: 19 uspešnih (11 lastnih + 4 + 4 razvojnih), 0 neuspešnih.
