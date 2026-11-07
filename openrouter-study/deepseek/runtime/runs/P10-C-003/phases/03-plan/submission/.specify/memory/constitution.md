# Konstitucija projekta mag-app (pilot P10)

## Temeljna načela

### I. Omejen obseg sprememb (NEDOPUSTNO KRŠITI)

Spremembe so dovoljene samo v `src/`, `tests/agent/` in `docs/agent/` ter v
procesnih datotekah `.specify/memory/constitution.md` in `.specify/feature.json`.
Izhodiščna infrastruktura (strežnik `server/`, skupni tipi `shared/`, skupni
testi, odvisnosti, nastavitve zagona in preverjanja, uradne predloge ter
datoteke veščin) ostane nespremenjena; vsaka sprememba infrastrukture zahteva
vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### II. Podatki izključno prek javnega API-ja

Aplikacija bere in shranjuje podatke samo prek javnega vmesnika `/api/`,
izbira po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne uporablja,
ne bere testnega stanja in ne ponastavlja podatkov. Strežnika se ne nadomešča
z lokalno kopijo podatkov ali `localStorage`; novih zapisovalnih API-jev ni.

### III. Potrjeni dizajn Folio in slovenska poimenovanja

Ohranita se potrjeni videz Folio iz `docs/dizajn.md` in slovensko poimenovanje
vmesnika. Dostopna imena obstoječih pogledov, stolpcev in dejanj ostanejo;
nova dejanja so zunaj povezave opravila, fokus pri tipkovnici je viden, stran
na širini 390 pik pa se ne razširi (notranje drsenje je dovoljeno).

### IV. Sledljivost zahtev in dokazljivi izidi

Vsaka zahteva R01–R12 se poveže s sprejemnim pogojem (kjer je smiselno, s
predikatom), mestom v kodi in dejansko izvedenim preverjanjem. Izida ni
dovoljeno označiti kot uspešnega brez izvedenega testa; neizvedeni testi in
neizpolnjene zahteve se jasno navedejo.

### V. Preverjanje kakovosti

Rešitev se preveri s skupnimi testi izhodišča in z lastnimi testi v
`tests/agent/`. Skupni testi se ne oslabijo ali spreminjajo; končno poročilo
navede izvedena preverjanja, njihove rezultate in omejitve.

## Dodatne omejitve

- Naloga ne širi obsega prek zahtev R01–R12; brez novih odvisnosti in brez
  obveznih arhitekturnih preureditev.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu; trajna shramba
  in URL-ji se ne uvajajo, razen če posamezna zahteva določa drugače.
- Dokumentacija se ne podvaja; skupna predloga P10 se lahko izpolni s
  povezavami na dokumente Spec Kit.

## Razvojni potek

Zaporedje: specifikacija (`spec.md`) → načrt (`plan.md`) → naloge
(`tasks.md`) → izvedba in preverjanje. Specifikacija, načrt in naloge živijo
v `docs/agent/P10/`; izvedba sledi omejitvam iz načela I.

## Upravljanje

Ta konstitucija velja za celoten pilot P10 in prevlada nad drugimi praksami,
kjer si nasprotujejo. Spremembe se dokumentirajo v tem dokumentu; razširitev
obsega ali sprememba infrastrukture ni dovoljena brez vnaprej dogovorjene
posodobitve izhodišča.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-13 | **Zadnja sprememba**: 2026-10-13
