# P06: Nastavljiv izvoz CSV

**Različica zahtev:** 1.0 · **Stanje:** specifikacija · **Vir:** [`task/instructions.md`](../../../task/instructions.md)

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Uporabnik potrebuje prenosljiv CSV, s katerim lahko izbere izvožene stolpce, ločilo in stanja opravil, ne da bi s tem spremenil prikaz vseh opravil ali podatke projekta. Izvoz mora ohraniti vsebino in vrstni red ter varno zapisati vrednosti, ki bi jih preglednica lahko razumela kot formule.

Ta sprememba dopolni obstoječi vmesnik, ohrani potrjeni videz Folio in bere podatke prek obstoječega javnega API-ja. Ne spreminja strežnika, tipov, odvisnosti, nastavitev ali skupnih testov. Testne kontrole `/__test/` so namenjene izključno testnemu programu.

## Vhodi, dejanja in izidi

Vhod je seznam opravil trenutnega projekta, kot ga vrne obstoječi API. Polja opravila so `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`; stanje je `todo`, `in_progress` ali `done`. API-jev vrstni red je izvorni vrstni red. Seznam lahko vsebuje nič, eno ali več kot deset opravil; opravila imajo enkratne ID-je, naslovi so lahko enaki, vsako opravilo pripada temu projektu, datumi pa so veljavni koledarski datumi. Projekti so lahko prazni. ID projekta vsebuje črke, številke in vezaje. Besedilna polja lahko vsebujejo Unicode, ločila, narekovaje ali prelome vrstic.

Nastavitve izvoza so lokalne trenutno prikazanemu projektu in niso dodane v URL ali trajno shranjene:

- `C`: izbrane kolone; privzeto vse dovoljene kolone.
- `d`: ločilo; privzeto podpičje (`;`), izbiri sta `;` in vejica (`,`).
- `f`: filter stanja; privzeto `all`, izbire so `all`, `todo`, `in_progress`, `done`.
- `v`: pogled opravil, `table` (Preglednica) ali `board` (Tabla).

Vsaka sprememba izbire kolone, ločila ali filtra posodobi samo pripadajočo nastavitev. Preklop `v` ohrani `(C,d,f)`. Menjava projekta ali osvežitev ponastavi `(C,d,f)` na privzete vrednosti. Izvoz uporabi trenutno naložene podatke in trenutne nastavitve. Če je izvoz onemogočen, se prenos ne začne. Uspešen izvoz prenese datoteko; ne spremeni projekta, nastavitev, opravila ali podatkov na strežniku. Aplikacija ne določa dodatnega stanja za preklic ali zavrnitev prenosa v brskalniku.

## Zahteve in pravila

### Predikati in serializacija

Če se vrednost nevtralizira po R08, se apostrof pripne pred celoten izvorni niz; začetni presledki se ne odstranijo. Prvi znak celotne izvožene vsebine je BOM `U+FEFF`, zadnji bajti pa predstavljajo zaključni `CRLF`.

Naj bo `K = [id, projectId, title, status, assignee, dueDate, description]` v tem vrstnem redu, `T` trenutni seznam opravil projekta po API-ju, `C ⊆ K`, `d ∈ {";", ","}` in `f ∈ {all, todo, in_progress, done}`. `T_f` je stabilno filtriran `T`: za `all` je `T_f = T`, sicer so v `T_f` natanko opravila, katerih `status = f`, v vrstnem redu iz `T`. Izvozne kolone so `K_C = [k ∈ K | k ∈ C]`; vrstni red izbire uporabnika ga ne spremeni.

Za naložen `T` velja: `exportEnabled(C,T,f) ⇔ |C| > 0 ∧ |T_f| > 0`.

