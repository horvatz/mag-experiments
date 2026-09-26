# P09 — Stanje pogleda v povezavi in zgodovini

## Problem in kontekst

Uporabnik lahko deli, osveži in z brskalnikovo zgodovino obnovi filtriran ter urejen pregled opravil. Potrjeno stanje določa URL; urejanje kontrol je ločen osnutek. Izvirne zahteve `task/instructions.md` ostajajo obvezne.

Izhodišče: `App.tsx` pridobi projekte in opravila, `navigation.ts` razčleni fragment ter samo parameter `view`, `TaskBoard.tsx` razdeli opravila v tri stolpce, `TaskDetails.tsx` bere podrobnosti po ID-ju. Ohrani videz Folio po `docs/dizajn.md`, slovenska imena, dostopnost in obstoječe prikaze nalaganja ter napak. Ta dokument je predaja specifikacijske vloge; aplikacija in testi v tej fazi niso bili zagnani.

## Vhodi, dejanja in izidi

- Nespremenjeni tipi v `shared/types.ts`: `Project { id, name }`; `Task { id, projectId, title, description, status, assignee, dueDate }`, vsa polja so nizi; status je `todo | in_progress | done`. ID določa identiteto, naslov je lahko podvojen. Datumi so veljavni, besedila lahko vsebujejo Unicode in ločila.
- Podatki prihajajo iz GET `/api/projects`, `/api/projects/:projectId/tasks` in `/api/tasks/:taskId`. Segmenti poti se pravilno kodirajo. Obdelava ne predpostavlja konkretnih ID-jev, števila ali vrstnega reda opravil; projekti imajo lahko 0, 1 ali več kot 10 opravil.
- Poti so `#/projects/:projectId` in `#/projects/:projectId/tasks/:taskId`; query sledi celotni poti, na primer `#/projects/web/tasks/web-03?view=board&q=Pregled&status=done&order=title-desc`. Ne gre za query pred fragmentom. Obstoječi začetni poti `#` in `#/` ohranita obnašanje.
- Kontrole: `input type="search"` z dostopnim imenom **Iskanje v povezavi**; select **Stanje v povezavi** z vrednostmi `all/todo/in_progress/done`; select **Vrstni red v povezavi** z vrednostmi `original/title-asc/title-desc`; gumba **Uporabi pogled** in **Ponastavi pogled**.
- Rezultat: element `role="status"`, `aria-label="Rezultati povezave"`, besedilo `Prikazano: N od M.` z eno končno piko, kjer je N število zadetkov in M število vseh opravil trenutnega projekta. Če N = 0, je vidno `Ni zadetkov.`.
- Po uspešni potrditvi se prikaz in kontrole ujemajo s potrjenim stanjem. Ob navigaciji se nepotrjen osnutek zavrže. Napaka branja ohrani obstoječe opozorilo in možnost ponovitve; ne prepiše URL-ja ali podatkov. Podrobnosti ohranijo preverjanje pripadnosti projektu in odziv za neobstoječi ID.

## Zahteve in pravila

Oznake: T je seznam opravil trenutnega projekta v vrstnem redu odgovora API; i(t) je izvorni indeks. C = (q, status, order) je potrjeno stanje, D osnutek, C₀ = ('', all, original); V je table/board. `norm(s) = s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`. Za URL in kontrolo se q samo obreže; odstranjevanje naglasov in sprememba velikosti črk sta namenjena primerjavi.

Predikat zadetka:

`match(t,C) = (C.status = all ∨ t.status = C.status) ∧ (∃ f ∈ {title, description, assignee, id}: norm(t[f]).includes(norm(C.q)))`.

Prazna fraza ustreza vsem opravilom. Fraza se ne razdeli, polja se ne združujejo in znaki nimajo pomena regularnega izraza. Rezultat F je filtrirani T, urejen po spodnjih pravilih; N = |F|, M = |T|. Izvornega T se ne spreminja.

Pravila spremembe stanja:

