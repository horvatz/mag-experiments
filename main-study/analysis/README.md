# Analiza in gradivo za pisanje

**Za pisanje uporabljaj `reporting-results.json` in `reporting-results.md`.**
Poročanje izrecno ohrani neznani čas prekinjene P06-C-001 kot manjkajoč;
prizadeti časovni agregati zamrznjenega `results.json/md` niso uporabni.
Funkcionalni izidi in imenovalci so v obeh prikazih enaki.

Ta imenik vsebuje **izpeljana gradiva**, ne vhodov za merjene agente.
Merila in primarni izračun so zamrznjeni v protokolu M/1.0 in reviziji
`7742a88`. Izvirne oddaje ostanejo v `runs/`; tukajšnje posodobitve jih
ne popravljajo in ne vračajo povratnih informacij v merjene seje.

## Datoteke in pomen

| Datoteka | Enota vrstice oziroma vsebina |
| --- | --- |
| `results.json` | Primarni zbirni izračun iz zamrznjenega analizatorja, le arhivirane izvedbe |
| `results.md` | Človeku berljiv povzetek istega izračuna |
| `reporting-results.json/md` | Rezultati za pisanje; neznani časi ostanejo manjkajoči, prizadete časovne primerjave so zadržane |
| `run-data.csv` | Vseh 72 načrtovanih ID-jev; nearhivirane vrstice imajo prazne meritve |
| `requirement-data.csv` | 72 × 12 načrtovanih zahtev; prazna meritev ni nič oziroma false |
| `test-data.csv` | Vsak dejanski zapis neodvisnega testa z izvirnim statusom, projekcijo zaslona oziroma API in napakami |
| `phase-data.csv` | Dejanske faze posameznih arhiviranih postopkov; predaje so ločena časovna razlika |
| `reviews/<ID>.json` | Vsebinska presoja vnaprej izbrane ponovitve 001, po petih dimenzijah |
| `content-review.md` | Pregled dejansko opravljenih presoj z utemeljitvami |
| `development-cases.md` | Naknadno izbrani razvojni primeri zunaj vzorca 001; brez dodatnih ocen ali sklepov o pogostosti |
| `review-data.csv` | Vseh 24 vnaprej izbranih oddaj, pet ločenih ocen in identiteta presoje; manjkajoča ocena ostane prazna |
| `anomalies.json` | Neuspešni ali nepopolni izidi; ohranjeni izvirni statusi in sporočila testov |
| `integrity-audit.json` | Kontrola zamrznjenih virov, uporabljenega ocenjevalca in vsake datoteke arhiva |
| `figures/` | Grafi PNG/SVG in zapis podatkovnega posnetka ter različic knjižnic |
| `diagnostics/` | Jasno ločeni raziskovalni pregledi po oddaji; ne spreminjajo primarnih meril |
| `writing-guide.md` | Povezava gradiva z magistrsko in omejitve dovoljenih sklepov |

Časovni podatki so v sekundah; čas na grafu je v minutah. Datumi s `Z`
so v UTC. `generatedAt` pomeni čas izdelave posnetka, ne nujno konec
celotne čakalne vrste. Preglednica in PDF sta posnetka z izpisanim datumom,
ne živa prikaza.

## Podatkovni slovar

- `archived`: izvedba ima končni arhiv in neodvisni povzetek. `false`
  ne pove, ali pravkar teče; trenutno aktivnost kaže `main-study/active.json`.
- `execution_status`: izvirni status izvajalnika, npr. `completed` ali
  status prekinitve. Ne prevajaj vseh različnih neuspehov v »napaka kode«.
- `requirements_demonstrated` / `demonstrated_fraction`: primarni izid
  zamrznjenega analizatorja; sprejemna testa pri namizni in mobilni
  velikosti morata uspeti, spremembe
  pa morajo biti dovoljene. Imenovalec je 12.
- `requirements_observed`: koliko zahtev ima pripadajoča rezultata obeh
  sprejemnih prikazov v ocenjevalnem zapisu. Izvirni status vsakega testa
  ostane v `evaluation-summary.json`; neopažena zahteva ni opažena napaka.
- `strict_success`: dodatno zahteva zaključen postopek in vse tehnične
  ter funkcionalne pogoje (70 preverjanj, lint, tipi, gradnja, dovoljen obseg).
- `usage_complete`: popolna poraba je usklajena za točne seje in postopek
  je zaključen. Sicer so polja celotne porabe prazna.
- `input_tokens` vključuje `cached_input_tokens`; `output_tokens`
  vključuje `reasoning_output_tokens`. Podmnožic ne prištevaj ponovno.
- `observed_*_lower_bound`: nazadnje opažena poraba prekinjene izvedbe;
  to ni nadomestek neznane celotne porabe.
