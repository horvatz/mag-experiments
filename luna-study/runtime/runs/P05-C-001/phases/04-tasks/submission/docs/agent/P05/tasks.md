# P05 implementation tasks

Zaporedje temelji na [`spec.md`](spec.md) in [`plan.md`](plan.md). Ne spreminjaj strežnika, skupnih testov, konfiguracije ali odvisnosti.

## Setup

- [ ] [T001] V `tests/agent/P05.pagination.spec.ts` pripravi Playwright scenarije in nadzorovane GET odzive za različna zaporedja opravil, vključno s praznim seznamom; testni pripomoček uporabi samo v testu.

## Foundational

- [ ] [T002] V `src/App.tsx` dodaj lokalno stanje velikosti, filtra in strani ter izpeljavo `filter → page` iz vrstnega reda API-ja; pokrij privzeti `all/all`, odseke in ponastavitev strani ob spremembi velikosti ali filtra (R01, R02, R04, R05).

## Uporabniške zgodbe — pregled in navigacija

- [ ] [T003] V `src/App.tsx` dodaj izbirnika `Velikost strani` in `Filter strani` ter gumbe Prva, Prejšnja, Naslednja in Zadnja stran; onemogoči neveljavne robne premike brez spremembe stanja (R03–R05).
- [ ] [T004] V `src/App.tsx` prikaži zahtevani status straničenja za neprazen in prazen rezultat z `role="status"`, točnim `aria-label` in besedilom; pri praznem rezultatu onemogoči vse štiri gumbe (R09, R10).

## Uporabniške zgodbe — pogledi, ohranitev stanja in števci

- [ ] [T005] V `src/App.tsx` uporabi isti filtrirani odsek za preglednico in `TaskBoard`; ohrani stanje ob preklopu pogleda ter odpiranju/zapiranju podrobnosti, ob menjavi projekta pa ponastavi stanje po specifikaciji in ga ne zapisuj v URL/shrambo (R06–R08).
- [ ] [T006] V `src/App.tsx` in po potrebi `src/TaskBoard.tsx` ohrani projektne števce nad nefiltriranim seznamom, števce stolpcev pa izračunaj iz trenutne strani; zagotovi, da straničenje ne spreminja opravil in ne kliče zapisovalnega API-ja (R11, R12).

## Polish in preverjanje

- [ ] [T007] V `src/styles.css` oblikuj nove kontrole in status po obstoječem Folio; ohrani vidni fokus, notranje drsenje preglednice/table in širino celotne strani pri 390 px (R09, R12).
- [ ] [T008] V `tests/agent/P05.pagination.spec.ts` dokončaj preverjanja vseh R01–R12: velikosti in filtrov, brez izgub/podvojitev ID-jev, robov, obeh pogledov, podrobnosti, ponastavitev ob projektu/osvežitvi, praznega projekta/filtra in odstranitve filtra, števcev, API brez zapisov ter obstoječih povezav in odzivnega prikaza.
- [ ] [T009] Zaženi `npm run check` in lastne teste P05; zabeleži samo dejanske rezultate. V `docs/agent/P05/spec.md` poveži vsako zahtevo s kodo, scenarijem/testom in dokazilom ter označi nepreverjene zahteve.
