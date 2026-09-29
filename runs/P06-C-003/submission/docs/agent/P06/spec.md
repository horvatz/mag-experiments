# P06 — Nastavljiv izvoz CSV

Različica 1.1, 2026-09-23. Dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Merilo so [izvirne zahteve R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md), [ustava](../../../.specify/memory/constitution.md) in [dizajn Folio](../../dizajn.md).

## Problem in kontekst

Uporabnik želi prenesti opravila trenutnega projekta kot CSV z izbranimi kolonami, ločilom in filtrom stanja. Obstoječi Folio bere projekte in opravila iz javnega API-ja, prikazuje preglednico, tablo, povzetke stanj in podrobnosti opravila. Izvoza še nima. Dopolnitev ohrani ta bralna vedenja, slovenska poimenovanja, dostopnost in potrjeni prilagodljivi videz.

## Vhodi, dejanja in izidi

- Vhod je izvorno zaporedje opravil trenutnega projekta iz `/api/projects/<projectId>/tasks`. Polja so nizi `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`; `status` je `todo`, `in_progress` ali `done`, `dueDate` je veljavni izvorni `YYYY-MM-DD`.
- Domena zajema nič, eno ali poljubno več opravil, tudi več kot deset; enkratne ID-je, enake naslove, poljuben vrstni red, prazna projekta, Unicode, narekovaje, ločila, presledke in prelome v besedilu. Vsako opravilo pripada svojemu projektu. Izbira uporablja ID, ne naslova ali položaja. Imena/ID-ji projektov v obsegu vsebujejo črke, številke in vezaje.
- Uporabnik izbira kolone s checkboxi z dostopnimi imeni `Stolpec id`, `Stolpec projectId`, `Stolpec title`, `Stolpec status`, `Stolpec assignee`, `Stolpec dueDate`, `Stolpec description`.
- HTML select `Ločilo CSV` ponuja vrednosti `;` in `,`; HTML select `Filter izvoza` ponuja `all`, `todo`, `in_progress`, `done`. Gumb se imenuje `Izvozi CSV`.
- Uspešno dejanje sproži lokalni prenos `folio-<projectId>.csv`; prikaz, opravila in nastavitve ostanejo enaki. Naslednji izvoz uporabi takrat veljavne nastavitve.
- Brez izbranih kolon ali ustreznih vrstic je gumb onemogočen in prenos ne nastane. Med nalaganjem oziroma napako brez podatkov veljajo obstoječa stanja nalaganja, napake in ponovitve; izvoz brez podatkov ni možen.
- Poseben potrditveni ali preklicni dialog ni zahtevan. Morebitni preklic shranjevanja v brskalniku ne spreminja podatkov ali nastavitev aplikacije. Nove obravnave napak brskalnikovega prenosa ne predpisujemo.

Kontrole so skupne obema pogledoma. Razporeditev in drugo besedilo sta izvedbena izbira v obstoječem slogu. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave. Pri širini 390 pik stran nima vodoravnega prelivanja; notranje drsenje preglednice in table ostane dovoljeno.

## Zahteve in pravila

### Predikati in spremembe stanja

Naj bo `P` trenutni projekt, `T` izvorno zaporedje njegovih opravil in `K = [id, projectId, title, status, assignee, dueDate, description]`. Nastavitve so `E = (S, d, f)`, kjer je `S` množica izbranih kolon, `d ∈ {;, ,}` ločilo in `f ∈ {all, todo, in_progress, done}` filter. Pogled `v ∈ {table, board}` ni del nastavitev CSV.

