# P02 — Množična sprememba stanja opravil

Različica 1.0, 2026-09-21. Postopek C, Spec Kit 1.0.8 / Lean 1.0.0.

## Problem in kontekst

Uporabnik Folio želi več opravil trenutnega projekta prestaviti v isto stanje in ob delnem neuspehu ponoviti samo neuspele zapise. Začetni vmesnik že ponuja projekte, preglednico, tablo, števce in bralne podrobnosti; množičnega izbora ali shranjevanja še nima. Obstoječi `src/api.ts` ponuja `updateTask`.

Merilo so [izvirne zahteve R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [ustava](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Ohranijo se slovenski izrazi in [potrjeni dizajn Folio](../../dizajn.md): obstoječi gradniki, barve, navigacija, vidni fokus ter notranje drsenje preglednice/table na ozkih zaslonih.

## Vhodi, dejanja in izidi

Relevantna polja opravila so `id`, `projectId`, `title`, `status`, opis, odgovorna oseba in rok. Identiteta je izključno `id`; naslov se uporabi v zahtevi in sporočilih, nikoli kot ključ izbora. Spreminja se samo `status`. Cilji so Pripravljeno (`todo`), V delu (`in_progress`) in Končano (`done`); začetna vrednost je prazna (`""`).

Uporabnik lahko izbere posamezna opravila ali vsa opravila trenutnega projekta, nastavi cilj, potrdi, po neuspehu ponovi neuspele ali počisti izbor. Preklop pogleda ohrani stanje operacije. Menjava projekta in osvežitev zunaj shranjevanja ponastavita njeno začasno stanje, podatki pa ostanejo shranjeni. Med shranjevanjem ni preklica; »Počisti izbor« je na voljo zunaj shranjevanja in ne razveljavlja zapisov.

Vsak izbrani ID se shrani z ločeno zahtevo `PATCH /api/tasks/:id` s telesom `{ title: prebraniNaslov, status: zajetiCilj }`, tudi če že ima ciljno stanje. Uspeh vrne celotno opravilo; HTTP zavrnitev pomeni, da zapisa za ta ID ni bilo. Posamični potrjeni uspehi postanejo vidni takoj, ne šele po zaključku vseh zahtev. Zavrnitve ne prekinejo drugih zapisov in ne povzročijo povratnih zapisov.

### Dogovor o vmesniku

- Posamezni HTML `input type="checkbox"`: dostopno ime `Izberi opravilo <id>`; skupni: `Izberi vsa opravila`, delni izbor prek lastnosti `indeterminate`. Klik izbora ne odpre podrobnosti.
- Element `aria-label="Število izbranih opravil"` prikazuje `Izbrano: N`; HTML `select` ima oznako `Novo stanje` in začetno vrednost `""`.
- Gumbi: `Uporabi za izbrana`, `Ponovi neuspele`, `Počisti izbor`. Brez neuspehov je ponavljanje skrito ali onemogočeno.
- Napredek: `role="status"`, dostopno ime `Potek množične spremembe`. Končni povzetek: `role="status"`, ime `Rezultat množične spremembe`, besedilo `Uspešno: X. Neuspešno: Y.`; med pošiljanjem je lahko skrit.
- Vsaka napaka ima `role="alert"` ter vsebuje ID, naslov in razumljiv razlog.
- Ohranijo se `data-task-id` na vrsticah/karticah, poimenovani stolpci table in `aria-label="Pregled stanj opravil"`. Stran na ozkem zaslonu ne sega čez zaslon; notranje drsenje ostane dovoljeno.

## Zahteve in pravila

### Model in predikati

Naj bo `P` množica ID-jev opravil trenutnega projekta, `S ⊆ P` trenutni izbor, `t` cilj ali prazna vrednost, `busy` oznaka shranjevanja. Ob potrditvi zajamemo izvirni izbor `O = S`, cilj `τ = t` in prebrane naslove `H[id]`. `C ⊆ O` je množica uspešno shranjenih ID-jev celotne operacije; `F ⊆ O` vsebuje trenutno neuspele ID-je z razlogi. `B` je množica ID-jev trenutnega poskusa, `W ⊆ B` pa še čakajoči odgovori. `D0` označuje podatke pred operacijo, `D` trenutno potrjene podatke. Enaki naslovi in poljuben vrstni red odgovorov so dovoljeni.

- **P1 — začetno in očiščeno stanje:** `S = ∅`, `t = ""`, `C = F = ∅`, `busy = false`, brez napak in povzetka. Čiščenje, menjava projekta ali osvežitev zunaj shranjevanja ne pošljejo zapisov; čiščenje ohrani `D`.
- **P2 — izbor:** preklop posameznega ID-ja spremeni samo njegovo članstvo v `S`. Skupni izbor nastavi `S = P` oziroma `S = ∅`. Skupno polje je označeno natanko pri `|P| > 0 ∧ S = P`; vmesno pri `0 < |S| < |P|`; pri `P = ∅` je neoznačeno in onemogočeno. Števec je vedno `|S|`.
- **P3 — začetek:** običajna potrditev je omogočena natanko, ko `|S| > 0 ∧ t ≠ "" ∧ ¬busy ∧ F = ∅`. Zajame `O`, `τ`, `H`, ponastavi `C` in začne `B = O`, `W = B`, `busy = true`. Za vsak `id ∈ B` pošlje natanko eno zahtevo z `H[id]` in `τ`; zunaj `B` nobene. Hitri kliki ali Enter med istim poskusom ne sprožijo novega poskusa.
- **P4 — posamični odgovor:** ob uspehu `id` se takoj posodobi samo `D[id].status` na potrjeno stanje odgovora in `C := C ∪ {id}`; zavrnitev ohrani `D[id]` in zabeleži napako za `id`. V obeh primerih `W := W \ {id}`. Druge zahteve se obdelajo neodvisno. Bralni prikazi in števci izhajajo iz potrjenih podatkov, ne iz izbora ali cilja.
- **P5 — konec poskusa:** ko `W = ∅`, je `busy = false`, `F` množica zavrnjenih ID-jev tega poskusa in povzetek šteje `X = |C|`, `Y = |F|`. Veljata `C ∩ F = ∅` in `C ∪ F = O`. Če `F ≠ ∅`, nastavimo `S = F` in ohranimo `t = τ`. Vsak `id ∈ F` ima svoje sporočilo z ID-jem, naslovom in razlogom.
- **P6 — ponavljanje:** dovoljeno je pri `¬busy ∧ F ≠ ∅`. Naslednji poskus zajame `B = F` z izvirnim ciljem `τ` in naslovi `H`, ohrani `C` ter pošlje eno novo zahtevo na ID iz `B`. `B ∩ C = ∅`; uspešnih ne pošlje ponovno. Po poljubno mnogo poskusih `C` vsak uspeh šteje največ enkrat. Po `F = ∅` se izbor in cilj izpraznita, napake izginejo, ponavljanje ni na voljo, povzetek pa pokaže `|O|` uspehov in nič neuspehov.
- **P7 — zaklepanje:** pri `busy` so vsi izbori, cilj, potrditev, ponavljanje in čiščenje onemogočeni ter viden napredek. Pri `¬busy ∧ F ≠ ∅` so izbori, cilj in običajna potrditev zaklenjeni; dovoljena sta ponovitev in čiščenje.
- **P8 — nespremenljivost:** za vsak `id ∉ C` velja `D[id] = D0[id]`; za `id ∈ C` velja `D[id] = D0[id]` z edino dovoljeno zamenjavo polja `status` na `τ`. Zato so vsi neizbrani ID-ji in drugi projekti v celoti nespremenjeni. Enako velja po osvežitvi. Če je cilj že enak začetnemu stanju, zahteva še vedno obstaja in uspeh šteje enkrat.
- **P9 — pogledi in življenjska doba:** preklop Preglednica/Tabla ohrani `S`, `t`, `C`, `F` in povzetek ter kaže isti `D`. Menjava projekta ali osvežitev zunaj shranjevanja vzpostavi P1, obdrži pa shranjeni `D`. Čiščenje po delnem uspehu omogoči novo operacijo z neodvisnim `O` in `C`.

To so splošna pravila za poljubne dovoljene podatke, ne pravila, vezana na ID-je razvojnih primerov. Vrstni red in sočasnost pošiljanja nista predpisana.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | P1–P2; izbor po ID v obeh pogledih, enaki naslovi ne povezujejo izbora, klik ne odpre podrobnosti. | S1: posamezna polja, oba pogleda, enaka naslova in URL/podrobnosti. |
| R02 | P2; skupni izbor, praznjenje, vmesno stanje, prazen projekt, skladen števec. | S1: prazna, delna in polna množica; lastnost `indeterminate`. |
| R03 | P9; preklop ohrani izbor, cilj in rezultate/napake; projekt in osvežitev počistita začasno stanje. | S2: preklopi pred in po delnem neuspehu ter po uspehu. |
| R04 | P3; cilj sprva prazen, tri dovoljene vrednosti, veljavnost potrditve, izbor in cilj brez zapisov ali spremembe bralnih podatkov. | D01, S1, S3: kontrole, dnevnik PATCH in podatkovni posnetek. |
| R05 | P3; posnetek izbora/cilja, natanko en PATCH na izbrani ID, nespremenjen naslov, tudi ob enakem stanju. | D02, S3: telesa zahtev in število po ID. |
| R06 | P4; takojšnja posamična potrditev, skladni pogledi, števci in pozneje odprte podrobnosti, trajnost. | S4: en odgovor zadržan, drugi potrjen; oba pogleda, podrobnosti, osvežitev. |
| R07 | P4–P5, P8; neuspeh brez razveljavitve ali prekinitve drugih; povzetek in napaka za vsak ID. | D03, S4–S5: mešani ter popolnoma neuspešni odgovori. |
| R08 | P5–P6; po neuspehu samo neuspešni izbrani, isti cilj, ponavljanje samo neuspelih tudi večkrat. | D03, S5: več zaporednih zavrnitev in primerjava dnevnika. |
| R09 | P5–P6; kumulativni različni uspehi, trenutni neuspehi, popoln uspeh počisti izbor/cilj/napake. | S5: povzetek po vsakem poskusu in končne kontrole. |
| R10 | P3, P7; zaklep vseh predpisanih kontrol med pošiljanjem, zaklep izbora/cilja/potrditve po napaki, brez dvojnih zapisov. | D04, S6: zakasnitve, zaporedni kliki/Enter, kontrole po napaki. |
| R11 | P1, P9; čiščenje brez zapisov, ohranitev uspehov, nova neodvisna operacija. | D01, S7: čiščenje po delnem uspehu in nova potrditev. |
| R12 | P8; samo stanje uspešnih izbranih se sme spremeniti, obstoječi prikazi delujejo. | D02–D03, S3–S5, S7–S8: celotni posnetki vseh projektov in regresija. |

## Uporabniški scenariji in merila uspeha

Scenariji so preverljivi primeri zgornjih pravil; izidi so pričakovani, še ne izvedeni.

- **S1 — priprava izbora:** začetno prazne kontrole, onemogočena potrditev; izbor po ID v preglednici in na tabli, tudi pri enakih naslovih; delni/skupni izbor, čiščenje in prazen projekt. Izbor ne navigira. Nobena priprava ne pošlje PATCH ali spremeni podatkov.
- **S2 — življenjska doba:** uporabnik pripravi izbor/cilj in preklopi pogled; po delnem neuspehu preklopi ponovno. Vse operativno stanje se ohrani. Menjava projekta in vrnitev ter osvežitev počistijo izbor/cilj/sporočila, shranjeno stanje pa ostane.
- **S3 — popoln uspeh:** več izbranih, eno opravilo že v cilju, vsaj eno neizbrano ter drug projekt. Natanko en pravilen zapis na izbrani ID; po uspehu povzetek, prazen izbor/cilj, brez napak. Primerjava vseh polj potrdi P8.
- **S4 — sprotni izidi:** eden od odgovorov ostane zadržan; že potrjeno drugo opravilo se prikaže v novem stanju, njegov števec se spremeni, nepotrjeno ostane enako. Zavrnjena zahteva ne prepreči drugih; po koncu oba pogleda, podrobnosti in osvežitev kažejo potrjeno stanje.
- **S5 — ponavljanja:** mešani in popolnoma zavrnjeni poskus, nato ponovna zavrnitev vsaj enega ID-ja in nato uspeh. Dnevnik vsebuje samo trenutne neuspele na posamezni ponovitvi; cilj je isti, uspehi se seštevajo brez podvajanja, napake vsebujejo naslov/ID/razlog. Končni uspeh ponastavi kontrole.
- **S6 — zaklep in dvojna potrditev:** zadržani odgovori, hitri kliki ter Enter ne podvojijo zapisov. Vse zahtevane kontrole so zaklenjene med pošiljanjem; po napaki sta na voljo samo ponavljanje in čiščenje operacije.
- **S7 — opustitev neuspehov:** po delnem uspehu uporabnik počisti izbor. Izbor/cilj/napake/povzetek izginejo brez PATCH, potrjeni zapisi ostanejo; nova operacija šteje svoje uspehe neodvisno.
- **S8 — ohranitev Folio:** projekti, oba pogleda, bralne podrobnosti, semantične oznake in tipkovnica ostanejo uporabni; ozka stran nima zunanjega vodoravnega prelivanja, obstoječe notranje drsenje je dovoljeno.

Uspeh funkcionalnosti pomeni izpolnjene R01–R12 ter dogovor o vmesniku, dokazljiv z izvedenimi preverjanji. D01–D04 iz `tests/development/P02.spec.ts` so del dokazil; sami ne pokrijejo vseh zgornjih scenarijev. Ni dodatnih zunanjih meritev ali funkcionalnih zahtev.

## Izvedba in sledljivost

Spodnja mesta v kodi so predvidena na podlagi pregleda izhodišča; implementacija še ni opravljena. V izvedbenem koraku se tabela posodobi z dejanskimi simboli, testi in povezavami na dnevnike. D01–D04 že obstajajo; S1–S8 so zgornji načrtovani scenariji, ne trditev o obstoju testov.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | P1–P2 | S1 | `src/App.tsx` / `ProjectView`, `src/TaskBoard.tsx` — izbor (predvideno) | Ni izvedeno. |
| R02 | P2 | S1 | `src/App.tsx` / `ProjectView` — skupni izbor in števec (predvideno) | Ni izvedeno. |
| R03 | P9 | S2 | `src/App.tsx` / `ProjectView`, ključ projekta (predvideno) | Ni izvedeno. |
| R04 | P3 | D01, S1, S3 | `src/App.tsx` — cilj in pogoji dejanj (predvideno) | Ni izvedeno. |
| R05 | P3 | D02, S3 | `src/App.tsx` — potrditev; `src/api.ts` / `updateTask` (predvideno) | Ni izvedeno. |
| R06 | P4 | S4 | `src/useResource.ts`, `src/App.tsx` — potrjeni podatki; `src/TaskDetails.tsx` (predvideno) | Ni izvedeno. |
| R07 | P4–P5, P8 | D03, S4–S5 | `src/App.tsx` — posamični izidi in sporočila (predvideno) | Ni izvedeno. |
| R08 | P5–P6 | D03, S5 | `src/App.tsx` — ponavljanje operacije (predvideno) | Ni izvedeno. |
| R09 | P5–P6 | S5 | `src/App.tsx` — kumulativni povzetek (predvideno) | Ni izvedeno. |
| R10 | P3, P7 | D04, S6 | `src/App.tsx`, `src/TaskBoard.tsx` — zaklep kontrol (predvideno) | Ni izvedeno. |
| R11 | P1, P9 | D01, S7 | `src/App.tsx` — čiščenje operacije (predvideno) | Ni izvedeno. |
| R12 | P8 | D02–D03, S3–S5, S7–S8 | `src/App.tsx`, `src/api.ts`, pogledi in `src/styles.css` (predvideno) | Ni izvedeno. |

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni; pot je izrecno določena kot `docs/agent/P02`. Naslovi so veljavni in normalizirani, vsaka zahteva se konča z uspehom ali zavrnitvijo brez zapisa. Sočasno urejanje drugih uporabnikov, negotov izid izgubljene povezave, navigacija/osvežitev med shranjevanjem ter posamično urejanje po P01 niso predmet ocenjevanja. Izbor se ne hrani v brskalnik. Testne kontrole so dovoljene samo testom.

Spremembe aplikacije so omejene na `src/`; dodatni testi sodijo v `tests/agent/`, dokumenti v `docs/agent/`. Dovoljeni procesni datoteki sta ustava in `.specify/feature.json`; strežnik, skupni tipi/testi, priloženi razvojni testi in pripomoček, odvisnosti, nastavitve, predloge ter veščine ostanejo nespremenjeni. V tej fazi ni implementacije ali izvedenih testov. Priloženi razvojni testi in njihov javni pripomoček ostanejo skupaj del oddaje.

## Zgodovina sprememb

- 2026-09-21, 1.0: začetna specifikacija vseh R01–R12, predikati P1–P9, scenariji S1–S8 in začetna sledljivost; pregledani izvirna navodila, dizajn, osnovni vmesnik/API ter razvojni testi. Brez odstopanj od zahtev.
