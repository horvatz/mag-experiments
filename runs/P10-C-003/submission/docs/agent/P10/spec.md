# P10 — Lokalen vrstni red z razveljavitvami

Status: izvedeno in lokalno preverjeno. Datum: 2026-09-25. Različica: 1.1.

Viri: [izvirne zahteve](../../../task/instructions.md),
[projektna pravila](../../../PROJECT_RULES.md),
[skupna predloga](../../../task/specification-template.md),
[projektna načela](../../../.specify/memory/constitution.md),
[dizajn Folio](../../dizajn.md). Izvirne zahteve ostanejo merilo.

## Problem in kontekst

Uporabnik želi lokalno prerazporediti opravila projekta, razveljaviti ali
ponoviti premike in obnoviti začetni vrstni red. Obstoječi Folio podatke bere
iz API-ja, omogoča preglednico, tablo s tremi stalnimi stolpci stanj ter
podrobnosti po ID-ju. Trenutno prikazuje prejete sezname brez zgodovine
premikov. Dopolnitev ohrani potrjeni videz, slovenske oznake, navigacijo,
števce stanj in polja opravil. Vrstni red ni urejanje podatkov na strežniku.

## Vhodi, dejanja in izidi

Vhodi so projekti (`id`, `name`) in opravila (`id`, `projectId`, `title`,
`description`, `status`, `assignee`, `dueDate`) iz obstoječega `/api/`.
ID-ji so enkratni; naslovi niso identifikatorji. Veljajo poljubne dolžine
seznamov, tudi 0, 1 in več kot 10, poljubno prejeto zaporedje, Unicode in
ločila v navadnem besedilu ter veljavni koledarski datumi. Vsako opravilo
pripada svojemu projektu. Stanja so `todo`, `in_progress`, `done`.

Dovoljena nova dejanja so premik gor/dol, razveljavitev, ponovitev in
obnova začetnega vrstnega reda. Uspešno dejanje spremeni samo vrstni red in
zgodovino po spodnjih pravilih; premik ne odpre podrobnosti. Onemogočeno
ali neveljavno dejanje je brez učinka. Posebnega potrjevanja oziroma
preklica ni; uporabnik veljavno dejanje razveljavi. Preklop pogleda in
odpiranje/zapiranje podrobnosti nista dejanji zgodovine. Menjava projekta
in osvežitev zavržeta lokalni vrstni red ter obe zgodovini.

Obstoječi prikazi nalaganja, napak branja s ponovnim poskusom in neveljavnih
povezav ostanejo uporabni. Lokalni premiki ne zahtevajo zapisovanja in ne
uvajajo novih strežniških napak. P10 ne širi pravil sočasnega nalaganja ali
sprememb podatkov brez osvežitve prek obstoječih regresijskih zahtev.

### Dogovor o vmesniku

- Vsaka vrstica/kartica ohrani `data-task-id` in vsebuje gumba z dostopnima
  imenoma `Premakni <id> gor` ter `Premakni <id> dol` zunaj povezave opravila.
- Globalno mesto je številka v elementu z `aria-label="Mesto opravila <id>"`.
- Skupni gumbi so `Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`.
- Element `role="status"`, `aria-label="Zgodovina vrstnega reda"` prikazuje
  `Razveljavitve: U. Ponovitve: R.` s trenutnima številoma.
- Ohranijo se imena pogledov in stolpcev ter
  `aria-label="Pregled stanj opravil"`. Fokus ostane viden.
- Pri 390 pikah se cela stran ne razširi; notranje drsenje obeh pogledov je
  dovoljeno. Nove kontrole sledijo obstoječim gradnikom in barvam Folio;
  njihova natančna postavitev ni predpisana.

## Zahteve in pravila

### Model stanja in predikati

`T` je prejeto polje opravil trenutnega projekta, `B = map(T, id)` izvorno
zaporedje, `P` trenutno zaporedje ID-jev. `H` je sklad prejšnjih permutacij
za razveljavitev in `F` sklad permutacij za ponovitev; vrh sklada je njegov
zadnji element. `H · [P]` pomeni dodajanje celotne kopije `P` na konec;
`tail20(X)` ohrani zadnjih največ 20 elementov. Enakost zaporedij primerja
ID-je na istih mestih. `N = |B|`, `U = |H|`, `R = |F|`.
Zapis `T[id]` spodaj pomeni opravilo, poiskano po ID-ju, ne indeksa polja.

