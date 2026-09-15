# mag-experiments

Gradivo in orodja za pripravo eksperimentov magistrske naloge. Prvi korak je
P01: urejanje naslova in stanja opravila v aplikaciji Folio (`mag-app`).

Osnova in referenca uporabljata potrjeni dizajn Folio z lebdečim stranskim
menijem. Natančna skupna različica je zapisana v `baseline.json`.

Repozitorij vsebuje skupna navodila, razvojne teste, ločeno referenčno rešitev
in končna preverjanja. Namenjen je avtorju raziskave. Agentom pri primerjavi
ne priključimo tega repozitorija ali nadrejene mape `mag`.

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

## Pred prvo izvedbo A, B ali C

Pripraviti je treba še izvoz dovoljenega gradiva, izolirano izvajalno okolje
brez dostopa do reference in končnih testov ter preverjanje dovoljenih sprememb
ob predaji. Ločene mape in zaseben GitHub repozitorij same po sebi ne pomenijo
izolacije procesa. Trenutni lokalni strežnik je orodje za pripravo in preverjanje.

Pred zagonom določimo model, pozive, skupne omejitve, pravila ustavitve in
beleženje porabe. Modelskih izvedb A/B/C in primerjalnih rezultatov v tem
repozitoriju še ni. P01 ostaja pilotna naloga.
