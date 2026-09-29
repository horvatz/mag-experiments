# P06: Nastavljiv izvoz CSV

**Stanje:** specifikacija za načrtovanje  
**Vir zahtev:** [task/instructions.md](../../../task/instructions.md), različica P06 1.0  
**Projektna načela:** [ustava Folio](../../../.specify/memory/constitution.md)  
**Izhodiščni vmesnik:** [src/App.tsx](../../../src/App.tsx), [src/TaskBoard.tsx](../../../src/TaskBoard.tsx), [src/useResource.ts](../../../src/useResource.ts), [src/navigation.ts](../../../src/navigation.ts)  
**Potrjeni videz:** [docs/dizajn.md](../../dizajn.md)

## Problem in kontekst

Folio trenutno bere projekte in opravila iz javnega API-ja. Uporabnik si lahko opravila ogleda v preglednici ali tabli, ne more pa jih prenesti. P06 doda nadzorovan izvoz opravil trenutno izbranega projekta v CSV: uporabnik izbere polja, ločilo in filter stanj. Izvoz uporablja trenutno naložene podatke in ne spreminja opravil. Obstoječi projektni prikaz še naprej kaže vsa opravila.

Vključeni so uporabniški vmesnik, serijska oblika prenosa ter lokalno stanje nastavitev. Strežnik, skupni tipi, odvisnosti, začetni podatki in skupni testi ostanejo nespremenjeni. Videz in slovenska poimenovanja sledijo potrjenemu dizajnu Folio.

## Vhodi, dejanja in izidi

### Podatki

Projekt je določen z id-jem in imenom. Opravilo vsebuje id, projectId, title, status, assignee, dueDate in description. Status je interna vrednost todo, in_progress ali done; datum je izvirni niz YYYY-MM-DD. Vsa opravila trenutnega projekta so prebrana prek obstoječega GET vmesnika /api/projects/:id/tasks. Vrstni red odgovora API-ja je izvorni vrstni red izvoza.

Vrednosti besedilnih polj so navadno besedilo in lahko vsebujejo Unicode, ločila, narekovaje, presledke ali prelome vrstic. Glava uporablja imena izbranih polj v vrstnem redu, določenem spodaj. Podatki se berejo samo prek /api/; aplikacija ne bere ali uporablja testnih kontrol /__test/, ne uporablja lokalne kopije podatkov ali localStorage.

### Dejanja in prehodna stanja

Nastavitve izvoza so lokalne trenutno izbranemu projektu in niso zapisane v URL ali trajno shranjene. Stanje nastavitev je X = (C, D, F), kjer je C množica izbranih kolon, D ločilo in F filter. Začetno stanje ob nalaganju projekta ali osvežitvi je:
- C = {id, projectId, title, status, assignee, dueDate, description}
- D = podpičje (;)
- F = all

Uporabnik lahko preklopi posamezno kolono, izbere D kot ; ali , in F iz {all, todo, in_progress, done}. Preklop kolone c spremeni C v simetrično razliko C △ {c}; izbira ločila d nastavi D=d, izbira filtra f nastavi F=f. Vsako dejanje pusti preostali komponenti X nespremenjeni. Vrstni red interakcij s checkboxi ne vpliva na vrstni red kolon v datoteki. Menjava pogleda Preglednica/Tabla ohrani X. Menjava projekta in osvežitev strani nastavita X na privzeto stanje.

Naj bo T(P) seznam opravil trenutnega projekta P v vrstnem redu API-ja. R(P,F) je podseznam T(P), ki ohrani ta vrstni red in vsebuje vsa opravila pri F=all oziroma samo opravila s statusom F pri F ∈ {todo, in_progress, done}. Izvoz je omogočen natanko tedaj, ko so podatki projekta naloženi, |C| > 0 in |R(P,F)| > 0. Filter vpliva samo na R(P,F), ne na seznam, preglednico ali tablo.

