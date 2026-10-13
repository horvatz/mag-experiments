# P06 — Nastavljiv izvoz CSV

## Problem in kontekst

Folio že prikazuje projekte in njihova opravila v preglednici ali tabi ter podrobnosti posameznega opravila. Uporabnik potrebuje izvoz opravil trenutnega projekta v CSV z izbiro kolon, ločila in statusnega filtra. Izvoz ne spreminja podatkov na strežniku in ostaja zvest potrjenemu videzu Folio.

## Vhodi, dejanja in izidi

- Podatkovni vir sta obstoječi odgovora `GET /api/projects` in `GET /api/projects/:id/tasks`; projekt se izbere po `id`.
- Izvozne kolone so `id`, `projectId`, `title`, `status`, `assignee`, `dueDate` in `description`. Vsaka ima checkbox z dostopnim imenom `Stolpec <ime>`.
- Ločilo se izbere s selectom `Ločilo CSV` med `;` in `,`. Filter se izbere s selectom `Filter izvoza` med `all`, `todo`, `in_progress` in `done`.
- Gumb `Izvozi CSV` je omogočen samo, ko je izbrana vsaj ena kolona in obstaja vsaj ena vrstica po filtru.
- Uspešno dejanje prenese datoteko `folio-<projectId>.csv` z vsebino iz spodnjih pravil. Izid je enak v pogledih Preglednica in Tabla.
- Napaka nalaganja opravil pusti obstoječe obvestilo in ponovni poskus. Izvoz takrat ni na voljo.

## Pravila sprememb stanja

### Privzeto stanje

Za trenutni projekt `p` ob prvem prikazu in po osvežitvi strani:

- `S(p) = [id, projectId, title, status, assignee, dueDate, description]`
- `D(p) = ;`
- `F(p) = all`
- `T(p) = tasks(GET /api/projects/p.id/tasks)`

Menjava projekta ali osvežitev ponastavi `S`, `D` in `F` na privzete vrednosti. Stanje je lokalno za trenutni projekt in se ne shranjuje v URL, `localStorage` ali na strežnik.

### Prehodi

- Sprememba checkboxa spremeni le `S`. Vrstni red izvoznih kolon ostane nespremenljiv.
- Sprememba selecta spremeni le `D` oziroma `F`.
- Preklop med Preglednica in Tabla ter odpiranje in zapiranje podrobnosti ne spremenita `S`, `D` ali `F`.
- Izvoz spremeni le preneseno datoteko. Ne spremeni `T`, `S`, `D`, `F`, opravil, izvornih polj, obstoječih bralnih funkcij ali prikaza celotnega projekta.

### Pogoji

- `rows(T,F)` so opravila iz `T`, katerih `status` je enak `F`; za filter `all` so to vsa opravila v izvornem vrstnem redu.
- `exportEnabled = S ≠ ∅ ∧ rows(T,F) ≠ ∅`.
- `C = [id, projectId, title, status, assignee, dueDate, description]`.
- `selectedColumns` so elementi `C ∩ S` v vrstnem redu `C`, ne glede na vrstni red klikov.

## Kodiranje CSV

