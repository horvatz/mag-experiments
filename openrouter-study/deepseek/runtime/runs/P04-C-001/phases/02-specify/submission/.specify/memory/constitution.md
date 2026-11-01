# Ustava projekta Folio (P04)

## Osnovna načela

### I. Meja sprememb je nespremenljiva
Dovoljene spremembe so koda uporabniškega vmesnika v `src/`, lastni dodatni
testi v `tests/agent/` in lastna dokumentacija v `docs/agent/`. Začetni
podatki, strežnik v `server/`, skupni tipi v `shared/`, skupni testi, odvisnosti
ter nastavitve zagona in preverjanja ostanejo enaki; sprememba skupne
infrastrukture ni dovoljena.

### II. Potrjeni dizajn Folio ostane
Obstoječi vmesnik se dopolni, ne preoblikuje. Uporabljajo se obstoječi gradniki
in slogovne spremenljivke ter slovenska poimenovanja; potrjeni videz Folio iz
`docs/dizajn.md` je zavezujoč. Fokus pri tipkovnici ostane viden, stran se na
ozkem zaslonu ne razširi prek prikaza.

### III. Podatki samo prek javnega API-ja
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`
in izbira po `id`. Testnih kontrol `/__test/` uporabniški vmesnik ne uvaža,
ne uporablja in ne bere; strežnika se ne nadomešča z lokalno kopijo podatkov
ali `localStorage`. Novi zapisovalni API-ji se ne dodajajo.

### IV. Preverjanje z dejansko izvedbo (NESPREMENLJIVO)
Vsaka zahteva je preverjena s skupnimi in lastnimi testi, ki so zares izvedeni.
Rezultata se ne navaja kot uspešnega brez dejanske izvedbe; neizvedeni ali
nedostopni testi se zapišejo kot neizvedeni skupaj z omejitvami. Razvrščanje in
druge spremembe stanja so projekcija: ne spreminjajo polj opravil niti ne
pošiljajo zapisov na API brez zahteve.

### V. Obseg ostane zvest izvirnim zahtevam
Izvirne zahteve so merilo, tudi če jih dokumentacija izpusti. Obseg se ne širi
prek zahtev R01–R12; odprta vprašanja se rešujejo iz obstoječih zahtev, če
bistvenega podatka ni, se omejitev jasno navede in postopek ustavi.

## Omejitve

- Orodja in različice so določeni z izhodiščem (`package.json`, `.nvmrc`);
  novih odvisnosti ni.
- Delo poteka lokalno brez javnega interneta in brez novih vej ali commitov.

## Razvojni potek

- Vsaka zahteva iz navodil se poveže s pogoji, kodo in dejansko izvedenimi
  testi po skupni predlogi specifikacije.
- Dokazi se pišejo sproti in jedrnato; dokumenti se ne podvajajo.
- Ob koncu se opišejo spremembe, izvedena preverjanja, njihovi rezultati in
  neizpolnjene zahteve.

## Upravljanje

Ta ustava velja za vse delo v tem repozitoriju; navodila naloge in projektna
pravila imajo prednost pred njo. Spremembe ustave se zabeležijo v tem dokumentu
z datumom in razlogom.

**Različica**: 1.0.0 | **Sprejeta**: 2026-11-01 | **Zadnja sprememba**: 2026-11-01
