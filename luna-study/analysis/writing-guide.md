# Gradivo za pisanje: dodatni eksperiment L/1.0

**Status ni določen s tem dokumentom.** Aktualno število arhiviranih oddaj
je v [primerjavi](comparison.md) in `comparison.json`. Dokler polje
`complete` ni true, so rezultati vmesni. Zaključek celotnega dela zahteva
še 24 obravnavanih vsebinskih presoj, pregled artefaktov in uspešen
`final-verification.json`; samo dokončana čakalna vrsta ne zadošča.

## Kaj uporabiti

- [Protokol](../protocol.md) je načrt, zamrznjen pred prvo novo meritvijo.
- [Primerjava](comparison.md) in `comparison.json` povežeta M/1.0 in L/1.0;
  [rezultati Lune](reporting-results.md) ter `reporting-results.json` hranijo
  poročevalske podatke samo L/1.0.
- `comparison-runs.csv` ohrani zbirko/model ob vsakem lokalnem ID-ju.
  Enak ID v obeh zbirkah ni ista meritev.
- `requirement-data.csv`, `test-data.csv` in `phase-data.csv` so izključno
  nove arhivirane meritve. Odsotnih izidov ne nadomestijo z ničlami.
- [Vsebinske presoje](content-review.md), `review-data.csv` in
  `reviews/<ID>.json` hranijo 24 vnaprej izbranih ponovitev 001; vsaka ocena
  ima dokaze. Še neopravljena presoja ni ocena 0.
- `process-summary.json/md` ohrani faze, predaje, zahteve za popravke in
  konvergence. Zahteva za popravek ni isto kot uspešno izveden popravek.
- `runtime/runs/<ID>/` vsebuje nespremenjeno oddajo, dogodke, neodvisno oceno
  in inventar arhiva. `analysis/evidence/` vsebuje označene izvlečke dogodkov,
  nikoli popravkov merjene oddaje.
- `archive-verification.json` preveri inventarje arhivov, izvore ocenjevanja,
  oddaje, model, izvajalnik in časovno mejo.
- `review-verification.json` preveri izbiro presoj, vsebinska polja in
  obstoj vsake dokazne datoteke, številke vrstice ali naslova.

Preglednica je v
`experiments/outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/primerjava-astra-luna.xlsx`. Grafi so v `analysis/figures/`. Delovni PDF in
TeX sta v ločenem imeniku `naloga/latex`, ki ni del repozitorija experiments.
Poglavje 5 vsebuje metodologijo L/1.0, poglavje 6 ločeni razdelek rezultatov;
številčni vložek `generirano/luna-primerjava.tex` nastaja iz preverjenih podatkov.
Avtorske opombe drugih poglavij ostanejo naloge za pisanje, ne eksperimentalni izidi.

## Vprašanja, ki jih lahko obravnava razprava

1. Ali se znotraj Lune razlikujejo funkcionalni izidi A/B/C? Najprej
   primerjaj naloge in vse tri ponovitve, nato opisne parne intervale.
2. Ali je razlika povezana s predajami, popravki ali časovnimi omejitvami?
   Navedi dejanske dogodke. Ena ilustracija ni dokaz splošnega mehanizma.
3. Kolikšen čas in poraba spremljata uspeh? Poročaj imenovalce in
   manjkajoče vrednosti; poraba popolnih zapisov je lahko izbran podvzorec.
4. Ali se razliki B−A in C−A spremenita med zgodovinsko zbirko Astre in
   novo zbirko Lune? Poročaj opisno razliko razlik in hkrati omejitev okolja.
5. Ali rubrika pokaže razlike, ki jih funkcionalni testi ne zajamejo?
   Pet ordinalnih dimenzij poročaj ločeno, skupaj z utemeljitvami.

## Meje trditev

- Astra in Luna sta merjeni v različnih obdobjih in z različicama CLI
  0.154.0 oziroma 0.158.0-alpha.2.1. Razlike med zbirkama ne izolirajo
  vzročnega učinka modela. Postopki znotraj Lune imajo skupno okolje.
- Vsi začeti poskusi ostanejo v primarni analizi. Stare napake storitve
  Astre niso izbrisane, ponovljene ali razglašene za napake njene kode.
- Poročanje samo zaključenih postopkov je analiza občutljivosti in ni
  nadomestni glavni rezultat. Za opis kakovosti izdelane kode loči
  odsotno implementacijo od implementacije z dejansko napako.
- Uspeh 70/70 na izbranem naboru ni dokaz pravilnosti vseh možnih vhodov.
  Dokazana zahteva potrebuje uspeh pri obeh določenih velikostih zaslona.
- Osem sorodnih nalog je namenski vzorec; posamezni testi in tri ponovitve
  niso dodatne neodvisne naloge. Intervali so opisni, ničla ni dokaz
  enakovrednosti. Več prikazanih kontrastov ni zbirka potrditvenih hipotez.
- Vsebinske presoje so AI-podprte in neslepe. Človeška presoja in soglasje
  med ocenjevalci nista izmerjena. Surovih ordinalnih dimenzij ne seštevaj.
- Tokeni opisujejo opaženo porabo pri naročnini in niso cena API.
- Nova Luna ne sme biti vnaprej označena za slabši model: zaključek mora
  slediti izidom, brez ponavljanja ali izbire uspešnejših meritev.
