# P09 — Stanje pogleda v povezavi in zgodovini (specifikacija)

Različica: 0.1 (faza specifikacije). Avtor: agent-specifikator.
Vir zahtev: `task/instructions.md` (R01–R12) in `task/specification-template.md`.
Izvedba še ni preverjena; vrstice izvedbe so načrt in se dopolnijo z dejanskimi
dokazi v fazi implementacije.

## Problem in kontekst

Uporabnik želi, da je pogled na opravila projekta deljiv in obnovljiv prek
povezave: filtriranje po besedilu, stanju in vrstnem redu naj živi v query delu
URL fragmenta, tako da neposredno odprtje povezave, osvežitev ter Nazaj/Naprej
prikažejo isto stanje brez dodatnih klikov. Izhodiščni Folio pozna pot
`#/projects/:projectId[/tasks/:taskId]` in `view=table|board`, bere iz `/api/`
in nima filtrirnega stanja v URL-ju (`src/navigation.ts`, `src/App.tsx`).

Predvidena sprememba je lokalno stanje pogleda: tri nove kontrole (Iskanje,
Stanje, Vrstni red), gumba Uporabi pogled in Ponastavi pogled, branje/pisanje
parametrov `q`, `status`, `order` v fragmentu ter ohranitev obstoječega videza
Folio. Podatki se ne spreminjajo; stanje ni v `localStorage`.

## Vhodi, dejanja in izidi

Podatkovna polja (nespremenjeni tipi iz `shared/types.ts`):

- `Project`: `id`, `name`.
- `Task`: `id`, `projectId`, `title`, `description`, `status` (`todo|in_progress|done`), `assignee`, `dueDate`.

Stanje pogleda (potrjeno, committed) je trojka `(q, status, order)`:

- `q`: poljuben niz; privzeto prazen niz.
- `status`: `all|todo|in_progress|done`; privzeto `all`.
- `order`: `original|title-asc|title-desc`; privzeto `original`.

Dovoljena dejanja:

- Vnos v iskalno polje, izbira stanja in vrstnega reda spreminjajo le osnutek (draft); prikaz in URL se ne spremenita.
- `Uporabi pogled` potrdi vse tri vrednosti hkrati.
- `Ponastavi pogled` nastavi `(q, status, order) = (prazen niz, all, original)` in počisti osnutek.
- Preklop `Preglednica`/`Tabla`, odpiranje/zapiranje podrobnosti, klik na drug projekt, Nazaj/Naprej, osvežitev.

Pričakovano stanje po uspehu: prikaz ustreza potrjeni trojki, URL fragment vsebuje
neprivzete parametre, osnutek kontrol je enak potrjenemu stanju; preklic (npr.
zapiranje podrobnosti) ne spremeni potrjenega stanja; napake branja podatkov se
obravnavajo kot doslej (`LoadError`), filtri takrat ne spremenijo pogleda.

Pomožne definicije (predikati):

