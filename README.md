# mag-experiments

Gradivo in orodja za pripravo eksperimentov magistrske naloge. Prvi korak je
P01: urejanje naslova in stanja opravila v aplikaciji Folio (`mag-app`).

Osnova in referenca uporabljata potrjeni dizajn Folio z lebdečim stranskim
menijem. Natančna skupna različica je zapisana v `baseline.json`.

Repozitorij vsebuje skupna navodila, razvojne teste, ločeno referenčno rešitev
in končna preverjanja. Namenjen je avtorju raziskave. Agentom pri primerjavi
ne priključimo tega repozitorija ali nadrejene mape `mag`.

## Glavna raziskava P03–P10

Po naročilu avtorja je obseg glavne zbirke 8 nalog × 3 postopki × 3
ponovitve = 72 izvedb. P01/P02 sta zaključena pilota in ostajata ločena.
Tehnična kvalifikacija povratnih zank B/C in prekinitve je zaključena;
[rezultati kvalifikacije](docs/qualification-results.md) vsebujejo dokazila.

- [Načrt in osem nalog](docs/main-experiment-plan.md).
- [Protokol M/1.0](docs/main-protocol.md) in [vnaprejšnja rubrika](docs/main-rubric.md).
- [Vrstni red 72 izvedb](main-study/schedule.json).
- [Trenutna zbirka in rezultati](main-study/analysis/results.md).
- `main-study/frozen-inputs.json` je dokaz zamrznitve, ko ta datoteka obstaja.

Vsaka glavna referenca ima 70 preverjanj in šest prevodljivih namernih
napak. Delovne kopije so izločene iz Gita; zaključene oddaje, dogodki,
neodvisne ocene in uporabljeni protokoli se ohranijo v `runs/<ID>/`.
`main-study/status.json` in `active.json` pokažeta napredek čakalne vrste.
Za raziskovalca: `node scripts/main-study.mjs status`, po zamrznitvi
`node scripts/main-study.mjs run`; nadaljevanje ne ponavlja merjenih ID-jev.
Spodnji razdelki ohranjajo navodila in zgodovino pilotov.

## Kaj je pripravljeno

- `baseline.json`: natančni commit začetne aplikacije in različica P01.
- `tasks/P01/`: navodila v0.2, predloga specifikacije in štirje razvojni testi D01–D04.
- `reference/P01/overlay/`: pet datotek, s katerimi iz osnovne aplikacije
  sestavimo referenčno rešitev; spremembe so omejene na uporabniški vmesnik.
  Osnovni `styles.css` se prenese iz pripetega commita; `editor.css` doda
  samo slog obrazca P01, brez podvajanja postavitve aplikacije.
- `evaluation/P01/acceptance.spec.ts`: enajst ločenih končnih scenarijev E01–E11.
- `evaluation/P01/mutations.mjs`: osem namernih napak za preverjanje testov.
- `reports/`: povzetki opravljenih preverjanj z različicami in kontrolnimi vsotami virov.
- `docs/P01-reference-specification.md`: referenčna pravila in povezava med zahtevami, kodo in preverjanji.
- `docs/verification.md`: povzetek preverjanja z rezultatom 68/68 in zaznanimi 8/8 namernimi napakami.

`evaluation/P01/test-plan.md` ohranja izvirni načrt v0.1 za sled zgodovine.
Za trenutno preverjanje veljajo navodila v0.2 in izvršljivi scenariji.
V0.2 vključuje tudi tablo in števce stanj ter javni dogovor o oznakah polj,
sporočil in kontrol, da končni testi ne uvajajo skritih zahtev za vmesnik.

## Priprava in zagon

Potreben je Node.js 24.11.1 in lokalni klon zasebnega `horvatz/mag-app`, ki
vsebuje commit iz `baseline.json`. Privzeta pot do njega je `../aplikacija`.
Na drugem računalniku pot določiš z `MAG_APP_REPOSITORY`, na primer:

```sh
gh repo clone horvatz/mag-app ../mag-app
export MAG_APP_REPOSITORY=../mag-app
npm ci
npx playwright install chromium
npm run test:reference
```

