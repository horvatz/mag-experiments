# P09 — Stanje pogleda v povezavi in zgodovini

Status: specifikacija pred implementacijo. Različica 1.0, 2026-09-26.

## Problem in kontekst

Uporabnik želi deliti in ponovno odpreti isti pregled opravil ter se med potrjenimi pogledi premikati z zgodovino brskalnika. Začetni Folio ima projekte, preglednico, tablo in podrobnosti opravila; fragment URL-ja določa projekt, opravilo in `view=board`. Filtri in vrstni red iz povezave še niso izvedeni.

Dodamo iskanje, stanje in vrstni red z ločenim osnutkom ter skupno potrditvijo. Ohranjamo [dizajn Folio](../../dizajn.md), obstoječo navigacijo, dostopnost in prikaz pri nalaganju ali napaki. Merodajni so [izvirni R01–R12](../../../task/instructions.md), [projektna pravila](../../../PROJECT_RULES.md) in [projektna načela](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md).

## Vhodi, dejanja in izidi

- Podatki: `Project { id, name }` in `Task { id, projectId, title, description, status, assignee, dueDate }` iz obstoječega javnega `/api/`. ID je identiteta; naslovi niso nujno enolični. Veljajo poljubno število opravil, prazni projekti, Unicode, ločila, poljubni enkratni ID-ji, izvorno zaporedje API-ja in veljavni datumi.
- Poti ostanejo `#/projects/{projectId}` in `#/projects/{projectId}/tasks/{taskId}`; parametri so v query delu fragmenta. `view=board` izbere tablo, sicer preglednico. Primer: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`.
- Potrjeno stanje `C=(q,status,order)` izhaja iz URL-ja. Osnutek `D` je vrednost treh kontrol. Privzeto `C₀=("",all,original)`.
- Iskanje je `input type=search` z oznako **Iskanje v povezavi**. Select **Stanje v povezavi** ima vrednosti `all/todo/in_progress/done`; select **Vrstni red v povezavi** ima `original/title-asc/title-desc`.
- **Uporabi pogled** potrdi vse tri kontrole skupaj; **Ponastavi pogled** nastavi `C₀` in počisti osnutek. Branje povezave, zgodovina in navigacija obnovijo kontrole iz potrjenega stanja.
- Rezultat ima `role=status`, `aria-label="Rezultati povezave"` in besedilo **Prikazano: N od M.**, kjer je N število ujemajočih se opravil in M vseh opravil trenutnega projekta. Ko je N=0, se prikaže **Ni zadetkov.**
- Uspeh: oba pogleda kažeta iste izbrane ID-je, URL predstavlja potrjeni pogled. Preklic osnutka: vsaka navigacija ga zavrže. Zapiranje podrobnosti z gumbom ali Escape ohrani potrjeni pogled. Neznane vrednosti parametrov uporabijo privzeto vrednost; neveljavna pot ter nalaganje in napake API-ja ohranijo obstoječo obravnavo.

## Zahteve in pravila

### Predikati in spremembe stanja

Naj bo `T` zaporedje opravil trenutnega projekta v vrstnem redu API-ja, `i(t)` izvorni indeks in `F={title,description,assignee,id}`. Funkcija `n(s)` pomeni `trim(s)`, nato Unicode NFD, odstranitev znakov U+0300–U+036F in pretvorbo v male črke.

`match(t,C) = (C.status=all ∨ t.status=C.status) ∧ (∃f∈F: n(t[f]) vsebuje n(C.q))`.

Vsebovanje je dobesedno iskanje ene fraze; prazna fraza se ujema z vsakim opravilom. Ni regularnih izrazov ali deljenja v besede. Rezultat `V(T,C)` najprej filtrira z `match` in nato ureja:

- `original`: izvorni indeks `i(t)`;
- `title-asc`: `n(title)` naraščajoče po UTF-16;
- `title-desc`: `n(title)` padajoče po UTF-16;
- pri enakih normaliziranih naslovih v obeh smereh ostane naraščajoči `i(t)`; ni lokaliziranega primerjanja.

`parse(U)` uporabi prvo pojavitev vsakega parametra; odsoten q pomeni prazen niz, neznan/odsoten status pomeni all, neznan/odsoten order pomeni original. Neznani parametri ne vplivajo na prikaz. Samo branje `U` nikoli ne spremeni URL-ja ali zgodovine.

`canonical(C)` obreže q in ohrani dovoljeni status/order. `serialize` URL-kodira neprivzete vrednosti q/status/order, privzete izpusti, ohrani `view=board` in odstrani neznane parametre. Vrstni red parametrov ni del sprejemnega pogoja.

| Dogodek | Pravilo prehoda |
| --- | --- |
| Urejanje kontrole | Spremeni samo D; C, V in URL ostanejo isti. |
| Uporabi pogled | `C′=canonical(D)`, `D′=C′`; sprememba potrjenega trojčka ustvari natanko en nov zgodovinski vnos. Enaka ponovitev ne ustvari vnosa. URL se uskladi s serializacijo. |
| Ponastavi pogled | Ista pravila kot potrditev s `D=C₀`; počisti tudi nepotrjeni osnutek in ohrani način pogleda. |
| Nazaj / Naprej / osvežitev / neposredna povezava | `C′=parse(U′)`, `D′=C′`, prikaz `V(T,C′)`, brez dodatne potrditve. |
| Preglednica ↔ Tabla | Ohrani C, spremeni način pogleda, zavrže D in obnovi D iz C; množica prikazanih ID-jev ostane ista. Tabla razporedi izbrana opravila v obstoječe stolpce. |
| Odpri / zapri podrobnosti | Spremeni pot opravila/projekta, ohrani C in način pogleda; uporabi ID, zavrže D. Neposredna pot opravila upošteva query parametre. |
| Klik na drugi projekt | Izbere drugi projekt, `C′=D′=C₀`, ohrani način pogleda. |
| Neposredna povezava do drugega projekta | Izbere drugi projekt in uporabi parametre povezave. |

Pri potrditvi, ki samo očisti neznane ali privzete parametre brez spremembe potrjenega stanja, se URL lahko uskladi z zamenjavo trenutnega vnosa; novega zgodovinskega vnosa ni. To združuje R05 (vnos ob spremembi stanja) in R06 (kanoničen URL ob potrditvi).

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | q/status/order v fragmentu projekta ali opravila se uporabijo ob odprtju; brez njih velja C₀. | S01: neposredni povezavi do projekta in opravila, privzeti URL. |
| R02 | Velja predikat match po štirih poljih, z natančno določeno normalizacijo in eno dobesedno frazo. | S02: različen zapis diakritike, velikost črk, zunanje beline, ID, opis, oseba, ločila in večbesedna fraza. |
| R03 | Status in q delujeta po IN; vsi trije vrstni redi imajo določeno UTF-16 primerjavo in stabilne izenačitve. | S03: kombinacije statusa in iskanja, obe smeri, enaki normalizirani naslovi in izvorni red. |
| R04 | Prva pojavitev zmaga; neveljavna status/order sta privzeta; neznani parametri so prezrti brez prepisovanja URL-ja ob branju. | S04: podvojeni in neznani parametri, preverba prikaza in nespremenjenega fragmenta. |
| R05 | Urejanje treh kontrol spremeni samo osnutek; potrditev vseh skupaj doda natanko en vnos samo ob spremembi stanja. | S05: prikaz/URL pred potrditvijo, po njej in en korak Nazaj. |
| R06 | Potrditev obreže q, izpusti privzete vrednosti, pravilno kodira in ohrani board; odstrani neznane parametre; ponovitev je brez novega vnosa. | S06: Unicode, &, +, ?, #, privzete vrednosti, board, ponovljena potrditev in zgodovina. |
| R07 | Nazaj/Naprej obnovita C, D in prikaz; osvežitev ponovno prebere URL. | S07: dve različni potrditvi, urejen osnutek, Nazaj/Naprej in reload. |
| R08 | Preklop pogledov ohrani C in množico ID-jev, navigacija zavrže nepotrjeni D. | S08: oba pogleda z aktivnimi filtri in osnutkom. |
| R09 | Podrobnosti in oba načina zapiranja ohranijo C in pogled, izberejo pravi ID pri enakih naslovih. | S09: vrstica/kartica, enaki naslovi, zapiranje z gumbom/Escape in neposredna povezava. |
| R10 | Klik drugega projekta ponastavi tri filtre in ohrani pogled; njegova neposredna povezava uporabi lastne parametre. | S10: oba načina pogleda, prehod med projektoma in direkten URL. |
| R11 | Ponastavitev počisti C/D z enakim pravilom zgodovine kot potrditev in ohrani pogled; števec je N od M; N=0 pokaže zahtevano besedilo. | S11: aktivni filtri, samo osnutek, ponovitev reset, nič zadetkov in prazen projekt. |
| R12 | Vsa dejanja berejo le javni API, ne zapisujejo podatkov ali localStorage; obstoječe poti, nalaganje, podrobnosti in Folio delujejo. | S12: spremljanje zahtev in shrambe, skupne regresije, širina 390 pik in dostopna imena. |

Ohranijo se `data-task-id` na vrsticah in karticah, imena obstoječih pogledov/stolpcev in `aria-label="Pregled stanj opravil"`. Morebitna nova dejanja ob opravilu morajo biti zunaj njegove povezave. Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice/table je dovoljeno. Razpored novih kontrol uporablja obstoječi Folio; dodatna besedila niso predpisana.

## Uporabniški scenariji in merilo uspeha

1. Uporabnik odpre deljeno povezavo s frazo, stanjem in urejanjem. Brez klika vidi ustrezna opravila; iste rezultate vidi po osvežitvi ter v preglednici in na tabli (S01–S04, S08).
2. Uredi vse tri kontrole, potrdi, nato uredi še nepotrjeni osnutek. Nazaj in Naprej obnovita potrjene poglede in kontrole; ponovna potrditev istega pogleda ne doda koraka zgodovine (S05–S07).
3. Odpre pravilno opravilo med enakimi naslovi, zapre podrobnosti, zamenja projekt in ponastavi pogled. Parametri se prenašajo ali ponastavljajo po zgornjih pravilih (S09–S11).
4. Ista dejanja delujejo pri praznem in večjem projektu ter na ozkem zaslonu brez podatkovnih zapisov in brez regresij osnovnega Folia (S12).

Uspeh pomeni izpolnitev vseh R01–R12 na opisani domeni podatkov. Razvojni primeri so dokaz za njihove scenarije, ne omejitev domene ali dokaz izvedbe nedostopnih končnih testov.

## Izvedba in sledljivost

Spodaj so načrtovani scenariji, ne izvedeni testi. Stolpec kode kaže obstoječo integracijsko točko; natančne povezave in dokazila se dopolnijo ob implementaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | parse in C₀ | S01 | `src/navigation.ts`: useRoute; `src/App.tsx`: ProjectView | Ni izvedeno. |
| R02 | match in n | S02 | `src/App.tsx`: izbor opravil; nova logika še ni izvedena | Ni izvedeno. |
| R03 | filter in stabilen vrstni red | S03 | `src/App.tsx`: izbor opravil; nova logika še ni izvedena | Ni izvedeno. |
| R04 | branje brez zapisovanja | S04 | `src/navigation.ts`: useRoute | Ni izvedeno. |
| R05 | ločitev D/C, en vnos | S05 | `src/App.tsx`: ProjectView; nove kontrole še niso izvedene | Ni izvedeno. |
| R06 | canonical/serialize | S06 | `src/navigation.ts`: sestavljanje URL-jev | Ni izvedeno. |
| R07 | obnova C/D | S07 | `src/navigation.ts`: naročanje na navigacijo; `src/App.tsx` | Ni izvedeno. |
| R08 | isti ID-ji in zavržen D | S08 | `src/App.tsx`: view-switch; `src/TaskBoard.tsx` | Ni izvedeno. |
| R09 | identiteta in ohranitev C | S09 | `src/TaskDetails.tsx`: close; povezave v App/TaskBoard | Ni izvedeno. |
| R10 | drugi projekt | S10 | `src/App.tsx`: project-nav | Ni izvedeno. |
| R11 | reset, N/M, prazen rezultat | S11 | `src/App.tsx`: ProjectView; nove kontrole še niso izvedene | Ni izvedeno. |
| R12 | regresije in brez zapisov | S12 | `src/api.ts`, obstoječi prikazi, `src/styles.css` | Ni izvedeno. |

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj za specifikacijo ni. Pot funkcionalnosti je uporabnik določil kot `docs/agent/P09`.
- Novo stanje ne spreminja podatkov; ni novih API-jev, odvisnosti ali sprememb strežnika, skupnih tipov, nastavitev in skupnih testov.
- Navigacije med nezaključenim nalaganjem ter sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Natančna razporeditev kontrol in dodatna besedila ostanejo izvedbena izbira znotraj potrjenega Folia. Vrstni red URL-parametrov ni predpisan.
- V tej fazi ni bilo implementacije ali izvedbe funkcionalnih testov. Končni testi niso dostopni; vsi rezultati ostajajo nepreverjeni.

## Zgodovina sprememb

- 2026-09-26, 1.0: začetna specifikacija vseh R01–R12, predikati, prehodi stanja, scenariji in začetna sledljivost; pripravljeno z lokalno veščino speckit-specify.
