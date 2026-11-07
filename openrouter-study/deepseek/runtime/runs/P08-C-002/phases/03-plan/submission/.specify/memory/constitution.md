# Folio — Projektna ustava

## Temeljna načela

### I. Zvestoba izvirnim zahtevam
Izvirne zahteve naloge (R01–R12 v `task/instructions.md`) so merilo rešitve
tudi, če jih kateri dokument izpusti. Vsaka zahteva mora biti povezana s
pogojem, kodo in dejansko izvedenim testom po skupni predlogi
`task/specification-template.md`. Neizvedenih preverjanj ni dovoljeno
navajati kot uspešnih.

### II. Zaprte meje sprememb (NESPRENEMLJIVO)
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`; postopek C dodatno `.specify/memory/constitution.md` in
`.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi
`tests/baseline.spec.ts` in `tests/api.spec.ts`, odvisnosti ter nastavitve
zagona in preverjanja ostanejo nespremenjeni. Nove odvisnosti in obvezne
arhitekturne preureditve niso dovoljene; razširitev obsega naloge bi
zahtevala enako, vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### III. Javni vmesnik in podatki
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`,
zapisi se izbirajo po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne
sme uvažati ali uporabljati, ne bere testnega stanja in ne ponastavlja
podatkov. Strežnika ni dovoljeno nadomeščati z lokalno kopijo podatkov ali
`localStorage`. Novih zapisovalnih API-jev ni.

### IV. Potrjeni dizajn Folio (NESPRENEMLJIVO)
Ohranita se slovenska poimenovanja in potrjeni videz Folio iz
`docs/dizajn.md` z obstoječimi gradniki in slogovnimi spremenljivkami.
Ohranijo se dostopna imena obstoječih pogledov in stolpcev,
`aria-label="Pregled stanj opravil"`, `data-task-id` na vrsticah in karticah
ter odzivnost na širini 390 pik (notranje drsenje preglednice in table je
dovoljeno). Nova dejanja ob opravilu so zunaj njegove povezave.

### V. Poštena predaja
Ob koncu se jedrnato zapišejo spremembe, izvedena preverjanja, njihovi
rezultati in neizpolnjene zahteve. Izvor rezultata mora biti določljiv (ime
testa, dnevnik zagona). Skupni testi izhodišča in lastna preverjanja v
`tests/agent/` se izvedejo; nepreverjeni deli in omejitve se izrecno
navedejo.

## Upravljanje
Ta ustava je nadrejena drugim praksam te naloge. Sprememba zahteva
dokumentiran razlog in posodobitev tega dokumenta; meje iz načela II veljajo
brez izjeme. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je
stanje nove funkcionalnosti lokalno trenutnemu projektu.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-13 | **Zadnja sprememba**: 2026-10-13