1. Privzeto stanje je `E₀ = (set(K), ;, all)`. Urejeno zaporedje izvoznih kolon je `C = [k ∈ K | k ∈ S]`; vrstni red klikov ne vpliva nanj.
2. Izvozne vrstice so stabilna podsekvenca `R = [t ∈ T | f = all ∨ t.status = f]`. Uporabniški prikaz še naprej prejme ves `T` in povzetki se računajo iz `T`.
3. `izvozOmogočen ⇔ |C| > 0 ∧ |R| > 0` ob razpoložljivih podatkih. Če predikat ne velja, dejanje ne ustvari prenosa.
4. Sprememba kolon, ločila ali filtra spremeni le ustrezni del `E`. Preklop pogleda ohrani `E`. Menjava projekta, tudi vrnitev na prejšnjega, nastavi `E := E₀`; osvežitev strani prav tako. Izvoz ne spremeni `E`, `T` ali opravil.
5. Za izvirni podatkovni niz `x` definiramo `N(x) = apostrof + x`, če `x` ustreza regularnemu izrazu `^[ \t\r\n]*[=+@-]`, sicer `N(x) = x`. Apostrof je na samem začetku pred izvirnimi presledki. Dovoljeni začetni znaki so natanko presledek U+0020, tabulator, CR in LF; drugih belin ne obravnavamo kot te znake. Izvirnega niza ne obrezujemo ali drugače normaliziramo.
6. `Q(x)` obda celoten niz z dvojnima narekovajema in vsako notranjo `"` zamenja z `""`. Glava uporablja `Q(k)`, podatkovna celica `Q(N(t[k]))`.
7. `CSV(T,E) = U+FEFF + join_d(Q(C)) + CRLF + concat(t ∈ R, join_d(Q(N(t[C]))) + CRLF)`, kodirano kot UTF-8. `CRLF` pomeni bajta `0D 0A`; začetni BOM je `EF BB BF`. Prelomi znotraj vrednosti se ohranijo in se ne zamenjujejo z ločili vrstic.
8. Za isti `P`, `T` in `E` velja `bytes(table) = bytes(board)`. Dve zaporedni dejanji po spremembi `E` vsako izračunata vsebino iz trenutnega stanja. Za vsako izvozno dejanje velja `T_po = T_pred` in število zapisovalnih zahtev API je nič.

To so splošna pravila za celotno domeno; spodnji scenariji so načini preverjanja, ne omejitve vhodov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz vsebuje vsa opravila samo trenutnega projekta v vrstnem redu API-ja; privzeto vse kolone, `;`, `all`. | S01: celotna pričakovana datoteka in začetne kontrole, drugi projekt, drugačno zaporedje in več kot deset vrstic. |
| R02 | Dovoljenih je natanko sedem kolon iz `K`; glava in vrednosti sledijo podzaporedju `K`, ne klikom. | S02: izklop/vklop v drugačnem vrstnem redu, primerjava glave in ustreznih celic. |
| R03 | Brez kolon je izvoz onemogočen, brez prenosa; ponovna izbira ga omogoči samo ob nepraznem `R`. | S03: odkljukaj vse, preveri odsotnost prenosa, izberi eno pri nepraznih in praznih vrsticah. |
| R04 | `all/todo/in_progress/done` filtrira le izvoz; prazni projekt in prazni rezultat onemogočita izvoz. | S03/S04: vsi filtri, prazni primeri, nespremenjeni ID-ji prikaza in povzetki v obeh pogledih. |
| R05 | Prenese se `folio-<projectId>.csv`, s UTF-8 BOM na začetku, brez nove strani ali pošiljanja vsebine na strežnik. | S01/S07: ime, surovi bajti, število strani, URL in omrežne zahteve. |
| R06 | Ločilo je `;` ali `,`; vsaka glava/vrednost je vedno navedena, notranji narekovaji so podvojeni. | S02/S05: natančna primerjava datoteke za obe ločili, prazne in posebne vrednosti. |
| R07 | CSV uporablja CRLF med vrsticami in na koncu, ločila in izvirni prelomi znotraj polj ostanejo ohranjeni. | S05: primerjava bajtov za notranje CR, LF, CRLF, obe ločili in narekovaje. |
| R08 | `N` velja za vse podatkovne kolone, za glavo ne; nevtralizira samo opisani začetni vzorec. | S05: vsi štirje sprožilci brez/za dovoljenimi belinami; negativni primeri običajnega besedila, znaka sredi niza in drugih belin; preverjanje vseh kolon. |
| R09 | Unicode, šumniki, presledki in celotni opisi se ohranijo razen `N`; status je interni, datum izvorni. | S01/S05: bajti in celice za Unicode, daljše opise, interne statuse in datume brez oblikovanja prikaza. |
| R10 | Menjava Preglednica/Tabla ohrani vse nastavitve in ustvari iste bajte. | S06: nastavi vse tri možnosti, izvozi v obeh pogledih in primerjaj datoteki. |
| R11 | Menjava projekta/osvežitev ponastavi vse nastavitve; naslednji izvoz odraža trenutno stanje. | S06: sprememba vsake možnosti med izvozi, menjava in vrnitev projekta, osvežitev v obeh pogledih. |
| R12 | Brez mutacij podatkov in zapisov API; bralna funkcionalnost, dostopnost in prilagodljiv Folio ostanejo ohranjeni. | S07/S08: zamrznjeni vhodi pri preverjanju pretvorbe, omrežje, bralna regresija, ozki zaslon in pregled dizajna. |