Ko je izvoz omogočen, dejanje Izvozi CSV pripravi bajte za trenutno X in sproži prenos folio-<projectId>.csv. Vsebina ima začetni UTF-8 BOM U+FEFF, glavo in vrednosti za izbrane kolone ter CRLF za vsak zapis, vključno z zadnjim. Glava in vsaka vrednost sta vedno citirani z dvojnimi narekovaji; notranji dvojni narekovaji se podvojijo. Vrstni red kolon je vedno id, projectId, title, status, assignee, dueDate, description; filtriran vrstni red opravil pa ostane izvoren.

Za podatkovno vrednost naj bo S njen izvorni niz. Če S po poljubnem zaporedju začetnih znakov iz množice {presledek, tabulator, CR, LF} začne z enim od {=, +, -, @}, je serializirana vrednost apostrof + S (apostrof se doda na prvi znak izvirnega niza). Sicer se S ohrani nespremenjen. Nato se izvede citiranje in podvojitev notranjih narekovajev. Glave se ne nevtralizirajo. Ločila in prelomi vrstic v poljih ostanejo znotraj citiranih vrednosti. Status se izvozi kot interna vrednost, datum kot prejeti YYYY-MM-DD niz; drugi Unicode znaki, presledki in vsebina opisov se ohranijo.

Po uspešnem sproženju prenosa se stanje X in opravila ne spremenijo. Menjava pogleda ne spremeni bajtov, ki jih ustvarijo enaki podatki in X. Če nalaganje prek API-ja odpove, ostane obstoječi prikaz napake in ponovnega poskusa; izvoz ni omogočen brez naloženih podatkov. Če uporabnik prekliče ali brskalnik ne sprejme prenosa, aplikacija ne spreminja podatkov ali nastavitev in ne pošilja vsebine na strežnik; dodatno sporočilo o napaki ni določeno. Ko pogoji za izvoz niso izpolnjeni, je gumb onemogočen in prenosa ni.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeti X ima F=all, vse kolone in D=;. Datoteka vsebuje vsa opravila projekta v vrstnem redu T(P). | Preveri privzete kontrole in primerjaj vrstni red zapisov z GET odgovorom z drugačnim vrstnim redom. |
| R02 | Izbira kolon je omejena na id, projectId, title, status, assignee, dueDate, description. Glava in vrednosti so v tem kanoničnem vrstnem redu ne glede na vrstni red klikanja. | Izberi kolone v obratnem oziroma premešanem vrstnem redu ter preveri glavo in poravnavo vrednosti. |
| R03 | Izvoz je omogočen natanko, ko je C neprazen in R(P,F) neprazen. Pri praznem C je gumb onemogočen in prenosa ni; izbira kolone ga omogoči, če rezultat ni prazen. | Preveri prazno izbiro, nato izbiro kolone z nepraznim rezultatom ter gumb brez prenosa. |
| R04 | F omeji samo izvožene vrstice. Projektni vmesnik vedno kaže T(P). Če je projekt ali filtrirani rezultat prazen, je izvoz onemogočen. | Za vsak filter preveri prenesene id-je in celoten seznam v preglednici ter tabli; preveri prazen projekt in prazen filter. |
| R05 | Ime datoteke je folio-<projectId>.csv; prenos se začne z U+FEFF v UTF-8. Izvoz ne odpre nove strani in vsebine ne pošlje strežniku. | Preveri ime in surove bajte prenosa; spremljaj navigacijo ter zahtevke ob kliku. |
| R06 | D je ; ali ,. Vsaka glava in vrednost je citirana; vsak notranji dvojni narekovaj se podvoji. | Preveri obe ločili ter vrednosti z narekovaji in ločilom. |
| R07 | Zapisi so ločeni s CRLF in zadnji zapis se konča s CRLF. Ločila in prelomi vrstic v vrednostih ohranijo vsebino znotraj citatov. | Preveri bajte ločil zapisov ter celovitost vrednosti z ločilom in CR/LF. |
| R08 | Pred citiranjem se pravilo formule izvede za vsa podatkovna polja. Če se niz po začetnih presledkih, tabulatorjih, CR ali LF začne z =, +, - ali @, se apostrof doda pred izvirni niz. Drugi nizi in glava ostanejo nespremenjeni. | Uporabi vrednosti z vsakim začetnim znakom in mešanico dovoljenih začetnih znakov; primerjaj nevtralne nize in glavo. |
| R09 | Unicode, šumniki, presledki in opisi se ohranijo, razen R08. Status je interna vrednost; datum je izvorni YYYY-MM-DD. | Preveri besedilo z Unicode in presledki ter surovi vrednosti statusa in datuma. |
| R10 | Preklop Preglednica/Tabla ohrani C, D in F. Pri enakem P, T(P) in X je vsebina bajt za bajtom enaka v obeh pogledih. | Nastavi nestandardne vrednosti, izvozi v obeh pogledih ter primerjaj datoteki in stanje kontrol. |
| R11 | Menjava projekta in osvežitev povrneta privzeti X. Vsak zaporedni izvoz odraža trenutno izbrani X, ne zastarelih nastavitev. | Spremeni nastavitve, zamenjaj projekt oziroma osveži; nato izvedi zaporedna izvoza po spremembi nastavitve. |
| R12 | Kontrole izvoza ne spreminjajo opravil ali njihovih polj, ne posegajo v obstoječe bralne funkcije in ne pošiljajo zapisov na API. Dodatek ohrani odzivno prilagoditev Folio. | Primerjaj GET podatke pred izvozom in po njem; preveri omrežne zapise, bralne poti ter stran pri širini 390 px. |

