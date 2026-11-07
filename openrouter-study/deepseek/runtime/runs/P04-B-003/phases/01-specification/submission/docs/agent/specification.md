# Razvojna specifikacija — P04: Stabilno razvrščanje z dvema ključema

Različica 1.0, 10. oktober 2026. Vloga: avtor specifikacije. Dokument je
oddan implementerju; tabele izvedbe in sledljivosti izpolni in posodobi
implementer z dejanskimi rezultati. Zgodovina: docs/agent/specification-history.md.

## Problem in kontekst

Uporabnik v preglednici in na tabli Folio pregleduje opravila projekta. Želi
jih razvrščati po dveh ključih z neodvisnima smerema, pri čemer mora biti
razvrščanje stabilno in enako vidno v obeh pogledih. Začetna aplikacija
razvrščanja še ne ponuja: ProjectView (src/App.tsx) izpiše opravila v
vrstnem redu prejetega polja, TaskBoard (src/TaskBoard.tsx) jih razdeli v tri
stolpce in znotraj vsakega stolpca ohrani relativni vrstni red prejetega
polja. Predvidena sprememba doda štiri kontrole in gumb za ponastavitev;
razvrščanje je zgolj projekcija prikaza in ne spreminja podatkov.

## Vhodi, dejanja in izidi

### Podatkovna polja (shared/types.ts)

| Polje | Tip | Pomen in omejitve |
| --- | --- | --- |
| id | string | enkratna oznaka; prikazana natanko enkrat; povezave in data-task-id |
| projectId | string | pripadnost projektu; vsako opravilo pripada svojemu projektu |
| title | string | naslov; enaki naslovi med opravili so dovoljeni |
| description | string | opis; navadno besedilo, tudi Unicode in ločila |
| status | todo, in_progress, done | stanje opravila |
| assignee | string | neprazno ime, različno od rezervirane vrednosti all |
| dueDate | string | veljaven koledarski datum YYYY-MM-DD |

Podatki: poljubno število opravil (tudi 0, 1 in več kot 10), drugačni
enkratni ID-ji, enaki naslovi, različno zaporedje, oba projekta sta lahko
prazna. Aplikacija bere samo javni API /api/; testnih kontrol /__test/ ne
uvaža in ne uporablja.

### Dejanja in izidi

| Dejanje | Pričakovano stanje po uspehu | Napaka ali preklic |
| --- | --- | --- |
| sprememba katere koli od štirih kontrol | takojšnja ponovna projekcija razvrščenega polja | ne vpliva na obstoječe prikaze Loading/LoadError |
| gumb Izvorni vrstni red | vse štiri kontrole na privzete vrednosti, vrstni red prejetega polja | – |
| preklop pogleda Preglednica/Tabla | iste štiri nastavitve in isti relativni vrstni red | – |
| odpri/zapri podrobnosti (X, Escape, nazaj) | vrstni red in nastavitve nespremenjeni; obstoječe zapiranje in fokus | – |
| menjava projekta | za nov projekt privzete štiri nastavitve | – |
| osvežitev strani | privzete štiri nastavitve | – |
| nalaganje ali napaka branja | obstoječi prikazi Loading/LoadError; razvrščanje šele na prejetih podatkih | retry ostane |

### Simboli in predpostavke

- T = [t0, t1, …, t(n-1)] je polje opravil, kot ga vrne
  GET /api/projects/{projectId}/tasks; indeks v T je izvorni vrstni red.
- norm(s) = s.normalize("NFD") z odstranjenimi znaki U+0300–U+036F, nato
  s.toLowerCase(); primerjava poteka leksikografsko po UTF-16 z operatorjema
  < in > (brez localeCompare, Intl.Collator ali jeziku prilagojenega
  razvrščanja).
- rang(status): todo = 0, in_progress = 1, done = 2.
- kljuc(t, k): k = original → ni primerjave (vsi ključi enaki); k = title ali
  assignee → norm(t[k]); k = status → rang(t.status); k = dueDate →
  koledarski datum (kronološko, veljaven YYYY-MM-DD).
