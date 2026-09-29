# Preverjanje P03

## Izveden ukaz in rezultat

Izveden je bil `npm run check` po končni spremembi kode in testov. Ukaz je končal z izhodno kodo 0:

- ESLint: uspešno.
- `tsc --noEmit` in Vite produkcijska gradnja: uspešno.
- Playwright: **50/50 uspešnih** v 19,1 s.
  - 14 API izhodiščnih testov.
  - 24 namiznih in mobilnih izhodiščnih regresijskih testov.
  - 8 P03 razvojnih testov (`development-desktop` in `development-mobile`).
  - 4 dodatni testi v `tests/agent/P03.spec.ts`.

Pri npm zagonu so se pojavila opozorila za neznano npm nastavitev `http-proxy` in okoljski `NO_COLOR`/`FORCE_COLOR`; niso vplivala na uspeh preverjanj.

## Zahteve in dejanski dokazi

| Zahteve | Izvedeni scenariji | Rezultat |
| --- | --- | --- |
| R01 | `D01: default list and literal normalized search` na namizju in mobilniku; `filtered counts, clear, and refresh defaults` | Privzet prikaz ohrani ID-je in vrstni red; po osvežitvi so vse kontrole privzete. Uspešno. |
| R02–R03 | D01; agentni `normalized all-word literal search reads every searchable field` | `CAS`/`Čas` in `koncni CAS` potrdita neobčutljivost na diakritiko, velikost ter vrstni red besed; `=SUM(A1)` preveri literalno ločilo; noben zadetek da prazen rezultat. Uspešno. |
| R04 | `D02: combined filters and view persistence` na namizju in mobilniku | Stanje `done` in natančna oseba `Ana Novak` se uporabita skupaj; prikaz ostane enak po preklopu pogledov. Uspešno. |
| R05, R07 | Agentni `people include filtered-out tasks, project changes reset controls, and board keeps matches` | Izbirnik vključuje osebe iz skritih opravil (6 možnosti skupaj z `all`), prehod v drug projekt ponastavi kontrole in izbere samo imena novega projekta (3 možnosti skupaj z `all`). Uspešno. |
| R06 | D02; agentna testa normaliziranega iskanja ter oseb/projektov | ID-ji so primerjani med pogledoma; tabla prikaže samo filtrirani ID. Uspešno. |
| R08, R11 | Agentni `filtered counts, clear, and refresh defaults`; D03 na namizju in mobilniku | Osvežitev ponastavi stanje; Počisti filtre ponastavi iskanje in oba izbirnika ter obnovi seznam. Uspešno. |
| R09 | `D04: counts and read-only behavior` na namizju in mobilniku; agentni test štetja | Preverjeno `Prikazano: 4 od 8.` in `Prikazano: 1 od 8.`, ter filtriran povzetek `0, 0, 1`. Uspešno. |
| R10 | D03; agentna testa normaliziranega iskanja in `empty project retains empty state and zero results` | Neprazen projekt brez ujemanj pokaže `Ni zadetkov.` v tabeli in tabli; prazen projekt pokaže običajno prazno stanje ter `0 od 0.`. Uspešno. |
| R12 | Izhodiščni namizni/mobilni testi za navigacijo, podrobnosti, tablo in prazno stanje; D04; agentni testi | Regresije uspešne; D04 ni zaznal zapisovalnih zahtev in je preveril, da je širina strani največ širina mobilnega prikaza. Uspešno. |

Celotna sledljivost med posameznimi pogoji, implementacijo in testi je v [specifikaciji](./specification.md). Iskanje po ID-ju ni bilo neposredno preizkušeno; implementacija polje `id` vključuje v sestavljeni niz.

## Omejitve

- Končnih oziroma skritih testov ni bilo mogoče zagnati; uspeh velja za 38 izhodiščnih, 8 dostopnih razvojnih in 4 lastne teste.
- Vzorčni nabor je imel 8 opravil v uporabljenem projektu. Izrecno nismo preverili nabora z več kot 10 opravili, projekta z enim opravilom ali celotnega obsega kombinacij U+0300–U+036F. Implementacija deluje nad celotnim seznamom API in uporablja zahtevani razpon v normalizaciji.
- Razvojni in lastni Playwright scenariji so za UI odgovor `/api/` uporabili priloženi testni prestreznik; aplikacijska koda bere `GET /api/projects/:id/tasks` in ne kliče testnih kontrol.
