# Preverjanje P03

## Izvedena preverjanja

- `npm run lint`: uspešno po popravku odvisnosti React Hook-a.
- `npm run typecheck`: uspešno po popravku tipizacije lastnega testa.
- `npx playwright test --project=agent`: 4/4 uspešni.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8/8 uspešni.
- `npm run check`: uspešno; vključno z gradnjo in 50/50 testi.

## Sledljivost zahtev

| Zahteva | Dejanski scenarij in rezultat |
| --- | --- |
| R01 | Lastni test A02 preveri privzete vrednosti kontrol in izvorni vrstni red `web-04, web-01, web-03, web-02`; uspešno. Razvojni test D01 desktop/mobile preveri celoten začetni seznam; uspešno. |
| R02 | Lastni test A01 preveri NFD, odstranjevanje U+0300–U+036F in male črke (`ČŠŽ čšž` → `csz csz`); uspešno. Razvojni test D01 preveri `CAS` proti `Čas`; uspešno. |
| R03 | Lastni test A01 preveri več besed v poljubnem vrstnem redu, literalno ločilo `=SUM(A1)` in prazen vnos; uspešno. |
| R04 | Lastni test A02 in razvojni test D02 preverita iskanje, filter stanja in filter osebe v logičnem IN; uspešno. |
| R05 | Lastni test A02 preveri možnosti `all`, `Ana Novak`, `Črt` iz celotnega projekta brez podvajanj; uspešno. |
| R06 | Lastni test A02 preveri enake ID-je po preklopu tabela/tabla, ohranjene filtre in pravilne stolpce; uspešno. |
| R07 | Lastni test A02 preveri ponastavitev vseh treh filtrov po preklopu projekta in neuveljavljenje starih pogojev; uspešno. |
| R08 | Lastni test A02 po osvežitvi preveri privzete vrednosti, prazen `location.search` in prazni `localStorage`/`sessionStorage`; uspešno. |
| R09 | Lastni test A02 preveri `Prikazano: 1 od 4.`, števil statusov in stolpcev; lastni test A03 preveri `0 od 8.` in `4 od 8.`; uspešno. |
| R10 | Lastni test A03 preveri sporočilo `Ni zadetkov.` v nepraznem projektu; lastni test A04 preveri prazen projekt s števcem `0 od 0.` in običajnim praznim stanjem; uspešno. |
| R11 | Lastna testa A02 in A03 preverita enodejno ponastavitev ter ohranjen izvorni vrstni red; uspešno. |
| R12 | Lastni test A03 preveri podrobnosti, širino 390 px brez horizontalnega razširanja dokumenta, brez pisnih zahtev na `/api/` in brez shranjevanj; razvojni test D04 potrdita oba pogleda; uspešno. |

## Utemejitev kode

- `src/filters.ts:1` vsebuje normalizacijo in sestavljeni filter.
- `src/App.tsx:12` hrani filtrsko stanje projekta, izračuna vidne zadetke in prikaže kontrole.
- `src/App.tsx:42` vsebuje iskalni vnos, filtra, gumb za čiščenje in status rezultatov.
- `src/TaskBoard.tsx:1` prejme že filtrirane zadetke, zato stolpci in števci sledijo istim ID-jem.
- `src/styles.css:1` vsebuje odzivno postavitev kontrol v obstoječem Folio slogu.
- `tests/agent/P03.spec.ts:1` vsebuje lastna preverjanja A01–A04.

## Omejitve

- Neizpolnjenih zahtev ni.
- Sočasna spreminjanja podatkov brez osvežitve niso preverjena, ker navodilo naloge izrecno ne širi tega obstoječega scenarija.
- Testni dnevniki vsebujejo okoljske opozorilce o `npm` proxy nastavitvi in sočasnih `NO_COLOR`/`FORCE_COLOR`; vplivajo samo na dnevnik, ne na rezultate.
- Interna opravila testnega strežnika so bila resetirana prek `/__test/` iz testov, kot predvideva infrastruktura; uporabniški vmesnik uporablja samo `/api/`.