### Dogovor o vmesniku in ohranitvi Folio

- Vsaka izbira kolone je checkbox z dostopnim imenom Stolpec <ime>, na primer Stolpec title.
- HTML select ima dostopno ime Ločilo CSV in možnosti ; ter ,.
- HTML select ima dostopno ime Filter izvoza in možnosti all, todo, in_progress ter done.
- Gumb se imenuje Izvozi CSV.
- Ohrani data-task-id na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter aria-label="Pregled stanj opravil". Morebitna nova dejanja ob opravilu so zunaj povezave opravila.
- Na širini 390 px se širina strani ne poveča; dovoljeno je notranje drsenje preglednice in table. Ohranita se potrjeni slog Folio in viden fokus tipkovnice.

Podatkovni obseg preverjanja vključuje nič, eno ali več kot deset opravil, enkratne ID-je, enake naslove, poljuben vrstni red, veljavne datume, prazne projekte ter besedilna polja z Unicode znaki in ločili. To so primeri iz opredeljene domene, ne dodatne omejitve podatkov.

## Uporabniški scenariji

1. **Privzeti izvoz:** uporabnik odpre projekt, dobi privzete nastavitve in izvozi vsa njegova opravila kot CSV.
2. **Prilagoditev izvoza:** uporabnik izbere kolone, ločilo in stanje; izvoz vsebuje le izbrane podatke in ustrezne vrstice, projektni pogled pa ostane celovit.
3. **Neveljaven ali prazen izbor:** uporabnik odstrani vse kolone ali izbere filter brez zadetkov; izvoz je onemogočen. Ponovni izbor kolone oziroma filtra z zadetki ga omogoči.
4. **Menjava prikaza:** uporabnik preklopi med Preglednico in Tablo; nastavitve ostanejo in enaki podatki ustvarijo enake bajte.
5. **Menjava projekta ali osvežitev:** nastavitve se vrnejo na privzete; naslednji prenosi uporabijo trenutno stanje.
6. **Besedilne vrednosti:** uporabnik izvozi polja z narekovaji, ločili, prelomi vrstic, Unicode ali začetki formul; CSV in nevtralizacija ohranita zahtevano vsebino.

## Merila uspeha

