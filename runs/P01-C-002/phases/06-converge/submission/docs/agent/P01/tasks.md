# P01 — Izvedbene naloge

2026-09-20. Podlaga: [spec.md](spec.md), [plan.md](plan.md) in izvirne R01–R10 v `task/instructions.md`.

Naloge izvaja isti agent zaporedno T001 → T009; vsaka se opira na prejšnje. Oznaka `[x]` pomeni dejansko dokončano delo, rezultati testov pa se zapišejo posebej. Brez dodatnih agentov, vej, commitov ali sprememb infrastrukture. Izvedba je zaključena; dokazi so v [zapisu preverjanj](../verification.md). Končna matrika sledljivosti je povezana iz specifikacije.

## Priprava

- [x] [T001] V `docs/agent/verification.md` odpri jedrnat zapis izvedbe z viri zahtev, načrtovanimi ukazi in začetnim stanjem »neizvedeno«; preveri meje sprememb po `PROJECT_RULES.md`, `task/instructions.md` in `task/specification-template.md` ter preostali čas z `node task/time-budget.mjs`.

## Temeljna podpora

- [x] [T002] V `src/taskEditing.ts` dodaj `normalizeTitle` za izključno robne U+0020/U+0009/U+000A/U+000D (R03); v `src/useResource.ts` dodaj funkcijsko posodobitev potrjenih podatkov, omejeno na trenutni ključ vira, z ohranitvijo obstoječega nalaganja in obravnave napak (R05).

## Uporabniška pot 1 — Urejanje, validacija in preklic

- [x] [T003] V `src/TaskDetails.tsx` dodaj »Uredi«, svež lokalni osnutek po `task.id`, označeno polje »Naslov«, HTML `select` »Stanje« z vsemi tremi stanji ter »Shrani« in »Prekliči«. Dodaj natančno validacijo z umikom napake ob veljavnem popravku, zahtevane atribute ARIA in preklic brez zahteve; shranjeni prikazi ostanejo nespremenjeni (R01–R04, R06, R10; S1–S3).

## Uporabniška pot 2 — Shranjevanje in okrevanje po napaki

- [x] [T004] V `src/TaskDetails.tsx` poveži obstoječi `src/api.ts:updateTask`: samo naslov in stanje, identiteta po `id`, sinhrona zapora ponovne oddaje, onemogočene štiri kontrole in vidni status čakanja; po zavrnitvi ohrani osnutek, pokaži napako in omogoči ponovitev. Po uspehu posodobi potrjene podrobnosti, zapri obrazec in pokliči `onSaved`; v `src/App.tsx` zamenjaj potrjeno opravilo po `id` oziroma znova preberi še nenaložen seznam. Preveri, da tabla in števci uporabljajo ta seznam (R02, R05, R07–R10; S4–S7).

## Dodelava in preverjanje

- [x] [T005] V `src/styles.css` dodaj omejene sloge obrazca, napak in čakanja z obstoječimi barvami in gradniki Folio; ohrani strukturo dialoga, odzivnost, vidni fokus, `data-task-id`, poimenovane stolpce in oznako števcev (dogovor vmesnika, R10).
- [x] [T006] V `tests/agent/P01.spec.ts` dodaj smiselna dopolnilna preverjanja S1–S3: osnutek in preklic iz obeh prikazov brez PATCH, sveže odprtje po napaki, normalizacijo štirih robnih belih znakov, ohranitev notranjih presledkov in U+00A0, dejanski payload ter povezano in sproti odpravljeno napako (R01–R03, R06).
- [x] [T007] V `tests/agent/P01.spec.ts` dodaj preverjanja S4–S7: vseh šest prehodov stanj, skupno shranjevanje obeh polj, prikaze/stolpce/števce in trajnost po osvežitvi; primerjaj druga opravila in neurejena polja, tudi ob enakih naslovih in v drugem projektu. S testnimi kontrolami preveri zadržan odgovor, največ eno zahtevo, zaklep, zavrnitev, ohranjen vnos in uspešno ponovitev; po uspehu in preklicu preveri navigacijo ter svež obrazec drugega opravila (R04–R10).
- [x] [T008] Izvedi `npm run check` z nespremenjeno konfiguracijo in shrani izhod v `docs/agent/P01/check.log`; preveri lint, tipe, build, skupne API/izhodiščne/razvojne teste in lastne teste. Preglej obrazec tudi pri ozki širini, dokaz shrani v `docs/agent/P01/`. Morebitne napake odpravi samo v dovoljenih datotekah `src/` in `tests/agent/` ter ponovi prizadeta preverjanja; dejanske rezultate in omejitve sproti zapiši v `docs/agent/verification.md`.
- [x] [T009] V `docs/agent/P01/spec.md` dopolni tabelo sledljivosti za vse R01–R10 s konkretnimi deli kode, imeni testov in povezavo na dejanske dokaze iz `docs/agent/verification.md`; posodobi stanje in zgodovino specifikacije. Preveri skladnost z izvirnimi zahtevami in vsemi razdelki skupne predloge ter zapiši nepreverjene scenarije ali odstopanja. V `docs/agent/P01/tasks.md` označi samo opravljene naloge, preveri preostali čas in pripravi predajo z zadnjo minuto za zaključek.