- `norm(s)`: `s` se obreže zunanje beline, normalizira NFD, odstranijo se znaki U+0300–U+036F in pretvori v male črke.
- `matchQ(t,q)`: `q` je prazen niz ALI `norm(q)` je podniz `norm(t.title)` ALI `norm(t.description)` ALI `norm(t.assignee)` ALI `norm(t.id)`. Gre za dobesedni podniz, ne regularni izraz, brez delitve na besede.
- `passS(t,s)`: `s = all` ALI `t.status = s`.
- `visible(T,q,s,o)`: urejen seznam `t` iz `T`, kjer `t.projectId` ustreza projektu `P` IN `matchQ(t,q)` IN `passS(t,s)`. Pri `o = original` se ohrani vrstni red iz API-ja; pri `title-asc|title-desc` se primerja `norm(t.title)` po UTF-16, ob izenačenju pa ostane izvorni (API) vrstni red.
- `draft`: trenutne vrednosti kontrol; `committed`: trojka, prebrana iz URL-ja.
- `writeUrl(view,q,s,o)`: privzete vrednosti (prazen `q`, `status=all`, `order=original`) se izpustijo, `q` se obreže, preostalo se URL-kodira; `view=board` se ohrani, če je bil; neznani parametri se odstranijo; če je rezultat enak trenutnemu fragmentu, se novo zgodovinsko stanje ne doda.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Trojka `(q, status, order)` se bere iz query dela fragmenta za obstoječo pot projekta ali opravila. Privzeto je `q` prazen, `status=all`, `order=original`. Ob neposrednem odprtju povezave se prikaže filtriran seznam brez dodatnega klika. | Test neposrednega odprtja `#/projects/web?q=pregled&status=done`; kontroli Iskanje in Stanje imata vrednosti iz URL-ja, seznam pa je filtriran. |
| R02 | `q` je ena dobesedna fraza: obreži zunanje beline, NFD, odstrani U+0300–U+036F, male črke; ujemanje je podniz v `title`, `description`, `assignee` ali `id`. Ni regularni izraz in se ne deli na besede. | Testi: `q` z velikimi/malimi črkami in šumniki (npr. `Pregled` ujame `pregled`), `=SUM(A1)` se ne obnaša kot formula/regex, večbesedni `q` se ne deli (fraza mora biti podniz enega polja). |
| R03 | `status` podpira `all|todo|in_progress|done` in deluje skupaj z `q` po IN. `order` podpira `original|title-asc|title-desc`; naslov se primerja po `norm` in UTF-16, ob izenačenju ostane izvorni vrstni red. | Testi: `q` IN `status`; `title-asc`/`title-desc` s ponovljenima naslovoma (npr. web-02/web-03) ohranita izvorni vrstni red. |
| R04 | Neznana vrednost `status`/`order` pomeni privzeto vrednost. Pri ponovljenem parametru velja prva pojavitev. Neznani parametri ne vplivajo na prikaz. Razčlenjevanje ne povzroči samodejnega prepisovanja URL-ja. | Testi: `status=bogus` → all; `order=bogus` → original; `?q=a&q=b` uporabi `a`; `?foo=1` ne spremeni prikaza in URL se ob odprtju ne prepiše. |
| R05 | Spreminjanje kontrol ureja samo osnutek; prikaz in URL se ne spremenita. `Uporabi pogled` potrdi vse tri vrednosti hkrati in ustvari eno novo zgodovinsko stanje, če se potrjena trojka spremeni. | Test: izbira `status=done` brez klika ne spremeni ID-jev; klik doda en vnos v `history.length` in URL z `status=done`. |
| R06 | Ob potrditvi se `q` obreže, privzeti parametri se izpustijo, preostali se pravilno URL-kodirajo. Obstoječi `view=board` se ohrani, neznani parametri se odstranijo. Ponovitev enake potrditve ne doda novega zgodovinskega stanja. | Testi: `q` z belinami/Unicode znaki → pravilna oblika fragmenta; `view=board` ostane; `foo=1` izgine; dvakrat enak `Uporabi pogled` ne poveča `history.length`. |
| R07 | Nazaj in Naprej v brskalniku obnovita potrjene filtre, prikaz in osnutek kontrol. Osvežitev ohrani potrjeno stanje iz URL-ja. | Testi: potrdi filter → Nazaj pokaže prejšnje ID-je in vrednosti kontrol; Naprej ponovno; `reload()` ohrani filtre in prikaz. |
| R08 | Preklop Preglednica/Tabla ohrani potrjene parametre in prikaže iste ID-je. Nepotrjen osnutek se ob vsaki navigaciji zavrže. | Test: potrjen filter in vnos osnutka, preklop na Tablo → isti ID-ji in isti parametri; osnutek je ponastavljen na potrjeno stanje. |
| R09 | Odpiranje podrobnosti in zapiranje z gumbom ali Escape ohranita potrjene parametre in način pogleda. Povezava vodi do pravega ID-ja tudi pri enakih naslovih. | Test: dva opravila z enakim naslovom, klik na drugi ID odpre njegove podrobnosti (dialog vsebuje ta ID), Escape ohrani URL in filter. |
| R10 | Klik na drugi projekt začne njegov privzeti pregled (`q` prazen, `status=all`, `order=original`) in ohrani table/board. Neposredna povezava do drugega projekta s parametri pa jih upošteva. | Test: klik na `Jesenska kampanja` iz filtriranega `web` → privzeti seznam `launch`; neposredni `#/projects/launch?status=done` filter upošteva. |
| R11 | `Ponastavi pogled` počisti tri filtre in osnutek ter posodobi zgodovino po istem pravilu kot potrditev (R06); obdrži trenutni način pogleda. Prazen rezultat pokaže `Ni zadetkov.`; števec kaže `Prikazano: N od M.`. | Testi: reset iz filtriranega stanja; neujemajoči `q` → `Ni zadetkov.`; števec v elementu `role=status` z `aria-label="Rezultati povezave"`. |
| R12 | Nobeno dejanje ne spremeni podatkov ali pošlje zapisov na API (samo GET/HEAD/OPTIONS). Stanje ni v `localStorage`. Delujejo obstoječa neznana pot, nalaganje, podrobnosti in prilagodljiv videz Folio. | Test: prestrezanje zahtev ne zabeleži ne-GET klicev na `/api/`; `localStorage` ostane brez ključev stanja; regresijski testi izhodišča (`tests/baseline.spec.ts`, `tests/api.spec.ts`). |

