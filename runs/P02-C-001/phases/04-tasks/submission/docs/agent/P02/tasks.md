# Izvedbene naloge P02

2026-09-21. Viri: [specifikacija](spec.md), [načrt](plan.md), [izvirne zahteve](../../../task/instructions.md). Izvaja en agent zaporedno, brez delegiranja. Vsaka naloga sledi prejšnji; oznaka opravljenosti pomeni dejansko dokončano delo. Vse naloge so ob pripravi neizvedene.

## Priprava

- [ ] [T001] V `docs/agent/P02/verification.md` začeti kratek zapis izvedbe: potrditi meje sprememb, povezati R01–R12 s `spec.md` in `plan.md`, navesti še neizvedene preizkuse. Pregledati integracijska mesta v `src/App.tsx`, `src/useResource.ts`, `src/TaskBoard.tsx` in javni `src/api.ts`; preveriti čas z `node task/time-budget.mjs`. Brez novih paketov ali nastavitev.

## Temelji

- [ ] [T002] V `src/useResource.ts` dodati funkcijsko posodobitev podatkov, omejeno na veljavni ključ vira. V novem `src/useBulkStatus.ts` pripraviti stanje izbora po ID, cilja, posnetka operacije, uspešnih ID-jev, napak in aktivnosti ter sinhrono zaščito pred podvojenim zagonom. Uporabiti obstoječe tipe iz `shared/types.ts` brez sprememb skupnih datotek (R01, R03–R12; P1–P9).

## Uporabniška pot 1 — izbor in priprava

- [ ] [T003] Dodati `src/BulkActions.tsx` ter ga povezati s hookom v `src/App.tsx`: skupni HTML checkbox z `indeterminate`, števec, označeni select s prazno začetno vrednostjo in tremi cilji, predpisana dejanja. Posamezne checkboxe dodati v `src/App.tsx` in `src/TaskBoard.tsx` zunaj povezav v podrobnosti. Ohraniti `data-task-id`, bralne povezave in skupno stanje med pogledoma; izkoristiti ključ projekta za ponastavitev. Urediti prazen projekt in pripravo brez zapisov (R01–R04).

## Uporabniška pot 2 — neodvisno shranjevanje in ponavljanje

- [ ] [T004] V `src/useBulkStatus.ts` izvesti zajem izbora/cilja/naslovov in posamične sočasne klice obstoječega `updateTask`, natanko enega za vsak ID tudi ob enakem stanju. Vsak uspeh v `src/App.tsx` takoj vključiti s funkcijsko spremembo samo `status`; vsako napako obdelati neodvisno. V `src/BulkActions.tsx` prikazati napredek, končni povzetek in napako z ID/naslovom/razlogom. Preprečiti dvojne zahteve in zakleniti vse predpisane kontrole med shranjevanjem (R05–R07, R10, R12).

- [ ] [T005] V `src/useBulkStatus.ts` in `src/BulkActions.tsx` dokončati ponavljanje samo neuspelih z istim ciljem, izbor samo neuspelih, kumulativno štetje različnih uspehov ter zaklepe po napaki. Popoln uspeh počisti izbor/cilj/napake; čiščenje zunaj shranjevanja zavrže celotno operacijo brez zapisov in brez razveljavitve uspehov. Nova operacija začne svoje štetje (R08–R11).

## Dodelava in dokazila

- [ ] [T006] V `src/styles.css` oblikovati kontrolno vrstico, checkboxe in sporočila z obstoječimi gradniki Folio. Preveriti vidni fokus, slovenske oznake, prelamljanje na ozkih zaslonih in ohranitev notranjega drsenja v `src/App.tsx` / `src/TaskBoard.tsx` (dogovor o vmesniku, R12, S8).

- [ ] [T007] V `tests/agent/P02.spec.ts` dodati smiselna preverjanja S1–S3 in S8: izbor enakih naslovov po ID v obeh pogledih, brez odpiranja podrobnosti, skupni/delni/prazni izbor, prazen projekt, cilj in pogoji potrditve, brez zapisov pri pripravi; ohranitev med pogledoma in ponastavitev ob projektu/osvežitvi; natančna telesa zahtev tudi za že doseženi cilj; celotni podatkovni posnetki vseh projektov, oba pogleda, števci, pozneje odprte podrobnosti in ozka širina (R01–R06, R12). Uporabiti `tests/development/helpers.ts` brez spreminjanja.

- [ ] [T008] V `tests/agent/P02.spec.ts` dodati S4–S7: potrjeni uspeh viden ob drugem zadržanem odgovoru, delni in popolni neuspeh, več ponovnih zavrnitev, samo neuspešni v dnevniku ponovitev, kumulativni povzetek, vsa sporočila/zaklepi, hitri kliki in Enter, čiščenje po delnem uspehu ter nova neodvisna operacija. Primerjati vse podatke in natančno število zahtev po ID; preveriti napake/povzetek tudi ob preklopu pogleda (R03, R05–R12).

- [ ] [T009] Izvesti `npm run lint`, `npm run build` in `npm test` z obstoječo konfiguracijo ter shraniti dejanske dnevnike v `docs/agent/P02/`. S tem zajeti `tests/api.spec.ts`, `tests/baseline.spec.ts` za namizni/mobilni prikaz, `tests/development/P02.spec.ts` za oba prikaza in `tests/agent/P02.spec.ts`. Odpraviti odkrite napake v dovoljenih datotekah; ponovno preveriti prizadeti del. Rezultate in morebitne omejitve zapisati v `docs/agent/P02/verification.md`; nobenega neizvedenega testa označiti kot uspešnega.

- [ ] [T010] Posodobiti tabelo sledljivosti R01–R12 v `docs/agent/P02/spec.md` z dejanskimi simboli kode, imeni testov in povezavami na izide v `verification.md`; ohraniti zgodovino specifikacije in po potrebi uskladiti `plan.md`. V `tasks.md` označiti samo dokončane naloge. Pregledati skladnost z izvirnimi zahtevami in nespremenljivost neizbranih podatkov ter zapisati preostale vrzeli. Zadnjo minuto skupnega roka nameniti predaji s spremembami, opravljenimi preverjanji in omejitvami.