- Urejanje kontrole: spremeni samo D; C, URL in F ostanejo isti.
- Uporaba: C′ = (trim(D.q), D.status, D.order), D′ = C′. Če C′ ≠ C, ustvari natanko en nov vnos zgodovine. Primerja se trojica vrednosti, ne množica zadetkov; q se za to primerjavo ne pretvarja v male črke.
- Ponastavitev: C′ = D′ = C₀, V se ohrani; pravilo dodajanja zgodovine je enako kot pri uporabi.
- Navigacija, tudi Nazaj/Naprej: C′ se prebere iz ciljnega URL-ja, D′ = C′. Nepotrjeni D se nikoli ne prenese v novo povezavo.
- Kanonizacija ob uporabi/ponastavitvi izpusti privzete filtre, ohrani samo `view=board` za tablo in pravilno kodira preostale vrednosti. Če se C ne spremeni, popravek nekanoničnega URL-ja lahko zamenja trenutni vnos, ne sme pa dodati novega. Samo branje URL-ja ničesar ne prepiše.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Fragment projektne in podrobnostne poti določa C prek q/status/order; manjkajoče vrednosti so C₀. Po naložitvi se prikaz in kontrole ujemajo brez klika na uporabo. | Neposredno odpri obe poti z vsemi parametri in brez njih. |
| R02 | Velja predikat match; iskanje preveri vsako od štirih polj posebej. Zunanje beline se obrežejo, notranje ohranijo. | Unicode v sestavljeni/razstavljeni obliki, velike črke, zadetek samo v opisu/osebi/ID-ju, `.*` kot dobesedno besedilo in fraza, katere besedi sta ločeni. |
| R03 | Status je IN z iskanjem. `original` ohrani vrstni red T; `title-asc/desc` primerjata norm(title) leksikografsko po UTF-16, ne krajevno ali številsko. Pri enakosti vedno narašča i(t), tudi pri desc. | Vsi statusi in redi; `Alfa 10` pred `alfa 2` v asc, enaki normalizirani naslovi v obeh smereh ter premešan vhod. |
| R04 | Za vsak parameter velja prva pojavitev, tudi prazna/neveljavna. Neznan status/order postane all/original. Neznani parametri ne vplivajo na F. Razčlenjevanje ne spreminja surovega URL-ja. | `status=neznano&status=done`, `q=&q=drugo`, podvojeni order, neznan ključ; preveri prikaz in nespremenjeni fragment. |
| R05 | Vse tri kontrole urejajo samo D. Uporaba atomarno potrdi vse tri vrednosti in ustvari en zgodovinski vnos natanko ob spremembi C. | Spremeni vse kontrole, preveri stari URL/ID-je, uporabi in z enim Nazaj obnovi prejšnje C. |
| R06 | Uporaba obreže q, izpusti privzeto, odstrani neznane parametre, ohrani tablo in kodira posebne znake. Enaka ponovitev ne ustvari vnosa; vrstni red parametrov ni predpisan. | q z belinami, `&`, `+`, `#`, `?` in Unicode; preveri dekodirano vrednost. Ponovi uporabo in preveri Nazaj. |
| R07 | Nazaj/Naprej obnovita C, D, F in V; osvežitev obnovi C iz URL-ja. Nepotrjen D pred Nazaj/Naprej se zavrže. | Dve različni potrditvi, urejen osnutek, Nazaj, Naprej in osvežitev. |
| R08 | Preklop Preglednica/Tabla ohrani C in množico ID-jev F. Na tabli se isti urejeni F projicira v tri statuse; vrstni red znotraj stolpca sledi F. Navigacija zavrže D. | Ob filtrih primerjaj množice ID-jev obeh pogledov in red v stolpcih; pred preklopom uredi D. |
| R09 | Odpiranje podrobnosti po id ter zapiranje z gumbom ali Escape ohranijo C in V. Neposredna podrobnostna povezava deluje tudi po osvežitvi; filter ne prepreči branja pravilnega opravila po ID-ju. | Enaka naslova z različnima ID-jema; obe vrsti zapiranja v obeh pogledih; podrobnosti na filtriranem URL-ju. |
| R10 | Klik drugega projekta vodi na C₀ in ohrani V. Neposredni URL drugega projekta upošteva svoje parametre. Podatki prejšnjega projekta se ne prikazujejo kot novi. | S filtrirane table klikni drugi projekt; ločeno odpri neposredni filtrirani URL drugega projekta. |
| R11 | Ponastavitev počisti C in D, ohrani V ter upošteva isto pravilo zgodovine kot uporaba. Števec je N od M; Ni zadetkov. velja tudi pri M = 0. | Ponastavi spremenjeno C in posebej samo spremenjeno D; ponovi ponastavitev; preveri N = 0 pri praznem in nepraznem projektu. |
| R12 | Dejanja ne spreminjajo podatkov, ne kličejo zapisovalnega API-ja in ne shranjujejo stanja v localStorage. UI uporablja samo `/api/`, nikoli `/__test/`. Ohranjeni so neznane poti, nalaganje/ponovitev, podrobnosti in Folio brez širjenja cele strani pri 390 px. | Spremljanje zahtev in podatkov; pregled uporabe shrambe; skupne regresije; preverjanje videza in širine 390 px. |

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena preglednice, table in stolpcev, `aria-label="Pregled stanj opravil"`, vidni fokus in povrnitev fokusa ob zapiranju dialoga. Morebitna nova dejanja ob opravilu so zunaj njegove povezave. Tabla ohrani vse tri stolpce tudi pri nič zadetkih. Pri dejansko praznem projektu ohrani obstoječi naslov `V tem projektu še ni opravil` in dodaj zahtevano sporočilo `Ni zadetkov.`; s tem sta združljivi R11 in obstoječa regresija. Novi rezultatni status pokaži po naložitvi opravil, da ostane obstoječi status nalaganja nedvoumen. Notranje vodoravno drsenje table/preglednice je dovoljeno; nove kontrole se pri 390 px prilagodijo širini. Postavitev kontrol in druga besedila niso predpisani.

