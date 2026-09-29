# P06: Nastavljiv izvoz CSV

## Problem in kontekst

Folio že bere projekte in njihova opravila prek javnega API-ja ter opravila
trenutnega projekta prikazuje v preglednici ali na tabli. Uporabnik potrebuje
lokalni CSV izvoz z nastavljivim izborom stolpcev in vrstic ter ločilom, ne da
bi s tem spreminjal opravila ali njihov prikaz. Dopolnitev ohrani slovenska
poimenovanja in potrjeni videz Folio iz [`docs/dizajn.md`](../../dizajn.md).

## Vhodi, dejanja in izidi

Relevantni so trenutni projekt (`projectId`), njegova opravila in polja
`id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`,
trenutni pogled (`table`/`board`), izbor stolpcev, filter stanja ter ločilo.
Podatki ostanejo tisti, ki jih vrne obstoječi `/api/`.

Uporabnik lahko izbere stolpce, filter `all`/`todo`/`in_progress`/`done` in
ločilo `;`/`,`, preklaplja pogled ter sproži `Izvozi CSV`. Uspešen izvoz
prenese `folio-<projectId>.csv`; stanje opravil in nastavitev ostane enako.
Preklic prenosa ne spremeni opravil ali nastavitev. Med nalaganjem opravil ali
ob napaki izvoza ni mogoče pripraviti; po ponovnem branju se uporabijo trenutno
veljavne nastavitve (ob osvežitvi strani so privzete po R11).

## Zahteve in pravila

Naj bodo `T` seznam opravil trenutnega projekta v vrstnem redu
API-odgovora, `C` izbrana množica stolpcev, `F` filter in `V` trenutni
pogled. Ločilo `D` ima vrednost `;` ali `,`. Kanonični vrstni red stolpcev
je `K=[id, projectId, title, status, assignee, dueDate, description]`,
`F ∈ {all, todo, in_progress, done}`. Izvožene vrstice so `E(T,F)=T`, če je
`F=all`, sicer stabilni podseznam `T` z `status=F`. Nastavitve veljajo za
trenutni projekt in se ne shranjujejo v URL ali trajno shrambo.

