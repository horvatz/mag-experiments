# Folio (P10) Constitution

Projektna načela za nalogo P10 v aplikaciji Folio. Povzeta so iz
`PROJECT_RULES.md`, `task/instructions.md` in skupne predloge specifikacije.
Ne dodajajo novih zahtev; omejitve iz izhodišča veljajo nespremenjeno.

## Core Principles

### I. Omejena površina sprememb
Spreminjajo se samo `src/`, lastni testi v `tests/agent/` in dokumenti v
`docs/agent/`; postopek C sme urediti le še `.specify/memory/constitution.md`
in `.specify/feature.json`. Strežnik, skupni tipi, skupni testi, odvisnosti in
nastavitve so samo berljivi. Sprememba skupne infrastrukture bi zahtevala
vnaprej dogovorjeno posodobitev izhodišča za vse postopke.

### II. Javni API kot edini vir podatkov
Aplikacija bere in shranjuje podatke izključno prek obstoječega javnega
vmesnika `/api/` in izbira po `id`. Testnih kontrol `/__test/` uporabniški
vmesnik ne sme uporabljati, brati ali uvažati; strežnika se ne nadomešča z
lokalno kopijo podatkov ali `localStorage`. Novih zapisovalnih API-jev ni.

### III. Ohranjen potrjeni dizajn in slovenski vmesnik
Potrjeni videz Folio iz `docs/dizajn.md` ostane nespremenjen; dopolnitve
uporabljajo obstoječe gradnike in slogovne spremenljivke. Slovensko
poimenovanje, obstoječa dostopna imena, `data-task-id` in `aria-label` elementi
se ohranijo; nova dejanja so zunaj povezave opravila, fokus ostane viden.

### IV. Preverjeno, ne domnevano (NON-NEGOTIABLE)
Vsaka zahteva R01–R12 se preveri z dejansko izvedenimi testi: skupnimi
regresijskimi in lastnimi v `tests/agent/`. Neizvedenih testov ni dovoljeno
navajati kot uspešnih; nepreverjeni deli in omejitve se izrecno zapišejo.
Dokazi se beležijo sproti (ime testa, dnevnik zagona) in so sledljivi do
pogoja, kode in zahteve.

### V. Lokalno stanje trenutnega projekta
Stanje funkcionalnosti je lokalno trenutnemu projektu; trajna shramba in
novi URL-ji niso predvideni, če zahteva tega ne določa. Menjava projekta ali
osvežitev ponastavi stanje na izhodišče. Obseg naloge se ne širi; zahteve
izhodišča so merilo tudi, če jih dokumentacija izpusti.

## Additional Constraints

- Skupna predloga P10 in vseh dvanajst zahtev ostaneta obvezni; dokumenti se
  ne podvajajo, ampak se povezujejo na ustrezne dele Spec Kit dokumentov.
- Lean potek uporablja neposredna navodila veščin; ločene splošne predloge
  niso obvezne.
- Uporabljajo se samo lokalni viri: koda izhodišča in priložena navodila.
  Javni internet, drugi projekti in zunanji priključki niso dostopni.
- Git veje in commiti se med potekom ne ustvarjajo.

## Development Workflow

1. Specifikacija po skupni predlogi poveže vsako zahtevo R01–R12 s pogoji,
   kodo in dejansko izvedenimi testi.
2. Izvedba sledi načrtu iz `.specify`; odprta vprašanja se rešujejo iz
   obstoječih zahtev, bistvena manjkajoča dejstva pa se dokumentirajo kot
   omejitev brez izmišljenih odgovorov.
3. Predaja navede spremembe, izvedena preverjanja, rezultate in neizpolnjene
   zahteve; neizvedeni testi se navedejo kot neizvedeni.

## Governance

To ustavo nadomešča druga navodila le, kadar so izrecno navedena v nalogi.
Spremembe načel zahtevajo dokumentiran razlog in uskladitev z `PROJECT_RULES.md`;
obseg sprememb ostaja znotraj dovoljenih poti. Vsak korak Spec Kit mora
preveriti skladnost s temi načeli, preden se šteje za zaključen.

**Version**: 1.0.0 | **Ratified**: 2026-10-09 | **Last Amended**: 2026-10-09
