# Analiza in gradivo za pisanje

Ta imenik vsebuje **izpeljana gradiva**, ne vhodov za merjene agente.
Merila in primarni izračun so zamrznjeni v protokolu M/1.0 in reviziji
`7742a88`. Izvirne oddaje ostanejo v `runs/`; tukajšnje posodobitve jih
ne popravljajo in ne vračajo povratnih informacij v merjene seje.

## Datoteke in pomen

| Datoteka | Enota vrstice oziroma vsebina |
| --- | --- |
| `results.json` | Primarni zbirni izračun iz zamrznjenega analizatorja, le arhivirane izvedbe |
| `results.md` | Človeku berljiv povzetek istega izračuna |
| `run-data.csv` | Vseh 72 načrtovanih ID-jev; nearhivirane vrstice imajo prazne meritve |
| `requirement-data.csv` | 72 × 12 načrtovanih zahtev; prazna meritev ni nič oziroma false |
| `phase-data.csv` | Dejanske faze posameznih arhiviranih postopkov; predaje so ločena časovna razlika |
| `reviews/<ID>.json` | Vsebinska presoja vnaprej izbrane ponovitve 001, po petih dimenzijah |
| `content-review.md` | Pregled dejansko opravljenih presoj z utemeljitvami |
| `anomalies.json` | Neuspešni ali nepopolni izidi; ohranjeni izvirni statusi in sporočila testov |
| `integrity-audit.json` | Kontrola zamrznjenih virov, uporabljenega ocenjevalca in vsake datoteke arhiva |
| `figures/` | Grafi PNG/SVG in zapis podatkovnega posnetka ter različic knjižnic |
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
  zamrznjenega analizatorja; oba sprejemna prikaza morata uspeti, spremembe
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

CSV uporablja UTF-8, vejico, dvojne narekovaje in CRLF. Prazno polje je
manjkajoča meritev; pred analizo ga ne zamenjaj z ničlo. Načrtovani ID-ji
in imenovalec 12 so znani tudi pri še nearhiviranih izvedbah.

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