Za vsako glavo in podatkovno vrednost CSV podvoji vse notranje dvojne narekovaje in celotno vrednost obda z dvojnim narekovajem. Pred citiranjem za podatkovni niz `s` uporabi `safe(s)`: če `s` ustreza `/^[ \t\r\n]*[=+\-@]/`, je rezultat apostrof, ki mu sledi nespremenjeni izvorni niz `s`; sicer je rezultat `s`. Apostrof se doda pred začetni presledek. Glave se ne nevtralizirajo. Glava in vsaka podatkovna vrstica uporabljajo `K_C`; polja loči trenutni `d`, vrstice pa `CRLF`. Vrednosti z ločilom ali prelomi vrstic ostanejo v citiranem polju. Vsebina se zaključi z `CRLF`, pred njo pa je UTF-8 BOM `U+FEFF`.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku izvoza so `f=all`, `C=K`, `d=;`. Izvoz vsebuje vsa opravila `T` v izvornem vrstnem redu. | Z dinamičnim seznamom opravil preveri začetne izbire, vse vrstice in njihov vrstni red. |
| R02 | Uporabnik lahko izbere poljubno podmnožico `K`. Glava in vrednosti uporabljajo `K_C` ne glede na zaporedje klikov. | Izberi kolone v obratnem vrstnem redu in primerjaj glavo ter polja z vrstnim redom `K`. |
| R03 | Če `C=∅`, je gumb `Izvozi CSV` onemogočen in klik ne sproži prenosa. Ponovna izbira kolone omogoči izvoz, kadar `|T_f|>0`. | Odstrani vse izbire, preveri onemogočen gumb in odsotnost prenosa; izberi kolono in preveri omogočitev ob ujemajočih se vrsticah. |
| R04 | `f` omeji samo izvožene vrstice na `T_f`; preglednica ali tabla še vedno prikazuje celoten `T`. Če je `T=∅` ali `T_f=∅`, je izvoz onemogočen. | Za vsak filter primerjaj prenos z ustreznimi stanji, hkrati preveri celoten prikaz; preveri prazen projekt in prazen filtrirani rezultat. |
| R05 | Prenos se imenuje `folio-<projectId>.csv`; vsebina se začne z UTF-8 BOM `U+FEFF`. Izvoz ne odpre nove strani in vsebine ne pošlje strežniku. | Preveri ime in bajte prenesene datoteke, število odprtih strani ter omrežne zahteve ob izvozu. |
| R06 | `d` je nastavljiv na `;` ali `,`. Vsaka glava in vsaka vrednost sta vedno v dvojnih narekovajih; vsak notranji dvojni narekovaj se podvoji. | Izvozi z obema ločiloma ter preveri citiranje navadnih vrednosti in vrednosti z narekovaji. |
| R07 | Zapisi so ločeni z `CRLF`, tudi zadnji zapis se z njim konča. Ločila in prelomi vrstic znotraj vrednosti se ohranijo v citiranem polju. | Preveri končne bajte ter polja s podpičjem, vejico, `CR`, `LF` in kombinacijo prelomov. |
| R08 | Pred citiranjem se za vsak podatkovni niz uporabi `safe(s)`; velja, če se po nič ali več začetnih presledkih, tabulatorjih, `CR` ali `LF` niz začne z `=`, `+`, `-` ali `@`. Apostrof je na začetku izvirnega niza. Drugi nizi in glava ostanejo nespremenjeni. | Preveri vse štiri začetne znake z različnimi dovoljenimi presledki, kontrolne nize brez nevarnega začetka ter vsa podatkovna polja. |
| R09 | Šumniki, drugi znaki Unicode, presledki in opisi se ohranijo, razen nevtralizacije iz R08. `status` se zapiše kot `todo`, `in_progress` ali `done`; `dueDate` kot izvirni `YYYY-MM-DD`. | Izvozi vrednosti z Unicode, presledki in večvrstičnim opisom ter preveri surove vrednosti statusa in datuma. |
| R10 | Preklop Preglednica/Tabla ne spremeni `(C,d,f)`. Ob enakem projektu, podatkih in nastavitvah mora biti vsebina izvožene datoteke v obeh pogledih bajtno enaka. | Nastavi neprivzete možnosti, preklopi pogled in primerjaj preneseni vsebini bajt za bajtom. |
| R11 | Menjava projekta in osvežitev ponastavita `C=K`, `d=;`, `f=all`. Vsak zaporedni izvoz uporabi trenutno izbrane nastavitve. | Spremeni vse tri nastavitve, zamenjaj projekt in osveži; nato spreminjaj nastavitve med zaporednimi izvozi ter preveri vsako vsebino. |
| R12 | Kontrole in izvoz ne spremenijo opravila, njegovih izvornih polj ali obstoječih bralnih funkcij; ne pošljejo zapisov na API. Videz ostane skladen s Folio. | Primerjaj podatke pred/po izvozu in zahteve API; preveri, da obstoječi bralni prikaz deluje ter da ni uvedenih zapisov. UI preveri po spodnjem dogovoru. |