1. Datoteka se začne z UTF-8 BOM `U+FEFF`.
2. Glava vsebuje imena `selectedColumns` v nespremenljivem vrstnem redu. Vsako ime je med dvojnimi narekovaji.
3. Vrstice so `rows(T,F)` v izvornem vrstnem redu.
4. Vrednosti so izvorne vrednosti opravila: `status` kot interna vrednost in `dueDate` kot izvirni `YYYY-MM-DD`.
5. Pred navedbo podatkovne vrednosti velja nevtralizacija formule: `sanitize(v)` doda apostrof na sam začetek izvirnega niza natanko tedaj, ko `v` ustreza `^[ \t\r\n]*[=+\-@]`; sicer je `sanitize(v)` enak `v`.
6. Apostrof se doda pred CSV navedbo in pravilo ne velja za glavo.
7. CSV navedba podvoji vsak notranji dvojni narekovaj ter obdaja rezultat z dvojnim narekovajem.
8. Vrstice loči `CRLF`. Tudi zadnja vrstica se konča s `CRLF`. Ločila, tabulatorji in prelomi vrstic v vrednostih ostanejo znotraj pravilno navedenih polj.
9. Vsebina je UTF-8. Šumniki, drugi Unicode znaki, presledki, ločila in vsebina opisov ostanejo ohranjeni, razen izrecne nevtralizacije formul.
10. Prenos ne odpre nove strani in ne pošlje vsebine na strežnik.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame `T` trenutnega projekta v izvornem vrstnem redu. Privzeto je `S=C`, `D=;` in `F=all`. | Nastavi znane podatke, klikni izvoz in preveri vrstice datoteke. |
| R02 | `selectedColumns` vedno sledi vrstnemu redu `C`. Glava in vrednosti so skladne. | Izberi kolone v obratnem vrstnem redu in primerjaj CSV. |
| R03 | Gumb je onemogočen, če je `S=∅`; klik ne ustvari prenosa. Ponovna izbira kolone ga omogoči, če `rows(T,F)≠∅`. | Odstrani vse izbore, preveri `disabled` in odsotnost prenosa, nato izberi eno kolono. |
| R04 | Filter `F` omeji samo izvožene vrstice. Vmesnik še prikazuje celoten projekt. Prazen projekt ali prazen filtriran rezultat onemogoči izvoz. | Izvozi za vsak status in prazen rezultat ter preveri prikaz in stanje gumba. |
| R05 | Prenesena datoteka je `folio-<projectId>.csv` in se začne z BOM. Prenos ne odpre nove strani in ne pošlje vsebine na strežnik. | Prestreži prenos, preveri bajte in omrežne zahteve. |
| R06 | Uporabi izbrano `D`. Vsaka glava in vrednost sta med dvojnimi narekovaji, notranji narekovaji pa so podvojeni. | Izvozi z vrednostmi, ki vsebujejo `;`, `,` in dvojne narekovaje, za obe izbiri ločila. |
| R07 | Vrstice so ločene s `CRLF`, vključno z zadnjo. Vgrajeni ločili in prelomi vrstic ostanejo znotraj navedenih vrednosti. | Primerjaj bajtno zaporedje z neodvisno pričakovano vsebino. |
| R08 | Vrednost, ki se po morebitnih presledkih, tabulatorjih, CR ali LF začne z `=`, `+`, `-` ali `@`, dobi apostrof na začetku izvirnega niza. Druge vrednosti se ne spremenijo. Pravilo velja za vse podatkovne kolone in ne za glavo. | Izvozi pozitivne in negativne primere za vse podatkovne kolone. |
| R09 | Unicode, presledki, ločila in opisi ostanejo nespremenjeni. `status` je interna vrednost, `dueDate` pa izvirni `YYYY-MM-DD`. | Uporabi šumnike, Unicode, večvrstični opis in znane datume. |
| R10 | Preklop pogleda ohrani `S`, `D` in `F`. Enake nastavitve v obeh pogledih ustvarijo enake bajte datoteke. | Izvozi v enem pogledu, preklopi, izvozi znova in primerjaj prenosa. |
| R11 | Menjava projekta in osvežitev ponastavita nastavitve. Zaporedna izvoza vedno odražata trenutne nastavitve. | Spremeni nastavitve, zamenjaj projekt ali osveži, preveri privzeto stanje in nato izvozi dvakrat po spremembi. |
| R12 | Izvoz in njegove kontrole ne spremenijo opravila, izvornih polj, bralnih funkcij ali obstoječega dostopa. Ne pošljejo zapisov na API. | Primerjaj API stanje pred in po ter obstoječe oznake, poti in rezultate testov. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Izvorni vrstni red in privzete vrednosti | Preskus izvoza trenutnega projekta | Načrt: `src/App.tsx`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R02 | Nespremenljiv vrstni red izbranih kolon | Preskus izbire v obratnem vrstnem redu | Načrt: izvozne kontrole v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R03 | Izvoz je onemogočen brez izbranih kolon | Preskus onemogočenega gumba in ponovne izbire | Načrt: izvozne kontrole v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R04 | Filter omejuje samo izvožene vrstice | Preskus vsakega statusa in praznega rezultata | Načrt: izvozne kontrole v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R05 | Ime datoteke, BOM, prenos in brez strežniške vsebine | Preskus imena, začetnih bajtov in omrežnih zahtev | Načrt: izvozna funkcija v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R06 | Nastavljivo ločilo in navedba polj | Preskus vrednosti z obema ločiloma in posebnimi znaki | Načrt: izvozna funkcija v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R07 | CRLF med vrsticami, vključno z zadnjo | Preskus bajtnega zaporedja izvoza | Načrt: izvozna funkcija v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R08 | Nevtralizacija formul v podatkovnih vrednostih | Preskus pozitivnih in negativnih primerov | Načrt: izvozna funkcija v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R09 | Ohranitev Unicode, statusa in datuma | Preskus šumnikov, večvrstičnih opisov in datumov | Načrt: izvozna funkcija v `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R10 | Preklop pogleda ohrani nastavitve | Preskus zaporednih izvozov v obeh pogledih | Načrt: stanje v `src/App.tsx`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R11 | Menjava projekta in osvežitev ponastavita stanje | Preskus resetiranja in zaporednih izvozov | Načrt: stanje v `src/App.tsx`; `tests/agent/P06` | Ni izvedeno v fazi specify. |
| R12 | Izvoz brez stranskih učinkov na podatke in obstoječe funkcije | Regresijski preskus bralnih poti in oznak | Načrt: obstoječi deli `src/`; `tests/agent/P06` | Ni izvedeno v fazi specify. |

Dokazov trenutno ni, ker ta korak ustvari samo specifikacijo. V kasnejših fazah za vsako zahtevo zapiši ime testa ali scenarija, dotaknjeno kodo in dejanski izid. Izida ne označi kot uspešnega brez dejanskega preverjanja.

## Odprta vprašanja in omejitve

- Bistvena nejasnost ni odkrita. Podrobnosti, ki jih izvirne zahteve ne določajo, kot sta natančna postavitev novih kontrol in besedilo ob njih, ostajajo v okviru potrjenega dizajna Folio.
- Sočasne spremembe podatkov med nezaključenim nalaganjem niso razširjene prek obstoječih regresijskih zahtev, ker jih izvirna naloga izrecno ne širi.
- Ne dodajamo novih odvisnosti, zapisovalnih API-jev, strežniških sprememb, trajne shrambe ali zunanjih meritev.
