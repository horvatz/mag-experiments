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
