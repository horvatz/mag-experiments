# Razvojna specifikacija P09: Stanje pogleda v povezavi in zgodovini

Verzija 1.0 (osnutek, avtor specifikacije). Viri: task/instructions.md in task/specification-template.md. Zgodovina sprememb: docs/agent/specification-history.md.

## Problem in kontekst

Uporabnik želi pogled seznama opravil (Preglednica/Tabla) deliti in obnoviti prek povezave: iskalno frazo, stanje in vrstni red naj določa query del URL fragmenta. Začetni Folio (src/App.tsx, src/navigation.ts) podpira le view=table|board, bere podatke prek GET /api/projects in GET /api/projects/:id/tasks (src/api.ts) ter podrobnosti prikaže prek src/TaskDetails.tsx. Filtriranje, vrstni red in zgodovina sprememb URL-ja ne obstajajo. Sprememba je omejena na src/: tri nove kontrole, gumba Uporabi/Ponastavi pogled, števec rezultatov ter usklajevanje stanja z zgodovino brskalnika. Videz Folio (docs/dizajn.md) in obstoječe vedenje se ohranita.

## Vhodi, dejanja in izidi

Podatkovna polja (nespremenjeni tipi iz shared/types.ts):

- Project { id, name }, Task { id, projectId, title, description, status: "todo"|"in_progress"|"done", assignee, dueDate }.
- Iskanje teče po title, description, assignee, id. Vrstni red po title. Števec M = število vseh opravil projekta, N = število prikazanih.

Pot stanja in pojmovanja:

- path = #/projects/<projectId> ali #/projects/<projectId>/tasks/<taskId>.
- Q = query del fragmenta (npr. ?view=board&q=...&status=...&order=...).
- first(Q, k) = prva pojavitev parametra k (ponovljeni parametri: velja prva vrednost).
- Privzete vrednosti: q="", status="all", order="original", view="table".
- Potrjeno stanje C = trojica (q, status, order), ki jo določa trenutni URL (ali privzete vrednosti). Osnutek D = vrednosti treh kontrol pred potrditvijo. Prikaz = seznam opravil, izračunan iz C in podatkov.

Dovoljena dejanja in izidi:

1. Neposredno odprtje/nalaganje povezave: C se prebere iz URL-ja, osnutek D se nastavi na C, prikaz ustreza C. Brez klika. Ob neveljavni vrednosti status/order se uporabi privzetek; neznani parametri se ignorirajo; URL se ob branju ne prepiše.
2. Urejanje kontrole (Iskanje v povezavi, Stanje v povezavi, Vrstni red v povezavi): spremeni se samo D; URL in prikaz ostaneta nespremenjena.
3. Klik Uporabi pogled: C := (trim(q), veljavni status, veljavni order); URL se prepiše po pravilih R06; prikaz se preračuna; D := C. Če se C ne spremeni, se ne doda novo zgodovinsko stanje.
4. Klik Ponastavi pogled: C := privzetki, D := privzetki, način pogleda (table/board) se ohrani; zgodovina po istem pravilu kot Uporabi.
5. Navigacija (Nazaj/Naprej, preklop pogleda, odpiranje/zapiranje podrobnosti, klik drugega projekta, osvežitev): C se prebere iz novega URL-ja, D := C (nepotrjen osnutek se zavrže), prikaz ustreza C.
6. Napake nalaganja ostanejo v obstoječih komponentah Loading/LoadError; nova funkcionalnost ne uvaja zapisov na strežnik in ne shranjuje stanja trajno (npr. localStorage).

## Zahteve in pravila

