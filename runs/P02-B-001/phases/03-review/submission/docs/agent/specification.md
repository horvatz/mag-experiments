# P02 – specifikacija množične spremembe stanja

Različica 1, pripravljena za predajo. Avtor specifikacije je pregledal kodo in navodila; aplikacija in testi v tej vlogi niso bili zagnani. Zgodovina: [specification-history.md](specification-history.md).

## Problem in kontekst

Folio trenutno bere projekte, preglednico, tablo in podrobnosti opravil. Uporabnik mora izbrati opravila trenutnega projekta in jim spremeniti samo stanje. Vsak ID se shrani posebej; delni uspeh ostane shranjen, ponovitev zajame samo neuspešne. Ohranijo se slovenska poimenovanja, bralne funkcije in potrjeni videz iz `docs/dizajn.md`. Izvirne zahteve `task/instructions.md` ostajajo obvezne tudi ob morebitni vrzeli v tej specifikaciji.

## Vhodi, dejanja in izidi

`shared/types.ts` določa `Task = { id, projectId, title, description, status, assignee, dueDate }` in `TaskUpdate = { title, status }`. Dovoljena stanja so Pripravljeno (`todo`), V delu (`in_progress`) in Končano (`done`). Vsi drugi podatki so nespremenljivi. `src/api.ts:updateTask(id, values)` že pošlje `PATCH /api/tasks/:id`, kodira ID in vrne celotno opravilo ali zavrne obljubo z razlogom napake. Naslov vzame iz prebranega opravila brez sprememb. Branje uporablja `/api/projects`, `/api/projects/:id/tasks` in `/api/tasks/:id`.

Kontrole in dostopnost so del pogodbe:

- Vsak HTML `input type="checkbox"` ima ime `Izberi opravilo <id>`; skupni ima ime `Izberi vsa opravila` in dejansko lastnost `indeterminate` pri delnem izboru.
- Element `aria-label="Število izbranih opravil"` vsebuje `Izbrano: N`. HTML `select` z oznako `Novo stanje` ima začetno vrednost `""` in tri zgornje možnosti.
- Gumbi: `Uporabi za izbrana`, `Ponovi neuspele`, `Počisti izbor`. Ponovitev je brez neuspehov skrita ali onemogočena.
- Med obdelavo je viden `role="status"` z imenom `Potek množične spremembe`; po vseh odgovorih `role="status"` z imenom `Rezultat množične spremembe` in točnim besedilom `Uspešno: X. Neuspešno: Y.`. Povzetek je med pošiljanjem lahko skrit.
- Vsak neuspešni ID ima svoje sporočilo `role="alert"` z ID-jem, naslovom in razumljivim razlogom. Enaka naslova se razlikujeta po ID-ju.
- Ostanejo `data-task-id` na vrsticah/karticah, poimenovani stolpci table in `aria-label="Pregled stanj opravil"`. Nove kontrole sledijo obstoječim slogom, vidnemu fokusu in postavitvi Folio. Na ozkem zaslonu stran nima vodoravnega preliva; notranje drsenje preglednice/table je dovoljeno.

## Zahteve in pravila

Simboli: `P` je množica ID-jev trenutnega projekta, `I ⊆ P` trenutni izbor, `τ` cilj ali prazna vrednost. Operacija začne s posnetkom `O = I`, nespremenljivim ciljem `t = τ` in podatki `B` pred operacijo. `C` je množica do zdaj uspešnih ID-jev te operacije, `F` množica neuspešnih po zadnjem končanem poskusu, `busy` pomeni, da poskus še teče. Ena operacija vključuje prvo potrditev in vse njene ponovitve.