### Dogovor o vmesniku in prikazu

- Za vsako kolono je checkbox z dostopnim imenom `Stolpec <ime>` (npr. `Stolpec title`). Vrstni red izbire ne spreminja `K_C`.
- HTML `select` ima dostopno ime `Ločilo CSV` in vrednosti `;`, `,`. HTML `select` ima dostopno ime `Filter izvoza` in vrednosti `all`, `todo`, `in_progress`, `done`. Gumb je `Izvozi CSV`.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Vsako novo dejanje ob opravilu mora biti zunaj njegove povezave.
- Pri širini 390 pik se stran kot celota ne razširi; dovoljeno je notranje drsenje preglednice in table. Ohrani viden fokus tipkovnice ter potrjene gradnike, barve in tipografijo Folio.
- Nova kontrolna besedila in njihova razporeditev poleg navedenih imen niso predpisani.

## Uporabniški scenariji

1. **Izvoz privzetega pogleda.** Uporabnik odpre projekt z opravili in izvozi CSV brez spreminjanja nastavitev. Prenos vsebuje vse njegove vrstice v izvornem vrstnem redu, vse kolone in privzeto podpičje.
2. **Prilagoditev vsebine.** Uporabnik izbere kolone, ločilo in stanje. Prenos odraža trenutne izbire; prikaz projekta ostane celoten. Če ni izbrane kolone ali ustrezne vrstice, prenosa ni mogoče sprožiti.
3. **Varno besedilo.** Uporabnik izvozi opravila z narekovaji, ločili, prelomi vrstic, Unicode in besedilom, podobnim formuli. CSV ohrani vsebino po pravilih citiranja in nevtralizacije.
4. **Menjava pogleda in konteksta.** Uporabnik preklaplja med Preglednico in Tablo brez izgube nastavitev. Ob menjavi projekta ali osvežitvi se nastavitve vrnejo na privzete.

## Merila uspeha

- Vseh R01–R12 je mogoče preveriti s sprejemnimi pogoji v tabeli; pogoji pokrivajo poljuben opisani seznam opravil, ne le fiksnega testnega primera.
- Preneseni CSV ima zahtevano ime, vrstni red, kodiranje, citiranje, nevtralizacijo in bajtno vsebino za izbrane nastavitve.
- Uporabnik lahko vse nastavitve upravlja z dogovorjenimi dostopnimi kontrolami, ne da bi filter omejil prikaz projekta ali izvoz spremenil podatke.
- Preglednica in tabla ohranita potrjeni videz Folio in dogovorjeno vedenje pri ozkem zaslonu.

## Izvedba in sledljivost

Ta korak določa sprejemne pogoje; izvedba, lokacije kode, konkretna imena testov in rezultati še niso preverjeni. Nadaljnja opravila naj ohranijo identifikatorje R01–R12 ter po izvedbi dopolnijo pogoje s povezavami do kode in dejanskih dokazil. Neizvedenega testa ni dovoljeno označiti kot uspešnega.

## Odprta vprašanja in omejitve

Za funkcionalno vedenje ni potrebna dodatna odločitev uporabnika: dovoljene kolone, filtri, privzete vrednosti, vrstni red in pravila CSV so določeni v navodilih. Podatkovna polja in statusi so enaki obstoječim tipom. Ne širi se obnašanja med nedokončanim nalaganjem ali ob sočasnih spremembah podatkov brez osvežitve prek obstoječih regresijskih zahtev. Uspeh, preklic ali napaka brskalnikovega upravljalnika prenosov nima dodatno predpisanega UI-ja; izvoz aplikaciji ne sme spremeniti podatkov ali nastavitev.
