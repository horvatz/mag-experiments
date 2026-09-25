# Dodatni pregledi po oddaji

Ti pregledi so raziskovalni primeri za razpravo. Niso vnaprej določeni
sprejemni testi, ne spreminjajo primarnih ocen in ne dajejo povratnih
informacij merjenim agentom. Ne pomenijo sistematičnega dodatnega merila
za primerjavo vseh postopkov.

## Dostopno ime kartice pri ID-ju s presledkom

Ob branju vnaprej izbrane oddaje P10-C-001 je ostal neposredni sklic
`aria-labelledby` na DOM ID, sestavljen iz poljubnega ID-ja opravila.
P10-A-001 je to v svoji izvedbi spremenil v `aria-label`. Zato je bil
21. septembra 2026 ob 22:58 UTC opravljen ločen pregled teh dveh oddaj
in nespremenjenega izhodišča. Izbor je posledica konkretnega opažanja,
ne vnaprej določen reprezentativen vzorec za merjenje dostopnosti.

Skript `artifacts/board-accessibility.cjs` izriše dejanske komponente
TaskBoard s strežniškim izrisom React in postavi nastali HTML v izolirano
stran Chromium brez omrežnega strežnika. Za vsako komponento uporabi njeno
lokalno kopijo React in pripadajoči strežniški izrisovalnik. Preizkus
prebere izračunano dostopno ime in razrešljivost sklicev za dva ID-ja.
Izvirne datoteke ostanejo nespremenjene; njihove zgoščene vrednosti in
različica Chromium so v `board-accessibility.json`.

| Komponenta | ID brez presledka | ID s presledkom |
| --- | --- | --- |
| Izhodišče | Ime: naslov + ID; vsi sklici razrešeni | Sklici se ne razrešijo; ime vsebuje celotno vsebino povezave |
| P10-A-001 | Ime: naslov + ID | Ime: naslov + ID, neposredni aria-label |
| P10-C-001 | Ime: naslov + ID; vsi sklici razrešeni | Enaka omejitev kot v izhodišču |

To je podedovana omejitev dostopnega imena pri določenem vhodu. Preizkus
ne dokazuje neuspeha odpiranja podrobnosti, permutacij ali zgodovine in
ne vključuje bralnika zaslona. Tega izida ne prištevamo ali odštevamo od
70 zamrznjenih preverjanj. Obe oddaji ohranita primarnih 12/12 in 70/70.

Prvi zagon pomožnega pregledovalnika je odpovedal zaradi dveh lokalnih
kopij React. Po uskladitvi izrisovalnika s komponento je nastal priloženi
zapis. To je napaka raziskovalčevega pomožnega orodja, ne merjena napaka
kateregakoli postopka.

## Pot do referenčnih slik Folio

25. septembra je ob pregledu P08-B-002 opažena razlika med dejansko
uporabo `docs/predogled/telefon.png` in predhodnima poročiloma P10-B-003
ter P08-B-003, ki omenjata manjkajoči `predogled/`. Naknadni pregled
izvirnih izvoznih inventarjev vseh **35 takrat arhiviranih izvedb**
potrdi šest referenčnih slik pod **`docs/predogled/`** pri vsaki izvedbi.
Slika `telefon.png` ima v vseh 35 isti SHA-256. Imenika `predogled/`
neposredno v korenu aplikacije ni. Strojni dokaz s potmi in zgoščenimi
vrednostmi je v [design-reference-paths.json](design-reference-paths.json).

Neuspešno iskanje `predogled/` iz korena aplikacije torej ni dokaz,
da referenčne slike v izvozu niso bile dostopne. Trditev P10-B-003 o
manjkajočih izvornih slikah je nepravilna razlaga omejitve njegovega
pregleda; tudi P08-B-003 je spregledal dejansko pot. Njuna zapisa o
neizvedeni primerjavi z izvirnimi slikami ostaneta dokaz, kaj sta
pregledovalca opravila oziroma izpustila. Ne predstavljamo pa tega kot
napake izvoza ali kot odsotnosti vhodnih slik.

Dokazi: [P10-B-003, zapis pregleda](../../../runs/P10-B-003/submission/docs/agent/review.md),
[P08-B-003, zapis pregleda](../../../runs/P08-B-003/submission/docs/agent/review.md),
[P08-B-002, dejanska uporaba poti](../../../runs/P08-B-002/submission/docs/agent/review.md)
in pripadajoči `manifest.json.gz` vsake izvedbe, povezani v JSON.
P03-B-001 je pravilno dokumentiral primerjavo z `docs/predogled/`;
njegova omejitev se nanaša na odsotno avtomatsko primerjavo slik in ni
enak primer. Formalne presoje zato niso spremenjene. P10-B-003 in
P08-B-003 sta zunaj vnaprej izbranega vzorca 001.

Pregled inventarjev ni nov funkcionalni test, ne spreminja primarnih
izidov in ne popravlja arhivov. Gre za razjasnitev porekla dokazov;
iz dveh naknadno opaženih primerov ne sklepamo na pogostost takih
omejitev med postopki. Nobena ugotovitev ni bila posredovana merjenim
agentom.

## Naknadno ohranjena mobilna slika P04-B-002

Arhivirani dokumenti P04-B-002 navajajo `test-results/p04-mobile-board.png`.
Ta pot ni vključena v izvirni arhiv, zato tam navedena slikovna povezava
ni prenosljiva. Slika je bila po arhiviranju najdena v ohranjenem delovnem
okolju in brez spreminjanja prekopirana v
[P04-B-002/p04-mobile-board.png](P04-B-002/p04-mobile-board.png).
[Provenance](P04-B-002/provenance.json) loči čas zadnje spremembe izvorne datoteke, čas naknadnega
shranjevanja, izvor in SHA-256. Gre za dodatno prilogo po oddaji;
izvirni arhiv ni dopolnjen in slika ni ponovno ustvarjena.
