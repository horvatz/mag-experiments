# Razvojni primeri L/1.0

Vmesni opis doslej pregledanih arhivov. Primeri so ilustrativno izbrani po pregledu
izidov; niso nove meritve ali nadomestilo za vse izide. Formalna presoja
ponovitev 001 je vnaprej določena in shranjena ločeno.

## P05: funkcionalni uspeh in dokončan postopek

Vse tri oddaje imajo 70/70 neodvisnih preverjanj in 12/12 zahtev.
A in B sta zaključena, C pa je dosegel časovno mejo implementacijske faze.

| Zbirka / ID | Status | Čas (s) | Strogi uspeh | Popolna poraba |
| --- | --- | --- | --- | --- |
| L/1.0:P05-A-001 | completed | 473,547 | da | da |
| L/1.0:P05-B-001 | completed | 929,075 | da | da |
| L/1.0:P05-C-001 | phase_time_limit | 1081,068 | ne | ne |

C je za constitution, specify, plan in tasks porabil skupaj 618,557 s.
Implementacijska faza je imela 456,793 s proračuna; ustavljena je bila po
456,831 s. Del skupnega proračuna je po nespremenjenem protokolu rezerviran
za zaključni korak, vendar ob prekinjeni implementaciji do njega ni prišlo.
To ni prekinitev zaradi izgube dostopa ali spremenjene raziskovalčeve meje.
Dnevnik pred prekinitvijo potrdi 51/51 razvojnih preverjanj, agentova predaja
pa še vedno pravi »preverjanje v teku« in T009 ostane odprt.

Celotna poraba C je neznana. Opažena spodnja meja je 4.429.360 vhodnih
(4.243.712 predpomnjenih) in 49.069 izhodnih (26.527 reasoning) tokenov.
Teh spodnjih mej ne primerjamo kot enakovrednih popolnim povprečjem.

