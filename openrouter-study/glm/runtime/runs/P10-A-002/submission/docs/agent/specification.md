# Specifikacija: Lokalni vrstni red z razveljavitvami

## Problem in kontekst

Folio trenutno prikaže opravila projekta v zaporedju, ki ga vrne /api/projects/:id/tasks. Uporabnik želi opravila začasno preurediti z gumbi za premik, napake razveljaviti in ponoviti, vrniti se na izvorno zaporedje ter ohraniti obstoječe podatke, poglede in Folio oblikovanje. Vrstni red in obe zgodovini sta stanji trenutnega projekta in se ne shranjujeta.

## Vhodi, dejanja in izidi

- Vhod so projekti iz /api/projects in opravila iz /api/projects/:id/tasks. Uporabljajo se obstoječa polja Task; ni novih pisanj na API.
- Dejanja so premik opravila za eno globalno mesto gor ali dol, razveljavitev, ponovitev in vrnitev na začetni vrstni red.
- Uspeh je permutacija iste množice ID-jev brez spremembe polj opravil. Zgodovina razveljavitev hrani največ 20 prejšnjih celotnih permutacij, zgodovina ponovitev pa trenutno razveljavljene korake.
- Neveljavno robno dejanje ne spremeni stanja. Menjava projekta ali osvežitev ponastanita vrstni red in obe zgodovini na izhodišče.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | ordered(ids) = received(ids) ob nalaganju; rank(id) = index(id) + 1, pri čemer ID določa mesto, naslovi pa se ne uporabljajo kot ključ. | Razvojni in lastni UI test preverita zaporedje ID-jev ter prikaz globalnih mest. |
| R02 | move(id, up) zamenja ID z neposrednim globalnim predhodnikom; move(id, down) z neposrednim globalnim naslednikom; vse reference na opravila ostanejo nespremenjene. | Test zamenja soseda in primerja zaporedje, stanja, odgovorne osebe in roke. |
| R03 | index(id) = 0 povzroči nemogoč premik gor; index(id) = N−1 nemogoč premik dol; obe gumba sta onemogočena in ne spremenita zgodovin. | Test robnih gumbov, praznega projekta in projekta z enim opravilom. |
| R04 | Veljaven premik doda trenutno celotno permutacijo v zgodovino razveljavitev; razveljavitev obnovi zadnjo prejšnjo permutacijo in trenutno shrani za ponovitev. | Test enega premika, razveljavitve in vsebnosti zgodovine. |
| R05 | Ponovitev obnovi zadnjo razveljavljeno permutacijo in trenutno doda v zgodovino razveljavitev; večkratna izmenjava ne izgubi niti podvoji ID-jev. | Test zaporedja več razveljavitev in ponovitev. |
| R06 | Veljavna premik po razveljavitvi izprazni zgodovino ponovitev; neveljavno robno dejanje ne spremeni nobene zgodovine. | Test treh scenarijev: nov premik, onemogočen robni gumb in poskus neveljavne akcije. |
| R07 | Dolžina zgodovine razveljavitev je največ 20; ob 21. veljavnem premiku se najstarejša permutacija izloči. Vsi trenutno razveljavljeni koraki ostanejo ponovljivi. | Lastni test z 21 premiki in števcem. |
| R08 | Začetni vrstni red je ena veljavna razveljavljiva sprememba: shrani trenutno permutacijo, obnovi izvorno in počisti ponovitve. Če je trenutno zaporedje izvorno, je gumb onemogočen in ne spremeni zgodovine. | Razvojni in lastni test reset po premiku ter reset v izvornem stanju. |
| R09 | Preglednica uporablja globalno zaporedje; tabla razvrsti kartice znotraj obstoječih stolpcev po globalnem zaporedju. Premik na tabli zamenja globalnega soseda in prikaže globalno mesto, status pa ostane nespremenjen. | Test preklopa pogledov, stolpcev, premika in števcev stanj. |
| R10 | Preklop pogleda in odpiranje podrobnosti ohranita permutacijo ter obe zgodovini. Menjava projekta in osvežitev ju ponastavita. Podatki se ne shranijo trajno. | Lastni test preklopa, podrobnosti, menjava projekta in /__test/state; brskalnikova osvežitev preveri ločeno. |
| R11 | Status ima natančno besedilo Razveljavitve: U. Ponovitve: R.; gumba sta onemogočena pri U=0 oziroma R=0. Prazni in enoopravilni projekti ostanejo uporabni. | Test statusa, onemogočenih gumbov in minimalnih projektov. |
| R12 | Vsaka sprememba je permutacija iste množice ID-jev in ne sproži pisanj na API. Vsi obstoječi kontrolami, dostopnost in oblikovanje ostanejo delujoči. | Test ID-jev, saveRequests, števcev, podrobnosti in širine 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Zahteve zgoraj | Skupni razvojni testi P10 in lastni test P10 order history | tests/development/P10.spec.ts, tests/agent/p10-order.spec.ts, src/App.tsx, src/TaskBoard.tsx, src/TaskOrderControls.tsx, src/styles.css | Uspešno: skupni razvojni 8/8, lastni 9/9, celoten npm run check 55/55. Podrobnosti so v docs/agent/verification.md. |

## Odprta vprašanja in omejitve

- Ni znanih nejasnosti. Ne preverjamo navigacije med nezaključenim nalaganjem ali sočasnih sprememb API-ja brez osvežitve, ker navodila to izrecno izključujeta.
- Ne dodajamo novega API-ja ali trajne shrambe; vrstni red je izključno lokalno stanje trenutnega projekta.

## Zgodovina popravkov specifikacije

- 2026-11-02: Ustvarjena specifikacija na podlagi task/instructions.md in obstoječe arhitekture.
- 2026-11-02: Dopolnjena sledljivost z dejanskimi rezultati preverjanj; funkcionalna pravila ostajajo nespremenjena.