## Izvedba in sledljivost

Spodaj so dejansko prebrane točke izhodišča in načrt preverjanja, ne trditev o izvedeni rešitvi. D01–D04 so obstoječi testi v `tests/development/P09.spec.ts`; ostali scenariji so predlogi za implementerjeve teste v `tests/agent/`. Vsi izidi izvajanja so **ni izvedeno**. Implementer zapiše končne datoteke, imena izvedenih testov, ukaze, rezultate in dokaz v svojo dokumentacijo v `docs/agent/`; specifikacijo ob popravkih ureja njen prvotni avtor.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | URL → C in D ob odprtju | D01; neposredna pot opravila z vsemi filtri | `src/navigation.ts`: useRoute; `src/App.tsx`: ProjectView | Ni izvedeno; izhodišče bere samo view. |
| R02 | Predikat match za štiri polja | Scenariji fraz in Unicode iz R02 | `src/App.tsx`: izpeljava prikazanih tasks; po potrebi nov čist pripomoček v src | Ni izvedeno; izhodišče ne filtrira. |
| R03 | IN in stabilna primerjava UTF-16 | Kombinacije filtrov, vezani naslovi, asc/desc/original | `src/App.tsx`: izpeljava F; `src/TaskBoard.tsx`: entries | Ni izvedeno; izhodišče uporablja vrstni red API-ja. |
| R04 | Prva pojavitev in nespremenjen URL | Podvojeni/neveljavni/prazni parametri | `src/navigation.ts`: razčlenjevanje query | Ni izvedeno; dodati razčlenjevanje filtrov. |
| R05 | D ločen od C, ena potrditev | D02; vse tri spremembe in en Nazaj | `src/App.tsx`: nove kontrole; `src/navigation.ts`: sprememba URL-ja | Ni izvedeno; kontrol še ni. |
| R06 | Kanoničen URL brez odvečnega vnosa | Kodiranje, neznani parametri, enaka uporaba | `src/navigation.ts`: gradnja URL-jev in potrditev | Ni izvedeno; dodati pravila kanonizacije. |
| R07 | Obnova C/D/F iz zgodovine | D03 delno; Nazaj/Naprej z osnutkom | `src/navigation.ts`: subscribe/useRoute; `src/App.tsx`: uskladitev D | Ni izvedeno; izhodišče posluša hashchange. |
| R08 | Pogleda delita potrjeni F | D03 delno; osnutek pred preklopom, ID-ji in red stolpca | `src/App.tsx`: view-switch; `src/TaskBoard.tsx`: tasks/entries | Ni izvedeno; stikalo trenutno izgubi filtre. |
| R09 | Podrobnosti po ID-ju ohranijo C/V | Obstoječi baseline scenariji podrobnosti/table; dodaj filtre | `src/navigation.ts`: taskUrl/projectUrl; `src/App.tsx`: task-link; `src/TaskBoard.tsx`: board-card; `src/TaskDetails.tsx`: close/onCancel | Ni izvedeno; razširiti vse povezave in zapiranje s potrjenimi filtri. |
| R10 | Klik projekta → C₀, neposredni URL → njegovo C | Menjava projektov v obeh pogledih | `src/App.tsx`: project-nav, projectUrl in key projekta | Ni izvedeno; trenutni projektni linki ohranijo samo view. |
| R11 | Ponastavitev, prazno stanje, N/M | D04 delno; prazen projekt, samo osnutek, ponovitev | `src/App.tsx`: kontrole, prazno stanje in novi rezultatni status; `src/TaskBoard.tsx`: prazni stolpci | Ni izvedeno; ohraniti baseline praznih projektov. |
| R12 | Samo branje in ohranjene regresije | D04; `tests/baseline.spec.ts`, `tests/api.spec.ts`; 390 px in pregled shrambe | `src/api.ts`, `src/useResource.ts`, `src/TaskDetails.tsx`, `src/styles.css` | Ni izvedeno; request/useResource uporabljata branje; obstoječega updateTask UI ne sme klicati. |

