# Folio (P03) Constitution

## Core Principles

### I. Omejena sprememba (NON-NEGOTIABLE)
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`. Za postopek C se smeta spreminjati tudi
`.specify/memory/constitution.md` in `.specify/feature.json`. Vse ostalo —
`server/`, `shared/`, skupni testi (`tests/baseline.spec.ts`,
`tests/api.spec.ts`), odvisnosti, nastavitve zagona in preverjanja, uradne
predloge in datoteke veščin — je samo berljivo. Sprememba skupne
infrastrukture bi zahtevala vnaprej dogovorjeno posodobitev izhodišča za vse
postopke, zato je ta naloga ne sme uvesti.

### II. Javni vmesnik /api/ je edini vir podatkov
Aplikacija bere in shranjuje podatke izključno prek javnega API-ja `/api/`,
izbira po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne uvaža, ne
bere in ne uporablja za nastavljanje odzivov ali ponastavljanje podatkov.
Strežnika se ne nadomešča z lokalno kopijo podatkov ali `localStorage`.
Nobenega novega zapisovalnega API-ja se ne dodaja; dejanja filtriranja ne
pošiljajo POST/PATCH/PUT/DELETE na `/api/`.

### III. Ohranjeni Folio in slovenski vmesnik
Potrjeni dizajn Folio (`docs/dizajn.md`) in obstoječa slovenska poimenovanja
se ohranijo. Uporabljajo se obstoječi gradniki in slogovne spremenljivke.
Obstoječa navigacija, bralne podrobnosti, dostopna imena, `data-task-id` in
`aria-label` oznake ostanejo; stran se pri širini 390 pik ne razširi, fokus
ostane viden, dekorativne ikone so `aria-hidden`.

### IV. Zahteve naloge so merilo
Izvirne zahteve R01–R12 iz `task/instructions.md` so sprejemno merilo, tudi
če bi jih specifikacija izpustila. Obseg se ne širi: brez novih zahtev,
odvisnosti ali obveznih arhitekturnih preureditev. Če zahteva ne določa
trajne shrambe ali URL-ja, je stanje funkcionalnosti lokalno trenutnemu
projektu.

### V. Resnično preverjanje in sledljivost
Vsaka zahteva se poveže s pogojem, kodo in dejansko izvedenim preverjanjem.
Dokazi se pišejo sproti in jedrnato; dokumentov se ne podvaja. Neizvedenih
testov se ne navaja kot uspešnih, nepreverjeni deli in omejitve se jasno
zapišejo. Preverjanje zajema skupne teste, lastne teste v `tests/agent/` in
dokumentirane ročne kontrole (npr. ozka širina, Folio videz).

## Dodatne omejitve

Stanje nove funkcionalnosti je lokalno trenutnemu projektu; filtri se ne
shranjujejo v URL ali trajno shrambo brskalnika. Javni pripomoček razvojnih
testov je testni mehanizem in ni del aplikacije. Raziskovanje pomeni pregled
lokalne kode in priloženih navodil.

## Razvojni tok

Spec Kit koraki se izvajajo v predpisanem vrstnem redu z lokalnimi
veščinami; veja in commit se ne ustvarjata. Spremembe se sproti shranjujejo,
preostanek časa se preverja z `node task/time-budget.mjs`. Zadnja minuta
roka je namenjena predaji in končnemu odgovoru.

## Governance

Ta ustava prevlada nad drugimi praksami znotraj svojega obsega. Spremembe
ustave morajo biti dokumentirane in utemeljene z izvirnimi zahtevami ali
`PROJECT_RULES.md`; neskladnost se odpravi pred zaključkom naloge.
Nasprotja med dokumenti se razrešujejo po vrstnem redu: navodila naloge,
`PROJECT_RULES.md`, ta ustava, specifikacija in načrt.

**Version**: 1.0.0 | **Ratified**: 2026-10-09 | **Last Amended**: 2026-10-09