Priprava uporabi `git archive` navedenega commita, zato spremembe v delovni
mapi `mag-app` ne vplivajo na izhodišče. Ustvari kopiji `.work/baseline` in
`.work/reference`, nato referenci doda datoteke iz `reference/P01/overlay`.
Mapa `.work` je ustvarjeno delovno gradivo in ni vključena v Git.

Referenco spreminjaj v `reference/P01/overlay`, nato ponovno zaženi pripravo.
Ukaza za preverjanje obnovita ustvarjeni kopiji; ročne spremembe v njima
se ob tem zavržejo. Izvirnega klona `mag-app` ne spreminjata.

Za lokalni ogled preverjene reference:

```sh
npm run dev:reference
```

Odpri <http://127.0.0.1:5183>. V podrobnostih opravila je gumb »Uredi«.
Uspešno shranjevanje posodobi preglednico, tablo, podrobnosti in števce;
preklic zavrže vnos. Podatki tega strežnika so ločeni od osnovne aplikacije
na vratih 5173 in se ob ponovnem zagonu obnovijo.

## Preverjanje reference

`npm run test:reference` pripravi kopiji, preveri tipe testov ter slog, tipe
in gradnjo reference, nato izvede 68 preverjanj:

| Sklop | Scenariji | Izvedbe |
| --- | ---: | ---: |
| Skupni testi strežnika | 14 | 14 |
| Skupni scenariji vmesnika | 12 | 24, računalnik in emulacija telefona |
| Razvojni testi P01 | 4 | 8, računalnik in emulacija telefona |
| Končni scenariji P01 | 11 | 22, računalnik in emulacija telefona |

Testni strežnik uporablja vrata 3112, testni vmesnik pa 5184. Vsak test začne
z obnovljenimi podatki. Testi se izvajajo zaporedno in brez ponovitev ob
neuspehu. Uporabljen je Chromium; emulacija telefona ni preizkus na fizičnem
iPhonu ali v Safariju.

Testni strežnik in njegovi začetni podatki se naložijo iz pripete osnovne
različice, ne iz kode kandidata. Slogi in aplikacijska koda so iz izbrane
delovne kopije. Končni testi berejo stanje prek zaupanja vrednega testnega
vmesnika in ne uvažajo referenčne ali kandidatove normalizacije oziroma pravil.

Celoten lokalni izpis je v `reports/reference-results.json`, trajni povzetek
pa v `reports/reference-summary.json`. Za ločen zagon samo dela testov sta
na voljo `npm run test:development` in `npm run test:evaluation`; pripravljeni
kopiji morata že obstajati. Ta ukaza ne nadomestita celotnega preverjanja.

## Preverjanje z namernimi napakami

Po uspešnem celotnem preverjanju zaženi:

```sh
npm run test:mutations
```

Ukaz zahteva uspešno preverjanje istih virov. Vsako napako uvede v svojo
kopijo, preveri, da se ta prevede, nato zažene izbrani končni scenarij na
računalniškem prikazu. Napaka je zaznana le, če odpove pričakovano preverjanje;
napake zagona in prevajanja se ne štejejo za uspešno zaznavo. Poročilo je v
`reports/mutation-summary.json`, podrobnosti pa v `.work/mutation-reports`
in `.work/mutation-traces`.

To preveri osem konkretnih napak. Ne dokazuje popolnosti testov ali pravilnosti
za vsa mogoča stanja. Izvirna referenca ostane ločena od napačnih kopij.

## Piloti P01

En agent je na nalogi P01 v 13 minutah in 21 sekundah pripravil specifikacijo,
implementacijo urejanja in lastne teste. Neodvisna ocena je uspešna: 68/68
preverjanj, od tega 22 izvedb skritih končnih scenarijev. Spremembe so ostale
znotraj dovoljenih datotek. Osnovna aplikacija mag-app je nespremenjena.

[Poročilo P01-A-001](runs/P01-A-001/report.md) vsebuje rezultat, čas in porabo;
ob njem so predaja, navodila, nastavitve in dnevniki.
[Protokol pilota](docs/pilot-protocol.md) opisuje izvoz gradiva, omejitve
dostopa, testni brskalnik, ustavitev in preverjanje predaje.