Za podatkovni niz `x` je `N(x)="'"+x`, če se `x` ujema z `/^[ \t\r\n]*[=+\-@]/`;
sicer je `N(x)=x`. Tako se apostrof doda na začetek izvirnega niza. Funkcija
`Q` obdá vrednost z dvojnima narekovajema in podvoji vsak notranji dvojni
narekovaj. Glava vsebuje `Q(c)` za stolpce iz `C` v vrstnem redu `K`, podatki
pa `Q(N(t[c]))`. Serijalizacija ohrani ločila in prelome vrstic v citiranih
vrednostih, zapise združi z `CRLF` in doda `CRLF` tudi za zadnji zapis.
Prenesena vsebina se začne z UTF-8 BOM U+FEFF.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `F=all`, `C=K`, `D=;`. Vrstice so `E(T,F)` v izvornem vrstnem redu in samo iz trenutnega projekta. | Z več opravili različnih ID-jev in vrstnim redom preveri privzeti izvoz ter pripadnost projektu. |
| R02 | Dovoljeni so samo stolpci v `K`; glava in vsaka vrstica uporabljata njihov vrstni red `K`, ne vrstnega reda klikanja. | Stolpce izberi v obratnem in naključnem vrstnem redu ter primerjaj glavo in polja. |
| R03 | Če je `C=∅`, je gumb onemogočen in prenosa ni. Po izboru vsaj ene kolone je omogočen, če `E(T,F)≠∅`. | Odstrani vse izbire in preveri onemogočen gumb/brez prenosa; izberi stolpec in preveri omogočenje ob vrsticah. |
| R04 | Filter `F` spremeni samo `E(T,F)`, ne `T` v preglednici ali tabli. Če `T=∅` ali `E(T,F)=∅`, je izvoz onemogočen. | Primerjaj prikaz vseh opravil s filtriranim izvozom; preveri prazen projekt in filter brez zadetkov. |
| R05 | Prenos se imenuje `folio-<projectId>.csv`, začne z UTF-8 BOM, ne odpre nove strani in ne pošlje vsebine strežniku. | Preveri ime in začetne bajte prenosa, navigacijo strani ter da sprožitev izvoza ne ustvari zapisovalne zahteve API-ju. |
| R06 | `D` je nastavljiv na `;` ali `,`. Vsaka glava in vrednost je citirana; vsak notranji dvojni narekovaj se podvoji. | Preveri oba ločila ter prazne vrednosti, narekovaje in navadna besedila v izvoženih bajtih. |
| R07 | Zapisi so ločeni s CRLF in tudi zadnji zapis se konča s CRLF. Ločila in prelomi vrstic v vrednostih ostanejo vsebina citirane celice. | Preveri CRLF med zapisi in na koncu ter razčleni celice, ki vsebujejo ločilo ali CR/LF. |
| R08 | Za vse podatkovne stolpce uporabi `N(x)` pred CSV citiranjem; glave ne spreminjaj. Nizi, ki ne ustrezajo predponi, ostanejo nespremenjeni. | Preveri predpone `=`, `+`, `-`, `@` tudi za začetnimi presledki/tabulatorji/CR/LF ter nize brez teh predpon. |
| R09 | Šumniki, drugi Unicode znaki, presledki in vsebina opisov se ohranijo, razen `N`. `status` je interna vrednost, `dueDate` izvorni `YYYY-MM-DD`. | Izvozi Unicode, presledke, vsebino opisa, status in datum ter primerjaj s podatki API-ja. |
| R10 | Preklop `V` ohrani `C`, `D` in `F`. Ob enakem projektu, podatkih in nastavitvah sta izvoženi vsebini bajt za bajt enaki. | Izvozi v obeh pogledih z enakimi nastavitvami in primerjaj celotni datoteki. |
| R11 | Ob menjavi projekta ali osvežitvi velja `C=K`, `D=;`, `F=all`. Vsak izvoz uporabi trenutno stanje nastavitev. | Spremeni vse nastavitve, izvozi, spremeni eno nastavitev in znova izvozi; preveri razliko ter ponastavitev ob menjavi projekta/osvežitvi. |
| R12 | Izvoz in njegove kontrole ne spreminjajo opravil, njihovih polj ali obstoječih bralnih funkcij; ne pošiljajo zapisov na API. Videz ostane skladen s Folio. | Primerjaj opravila pred/po izvozu, spremljaj zahteve API ter preveri branje in potrjeno vizualno usmeritev. |

## Uporabniški scenariji

1. **Izvozi trenutni projekt:** uporabnik preveri privzete nastavitve, po
   želji izbere stolpce, filter in ločilo ter prenese CSV, katerega vrstice
   in bajti ustrezajo R01–R09.
2. **Preglej izvoz v obeh pogledih:** uporabnik nastavi kontrole, preklopi
   med Preglednico in Tablo ter dobi enako datoteko pri enakih podatkih in
   nastavitvah (R10).
3. **Nadaljuj po spremembi konteksta:** po menjavi projekta ali osvežitvi
   uporabnik vidi privzete nastavitve; po spremembi nastavitev naslednji
   izvoz uporabi nove vrednosti (R11).
4. **Ohrani opravila:** uporabnik izvozi podatke in nadaljuje delo; opravila,
   obstoječe branje in videz ostanejo nedotaknjeni, brez zapisovalne zahteve
   API-ju (R12).

## Merila uspeha

Funkcionalnost je sprejemljiva, ko so izpolnjeni in preverjeni vsi pogoji
R01–R12 ter dogovor o dostopnih imenih, obstoječih označevalnikih in odzivnem
prikazu. Izvoz mora biti mogoče preveriti po prenesenih bajtih in po stanju
uporabniškega vmesnika; rezultati preverjanja se vnesejo v sledljivost spodaj.

### Pravila stanja

Stanje kontrol je `S=(projectId,V,C,D,F)`. Ob začetku ali osvežitvi
trenutnega projekta in ob menjavi projekta se vzpostavi
`S=(projectId,V,K,';',all)`. Sprememba stolpcev, ločila ali filtra spremeni
samo ustrezno komponento. Preklop pogleda spremeni samo `V`, zato ostanejo
`C`, `D` in `F` nespremenjeni. Izvoz je omogočen natanko, ko so opravila
naložena, `C≠∅` in `E(T,F)≠∅`. Sprožitev ali preklic prenosa ne spreminja
`S` ali opravil. Če nalaganje podatkov spodleti, se uporabi obstoječi prikaz
napake in ponovni poskus branja; izvoz ne uporabi delnih podatkov.

