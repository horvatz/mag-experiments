# Specifikacija P09: Stanje pogleda v povezavi in zgodovini

Vir zahtev: `task/instructions.md` (R01–R12), `PROJECT_RULES.md` in
`.specify/memory/constitution.md`. Ta dokument sledi skupni predlogi razvojne
specifikacije; izvedbene odločitve so v `docs/agent/P09/plan.md`, naloge v
`docs/agent/P09/tasks.md`.

## Problem in kontekst

Uporabnik želi pregled opravil projekta (iskanje po frazi, stanje, vrstni red)
deliti in obnoviti prek povezave: stanje naj bo zapisano v query delu URL
fragmenta, ob neposrednem odprtju pa se uporabi brez dodatnega klika. Zdaj
aplikacija pozna le `#/projects/<id>[/tasks/<taskId>]` in `view=table|board`;
opravila prikaže v izvornem vrstnem redu, brez iskanja in filtrov.

Predvidena sprememba: tri kontrole (iskanje, stanje, vrstni red) z gumbi
Uporabi pogled in Ponastavi pogled, potrjeno stanje izpeljano iz URL-ja,
filtriran in urejen prikaz v obstoječi preglednici in tabli, zgodovina
brskalnika za potrditve. Potrjeni videz Folio (`docs/dizajn.md`) in slovenska
poimenovanja se ohranijo; stanje je lokalno trenutnemu projektu, razen
potrjenih parametrov v URL-ju.

### Uporabniški scenariji

1. Odprem povezavo `#/projects/web?q=pregled&status=todo&order=title-desc` in
   takoj vidim filtriran, urejen pregled ter izpolnjene kontrole.
2. Vpišem frazo in izberem stanje, dokler ne pritisnem Uporabi pogled, se
   prikaz in URL ne spremenita; potrditev uveljavi vse tri vrednosti hkrati.
3. Z Nazaj/Naprej in osvežitvijo se obnovijo potrjeni filtri, prikaz in
   osnutek kontrol; nepotrjen osnutek se ob navigaciji zavrže.
4. Preklopim Preglednica/Tabla ali odprem podrobnosti; potrjeni parametri in
   način pogleda ostanejo.
5. S Ponastavi pogled počistim filtre; obdržim način pogleda, prikaz pokaže
   vse zadetke in števec.

## Vhodi, dejanja in izidi

**Podatki (nespremenjeni tipi iz `shared/types.ts`).** `Project{id, name}`,
`Task{id, projectId, title, description, status, assignee, dueDate}`. Opravila
se berejo prek javnega API-ja `/api/` (`/api/projects`,
`/api/projects/<id>/tasks`); izbira po `id`. Testi lahko vrnejo poljubno
število opravil (tudi nič), poljubne enkratne ID-je, enake naslove, različno
zaporedje in veljavne datume; projekta sta lahko prazna. Besedila so navadno
besedilo, tudi z Unicode znaki.

**Vhodni parametri URL fragmenta.** `q` (ena dobesedna fraza), `status`
(`all|todo|in_progress|done`), `order` (`original|title-asc|title-desc`),
`view` (`table|board`, obstoječi). Privzeto: `q` prazen, `status=all`,
`order=original`.

**Dejanja.** Odpri povezavo (projekt/opravilo); uredi osnutek kontrol; Uporabi
pogled; Ponastavi pogled; Nazaj/Naprej; osvežitev; preklop Preglednica/Tabla;
odpri/zapri podrobnosti (gumb ali Escape); klik na drug projekt.

**Izidi.** Po uspehu: prikaz vsebuje natanko zadetke `V` v izbranem vrstnem
redu, kontrole kažejo potrjeno stanje, števec `Prikazano: N od M.`, URL nosi
potrjene parametre. Ob potrditvi brez spremembe stanja se URL in zgodovina ne
spremenita. Ob napaki nalaganja ostane obstoječi prikaz napake s ponovnim
poskusom; neznana pot in manjkajoč projekt ostaneta nespremenjena. Preklic:
osnutek se zavrže ob vsaki navigaciji; filtriranje ne kliče strežnika.

### Vmesnik (dogovor)

- `input type=search`, oznaka **Iskanje v povezavi**; `select` **Stanje v
  povezavi** (`all/todo/in_progress/done`); `select` **Vrstni red v povezavi**
  (`original/title-asc/title-desc`).
- Gumba **Uporabi pogled** in **Ponastavi pogled**; `role=status`,
  `aria-label="Rezultati povezave"`, besedilo `Prikazano: N od M.`.