Simboli: norm(s) = NFD(s) z odstranjenimi znaki U+0300–U+036F, male črke, zunanje beline odrezane (s.trim(); normalizacija se uporabi za primerjave). sub(a,b) = a je podniz b. validStatus = {all, todo, in_progress, done}, validOrder = {original, title-asc, title-desc}. effStatus(Q) = status, če first(Q,"status") ∈ validStatus, sicer all; effOrder(Q) analogno z original. match(task,q) = norm(q)="" ∨ sub(norm(q),norm(task.title)) ∨ sub(norm(q),norm(task.description)) ∨ sub(norm(q),norm(task.assignee)) ∨ sub(norm(q),norm(task.id)). visible(C) = opravila projekta, filtrirana po status (ali vsa pri all) in match(q), nato urejena po order: original = vrstni red iz API-ja; title-asc/desc = primerjava norm(title) po UTF-16 kodnih enotah (< / >), ob izenačenju ostane izvorni (stabilni) vrstni red. Vrstni red parametrov v URL-ju ni predpisan; kodiranje je percent-encoding (npr. encodeURIComponent/URLSearchParams).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsako obstoječo pot projekta/opravila: ob odprtju velja C=(q=first(Q,"q") ?? "", effStatus(Q), effOrder(Q)); prikaz = visible(C) brez dodatnega klika. Privzetki: q="", status=all, order=original. | Playwright: odpri #/projects/web?q=pregled&status=done; pričakuj filtrirane ID-je in vrednost iskalnika brez klika (D01). |
| R02 | match je natanko definiran zgoraj: trim + NFD + odstranitev U+0300–U+036F + male črke; fraza je podniz vsaj enega od title/description/assignee/id; ni regex, se ne deli na besede. | Testi s predponami/velikostjo črk/diakritiko (Pregled ~ pregled), fraza z ločili in npr. .* se obravnava dobesedno; fraza z več besedami se ne razdeli. |
| R03 | status ∈ validStatus deluje kot vključujoč filter; q in status se vežeta z IN. order ∈ validOrder ureja po norm(title) UTF-16; ob izenačenju izvorni vrstni red. | Testi za vsak status, kombinacijo q+status ter asc/desc z enakimi naslovi (stabilnost). |
| R04 | status/order zunaj validStatus/validOrder → privzetek. Ponovljen parameter → prva vrednost. Neznani parametri ne vplivajo na prikaz. Branje URL-ja ne sproži history.pushState/replaceState niti prepisa URL-ja. | Odpri #/projects/web?status=nonsense&order=foo&q=a&q=b&x=1; pričakuj privzetka, q="a", URL nespremenjen. |
| R05 | Sprememba kontrole spreminja le osnutek D; prikaz in URL nespremenjena. Uporabi pogled potrdi vse tri vrednosti atomarno in ustvari največ eno novo zgodovinsko stanje (en vnos) in samo če se C spremeni. | Uredi npr. Stanje v povezavi na done; ID-ji nespremenjeni, URL brez status; po kliku en vnos nazaj; ponovni klik brez spremembe ne doda vnosa (D02). |
| R06 | Ob potrditvi: q := trim(q); privzeti parametri (q prazen, status=all, order=original) se izpustijo; ostali percent-encoded; view=board se ohrani; neznani parametri se odstranijo. Enaka ponovitev potrditve ne doda zgodovinskega stanja. | Preveri URL po potrditvi (npr. view=board&q=Pregled&status=todo&order=title-desc), odstranitev x=1, odsotnost privzetkov, enako stanje brez novega vnosa. |
| R07 | Nazaj/Naprej obnovita C iz URL-ja: prikaz, vrednosti kontrol (D := C). Osvežitev (reload) ohrani C iz URL-ja. | D03: odpri #/projects/web?status=done, preklopi na Tablo, reload; pričakuj iste ID-je in done v kontroli. Nazaj/Naprej po dveh potrditvah. |
| R08 | Preklop Preglednica/Tabla ohrani C (isti q/status/order) in prikaže isto množico ID-jev. Nepotrjen D se ob vsaki navigaciji zavrže (D := C novega URL-ja). | Uredi kontrolo brez potrditve, preklopi pogled: prikaz po starem C, kontrola kaže C. |
| R09 | Odpiranje podrobnosti in zapiranje (gumb ali Escape) ohranita C in view. Povezava vodi na pravi ID tudi pri enakih naslovih (cilj je data-task-id/id). | Odpri podrobnosti iz filtriranega pogleda, zapri z Escape; preveri C in view; dva opravila z enakim naslovom vodita vsak na svoj ID. |
| R10 | Klik na drug projekt v navigaciji odpre njegov privzeti pogled (q="", status=all, order=original) in ohrani table/board. Neposredna povezava na drug projekt s parametri jih upošteva. | Klik iz filtriranega projekta na drug projekt: privzete kontrole in prikaz; nato odpri neposredno povezavo s parametri. |
| R11 | Ponastavi pogled počisti q/status/order in D, ohrani trenutni način pogleda ter posodobi zgodovino po pravilu iz R05/R06 (novo stanje le ob spremembi C). Pri N=0 in M>0 prikaže Ni zadetkov.; števec je role=status, aria-label="Rezultati povezave", besedilo Prikazano: N od M. | D04: #/projects/web?q=neobstojece → Ni zadetkov., klik Ponastavi → vsi ID-ji; preveri besedilo števca in odsotnost zapisov. |
| R12 | Nobeno dejanje ne pošlje PATCH/POST/PUT/DELETE na /api/; stanje ni v localStorage/sessionStorage; UI ne kliče /__test/. Ohranjeni: neznana pot, nalaganje/napake, podrobnosti, data-task-id, dostopna imena Preglednica/Tabla, aria-label="Pregled stanj opravil", videz Folio; pri širini 390 px ni vodoravnega prelivanja strani (notranji drsnik tabele/tabla je dovoljen). | readonly preverjanje omrežnih zahtev (samo GET), pregled shrambe; obstoječi testi tests/baseline.spec.ts, tests/api.spec.ts; vizualni/prelivni pregled pri 390 px. |

