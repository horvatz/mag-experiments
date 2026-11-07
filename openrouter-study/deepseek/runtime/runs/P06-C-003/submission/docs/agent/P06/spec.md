# P06 — Specifikacija: Nastavljiv izvoz CSV

Vir zahtev: `task/instructions.md` (R01–R12); ustava: `.specify/memory/constitution.md`; predloga: `task/specification-template.md`. Dokument ne dodaja funkcionalnih zahtev; če je kaj izpuščeno, veljajo izvirne zahteve.

## Problem in kontekst

Folio prikazuje opravila trenutnega projekta v pogledih Preglednica in Tabla, podatke bere prek javnega API-ja `/api/` in jih ne shranjuje lokalno. Uporabnik želi opravila izvoziti v datoteko CSV, pri čemer izbere kolone, filter in ločilo. Izhodišče izvoza še nima. Sprememba doda kontrolnike in prenos datoteke v odjemalcu, brez sprememb strežnika, podatkov in videza Folio.

## Vhodi, dejanja in izidi

Podatkovna polja opravila: id, projectId, title, status, assignee, dueDate, description. status je interna vrednost (todo, in_progress, done), dueDate je izvirni YYYY-MM-DD. Vrstni red opravil je vrstni red odgovora API-ja. Projekt je lahko prazen; opravil je lahko poljubno število.

Stanje izvoza določajo:
- C — izbrane kolone, podmnožica sedmih dovoljenih; privzeto vse.
- S — ločilo, `;` ali `,`; privzeto `;`.
- F — filter, all, todo, in_progress ali done; privzeto all.

Dejanja:
- Izbira oziroma odjava kolone (`Stolpec <ime>`) spremeni C.
- Sprememba ločila (`Ločilo CSV`) spremeni S; sprememba filtra (`Filter izvoza`) spremeni F.
- Klik na `Izvozi CSV` ustvari in prenese datoteko, če je izvoz omogočen; sicer se ne zgodi nič.
- Preklop Preglednica/Tabla ne spremeni C, S, F.
- Menjava projekta ali osvežitev nastavi C := vse kolone, S := `;`, F := all.

Izidi:
- Uspeh: prenesena datoteka folio-<projectId>.csv z vsebino po pravilih spodaj; stanje opravil in prikaza nespremenjeno.
- Neuspeh oziroma onemogočeno: brez prenosa; C, S, F in podatki ostanejo taki kot prej.
- Napaka branja: izvoz ni izveden; obstoječi prikaz se ne spremeni.

### Uporabniški scenariji

1. Uporabnik odpre projekt, pusti privzete nastavitve in izvozi vsa opravila z vsemi kolonami.
2. Uporabnik izbere dve koloni, filter done in vejico, izvozi, preklopi pogled ter izvozi znova — datoteki sta enaki.
3. Uporabnik odkljuka vse kolone — gumb je onemogočen; po ponovni izbiri in ob nepraznem filtru spet deluje.

## Zahteve in pravila

### Simboli in predpostavke

T = opravila trenutnega projekta iz `/api/` v izvornem vrstnem redu; V = [t ∈ T : F(t)] (F = all pomeni V = T). Kolone so vedno v vrstnem redu id, projectId, title, status, assignee, dueDate, description. Izvoz je omogočen natanko takrat, ko je izbrana vsaj ena kolona in V ni prazen. Vrednosti so izvirni nizi iz podatkov, razen nevtralizacije formul (R08).

### Splošna pravila

