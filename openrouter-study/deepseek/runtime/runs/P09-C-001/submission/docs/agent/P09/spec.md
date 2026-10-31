# P09 — Specifikacija: Stanje pogleda v povezavi in zgodovini

Različica 1.0 · 2026-10-31 · Izvor zahtev: `task/instructions.md` (R01–R12) · Skupna predloga: `task/specification-template.md`

Ta specifikacija sledi skupni predlogi P09. Projektna pravila so v `.specify/memory/constitution.md`, potrjeni dizajn v `docs/dizajn.md`; izvedbeni načrt in dokazila se dopolnita v `plan.md` in `tasks.md`. Izvirne zahteve iz `task/instructions.md` ostajajo merilo.

## Problem in kontekst

Uporabnik želi pogled seznama opravil (preglednica ali tabla) deliti in obnoviti prek povezave: iskanje, stanje in vrstni red naj bodo zapisani v query delu URL fragmenta obstoječe poti projekta ali opravila. Brskalniška Nazaj/Naprej in osvežitev naj obnovijo isto potrjeno stanje; nepotrjen osnutek kontrol pa se ne sme odraziti v URL-ju ali prikazu. Začetna aplikacija Folio tega še ne omogoča; pogled je treba povezati z URL fragmentom brez sprememb podatkov, strežnika ali infrastrukture.

## Vhodi, dejanja in izidi

- Vhodi: javni API `/api/` (projekti, opravila; tipi in polja kot v izhodišču), URL fragment s parametri `q`, `status`, `order` in obstoječim `view` (table/board), uporabniški vnos v tri kontrole.
- Dovoljena dejanja: urejanje osnutka kontrol; potrditev "Uporabi pogled"; "Ponastavi pogled"; preklop Preglednica/Tabla; odpiranje in zapiranje podrobnosti; prehod na drug projekt; brskalniška Nazaj/Naprej; osvežitev; odprtje povezave s parametri.
- Izid po uspehu: prikaz in URL odražata potrjeno stanje; osnutek je enak potrjenemu; števec kaže "Prikazano: N od M."; prazen rezultat pokaže "Ni zadetkov.".
- Preklic in navigacija: nepotrjen osnutek se zavrže ob vsaki navigaciji; potrjeno stanje in način pogleda ostaneta.
- Napake: neznane vrednosti parametrov niso napaka — uporabijo se privzete vrednosti; neznani parametri ne vplivajo na prikaz; aplikacija ne uporablja testnih kontrol `/__test/` in ne piše podatkov.

## Zahteve in pravila

