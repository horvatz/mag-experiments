# Specifikacija P06: Nastavljiv izvoz CSV

Vir zahtev: `task/instructions.md` (R01–R12). Skupna predloga: `task/specification-template.md`.
Ustava: `.specify/memory/constitution.md`. Datum: 2026-10-09. Pot: `docs/agent/P06`.

## Problem in kontekst

Uporabnik želi opravila trenutnega projekta izvoziti v datoteko CSV ter pri tem izbrati
kolone, ločilo in filter stanja. Folio že omogoča izbiro projekta, preglednico in tablo
opravil ter podrobnosti opravila; izvoza še ni. Izvoz mora brati podatke iz javnega
vmesnika `/api/`, ne sme spreminjati podatkov in mora ohraniti potrjeni videz Folio
(`docs/dizajn.md`). Sprememba je omejena na `src/`, lastne teste v `tests/agent/` in
dokumente v `docs/agent/`.

## Vhodi, dejanja in izidi

**Vhodi.** Opravila trenutnega projekta iz javnega API-ja s polji `id`, `projectId`,
`title`, `status`, `assignee`, `dueDate`, `description`. Nastavitve izvoza: izbrane
kolone S, ločilo D, filter F.

**Simboli.** T = opravila trenutnega projekta v izvornem vrstnem redu odgovora API-ja.
T_F = [t ∈ T : F = all ∨ t.status = F]. Kolone v predpisanem vrstnem redu
K = [id, projectId, title, status, assignee, dueDate, description]. Glava = K ∩ S v
vrstnem redu K. Vrednost(t, c) = narekovana in nevtralizirana vrednost polja c opravila t.
Izvoz je dovoljen natanko takrat, ko velja S ≠ ∅ ∧ |T_F| > 0.

**Dejanja.** (a) obkljukaj/odkljukaj `Stolpec <ime>` za vsako kolono; (b) izberi ločilo
v `Ločilo CSV` (`;` ali `,`); (c) izberi `Filter izvoza` (`all`, `todo`, `in_progress`,
`done`); (d) klikni `Izvozi CSV`; (e) preklopi pogled Preglednica/Tabla; (f) zamenjaj
projekt ali osveži stran.

**Izid ob uspehu.** Prenese se datoteka `folio-<projectId>.csv` z vsebino po pravilih
R01–R09; vmesnik in podatki ostanejo nespremenjeni; nastavitve veljajo za trenutni projekt.

**Izid ob neuspehu/preklicu.** Če izvoz ni dovoljen (S = ∅ ali T_F prazen), gumb je
onemogočen in klik ne ustvari prenosa; če uporabnik prekliče izbiro datoteke, se stanje
nastavitev in podatkov ne spremeni. Izvoz ne pošilja zapisov na API.

**Pravila sprememb stanja.**
- Ob spremembi S: dovoljenje := (S ≠ ∅ ∧ |T_F| > 0); vsebina izvoza se preračuna ob kliku.
- Ob spremembi F: T_F := [t ∈ T : F = all ∨ t.status = F]; prikaz projekta ostane T; dovoljenje po istem pravilu.
- Ob spremembi D: naslednji izvoz uporabi novo ločilo; prejšnji prenosi se ne spremenijo.
- Ob preklopu pogleda: S, D in F se ohranijo; isti nastavitvi dasta iste bajte datoteke.
- Ob menjavi projekta ali osvežitvi: S := K, D := `;`, F := all; podatki se ponovno naložijo iz `/api/`.
- Ob izvozu: nobeno opravilo, izvorno polje ali bralna funkcija se ne spremeni.

## Uporabniški scenariji

1. Uporabnik obkljuka podmnožico kolon v poljubnem vrstnem redu in izvozi; datoteka vsebuje
   glavo in vrednosti v vrstnem redu K (R02).
2. Uporabnik odkljuka vse kolone; gumb je onemogočen in klik ne ustvari prenosa; po ponovnem
   izboru kolone je izvoz spet mogoč, če T_F ni prazen (R03).
3. Uporabnik izbere filter `done` in izvozi; datoteka vsebuje samo opravila `done`, vmesnik
   še prikazuje celoten projekt; prazen projekt ali prazen T_F onemogoči izvoz (R04).
4. Uporabnik preklopi ločilo na `,` in izvozi; vsaka glava in vrednost je v dvojnih
   narekovajih, notranji narekovaji so podvojeni (R06).
5. Vrednost se po začetnih presledkih/tabulatorjih/CR/LF začne z `=`, `+`, `-` ali `@`;
   izvožena vrednost ima apostrof na samem začetku, drugi nizi ostanejo nespremenjeni (R08).
6. Uporabnik preklopi Preglednica/Tabla in izvozi v obeh pogledih; nastavitve se ohranijo
   in datoteki sta bajtno enaki (R10).
