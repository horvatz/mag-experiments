# P07 – preverjanje

## Izvedeni ukazi

Končni zagon npm run check je uspešno zaključil lint, TypeScript preverjanje,
produkcijsko gradnjo in vseh **54 Playwright testov**:

- 14 API testov,
- 12 izhodiščnih testov za desktop in 12 za mobile,
- 4 razvojni P07 testi za desktop in 4 za mobile,
- 8 lastnih testov v tests/agent/favorites.spec.ts.

Izhod se je končal z 54 passed (21.4s). V vmesnih agentnih zagonih so se
pokazale napačne testne predpostavke o vrstnem redu kartic med stolpci,
številu opravil v posameznem stolpcu in ponovnem zagonu inicializacijske
skripte ob osvežitvi. Pričakovanja in fixture so popravljeni; končni polni
zagon in ločeni ciljni test projekta sta uspela. Opozorila npm o http-proxy
in Node opozorila o NO_COLOR niso vplivala na rezultate.

## Povezava preverjanj z zahtevami

| Zahteve | Dejanski testi |
| --- | --- |
| R01 | D01 neodvisno preklapljanje po ID-ju; agentni test z enakima naslovoma potrdi ločena gumba in podrobnosti po ID-ju. |
| R02 | D03 shrani pravilen JSON; agentni UTF-16 test potrdi unikatnost, vrstni red in ohranitev neznanega ID-ja. |
| R03 | Agentni test obnovi podvojene ID-je, ohrani neznani ID in preveri, da se začetni zapis ob nalaganju ne popravi. |
| R04 | Agentni test preizkusi manjkajoč ključ, neveljaven JSON, napačno različico, manjkajoči seznam in neniz v seznamu. |
| R05–R06 | D02 filtrira in takoj odstrani zadnje priljubljeno opravilo; agentni test preveri tablo, izvorni vrstni red preglednice in števce vidnih opravil. |
| R07 | D04 menja pogled brez izgube oznake; agentni test odpre podrobnosti ponovljenega naslova prek ID-ja. |
| R08 | D03 preveri obnovo po osvežitvi; agentni test preveri ponastavitev filtra pri menjavi projekta in osvežitvi ter obnovo priljubljenosti. |
| R09 | Agentni večprojektni test odstrani samo opravila trenutnega projekta, preveri ohranitev ID-ja drugega projekta in neznanega ID-ja ter onemogočenje gumba po odstranitvi. |
| R10 | Agentna obnovitev preveri besedilo Priljubljeno: 1 od 8.; agentni test table preveri števce stolpcev po filtru. |
| R11 | Agentni testi pošljejo dogodke za pravi in drug ključ, neveljavno vsebino ter null; ločeno simulirata napaki branja in pisanja ter preverita opozorilo. |
| R12 | D04 potrdi nič API zapisov pri spremembi priljubljenosti; izhodiščna desktop/mobile preverjanja varujejo navigacijo; agentni test potrdi širino dokumenta 390 px. |

## Dokazi in omejitve

Lastni scenariji so v tests/agent/favorites.spec.ts; skupni scenariji D01–D04
so v tests/development/P07.spec.ts. Oba pogleda uporabljata podane odzive
javnega API-ja testnega okolja. Ni bilo ročnega cross-tab brskalniškega testa:
dogodki storage so bili poslani kot sintetični dogodki, izjeme shrambe pa
simulirane z zamenjavo metod Storage. Ni bilo dostopa do skritih končnih
testov. Ozki prikaz je bil izrecno preverjen pri širini 390 px, celoten obseg
drugih velikosti je omejen na izhodiščna in razvojna mobilna preverjanja.
Ukaz git status ni deloval, ker okolju manjka xcrun na nastavljeni poti do
Command Line Tools; pregled kode in seznam dovoljenih map sta bila opravljena
neposredno.

Vsi R01–R12 so implementirani in imajo vsaj eno dejansko izvedeno povezano
preverjanje. Nepreverjeni ostajajo le neobjavljeni skriti primeri in dejanske
napake brskalniškega okolja, ki jih simulirani Storage preizkusi ne reproducirajo.