- smer(d, x) = x za d = asc, -x za d = desc.
- cp(a, b) = 0, če je p = original; sicer smer(d1, sign(kljuc(a, p) - kljuc(b, p))),
  kjer sign vrne -1, 0 ali 1 glede na primerjavo z < in >.
- cs(a, b) = 0, če je s = none; sicer smer(d2, sign(kljuc(a, s) - kljuc(b, s))).
- primerjava(a, b) = cp(a, b), če cp ni 0; sicer cs(a, b), če cs ni 0; sicer 0.
- razvrsceno = stabilno urejeno T po primerjava; pri izenačenju ohrani
  izvorni vrstni red (indeks v T). Če je p = original, je razvrsceno = T ne
  glede na d1, s in d2.
- Nastavitve p, d1, s, d2 so lokalno stanje trenutnega projekta; brez trajne
  shrambe in brez zapisa v URL. Privzeto: p = original, d1 = asc, s = none,
  d2 = asc.
- Predpostavke: datumi so veljavni YYYY-MM-DD (manjkajočih ali neveljavnih ni
  treba podpreti); besedila so navadno besedilo; imena so neprazna in različna
  od all; ID-ji so enkratni; enaki naslovi so dovoljeni.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Pred posegom velja p = original, d1 = asc, s = none, d2 = asc in razvrsceno = T. Preglednica izpiše vrstice v vrstnem redu T, tabla razdeli T po stanjih. | razvojni test D01 (prvi del), test UI |
| R02 | Za p v {title, assignee} je kljuc = norm; primerja se norm(a) < norm(b) po UTF-16. Enaki normirani nizi se ne razlikujejo. | D01 (title) in test UI z Unicode |
| R03 | p = status: todo < in_progress < done po rangu. p = dueDate: veljavni datumi se razvrstijo kronološko. | D02 (status, dueDate), D03 (dueDate) |
| R04 | d1 = desc zamenja predznak samo primerjave primarnega ključa (cp = -cp); ne obrne celotnega polja in ne spremeni vrstnega reda izenačenih elementov. Enako velja za d2 na sekundarnem ključu. | D02, D04 in test UI |
| R05 | cs se upošteva samo, kadar je cp = 0; s ima neodvisno smer d2; s = none pomeni cs = 0. | D02 in test UI |
| R06 | Ob cp = 0 in cs = 0 elementa ohranita izvorni vrstni red. p = original vrne razvrsceno = T ne glede na d1, s, d2; enak s in p je dovoljen in ne doda obrata. | D01 (web-02 pred web-03), D04 in test UI |
| R07 | Stolpci table so vedno v vrstnem redu todo, in_progress, done (Pripravljeno, V delu, Končano). Znotraj stolpca c je vrstni red enak kot v razvrsceno filtriranem po t.status = c. | D03 in primerjava preglednica/tabla |
| R08 | Preklop pogleda ohrani p, d1, s, d2 in razvrsceno; odpiranje in zapiranje podrobnosti (X, Escape, nazaj) ne ponastavi vrstnega reda. | test UI |
| R09 | Menjava projekta povrne p, d1, s, d2 na privzete vrednosti; osvežitev strani prav tako. Nastavitve niso v localStorage/sessionStorage, piškotih, URL-ju ali na strežniku. | test UI (zamenjava projekta, reload, pregled URL) |
| R10 | Gumb Izvorni vrstni red nastavi p = original, d1 = asc, s = none, d2 = asc in razvrsceno = T. Prazen projekt in projekt z enim opravilom delujeta pri vseh p in obeh smereh brez napake (0 opravil: prazno stanje; 1 opravilo: ena vrstica oziroma kartica). | D04 in test UI robnih projektov |
| R11 | Razvrščanje ne spremeni polj opravil, pripadnosti, skupnih števil (Pregled stanj opravil, count-badge, stolpčni števci) niti izvornega polja T. Sprememba vrstnega reda ne pošlje nobene spremenljive zahteve (samo GET/HEAD/OPTIONS; /__test/state.saveRequests = 0). | D04 (readonly) in test UI |
| R12 | Vsi ID-ji so prikazani natanko enkrat in povezave odpirajo prave podrobnosti tudi pri enakih naslovih. Ohranijo se obstoječe bralne funkcije in prilagodljiv videz Folio; data-task-id ostane na vrsticah in karticah, dostopna imena pogledov in stolpcev ter aria-label="Pregled stanj opravil" ostanejo; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik se stran ne razširi, notranje drsenje preglednice in table je dovoljeno. | razvojni helperji details/readonly, baseline in api testi, test UI pri 390 px |