1. **Začetek in zahteve:** običajna potrditev je dovoljena natanko, ko `¬busy ∧ F = ∅ ∧ I ≠ ∅ ∧ τ ≠ ""`. Nova operacija ponastavi stare števce. Množica poskusa je prvič `A = O`, ob ponovitvi `A = F_prej`. Za vsak `i ∈ A` nastane natanko ena zahteva s telesom `{ title: B[i].title, status: t }`; za `i ∉ A` nobena. Tudi `B[i].status = t` zahteva zapis. Vrstni red in sočasnost nista predpisana.
2. **Posamezen odgovor:** uspeh za `i` takoj doda `i` v `C` in potrjeno stanje v bralne prikaze, brez čakanja na preostale odgovore. Zavrnitev ne spremeni opravila in ne prekine obdelave drugih ID-jev. Ni optimistične spremembe stanja, povratnih zapisov ali skupinske razveljavitve.
3. **Zaključek poskusa:** `C ∩ F = ∅` in `C ∪ F = O`; povzetek je `(X, Y) = (|C|, |F|)`. Če `F ≠ ∅`, je `I = F`, `τ = t`; če `F = ∅`, sta `I = ∅`, `τ = ""`, napake izginejo, ponavljanje ni na voljo, uspešni povzetek ostane prikazan. Množica `C` prepreči dvojno štetje med ponovitvami.
4. **Nespremenljivost:** za vsak trenutek po obdelanih odgovorih velja `D[i] = B[i]` za `i ∉ C`, za `i ∈ C` pa `D[i] = { ...B[i], status: t }`. `D` označuje potrjene podatke vseh projektov; vsota stanj in vsi prikazi izhajajo iz teh podatkov. Pravilo velja tudi po osvežitvi, brez sočasnih zunanjih sprememb.
5. **Zaklep:** pri `busy` so posamezni in skupni izbor, cilj, potrditev, ponovitev in čiščenje onemogočeni. Vstop v obdelavo mora takoj preprečiti ponoven zagon tudi pri hitrem kliku ali Enter. Pri `¬busy ∧ F ≠ ∅` so izbori, cilj in običajna potrditev zaklenjeni; dovoljena sta ponovitev in čiščenje.
6. **Čiščenje in navigacija:** čiščenje zunaj shranjevanja zavrže `I`, `τ`, `O`, `C`, `F`, napake in povzetek, brez PATCH ali razveljavitve podatkov. Menjava projekta in osvežitev začneta enako prazno. Preklop Preglednica/Tabla ohrani stanje operacije.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | V obeh pogledih je izbor po ID, sprva prazen; klik polja ne odpre podrobnosti. | E01: dva enaka naslova, neodvisni polji in brez odprtega dialoga. |
| R02 | Število je `|I|`; skupno polje je označeno pri `P ≠ ∅ ∧ I = P`, vmesno pri `0 < |I| < |P|`. Klik izbere vse, če še niso vsi izbrani, sicer izprazni izbor. Pri `P = ∅` je neoznačeno in onemogočeno. | E01: nič, del, vse, čiščenje s skupnim poljem in prazen projekt v obeh pogledih. |
| R03 | Pogled ohrani izbor, cilj, povzetek in napake; projekt ter osvežitev jih odstranita, shranjene podatke ohranita. | E02: preklopi pred potrditvijo, po delnem in popolnem uspehu. |
| R04 | Začetni cilj je prazen; le tri dovoljena stanja. Brez izbora ali cilja je potrditev onemogočena. Spreminjanje izbora/cilja ne zapisuje in ne spreminja bralnih podatkov. | D01 + E01/E03: prazne kombinacije, vsak cilj, štetje PATCH in primerjava podatkov. |
| R05 | Zajeti ID-ji in cilj sledijo pravilu 1, vključno z že doseženim ciljem in točnim naslovom. | D02 + E03: primerjava vseh ID-jev, teles in števila zahtev; brez zahtev za neizbrane. |
| R06 | Vsak uspeh se pokaže takoj, tudi ko drugi čakajo ali odpovejo; tabela, tabla, števci in pozneje odprte podrobnosti kažejo shranjeno stanje. | E04 + E02: uspeh pred zakasnjenim odgovorom; poznejša zavrnitev, oba pogleda, podrobnosti in osvežitev. |
| R07 | Vsak ID se obravnava kljub zavrnitvam. Zavrnjeni ostanejo nespremenjeni; po vseh odgovorih sta pravilen povzetek in napaka za vsak neuspešni ID. | D03 + E04: mešani izidi in popoln neuspeh, pregled vseh opozoril in podatkov. |
| R08 | Po neuspehu ostanejo izbrani natanko `F`, cilj ostane `t`. Vsaka ponovitev pošlje po en PATCH samo za `F_prej`. | D03 + E05: več neuspehov in več zaporednih ponovitev, primerjava dnevnika zahtev. |
| R09 | Kumulativni uspehi in trenutni neuspehi sledijo pravilu 3. Popolni uspeh izprazni izbor/cilj/napake in odstrani možnost ponovitve. | E05: povzetki skozi tri poskuse, tudi če uspešen ID že ima ciljno stanje. |
| R10 | Zaklep po pravilu 5, viden napredek in brez podvajanja zahtev; po napaki ostaneta na voljo samo ponavljanje ali čiščenje operacije. | D04 + E06: zadržan odgovor, vsa polja/gumbi v obeh pogledih, hitri kliki in Enter. |
| R11 | Čiščenje sledi pravilu 6 in omogoči neodvisno novo operacijo s svežimi števci. | D01 + E06: čiščenje po delnem uspehu, brez dodatnih PATCH, nato druga operacija. |
| R12 | Predikat 4 velja za vsa polja vseh projektov; obstoječa navigacija, oba pogleda in bralne podrobnosti delujejo. | E03–E07 + testi izhodišča: celoten podatkovni posnetek in regresija na namizju/telefonu. |

## Izvedba in sledljivost

Pregled kode: `ProjectView` v `src/App.tsx` že združuje seznam in števce ter je vezan na `key={project.id}`. Zato je naravno mesto za stanje operacije nad obema pogledoma: menjava pogleda ga ne odmontira, menjava projekta ga. `useResource` trenutno vrne samo `data/error/loading/retry`; implementer mora omogočiti sprotno posodobitev potrjenih podatkov (v tem hooku ali lastnem stanju), brez čakanja na celotni paket. `TaskBoard` zdaj ovije vsebino kartice s povezavo; potrditveno polje potrebuje neodvisno interakcijo. `TaskDetails` ob odprtju bere posamezni ID iz API-ja. To so predlagana mesta sprememb, ne že izvedena implementacija.