- Inicializacija ob nalaganju projekta: `(P,H,F) = (B,[],[])`.
- Invarianta: `|P| = N ∧ set(P) = set(B) ∧ |set(P)| = N`; enako velja za
  vsako shranjeno permutacijo. Za vsak ID ostanejo vsa polja `T` enaka.
- Mesto: `position(id) = index(P,id) + 1` za vse ID-je v projektu.
- Premik: za `i = index(P,id)` in smer `d ∈ {-1,+1}` velja
  `valid = 0 ≤ i < N ∧ 0 ≤ i+d < N`. Če velja, naj bo `Q` kopija `P` z
  zamenjanima mestoma `i` in `i+d`; novo stanje je
  `(Q, tail20(H · [P]), [])`. Če ne velja, ostane celotno stanje enako.
- Razveljavitev: če `H = H0 · [Q]`, je novo stanje `(Q,H0,F · [P])`;
  pri praznem `H` ni spremembe in gumb je onemogočen.
- Ponovitev: če `F = F0 · [Q]`, je novo stanje
  `(Q,tail20(H · [P]),F0)`; pri praznem `F` ni spremembe in gumb je onemogočen.
- Začetni vrstni red: če `P ≠ B`, novo stanje
  `(B,tail20(H · [P]),[])`; sicer je stanje nespremenjeno in gumb onemogočen.
- Preglednica prikazuje `P`. Stolpec table za stanje `s` prikazuje
  `filter(P, id => T[id].status = s)`; sosed pri premiku je vedno iz `P`.
- `0 ≤ U ≤ 20`; števec in onemogočenost gumbov izhajata iz dejanskih skladov.
- Preklop pogleda in podrobnosti: `(P,H,F)` ostane enak. Menjava projekta
  (tudi povratek) in osvežitev: ponovno `(B,[],[])` iz prejetih podatkov.

Pravila so splošna za dovoljeno podatkovno domeno; spodnji scenariji so
primeri preverjanja, ne omejitve pravil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetni `P=B`; mesta 1…N pripadajo ID-jem tudi ob enakih naslovih. | S1: primerjava prejetih ID-jev, prikaza in mest. |
| R02 | Veljaven premik zamenja neposredna globalna soseda; nobeno polje se ne spremeni. | S1, S5: premik v obe smeri v obeh pogledih. |
| R03 | Prvi gor in zadnji dol sta onemogočena; neveljavno/ponovljeno robno dejanje ohrani `P,H,F`. | S2: rob pred premikom in po njem, tudi s ponovitvami na voljo. |
| R04 | Vsak veljaven premik shrani prejšnjo celotno permutacijo; undo jo obnovi in shrani trenutno za redo. | S2: več zaporednih premikov in razveljavitev. |
| R05 | Redo obnavlja v pravilnem vrstnem redu, brez izgubljenih ali podvojenih ID-jev. | S2: več undo/redo korakov, primerjava vseh ID-jev po vsakem. |
| R06 | Nov veljaven premik počisti `F`; neveljaven robni premik ga ohrani. | S2: razvejitev zgodovine in neveljavna dejanja. |
| R07 | `U≤20`; 21. dejanje zavrže najstarejšo prejšnjo permutacijo; vsi razveljavljeni koraki so ponovljivi. | S3: vsaj 21 premikov, 20 undo in 20 redo. |
| R08 | Obnova `B` je eno dejanje z undo in praznim `F`; pri `P=B` je brez učinka in onemogočena. | S4: reset po undo, undo/redo reseta ter reset ob začetnem redu. |
| R09 | Preglednica kaže `P`, tabla filtrirani `P` v stalnih stolpcih; premik prek meje stanj spremeni globalna mesta, ne stanj. | S5: globalna soseda različnih stanj ter vrstni red znotraj stolpca. |
| R10 | Pogleda in podrobnosti ohranijo `P,H,F`; menjava projekta in osvežitev jih ponastavita; ni trajne shrambe. | S6: oba pogleda, odpiranje/zapiranje, drugi projekt, povratek, osvežitev. |
| R11 | Točno besedilo števca z `U,R`, skladno z gumboma; prazni in eno-opravilni projekti brez veljavnega premika. | S2, S7: števci in gumbi v vsakem stanju ter N=0/1. |
| R12 | Permutacije ohranijo ID-je, polja, števce stanj in pravilne podrobnosti; nič zapisov API; Folio ostane prilagodljiv. | S1–S8: podatki, omrežje, regresije in širina 390 pik. |