### Dogovor o vmesniku

| Kontrola | Vloga | Vrednosti | Privzeto |
| --- | --- | --- | --- |
| Primarni ključ | combobox (HTML select) | original, title, assignee, status, dueDate | original |
| Primarna smer | combobox | asc, desc | asc |
| Sekundarni ključ | combobox | none, title, assignee, status, dueDate | none |
| Sekundarna smer | combobox | asc, desc | asc |
| Izvorni vrstni red | gumb | – | – |

Dostopna imena so natančna; vrednosti možnosti so nizi iz tabele (razvojni
helper select izbira po vrednosti). Razporeditev novih kontrol in besedilo,
ki ni določeno zgoraj, nista predpisana. Kontrole morajo biti dosegljive v
obeh pogledih ali pa morajo biti nastavitve ob preklopu pogleda ohranjene
(R08). Sekundarna smer je brez učinka, ko je s = none.

## Izvedba in sledljivost

Vrstice veljajo kot načrt povezav. Stolpec Izid ter dokaz izpolni implementer
po dejanski izvedbi; do takrat vrednosti niso dokaz uspeha. Predlagana mesta:
kontrola in projekcija v src/App.tsx (ProjectView), primerjava v lastnem
modulu (npr. src/sortTasks.ts, izbira implementerja), stolpci v
src/TaskBoard.tsx, razvojni testi v tests/development/P04.spec.ts (D01–D04),
lastni testi v tests/agent/.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzete vrednosti in vrstni red T | D01 prvi del | src/App.tsx ProjectView, kontroli | ni preverjeno — izpolni implementer |
| R02 | norm in UTF-16 primerjava | D01, test z Unicode | primerjalni modul | ni preverjeno — izpolni implementer |
| R03 | rang stanj in kronologija datumov | D02, D03 | primerjalni modul | ni preverjeno — izpolni implementer |
| R04 | smer obrača le izbrani ključ | D02, D04 | primerjalni modul | ni preverjeno — izpolni implementer |
| R05 | sekundarni ključ ob enakosti | D02 | primerjalni modul | ni preverjeno — izpolni implementer |
| R06 | stabilnost in original | D01, D04 | primerjalni modul | ni preverjeno — izpolni implementer |
| R07 | trije stolpci in relativni vrstni red | D03 | src/TaskBoard.tsx | ni preverjeno — izpolni implementer |
| R08 | preklop pogleda in podrobnosti | test UI | src/App.tsx, src/TaskDetails.tsx | ni preverjeno — izpolni implementer |
| R09 | menjava projekta in osvežitev | test UI | src/App.tsx ProjectView | ni preverjeno — izpolni implementer |
| R10 | ponastavitev in robna projekta | D04, test UI | kontroli, gumb | ni preverjeno — izpolni implementer |
| R11 | projekcija brez zapisov | D04 readonly | celoten tok prikaza | ni preverjeno — izpolni implementer |
| R12 | ID-ji, podrobnosti, videz, 390 px | helperji details/readonly, baseline/api | src/App.tsx, src/TaskBoard.tsx | ni preverjeno — izpolni implementer |

## Odprta vprašanja in omejitve

- Končni testi niso dostopni; pogoji izhajajo iz task/instructions.md,
  shared/types.ts, src/ in razvojnih testov D01–D04.
- Razporeditev novih kontrol in dodatno besedilo nista predpisana.
- Neveljavni ali manjkajoči datumi niso v obsegu; predpostavljeni so veljavni
  YYYY-MM-DD.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso razširjene prek obstoječih regresijskih zahtev.
- Razvojni helper downloadCSV (gumb Izvozi CSV) ni del zahtev R01–R12; ne
  uvajaj izvoza brez zahteve.
- V tej vlogi aplikacija ni bila zagnana in testi niso bili izvedeni; to je
  obveznost implementerja in pregledovalca.
