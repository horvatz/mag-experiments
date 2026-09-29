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
- [Kazalo dokazov po nalogah](evidence-map.md) poveže vsako arhivirano
  oddajo z oceno, procesom, kodo, predajo in izbrano vsebinsko presojo.
  Obstoj povezav preveri `evidence-map-verification.json`.
- `requirement-data.csv`, `test-data.csv` in `phase-data.csv` so izključno
  nove arhivirane meritve. Odsotnih izidov ne nadomestijo z ničlami.
- [Popis odstopanj](failure-catalog.md) in `failure-catalog.json` zajameta
  vse arhivirane oddaje brez strogega uspeha, njihove nedokazane zahteve,
  zabeležene testne statuse in povezave do ocen. Popis ni izbor zanimivih
  primerov in ne sklepa vzroka neuspeha iz samega statusa postopka.
- [Vsebinske presoje](content-review.md), `review-data.csv` in
  `reviews/<ID>.json` hranijo 24 vnaprej izbranih ponovitev 001; vsaka ocena
  ima dokaze. Še neopravljena presoja ni ocena 0.
- [Razvojni primeri](development-cases.md) ločijo napake kode, testov in
  predaj. Primeri iz ponovitev 002/003 so označene naknadne ilustracije zunaj
  formalnega vzorca; ne dokazujejo pogostosti ali vzročne prednosti postopka.
  Med njimi sta zastarela predaja P10-B-003 ter koristen koledarski popravek
  P08-B-003, ki kljub temu ohrani končno napako prazne table.
  P08-A-003 pa pokaže uspešen lasten nabor po spremembi scenarija, čeprav
  predhodno odkrita manjkajoča prazna tabla v končni kodi ostane.
  P05-B-003 pokaže tudi močnejše preverjanje treh prehodov ob enakem
  številu testov in enakem izidu 51/51, brez spremembe aplikacijske kode.
  [Formalna presoja P09-A-001](reviews/P09-A-001.json) pa dokumentira
  šest končnih neuspehov z enim neposrednim vzrokom: napačno obvezno
  dostopno ime izbirnika. Lastni testi uporabijo isto krajše ime. Šest
  neuspehov zato ni dokaz šestih različnih napak funkcionalne logike;
  prvotna ocena 9/12 zahtev kljub temu ostane nespremenjena.
- `process-summary.json/md` ohrani faze, predaje, zahteve za popravke in
  konvergence. Zahteva za popravek ni isto kot uspešno izveden popravek.
- [Časi faz](phase-timing.md) in `phase-timing.json` opisno povzamejo znane
  čase z imenovalci, statuse in vsote priprave pri C. Ta naknadna analiza
  je dodana po 29 arhivih L/1.0; ne spreminja zamrznjenih kontrastov.
  Vključuje tudi prekinjene korake in ni ocena časa samo uspešnih rešitev.
- `runtime/runs/<ID>/` vsebuje nespremenjeno oddajo, dogodke, neodvisno oceno
  in inventar arhiva. `analysis/evidence/` vsebuje označene izvlečke dogodkov,
  nikoli popravkov merjene oddaje.
- `archive-verification.json` preveri inventarje arhivov, izvore ocenjevanja,
  oddaje, model, izvajalnik in časovno mejo.
- `review-verification.json` preveri izbiro presoj, vsebinska polja in
  obstoj vsake dokazne datoteke, številke vrstice ali naslova.
- [Pojasnilo delnih presoj](review-missingness-note.md) razkrije po prvem
  takem izidu uvedeno predstavitev razpoložljive dokumentacije brez nove
  kode. Merila rubrike ostanejo ista; veljavni imenovalci so po dimenzijah.

Preglednica je v
`experiments/outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/primerjava-astra-luna.xlsx`.
Samostojni podatkovni PDF je v istem imeniku kot `astra-luna-comparison.pdf`.
Grafi so v `analysis/figures/`. Končni vizualni pregled preveri vse strani
tega PDF-ja, preglednico in tri grafe; PDF ni besedilo magistrske.

Uporabnik v drugem pogovoru ureja magistrsko, zdaj v ločenem repozitoriju
mag-report. Imena poti so angleška: `naloga/latex/thesis.tex`,
`naloga/latex/thesis.pdf` in `naloga/notes/experiment-handoff.md`.
Številčni vložek `naloga/latex/generated/luna-comparison.tex` se še osvežuje,
poglavij in sestavljanja glavnega PDF-ja ta spremljevalec več ne spreminja.
Ta prilagoditev poročanja po 34 arhivih ohrani meritve in zamrznjene vhode.
Dokazi obnove po preimenovanju zunanje kontrolne poti in dovoljenih
predstavitvenih sprememb prejšnjega poročanja so v `analysis/recovery/`.

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
- Tudi lokalna orodja imajo opažene omejitve. Arhivirana ukaza Git v
  M/1.0:P03-B-001 in L/1.0:P06-B-001 vrneta isto napako `xcrun` zaradi
  neveljavne poti razvojnih orodij. [Izvleček z izvoroma in hashi](evidence/shared-git-environment.json)
  dokumentira dva naknadno izbrana primera; ne ocenjuje pogostosti ali
  vpliva na izid. Napaka ni posebnost Lune in ni funkcionalna napaka aplikacije.
- A/B/C so celotni postopki: poleg dokumentov se razlikujejo v vlogah,
  predajah, fazah in razporejanju skupnega časa. Rezultat pod istim
  1200-sekundnim proračunom ne izolira učinka posamezne sestavine, na primer
  same oblike specifikacije. Pri časovnem neuspehu preveri dejanske faze,
  ne pripiši ga avtomatično napačni kodi ali zgolj imenu uporabljenega orodja.
- Vsi začeti poskusi ostanejo v primarni analizi. Stare napake storitve
  Astre niso izbrisane, ponovljene ali razglašene za napake njene kode.
- Poročanje samo zaključenih postopkov je analiza občutljivosti in ni
  nadomestni glavni rezultat. Za opis kakovosti izdelane kode loči
  odsotno implementacijo od implementacije z dejansko napako.
  [P09-C-001](reviews/P09-C-001.json) ima na primer delno kodo in 8/12
  dokazanih zahtev, vendar neuspešne tipe in gradnjo ter regresije.
  Delež zahtev sam zato ne pomeni, da je oddaja pripravljena za uporabo.
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
