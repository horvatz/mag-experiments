# P09 — Stanje pogleda v povezavi in zgodovini

Specifikacija po skupni predlogi (`task/specification-template.md`); izvirne zahteve
R01–R12 iz `task/instructions.md` so merilo.

## Problem in kontekst

Uporabnik želi stanje pregleda opravil (iskanje, stanje, vrstni red) deliti in obnoviti
prek povezave ter uporabljati zgodovino brskalnika. Začetni Folio že omogoča preglednico
in tablo, podrobnosti opravil ter izbiro projekta, stanja pogleda pa še ne shranjuje v URL.

Predvidena sprememba: stanje pregleda se določi s parametri q, status in order v query
delu URL fragmenta za obstoječo pot projekta ali opravila; potrjuje se z gumbom
Uporabi pogled; navigacija obnavlja potrjeno stanje. Potrjeni dizajn Folio iz
`docs/dizajn.md` se ohrani.

## Vhodi, dejanja in izidi

**Podatki.** Aplikacija bere izključno javni API `/api/` (samo branje). Vsako opravilo
pripada svojemu projektu in ima polja izhodišča: `id`, `title`, `description`,
`assignee`, `status`, `dueDate`. Testi lahko vrnejo poljubno število opravil (tudi nič,
eno, več kot deset), enolične ID-je, enake naslove, različen vrstni red in veljavne
koledarske datume; projekta sta lahko prazna; besedila so navadno besedilo z Unicode
znaki in ločili; imena odgovornih oseb so neprazna in različna od rezervirane vrednosti
`all`. Aplikacija ne uporablja testnih kontrol `/__test/` niti testnih podatkov.