`D01–D04` so obstoječi testi v `tests/development/P02.spec.ts`; `tests/development/helpers.ts` ponuja `transport.plan`, zadržanje odgovorov, dnevnik `calls`, celotni `snapshot`, `onlyStatuses` in `presentation`. Njihova pokritost je delna. `E01–E07` so načrtovani dodatni scenariji iz zgornje tabele za lastne teste v `tests/agent/` oziroma dokumentiran pregled; niso obstoječa imena testov. Za E05 je konkreten primer `O={a,b,c}`: prvič uspe a, drugič b, tretjič c; povzetki `(1,2) → (2,1) → (3,0)`, števila zahtev `a:1, b:2, c:3`. Splošna pravila niso vezana na te ID-je ali podatke iz fixture.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neodvisen izbor po ID | E01 | `src/App.tsx`: vrstice; `src/TaskBoard.tsx`: kartice | Ni izvedeno; pregledana izhodiščna koda. |
| R02 | Skupni izbor in število | E01 | `src/App.tsx`: ProjectView/skupne kontrole | Ni izvedeno; predlagano mesto. |
| R03 | Življenjska doba operacije | E02 | `src/App.tsx`: ProjectView in ključ projekta; `src/navigation.ts` | Ni izvedeno; pregledana navigacija. |
| R04 | Cilj in pogoji potrditve | D01, E01, E03 | `src/App.tsx`: skupne kontrole | Ni izvedeno. |
| R05 | Natanko en PATCH na ID poskusa | D02, E03 | `src/api.ts`: updateTask; upravljanje operacije v `src/App.tsx` ali novem modulu `src/` | Ni izvedeno; pregledan API. |
| R06 | Sprotno potrjeno stanje | E02, E04 | `src/App.tsx`, `src/useResource.ts`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx` | Ni izvedeno; pregledani bralni prikazi. |
| R07 | Neodvisni izidi in napake | D03, E04 | Upravljanje operacije in sporočila v `src/` | Ni izvedeno. |
| R08 | Ponovitev samo neuspešnih | D03, E05 | Upravljanje operacije v `src/`; `src/api.ts` | Ni izvedeno. |
| R09 | Kumulativni rezultat in reset | E05 | Upravljanje operacije in povzetek v `src/` | Ni izvedeno. |
| R10 | Zaklep in zaščita zagona | D04, E06 | Skupne kontrole, vrstična/kartična polja in izvajanje operacije v `src/` | Ni izvedeno. |
| R11 | Čiščenje brez zapisov | D01, E06 | Upravljanje operacije v `src/` | Ni izvedeno. |
| R12 | Nespremenljivost in regresija | E03–E07; `tests/baseline.spec.ts`, `tests/api.spec.ts` | Vsi bralni prikazi; `src/styles.css` | Ni izvedeno; pravila videza in izhodiščni testi prebrani. |

E07 pomeni pregled Folio pri namizni in ozki širini: prelom novih kontrol in opozoril, brez razširitve strani, notranje drsenje, vidni fokus, dostopne oznake ter ohranjeni projekti/pogledi/podrobnosti. Implementer izvede `npm run check` (lint, typecheck/build in vsi konfigurirani testi), smiselne dodatne scenarije ter zapiše dejanske ukaze, rezultate in dokazne datoteke v svoj dokument v `docs/agent/`. Morebitno preskočeno preverjanje jasno označi. Spremenjenih datotek in izidov ne vpisuje v avtorjevo specifikacijo; svoj dokument poveže z R01–R12 in dejanskimi deli kode.

## Odprta vprašanja in omejitve

Ni blokirajočih odprtih vprašanj. Razumljeno je, da HTTP zavrnitev ne zapiše podatkov, vsak odgovor se dokončno konča, naslovi so že veljavni in normalizirani. Navigacija/osvežitev med shranjevanjem, sočasne spremembe drugih uporabnikov, negotov izid izgubljene povezave in urejanje po P01 so zunaj ocenjevanja. Izbor in stanje operacije sta samo v pomnilniku; shranjeni podatki ostanejo na strežniku.

Implementer sme spreminjati `src/`, lastne teste `tests/agent/` in lastne izvedbene zapise `docs/agent/`. Strežnik, začetni podatki, skupni tipi, odvisnosti, infrastruktura, navodila, skupni in razvojni testi ostanejo nespremenjeni. UI uporablja samo javni `/api/`, brez testnih kontrol `/__test/`, lokalne nadomestne baze ali `localStorage`. Testne kontrole uporablja samo testni program. Dovoljeni so le izvoženo gradivo in lokalne storitve naloge. Avtor specifikacije piše samo ta dokument in zgodovino; implementacija, zagon aplikacije, testi in pregled videza so predani naslednji vlogi.
