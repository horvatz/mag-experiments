# Ustava projekta Folio (pilot P04)

Kratka projektna načela, izpeljana iz `PROJECT_RULES.md`, `task/instructions.md`
in skupne predloge `task/specification-template.md`. Ne uvaja novih zahtev,
odvisnosti ali obveznih arhitekturnih preureditev.

## Temeljna načela

### I. Zvestoba izvirnim zahtevam (NEPOGOJNO)
Izvirne zahteve R01–R12 iz `task/instructions.md` so merilo, tudi če jih
specifikacija ali načrt izpustita. Zahtev se ne širi, ne oži in ne razlaga
po domisleku; odprta vprašanja se rešujejo iz obstoječih zahtev, bistvene
omejitve pa se jasno zapišejo.

### II. Stroge meje dovoljenih sprememb (NEPOGOJNO)
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`; postopek C dodatno `docs/agent/P04/`, `.specify/memory/constitution.md`
in `.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi
(`tests/baseline.spec.ts`, `tests/api.spec.ts`), odvisnosti ter zagonske in
preveritvene nastavitve ostanejo nespremenjeni. Sprememba skupne
infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### III. Podatki izključno prek javnega API-ja (NEPOGOJNO)
Aplikacija bere in shranjuje podatke samo prek javnega vmesnika `/api/` in
opravila izbira po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne
uvaža, ne uporablja in ne bere; strežnika se ne nadomešča z lokalno kopijo
podatkov ali `localStorage`. Novih zapisovalnih API-jev se ne dodaja.

### IV. Potrjeni dizajn in slovensko poimenovanje
Ohranita se potrjeni videz Folio iz `docs/dizajn.md` (gradniki in slogovne
spremenljivke) in slovensko poimenovanje obstoječih pogledov, stolpcev in
kontrol, vključno z `data-task-id`, dostopnimi imeni in
`aria-label="Pregled stanj opravil"`. Razporeditev novih kontrol ni
predpisana; stran se pri širini 390 pik ne razširi (notranje drsenje je
dovoljeno).

### V. Dokazljivo preverjanje in sledljivost
Vsaka zahteva je povezana s pogojem, mestom v kodi in dejansko izvedenim
testom; ločiti je treba splošno pravilo od posameznega testnega primera.
Preverjanje poteka s skupnimi testi in z lastnimi preverjanji v `tests/agent/`.
Nobenega izida se ne označi kot uspešnega brez dejanske izvedbe; neizvedeni
testi in nepreverjeni deli se izrecno navedejo, neizpolnjene zahteve pa se
opišejo. Poročilo na koncu navede spremembe, izvedena preverjanja, njihove
rezultate in omejitve.

## Pravila sodelovanja

- Specifikacija se pripravi po skupni predlogi `task/specification-template.md`
  in vsebuje preglednico zahtev (R… → pravilo/sprejemni pogoj → način
  preverjanja) ter preglednico sledljivosti (R… → pogoj → test/scenarij →
  datoteka in del kode → izid in dokaz). Povezovanje na dokumente je
  dovoljeno; dokumentov se ne podvaja.
- Spremembe so minimalne in osredotočene na nalogo; obseg ostaja znotraj
  opisanih zahtev in domene podatkov.
- Potek pilotov je zaporedje uradnih lokalnih veščin Spec Kit; en agent,
  brez vej in brez zavezujočih korakov zunaj tega postopka.

## Upravljanje

Ta ustava nadreja drugim praksam v tem repozitoriju. Spremembe zahtevajo
zapis v tem dokumentu in veljajo za vse postopke enako; razširitve obsega
naloge ali spremembe infrastrukture v ustavi niso dovoljene. Če je navodilo
v nasprotju z ustavo, se upošteva ustava, razen če ga izrecno odobri
izvajalec pilotov.

**Version**: 1.0.0 | **Ratified**: 2026-10-11 | **Last Amended**: 2026-10-11