Splošna pravila: C je vedno izpeljan iz URL-ja (edini vir resnice); D je prehodno stanje seje in se ob navigaciji zavrže; vsaka potrditev/sprememba URL-ja ustvari največ eno zgodovinsko stanje. Posamezni testni primeri naj pokrijejo tudi robove: prazen q, q brez zadetkov, eno opravilo, več kot deset opravil, prazen projekt, enaki naslovi, različno zaporedje iz API-ja, Unicode/ločila, ponovljeni parametri, neznani parametri.

## Izvedba in sledljivost

Implementer izpolni stolpca Datoteka in del kode ter Izid in dokaz po dejanski izvedbi; specifikacija tu ne navaja neizvedenih rezultatov kot uspešnih. Predvidene datoteke: src/navigation.ts (branje/pisanje query dela, norm, visible), src/App.tsx (kontrole, potrditev, števec, povezovanje z zgodovino), src/TaskBoard.tsx/src/components.tsx po potrebi, tests/agent/*.spec.ts (novi testi). Skupni testi ostanejo nespremenjeni.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Odprtje URL-ja uporabi C brez klika | D01 + novi testi privzetkov | (izpolni implementer) | (izpolni implementer) |
| R02 | Normalizacija in podniz po 4 poljih | testi fraz/diakritike/ločil | (izpolni implementer) | (izpolni implementer) |
| R03 | IN q+status; stabilen order | testi statusov in asc/desc | (izpolni implementer) | (izpolni implementer) |
| R04 | Neveljavno → privzetek; prva ponovitev; brez prepisa URL-ja | test neznanih/ponovljenih parametrov | (izpolni implementer) | (izpolni implementer) |
| R05 | Osnutek ločen; eno zgodovinsko stanje | D02 + štetje vnosov | (izpolni implementer) | (izpolni implementer) |
| R06 | Serijalizacija URL-ja; idempotentna potrditev | preverjanje URL-ja | (izpolni implementer) | (izpolni implementer) |
| R07 | Nazaj/Naprej/reload obnovijo C in D | D03 + navigacijski testi | (izpolni implementer) | (izpolni implementer) |
| R08 | Preklop pogleda ohrani C; D se zavrže | test preklopa z osnutkom | (izpolni implementer) | (izpolni implementer) |
| R09 | Podrobnosti ohranijo C/view; pravi ID | testi odpiranja/zapiranja in enakih naslovov | (izpolni implementer) | (izpolni implementer) |
| R10 | Drug projekt: privzetek ali parametri | testi navigacije med projekti | (izpolni implementer) | (izpolni implementer) |
| R11 | Ponastavi + Ni zadetkov. + števec | D04 + test števca | (izpolni implementer) | (izpolni implementer) |
| R12 | Brez zapisov in trajne shrambe; regresije | readonly + baseline/api testi + 390 px | (izpolni implementer) | (izpolni implementer) |

## Dogovor o vmesniku in omejitve izvedbe

Kontrole in dostopna imena (točno):

- input type=search z oznako Iskanje v povezavi (getByRole searchbox); vrednost = osnutek q.
- select z oznako Stanje v povezavi (getByRole combobox): all/todo/in_progress/done; vrednost = osnutek status.
- select z oznako Vrstni red v povezavi (getByRole combobox): original/title-asc/title-desc; vrednost = osnutek order.
- gumba z dostopnima imenoma Uporabi pogled in Ponastavi pogled (gumba tipa button, ne submit).
- števec: role=status, aria-label="Rezultati povezave", besedilo točno Prikazano: N od M. (pika na koncu). Števec se posodobi ob vsakem prikazu rezultatov.
- Primer URL-ja: #/projects/web?view=board&q=Pregled&status=todo&order=title-desc. Vrstni red samih parametrov ni predpisan.

Ohranjene prilagoditve (ne spreminjati):

- data-task-id na vrsticah tabele in karticah table; dostopna imena obstojecih pogledov in stolpcev (Preglednica, Tabla, Opravila, Stanje, Odgovorna oseba, Rok); aria-label="Pregled stanj opravil" na povzetku stanj.
- Nova dejanja ob opravilu morajo biti zunaj njegove povezave (brez gnezdenih interaktivnih elementov v a).
- Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno.
- Besedilo, ki ni izrecno določeno, in razporeditev novih kontrol nista predpisana; videz Folio iz docs/dizajn.md se ohrani.

Viri podatkov in meje:

- Aplikacija bere samo /api/ (GET); testnih kontrol /__test/ UI ne uporablja, ne uvaža in ne bere.
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu in se ne shranjuje v localStorage/sessionStorage; novih zapisovalnih API-jev ni.
- Podatki testov so lahko poljubni: 0/1/več kot 10 opravil, enkratni ID-ji, enaki naslovi, različno zaporedje, veljavni datumi, Unicode in ločila; projekta sta lahko prazna; vsako opravilo pripada svojemu projektu.


## Odprta vprašanja in omejitve

- Predpostavka: ko ima projekt M=0 opravil, se ohrani obstoječe stanje (V tem projektu še ni opravil); Ni zadetkov. velja za N=0 ob M>0.
- Predpostavka: vrednosti status/order so dobesedne (case-sensitive); npr. DONE je neveljavna in pomeni privzetek.
- Predpostavka: nepotrjen osnutek se zavrže ob vsaki spremembi URL-ja, vključno z odpiranjem/zapiranjem podrobnosti in preklopom pogleda.
- Predpostavka: stanje je lokalno trenutnemu projektu; ob prehodu na drug projekt se ne prenaša.
- Neopredeljeno v navodilih in prepuščeno izvedbi: točna postavitev novih kontrol in besedilo, ki ni izrecno določeno.
- V tej vlogi niso izvedeni nobeni testi ali zagoni aplikacije; to opravi implementer in rezultate vpiše zgoraj.