Izvedeni so trije poskusi B. Prvi se je ustavil brez specifikacije, drugi
brez končne predaje pregledovalca. Tretji se je po izboljšavi predaj in
časovne razporeditve uspešno zaključil v 15 minutah in 11 sekundah. Vse
tri vloge so oddale predajo, koda pa je opravila 68/68 neodvisnih preverjanj.
Popravki po pregledu niso bili zahtevani; nadaljevanje prvotnih sej je
preverjeno s simulacijo izvajalnika, še ne v dejanski fazi popravljanja.

[Poročilo B-003](runs/P01-B-003/report.md), [protokol B](docs/pilot-b-protocol.md)
in [pregled vseh pilotov](docs/pilot-results.md) ohranjajo tudi neuspešne
poskuse ter spremembe protokola.

Opravljena sta tudi dva poskusa C s Spec Kit. Prvi je opravil 68/68
preverjanj kode, vendar ni zaključil predaje implementacije. Drugi je
z uradnim presetom Lean uspešno zaključil vseh šest korakov v 15 minutah
in 52 sekundah ter opravil vseh 68 neodvisnih preverjanj. Celotna poraba
je zabeležena. [Poročilo C-002](runs/P01-C-002/report.md),
[protokol C](docs/pilot-c-protocol.md) in [priprava okolja C](docs/pilot-c-setup.md)
vsebujejo podrobnosti in omejitve.

**P01 je zaključen kot prvi pilot vseh treh postopkov.**
[Skupni pregled](docs/pilot-results.md) vsebuje vseh šest poskusov in
naslednje korake. P01 ne določa zmagovalca: med umerjanjem sta se
protokola B in C spreminjala. Pred glavnimi meritvami ostajata dejanski
preizkus popravkov po pregledu in potrditev merjenja porabe ob prekinitvah.

## Pilot P02: množična sprememba stanja

21. septembra 2026 so pripravljeni navodila P02 v0.1 z dvanajstimi zahtevami,
ločena referenca, štirje razvojni in trinajst končnih scenarijev. Naloga
uporablja isto osnovno aplikacijo kot P01, brez njegove rešitve. Preverja
izbor več opravil, delni uspeh, zakasnjene odgovore, ponavljanje samo
neuspelih zapisov in nespremenljivost drugih podatkov.

Referenca je opravila **72/72 preverjanj**, slog, tipe in gradnjo. Testi so
zaznali **10/10 namernih napak**. Dodatna veljavna zaporedna izvedba je
opravila 13/13 končnih scenarijev na računalniškem prikazu. To so preverjanja
reference in meril; rezultate agentov poročamo ločeno.

- [Navodila P02](tasks/P02/instructions.md)
- [Referenčna pravila in sledljivost](docs/P02-reference-specification.md)
- [Dokazila in posnetki](docs/p02-verification.md)
- [Priprava, ukazi in naslednji koraki](docs/p02-setup.md)
- [Protokol P02/1](docs/p02-pilot-protocol.md)
- [Izvedbe in rezultati P02](docs/p02-results.md)

Preverjanje: `npm run test:p02`, nato `npm run test:p02:mutations`.
Predogled reference: `npm run dev:p02`, naslov `http://127.0.0.1:5185`.
P02 uporablja lastne delovne kopije in poročila. Izvajalnik podpira vse
tri postopke za P01 in P02; tehnična kopija brez modela je v izolaciji
opravila 46/46 javnih preverjanj. Vsi trije pilotski postopki so zaključeni
po vnaprej določenem protokolu z enakimi vhodi in največ 20 minutami na
postopek: A v 16 min 16 s, B v 16 min 12 s, C v 17 min 37 s.
Vsaka oddaja je opravila 72/72 neodvisnih preverjanj; poraba je popolno
zabeležena. B in C nista zahtevala dodatnega kroga popravkov.
To so trije piloti, ne glavne meritve ali dokaz prednosti posameznega
postopka. [Pregled P02](docs/p02-results.md) določa preostala preverjanja.
