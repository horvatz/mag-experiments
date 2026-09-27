# Priprava okolja za postopek C

Merjeni protokol in dovoljene spremembe opisuje [protokol C](pilot-c-protocol.md).
Ta dokument opisuje pripravo pred začetkom merjenja. Izvedeni piloti uporabljajo
macOS, Node.js 24.11.1, Python 3.12.14 in Codex CLI 0.154.0. Nastavitve in
točne poti posameznega zagona ostanejo v njegovem arhivu.

## Spec Kit in Python

V `vendor/` sta ohranjeni izvirna predloga Spec Kit 1.0.8 in predloga z
uradnim presetom Lean 1.0.0. Za ponovitev C/0.2 uporabimo slednjo.
Njeno vsebino in izvor preverimo s `provenance.json`; med meritvijo se
predloge ne prenašajo s spleta in ne posodabljajo.

Pred pripravo izvoza potrebujemo ločeno Python okolje v
`.work/tools/spec-kit-cli-1.0.8`. Ustvarimo ga s Python 3.12.14. Spec Kit
namestimo iz uradnega arhiva oznake `v1.0.8`, ostale odvisnosti pa v
različicah iz `vendor/spec-kit-1.0.8-lean/setup-requirements.txt`.
Vrstica `specify-cli==1.0.8` v tem seznamu dokumentira različico lokalno
zgrajenega paketa; ne pomeni, da je bila nameščena iz registra PyPI.

Uradni vir je <https://api.github.com/repos/github/spec-kit/tarball/v1.0.8>.
SHA-256 uporabljenega arhiva je
`0ca3bd58519f61125aeb20f0bb79ccdfba728aecda78c5e70f75b5016f52edef`.
Pri pripravi preverimo tudi commit
`0cc9a6a1159471a3108b9bad718ba17006dd6039` in PyYAML 6.0.3.
Drugo pot do okolja lahko podamo z `MAG_SPECKIT_RUNTIME`.

Python okolje je agentu samo berljivo. Izvajalnik pred začetkom preveri
njegove kontrolne vsote; te so v `spec-kit-runtime.json.gz` ob rezultatu.
Začasne datoteke in predpomnilniki nastajajo v izvozu aplikacije. Za macOS
je v pripravi vključena majhna prilagoditev `mktemp`, opisana v protokolu.

## Zaporedje zagona

Najprej zapremo referenčne in prejšnje kandidatove predoglede. Uporabimo
nov identifikator, na primer `P01-C-003`; začetih meritev ne prepisujemo.
`MAG_PILOT_CODEX` mora kazati na pripeti izvršni program CLI 0.154.0.

```sh
node scripts/prepare-pilot.mjs P01-C-003
node scripts/pilot-browser.mjs P01-C-003
```

Brskalnik pustimo zagnan. V drugem terminalu:

```sh
node scripts/preflight-pilot.mjs P01-C-003
node scripts/run-pilot.mjs P01-C-003
```

Meritev začnemo samo po uspešnem preverjanju vseh šestih meja pisanja,
izolacije, uradnega razreševanja predlog in 38 osnovnih testov. Izvajalnik
zavrne spremenjeno pripravljeno okolje. Če je potreben popravek priprave,
pred zagonom ustvarimo nov izvoz. Med meritvijo ne spreminjamo navodil,
izvajalnika ali kandidatove kode.

Po koncu ustavimo samo brskalnik tega pilota in izvedemo:

```sh
node scripts/reconcile-pilot-usage.mjs P01-C-003
node scripts/evaluate-pilot.mjs P01-C-003
node scripts/archive-pilot.mjs P01-C-003
```

Ocena uporabi zamrznjeno oddajo. Arhiv hranimo tudi ob neuspelem postopku;
človeško poročilo dopolnimo z dejanskim izidom in omejitvami. Ne spreminjamo
oddaje, surovih dnevnikov ali podatkov o porabi. Pri prekinjeni fazi delna
poraba ostane označena kot nepopolna.
