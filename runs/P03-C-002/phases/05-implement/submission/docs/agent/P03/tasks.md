# Naloge P03

Podlaga: [specifikacija R01–R12 in scenariji S01–S07](spec.md), [načrt](plan.md) ter [izvirne zahteve](../../../task/instructions.md). Izvedba je zaporedna, pri istem agentu; vsaka naloga sledi prejšnji. Vse zahteve so obvezne, prioriteta spodaj določa samo vrstni red izvedbe. Označi opravljeno šele po dejanski izvedbi; dokazila sproti dopolnjuj.

## 1. Priprava

- [x] [T001] Potrdi mesta posegov v `src/App.tsx`, `src/TaskBoard.tsx` in `src/styles.css` glede na `docs/dizajn.md`; ustvari `docs/agent/verification.md` za dejanske ukaze, izide in omejitve. Preveri preostanek z `node task/time-budget.mjs`. Brez sprememb infrastrukture ali odvisnosti.

## 2. Osnova filtriranja

- [x] [T002] V `src/taskFilters.ts` dodaj tip filtrov, privzete vrednosti in čisti `filterTasks`: normalizacija NFD/U+0300–U+036F/male črke, vse neprazne besede kot dobesedni podnizi združenih štirih polj, IN s stanjem in natančno osebo; ohrani podatke in relativni vrstni red (R01–R04, R11).

## 3. Uporabniški scenariji po prioriteti

### P1 — Iskanje, sestavljeni filtri in oba pogleda

- [x] [T003] V `src/App.tsx` dodaj lokalno stanje filtrov v `ProjectView`, označen iskalnik, dva HTML selecta in gumb `Počisti filtre` z imeni iz specifikacije. Osebe izpelji iz celotnega projekta brez dvojnikov/praznih imen; vse tri kontrole ponastavi v enem dejanju. Obstoječi ključ projekta naj zagotavlja reset ob menjavi projekta, preklop pogleda pa ohrani stanje; brez shrambe ali filtrov v URL-ju (R01, R04–R08, R11).
- [x] [T004] V `src/App.tsx` izpelji `visibleTasks` s pomočnikom in ga uporabi za vrstice ter vhod obstoječega `src/TaskBoard.tsx`. Uskladi pregled stanj, števce prikaza in točen status `Prikazano: N od M.`. Loči nič zadetkov od praznega projekta, ohrani kontrole in prazne stolpce table, `data-task-id`, povezave po ID-ju ter nalaganje/napake/podrobnosti (R06, R09–R12).

### P2 — Folio in preverljivi robni primeri

- [x] [T005] V `src/styles.css` dodaj sloge novih kontrol in statusa z obstoječimi spremenljivkami Folio, vidnim fokusom in prelamljanjem pri ozki širini. Pri 390 pik omeji širino kontrol; ohrani notranje drsenje preglednice/table ter obstoječo navigacijo in kartice (R12).
- [x] [T006] V `tests/agent/P03.spec.ts` dodaj lastne scenarije S01–S04: drugačni ID-ji, več kot deset opravil, enaki naslovi in izvorno zaporedje, iskanje po vseh štirih poljih, Unicode obeh strani, beline, več besed čez polja, dobesedna ločila, IN vseh filtrov, natančna imena ter popolnost možnosti oseb. Preveri ID-je obeh pogledov, ohranitev kontrol, razpored po stolpcih in števce. Pričakovanj ne izračunavaj s produkcijskim predikatom (R01–R06, R09, R11).
- [x] [T007] V `tests/agent/P03.spec.ts` dodaj S05–S07: menjava projektov in nazaj, osvežitev ter URL/shramba, nič zadetkov v obeh pogledih, prazen projekt in eno opravilo, enkratno čiščenje vseh filtrov, nespremenjeni podatki, podrobnosti po ID-ju, odsotnost zapisovalnih zahtev in brez razširitve strani pri 390 pik. Shranjevanje posnetkov namiznega/ozkega prikaza naj bo pod `docs/agent/P03/`; testni pripomočki ostanejo izključno v testih (R07–R12).

## 4. Preverjanje in predaja

- [x] [T008] Izvedi `npm run lint`, `npm run build` in `npm test` z obstoječimi nastavitvami; dnevnike shrani v `docs/agent/P03/`. Preveri rezultate skupnih API/baseline, razvojnih P03 in lastnih testov, vizualno preglej shranjene posnetke glede na Folio ter odpravi ugotovljene napake v dovoljenih datotekah. Po popravkih ponovi prizadeta preverjanja; v `docs/agent/verification.md` navedi dejanske rezultate in nepreverjene dele (R01–R12).
- [x] [T009] V `docs/agent/P03/spec.md` posodobi vseh dvanajst vrstic sledljivosti z dejanskimi funkcijami/datotekami, imeni testov in povezavami na izide v `docs/agent/verification.md` ter dnevnike. Ohrani zgodovino specifikacije, zapiši odstopanja in nedostopnost končnih testov. V `docs/agent/P03/tasks.md` uskladi stanje nalog z dokazili; zadnjo minuto roka nameni predaji (R01–R12).

## Meja izvedbe

T001–T009 so izvedene. Rezultati in izpolnjena sledljivost so v [poročilu preverjanja](../verification.md); specifikacija nanj povezuje razdelek skupne predloge. Ne spreminjamo strežnika, skupnih tipov/testov, nastavitev, odvisnosti, uradnih predlog ali veščin. Ne uvajamo novih funkcionalnosti, agentov, vej ali commitov. Morebitno omejitev preverjanja poimenujemo; neizveden test ni uspešen.