Vseh pogojev R01–R12 se da preveriti s kontrolami prenesenih bajtov, imena datoteke, stanja nastavitev, celovitosti projektnega prikaza, odsotnosti zapisovalnih zahtev ter ohranitve obstoječih dostopnih imen in odzivne postavitve. Vsak pogoj mora biti povezan z dejanskim testom in dokazom pred končno oddajo; zgornji scenariji sami po sebi niso dokaz uspešne izvedbe.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti X, vsi zapisi v vrstnem redu API-ja. | Scenarij 1; primerjava id-jev z GET odgovorom. | Implementacija še ni določena; projektna integracija je v [src/App.tsx](../../../src/App.tsx). | Ni izvedeno; dokaz dodati po implementaciji. |
| R02 | Dovoljena polja v kanoničnem vrstnem redu. | Premešan izbor checkboxov. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R03 | Izvoz omogočen samo ob nepraznem C in R(P,F). | Scenarij 3; disabled stanje in poskus prenosa. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R04 | Filter samo za izvoz; celoten projekt ostane prikazan. | Scenarij 2, prazen rezultat v obeh pogledih. | Obstoječa prikaza sta v [src/App.tsx](../../../src/App.tsx) in [src/TaskBoard.tsx](../../../src/TaskBoard.tsx). | Ni izvedeno; dokaz dodati po implementaciji. |
| R05 | Ime, BOM, brez nove strani ali pošiljanja vsebine. | Preverba prenosa in omrežja. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R06 | Izbira ločila, citiranje in ubežanje narekovajev. | Vrednosti z obema ločiloma in narekovaji. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R07 | CRLF med in po zapisih; vrednosti ostanejo cele. | Bajtna primerjava zapisa in večvrstičnega polja. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R08 | Natančno pravilo nevtralizacije vseh podatkovnih polj. | Vrednosti z začetki =, +, -, @ in dovoljenimi presledki. | Implementacija še ni določena. | Ni izvedeno; dokaz dodati po implementaciji. |
| R09 | Ohranjeni znaki, status in datum v izvorni obliki. | Unicode ter surova vrednost statusa/datuma. | Podatkovna oblika iz [shared/types.ts](../../../shared/types.ts). | Ni izvedeno; dokaz dodati po implementaciji. |
| R10 | Nastavitve ostanejo pri menjavi pogleda; bajti so enaki. | Scenarij 4; primerjava datotek. | Menjava pogleda je v [src/App.tsx](../../../src/App.tsx) in [src/navigation.ts](../../../src/navigation.ts). | Ni izvedeno; dokaz dodati po implementaciji. |
| R11 | Menjava projekta/osvežitev ponastavita; zaporedni izvozi so sveži. | Scenarij 5. | Projektni pogled je vezan na projektni id v [src/App.tsx](../../../src/App.tsx). | Ni izvedeno; dokaz dodati po implementaciji. |
| R12 | Brez mutacij ali zapisov; ohranjena dostopnost in odzivnost. | Primerjava GET podatkov, omrežne zahteve, imen in širine 390 px. | Branje prek [src/useResource.ts](../../../src/useResource.ts); prikaza v [src/App.tsx](../../../src/App.tsx) in [src/TaskBoard.tsx](../../../src/TaskBoard.tsx). | Ni izvedeno; dokaz dodati po implementaciji. |

Imena testov in končni deli kode se določijo med načrtovanjem in izvedbo. Razvojni ter končni testi v koraku specifikacije niso bili zagnani.

## Odprta vprašanja in omejitve

V zahtevah ni odprtega funkcionalnega vprašanja: določajo polja, privzete vrednosti, serializacijo, nastavitve, ponastavitve, vidnost in omejitve API-ja. Videz in razporeditev kontrol, ki nista izrecno določena v dogovoru o vmesniku, ostajata odločitev izvedbe znotraj potrjenega dizajna. Natančno ravnanje brskalnika ob preklicu ali nezmožnosti prenosa ni določeno; zahtevano je, da se opravila in nastavitve ne spremenijo ter vsebina ni poslana strežniku. Ta dokument ne trdi, da je bila katerakoli funkcionalna zahteva že izvedena ali preverjena.