Dogovor o vmesniku (iz navodil, obvezen):

- `input type=search` z dostopnim imenom `Iskanje v povezavi`.
- `select` `Stanje v povezavi`: `all`, `todo`, `in_progress`, `done`.
- `select` `Vrstni red v povezavi`: `original`, `title-asc`, `title-desc`.
- Gumba `Uporabi pogled` in `Ponastavi pogled`.
- `role=status` z `aria-label="Rezultati povezave"` in besedilom `Prikazano: N od M.`.
- Primer fragmenta: `#/projects/web?view=board&q=Pregled&status=todo&order=title-desc`; vrstni red samih URL-parametrov ni predpisan.
- Ohranjeni: `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev, `aria-label="Pregled stanj opravil"`; nova dejanja ob opravilu so zunaj njegove povezave.
- Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Načrtovane lokacije (za fazo implementacije): razčlenjevanje/združevanje stanja
pogleda v `src/navigation.ts` (ali nova `src/viewState.ts`), uporaba v
`src/App.tsx`, kontrole v novi komponenti (npr. `src/ViewFilters.tsx`), slogi v
`src/styles.css`; lastni testi v `tests/agent/`. Skupni razvojni testi
`tests/development/P09.spec.ts` (D01–D04) ostanejo nespremenjeni in se
uporabljajo kot dodatno preverjanje.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neposredni URL uporabi trojko | `tests/agent/*` + D01 | `src/navigation.ts`, `src/App.tsx` | Ni izvedeno v fazi specifikacije; dopolni implementer. |
| R02 | `matchQ` po normiranem podnizu | lastni test normalizacije | `src/navigation.ts`/`src/viewState.ts` | Ni izvedeno. |
| R03 | IN + stabilno urejanje | lastni testi urejanja | isto | Ni izvedeno. |
| R04 | Prva pojava; privzete neznane vrednosti | lastni testi razčlenjevanja | isto | Ni izvedeno. |
| R05 | Osnutek proti potrditvi; en vnos | lastni test + D02 | `src/App.tsx`, komponenta kontrol | Ni izvedeno. |
| R06 | Normaliziran zapis URL-ja | lastni test fragmenta | `src/navigation.ts` | Ni izvedeno. |
| R07 | Nazaj/Naprej/`reload` | lastni test + D03 | `src/App.tsx`, `src/navigation.ts` | Ni izvedeno. |
| R08 | Preklop ohrani parametre; osnutek se zavrže | lastni test | `src/App.tsx`, `src/navigation.ts` | Ni izvedeno. |
| R09 | Podrobnosti in Escape | lastni test + D04 | `src/App.tsx`, `src/TaskDetails.tsx` | Ni izvedeno. |
| R10 | Zamenjava projekta | lastni test | `src/App.tsx`, `src/navigation.ts` | Ni izvedeno. |
| R11 | Reset, `Ni zadetkov.`, števec | lastni test + D04 | komponenta kontrol, `src/App.tsx` | Ni izvedeno. |
| R12 | Brez zapisov, brez `localStorage`, regresije | D04 + izhodiščni testi | `src/api.ts` (nespremenjen), `src/App.tsx` | Ni izvedeno. |

## Odprta vprašanja in omejitve

- Potrjeno: vrstni red URL-parametrov ni predpisan; nepotrjen osnutek se zavrže ob vsaki navigaciji (R08), tudi ob Nazaj/Naprej.
- Potrjeno: privzeti parametri se izpustijo; `view=board` ostane v fragmentu tudi pri potrditvi filtra (R06).
- Odprto: natančna razporeditev novih kontrol in besedila, ki niso izrecno določena, sta prosti; implementer ju izbere skladno z `docs/dizajn.md`.
- Omejitev: navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve specifikacija ne širi prek obstoječih regresijskih zahtev.
- Nepreverjeno: R01–R12 so v tej fazi samo načrt; dokazi se vpišejo po dejanskem izvajanju testov. Končnih testov naloge ni na voljo.
- Predpostavke: ID-ji opravil so enkratni; naloge lahko vrnejo 0, 1 ali več kot 10 opravil; naslovi se lahko ponovijo; `assignee` v nalogah z izbiro ni prazen in ni `all`; vsako opravilo pripada svojemu projektu; datumi so veljavni koledarski datumi; projekta sta lahko prazna.
