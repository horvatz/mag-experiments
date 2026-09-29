# P06 — Nastavljiv izvoz CSV

Različica 1.0.0 · 2026-09-25 · Postopek C, Spec Kit 1.0.8 / Lean 1.0.0

## Problem in kontekst

Uporabnik želi prenesti opravila trenutnega projekta v CSV ter izbrati kolone, ločilo in stanje opravil za izvoz. Začetni Folio prikazuje opravila v preglednici ali tabli, povzetek stanj ter podrobnosti opravila, vendar izvoza nima. Dopolnitev ohrani slovenski, dostopen in prilagodljiv vmesnik ter potrjeni [dizajn Folio](../../dizajn.md).

Merilo so vse izvirne zahteve [R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje razdelke [skupne predloge](../../../task/specification-template.md); poznejši načrt, naloge in dokazi se lahko povežejo brez podvajanja.

## Vhodi, dejanja in izidi

**Podatki:** trenutni projekt z enkratnim `id`; urejeno polje njegovih opravil iz obstoječega `/api/projects/<projectId>/tasks`. Vsako opravilo ima nizovna polja `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`; `status` je `todo`, `in_progress` ali `done`, datum je veljaven izvirni `YYYY-MM-DD`. Vrstni red opravil določa odgovor API-ja. Ne sklepamo iz naslovov ali testnih ID-jev. Število je poljubno, tudi 0, 1 ali več kot 10; naslovi se lahko ponavljajo, besedilo lahko vsebuje Unicode, ločila, narekovaje in prelome vrstic. Imena projektov oziroma ID-ji v obsegu vsebujejo črke, številke in vezaje.

**Kontrole:** sedem checkboxov z dostopnimi imeni `Stolpec id`, `Stolpec projectId`, `Stolpec title`, `Stolpec status`, `Stolpec assignee`, `Stolpec dueDate`, `Stolpec description`; HTML select `Ločilo CSV` z vrednostma `;` in `,`; HTML select `Filter izvoza` z vrednostmi `all`, `todo`, `in_progress`, `done`; gumb `Izvozi CSV`. Kontrole veljajo enako v preglednici in tabli. Razporeditev in preostalo besedilo sledita obstoječim gradnikom Folio.

**Dejanja:** uporabnik izbira kolone, ločilo in filter, sproži prenos, preklopi pogled, zamenja projekt ali osveži stran. Spremembe izvoznih kontrol ne spremenijo vidnih opravil ali povzetka. Ob uspešnem izvozu se začne prenos `folio-<projectId>.csv`; nastavitve in opravila ostanejo enaka. Ob nič izbranih kolonah ali nič ustreznih opravilih je gumb onemogočen in prenosa ni. Nalaganje, napake GET in ponovitev ostanejo v obstoječem toku; brez uspešno naloženih opravil ni veljavnega izvoza. Preklic prenosa v brskalniku ne spreminja aplikacijskih podatkov ali nastavitev; ne uvajamo lastnega postopka za potrjevanje ali preklic prenosa.

## Zahteve in pravila

### Simboli in predikati

- `p`: ID trenutnega projekta; `Tₚ`: polje njegovih naloženih opravil v izvornem vrstnem redu.
- `C = [id, projectId, title, status, assignee, dueDate, description]`: nespremenljivi vrstni red kolon.
- `S ⊆ C`: množica izbranih kolon; `d ∈ {";", ","}`: ločilo; `f ∈ {all, todo, in_progress, done}`: filter; `v ∈ {table, board}`: pogled.
- `K(S) = [c iz C, za katerega c ∈ S]`: izbrane kolone v kanoničnem vrstnem redu, ne v vrstnem redu klikov.
- `E(Tₚ,f) = [t iz Tₚ, za katerega f = all ali t.status = f]`: stabilno filtrirano zaporedje.
- `enabled ⇔ Tₚ je uspešno naložen ∧ |K(S)| > 0 ∧ |E(Tₚ,f)| > 0`.
- `defaults = (S = C, d = ";", f = all)`.

Nevtralizacija podatkovnega niza `x`: `N(x) = "'" + x`, če `x` ustreza regularnemu izrazu `/^[ \t\r\n]*[=+@-]/`; sicer `N(x) = x`. Upoštevamo izključno začetni presledek U+0020, tabulator U+0009, CR U+000D in LF U+000A. Niza ne obrezujemo. Apostrof dodamo pred vse začetne znake izvirnega niza. Drugi začetni presledkovni znaki niso del tega pravila.

Navajanje `Q(x) = '"' + x.replaceAll('"', '""') + '"'`. Glave uporabljajo `Q(c)`, podatki `Q(N(t[c]))`. Za `enabled` je vsebina:

```text
CSV(Tₚ,S,d,f) = U+FEFF
  + join(d, [Q(c) za c v K(S)]) + CRLF
  + concat([join(d, [Q(N(t[c])) za c v K(S)]) + CRLF za t v E(Tₚ,f)])
```

Datoteka vsebuje UTF-8 bajte te vsebine, torej začetne bajte `EF BB BF`. CRLF med zapisi in na koncu ne spreminja izvirnih CR/LF znotraj navedenih vrednosti. Glave se ne nevtralizirajo. Izvoz ne lokalizira stanj in datumov.

### Spremembe stanja

| Dogodek | Stanje po dogodku | Invarianta |
| --- | --- | --- |
| Prvi vstop v projekt ali osvežitev | `defaults` | Podatki se berejo po obstoječem API toku. |
| Izbor/odstranitev kolone `c` | Spremeni se le članstvo `c` v `S`. | `K(S)` vedno sledi `C`; `Tₚ`, `d`, `f` so enaki. |
| Izbor ločila | `d` postane izbrana dovoljena vrednost. | `S`, `f`, `Tₚ` so enaki. |
| Izbor filtra | `f` postane izbrana dovoljena vrednost. | Vmesnik še prikazuje celotni `Tₚ`; podatki in povzetek so enaki. |
| Preklop Preglednica/Tabla | Spremeni se samo `v`. | `S`, `d`, `f` se ohranijo; pri istih podatkih so bajti CSV enaki. |
| Menjava projekta `p → q`, `p ≠ q` | Nastavitve se ponastavijo na `defaults`; uporabi se `Tq`. | Tudi ob vrnitvi na prejšnji projekt veljajo privzete nastavitve. |
| Izvoz ob `enabled` | Prenos po zgornji funkciji s trenutnimi nastavitvami. | Nobene mutacije opravil ali izvornega polja; brez zapisov API in nove strani. |
| Izvoz ob `¬enabled` | Gumb je onemogočen, brez prenosa. | Ponoven izbor kolone ali filtra sproti preračuna `enabled`. |

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz vsebuje samo opravila trenutnega projekta, v vrstnem redu API; privzeto `S=C`, `d=";"`, `f=all`. | S01: primerjava vseh vrstic z odgovorom API in pregled privzetih kontrol; tudi 1 in več kot 10 opravil. |
| R02 | Izbrati je mogoče vseh sedem kolon; glava in vrednosti sledijo `K(S)`, ne zaporedju klikov. | S02: odstranjevanje in ponovni izbor v obratnem vrstnem redu; natančna primerjava glave in podatkov. |
| R03 | `|S|=0 ⇒ ¬enabled` in noben prenos; ponoven izbor omogoči izvoz natanko, ko obstajajo ustrezne vrstice. | S02: nič kolon, odsotnost dogodka prenosa, nato ponoven izbor. |
| R04 | Filter omeji samo `E`, ne prikaza ali povzetka; prazen projekt ali prazen rezultat onemogoči izvoz. | S03: vsi štirje filtri, prazen projekt in manjkajoče stanje; preverjanje vseh vidnih ID-jev in povzetka. |
| R05 | Prenos ima ime `folio-<projectId>.csv` in UTF-8 BOM; ni nove strani ali pošiljanja vsebine na strežnik. | S01/S07: bajti, predlagano ime prenosa, spremljanje strani in omrežnih zahtev. |
| R06 | Dovoljeni ločili sta `;` in `,`; vse glave in vrednosti so navedene; vsak notranji `"` je podvojen. | S04: natančna primerjava bajtov za obe ločili, vključno s praznim nizom, ločili in narekovaji. |
| R07 | Zapisi in zadnji zapis se končajo s CRLF; vsebina z notranjimi prelomi in ločili se ohrani. | S04: primerjava celotne datoteke z notranjimi CR, LF in CRLF; ne uporabljamo naivnega deljenja po vrsticah. |
| R08 | `N` velja za vse podatkovne kolone in nobeno glavo; druge nize ohrani. | S05: vsi štirje sprožilci, kombinacije začetnih dovoljenih znakov ter varni podobni nizi; preverjanje vseh kolon v obsegu veljavnih tipov. |
| R09 | Unicode, presledki in opisi ostanejo nespremenjeni razen `N`; stanja so interna in datum je izvirni `YYYY-MM-DD`. | S04/S05: šumniki, emoji, dolgi/večvrstični opisi, robni presledki, različni veljavni datumi in vsa stanja. |
| R10 | Preklop pogleda ohrani `S,d,f`; isti podatki in nastavitve dajo enake bajte v obeh pogledih. | S06: primerjava nastavitev in prenesenih bajtov pred in po preklopu. |
| R11 | Menjava projekta in osvežitev povrneta `defaults`; vsak zaporedni izvoz uporabi trenutno stanje. | S06: sprememba nastavitev med prenosi, menjava in vrnitev projekta, ponovni reload. |
| R12 | Kontrole/izvoz ohranijo opravila in polje ter bralne funkcije, brez zapisov API; Folio ostane odziven in dostopen. | S07/S08: nespremenljivost vhoda, opazovanje omrežja, skupna regresija, preverjanje dizajna in širine 390 pik. |

### Uporabniški scenariji in merilo uspeha

- **S01 — Privzeti prenos:** po nalaganju projekta uporabnik izvozi vsa opravila; datoteka ima pravilno ime, BOM, kanonične kolone in izvorni vrstni red. Primeri vsebujejo ponovljene naslove, različne ID-je ter 1 in več kot 10 opravil.
- **S02 — Izbor kolon:** uporabnik odstrani vse kolone; gumb ne sproži prenosa. Kolone ponovno izbere v drugačnem vrstnem redu; datoteka sledi kanoničnemu vrstnemu redu, omogočenost pa upošteva tudi vrstice.
- **S03 — Filter in prazni podatki:** uporabnik izbere vsako stanje; izvoz se spremeni, seznam, tabla in povzetek ostanejo celotni. Prazen projekt in filter brez zadetkov nimata izvoza.
- **S04 — Zvestoba zapisa:** uporabnik izvozi besedilo s šumniki, drugimi Unicode znaki, ločili, narekovaji, presledki in prelomi. Za obe ločili pričakovani bajti potrjujejo navajanje, CRLF ter ohranitev vsebine, stanj in datumov.
- **S05 — Formule:** nevarni izvirni nizi, npr. `" \t\r\n=SUM(A1)"`, dobijo apostrof na sam začetek. Navadno besedilo, že začetni apostrof, sam presledek ali sprožilec za nedovoljenim začetnim presledkovnim znakom ostanejo enaki. Sprožilci se preverijo v vseh podatkovnih kolonah, kjer jih domena dopušča; splošno pravilo serializacije velja za vse kolone.
- **S06 — Življenjska doba nastavitev:** uporabnik spremeni vse nastavitve, preklopi pogled in primerja prenosa; nato spremeni nastavitve in spet izvozi. Menjava projekta, vrnitev in osvežitev vsakič povrnejo privzete vrednosti.
- **S07 — Brez stranskih učinkov:** več sprememb kontrol in izvozov ne spremeni nalog ali njihovega vrstnega reda, ne pošlje zapisov API ali CSV vsebine in ne odpre nove strani. Podrobnosti opravila in obstoječi bralni tokovi delujejo naprej.
- **S08 — Folio in regresija:** pri 390 pikah se stran ne razširi; notranje drsenje preglednice/table ostane dovoljeno. Checkboxi, selecta in gumb imajo dogovorjena dostopna imena; ostanejo vidni fokus, dostopna imena pogledov in stolpcev, `data-task-id` ter `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu so zunaj njegove povezave.

Uspeh pomeni izpolnitev vseh R01–R12 in dogovora o vmesniku na opisani domeni podatkov ter uspešno izvedena relevantna preverjanja. Razvojni primeri so primeri dokazovanja, ne omejitev splošnih pravil.

## Izvedba in sledljivost

Implementacija sledi [načrtu](plan.md), izvedba je označena v [nalogah](tasks.md). Vsi spodaj navedeni testi so uspešno izvedeni v skupnem zagonu `npm run check`; ukaz, izhodna koda, število testov, vizualni dokazi in omejitve so v [verification.md](../verification.md), celoten izhod pa v [check.log](check.log). A01–A08 so dejanska imena scenarijev v [agentovih testih](../../../tests/agent/P06.spec.ts); D01–D04 so obstoječi razvojni testi.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzete nastavitve in stabilni vrstni red | A01, A03, A04, A05; D01 | [csv.ts](../../../src/csv.ts): `createCsv`; [CsvExport.tsx](../../../src/CsvExport.tsx): začetno stanje | Uspešno; check.log, verification.md |
| R02 | Kanonična projekcija `K(S)` | A01 (obe ločili), A03, A04; D02 | [csv.ts](../../../src/csv.ts): `csvColumns`, projekcija; [CsvExport.tsx](../../../src/CsvExport.tsx): checkboxi | Uspešno; check.log |
| R03 | Varovalo `enabled` za kolone | A03, A04, A05 | [CsvExport.tsx](../../../src/CsvExport.tsx): `enabled`, `download`, disabled; [csv.ts](../../../src/csv.ts): prazni rezultat | Uspešno; check.log |
| R04 | Stabilni `E`, prazni rezultati in celotni prikaz | A03, A04, A05; D02 | [csv.ts](../../../src/csv.ts): filter; [CsvExport.tsx](../../../src/CsvExport.tsx): `hasRows`; [App.tsx](../../../src/App.tsx): celotni `tasks` | Uspešno; check.log |
| R05 | Ime, BOM in lokalni prenos | A01, A04, A06, A07; D01, D04 | [csv.ts](../../../src/csv.ts): BOM; [CsvExport.tsx](../../../src/CsvExport.tsx): `download`, Blob in povezava | Uspešno; check.log |
| R06 | `Q`, obe ločili | A01, A02, A07; D02, D03 | [csv.ts](../../../src/csv.ts): `quote`, povezovanje polj z ločilom | Uspešno; check.log |
| R07 | CRLF in ohranitev notranjih prelomov | A01, A07; D01, D03 | [csv.ts](../../../src/csv.ts): `quote` in zaključevanje zapisov | Uspešno; check.log |
| R08 | `N` pred `Q`, vse podatkovne kolone | A02, A07; D03 | [csv.ts](../../../src/csv.ts): `quoteValue` za vsako podatkovno celico | Uspešno; check.log; domena dodatnih neposrednih klicev pojasnjena v verification.md |
| R09 | Zvestoba podatkov | A01, A02, A06, A07; D03 | [csv.ts](../../../src/csv.ts): neposredni `task[column]`, brez formatiranja/obrezovanja | Uspešno; check.log |
| R10 | Pogled ne spreminja nastavitev/bajtov | A06; D04 na obeh širinah | [App.tsx](../../../src/App.tsx): CsvExport zunaj vejitve pogledov; [CsvExport.tsx](../../../src/CsvExport.tsx): lokalno stanje | Uspešno; check.log |
| R11 | Ponastavitev in trenutne nastavitve | A05, A06 | [App.tsx](../../../src/App.tsx): `key={project.id}`; [CsvExport.tsx](../../../src/CsvExport.tsx): začetno stanje in aktualni klik | Uspešno; check.log |
| R12 | Nespremenljivost, bralni tokovi, odzivnost | A01, A03, A04, A08; vseh 38 osnovnih testov; D04; vizualni pregled | [csv.ts](../../../src/csv.ts): nemutirajoča projekcija; [App.tsx](../../../src/App.tsx): integracija; [styles.css](../../../src/styles.css): `.csv-*` | Uspešno; check.log, [meritve](manual-view.json) in posnetki v verification.md |

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj glede zahtevanega obnašanja ni. Pot `docs/agent/P06` je določil uporabnik.
- Novo stanje je lokalno trenutnemu projektu, brez trajne shrambe ali novih URL-parametrov. Ne uvajamo novih zapisovalnih API-jev, odvisnosti ali arhitekturnih preureditev.
- Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez osvežitve ostanejo v obsegu obstoječih regresijskih zahtev.
- Strežnik, infrastruktura, skupni tipi/testi in uradni Spec Kit viri so samo berljivi. Testni program sme nadzorovati GET odgovore; aplikacija ne sme uporabljati `/__test/` ali testnih pripomočkov.
- Izvedenih je 55 uspešnih testov ter vizualni pregled na 1440 in 390 pikah. Končni skriti testi niso dostopni; ostale omejitve in dejanski izidi so v [verification.md](../verification.md).

## Zgodovina sprememb

- 2026-09-25, 1.0.0: začetna specifikacija vseh R01–R12 po skupni predlogi, s predikati, spremembami stanja, scenariji in matriko še neizvedenih preverjanj.

- 2026-09-25: dodana povezava na načrt izvedbe; funkcionalne zahteve in sprejemni pogoji ostajajo enaki.

- 2026-09-26 (lokalno): izvedena implementacija in T001–T009; matrika povezana s kodo, 55 uspešnimi testi in vizualnimi dokazi. Sprejemni pogoji in predikati so nespremenjeni.