Dokazi: [izvedba C](../runtime/runs/P05-C-001/execution.json),
[poraba C](../runtime/runs/P05-C-001/usage-observation.json),
[neodvisna ocena C](../runtime/runs/P05-C-001/evaluation-summary.json),
[razvojni dogodki C](evidence/P05-C-001-checks.md#item_30),
[odprta naloga T009](../runtime/runs/P05-C-001/submission/docs/agent/P05/tasks.md).

## Popravljeni lastni testi niso isto kot popravljena aplikacija

A je najprej popravil uvoz neobstoječih ikon po dejanski napaki gradnje.
Nato je popravil lastni pričakovanji o testnih podatkih in razdelil ponoven
mount v ločen scenarij. Končni zagon potrdi 53/53.

B je popravil pričakovano število opravil todo ter primerjavo vrstnega reda
table (stolpci po stanju) z globalnim redom API-ja. Končni zagon potrdi 49/49;
pregledovalec testov ni sam ponovil in ni zahteval nadaljnjega popravka.

C je popravil test, ki je skušal odpreti naslednjo stran pri dveh opravilih,
in ločil prazen projekt od nove namestitve GET prestreznikov v istem
scenariju. Končni zagon potrdi 51/51, časovna meja pa prekine nadaljnjo predajo.

Dokazi so neposredni izvlečki [A](evidence/P05-A-001-checks.md),
[B](evidence/P05-B-001-checks.md) in [C](evidence/P05-C-001-checks.md).
Opis popravkov testnih priprav ne pomeni, da so neodvisni končni testi
najprej padli. Ti so izvedeni enkrat po zaključku oziroma prekinitvi modela.

## P10-A-001: uspešen test z nerazločujočim robnim primerom

Oddaja ima 70/70 neodvisnih preverjanj in 12/12 zahtev; končni agentov
zagon potrdi 54/54, od tega osem lastnih scenarijev. Implementacija omejitve
zgodovine uporablja `slice(-20)`, kar ohrani najnovejših dvajset zapisov.

Lastni test kapacitete izvede 22 potez, vendar izmenjuje le dve permutaciji.
Nato preveri število razveljavitev in končni red po dvajsetih undo/redo, ne
vsakega vmesnega reda. Pri tem periodičnem zaporedju tudi hipotetična napačna
omejitev z ohranitvijo prvih dvajsetih zapisov ne spremeni pričakovanega
končnega rezultata. To je vrzel v razločevanju testnega oraklja, ne opažena
napaka oddane implementacije. Raziskovalec kode ni spreminjal in ni izvedel
novega merjenega poskusa z mutacijo.

Prav zato pet dimenzij vsebinske presoje ostane ločenih od končnega
funkcionalnega rezultata. Pokritost specifikacije, invarianti, sledljivost
in organizacija kode dobijo po 2, lastna preverjanja pa 1 zaradi vrzeli pri
zahtevanem robu zgodovine. Ocena ni odvisna od samega števila testov.

Dokazi: [presoja](reviews/P10-A-001.json),
[lastni scenariji](../runtime/runs/P10-A-001/submission/tests/agent/P10.spec.ts),
[implementacija](../runtime/runs/P10-A-001/submission/src/App.tsx),
[končni zagon](evidence/P10-A-001-checks.md#item_40).

## P10-C-001: dokumentacija brez implementacije

C je dosegel skupno mejo po 1200,323 s. Projektna pravila so trajala
222,301 s, specifikacija 724,377 s, načrt 198,166 s in naloge 51,380 s.
Faza tasks je oddala seznam T001–T009 in končni odgovor, vendar ima status
time_limit; implementacija in zaključni pregled se nista začela.

Vseh deset datotek src je enakih začetnemu inventarju, lastnih testov ni.
Neodvisno ocenjevanje zato potrdi 38/38 osnovnih preverjanj in nobenega od
8 razvojnih ter 24 skritih testov nove funkcionalnosti: 0/12 zahtev.
Že D01 ne najde gumba za premik opravila. Neuspeh je ohranjen v primarni
analizi; meritev ni ponovljena ali nadomeščena. Dostop do modela ni odpovedal.

Razpoložljivo dokumentacijo je mogoče vsebinsko oceniti. Organizacija
odsotne avtorske kode ostane manjkajoča; pojasnilo takšne delne presoje je
razkrito kot dopolnitev poročanja po prvem takem izidu, ne kot zamrznjeno
predmerilno pravilo. Načrtovani lastni testi niso izvedena preverjanja.

Dokazi: [izvedba](../runtime/runs/P10-C-001/execution.json),
[neodvisni izidi](../runtime/runs/P10-C-001/evaluation-summary.json),
[enakost izvorne kode](evidence/P10-C-001-unchanged-source.json),
[presoja](reviews/P10-C-001.json),
[pojasnilo manjkajočih ocen](review-missingness-note.md).

## P10-B-001: dokončan postopek in vrzel lastnega oraklja

B je zaključil specifikacijo, implementacijo in pregled v 1032,509 s.
Končni razvojni zagon ima 50/50, neodvisna ocena 70/70 in 12/12.
Pregledovalec ni zahteval popravka; izrecno pove, da testov ni sam ponovil.

Lastni test zgodovine sicer izvede 21 premikov in 20 undo/redo, toda po
undo preveri samo dolžini skladov, vrstni red pa šele po vseh redo. Zato
ne preveri, katera najstarejša permutacija je ostala dosegljiva. Podobno
kot pri P10-A-001 dobi dimenzija lastnih preverjanj 1, čeprav koda pravilno
uporablja slice(-20) in končni neodvisni testi uspejo.

Prvi dodatni zagon ima 47 uspehov in dve odpovedi zaradi scenarijev.
Arhivirani item_22 potrdi, da se je tedaj spremenila samo lastna testna
datoteka. Popravljenemu samostojnemu zagonu 4/4 sledi celotni 50/50.

Dokazi: [presoja](reviews/P10-B-001.json),
[razvojni zagoni in popravek](evidence/P10-B-001-checks.md),
[pregledovalčeva omejitev dokazov](../runtime/runs/P10-B-001/submission/docs/agent/review.json).

## P06: isti funkcionalni izid A/B, različno razločevanje lastnih testov

A in B sta zaključila celoten postopek in oba dosegla 70/70 neodvisnih
preverjanj ter 12/12 zahtev. A traja 852,557 s, B 974,316 s. Lastna zadnja
zagona imata 53/53 (sedem dodatnih scenarijev) oziroma 51/51 (pet dodatnih).
Samo število dodatnih scenarijev ni podlaga za oceno njihove kakovosti.

A dejansko pripravi nekanonični vrstni red ID-jev in izbire kolon, večji
nabor ter spremeni nastavitve pred osvežitvijo. B v testu drugačnega reda
kolon kliče check na že izbranih checkboxih; osvežitev izvede po projektni
ponastavitvi, ko so nastavitve že privzete. Ti dejanji ne razločita napake
pri vrstnem redu ponovne izbire oziroma ponastavitvi spremenjenega stanja.
Zato imata lastna preverjanja A oceno 2 in B oceno 1, čeprav sta njuni
končni funkcionalni oceni enaki. B-jeva dejanska implementacija kanonične
kolone pravilno izpelje iz skupnega seznama in stanje ob osvežitvi ustvari
na novo; tu ni opažene končne napake aplikacije.

Obe izvedbi sta med razvojem popravili lastno testno pripravo pri ponovnem
nalaganju drugega nabora na isto stran. Pri B začetnih 49/49 sledi dodan
scenarij z 49 uspehi in eno odpovedjo; še naslednji zagon ima isto odpoved.
Ločena scenarija s svežima stranema uspeta. Natančen notranji mehanizem
brskalnika ni bil neodvisno diagnosticiran, zato ga ne pripisujemo eni
razlagi modela.

C porabi 1200,525 s pred začetkom implementacije. Constitution, specify,
plan in prekinjeni tasks trajajo 169,575 / 877,491 / 99,894 / 50,591 s.
V tej oddaji tasks.md ne nastane, za razliko od P10-C-001. Vseh deset
izvornih datotek ostane nespremenjenih; lastnih testov ni. Ocena je
38/70 in 0/12, prvi razvojni scenarij ne dočaka prenosa CSV. Razpoložljiva
specifikacija je vsebinsko ocenjena, odsotna avtorska koda pa ostane
manjkajoča po razkritem pojasnilu delnih presoj.

Dokazi: presoje [A](reviews/P06-A-001.json), [B](reviews/P06-B-001.json)
in [C](reviews/P06-C-001.json),
[lastni testi B](../runtime/runs/P06-B-001/submission/tests/agent/P06.spec.ts),
[razvojni dogodki B](evidence/P06-B-001-checks.md),
[nespremenjena koda C](evidence/P06-C-001-unchanged-source.json).

## P08-A-001: prazna skupina in ohranitev table

Postopek je zaključen po 580,459 s. Vsi štirje celoviti razvojni zagoni
potrdijo 50/50, končno neodvisno ocenjevanje pa 68/70 in 11/12 zahtev.
E11 odpove na obeh širinah zaslona. Po izbiri skupine brez zadetkov in
preklopu na tablo test pričakuje vidno območje `Tabla opravil`, toda
oddaja pokaže samo sporočilo `Ni opravil v izbrani skupini.`. Pogoj za
prazno skupino v kodi nastopi pred pogojem za izbrani pogled.

To je konkretno neskladje z ohranitvijo prikaza po zamrznjenem končnem
merilu; opaženi neuspeh ni v računanju koledarskih skupin. R11 se v
številčnih rezultatih ohrani kot nedokazana zahteva. Testov ali arhivirane
oddaje zaradi izida nismo prilagodili, izvedbe nismo ponovili.

Lastni testi vključujejo prestopni februar, prehod leta, mejo +7/+8,
prazno polje ter ohranitev filtra. Prazno skupino pa preverijo samo v
preglednici. Gre za manjkajočo kombinacijo dveh sicer posebej preverjenih
stanj, zato sama širina seznama testnih naslovov ne dokazuje pokritosti.
Podobno reload pri že privzetih nastavitvah ne razloči ponastavitve
spremenjenih nastavitev. Ocena lastnih preverjanj je 1.

Dokazi: [presoja](reviews/P08-A-001.json),
[razvojni zagoni in končna E11 izida](evidence/P08-A-001-checks.md),
[izris praznega stanja](../runtime/runs/P08-A-001/submission/src/App.tsx),
[zamrznjeni E11](../runtime/evaluation/P08/acceptance.spec.ts).

## P08-C-001: popravljena koda in nedokončana predaja

C ima 70/70 in 12/12, vendar status phase_time_limit po 1081,000 s.
Štiri pripravljalne faze porabijo skupaj 584,799 s. Implementacija traja
491,900 s ob dodeljenih 491,863 s in se ustavi, preden zaključi predajo;
konvergence ni. Polna poraba je neznana, opažena spodnja meja pa
4.191.929 vhodnih in 48.480 izhodnih tokenov.

Prvi celoviti zagon ima 49/51. Ena odpoved zadeva iskanje izbirnika prek
getByLabel, druga sporočilo prazne skupine po ponovnem mountu na isto
stran. Drugi test odpove pred preklopom na tablo. Zato modelovega opisa,
da je test odkril manjkajočo prazno tablo, ne prevzamemo kot neposredno
potrjenega dogodka. Arhivirani prebrani izsek kode item_25 pa pokaže isto
strukturo pogoja kot pri P08-A-001: prazna skupina nadomesti tablo s
sporočilom. Naslednji poseg spremeni tako kodo kot testno pripravo.

Po tem ima celoviti zagon 50/51; preostala odpoved je še en selektor
getByLabel. Sprememba samo testne datoteke v item_30 pripelje do 5/5
lastnih in zadnjega celovitega 51/51. Končna koda ohrani poimenovano
območje table pri prazni skupini in opravi tudi oba končna E11 primera.

Verification.md ostane pri prvih 49/51 in ponovnem preverjanju v teku,
nalogi T006/T007 pa sta odprti. Zapisovanje dokazov je torej del časa
postopka in ni bilo zaključeno, čeprav koda v predpisanem testnem naboru
deluje. Ta posamezna primerjava z A ne dokazuje vzročnega učinka metode.

Dokazi: [presoja](reviews/P08-C-001.json),
[izvedba](../runtime/runs/P08-C-001/execution.json),
[zagoni, posegi in prebrana koda](evidence/P08-C-001-checks.md),
[nedokončana predaja](../runtime/runs/P08-C-001/submission/docs/agent/verification.md).

## P08-B-001: neposredno odkrita in popravljena prazna tabla

Prvi razvojni check ima 47/48. Lastni scenarij preklopi na tablo ob prazni
skupini in neposredno odpove pri pričakovanju območja `Tabla opravil`.
Item_26 spremeni samo App.tsx: sporočilo prazne skupine je ločeno od
izbranega prikaza, tabla ohrani svoje območje in prazne statusne stolpce.
Naslednji lastni zagon pride prek tega koraka in odpove pri testnem
selektorju getByLabel. Popravljeni selektorji in poznejše dopolnitve testov
privedejo do zadnjega celovitega 48/48 ter po zadnji spremembi samo testov
še ciljnega 2/2. Pregledovalec ne zahteva nadaljnjih popravkov.

| P08, ponovitev 001 | Čas (s) | Status postopka | Končna preverjanja | Zahteve | Strogi uspeh |
| --- | --- | --- | --- | --- | --- |
| A | 580,459 | completed | 68/70 | 11/12 | ne |
| B | 961,783 | completed | 70/70 | 12/12 | da |
| C | 1081,000 | phase_time_limit | 70/70 | 12/12 | ne |

To je ilustrativna primerjava ene vnaprej izbrane ponovitve. B je tu
odkril in odpravil konkreten robni primer, A ga v lastnih testih ni zajel,
C pa odda funkcionalno uspešno kodo z nedokončano predajo. Dodatnih
ponovitev ali drugih nalog iz teh treh izidov ne napovedujemo.

Dokazi: [presoja B](reviews/P08-B-001.json),
[razvojna odpoved in popravek B](evidence/P08-B-001-checks.md),
[končna ocena B](../runtime/runs/P08-B-001/evaluation-summary.json).

## P06-A-003: lasten test razloči vrstni red stolpcev in stanje kontrol

Ta primer je naknadno izbrana ilustracija tretje ponovitve in ne razširja
formalnega vzorca 001. Po začetni odpovedi linta zaradi neuporabljenega
parametra sledi 48/49: test najprej izbere title, nato id, CSV pa vrne
`title,id` namesto zahtevanega `id,title`. Popravek v item_21 zadeva samo
src/csv.ts. Končna funkcija createCsv izbere polja s filtriranjem stalnega
kanoničnega seznama, zato zaporedje izbire ne določa zaporedja v datoteki.

Naslednji zagon isti bajtni pogoj uspešno prestane in odpove pozneje pri
pričakovanju onemogočenega gumba: test odstrani id, title pa ostane izbran.
Item_24 spremeni samo test in odstrani obe polji. Sledijo trije celoviti
uspešni zagoni 49/49, zadnji po poimenovanju skupine kontrol za dostopnost.
Arhiv je completed po 685,011 s, končna neodvisna ocena pa 70/70 in 12/12;
dosežen je strogi uspeh. Popolna poraba je 2237348 vhodnih in 27687 izhodnih.

Zaporedje loči potrjeno napako serializacije od napačnega pričakovanja
testnega scenarija. To je primer koristnega lastnega testa s primerjavo
natančnih bajtov; iz enega primera ne sklepamo o pogostosti ali prednosti A.

Dokazi: [izvlečki zagonov in sprememb](evidence/P06-A-003-checks.md),
[končna serializacija](../runtime/runs/P06-A-003/submission/src/csv.ts),
[test nekanonične izbire in onemogočenega izvoza](../runtime/runs/P06-A-003/submission/tests/agent/P06.spec.ts),
[neodvisna ocena](../runtime/runs/P06-A-003/evaluation-summary.json).

## P04-B-003: pregled zahteva dodatne teste

Ta naknadno izbrani primer ponovitve 003 je zunaj formalnega rubričnega
vzorca 001. Pregledovalec ne navede potrjene napake kode aplikacije, temveč
zahteva dopolnitev dokazov za R07 in R10. Predaja ima zastavico
codeChangesRequired=true in sproži formalno implementation-repair fazo.
To ni samo po sebi dokaz, da je bila popravljena funkcionalna napaka.

Popravljalna faza spremeni le tests/agent/sorting.spec.ts in verification.md.
Novi test preveri naslove vseh treh stolpcev table in ID-je v njih; stolpec
V delu vsebuje en zapis, preostala dva več zapisov. Druga dopolnitev preizkusi
5 × 2 × 5 × 2 = 100 kombinacij kontrol posebej pri praznem in posebej pri
enoopravilnem projektu, nato še ponastavitev. Prvi ciljni zagon v tej fazi
ima 3/4: kombinirani test pričakuje web-only, dobi pa prazen seznam.
Sprememba samo testne datoteke razdeli prazni in enoopravilni primer v
ločena testa; naslednji ciljni zagon potrdi 5/5.

Pred pregledom je celoviti check potrdil 50/50. Po zadnji testni dopolnitvi
je izveden samo ciljni 5/5, kar je v predaji odkrito navedeno. Končno
neodvisno ocenjevanje oddaje potrdi 70/70 in 12/12. Postopek je completed
po 1171,916 s, od tega 146,372 s za popravljalno fazo, in doseže strogi
uspeh. Usklajena popolna poraba je 2534143 vhodnih in 44879 izhodnih tokenov;
poraba nadaljevane implementerjeve seje se ne šteje dvakrat.

Dokazi: [pregledovalčeva predaja](../runtime/runs/P04-B-003/submission/docs/agent/review.json),
[zagoni in testni spremembi](evidence/P04-B-003-repair.md),
[končni testi](../runtime/runs/P04-B-003/submission/tests/agent/sorting.spec.ts),
[spremenjene datoteke po fazah](../runtime/runs/P04-B-003/execution.json),
[usklajena poraba](../runtime/runs/P04-B-003/usage-observation.json),
[neodvisna ocena](../runtime/runs/P04-B-003/evaluation-summary.json).


## P10-B-003: zastarela predaja in premočan sklep pregleda

Ta naknadno izbrana ilustracija ponovitve 003 ni formalna rubrična presoja.
Obe fazi implementacije in pregleda dosežeta časovno mejo. Končna oddaja
je funkcionalno uspešna (70/70 in 12/12), status pa je
completed_with_phase_time_limit, skupaj 1081,197 s. Popolna poraba je
neznana; opažena spodnja meja znaša 1373851 vhodnih in 33938 izhodnih tokenov.

Implementacijski dnevnik neposredno potrdi začetno napako TS18047
(item_23), popravek App.tsx (item_24) in celotni check 46/46 z exit 0
(item_26). Nato je dodan lasten nabor: prvi ciljni zagon ima 2/3, po
testni spremembi pa item_35 potrdi 4/4. Zadnja lint in typecheck sta prav
tako zaključena z exit 0 (item_38/39). Celotnega checka po dodatku lastnih
testov ni, zato teh ločenih uspehov ne predstavljamo kot celovitih 50/50.

Verification.md kljub temu ostane pri »Pending implementation« in
»Pending« za preverjanje. Pregledovalec v naslednji fazi prebere ta
predajni dokument (item_6), nato v review.json zapiše, da izvedbeni zapisi
potrjujejo, da testi niso bili zagnani (item_11). Hkrati pravilno pove,
da jih sam v pregledovalni fazi ni poganjal, in ne zahteva popravka.

Dokazi ločijo dva pojava: izgubo rezultatov v nedokončani predaji in
premočno sklepanje o odsotnosti izvajanja iz oznake »Pending«. Surovi
dnevnik prvega izvajanja drugi trditvi nasprotuje. To ni dokaz namernega
zavajanja ali dokaz o pogostosti takega pojava. Pregledovalec v protokolu
prejme predajne artefakte; ne predpostavljamo, da je imel enak dostop do
surovih arhivskih dnevnikov kot naknadni raziskovalčev pregled.

Dokazi: [izvirni ukazi obeh faz](evidence/P10-B-003-handoff.md),
[zastarela predaja](../runtime/runs/P10-B-003/submission/docs/agent/verification.md),
[pregledovalčev zapis](../runtime/runs/P10-B-003/submission/docs/agent/review.json),
[status in faze](../runtime/runs/P10-B-003/execution.json),
[neodvisna ocena](../runtime/runs/P10-B-003/evaluation-summary.json).


## P08-B-003: koristen popravek ne zagotovi popolne oddaje

Naknadno izbrana ilustracija ponovitve 003 je zunaj formalnega vzorca 001.
Pregledovalec navede konkretno napako R05: za referenčni datum 9999-12-25
funkcija addCalendarDays vrne prag 10000-01-01. Leksikografska primerjava
štirimestnega roka 9999-12-26 s tem nizom je napačna: opravilo gre v later,
čeprav je naslednji dan in spada v week. To razlago neposredno podpirata
arhivirana koda pred pregledom in pravilo primerjave; predhodne oddaje
nismo ponovno zaganjali ali spreminjali.

Formalna popravljalna faza doda omejitev praga na 9999-12-31 v App.tsx
in lasten test navedenega primera. Ker vsi veljavni roki uporabljajo
štirimestna leta, omejeni prag pravilno zajame preostale dovoljene roke.
Pred pregledom zadnji celotni check potrdi 50/50; po popravku sta uspešna
ciljni zagon 5/5 in celotni 51/51. Predaja vsebuje dejanske rezultate.
Faza traja 137,387 s, celotni postopek pa 1155,237 s in se zaključi.
Popolna usklajena poraba je 3189183 vhodnih in 44327 izhodnih tokenov.

Končno neodvisno ocenjevanje kljub temu doseže le 68/70 in 11/12 zahtev.
E11 odpove na obeh širinah: pri prazni skupini preklop na tablo ne najde
območja Tabla opravil. Pogoj App.tsx:129 prej izriše prazno sporočilo in
zato preskoči TaskBoard. Lastni test prazne skupine (P08.spec.ts:45) ostane
v preglednici; njegov preizkus table uporablja neprazno skupino drugje.
To je enaka vrsta manjkajočega prikaza kot pri P08-A-001, ne preostala
napaka koledarskega popravka.

Izvedba zato nima strogega uspeha. Primer neposredno pokaže koristno
ugotovitev pregleda in popravljeno kodo, obenem pa omejitev pregleda ter
lastnega testnega nabora. Iz tega naknadnega primera ne ocenjujemo
pogostosti koristnih pregledov ali vzročne prednosti B. Izid in končna
oddaja ostaneta nespremenjena.

Dokazi: [zahteva za popravek](../runtime/runs/P08-B-003/submission/docs/agent/review.json),
[ukazi, razlika kode in končni napaki](evidence/P08-B-003-repair.md),
[končna koda](../runtime/runs/P08-B-003/submission/src/App.tsx),
[lastni testi](../runtime/runs/P08-B-003/submission/tests/agent/P08.spec.ts),
[preverjena predaja](../runtime/runs/P08-B-003/submission/docs/agent/verification.md),
[neodvisna ocena](../runtime/runs/P08-B-003/evaluation-summary.json).


## P08-A-003: uspeh po spremembi testnega scenarija

Ta naknadno izbrana ilustracija ponovitve 003 ni del formalne presoje 001.
Prvi celotni check item_19 ima 49/51. Ena odpoved zadeva ponovni mount
praznih podatkov na že uporabljeni strani; druga pri mobilnem scenariju
ne najde območja Tabla opravil po preklopu na tablo. Model v item_20 in
poznejši predaji obe opiše kot napaki testne postavitve, vključno s
pričakovanjem table pri prazni skupini.

Item_21 spremeni samo tests/agent/P08.spec.ts. Naslednji celotni check
item_22 uspe 52/52, po nadaljnjih dopolnitvah pa zadnji item_32 potrdi
53/53. V končnem mobilnem testu je izbrana skupina all in preverjen vseh
osem opravil; lastni test prazne skupine ostane v preglednici. Po začetnem
posegu v App.tsx (item_15) v dnevniku ni novega posega v kodo aplikacije.
Ta zaporedja in končna predaja podpirajo opis spremembe testnega scenarija;
izvornega patcha ne rekonstruiramo kot popoln vmesni posnetek.

Končna App.tsx:80–82 pri prazni skupini namesto TaskBoard izriše samo
sporočilo. Neodvisno E11 zato na obeh širinah znova ne najde območja table.
Končni rezultat je 68/70 in 11/12, completed po 702,092 s, brez strogega
uspeha. Popolna poraba znaša 2162062 vhodnih in 31878 izhodnih tokenov.
Napaka koledarskega izračuna ni opaženi razlog teh dveh odpovedi.

V okviru zamrznjenega ocenjevalnega merila druga razvojna odpoved torej ni
bila odpravljena s popravkom kode: uspešen lastni nabor je sledil spremembi
scenarija, ne potrditvi prejšnjega praznega prikaza. To kaže, zakaj samo
rast števila uspešnih lastnih testov ni zadosten dokaz izboljšave rešitve.
Iz primera ne sklepamo na namerno izogibanje preverjanju, njegovo pogostost
ali splošno slabost postopka A. Oddaja ni popravljena in meritev ni ponovljena.

Dokazi: [prvotni neuspeh, komentar, posegi in poznejši zagoni](evidence/P08-A-003-test-scenario.md),
[končna koda](../runtime/runs/P08-A-003/submission/src/App.tsx),
[končni testi](../runtime/runs/P08-A-003/submission/tests/agent/P08.spec.ts),
[modelova razlaga v predaji](../runtime/runs/P08-A-003/submission/docs/agent/verification.md),
[neodvisni izid](../runtime/runs/P08-A-003/evaluation-summary.json).


## P08-B-002: pregled dopolni prazen primer, kombinacija s tablo ostane nepokrita

Naknadna ilustracija ponovitve 002 ni del formalnega vzorca 001.
Pregledovalec pravilno ugotovi, da predaja trdi preverjanje prazne skupine
v nepraznem projektu, dostopni testi pa preverjajo samo prazen projekt.
Zahteva test točnega sporočila in vrnitve na drugo skupino ali all.
Njegov codeChangesRequired je true, vendar ugotovitev zahteva dodatni test,
ne navaja potrjene napake aplikacijske kode. Testov ne ponovi.

Prvotni implementator doda četrti lasten scenarij (P08.spec.ts:79–87).
V projektu z enim opravilom izbere prazno skupino done, preveri sporočilo
in vrnitev na all. Test ostane v preglednici; ne preklopi na tablo.
Pred pregledom item_50 potrdi celotni check 49/49. Popravljalni item_10
potrdi 4/4 lastnih in item_13 celotni check 50/50. Predaja je posodobljena.
Vseh 11 datotek src v posnetku pred popravkom je bajtno enakih končni oddaji.
Formalna faza popravljanja torej dopolni teste in predajo, ne kode aplikacije.

Končni App.tsx:84 izbere prazno sporočilo pred vejo za TaskBoard. Zato E11
ob preklopu pri prazni skupini na obeh širinah ne najde območja Tabla opravil.
Končni rezultat je 68/70 in 11/12, completed v 1053,714 s, brez strogega
uspeha. Popolna poraba je 2612911 vhodnih in 44439 izhodnih tokenov.

Primer pokaže koristno odpravo pretirane trditve o testiranju in hkrati
ožji obseg dodanega testa od končnega scenarija. Tudi test izrecno zahtevane
prazne skupine ne zadošča za kombinacijo te skupine s tablo. To ni dokaz
pogostosti, namernega izogibanja ali vzročne slabosti pristopa B.
Oddaja, končna ocena in vsi prvotni razvojni neuspehi ostanejo ohranjeni.

Dokazi: [zahteva pregledovalca](../runtime/runs/P08-B-002/submission/docs/agent/review.json),
[potrjeni zagoni, hashi kode in končni napaki](evidence/P08-B-002-review-test.md),
[končni test](../runtime/runs/P08-B-002/submission/tests/agent/P08.spec.ts),
[koda](../runtime/runs/P08-B-002/submission/src/App.tsx),
[predaja](../runtime/runs/P08-B-002/submission/docs/agent/verification.md),
[neodvisna ocena](../runtime/runs/P08-B-002/evaluation-summary.json).


## P05-B-003: isti rezultat 51/51, močnejše preverjanje prehodov

Naknadna ilustracija ponovitve 003 je zunaj formalnega vzorca 001.
Pregledovalec ne navede potrjene napake aplikacije, temveč tri vrzeli v
lastnih testih. R04 ni preverjen pri menjavi velikosti, ko bi bila prejšnja
številka strani še veljavna. R07 preverja ohranitev le na strani 1, na katero
bi napačna ponastavitev prav tako vodila. Pri R08 menjava projekta že pred
osvežitvijo vrne privzete nastavitve, zato test ne dokazuje ponastavitve ob
sami osvežitvi. Zahteva codeChangesRequired se zato nanaša na teste in predajo.

Prvotni implementator v 117,585 s dopolni vse tri scenarije. Pri velikosti 2
odpre stran 2, preklopi na velikost 5 in preveri stran 1, čeprav bi bila stran 2
še veljavna. Filter todo in velikost 2 ohranja na drugi strani med preklopoma
pogledov ter po vrnitvi iz podrobnosti. Osvežitev zdaj izvede neposredno iz
neprivzetega stanja, ločeno pa ponovno preveri menjavo projekta.

Pred pregledom item_19 potrdi check 51/51; po dopolnitvi popravljalni item_7
prav tako potrdi 51/51. Število petih lastnih scenarijev in testnih datotek
ostane enako. Vseh 10 src datotek je pred in po popravku bajtno enakih.
Spremenita se vsebina testnih trditev in verifikacijska predaja. To ilustrira,
zakaj samo število ali uspešnost lastnih testov ne opiše njihove pokritosti.

Končna neodvisna ocena je 70/70 in 12/12, completed v 1106,093 s in strogi
uspeh. Popolna usklajena poraba je 2223339 vhodnih ter 46306 izhodnih tokenov.
Predhodni razvojni check item_13 ima TS2345 v lastnem testu; ta je popravljen
že pred pregledom. Pregledovalec testov sam ne ponovi. Primer ne določa
pogostosti takih izboljšav ali vzročne prednosti B in ne dodaja ordinalne ocene.

Dokazi: [tri ugotovitve pregleda](../runtime/runs/P05-B-003/submission/docs/agent/review.json),
[surovi izidi, primerjava testov in hashi kode](evidence/P05-B-003-test-preconditions.md),
[prvotni testi](../runtime/runs/P05-B-003/phases/03-review/submission/tests/agent/P05-pagination.spec.ts),
[končni testi](../runtime/runs/P05-B-003/submission/tests/agent/P05-pagination.spec.ts),
[končna predaja](../runtime/runs/P05-B-003/submission/docs/agent/verification.md),
[neodvisna ocena](../runtime/runs/P05-B-003/evaluation-summary.json).
