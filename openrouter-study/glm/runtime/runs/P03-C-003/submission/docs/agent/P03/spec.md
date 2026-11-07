# Specifikacija P03: Iskanje in sestavljeni filtri

## Pregled

Folio ostane nespremenjen vizualni in navigacijski temelj. P03 doda iskanje po opravilih trenutnega projekta ter dva filtra: stanje in odgovorno osebo. Filtri delujejo skupaj po logičnem IN, ne spreminjajo podatkov in ne shranjujejo stanja.

Projektna načela so v `.specify/memory/constitution.md`. Izvirne zahteve so v `task/instructions.md`; skupna predloga specifikacije je v `task/specification-template.md`.

## Vhodni prostor in stanje

- `Project` ima `id` in `name`.
- `Task` ima vsaj `id`, `title`, `description`, `assignee`, `status` in `dueDate`.
- `view` je `table` ali `board`.
- `query` je iskalni niz; privzeto je prazen.
- `statusFilter` je `all`, `todo`, `in_progress` ali `done`; privzeto je `all`.
- `assigneeFilter` je `all` ali natančno ime osebe; privzeto je `all`.
- `visibleTasks` je čisto izpeljek iz naloženih opravil trenutnega projekta in treh filtrov.

## Pravila sprememb stanja

- Ob nalaganju ali osvežitvi so `query`, `statusFilter` in `assigneeFilter` na privzetih vrednostih.
- Menjava projekta ponastavi vse tri filtre in naloži opravila nov projekta.
- Menjava pogleda ohrani vse tri filtre in isti nabor vidnih opravil.
- Sprememba iskalnega vnosa posodobi samo `query`.
- Sprememba filtra stanja posodobi samo `statusFilter`.
- Sprememba filtra osebe posodobi samo `assigneeFilter`.
- Gumb `Počisti filtre` ponastavi vse tri filtre na privzete vrednosti, ne pa tudi projekta ali pogleda.
- Nobeno pravilo spremem stanja ne pošlje `POST`, `PATCH`, `PUT` ali `DELETE` na `/api/`.
- Vrednosti filtrov se ne zapisujejo v URL ali trajno shrambo brskalnika.

## Iskanje

Iskanje pregleduje `id`, `title`, `description` in `assignee` trenutnega opravila.

1. Vsako polje pretvori z Unicode NFD.
2. Odstrani kombinacijska znamenja `U+0300` do `U+036F`.
3. Pretvori v male črke.
4. Polja združi z enojnim presledkom v iskalno besedilo.
5. Iskalni vnos razdeli po belinah in odstrani prazne dele.
6. Opravilo ustreza, če je vsak del dobesedni podnizi združenega iskalnega besedila.

Vrstni red delov iskanega vnosa ni pomemben. Ločila in drugi znaki niso regularni izrazi. Prazen iskalni vnos ne omejuje rezultatov.

## Filtri in števci

- Filter stanja ustreze, če je `statusFilter` enak `all` ali `task.status`.
- Filter odgovorne osebe ustrepi, če je `assigneeFilter` enak `all` ali natančno enak `task.assignee` brez normalizacije.
- Vidna opravila so tista, ki izpolnjujejo iskanje, filter stanja in filter osebe hkrati.
- Izbirnik oseb vsebuje `all` in vsako različno neprazno ime iz celotnega trenutnega projekta natanko enkrat.
- Števec rezultatov je `Prikazano: N od M.`, kjer je `N` število vidnih opravil in `M` število vseh opravil trenutnega projekta.
- Pregled stanj in števci stolpcev table štejejo samo vidna opravila.
- Uporaba filtrov ne spremeni izvornega vrstnega reda ali vsebine polj opravil.

## Pogledi

- Preglednica in tabla prikazujeta isti nabor ustreznih `id` opravil.
- Preglednica prikazuje vidna opravila v izvornem vrstnem redu.
- Tabla razvrsti vidna opravila v stolpce `Pripravljeno`, `V delu` in `Končano` glede na njihovo stanje.
- Stolpec table ne prikazuje opravil, ki izpadajo zaradi iskanja ali filtra osebe.
- Če v nepraznem projektu ni zadetkov, se izpiše `Ni zadetkov.` in oba pogleda ostanta uporabna.
- Prazen projekt ohrani običajno prazno stanje in števec `Prikazano: 0 od 0.`.

## Uporabniški pote

