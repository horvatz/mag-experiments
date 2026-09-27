# P02: priprava drugega pilota

P02 je samostojna naloga množičnega spreminjanja stanja opravil z delnimi
neuspehi. Izhaja iz istega pripetega commita Folio kot P01 in ne vsebuje
implementacije P01. Njena zahteva je v `tasks/P02/instructions.md`, referenčna
pravila in sledljivost v `docs/P02-reference-specification.md`.

## Gradivo

- `tasks/P02/`: skupna navodila v0.1, predloga specifikacije, izhodišče,
  štirje razvojni scenariji in javni testni pripomoček.
- `reference/P02/overlay/`: ločena referenčna implementacija. Spreminja samo
  kodo v `src/`; izvirna aplikacija in rešitev P01 ostajata ločeni.
- `evaluation/P02/`: trinajst končnih scenarijev in deset namernih napak.
- `playwright.p02.config.ts`: P02 uporablja lastna vrata in delovne kopije.
- `reports/P02-reference-summary.json` in `reports/P02-mutation-summary.json`:
  dejanski rezultati, datum, različice in kontrolne vsote preverjenih virov.

## Preverjanje in ogled

Iz korena `mag-experiments`, z že nameščenimi zaklenjenimi odvisnostmi in
Chromiumom ter Node.js 24.11.1:

```sh
npm run test:p02
npm run test:p02:mutations
npm run dev:p02
```

Predogled je na `http://127.0.0.1:5185`, njegov podatkovni strežnik na 3113.
Običajen predogled nima testnih kontrol; za preizkus napak je namenjen
samodejni testni zagon na vratih 5186/3114. Ti podatki so ločeni od P01 in
osnovne aplikacije. Priprava izvozi pripeti Git commit v `.work/P02/baseline`
in `.work/P02/reference`; morebitni obstoječi ustvarjeni kopiji se obnovita.
Referenco urejamo samo v `reference/P02/overlay/`.

| Sklop | Scenariji | Izvedbe |
| --- | ---: | ---: |
| Osnovni API | 14 | 14 |
| Osnovni vmesnik | 12 | 24 |
| Razvojni P02 | 4 | 8 |
| Končni P02 | 13 | 26 |
| Skupaj | 43 | 72 |

Vmesnik se preverja v Chromiumu pri 1440 × 960 in z emulacijo iPhone 13.
To ni preizkus fizičnega telefona ali brskalnika Safari. Vseh 72 izvedb so
**preverjanja ene reference**, ne 72 merjenih izvedb agentov. Testi niso
dokaz popolnosti; namerne napake pokrijejo deset konkretnih odstopanj.

## Pripravljeno izvajanje A, B in C

Izvajalnik zdaj podpira ID-je P01 in P02 pri pripravi, pozivih, vlogah,
ocenjevanju in arhiviranju. Pregled pri B mora zajeti R01–R12; pri C so
dokumenti in meje pisanja vezani na `docs/agent/P02`. Pretekli arhivi
P01 ostanejo veljavni zapisi takratnih protokolov.

[Protokol P02/1](p02-pilot-protocol.md) je določen pred meritvami: isti
model GPT-6 Astra z xhigh, CLI 0.154.0 in skupna meja 20 minut za vsak
postopek. Vsi trije izvozi imajo enakih 16 vsebinskih vhodnih datotek,
vključno s kodo izhodišča, navodili in razvojnimi testi; dokazilo je v
`reports/P02-pilot-preparation.json`. Izvajalnik in ocenjevalna merila
so vezani na kontrolne vsote, shranjene ob pripravi.

Izolacija je preverjena pred vsako izvedbo. Tehnična kopija P02-A-000
je brez klica modela prestala 46/46 preverjanj z referenco; nato je bila
premaknjena v `.work/setup-attempts/P02-public-tests-reference-control`.
Ne uporablja se za modelsko izvedbo. Dokazilo in stisnjen dnevnik sta v
`reports/P02-export-check.json` ter `reports/P02-export-check.log.gz`.
Sveži merjeni izvozi ne vsebujejo reference ali končnih testov.

Pri C je preverjeno tudi, da prijavna lupina uporabi Python 3.12.14 in
PyYAML 6.0.3 iz pripetega okolja. Prilagoditev velja samo za izvoz;
uporabnikovih nastavitev ne spreminja.

Vsi trije modelski piloti so izvedeni in arhivirani: A, B in C so zaključili
predpisane korake ter vsak opravili 72/72 neodvisnih preverjanj. Rezultati,
časi, poraba in omejitve so v [pregledu P02](p02-results.md).
Uradni preizkus predpogojev Spec Kit je uspel tudi med dejanskim zagonom C.

Pred glavnimi meritvami še vedno ostajajo dejanski preizkus vrnitve zahtevanih
popravkov pri B/C, merjenje porabe ob prekinitvah in zamrznitev končnega
protokola, nalog ter ocenjevalne rubrike. Ponovitev
neuspelega shranjevanja znotraj aplikacije P02 ni preizkus agentove povratne
zanke po pregledu kode; to sta različni preverjanji.
