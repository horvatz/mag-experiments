# P04 — Stabilno razvrščanje z dvema ključema

Različica 1.1, 2026-09-23. Stanje: implementirano in preverjeno z dostopnimi testi.

## Problem in kontekst

Uporabnik želi razvrstiti opravila projekta po dveh ključih z neodvisnima smerema in ohraniti predvidljiv vrstni red izenačenih opravil. Folio trenutno prikazuje prejeto polje v preglednici, na tabli pa ga razdeli v tri stalne stolpce. Dodamo lokalno razvrščanje obeh pogledov ter ponastavitev; ohranimo podrobnosti, bralne funkcije, slovenski vmesnik in [potrjeni Folio](../../dizajn.md).

Merilo so vse R01–R12 v [izvornih navodilih](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md). Ne uvaja sprememb API-ja, infrastrukture, odvisnosti ali skupnih tipov.

## Vhodi, dejanja in izidi

Vhod je urejeno polje `Task[]` iz `/api/projects/:id/tasks`; projekti prihajajo iz `/api/projects`, podrobnosti iz `/api/tasks/:id`. Opravilo ima `id`, `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`. ID-ji so enkratni, opravilo pripada svojemu projektu, besedila so navadni nizi z Unicode in ločili. Datumi so veljavni koledarski datumi `YYYY-MM-DD`, statusi `todo`, `in_progress`, `done`. Podpiramo poljubno dolžino polja, tudi 0, 1 in več kot 10, poljubne ID-je, ponovljene naslove ter poljuben vhodni vrstni red. Oba projekta sta lahko prazna. Podpora manjkajočim ali neveljavnim datumom ni zahtevana.

Kontrole so HTML `select` z dostopnimi imeni in vrednostmi:

| Kontrola | Vrednosti | Privzeto |
| --- | --- | --- |
| Primarni ključ | original, title, assignee, status, dueDate | original |
| Primarna smer | asc, desc | asc |
| Sekundarni ključ | none, title, assignee, status, dueDate | none |
| Sekundarna smer | asc, desc | asc |

Gumb se imenuje **Izvorni vrstni red**. Postavitev kontrol sledi obstoječim gradnikom in slogom Folio; druga besedila niso predpisana. Kontrole so na voljo tudi za prazen projekt in projekt z enim opravilom. Pri `original` sekundarni ključ in obe smeri ne vplivajo na prikaz, vendar so njihove izbire dovoljene. Enaka primarni in sekundarni ključ sta dovoljena.

Uspešna sprememba kontrole takoj prikaže novo projekcijo brez zapisovalnega zahtevka. Ni ločenega potrjevanja ali preklica razvrščanja; brez spremembe izbire ostaneta stanje in prikaz enaka. Zapiranje podrobnosti, tudi s preklicem dialoga, ohrani nastavitve in vrstni red. Ob napaki branja ostaneta obstoječi prikaz napake in ponovni poskus; ne uvajamo lokalnih nadomestnih podatkov. Obstoječi prikazi nalaganja, praznih podatkov, neznanega projekta in napačnih podrobnosti ostanejo delujoči.

### Pravila sprememb stanja

Naj bo `S = (p, dp, s, ds)`, kjer sta `p` in `s` ključa, `dp` in `ds` smeri, `S0 = (original, asc, none, asc)`. `A` je zadnje uspešno prejeto polje trenutnega projekta, `V` pogled, `D` odprto opravilo ali prazna vrednost.

| Dogodek | Novo stanje in izid |
| --- | --- |
| Prvi prikaz ali osvežitev strani | `S := S0`; prikaži vhodni vrstni red po uspešnem branju. |
| Sprememba ene kontrole | Spremeni samo ustrezno komponento `S`; prikaži `P(A,S)`; druge tri komponente ostanejo enake. |
| Preklop preglednica/tabla | Spremeni `V`; `S` ostane enak, oba pogleda izhajata iz `P(A,S)`. |
| Odpri/zapri podrobnosti | Spremeni `D`; `S` in `P(A,S)` ostaneta enaka. |
| Prehod v drug projekt | `S := S0`; uporabi polje novega projekta; vrnitev v prejšnji projekt ne obnovi njegovih prejšnjih nastavitev. |
| Izvorni vrstni red | `S := S0`; prikaži `A` v prejetem vrstnem redu. |