7. Uporabnik zamenja projekt ali osveži stran; S, D in F se ponastavijo na privzete
   vrednosti, zaporedna izvoza odražata trenutne nastavitve (R11).

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame T projekta v izvornem vrstnem redu; privzeto F = all, S = K, D = `;`. | Lastni test: primerjava vrstic z odgovorom API-ja. |
| R02 | Glava = K ∩ S v nespremenljivem vrstnem redu K ne glede na vrstni red klikov; vrednosti sledijo glavi. | Lastni test z izbiro kolon v obratnem vrstnem redu. |
| R03 | S = ∅ ⇒ gumb onemogočen in klik ne ustvari prenosa; ponovni izbor omogoči izvoz, ko množica T_F ni prazna. | Lastni test stanja gumba in odsotnosti prenosa. |
| R04 | F omeji samo izvožene vrstice na T_F; prikaz projekta ostane T; T je prazna ali T_F je prazna ⇒ onemogočeno. | Lastni test po posameznih filtrih in s praznim projektom. |
| R05 | Prenos datoteke `folio-<projectId>.csv`, ki se začne z UTF-8 BOM U+FEFF; brez nove strani in brez pošiljanja vsebine na strežnik. | Lastni test imena in začetnih bajtov; pregled omrežnih klicev. |
| R06 | D ∈ {`;`, `,`}; vsaka glava in vrednost sta vedno obdani z dvojnimi narekovaji; notranji narekovaj je podvojen. | Lastni test za obe ločili in vrednost z narekovajem. |
| R07 | Vrstice so ločene s CRLF, tudi zadnja; ločila in prelomi v vrednostih ostanejo znotraj narekovane vrednosti. | Lastni test bajtov konca vrstic in vrednosti z vejico/podpičjem/prelomom. |
| R08 | Če se izvirni niz po poljubnih začetnih znakih iz {presledek, tabulator, CR, LF} začne z `=`, `+`, `-` ali `@`, se apostrof doda na sam začetek izvirnega niza; drugi nizi ostanejo nespremenjeni; velja za podatkovne kolone, ne za glavo. | Lastni test za vsak začetni znak in za nevtralne nize. |
| R09 | Šumniki, Unicode, presledki in opisi ostanejo ohranjeni, razen R08; `status` se izvozi kot interna vrednost, datum kot izvirni `YYYY-MM-DD`. | Lastni test z Unicode in ločili; primerjava s polji API-ja. |
| R10 | Preklop Preglednica/Tabla ohrani S, D in F; isti nastavitvi dasta bajtno enaki datoteki. | Lastni test izvoza v obeh pogledih z istimi nastavitvami. |
| R11 | Menjava projekta in osvežitev ponastavita S, D in F na privzete vrednosti; zaporedna izvoza po spremembi nastavitev odražata trenutne nastavitve. | Lastni test dveh zaporednih izvozov in ponastavitve. |
| R12 | Izvoz in njegove kontrole ne spremenijo opravil, izvornih polj ali bralnih funkcij; ni zapisov na API; videz Folio ostane prilagodljiv. | Primerjava stanja pred/po izvozu; skupni testi; pregled omrežnih klicev. |

**Dogovor o vmesniku (podpira R02–R04, R06, R10).** Checkbox za kolono ima dostopno ime
`Stolpec <ime>` (npr. `Stolpec title`); select `Ločilo CSV` ima vrednosti `;` in `,`;
select `Filter izvoza` ima vrednosti `all`, `todo`, `in_progress`, `done`; gumb
`Izvozi CSV`. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih
pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so
zunaj njegove povezave. Pri širini 390 pik se stran ne razširi; notranje drsenje preglednice
in table je dovoljeno.

## Izvedba in sledljivost

Vrstice se izpolnijo med izvedbo; izid se označi kot uspešen le po dejansko izvedenem
preverjanju, sicer se zapiše kot nepreverjen. Skupni testi preverjajo izhodišče in
infrastrukturo, zahteve P06 pa lastni testi v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | T v izvornem vrstnem redu, privzete nastavitve | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R02 | Glava v vrstnem redu K | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R03 | S = ∅ ⇒ onemogočeno | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R04 | F omeji vrstice, prikaz nespremenjen | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R05 | Ime datoteke in BOM | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R06 | Narekovanje in ločilo | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R07 | CRLF in ohranjeni znaki | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R08 | Nevtralizacija formul | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R09 | Unicode in izvorne vrednosti | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R10 | Preklop pogleda ohrani nastavitve | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R11 | Ponastavitev in zaporedna izvoza | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |
| R12 | Brez sprememb podatkov in zapisov | se določi med izvedbo | se določi med izvedbo | se zabeleži med izvedbo |

## Odprta vprašanja in omejitve

- Končni ocenjevalni testi niso dostopni; preverjanje poteka s skupnimi in lastnimi testi,
  zato se nedostopni primeri navedejo kot nepreverjeni.
- Razporeditev in besedilo novih kontrol nista predpisana; dostopna imena in vrednosti iz
  dogovora o vmesniku so obvezni.
- Stanje nastavitev je lokalno trenutnemu projektu; zahteve ne določajo trajne shrambe ali
  URL-ja, zato se ne uvajata.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve niso
  del obsega (obstoječe regresijske zahteve).
- Podatki v končnih primerih so lahko drugačni od razvojnih (nič, eno ali več opravil,
  drugačni ID-ji, enaki naslovi, različno zaporedje, veljavni datumi).