- Primer: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`;
  vrstni red parametrov ni predpisan.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena
  obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
  Nova dejanja ob opravilu so zunaj njegove povezave. Pri širini 390 pik se
  cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno.
  Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista
  predpisana.

## Pravila sprememb stanja

**Simbole in predpostavke.** Za besedilo `x`: `norm(x) = lower(odstrani
U+0300–U+036F iz NFD(trim(x)))`. `contains(a,b)` pomeni, da je `b` podniz
`a`. Naj bo `T` zaporedje opravil projekta, kot jih vrne API. Naj bo
`C = (q_c, status_c, order_c, view)` potrjeno stanje, izpeljano iz URL-ja, in
`D = (q_d, status_d, order_d)` osnutek v kontrolah.

**Splošna pravila** (veljajo za vse scenarije; posamezni testni primeri jih
samo izvajajo):

- **Zajem (R01, R04).** Ob vsaki spremembi URL-ja ali osvežitvi velja
  `C = parse(URL)`: prva pojava parametra, neznane vrednosti `status`/`order`
  → privzeto, neznani parametri se ignorirajo, razčlenjevanje samo ne piše v
  URL. `D := C`.
- **Ujemanje (R02).** `matches(t, q) = q = "" ∨ contains(norm(t.title),
  norm(q)) ∨ contains(norm(t.description), norm(q)) ∨
  contains(norm(t.assignee), norm(q)) ∨ contains(norm(t.id), norm(q))`.
  Fraza je dobesedna (brez regularnih izrazov, brez delitve v besede).
- **Pogoj (R03).** `keeps(t, C) = matches(t, q_c) ∧ (status_c = "all" ∨
  t.status = status_c)`; `V = filter(keeps, T)`, urejen po `order_c`:
  `original` = izvorni vrstni red; `title-asc|title-desc` = stabilna
  primerjava `norm(t.title)` po UTF-16 (ob izenačenju izvorni vrstni red).
- **Prikaz.** `N = |V|`, `M = |T|`; prikaz pokaže `V`, števec
  `Prikazano: N od M.`; ob `N = 0` sporočilo `Ni zadetkov.`
- **Potrditev (R05, R06).** Ob Uporabi pogled velja `Q = trim(q_d)` in
  `C' = (Q, status_d, order_d, view)`. Če se `(q, status, order)` razlikuje od
  `C`, se doda natanko eno novo zgodovinsko stanje z URL-jem, kjer so privzeti
  parametri izpuščeni (`Q = ""`, `status=all`, `order=original`), obstoječi
  `view=board` ostane, neznani parametri se odstranijo, vrednosti se
  URL-kodirajo; sicer se zgodovina ne spremeni. Nato `C := C'`, `D := C`.
- **Ponastavitev (R11).** `C' = ("", all, original, view)`; postopek
  zgodovine je enak potrditvi; `view` se obdrži.
- **Navigacija (R07, R08, R09, R10).** URL je vir resnice: ob Nazaj/Naprej,
  osvežitvi, neposredni povezavi in kliku na projekt velja `C = parse(URL)`,
  `D := C` (osnutek se zavrže). Preklop pogleda in odpiranje/zapiranje
  podrobnosti spreminjata le `view` oziroma `taskId`, potrjeni parametri
  ostanejo. Klik na drug projekt uporabi privzete parametre in ohrani
  `view`; neposredna povezava do drugega projekta s parametri jih upošteva.
- **Prepoved pisanja (R12).** Nobeno dejanje ne pošlje zapisa na API in ne
  shranjuje stanja v `localStorage`; uporabniški vmesnik ne uporablja
  `/__test/`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `C = parse(URL)` iz `q`, `status`, `order` za obstoječo pot projekta/opravila; privzeto `""`/`all`/`original`; neposredna povezava prikaže filtrirano stanje brez klika | razvojni D01; lastni test: privzeti parametri in neposredna povezava |
| R02 | `matches` po `norm` nad `title`, `description`, `assignee`, `id`; fraza kot podniz, brez regularnih izrazov in delitve | razvojni D01; lastni test: velike/male črke, šumniki, del besede |
| R03 | `keeps` združi `q` in `status` po IN; `order` ureja po `norm(title)` (UTF-16), ob izenačenju izvorni vrstni red | lastni test: vsi statusi, `title-asc/desc`, enaki naslovi |
| R04 | Prva pojava parametra; neznani `status`/`order` → privzeto; neznani parametri ne vplivajo; razčlenjevanje ne prepiše URL-ja | lastni test: ponovljeni in neznani parametri |
| R05 | Sprememba kontrol menja le `D`; Uporabi pogled potrdi vse tri hkrati in doda eno zgodovinsko stanje le ob spremembi | razvojni D02; lastni test: dvakrat enaka potrditev |
| R06 | Potrditev obreže `q`, izpusti privzete parametre, ohrani `view=board`, odstrani neznane, URL-kodira; brez spremembe ni novega stanja | razvojni D02; lastni test: kodiranje in ohranitev `view=board` |
| R07 | Nazaj/Naprej obnovita `C`, prikaz in `D`; osvežitev ohrani potrjeno stanje iz URL-ja | razvojni D03; lastni test: Nazaj po dveh potrditvah |
| R08 | Preklop Preglednica/Tabla ohrani `C` in iste ID-je; osnutek se ob navigaciji zavrže | razvojni D03; lastni test: nepotrjen osnutek po preklopu |
| R09 | Podrobnosti (odpri, gumb, Escape) ohranijo `C` in `view`; povezava do pravega `id` tudi pri enakih naslovih | lastni test: dva enaka naslova, različna ID-ja |
| R10 | Klik na drug projekt začne privzeti pregled in ohrani `view`; neposredna povezava s parametri jih upošteva | lastni test: preklop projektov, neposredna povezava |
| R11 | Ponastavi pogled počisti filtre in osnutek po pravilu potrditve, obdrži `view`; prazen rezultat `Ni zadetkov.`; števec `Prikazano: N od M.` | razvojni D04; lastni test: števec in prazno sporočilo |
| R12 | Nobeno dejanje ne piše podatkov; stanje ni v `localStorage`; neznana pot, nalaganje, podrobnosti in Folio delujejo | razvojni D04; skupni `tests/baseline.spec.ts`, `tests/api.spec.ts`; lastni test: brez pisanja |