- `own_test_files` in `changed_files`: števili datotek, ne oceni kakovosti
  ali števili uspešnih testnih scenarijev.
- `phase-data.csv`: pri A je celotno delo združeno v eno vrstico.
  Pri B/C imajo faze dejanska imena; dodatna vrstica
  `handoffs-and-orchestration` je razlika med skupnim časom in vsoto faz.
- `test-data.csv` ohrani izvirna `project` in `status` iz neodvisne ocene;
  `errors_json` vsebuje izvirno polje sporočil v obliki JSON. Izvoz ne
  dodaja zapisov še neizvedenih testov in ne vključuje agentovih lastnih
  razvojnih testov. `expected` je uspešen pričakovani izid; drugih
  statusov, denimo preskoka, ne združuj samodejno v potrjeno napako.

CSV uporablja UTF-8, vejico, dvojne narekovaje in CRLF. Prazno polje je
manjkajoča meritev; pred analizo ga ne zamenjaj z ničlo. Načrtovani ID-ji
in imenovalec 12 so znani tudi pri še nearhiviranih izvedbah.

`review-data.csv` vsebuje eno vrstico na vnaprej izbrano oddajo ponovitve
001. Pet ordinalnih dimenzij 0–2 ostane ločenih, brez skupnega seštevka.
`reviewed=false` pomeni prazne ocene, ne ničelnih ocen. `human_review` in
`inter_rater_agreement` ostajata prazna; AI-podprta presoja ne ustvari
človeške presoje. Dokazi in utemeljitve so v povezani datoteki JSON.

## Obnova iz arhivov

Primarni izračun ustvari `node scripts/analyze-main.mjs`. Dodatno gradivo
in preverjanje celovitosti ustvari
`node main-study/analysis/prepare-writing-data.mjs`.
Ta korak posodobi tudi številčne vložke `naloga/latex/generirano/`.
Nobeden od obeh ukazov ne zažene nove merjene izvedbe.

Grafi nastanejo z `artifacts/plots.py`; različice so v
`artifacts/requirements-plots.txt`. Preglednica nastane z
`artifacts/workbook.mjs` in knjižnico `@oai/artifact-tool` v nameščenem
okolju Codex. Formule se primerjajo s primarno analizo, izvede se
povratna sprememba enega vhoda ter pregled izračunanih celic in slik.
TeX dokument se nato prevede z obstoječim `naloga/latex/scripts/build.sh`.

Za nadaljevanje meritev se uporablja **obstoječa čakalna vrsta**, ne ta
analizni imenik. Že začetih ID-jev ne ponavljaj in ne zamenjuj zamrznjenih
meril. Med modelskim delom ne zaganjaj referenčnih ali ocenjevalnih
strežnikov; dostopne vhode in orodja za modele vodi izolirani izvajalnik.

## Nadaljevanje 23. septembra: neznan čas prekinjene izvedbe

P06-C-001 je bil najden brez živega izvajalnika, končnega dogodka ali
arhiva. Ohranjeni so prvotni zapis, časovno označeni števci in obnovitvena
sled v `recovery/P06-C-001/`. Model ni bil ponovno zagnan, oddaja ni bila
popravljena. Obstoječa koda je zamrznjena in neodvisno ocenjena. Status je
`infrastructure_interrupted`; točen čas je **null**, celotna poraba je
**null**, zadnja opažena poraba pa ločena spodnja meja. `finishedAt` v tej
izvedbi označuje raziskovalčevo finalizacijo, ne dejanskega konca modela.

Za pisanje uporabljaj **`reporting-results.json` in `reporting-results.md`**.
Zamrznjeni analizator v `results.json` ob seštevanju pretvori null v nič;
njegova prizadeta časovna povprečja so zato neveljavna. Zamrznjenih vhodov
in arhivov nismo spreminjali. Ločena poročevalska plast zadrži povprečje,
če katera zahtevana meritev časa manjka, in prizadete parne časovne
primerjave. Funkcionalni izidi ter vsi njihovi imenovalci so nespremenjeni.
Ne gre za novo merilo ali nadomestno izvedbo. Tudi avtomatični arhivski
`report.md` pri null času izpiše 0 min; ta izpis ni meritev. JSON ohrani null.

CSV, preglednica, grafi in TeX uporabljajo poročevalsko plast. Prazen čas
ni nič; graf neznani čas izpusti in pove njihovo število. Primerjave časa
z nepopolnimi zahtevanimi ponovitvami niso ocenjene. Faza implementacije
in predaje P06-C nimajo izmišljenega trajanja. Ta odmik zaradi infrastrukture
mora ostati izrecna omejitev v magistrski; iz nedokončane predaje ne sledi
vzročni sklep o postopku C.