### Uporabniški scenariji in merilo uspeha

- **S1 — Začetek in identiteta:** uporabnik vidi prejeto zaporedje z enakimi
  naslovi, različnimi ID-ji in globalnimi mesti; premika izbrani ID gor/dol.
- **S2 — Zgodovina in robovi:** po več premikih razveljavi in ponovi korake,
  nato izvede nov premik; števci in možnosti vedno ustrezajo skladoma.
  Neveljaven robni premik ne izbriše preostalih ponovitev.
- **S3 — Omejitev:** po več kot 20 veljavnih premikih lahko razveljavi le
  zadnjih 20 in jih vse ponovno izvede.
- **S4 — Izhodišče:** obnovi začetni vrstni red kot eno dejanje, ga razveljavi
  in ponovi. Gumb ostane onemogočen vsakič, ko je vrstni red že izvoren.
- **S5 — Tabla:** vidi stalne stolpce in njihove relativne vrstne rede;
  premik čez soseda drugega stanja spremeni globalno mesto brez premika
  opravila v drug stolpec. Preklop v preglednico pokaže isti globalni red.
- **S6 — Življenjska doba:** po premikih in undo obišče podrobnosti ter
  drugi pogled; zgodovina ostane. Menjava projekta in vrnitev ter osvežitev
  vzpostavijo izhodišče z ničelnima zgodovinama.
- **S7 — Velikosti in besedilo:** uporabi prazna projekta, enojni seznam
  ter seznam z več kot deset opravili, drugimi ID-ji, enakimi naslovi in
  Unicode besedilom. Noben prikaz ni vezan na začetne konkretne podatke.
- **S8 — Ohranitev aplikacije:** uporabi tipkovnico in zaslon 390 pik,
  preveri ločenost dejanj od povezav, Folio, podrobnosti, števce stanj in
  odsotnost zapisov API. Izvede tudi skupne regresijske teste.

Uspeh pomeni izpolnitev vseh R01–R12 in dogovora o vmesniku ter dejanske
zabeležene rezultate preverjanj. Nove meritve hitrosti ali zunanji cilji
niso del naloge.

## Izvedba in sledljivost

Celotna matrika vseh R01–R12 s pogoji, konkretnimi testi, deli kode in izidi
je v [verification.md](../verification.md#sledljivost-zahtev), skladno z
možnostjo povezav v skupni predlogi. Končni `npm run check` je uspešen:
54/54 testov (38 osnovnih, 8 razvojnih, 8 lastnih), lint, tipi in gradnja.
[Dnevnik](verification-final.log) in [vizualni dokazi](../verification.md)
so shranjeni. Prvi zagon je razkril dve napaki v lastnih testih; njuna
vzroka in popravka sta dokumentirana v istem zapisu preverjanj.

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Pot `docs/agent/P10` je izrecno določil
uporabnik. Prosta razporeditev kontrol bo sledila obstoječemu Folio.
Izvajanje ostane znotraj dovoljenih poti; brez sprememb infrastrukture,
odvisnosti, skupnih tipov ali testov. Testne kontrole sme uporabljati samo
testni program. Ni trajnega pomnjenja vrstnega reda ali novega API-ja.

Scenariji so lokalno preverjeni v obsegu matrike dokazov. Nedostopni končni
testi niso izvedeni. Mobilni prikaz je preverjen v Chromiumu pri 390 pikah,
ne na fizični napravi. Ni znanih neizpolnjenih obveznih zahtev. Posebna pravila navigacije med nedokončanim nalaganjem in novih
sočasnih sprememb podatkov brez osvežitve niso dodana.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12 po skupni predlogi;
  formalna pravila in načrtovana sledljivost, brez izvedenih testov.

- 2026-09-25, 1.1: izvedeni T001–T009; matrika prenesena v skupni zapis
  verification.md, dodani dejanski rezultati in vizualni dokazi. Pravila
  R01–R12 in obseg so nespremenjeni.
