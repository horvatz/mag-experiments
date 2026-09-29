# Preverjanje pred glavnimi meritvami

21. september 2026. Protokol M/1.0 je zamrznjen v
[`main-study/frozen-inputs.json`](../main-study/frozen-inputs.json).
Glavne izvedbe se smejo začeti šele po tej zamrznitvi; pripravljalne
kopije z oznakami 9xx niso merjene ponovitve.

| Naloga | Referenca | Namerno napačne različice |
| --- | ---: | ---: |
| [P03](../reports/P03-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P03-mutation-summary.json) |
| [P04](../reports/P04-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P04-mutation-summary.json) |
| [P05](../reports/P05-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P05-mutation-summary.json) |
| [P06](../reports/P06-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P06-mutation-summary.json) |
| [P07](../reports/P07-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P07-mutation-summary.json) |
| [P08](../reports/P08-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P08-mutation-summary.json) |
| [P09](../reports/P09-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P09-mutation-summary.json) |
| [P10](../reports/P10-reference-summary.json) | 70/70 | [6/6 zaznanih](../reports/P10-mutation-summary.json) |

Vsak sklop vsebuje 38 regresijskih, osem javnih razvojnih in 24 zasebnih
sprejemnih preverjanj. Vsaka referenca uspešno opravi tudi lint, tipe in
gradnjo. Vsaka namerno napačna različica se prevede in odpove v točno
predvidenem sprejemnem scenariju z zahtevano vrsto trditve. To je preverjanje
izbranih napak in ne dokaz popolnosti testne zbirke. Poročila vsebujejo
kontrolne vsote dejansko preverjenih virov posamezne naloge.

[26 testov izvajalnika](../reports/main-runner-tests.log) preveri med drugim
vloge, povratne zanke, veljavnost predaj, meje pisanja, vseh osem izvozov,
72 različnih ID-jev, uravnoteženost razporeda, izračun zahtev in obravnavo
omejitev storitve. [Kvalifikacija Q](qualification-results.md) je dodatno
preverila dejanske modele pri popravkih B/C in nadzorovani prekinitvi.

## Izolirano okolje

[Končno tehnično preverjanje](../main-study/technical-verification.json)
uporablja P06-A-905, P06-B-905 in P06-C-905 brez modelskega zagona.
Vsak izvoz je opravil 38 regresijskih preverjanj, gradnjo, preverjanje
nevidnosti vseh zasebnih referenc/testov ter pregled dovoljenih orodij.
B je preveril tri meje vlog; C šest mej faz, uradni razreševalnik predlog
in pripeti Python/PyYAML v prijavni lupini. Primerjava potrdi enaka
vsebinska navodila, predlogo, javne teste, pomočnik in projektna pravila.

V tehnično kopijo A je raziskovalec nato namestil referenco P06 in v istem
izoliranem okolju opravil vseh 46 agentu dostopnih preverjanj, vključno z
resničnimi prenosi CSV. Ta kopija zato nikoli ne postane merjen zagon.

Pripravljalni poskusi A-901 do A-904 so razkrili dve napaki okolja.
Program v peskovniku ne sme dobiti neposrednega ročaja do raziskovalčeve
datoteke dnevnika; dnevnik se zdaj prenaša prek cevi. Chromium na macOS
ustvari še vmesno prenosno datoteko v sistemski začasni mapi kljub
nastavljenemu TMPDIR in downloadsPath. Dovoljeno je pisanje samo imena
`.org.chromium.Chromium.` s točno šestimi alfanumeričnimi znaki; ne
podmap ali drugih imen. Seatbeltova sintaksa ne podpira zapisa `{6}`,
zato pravilo izrecno ponovi šest razredov znakov.

[Preverjanje meje prenosa](../main-study/browser-download-boundary.json)
potrdi dovoljeni vmesni zapis, premik v lastno mapo za prenose in še vedno
blokirano branje podatkov sistemske začasne mape ter pisanje drugih imen.
Branje zasebnih referenc in poverilnic je ostalo blokirano. Diagnostični
preizkusi so uporabljali samo lokalno kontrolirano besedilo brez agenta;
njihove začasne omejitve niso konfiguracija glavnih izvedb.

Vse spremembe protokola, okolja, referenc in meril so nastale pred prvo
glavno meritvijo. P01/P02 in kvalifikacijske oddaje ostajajo nespremenjeni.
Stanje meritev je v [sprotnem poročilu](../main-study/analysis/results.md).