- P1 (omogočenost): gumb `Izvozi CSV` je omogočen natanko takrat, ko je izbrana vsaj ena kolona in V ni prazen.
- P2 (vsebina): datoteka = BOM U+FEFF + glava + vrstice za V v izvornem vrstnem redu; stolpci v fiksnem vrstnem redu izbranih kolon.
- P3 (navedba): vsaka glava in vsaka vrednost je obdana z `"`; vsak notranji `"` se podvoji.
- P4 (nevtralizacija): če se izvirni niz po poljubnih začetnih znakih iz {presledek, tab, CR, LF} začne z =, +, - ali @, se na sam začetek izvirnega niza doda apostrof; drugi nizi ostanejo nespremenjeni; velja za vrednosti, ne za glavo.
- P5 (vrstice): vrstice so ločene s CRLF, tudi za zadnjo vrstico; ločila in prelomi znotraj vrednosti ostanejo v navedeni vrednosti.
- P6 (prenos): ime folio-<projectId>.csv, UTF-8 z BOM; brez nove strani; vsebina se ne pošilja strežniku.
- P7 (stanje): izvoz ne spreminja opravil, izvornih polj in bralnih funkcij; ni zapisov na API.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsa opravila projekta v izvornem vrstnem redu; privzeto C = vse, S = ;, F = all. | Primerjava vrstnega reda in privzetih vrednosti ob prvem izvozu. |
| R02 | Glava in vrednosti sledijo vrstnemu redu id, projectId, title, status, assignee, dueDate, description ne glede na vrstni red klikov. | Klik kolon v obratnem vrstnem redu in primerjava glave. |
| R03 | Brez izbranih kolon je izvoz onemogočen in ne ustvari prenosa; ponovna izbira kolone omogoči izvoz, ko obstajajo ustrezne vrstice. | Preverjanje stanja gumba in odsotnosti prenosa. |
| R04 | Filter omeji le izvožene vrstice; prikaz projekta ostane celoten; prazen projekt ali prazen filtrirani rezultat onemogoči izvoz. | Izvozi za vse vrednosti filtra in za prazne množice. |
| R05 | Prenos datoteke folio-<projectId>.csv z BOM U+FEFF; brez nove strani in brez pošiljanja vsebine na strežnik. | Zajem prenosa, imena, prvih bajtov in omrežnih klicev. |
| R06 | Ločilo je ; ali ,; vsaka glava in vrednost navedena; notranji " podvojen. | Primerjava bajtov za obe ločili z vrednostjo, ki vsebuje ". |
| R07 | Vrstice so ločene s CRLF, tudi zadnja; ločila in prelomi v vrednostih ostanejo znotraj navedene vrednosti. | Pregled bajtov z vrednostjo, ki vsebuje podpičje, vejico in prelom. |
| R08 | Nevtralizacija po P4 za vse podatkovne kolone; drugi nizi nespremenjeni. | Vrednosti z =, +, -, @, tudi za presledki, tabulatorjem, CR in LF. |
| R09 | Unicode, presledki in opisi ostanejo ohranjeni razen P4; status interna vrednost; dueDate izvirni YYYY-MM-DD. | Primerjava znak za znakom. |
| R10 | Preklop pogleda ohrani izbor kolon, ločilo in filter; isti nastavitvi dajeta iste bajte. | Dva izvoza v različnih pogledih z istimi nastavitvami. |
| R11 | Menjava projekta in osvežitev ponastavita izbor kolon, ločilo in filter; vsak izvoz odraža trenutne nastavitve. | Zaporedni izvozi po spremembah in osvežitvi. |
| R12 | Izvoz ne spremeni opravil, polj in bralnih funkcij; ni zapisov na API; videz Folio ostane prilagodljiv. | Regresijski testi, pregled klicev, preverjanje pri 390 px. |

Dogovor o vmesniku: dostopna imena checkboxov `Stolpec <ime>`, selectov `Ločilo CSV` in `Filter izvoza`, gumba `Izvozi CSV`; ohranjeni `data-task-id`, obstoječa dostopna imena in `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu so zunaj njegove povezave; pri 390 px se stran ne razširi, notranje drsenje je dovoljeno.

## Izvedba in sledljivost

Implementacija še ni izvedena (faza specifikacije); zato so izidi označeni kot neizvedeni in se vpišejo sproti med implementacijo. Skupni testi ostanejo nespremenjeni; lastna preverjanja so v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | V v izvornem vrstnem redu, privzete nastavitve. | Izvoz brez sprememb nastavitev. | src/ — določi plan.md. | Ni izvedeno. |
| R02 | Fiksni vrstni red kolon. | Klik v obratnem vrstnem redu. | src/ — določi plan.md. | Ni izvedeno. |
| R03 | Omogočenost glede na izbrane kolone in V. | Odkljukaj vse, nato izberi eno. | src/ — določi plan.md. | Ni izvedeno. |
| R04 | Filter omeji le izvoz. | Vsi filtri, prazen projekt, prazen rezultat. | src/ — določi plan.md. | Ni izvedeno. |
| R05 | Ime, BOM, prenos. | Zajem prenosa in omrežnih klicev. | src/ — določi plan.md. | Ni izvedeno. |
| R06 | Navedba in ločilo. | Bajti za obe ločili. | src/ — določi plan.md. | Ni izvedeno. |
| R07 | CRLF in ohranjeni znaki. | Bajti z ločili in prelomi v vrednostih. | src/ — določi plan.md. | Ni izvedeno. |
| R08 | Nevtralizacija formul. | Vrednosti z vodilnimi znaki in =, +, -, @. | src/ — določi plan.md. | Ni izvedeno. |
| R09 | Ohranjeni Unicode in polja. | Primerjava znakov. | src/ — določi plan.md. | Ni izvedeno. |
| R10 | Ohranjeno stanje med pogledi. | Izvoz v obeh pogledih. | src/ — določi plan.md. | Ni izvedeno. |
| R11 | Ponastavitev ob projektu in osvežitvi. | Zaporedni izvozi po spremembah. | src/ — določi plan.md. | Ni izvedeno. |
| R12 | Brez stranskih učinkov. | Regresija in preverjanje pri 390 px. | src/ — obstoječe bralne poti. | Ni izvedeno. |

## Odprta vprašanja in omejitve

- Razporeditev kontrolnikov in besedilo, ki ni določeno v zahtevah, nista predpisana; izbira sledi videzu Folio.
- Končni (skriti) testi izvajalca niso dostopni; dokazila bodo iz lastnih in skupnih testov.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve niso razširitev obstoječih regresijskih zahtev.
- Stanje funkcionalnosti je lokalno trenutnemu projektu; novih zapisovalnih API-jev ni.
- Nejasnosti se rešujejo iz zahtev R01–R12; če bistven podatek manjka, se omejitev zapiše in delo ustavi.
