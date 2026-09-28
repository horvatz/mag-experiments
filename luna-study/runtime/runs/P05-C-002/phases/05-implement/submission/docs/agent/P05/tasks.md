# Naloge izvedbe P05

## Setup

- [ ] [T001] V `tests/agent/P05.spec.ts` pripravi lastno testno nastavitev z nadzorovanimi GET podatki ter pomočnike za branje in primerjavo `data-task-id`; preveri začetni prikaz in vrstni red po R01.

## Foundational

- [ ] [T002] V `src/App.tsx` dodaj lokalno stanje velikosti, filtra in strani ter izračun filtriranega seznama in njegovega odseka; pokrij velikosti `all/2/5/10`, robno navigacijo in ponastavitev ob spremembi velikosti ali filtra (R01–R05).

## User stories

- [ ] [T003] V `src/App.tsx` dodaj dostopna selecta, štiri navigacijske gumbe in status z določenim besedilom za neprazen ali prazen rezultat; robne gumbe onemogoči (R03, R09–R10).
- [ ] [T004] V `src/App.tsx` posreduj isti odsek preglednici in tabli, ohrani obseg preglednih števcev ter preveri, da lokalno stanje preživi menjavo pogleda in podrobnosti, ob projektu ali osvežitvi pa se ponastavi (R06–R08, R11).
- [ ] [T005] V `src/styles.css` oblikuj kontrole z obstoječimi Folio spremenljivkami in zagotovi, da pri 390 px stran ne dobi vodoravnega preliva; drsenje naj ostane znotraj preglednice ali table (R12).

## Polish

- [ ] [T006] V `tests/agent/P05.spec.ts` dodaj preverjanja za razrez brez izgubljenih/podvojenih ID-jev, robove in spremembo velikosti, pri kateri stara stran ostane veljavna, filter pred straničenjem, oba pogleda, podrobnosti, menjavo projekta in osvežitev, prazne rezultate, števce, ohranjena imena in `data-task-id`, povezave ter odsotnost zapisovalnih zahtev in preliva (R02–R12).
- [ ] [T007] Izvedi lastne, razvojne in skupne regresijske teste ter lint in build; nato v `docs/agent/P05/spec.md` za vsak R01–R12 zabeleži ciljno kodo, dejansko izvedeni scenarij in dokaz, neizvedene teste pa označi kot nepreverjene.