`S` obstaja le v pomnilniku trenutnega projekta, brez zapisa v URL ali trajno shrambo. Obstoječi URL-ji za navigacijo in podrobnosti ostanejo dovoljeni. Navigacije med nezaključenim nalaganjem in sočasnih sprememb brez osvežitve ne širimo prek izhodiščnih regresijskih zahtev.

## Zahteve in pravila

### Predikati razvrščanja

Za niz `x` določimo `N(x) = x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`. `lex(a,b)` je −1, 0 ali 1 po primerjavi JavaScript nizov z `<` in `>` (UTF-16), brez `localeCompare`, kolatorja ali številskega razvrščanja.

Osnovna primerjava `Ck(a,b)` je `lex(N(a[k]), N(b[k]))` za `title` in `assignee`, primerjava rangov `{todo:0, in_progress:1, done:2}` za `status`, ter kronološka primerjava veljavnih datumov za `dueDate` (pri podanem formatu enakovredna leksikografski primerjavi). Ta pravila veljajo tudi za sekundarni ključ. `Cd(k,d,a,b) = Ck(a,b) × (d = asc ? 1 : −1)`.

Naj bo `i(a)` indeks opravila v `A`. Projekcija `P(A,S)` pri `p = original` ohrani celotno zaporedje `A` ne glede na `dp,s,ds`. Sicer primerja po naslednjem pravilu:

1. Če `Cd(p,dp,a,b) ≠ 0`, uporabi ta rezultat.
2. Sicer, če `s ≠ none` in `Cd(s,ds,a,b) ≠ 0`, uporabi sekundarni rezultat.
3. Sicer uporabi `i(a) − i(b)`; te zadnje primerjave smeri ne obračajo.

Zato `C_p(a,b)=0 ∧ (s=none ∨ C_s(a,b)=0) ∧ i(a)<i(b) ⇒ pos_P(a)<pos_P(b)`. Enak sekundarni ključ ne uvede dodatnega obrata. Izhodno polje se nikoli kot celota ne obrne za izvedbo `desc`.

Za vsak vhodni ID velja `count(P,id)=count(A,id)=1`, `length(P)=length(A)` in `fields_after(id)=fields_before(id)`. Vhodno polje ohrani svoje zaporedje; polja, pripadnosti in števila po statusih se ne spremenijo. Število zapisovalnih API zahtevkov zaradi razvrščanja je 0.

Za vsak status `k` je zaporedje ID-jev stolpca table natanko `ids(filter(P(A,S), status=k))`. Stolpci ostanejo `todo`, `in_progress`, `done`, ne glede na izbrani ključ ali smer.

### Sprejemni pogoji in načini preverjanja

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vse štiri začetne vrednosti so `S0`; preglednica ohrani celoten vhodni vrstni red. | Začetne vrednosti kontrol in ID-ji poljubno preurejenega vhoda; D01 ter S01. |
| R02 | Naslovi in odgovorne osebe uporabljajo natančno `N` in UTF-16 primerjavo. | S02: naglasi, sestavljeni/razstavljeni Unicode, velikost črk, ločila, številke v nizih; oba ključa in obe smeri. |
| R03 | Statusi sledijo rangom, datumi kronologiji. | S03: vsi statusi, različna leta/meseci/dnevi in enaki datumi v obeh smereh. |
| R04 | Smer spremeni le izid primerjave ključa; izenačenja ostanejo stabilna. | S04: izenačeni nizi/statusi/datumi v `asc` in `desc`; primerjava pričakovanih ID-jev. |
| R05 | Sekundarni ključ deluje samo pri primarni enakosti, z neodvisno smerjo; `none` ne primerja. | S05: vse dovoljene sekundarne vrednosti, kombinacije smeri, primarno enaki in neenaki pari; D02. |
| R06 | Popolna izenačenja sledijo vhodu; enaka ključa sta dovoljena; `original` preglasi ostale nastavitve. | S06: nasprotni smeri enakega ključa, oba enaka rezultata, `original` z neprivzetimi preostalimi kontrolami. |
| R07 | Tabla uporablja relativni vrstni red iste projekcije; trije stolpci ostanejo stalni. | S07: primerjaj vsak stolpec s filtriranimi ID-ji preglednice za več nastavitev; D03. |
| R08 | Pogled in podrobnosti ohranijo vse štiri nastavitve ter vrstni red. | S08: spremeni vse štiri kontrole, preklopi v oba pogleda, odpri in zapri podrobnosti. |
| R09 | Drug projekt in osvežitev vrneta vse štiri kontrole na `S0`; stanje ni shranjeno ali v URL-ju. | S09: projekt A → B → A, osvežitev z neprivzetimi nastavitvami, pregled URL-ja in shrambe. |
| R10 | Gumb ponastavi vse štiri kontrole; 0 in 1 opravilo delujeta pri vseh ključih in smereh. | S10: ponastavitev vseh nastavitev; vse kombinacije kontrol na praznem in enoelementnem projektu v obeh pogledih; D04 delno. |
| R11 | Projekcija ne mutira vhoda, opravil, pripadnosti ali števil in ne zapisuje na API. | S11: zamrznjen vhod/posnetek podatkov, nespremenjeni povzetki ter zajem zapisovalnih zahtevkov; D04 delno. |
| R12 | Vsi ID-ji so prikazani natanko enkrat in odprejo prave podrobnosti; ostale funkcije in Folio ostanejo delujoči. | S12: >10 drugih ID-jev, enaki naslovi, podrobnosti po ID, skupne regresije in oba pogleda pri 390 px. |

