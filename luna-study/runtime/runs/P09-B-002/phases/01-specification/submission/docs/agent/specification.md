# Specifikacija: stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Folio prikazuje projekte in njihova opravila v preglednici ali tabli. Uporabnik naj bi lahko isti pregled omejil z iskalno frazo in stanjem opravila, ga uredil po naslovu ter delil ali obnavljal prek URL-ja in zgodovine brskalnika. Obstoječi API ostane vir projektov in opravil; sprememba je samo v uporabniškem vmesniku in URL stanju.

Začetno stanje pogleda je `q=""`, `status=all`, `order=original`; način je preglednica, razen če URL vsebuje `view=board`. Začetna koda in tipi še niso preverjeni; pogoji spodaj so izpeljani iz izvirnih zahtev P09 in bodo povezani z obstoječo kodo po pregledu.

## Vhodi, dejanja in izidi

Vhodi so pot projekta ali opravila ter query parametri fragmenta `q`, `status`, `order` in obstoječi `view=board`. Podatkovna polja za iskanje: `title`, `description`, `assignee`, `id`; filtriranje stanja uporablja `status`. Uporabnik lahko ureja tri kontrolnike kot osnutek, potrdi jih z **Uporabi pogled**, ponastavi z **Ponastavi pogled**, preklopi Preglednica/Tabla, odpre opravilo in ga zapre z gumbom ali Escape. Potrditev velja za vse tri kontrole naenkrat; neuspešno nalaganje naj ohrani obstoječe obnašanje Folio.

## Zahteve in pravila

Naj bo `N(s)` trim, nato Unicode NFD, odstrani vse U+0300–U+036F, nato male črke. `q' = N(q)`. Iskanje je dobesedni podniz celotnega polja (ne regex in ne tokenizacija). `D` so opravila izbranega projekta, `F(D,q,s)` pa tista opravila `t`, za katera velja statusni filter in vsaj eno od normaliziranih polj `title`, `description`, `assignee`, `id` vsebuje `q'`. `all` sprejme vsak status. Pri urejanju `title-asc/title-desc` primerjamo normalizirane naslove po UTF-16; pri enakosti ohranimo izvorni vrstni red.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Neposreden URL na projektu/opravilu določa `q`, `status`, `order`; izpuščeni parametri so privzeti in se takoj odrazijo v pogledu. | URL neposredno odpre filtriran in urejen pogled. |
| R02 | `q` je ena fraza: `N(q)`; ujemanje je podniz vsaj enega od štirih navedenih polj. | Naglasi, ločila, presledki, ID; niz z več besedami kot dobesedna fraza. |
| R03 | Status je `all/todo/in_progress/done`; iskanje in status se združita z IN. Vrstni red je `original/title-asc/title-desc`, naslov po `N`, izvorni vrstni red razreši izenačenje. | Kombinacije filtrov in enaki normalizirani naslovi. |
| R04 | Neznani status/order → privzeto; podvojenih parametrov esetgem prva vrednost; ostali parametri ne vplivajo. Samo branje URL ne prepiše. | URL z neveljavnimi in podvojenimi vrednostmi ter primerjava URL pred/po nalaganju. |
| R05 | Urejanje kontrol spremeni samo osnutek; Uporabi pogled atomarno potrdi tri vrednosti in doda natanko eno zgodovinsko stanje le ob spremembi potrjenega stanja. | Pred/po urejanju in enkratni zapis ob potrditvi. |
| R06 | Potrditev trim-a `q`, izpusti privzete parametre, pravilno kodira ostale, ohrani `view=board`, odstrani neznane parametre; ista potrditev ne doda zgodovine. | Pregled sestavljenega fragmenta in dolžine zgodovine pri ponovitvi. |
| R07 | Browser Back/Forward obnovita URL, prikaz in osnutek iz potrjenega stanja; osvežitev obnovi stanje iz URL. | Potrditev dveh pogledov, nazaj/naprej ter reload. |
| R08 | Preklop načina ohrani potrjene filtre in iste ID-je; navigacija zavrže osnutek. | Preklop v obeh načinih ter sprememba projekta. |
| R09 | Odpri/zapri podrobnost (gumb/Escape) ohrani filtre in način; cilj se izbere po ID, tudi ob enakih naslovih. | Opravili z enakim naslovom, odpiranje po ID in oba načina zapiranja. |
| R10 | Klik na drug projekt začne privzete filtre in ohrani način; neposredni URL drugega projekta uporabi njegove parametre. | Klik navigacija in neposredni parametrični URL. |
| R11 | Ponastavi izprazni filtre/osnutek, posodobi zgodovino po pravilu R05 in ohrani način. Prazno: `Ni zadetkov.`; števec `Prikazano: N od M.` | Prazen/filtriran rezultat, števec in ponastavitev. |
| R12 | Nobeno dejanje ne zapisuje podatkov ali uporablja localStorage; neznana pot, nalaganje, podrobnosti in prilagodljiv Folio ostanejo funkcionalni. | Pregled API prometa/stanja ter regresijski preizkus pri 390 px in neznani poti. |

Obvezna dostopna imena kontrol so **Iskanje v povezavi**, **Stanje v povezavi**, **Vrstni red v povezavi**, **Rezultati povezave** (`role=status`), **Pregled stanj opravil** ter obstoječa dostopna imena pogledov/stolpcev. Vrstice/kartice obdržijo `data-task-id`; nova dejanja opravila so zunaj njegove povezave. Pri 390 px širina strani ne sme preseči zaslona; vsebina preglednice/table lahko notranje drsi. Projekti so lahko prazni, opravil je lahko nič, eno ali več kot deset; ID-ji so poljubni, naslovi lahko podvojeni, besedilna polja vsebujejo Unicode in ločila.

## Izvedba in sledljivost

Ta začetni zapis določa preverljive pogoje za R01–R12. Konkretne poti kode, tipi in izidi preverjanj so **še nepreverjeni** in bodo dopolnjeni po branju izvora. Vloga specifikacije ne zaganja aplikacije ali testov.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej ustrezne vrstice zgoraj; vsako je treba pokriti z implementacijskim scenarijem. | Izvor in skupni razvojni testi bodo pregledani, ne izvajani. | Za preveriti. | Neizvedeno; ta vloga ne zaganja aplikacije/testov. |

## Odprta vprašanja in omejitve

Začetno stanje kode, konkretna imena tipov/komponent, navigacijska struktura in pokritost testov še niso pregledani. Predpostavka: URL fragment ima pot, ki ji sledijo query parametri (`#/projects/web?...`); način table je predstavljen z `view=board`. Navigacije med nedokončanim nalaganjem in sočasne spremembe podatkov zunaj osvežitve niso razširjene, skladno z navodili. Končnih pilotnih testov tu ni mogoče potrditi.