### Dogovor o vmesniku in združljivosti

- Vsaka izbira stolpca je checkbox z dostopnim imenom `Stolpec <ime>` (npr.
  `Stolpec title`).
- HTML select `Ločilo CSV` ponuja `;` in `,`; select `Filter izvoza` ponuja
  `all`, `todo`, `in_progress`, `done`. Gumb se imenuje `Izvozi CSV`.
- Imena projektov in ID-ji v obsegu vsebujejo črke, številke in vezaje.
- Ohrani `data-task-id` na vrsticah in karticah, obstoječa dostopna imena
  pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja
  ob opravilu so zunaj njegove povezave.
- Pri širini 390 px se stran kot celota ne razširi; notranje drsenje
  preglednice in table je dovoljeno. Ohranita se vidni fokus tipkovnice in
  potrjeni slog Folio. Besedilo in razporeditev novih kontrol nista določena.

Podatki lahko vsebujejo nič, eno ali več kot deset opravil, različne enkratne
ID-je, enake naslove, drugačen vrstni red, veljavne datume, Unicode, ločila in
navadno besedilo. Vsako opravilo pripada svojemu projektu. Aplikacija bere
prek `/api/`; `/__test/` ostane samo testni mehanizem. Ne spreminjajo se
strežnik, infrastruktura, odvisnosti, skupni tipi ali skupni testi; dodatna
preverjanja funkcionalnosti sodijo v `tests/agent/`.

## Izvedba in sledljivost

Specifikacija nastane pred načrtom in implementacijo. Spodnji scenariji so
načrt za preverjanje, ne dokaz izvedenega testa. Datoteke in deli kode bodo
določeni ob implementaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete nastavitve, projekt in vrstni red | Privzeti izvoz z več opravili | Določi ob implementaciji | Ni izvedeno |
| R02 | Kanonični vrstni red `K` | Izbor stolpcev v drugem vrstnem redu | Določi ob implementaciji | Ni izvedeno |
| R03 | `C≠∅` in vrstice obstajajo | Onemogoči/omogoči izvoz in preveri prenos | Določi ob implementaciji | Ni izvedeno |
| R04 | Filter vpliva samo na `E(T,F)` | Prikaz vseh opravil in prazen filtrirani izvoz | Določi ob implementaciji | Ni izvedeno |
| R05 | Ime datoteke, BOM in brez omrežnega zapisa | Pregled prenosa, navigacije in zahtev | Določi ob implementaciji | Ni izvedeno |
| R06 | Citiranje in podvajanje narekovajev | Bajtni primeri za oba ločila | Določi ob implementaciji | Ni izvedeno |
| R07 | CRLF in ohranjena vsebina celic | Večvrstični podatki in zaključni CRLF | Določi ob implementaciji | Ni izvedeno |
| R08 | `N(x)` na podatkovnih celicah | Predpone z dovoljenimi začetnimi znaki | Določi ob implementaciji | Ni izvedeno |
| R09 | Ohranitev Unicode, statusa in datuma | Primerjava z vhodnimi podatki | Določi ob implementaciji | Ni izvedeno |
| R10 | Enaka vsebina ob menjavi pogleda | Primerjava izvoza iz Preglednice in Tabele | Določi ob implementaciji | Ni izvedeno |
| R11 | Ponastavitev in sveže nastavitve izvoza | Menjava projekta, osvežitev, zaporedna izvoza | Določi ob implementaciji | Ni izvedeno |
| R12 | Brez mutacij in ohranjena osnovna funkcionalnost | Primerjava podatkov, API branj in videza | Določi ob implementaciji | Ni izvedeno |

## Odprta vprašanja in omejitve

Zahteve in dogovor o vmesniku določajo vedenje ter formate. Besedilo in
razporeditev novih kontrol sta izrecno prepuščena izvedbi. Izvedba in testi
še niso opravljeni; njihovi izidi se dopolnijo po preverjanju. Med nalaganjem
in po napaki se uporablja obstoječi način nalaganja, napake in ponovnega
poskusa; zahteve ne določajo dodatnega besedila napake ali trajnega shranjevanja
nastavitev.
