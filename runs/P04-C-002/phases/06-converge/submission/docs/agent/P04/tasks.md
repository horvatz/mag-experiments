# P04 — Naloge izvedbe

2026-09-25. Podlaga: [specifikacija in sprejemni pogoji](spec.md), [načrt](plan.md), izvirne [R01–R12](../../../task/instructions.md). Naloge izvaja isti agent zaporedno T001 → T008; vsaka naslednja je odvisna od predhodne. Brez drugih agentov, vej, commitov ali sprememb infrastrukture. Oznaka `[x]` pomeni dejansko zaključeno delo z dokazom, kadar gre za preverjanje.

## Priprava

- [x] [T001] V `docs/agent/P04/validation.md` odpri kratek dnevnik izvedbe z obsegom, časovnim proračunom iz `node task/time-budget.mjs` in oznako, da preverjanja še niso izvedena. Potrdi uporabo obstoječih skript in testnih projektov iz `package.json` ter `playwright.config.ts` brez sprememb teh datotek.

## Temelji

- [x] [T002] Dodaj `src/taskSorting.ts`: tipizirane ključe/smeri, privzeto stanje in čisto `sortTasks(readonly Task[], settings)`. Izvedi NFD/odstranitev U+0300–U+036F/male črke/UTF-16, vrstni red stanj, datume, neodvisni smeri, pogojno sekundarno primerjavo in izvorni indeks za stabilnost. `original` vrne izvorno zaporedje; vhod ostane nespremenjen. Pokrije R01–R06, R10–R11.

- [x] [T003] V `tests/agent/P04.spec.ts` dodaj neposredne teste projekcije z ročno določenimi pričakovanji za oba nizovna ključa, Unicode/ločila/številčne dele, stanja, datume prek let, vse sekundarne ključe in smeri, popolna izenačenja, isti ključ in `original`. Zamrzni vhod za dokaz nespremenljivosti; preveri nič in eno opravilo pri vseh 100 kombinacijah. Pokrije S1–S3/S6 in R01–R06, R10–R12; zagon skupaj s T007.

## Uporabniške zgodbe po prednosti

- [x] [T004] V `src/App.tsx` poveži `sortTasks` z lokalnim stanjem štirih kontrol v `ProjectView`; dodaj označene HTML selecte in gumb `Izvorni vrstni red`, tudi ob praznem polju. Preglednica in `TaskBoard` prejmeta isto projekcijo, števila pa ostanejo iz izvornih podatkov. Ohranitev stanja pri pogledih/podrobnostih in reset ob projektu/osvežitvi izhajata iz obstoječega `key={project.id}`. Ohrani ID-je, povezave, dostopna imena in javni API brez zapisov. Pokrije R01, R05–R12.

- [x] [T005] V `tests/agent/P04.spec.ts` dodaj brskalniške scenarije S4–S6 z nadzorovanimi GET odgovori samo v testih: več kot deset opravil, drugačni ID-ji, enaki naslovi, vsi trije stolpci, odpiranje pravih podrobnosti in ohranitev vseh štirih kontrol. Preveri gumb, menjavo projekta/vrnitev, osvežitev, `original` ob neprivzetih kontrolah ter prazen projekt. Preveri nespremenjene povzetke in odsotnost zapisovalnih zahtev, trajnega zapisa in parametrov razvrščanja v URL-ju. Pokrije R07–R12 ter integracijo R01/R06; zagon skupaj s T007.

## Dodelava in predaja

- [x] [T006] V `src/styles.css` oblikuj nove kontrole z obstoječimi barvami, robovi, pisavo in vidnim fokusom Folio; omogoči prelom pri 390 pikah. V `tests/agent/P04.spec.ts` dodaj preverjanje širine strani za oba pogleda pri 390 pikah in zajem namiznega/mobilnega posnetka v `docs/agent/P04/`. Ohrani obstoječe notranje drsenje table/preglednice. Pokrije R12.

- [x] [T007] Zaženi `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo ter shrani izhode v `docs/agent/P04/lint.log`, `build.log` in `test.log`. Preglej posnetke iz T006 glede na `docs/dizajn.md`; rezultate vpiši v `docs/agent/P04/validation.md`. Ob napaki popravi samo dovoljeno kodo/teste in ponovi prizadeta preverjanja; zapiši neuspehe in ponovitve. Zajame skupne, razvojne in lastne teste za R01–R12.

- [x] [T008] Dopolni tabelo sledljivosti in zgodovino v `docs/agent/P04/spec.md`: vseh R01–R12 poveži s konkretnim delom kode, imenom dejansko izvedenega testa in dokazom v `docs/agent/P04/validation.md` oziroma dnevnikih. Navedi nepreverjene dele in omejitve; nedostopnih končnih testov ne označi kot uspešnih. Posodobi oznake opravljenih nalog v `docs/agent/P04/tasks.md` in pripravi jedrnato predajo sprememb ter rezultatov.