1. Uporabnik odpre aplikacijo in vidi vsa opravila trenutnega projekta v izvornem vrstnem redu.
2. Uporabnik vnese več besed; vidijo se samo opravila, ki vsebujejo vse besede v poljih `id`, `title`, `description` ali `assignee`.
3. Uporabnik izbere stanje in osebo; vidijo se samo opravila, ki ustrezajo obema pogojem in iskanju.
4. Uporabnik preklopi med preglednico in tablo; filtri in vidni `id` ostanejo enaki.
5. Uporabnik zamenja projekt; iskanje in oba filtra se ponastavita.
6. Uporabnik klikne `Počisti filtre`; vse tri kontrole se vrnejo na privzete vrednosti.
7. Uporabnik odpre podrobnosti opravila ali se vrne nazaj; obstoječa navigacija in bralni prikaz še delujeta.

## Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob nalaganju so iskanje in filtra privzeti; vidna so vsa opravila trenutnega projekta v izvornem vrstnem redu. | Naloži projekt in primerjaj vrstni red `id`. |
| R02 | Iskanje upošteva `id`, `title`, `description` in `assignee` po normalizaciji NFD, odstranitvi `U+0300` do `U+036F` in pretvorbi v male črke. | Preveri zadetke z različnimi velikostmi črk in kombinacijskimi znamenji. |
| R03 | Iskalni niz se razdeli po belinah; vsak neprazni del mora biti dobesedni podnizi združenih polj. | Preveri večbesedni iskalni niz v različnem vrstnem redu in ločila. |
| R04 | Stanje in odgovorna oseba se kombinirata z iskanjem po logičnem IN; stanje ima samo `all`, `todo`, `in_progress`, `done`. | Preveri kombinacijo vseh treh filtrov in točnost izbire osebe. |
| R05 | Izbirnik oseb vsebuje `all` in vsako različno neprazno ime trenutnega projekta natanko enkrat. | Primerjaj možnosti z imeni vseh opravil trenutnega projekta. |
| R06 | Preglednica in tabla kažeta iste ustrezne `id`; preklop pogleda ohrani vse filtre. | Preklopi pogled pri aktivnih filtrih in primerjaj vidne `id`. |
| R07 | Menjava projekta ponastavi iskanje in oba filtra ter ne uporabi filtrov na drugem projektu. | Zamenjaj projekt pri aktivnih filtrih in preveri novo stanje. |
| R08 | Osvežitev začne s privzetimi filtri; filtri se ne shranjujejo v URL ali trajno shrambo. | Osveži stran in preveri URL ter lokalno shrambo. |
| R09 | Števec je `Prikazano: N od M.`; pregled stanj in števci stolpcev štejejo samo vidne rezultate. | Preveri števce pri več kombinacijah filtrov. |
| R10 | V nepraznem projektu brez zadetkov se izpiše `Ni zadetkov.`; prazen projekt ohrani običajno prazno stanje. | Preveri obe stanji v obeh pogledih. |
| R11 | `Počisti filtre` ponastavi vse tri kontrole in prikaže vsa opravila brez spremembe vrstnega reda ali polj. | Aktiviraj filtre, počisti in primerjaj stanje. |
| R12 | Obstoječa navigacija in podrobnosti delujejo; filtriranje ne pošlje pisalnih zahtev. Ohranjen sta Folio in ozki prikaz. | Preveri poti, podrobnosti, network in širino 390 pik. |

## Uspešnost

- Vsi pogoji R01 do R12 so izpolnjeni.
- Uporabniški vmesnik uporablja samo javni `/api/` in ne uporablja `/__test/`.
- Vidna opravila so odvisna samo od trenutnega projekta in aktivnih filtrov.
- Folio, dostopnost, obstoječe poti in podrobnosti ostanejo ohranjeni.
- Spremembe ostanejo znotraj `src/`, `tests/agent/` in `docs/agent/`.

## Omejitve

- Ni novih zahtev, zunanjih meritev, odvisnosti, strežniških sprememb ali arhitekturnih preureditev.
- Ni novih pisalnih API-jev.
- Nebelinski znaki v iskanju niso poseben jezik poizvedb.
- Razporeditev novih kontrol ni predpisana, dokler so dostopna imena in Folio ohranjeni.

## Sledljivost

- Izvirne zahteve: `task/instructions.md`.
- Skupna predloga: `task/specification-template.md`.
- Projektna načela: `.specify/memory/constitution.md`.
- Pot funkcionalnosti: `docs/agent/P03`.