### Uporabniški scenariji in merila uspeha

- **S01 — privzeti prenos:** uporabnik odpre projekt in brez sprememb prenese vse podatke. Celotna datoteka se ujema z vhodnim zaporedjem, predpisano glavo, imenom, BOM in zaključkom.
- **S02 — izbor:** uporabnik izbere podmnožico kolon v poljubnem vrstnem redu in zamenja ločilo. Izvoz vsebuje samo izbrane kolone v vrstnem redu `K`.
- **S03 — prazni izbori:** nobena kolona, prazni projekt ali odsotno izbrano stanje preprečijo prenos. Obnova veljavnega izbora obnovi možnost izvoza.
- **S04 — filtriranje:** uporabnik preizkusi vse štiri filtre. V datoteki so samo ustrezne vrstice, opravila in povzetki v aplikaciji ostanejo nespremenjeni.
- **S05 — celovitost besedila:** vrednosti z narekovaji, obema ločiloma, prelomi, Unicode in začetnimi formulami imajo natanko predpisani zapis. Čista pretvorba omogoča preverjanje pravila vseh kolon tudi neodvisno od domen veljavnega statusa in datuma.
- **S06 — življenjska doba nastavitev:** preklop pogleda ohrani nastavitev; menjava projekta in osvežitev jo ponastavita; ponovljeni izvozi uporabijo trenutne vrednosti.
- **S07 — bralno delovanje:** med spremembami kontrol in prenosi ni zapisov API, novih strani ali sprememb opravil; podrobnosti in obstoječe branje delujejo še naprej.
- **S08 — prilagodljivost:** na širini 390 pik in namizju so kontrole dosegljive, fokus viden, ohranjena so zahtevana imena in atributi ter dizajn Folio, brez razširitve cele strani.

Uspeh pomeni izpolnitev vseh R01–R12 za opisano domeno in uspešna dejansko izvedena ustrezna preverjanja. Razvojni testi D01–D04 so del dokazil, ne nadomestilo za celotno pokritost. Ne uvajamo zunanjih meritev ali novih funkcionalnosti.

## Izvedba in sledljivost

Implementacija in lokalna preverjanja so zaključena. Celotna tabela vseh R01–R12 s sprejemnimi pogoji, dejanskimi datotekami/funkcijami, imeni testov in izidi je v [poročilu preverjanja](../verification.md#sledljivost-r01r12). To je povezani del skupne predloge; dokazil ne podvajamo. [Naloge](tasks.md) beležijo dejansko izvedbo, [načrt](plan.md) tehnične odločitve.

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni; dovoljene izvedbene izbire so razporeditev kontrol in besedilo, ki ga dogovor ne predpisuje.
- Brez novih odvisnosti, zapisovalnih API-jev, trajne shrambe ali nastavitev v URL-ju. Strežnik, skupni tipi, skupni testi in infrastruktura ostanejo nespremenjeni. Testne kontrole uporablja samo testni program.
- Navigacije med nedokončanim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Lokalno preverjanje je zaključeno: lint, tipi, gradnja in 57 testov uspešno; pregledani so namizni in mobilni posnetki. Končni testi niso dostopni in niso označeni kot opravljeni. Podrobnosti in omejitve so v [poročilu](../verification.md).

## Zgodovina sprememb

- 2026-09-23, 1.0: prva specifikacija vseh R01–R12, predikati stanja in CSV, scenariji S01–S08 ter začetna sledljivost brez trditev o izvedenih testih.

- 2026-09-23, 1.1: implementacija zaključena, sledljivost povezana z dejanskimi testi in kodo v `docs/agent/verification.md`; rezultat 57/57, brez sprememb funkcionalnih zahtev.