Konkretna ugotovitev ob branju: trenutni `taskUrl` sestavi podrobnosti iz `projectUrl(projectId)` brez queryja in doda view pravilno šele na koncu. Pri razširitvi ohrani pravilo: najprej celotna projektna/podrobnostna pot, nato en sam query; filtrov nikoli ne vstavljaj pred `/tasks/:id`. Vse klicatelje URL-pripomočkov je treba uskladiti.

Implementer naj izvede skupne statične preglede in teste po `package.json` (npr. `npm run check`), zagotovi izvajanje razvojnih P09 testov ter doda smiselno pokritje zgornjih vrzeli. Testne kontrole in prilagojene GET odgovore sme uporabljati samo testni program. V tej fazi ni zagona aplikacije, testov ali vizualnega pregleda.

## Odprta vprašanja in omejitve

- Za izvedbo ni blokirajočih vprašanj. Uporabljeno pojasnilo R05/R06: enakost potrditve primerja obrezani q in obe izbirni vrednosti; odstranitev neznanih ali redundantnih parametrov pri istem C ne sme ustvariti dodatne zgodovine. Ob samem odprtju se nekanonični URL ohrani.
- Povzetek `Pregled stanj opravil` lahko ohrani obstoječe projektne vsote; zahtevani filtrirani števec je ločeni `Rezultati povezave`. Izhodiščno obnašanje povzetka se brez dodatne zahteve ohrani.
- Mednalagalne navigacije in sočasne spremembe podatkov brez osvežitve ne širijo obsega prek obstoječih regresijskih zahtev. Novo zapisovanje podatkov ni del naloge.
- Razvojni D01–D04 ne pokrijejo vseh R01–R12. Vsi testi, omrežna preverjanja in vizualni pregled ostajajo naloga implementerja/reviewerja. Nedostopni končni testi niso opravljeni.
- V tej vlogi sta dovoljeni samo `docs/agent/specification.md` in `docs/agent/specification-history.md`; infrastruktura, odvisnosti, skupni tipi, skupni testi, navodila in tuji izdelki ostanejo nespremenjeni. Dovoljeni so le izvoženi projekt in lokalne storitve te naloge; brez drugih projektov, oddaljenih repozitorijev ali dodatnih agentov.