**Kontrole.** Iskanje: `input type="search"`, oznaka "Iskanje v povezavi". Stanje:
`select` "Stanje v povezavi" (all/todo/in_progress/done). Vrstni red: `select`
"Vrstni red v povezavi" (original/title-asc/title-desc). Gumba "Uporabi pogled" in
"Ponastavi pogled". Rezultati: `role="status"`, `aria-label="Rezultati povezave"`,
besedilo "Prikazano: N od M.". Primer povezave:
`#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`; vrstni red
URL-parametrov ni predpisan. Ohranijo se `data-task-id` na vrsticah in karticah,
dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`;
nova dejanja ob opravilu so zunaj njegove povezave; na širini 390 pik se stran ne
razširi (notranje drsenje je dovoljeno).

**Dejanja in izidi.** Urejanje kontrol ustvari osnutek; "Uporabi pogled" potrdi vse tri
vrednosti hkrati; "Ponastavi pogled" počisti filtre in osnutek; preklop Preglednica/Tabla,
odpiranje/zaprtje podrobnosti, klik na drug projekt ter Nazaj/Naprej so navigacije.
Po potrditvi se prikažejo samo opravila, ki zadoščajo potrjenim filtrom, v potrjenem
vrstnem redu. Ob praznem rezultatu se prikaže "Ni zadetkov.". Ob napaki branja velja
obstoječe vedenje (nalaganje/napaka s ponovnim poskusom). Nobeno dejanje ne piše
podatkov in ne uporablja `localStorage`; nepotrjen osnutek se ob navigaciji zavrže.

## Zahteve in pravila

### Simboli in predpostavke

- `U` — URL fragment: pot `p` (projekt ali opravilo) in query parametri.
- `q`, `status`, `order` — potrjene vrednosti iz `U`; `qd`, `statusd`, `orderd` — osnutek v kontrolah.
- `D` — trenutni projekt; `T(D)` — njegova opravila; `M = |T(D)|`.
- `norm(x)` — NFD razčlenitev, odstranitev znakov U+0300–U+036F, male črke. Za `q` se
  pred normalizacijo odstranijo zunanje beline: `norm(trim(q))`.
- `podniz(a, b)` — `a` je podniz `b`.
- `P(t)` ⇔ `norm(q) = ""` ali je `norm(q)` podniz enega od `norm(title)`,
  `norm(description)`, `norm(assignee)`, `norm(id)` opravila `t`.
- `F(t)` ⇔ `P(t)` in (`status = all` ali `t.status = status`).
- `R` — seznam `[t ∈ T(D) : F(t)]`, urejen po `order`: `original` ohrani izvorni vrstni
  red; `title-asc`/`title-desc` primerjata `norm(title)` v UTF-16 naraščajoče/padajoče;
  ob izenačenju ostane izvorni vrstni red.
- Privzete vrednosti: `q = ""`, `status = all`, `order = original`. Veljavni statusi:
  all/todo/in_progress/done; veljavni vrstni redi: original/title-asc/title-desc.
- Predpostavke: razčlenitev URL-ja ne prepiše `U`; neznani parametri ne vplivajo na
  prikaz; stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kar določa `U`.

### Pravila sprememb stanja

1. **Razčlenitev U** (ob odprtju, osvežitvi, navigaciji): `q` := prva pojavitev parametra
   `q`, sicer `""`; `status` := prva pojavitev, če je veljavna, sicer `all`; `order` :=
   prva pojavitev, če je veljaven, sicer `original`. Neznani parametri se ignorirajo.
   Prikaz := `R`; osnutek := potrjeno.
2. **Urejanje osnutka**: sprememba kontrole spremeni le `(qd, statusd, orderd)`;
   `q/status/order`, `U` in prikaz ostanejo nespremenjeni.
3. **Potrditev** (Uporabi pogled): `qc := trim(qd)`, `statusc := statusd`,
   `orderc := orderd`. Če je `(qc, statusc, orderc) = (q, status, order)`, se `U` in
   zgodovina ne spremenita. Sicer `Uc` := pot `p` + `view` + `qc/statusc/orderc`,
   pri čemer se privzete vrednosti izpustijo, obstoječi `view=board` ohrani, neznani
   parametri odstranijo, vrednosti URL-kodirajo; doda se eno novo zgodovinsko stanje
   (push); potrjeno := osnutek; prikaz := `R`.
4. **Ponastavitev** (Ponastavi pogled): `(qd, statusd, orderd) := ("", all, original)` in
   se uporabi pravilo 3; način pogleda se ohrani.
5. **Navigacija** (Nazaj/Naprej, osvežitev, preklop Preglednica/Tabla, odprtje/zaprtje
   podrobnosti): velja pravilo 1; nepotrjen osnutek se zavrže. Preklop pogleda in
   odpiranje/zapiranje podrobnosti ohranita potrjene parametre in ne dodata novega
   zgodovinskega stanja za filtre.
6. **Klik na drug projekt**: `Un` := pot novega projekta z ohranjenim načinom pogleda,
   brez `q/status/order` (privzeto). Neposredna povezava do drugega projekta s parametri
   se upošteva po pravilu 1.

### Sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za pot `p` velja `(q, status, order) = razčleni(U)` s privzetimi vrednostmi; ob neposrednem odprtju je prikaz takoj `R`, brez dodatnega klika. | Playwright: neposredne povezave projekta/opravila s parametri in brez njih; primer iz navodil. |
| R02 | Za vsak `t` velja `P(t)` po definiciji (ena fraza; brez regularnih izrazov in delitve na besede). | Testi z belinami na robu, NFD/Unicode, ločili in iskanjem po `id`. |
| R03 | `F(t)` in urejanje `R` po `order`; naslov se primerja po `norm` v UTF-16, ob izenačenju izvorni vrstni red. | Testi kombinacije q+status (IN), enakih naslovov in obeh smeri. |
| R04 | Neznan `status`/`order` → privzeto; ponovljeni parameter → prva pojavitev; neznani parametri ne vplivajo; razčlenitev ne prepiše `U`. | Testi URL-jev z neznanimi, ponovljenimi in mešanimi parametri. |
| R05 | Urejanje kontrol spremeni le osnutek; potrditev je atomska za vse tri vrednosti in doda največ eno zgodovinsko stanje. | Playwright: osnutek ne spremeni prikaza/URL-ja; ena vstopnica po potrditvi. |
| R06 | Potrditev obreže `q`, izpusti privzete parametre, URL-kodira preostale, ohrani `view=board`, odstrani neznane parametre; enaka potrditev ne doda stanja. | Playwright: primerjava URL-ja in dolžine zgodovine pred/po. |
| R07 | Nazaj/Naprej obnovita potrjene filtre, prikaz in osnutek; osvežitev obdrži stanje iz `U`. | Playwright: back/forward/reload. |
| R08 | Preklop pogleda ohrani parametre in iste ID-je; nepotrjen osnutek se ob navigaciji zavrže. | Playwright: preklop po osnutku; primerjava ID-jev. |
| R09 | Odprtje/zaprtje podrobnosti (gumb, Escape) ohranita parametre in način pogleda; povezava do pravega `id` deluje tudi pri enakih naslovih. | Playwright: enaki naslovi, klik po `data-task-id`. |
| R10 | Klik na drug projekt začne privzeti pregled in ohrani način pogleda; neposredna povezava s parametri se upošteva. | Playwright: menjava projekta v obeh scenarijih. |
| R11 | Ponastavitev počisti filtre in osnutek po pravilu 3 ter ohrani način pogleda; ob praznem `R` se prikaže "Ni zadetkov.", števec "Prikazano: N od M." z `N = \|R\|`, `M = \|T(D)\|`. | Playwright: prazni rezultati, števec pred/po filtrih. |
| R12 | Nobeno dejanje ne pošlje zapisa in ne uporablja `localStorage`; obstoječe vedenje (neznana pot, nalaganje, podrobnosti, Folio videz, 390 px) deluje naprej. | Mrežni nadzor (samo GET /api/), obstoječi skupni testi in Playwright. |

## Izvedba in sledljivost

Koda in lastni testi v fazi specifikacije še ne obstajajo; vrstice se dopolnijo med
izvedbo. Neizvedenih izidov se ne označuje kot uspešnih.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | pogoj R01 (zgoraj) | načrtovan (plan.md/tasks.md) | določi se v plan.md | ni še izvedeno (faza specifikacije) |
| R02 | pogoj R02 | načrtovan | določi se v plan.md | ni še izvedeno |
| R03 | pogoj R03 | načrtovan | določi se v plan.md | ni še izvedeno |
| R04 | pogoj R04 | načrtovan | določi se v plan.md | ni še izvedeno |
| R05 | pogoj R05 | načrtovan | določi se v plan.md | ni še izvedeno |
| R06 | pogoj R06 | načrtovan | določi se v plan.md | ni še izvedeno |
| R07 | pogoj R07 | načrtovan | določi se v plan.md | ni še izvedeno |
| R08 | pogoj R08 | načrtovan | določi se v plan.md | ni še izvedeno |
| R09 | pogoj R09 | načrtovan | določi se v plan.md | ni še izvedeno |
| R10 | pogoj R10 | načrtovan | določi se v plan.md | ni še izvedeno |
| R11 | pogoj R11 | načrtovan | določi se v plan.md | ni še izvedeno |
| R12 | pogoj R12 | načrtovan | določi se v plan.md | ni še izvedeno |

## Odprta vprašanja in omejitve

- Končni zunanji testi niso dostopni; vsi načini preverjanja so načrtovani in bodo
  izvedeni med izvedbo. Neizvedenih rezultatov ne označujemo kot uspešnih.
- Navigacije med nezaključenim nalaganjem in sočasne spremembe podatkov brez osvežitve
  niso v obsegu.
- Vrstni red URL-parametrov ni predpisan; besedilo in razporeditev novih kontrol (razen
  dogovorjenih oznak) nista predpisana.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kadar ga določa URL;
  `localStorage` se ne uporablja.
- Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne
  podatke opisane domene.

Zgodovina sprememb: 2026-11-02 — v0.1, prva različica specifikacije (vse R01–R12).