Ohranimo `data-task-id` na vrsticah in karticah, dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj povezave opravila. Pri 390 px velja `document.documentElement.scrollWidth ≤ window.innerWidth`; notranje drsenje preglednice in table je dovoljeno. Fokus ostane viden, navigacija in branje dolgih besedil delujeta skladno z obstoječim Folio.

## Uporabniški scenariji in merilo uspeha

Scenariji S01–S12 v zgornji tabeli določajo skupine preverjanj, ne dodatnih zahtev ali že izvedenih testov. Tipičen potek: uporabnik razvrsti po statusu naraščajoče in datumu padajoče, preklopi na tablo, odpre podrobnosti opravila ter jih zapre; kontrole in relativni vrstni red ostanejo enaki. Menjava projekta ali gumb za izvorni vrstni red vrneta `S0`.

Primeri so le priče splošnih pravil: `Žan` in `ZAN` sta po normalizaciji izenačena; `Naloga 10` je pred `Naloga 2` po leksikografskem pravilu. Izvedba ni vezana na te vrednosti ali ID-je razvojnih testov. Uspeh pomeni izpolnitev vseh R01–R12 za opisano domeno in ohranitev izhodiščnih bralnih funkcij. Dokazila lahko potrjujejo le dejansko izvedene scenarije.

## Izvedba in sledljivost

Izvedba in preverjanja so zaključeni. Celotna tabela R01–R12 → pogoj → izvedeni test → datoteka/del kode → izid in dokaz je v [verification.md](../verification.md#sledljivost-r01r12), skladno z možnostjo povezav v skupni predlogi. `npm run check` je končal z izhodnim statusom 0: lint, tipi, gradnja in 60 testov (38 osnovnih, 8 razvojnih P04, 14 lastnih). [Celoten dnevnik](check.log) in [vizualna dokazila](../verification.md) omogočajo preverjanje izvora rezultatov.

## Odprta vprašanja in omejitve

Bistvenih odprtih vprašanj ni. Razporeditev kontrol in nenavedena besedila prilagodimo Folio. Podatkovne predpostavke in omejitve so prevzete iz izvornih navodil, ne iz posameznega testnega nabora. Testni pomočniki in `/__test/` ostanejo izključno v testih; aplikacija jih ne uporablja. Končni testi niso dostopni in jih ne bomo označili za opravljene. Dostopna preverjanja so uspešna; omejitve in natančen obseg dokazil so zapisani v [verification.md](../verification.md#omejitve-in-predaja).

## Zgodovina sprememb

- 2026-09-23, 1.0: začetna specifikacija vseh R01–R12, predikati, spremembe stanja, scenariji in začetna sledljivost; brez implementacije.

- 2026-09-23, 1.1: implementacija zaključena; začetno tabelo neizvedenih scenarijev nadomešča povezava na dejansko sledljivost in dokaze v verification.md. Zahteve in predikati ostajajo enaki.