## Izvedba in sledljivost

Spremembe so v `src/viewState.ts` (normalizacija, ujemanje, urejanje),
`src/navigation.ts` (razčlenjevanje in sestavljanje URL-ja), `src/App.tsx`
(kontrole, potrjeno stanje, prikaz), `src/TaskBoard.tsx`, `src/TaskDetails.tsx`
in `src/styles.css` (prikaz, 390 pik). Dokaz so imena testov in dnevnik
zagona (`docs/agent/verification.md`).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neposredna povezava s parametri prikaže filtrirano stanje | D01; lastni `R01/R04` | `src/navigation.ts`, `src/App.tsx` | uspešno (razvojni + lastni) |
| R02 | Ujemanje fraze po normalizaciji | D01; lastni `R02`, `R02/R03` | `src/viewState.ts`, `src/App.tsx` | uspešno (razvojni + lastni) |
| R03 | Status IN fraza; stabilno urejanje | lastni `R03`, `R02/R03` | `src/viewState.ts`, `src/App.tsx` | uspešno (lastni) |
| R04 | Prva pojava; neznane vrednosti in parametri | lastni `R01/R04` | `src/navigation.ts` | uspešno (lastni) |
| R05 | Osnutek se ne uveljavi pred potrditvijo | D02; lastni `R05/R06` | `src/App.tsx` | uspešno (razvojni + lastni) |
| R06 | Potrditev: obrez, izpust privzetih, ohranjen `view` | D02; lastni `R05/R06` | `src/navigation.ts`, `src/App.tsx` | uspešno (razvojni + lastni) |
| R07 | Nazaj/Naprej in osvežitev obnovijo stanje | D03; lastni `R07` | `src/navigation.ts`, `src/App.tsx` | uspešno (razvojni + lastni) |
| R08 | Preklop pogleda ohrani parametre in ID-je | D03; lastni `R08` | `src/App.tsx`, `src/TaskBoard.tsx` | uspešno (razvojni + lastni) |
| R09 | Podrobnosti ohranijo parametre; enaki naslovi | lastni `R09`, `R12` (enaka naslova) | `src/App.tsx`, `src/TaskDetails.tsx` | uspešno (lastni) |
| R10 | Preklop projekta: privzeto; neposredna povezava: parametri | lastni `R10` | `src/App.tsx`, `src/navigation.ts` | uspešno (lastni) |
| R11 | Ponastavitev, števec in prazno sporočilo | D04; lastni `R11`, `R02/R03` | `src/App.tsx` | uspešno (razvojni + lastni) |
| R12 | Brez zapisov in brez `localStorage`; ozek zaslon | D04; skupni testi; lastni `R12` ×2 | `src/` (celota), `src/styles.css` | uspešno (razvojni + skupni + lastni) |

Skupno: `npm run check` – 61 uspešnih testov (38 skupnih, 8 razvojnih P09,
15 lastnih), 0 neuspešnih. Končni zunanji testi niso bili dostopni in niso
izvedeni; tu navedeni izidi so iz lokalnih zagonov.

## Odprta vprašanja in omejitve

- URL hrani obrezano dobesedno frazo (velikost črk in šumniki se ohranijo);
  normalizacija velja le za ujemanje. To je sprejeta odločitev iz R02/R06/R07.
- Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov
  brez osvežitve ne širimo prek obstoječih regresijskih zahtev.
- Razvojni primeri D01–D04 in pomožni API `/__test/` so testni mehanizem;
  uporabniški vmesnik jih ne uporablja. Končni primeri lahko uporabijo druge
  podatke iz opisane domene.
- Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista
  predpisana; omejitev širine 390 pik velja za celotno stran.
- Končnih zunanjih testov ni mogoče zagnati; preverjanje poteka z razvojnimi
  primeri, skupnimi testi in lastnimi testi v `tests/agent/`.