Predikati in pravila spremembe stanja: P(x) = x po normalizaciji (obrez zunanjih belin, NFD, odstranitev znakov U+0300–U+036F, male črke). P(q) je iskalna fraza; opravilo je zadetek, če je P(q) podniz P(title), P(description), P(assignee) ali P(id). Potrjeno stanje S = (q, status, order, view). Pravilo potrditve: če se S s potrditvijo ("Uporabi pogled" ali "Ponastavi pogled") spremeni, nastane natanko eno novo zgodovinsko stanje; če je S nespremenjen, se zgodovina ne spremeni. Osnutek je ločen od S in se ob navigaciji zavrže.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob odprtju povezave do projekta/opravila se S prebere iz `q`, `status`, `order` v query delu fragmenta; privzeto q prazen, status `all`, order `original`; stanje se uporabi brez dodatnega klika. | Neposredna povezava: vsi parametri, brez parametrov, delni parametri. |
| R02 | Iskanje po P(q): ena dobesedna fraza, brez delitve v besede, ni regularni izraz; zadetek, če je P(q) podniz vsaj enega od polj title/description/assignee/id. | Normalizacija (belina, NFD, Unicode, velikost črk), fraza z ločili in več besedami. |
| R03 | `status` ∈ {all, todo, in_progress, done}, z q se veže po IN; `order` ∈ {original, title-asc, title-desc}; naslovi se primerjajo po P v UTF-16; ob izenačenju ostane izvorni vrstni red. | Kombinacije q+status; obe smeri urejanja; enaki naslovi; različna izvorna zaporedja. |
| R04 | Neznan `status`/`order` → privzeta vrednost; pri ponovljenem parametru velja prva pojavitev; neznani parametri ne vplivajo na prikaz; razčlenjevanje ne prepiše URL-ja. | Neznane in podvojene vrednosti; neznani parametri; opazovanje URL-ja ob branju. |
| R05 | Urejanje kontrol spreminja le osnutek; prikaz in URL se ne spremenita. "Uporabi pogled" potrdi vse tri vrednosti hkrati; ob spremembi S nastane eno novo zgodovinsko stanje. | Osnutek ne vpliva na prikaz/URL; ena potrditev = en vnos v zgodovini. |
| R06 | Ob potrditvi: q obrezan; privzeti parametri izpuščeni; ostali URL-kodirani; obstoječi `view=board` ohranjen; neznani parametri odstranjeni; ponovitev enake potrditve ne doda stanja. | URL po potrditvi; kodiranje; ohranitev view; idempotentna potrditev. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, prikaz in osnutek; osvežitev ohrani potrjeno stanje iz URL-ja. | Zaporedje potrditev z Nazaj/Naprej; osvežitev strani. |
| R08 | Preklop Preglednica/Tabla ohrani S in prikaže iste ID-je; nepotrjen osnutek se zavrže ob navigaciji. | ID-ji pred/po preklopu; parametri v URL-ju; zavržen osnutek. |
| R09 | Odpiranje podrobnosti in zapiranje (gumb ali Escape) ohranita S in način pogleda; povezava zadene pravi ID tudi pri enakih naslovih. | Odpri/zapri; Escape; enaki naslovi; ciljni ID. |
| R10 | Klik na drug projekt začne njegov privzeti pregled (q prazen, status all, order original) in ohrani table/board; neposredna povezava do drugega projekta s parametri jih upošteva. | Prehod med projekti; ohranitev načina; neposredna povezava s parametri. |
| R11 | "Ponastavi pogled" počisti tri filtre in osnutek ter posodobi zgodovino po pravilu potrditve; obdrži trenutni način pogleda; prazen rezultat: "Ni zadetkov."; števec: "Prikazano: N od M.". | Ponastavitev; zgodovina; način pogleda; prazno stanje; števec. |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API; stanje ni v localStorage; obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv Folio delujejo naprej. | Opazovanje omrežnih klicev (brez zapisov); odsotnost localStorage; regresijski scenariji. |

Dogovor o vmesniku (povzeto po izvirnih zahtevah): input type=search z oznako "Iskanje v povezavi"; select "Stanje v povezavi" (all/todo/in_progress/done); select "Vrstni red v povezavi" (original/title-asc/title-desc); gumba "Uporabi pogled" in "Ponastavi pogled"; role=status, aria-label="Rezultati povezave", besedilo "Prikazano: N od M."; primer: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`; vrstni red parametrov ni predpisan. Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu so zunaj njegove povezave; pri širini 390 pik se cela stran ne razširi (notranje drsenje je dovoljeno). Razporeditev novih kontrol in nepredpisana besedila so svobodni znotraj Folio dizajna.

## Izvedba in sledljivost

Tabela je dopolnjena po izvedbi (2026-10-31). Izida se ne označi kot uspešnega brez dejanskega preverjanja; neizvedeni testi so navedeni kot neizvedeni. Podrobna sledljivost po zahtevah je v `docs/agent/verification.md`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Pogoji iz tabele zahtev | Lastni testi A01–A14 (`tests/agent/p09.spec.ts`), razvojni testi D01–D04, osnovni testi izhodišča | `src/viewState.ts`, `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` | Uspešno: `npm run check`, 60/60; podrobnosti v `docs/agent/verification.md` |

## Odprta vprašanja in omejitve

- Dodatne zunanje meritve ali funkcionalne zahteve se ne dodajajo; merilo so R01–R12.
- Navigacije med nezaključenim nalaganjem in sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kjer zahteva določa URL; brez trajne shrambe (localStorage) in brez novih zapisovalnih API-jev.
- Testni podatki so lahko poljubni v okviru opisane domene (0, 1 ali več opravil, enaki naslovi, Unicode, različna zaporedja); končni primeri niso omejeni na razvojne primere.
